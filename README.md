# KiteAI Blockchain Question Generator

An automated bot for managing multiple KiteAi accounts with proxy support.

## 📢 Join Our Community

# Telegram Channel: .[Channel](https://t.me/Offical_Im_kazuha)
# GitHub Repository: [KiteAi2](https://github.com/Kazuha787/KiteAi2.git)

## ✨ Features  

👉 **Supports multiple wallets** 💰  
👉 **Automated AI interactions** (Professor, Crypto Buddy, Sherlock) 🧠  
👉 **Real-time analytics & progress tracking** 📊  
👉 **Built-in rate limiting & error handling** ⚡  
👉 **Groq AI integration** for smart question generation 🔍  

---

## 📌 Prerequisites  

Before installing, ensure you have the following:  

| Requirement  | Description |
|-------------|------------|
| 🔹 **Node.js v16+** | [Download Here](https://nodejs.org/) 🖥️ |
| 🔹 **KiteAI Testnet Account** | [Sign Up](https://testnet.gokite.ai?r=R7H32kqJ) 🔗 |
| 🔹 **Groq API Key** | [Get it Here](https://console.groq.com) 🔑 |

---

## 🛠️ Installation Guide  

### **🔹 For Linux/macOS Users 🐧🍏**  

#### 1️⃣ Clone the repository:  
   ```bash
   git clone https://github.com/rpchubs/KiteAI-BOT.git
   ```

#### 2️⃣ Navigate to the project folder:  
   ```bash
   cd KiteAI-BOT
   ```

#### 3️⃣ Install dependencies:  
   ```bash
   npm install
   ```

#### 4️⃣ Create required configuration files:  
   - **Wallets addresses file:**  
     ```bash
     nano wallets.txt
     ```
   - **Private keys file:**  
     ```bash
     nano priv.txt
     ```
   - **Proxy file:**  
     ```bash
     nano proxies.txt
     ```
     **Format:** `http://user:pass@host:port`     
   - **Create configuration file:**  
     ```bash
     nano config.js
     ```
     ## ⚙️ Configuration Guide  

### 📂 **Wallet Addresses 💰:**  
- Open `wallets.txt` and add one wallet address per line:  
  ```
  0xwallet1address
  0xwallet2address
  ```

### 🔐 **Private Key 🔑:**  
- Open `priv.txt` and add one private key per line **(Keep it safe!)**  
  ```
  privatekey1
  privatekey2
  ```

### 🔑 **API Key and Referral Code Setup:**  
1️⃣ Open `config.js` in a text editor.  
2️⃣ Locate the following section and update your API key:  
   ```javascript
   export const groqConfig = {
       apiKey: "your-groq-api-key-here",
       model: "mixtral-8x7b-32768",
       temperature: 0.7,
   };
   ```
3️⃣ Locate the referral code section and update it:  
   ```javascript
   export const refCode = {
       code: "your-referral-code-here"
   };
   ```
4️⃣ **Save the file.**  

---

## ▶️ Usage Guide 🚀  

### 📝 **To Register (First-time Users Only) 📜**  

🔹 **Ensure that `priv.txt` contains your private key before running `register.js`.**  

#### **Linux/macOS:**  
```bash
node register.js
```
### 🚀 **To Start the Bot 🤖**  

🔹 **Ensure `wallets.txt` is set up correctly.**  
🔹 **Wallets must be registered and signed before use.**  

#### **Linux/macOS:**  
```bash
node main.js
```
