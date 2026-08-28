const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_ORIGIN = 'https://cybercrime.gov.in';
const OUTPUT_DIR = path.join(__dirname, 'legacy_CCP');
const RAW_PAGES_DIR = path.join(OUTPUT_DIR, 'raw_pages');

if (!fs.existsSync(RAW_PAGES_DIR)) {
  fs.mkdirSync(RAW_PAGES_DIR, { recursive: true });
}

// Complete Canonical List of all pages and subpages on cybercrime.gov.in
const canonicalSeedUrls = [
  'https://cybercrime.gov.in/Default.aspx',
  'https://cybercrime.gov.in/Hindi/Defaulthn.aspx',
  'https://cybercrime.gov.in/Webform/Index.aspx',
  'https://cybercrime.gov.in/Webform/suspect_search_repository.aspx',
  'https://cybercrime.gov.in/Webform/suspect_search_websites.aspx',
  'https://cybercrime.gov.in/Webform/cyber_suspect.aspx',
  'https://cybercrime.gov.in/Webform/report_abuse_social_media.aspx',
  'https://cybercrime.gov.in/Webform/cyber_volunteers_concept.aspx',
  'https://cybercrime.gov.in/Webform/cyber_volunteers_TnC.aspx',
  'https://cybercrime.gov.in/Webform/CyberVolunteerinstruction.aspx',
  'https://cybercrime.gov.in/Webform/about_unlawful_content.aspx',
  'https://cybercrime.gov.in/Webform/crmcondivol.aspx?vol=1',
  'https://cybercrime.gov.in/Webform/Volunteer_Register.aspx',
  'https://cybercrime.gov.in/Webform/FAQ.aspx',
  'https://cybercrime.gov.in/Webform/Advisory.aspx',
  'https://cybercrime.gov.in/Webform/Crime_OnlineSafetyTips.aspx',
  'https://cybercrime.gov.in/Webform/CyberAware.aspx',
  'https://cybercrime.gov.in/Webform/photoGallery.aspx',
  'https://cybercrime.gov.in/Webform/video-category.aspx',
  'https://cybercrime.gov.in/Webform/radioGallery.aspx',
  'https://cybercrime.gov.in/Webform/daily-digest.aspx',
  'https://cybercrime.gov.in/Webform/training-resource.aspx',
  'https://cybercrime.gov.in/Webform/Crime_NodalGrivanceList.aspx',
  'https://cybercrime.gov.in/Webform/Citizen_Manual.aspx',
  'https://cybercrime.gov.in/Webform/Crime_Feedback.aspx',
  'https://cybercrime.gov.in/Webform/Wbsitepolice.aspx',
  'https://cybercrime.gov.in/Webform/privacy_policy.aspx',
  'https://cybercrime.gov.in/Webform/Disclaimer.aspx',
  'https://cybercrime.gov.in/Webform/Acceptance.aspx',
  'https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx',
  'https://cybercrime.gov.in/Webform/HelpDesk.aspx',
  'https://cybercrime.gov.in/Webform/SOP.aspx',
  'https://cybercrime.gov.in/Webform/CitizenCharter.aspx',
  'https://cybercrime.gov.in/Webform/SiteMap.aspx',
  'https://cybercrime.gov.in/Webform/ContactUs.aspx',
  'https://cybercrime.gov.in/Webform/Crime_TrackComplaint.aspx',
  'https://cybercrime.gov.in/Webform/Terms_Condition.aspx',
  'https://cybercrime.gov.in/Webform/Hyperlink_Policy.aspx',
  'https://cybercrime.gov.in/Webform/Copyright_Policy.aspx',
  'https://cybercrime.gov.in/UploadMedia/index.html'
];

function normalizeToCanonical(urlStr) {
  try {
    const u = new URL(urlStr);
    if (!u.origin.includes('cybercrime.gov.in')) return null;

    let p = u.pathname;
    // Exclude assets / css / scripts / media
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|mp4|mp3|zip|docx|xlsx)$/i.test(p)) {
      return null;
    }
    if (p.includes('/assets/') || p.includes('/css/') || p.includes('/theme/') || p.includes('/js/')) {
      return null;
    }

    // Fix duplicate segments
    while (p.includes('/Webform/Webform/')) p = p.replace('/Webform/Webform/', '/Webform/');
    while (p.includes('/Hindi/Webform/')) p = p.replace('/Hindi/Webform/', '/Webform/');
    while (p.includes('/Webform/Hindi/')) p = p.replace('/Webform/Hindi/', '/Hindi/');

    u.pathname = p;
    u.hash = '';
    return u.href;
  } catch (e) {
    return null;
  }
}

const queue = [...new Set(canonicalSeedUrls.map(normalizeToCanonical).filter(Boolean))];
const visited = new Set();
const crawledPages = [];
const allExtractedLinks = new Set();

