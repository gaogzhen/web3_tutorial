require("@nomicfoundation/hardhat-toolbox"); // 引入 Hardhat 工具箱
require("@chainlink/env-enc").config(); // 加载加密的环境变量
require("./tasks");

const env = process.env; // 读取环境变量引用

// 生成有效账户数组：只保留以0x开头且长度为66的私钥
const sepoliaAccounts = [
  env.PRIVATE_KEY, // 主账户私钥
  env.PRIVATE_KEY_1, // 备选第二个账户私钥
];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: env.SEPOLIA_URL, // Sepolia RPC 节点地址
      accounts: sepoliaAccounts, // 仅使用过滤后的有效账户
      chainId: 11155111, // Sepolia 的 chainId
    },
  },
  sourcify: {
    enabled: true // 启用 Sourcify 源码验证
  },
  etherscan: {
    // 使用新的 Etherscan v2 API 格式
    apiKey: env.ETHERSCAN_API_KEY, // Etherscan API 密钥
    // 添加超时和重试配置
    customChains: [], // 可选自定义链配置
    timeout: 120000, // 增加到120秒超时
  }
};
