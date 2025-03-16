import chalk from "chalk";

export default function displayBanner() {
  console.log(chalk.cyan(`

  ╔════════════════════════════════════════════════════╗
  ║                 KITEAI  AUTO BOT                   ║
  ║         Automate your KiteAi  registration!        ║
  ║    Developed by: https://t.me/Offical_Im_kazuha    ║
  ║    GitHub: https://github.com/Kazuha787            ║
  ╠════════════════════════════════════════════════════╣
  ║                                                    ║
  ║  ██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ║
  ║  ██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗ ║
  ║  █████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║ ║
  ║  ██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║ ║
  ║  ██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║ ║
  ║  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║
  ║                                                    ║
  ╚════════════════════════════════════════════════════╝

  `));

  console.log(chalk.yellow("\n════════════════════════════════════════════════════════"));
  console.log(chalk.white(`Started at: ${new Date().toLocaleString()}`));
  console.log(chalk.yellow("════════════════════════════════════════════════════════\n"));
}
