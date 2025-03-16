import { Groq } from "groq-sdk";
import { groqConfig } from "../../config.js";
import dashboard from "../ui/dashboard.js";

const FALLBACK_QUESTIONS = [
  "What are the key benefits of blockchain technology?",
  "How does decentralized finance differ from traditional finance?",
  "What role do smart contracts play in blockchain ecosystems?",
  "How does proof of stake compare to proof of work?",
  "What are the main challenges for blockchain adoption?",
  "How can blockchain improve supply chain transparency?",
  "What are the environmental concerns related to blockchain?",
  "How does Web3 differ from the current internet infrastructure?",
  "What are NFTs and how do they create value?",
  "How can blockchain technology help combat fraud?",
];

class GroqService {
  constructor() {
    this.client = new Groq({
      apiKey: groqConfig.apiKey,
    });
    this.useGroq = true;
    this.connectionErrorCount = 0;
    this.connectionErrorThreshold = 3;
  }

  getRandomFallbackQuestion() {
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
    return FALLBACK_QUESTIONS[randomIndex];
  }

  async generateQuestion() {
    if (
      !this.useGroq ||
      this.connectionErrorCount >= this.connectionErrorThreshold
    ) {
      return this.getRandomFallbackQuestion();
    }

    try {
      const prompt = `Generate a random, engaging question about blockchain, cryptocurrency, or Web3 technology. 
                     Make it thought-provoking and suitable for an AI assistant to answer.
                     Return only the question, nothing else.`;

      const completion = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: groqConfig.model,
        temperature: groqConfig.temperature,
      });

      this.connectionErrorCount = 0;
      return completion.choices[0]?.message?.content?.trim();
    } catch (error) {
      this.connectionErrorCount++;

      if (this.connectionErrorCount >= this.connectionErrorThreshold) {
        dashboard.log(
          `Too many connection errors (${this.connectionErrorCount}). Switching to fallback questions.`
        );
        this.useGroq = false;
      }

      return this.getRandomFallbackQuestion();
    }
  }
}

export default new GroqService();
