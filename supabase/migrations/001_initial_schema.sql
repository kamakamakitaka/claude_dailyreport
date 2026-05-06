-- Knowledge Hub - Initial Schema Migration
-- Design Handoff README のデータモデルをベースにした Supabase PostgreSQL スキーマ

-- ===== ENUMS =====

CREATE TYPE feed_severity AS ENUM ('critical', 'high', 'info');
CREATE TYPE feed_category AS ENUM ('vulnerability', 'alert', 'framework', 'guideline', 'incident');
CREATE TYPE feed_region AS ENUM ('JP', 'US', 'EU', 'Vendor');
CREATE TYPE deck_status AS ENUM ('draft', 'shared', 'archived');

-- ===== 1. Feed Sources (独立テーブル) =====

CREATE TABLE feed_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region feed_region NOT NULL,
  color TEXT NOT NULL, -- CSS color value (e.g., "#B8442C")
  rss_url TEXT NOT NULL,
  parser_kind TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_sources_name ON feed_sources(name);

-- ===== 2. Projects (独立テーブル) =====

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL, -- Design token color name (e.g., "navy")
  phase TEXT, -- e.g., "active", "proposal", "closed"
  week_label TEXT, -- e.g., "W1 2025"
  brief TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_archived ON projects(archived);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ===== 3. Folder Groups (独立テーブル) =====

CREATE TABLE folder_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_folder_groups_sort_order ON folder_groups(sort_order);

-- ===== 4. Folders (Projects/FolderGroups に依存) =====

CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES folder_groups(id),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  color TEXT,
  kind TEXT, -- e.g., "project", "research", "archive"
  parent_id UUID REFERENCES folders(id), -- 階層構造対応
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_folders_group_id ON folders(group_id);
CREATE INDEX idx_folders_project_id ON folders(project_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- ===== 5. Feed Items (FeedSources に依存) =====

CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES feed_sources(id),
  external_id TEXT, -- 外部 RSS ID (e.g., CVE-2024-XXXX)
  severity feed_severity NOT NULL DEFAULT 'info',
  category feed_category NOT NULL,
  badge TEXT, -- e.g., "CVE-2024-1234", "CVSS 9.0", "KEV"
  title TEXT NOT NULL,
  excerpt TEXT,
  url TEXT NOT NULL,
  cvss NUMERIC(3,1), -- 0.0 ~ 10.0
  kev_flag BOOLEAN DEFAULT false, -- CISA KEV 掲載フラグ
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feed_items_source_id ON feed_items(source_id);
CREATE INDEX idx_feed_items_severity ON feed_items(severity);
CREATE INDEX idx_feed_items_category ON feed_items(category);
CREATE INDEX idx_feed_items_published_at ON feed_items(published_at DESC);
CREATE INDEX idx_feed_items_read ON feed_items(read);
CREATE INDEX idx_feed_items_pinned ON feed_items(pinned);

-- ===== 6. Feed Item Tags (FeedItems に依存) =====

CREATE TABLE feed_item_tags (
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (feed_item_id, tag)
);

CREATE INDEX idx_feed_item_tags_tag ON feed_item_tags(tag);

-- ===== 7. Clips (Folders に依存) =====

CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES folders(id),
  source TEXT NOT NULL, -- e.g., "jpcert", "rss", "manual"
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_md TEXT, -- Markdown の本文（Readability 抽出結果など）
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  starred BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clips_folder_id ON clips(folder_id);
CREATE INDEX idx_clips_starred ON clips(starred);
CREATE INDEX idx_clips_captured_at ON clips(captured_at DESC);

-- ===== 8. Clip Tags (Clips に依存) =====

CREATE TABLE clip_tags (
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (clip_id, tag)
);

CREATE INDEX idx_clip_tags_tag ON clip_tags(tag);

-- ===== 9. Highlights (Clips に依存) =====

CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  text TEXT NOT NULL, -- ハイライト対象の引用文
  color TEXT, -- CSS color (e.g., "yellow", "#FFF59D")
  note TEXT, -- オプションのメモ
  position_in_body INTEGER, -- 本文内での位置（今後の機能用）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_highlights_clip_id ON highlights(clip_id);

-- ===== 10. Notes (Clips に依存) =====

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  body_md TEXT NOT NULL, -- Markdown のメモ本文
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_clip_id ON notes(clip_id);

-- ===== 11. Decks (Projects に依存) =====

CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id), -- NULL = グローバルデッキ
  title TEXT NOT NULL,
  template TEXT, -- e.g., "consulting", "timeline", "comparison"
  status deck_status DEFAULT 'draft',
  slides_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_decks_project_id ON decks(project_id);
CREATE INDEX idx_decks_status ON decks(status);

-- ===== 12. Deck Slides (Decks に依存) =====

CREATE TABLE deck_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL, -- スライド順序
  title TEXT,
  body_md TEXT, -- Markdown コンテンツ
  layout TEXT, -- e.g., "title", "content", "comparison"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deck_id, idx)
);

CREATE INDEX idx_deck_slides_deck_id ON deck_slides(deck_id);

-- ===== 13. Deck Clip References (Decks/DeckSlides/Clips/Highlights に依存) =====

CREATE TABLE deck_clip_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  slide_id UUID NOT NULL REFERENCES deck_slides(id) ON DELETE CASCADE,
  clip_id UUID NOT NULL REFERENCES clips(id),
  highlight_id UUID REFERENCES highlights(id), -- オプション：特定ハイライトの参照
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deck_clip_refs_deck_id ON deck_clip_refs(deck_id);
CREATE INDEX idx_deck_clip_refs_slide_id ON deck_clip_refs(slide_id);
CREATE INDEX idx_deck_clip_refs_clip_id ON deck_clip_refs(clip_id);

-- ===== 14. Markdown Imports (Projects に依存) =====

CREATE TABLE md_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo TEXT NOT NULL, -- e.g., "github.com/kamakamakitaka/claude_company"
  commit_sha TEXT,
  path TEXT NOT NULL, -- e.g., "exports/2025-05-05/feed.md"
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_md_imports_repo_path ON md_imports(repo, path);
CREATE INDEX idx_md_imports_project_id ON md_imports(project_id);

-- ===== トリガー: updated_at 自動更新 =====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feed_sources_updated_at
BEFORE UPDATE ON feed_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON folders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_items_updated_at
BEFORE UPDATE ON feed_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clips_updated_at
BEFORE UPDATE ON clips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highlights_updated_at
BEFORE UPDATE ON highlights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deck_slides_updated_at
BEFORE UPDATE ON deck_slides
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== 完了 =====
-- このマイグレーションを実行後、Supabase Table Editor で全テーブルが表示されることを確認してください。
