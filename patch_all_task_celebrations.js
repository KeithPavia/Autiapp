const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || 'src/app/components';

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (entry.isFile() && /Task\.tsx$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function ensureImport(text) {
  if (text.includes("import { TaskCelebration } from './TaskCelebration';")) {
    return text;
  }

  const importLines = text.match(/^import .*;$/gm) || [];
  if (importLines.length === 0) return text;

  const lastImport = importLines[importLines.length - 1];
  return text.replace(
    lastImport,
    `${lastImport}\nimport { TaskCelebration } from './TaskCelebration';`
  );
}

function removeInlineCelebrationBlock(text) {
  return text.replace(
    /\n\s*\{showCelebration && \(\s*<>\s*[\s\S]*?<p className="text-3xl font-bold text-orange-500 text-center">Good job! 🎉<\/p>\s*<\/>\s*\)\}\n/gm,
    '\n      <TaskCelebration show={showCelebration} />\n'
  );
}

function patchHandleFns(text) {
  text = text.replace(
    /(const\s+handleDone\s*=\s*\(\)\s*=>\s*\{\s*)(?!setShowCelebration\(false\);)/g,
    '$1setShowCelebration(false);\n    '
  );

  text = text.replace(
    /(const\s+handleNext\s*=\s*\(\)\s*=>\s*\{\s*)(?!setShowCelebration\(false\);)/g,
    '$1setShowCelebration(false);\n    '
  );

  text = text.replace(
    /(const\s+handleNextStep\s*=\s*\(\)\s*=>\s*\{\s*)(?!setShowCelebration\(false\);)/g,
    '$1setShowCelebration(false);\n    '
  );

  return text;
}

function normalizeTimeout(text) {
  return text.replace(
    /window\.setTimeout\(\(\)\s*=>\s*setShowCelebration\(false\),\s*\d+\);/g,
    'window.setTimeout(() => setShowCelebration(false), 3000);'
  );
}

function patchFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  text = ensureImport(text);
  text = removeInlineCelebrationBlock(text);
  text = patchHandleFns(text);
  text = normalizeTimeout(text);

  text = text.replace(/\n{3,}/g, '\n\n');

  if (text !== original) {
    fs.writeFileSync(filePath, text, 'utf8');
    return true;
  }
  return false;
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`Folder not found: ${ROOT}`);
    process.exit(1);
  }

  const files = walk(ROOT);
  let changed = 0;

  for (const file of files) {
    if (patchFile(file)) {
      changed += 1;
      console.log(`Patched: ${file}`);
    }
  }

  console.log(`\nDone. Patched ${changed} file(s) out of ${files.length}.`);
  console.log('\nNow make sure TaskCelebration.tsx is the final confetti version, then rebuild.');
}

main();