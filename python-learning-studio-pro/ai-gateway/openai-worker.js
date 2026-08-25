// Python Learning Studio Ultra — secure AI Tutor gateway
// Deploy this file as a server-side worker/function and store secrets as environment variables.
// Required secret: OPENAI_API_KEY
// Optional: OPENAI_MODEL (default: gpt-5.6), ALLOWED_ORIGIN

function corsHeaders(origin, allowed) {
  const permit = !allowed || allowed === "*" || origin === allowed ? origin || "*" : allowed;
  return {
    "Access-Control-Allow-Origin": permit,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const parts = [];
  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;
    for (const c of item.content || []) {
      if ((c.type === "output_text" || c.type === "text") && c.text) parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}

function tutorInstructions(mode) {
  const modeRules = {
    hint: "Use progressive hints. Do not reveal the full final solution immediately. Give the smallest useful next step, then invite a retry.",
    debug: "Debug systematically. Identify the first likely root cause, explain why, and propose a minimal diagnostic or correction. Do not rewrite the whole program unless asked.",
    explain: "Teach the concept with a short definition, one minimal example, and one engineering-oriented interpretation when relevant.",
    civil: "Act as a computational civil/structural engineering tutor. Check assumptions, units, boundary conditions, numerical validity, and reproducibility. Do not present safety-critical engineering conclusions as professionally validated design advice."
  };
  return `You are the AI Tutor inside Python Learning Studio Ultra, an educational environment for Python, scientific computing, and computational civil engineering.
Respond primarily in Persian unless the learner asks otherwise.
Be concise, pedagogical, technically precise, and encouraging without giving empty praise.
Follow a hint-first teaching strategy. Ask the learner to reason or retry when appropriate.
Never claim that an engineering result is professionally verified merely because code executed successfully.
Separate programming errors from engineering-model assumptions.
${modeRules[mode] || modeRules.hint}`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const cors = corsHeaders(origin, allowedOrigin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
    if (!env.OPENAI_API_KEY) return json({ error: "Server AI key is not configured" }, 503, cors);

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 50000) return json({ error: "Request too large" }, 413, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Invalid JSON" }, 400, cors); }

    const question = String(body.question || "").trim().slice(0, 8000);
    if (!question) return json({ error: "Question is required" }, 400, cors);

    const mode = ["hint", "debug", "explain", "civil"].includes(body.mode) ? body.mode : "hint";
    const code = String(body.code || "").slice(0, 12000);
    const consoleText = String(body.console || "").slice(-4000);
    const lessonTitle = String(body.lesson?.title || "").slice(0, 300);
    const exercise = String(body.lesson?.exercise || "").slice(0, 1500);

    const learnerContext = [
      `Learner question:\n${question}`,
      lessonTitle ? `Current lesson: ${lessonTitle}` : "",
      exercise ? `Current exercise: ${exercise}` : "",
      code ? `Current Python code:\n\`\`\`python\n${code}\n\`\`\`` : "",
      consoleText ? `Recent console output:\n\`\`\`text\n${consoleText}\n\`\`\`` : ""
    ].filter(Boolean).join("\n\n");

    const payload = {
      model: env.OPENAI_MODEL || "gpt-5.6",
      instructions: tutorInstructions(mode),
      input: learnerContext,
      max_output_tokens: 900
    };

    let upstream;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      return json({ error: "AI provider connection failed", detail: String(error) }, 502, cors);
    }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({ error: "AI provider returned an error", provider_status: upstream.status }, 502, cors);
    }

    const reply = extractOutputText(data);
    if (!reply) return json({ error: "AI provider returned no readable text" }, 502, cors);

    return json({ reply, mode, model: payload.model }, 200, cors);
  }
};
