import { NextResponse } from 'next/server';

// Mock data
const MOCK_FOLDER_GROUPS = [
  { id: '1', name: 'Active Engagements', sort_order: 1 },
  { id: '2', name: 'Industry Research', sort_order: 2 },
  { id: '3', name: 'Methods & Frameworks', sort_order: 3 },
  { id: '4', name: 'Archive · 2025', sort_order: 4 },
];

const MOCK_FOLDERS = [
  { id: 'f1', group_id: '1', name: 'Mizuho', color: 'navy', clip_count: 12 },
  { id: 'f2', group_id: '1', name: 'JR East', color: 'navy', clip_count: 8 },
  { id: 'f3', group_id: '1', name: 'Asahi Glass', color: 'navy', clip_count: 5 },
  { id: 'f4', group_id: '2', name: 'Financial Services', color: 'teal', clip_count: 24 },
  { id: 'f5', group_id: '2', name: 'Mobility', color: 'teal', clip_count: 18 },
  { id: 'f6', group_id: '3', name: 'NIST CSF', color: 'gold', clip_count: 9 },
];

const MOCK_CLIPS = [
  {
    id: 'c1',
    folder_id: 'f1',
    title: 'Windows RCE 脆弱性への対応マニュアル',
    excerpt: '金融機関向けの緊急対応ガイドライン。段階的な検証・パッチ適用プロセス。',
    source: 'jpcert',
    source_name: 'JPCERT/CC',
    captured_at: '2026-05-04T10:00:00Z',
    starred: true,
    highlight_count: 2,
    note_count: 1,
    tags: ['Windows', 'RCE', '緊急'],
    body_md: '# Windows RCE 脆弱性対応ガイド\n\n## 影響範囲\n- Windows Server 2012 以降\n- KB5029439 未適用\n\n## 対応手順\n1. 現状調査\n2. パッチ適用\n3. 監視強化',
  },
  {
    id: 'c2',
    folder_id: 'f1',
    title: 'Mizuho DX 推進における セキュリティチェックリスト',
    excerpt: 'API 導入時・クラウド移行時の必須セキュリティ確認項目。',
    source: 'manual',
    source_name: 'Internal Wiki',
    captured_at: '2026-05-03T14:30:00Z',
    starred: false,
    highlight_count: 0,
    note_count: 2,
    tags: ['DX', 'チェックリスト'],
    body_md: '# DX推進 セキュリティチェックリスト\n\n- [ ] API キーローテーション\n- [ ] WAF 設定\n- [ ] ログ監視',
  },
  {
    id: 'c3',
    folder_id: 'f1',
    title: '2025 年 Q1 インシデント報告書',
    excerpt: 'セキュリティインシデント分析・統計・改善案',
    source: 'manual',
    source_name: 'Internal Report',
    captured_at: '2026-04-30T09:00:00Z',
    starred: false,
    highlight_count: 1,
    note_count: 0,
    tags: ['インシデント', 'Q1'],
    body_md: '...',
  },
  {
    id: 'c4',
    folder_id: 'f2',
    title: 'JR 東日本のサイバー攻撃対策強化',
    excerpt: '鉄道インフラのセキュリティ強化施策',
    source: 'jpcert',
    source_name: 'JPCERT/CC',
    captured_at: '2026-05-02T11:00:00Z',
    starred: true,
    highlight_count: 0,
    note_count: 0,
    tags: ['鉄道', 'インフラ'],
    body_md: '...',
  },
  {
    id: 'c5',
    folder_id: 'f4',
    title: 'Financial Services セキュリティトレンド 2026',
    excerpt: '金融業界のセキュリティ課題と対応策',
    source: 'rss',
    source_name: 'Industry Report',
    captured_at: '2026-05-01T15:45:00Z',
    starred: false,
    highlight_count: 3,
    note_count: 1,
    tags: ['金融', 'トレンド'],
    body_md: '...',
  },
];

const MOCK_HIGHLIGHTS = {
  c1: [
    { id: 'h1', text: 'Windows Server 2012 以降', color: 'yellow', note: 'Mizuho でも対象サーバが複数存在' },
    { id: 'h2', text: 'KB5029439 未適用', color: 'yellow', note: 'パッチ管理チームへ通知予定' },
  ],
  c2: [],
  c3: [{ id: 'h3', text: '重大インシデント 2件', color: 'red', note: null }],
  c4: [],
  c5: [
    { id: 'h4', text: 'ランサムウェア被害増加', color: 'red', note: '業界全体で 30% 増' },
    { id: 'h5', text: 'ゼロトラスト導入進展', color: 'green', note: 'NIST CSF 2.0 推進' },
    { id: 'h6', text: '外部委託先管理が重要', color: 'yellow', note: 'サプライチェーン対策' },
  ],
};

const MOCK_NOTES = {
  c1: [
    { id: 'n1', body_md: '## アクションアイテム\n- 5月中に全サーバで KB5029439 を適用\n- パッチ適用後の監視ルール追加' },
    { id: 'n2', body_md: '## 関連チケット\n- JIRA: OPS-1234 (Assigned to @infra-team)' },
  ],
  c2: [
    { id: 'n3', body_md: '## 実装状況\n- [ ] API キーローテーション → Eng チーム\n- [ ] WAF 設定 → Sec チーム' },
    { id: 'n4', body_md: '期限: 2026-05-20' },
  ],
  c3: [],
  c4: [],
  c5: [{ id: 'n5', body_md: '会議メモ: スライド資料に組み込む予定' }],
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const folderId = url.searchParams.get('folder_id');

    console.log('API /workbench: folderId =', folderId);

    // Return folder structure
    if (!folderId) {
      // Initial load: return folder groups + first folder's clips
      const firstFolder = MOCK_FOLDERS[0];
      const clipsForFirstFolder = MOCK_CLIPS.filter((c) => c.folder_id === firstFolder.id);

      return NextResponse.json({
        folderGroups: MOCK_FOLDER_GROUPS,
        folders: MOCK_FOLDERS,
        clips: clipsForFirstFolder,
        selectedFolderId: firstFolder.id,
      });
    }

    // Filtered by folder_id
    const clipsForFolder = MOCK_CLIPS.filter((c) => c.folder_id === folderId);

    return NextResponse.json({
      folderGroups: MOCK_FOLDER_GROUPS,
      folders: MOCK_FOLDERS,
      clips: clipsForFolder,
      selectedFolderId: folderId,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workbench data' },
      { status: 500 }
    );
  }
}

// Helper to get clip detail
export function getClipDetail(clipId: string) {
  const clip = MOCK_CLIPS.find((c) => c.id === clipId);
  if (!clip) return null;

  const relatedClips = MOCK_CLIPS.filter(
    (c) => c.folder_id === clip.folder_id && c.id !== clipId
  ).slice(0, 4);

  return {
    clip,
    highlights: MOCK_HIGHLIGHTS[clipId as keyof typeof MOCK_HIGHLIGHTS] || [],
    notes: MOCK_NOTES[clipId as keyof typeof MOCK_NOTES] || [],
    relatedClips,
  };
}

// Export for internal use
export { MOCK_CLIPS, MOCK_HIGHLIGHTS, MOCK_NOTES, MOCK_FOLDERS, MOCK_FOLDER_GROUPS };
