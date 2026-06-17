import { create } from 'zustand';
import type { User, Level, Chart, MVWork, GameState, UserSettings, HitResult, Report, Notification, ModerationLog, ReportReason, ReportableContentType, ModerationAction, ReportStatus } from '../types';
import { mockUser, mockLevels, mockCharts, mockMVWorks, mockReports, mockNotifications, mockModerationLogs, mockAdminUser } from '../data/mockData';

interface AppStore {
  user: User | null;
  levels: Level[];
  charts: Chart[];
  mvWorks: MVWork[];
  currentLevel: Level | null;
  currentChart: Chart | null;
  gameState: GameState;
  favorites: string[];
  reports: Report[];
  notifications: Notification[];
  moderationLogs: ModerationLog[];

  setUser: (user: User | null) => void;
  setCurrentLevel: (level: Level | null) => void;
  setCurrentChart: (chart: Chart | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleFavorite: (chartId: string) => void;

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  updateGameTime: (time: number) => void;
  registerHit: (result: HitResult) => void;
  resetGameState: () => void;

  saveChart: (chart: Omit<Chart, 'id' | 'user' | 'createdAt' | 'playCount' | 'likes'> & { id?: string }) => Chart;
  publishChart: (chart: Omit<Chart, 'id' | 'user' | 'createdAt' | 'playCount' | 'likes'>) => Chart;
  
  addMVWork: (work: Omit<MVWork, 'id' | 'user' | 'createdAt' | 'likes' | 'rating' | 'ratingCount'>) => MVWork;

  isAdmin: () => boolean;
  submitReport: (data: {
    targetType: ReportableContentType;
    targetId: string;
    targetContent?: Report['targetContent'];
    reason: ReportReason;
    description: string;
  }) => Report;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  processReport: (reportId: string, action: ModerationAction, moderatorNote: string) => void;
  getReports: (filters?: { status?: ReportStatus; targetType?: ReportableContentType }) => Report[];
  getReportById: (reportId: string) => Report | undefined;

  getUnreadNotificationCount: () => number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getUserNotifications: () => Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;

  switchToAdmin: () => void;
  switchToPlayer: () => void;
}

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hitCount: {
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
  },
};

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  levels: mockLevels,
  charts: mockCharts,
  mvWorks: mockMVWorks,
  currentLevel: null,
  currentChart: null,
  gameState: initialGameState,
  favorites: ['chart-001', 'chart-003'],
  reports: mockReports,
  notifications: mockNotifications,
  moderationLogs: mockModerationLogs,

  setUser: (user) => set({ user }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setCurrentChart: (chart) => set({ currentChart: chart }),

  updateSettings: (settings) =>
    set((state) => ({
      user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null,
    })),

  toggleFavorite: (chartId) =>
    set((state) => ({
      favorites: state.favorites.includes(chartId)
        ? state.favorites.filter((id) => id !== chartId)
        : [...state.favorites, chartId],
    })),

  startGame: () =>
    set({
      gameState: { ...initialGameState, isPlaying: true },
    }),

  pauseGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPaused: true },
    })),

  resumeGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPaused: false },
    })),

  endGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPlaying: false, isPaused: false },
    })),

  updateGameTime: (time) =>
    set((state) => ({
      gameState: { ...state.gameState, currentTime: time },
    })),

  registerHit: (result) =>
    set((state) => {
      const newCombo = result.type === 'miss' ? 0 : state.gameState.combo + 1;
      return {
        gameState: {
          ...state.gameState,
          score: state.gameState.score + result.score * (1 + newCombo * 0.01),
          combo: newCombo,
          maxCombo: Math.max(state.gameState.maxCombo, newCombo),
          hitCount: {
            ...state.gameState.hitCount,
            [result.type]: state.gameState.hitCount[result.type] + 1,
          },
        },
      };
    }),

  resetGameState: () => set({ gameState: initialGameState }),

  saveChart: (chartData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    if (chartData.id) {
      const updatedCharts = state.charts.map((c) =>
        c.id === chartData.id ? { ...c, ...chartData } : c
      );
      set({ charts: updatedCharts });
      return updatedCharts.find((c) => c.id === chartData.id)!;
    }

    const newChart: Chart = {
      ...chartData,
      id: `chart-${Date.now()}`,
      user,
      playCount: 0,
      likes: 0,
      createdAt: new Date(),
    };
    set({ charts: [newChart, ...state.charts] });
    return newChart;
  },

  publishChart: (chartData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    const newChart: Chart = {
      ...chartData,
      id: `chart-${Date.now()}`,
      user,
      playCount: 0,
      likes: 0,
      createdAt: new Date(),
    };
    set({ charts: [newChart, ...state.charts] });
    return newChart;
  },

  addMVWork: (workData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    const newWork: MVWork = {
      ...workData,
      id: `mv-${Date.now()}`,
      user,
      likes: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };
    set({ mvWorks: [newWork, ...state.mvWorks] });
    return newWork;
  },

  isAdmin: () => {
    const state = get();
    return state.user?.role === 'admin';
  },

  submitReport: (data) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    const newReport: Report = {
      id: `report-${Date.now()}`,
      reporterId: user.id,
      reporter: user,
      targetType: data.targetType,
      targetId: data.targetId,
      targetContent: data.targetContent,
      reason: data.reason,
      description: data.description,
      status: 'pending',
      createdAt: new Date(),
    };

    set({ reports: [newReport, ...state.reports] });

    get().addNotification({
      userId: user.id,
      type: 'report_submitted',
      title: '举报已提交',
      message: `您提交的关于"${data.targetContent?.title || data.targetContent?.content?.slice(0, 20) || '内容'}"的举报已收到，我们会尽快处理。`,
      relatedReportId: newReport.id,
    });

    const admins = [mockAdminUser];
    admins.forEach(admin => {
      get().addNotification({
        userId: admin.id,
        type: 'new_report',
        title: '新的举报待处理',
        message: `收到新的举报：${newReport.targetContent?.title || newReport.targetContent?.content?.slice(0, 30) || '内容'}，请及时处理。`,
        relatedReportId: newReport.id,
      });
    });

    return newReport;
  },

  updateReportStatus: (reportId, status) => {
    const state = get();
    if (!state.isAdmin()) throw new Error('无权限执行此操作');

    const updatedReports = state.reports.map(report =>
      report.id === reportId
        ? { ...report, status, reviewedBy: state.user, reviewedAt: new Date() }
        : report
    );
    set({ reports: updatedReports });
  },

  processReport: (reportId, action, moderatorNote) => {
    const state = get();
    if (!state.isAdmin()) throw new Error('无权限执行此操作');
    if (!state.user) throw new Error('用户未登录');

    const report = state.reports.find(r => r.id === reportId);
    if (!report) throw new Error('举报不存在');

    const status: ReportStatus = action === 'approve' ? 'dismissed' : 'resolved';

    const updatedReports = state.reports.map(r =>
      r.id === reportId
        ? {
            ...r,
            status,
            reviewedAt: new Date(),
            reviewedBy: state.user!,
            moderationAction: action,
            moderatorNote,
          }
        : r
    );
    set({ reports: updatedReports });

    const newLog: ModerationLog = {
      id: `log-${Date.now()}`,
      reportId,
      moderatorId: state.user.id,
      moderator: state.user,
      action,
      reason: moderatorNote,
      targetType: report.targetType,
      targetId: report.targetId,
      createdAt: new Date(),
    };
    set({ moderationLogs: [newLog, ...state.moderationLogs] });

    const actionText = action === 'approve' ? '通过审核，内容无违规' : action === 'warn' ? '已警告并要求整改' : '已删除';
    get().addNotification({
      userId: report.reporterId,
      type: 'report_processed',
      title: '举报处理结果',
      message: `您举报的"${report.targetContent?.title || '内容'}"已处理：${actionText}。${moderatorNote}`,
      relatedReportId: reportId,
    });

    if (report.targetContent?.authorId && action !== 'approve') {
      const notifType = action === 'warn' ? 'moderation_warning' : 'content_removed';
      const notifTitle = action === 'warn' ? '内容警告通知' : '内容已被移除';
      const notifMessage = action === 'warn'
        ? `您发布的"${report.targetContent?.title || '内容'}"因涉嫌违规已被警告，请及时整改。${moderatorNote}`
        : `您发布的"${report.targetContent?.title || '内容'}"因涉嫌违规已被删除。${moderatorNote}`;
      
      get().addNotification({
        userId: report.targetContent.authorId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        relatedReportId: reportId,
      });
    }

    if (action === 'delete') {
      if (report.targetType === 'chart') {
        set({ charts: state.charts.filter(c => c.id !== report.targetId) });
      } else if (report.targetType === 'mvWork') {
        set({ mvWorks: state.mvWorks.filter(m => m.id !== report.targetId) });
      }
    }
  },

  getReports: (filters) => {
    const state = get();
    let reports = [...state.reports];
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters?.targetType) {
      reports = reports.filter(r => r.targetType === filters.targetType);
    }
    return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getReportById: (reportId) => {
    return get().reports.find(r => r.id === reportId);
  },

  getUnreadNotificationCount: () => {
    const state = get();
    if (!state.user) return 0;
    return state.notifications.filter(n => n.userId === state.user!.id && !n.read).length;
  },

  markNotificationAsRead: (notificationId) => {
    const state = get();
    const updatedNotifications = state.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  },

  markAllNotificationsAsRead: () => {
    const state = get();
    if (!state.user) return;
    const updatedNotifications = state.notifications.map(n =>
      n.userId === state.user!.id ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  },

  getUserNotifications: () => {
    const state = get();
    if (!state.user) return [];
    return state.notifications
      .filter(n => n.userId === state.user!.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addNotification: (notification) => {
    const state = get();
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date(),
    };
    set({ notifications: [newNotification, ...state.notifications] });
  },

  switchToAdmin: () => {
    set({ user: mockAdminUser });
  },

  switchToPlayer: () => {
    set({ user: mockUser });
  },
}));
