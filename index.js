import fetch from 'node-fetch';
import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs/promises';
import {
    banner
} from './banner.js';
import {
    SocksProxyAgent
} from 'socks-proxy-agent';
import {
    HttpsProxyAgent
} from 'https-proxy-agent';


const waitForKeyPress = async () => {
    process.stdin.setRawMode(true);
    return new Promise(resolve => {
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false);
            resolve();
        });
    });
};


async function loadWallets() {
    try {
        const data = await fs.readFile('wallets.txt', 'utf8');
        const wallets = data.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        if (wallets.length === 0) {
            throw new Error('No wallets found in wallets.txt');
        }
        return wallets;
    } catch (err) {
        console.log(`${chalk.red('[ERROR]')} Error reading wallets.txt: ${err.message}`);
        process.exit(1);
    }
}


async function loadProxies() {
    try {
        const data = await fs.readFile('proxies.txt', 'utf8');
        return data.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(proxy => {
                if (proxy.includes('://')) {
                    const url = new URL(proxy);
                    const protocol = url.protocol.replace(':', '');
                    const auth = url.username ? `${url.username}:${url.password}` : '';
                    const host = url.hostname;
                    const port = url.port;
                    return {
                        protocol,
                        host,
                        port,
                        auth
                    };
                } else {
                    const parts = proxy.split(':');
                    let [protocol, host, port, user, pass] = parts;
                    protocol = protocol.replace('//', '');
                    const auth = user && pass ? `${user}:${pass}` : '';
                    return {
                        protocol,
                        host,
                        port,
                        auth
                    };
                }
            });
    } catch (err) {
        console.log(`${chalk.yellow('[INFO]')} No proxy.txt found or error reading file. Using direct connection.`);
        return [];
    }
}


function createAgent(proxy) {
    if (!proxy) return null;

    const {
        protocol,
        host,
        port,
        auth
    } = proxy;
    const authString = auth ? `${auth}@` : '';
    const proxyUrl = `${protocol}://${authString}${host}:${port}`;

    return protocol.startsWith('socks') ?
        new SocksProxyAgent(proxyUrl) :
        new HttpsProxyAgent(proxyUrl);
}

