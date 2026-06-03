import { Category, Choice, CommentMode, CommentStatus, PollType } from './constants';

export type TopicOption = {
  id: string;
  label_tr: string;
  label_en: string | null;
  position: number;
};

export type Topic = {
  id: string;
  question_tr: string;
  question_en: string;
  category: Category;
  is_daily: boolean;
  is_active: boolean;
  comments_enabled: boolean;
  comment_mode: CommentMode;
  scheduled_daily_date: string | null;
  poll_type: PollType;
  options?: TopicOption[];
  created_at: string;
};

export type OptionResult = { option_id: string; label_tr: string; label_en: string | null; votes: number };

export type MyVote = { topic_id: string; choice: Choice } | null;

export type SponsorPlacement = 'reveal' | 'feed' | 'footer';
export type Sponsor = {
  id: string;
  label_tr: string;
  label_en: string | null;
  url: string;
  placement: SponsorPlacement;
  is_active: boolean;
};

export type Comment = {
  id: string;
  topic_id: string;
  body: string;
  status: CommentStatus;
  region: string | null;
  created_at: string;
};
