import blessed from "blessed";
import contrib from "blessed-contrib";
import {
  formatStats,
  formatAddress,
  getTimestamp,
  formatDuration,
} from "../utils/helpers.js";

class Dashboard {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Kazuha Kite AI Dashboard",
    });

    this.grid = new contrib.grid({
      rows: 14,
      cols: 12,
      screen: this.screen,
    });

    this.initializeComponents();
    this.setupKeyboardHandlers();
  }

  initializeComponents() {
    this.bannerBox = this.grid.set(0, 0, 2, 12, blessed.box, {
      label: "About",
      tags: true,
      border: { type: "line" },
      style: {
        fg: "cyan",
        border: { fg: "blue" },
      },
      content:
        "{center}{bold}KiteAI BOT{/bold}{/center}\n{center}Github: https://github.com/Kazuha787 | Telegram: https://t.me/Kazuha_offical{/center}",
    });

    this.logBox = this.grid.set(2, 0, 6, 12, blessed.log, {
      label: "Agent Interactions",
      tags: true,
      border: { type: "line" },
      style: {
        fg: "green",
        border: { fg: "blue" },
      },
    });

    this.statusBox = this.grid.set(8, 0, 3, 6, blessed.box, {
      label: "Status",
      tags: true,
      border: { type: "line" },
      style: {
        fg: "white",
        border: { fg: "blue" },
      },
    });

    this.statsBox = this.grid.set(8, 6, 3, 6, blessed.box, {
      label: "Statistics",
      tags: true,
      border: { type: "line" },
      content: "Total Requests: 0\nSuccessful: 0\nFailed: 0",
      style: {
        fg: "white",
        border: { fg: "blue" },
      },
    });

    this.progressBar = this.grid.set(11, 0, 3, 12, contrib.gauge, {
      label: "Session Progress (Resets every 10 cycles)",
      style: {
        fg: "blue",
        border: { fg: "blue" },
      },
      border: { type: "line" },
      showLabel: true,
    });
  }

  setupKeyboardHandlers() {
    this.screen.key(["escape", "q", "C-c"], () => {
      process.exit(0);
    });
  }

  updateStatus(wallet, cycleCount, runningTime) {
    const content = [
      `Active Wallet: ${formatAddress(wallet)}`,
      `Current Cycle: ${cycleCount}`,
      `Running Time: ${formatDuration(runningTime)}`,
    ].join("\n");

    this.statusBox.setContent(content);
    this.screen.render();
  }

  updateStats(stats) {
    this.statsBox.setContent(formatStats(stats));
    this.screen.render();
  }

  updateProgress(percent) {
    this.progressBar.setPercent(percent);
    this.screen.render();
  }

  log(message) {
    const timestamp = getTimestamp();
    this.logBox.log(`[${timestamp}] ${message}`);
    this.screen.render();
  }

  render() {
    this.screen.render();
  }
}

export default new Dashboard();
