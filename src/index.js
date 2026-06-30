const CORPUS_JSON_URL = "https://script.google.com/a/macros/cloudflare.com/s/AKfycbzI32BLudkXgQIAPycWMjRnmlOmRCAmnYJyIMUYOXum6K8fR-4CJqdi3G0kv4935VWF/exec?sheet=Core%20Corpus";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "policy-brain-worker", mode: "no-d1", corpusJsonUrl: CORPUS_JSON_URL });
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
