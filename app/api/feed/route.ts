import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Mock data for testing
const MOCK_SOURCES = [
  { id: '1', name: 'JPCERT/CC', region: 'JP' as const, color: '#B8442C', rss_url: 'https://www.jpcert.or.jp/rss/jpcert.rdf', parser_kind: 'rss', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'CISA', region: 'US' as const, color: '#2F6E6A', rss_url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', parser_kind: 'rss', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'IPA', region: 'JP' as const, color: '#B8442C', rss_url: 'https://www.ipa.go.jp/security/alert-rss.rdf', parser_kind: 'rss', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const MOCK_ITEMS = [
  { id: '1', source_id: '1', external_id: 'CVE-2025-1234', severity: 'critical' as const, category: 'vulnerability' as const, badge: 'CVE-2025-1234', title: '重大な脆弱性: Windows RCE 0-day 活発に利用', excerpt: 'Microsoft Windows の認証を回避され、リモートから任意コード実行される危険性。既に複数の攻撃が確認されています。', url: 'https://example.com/1', cvss: 9.8, kev_flag: true, published_at: new Date(Date.now() - 86400000).toISOString(), fetched_at: new Date().toISOString(), read: false, pinned: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', source_id: '2', external_id: 'CVE-2025-5678', severity: 'critical' as const, category: 'vulnerability' as const, badge: 'CVE-2025-5678', title: 'OpenSSL の暗号化プロトコル脆弱性 (CVSS 9.1)', excerpt: 'OpenSSL ライブラリにおける暗号化検証のバイパス。多くのシステムに影響。', url: 'https://example.com/2', cvss: 9.1, kev_flag: true, published_at: new Date(Date.now() - 43200000).toISOString(), fetched_at: new Date().toISOString(), read: false, pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', source_id: '3', external_id: 'JPVN-2025-001', severity: 'high' as const, category: 'alert' as const, badge: 'CVSS 8.2', title: 'Apache Log4j に新たな脆弱性発見 (CVE-2025-9999)', excerpt: '日本の組織でも多用されている Apache Log4j に重大な脆弱性。要確認・パッチ適用推奨。', url: 'https://example.com/3', cvss: 8.2, kev_flag: false, published_at: new Date(Date.now() - 21600000).toISOString(), fetched_at: new Date().toISOString(), read: true, pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', source_id: '2', external_id: null, severity: 'high' as const, category: 'framework' as const, badge: 'NIST Guidance', title: 'NIST CSF 2.0 Release - ゼロトラスト実装ガイドライン更新', excerpt: '国立標準技術研究所（NIST）が 2025 年版サイバーセキュリティフレームワークをリリース。', url: 'https://example.com/4', cvss: 7.5, kev_flag: false, published_at: new Date(Date.now() - 172800000).toISOString(), fetched_at: new Date().toISOString(), read: false, pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', source_id: '1', external_id: null, severity: 'info' as const, category: 'framework' as const, badge: 'White Paper', title: '欧州における サイバー犯罪トレンド 2025 年版', excerpt: 'ENISA が発行した年次ホワイトペーパー。ランサムウェア・サプライチェーン攻撃の動向を分析。', url: 'https://example.com/5', cvss: null, kev_flag: false, published_at: new Date(Date.now() - 259200000).toISOString(), fetched_at: new Date().toISOString(), read: false, pinned: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export async function GET() {
  try {
    console.log('API /feed: Starting fetch...');

    // Try to fetch from Supabase, but use mock data if it fails
    try {
      const { data: sources, error: sourcesError } = await supabase
        .from('feed_sources')
        .select('*')
        .order('name');

      if (!sourcesError && sources) {
        console.log('✓ Supabase connected! Sources:', sources.length);
        const { data: items, error: itemsError } = await supabase
          .from('feed_items')
          .select('*')
          .order('published_at', { ascending: false });

        if (!itemsError && items) {
          console.log('✓ Items fetched:', items.length);
          return NextResponse.json({ sources, items });
        }
      }
    } catch (e) {
      console.log('⚠ Supabase connection failed, using mock data');
    }

    // Fallback to mock data
    console.log('Using mock data for testing');
    return NextResponse.json({ sources: MOCK_SOURCES, items: MOCK_ITEMS });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}
