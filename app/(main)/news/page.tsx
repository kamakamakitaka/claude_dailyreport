'use client';

import { useEffect, useState } from 'react';
import { MOCK_ARTICLES } from '@/app/api/news/route';

type Article = (typeof MOCK_ARTICLES)[0];

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const [attackTypeFilter, setAttackTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (riskFilter) params.append('risk_level', riskFilter);
        if (attackTypeFilter) params.append('attack_type', attackTypeFilter);

        const response = await fetch(`/api/news?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm, riskFilter, attackTypeFilter]);

  const downloadCSV = () => {
    const headers = [
      'Date',
      'Title',
      'Risk Level',
      'CVE ID',
      'Attack Type',
      'URL',
    ];
    const rows = articles.map((a) => [
      a.date,
      a.title,
      a.risk_level,
      a.cve_id || '',
      a.attack_type || '',
      a.original_url,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadJSON = () => {
    const json = JSON.stringify(articles, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 overflow-y-auto" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Security News Feed
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-3)' }}>
          {articles.length} articles • Claude AI analyzed
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="検索（タイトル、CVE ID）..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--ink)',
            border: '1px solid var(--rule)',
          }}
        />

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {/* Risk Level Filter */}
          <div className="flex gap-2">
            {['🔴', '🟡', '🟢'].map((level) => (
              <button
                key={level}
                onClick={() => setRiskFilter(riskFilter === level ? null : level)}
                className="px-3 py-1 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    riskFilter === level ? 'var(--navy)' : 'var(--card)',
                  color: riskFilter === level ? 'white' : 'var(--ink)',
                  border: `1px solid ${
                    riskFilter === level ? 'var(--navy)' : 'var(--rule)'
                  }`,
                }}
              >
                {level} Risk
              </button>
            ))}
          </div>

          {/* Attack Type Filter */}
          <div className="flex gap-2">
            {['RCE', 'Phishing', 'Malware'].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setAttackTypeFilter(attackTypeFilter === type ? null : type)
                }
                className="px-3 py-1 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    attackTypeFilter === type ? 'var(--teal)' : 'var(--card)',
                  color: attackTypeFilter === type ? 'white' : 'var(--ink)',
                  border: `1px solid ${
                    attackTypeFilter === type ? 'var(--teal)' : 'var(--rule)'
                  }`,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="px-3 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--paper-2)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--card)')
            }
          >
            📥 CSV
          </button>
          <button
            onClick={downloadJSON}
            className="px-3 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--paper-2)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--card)')
            }
          >
            📥 JSON
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div
        className="rounded overflow-hidden"
        style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--rule)' }}>
              <th
                className="px-4 py-3 text-left font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                Date
              </th>
              <th
                className="px-4 py-3 text-left font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                Title
              </th>
              <th
                className="px-4 py-3 text-center font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                Risk
              </th>
              <th
                className="px-4 py-3 text-left font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                CVE / Attack
              </th>
              <th
                className="px-4 py-3 text-center font-semibold"
                style={{ color: 'var(--ink)' }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, idx) => (
              <tr
                key={article.id}
                style={{
                  borderBottom:
                    idx < articles.length - 1
                      ? '1px solid var(--rule)'
                      : 'none',
                }}
              >
                <td
                  className="px-4 py-3"
                  style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}
                >
                  {article.date}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--ink)' }}>
                  <div className="line-clamp-1">{article.title}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span style={{ fontSize: '1.2rem' }}>{article.risk_level}</span>
                </td>
                <td
                  className="px-4 py-3 text-sm"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {article.cve_id || article.attack_type || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="px-2 py-1 rounded text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--navy)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = '0.8')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = '1')
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {articles.length === 0 && (
        <div
          className="p-6 text-center rounded"
          style={{ backgroundColor: 'var(--card)', color: 'var(--ink-3)' }}
        >
          No articles found
        </div>
      )}

      {/* Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--ink)' }}
                >
                  {selectedArticle.title}
                </h2>
                <div
                  className="text-xs space-y-1"
                  style={{ color: 'var(--ink-3)' }}
                >
                  <p>📅 {selectedArticle.date}</p>
                  {selectedArticle.cve_id && <p>🔐 {selectedArticle.cve_id}</p>}
                  {selectedArticle.cvss_score && (
                    <p>⚠️ CVSS {selectedArticle.cvss_score}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-2xl transition-colors"
                style={{ color: 'var(--ink-3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--ink-3)')
                }
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <span
                className="px-3 py-1 rounded text-sm font-medium text-white inline-block"
                style={{
                  backgroundColor:
                    selectedArticle.risk_level === '🔴'
                      ? 'var(--vermilion)'
                      : selectedArticle.risk_level === '🟡'
                        ? 'var(--gold)'
                        : 'var(--teal)',
                }}
              >
                {selectedArticle.risk_level} Risk
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3
                  className="text-xs font-bold uppercase mb-2"
                  style={{ color: 'var(--ink-3)' }}
                >
                  Summary
                </h3>
                <p style={{ color: 'var(--ink)' }}>{selectedArticle.summary}</p>
              </div>

              <div>
                <h3
                  className="text-xs font-bold uppercase mb-2"
                  style={{ color: 'var(--ink-3)' }}
                >
                  Analysis Status
                </h3>
                <p style={{ color: 'var(--ink-2)' }}>
                  🔄 Claude AI analysis pending...
                </p>
              </div>

              <div className="border-t" style={{ borderColor: 'var(--rule)' }}>
                <button
                  onClick={() => window.open(selectedArticle.original_url)}
                  className="mt-4 w-full px-4 py-2 rounded font-medium text-white transition-colors"
                  style={{ backgroundColor: 'var(--navy)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--navy-2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--navy)')
                  }
                >
                  📖 Read Full Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
