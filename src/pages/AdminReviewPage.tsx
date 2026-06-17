import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, Filter, User, FileText, MessageSquare, Video, Eye, Check, TriangleAlert } from 'lucide-react';
import { useAppStore } from '../store';
import type { Report, ReportStatus, ReportableContentType, ModerationAction } from '../types';

const statusConfig: Record<ReportStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '待处理', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  reviewing: { label: '审核中', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye },
  resolved: { label: '已处理', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  dismissed: { label: '已驳回', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle },
};

const typeConfig: Record<ReportableContentType, { label: string; icon: typeof FileText }> = {
  chart: { label: '谱面', icon: FileText },
  comment: { label: '评论', icon: MessageSquare },
  mvWork: { label: 'MV作品', icon: Video },
};

const reasonLabels: Record<string, string> = {
  inappropriate_content: '不当内容',
  copyright_infringement: '版权侵权',
  harassment: '骚扰辱骂',
  spam: '垃圾广告',
  malicious_behavior: '恶意行为',
  other: '其他问题',
};

function ReportCard({ report, onProcess }: { report: Report; onProcess: (report: Report) => void }) {
  const status = statusConfig[report.status];
  const type = typeConfig[report.targetType];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-xl">
            <TypeIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-slate-400">{type.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${status.color} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <h3 className="font-semibold text-white">
              {report.targetContent?.title || report.targetContent?.content?.slice(0, 30) || '未知内容'}
            </h3>
          </div>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(report.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">举报人：</span>
          <span className="text-white">{report.reporter.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">原因：</span>
          <span className="text-orange-400">{reasonLabels[report.reason]}</span>
        </div>
        {report.targetContent?.authorName && (
          <div className="flex items-center gap-2 col-span-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">内容作者：</span>
            <span className="text-white">{report.targetContent.authorName}</span>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
        <p className="text-sm text-slate-400 mb-1">举报描述：</p>
        <p className="text-slate-300">{report.description}</p>
      </div>

      {report.moderatorNote && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-cyan-400 mb-1">处理结果：</p>
          <p className="text-slate-300">{report.moderatorNote}</p>
          {report.reviewedBy && (
            <p className="text-xs text-slate-500 mt-2">
              处理人：{report.reviewedBy.username} · {report.reviewedAt && new Date(report.reviewedAt).toLocaleString('zh-CN')}
            </p>
          )}
        </div>
      )}

      {(report.status === 'pending' || report.status === 'reviewing') && (
        <button
          onClick={() => onProcess(report)}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          处理举报
        </button>
      )}
    </motion.div>
  );
}

function ProcessModal({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const processReport = useAppStore((state) => state.processReport);

  const handleProcess = async () => {
    if (!action || !moderatorNote.trim()) return;

    setIsProcessing(true);
    try {
      processReport(report.id, action, moderatorNote);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('处理举报失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const actionOptions: { value: ModerationAction; label: string; description: string; color: string }[] = [
    {
      value: 'approve',
      label: '通过审核',
      description: '内容无违规，举报无效',
      color: 'border-green-500/50 bg-green-500/20 text-green-400',
    },
    {
      value: 'warn',
      label: '发出警告',
      description: '内容存在轻微违规，警告作者整改',
      color: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-400',
    },
    {
      value: 'delete',
      label: '删除内容',
      description: '内容严重违规，立即删除并通知作者',
      color: 'border-red-500/50 bg-red-500/20 text-red-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">处理举报</h2>
              <p className="text-sm text-slate-400">
                {report.targetContent?.title || report.targetContent?.content?.slice(0, 30)}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-slate-500">举报类型：</span>
                <span className="text-white ml-2">{typeConfig[report.targetType].label}</span>
              </div>
              <div>
                <span className="text-slate-500">举报原因：</span>
                <span className="text-orange-400 ml-2">{reasonLabels[report.reason]}</span>
              </div>
              <div>
                <span className="text-slate-500">举报人：</span>
                <span className="text-white ml-2">{report.reporter.username}</span>
              </div>
              {report.targetContent?.authorName && (
                <div>
                  <span className="text-slate-500">内容作者：</span>
                  <span className="text-white ml-2">{report.targetContent.authorName}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-1">举报描述：</p>
              <p className="text-slate-300">{report.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              选择处理方式
            </label>
            <div className="space-y-3">
              {actionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAction(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                    action === option.value
                      ? option.color
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              处理说明
            </label>
            <textarea
              value={moderatorNote}
              onChange={(e) => setModeratorNote(e.target.value)}
              placeholder="请详细说明处理理由，该说明将发送给举报人和内容作者..."
              className="w-full h-28 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors font-medium"
            >
              取消
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcess}
              disabled={!action || !moderatorNote.trim() || isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  确认处理
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminReviewPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportableContentType | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);

  const isAdmin = useAppStore((state) => state.isAdmin());
  const reports = useAppStore((state) => state.reports);
  const user = useAppStore((state) => state.user);
  const switchToAdmin = useAppStore((state) => state.switchToAdmin);
  const switchToPlayer = useAppStore((state) => state.switchToPlayer);
  const getReports = useAppStore((state) => state.getReports);

  const filteredReports = getReports({
    status: statusFilter === 'all' ? undefined : statusFilter,
    targetType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const stats = {
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <TriangleAlert className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">无权限访问</h1>
          <p className="text-slate-400 mb-6">该页面仅管理员可访问</p>
          <div className="space-y-3">
            <button
              onClick={switchToAdmin}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all font-medium"
            >
              切换到管理员账号（演示）
            </button>
            <p className="text-xs text-slate-600">当前账号：{user?.username}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">内容审核中心</h1>
              <p className="text-slate-400">管理社区内容，维护良好的社区环境</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {user?.username}
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                管理员
              </span>
            </button>
            {showRoleSwitch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10"
              >
                <button
                  onClick={() => {
                    switchToPlayer();
                    setShowRoleSwitch(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  切换到普通玩家
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">待处理</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">审核中</span>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.reviewing}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">已处理</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.resolved}</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">已驳回</span>
              <XCircle className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold text-slate-400">{stats.dismissed}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">筛选：</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="reviewing">审核中</option>
            <option value="resolved">已处理</option>
            <option value="dismissed">已驳回</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportableContentType | 'all')}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">全部类型</option>
            <option value="chart">谱面</option>
            <option value="comment">评论</option>
            <option value="mvWork">MV作品</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
              <p className="text-slate-500">暂无符合条件的举报</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onProcess={setSelectedReport}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <ProcessModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
