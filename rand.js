import fs from 'fs';

const keywords = [
  "Kite AI", "blockchain", "AI", "Proof of AI", "decentralized", "transparency",
  "collaboration", "scalability", "data subnets", "model subnets", "agent subnets",
  "intelligent applications", "democratize AI", "open collaboration", "infrastructure",
  "smart contracts", "NFT", "DeFi", "crypto mining", "machine learning",
  "AI governance", "Web3", "DAO", "metaverse", "hashing", "public ledger",
  "crypto wallet", "Ethereum", "Bitcoin", "staking", "consensus mechanism",
  "privacy coins", "oracles", "layer 2 scaling", "quantum computing in blockchain",
  "AI-powered trading", "automated decision-making", "neural networks",
  "AI-driven security", "tokenomics", "game theory in crypto", "zero-knowledge proofs",
  "crypto regulation", "AI-generated content", "self-sovereign identity",
  "AI ethics", "cryptographic security", "AI and decentralized finance",
  "smart contracts automation", "distributed ledger", "blockchain interoperability",
  "AI bias", "data privacy", "edge computing in AI", "robotic process automation",
  "machine learning fairness", "proof of stake", "proof of work",
  "security tokens", "non-fungible tokens", "AI-driven fraud detection"
];

const extraPhrases = [
  "in the future", "impact on economy", "challenges faced", "advantages and disadvantages",
  "real-world applications", "security concerns", "scalability issues",
  "role in financial markets", "integration with IoT", "comparison with traditional systems",
  "future predictions", "ethical concerns", "adoption by enterprises",
  "potential for mass adoption", "innovation opportunities", "current trends",
  "possible risks", "government regulations", "consumer adoption",
  "long-term sustainability", "competitive landscape", "historical background",
  "different use cases", "how it is evolving", "technological breakthroughs",
  "influence on society", "impact on jobs and employment"
];

const starters = [
  "What is", "How does", "Why is", "Can you explain", "What are the benefits of",
  "How can", "What makes", "What are the features of", "What is the purpose of",
  "Why should we use", "What are the risks of", "What are the future prospects of",
  "How does it compare to", "Is there any limitation in", "What are the key challenges in",
  "How can we improve", "What does it mean for", "What are the core principles behind",
  "What are the security implications of", "How is it different from", "Why should businesses consider",
  "What are the ethical considerations in", "How do experts see the future of",
  "Why do investors focus on", "What are the biggest myths about", "What industries will benefit from",
  "Can it be integrated with", "What factors influence", "How do regulations impact",
  "What is the relationship between", "How does innovation drive"
];

function generateRandomQuestion() {
  const randomStarter = starters[Math.floor(Math.random() * starters.length)];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  const randomExtra = extraPhrases[Math.floor(Math.random() * extraPhrases.length)];
  
  return `${randomStarter} ${randomKeyword} ${randomExtra}?`;
}

function generateQuestions(count = 100) {
  return Array.from({ length: count }, () => generateRandomQuestion());
}

function saveQuestionsToFile(filename = 'random_questions.json', count = 1000) {
  const randomQuestions = generateQuestions(count);
  fs.writeFileSync(filename, JSON.stringify(randomQuestions, null, 2));
  console.log(`✅ ${count} pertanyaan acak telah disimpan di ${filename}`);
}

const questionCount = 10000;
saveQuestionsToFile('random_questions.json', questionCount);
