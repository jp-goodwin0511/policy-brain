const R2_BUCKET = "policy_brain";
const CORPUS_OBJECT_KEY = "Policy Brain - Master Tracker.csv";
const BUILD_VERSION = "2026-07-08-baseline";

import { extractText } from 'unpdf';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return html(`
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Policy Brain Copilot</title>
    <style>
      :root {
        --bg: #0B1220;
        --surface: #141D2B;
        --surface-2: #1A2636;
        --text: #F0F4F8;
        --muted: #90A0B0;
        --cf-orange: #F48120;
        --cf-orange-2: #F8A23E;
        --cf-blue: #0051C3;
        --cf-blue-2: #4098F7;
        --border: rgba(255,255,255,0.08);
      }
      * { box-sizing: border-box; }
      html { -webkit-font-smoothing: antialiased; }
      body {
        margin: 0;
        min-height: 100vh;
        background: radial-gradient(1200px 600px at 10% 0%, rgba(244,129,32,0.10) 0%, var(--bg) 55%),
                    radial-gradient(1000px 600px at 90% 0%, rgba(0,81,195,0.10) 0%, var(--bg) 55%),
                    var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 40px 20px 72px;
      }
      header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 32px;
      }
      .logo {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, var(--cf-orange), var(--cf-orange-2));
        border-radius: 10px;
        display: grid;
        place-items: center;
        box-shadow: 0 8px 20px rgba(244,129,32,0.22);
      }
      .logo svg { display: block; }
      header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: -0.02em;
      }
      header h1 span {
        color: var(--muted);
        font-weight: 500;
        font-size: 15px;
        margin-left: 8px;
      }
      .hero {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 20px;
        margin-bottom: 24px;
        align-items: stretch;
      }
      .card {
        background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
        border: 1px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.28);
        backdrop-filter: blur(4px);
      }
      .hero-main {
        padding: 32px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .eyebrow {
        color: var(--cf-orange-2);
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: 12px;
      }
      .hero-main h2 {
        margin: 0 0 14px;
        font-size: 34px;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }
      .subtitle {
        color: var(--muted);
        font-size: 16px;
        line-height: 1.6;
        max-width: 56ch;
        margin: 0;
      }
      .status-grid {
        padding: 24px;
        display: grid;
        gap: 14px;
      }
      .status {
        padding: 16px 18px;
        background: rgba(0,0,0,0.16);
        border: 1px solid var(--border);
        border-radius: 14px;
        transition: border-color 0.2s ease, background 0.2s ease;
      }
      .status:hover {
        border-color: rgba(244,129,32,0.35);
        background: rgba(244,129,32,0.05);
      }
      .status label {
        display: block;
        color: var(--muted);
        font-size: 11px;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .status strong {
        font-weight: 600;
        font-size: 14px;
        color: var(--text);
      }
      .panel { padding: 28px; }
      .row {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .row:last-child { margin-bottom: 0; }
      select, button, input, textarea {
        background: var(--surface-2);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      select:focus, input:focus, textarea:focus {
        border-color: rgba(64,152,247,0.5);
        box-shadow: 0 0 0 3px rgba(64,152,247,0.12);
      }
      textarea {
        width: 100%;
        min-height: 240px;
        resize: vertical;
        line-height: 1.6;
      }
      input[type="file"] {
        background: transparent;
        border: none;
        padding: 6px 0;
        font-size: 13px;
        color: var(--muted);
        max-width: 320px;
      }
      input#voice { width: 420px; max-width: 100%; }
      button#analyze {
        background: linear-gradient(135deg, var(--cf-orange) 0%, var(--cf-orange-2) 100%);
        border: none;
        color: #08101f;
        font-weight: 800;
        cursor: pointer;
        padding: 12px 22px;
        box-shadow: 0 10px 28px rgba(244,129,32,0.18);
        transition: transform 0.15s ease, box-shadow 0.2s ease;
      }
      button#analyze:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 34px rgba(244,129,32,0.26);
      }
      button#analyze:active { transform: translateY(0); }
      button#copyResponse {
        background: transparent;
        color: var(--muted);
        border: 1px solid var(--border);
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 10px;
      }
      button#copyResponse:hover {
        border-color: rgba(64,152,247,0.4);
        color: var(--text);
      }
      .hint {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
        margin-top: 4px;
      }
      .output-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        gap: 12px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.03);
        border-radius: 999px;
        padding: 6px 12px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 600;
      }
      .pill.working {
        border-color: rgba(64,152,247,0.4);
        background: rgba(64,152,247,0.12);
        color: #B6D9FF;
      }
      .pill.done {
        border-color: rgba(92,214,137,0.35);
        background: rgba(92,214,137,0.10);
        color: #B6F0CD;
      }
      .pill.error {
        border-color: rgba(255,100,100,0.35);
        background: rgba(255,100,100,0.10);
        color: #FFB3B3;
      }
      #output {
        white-space: pre-wrap;
        word-break: break-word;
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
        padding: 22px;
        border-radius: 16px;
        overflow-x: auto;
        min-height: 260px;
        line-height: 1.55;
        font-size: 14px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
      }
      #output strong { color: #fff; }
      @media (max-width: 900px) {
        .hero { grid-template-columns: 1fr; }
        .hero-main h2 { font-size: 28px; }
        input#voice { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header>
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.6 10.8c-1.1 0-2 .4-2.8 1.1L12 7.5l2.8-4.4c.8.7 1.7 1.1 2.8 1.1 1.6 0 3-1 3.6-2.3 0 0-3.6 8.8-3.6 8.9z" fill="white"/>
            <path d="M12 7.5 9.2 11.9c-.8-.7-1.7-1.1-2.8-1.1C4.8 10.8 3 12.6 3 14.8c0 2.2 1.8 4 4 4h10.6c2.2 0 4-1.8 4-4 0-2.2-1.8-4-4-4-.6 0-1.1.1-1.6.4L12 7.5z" fill="white"/>
          </svg>
        </div>
        <h1>Policy Brain <span>Cloudflare Policy Copilot</span></h1>
      </header>

      <div class="hero">
        <div class="card hero-main">
          <div class="eyebrow">Fast-track policy analysis</div>
          <h2>Policy copilot for draft review and legislation analysis.</h2>
          <p class="subtitle">
            Upload legislation, consultations, press releases, or draft comments. The copilot
            cross-references Cloudflare's policy corpus and returns a stance memo, draft
            public comment, and open questions for human review.
          </p>
        </div>
        <div class="card status-grid">
          <div class="status">
            <label>Status</label>
            <strong>Live</strong>
          </div>
          <div class="status">
            <label>Corpus source</label>
            <strong>R2: Policy Brain - Master Tracker.csv</strong>
          </div>
          <div class="status">
            <label>Voice</label>
            <strong>Alyssa-CLO-public-comment</strong>
          </div>
        </div>
      </div>

      <div class="card panel">
        <div class="row">
          <select id="mode">
            <option value="draft-review">Draft review</option>
            <option value="legislation" selected>Legislation / policy analysis</option>
          </select>
          <button id="analyze">Analyze</button>
        </div>

        <div class="row">
          <textarea id="text" placeholder="Paste a draft document, bill, consultation, or comment here..."></textarea>
        </div>

        <div class="row">
          <label for="billFile">Upload bill text:</label>
          <input type="file" id="billFile" accept=".txt,.md,.text,.pdf">
          <span id="billStatus" class="hint" style="margin-left:8px;"></span>
        </div>

        <div class="row">
          <label for="voice">Voice:</label>
          <input id="voice" value="Alyssa-CLO-public-comment" />
        </div>

        <div class="hint">
          Tip: use Draft review for redlines and comments on your own writing; use Legislation / policy analysis for stance and comment drafting.
        </div>
      </div>

      <div class="card panel" style="margin-top: 24px;">
        <div class="output-head">
          <div class="pill" id="responsePill">Response</div>
          <div class="row" style="margin-bottom:0;gap:10px;">
            <div class="pill" id="loadState">Ready</div>
            <button id="copyResponse" type="button">Copy response</button>
          </div>
        </div>
        <pre id="output">Results will appear here.</pre>
      </div>
    </div>

    <script>
const analyzeBtn = document.getElementById('analyze');
const textEl = document.getElementById('text');
const modeEl = document.getElementById('mode');
const voiceEl = document.getElementById('voice');
const outputEl = document.getElementById('output');
const loadState = document.getElementById('loadState');
const responsePill = document.getElementById('responsePill');
const copyResponseBtn = document.getElementById('copyResponse');

const billFile = document.getElementById('billFile');
const billStatus = document.getElementById('billStatus');
let uploadedBillText = '';
let uploadedBillName = '';

billFile.addEventListener('change', async () => {
  const file = billFile.files && billFile.files[0];
  if (!file) return;

  uploadedBillName = file.name;
  uploadedBillText = '';

  if (billStatus) {
    billStatus.textContent = 'Loaded ' + uploadedBillName + ' ✓';
  }
});

analyzeBtn.addEventListener('click', async () => {
  outputEl.textContent = 'Analyzing...';
  loadState.textContent = 'Working';
  responsePill.className = 'pill working';
  loadState.className = 'pill working';
  try {
    const form = new FormData();
    form.append('mode', modeEl.value);
    form.append('text', textEl.value);
    form.append('voice', voiceEl.value);

    if (billFile.files && billFile.files[0]) {
      form.append('document', billFile.files[0]);
      form.append('documentName', billFile.files[0].name);
    }

    const res = await fetch('/analyze', {
      method: 'POST',
      body: form
    });

    const data = await res.json();
    outputEl.innerHTML = formatResponse(data);
    loadState.textContent = res.ok ? 'Done' : 'Error';
    loadState.className = res.ok ? 'pill done' : 'pill error';
    responsePill.className = 'pill';
  } catch (err) {
    outputEl.textContent = 'Error: ' + err.message;
    loadState.textContent = 'Error';
    loadState.className = 'pill error';
    responsePill.className = 'pill error';
  }
});

copyResponseBtn.addEventListener('click', async () => {
  const text = outputEl.innerText || '';
  try {
    await navigator.clipboard.writeText(text);
    const old = copyResponseBtn.textContent;
    copyResponseBtn.textContent = 'Copied!';
    setTimeout(() => copyResponseBtn.textContent = old, 1200);
  } catch (err) {
    alert('Could not copy response: ' + err.message);
  }
});

function formatResponse(data) {
  if (!data) return '<div>No response.</div>';
  if (data.error) return '<div style="color:#ff9b9b;"><strong>Error:</strong> ' + escapeHtml(String(data.error)) + '</div>';

  const output = String(data.output || '').trim();
  if (!output) return '<div>No output.</div>';

  return '<div style="white-space: pre-wrap;">' + escapeHtml(output) + '</div>';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
    </script>
  </body>
</html>
`);
    }

  if (url.pathname === "/health") {
  const corpus = await fetchCorpusFromR2(env);
  return json({
    ok: true,
    service: "policy-brain-worker",
    build: BUILD_VERSION,
    mode: "r2",
    bucket: R2_BUCKET,
    objectKey: CORPUS_OBJECT_KEY,
    corpusPreview: corpus.slice(0, 300)
  });
}