const AI_ENDPOINTS = {
    "https://deployment-htmtbvzpc0vboktahrrv1b7f.stag-vxzy.zettablock.com/main": {
        "agent_id": "deployment_htmTBVZpC0vbOkTAHRrv1b7F",
        "name": "Kite AI Assistant",
        "message": [
            "Tell me about the latest updates in Kite AI",
            "What are the upcoming features in Kite AI?",
            "How can Kite AI improve my development workflow?",
            "What makes Kite AI unique in the market?",
            "Can you explain Kite AI's machine learning capabilities?",
            "What programming languages does Kite AI support best?",
            "How does Kite AI integrate with different IDEs?",
            "How can I optimize my use of Kite AI?",
            "What is the capital city of Canada?",
            "Who was the first person to walk on the Moon?",
            "What is the largest continent by population?",
            "What is the hardest natural substance on Earth?",
            "Which planet is known as the Red Planet?",
            "How many continents are there?",
            "What is the tallest mountain in the world?",
            "What is the longest river in the world?",
            "Who painted the Mona Lisa?",
            "In which country did the Olympic Games originate?",
            "What is the smallest country in the world?",
            "What is the most spoken language in the world?",
            "Who wrote the play Romeo and Juliet?",
            "What is the largest ocean on Earth?",
            "What is the national flower of Japan?",
            "What is the largest desert in the world?",
            "Who invented the telephone?",
            "What is the currency of Japan?",
            "What is the official language of Brazil?",
            "What is the symbol for the chemical element gold?",
            "Which animal is known as the 'King of the Jungle'?",
            "Which country has the most natural lakes?",
            "What is the smallest planet in our solar system?",
            "What is the largest island in the world?",
            "Who is known as the 'Father of Modern Physics'?",
            "What is the longest man-made structure in the world?",
            "What is the largest land animal on Earth?",
            "Which country is home to the Great Barrier Reef?",
            "What is the capital city of France?",
            "What is the largest city in the world by population?",
            "What is the name of the river that runs through Egypt?",
            "Which famous scientist developed the theory of relativity?",
            "What is the tallest building in the world?",
            "Who is known as the 'Father of the Nation' in India?",
            "Which continent has the most countries?",
            "What is the national dish of Italy?",
            "What is the oldest university in the world?",
            "What is the largest species of shark?",
            "What is the most popular social media platform?",
            "What is the national bird of the United States?",
            "What is the longest running TV show in the world?",
            "What is the main ingredient in guacamole?",
            "Which city is known as the 'City of Lights'?",
            "What is the most commonly used programming language?",
            "Which animal is known for its ability to change color?",
            "What is the most valuable brand in the world?",
            "What is the only country in the world to have a flag that is not rectangular?",
            "Who invented the lightbulb?",
            "What is the fastest land animal?",
            "Which country is famous for tulips and windmills?",
            "What is the capital of Australia?",
            "Which planet is closest to the Sun?",
            "What is the official currency of the United Kingdom?",
            "What is the longest-running video game franchise?",
            "What is the oldest known civilization?"
        ]
    },
    "https://deployment-18ozhivejnm9b2a8kwfzrgbj.stag-vxzy.zettablock.com/main": {
        "agent_id": "deployment_18oZhIVeJnm9B2a8kWfZrGbJ",
        "name": "Crypto Price Assistant",
        "message": [
            "What is a blockchain ledger?",
            "How does blockchain ensure security and transparency?",
            "What is the role of cryptography in blockchain?",
            "What are the advantages of using blockchain technology?",
            "What are smart contracts and how do they work?",
            "How does Bitcoin achieve decentralization?",
            "What is Ethereum 2.0 and what improvements does it bring?",
            "What is the main use case for blockchain outside of cryptocurrency?",
            "What is a public key and how is it used in blockchain?",
            "What is a private key and why is it important?",
            "How does a blockchain network reach consensus?",
            "What is a mining pool in the context of blockchain?",
            "What is a sidechain in blockchain?",
            "What is a node in the blockchain network?",
            "How do decentralized applications (DApps) work?",
            "What is the difference between Bitcoin and Ethereum's blockchain?",
            "What is a hash function in blockchain?",
            "What are the benefits of using blockchain for supply chain management?",
            "What is a zero-knowledge proof in blockchain?",
            "What is the difference between Layer 1 and Layer 2 solutions?",
            "How does Proof of Work (PoW) help secure a blockchain?",
            "What is the role of an oracle in blockchain?",
            "What is a wallet address in cryptocurrency?",
            "What is the difference between ERC-20 and ERC-721 tokens?",
            "What is the process of creating a token on Ethereum?",
            "What is a DAO and how does it operate on a blockchain?",
            "What is liquidity farming in DeFi?",
            "What are decentralized finance (DeFi) applications?",
            "What is the significance of the Bitcoin whitepaper?",
            "What is a blockchain fork and why does it occur?",
            "What is a token burn and why is it done?",
            "What is the role of validators in Proof of Stake (PoS)?",
            "What is sharding in the context of blockchain scalability?",
            "What is a decentralized exchange (DEX) and how does it work?",
            "How do airdrops work in cryptocurrency?",
            "What is staking and how does it relate to blockchain?",
            "What is a smart contract audit and why is it necessary?",
            "What is the difference between public and private blockchains?",
            "What is a blockchain bridge?",
            "How does blockchain help in preventing fraud in financial transactions?",
            "What is a Merkle tree and how is it used in blockchain?",
            "What is gas in Ethereum and why is it important?",
            "What is a Proof of Authority (PoA) consensus mechanism?",
            "What is a crypto token swap and how does it work?",
            "What is cross-chain interoperability?",
            "What is the role of a blockchain explorer?",
            "What is the function of a tokenomics model?",
            "What is a cold wallet and how is it used for crypto storage?",
            "What are the risks of using decentralized finance?",
            "What is the role of the Genesis Block in a blockchain?",
            "What is the consensus mechanism used by Polkadot?",
            "What is the Ethereum Virtual Machine (EVM)?",
            "What is a hard fork in a blockchain network?",
            "What is the difference between a hot wallet and a cold wallet?",
            "How does the consensus mechanism in blockchain prevent double-spending?",
            "What is a wrapped token and how is it used?",
            "What is a multi-signature wallet?",
            "What is a privacy coin and how does it ensure anonymity?",
            "What are Layer 2 solutions in blockchain?",
            "What is an ICO (Initial Coin Offering) and how does it work?",
            "What are the challenges in scaling blockchain technology?"
        ]
    },
    "https://deployment-zs6oe0edbuquit8kk0v10djt.stag-vxzy.zettablock.com/main": {
        "agent_id": "deployment_zs6OE0EdBuQuit8KK0V10dJT",
        "name": "Transaction Analyzer",
        "message": []
    }
};

