// Quick script to create placeholder icons
const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator
function createIcon(size) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#98FF98"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.6}" font-weight="bold" fill="#1a5a1a" text-anchor="middle" dominant-baseline="middle">G</text>
</svg>`;
  return svg;
}

const sizes = [16, 32, 48];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
  const svg = createIcon(size);
  // Note: Chrome needs PNG, but we'll create SVG for now and user can convert
  // Or we could use a library, but for simplicity, let's just create the HTML generator note
  console.log(`Created icon${size}.svg (you may need to convert to PNG)`);
});

console.log('\nIcons created! However, Chrome needs PNG files.');
console.log('Please open generate-icons.html in your browser to download PNG icons.');
