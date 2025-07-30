import sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';



const sizes = [16, 32, 48, 57, 60, 70, 72, 76, 96, 114, 120, 128, 144, 150, 152, 167, 180, 192, 256, 310, 384, 512];
const publicDir = join(__dirname, '../public');
const inputSvg = join(publicDir, 'logo.svg');
const manifestPath = join(publicDir, 'site.webmanifest');

// Ensure output directory exists
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Error creating directory: ${err}`);
      throw err;
    }
  }
}

// Generate PNG icons with optimization
async function generateIcons() {
  console.log('Starting favicon generation...');
  
  // Verify input SVG exists
  try {
    await fs.access(inputSvg);
  } catch {
    console.error(`SVG file not found: ${inputSvg}`);
    throw new Error('SVG logo file is missing');
  }

  // Generate standard favicon.ico with optimization
  console.log('Generating favicon.ico...');
  await sharp(inputSvg)
    .resize(64, 64)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon.ico'))
    .catch(err => {
      console.error('Error generating favicon.ico:', err);
      throw err;
    });

  // Generate PNGs in various sizes with optimization
  for (const size of sizes) {
    const sizeName = size === 16 || size === 32 
      ? `favicon-${size}x${size}.png` 
      : size === 192 || size === 512
        ? `android-chrome-${size}x${size}.png`
        : `apple-touch-icon-${size}x${size}.png`;

    console.log(`Generating ${sizeName} (${size}x${size})...`);
    await sharp(inputSvg)
      .resize(size, size)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(publicDir, sizeName))
      .catch(err => {
        console.error(`Error generating ${sizeName}:`, err);
        throw err;
      });
  }

  // Generate additional special icons
  const specialIcons = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'mstile-150x150.png', size: 150 }
  ];

  for (const icon of specialIcons) {
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);
    await sharp(inputSvg)
      .resize(icon.size, icon.size)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(path.join(publicDir, icon.name))
      .catch(err => {
        console.error(`Error generating ${icon.name}:`, err);
        throw err;
      });
  }

  // Update manifest.json with all generated icons
  console.log('Updating manifest.json with icon information...');
  const manifest = {
    name: "ByteDeal",
    short_name: "ByteDeal",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
      ...sizes.map(size => ({
        src: `/${size === 16 || size === 32 
          ? `favicon-${size}x${size}.png` 
          : size === 192 || size === 512
            ? `android-chrome-${size}x${size}.png`
            : `apple-touch-icon-${size}x${size}.png`}`,
        sizes: `${size}x${size}`,
        type: 'image/png'
      })),
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/mstile-150x150.png', sizes: '150x150', type: 'image/png' }
    ]
  };

  try {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('Manifest updated successfully');
  } catch (err) {
    console.error('Error updating manifest:', err);
    throw err;
  }

  console.log('Favicon generation completed successfully!');
}

// Create browserconfig.xml
const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/mstile-70x70.png"/>
      <square150x150logo src="/mstile-150x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

// Create robots.txt
const robotsTxt = `User-agent: *
Allow: /`;

// Create sitemap.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bytedeal.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

// Install sharp if not already installed
async function ensureSharp() {
  try {
    sharp();
  } catch {
    console.log('Installing sharp...');
    execSync('npm install sharp', { stdio: 'inherit' });
  }
}

// Main execution
async function main() {
  try {
    await ensureDir(publicDir);
    await ensureSharp();
    await generateIcons();
    
    // Write additional files
    await fs.writeFile(path.join(publicDir, 'browserconfig.xml'), browserConfig);
    await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt);
    await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml);
    
    console.log('All files generated successfully!');
  } catch (error) {
    console.error('Error during generation:', error);
    process.exit(1);
  }
}

main();
