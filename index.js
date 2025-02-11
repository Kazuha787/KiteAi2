import axios from 'axios';
import fs from 'fs';
import figlet from 'figlet';
import chalk from 'chalk';
import boxen from 'boxen';
import { Twisters } from 'twisters';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
  renderer: new TerminalRenderer()
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const spinner = new Twisters(); 

const agents = {
  "deployment_p5J9lz1Zxe7CYEoo0TZpRVay": "Professor 🧠",
  "deployment_7sZJSiCqCNDy9bBHTEh7dwd9": "Crypto Buddy 💰",
  "deployment_SoFftlsf9z4fyA3QCHYkaANq": "Sherlock 🔎"
};

async function countdown(seconds, id) {
  return new Promise((resolve) => {
    let remaining = seconds;

    const interval = setInterval(() => {
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const secs = remaining % 60;

      const formattedTime = 
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${secs.toString().padStart(2, '0')}`;

      spinner.put(id, { 
        text: `⏳ Waiting ${formattedTime} before continuing...`
      });

      remaining--;

      if (remaining < 0) {
        clearInterval(interval);
        spinner.put(id, { text: '⏩ Sending request again...' });
        resolve();
      }
    }, 1000);
  });
}

async function delay24Hours(statusId) {
  const hours = 24;
  const totalSeconds = hours * 60 * 60;
  spinner.put(statusId, { text: `⏰ Waiting ${hours} hours before starting a new session...` });
  await countdown(totalSeconds, statusId);
}

function displayAppTitle() {
  console.log('\n' + boxen(
    chalk.cyan(figlet.textSync(' KAZUHA ', { horizontalLayout: 'full' })) +
    '\n' + chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━') +
    '\n' + chalk.gray('By Kazuha') +
    '\n' + chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      float: 'center'
    }
  ));
}

async function stats(wallet, statsId) {
  try {
    const res = await axios.get(`https://quests-usage-dev.prod.zettablock.com/api/user/${wallet.toLowerCase()}/stats`);
    spinner.put(statsId, { text: `📈 Total interactions: ${res.data.total_interactions}` });
    return res.data;
  } catch (error) {
    spinner.put(statsId, chalk.red('❌ Failed to load stats'));
    return null;
  }
}

async function sendRandomQuestion(agent, statusId) {
  try {
    const randomQuestions = JSON.parse(fs.readFileSync('random_questions.json', 'utf-8'));
    const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];

    spinner.put(statusId, { text: '📤 Sending question...' });

    const payload = { message: randomQuestion, stream: false };
    const response = await axios.post(`https://${agent.toLowerCase().replace('_', '-')}.stag-vxzy.zettablock.com/main`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    spinner.put(statusId, { text: '✅ Question sent successfully' });
    return { question: randomQuestion, response: response.data.choices[0].message };
  } catch (error) {
    spinner.put(statusId, { text: '❌ Failed to send question' });
    return null;
  }
}

async function reportUsage(wallet, options, statusId) {
  try {
    spinner.put(statusId, { text: '📊 Reporting usage...' });

    const payload = {
      wallet_address: wallet,
      agent_id: options.agent_id,
      request_text: options.question,
      response_text: options.response,
      request_metadata: {}
    };

    await axios.post(`https://quests-usage-dev.prod.zettablock.com/api/report_usage`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    spinner.put(statusId, { text: '✅ Usage data reported successfully' });
  } catch (error) {
    spinner.put(statusId, { text: '❌ Failed to report usage' });
    spinner.put(statusId, { text: '🔄 Retrying in 60 seconds...' });
    await countdown(62, statusId);
  }
}

async function processWallet(wallet, iterations) {
  const walletId = `wallet_${wallet}`;
  const statusId = `status_${wallet}`;
  const agnetId = `agent_${wallet}`;
  const progressId = `progress_${wallet}`;
  const statsId = `stats_${wallet}`;
  const delimeId = `delime_${wallet}`;

  spinner.put(delimeId, { text: chalk.dim('─'.repeat(process.stdout.columns - 3 || 80)) });

  spinner.put(walletId, { text: `🔑 Wallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` });
  spinner.put(agnetId, { text: '⌛ Starting session...' });
  spinner.put(statusId, { text: '⌛ Starting session...' });
  spinner.put(progressId, { text: '📊 Progress: 0/0' });
  spinner.put(statsId, { text: '📈 Loading stats...' });

  const totalQuestions = iterations * Object.keys(agents).length;
  let completedQuestions = 0;

  while (true) {
    for (const [agentId, agentName] of Object.entries(agents)) {
      spinner.put(agnetId, { text: `🤖 Active Agent: ${agentName}` });

      for (let i = 0; i < iterations; i++) {
        const nanya = await sendRandomQuestion(agentId, statusId);

        if (nanya && nanya.question) {
          await reportUsage(wallet.toLowerCase(), {
            agent_id: agentId,
            question: nanya.question,
            response: nanya?.response?.content ?? 'No answer'
          }, statusId);

          await stats(wallet, statsId);
          completedQuestions++;
        } else {
          spinner.put(statusId, { text: chalk.red('❌ Failed to get a question!') });
        }

        spinner.put(progressId, { 
          text: `📊 Progress: ${completedQuestions}/${totalQuestions} | Iteration: ${i + 1}/${iterations}` 
        });
      }
    }

    spinner.put(statusId, { text: '🎉 Session completed! Waiting 24 hours...' });
    completedQuestions = 0;
    await delay24Hours(statusId);
  }
}

async function readWallets() {
  try {
    const data = fs.readFileSync('wallets.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(chalk.red('Error reading wallets.json:'), error.message);
    process.exit(1);
  }
}

async function main() {
  console.clear();
  displayAppTitle();

  const wallets = await readWallets();
  if (!wallets.length) {
    console.error(chalk.red('❌ No wallets found in wallets.json'));
    process.exit(1);
  }

  const walletPromises = wallets.map(wallet => processWallet(wallet.address, wallet.iterations));

  try {
    await Promise.all(walletPromises);
  } catch (error) {
    console.error(chalk.red('Error running session:'), error);
  }
}

process.on('SIGINT', () => { spinner.stop(); process.exit(); });
process.on('uncaughtException', (error) => { console.error(chalk.red('Uncaught Exception:'), error); spinner.stop(); process.exit(1); });

main().catch(error => { console.error(chalk.red('Error:'), error); process.exit(1); });
