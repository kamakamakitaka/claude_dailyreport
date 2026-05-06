'use client';

import { useEffect, useState, useRef } from 'react';
import { MOCK_DECKS } from '@/app/api/decks/route';

type Deck = typeof MOCK_DECKS[0];

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/decks');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setDecks(data.decks || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shared':
        return 'var(--teal)';
      case 'archived':
        return 'var(--ink-4)';
      default:
        return 'var(--navy)';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'shared':
        return 'Shared';
      case 'archived':
        return 'Archived';
      default:
        return 'Draft';
    }
  };

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case 'timeline':
        return 'Timeline';
      case 'comparison':
        return 'Comparison';
      default:
        return 'Consulting';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace('.pptx', ''));
      formData.append('template', 'consulting');

      const response = await fetch('/api/decks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`エラー: ${error.error}`);
        return;
      }

      const result = await response.json();
      setDecks([...decks, result.deck]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('ファイルのアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const downloadDeck = (fileUrl: string | null, fileName: string | null) => {
    if (!fileUrl) {
      alert('このデッキはまだファイルがアップロードされていません');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'deck.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Decks Gallery
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>
          {decks.length} saved presentations
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {/* Deck Cards */}
        {decks.map((deck) => (
          <button
            key={deck.id}
            onClick={() => setSelectedDeck(deck)}
            className="text-left rounded overflow-hidden transition-all hover:shadow-lg hover:scale-105"
            style={{
              backgroundColor: 'var(--card)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
            }}
          >
            {/* Thumbnail (16:10 aspect ratio) */}
            <div
              className="relative w-full flex items-center justify-center text-center p-4"
              style={{
                aspectRatio: '16 / 10',
                backgroundColor: 'var(--paper-2)',
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(26, 31, 44, 0.05) 10px,
                    rgba(26, 31, 44, 0.05) 20px
                  )
                `,
                border: '1px solid',
                borderColor: 'var(--rule)',
              }}
            >
              {/* Title + page badge */}
              <div className="flex flex-col items-center gap-1">
                <h3
                  className="text-sm font-semibold line-clamp-2 px-2"
                  style={{ color: 'var(--ink)' }}
                >
                  {deck.title}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--navy)',
                    color: 'white',
                  }}
                >
                  {deck.slides_count}p
                </span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="p-3 space-y-2">
              {/* Title line */}
              <h4 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--ink)' }}>
                {deck.title}
              </h4>

              {/* Template · Pages · Date */}
              <div className="text-xs" style={{ color: 'var(--ink-3)' }}>
                {getTemplateLabel(deck.template)} · {deck.slides_count}p · {new Date(deck.updated_at).toLocaleDateString('ja-JP')}
              </div>

              {/* Status Badge */}
              <div>
                <span
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getStatusColor(deck.status) }}
                >
                  {getStatusLabel(deck.status)}
                </span>
              </div>

              {/* Uses N clips */}
              <div className="text-xs" style={{ color: 'var(--ink-3)' }}>
                ← uses {deck.clip_count} clips
              </div>
            </div>
          </button>
        ))}

        {/* Create New Deck Card */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full rounded p-4 flex items-center justify-center text-center transition-colors hover:bg-opacity-80 cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: 'var(--card)',
              border: '2px dashed',
              borderColor: 'var(--rule)',
              minHeight: '300px',
            }}
          >
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <span className="text-3xl" style={{ color: 'var(--ink-2)' }}>
                    ⏳
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                    アップロード中...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl" style={{ color: 'var(--ink-3)' }}>
                    +
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                    新規デッキを作成
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-3)' }}>
                    PPTXファイルをアップロード
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedDeck && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDeck(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                  {selectedDeck.title}
                </h2>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ink-3)' }}>
                  <span>{getTemplateLabel(selectedDeck.template)}</span>
                  <span>•</span>
                  <span>{selectedDeck.slides_count} pages</span>
                  <span>•</span>
                  <span>{new Date(selectedDeck.updated_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeck(null)}
                className="text-2xl transition-colors"
                style={{ color: 'var(--ink-3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
              >
                ×
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span
                className="px-3 py-1.5 rounded text-sm font-medium text-white inline-block"
                style={{ backgroundColor: getStatusColor(selectedDeck.status) }}
              >
                {getStatusLabel(selectedDeck.status)}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t mb-6" style={{ borderColor: 'var(--rule)' }} />

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left: Deck Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
                    Slides
                  </h3>
                  <div className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
                    {selectedDeck.slides_count}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
                    Template
                  </h3>
                  <div className="text-sm" style={{ color: 'var(--ink)' }}>
                    {getTemplateLabel(selectedDeck.template)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
                    Updated
                  </h3>
                  <div className="text-sm" style={{ color: 'var(--ink)' }}>
                    {new Date(selectedDeck.updated_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>

              {/* Right: File Info */}
              <div>
                <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
                  ファイル情報
                </h3>
                {selectedDeck.file_name ? (
                  <div
                    className="space-y-2 text-sm"
                    style={{
                      backgroundColor: 'var(--paper)',
                      padding: '12px',
                      borderRadius: '4px',
                    }}
                  >
                    <p style={{ color: 'var(--ink)' }}>
                      <span className="font-medium">{selectedDeck.file_name}</span>
                    </p>
                    <p style={{ color: 'var(--ink-3)' }}>
                      {selectedDeck.file_size ? `${(selectedDeck.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </p>
                    {selectedDeck.uploaded_at && (
                      <p style={{ color: 'var(--ink-3)' }}>
                        アップロード: {new Date(selectedDeck.uploaded_at).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="space-y-2 text-sm"
                    style={{
                      backgroundColor: 'var(--paper)',
                      padding: '12px',
                      borderRadius: '4px',
                    }}
                  >
                    <p style={{ color: 'var(--ink-3)' }}>まだファイルがアップロードされていません</p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t mb-6" style={{ borderColor: 'var(--rule)' }} />

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedDeck(null)}
                className="px-4 py-2 rounded text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--paper)',
                  color: 'var(--ink)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--paper-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--paper)')}
              >
                閉じる
              </button>
              {selectedDeck.file_url && (
                <button
                  onClick={() => downloadDeck(selectedDeck.file_url, selectedDeck.file_name)}
                  className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                  style={{
                    backgroundColor: 'var(--teal)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  ダウンロード
                </button>
              )}
              <button
                className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                style={{
                  backgroundColor: 'var(--navy)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--navy)')}
              >
                デッキを開く
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
