# Policy Brain Worker

Minimal Cloudflare Worker for a policy copilot.

## What it does
- `GET /health` returns service status
- `POST /analyze` accepts pasted policy text and returns a draft answer using Workers AI
- optionally fetches corpus text from a published Google Sheet CSV URL

## Files
- `src/index.js`
- `wrangler.toml`
- `package.json`

## Setup
1. Install dependencies: `npm install`
2. Deploy with `npm run deploy`
3. When calling `/analyze`, pass:
   - `text`
   - optional `mode` (`legislation` or `draft-review`)
   - optional `voice`
   - optional `corpusCsvUrl`

## Optional Google Sheet workflow
If your corpus is in Google Sheets, publish the relevant tab as CSV and paste the CSV URL into `corpusCsvUrl`.

## Example request
```json
{
  "mode": "legislation",
  "text": "<bill or consultation text>",
  "voice": "Alyssa-CLO-public-comment",
  "corpusCsvUrl": "https://...published-sheet-csv-url..."
}
