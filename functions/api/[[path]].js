/**
 * 得欧科技求职服务网站 — Cloudflare Pages Functions
 *
 * 单入口 /api/[[path]].js，替代原妙搭 NestJS 服务端：
 *   GET  /api/interview-questions        面试题库列表（?refresh=true 强制刷新缓存）
 *   POST /api/interview-questions/sync   管理员：强制从 Base 重新拉取
 *   GET  /api/recruitments               校招投递列表（keyword/function/city/targetGrade/sort）
 *   GET  /api/recruitments/filters       职能筛选选项
 *   POST /api/auth/login                 登录（Base 用户表校验）
 *   GET  /api/app-users                  账号列表
 *   POST /api/app-users/sync             管理员：从 Base 同步账号
 *   POST /api/app-users                  管理员：新增账号（写入 Base）
 *   PATCH /api/app-users/:id             管理员：修改账号（更新 Base 记录）
 *   DELETE /api/app-users/:id            管理员：删除账号（删 Base 记录）
 *
 * 数据全部存飞书多维表格；FEISHU_APP_ID / FEISHU_APP_SECRET 为 Pages 环境变量。
 * 管理员写操作通过 X-Admin-User 请求头校验（前端登录后带上用户名，服务端回 Base 确认角色）。
 */

// ===== 配置 =====
const FEISHU_HOST = 'https://open.feishu.cn';
const CACHE_TTL_MS = 5 * 60 * 1000; // 与原服务端一致：5 分钟缓存
const PAGE_SIZE = 200;

const TABLES = {
  interview: {
    // 面试题库
    appToken: 'CJN2brwZUal7tms1YuPccsyCnlb',
    tableId: 'tbl8iejTEfvY7qtq',
  },
  recruitment: {
    // 校招投递表
    appToken: 'MxiUbvpdWanX47s4DGGcFwpVn7e',
    tableId: 'tbl2dg0zSnCQjJC0',
  },
  appUsers: {
    // 用户列表
    appToken: 'XAcIb3h7iasOolsPD3BcIwi6n1f',
    tableId: 'tblsllnsAWWvGCsu',
  },
};

const BASE_URLS = {
  interview: 'https://my.feishu.cn/base/CJN2brwZUal7tms1YuPccsyCnlb',
  recruitment: 'https://my.feishu.cn/base/MxiUbvpdWanX47s4DGGcFwpVn7e',
  appUsers: 'https://my.feishu.cn/base/XAcIb3h7iasOolsPD3BcIwi6n1f',
};

const APP_USER_ROLES = ['管理员', '学生'];
const APP_USER_STATUSES = ['启用', '禁用'];
const APP_USER_PASSWORD_MAX_LENGTH = 50;
const MAX_NAME_LENGTH = 50;

// ===== 错误响应契约（与原 NestJS exception filter 一致：{error:{code,message,timestamp}}）=====
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const jsonError = (status, code, message) =>
  new Response(
    JSON.stringify({
      error: { code, message, timestamp: new Date().toISOString() },
    }),
    {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    },
  );

const badRequest = (message) => new ApiError(400, 'BAD_REQUEST', message);
const unauthorized = (message = '未授权') =>
  new ApiError(401, 'UNAUTHORIZED', message);
const notFound = (message = '资源不存在') =>
  new ApiError(404, 'NOT_FOUND', message);
const badGateway = (message) => new ApiError(502, 'BAD_GATEWAY', message);

// ===== 飞书 OpenAPI =====
async function getTenantAccessToken(env) {
  if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET) {
    throw badGateway(
      '服务端未配置 FEISHU_APP_ID / FEISHU_APP_SECRET 环境变量',
    );
  }
  const resp = await fetch(`${FEISHU_HOST}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      app_id: env.FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET,
    }),
  });
  const data = await resp.json();
  if (data.code !== 0) {
    throw badGateway(`获取飞书访问凭证失败：${data.msg || '未知错误'}`);
  }
  return data.tenant_access_token;
}

async function feishuRequest(env, method, path, body) {
  const token = await getTenantAccessToken(env);
  const resp = await fetch(`${FEISHU_HOST}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (data.code !== 0) {
    throw badGateway(`飞书多维表格接口错误(${data.code})：${data.msg || '未知错误'}`);
  }
  return data.data;
}

