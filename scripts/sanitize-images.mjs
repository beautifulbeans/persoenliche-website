import { readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const imageRoot = fileURLToPath(new URL("../src/assets/", import.meta.url));
const removableMarkers = new Set([0xe1, 0xed, 0xfe]); // EXIF/XMP, IPTC and comments

const collectJpegs = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectJpegs(path);
      return [".jpg", ".jpeg"].includes(extname(entry.name).toLowerCase()) ? [path] : [];
    }),
  );
  return files.flat();
};

const stripMetadata = (input) => {
  if (input[0] !== 0xff || input[1] !== 0xd8) throw new Error("Keine gültige JPEG-Datei");

  const chunks = [input.subarray(0, 2)];
  let offset = 2;

  while (offset < input.length) {
    if (input[offset] !== 0xff) throw new Error(`Unerwartete JPEG-Struktur bei Byte ${offset}`);

    const segmentStart = offset;
    while (input[offset] === 0xff) offset += 1;
    const marker = input[offset];
    offset += 1;

    if (marker === 0xda) {
      chunks.push(input.subarray(segmentStart));
      return Buffer.concat(chunks);
    }

    if (marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      chunks.push(input.subarray(segmentStart, offset));
      continue;
    }

    if (offset + 2 > input.length) throw new Error("Unvollständiges JPEG-Segment");
    const segmentLength = input.readUInt16BE(offset);
    const segmentEnd = offset + segmentLength;
    if (segmentLength < 2 || segmentEnd > input.length) throw new Error("Ungültige JPEG-Segmentlänge");

    if (!removableMarkers.has(marker)) chunks.push(input.subarray(segmentStart, segmentEnd));
    offset = segmentEnd;
  }

  throw new Error("JPEG enthält keinen Bilddaten-Abschnitt");
};

const files = await collectJpegs(imageRoot);

for (const file of files) {
  const before = await readFile(file);
  const after = stripMetadata(before);
  if (after.length === before.length) continue;

  const temporary = `${file}.sanitized`;
  await writeFile(temporary, after);
  await rename(temporary, file);
  const saved = (await stat(file)).size;
  console.log(`Metadaten entfernt: ${file} (${before.length - saved} Bytes)`);
}

console.log(`${files.length} JPEG-Dateien geprüft.`);
