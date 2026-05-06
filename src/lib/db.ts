// Database CRUD operations
// 各テーブルの基本的な操作を提供

import { supabase } from './supabase';
import {
  FeedSource,
  FeedItem,
  Project,
  Folder,
  FolderGroup,
  Clip,
  Highlight,
  Note,
  Deck,
  DeckSlide,
  MdImport,
} from '@/types/database';

// ===== Feed Sources =====

export async function getFeedSources() {
  const { data, error } = await supabase
    .from('feed_sources')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as FeedSource[];
}

export async function getFeedSourceById(id: string) {
  const { data, error } = await supabase
    .from('feed_sources')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as FeedSource;
}

export async function createFeedSource(source: Omit<FeedSource, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('feed_sources')
    .insert(source)
    .select()
    .single();
  if (error) throw error;
  return data as FeedSource;
}

// ===== Projects =====

export async function getProjects(archived = false) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('archived', archived)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Project;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

// ===== Folder Groups =====

export async function getFolderGroups() {
  const { data, error } = await supabase
    .from('folder_groups')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data as FolderGroup[];
}

// ===== Folders =====

export async function getFoldersByGroupId(groupId: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('group_id', groupId)
    .order('name');
  if (error) throw error;
  return data as Folder[];
}

export async function getFoldersByProjectId(projectId: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('project_id', projectId)
    .order('name');
  if (error) throw error;
  return data as Folder[];
}

export async function getFolderById(id: string) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Folder;
}

export async function createFolder(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('folders')
    .insert(folder)
    .select()
    .single();
  if (error) throw error;
  return data as Folder;
}

// ===== Feed Items =====

export async function getFeedItems(filters?: { sourceId?: string; severity?: string; read?: boolean }) {
  let query = supabase.from('feed_items').select('*');

  if (filters?.sourceId) {
    query = query.eq('source_id', filters.sourceId);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }

  const { data, error } = await query.order('published_at', { ascending: false });
  if (error) throw error;
  return data as FeedItem[];
}

export async function getFeedItemById(id: string) {
  const { data, error } = await supabase
    .from('feed_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as FeedItem;
}

export async function createFeedItem(item: Omit<FeedItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('feed_items')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as FeedItem;
}

export async function updateFeedItem(id: string, updates: Partial<Omit<FeedItem, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('feed_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as FeedItem;
}

// ===== Clips =====

export async function getClipsByFolderId(folderId: string) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('folder_id', folderId)
    .order('captured_at', { ascending: false });
  if (error) throw error;
  return data as Clip[];
}

export async function getClipById(id: string) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Clip;
}

export async function createClip(clip: Omit<Clip, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('clips')
    .insert(clip)
    .select()
    .single();
  if (error) throw error;
  return data as Clip;
}

export async function updateClip(id: string, updates: Partial<Omit<Clip, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('clips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Clip;
}

// ===== Highlights =====

export async function getHighlightsByClipId(clipId: string) {
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('clip_id', clipId);
  if (error) throw error;
  return data as Highlight[];
}

export async function createHighlight(highlight: Omit<Highlight, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('highlights')
    .insert(highlight)
    .select()
    .single();
  if (error) throw error;
  return data as Highlight;
}

// ===== Notes =====

export async function getNotesByClipId(clipId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('clip_id', clipId);
  if (error) throw error;
  return data as Note[];
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

export async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

// ===== Decks =====

export async function getDecks(projectId?: string) {
  let query = supabase.from('decks').select('*');
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Deck[];
}

export async function getDeckById(id: string) {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Deck;
}

export async function createDeck(deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('decks')
    .insert(deck)
    .select()
    .single();
  if (error) throw error;
  return data as Deck;
}

// ===== Deck Slides =====

export async function getDeckSlidesByDeckId(deckId: string) {
  const { data, error } = await supabase
    .from('deck_slides')
    .select('*')
    .eq('deck_id', deckId)
    .order('idx');
  if (error) throw error;
  return data as DeckSlide[];
}

export async function createDeckSlide(slide: Omit<DeckSlide, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('deck_slides')
    .insert(slide)
    .select()
    .single();
  if (error) throw error;
  return data as DeckSlide;
}

// ===== Markdown Imports =====

export async function getMdImports(projectId?: string) {
  let query = supabase.from('md_imports').select('*');
  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  const { data, error } = await query.order('imported_at', { ascending: false });
  if (error) throw error;
  return data as MdImport[];
}

export async function createMdImport(mdImport: Omit<MdImport, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('md_imports')
    .insert(mdImport)
    .select()
    .single();
  if (error) throw error;
  return data as MdImport;
}
