const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const sizes = [16, 32, 48, 57, 60, 70, 72, 76, 96, 114, 120, 128, 144, 150, 152, 167, 180, 192, 256, 310, 384, 512];
const publicDir = path.join(__dirname, '../public');
const inputSvg = path.join(publicDir, 'logo.svg');

// Ensure output directory exists
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// Generate PNG icons
async function generateIcons() {
  console.log('Generating favicons...');
  
  // Generate standard favicon.ico
  await sharp(inputSvg)
    .resize(64, 64)
    .toFile(path.join(publicDir, 'favicon.ico'));
  
  // Generate PNGs in various sizes
  for (const size of sizes) {
    const sizeName = size === 16 || size === 32 
      ? `favicon-${size}x${size}.png` 
      : size === 192 || size === 512
        ? `android-chrome-${size}x${size}.png`
        : `apple-touch-icon-${size}x${size}.png`;
    
    await sharp(inputSvg)
      .resize(size, size)
      .toFile(path.join(publicDir, sizeName));
  }
  
  // Create apple-touch-icon.png (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
  // Create mstile-150x150.png
  await sharp(inputSvg)
    .resize(150, 150)
    .toFile(path.join(publicDir, 'mstile-150x150.png'));
    
  // Create browserconfig.xml
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#4f46e5</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  
  await fs.writeFile(path.join(publicDir, 'browserconfig.xml'), browserConfig);
  
  console.log('Favicon generation complete!');
}

// Install sharp if not already installed
async function ensureSharp() {
  try {
    require.resolve('sharp');
  } catch (err) {
    console.log('Installing sharp...');
    execSync('npm install --save-dev sharp', { stdio: 'inherit' });
  }
}

// Run the generation
async function main() {
  await ensureDir(publicDir);
  await ensureSharp();
  await generateIcons();
}

main().catch(console.error);
