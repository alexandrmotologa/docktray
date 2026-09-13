import fs from "fs";
import path from "path";
import zlib from "zlib";

function createPng(width, height) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // Raw image data: for each scanline: 1 filter byte (0) + width * 4 bytes RGBA
  const rawLineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawLineLength);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * rawLineLength;
    rawData[lineOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      // Dark slate background with cyan/violet gradient
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
      if (isBorder) {
        rawData[pxOffset] = 34; // R
        rawData[pxOffset + 1] = 39; // G
        rawData[pxOffset + 2] = 61; // B
        rawData[pxOffset + 3] = 255; // A
      } else {
        rawData[pxOffset] = 6; // R
        rawData[pxOffset + 1] = 182; // G
        rawData[pxOffset + 2] = 212; // B
        rawData[pxOffset + 3] = 255; // A
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", compressedData);

  // IEND chunk
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);

  const crcData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(crcData);
  chunk.writeInt32BE(crcVal, 8 + len);
  return chunk;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return crc ^ -1;
}

const iconsDir = path.resolve("./src-tauri/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const png32 = createPng(32, 32);
fs.writeFileSync(path.join(iconsDir, "32x32.png"), png32);
console.log("Created 32x32.png");

const png128 = createPng(128, 128);
fs.writeFileSync(path.join(iconsDir, "128x128.png"), png128);
console.log("Created 128x128.png");

// Simple 1-image ICO header wrapping png32
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // ICO type
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoDirEntry = Buffer.alloc(16);
icoDirEntry.writeUInt8(32, 0); // width
icoDirEntry.writeUInt8(32, 1); // height
icoDirEntry.writeUInt8(0, 2); // colors
icoDirEntry.writeUInt8(0, 3); // reserved
icoDirEntry.writeUInt16LE(1, 4); // color planes
icoDirEntry.writeUInt16LE(32, 6); // bpp
icoDirEntry.writeUInt32LE(png32.length, 8); // size
icoDirEntry.writeUInt32LE(22, 12); // offset = 6 + 16

const ico = Buffer.concat([icoHeader, icoDirEntry, png32]);
fs.writeFileSync(path.join(iconsDir, "icon.ico"), ico);
console.log("Created icon.ico");
