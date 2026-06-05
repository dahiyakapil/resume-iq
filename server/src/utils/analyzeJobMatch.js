import {jobMatchDeepSeekResponse} from "./jobMatchDeepSeekResponse.js"


export const analyzeJobMatch = async (resumeText, jobDesc) => {
const prompt = `
You're an elite AI trained on 100,000+ job descriptions and top-tier resumes. Your job is to **deeply evaluate a candidate's resume against a job description**, considering real-world hiring practices, recruiter scanning habits, and ATS systems.

🧠 Evaluate based on:
- Skill & keyword matching
- Alignment of responsibilities and accomplishments
- Project relevance and tech stack overlap
- Depth of experience (years, tools, outcomes)
- Missing but critical skills for the job
- Strong vs. weak phrasing (action verbs, vague terms)

🧪 Check for:
- Buzzwords vs. impactful skills
- Resume clarity and structure
- Measurable impact statements
- Explicit database design or architecture examples

📦 Return valid **JSON only** in this format:

{
  "score": number (0-100), 
  "matched_keywords": [string],
  "missing_keywords": [string],
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string],
  "verdict_summary": string
}

Rules:
- Score 90+ only for resumes with perfect alignment, strong measurable outcomes, and all keywords.
- List at least 3 strengths and 1-3 weaknesses.
- Keep suggestions practical and personalized.
- Do not include any markdown, comments, or extra text.

📝 Candidate Resume:
"""
${resumeText}
"""

📄 Job Description:
"""
${jobDesc}
"""
`;


  const response = await jobMatchDeepSeekResponse(prompt);

  const jsonStart = response.indexOf("{");
  const jsonEnd = response.lastIndexOf("}") + 1;
  const jsonText = response.slice(jsonStart, jsonEnd);

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse JSON from DeepSeek:", response);
    throw new Error("Invalid JSON returned from DeepSeek");
  }
};
