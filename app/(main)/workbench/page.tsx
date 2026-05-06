'use client';

import { useEffect, useState } from 'react';
import { MOCK_CLIPS, MOCK_FOLDERS, MOCK_FOLDER_GROUPS, getClipDetail } from '@/app/api/workbench/route';

type Folder = typeof MOCK_FOLDERS[0];
type Clip = typeof MOCK_CLIPS[0];
type FolderGroup = typeof MOCK_FOLDER_GROUPS[0];

export default function WorkbenchPage() {
  const [folderGroups, setFolderGroups] = useState<FolderGroup[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['1']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/workbench');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setFolderGroups(data.folderGroups);
        setFolders(data.folders);
        setClips(data.clips);
        setSelectedFolderId(data.selectedFolderId);
        if (data.clips.length > 0) {
          setSelectedClipId(data.clips[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    const folderClips = MOCK_CLIPS.filter((c) => c.folder_id === folderId);
    setClips(folderClips);
    if (folderClips.length > 0) {
      setSelectedClipId(folderClips[0].id);
    }
  };

  const handleClipClick = (clipId: string) => {
    setSelectedClipId(clipId);
  };

  const toggleGroupExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleStarClip = (clipId: string) => {
    setClips(
      clips.map((c) =>
        c.id === clipId ? { ...c, starred: !c.starred } : c
      )
    );
  };

  const filteredClips = clips.filter(
    (clip) =>
      clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clip.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClip = clips.find((c) => c.id === selectedClipId);
  const clipDetail = selectedClip ? getClipDetail(selectedClip.id) : null;

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Search Bar */}
      <div className="h-[40px] border-b flex items-center px-6 gap-4" style={{ borderColor: 'var(--rule)' }}>
        <input
          type="text"
          placeholder="Search clips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--rule)' }}
        />
        <span className="text-xs" style={{ color: 'var(--ink-3)' }}>
          {filteredClips.length} results
        </span>
        <span className="text-xs" style={{ color: 'var(--ink-4)' }}>
          github · synced 12m ago
        </span>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Folders (248px) */}
        <aside
          className="w-[248px] border-r p-4 overflow-y-auto flex flex-col"
          style={{ borderColor: 'var(--rule)' }}
        >
          {/* Workspace Header */}
          <h3 className="text-xs font-bold uppercase mb-4" style={{ color: 'var(--ink-3)' }}>
            Workspace
          </h3>

          {/* Quick Nav */}
          <div className="space-y-1 mb-6">
            {[
              { label: 'Inbox', count: 3 },
              { label: 'Starred', count: 28 },
              { label: 'Recent', count: 0 },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full text-left px-2 py-1.5 text-xs rounded transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                <div className="flex justify-between items-center">
                  <span>{item.label}</span>
                  {item.count > 0 && (
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink-3)' }}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Folder Groups */}
          <div className="space-y-3 flex-1">
            {folderGroups.map((group) => {
              const groupFolders = folders.filter((f) => f.group_id === group.id);
              const isExpanded = expandedGroups.has(group.id);

              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroupExpanded(group.id)}
                    className="w-full text-left px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    <span>{isExpanded ? '▼' : '▶'}</span>
                    <span>{group.name}</span>
                    <span style={{ color: 'var(--ink-4)' }}>({groupFolders.length})</span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 mt-1 ml-2">
                      {groupFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => handleFolderClick(folder.id)}
                          className="w-full text-left px-2 py-1.5 text-xs rounded transition-colors"
                          style={{
                            backgroundColor: selectedFolderId === folder.id ? 'var(--paper-2)' : 'transparent',
                            borderLeft: selectedFolderId === folder.id ? '2px solid var(--navy)' : 'none',
                            paddingLeft: selectedFolderId === folder.id ? '10px' : '12px',
                            color: 'var(--ink)',
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: folder.color === 'navy' ? 'var(--navy)' : folder.color === 'teal' ? 'var(--teal)' : 'var(--gold)' }}
                            />
                            <span className="flex-1 truncate">{folder.name}</span>
                            <span
                              className="px-1 py-0.5 rounded text-xs"
                              style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink-3)' }}
                            >
                              {folder.clip_count}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sources Card */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--rule)' }}>
            <h4 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
              Sources
            </h4>
            <div
              className="p-3 rounded text-xs space-y-1"
              style={{ backgroundColor: 'var(--card)', border: '1px solid', borderColor: 'var(--rule)' }}
            >
              <div style={{ color: 'var(--ink)' }}>claude_company</div>
              <div style={{ color: 'var(--ink-3)' }}>synced 12m ago</div>
            </div>
          </div>
        </aside>

        {/* Middle Column: Clip List (360px) */}
        <section className="w-[360px] border-r p-4 overflow-y-auto" style={{ borderColor: 'var(--rule)' }}>
          {/* Sticky Header */}
          {selectedFolder && (
            <div className="sticky top-0 pb-3 mb-3 bg-opacity-95" style={{ backgroundColor: 'var(--paper)' }}>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedFolder.color === 'navy' ? 'var(--navy)' : selectedFolder.color === 'teal' ? 'var(--teal)' : 'var(--gold)' }}
                />
                <h3 className="font-semibold text-sm">{selectedFolder.name}</h3>
                <span
                  className="ml-auto px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink-3)' }}
                >
                  {filteredClips.length}
                </span>
              </div>
            </div>
          )}

          {/* Filter Chips */}
          <div className="flex gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--rule-2)' }}>
            {['All', 'Starred', 'With note', 'From md'].map((chip) => (
              <button
                key={chip}
                className="px-2.5 py-1 text-xs rounded transition-colors"
                style={{
                  backgroundColor: chip === 'All' ? 'var(--navy)' : 'var(--paper-2)',
                  color: chip === 'All' ? 'white' : 'var(--ink)',
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Clip List */}
          <div className="space-y-2">
            {filteredClips.map((clip) => (
              <button
                key={clip.id}
                onClick={() => handleClipClick(clip.id)}
                className="w-full text-left p-3 rounded transition-all"
                style={{
                  backgroundColor: selectedClipId === clip.id ? 'var(--paper-2)' : 'var(--card)',
                  borderLeft: selectedClipId === clip.id ? '3px solid var(--navy)' : 'none',
                  paddingLeft: selectedClipId === clip.id ? '12px' : '12px',
                }}
              >
                <div className="text-xs mb-1.5" style={{ color: 'var(--ink-3)' }}>
                  {clip.source_name} • {new Date(clip.captured_at).toLocaleDateString('ja-JP')}
                </div>
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{clip.title}</h4>
                <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                  {clip.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1 flex-wrap">
                    {clip.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink-3)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs" style={{ color: 'var(--ink-4)' }}>
                    {clip.highlight_count > 0 && <span>◆ {clip.highlight_count}</span>}
                    {clip.note_count > 0 && <span>📝 {clip.note_count}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Right Pane: Clip Detail (flex) */}
        <main className="flex-1 overflow-y-auto p-6">
          {clipDetail && selectedClip ? (
            <div className="space-y-6">
              {/* Breadcrumb */}
              <div className="text-xs" style={{ color: 'var(--ink-3)' }}>
                {selectedFolder?.name} › {selectedClip.title} › clip/{selectedClip.id}
              </div>

              {/* Title Section */}
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>
                  {selectedClip.source_name}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                    {selectedClip.title}
                  </h1>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStarClip(selectedClip.id)}
                      className="px-3 py-2 rounded transition-colors"
                      style={{
                        backgroundColor: selectedClip.starred ? 'var(--gold)' : 'var(--paper-2)',
                        color: selectedClip.starred ? 'white' : 'var(--ink)',
                      }}
                    >
                      {selectedClip.starred ? '★' : '☆'} Star
                    </button>
                    <button
                      className="px-3 py-2 rounded transition-colors"
                      style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}
                    >
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedClip.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {selectedClip.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {clipDetail.highlights.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                    Highlights
                  </h3>
                  <div className="space-y-2">
                    {clipDetail.highlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-3 rounded"
                        style={{
                          backgroundColor: 'var(--card)',
                          borderLeft: '3px solid var(--vermilion)',
                        }}
                      >
                        <p className="text-sm mb-1" style={{ color: 'var(--ink)', fontStyle: 'italic' }}>
                          "{hl.text}"
                        </p>
                        {hl.note && (
                          <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
                            {hl.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {clipDetail.notes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                    My Notes
                  </h3>
                  <div className="space-y-2">
                    {clipDetail.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--paper-2)',
                          borderLeft: '3px solid var(--gold)',
                          color: 'var(--ink)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {note.body_md}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Clips */}
              {clipDetail.relatedClips.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
                    Related in {selectedFolder?.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {clipDetail.relatedClips.map((relatedClip) => (
                      <button
                        key={relatedClip.id}
                        onClick={() => handleClipClick(relatedClip.id)}
                        className="p-3 rounded text-left transition-colors"
                        style={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid',
                          borderColor: 'var(--rule)',
                        }}
                      >
                        <h4 className="font-semibold text-xs mb-1 line-clamp-2">
                          {relatedClip.title}
                        </h4>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                          {relatedClip.excerpt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm" style={{ color: 'var(--ink-3)' }}>
              クリップを選択してください
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
