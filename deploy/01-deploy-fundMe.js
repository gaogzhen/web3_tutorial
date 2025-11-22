const { network } = require("hardhat"); // 导入hardhat网络配置
const { DECIMAL, developmentChains, networkConfig, LOCK_TIME, CONFIRMATIONS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId, hre }) => {
  const { firstAccount } = await getNamedAccounts(); // 获取第一个账户
  const { deploy } = deployments; // 获取部署函数
  const chainId = await getChainId(); // 获取链ID

  let dataFeedAddr; // 价格聚合器地址
  // 判断是否为开发链
  if(developmentChains.includes(network.name)) {
    // 开发链：使用MockV3Aggregator
    const mockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddr = mockV3Aggregator.address;
  } else {
    // 测试网：使用真实的Chainlink价格聚合器
    dataFeedAddr = networkConfig[chainId].ethUsdDataFeed;
  }

  // 部署FundMe合约
  const fundMe = await deploy("FundMe", {
    from: firstAccount, // 部署者地址
    args: [LOCK_TIME, dataFeedAddr], // 构造函数参数：锁定时间和价格聚合器地址
    log: true, // 启用日志输出
    waitConfirmations: developmentChains.includes(network.name) ? 1 : CONFIRMATIONS, // 本地网络等待1个确认，测试网等待指定确认数
  });

  // 如果是Sepolia测试网且有Etherscan API密钥，则验证合约
  if (chainId == "11155111" && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundMe.address, // 合约地址
      constructorArguments: [LOCK_TIME, dataFeedAddr], // 构造函数参数
    });
  } else {
    console.log("Network is not sepolia, skipping verification"); // 跳过验证
  }
};


module.exports.tags = ["all", "fundMe"]; // 部署标签
module.exports.dependencies = ["mock"]; // 依赖关系：确保mock先部署
