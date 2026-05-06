-- Knowledge Hub - Sample Data for Testing
-- Design Handoff README から参照可能なデータを挿入

-- ===== Feed Sources (11 sources from README) =====

INSERT INTO feed_sources (name, region, color, rss_url, parser_kind, enabled) VALUES
  ('JPCERT/CC', 'JP', '#B8442C', 'https://www.jpcert.or.jp/rss/jpcert.rdf', 'rss', true),
  ('IPA', 'JP', '#B8442C', 'https://www.ipa.go.jp/security/alert-rss.rdf', 'rss', true),
  ('NISC', 'JP', '#B8442C', 'https://www.nisc.go.jp/rss', 'rss', true),
  ('JVN', 'JP', '#B8442C', 'https://jvn.jp/rss/jvn.rdf', 'rss', true),
  ('警察庁サイバー警察局', 'JP', '#B8442C', 'https://www.npa.go.jp/rss', 'rss', true),
  ('CISA', 'US', '#2F6E6A', 'https://www.cisa.gov/cybersecurity-advisories/all.xml', 'rss', true),
  ('NIST', 'US', '#2F6E6A', 'https://www.nist.gov/news-events/cybersecurity/rss.xml', 'rss', true),
  ('ENISA', 'EU', '#2F6E6A', 'https://www.enisa.europa.eu/news/enisa-news/RSS', 'rss', true),
  ('Microsoft Security', 'Vendor', '#1F3A5F', 'https://api.msrc.microsoft.com', 'api', true),
  ('AWS Security', 'Vendor', '#1F3A5F', 'https://aws.amazon.com/security/security-bulletins/rss/feed/', 'rss', true),
  ('Google TAG', 'Vendor', '#1F3A5F', 'https://blog.google/threat-analysis-group/rss/', 'rss', true);

-- ===== Projects (Sample Engagements) =====

INSERT INTO projects (name, color, phase, week_label, brief, archived) VALUES
  ('Mizuho Financial Group', 'navy', 'active', 'W1 2025', 'デジタル化推進プロジェクト', false),
  ('JR East', 'navy', 'active', 'W1 2025', '鉄道システムセキュリティ強化', false),
  ('Asahi Glass', 'navy', 'proposal', 'W2 2025', 'グローバル供給チェーン最適化', false),
  ('METI Digital Initiative', 'navy', 'active', 'W1 2025', '経産省 DX 推進事業', false),
  ('Financial Services Review', 'navy', 'research', NULL, '金融業界セキュリティトレンド', false);

-- ===== Folder Groups =====

INSERT INTO folder_groups (name, sort_order) VALUES
  ('Active Engagements', 1),
  ('Industry Research', 2),
  ('Methods & Frameworks', 3),
  ('Archive · 2025', 4);

-- ===== Folders =====

INSERT INTO folders (group_id, project_id, name, color, kind, parent_id) VALUES
  -- Active Engagements フォルダ
  ((SELECT id FROM folder_groups WHERE name = 'Active Engagements'),
   (SELECT id FROM projects WHERE name = 'Mizuho Financial Group'),
   'Mizuho', 'navy', 'project', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Active Engagements'),
   (SELECT id FROM projects WHERE name = 'JR East'),
   'JR East', 'navy', 'project', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Active Engagements'),
   (SELECT id FROM projects WHERE name = 'Asahi Glass'),
   'Asahi Glass', 'navy', 'project', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Active Engagements'),
   (SELECT id FROM projects WHERE name = 'METI Digital Initiative'),
   'METI DX', 'navy', 'project', NULL),
  -- Industry Research フォルダ
  ((SELECT id FROM folder_groups WHERE name = 'Industry Research'),
   NULL, 'Financial Services', 'teal', 'research', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Industry Research'),
   NULL, 'Mobility & Transportation', 'teal', 'research', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Industry Research'),
   NULL, 'Manufacturing', 'teal', 'research', NULL),
  -- Methods & Frameworks フォルダ
  ((SELECT id FROM folder_groups WHERE name = 'Methods & Frameworks'),
   NULL, 'NIST CSF', 'gold', 'framework', NULL),
  ((SELECT id FROM folder_groups WHERE name = 'Methods & Frameworks'),
   NULL, 'ISO 27001', 'gold', 'framework', NULL);

-- ===== Feed Items (Critical + High + Info) =====

