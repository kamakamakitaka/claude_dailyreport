import { NextResponse } from 'next/server';

// モックデータ（Claude で分析済み）
const MOCK_ARTICLES = [
  {
    id: 1,
    date: '2026-05-05',
    title: 'MOVEit Critical Flaw Allows Remote Code Execution',
    summary: 'A critical security vulnerability in Progress MOVEit Transfer has been discovered.',
    original_url: 'https://thehackernews.com/moveit-critical',
    risk_level: '🟡',
    cve_id: null,
    cvss_score: null,
    detailed_analysis: 'Analysis pending...',
    security_analysis: 'Risk assessment in progress',
    it_infrastructure: 'Infrastructure recommendations pending',
    business_impact: 'Business impact assessment pending',
    financial_impact: 'Financial impact assessment pending',
    compliance_risk: 'Compliance assessment pending',
    geopolitical_context: 'Geopolitical assessment pending',
    recovery_info: 'Recovery information pending',
    incident_response: 'Incident response assessment pending',
    affected_industries: [],
    compliance_types: [],
    attack_type: null,
  },
  {
    id: 2,
    date: '2026-05-04',
    title: 'Weaver E-cology RCE Flaw CVE-2026-22679 Actively Exploited',
    summary: 'A critical security vulnerability in Weaver E-cology has come under active exploitation.',
    original_url: 'https://thehackernews.com/weaver-cve',
    risk_level: '🟡',
    cve_id: 'CVE-2026-22679',
    cvss_score: 9.8,
    detailed_analysis: 'Analysis pending...',
    security_analysis: 'Risk assessment in progress',
    it_infrastructure: 'Infrastructure recommendations pending',
    business_impact: 'Business impact assessment pending',
    financial_impact: 'Financial impact assessment pending',
    compliance_risk: 'Compliance assessment pending',
    geopolitical_context: 'Geopolitical assessment pending',
    recovery_info: 'Recovery information pending',
    incident_response: 'Incident response assessment pending',
    affected_industries: [],
    compliance_types: [],
    attack_type: 'RCE',
  },
  {
    id: 3,
    date: '2026-05-03',
    title: 'ScarCruft Hacks Gaming Platform to Deploy BirdCall Malware',
    summary: 'North Korea-aligned hacking group ScarCruft has compromised a gaming platform.',
    original_url: 'https://thehackernews.com/scarcruft-gaming',
    risk_level: '🔴',
    cve_id: null,
    cvss_score: null,
    detailed_analysis: 'Analysis pending...',
    security_analysis: 'Risk assessment in progress',
    it_infrastructure: 'Infrastructure recommendations pending',
    business_impact: 'Business impact assessment pending',
    financial_impact: 'Financial impact assessment pending',
    compliance_risk: 'Compliance assessment pending',
    geopolitical_context: 'Geopolitical assessment pending',
    recovery_info: 'Recovery information pending',
    incident_response: 'Incident response assessment pending',
    affected_industries: [],
    compliance_types: [],
    attack_type: 'Malware',
  },
  {
    id: 4,
    date: '2026-05-02',
    title: 'Microsoft Details Phishing Campaign Targeting 35,000 Users',
    summary: 'Microsoft disclosed a large-scale credential theft campaign.',
    original_url: 'https://thehackernews.com/microsoft-phishing',
    risk_level: '🔴',
    cve_id: null,
    cvss_score: null,
    detailed_analysis: 'Analysis pending...',
    security_analysis: 'Risk assessment in progress',
    it_infrastructure: 'Infrastructure recommendations pending',
    business_impact: 'Business impact assessment pending',
    financial_impact: 'Financial impact assessment pending',
    compliance_risk: 'Compliance assessment pending',
    geopolitical_context: 'Geopolitical assessment pending',
    recovery_info: 'Recovery information pending',
    incident_response: 'Incident response assessment pending',
    affected_industries: [],
    compliance_types: [],
    attack_type: 'Phishing',
  },
  {
    id: 5,
    date: '2026-05-01',
    title: 'MetInfo CMS CVE-2026-29014 Exploited for Remote Code Execution',
    summary: 'Threat actors are actively exploiting a critical security flaw in MetInfo CMS.',
    original_url: 'https://thehackernews.com/metinfo-cve',
    risk_level: '🟡',
    cve_id: 'CVE-2026-29014',
    cvss_score: null,
    detailed_analysis: 'Analysis pending...',
    security_analysis: 'Risk assessment in progress',
    it_infrastructure: 'Infrastructure recommendations pending',
    business_impact: 'Business impact assessment pending',
    financial_impact: 'Financial impact assessment pending',
    compliance_risk: 'Compliance assessment pending',
    geopolitical_context: 'Geopolitical assessment pending',
    recovery_info: 'Recovery information pending',
    incident_response: 'Incident response assessment pending',
    affected_industries: [],
    compliance_types: [],
    attack_type: 'RCE',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const riskLevel = url.searchParams.get('risk_level');
    const attackType = url.searchParams.get('attack_type');
    const search = url.searchParams.get('search');

    let articles = [...MOCK_ARTICLES];

    // フィルタリング
    if (riskLevel) {
      articles = articles.filter((a) => a.risk_level === riskLevel);
    }

    if (attackType) {
      articles = articles.filter((a) => a.attack_type === attackType);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.summary.toLowerCase().includes(searchLower) ||
          a.cve_id?.toLowerCase().includes(searchLower)
      );
    }

    // 日付で降順ソート
    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news articles' }, { status: 500 });
  }
}

export { MOCK_ARTICLES };