function fetchUrl(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const reqModule = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = reqModule.get(targetUrl, { 
        rejectUnauthorized: false, 
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8'
        }
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = normalizeToCanonical(new URL(res.headers.location, targetUrl).href);
          if (redirectUrl && !visited.has(redirectUrl)) {
            return resolve(fetchUrl(redirectUrl));
          }
        }

        if (res.statusCode !== 200) {
          return resolve({ success: false, statusCode: res.statusCode, url: targetUrl });
        }

        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ success: true, statusCode: 200, body, url: targetUrl }));
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message, url: targetUrl });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'TIMEOUT', url: targetUrl });
      });
    } catch (e) {
      resolve({ success: false, error: e.message, url: targetUrl });
    }
  });
}

function parsePageContent(html, pageUrl) {
  const result = {
    url: pageUrl,
    title: '',
    metaDescription: '',
    headers: [],
    paragraphs: [],
    listItems: [],
    tables: [],
    forms: [],
    buttons: [],
    images: [],
    links: []
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) result.title = titleMatch[1].replace(/\s+/g, ' ').trim();

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (metaDescMatch) result.metaDescription = metaDescMatch[1].trim();

  // Headers (h1 to h6)
  const hRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = hRegex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) result.headers.push({ level: match[1].toLowerCase(), text });
  }

  // Paragraphs (<p>)
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((match = pRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text && text.length > 3) result.paragraphs.push(text);
  }

  // List items (<li>)
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((match = liRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text && text.length > 5) result.listItems.push(text);
  }

  // Tables
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  while ((match = tableRegex.exec(html)) !== null) {
    const rows = [];
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(match[1])) !== null) {
      const cells = [];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(trMatch[1])) !== null) {
        const cellText = cellMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        cells.push(cellText);
      }
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length > 0) result.tables.push(rows);
  }

  // Form Inputs & Controls
  const inputRegex = /<input[^>]*>/gi;
  while ((match = inputRegex.exec(html)) !== null) {
    const tag = match[0];
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const typeMatch = tag.match(/type=["']([^"']+)["']/i);
    const valueMatch = tag.match(/value=["']([^"']*)["']/i);
    const idMatch = tag.match(/id=["']([^"']+)["']/i);
    result.forms.push({
      type: typeMatch ? typeMatch[1] : 'text',
      name: nameMatch ? nameMatch[1] : null,
      id: idMatch ? idMatch[1] : null,
      value: valueMatch ? valueMatch[1] : ''
    });
  }

  // Buttons
  const btnRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = btnRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (text) result.buttons.push(text);
  }

  // Images
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
    result.images.push({
      src,
      alt: altMatch ? altMatch[1] : ''
    });
  }

  // Links & Discovery
  const linkRegex = /href=["']([^"']+)["']/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    const rawHref = match[1].trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) continue;

    try {
      const canonical = normalizeToCanonical(new URL(rawHref, pageUrl).href);
      if (canonical) {
        result.links.push(canonical);
        allExtractedLinks.add(canonical);

        if (canonical.startsWith(BASE_ORIGIN) && !visited.has(canonical) && !queue.includes(canonical)) {
          queue.push(canonical);
        }
      }
    } catch (e) {}
  }

  result.links = [...new Set(result.links)];
  result.listItems = [...new Set(result.listItems)];
  return result;
}

