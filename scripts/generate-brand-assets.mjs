import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const BRAND_DIR = path.join(ROOT, "public/brand");
const SVG_DIR = path.join(BRAND_DIR, "svg");
const SOURCE_DIR = path.join(BRAND_DIR, "source");
const PUBLIC_DIR = path.join(ROOT, "public");
const ASSETS_DIR = path.join(ROOT, "assets");

const ICON_ATTACHED =
  "C:/Users/dell/.cursor/projects/c-osama-github-Life-Archive/assets/c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_6824871932b7db391be62e71865571b0_images_logo_only-removebg-preview-1515d146-a90b-4bee-afb5-a9742a436df2.png";
const PRIMARY_ATTACHED =
  "C:/Users/dell/.cursor/projects/c-osama-github-Life-Archive/assets/c__Users_dell_AppData_Roaming_Cursor_User_workspaceStorage_6824871932b7db391be62e71865571b0_images_ChatGPT_Image_Aug_20__2026__12_04_07_PM-478d52e2-e46e-47e9-9bcc-07989fdec127.png";

const ICON_SOURCE = path.join(SOURCE_DIR, "logo-icon.png");
const PRIMARY_SOURCE = path.join(SOURCE_DIR, "logo-primary.png");
const ICON_ASSET = path.join(ASSETS_DIR, "logo-icon-source.png");
const PRIMARY_ASSET = path.join(ASSETS_DIR, "logo-primary-source.png");
const CREAM = { r: 253, g: 248, b: 243, alpha: 1 };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resolveAttached(icon) {
  const repo = icon ? ICON_ASSET : PRIMARY_ASSET;
  const attached = icon ? ICON_ATTACHED : PRIMARY_ATTACHED;
  const source = icon ? ICON_SOURCE : PRIMARY_SOURCE;
  if (fs.existsSync(repo)) return repo;
  if (fs.existsSync(source)) return source;
  if (fs.existsSync(attached)) return attached;
  throw new Error(`Missing ${icon ? "icon" : "primary"} logo source`);
}

async function saveSources() {
  ensureDir(SOURCE_DIR);
  ensureDir(ASSETS_DIR);

  const iconIn = resolveAttached(true);
  await sharp(iconIn).png({ compressionLevel: 6 }).toFile(ICON_SOURCE);
  fs.copyFileSync(ICON_SOURCE, ICON_ASSET);

  const primaryIn = resolveAttached(false);
  await sharp(primaryIn).png({ compressionLevel: 6 }).toFile(PRIMARY_SOURCE);
  fs.copyFileSync(PRIMARY_SOURCE, PRIMARY_ASSET);
}

/** Trim icon and flatten onto cream so resize does not create black alpha fringes */
async function flattenedIconBuffer() {
  return sharp(ICON_SOURCE)
    .trim({ threshold: 8 })
    .flatten({ background: CREAM })
    .png()
    .toBuffer();
}

async function writeSquareIcon(size, outPath, { padding = 0.08 } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await flattenedIconBuffer();
  const resized = await sharp(icon)
    .resize(inner, inner, {
      fit: "contain",
      background: CREAM,
      kernel: sharp.kernel.lanczos3,
    })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: CREAM,
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png({ compressionLevel: 6, adaptiveFiltering: true })
    .toFile(outPath);
}

/** Crop JPEG edge artifacts, keep artwork as-is (text stays intact on black) */
async function croppedPrimaryBuffer() {
  const meta = await sharp(PRIMARY_SOURCE).metadata();
  const inset = 8;
  return sharp(PRIMARY_SOURCE)
    .extract({
      left: inset,
      top: inset,
      width: meta.width - inset * 2,
      height: meta.height - inset * 2,
    })
    .png({ compressionLevel: 6 })
    .toBuffer();
}

async function writePrimary(width, outPath) {
  const base = await croppedPrimaryBuffer();
  const meta = await sharp(base).metadata();
  const height = Math.round((width * meta.height) / meta.width);

  await sharp(base)
    .resize(width, height, { fit: "inside", kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 6, adaptiveFiltering: true })
    .toFile(outPath);
}

function writeEmbeddedSvg(filename, viewBox, pngPath, width, height) {
  const base64 = fs.readFileSync(pngPath).toString("base64");
  const dataUri = `data:image/png;base64,${base64}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}" role="img" aria-label="Life Archive">
  <image href="${dataUri}" xlink:href="${dataUri}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
  fs.writeFileSync(path.join(SVG_DIR, filename), svg);
  console.log("wrote", path.relative(ROOT, path.join(SVG_DIR, filename)));
}

async function main() {
  await saveSources();

  const masterIcon = path.join(BRAND_DIR, "logo-icon-1024.png");
  await writeSquareIcon(1024, masterIcon);
  console.log("wrote", path.relative(ROOT, masterIcon));

  const squareOutputs = [
    [48, path.join(PUBLIC_DIR, "favicon.png")],
    [192, path.join(PUBLIC_DIR, "icon-192.png")],
    [512, path.join(PUBLIC_DIR, "icon-512.png")],
    [192, path.join(BRAND_DIR, "logo-mark-192.png")],
    [560, path.join(BRAND_DIR, "logo-mark-560.png")],
    [512, path.join(BRAND_DIR, "logo-icon-512.png")],
  ];

  for (const [size, outPath] of squareOutputs) {
    await writeSquareIcon(size, outPath);
    console.log("wrote", path.relative(ROOT, outPath));
  }

  const maskableInner = Math.round(512 * 0.72);
  const maskableIcon = await sharp(await flattenedIconBuffer())
    .resize(maskableInner, maskableInner, {
      fit: "contain",
      background: CREAM,
      kernel: sharp.kernel.lanczos3,
    })
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 3, background: CREAM },
  })
    .composite([{ input: maskableIcon, gravity: "center" }])
    .png({ compressionLevel: 6 })
    .toFile(path.join(PUBLIC_DIR, "icon-maskable.png"));
  console.log("wrote public/icon-maskable.png");

  const primary560 = path.join(BRAND_DIR, "logo-primary-560.png");
  const primary1120 = path.join(BRAND_DIR, "logo-primary-1120.png");
  await writePrimary(560, primary560);
  await writePrimary(1120, primary1120);
  console.log("wrote", path.relative(ROOT, primary560));
  console.log("wrote", path.relative(ROOT, primary1120));

  const primaryMeta = await sharp(primary560).metadata();
  const primaryViewH = primaryMeta.height ?? Math.round(560 / 1.78);

  ensureDir(SVG_DIR);
  writeEmbeddedSvg("life-archive-icon.svg", "0 0 512 512", masterIcon, 512, 512);
  writeEmbeddedSvg(
    "life-archive-mark.svg",
    "0 0 512 512",
    path.join(BRAND_DIR, "logo-mark-560.png"),
    512,
    512,
  );
  writeEmbeddedSvg(
    "life-archive-primary.svg",
    `0 0 560 ${primaryViewH}`,
    primary1120,
    560,
    primaryViewH,
  );
  writeEmbeddedSvg(
    "life-archive-monochrome.svg",
    "0 0 512 512",
    path.join(BRAND_DIR, "logo-mark-560.png"),
    512,
    512,
  );
  writeEmbeddedSvg(
    "life-archive-reversed.svg",
    "0 0 512 512",
    path.join(BRAND_DIR, "logo-mark-560.png"),
    512,
    512,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