class WalletStatistics {
    constructor() {
        this.agentInteractions = {};
        for (const endpoint in AI_ENDPOINTS) {
            this.agentInteractions[AI_ENDPOINTS[endpoint].name] = 0;
        }
        this.totalPoints = 0;
        this.totalInteractions = 0;
        this.lastInteractionTime = null;
        this.successfulInteractions = 0;
        this.failedInteractions = 0;
    }
}

class WalletSession {
    constructor(walletAddress, sessionId) {
        this.walletAddress = walletAddress;
        this.sessionId = sessionId;
        this.dailyPoints = 0;
        this.startTime = new Date();
        this.nextResetTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000);
        this.statistics = new WalletStatistics();
    }

    updateStatistics(agentName, success = true) {
        this.statistics.agentInteractions[agentName]++;
        this.statistics.totalInteractions++;
        this.statistics.lastInteractionTime = new Date();
        if (success) {
            this.statistics.successfulInteractions++;
            this.statistics.totalPoints += 10; // Points per successful interaction
        } else {
            this.statistics.failedInteractions++;
        }
    }

    printStatistics() {
        console.log(`\n${chalk.blue(`[Session ${this.sessionId}]`)} ${chalk.green(`[${this.walletAddress}]`)} ${chalk.cyan('📊 Current Statistics')}`);
        console.log(`${chalk.yellow('════════════════════════════════════════════')}`);
        console.log(`${chalk.cyan('💰 Total Points:')} ${chalk.green(this.statistics.totalPoints)}`);
        console.log(`${chalk.cyan('🔄 Total Interactions:')} ${chalk.green(this.statistics.totalInteractions)}`);
        console.log(`${chalk.cyan('✅ Successful:')} ${chalk.green(this.statistics.successfulInteractions)}`);
        console.log(`${chalk.cyan('❌ Failed:')} ${chalk.red(this.statistics.failedInteractions)}`);
        console.log(`${chalk.cyan('⏱️ Last Interaction:')} ${chalk.yellow(this.statistics.lastInteractionTime?.toISOString() || 'Never')}`);

        console.log(`\n${chalk.cyan('🤖 Agent Interactions:')}`);
        for (const [agentName, count] of Object.entries(this.statistics.agentInteractions)) {
            console.log(`   ${chalk.yellow(agentName)}: ${chalk.green(count)}`);
        }
        console.log(chalk.yellow('════════════════════════════════════════════\n'));
    }
}

class KiteAIAutomation {
    constructor(walletAddress, proxyList = [], sessionId) {
        this.session = new WalletSession(walletAddress, sessionId);
        this.proxyList = proxyList;
        this.currentProxyIndex = 0;
        this.MAX_DAILY_POINTS = 200;
        this.POINTS_PER_INTERACTION = 10;
        this.MAX_DAILY_INTERACTIONS = this.MAX_DAILY_POINTS / this.POINTS_PER_INTERACTION;
        this.isRunning = true;
    }

    getCurrentProxy() {
        if (this.proxyList.length === 0) return null;
        return this.proxyList[this.currentProxyIndex];
    }

    rotateProxy() {
        if (this.proxyList.length === 0) return null;
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
        const proxy = this.getCurrentProxy();
        this.logMessage('🔄', `Rotating to proxy: ${proxy.protocol}://${proxy.host}:${proxy.port}`, 'cyan');
        return proxy;
    }