if (url.pathname === '/analyze' && request.method === 'POST') {
  try {
    const form = await request.formData();
const mode = form.get('mode') || 'legislation';
const inputText = form.get('text') || '';
const voice = form.get('voice') || 'Alyssa-CLO-public-comment';
const documentFile = form.get('document');
const documentName = form.get('documentName') || '';

let documentText = '';

if (documentFile instanceof File) {
  if (
    documentFile.type === 'text/plain' ||
    documentFile.name.toLowerCase().endsWith('.txt') ||
    documentFile.name.toLowerCase().endsWith('.md') ||
    documentFile.name.toLowerCase().endsWith('.text')
  ) {
    const buffer = await documentFile.arrayBuffer();
    documentText = await extractText(buffer);
  } else if (documentFile.name.toLowerCase().endsWith('.pdf')) {
    const buffer = new Uint8Array(await documentFile.arrayBuffer());
    const result = await extractText(buffer);
    documentText = result.text || '';
  } else {
    return json({ error: 'Unsupported file type.' }, 400);
  }
}

    if (!inputText.trim()) {
      return json({ error: 'Missing text input.' }, 400);
    }

    const corpusText = await fetchCorpusFromR2(env, inputText);
    const prompt = buildPrompt({ mode, inputText, voice, corpusText, documentText, documentName });

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      prompt,
      max_tokens: 1200,
      temperature: 0.3,
    });
    
        return json({
          mode,
          voice,
          bucket: R2_BUCKET,
          objectKey: CORPUS_OBJECT_KEY,
          corpusPreview: corpusText.slice(0, 300),
          documentPreview: String(documentText || '').slice(0, 800),
          documentName,
          output: response.response || response,
        });
      } catch (err) {
        return json({
          error: err && err.message ? err.message : String(err)
        }, 500);
      }
    }
    return json({ error: "Not found" }, 404);
  },
};

