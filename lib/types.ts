import { Category, Choice } from './constants';

export type Topic = {
  id: string;
  question_tr: string;
  question_en: string;
  category: Category;
  is_daily: boolean;
  is_active: boolean;
  created_at: string;
};

export type MyVote = { topic_id: string; choice: Choice } | null;
