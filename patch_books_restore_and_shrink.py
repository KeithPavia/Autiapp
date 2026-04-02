from pathlib import Path

path = Path("src/app/components/BooksPage.tsx")
text = path.read_text()

# Make header / prompt smaller
text = text.replace(
    'className="text-5xl sm:text-6xl font-bold text-gray-800"',
    'className="text-4xl sm:text-5xl font-bold text-gray-800"'
)
text = text.replace(
    'className="text-xl sm:text-2xl text-gray-600 mt-2"',
    'className="text-lg sm:text-xl text-gray-600 mt-2"'
)
text = text.replace(
    'className="text-3xl sm:text-4xl font-bold text-gray-800"',
    'className="text-2xl sm:text-3xl font-bold text-gray-800"'
)
text = text.replace(
    'className="text-center text-lg sm:text-2xl text-gray-600"',
    'className="text-center text-base sm:text-lg text-gray-600"'
)

# Make cards smaller and fit more stories on screen
text = text.replace(
    'className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"',
    'className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"'
)
text = text.replace(
    'className={`group text-left rounded-[2rem] bg-white/85 backdrop-blur shadow-2xl overflow-hidden transition-all active:scale-95 ${',
    'className={`group text-left rounded-[1.5rem] bg-white/85 backdrop-blur shadow-xl overflow-hidden transition-all active:scale-95 ${'
)
text = text.replace(
    'className={`bg-gradient-to-br ${book.color} px-6 pt-8 pb-10 text-white relative`',
    'className={`bg-gradient-to-br ${book.color} px-4 pt-5 pb-6 text-white relative`'
)
text = text.replace(
    'className="text-7xl mb-4"',
    'className="text-5xl sm:text-6xl mb-3"'
)
text = text.replace(
    'className="text-3xl font-bold leading-tight mb-2"',
    'className="text-xl sm:text-2xl font-bold leading-tight mb-1"'
)
text = text.replace(
    'className="text-xl opacity-95"',
    'className="text-sm sm:text-base opacity-95"'
)
text = text.replace(
    'className="p-6"',
    'className="p-4"'
)
text = text.replace(
    'className="inline-flex items-center gap-2 text-lg text-gray-600 bg-gray-100 rounded-full px-4 py-2"',
    'className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1.5"'
)
text = text.replace(
    'className="text-blue-600 font-bold text-lg"',
    'className="text-blue-600 font-bold text-sm sm:text-base"'
)
text = text.replace(
    'className="rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50 p-4 border border-slate-100"',
    'className="rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 p-3 border border-slate-100"'
)
text = text.replace(
    'className="text-lg text-gray-700 line-clamp-2"',
    'className="text-sm sm:text-base text-gray-700 line-clamp-2"'
)

# If a previous prettier replacement accidentally reduced the books array, restore from user's original uploaded file
original_candidates = [
    Path("/mnt/data/BooksPage.tsx"),
    Path("BooksPage.tsx"),
]
for original in original_candidates:
    if original.exists():
        original_text = original.read_text()
        if "id: 20" in original_text and "const books: BookData[] = [" in original_text:
            start_old = text.find("const books: BookData[] = [")
            end_old = text.find("\n\n  return (", start_old)
            start_new = original_text.find("const books: BookData[] = [")
            end_new = original_text.find("\n\n  return (", start_new)
            if start_old != -1 and end_old != -1 and start_new != -1 and end_new != -1:
                text = text[:start_old] + original_text[start_new:end_new] + text[end_old:]
            break

path.write_text(text)
print("BooksPage.tsx patched successfully")
