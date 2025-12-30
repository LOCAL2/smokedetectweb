import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

// Simple ICO file generator
function createIco(pngBuffers) {
  const images = pngBuffers.map(buf => {
    const size = Math.sqrt((buf.length - 8) / 4); // approximate
    return { buffer: buf, size: 256 };
  });

  // ICO header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  // Directory entries
  const dirEntries = [];
  let offset = 6 + (16 * pngBuffers.length);

  for (let i = 0; i < pngBuffers.length; i++) {
    const entry = Buffer.alloc(16);
    const size = [16, 32, 48, 64, 128, 256][i] || 256;
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height (0 = 256)
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Image offset
    dirEntries.push(entry);
    offset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function generateIco() {
  const sizes = [16, 32, 48, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size => 
      sharp(join(publicDir, 'logo.jpg'))
        .resize(size, size, { fit: 'cover' })
        .png()
        .toBuffer()
    )
  );
  
  const icoBuffer = createIco(pngBuffers);
  writeFileSync(join(publicDir, 'icon.ico'), icoBuffer);
  console.log('icon.ico generated!', icoBuffer.length, 'bytes');
}

generateIco().catch(console.error);
