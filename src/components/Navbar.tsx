import { useState, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Gamepad2,
  Palette,
  Hand,
  Users,
  User,
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  Shield,
} from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { NotificationCenter } from './NotificationCenter';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/game', label: '触觉节拍', icon: Gamepad2 },
  { to: '/workshop', label: '视觉作曲', icon: Palette },
  { to: '/signlanguage', label: '手语MV', icon: Hand },
  { to: '/community', label: '谱面社区', icon: Users },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLButtonElement>(null);
  const user = useAppStore((state) => state.user);
  const isAdmin = useAppStore((state) => state.isAdmin());
  const unreadCount = useAppStore((state) => state.getUnreadNotificationCount());

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 backdrop-blur-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange flex items-center justify-center shadow-neon-cyan"
            >
              <Zap className="w-6 h-6 text-ocean-dark" />
            </motion.div>
            <span className="font-display font-bold text-xl text-gradient">
              RHYTHM VISION
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2',
                    isActive
                      ? 'text-neon-cyan bg-neon-cyan/10'
                      : 'text-moon-dim hover:text-moon-white hover:bg-white/5'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan shadow-neon-cyan"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/review"
                className="p-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors relative"
                title="内容审核"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
            <button
              ref={notificationRef}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-moon-dim hover:text-moon-white hover:bg-white/5 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationCenter
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              triggerRef={notificationRef}
            />
            <Link to="/user/settings" className="p-2 rounded-lg text-moon-dim hover:text-moon-white hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              to="/user"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-7 h-7 rounded-lg border border-neon-cyan/30"
              />
              <span className="text-sm font-medium text-moon-white">{user?.username}</span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                  管理员
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-moon-dim hover:text-moon-white hover:bg-white/5"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-moon-dim hover:bg-white/5 hover:text-moon-white'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-2">
                {isAdmin && (
                  <Link
                    to="/admin/review"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-400 hover:bg-purple-500/10"
                  >
                    <Shield className="w-5 h-5" />
                    内容审核中心
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowNotifications(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-moon-dim hover:bg-white/5 hover:text-moon-white"
                >
                  <div className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  通知中心
                </button>
                <Link
                  to="/user"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-moon-dim hover:bg-white/5 hover:text-moon-white"
                >
                  <User className="w-5 h-5" />
                  个人中心
                </Link>
                <Link
                  to="/user/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-moon-dim hover:bg-white/5 hover:text-moon-white"
                >
                  <Settings className="w-5 h-5" />
                  震动设置
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
