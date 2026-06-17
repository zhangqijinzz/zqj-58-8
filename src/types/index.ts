export type Frequency = 'low' | 'mid' | 'high';
export type Waveform = 'sine' | 'square' | 'sawtooth';
export type NoteType = 'tap' | 'hold' | 'slide' | 'swing';
export type ParticleType = 'explosion' | 'wave' | 'sparkle' | 'trail';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';
export type Genre = 'electronic' | 'rock' | 'pop' | 'classical' | 'jazz' | 'hiphop';
export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface VibrationBeat {
  time: number;
  duration: number;
  intensity: number;
  frequency: Frequency;
  waveform: Waveform;
}

export interface VibrationSequence {
  version: string;
  bpm: number;
  beats: VibrationBeat[];
  totalDuration: number;
}

export interface VisualNote {
  time: number;
  lane: number;
  type: NoteType;
  color: string;
  duration?: number;
  slidePath?: { x: number; y: number }[];
}

export interface ParticleEffect {
  triggerTime: number;
  type: ParticleType;
  color: string;
  position: { x: number; y: number };
  duration: number;
}

export interface VisualChart {
  version: string;
  bpm: number;
  notes: VisualNote[];
  particles: ParticleEffect[];
  backgroundTheme: string;
  totalDuration: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  experience: number;
  badges: string[];
  role: UserRole;
  settings: UserSettings;
  createdAt: Date;
}

export interface UserSettings {
  vibrationIntensity: number;
  brightness: number;
  colorTheme: string;
  sensitivity: number;
  particleDensity: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  lyrics: string;
  coverImage: string;
  signLanguageVideo?: string;
  genre: Genre;
}

export interface Level {
  id: string;
  title: string;
  songId: string;
  song: Song;
  difficulty: Difficulty;
  genre: Genre;
  coverImage: string;
  vibrationPattern: VibrationSequence;
  visualChart: VisualChart;
  playCount: number;
  likes: number;
}

export interface GameScore {
  id: string;
  userId: string;
  levelId: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  rank: Rank;
  playedAt: Date;
}

export interface Chart {
  id: string;
  title: string;
  userId: string;
  user: User;
  levelId?: string;
  description: string;
  coverImage: string;
  vibrationData: VibrationSequence;
  visualData: VisualChart;
  difficulty: Difficulty;
  playCount: number;
  likes: number;
  tags: string[];
  createdAt: Date;
}

export interface MVWork {
  id: string;
  userId: string;
  user: User;
  songId: string;
  song: Song;
  title: string;
  videoUrl: string;
  thumbnail: string;
  likes: number;
  rating: number;
  ratingCount: number;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  chartId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  chartId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  score: number;
  combo: number;
  maxCombo: number;
  hitCount: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
}

export interface HitResult {
  type: 'perfect' | 'great' | 'good' | 'miss';
  score: number;
}

export type UserRole = 'player' | 'creator' | 'admin';

export type ReportableContentType = 'chart' | 'comment' | 'mvWork';

export type ReportReason =
  | 'inappropriate_content'
  | 'copyright_infringement'
  | 'harassment'
  | 'spam'
  | 'malicious_behavior'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type ModerationAction = 'approve' | 'warn' | 'delete';

export interface Report {
  id: string;
  reporterId: string;
  reporter: User;
  targetType: ReportableContentType;
  targetId: string;
  targetContent?: {
    title?: string;
    content?: string;
    authorId?: string;
    authorName?: string;
  };
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: User;
  moderationAction?: ModerationAction;
  moderatorNote?: string;
}

export type NotificationType =
  | 'report_submitted'
  | 'report_processed'
  | 'moderation_warning'
  | 'content_removed'
  | 'content_approved'
  | 'new_report'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedReportId?: string;
  read: boolean;
  createdAt: Date;
}

export interface ModerationLog {
  id: string;
  reportId: string;
  moderatorId: string;
  moderator: User;
  action: ModerationAction;
  reason: string;
  targetType: ReportableContentType;
  targetId: string;
  createdAt: Date;
}
