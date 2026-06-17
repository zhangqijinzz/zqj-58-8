import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import type { ReportableContentType, ReportReason } from '../types';

interface ReportModalProps {
  onClose: () => void;
  targetType: ReportableContentType;
  targetId: string;
  targetContent?: {
    title?: string;
    content?: string;
    authorId?: string;
    authorName?: string;
  };
}

const reasonOptions: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'inappropriate_content',
    label: '不当内容',
    description: '包含暴力、色情、血腥等不适宜内容',
  },
  {
    value: 'copyright_infringement',
    label: '版权侵权',
    description: '未经授权使用他人原创内容',
  },
  {
    value: 'harassment',
    label: '骚扰辱骂',
    description: '人身攻击、恶意辱骂、挑衅滋事',
  },
  {
    value: 'spam',
    label: '垃圾广告',
    description: '虚假广告、恶意营销、刷屏灌水',
  },
  {
    value: 'malicious_behavior',
    label: '恶意行为',
    description: '诈骗、钓鱼、外挂、恶意引导',
  },
  {
    value: 'other',
    label: '其他问题',
    description: '其他违反社区规范的行为',
  },
];

const typeLabels: Record<ReportableContentType, string> = {
  chart: '谱面',
  comment: '评论',
  mvWork: 'MV作品',
};

export function ReportModal({
  onClose,
  targetType,
  targetId,
  targetContent,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitReport = useAppStore((state) => state.submitReport);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      submitReport({
        targetType,
        targetId,
        targetContent,
        reason: selectedReason,
        description,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('提交举报失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">举报{typeLabels[targetType]}</h2>
                <p className="text-sm text-slate-400">
                  {targetContent?.title || targetContent?.content?.slice(0, 30) || '内容'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">举报已提交</h3>
              <p className="text-slate-400">感谢您的反馈，我们会尽快处理</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  请选择举报原因
                </label>
                <div className="space-y-2">
                  {reasonOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedReason(option.value)}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 border ${
                        selectedReason === option.value
                          ? 'bg-red-500/20 border-red-500/50 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
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
                  补充说明（可选）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="请详细描述您遇到的问题，以便我们更好地处理..."
                  className="w-full h-24 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
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
                  onClick={handleSubmit}
                  disabled={!selectedReason || isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      提交举报
                    </>
                  )}
                </motion.button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                恶意举报可能导致账号被限制，请确保举报内容真实有效
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
