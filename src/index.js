const CORPUS_JSON_URL = "https://script.google.com/a/macros/cloudflare.com/s/AKfycbzI32BLudkXgQIAPycWMjRnmlOmRCAmnYJyIMUYOXum6K8fR-4CJqdi3G0kv4935VWF/exec?sheet=Core%20Corpus";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return html(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Policy Brain Copilot</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 16px; }
              textarea { width: 100%; min-height: 220px; padding: 12px; font-size: 14px; }
              select, button, input { font-size: 14px; padding: 10px 12px; }
              button { margin-right: 8px; }
              pre { white-space: pre-wrap; background: #f6f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; }
              .row { margin: 12px 0; }
            </style>
          </head>
          <body>
            <h1>Policy Brain Copilot</h1>
            <p>Paste a draft document or legislation, choose a mode, then click Analyze.</p>

            <div class="row">
              <select id="mode">
                <option value="draft-review">Draft review</option>
                <option value="legislation" selected>Legislation / policy analysis</option>
              </select>
              <button id="analyze">Analyze</button>
            </div>

            <div class="row">
              <textarea id="text" placeholder="Paste a draft document, bill, or consultation here..."></textarea>
            </div>

            <div class="row">
              <label for="voice">Voice:</label>
              <input id="voice" value="Alyssa-CLO-public-comment" style="width: 320px;" />
            </div>

            <div class="row">
              <pre id="output">Results will appear here.</pre>
            </div>

            <script>
              const analyzeBtn = document.getElementById('analyze');
              const textEl = document.getElementById('text');
              const modeEl = document.getElementById('mode');
              const voiceEl = document.getElementById('voice');
              const outputEl = document.getElementById('output');

              analyzeBtn.addEventListener('click', async () => {
                outputEl.textContent = 'Analyzing...';
                try {
                  const res = await fetch('/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      mode: modeEl.value,
                      text: textEl.value,
                      voice: voiceEl.value,
                      corpusJsonUrl: '${CORPUS_JSON_URL}'
                    })
                  });

                  const data = await res.json();
                  outputEl.textContent = JSON.stringify(data, null, 2);
                } catch (err) {
                  outputEl.textContent = 'Error: ' + err.message;
                }
              });
            </script>
          </body>
        </html>
      `);
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "policy-brain-worker",
        mode: "no-d1",
        corpusJsonUrl: CORPUS_JSON_URL
      });
    }

    if (url.pathname === "/analyze" && request.method === "POST") {
      const body = await request.json();
      const mode = body.mode || "legislation";
      const inputText = body.text || "";
      const voice = body.voice || "Alyssa-CLO-public-comment";
      const corpusJsonUrl = body.corpusJsonUrl || CORPUS_JSON_URL;

      if (!inputText.trim()) {
        return json({ error: "Missing text input." }, 400);
      }

      let corpusText = "";
      if (corpusJsonUrl) {
        corpusText = await fetchCorpus(corpusJsonUrl);
      }

      const prompt = buildPrompt({ mode, inputText, voice, corpusText });
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt,
        max_tokens: 1200,
        temperature: 0.3,
      });

      return json({
        mode,
        voice,
        corpusJsonUrl,
        output: response.response || response,
      });
    }

    return json({ error: "Not found" }, 404);
  },
};

async function fetchCorpus(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "policy-brain-worker/1.0" } });
    if (!res.ok) return "";
    const data = await res.json();
    return corpusToText(data);
  } catch {
    return "";
  }
}

function corpusToText(data) {
  if (!data || !Array.isArray(data.rows)) return "";

  return data.rows
    .slice(0, 25)
    .map((row, idx) => {
      const title = row["original_title"] || row["title"] || row["originalTitle"] || "(untitled)";
      const topic = row["topic"] || "";
      const jurisdiction = row["jurisdiction"] || "";
      const status = row["status"] || "";
      const coreScore = row["core_score"] || row["coreScore"] || "";
      const summary = row["summary"] || "";
      return `${idx + 1}. ${title} | topic=${topic} | jurisdiction=${jurisdiction} | status=${status} | score=${coreScore} | summary=${summary}`;
    })
    .join("\n");
}

function buildPrompt({ mode, inputText, voice, corpusText }) {
  const corpusBlock = corpusText
    ? `\n\nRelevant corpus data:\n${corpusText}`
    : "\n\nRelevant corpus data: (none provided)";

  if (mode === "draft-review") {
    return `You are a Cloudflare policy copilot. The user provided a draft document.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Explain what Alyssa would likely say.\n2. List concrete comments she would leave.\n3. Suggest revised wording where appropriate.\n4. Keep the tone measured, policy-grounded, and concise.\n\nDraft text:\n${inputText}${corpusBlock}\n\nReturn:\n- brief assessment\n- bullet comments\n- suggested edits\n- unresolved questions`;
  }

  return `You are a Cloudflare policy copilot. The user provided legislation, a consultation, or a regulatory proposal.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Infer Cloudflare's likely stance.\n2. Draft a short internal stance memo.\n3. Draft a CLO-style public comment or letter.\n4. Surface unresolved questions for human review.\n5. Use a clear, measured, policy-grounded style.\n\nPolicy input:\n${inputText}${corpusBlock}\n\nReturn:\n- stance summary\n- internal memo\n- draft comment\n- open questions`;
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
