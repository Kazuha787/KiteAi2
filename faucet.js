import fs from "fs";
import path from "path";
import axios from "axios";
import { Solver } from "@2captcha/captcha-solver";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";

function maskWallet(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// ------------------------- CONFIG -------------------------
const API_KEY = "8dde1ccc9ba43f7b307811cf13fb0f6f"; 
const SITE_KEY = "6LeNaK8qAAAAAHLuyTlCrZD_U1UoFLcCTLoa_69T"; 
const PAGE_URL = "https://faucet.gokite.ai";
const FAUCET_API_URL = "https://faucet.gokite.ai/api/sendToken";

// File
const walletsFile = path.join(process.cwd(), "wallets.txt");
const privFile = path.join(process.cwd(), "priv.txt");
const successFile = path.join(process.cwd(), "success.txt");
const proxiesFile = path.join(process.cwd(), "proxies.txt");

// ------------------------- UTILS -------------------------
function loadWallets() {
  try {
    const content = fs.readFileSync(walletsFile, "utf8");
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
  } catch (error) {
    console.error("Error reading wallets.txt:", error.message);
    process.exit(1);
  }
}

function loadPrivateKeys() {
  try {
    const content = fs.readFileSync(privFile, "utf8");
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");
  } catch (error) {
    console.error("Error reading priv.txt:", error.message);
    process.exit(1);
  }
}

function loadWalletPairs() {
  const wallets = loadWallets();
  const privKeys = loadPrivateKeys();
  if (wallets.length !== privKeys.length) {
    console.error("line of wallets.txt and priv.txt not match");
    process.exit(1);
  }
  return wallets.map((wallet, idx) => ({
    wallet,
    priv: privKeys[idx]
  }));
}

function logSuccess(wallet, priv, txHash) {
  try {
    fs.appendFileSync(successFile, `${wallet}:${priv}:https://testnet.kitescan.ai/tx/${txHash}\n`, "utf8");
    console.log(`✅ Logged success for wallet: ${maskWallet(wallet)} - Link: https://testnet.kitescan.ai/tx/${txHash}`);
  } catch (error) {
    console.error("Error writing to success.txt:", error.message);
  }
}

function standardizeProxy(proxyStr) {
  if (proxyStr.includes("://")) {
    return proxyStr;
  }
  const parts = proxyStr.split(":");
  if (parts.length === 4) {
    const [ip, port, user, pass] = parts;
    return `http://${user}:${pass}@${ip}:${port}`;
  }
  return proxyStr;
}

function loadAndStandardizeProxies(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(standardizeProxy);
  } catch (error) {
    console.error("Error reading proxies.txt:", error.message);
    return [];
  }
}

const proxies = loadAndStandardizeProxies(proxiesFile);
let proxyIndex = 0;
function getNextProxy() {
  if (proxies.length === 0) return null;
  const proxy = proxies[proxyIndex];
  proxyIndex = (proxyIndex + 1) % proxies.length;
  return proxy;
}

function createAxiosInstance(proxyUrl) {
  if (!proxyUrl) {
    console.log("🚀 Using direct connection (No Proxy)");
    return axios.create({ timeout: 30000 });
  }
  const isHttp = proxyUrl.startsWith("http://");
  const agent = isHttp ? new HttpProxyAgent(proxyUrl) : new HttpsProxyAgent(proxyUrl);

  return axios.create({
    timeout: 30000,
    proxy: false,
    httpAgent: isHttp ? agent : undefined,
    httpsAgent: !isHttp ? agent : undefined,
  });
}

async function getProxyIP(axiosInstance) {
  try {
    const response = await axiosInstance.get("http://api64.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    console.log("⚠️ Failed to fetch proxy IP.");
    return "Unknown";
  }
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ------------------------- 2CAPTCHA -------------------------
const solver = new Solver(API_KEY);

async function solveRecaptcha(proxy) {
  try {
    console.log("🔄 Sending CAPTCHA request to 2Captcha...");
    const cleanedProxy = proxy ? proxy.replace(/^https?:\/\//, "") : "";
    const proxytype = proxy && proxy.startsWith("http://") ? "HTTP" : "HTTPS";

    const solution = await solver.recaptcha({
      googlekey: SITE_KEY,
      pageurl: PAGE_URL,
      proxy: cleanedProxy,
      proxytype: proxy ? proxytype : "",
    });

    console.log("✅ CAPTCHA solved");
    return solution.data;
  } catch (error) {
    console.error("❌ Error solving CAPTCHA:", error.message);
    return null;
  }
}

// ------------------------- FAUCET KITE -------------------------
async function claimKiteFaucet(wallet, recaptchaToken, proxy) {
  const axiosInstance = createAxiosInstance(proxy);
  const proxyIP = await getProxyIP(axiosInstance);
  console.log(`🌍 Using Proxy IP: ${proxyIP}`);

  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://faucet.gokite.ai",
    "Referer": "https://faucet.gokite.ai/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
  };

  try {
    const payload = {
      address: wallet,
      chain: "KITE",
      couponId: "",
      token: "",
      v2Token: recaptchaToken
    };

    const response = await axiosInstance.post(FAUCET_API_URL, payload, { headers });

    if (response.data && response.data.message?.includes("Transaction successful on KiteAI Testnet")) {
      const txHash = response.data.txHash || "";
      console.log(`🎉 Faucet success for wallet: ${maskWallet(wallet)} - txHash: ${txHash}`);
      return { status: "success", txHash };
    } else {
      console.log("⚠️ Faucet failed:", response.data);
      return { status: "failed" };
    }
  } catch (error) {
    console.error("❌ Error faucet claim:", error.response?.data || error.message);
    return { status: "failed" };
  }
}

// ------------------------- PROCESS WALLET -------------------------
async function processWallet(pair) {
  const { wallet, priv } = pair;

  while (true) {
    const proxy = getNextProxy();
    const axiosInstance = createAxiosInstance(proxy);
    const proxyIP = await getProxyIP(axiosInstance);
    console.log(`\n🔄 Processing wallet: ${maskWallet(wallet)} with proxy IP: ${proxyIP}`);

    const recaptchaToken = await solveRecaptcha(proxy);
    if (!recaptchaToken) {
      console.log("🔁 CAPTCHA solving failed. Retrying...");
      await delay(3000);
      continue;
    }

    const result = await claimKiteFaucet(wallet, recaptchaToken, proxy);
    if (result.status === "success") {
      logSuccess(wallet, priv, result.txHash);
      break;
    } else {
      console.log("🔁 Claim failed. Retrying with next proxy...");
      await delay(3000);
    }
  }
}

// ------------------------- PROCESS ALL WALLETS -------------------------
async function processAllWallets() {
  const pairs = loadWalletPairs();
  for (const pair of pairs) {
    await processWallet(pair);
  }
  console.log("✅ All wallets processed.");
}

processAllWallets().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
