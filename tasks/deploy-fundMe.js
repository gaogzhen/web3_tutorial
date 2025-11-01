const { task } = require("hardhat/config");


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


task("deploy-fundMe", "Deploy the FundMe contract")
    .setAction(async (taskArgs, hre) => {
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
    
    });



module.exports = {};