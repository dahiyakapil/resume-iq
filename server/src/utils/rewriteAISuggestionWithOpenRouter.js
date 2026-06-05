import { callOpenRouter } from "./openRouterClient.js";

export const rewriteAISuggestionWithOpenRouter = async (text) => {
  const prompt = `
You are an expert resume writing assistant.

Rewrite the following resume bullet point to be stronger, concise, and start with a powerful action verb.

Return ONLY one rewritten bullet point. DO NOT return multiple options. DO NOT include explanations, footnotes, markdown, or comments.

Just respond with one clean bullet point.

Original:
"${text}"

Rewritten:
`;

  try {
    const { content } = await callOpenRouter({
      messages: [
        { role: "system", content: "You are a resume rewriting assistant." },
        { role: "user", content: prompt },
      ],
      title: "Resumind AI Rewrite Tool",
      timeout: 30000,
    });

    let result = content.trim();
    result = result.split("\n")[0];
    result = result.replace(/^["'""]+|["'""]+$/g, "").trim();

    if (result.includes(" or ")) {
      result = result.split(" or ")[0].trim();
    }

    return result || text;
  } catch (err) {
    console.error("⚠️ AI Rewrite Error:", err.message);
    return text;
  }
};
