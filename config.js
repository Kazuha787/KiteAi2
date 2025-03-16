export const rateLimitConfig = {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 10000,
    requestsPerMinute: 15,
    intervalBetweenCycles: 20000,
    walletVerificationRetries: 3,
  };
  
  export const agents = {
    deployment_vxJKb0YqfT5VLWZU7okKWa8L: "Professor",
    deployment_fseGykIvCLs3m9Nrpe9Zguy9: "Crypto Buddy",
    // deployment_nC8HdPWdvy8SNOoYpA5SqCVc: "Sherlock",
  };
  
  export const groqConfig = {
    apiKey: "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",
    model: "mixtral-8x7b-32768",
    temperature: 0.7,
  };
  
  export const refCode = {
    code: "R7H32kqJ"
  }
  
  export const proxyConfig = {
    useProxy: true, // false if not use proxy
};