// ===== 分页拉取（对应原 BitableService.fetchAll*Records，pageSize=200 循环 pageToken）=====
async function fetchAllRecords(env, tableKey) {
  const table = TABLES[tableKey];
  const allRecords = [];
  let pageToken;
  let hasMore = true;
  while (hasMore) {
    const body = { page_size: PAGE_SIZE };
    if (pageToken) body.page_token = pageToken;
    const data = await feishuRequest(
      env,
      'POST',
      `/open-apis/bitable/v1/apps/${table.appToken}/tables/${table.tableId}/records/search`,
      body,
    );
    allRecords.push(
      ...(data.items || []).map((item) => ({ id: item.record_id, record: item.fields })),
    );
    if (!data.has_more) {
      hasMore = false;
    } else {
      pageToken = data.page_token;
    }
  }
  return allRecords;
}

// ===== 字段提取（与原 BitableService 完全一致）=====
function extractText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text;
  }
  if (Array.isArray(value)) {
    // 多行文本可能以 [{type:'text', text:'...'}] 形式返回
    return value
      .map((seg) => (seg && typeof seg === 'object' && 'text' in seg ? seg.text : ''))
      .join('');
  }
  return String(value);
}

function extractTags(value) {
  const text = extractText(value);
  if (!text) return [];
  return text
    .split(/[,，、;；]/u)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function extractDateTime(value) {
  if (value == null) return '';
  if (typeof value === 'number') return new Date(value).toISOString();
  if (typeof value === 'string') {
    const num = Number(value);
    if (!Number.isNaN(num) && value.trim() !== '') return new Date(num).toISOString();
    return value;
  }
  return '';
}

function extractUrl(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'link' in value && typeof value.link === 'string') {
    return value.link;
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text;
  }
  return '';
}

// ===== 记录映射（与原 BitableService.map* 完全一致）=====
function mapInterviewQuestion(raw) {
  const { id, record } = raw;
  return {
    id,
    function: extractText(record['职能']).trim(),
    category: extractText(record['分类']).trim(),
    difficulty: extractText(record['难度']).trim(),
    question: extractText(record['题目']).trim(),
    answer: extractText(record['参考答案']).trim(),
    tags: extractTags(record['特征标签']),
  };
}

function mapRecruitment(raw) {
  const { id, record } = raw;
  return {
    id,
    company: extractText(record['公司']),
    position: extractText(record['岗位']),
    function: extractText(record['职能']).trim(),
    city: extractText(record['工作城市']).trim(),
    targetGrade: extractText(record['招聘对象']).trim(),
    startDate: extractDateTime(record['投递开始日期']),
    endDate: extractDateTime(record['投递截止日期']),
    applyUrl: extractUrl(record['投递链接']),
    referralCode: extractText(record['内推人/内推码']),
    remark: extractText(record['备注']),
    createdAt: extractDateTime(record['创建时间']),
    updatedAt: extractDateTime(record['更新时间']),
  };
}

function toRole(value) {
  return APP_USER_ROLES.includes(value) ? value : '学生';
}

function toStatus(value) {
  return APP_USER_STATUSES.includes(value) ? value : '禁用';
}

function mapAppUser(raw) {
  const { id, record } = raw;
  const name = extractText(record['用户名']).trim();
  if (!name) return null;
  return {
    id,
    name,
    role: toRole(extractText(record['角色']).trim()),
    status: toStatus(extractText(record['状态']).trim()),
    createdAt: extractDateTime(record['创建时间']),
    baseRecordId: id,
    hasPassword: extractText(record['密码']).trim().length > 0,
  };
}

// 带密码的凭证（仅登录/鉴权用，不外发）
function mapAppUserCredential(raw) {
  const { id, record } = raw;
  const name = extractText(record['用户名']).trim();
  if (!name) return null;
  return {
    recordId: id,
    name,
    password: extractText(record['密码']).trim(),
    role: toRole(extractText(record['角色']).trim()),
    status: toStatus(extractText(record['状态']).trim()),
    createdAt: extractDateTime(record['创建时间']),
  };
}

