import OpenAI from "openai";
import { logger } from "../utils/logger.js";

export class ContentOptimizationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey:
        "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",
    });
  }

  async optimizeContent(content, keywords) {
    try {
      const prompt = this.buildOptimizationPrompt(content, keywords);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an SEO expert specialized in content optimization. Optimize content while maintaining readability and natural flow.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return {
        optimizedContent: completion.choices[0].message.content,
        keywordDensity: this.calculateKeywordDensity(
          completion.choices[0].message.content,
          keywords,
        ),
      };
    } catch (error) {
      logger.error("Content optimization failed:", error);
      throw error;
    }
  }

  buildOptimizationPrompt(content, keywords) {
    return `
Please optimize the following content for SEO using these target keywords: ${keywords.join(", ")}

Content to optimize:
${content}

Requirements:
1. Maintain natural readability
2. Include keywords strategically
3. Optimize headings and subheadings
4. Ensure proper keyword density
5. Add meta description suggestion
`;
  }

  calculateKeywordDensity(content, keywords) {
    const wordCount = content.split(/\s+/).length;
    const keywordDensity = {};

    keywords.forEach((keyword) => {
      const regex = new RegExp(keyword, "gi");
      const matches = content.match(regex) || [];
      keywordDensity[keyword] = (matches.length / wordCount) * 100;
    });

    return keywordDensity;
  }
}