function sanitizeFileName(urlStr) {
  try {
    const p = new URL(urlStr).pathname;
    let name = p.replace(/^\//, '').replace(/\//g, '__').replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    if (!name || name === '') name = 'Default.aspx';
    if (!name.endsWith('.html') && !name.endsWith('.aspx')) name += '.html';
    return name.replace('.aspx', '.html');
  } catch (e) {
    return 'page_' + Date.now() + '.html';
  }
}

async function startCrawler() {
  console.log('====================================================');
  console.log('  STARTING DEEP CANONICAL CRAWLER FOR CYBERCRIME.GOV.IN');
  console.log(`  Initial Seed Queue: ${queue.length} pages`);
  console.log('====================================================');

  let crawledCount = 0;

  while (queue.length > 0) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;

    visited.add(currentUrl);
    crawledCount++;
    console.log(`[${crawledCount}/${crawledCount + queue.length}] Fetching: ${currentUrl}`);

    const res = await fetchUrl(currentUrl);
    if (!res.success || !res.body) {
      console.log(`   └─ Status: ${res.statusCode || res.error}`);
      continue;
    }

    const fileName = sanitizeFileName(currentUrl);
    const rawFilePath = path.join(RAW_PAGES_DIR, fileName);
    fs.writeFileSync(rawFilePath, res.body);

    const parsed = parsePageContent(res.body, currentUrl);
    parsed.rawFileName = fileName;
    parsed.bodySizeBytes = Buffer.byteLength(res.body, 'utf8');
    crawledPages.push(parsed);

    console.log(`   └─ Scraped: ${parsed.title || 'Untitled'} | Headers: ${parsed.headers.length} | Paras: ${parsed.paragraphs.length} | Tables: ${parsed.tables.length} | Size: ${(parsed.bodySizeBytes / 1024).toFixed(1)} KB`);

    await new Promise(r => setTimeout(r, 80));
  }

  console.log('====================================================');
  console.log(`Crawling Completed! Total Unique Pages Scraped: ${crawledPages.length}`);
  console.log('====================================================');

  // 1. Save Full Master JSON Dump
  const masterJsonPath = path.join(OUTPUT_DIR, 'MASTER_SCRAPED_ALL_PAGES.json');
  fs.writeFileSync(masterJsonPath, JSON.stringify({
    portal: 'National Cyber Crime Reporting Portal (https://cybercrime.gov.in)',
    crawled_timestamp: new Date().toISOString(),
    total_pages_scraped: crawledPages.length,
    total_unique_links_discovered: allExtractedLinks.size,
    pages: crawledPages
  }, null, 2));

  // 2. Generate Master Comprehensive Markdown Inventory
  let mdContent = `# MASTER EXHAUSTIVE SCRAPED REPOSITORY: CYBERCRIME.GOV.IN
**Complete Crawl Archive of All Pages, Subpages, Forms, Headers, Tables & Content**
*Source: https://cybercrime.gov.in/*  
*Crawl Date: ${new Date().toUTCString()}*  
*Total Sub-Pages Deeply Extracted: ${crawledPages.length}*  
*Total Unique Links Discovered: ${allExtractedLinks.size}*

---

## 1. Executive Summary & Complete Site Sitemap

| # | Page Name / Endpoint | Title | Headers | Paragraphs | Tables | Raw Scraped File |
|---|---|---|---|---|---|---|
`;

  crawledPages.forEach((p, idx) => {
    mdContent += `| ${idx + 1} | \`${p.url.replace(BASE_ORIGIN, '') || '/'}\` | ${p.title.slice(0, 45) || 'Untitled'} | ${p.headers.length} | ${p.paragraphs.length} | ${p.tables.length} | [\`${p.rawFileName}\`](file:///c:/Users/ASUS/VS/gov_web_hack26/legacy_CCP/raw_pages/${p.rawFileName}) |\n`;
  });

  mdContent += `\n---\n\n## 2. Page-by-Page Deep Content & Structural Catalogue\n\n`;

  crawledPages.forEach((p, idx) => {
    mdContent += `### ${idx + 1}. Page: \`${p.url}\`
- **Title**: ${p.title}
- **Raw Local File**: [\`raw_pages/${p.rawFileName}\`](file:///c:/Users/ASUS/VS/gov_web_hack26/legacy_CCP/raw_pages/${p.rawFileName}) (${(p.bodySizeBytes / 1024).toFixed(1)} KB)
- **Meta Description**: ${p.metaDescription || '_None_'}

#### A. Extracted Headers (${p.headers.length}):
${p.headers.map(h => `- **<${h.level}>**: ${h.text}`).join('\n') || '_None_'}

#### B. Text & Paragraph Extracts (${p.paragraphs.length}):
${p.paragraphs.map((para, pIdx) => `> **[§${pIdx + 1}]**: ${para}`).join('\n\n') || '_None_'}

#### C. List Items & Instructions (${p.listItems.length}):
${p.listItems.slice(0, 30).map(li => `- ${li}`).join('\n') || '_None_'}

#### D. Form Inputs & Interactive Controls (${p.forms.length}):
${p.forms.slice(0, 20).map(f => `- **Input [type=${f.type}]**: \`${f.name || f.id || 'unnamed'}\` (Value: "${f.value}")`).join('\n') || '_No interactive forms on this page_'}

#### E. Data Tables (${p.tables.length}):
${p.tables.map((t, tIdx) => `
**Table ${tIdx + 1} (${t.length} rows):**
${t.slice(0, 10).map(row => `| ${row.join(' | ')} |`).join('\n')}
`).join('\n') || '_No data tables on this page_'}

#### F. Outbound & Cross-Referenced Links (${p.links.length}):
${p.links.slice(0, 25).map(l => `- \`${l}\``).join('\n')}

---\n\n`;
  });

  // Write Master Inventory MD
  const masterMdPath = path.join(OUTPUT_DIR, 'MASTER_SCRAPED_INVENTORY.md');
  fs.writeFileSync(masterMdPath, mdContent);

  // Write Crawl Manifest
  const manifestPath = path.join(OUTPUT_DIR, 'CRAWL_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    totalPagesCrawled: crawledPages.length,
    totalDiscoveredLinks: allExtractedLinks.size,
    timestamp: new Date().toISOString(),
    filesGenerated: [
      'MASTER_SCRAPED_ALL_PAGES.json',
      'MASTER_SCRAPED_INVENTORY.md',
      'raw_pages/*.html'
    ]
  }, null, 2));

  console.log(`Saved MASTER_SCRAPED_ALL_PAGES.json (${fs.statSync(masterJsonPath).size} bytes)`);
  console.log(`Saved MASTER_SCRAPED_INVENTORY.md (${fs.statSync(masterMdPath).size} bytes)`);
  console.log(`Saved CRAWL_MANIFEST.json (${fs.statSync(manifestPath).size} bytes)`);
}

startCrawler().catch(console.error);