// ===== 缓存（与原服务端一致：表级 5 分钟；CF Pages 每实例隔离，语义等价于进程内 Map）=====
const cache = new Map();

async function listInterviewQuestions(env, { refresh = false } = {}) {
  const cacheKey = 'interview-questions';
  if (refresh) cache.delete(cacheKey);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { items: cached.data, fromCache: true };
  }
  const records = await fetchAllRecords(env, 'interview');
  const items = records.map(mapInterviewQuestion);
  cache.set(cacheKey, { data: items, expiresAt: Date.now() + CACHE_TTL_MS });
  return { items, fromCache: false };
}

async function listRecruitments(env) {
  const cacheKey = 'recruitments';
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const records = await fetchAllRecords(env, 'recruitment');
  const items = records.map(mapRecruitment);
  cache.set(cacheKey, { data: items, expiresAt: Date.now() + CACHE_TTL_MS });
  return items;
}

async function listAppUsers(env, { refresh = false } = {}) {
  const cacheKey = 'app-users';
  if (refresh) cache.delete(cacheKey);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  const records = await fetchAllRecords(env, 'appUsers');
  const items = records
    .map(mapAppUser)
    .filter((item) => item !== null);
  cache.set(cacheKey, { data: items, expiresAt: Date.now() + CACHE_TTL_MS });
  return items;
}

async function listAppUserCredentials(env) {
  const records = await fetchAllRecords(env, 'appUsers');
  return records
    .map(mapAppUserCredential)
    .filter((item) => item !== null);
}

// ===== 业务接口 =====
async function handleInterviewList(env, url) {
  const refresh = url.searchParams.get('refresh') === 'true';
  const { items } = await listInterviewQuestions(env, { refresh });
  return {
    items,
    total: items.length,
    syncedAt: new Date().toISOString(),
    baseUrl: BASE_URLS.interview,
  };
}

// 与原 RecruitmentService.list 完全一致的过滤 + 排序
async function handleRecruitmentList(env, url) {
  const items = await listRecruitments(env);
  const keyword = url.searchParams.get('keyword');
  const func = url.searchParams.get('function');
  const city = url.searchParams.get('city');
  const targetGrade = url.searchParams.get('targetGrade');
  const sort = url.searchParams.get('sort');

  let result = items;
  if (keyword) {
    const kw = keyword.trim().toLowerCase();
    result = result.filter((item) => item.company.toLowerCase().includes(kw));
  }
  if (func) result = result.filter((item) => item.function === func);
  if (city) result = result.filter((item) => item.city === city);
  if (targetGrade) result = result.filter((item) => item.targetGrade === targetGrade);

  const isOldest = sort === 'oldest';
  result = [...result].sort((a, b) => {
    const left = a.startDate || '';
    const right = b.startDate || '';
    if (!left && !right) return 0;
    if (!left) return 1;
    if (!right) return -1;
    return isOldest ? left.localeCompare(right) : right.localeCompare(left);
  });

  return { items: result };
}

async function handleRecruitmentFilters(env) {
  const all = await listRecruitments(env);
  const functionSet = new Set();
  for (const item of all) {
    if (item.function) functionSet.add(item.function);
  }
  return { functions: Array.from(functionSet).sort() };
}

// 与原 AuthService.login 一致：Base 匹配 用户名+密码+状态=启用
async function handleLogin(env, body) {
  const name = (body?.name ?? '').trim();
  const password = body?.password ?? '';
  if (!name || !password.trim()) {
    throw badRequest('请输入用户名和密码');
  }

  let credentials;
  try {
    credentials = await listAppUserCredentials(env);
  } catch (error) {
    throw badGateway(`登录服务暂时不可用：${error.message}`);
  }

  const matched = credentials.find(
    (user) =>
      user.name === name &&
      user.status === '启用' &&
      user.password.length > 0 &&
      user.password === password,
  );
  if (!matched) {
    throw unauthorized('用户名或密码错误');
  }
  const { password: _pw, recordId, ...safeUser } = matched;
  return { user: { ...safeUser, id: recordId, baseRecordId: recordId, hasPassword: true } };
}

