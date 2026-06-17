import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Flag, AlertTriangle, Trash2, CheckCircle, MessageSquare, Settings } from 'lucide-react';
import { useAppStore } from '../store';
import type { Notification, NotificationType } from '../types';

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bgColor: string }> = {
  report_submitted: { icon: Flag, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  report_processed: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  moderation_warning: { icon: AlertTriangle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  content_removed: { icon: Trash2, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  content_approved: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  new_report: { icon: MessageSquare, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  system: { icon: Settings, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
};

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={`p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-slate-800/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${config.bgColor} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-white text-sm">{notification.title}</h4>
            {!notification.read && (
              <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(notification.createdAt).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function NotificationCenter({ isOpen, onClose, triggerRef }: NotificationCenterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = useAppStore((state) => state.getUserNotifications());
  const unreadCount = useAppStore((state) => state.getUnreadNotificationCount());
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
        setTimeout(onClose, 200);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, triggerRef, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ maxHeight: '80vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">通知中心</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {unreadCount} 条未读
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="全部已读"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 200);
                }}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 65px)' }}>
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">暂无通知</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markNotificationAsRead}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