async function fetchCorpusFromR2(env, inputText = '') {
  try {
    const obj = await env.policy_brain.get(CORPUS_OBJECT_KEY);
    if (!obj) return '';
    const text = await obj.text();
    return normalizeCorpusText(text, inputText);
  } catch {
    return '';
  }
}

function normalizeCorpusText(text, inputText = '') {
  const raw = String(text || '').trim();
  if (!raw) return '';

  const lines = raw.split(/\r?\n/);
  const firstLine = lines[0] || '';
  const looksCsv = firstLine.includes(',') && firstLine.toLowerCase().includes('file_id');

  if (!looksCsv) return raw.slice(0, 12000);

  const headers = parseCsvLine(firstLine);
  const tokens = tokenize(inputText);
  const scored = [];

  for (const line of lines.slice(1, 26)) {
    if (!line.trim()) continue;

    const cols = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));

    const title = String(row.original_title || row.title || row.originalTitle || '(untitled)').trim();
    const topic = String(row.topic || '').trim();
    const jurisdiction = String(row.jurisdiction || '').trim();
    const status = String(row.status || '').trim();
    const score = String(row.core_score || row.coreScore || '').trim();
    const summary = String(row.summary || '').trim();

    const titleLower = title.toLowerCase();
    const scoreNum = Number(String(score).replace(/[^0-9.-]/g, '')) || 0;

    // Drop low-signal rows
    if (scoreNum < 5) continue;
    if (titleLower.includes('buildathon')) continue;
    if (titleLower.includes('party')) continue;
    if (titleLower.includes('overview')) continue;
    if (titleLower.includes('one page')) continue;
    if (!summary && scoreNum < 7) continue;

    const hay = (title + ' ' + topic + ' ' + jurisdiction + ' ' + status + ' ' + summary).toLowerCase();
    let hit = 0;
    for (const token of tokens) {
      if (token && hay.includes(token)) hit += 1;
    }

    scored.push({
      weight: hit * 10 + scoreNum,
      text: title + ' | topic=' + topic + ' | jurisdiction=' + jurisdiction + ' | status=' + status + ' | score=' + score + ' | summary=' + summary
    });
  }

  scored.sort((a, b) => b.weight - a.weight);
  return scored.slice(0, 6).map(x => x.text).join('\n');
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === "\"") {
      if (inQuotes && next === "\"") {
        cur += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function buildPrompt({ mode, inputText, voice, corpusText, documentText, documentName }) {
  const corpusBlock = corpusText
    ? `\n\nRelevant corpus data:\n${corpusText}`
    : "\n\nRelevant corpus data: (none provided)";

  const documentBlock = documentText
    ? `\n\nUploaded document${documentName ? ` (${documentName})` : ''}:\n${documentText.slice(0, 12000)}`
    : '';

  if (mode === "draft-review") {
    return `You are a Cloudflare policy copilot. The user provided a draft document.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Explain what Alyssa would likely say.\n2. List concrete comments she would leave.\n3. Suggest revised wording where appropriate.\n4. Keep the tone measured, policy-grounded, and concise.\n5. If the corpus does not contain a direct precedent, say so explicitly and avoid overconfident conclusions.\n\nDraft text:\n${inputText}${documentBlock}${corpusBlock}\n\nImportant: prioritize the uploaded document and the user's draft text above the corpus. Use the corpus only for precedent, style, or comparison. If the corpus lacks a relevant precedent, say so.\n\nReturn:\n- brief assessment\n- bullet comments\n- suggested edits\n- unresolved questions`;
  }

    return `You are a Cloudflare policy copilot. The user provided legislation, a consultation, or a regulatory proposal.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Infer Cloudflare's likely stance only if supported by the corpus.\n2. If the corpus does not contain a direct precedent, say so explicitly.\n3. Draft a concise internal stance memo.\n4. Draft a short public comment in Cloudflare's voice.\n5. Surface only the most important unresolved questions.\n6. Avoid overconfident conclusions and avoid legal advice framing.\n\nPolicy input:\n${inputText}${documentBlock}${corpusBlock}\n\nImportant: base your stance and comments primarily on the uploaded document and the user's prompt. Use the corpus only as supporting precedent. If the corpus lacks a relevant precedent, say so explicitly and avoid overconfident conclusions.\n\nReturn:\n- stance summary\n- internal memo\n- draft comment\n- open questions`;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function html(body) {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function tokenize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 20);
}

