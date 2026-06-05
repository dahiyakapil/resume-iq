/**
 * Rewrite bullet points sequentially with rate limiting
 * Prevents 429 (rate limit) and reduces 402 (credit exhaustion) errors
 * @param {string[]} bulletPoints - Array of bullet points to rewrite
 * @param {number} delayMs - Delay between requests in milliseconds (default: 500ms)
 * @returns {Promise<string[]>} - Array of rewritten bullet points
 */
export const rewriteBulletPointsSequentially = async (bulletPoints, delayMs = 500) => {
  const { rewriteAISuggestionWithOpenRouter } = await import('./rewriteAISuggestionWithOpenRouter.js');
  const rewrites = [];
  
  if (!bulletPoints || bulletPoints.length === 0) {
    return [];
  }

  console.log(`[REWRITE-SEQUENTIAL] Processing ${bulletPoints.length} bullet points with ${delayMs}ms delay...`);

  for (let i = 0; i < bulletPoints.length; i++) {
    const bp = bulletPoints[i];
    
    try {
      console.log(`[REWRITE] ${i + 1}/${bulletPoints.length}: Processing bullet point`);
      
      const rewritten = await rewriteAISuggestionWithOpenRouter(bp);
      
      // Validate rewritten content
      if (!rewritten || rewritten.length < 10) {
        console.log(`[REWRITE] ${i + 1}/${bulletPoints.length}: Using original (rewrite too short)`);
        rewrites.push(bp);
      } else {
        console.log(`[REWRITE] ${i + 1}/${bulletPoints.length}: ✅ Success`);
        rewrites.push(rewritten);
      }
      
      // Add delay between requests to avoid rate limiting (except for last one)
      if (i < bulletPoints.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
    } catch (e) {
      console.error(`[REWRITE] ${i + 1}/${bulletPoints.length}: ❌ Failed:`, e.message);
      rewrites.push(bp); // Use original if rewrite fails
    }
  }

  console.log(`[REWRITE-SEQUENTIAL] ✅ Completed all ${rewrites.length} bullet points`);
  return rewrites;
};
