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

function patchFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  const original = text;

  // Remove RewardScreen import
  text = text.replace(
    /^\s*import\s+\{\s*RewardScreen\s*\}\s+from\s+['"]\.\/RewardScreen['"];\s*\n?/m,
    ''
  );

  // Remove showRewardScreen state if present
  text = text.replace(
    /^\s*const\s*\[\s*showRewardScreen\s*,\s*setShowRewardScreen\s*\]\s*=\s*useState\([^)]*\);\s*\n?/m,
    ''
  );

  // Remove "if (showRewardScreen) return <RewardScreen ... />" block
  text = text.replace(
    /^\s*if\s*\(\s*showRewardScreen\s*\)\s*\{\s*\n\s*return\s*<RewardScreen[\s\S]*?^\s*\}\s*\n?/m,
    ''
  );

  // Remove one-line "if (showRewardScreen) return <RewardScreen ... />;"
  text = text.replace(
    /^\s*if\s*\(\s*showRewardScreen\s*\)\s*return\s*<RewardScreen[\s\S]*?;\s*\n?/m,
    ''
  );

  // Remove any setShowRewardScreen(true);
  text = text.replace(
    /^\s*setShowRewardScreen\(true\);\s*\n?/gm,
    ''
  );

  // Remove any setShowRewardScreen(false);
  text = text.replace(
    /^\s*setShowRewardScreen\(false\);\s*\n?/gm,
    ''
  );

  // Clean extra blank lines
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
  console.log('\nNext:');
  console.log('1. Build again');
  console.log('2. Sync Capacitor');
  console.log('3. Clean Xcode build folder');
}

main();