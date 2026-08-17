# Python Learning Studio Ultra — AI Tutor Gateway

This directory contains the **server-side gateway** required to connect the browser/mobile application to a real AI model without exposing an API key in GitHub Pages, a PWA, or a mobile package.

## Architecture

```text
Student / Python Learning Studio Ultra
        |
        | HTTPS JSON request
        v
AI Tutor Gateway (server-side)
        |
        | secret API key from environment variable
        v
OpenAI Responses API
        |
        v
Pedagogical reply -> Gateway -> Student
```

The application itself stores only the **Gateway URL**. It does not store the OpenAI API key.

## Required server environment variables

- `OPENAI_API_KEY` — secret OpenAI API key. Never commit this value to GitHub.
- `OPENAI_MODEL` — optional model identifier. The included worker defaults to `gpt-5.6`.
- `ALLOWED_ORIGIN` — recommended production value: the exact deployed app origin, e.g. `https://y0bahrambeigi.github.io` or the final custom domain.

## Endpoint contract

The client sends a POST request such as:

```json
{
  "question": "چرا ماتریس سختی من تکین شده؟",
  "mode": "civil",
  "language": "fa",
  "code": "...current Python code...",
  "console": "...recent console output...",
  "lesson": {
    "title": "خرپای دوبعدی",
    "exercise": "..."
  }
}
```

The gateway returns:

```json
{
  "reply": "...AI Tutor response...",
  "mode": "civil",
  "model": "gpt-5.6"
}
```

## Tutor modes

- `hint` — progressive hint-first assistance; avoids immediately revealing the final solution.
- `debug` — systematic Python debugging and root-cause analysis.
- `explain` — concept explanation with a minimal example and engineering interpretation.
- `civil` — computational civil/structural engineering guidance with checks for units, assumptions, boundary conditions, and numerical validity.

## Production security checklist

1. Keep API keys only in server environment/secrets.
2. Restrict `ALLOWED_ORIGIN` to the production app domain.
3. Add provider/platform rate limiting before public launch.
4. Set project budgets and usage alerts with the AI provider.
5. Do not transmit unnecessary personal or student-identifying data.
6. Log only operational metadata needed for reliability; avoid storing student code/questions by default.
7. For research use, obtain the required institutional ethics/privacy approvals before collecting learning analytics.

## Front-end setup

After deploying the worker/function, open **AI Tutor** in Python Learning Studio Ultra, paste the HTTPS gateway URL into the `AI Gateway endpoint` field, and press **اتصال**.

If the endpoint is unavailable, the application automatically falls back to the built-in local tutor so that basic guidance remains available offline.
