#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy PDF.js worker
const workerSrc = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
const workerDest = path.join(publicDir, 'pdf.worker.min.js');

try {
  if (fs.existsSync(workerSrc)) {
    fs.copyFileSync(workerSrc, workerDest);
    console.log('✅ PDF.js worker copied successfully');
  } else {
    console.error('❌ PDF.js worker source not found. Make sure pdfjs-dist is installed.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to copy PDF.js worker:', error.message);
  process.exit(1);
}

console.log('🎉 Setup completed successfully!');