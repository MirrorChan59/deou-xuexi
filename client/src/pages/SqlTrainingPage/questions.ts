export type Difficulty = '简单' | '中等' | '困难';

export interface SqlQuestion {
  id: string;
  difficulty: Difficulty;
  title: string;
  description: string;
  tables: string[];
  hint?: string;
  answerSqls: string[];
}

export const QUESTIONS: SqlQuestion[] = [
  {
    id: 'q1',
    difficulty: '简单',
    title: '统计 2026 年 8 月注册的用户数量',
    description:
      '运营需要复盘 8 月拉新效果，请查询 2026 年 8 月注册的用户数量。register_date 为 TEXT 类型的日期（YYYY-MM-DD），可用 strftime 提取年月。',
    tables: ['users'],
    hint: "strftime('%Y-%m', register_date) 可以从日期字符串中提取 '2026-08' 这样的年月。",
    answerSqls: [
      `SELECT COUNT(*) AS 用户数
FROM users
WHERE strftime('%Y-%m', register_date) = '2026-08';`,
      `SELECT COUNT(*) AS 用户数
FROM users
WHERE register_date LIKE '2026-08%';`,
    ],
  },
  {
    id: 'q2',
    difficulty: '简单',
    title: '计算已完成订单的总金额',
    description:
      '财务同学要核对本月收入口径，请查询所有状态为「已完成」的订单总金额（GMV）。',
    tables: ['orders'],
    hint: '先 WHERE 过滤 status，再用 SUM(amount) 汇总。',
    answerSqls: [
      `SELECT SUM(amount) AS 已完成订单总金额
FROM orders
WHERE status = '已完成';`,
      `SELECT SUM(CASE WHEN status = '已完成' THEN amount END) AS 已完成订单总金额
FROM orders;`,
    ],
  },
  {
    id: 'q3',
    difficulty: '简单',
    title: '查询北京用户的注册信息并按时间倒序',
    description:
      '市场同学要回访北京的新用户，请查询城市为「北京」的用户的 user_id 和注册日期，并按注册日期从晚到早排列。',
    tables: ['users'],
    hint: 'ORDER BY register_date DESC 表示按注册日期倒序。',
    answerSqls: [
      `SELECT user_id, register_date
FROM users
WHERE city = '北京'
ORDER BY register_date DESC;`,
      `SELECT user_id, register_date
FROM users
WHERE city IN ('北京')
ORDER BY register_date DESC;`,
    ],
  },
  {
    id: 'q4',
    difficulty: '简单',
    title: '查询价格高于 100 元的商品',
    description:
      '选品同学在筛选高客单商品，请查询价格大于 100 元的商品名称和价格，按价格从高到低排列。',
    tables: ['products'],
    hint: '比较条件用 price > 100，排序用 ORDER BY price DESC。',
    answerSqls: [
      `SELECT product_name, price
FROM products
WHERE price > 100
ORDER BY price DESC;`,
      `SELECT product_name, price
FROM products
WHERE 100 < price
ORDER BY price DESC;`,
    ],
  },
  {
    id: 'q5',
    difficulty: '中等',
    title: '各城市用户的平均订单金额',
    description:
      '想了解不同城市用户的消费能力，请查询每个城市的平均订单金额（保留 2 位小数），按平均金额从高到低排列。',
    tables: ['users', 'orders'],
    hint: '需要 JOIN users 和 orders（通过 user_id 关联），再按 city 分组求 AVG。ROUND(x, 2) 可保留两位小数。',
    answerSqls: [
      `SELECT u.city AS 城市,
  ROUND(AVG(o.amount), 2) AS 平均订单金额
FROM users u
JOIN orders o ON o.user_id = u.user_id
GROUP BY u.city
ORDER BY 平均订单金额 DESC;`,
      `SELECT u.city AS 城市,
  ROUND(AVG(o.amount), 2) AS 平均订单金额
FROM orders o
INNER JOIN users u ON u.user_id = o.user_id
GROUP BY u.city
ORDER BY 平均订单金额 DESC;`,
    ],
  },
  {
    id: 'q6',
    difficulty: '中等',
    title: '各商品类目的订单数与销售总金额',
    description:
      '类目运营要看各品类表现，请统计每个商品类目的订单数量和销售总金额（只统计状态为「已完成」的订单，金额保留 2 位小数），按销售总金额降序。',
    tables: ['orders', 'products'],
    hint: '先 WHERE 过滤已完成订单，再 JOIN products 取 category，最后 GROUP BY category。',
    answerSqls: [
      `SELECT p.category AS 类目,
  COUNT(*) AS 订单数,
  ROUND(SUM(o.amount), 2) AS 销售总金额
FROM orders o
JOIN products p ON p.product_id = o.product_id
WHERE o.status = '已完成'
GROUP BY p.category
ORDER BY 销售总金额 DESC;`,
      `SELECT p.category AS 类目,
  COUNT(*) AS 订单数,
  ROUND(SUM(o.amount), 2) AS 销售总金额
FROM products p
JOIN orders o ON o.product_id = p.product_id
WHERE o.status = '已完成'
GROUP BY p.category
ORDER BY SUM(o.amount) DESC;`,
    ],
  },
  {
    id: 'q7',
    difficulty: '中等',
    title: '自然流量渠道用户的下单总额',
    description:
      '增长团队想评估「自然流量」渠道的变现质量，请查询该渠道所有用户的订单总金额（保留 2 位小数）。',
    tables: ['users', 'orders'],
    hint: '先用 users 按 channel 筛选出自然流量用户，再 JOIN orders 汇总金额。',
    answerSqls: [
      `SELECT ROUND(SUM(o.amount), 2) AS 自然流量下单总额
FROM users u
JOIN orders o ON o.user_id = u.user_id
WHERE u.channel = '自然流量';`,
      `SELECT ROUND(SUM(amount), 2) AS 自然流量下单总额
FROM orders
WHERE user_id IN (SELECT user_id FROM users WHERE channel = '自然流量');`,
    ],
  },
  {
    id: 'q8',
    difficulty: '中等',
    title: '消费总额 Top 10 用户',
    description:
      '会员运营要维护高价值用户，请查询每个用户的订单数量和消费总额（保留 2 位小数），按消费总额降序取前 10 名。',
    tables: ['orders'],
    hint: 'GROUP BY user_id 后用 SUM(amount)，最后 LIMIT 10。',
    answerSqls: [
      `SELECT user_id AS 用户ID,
  COUNT(*) AS 订单数,
  ROUND(SUM(amount), 2) AS 消费总额
FROM orders
GROUP BY user_id
ORDER BY 消费总额 DESC
LIMIT 10;`,
      `SELECT user_id AS 用户ID,
  COUNT(*) AS 订单数,
  ROUND(SUM(amount), 2) AS 消费总额
FROM orders
GROUP BY user_id
ORDER BY SUM(amount) DESC
LIMIT 10;`,
    ],
  },
  {
    id: 'q9',
    difficulty: '困难',
    title: '用户首单日期与二单间隔天数',
    description:
      '用户团队在分析复购节奏，请查询每个下单用户的首次下单日期、第二笔订单日期，以及第二笔订单距首单的间隔天数（不足一天按 0 计）。只有一笔订单的用户间隔天数可为空。',
    tables: ['orders'],
    hint: '首单用 MIN(order_date)；二单可以先求出首单日期，再用相关子查询取「大于首单日期的最早日期」。间隔天数用 julianday(二单) - julianday(首单) 再 CAST 成 INTEGER。',
    answerSqls: [
      `SELECT user_id AS 用户ID,
  MIN(order_date) AS 首次下单日期,
  MIN(CASE WHEN order_date > (
    SELECT MIN(o2.order_date) FROM orders o2
    WHERE o2.user_id = o1.user_id
  ) THEN order_date END) AS 第二笔订单日期,
  CAST(julianday(MIN(CASE WHEN order_date > (
    SELECT MIN(o3.order_date) FROM orders o3
    WHERE o3.user_id = o1.user_id
  ) THEN order_date END)) - julianday(MIN(order_date)) AS INTEGER) AS 二单距首单天数
FROM orders o1
GROUP BY user_id
ORDER BY 二单距首单天数 DESC;`,
      `WITH first_order AS (
  SELECT user_id, MIN(order_date) AS fd FROM orders GROUP BY user_id
),
second_order AS (
  SELECT o.user_id, MIN(o.order_date) AS sd
  FROM orders o
  JOIN first_order f ON f.user_id = o.user_id AND o.order_date > f.fd
  GROUP BY o.user_id
)
SELECT f.user_id AS 用户ID,
  f.fd AS 首次下单日期,
  s.sd AS 第二笔订单日期,
  CAST(julianday(s.sd) - julianday(f.fd) AS INTEGER) AS 二单距首单天数
FROM first_order f
LEFT JOIN second_order s ON s.user_id = f.user_id
ORDER BY 二单距首单天数 DESC;`,
    ],
  },
  {
    id: 'q10',
    difficulty: '困难',
    title: '找出高于全站平均金额的订单',
    description:
      '客服团队要重点跟进大额订单，请查询订单金额高于全站平均订单金额的订单，返回订单号、用户 ID 和订单金额，按金额从高到低排列。',
    tables: ['orders'],
    hint: '全站平均金额是一个子查询：WHERE amount > (SELECT AVG(amount) FROM orders)。',
    answerSqls: [
      `SELECT order_id AS 订单号,
  user_id AS 用户ID,
  amount AS 订单金额
FROM orders
WHERE amount > (SELECT AVG(amount) FROM orders)
ORDER BY 订单金额 DESC;`,
      `WITH avg_amount AS (SELECT AVG(amount) AS a FROM orders)
SELECT o.order_id AS 订单号,
  o.user_id AS 用户ID,
  o.amount AS 订单金额
FROM orders o, avg_amount
WHERE o.amount > avg_amount.a
ORDER BY 订单金额 DESC;`,
    ],
  },
  {
    id: 'q11',
    difficulty: '困难',
    title: '已完成订单月度金额与环比增长率',
    description:
      '管理层要看月度收入趋势，请按月统计已完成订单的总金额（保留 2 位小数），并用 LAG 窗口函数计算相比上月的增长率（百分比，保留 2 位小数，最早一月可为空）。',
    tables: ['orders'],
    hint: "先按 strftime('%Y-%m', order_date) 分组过滤已完成订单求和，再用 LAG(SUM(amount)) OVER (ORDER BY 月份) 取上月值，环比 = (本月-上月)/上月*100。",
    answerSqls: [
      `SELECT strftime('%Y-%m', order_date) AS 月份,
  ROUND(SUM(amount), 2) AS 完成订单总金额,
  ROUND(
    (SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY strftime('%Y-%m', order_date)))
    / LAG(SUM(amount)) OVER (ORDER BY strftime('%Y-%m', order_date)) * 100,
    2
  ) AS 环比增长率
FROM orders
WHERE status = '已完成'
GROUP BY strftime('%Y-%m', order_date)
ORDER BY 月份;`,
      `WITH monthly AS (
  SELECT strftime('%Y-%m', order_date) AS 月份, SUM(amount) AS total
  FROM orders
  WHERE status = '已完成'
  GROUP BY strftime('%Y-%m', order_date)
)
SELECT 月份,
  ROUND(total, 2) AS 完成订单总金额,
  ROUND(
    (total - LAG(total) OVER (ORDER BY 月份)) / LAG(total) OVER (ORDER BY 月份) * 100,
    2
  ) AS 环比增长率
FROM monthly
ORDER BY 月份;`,
    ],
  },
  {
    id: 'q12',
    difficulty: '困难',
    title: '加购次数最多的 Top 3 页面',
    description:
      '产品同学想了解哪些页面最能激发加购意愿，请统计「加购」事件次数最多的前 3 个页面及其加购次数，按次数从高到低排列。',
    tables: ['events'],
    hint: "WHERE event_type = '加购' 过滤后，按 page_name 分组计数，ORDER BY 计数 DESC LIMIT 3。",
    answerSqls: [
      `SELECT page_name AS 页面名称,
  COUNT(*) AS 加购次数
FROM events
WHERE event_type = '加购'
GROUP BY page_name
ORDER BY 加购次数 DESC
LIMIT 3;`,
      `SELECT page_name AS 页面名称,
  COUNT(*) AS 加购次数
FROM events
WHERE event_type IN ('加购')
GROUP BY page_name
ORDER BY 加购次数 DESC
LIMIT 3;`,
    ],
  },
];
