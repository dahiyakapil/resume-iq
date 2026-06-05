import { callOpenRouter } from "./openRouterClient.js";

export const jobMatchDeepSeekResponse = async (prompt) => {
  try {
    const { content, model } = await callOpenRouter({
      messages: [
        {
          role: "system",
          content: "You are an expert resume-job match AI. Respond only in JSON.",
        },
        { role: "user", content: prompt },
      ],
      title: "Resumind AI Job Match",
      timeout: 20000,
    });

    console.log("▶ OpenRouter Job Match success, model:", model);
    return content;
  } catch (error) {
    console.error("❌ OpenRouter Fetch Error:", error.message);
    throw new Error("Failed to get job match response");
  }
};
