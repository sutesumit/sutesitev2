type LiveSessionStatus = 'active' | 'closed' | 'cancelled';

export type LiveSession = {
  id: string;
  slug: string;
  title: string;
  status: LiveSessionStatus;
  tags: string[];
  category: string;
  authors: string[];
  summary: string | null;
  started_at: string;
  closed_at: string | null;
  entry_count: number;
  created_at: string;
};

export type LiveEntry = {
  id: string;
  session_id: string;
  content: string;
  sequence: number;
  created_at: string;
};

export type AddEntryResult = {
  entry_id: string;
  entry_sequence: number;
  session_slug: string;
};