// ===== app-users 管理员鉴权（替代原 @NeedLogin：回 Base 校验管理员身份）=====
async function requireAdmin(env, request) {
  const adminName = (request.headers.get('x-admin-user') ?? '').trim();
  if (!adminName) {
    throw unauthorized('请先以管理员身份登录');
  }
  const credentials = await listAppUserCredentials(env);
  const admin = credentials.find(
    (user) => user.name === adminName && user.status === '启用',
  );
  if (!admin || admin.role !== '管理员') {
    throw unauthorized('该操作需要管理员权限');
  }
  return admin;
}

async function handleAppUserList(env, url) {
  const refresh = url.searchParams.get('refresh') === 'true';
  let syncError = null;
  if (refresh) {
    try {
      await listAppUsers(env, { refresh: true });
    } catch (error) {
      // 与原逻辑一致：refresh 失败静默降级返回缓存
      syncError = error.message;
    }
  }
  const items = await listAppUsers(env);
  return {
    items,
    total: items.length,
    syncedAt: new Date().toISOString(),
    baseUrl: BASE_URLS.appUsers,
    ...(syncError ? { syncError } : {}),
  };
}

async function handleAppUserSync(env) {
  const items = await listAppUsers(env, { refresh: true });
  return {
    items,
    total: items.length,
    syncedAt: new Date().toISOString(),
    baseUrl: BASE_URLS.appUsers,
  };
}

function normalizeName(raw) {
  const name = (raw ?? '').trim();
  if (!name) throw badRequest('账号名不能为空');
  if (name.length > MAX_NAME_LENGTH) {
    throw badRequest(`账号名不能超过 ${MAX_NAME_LENGTH} 个字符`);
  }
  return name;
}

function normalizePassword(raw) {
  const password = raw ?? '';
  if (!password.trim()) throw badRequest('密码不能为空');
  if (password.length > APP_USER_PASSWORD_MAX_LENGTH) {
    throw badRequest(`密码不能超过 ${APP_USER_PASSWORD_MAX_LENGTH} 个字符`);
  }
  return password;
}

function validateRoleStatus(dto) {
  if (!APP_USER_ROLES.includes(dto.role)) throw badRequest('角色不合法');
  if (!APP_USER_STATUSES.includes(dto.status)) throw badRequest('状态不合法');
}

async function handleAppUserCreate(env, body) {
  const name = normalizeName(body?.name);
  const password = normalizePassword(body?.password);
  validateRoleStatus(body ?? {});

  // 重名校验（与原 assertNameAvailable 一致）
  const credentials = await listAppUserCredentials(env);
  if (credentials.some((user) => user.name === name)) {
    throw new ApiError(409, 'CONFLICT', `账号「${name}」已存在`);
  }

  const table = TABLES.appUsers;
  const data = await feishuRequest(
    env,
    'POST',
    `/open-apis/bitable/v1/apps/${table.appToken}/tables/${table.tableId}/records`,
    {
      fields: {
        用户名: name,
        密码: password,
        角色: body.role,
        状态: body.status,
        创建时间: Date.now(),
      },
    },
  );
  cache.delete('app-users');
  const recordId = data?.record?.record_id;
  if (!recordId) {
    throw badGateway('飞书多维表格未返回新增记录的 ID');
  }
  return {
    user: {
      id: recordId,
      name,
      role: body.role,
      status: body.status,
      createdAt: new Date().toISOString(),
      baseRecordId: recordId,
      hasPassword: true,
    },
  };
}

