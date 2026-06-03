import { Category, Choice, CommentMode, CommentStatus } from './constants';

export type Topic = {
  id: string;
  question_tr: string;
  question_en: string;
  category: Category;
  is_daily: boolean;
  is_active: boolean;
  comments_enabled: boolean;
  comment_mode: CommentMode;
  created_at: string;
};

export type MyVote = { topic_id: string; choice: Choice } | null;

export type Comment = {
  id: string;
  topic_id: string;
  body: string;
  status: CommentStatus;
  region: string | null;
  created_at: string;
};
