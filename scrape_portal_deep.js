const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/ASUS/.gemini/antigravity/brain/71bd013f-7690-4274-973b-025cccbb8a19/.system_generated/steps/307/content.md';
const content = fs.readFileSync(filePath, 'utf8');

// Extract all links
const links = [];
const regex = /href=["']([^"']+)["']/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  links.push(match[1]);
}

// Extract forms / actions / buttons / onclicks
const onClicks = [];
const ocRegex = /onclick=["']([^"']+)["']/gi;
while ((match = ocRegex.exec(content)) !== null) {
  onClicks.push(match[1]);
}

const uniqueLinks = [...new Set(links)];
console.log('Total unique links found in Default.aspx:', uniqueLinks.length);

const categorized = {
  internal_pages: [],
  assets_css: [],
  assets_js: [],
  assets_images: [],
  external_links: [],
  other: []
};

uniqueLinks.forEach(l => {
  if (l.startsWith('http://') || l.startsWith('https://')) {
    if (l.includes('cybercrime.gov.in')) {
      categorized.internal_pages.push(l);
    } else {
      categorized.external_links.push(l);
    }
  } else if (l.endsWith('.css')) {
    categorized.assets_css.push(l);
  } else if (l.endsWith('.js')) {
    categorized.assets_js.push(l);
  } else if (l.endsWith('.png') || l.endsWith('.jpg') || l.endsWith('.jpeg') || l.endsWith('.gif') || l.endsWith('.ico') || l.endsWith('.svg')) {
    categorized.assets_images.push(l);
  } else if (l.includes('.aspx') || l.includes('.html') || l.includes('Webform/')) {
    categorized.internal_pages.push(l);
  } else {
    categorized.other.push(l);
  }
});

console.log('Categorized Breakdown:');
console.log('Internal Pages:', categorized.internal_pages);
console.log('External Links:', categorized.external_links);
console.log('Other Links:', categorized.other);

fs.writeFileSync('C:/Users/ASUS/VS/gov_web_hack26/legacy_CCP/raw_links.json', JSON.stringify({ uniqueLinks, categorized, onClicks: [...new Set(onClicks)] }, null, 2));

