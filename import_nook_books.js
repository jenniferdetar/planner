const fs = require('fs');

const SUPABASE_URL = 'https://hhhuidbnvbtllxcaiusl.supabase.co';

function loadServiceKey() {
  const sources = ['check_tables.js', 'seed_supabase.js', 'check_all_rls.js'];
  for (const file of sources) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*'([^']+)'/);
    if (match) return match[1];
  }
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in known files.');
}

async function main() {
  const serviceKey = loadServiceKey();
  const books = JSON.parse(fs.readFileSync('nook_books.json', 'utf8'));

  if (!Array.isArray(books) || books.length === 0) {
    throw new Error('No books found in nook_books.json');
  }

  const chunkSize = 100;
  let inserted = 0;

  for (let i = 0; i < books.length; i += chunkSize) {
    const chunk = books.slice(i, i + chunkSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(chunk)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Insert failed (${res.status}): ${text}`);
    }

    inserted += chunk.length;
  }

  console.log(`Inserted ${inserted} books into Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