    logMessage(emoji, message, color = 'white') {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sessionPrefix = chalk.blue(`[Session ${this.session.sessionId}]`);
        const walletPrefix = chalk.green(`[${this.session.walletAddress.slice(0, 6)}...]`);
        console.log(`${chalk.yellow(`[${timestamp}]`)} ${sessionPrefix} ${walletPrefix} ${chalk[color](`${emoji} ${message}`)}`);
    }

    resetDailyPoints() {
        const currentTime = new Date();
        if (currentTime >= this.session.nextResetTime) {
            this.logMessage('✨', 'Starting new 24-hour reward period', 'green');
            this.session.dailyPoints = 0;
            this.session.nextResetTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
            return true;
        }
        return false;
    }

    async shouldWaitForNextReset() {
        if (this.session.dailyPoints >= this.MAX_DAILY_POINTS) {
            const waitSeconds = (this.session.nextResetTime - new Date()) / 1000;
            if (waitSeconds > 0) {
                this.logMessage('🎯', `Maximum daily points (${this.MAX_DAILY_POINTS}) reached`, 'yellow');
                this.logMessage('⏳', `Next reset: ${this.session.nextResetTime.toISOString().replace('T', ' ').slice(0, 19)}`, 'yellow');
                await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                this.resetDailyPoints();
            }
            return true;
        }
        return false;
    }

    async getRecentTransactions() {
        this.logMessage('🔍', 'Scanning recent transactions...', 'white');
        const url = 'https://testnet.kitescan.ai/api/v2/advanced-filters';
        const params = new URLSearchParams({
            transaction_types: 'coin_transfer',
            age: '5m'
        });

        try {
            const agent = createAgent(this.getCurrentProxy());
            const response = await fetch(`${url}?${params}`, {
                agent,
                headers: {
                    'accept': '*/*',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const data = await response.json();
            const hashes = data.items?.map(item => item.hash) || [];
            this.logMessage('📊', `Found ${hashes.length} recent transactions`, 'magenta');
            return hashes;
        } catch (e) {
            this.logMessage('❌', `Transaction fetch error: ${e}`, 'red');
            this.rotateProxy();
            return [];
        }
    }

    async sendAiQuery(endpoint, message) {
        const agent = createAgent(this.getCurrentProxy());
        const headers = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };
        const data = {
            message,
            stream: true
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                agent,
                headers,
                body: JSON.stringify(data)
            });

            const sessionPrefix = chalk.blue(`[Session ${this.session.sessionId}]`);
            const walletPrefix = chalk.green(`[${this.session.walletAddress.slice(0, 6)}...]`);
            process.stdout.write(`${sessionPrefix} ${walletPrefix} ${chalk.cyan('🤖 AI Response: ')}`);

            let accumulatedResponse = "";

            for await (const chunk of response.body) {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.slice(6);
                            if (jsonStr === '[DONE]') break;

                            const jsonData = JSON.parse(jsonStr);
                            const content = jsonData.choices?.[0]?.delta?.content || '';
                            if (content) {
                                accumulatedResponse += content;
                                process.stdout.write(chalk.magenta(content));
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }
            }
            console.log();
            return accumulatedResponse.trim();
        } catch (e) {
            this.logMessage('❌', `AI query error: ${e}`, 'red');
            this.rotateProxy();
            return "";
        }
    }

    async reportUsage(endpoint, message, response) {
        this.logMessage('📝', 'Recording interaction...', 'white');
        const url = 'https://quests-usage-dev.prod.zettablock.com/api/report_usage';
        const data = {
            wallet_address: this.session.walletAddress,
            agent_id: AI_ENDPOINTS[endpoint].agent_id,
            request_text: message,
            response_text: response,
            request_metadata: {}
        };

        try {
            const agent = createAgent(this.getCurrentProxy());
            const result = await fetch(url, {
                method: 'POST',
                agent,
                headers: {
                    'Content-Type': 'application/json',
    },
                   
