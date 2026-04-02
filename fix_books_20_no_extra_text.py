from pathlib import Path
import re

project_file = Path("src/app/components/BooksPage.tsx")
original_file = Path("/mnt/data/BooksPage.tsx")

if not project_file.exists():
    raise SystemExit("Could not find src/app/components/BooksPage.tsx")

if not original_file.exists():
    raise SystemExit("Could not find the original uploaded BooksPage.tsx at /mnt/data/BooksPage.tsx")

current = project_file.read_text()
original = original_file.read_text()

# 1) Restore the FULL 20-book array from the original uploaded file
start_cur = current.find("const books: BookData[] = [")
end_cur = current.find("\n\n  return (", start_cur)

start_orig = original.find("const books: BookData[] = [")
end_orig = original.find("\n\n  return (", start_orig)

if min(start_cur, end_cur, start_orig, end_orig) == -1:
    raise SystemExit("Could not locate the books array block")

books_block = original[start_orig:end_orig]

if "id: 20" not in books_block:
    raise SystemExit("The original uploaded BooksPage.tsx does not contain all 20 books")

current = current[:start_cur] + books_block + current[end_cur:]

# 2) Make the chooser smaller / cleaner
replacements = [
    ('className="text-5xl sm:text-6xl font-bold text-gray-800"', 'className="text-4xl sm:text-5xl font-bold text-gray-800"'),
    ('className="text-xl sm:text-2xl text-gray-600 mt-2"', 'className="text-lg sm:text-xl text-gray-600 mt-2"'),
    ('className="text-3xl sm:text-4xl font-bold text-gray-800"', 'className="text-2xl sm:text-3xl font-bold text-gray-800"'),
    ('className="text-center text-lg sm:text-2xl text-gray-600"', 'className="text-center text-base sm:text-lg text-gray-600"'),
    ('className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"', 'className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"'),
    ('className={`group text-left rounded-[2rem] bg-white/85 backdrop-blur shadow-2xl overflow-hidden transition-all active:scale-95 ${', 'className={`group text-left rounded-[1.5rem] bg-white/85 backdrop-blur shadow-xl overflow-hidden transition-all active:scale-95 ${'),
    ('className={`bg-gradient-to-br ${book.color} px-6 pt-8 pb-10 text-white relative`', 'className={`bg-gradient-to-br ${book.color} px-4 pt-5 pb-6 text-white relative`'),
    ('className="text-7xl mb-4"', 'className="text-5xl sm:text-6xl mb-2"'),
    ('className="text-3xl font-bold leading-tight mb-2"', 'className="text-xl sm:text-2xl font-bold leading-tight"'),
    ('className="text-xl opacity-95"', 'className="hidden"'),
    ('className="p-6"', 'className="p-3 sm:p-4"'),
]
for old, new in replacements:
    current = current.replace(old, new)

# 3) Remove author / pages / preview text from each card
# Remove the "author" paragraph on cards
current = re.sub(
    r'\n\s*<p className="text-xl opacity-90">\{book\.author\}</p>',
    '',
    current
)

# Remove the pages count line
current = re.sub(
    r'\n\s*<div className="mt-4 flex items-center gap-2 text-xl">\s*<Book size=\{24\} />\s*<span>\{book\.pages\.length\} pages</span>\s*</div>',
    '',
    current,
    flags=re.S
)

# Remove the newer preview block if present
current = re.sub(
    r'\n\s*<div className="flex items-center justify-between mb-4">.*?</div>\s*<div className="rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50 p-4 border border-slate-100">.*?</div>',
    '\n              <div className="mt-2 text-blue-600 font-bold text-sm sm:text-base">Open →</div>',
    current,
    flags=re.S
)

project_file.write_text(current)
print("BooksPage.tsx fixed: restored all 20 stories and removed extra card text.")
