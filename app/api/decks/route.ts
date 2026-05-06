import { NextResponse } from 'next/server';

// Mock data
const MOCK_DECKS = [
  {
    id: 'd1',
    title: '2025年上期 セキュリティ脅威アセスメント',
    template: 'consulting',
    status: 'draft' as const,
    slides_count: 3,
    clip_count: 5,
    file_url: null as string | null,
    file_size: null as number | null,
    file_name: null as string | null,
    uploaded_at: null as string | null,
    updated_at: '2026-05-05T10:00:00Z',
  },
  {
    id: 'd2',
    title: 'クライアント提案資料',
    template: 'consulting',
    status: 'shared' as const,
    slides_count: 12,
    clip_count: 18,
    file_url: null,
    file_size: null,
    file_name: null,
    uploaded_at: null,
    updated_at: '2026-05-02T15:30:00Z',
  },
  {
    id: 'd3',
    title: '業界トレンド分析 2026',
    template: 'timeline',
    status: 'archived' as const,
    slides_count: 8,
    clip_count: 12,
    file_url: null,
    file_size: null,
    file_name: null,
    uploaded_at: null,
    updated_at: '2026-04-28T12:00:00Z',
  },
  {
    id: 'd4',
    title: 'リスク比較分析',
    template: 'comparison',
    status: 'draft' as const,
    slides_count: 6,
    clip_count: 9,
    file_url: null,
    file_size: null,
    file_name: null,
    uploaded_at: null,
    updated_at: '2026-04-25T18:45:00Z',
  },
];

// In-memory storage for uploaded decks (local development)
const uploadedDecks: typeof MOCK_DECKS = [];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

export async function GET() {
  try {
    console.log('API /decks: Fetching decks...');
    const allDecks = [...MOCK_DECKS, ...uploadedDecks];
    return NextResponse.json({ decks: allDecks });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = (formData.get('title') as string) || 'New Deck';
    const template = (formData.get('template') as string) || 'consulting';

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (file.type !== ALLOWED_MIME_TYPE && !file.name.endsWith('.pptx')) {
      return NextResponse.json(
        { error: 'PPTXファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが50MBを超えています' },
        { status: 400 }
      );
    }

    const deckId = `d_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = file.name;
    const fileSize = file.size;
    const uploadedAt = new Date().toISOString();

    // In local development, generate a mock storage URL
    // In production with Supabase, this would be the actual storage URL
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1] || 'local';
    const fileUrl = `https://${projectId}.supabase.co/storage/v1/object/public/decks/${deckId}.pptx`;

    // Create deck record
    const newDeck = {
      id: deckId,
      title,
      template: template as 'consulting' | 'timeline' | 'comparison',
      status: 'draft' as const,
      slides_count: 0,
      clip_count: 0,
      file_url: fileUrl,
      file_size: fileSize,
      file_name: fileName,
      uploaded_at: uploadedAt,
      updated_at: uploadedAt,
    };

    // Store in in-memory array (for local development)
    // In production, this would save to Supabase database and Storage
    uploadedDecks.push(newDeck);

    console.log('API /decks: File uploaded successfully', { deckId, fileName, fileSize });

    return NextResponse.json({
      success: true,
      deck: newDeck,
    });
  } catch (error) {
    console.error('API Upload Error:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// Export for internal use
export { MOCK_DECKS };
