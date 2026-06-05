import axios from "axios";

const DEFAULT_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_FALLBACK_MODELS = [
  "google/gemini-2.0-flash-001:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

const getApiUrl = () =>
  process.env.OPENROUTER_CHAT_COMPLETIONS || DEFAULT_API_URL;

const getModelList = () => {
  const primary = process.env.OPENROUTER_MODEL;
  const fallbacks = process.env.OPENROUTER_FALLBACK_MODELS
    ? process.env.OPENROUTER_FALLBACK_MODELS.split(",").map((m) => m.trim())
    : DEFAULT_FALLBACK_MODELS;

  const models = primary ? [primary, ...fallbacks] : fallbacks;
  return [...new Set(models.filter(Boolean))];
};

const buildHeaders = (title = "Resumind AI") => ({
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  "HTTP-Referer": process.env.CLIENT_URL || "https://resumind-ai.vercel.app",
  "X-Title": title,
  "Content-Type": "application/json",
});

const isRetryableStatus = (status) =>
  status === 404 || status === 429 || status === 502 || status === 503;

const formatApiError = (err, model) => {
  const status = err.response?.status;
  const apiMessage =
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.message;

  return { status, message: apiMessage, model };
};

/**
 * Call OpenRouter chat completions with automatic model fallback.
 */
export const callOpenRouter = async ({
  messages,
  title = "Resumind AI",
  timeout = 60000,
  temperature,
}) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const apiUrl = getApiUrl();
  const models = getModelList();
  let lastError = null;

  for (const model of models) {
    try {
      const payload = { model, messages };
      if (temperature !== undefined) payload.temperature = temperature;

      const response = await axios.post(apiUrl, payload, {
        headers: buildHeaders(title),
        timeout,
      });

      if (response.data?.error) {
        throw new Error(response.data.error.message || "OpenRouter returned an error");
      }

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from OpenRouter");
      }

      console.log(`✅ OpenRouter success with model: ${model}`);
      return { content, model };
    } catch (err) {
      const formatted = formatApiError(err, model);
      lastError = formatted;
      console.error(
        `⚠️ OpenRouter failed [${formatted.status || "network"}] model=${model}: ${formatted.message}`
      );

      if (formatted.status && !isRetryableStatus(formatted.status)) {
        break;
      }
    }
  }

  const err = new Error(lastError?.message || "All OpenRouter models failed");
  err.status = lastError?.status;
  err.model = lastError?.model;
  throw err;
};

export const getOpenRouterErrorResponse = (err, resumeText = "") => {
  const status = err.status || err.response?.status;
  const message = err.message || "Unknown OpenRouter error";

  if (status === 402) {
    return {
      suggestions: [
        "AI Analysis unavailable — OpenRouter credits exhausted.",
        "Add credits at https://openrouter.ai/credits",
      ],
      verdict_summary: "OpenRouter API credits exhausted. Please recharge to enable AI features.",
      error: "OpenRouter API credits exhausted (402)",
      tone_analysis: "AI analysis requires API credits",
    };
  }

  if (status === 429) {
    return {
      suggestions: [
        "AI Analysis temporarily unavailable — rate limit exceeded.",
        "Please wait a moment and try again.",
      ],
      verdict_summary: "Too many requests. Please try again shortly.",
      error: "Rate limit exceeded (429)",
      tone_analysis: "Rate limit exceeded",
    };
  }

  if (status === 401) {
    return {
      suggestions: [
        "AI Analysis unavailable — invalid API key.",
        "Verify OPENROUTER_API_KEY in server environment variables.",
      ],
      verdict_summary: "API authentication failed. Please verify your OpenRouter API key.",
      error: "Invalid API key (401)",
      tone_analysis: "Invalid API key",
    };
  }

  if (status === 404) {
    return {
      suggestions: [
        "AI model not found. Update OPENROUTER_MODEL on the server.",
        "Try: google/gemini-2.0-flash-001:free",
      ],
      verdict_summary: "Configured AI model is unavailable. Server admin should update the model.",
      error: `Model not found (404): ${message}`,
      tone_analysis: "Model unavailable",
    };
  }

  return {
    suggestions: [
      "AI Analysis failed. Please try again later.",
      message,
    ],
    verdict_summary: "Analysis failed. Please try again.",
    error: message,
    tone_analysis: "Unable to analyze",
  };
};
