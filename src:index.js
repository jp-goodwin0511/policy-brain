export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "policy-brain-worker" });
    }

    if (url.pathname === "/analyze" && request.method === "POST") {
      const body = await request.json();
      const mode = body.mode || "legislation";
      const inputText = body.text || "";
      const voice = body.voice || "Alyssa-CLO-public-comment";

      if (!inputText.trim()) {
        return json({ error: "Missing text input." }, 400);
      }

      const sources = await getRelevantSources(env, inputText);

      const prompt = buildPrompt({ mode, inputText, voice, sources });
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt,
        max_tokens: 1200,
        temperature: 0.3,
      });

      return json({
        mode,
        voice,
        sources,
        output: response.response || response,
      });
    }

    return json({ error: "Not found" }, 404);
  },
};

async function getRelevantSources(env, text) {
  if (!env.DB) return [];

  const keywords = extractKeywords(text);
  if (keywords.length === 0) return [];

  const placeholders = keywords.map(() => "?").join(",");
  const query = `
    SELECT file_id, original_title, folder_path, topic, jurisdiction, status, core_score, drive_link
    FROM documents
    WHERE (
      lower(original_title) LIKE ${keywords.map(() => "? LIKE '%' || lower(original_title) || '%'").join(" OR ")}
      OR lower(folder_path) LIKE ${keywords.map(() => "? LIKE '%' || lower(folder_path) || '%'").join(" OR ")}
      OR lower(topic) LIKE ${keywords.map(() => "? LIKE '%' || lower(topic) || '%'").join(" OR ")}
    )
    ORDER BY core_score DESC
    LIMIT 8
  `;

  const params = [];
  for (const k of keywords) {
    params.push(`%${k}%`);
  }
  for (const k of keywords) {
    params.push(`%${k}%`);
  }
  for (const k of keywords) {
    params.push(`%${k}%`);
  }

  try {
    const rows = await env.DB.prepare(query).bind(...params).all();
    return rows.results || [];
  } catch (e) {
    return [];
  }
}

function extractKeywords(text) {
  return Array.from(
    new Set(
      String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 4)
        .slice(0, 12)
    )
  );
}

function buildPrompt({ mode, inputText, voice, sources }) {
  const sourceBlock = sources.length
    ? sources
        .map(
          (s, i) =>
            `${i + 1}. ${s.original_title} | topic=${s.topic} | jurisdiction=${s.jurisdiction} | status=${s.status} | score=${s.core_score}`
        )
        .join("\n")
    : "(no relevant sources found)";

  if (mode === "draft-review") {
    return `You are a Cloudflare policy copilot. The user provided a draft document.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Explain what Alyssa would likely say.\n2. List concrete comments she would leave.\n3. Suggest revised wording where appropriate.\n4. Keep the tone measured, policy-grounded, and concise.\n\nDraft text:\n${inputText}\n\nRelevant source documents:\n${sourceBlock}\n\nReturn:\n- brief assessment\n- bullet comments\n- suggested edits\n- unresolved questions`;
  }

  return `You are a Cloudflare policy copilot. The user provided legislation, a consultation, or a regulatory proposal.\n\nWrite in the voice profile: ${voice}.\n\nTask:\n1. Infer Cloudflare's likely stance.\n2. Draft a short internal stance memo.\n3. Draft a CLO-style public comment or letter.\n4. Surface unresolved questions for human review.\n5. Use a clear, measured, policy-grounded style.\n\nPolicy input:\n${inputText}\n\nRelevant source documents:\n${sourceBlock}\n\nReturn:\n- stance summary\n- internal memo\n- draft comment\n- open questions`;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
