import fs from "fs";

class WalletService {
  loadWallets() {
    try {
      return fs
        .readFileSync("wallets.txt", "utf-8")
        .split("\n")
        .filter((wallet) => wallet.trim())
        .map((wallet) => wallet.trim().toLowerCase());
    } catch (error) {
      console.error("Error: wallets.txt not found");
      return [];
    }
  }
}

export default new WalletService();
