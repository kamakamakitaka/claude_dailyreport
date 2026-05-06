'use client';

import { useEffect, useState } from 'react';
import { FeedSource, FeedItem } from '@/types/database';

export default function FeedPage() {
  const [sources, setSources] = useState<FeedSource[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/feed');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSources(data.sources || []);
        setFeedItems(data.items || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredItems = () => {
    let filtered = feedItems;

    if (selectedSource) {
      filtered = filtered.filter((item) => item.source_id === selectedSource);
    }

    switch (selectedFilter) {
      case 'critical':
        filtered = filtered.filter((item) => item.severity === 'critical');
        break;
      case 'unread':
        filtered = filtered.filter((item) => !item.read);
        break;
      case 'vulnerability':
        filtered = filtered.filter((item) => item.category === 'vulnerability');
        break;
      default:
        break;
    }

    return filtered;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--vermilion)';
      case 'high':
        return 'var(--gold)';
      default:
        return 'var(--navy)';
    }
  };

  const filteredItems = getFilteredItems();
  const criticalItems = filteredItems.filter((i) => i.severity === 'critical');
  const highItems = filteredItems.filter((i) => i.severity === 'high');
  const infoItems = filteredItems.filter((i) => i.severity === 'info');

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Sidebar */}
      <aside className="w-[220px] border-r p-4 overflow-y-auto" style={{ borderColor: 'var(--rule)' }}>
        {/* Feed Status */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
            Feed Status
          </h3>
          <div
            className="p-3 rounded text-xs space-y-1"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--rule)', border: '1px solid' }}
          >
            <div className="flex items-center gap-1" style={{ color: 'var(--teal)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--teal)' }} />
              Live
            </div>
            <div style={{ color: 'var(--ink-3)' }}>Last: 06:32 JST</div>
            <div style={{ color: 'var(--ink-3)' }}>Next: 12:00</div>
            <div className="text-xs mt-2 space-y-0.5">
              <div>
                Today: <strong>{feedItems.filter((i) => new Date(i.published_at || '').toDateString() === new Date().toDateString()).length}</strong>
              </div>
              <div>
                Unread: <strong style={{ color: 'var(--vermilion)' }}>{feedItems.filter((i) => !i.read).length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Sources */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
            Sources · {sources.length}
          </h3>
          <div className="space-y-1">
            {sources.map((source) => {
              const count = feedItems.filter((i) => i.source_id === source.id).length;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(selectedSource === source.id ? null : source.id)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded transition-colors"
                  style={{
                    backgroundColor: selectedSource === source.id ? 'var(--paper-2)' : 'transparent',
                    color: 'var(--ink)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="flex-1 truncate">{source.name}</span>
                    <span
                      className="px-1 py-0.5 rounded text-xs bg-opacity-20"
                      style={{ backgroundColor: source.color, color: 'var(--ink-3)' }}
                    >
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div>
          <h3 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--ink-3)' }}>
            Filter
          </h3>
          <div className="space-y-1">
            {[
              { label: 'All', value: 'all' },
              { label: 'Critical', value: 'critical' },
              { label: 'Unread', value: 'unread' },
              { label: 'Vulnerability', value: 'vulnerability' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className="w-full text-left px-2 py-1.5 text-xs rounded transition-colors"
                style={{
                  backgroundColor: selectedFilter === filter.value ? 'var(--paper-2)' : 'transparent',
                  color: 'var(--ink)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Today's Must-Read */}
        {criticalItems.length > 0 && (
          <div className="p-6 border-b" style={{ borderColor: 'var(--rule)' }}>
            <div className="mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--vermilion)' }}>
                <span>⚑ TODAY'S MUST-READ · 5月5日（月）</span>
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {criticalItems.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-80 p-4 rounded"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderTop: `3px solid ${idx < 2 ? 'var(--vermilion)' : 'var(--gold)'}`,
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: 'var(--ink-3)' }}>
                    {sources.find((s) => s.id === item.source_id)?.name}
                  </div>
                  <h3 className="text-sm font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  {item.badge && (
                    <div className="text-xs px-2 py-1 rounded-full mb-2 inline-block" style={{ backgroundColor: 'var(--paper-2)' }}>
                      {item.badge}
                    </div>
                  )}
                  <p className="text-xs line-clamp-3" style={{ color: 'var(--ink-3)' }}>
                    {item.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Severity Board (3 columns) */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Critical */}
            <div>
              <div className="mb-4" style={{ borderTop: '2px solid var(--vermilion)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--vermilion)' }}>
                  {criticalItems.length}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
                  Critical
                </div>
              </div>
              <div className="space-y-3">
                {criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderLeft: `3px solid var(--vermilion)`,
                      opacity: item.read ? 0.62 : 1,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>
                      {sources.find((s) => s.id === item.source_id)?.name}
                    </div>
                    {item.badge && (
                      <div className="text-xs px-1.5 py-0.5 rounded mb-1 inline-block" style={{ backgroundColor: 'var(--paper-2)' }}>
                        {item.badge}
                      </div>
                    )}
                    <h4 className="text-sm font-semibold mb-1 line-clamp-2">{item.title}</h4>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                      {item.excerpt}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        Pin
                      </button>
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        → Workbench
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High */}
            <div>
              <div className="mb-4" style={{ borderTop: '2px solid var(--gold)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                  {highItems.length}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
                  High
                </div>
              </div>
              <div className="space-y-3">
                {highItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderLeft: `3px solid var(--gold)`,
                      opacity: item.read ? 0.62 : 1,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>
                      {sources.find((s) => s.id === item.source_id)?.name}
                    </div>
                    {item.badge && (
                      <div className="text-xs px-1.5 py-0.5 rounded mb-1 inline-block" style={{ backgroundColor: 'var(--paper-2)' }}>
                        {item.badge}
                      </div>
                    )}
                    <h4 className="text-sm font-semibold mb-1 line-clamp-2">{item.title}</h4>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                      {item.excerpt}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        Pin
                      </button>
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        → Workbench
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="mb-4" style={{ borderTop: '2px solid var(--navy)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
                  {infoItems.length}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
                  Info
                </div>
              </div>
              <div className="space-y-3">
                {infoItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: 'var(--card)',
                      borderLeft: `3px solid var(--navy)`,
                      opacity: item.read ? 0.62 : 1,
                    }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--ink-3)' }}>
                      {sources.find((s) => s.id === item.source_id)?.name}
                    </div>
                    {item.badge && (
                      <div className="text-xs px-1.5 py-0.5 rounded mb-1 inline-block" style={{ backgroundColor: 'var(--paper-2)' }}>
                        {item.badge}
                      </div>
                    )}
                    <h4 className="text-sm font-semibold mb-1 line-clamp-2">{item.title}</h4>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--ink-3)' }}>
                      {item.excerpt}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        Pin
                      </button>
                      <button className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}>
                        → Workbench
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
