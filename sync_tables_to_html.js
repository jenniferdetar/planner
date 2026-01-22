#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ROOT_DIR = __dirname;
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'supabase', 'migrations');
const OUTPUT_DIR = path.join(ROOT_DIR, 'supabase', 'html');

const ENV_FILES = [
  path.join(ROOT_DIR, '.env.local'),
  path.join(ROOT_DIR, '.env'),
];

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

ENV_FILES.forEach(loadEnvFromFile);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function extractTableNames(sql) {
  const tables = new Set();
  const regex = /create\s+table\s+(?:if\s+not\s+exists\s+)?([^\n(]+)\s*\(/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const raw = match[1].trim().replace(/;$/, '');
    const cleaned = raw
      .split('.')
      .map((part) => part.trim())
      .filter(Boolean)
      .pop();
    if (!cleaned) continue;
    const unquoted = cleaned.replace(/^"(.*)"$/, '$1');
    tables.add(unquoted);
  }
  return tables;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tableToFileName(tableName) {
  const normalized = tableName.replace(/[^A-Za-z0-9_-]+/g, '_');
  return `${normalized}.html`;
}

async function fetchAllRows(tableName) {
  const pageSize = 1000;
  let offset = 0;
  const rows = [];

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);
    if (data.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return rows;
}

async function fetchTablesFromOpenApi() {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/openapi+json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const spec = await response.json();
  const paths = spec.paths || {};
  const tables = new Set();

  Object.keys(paths).forEach((pathName) => {
    if (!pathName.startsWith('/')) return;
    if (pathName.startsWith('/rpc/')) return;
    if (pathName.startsWith('/auth/')) return;
    if (pathName.startsWith('/storage/')) return;
    if (pathName.includes('{')) return;
    const clean = pathName.slice(1);
    if (clean) {
      tables.add(decodeURIComponent(clean));
    }
  });

  return tables.size ? tables : null;
}

function renderHtml(tableName, rows) {
  if (rows.length === 0) {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(tableName)}</title>
  </head>
  <body>
    <h1>${escapeHtml(tableName)}</h1>
    <table>
      <tbody>
        <tr><td>No rows returned.</td></tr>
      </tbody>
    </table>
  </body>
</html>`;
  }

  const columns = Object.keys(rows[0]);
  const header = columns.map((col) => `<th>${escapeHtml(col)}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = columns.map((col) => {
        const value = row[col];
        const rendered =
          value === null || value === undefined
            ? ''
            : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
        return `<td>${escapeHtml(rendered)}</td>`;
      });
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(tableName)}</title>
  </head>
  <body>
    <h1>${escapeHtml(tableName)}</h1>
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </body>
</html>`;
}

async function main() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found at ${MIGRATIONS_DIR}`);
    process.exit(1);
  }

  const tables = new Set();
  const openApiTables = await fetchTablesFromOpenApi();
  if (openApiTables) {
    openApiTables.forEach((table) => tables.add(table));
  } else {
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.sql'));
    if (migrationFiles.length === 0) {
      console.error('No migration files found to infer table names.');
      process.exit(1);
    }

    migrationFiles.forEach((file) => {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      extractTableNames(sql).forEach((table) => tables.add(table));
    });
  }

  if (tables.size === 0) {
    console.error('No tables found in migrations.');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const tableName of tables) {
    console.log(`Syncing ${tableName}...`);
    try {
      const rows = await fetchAllRows(tableName);
      const html = renderHtml(tableName, rows);
      const outputPath = path.join(OUTPUT_DIR, tableToFileName(tableName));
      fs.writeFileSync(outputPath, html);
    } catch (err) {
      console.error(err.message);
    }
  }

  console.log(`Done. HTML exports written to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
