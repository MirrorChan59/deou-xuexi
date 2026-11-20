export interface ColumnDef {
  name: string;
  type: string;
  description: string;
}

export interface TableSchema {
  name: string;
  description: string;
  columns: ColumnDef[];
}

export const TABLE_SCHEMAS: TableSchema[] = [
  {
    name: 'users',
    description: '用户表：记录平台注册用户的基础属性',
    columns: [
      { name: 'user_id', type: 'INTEGER', description: '用户唯一标识（主键）' },
      { name: 'register_date', type: 'TEXT', description: '注册日期（YYYY-MM-DD）' },
      { name: 'city', type: 'TEXT', description: '所在城市' },
      { name: 'channel', type: 'TEXT', description: '注册渠道' },
      { name: 'gender', type: 'TEXT', description: '性别（男/女）' },
    ],
  },
  {
    name: 'orders',
    description: '订单表：记录用户的每一笔订单',
    columns: [
      { name: 'order_id', type: 'INTEGER', description: '订单唯一标识（主键）' },
      { name: 'user_id', type: 'INTEGER', description: '下单用户 ID（关联 users）' },
      { name: 'order_date', type: 'TEXT', description: '下单日期（YYYY-MM-DD）' },
      { name: 'amount', type: 'REAL', description: '订单金额（元）' },
      { name: 'status', type: 'TEXT', description: '订单状态（已完成/已取消/待支付）' },
      { name: 'product_id', type: 'INTEGER', description: '购买商品 ID（关联 products）' },
    ],
  },
  {
    name: 'products',
    description: '商品表：商品基础信息与售价',
    columns: [
      { name: 'product_id', type: 'INTEGER', description: '商品唯一标识（主键）' },
      { name: 'product_name', type: 'TEXT', description: '商品名称' },
      { name: 'category', type: 'TEXT', description: '商品类目' },
      { name: 'price', type: 'REAL', description: '商品售价（元）' },
    ],
  },
  {
    name: 'events',
    description: '行为事件表：记录用户在 App 内的埋点行为',
    columns: [
      { name: 'event_id', type: 'INTEGER', description: '事件唯一标识（主键）' },
      { name: 'user_id', type: 'INTEGER', description: '用户 ID（关联 users）' },
      { name: 'event_type', type: 'TEXT', description: '事件类型（浏览/点击/加购/下单）' },
      { name: 'event_date', type: 'TEXT', description: '事件日期（YYYY-MM-DD）' },
      { name: 'page_name', type: 'TEXT', description: '事件发生的页面' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 以下为确定性种子数据生成：固定规则，不依赖随机数，每次加载完全一致 */
/* ------------------------------------------------------------------ */

const DAY_MS = 86_400_000;

const utcDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));

const fmtDate = (start: Date, offsetDays: number): string =>
  new Date(start.getTime() + offsetDays * DAY_MS).toISOString().slice(0, 10);

const JUN_1 = utcDate(2026, 6, 1);
const JUL_1 = utcDate(2026, 7, 1);
const AUG_15 = utcDate(2026, 8, 15);

const CITIES = ['北京', '上海', '广州', '深圳', '杭州'];
const CHANNELS = ['自然流量', '广告投放', '好友推荐', '应用商店'];

interface ProductSeed {
  name: string;
  category: string;
  price: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  { name: '无线蓝牙耳机', category: '数码电子', price: 199 },
  { name: '智能手环', category: '数码电子', price: 899 },
  { name: '便携充电宝', category: '数码电子', price: 89 },
  { name: '纯棉基础T恤', category: '服饰鞋包', price: 59 },
  { name: '轻便运动跑鞋', category: '服饰鞋包', price: 329 },
  { name: '大容量双肩包', category: '服饰鞋包', price: 149 },
  { name: '保湿修护面霜', category: '美妆个护', price: 129 },
  { name: '丝绒口红礼盒', category: '美妆个护', price: 259 },
  { name: '氨基酸洗发水', category: '美妆个护', price: 79 },
  { name: '每日坚果礼盒', category: '食品饮料', price: 99 },
  { name: '精选咖啡豆', category: '食品饮料', price: 128 },
  { name: '天然乳胶瑜伽垫', category: '运动户外', price: 189 },
];

type Row = (string | number)[];

const buildUserRows = (): Row[] => {
  const rows: Row[] = [];
  for (let u = 1; u <= 40; u += 1) {
    rows.push([
      u,
      fmtDate(JUN_1, (u * 11) % 91),
      CITIES[(u - 1) % 5],
      CHANNELS[(u - 1) % 4],
      u % 2 === 1 ? '男' : '女',
    ]);
  }
  return rows;
};

const buildProductRows = (): Row[] =>
  PRODUCT_SEEDS.map((p: ProductSeed, i: number): Row => [
    i + 1,
    p.name,
    p.category,
    p.price,
  ]);

/** 按 (user_id - 1) % 8 循环决定每个用户的订单数，合计 48 笔 */
const ORDERS_PER_USER = [2, 2, 1, 0, 2, 1, 1, 3];
const SECOND_ORDER_STATUS = ['已取消', '待支付'];

const buildOrderRows = (): Row[] => {
  const rows: Row[] = [];
  let orderId = 0;
  for (let u = 1; u <= 32; u += 1) {
    const count = ORDERS_PER_USER[(u - 1) % 8];
    for (let k = 0; k < count; k += 1) {
      orderId += 1;
      const productId = ((u + k * 5) % 12) + 1;
      const price = PRODUCT_SEEDS[productId - 1].price;
      const factor = 1 + (((u * 7 + k * 13) % 9) - 4) / 10;
      const amount = Math.round(price * factor * 100) / 100;
      const status =
        k === 0
          ? '已完成'
          : k === 1
            ? SECOND_ORDER_STATUS[(u + k) % 2]
            : u % 2 === 0
              ? '已完成'
              : '待支付';
      rows.push([
        orderId,
        u,
        fmtDate(JUL_1, (u * 13 + k * 29) % 91),
        amount,
        status,
        productId,
      ]);
    }
  }
  return rows;
};

const EVENT_TYPES = ['浏览', '点击', '加购', '下单'];
const PAGES = ['首页', '搜索结果页', '商品详情页', '购物车页', '活动页', '个人中心'];

const buildEventRows = (): Row[] => {
  const rows: Row[] = [];
  for (let i = 0; i < 40; i += 1) {
    rows.push([
      i + 1,
      (i % 40) + 1,
      EVENT_TYPES[i % 4],
      fmtDate(AUG_15, (i * 3) % 45),
      PAGES[i % 6],
    ]);
  }
  return rows;
};

const quote = (v: string | number): string =>
  typeof v === 'number' ? String(v) : `'${v}'`;

const buildInsert = (table: string, rows: Row[]): string =>
  `INSERT INTO ${table} VALUES\n  ${rows
    .map((r: Row) => `(${r.map(quote).join(', ')})`)
    .join(',\n  ')};`;

export const SCHEMA_DDL: string[] = [
  `CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  register_date TEXT,
  city TEXT,
  channel TEXT,
  gender TEXT
)`,
  `CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  order_date TEXT,
  amount REAL,
  status TEXT,
  product_id INTEGER
)`,
  `CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT,
  category TEXT,
  price REAL
)`,
  `CREATE TABLE events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  event_type TEXT,
  event_date TEXT,
  page_name TEXT
)`,
  buildInsert('users', buildUserRows()),
  buildInsert('products', buildProductRows()),
  buildInsert('orders', buildOrderRows()),
  buildInsert('events', buildEventRows()),
];
