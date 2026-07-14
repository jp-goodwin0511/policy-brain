const R2_BUCKET = "policy_brain";
const CORPUS_OBJECT_KEY = "Policy Brain - Master Tracker.csv";
const BUILD_VERSION = "2026-07-08-baseline";

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
          --bg: #0b1020;
          --panel: #11172a;
          --text: #edf2ff;
          --muted: #98a2c7;
          --accent: #7c8cff;
          --accent-2: #56c2ff;
          --border: rgba(255,255,255,0.08);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          background: radial-gradient(1200px 800px at 20% 0%, #182041 0%, var(--bg) 55%);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .wrap { max-width: 1120px; margin: 0 auto; padding: 40px 20px 60px; }
        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        }
        .hero-main { padding: 28px; }
        .eyebrow {
          color: var(--accent-2);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 12px;
        }
        h1 { margin: 10px 0 12px; font-size: 38px; line-height: 1.05; }
        .subtitle { color: var(--muted); font-size: 16px; line-height: 1.6; max-width: 60ch; }
        .status-grid { display: grid; gap: 12px; }
        .status {
          padding: 18px;
          background: rgba(7,10,20,0.35);
          border: 1px solid var(--border);
          border-radius: 14px;
        }
        .status label {
          display: block;
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 8px;
        }
        .status strong { font-size: 15px; }
        .panel { padding: 20px; }
        .row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin: 12px 0;
        }
        select, button, input, textarea {
          background: #0d1324;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          outline: none;
        }
        textarea {
          width: 100%;
          min-height: 240px;
          resize: vertical;
          line-height: 1.55;
        }
        input { width: 360px; max-width: 100%; }
        button {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          border: none;
          color: #08101f;
          font-weight: 700;
          cursor: pointer;
          padding: 12px 18px;
          box-shadow: 0 10px 28px rgba(86,194,255,0.18);
        }
        button:hover { filter: brightness(1.03); }
        .hint { color: var(--muted); font-size: 13px; margin-top: 10px; }
        pre {
          margin: 0;
          white-space: pre-wrap;
          background: #09101f;
          color: #e8efff;
          border: 1px solid var(--border);
          padding: 18px;
          border-radius: 14px;
          overflow-x: auto;
          min-height: 260px;
          line-height: 1.55;
        }
        .output-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 0 10px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          border-radius: 999px;
          padding: 6px 10px;
          color: var(--muted);
          font-size: 12px;
        }
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; }
          h1 { font-size: 30px; }
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="hero">
          <div class="card hero-main">
            <div class="eyebrow">Policy Brain</div>
            <h1>Policy copilot for draft review and legislation analysis</h1>
            <div class="subtitle">
              Paste a draft document or policy text, choose a mode, and get a Cloudflare-style readout grounded in the live corpus.
            </div>
          </div>
          <div class="card panel status-grid">
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
            <label for="voice">Voice:</label>
            <input id="voice" value="Alyssa-CLO-public-comment" />
          </div>

          <div class="hint">
            Tip: use Draft review for redlines/comments on your own writing; use Legislation / policy analysis for stance and comment drafting.
          </div>
        </div>

        <div class="card panel" style="margin-top: 20px;">
          <div class="output-head">
            <div class="pill">Response</div>
            <div class="pill" id="loadState">Ready</div>
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

analyzeBtn.addEventListener('click', async () => {
  outputEl.textContent = 'Analyzing...';
  loadState.textContent = 'Working';
  try {
    const res = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: modeEl.value,
        text: textEl.value,
        voice: voiceEl.value
      })
    });

    const data = await res.json();
    outputEl.innerHTML = formatResponse(data);
    loadState.textContent = res.ok ? 'Done' : 'Error';
  } catch (err) {
    outputEl.textContent = 'Error: ' + err.message;
    loadState.textContent = 'Error';
  }
});

function formatResponse(data) {
  if (!data) return '<div>No response.</div>';
  if (data.error) return '<div style="color:#ff9b9b;"><strong>Error:</strong> ' + escapeHtml(String(data.error)) + '</div>';

  const output = String(data.output || '').trim();
  if (!output) return '<div>No output.</div>';

  return '<div style="white-space: pre-wrap; background: #09101f; color: #e8efff; border: 1px solid rgba(255,255,255,0.08); padding: 18px; border-radius: 14px; margin: 0;">' +
    escapeHtml(output) +
  '</div>';
}

  const output = String(data.output || '').trim();
  if (!output) return '<div>No output.</div>';

  return '<div style="white-space: pre-wrap; background: #09101f; color: #e8efff; border: 1px solid rgba(255,255,255,0.08); padding: 18px; border-radius: 14px; margin: 0;">' +
    escapeHtml(output) +
  '</div>';
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
        const body = await request.json();
        const mode = body.mode || 'legislation';
        const inputText = body.text || '';
        const voice = body.voice || 'Alyssa-CLO-public-comment';

        if (!inputText.trim()) {
          return json({ error: 'Missing text input.' }, 400);
        }

        const corpusText = await fetchCorpusFromR2(env, inputText);
        const prompt = buildPrompt({ mode, inputText, voice, corpusText });

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

function buildPrompt({ mode, inputText, voice, corpusText }) {
  const corpusBlock = corpusText
    ? `\n\nRelevant corpus data:\n${corpusText}`
    : "\n\nRelevant corpus data: (none provided)";

  if (mode === "draft-review") {
    return `You are a Cloudflare policy copilot. The user provided a draft document.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Explain what Alyssa would likely say.\n2. List concrete comments she would leave.\n3. Suggest revised wording where appropriate.\n4. Keep the tone measured, policy-grounded, and concise.\n5. If the corpus does not contain a direct precedent, say so explicitly and avoid overconfident conclusions.\n\nDraft text:\n${inputText}${corpusBlock}\n\nReturn:\n- brief assessment\n- bullet comments\n- suggested edits\n- unresolved questions`;
  }

    return `You are a Cloudflare policy copilot. The user provided legislation, a consultation, or a regulatory proposal.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Infer Cloudflare's likely stance only if supported by the corpus.\n2. If the corpus does not contain a direct precedent, say so explicitly.\n3. Draft a concise internal stance memo.\n4. Draft a short public comment in Cloudflare's voice.\n5. Surface only the most important unresolved questions.\n6. Avoid overconfident conclusions and avoid legal advice framing.\n\nPolicy input:\n${inputText}${corpusBlock}\n\nReturn:\n- stance summary\n- internal memo\n- draft comment\n- open questions`;
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

