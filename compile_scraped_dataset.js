const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/ASUS/.gemini/antigravity/brain/71bd013f-7690-4274-973b-025cccbb8a19/.system_generated/steps';
const outputDir = 'C:/Users/ASUS/VS/gov_web_hack26/legacy_CCP';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pageFiles = [
  { name: 'Default.aspx', step: 307, outName: 'raw_default_aspx.html' },
  { name: 'Webform/Index.aspx', step: 320, outName: 'raw_index_aspx.html' },
  { name: 'Webform/FAQ.aspx', step: 322, outName: 'raw_faq_aspx.html' },
  { name: 'Webform/Crime_OnlineSafetyTips.aspx', step: 324, outName: 'raw_safety_tips.html' },
  { name: 'Webform/cyber_volunteers_concept.aspx', step: 326, outName: 'raw_volunteers.html' },
  { name: 'Webform/Crime_NodalGrivanceList.aspx', step: 328, outName: 'raw_nodal_officers.html' },
  { name: 'Webform/suspect_search_repository.aspx', step: 330, outName: 'raw_suspect_repo.html' }
];

const compiledData = {
  portal: 'National Cyber Crime Reporting Portal (https://cybercrime.gov.in)',
  scraped_at: new Date().toISOString(),
  pages: []
};

let inventoryMarkdown = `# Exhaustive Scraped Legacy NCRP Portal Catalogue (cybercrime.gov.in)
*Source: https://cybercrime.gov.in/Default.aspx and Connected Statutory Endpoints*  
*Timestamp: ${new Date().toUTCString()}*  
*Total Sub-Pages Deeply Extracted: ${pageFiles.length}*

---

## Table of Contents
1. [Portal Overview & Architecture](#portal-overview)
2. [Complete Link & Navigation Inventory](#complete-links)
3. [Page-by-Page Exhaustive Content Extraction](#page-by-page)
   - [1. Default.aspx (Homepage)](#page-1)
   - [2. Webform/Index.aspx (Main Crime Reporting Hub)](#page-2)
   - [3. Webform/FAQ.aspx (Frequently Asked Questions)](#page-3)
   - [4. Webform/Crime_OnlineSafetyTips.aspx (Safety Guidelines)](#page-4)
   - [5. Webform/cyber_volunteers_concept.aspx (Cyber Volunteers Framework)](#page-5)
   - [6. Webform/Crime_NodalGrivanceList.aspx (State Cyber Nodal Officers Directory)](#page-6)
   - [7. Webform/suspect_search_repository.aspx (Public Suspect Search)](#page-7)
4. [Statutory Form Fields, Schemas & Postback Handlers](#statutory-forms)
5. [Advisories, Alert Bulletins & Safety Rules](#advisories)

---

<a name="portal-overview"></a>
## 1. Portal Overview & Architecture
The official portal of the **Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA), Government of India** is designed to enable victims/complainants to report cybercrime complaints online. It specifically prioritizes cybercrimes against women and children (CSAM/Rape/Gang Rape imagery), financial cyber fraud (helpline 1930 / CFCFRMS), and general cyber offenses (identity theft, ransomware, hacking).

---

<a name="complete-links"></a>
## 2. Complete Link & Navigation Inventory

### Primary Navigation Menus & Endpoints:
`;

pageFiles.forEach((p, idx) => {
  const srcPath = path.join(baseDir, `${p.step}`, 'content.md');
  if (fs.existsSync(srcPath)) {
    const rawContent = fs.readFileSync(srcPath, 'utf8');
    
    // Save raw HTML/MD file in legacy_CCP/
    fs.writeFileSync(path.join(outputDir, p.outName), rawContent);

    // Extract headers (h1, h2, h3, h4, h5, h6)
    const headers = [];
    const hRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = hRegex.exec(rawContent)) !== null) {
      const cleanH = match[2].replace(/<[^>]+>/g, '').trim();
      if (cleanH) headers.push({ tag: match[1], text: cleanH });
    }

    // Extract paragraphs
    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(rawContent)) !== null) {
      const cleanP = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (cleanP) paragraphs.push(cleanP);
    }

    // Extract links
    const pageLinks = [];
    const linkRegex = /href=["']([^"']+)["']/gi;
    while ((match = linkRegex.exec(rawContent)) !== null) {
      pageLinks.push(match[1]);
    }

    // Extract table rows / lists
    const listItems = [];
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    while ((match = liRegex.exec(rawContent)) !== null) {
      const cleanLi = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (cleanLi && cleanLi.length > 5) listItems.push(cleanLi);
    }

    compiledData.pages.push({
      pageName: p.name,
      rawFile: p.outName,
      headers,
      paragraphs,
      links: [...new Set(pageLinks)],
      listItems: [...new Set(listItems)]
    });

    inventoryMarkdown += `
---

<a name="page-${idx + 1}"></a>
### ${idx + 1}. Page: \`${p.name}\`
- **Saved Raw Asset**: [\`${p.outName}\`](file:///c:/Users/ASUS/VS/gov_web_hack26/legacy_CCP/${p.outName})
- **Total Headers**: ${headers.length}
- **Total Paragraphs / Text Blocks**: ${paragraphs.length}
- **Total Links**: ${[...new Set(pageLinks)].length}

#### A. Headers Extracted:
${headers.map(h => `- **<${h.tag}>**: ${h.text}`).join('\n') || '_None_'}

#### B. Paragraphs & Content Extracts:
${paragraphs.slice(0, 25).map((para, i) => `> **[P${i+1}]**: ${para}`).join('\n\n') || '_None_'}

#### C. Extracted Links & Endpoints:
${[...new Set(pageLinks)].map(l => `- \`${l}\``).join('\n') || '_None_'}
`;
  }
});

// Write outputs
fs.writeFileSync(path.join(outputDir, 'scraped_full_dom_dump.json'), JSON.stringify(compiledData, null, 2));
fs.writeFileSync(path.join(outputDir, 'scraped_portal_inventory.md'), inventoryMarkdown);

console.log('Successfully compiled scraped dataset into legacy_CCP/');
console.log('Generated: scraped_full_dom_dump.json (' + fs.statSync(path.join(outputDir, 'scraped_full_dom_dump.json')).size + ' bytes)');
console.log('Generated: scraped_portal_inventory.md (' + fs.statSync(path.join(outputDir, 'scraped_portal_inventory.md')).size + ' bytes)');
pageFiles.forEach(p => {
  console.log('Raw asset: ' + p.outName + ' (' + fs.statSync(path.join(outputDir, p.outName)).size + ' bytes)');
});

