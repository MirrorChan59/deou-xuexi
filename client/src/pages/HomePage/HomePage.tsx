import { Link } from 'react-router-dom';
import { BookOpen, Briefcase, ArrowRight, Sparkles, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface EntryCardProps {
  icon: typeof BookOpen;
  title: string;
  description: string;
  subDescription: string;
  to: string;
  index: number;
}

const EntryCard = ({
  icon: Icon,
  title,
  description,
  subDescription,
  to,
  index,
}: EntryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 20,
        delay: 0.1 * index,
      }}
      className="h-full"
    >
      <Link
        to={to}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/15"
      >
        <motion.div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.5,
          }}
        />
        <motion.div
          className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-semantic-blue/10 blur-2xl"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1 + index * 0.3,
          }}
        />

        <motion.div
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
          whileHover={{
            scale: 1.08,
            rotate: -4,
            background: 'linear-gradient(135deg, hsl(215 100% 60%) 0%, hsl(215 100% 48%) 100%)',
            color: '#fff',
            boxShadow: '0 8px 24px -8px hsl(215 100% 54% / 0.5)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Icon className="h-7 w-7" strokeWidth={2} />
        </motion.div>

        <h3 className="relative mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="relative mt-2 text-base font-semibold text-foreground">
          {description}
        </p>

        <p className="relative mt-1 text-sm text-muted-foreground">
          {subDescription}
        </p>

        <div className="relative mt-8 flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-300 ease-out group-hover:gap-3">
          <span>立即进入</span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 20 },
    },
  };

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(215_95%_50%)] to-[hsl(220_90%_42%)] text-white">
        <motion.div
          className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(215,100%,75%), transparent 65%)' }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute -bottom-40 -left-20 h-[450px] w-[450px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(200,100%,70%), transparent 65%)' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        <motion.div
          className="pointer-events-none absolute top-[20%] left-[15%] h-24 w-24 rounded-full border-2 border-white/25"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute top-[30%] right-[20%] h-16 w-16 rounded-full bg-white/15 backdrop-blur-sm"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute bottom-[25%] right-[30%] h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm"
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute top-[55%] left-[40%] h-8 w-8 rounded-full bg-white/25"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-20 md:px-6 md:py-28 lg:py-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>全新升级 · 求职加油站</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            >
              得欧学员站
              <br />
              <span className="bg-gradient-to-r from-white via-white to-blue-200 bg-clip-text text-transparent">
                互联网求职加油站
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-2xl text-base text-white/85 md:text-lg lg:text-xl"
            >
              专为 27/28/29 届 &amp; 实习同学打造 · 产品 / 运营 / 市场三大职能全覆盖
              <br />
              <span className="text-white/70">真实面经 · 实时投递 · 内推直达</span>
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/interview"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-primary shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15"
              >
                <BookOpen className="h-4 w-4" />
                <span>开始刷题</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/recruitment"
                className="group inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20"
              >
                <Briefcase className="h-4 w-4" />
                <span>投递岗位</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background" />
      </section>

      <section className="relative bg-background pb-20 pt-16 md:pb-24 md:pt-20">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              探索两大核心板块
            </h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              精选真题与实时岗位，一站式助力校招求职
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
            <EntryCard
              icon={BookOpen}
              title="面试题库"
              description="8 类细分题型 · 附参考答案"
              subDescription="产品 × 运营 × 市场 三大职能全覆盖"
              to="/interview"
              index={0}
            />
            <EntryCard
              icon={Briefcase}
              title="校招投递表"
              description="实时更新 · 内推码直达"
              subDescription="每日更新 · 覆盖大厂与新锐公司"
              to="/recruitment"
              index={1}
            />
            <EntryCard
              icon={Database}
              title="产品经理技能训练"
              description="SQL 取数实战 · 线上即时执行"
              subDescription="模拟出表与取数需求 · 结果自动校验"
              to="/sql-training"
              index={2}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
