// Supabase Database Types
// 自動生成されるものではなく、手動管理の型定義

export type FeedSeverity = 'critical' | 'high' | 'info';
export type FeedCategory = 'vulnerability' | 'alert' | 'framework' | 'guideline' | 'incident';
export type FeedRegion = 'JP' | 'US' | 'EU' | 'Vendor';
export type DeckStatus = 'draft' | 'shared' | 'archived';

// ===== Feed Related =====

export interface FeedSource {
  id: string;
  name: string;
  region: FeedRegion;
  color: string;
  rss_url: string;
  parser_kind: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedItem {
  id: string;
  source_id: string;
  external_id: string | null;
  severity: FeedSeverity;
  category: FeedCategory;
  badge: string | null;
  title: string;
  excerpt: string | null;
  url: string;
  cvss: number | null;
  kev_flag: boolean;
  published_at: string | null;
  fetched_at: string;
  read: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedItemTag {
  feed_item_id: string;
  tag: string;
}

// ===== Projects / Folders =====

export interface Project {
  id: string;
  name: string;
  color: string;
  phase: string | null;
  week_label: string | null;
  brief: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FolderGroup {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Folder {
  id: string;
  group_id: string;
  project_id: string | null;
  name: string;
  color: string | null;
  kind: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// ===== Clips =====

export interface Clip {
  id: string;
  folder_id: string;
  source: string;
  source_url: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  captured_at: string;
  starred: boolean;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClipTag {
  clip_id: string;
  tag: string;
}

export interface Highlight {
  id: string;
  clip_id: string;
  text: string;
  color: string | null;
  note: string | null;
  position_in_body: number | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  clip_id: string;
  body_md: string;
  created_at: string;
  updated_at: string;
}

// ===== Decks =====

export interface Deck {
  id: string;
  project_id: string | null;
  title: string;
  template: string | null;
  status: DeckStatus;
  slides_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeckSlide {
  id: string;
  deck_id: string;
  idx: number;
  title: string | null;
  body_md: string | null;
  layout: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeckClipRef {
  id: string;
  deck_id: string;
  slide_id: string;
  clip_id: string;
  highlight_id: string | null;
  created_at: string;
}

// ===== GitHub Import =====

export interface MdImport {
  id: string;
  repo: string;
  commit_sha: string | null;
  path: string;
  imported_at: string;
  project_id: string | null;
  created_at: string;
}

// ===== Database Type (for RPC calls and Supabase client) =====

export type Database = {
  public: {
    Tables: {
      feed_sources: { Row: FeedSource; Insert: Omit<FeedSource, 'created_at' | 'updated_at'>; Update: Partial<Omit<FeedSource, 'id' | 'created_at'>> };
      feed_items: { Row: FeedItem; Insert: Omit<FeedItem, 'created_at' | 'updated_at'>; Update: Partial<Omit<FeedItem, 'id' | 'created_at'>> };
      feed_item_tags: { Row: FeedItemTag; Insert: FeedItemTag; Update: never };
      projects: { Row: Project; Insert: Omit<Project, 'created_at' | 'updated_at'>; Update: Partial<Omit<Project, 'id' | 'created_at'>> };
      folder_groups: { Row: FolderGroup; Insert: Omit<FolderGroup, 'created_at'>; Update: Partial<Omit<FolderGroup, 'id' | 'created_at'>> };
      folders: { Row: Folder; Insert: Omit<Folder, 'created_at' | 'updated_at'>; Update: Partial<Omit<Folder, 'id' | 'created_at'>> };
      clips: { Row: Clip; Insert: Omit<Clip, 'created_at' | 'updated_at'>; Update: Partial<Omit<Clip, 'id' | 'created_at'>> };
      clip_tags: { Row: ClipTag; Insert: ClipTag; Update: never };
      highlights: { Row: Highlight; Insert: Omit<Highlight, 'created_at' | 'updated_at'>; Update: Partial<Omit<Highlight, 'id' | 'created_at'>> };
      notes: { Row: Note; Insert: Omit<Note, 'created_at' | 'updated_at'>; Update: Partial<Omit<Note, 'id' | 'created_at'>> };
      decks: { Row: Deck; Insert: Omit<Deck, 'created_at' | 'updated_at'>; Update: Partial<Omit<Deck, 'id' | 'created_at'>> };
      deck_slides: { Row: DeckSlide; Insert: Omit<DeckSlide, 'created_at' | 'updated_at'>; Update: Partial<Omit<DeckSlide, 'id' | 'created_at'>> };
      deck_clip_refs: { Row: DeckClipRef; Insert: Omit<DeckClipRef, 'created_at'>; Update: never };
      md_imports: { Row: MdImport; Insert: Omit<MdImport, 'created_at'>; Update: Partial<Omit<MdImport, 'id' | 'created_at'>> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      feed_severity: FeedSeverity;
      feed_category: FeedCategory;
      feed_region: FeedRegion;
      deck_status: DeckStatus;
    };
  };
};
