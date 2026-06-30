# Policy Brain Worker

Minimal Cloudflare Worker starter for the policy copilot.

## What it does
- `/health` returns service status
- `/analyze` accepts pasted policy text and returns a draft response using Workers AI
- optionally queries D1 for relevant sources

## Files
- `src/index.js`
- `wrangler.toml`
- `package.json`

## Setup
1. Install dependencies: `npm install`
2. Replace D1 and KV IDs in `wrangler.toml`
3. Create a `documents` table in D1
4. Deploy with `npm run deploy`

## D1 table suggestion
```sql
CREATE TABLE documents (
  file_id TEXT PRIMARY KEY,
  original_title TEXT,
  folder_path TEXT,
  topic TEXT,
  jurisdiction TEXT,
  status TEXT,
  core_score INTEGER,
  drive_link TEXT
);
```
