from pathlib import Path
import re

project_root = Path(".")
books_path = project_root / "src/app/components/BooksPage.tsx"
reader_path = project_root / "src/app/components/BookReader.tsx"

uploaded_books = Path("/mnt/data/BooksPage.tsx")
uploaded_reader = Path("/mnt/data/BookReader.tsx")

if not books_path.exists():
    raise SystemExit("Could not find src/app/components/BooksPage.tsx")
if not reader_path.exists():
    raise SystemExit("Could not find src/app/components/BookReader.tsx")
if not uploaded_books.exists():
    raise SystemExit("Could not find uploaded original BooksPage.tsx in /mnt/data")
if not uploaded_reader.exists():
    raise SystemExit("Could not find uploaded original BookReader.tsx in /mnt/data")

current_books = books_path.read_text()
original_books = uploaded_books.read_text()

start_cur = current_books.find("const books: BookData[] = [")
end_cur = current_books.find("\n\n  return (", start_cur)
start_orig = original_books.find("const books: BookData[] = [")
end_orig = original_books.find("\n\n  return (", start_orig)

if min(start_cur, end_cur, start_orig, end_orig) == -1:
    raise SystemExit("Could not locate books array block")

books_array_block = original_books[start_orig:end_orig]
if "id: 20" not in books_array_block:
    raise SystemExit("Original uploaded BooksPage.tsx does not appear to contain all 20 books")

current_books = current_books[:start_cur] + books_array_block + current_books[end_cur:]

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
    current_books = current_books.replace(old, new)

current_books = re.sub(
    r'\n\s*<div className="flex items-center justify-between mb-4">.*?</div>\s*<div className="rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50 p-4 border border-slate-100">.*?</div>\s*',
    '\n              <div className="mt-2 text-blue-600 font-bold text-sm sm:text-base">Open →</div>\n',
    current_books,
    flags=re.S
)

books_path.write_text(current_books)

reader = uploaded_reader.read_text()

if "const [isPageTurning, setIsPageTurning] = useState(false);" not in reader:
    reader = reader.replace(
        "  const [rewardNow, setRewardNow] = useState(Date.now());\n",
        "  const [rewardNow, setRewardNow] = useState(Date.now());\n  const [isPageTurning, setIsPageTurning] = useState(false);\n"
    )

if "const turnPage = (nextPage: number) => {" not in reader:
    anchor = "  const clearAutoPlayTimeout = () => {\n    if (autoPlayTimeoutRef.current !== null) {\n      window.clearTimeout(autoPlayTimeoutRef.current);\n      autoPlayTimeoutRef.current = null;\n    }\n  };\n"
    helper = """
  const turnPage = (nextPage: number) => {
    setIsPageTurning(true);
    window.setTimeout(() => {
      setCurrentPage(nextPage);
      window.setTimeout(() => {
        setIsPageTurning(false);
      }, 220);
    }, 180);
  };
"""
    reader = reader.replace(anchor, anchor + helper)

reader = reader.replace("          setCurrentPage((prev) => prev + 1);", "          turnPage(currentPageRef.current + 1);")
reader = reader.replace("      setCurrentPage(currentPage + 1);", "      turnPage(currentPage + 1);")
reader = reader.replace("      setCurrentPage(currentPage - 1);", "      turnPage(currentPage - 1);")
reader = reader.replace("    setCurrentPage(index);", "    turnPage(index);")

old_block = """          <div className="flex-1 flex items-center justify-center mb-8">
            <p className={`text-4xl text-gray-800 leading-relaxed text-center px-8 transition-all ${isPlaying ? 'scale-105' : ''}`}>
              {book.pages[currentPage]}
            </p>
          </div>"""
new_block = """          <div className="flex-1 flex items-center justify-center mb-8 [perspective:1600px]">
            <div className={`w-full transition-all duration-500 [transform-style:preserve-3d] ${isPageTurning ? 'rotate-y-12 opacity-60 scale-[0.98]' : 'rotate-y-0 opacity-100 scale-100'}`}>
              <p className={`text-4xl text-gray-800 leading-relaxed text-center px-8 transition-all ${isPlaying ? 'scale-105' : ''}`}>
                {book.pages[currentPage]}
              </p>
            </div>
          </div>"""
reader = reader.replace(old_block, new_block)

reader_path.write_text(reader)

print("Patched BooksPage.tsx and BookReader.tsx successfully.")