-- Critical Severity (CVSS >= 9.0 or KEV flagged)
INSERT INTO feed_items (source_id, external_id, severity, category, badge, title, excerpt, url, cvss, kev_flag, published_at, fetched_at, read, pinned) VALUES
  ((SELECT id FROM feed_sources WHERE name = 'JPCERT/CC'),
   'CVE-2025-1234', 'critical', 'vulnerability', 'CVE-2025-1234',
   '重大な脆弱性: Windows RCE 0-day 活発に利用',
   'Microsoft Windows の認証を回避され、リモートから任意コード実行される危険性。既に複数の攻撃が確認されています。',
   'https://www.jpcert.or.jp/alert/2025-05-01',
   9.8, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', false, true),

  ((SELECT id FROM feed_sources WHERE name = 'CISA'),
   'CVE-2025-5678', 'critical', 'vulnerability', 'CVE-2025-5678',
   'OpenSSL の暗号化プロトコル脆弱性 (CVSS 9.1)',
   'OpenSSL ライブラリにおける暗号化検証のバイパス。多くのシステムに影響。',
   'https://www.cisa.gov/news-events/alerts/2025-05-02',
   9.1, true, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', false, false);

-- High Severity (7.0-8.9 or Alert category)
INSERT INTO feed_items (source_id, external_id, severity, category, badge, title, excerpt, url, cvss, kev_flag, published_at, fetched_at, read, pinned) VALUES
  ((SELECT id FROM feed_sources WHERE name = 'IPA'),
   'JPVN-2025-001', 'high', 'alert', 'CVSS 8.2',
   'Apache Log4j に新たな脆弱性発見 (CVE-2025-9999)',
   '日本の組織でも多用されている Apache Log4j に重大な脆弱性。要確認・パッチ適用推奨。',
   'https://www.ipa.go.jp/security/2025-05-03',
   8.2, false, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', true, false),

  ((SELECT id FROM feed_sources WHERE name = 'NIST'),
   'CWE-XX', 'high', 'framework', 'NIST Guidance',
   'NIST CSF 2.0 Release - ゼロトラスト実装ガイドライン更新',
   '国立標準技術研究所（NIST）が 2025 年版サイバーセキュリティフレームワークをリリース。',
   'https://www.nist.gov/cyberframework/2025',
   7.5, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', false, false);

-- Info Severity (Guidelines, statistics, white papers)
INSERT INTO feed_items (source_id, external_id, severity, category, badge, title, excerpt, url, cvss, kev_flag, published_at, fetched_at, read, pinned) VALUES
  ((SELECT id FROM feed_sources WHERE name = 'ENISA'),
   NULL, 'info', 'framework', 'White Paper',
   '欧州における サイバー犯罪トレンド 2025 年版',
   'ENISA が発行した年次ホワイトペーパー。ランサムウェア・サプライチェーン攻撃の動向を分析。',
   'https://www.enisa.europa.eu/white-papers/2025',
   NULL, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', false, false),

  ((SELECT id FROM feed_sources WHERE name = 'Google TAG'),
   NULL, 'info', 'incident', 'Threat Report',
   '北朝鮮の APT グループ「Lazarus」による金融機関を狙った新型マルウェア分析',
   'Google Threat Analysis Group が検知した新種マルウェア。詳細な IOCs を公開。',
   'https://blog.google/threat-analysis-group/2025-05',
   NULL, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', true, false);

-- ===== Clips (Sample clips for Mizuho project) =====

INSERT INTO clips (folder_id, source, source_url, title, excerpt, body_md, captured_at, starred, read) VALUES
  ((SELECT id FROM folders WHERE name = 'Mizuho'),
   'jpcert', 'https://www.jpcert.or.jp/alert/2025-05-01',
   'Windows RCE 脆弱性への対応マニュアル',
   '金融機関向けの緊急対応ガイドライン。段階的な検証・パッチ適用プロセス。',
   '# Windows RCE 脆弱性対応ガイド\n\n## 影響範囲\n- Windows Server 2012 以降\n- KB5029439 未適用\n\n## 対応手順\n1. 現状調査\n2. パッチ適用\n3. 監視強化',
   NOW() - INTERVAL '2 days', true, false),

  ((SELECT id FROM folders WHERE name = 'Mizuho'),
   'manual', 'https://internal.example.com/wiki',
   'Mizuho DX 推進における セキュリティチェックリスト',
   'API 導入時・クラウド移行時の必須セキュリティ確認項目。',
   '# DX推進 セキュリティチェックリスト\n\n- [ ] API キーローテーション\n- [ ] WAF 設定\n- [ ] ログ監視',
   NOW() - INTERVAL '1 day', false, true);

-- ===== Highlights (Sample highlights) =====

INSERT INTO highlights (clip_id, text, color, note) VALUES
  ((SELECT id FROM clips LIMIT 1),
   'Windows Server 2012 以降', 'yellow', 'Mizuho でも対象サーバが複数存在'),
  ((SELECT id FROM clips LIMIT 1),
   'KB5029439 未適用', 'yellow', 'パッチ管理チームへ通知予定');

-- ===== Decks (Sample presentation) =====

INSERT INTO decks (project_id, title, template, status, slides_count) VALUES
  ((SELECT id FROM projects WHERE name = 'Mizuho Financial Group'),
   '2025年上期 セキュリティ脅威アセスメント', 'consulting', 'draft', 3);

-- ===== Deck Slides =====

INSERT INTO deck_slides (deck_id, idx, title, body_md, layout) VALUES
  ((SELECT id FROM decks LIMIT 1), 1, 'Executive Summary',
   '# 2025年上期 主要脅威\n\n- Windows RCE (CVSS 9.8)\n- ログ4j 脆弱性\n- サプライチェーン攻撃の高度化',
   'title'),
  ((SELECT id FROM decks LIMIT 1), 2, 'Critical 脆弱性への対応',
   '## 緊急対応が必要な脆弱性\n\n1. CVE-2025-1234 (Windows)\n2. CVE-2025-5678 (OpenSSL)\n\n**推奨**: 5月中に完全パッチ適用',
   'content'),
  ((SELECT id FROM decks LIMIT 1), 3, 'Next Steps',
   '## アクションアイテム\n\n- [ ] 脆弱性スキャン実施\n- [ ] パッチ適用スケジュール策定\n- [ ] 監視ルール追加',
   'content');

-- ===== Deck Clip References =====

INSERT INTO deck_clip_refs (deck_id, slide_id, clip_id, highlight_id) VALUES
  ((SELECT id FROM decks LIMIT 1),
   (SELECT id FROM deck_slides WHERE idx = 2 LIMIT 1),
   (SELECT id FROM clips LIMIT 1),
   (SELECT id FROM highlights LIMIT 1));

-- ===== Complete =====
-- このマイグレーションで、実装テストに必要なサンプルデータが全て挿入されます。
