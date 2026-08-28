const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const svgPath = path.resolve('CCP/public/sample_upi_receipt.svg');
const htmlPath = path.resolve('CCP/public/sample_receipt_render.html');
const pngPath = path.resolve('CCP/public/sample_upi_receipt.png');
const pdfPath = path.resolve('CCP/public/sample_upi_receipt.pdf');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin:0; padding:0; background:#F3F4F6; display:flex; justify-content:center; align-items:center; }
    img { width:600px; height:900px; display:block; }
  </style>
</head>
<body>
  <img src="sample_upi_receipt.svg" />
</body>
</html>`;

fs.writeFileSync(htmlPath, htmlContent);

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

const browserPath = edgePaths.find(p => fs.existsSync(p));

if (browserPath) {
  console.log('Using browser:', browserPath);
  try {
    const fileUri = 'file:///' + htmlPath.replace(/\\/g, '/');
    
    // Generate PNG
    const pngCmd = `"${browserPath}" --headless --disable-gpu --screenshot="${pngPath}" --window-size=600,900 "${fileUri}"`;
    execSync(pngCmd);
    console.log('PNG generated at:', pngPath);
    
    // Generate PDF
    const pdfCmd = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${fileUri}"`;
    execSync(pdfCmd);
    console.log('PDF generated at:', pdfPath);
  } catch (e) {
    console.error('Browser render error:', e.message);
  }
} else {
  console.log('No headless browser binary found, fallback to pure Canvas/SVG.');
}

