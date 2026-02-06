/**
 * Convert SVG files to PNG for Farcaster Mini App
 * 
 * Requirements:
 * - Install sharp: npm install sharp
 * - Run: node scripts/convert-svg-to-png.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Conversion specs
const conversions = [
  {
    input: 'icon.svg',
    output: 'icon.png',
    width: 512,
    height: 512,
  },
  {
    input: 'og-image.svg',
    output: 'og-image.png',
    width: 1200,
    height: 630,
  },
  {
    input: 'splash.svg',
    output: 'splash.png',
    width: 1200,
    height: 630,
  },
];

async function convertSvgToPng() {
  console.log('🔄 Converting SVG files to PNG for Farcaster...\n');

  for (const { input, output, width, height } of conversions) {
    const inputPath = path.join(publicDir, input);
    const outputPath = path.join(publicDir, output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${input} not found, skipping...`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 11, g: 16, b: 32 }, // #0b1020
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Converted ${input} → ${output} (${width}x${height}px)`);
    } catch (error) {
      console.error(`❌ Failed to convert ${input}:`, error.message);
    }
  }

  console.log('\n✨ Conversion complete!');
  console.log('📝 Make sure to commit the new PNG files to git.');
}

convertSvgToPng().catch(console.error);
