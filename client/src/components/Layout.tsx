import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Send, Database, LogOut, Users, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

import { Image } from '@client/src/components/ui/image';
import { Button } from '@client/src/components/ui/button';
import logoUrl from '@client/src/assets/logo.png';
import { useSession } from '@client/src/session/SessionContext';

const NAV_ITEMS = [
  { label: '面试题库', path: '/interview', icon: BookOpen },
  { label: '校招投递表', path: '/recruitment', icon: Send },
  { label: '技能训练', path: '/sql-training', icon: Database },
];

const ADMIN_NAV_ITEMS = [
  { label: '账号管理', path: '/admin/accounts', icon: UserCog },
  { label: '用户管理', path: '/admin/users', icon: Users },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useSession();

  const navItems = useMemo(
    () =>
      user?.role === '管理员'
        ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS]
        : NAV_ITEMS,
    [user],
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-40 w-full border-b border-border/60 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70"
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <NavLink
            to="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative"
            >
              <Image
                src={logoUrl}
                alt="得欧科技"
                className="h-8 w-8"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 blur-md"
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              />
            </motion.div>
            <span className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
              得欧学员站
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} end>
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <span
                        className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                          isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-bg"
                          className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/30"
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-foreground sm:inline">
                {user.name}
              </span>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                {user.role}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="退出登录"
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.header>

      <main className="w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 得欧学员站 · 互联网求职加油站
      </footer>
    </div>
  );
};

export default Layout;
