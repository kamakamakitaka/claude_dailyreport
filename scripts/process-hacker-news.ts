import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface NewsArticle {
  date: string;
  title: string;
  summary: string;
  original_url: string;
  risk_level: '🔴' | '🟡' | '🟢';
  cve_id: string | null;
  cvss_score: number | null;
  detailed_analysis: string;
  security_analysis: string;
  it_infrastructure: string;
  business_impact: string;
  financial_impact: string;
  compliance_risk: string;
  geopolitical_context: string;
  recovery_info: string;
  incident_response: string;
  affected_industries: string[];
  compliance_types: string[];
  attack_type: string | null;
}

interface ParsedArticle {
  title: string;
  url: string;
  summary: string;
  date: string;
}

const client = new Anthropic();
const parser = new Parser();

async function getLatestHackerNewsArticles(): Promise<ParsedArticle[]> {
  try {
    console.log('📡 The Hacker News RSS フィードを取得中...');

    const feed = await parser.parseURL('https://feeds.thehackernews.com/feed');
    const articles: ParsedArticle[] = [];

    // 最新 10 件の記事を処理
    const items = feed.items.slice(0, 10);

    for (const item of items) {
      if (item.title && item.link) {
        articles.push({
          title: item.title,
          url: item.link,
          summary: item.contentSnippet || item.content || item.summary || '記事サマリー',
          date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
      }
    }

    console.log(`✅ ${articles.length} 件の記事を取得しました`);
    return articles;
  } catch (error) {
    console.error('❌ RSS フィード取得エラー:', error);
    console.log('⚠️ モックデータを使用します');
    return getMockArticles();
  }
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();

    // 簡単なテキスト抽出（HTML タグ削除）
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 5000);
  } catch (error) {
    console.error(`⚠️ URL fetch 失敗: ${url}`);
    return '';
  }
}

async function analyzeWithClaude(
  title: string,
  content: string
): Promise<{
  detailed_analysis: string;
  security_analysis: string;
  it_infrastructure: string;
  business_impact: string;
  financial_impact: string;
  compliance_risk: string;
  geopolitical_context: string;
  recovery_info: string;
  incident_response: string;
  risk_level: '🔴' | '🟡' | '🟢';
  cve_id: string | null;
  cvss_score: number | null;
  affected_industries: string[];
  compliance_types: string[];
  attack_type: string | null;
}> {
  const prompt = `You are a security consultant. Analyze this security news and return ONLY valid JSON (no markdown, no code blocks).

Title: ${title}
Content: ${content.slice(0, 2000)}

Return JSON with these fields (use \\n for newlines in multi-line values):
{
  "detailed_analysis": "Structured analysis with: ざっくり説明 / 何が起きたか / セキュリティリスク / ITインフラ対応 / 企業対応 / 用語説明",
  "security_analysis": "Security risks in 1-2 paragraphs",
  "it_infrastructure": "IT infrastructure recommendations in 1-2 paragraphs",
  "business_impact": "Business impact and estimated damages",
  "financial_impact": "Stock price and financial market impact",
  "compliance_risk": "GDPR, PCI-DSS, FISC compliance risks",
  "geopolitical_context": "Attack attribution and supply chain risks",
  "recovery_info": "Recovery time and business continuity impact",
  "incident_response": "Discovery method and organizational vulnerabilities",
  "risk_level": "🔴 or 🟡 or 🟢",
  "cve_id": "CVE ID or null",
  "cvss_score": "CVSS score (0-10) or null",
  "affected_industries": ["finance", "healthcare", etc],
  "compliance_types": ["GDPR", "PCI-DSS", etc],
  "attack_type": "RCE, Phishing, etc or null"
}`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const contentBlock = response.content[0];
    if (contentBlock.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let jsonText = contentBlock.text.trim();
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    jsonText = jsonText.trim();

    const lastBrace = jsonText.lastIndexOf('}');
    if (lastBrace > -1) {
      jsonText = jsonText.substring(0, lastBrace + 1);
    }

    const analysisData = JSON.parse(jsonText);
    return analysisData;
  } catch (error) {
    console.error('❌ Claude API エラー:', error);
    return {
      detailed_analysis: 'Analysis pending...',
      security_analysis: 'Risk assessment in progress',
      it_infrastructure: 'Infrastructure recommendations pending',
      business_impact: 'Business impact assessment pending',
      financial_impact: 'Financial impact assessment pending',
      compliance_risk: 'Compliance assessment pending',
      geopolitical_context: 'Geopolitical assessment pending',
      recovery_info: 'Recovery information pending',
      incident_response: 'Incident response assessment pending',
      risk_level: '🟡' as const,
      cve_id: null,
      cvss_score: null,
      affected_industries: [],
      compliance_types: [],
      attack_type: null,
    };
  }
}