async function handleAppUserUpdate(env, recordId, body) {
  const patch = {};
  if (body.name !== undefined) patch.name = normalizeName(body.name);
  if (body.password !== undefined) patch.password = normalizePassword(body.password);
  if (body.role !== undefined) {
    if (!APP_USER_ROLES.includes(body.role)) throw badRequest('角色不合法');
    patch.role = body.role;
  }
  if (body.status !== undefined) {
    if (!APP_USER_STATUSES.includes(body.status)) throw badRequest('状态不合法');
    patch.status = body.status;
  }
  if (Object.keys(patch).length === 0) {
    throw badRequest('未提供可更新字段');
  }

  // 重名校验（排除自身）
  if (body.name !== undefined) {
    const credentials = await listAppUserCredentials(env);
    const conflict = credentials.find(
      (user) => user.name === body.name && user.recordId !== recordId,
    );
    if (conflict) {
      throw new ApiError(409, 'CONFLICT', `账号「${body.name}」已存在`);
    }
  }

  const table = TABLES.appUsers;
  await feishuRequest(
    env,
    'PUT',
    `/open-apis/bitable/v1/apps/${table.appToken}/tables/${table.tableId}/records/${recordId}`,
    { fields: patch.name !== undefined ? {
        用户名: patch.name,
        ...(patch.password !== undefined ? { 密码: patch.password } : {}),
        ...(patch.role !== undefined ? { 角色: patch.role } : {}),
        ...(patch.status !== undefined ? { 状态: patch.status } : {}),
      } : {
        ...(patch.password !== undefined ? { 密码: patch.password } : {}),
        ...(patch.role !== undefined ? { 角色: patch.role } : {}),
        ...(patch.status !== undefined ? { 状态: patch.status } : {}),
      } },
  );
  cache.delete('app-users');

  const users = await listAppUsers(env, { refresh: true });
  const updated = users.find((user) => user.id === recordId);
  if (!updated) throw notFound('账号不存在');
  return { user: updated };
}

async function handleAppUserDelete(env, recordId) {
  const table = TABLES.appUsers;
  await feishuRequest(
    env,
    'DELETE',
    `/open-apis/bitable/v1/apps/${table.appToken}/tables/${table.tableId}/records/${recordId}`,
  );
  cache.delete('app-users');
  return { id: recordId };
}

// ===== 路由 =====
const jsonResponse = (data) =>
  new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // /api/[[path]] 会把 /api/xxx 映射成 pathname=/api/xxx，这里取去掉 /api 前缀后的路由
  const route = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');

  try {
    // ---- 面试题库 ----
    if (route === 'interview-questions' && request.method === 'GET') {
      return jsonResponse(await handleInterviewList(env, url));
    }
    if (route === 'interview-questions/sync' && request.method === 'POST') {
      return jsonResponse(await handleInterviewList(env, new URL('/?refresh=true', url.origin)));
    }
    // ---- 校招投递 ----
    if (route === 'recruitments' && request.method === 'GET') {
      return jsonResponse(await handleRecruitmentList(env, url));
    }
    if (route === 'recruitments/filters' && request.method === 'GET') {
      return jsonResponse(await handleRecruitmentFilters(env));
    }
    // ---- 登录 ----
    if (route === 'auth/login' && request.method === 'POST') {
      return jsonResponse(await handleLogin(env, await readBody(request)));
    }
    // ---- 账号管理（管理员）----
    if (route === 'app-users' && request.method === 'GET') {
      return jsonResponse(await handleAppUserList(env, url));
    }
    if (route === 'app-users/sync' && request.method === 'POST') {
      await requireAdmin(env, request);
      return jsonResponse(await handleAppUserSync(env));
    }
    if (route === 'app-users' && request.method === 'POST') {
      await requireAdmin(env, request);
      return jsonResponse(await handleAppUserCreate(env, await readBody(request)));
    }
    const appUserMatch = route.match(/^app-users\/([^/]+)$/);
    if (appUserMatch) {
      const recordId = decodeURIComponent(appUserMatch[1]);
      if (request.method === 'PATCH') {
        await requireAdmin(env, request);
        return jsonResponse(await handleAppUserUpdate(env, recordId, await readBody(request)));
      }
      if (request.method === 'DELETE') {
        await requireAdmin(env, request);
        return jsonResponse(await handleAppUserDelete(env, recordId));
      }
    }

    return jsonError(404, 'NOT_FOUND', `接口不存在：${request.method} /api/${route}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.status, error.code, error.message);
    }
    return jsonError(500, 'INTERNAL_ERROR', error.message || '服务内部错误');
  }
}
