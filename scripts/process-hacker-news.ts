import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import * as cheerio from 'cheerio';
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

async function initGmailClient() {
  const email = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL;
  const keyBase64 = process.env.GMAIL_SERVICE_ACCOUNT_KEY_BASE64;

  if (!email || !keyBase64) {
    throw new Error('Gmail credentials not found in environment variables');
  }

  const keyJson = JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials: keyJson,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  return google.gmail({ version: 'v1', auth });
}

async function getLatestHackerNewsEmail(): Promise<ParsedArticle[]> {
  try {
    console.log('📧 Gmail API から最新メール取得中...');
    const gmail = await initGmailClient();

    const result = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:thehackernews@thehackernews.com',
      maxResults: 1,
    });

    const messages = result.data.messages;
    if (!messages || messages.length === 0) {
      console.warn('⚠️  The Hacker News メールが見つかりません');
      return [];
    }

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messages[0].id!,
    });

    const payload = message.data.payload;
    let htmlBody = '';

    if (payload?.parts) {
      const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
      if (htmlPart?.body?.data) {
        htmlBody = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
      }
    } else if (payload?.body?.data) {
      htmlBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    const articles = parseEmailBody(htmlBody);
    console.log(`✅ ${articles.length} 件の記事を抽出しました`);
    return articles;
  } catch (error) {
    console.error('❌ Gmail API エラー:', error);
    console.log('⚠️ モックデータを使用します');
    return getMockArticles();
  }
}

function parseEmailBody(htmlBody: string): ParsedArticle[] {
  if (!htmlBody) return [];

  const $ = cheerio.load(htmlBody);
  const articles: ParsedArticle[] = [];

  // The Hacker News メール形式の記事リンク抽出
  // 通常は <a href="..."> タグで thehackernews.com リンク
  $('a[href*="thehackernews.com"]').each((i, elem) => {
    const url = $(elem).attr('href');
    const title = $(elem).text().trim();

    // URL が有効で、重複でない場合のみ追加
    if (url && title && !articles.some((a) => a.url === url)) {
      const summary = extractSummaryFromContext($, elem);
      articles.push({
        title,
        url,
        summary,
        date: new Date().toISOString().split('T')[0],
      });
    }
  });

  return articles;
}

function extractSummaryFromContext($: any, elem: cheerio.Element): string {
  // リンク直後のテキストをサマリーとして取得
  let summary = '';
  let nextElem = elem.next;

  while (nextElem && summary.length < 200) {
    const text = $(nextElem).text().trim();
    if (text && text.length > 5) {
      summary += text + ' ';
    }
    nextElem = nextElem.next;
  }

  return summary.slice(0, 300).trim() || '記事サマリー';
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
    const $ = cheerio.load(html);

    // 記事本文を抽出（複数のセレクタを試す）
    let articleText = '';
    const selectors = ['article', '[role="main"]', '.post-content', 'main', '.article-body', '.entry-content'];

    for (const selector of selectors) {
      const elem = $(selector);
      if (elem.length > 0) {
        articleText = elem.text();
        break;
      }
    }

    if (!articleText) {
      // フォールバック：body 全体から本文を抽出
      articleText = $('body').text();
    }

    return articleText.slice(0, 5000).trim();
  } catch (error) {
    console.error(`⚠️  URL fetch 失敗: ${url}`, error);
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
    {
      title: 'Weaver E-cology RCE Flaw CVE-2026-22679 Actively Exploited',
      url: 'https://thehackernews.com/2026/05/weaver-ecology-cve.html',
      summary: 'A critical security vulnerability in Weaver E-cology has come under active exploitation.',
      date: new Date().toISOString().split('T')[0],
    },
  ];
}

async function processNews(): Promise<void> {
  try {
    console.log('🔄 セキュリティニュース処理を開始します\n');

    // Gmail から記事取得
    let parsedArticles = await getLatestHackerNewsEmail();

    // メールが空の場合はモック使用
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
        const analysis = await analyzeWithClaude(item.title, articleContent);

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

        // Supabase に保存
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
