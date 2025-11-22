const { network } = require("hardhat"); // 导入hardhat网络配置
const { DECIMAL, INITIAL_ANSWER, developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  // 检查是否为开发链（hardhat或local）
  if(developmentChains.includes(network.name)) {
    const { firstAccount } = await getNamedAccounts(); // 获取第一个账户
    const { deploy } = deployments; // 获取部署函数

    // 部署MockV3Aggregator合约（等待部署完成）
    await deploy("MockV3Aggregator", {
      from: firstAccount, // 部署者地址
      args: [DECIMAL, INITIAL_ANSWER], // 构造函数参数：小数位数和初始价格
      log: true, // 启用日志输出
    });
  } else {
    console.log("Environment is not local, skipping deployment"); // 非开发环境，跳过部署
  }
};


module.exports.tags = ["all", "mock"];
