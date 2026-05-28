const fs = require('fs');
const path = require('path');

// WARNING: Do not run this script after installing the photo-based transparent tool PNG assets.
// It can overwrite assets/tools/*.png.
const GENERATE_TOOL_PNGS = process.env.GENERATE_TOOL_PNGS === 'true';

if (!GENERATE_TOOL_PNGS) {
  console.log('Skipped: set GENERATE_TOOL_PNGS=true to overwrite generated tool PNG assets.');
  process.exit(0);
}

const sharp = require('sharp');

const outDir = path.join(process.cwd(), 'assets', 'tools');
fs.mkdirSync(outDir, { recursive: true });

function toolSvg({ w = 520, h = 1300, label = '', label2 = '', type = 'driver', accent = '#0ea5e9', wood = false }) {
  const defs = `<defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".32"/></filter>
    <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="#6f7474"/><stop offset=".25" stop-color="#d9dedc"/><stop offset=".55" stop-color="#7d8382"/><stop offset="1" stop-color="#2c3030"/></linearGradient>
    <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="#8f4f20"/><stop offset=".42" stop-color="#d99852"/><stop offset="1" stop-color="#6f3514"/></linearGradient>
    <linearGradient id="dark" x1="0" x2="1"><stop offset="0" stop-color="#070707"/><stop offset=".45" stop-color="#333"/><stop offset="1" stop-color="#050505"/></linearGradient>
  </defs>`;

  if (type === 'tape') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#shadow)" transform="translate(50 380)"><rect x="35" y="185" width="365" height="160" rx="30" fill="#151515"/><circle cx="210" cy="175" r="170" fill="url(#metal)" stroke="#141414" stroke-width="38"/><circle cx="210" cy="175" r="118" fill="#b6aca0"/><rect x="130" y="95" width="160" height="120" fill="${accent}"/><text x="210" y="178" text-anchor="middle" font-family="Arial" font-weight="800" font-size="78" fill="#171717">JS</text><text x="210" y="254" text-anchor="middle" font-family="Arial" font-size="34" fill="#171717">JavaScript</text><path d="M390 310h65v45h-65z" fill="#777"/></g></svg>`;
  }

  if (type === 'saw') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#shadow)" transform="translate(110 80)"><path d="M45 120 C85 20 230 10 280 105 L250 330 L80 350 Z" fill="url(#wood)"/><ellipse cx="165" cy="175" rx="70" ry="50" fill="rgba(255,255,255,.28)"/><rect x="115" y="330" width="160" height="820" fill="url(#metal)"/><path d="M275 330 l34 810 l-34 10 z" fill="#343434"/><text x="195" y="560" text-anchor="middle" font-family="Arial" font-weight="800" font-size="92" fill="${accent}">${label}</text><text x="195" y="650" text-anchor="middle" font-family="Arial" font-size="42" fill="#333">${label2}</text></g></svg>`;
  }

  if (type === 'plane') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#shadow)" transform="translate(85 60)"><path d="M140 0 h150 v430 c55-65 85-130 120-220 l68 45 c-55 215-110 500-80 920 H140 Z" fill="url(#wood)"/><path d="M300 135 l155 550 l-100 20 l-120-480 z" fill="#292929" opacity=".95"/><circle cx="392" cy="725" r="36" fill="#b88636"/><text x="230" y="770" text-anchor="middle" font-family="Arial" font-weight="700" font-size="62" fill="#704018" transform="rotate(90 230 770)">${label}</text></g></svg>`;
  }

  if (type === 'caliper') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#shadow)" transform="translate(125 70)"><path d="M60 0 h170 l90 70 h-120 v100 h-140 z" fill="url(#metal)"/><rect x="105" y="80" width="120" height="1050" fill="url(#metal)"/><rect x="45" y="360" width="260" height="185" rx="18" fill="#9a9d9a"/><path d="M65 75 h-120 l80 95 h40 z" fill="#555"/><text x="165" y="835" text-anchor="middle" font-family="Arial" font-weight="800" font-size="72" fill="${accent}" transform="rotate(-90 165 835)">${label}</text></g></svg>`;
  }

  const handleFill = wood ? 'url(#wood)' : 'url(#dark)';
  const blade = type === 'chisel'
    ? `<path d="M210 610 L285 610 L300 1140 L247 1240 L195 1140 Z" fill="url(#metal)"/>`
    : `<rect x="226" y="560" width="68" height="560" rx="18" fill="url(#metal)"/><path d="M226 1120 h68 l-10 86 l-24 34 l-24-34z" fill="#202020"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<g filter="url(#shadow)"><path d="M170 55 C155 170 150 340 185 470 C200 525 320 525 335 470 C370 340 365 170 350 55 C330 20 190 20 170 55 Z" fill="${handleFill}"/><rect x="174" y="80" width="172" height="42" rx="18" fill="${accent}"/><ellipse cx="260" cy="208" rx="45" ry="72" fill="rgba(255,255,255,.12)"/><text x="260" y="330" text-anchor="middle" font-family="Arial" font-weight="800" font-size="92" fill="${accent}">${label}</text>${blade}</g></svg>`;
}

