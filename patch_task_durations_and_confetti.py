from pathlib import Path
import re
import sys

components_dir = Path(sys.argv[1] if len(sys.argv) > 1 else 'src/app/components')

task_files = sorted(
    p for p in components_dir.glob('*Task.tsx')
    if p.name not in {'TaskCard.tsx'}
)

patched = []

for path in task_files:
    text = path.read_text()

    if "const [showCelebration, setShowCelebration]" not in text:
        continue

    original = text

    if "import { TaskCelebration } from './TaskCelebration';" not in text:
        if "import { RewardScreen } from './RewardScreen';" in text:
            text = text.replace(
                "import { RewardScreen } from './RewardScreen';",
                "import { RewardScreen } from './RewardScreen';\nimport { TaskCelebration } from './TaskCelebration';"
            )

    # Replace any existing inline celebration block
    text = re.sub(
        r"\{showCelebration && \(\s*<>\s*<div className=\"fixed inset-0 pointer-events-none z-40 overflow-hidden\">.*?</>\s*\)\}",
        "<TaskCelebration show={showCelebration} />",
        text,
        flags=re.DOTALL,
    )

    # If there is no celebration render yet, add it before RewardScreen
    if "<TaskCelebration show={showCelebration} />" not in text and "showCelebration && (" in text:
        text = text.replace(
            "{showRewardScreen && (",
            "<TaskCelebration show={showCelebration} />\n\n      {showRewardScreen && ("
        )

    # Make celebration last longer across task screens
    text = text.replace("}, 1200);", "}, 7000);")
    text = text.replace("}, 1500);", "}, 7000);")
    text = text.replace("}, 1800);", "}, 7000);")
    text = text.replace("}, 2000);", "}, 7000);")
    text = text.replace("}, 2500);", "}, 7000);")
    text = text.replace("setTimeout(() => setShowCelebration(false), 1500);", "setTimeout(() => setShowCelebration(false), 7000);")
    text = text.replace("setTimeout(() => setShowCelebration(false), 2000);", "setTimeout(() => setShowCelebration(false), 7000);")

    if text != original:
        path.write_text(text)
        patched.append(path.name)

print(f"Patched {len(patched)} task files")
for name in patched:
    print(name)
