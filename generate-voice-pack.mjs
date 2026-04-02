import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const lines = [
  { file: 'read-book-step-1.mp3', text: 'Pick a book you like.' },
  { file: 'read-book-step-2.mp3', text: 'Find a cozy spot.' },
  { file: 'read-book-step-3.mp3', text: 'Open your book.' },
  { file: 'read-book-step-4.mp3', text: 'Read the pages.' },
];

async function main() {
  console.log('Starting...');
  console.log('Working folder:', process.cwd());
  console.log('API key found:', !!process.env.OPENAI_API_KEY);

  const outDir = path.resolve(process.cwd(), 'public', 'voices');
  await fs.mkdir(outDir, { recursive: true });

  for (const line of lines) {
    console.log('Generating:', line.file);

    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'marin',
      input: line.text,
      instructions:
        'Speak like a warm, calm, friendly teacher reading to a young child. Sound natural, gentle, encouraging, and clear.',
      format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const fullPath = path.join(outDir, line.file);

    await fs.writeFile(fullPath, buffer);
    console.log('Saved:', fullPath);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});