async function main() {
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1980" height="1040" viewBox="0 0 1980 1040"><defs><filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".32"/></filter><linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="#5e3319"/><stop offset=".45" stop-color="#a86532"/><stop offset="1" stop-color="#4a2512"/></linearGradient></defs><rect width="1980" height="1040" fill="#1b120d"/><rect x="36" y="36" width="1908" height="968" rx="12" fill="url(#wood)"/><rect x="80" y="86" width="1820" height="860" fill="#7d4a26"/><g opacity=".22">${Array.from({ length: 24 }, (_, i) => Array.from({ length: 10 }, (_, j) => `<circle cx="${150 + i * 72}" cy="${150 + j * 76}" r="7" fill="#1e1109"/>`).join('')).join('')}</g><g filter="url(#s)">${Array.from({ length: 8 }, (_, i) => `<rect x="${155 + i * 215}" y="405" width="96" height="34" rx="4" fill="#7b461f"/><circle cx="${176 + i * 215}" cy="422" r="6" fill="#c39756"/><circle cx="${230 + i * 215}" cy="422" r="6" fill="#c39756"/>`).join('')}</g><rect x="80" y="86" width="1820" height="860" fill="none" stroke="#2e180d" stroke-width="22"/><rect x="40" y="40" width="1900" height="960" fill="none" stroke="#d19a5c" stroke-width="10" opacity=".35"/></svg>`;

  await sharp(Buffer.from(bgSvg)).webp({ quality: 92 }).toFile(path.join(process.cwd(), 'assets', 'tools-pegboard-bg-empty.webp'));

  const tools = [
    ['javascript_tape.png', { type: 'tape', w: 640, h: 900, accent: '#f7c800' }],
    ['photoshop_screwdriver.png', { type: 'driver', accent: '#1586d8', label: 'Ps' }],
    ['illustrator_screwdriver.png', { type: 'driver', accent: '#f28a13', label: 'Ai' }],
    ['figma_chisel.png', { type: 'chisel', accent: '#8cc7ff', label: 'Figma' }],
    ['vscode_tool.png', { type: 'plane', accent: '#8a4c1e', label: 'Code' }],
    ['ai_saw.png', { type: 'saw', accent: '#b83232', label: 'Ai', label2: 'GPT' }],
    ['autocad_caliper.png', { type: 'caliper', accent: '#b9271f', label: 'AutoCAD' }],
    ['react_chisel.png', { type: 'chisel', accent: '#55d8ff', label: 'React', wood: true }],
  ];

  for (const [name, spec] of tools) {
    await sharp(Buffer.from(toolSvg(spec))).png().toFile(path.join(outDir, name));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
