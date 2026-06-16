/**
 * ManMode Frontend Build Script
 * Copies views/ and public/ into backend/ so the Express server can find them.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const frontendDir = __dirname;
const backendDir  = path.join(__dirname, '..', 'backend');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Building ManMode frontend...');

// Copy views
const viewsSrc  = path.join(frontendDir, 'views');
const viewsDest = path.join(backendDir, 'views');
if (fs.existsSync(viewsSrc)) {
  copyDir(viewsSrc, viewsDest);
  console.log('✅ Copied views/ → backend/views/');
} else {
  console.warn('⚠️  No views/ directory found in frontend.');
}

// Copy public
const publicSrc  = path.join(frontendDir, 'public');
const publicDest = path.join(backendDir, 'public');
if (fs.existsSync(publicSrc)) {
  copyDir(publicSrc, publicDest);
  console.log('✅ Copied public/ → backend/public/');
} else {
  console.warn('⚠️  No public/ directory found in frontend.');
}

console.log('🎉 Frontend build complete!');
