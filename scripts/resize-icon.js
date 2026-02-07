#!/usr/bin/env node
/**
 * Resize icon.png to 1024x1024 for Base Featured Checklist.
 * Run: node scripts/resize-icon.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const iconPath = path.join(publicDir, 'icon.png');
const backupPath = path.join(publicDir, 'icon-512-backup.png');

async function main() {
  if (!fs.existsSync(iconPath)) {
    console.error('icon.png not found');
    process.exit(1);
  }

  const buffer = await sharp(iconPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 11, g: 16, b: 32 } })
    .png()
    .toBuffer();

  fs.writeFileSync(iconPath, buffer);

  console.log('OK: icon.png resized to 1024x1024');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