async function saveToSupabase(article: NewsArticle): Promise<boolean> {
  try {
    const { error } = await supabase.from('news_articles').insert([
      {
        date: article.date,
        title: article.title,
        summary: article.summary,
        original_url: article.original_url,
        risk_level: article.risk_level,
        detailed_analysis: article.detailed_analysis,
        security_analysis: article.security_analysis,
        it_infrastructure: article.it_infrastructure,
        business_impact: article.business_impact,
        financial_impact: article.financial_impact,
        compliance_risk: article.compliance_risk,
        geopolitical_context: article.geopolitical_context,
        recovery_info: article.recovery_info,
        incident_response: article.incident_response,
        cve_id: article.cve_id,
        cvss_score: article.cvss_score,
        affected_industries: article.affected_industries,
        compliance_types: article.compliance_types,
        attack_type: article.attack_type,
      },
    ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase save error:', error);
    return false;
  }
}

function getMockArticles(): ParsedArticle[] {
  return [
    {
      title: 'MOVEit Critical Flaw Allows Remote Code Execution',
      url: 'https://thehackernews.com/2026/05/moveit-critical.html',
      summary: 'A critical security vulnerability in Progress MOVEit Transfer has been discovered.',
      date: new Date().toISOString().split('T')[0],
    },
  ];
}

async function processNews(): Promise<void> {
  try {
    console.log('🔄 セキュリティニュース処理を開始します\n');

    // RSS フィードから記事取得
    let parsedArticles = await getLatestHackerNewsArticles();

    // 記事が見つからない場合はモック使用
    if (parsedArticles.length === 0) {
      console.log('📰 モックデータを使用します\n');
      parsedArticles = getMockArticles();
    }

    console.log(`📰 ${parsedArticles.length} 件のニュースを処理します\n`);

    const articles: NewsArticle[] = [];

    for (let i = 0; i < parsedArticles.length; i++) {
      const item = parsedArticles[i];
      console.log(`📝 [${i + 1}/${parsedArticles.length}] ${item.title}`);

      try {
        // 記事内容を fetch
        const articleContent = await fetchArticleContent(item.url);

        // Claude で分析
        const analysis = await analyzeWithClaude(item.title, articleContent || item.summary);

        const article: NewsArticle = {
          date: item.date,
          title: item.title,
          summary: item.summary,
          original_url: item.url,
          risk_level: analysis.risk_level,
          cve_id: analysis.cve_id,
          cvss_score: analysis.cvss_score,
          detailed_analysis: analysis.detailed_analysis,
          security_analysis: analysis.security_analysis,
          it_infrastructure: analysis.it_infrastructure,
          business_impact: analysis.business_impact,
          financial_impact: analysis.financial_impact,
          compliance_risk: analysis.compliance_risk,
          geopolitical_context: analysis.geopolitical_context,
          recovery_info: analysis.recovery_info,
          incident_response: analysis.incident_response,
          affected_industries: analysis.affected_industries,
          compliance_types: analysis.compliance_types,
          attack_type: analysis.attack_type,
        };

        articles.push(article);
        console.log(`✅ ${analysis.risk_level} リスク評価完了`);

        // Supabase に保存を試みる
        const saved = await saveToSupabase(article);
        if (saved) {
          console.log(`💾 Supabase に保存しました`);
        } else {
          console.warn(`⚠️ Supabase への保存に失敗（ローカルには保存）`);
        }

        // レート制限対策
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ 分析失敗: ${item.title}`, error);
        continue;
      }
    }

    // JSON ファイルを保存
    const outputDir = path.join(process.cwd(), 'scripts', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `articles-${today}.json`);

    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');

    console.log('\n✨ 処理完了！');
    console.log(`📁 保存先: ${outputPath}`);
    console.log(`📊 処理件数: ${articles.length} 件`);
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

processNews();
