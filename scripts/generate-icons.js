import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

async function generateIcons() {
  const inputPath = join(publicDir, 'logo.jpg');
  
  // Generate 192x192
  await sharp(inputPath)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'pwa-192x192.png'));
  
  // Generate 512x512
  await sharp(inputPath)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(join(publicDir, 'pwa-512x512.png'));
  
  console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error);
