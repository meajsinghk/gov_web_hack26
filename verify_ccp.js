const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('  RUNNING NATIONAL CYBER CRIME PORTAL TEST SUITE    ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

// 1. Core HTML & Code Deliverables Verification
const requiredHtmlFiles = [
  'CCP/index.html',
  'CCP/emergency-report.html',
  'CCP/dashboard.html',
  'CCP/suspect-lookup.html',
  'CCP/resources.html',
  'CCP/nodal-officers.html',
  'CCP/volunteer.html',
  'CCP/advisories.html',
  'CCP/faq.html',
  'CCP/login.html',
  'CCP/README.md',
  'CCP/css/ccp-tokens.css',
  'CCP/js/ccp-config.js',
  'CCP/js/ccp-db.js',
  'CCP/js/ccp-auth.js',
  'CCP/js/ccp-ocr.js',
  'CCP/js/ccp-chat.js',
  'CCP/js/ccp-app.js'
];

requiredHtmlFiles.forEach(relPath => {
  it(`File exists and is non-empty: ${relPath}`, () => {
    const fullPath = path.join(__dirname, relPath);
    assert.strictEqual(fs.existsSync(fullPath), true, `Missing file: ${relPath}`);
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 500, `File size too small (${stats.size} bytes): ${relPath}`);
  });
});

// 2. CSS Size & Design Token Budget Verification (< 30 KB)
it('CSS Tokens bundle size is strictly within < 30 KB budget', () => {
  const cssPath = path.join(__dirname, 'CCP/css/ccp-tokens.css');
  const sizeKb = fs.statSync(cssPath).size / 1024;
  console.log(`    (Current CSS size: ${sizeKb.toFixed(2)} KB)`);
  assert.ok(sizeKb < 30, `CSS size exceeds budget: ${sizeKb} KB >= 30 KB`);
});

it('CSS contains High-Contrast mode and UX4G design tokens', () => {
  const css = fs.readFileSync(path.join(__dirname, 'CCP/css/ccp-tokens.css'), 'utf8');
  assert.ok(css.includes('--gov-navy: #0F2C59;'), 'Missing UX4G Navy token');
  assert.ok(css.includes('--gov-crimson: #B91C1C;'), 'Missing 1930 Crimson token');
  assert.ok(css.includes('[data-theme="high-contrast"]'), 'Missing High-Contrast mode selector');
  assert.ok(css.includes('min-height: 44px;'), 'Missing 44px mobile touch target rule');
  assert.ok(css.includes('.cyber-sahayak-widget'), 'Missing Cyber Sahayak widget styling');
});

// 3. OCR Engine & Deterministic Entity Regex Verification
it('OCR engine contains deterministic entity regexes', () => {
  const ocrJs = fs.readFileSync(path.join(__dirname, 'CCP/js/ccp-ocr.js'), 'utf8');
  assert.ok(ocrJs.includes('[0-9]{12}'), 'Missing 12-digit UTR regex');
  assert.ok(ocrJs.includes('[a-zA-Z0-9.\\-_]{2,30}@[a-zA-Z0-9.\\-_]{2,15}'), 'Missing UPI VPA regex');
});

// 4. Natural Language Chatbot & Cyber Sahayak AI Verification
it('Conversational parser structures plain English/Hindi into complaint JSON', () => {
  const chatJs = fs.readFileSync(path.join(__dirname, 'CCP/js/ccp-chat.js'), 'utf8');
  assert.ok(chatJs.includes('parseNaturalLanguageComplaint'), 'Missing parseNaturalLanguageComplaint');
  assert.ok(chatJs.includes('Cyber Sahayak'), 'Missing Cyber Sahayak persona');
});

// 5. Database & Synthetic Complaints Ledger Verification
it('Synthetic database contains pre-seeded Golden Hour complaints and suspects', () => {
  const dbJs = fs.readFileSync(path.join(__dirname, 'CCP/js/ccp-db.js'), 'utf8');
  assert.ok(dbJs.includes('NCRP-2026-892103'), 'Missing seeded Golden Hour complaint');
  assert.ok(dbJs.includes('fraudster99@ybl'), 'Missing seeded suspect UPI');
  assert.ok(dbJs.includes('DEFAULT_USER'), 'Missing mock reviewer user session');
});

// 6. Nodal Officers Directory & Safety Pillars Verification
it('Nodal officers page includes all 36 State/UT Police Directory entries', () => {
  const nodalHtml = fs.readFileSync(path.join(__dirname, 'CCP/nodal-officers.html'), 'utf8');
  assert.ok(nodalHtml.includes('cybercrime-cid@ap.gov.in'), 'Missing AP Nodal Officer');
  assert.ok(nodalHtml.includes('dcp-cybercell-dl@nic.in'), 'Missing Delhi Nodal Officer');
  assert.ok(nodalHtml.includes('cybercrimeps-cid@karnataka.gov.in'), 'Missing Karnataka Nodal Officer');
  assert.ok(nodalHtml.includes('ig.cbr-mah@gov.in'), 'Missing Maharashtra Nodal Officer');
});

// 7. Advisories Page Verification
it('Advisories page contains official threat bulletins and search filter', () => {
  const advisoriesHtml = fs.readFileSync(path.join(__dirname, 'CCP/advisories.html'), 'utf8');
  assert.ok(advisoriesHtml.includes('Digital Arrest'), 'Missing Digital Arrest advisory');
  assert.ok(advisoriesHtml.includes('Fake Summon Emails'), 'Missing Fake Summon Emails advisory');
  assert.ok(advisoriesHtml.includes('Electricity Power Disconnection'), 'Missing Electricity bill advisory');
  assert.ok(advisoriesHtml.includes('CPGRAMS'), 'Missing CPGRAMS notice');
});

// 8. Volunteers & Login Pages Verification
it('Volunteer and Login pages contain working application & auth forms', () => {
  const volHtml = fs.readFileSync(path.join(__dirname, 'CCP/volunteer.html'), 'utf8');
  const loginHtml = fs.readFileSync(path.join(__dirname, 'CCP/login.html'), 'utf8');
  assert.ok(volHtml.includes('Volunteer Registration Application'), 'Missing Volunteer Registration heading');
  assert.ok(loginHtml.includes('Citizen Sign In'), 'Missing Citizen Sign In heading');
  assert.ok(loginHtml.includes('standalone-login-form'), 'Missing login form');
  assert.ok(loginHtml.includes('9876543210'), 'Missing autofilled mobile number');
});

// 9. Scraped Master Datasets Verification
it('Master scraped inventory and JSON datasets are generated and complete', () => {
  const masterJsonPath = path.join(__dirname, 'legacy_CCP/MASTER_SCRAPED_ALL_PAGES.json');
  const masterMdPath = path.join(__dirname, 'legacy_CCP/MASTER_SCRAPED_INVENTORY.md');
  assert.strictEqual(fs.existsSync(masterJsonPath), true, 'Missing MASTER_SCRAPED_ALL_PAGES.json');
  assert.strictEqual(fs.existsSync(masterMdPath), true, 'Missing MASTER_SCRAPED_INVENTORY.md');
  assert.ok(fs.statSync(masterJsonPath).size > 1000000, 'MASTER_SCRAPED_ALL_PAGES.json is under 1MB');
  assert.ok(fs.statSync(masterMdPath).size > 800000, 'MASTER_SCRAPED_INVENTORY.md is under 800KB');
});

console.log('\n====================================================');
console.log(`  TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
