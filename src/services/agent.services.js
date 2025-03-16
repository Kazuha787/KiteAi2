import axios from "axios";
import fs from "fs";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import { rateLimitConfig, proxyConfig  } from "../../config.js";
import groqService from "./groq.service.js";
import { sleep } from "../utils/helpers.js";
import dashboard from "../ui/dashboard.js";

class AgentService {
  constructor() {
    this.lastRequestTime = Date.now();
    this.timeout = 30000;
    this.proxyIndex = 0;
    this.proxies = proxyConfig.useProxy ? this.loadProxies() : [];
    this.currentProxy = null;
    this.axiosInstance = proxyConfig.useProxy ? this.createAxiosInstance(this.getNextProxy()) : axios.create({
      headers: { "Content-Type": "application/json" },
      timeout: this.timeout,
    });

    if (!proxyConfig.useProxy) {
      dashboard.log("🚀 Running without proxy.");
    }
  }

  loadProxies() {
    try {
      const proxies = fs
        .readFileSync("proxies.txt", "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("http"));

      if (proxies.length === 0) {
        dashboard.log("No valid proxies found in proxies.txt!");
        process.exit(1);
      }

      return proxies;
    } catch (error) {
      dashboard.log("Error reading proxies.txt:", error.message);
      process.exit(1);
    }
  }

  getNextProxy() {
    if (!proxyConfig.useProxy || this.proxies.length === 0) return null;

    this.currentProxy = this.proxies[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % this.proxies.length;
    
    return this.currentProxy;
  }

  createAxiosInstance(proxyUrl) {
    if (!proxyConfig.useProxy || !proxyUrl) {
      return axios.create({
        headers: { "Content-Type": "application/json" },
        timeout: this.timeout,
      });
    }

    const isHttp = proxyUrl.startsWith("http://");
    const agent = isHttp ? new HttpProxyAgent(proxyUrl) : new HttpsProxyAgent(proxyUrl);

    return axios.create({
      headers: { "Content-Type": "application/json" },
      timeout: this.timeout,
      proxy: false,
      httpAgent: isHttp ? agent : undefined,
      httpsAgent: !isHttp ? agent : undefined,
    });
  }

  async updateProxy() {
    if (!proxyConfig.useProxy) return;
    const proxyUrl = this.getNextProxy();
    this.axiosInstance = this.createAxiosInstance(proxyUrl);
  }

  async getCurrentIP() {
    if (!proxyConfig.useProxy) return "Direct Connection";
    
    try {
      const response = await this.axiosInstance.get("http://api64.ipify.org?format=json");
      return response.data.ip || "Unknown";
    } catch (error) {
      dashboard.log("Error fetching proxy IP:", error.message);
      return "Unknown";
    }
  }

  calculateDelay(attempt) {
    return Math.min(
      rateLimitConfig.maxDelay,
      rateLimitConfig.baseDelay * Math.pow(2, attempt)
    );
  }

  async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minimumInterval = 60000 / rateLimitConfig.requestsPerMinute;

    if (timeSinceLastRequest < minimumInterval) {
      const waitTime = minimumInterval - timeSinceLastRequest;
      await sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  async sendQuestion(agent) {
    try {
      await this.checkRateLimit();
      const currentIP = await this.getCurrentIP();
      dashboard.log(`Using Proxy IP: ${currentIP}`);
  
      let question = await groqService.generateQuestion();
      question = `Answer the following question very briefly: ${question}`;
      dashboard.log(`Question generated: ${question}`);
  
      const axiosInstance = axios.create({
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        responseType: "stream",   
        timeout: this.timeout
      });
  
      const payload = {
        message: question,
        stream: true
      };
  
      const response = await axiosInstance.post(
        `https://${agent.toLowerCase().replace("_", "-")}.stag-vxzy.zettablock.com/main`,
        payload
      );
  
      let finalText = "";
  
      return new Promise((resolve, reject) => {
        response.data.on("data", (chunk) => {
          const lines = chunk.toString("utf8").split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.slice("data: ".length).trim();
              if (jsonStr === "[DONE]") {
                resolve({
                  question,
                  response: finalText
                });
                return;
              }
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed?.choices?.[0]?.delta?.content;
                if (content) {
                  finalText += content;
                }
              } catch (err) {
                console.error("JSON parse error on chunk:", err.message);
              }
            }
          }
        });
  
        response.data.on("end", () => {
          resolve({
            question,
            response: finalText
          });
        });
  
        response.data.on("error", (err) => {
          reject(err);
        });
      });
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        throw new Error(`Request timeout after ${this.timeout / 1000} seconds`);
      }
      throw error;
    }
  }
  

  async reportUsage(wallet, options, retryCount = 0) {
    try {
      await this.checkRateLimit();

      const agentId = options.agent_id.includes("-")
        ? options.agent_id.replace("-", "_")
        : options.agent_id;

      const payload = {
        wallet_address: wallet,
        agent_id: agentId,
        request_text: options.question,
        response_text: options.response,
        request_metadata: {},
      };

      const response = await this.axiosInstance.post(
        "https://quests-usage-dev.prod.zettablock.com/api/report_usage",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: this.timeout,
        }
      );

      if (response.data?.message === "Usage report successfully recorded") {
        return true;
      } else {
        dashboard.log("Unexpected response:", response.data);
        return false;
      }
    } catch (error) {
      dashboard.logconsole.error("Report usage error:", error.message);

      if (error.response) {
        dashboard.log("Response data:", error.response.data);
        dashboard.log("Response status:", error.response.status);
      }

      const isRateLimit = error.response?.data?.error?.includes(
        "Rate limit exceeded"
      );

      if (isRateLimit && retryCount < rateLimitConfig.maxRetries) {
        const delay = this.calculateDelay(retryCount);
        dashboard.log(
          `Rate limit detected, retrying in ${delay / 1000} seconds...`
        );
        await sleep(delay);
        return this.reportUsage(wallet, options, retryCount + 1);
      }

      return false;
    }
  }
}

export default new AgentService();
