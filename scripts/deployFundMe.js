// 部署FundMe合约
const { ethers } = require("hardhat");
// const hre = require("hardhat");

async function main() {
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = await fundMeFactory.deploy(300);
  await fundMe.waitForDeployment(); // 等待部署完成
  console.log("FundMe合约部署成功，地址为：", fundMe.target); // 获取合约地址


  // verify fundme
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 5 confirmations...") // 等待区块确认
    await fundMe.deploymentTransaction().wait(5) // 等待5个区块确认
    console.log("开始验证合约...") // 开始验证过程
    await verifyFundMe(fundMe.target, [300]) // 使用正确的参数进行验证
  } else {
    console.log("验证被跳过（网络不是Sepolia或缺少API密钥）...")
  }

  // 获取可用签名者列表
  const signers = await ethers.getSigners(); // 从 Hardhat/网络读取账户
  const firstAccount = signers[0]; // 第一个账户（必须存在）
  const secondAccount = signers[1]; // 第二个账户

  // 使用第一个账户为合约充值
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.01") }); // 第一次充值交易
  await fundTx.wait(); // 等待交易确认
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target); // 查询合约余额
  console.log(`Balance of the contract is ${balanceOfContract}`); // 打印余额

  // 如果有第二个账户则再次充值

    const fundTxWithSecondAccount = await fundMe
      .connect(secondAccount) // 连接到第二个账户
      .fund({ value: ethers.parseEther("0.01") }); // 第二次充值交易
    await fundTxWithSecondAccount.wait(); // 等待交易确认

    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target); // 再次查询余额
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`); // 打印最新余额


  // 查询映射记录中的充值金额
  const firstAccountbalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address); // 查询第一账户金额
  console.log(`Balance of first account ${firstAccount.address} is ${firstAccountbalanceInFundMe}`); // 打印第一账户金额

    const secondAccountbalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address); // 查询第二账户金额
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountbalanceInFundMe}`); // 打印第二账户金额
  
}

async function verifyFundMe(fundMeAddr, args) {
  try {
    console.log(`验证合约地址: ${fundMeAddr}`) // 打印合约地址
    console.log(`构造函数参数: ${args}`) // 打印构造函数参数
    
    await hre.run("verify:verify", {
      address: fundMeAddr,
      constructorArguments: args,
    });
    
    console.log("✅ 合约验证成功！") // 验证成功提示
  } catch (error) {
    // 处理验证错误
    if (error.message.includes("Already Verified") || 
        error.message.includes("already been verified")) {
      console.log("✅ 合约已经被验证过了！") // 已经验证过的提示
    } else if (error.message.includes("Connect Timeout") ||
               error.message.includes("network request failed")) {
      console.log("⚠️  Etherscan验证超时，但Sourcify验证可能已成功") // 超时提示
      console.log("💡 合约功能正常，可以正常使用") // 功能正常提示
    } else {
      console.error("❌ 验证失败:", error.message) // 其他错误
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});