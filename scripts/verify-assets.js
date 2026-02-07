#!/usr/bin/env node
/**
 * Verify Base Featured Checklist asset dimensions.
 * Run: node scripts/verify-assets.js
 */

const path = require('path');
const fs = require('fs');

async function checkImage(filePath, expectedWidth, expectedHeight, label) {
  try {
    const sharp = require('sharp');
    const metadata = await sharp(filePath).metadata();
    const ok = metadata.width === expectedWidth && metadata.height === expectedHeight;
    const status = ok ? 'OK' : 'FAIL';
    console.log(`  ${label}: ${metadata.width}x${metadata.height} (expected ${expectedWidth}x${expectedHeight}) [${status}]`);
    return ok;
  } catch (err) {
    console.log(`  ${label}: ERROR - ${err.message}`);
    return false;
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  console.log('Base Featured Checklist - Asset Verification\n');

  let allOk = true;

  // Icon: 1024x1024
  const iconPath = path.join(publicDir, 'icon.png');
  if (fs.existsSync(iconPath)) {
    allOk = (await checkImage(iconPath, 1024, 1024, 'Icon (icon.png)')) && allOk;
  } else {
    console.log('  Icon: missing (icon.png)');
    allOk = false;
  }

  // Cover: 1200x630
  const coverPath = path.join(publicDir, 'og-image.png');
  if (fs.existsSync(coverPath)) {
    allOk = (await checkImage(coverPath, 1200, 630, 'Cover (og-image.png)')) && allOk;
  } else {
    console.log('  Cover: missing (og-image.png)');
    allOk = false;
  }

  // Screenshots: 1284x2778 (portrait)
  for (let i = 1; i <= 3; i++) {
    const pngPath = path.join(publicDir, `screenshot-${i}.png`);
    const jpgPath = path.join(publicDir, `screenshot-${i}.jpg`);
    const screenshotPath = fs.existsSync(pngPath) ? pngPath : fs.existsSync(jpgPath) ? jpgPath : null;
    if (screenshotPath) {
      allOk = (await checkImage(screenshotPath, 1284, 2778, `Screenshot ${i}`)) && allOk;
    } else {
      console.log(`  Screenshot ${i}: missing`);
      allOk = false;
    }
  }

  console.log('');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
