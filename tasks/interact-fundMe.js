const { task } = require("hardhat/config");

task("interact-fundMe", "Interact with the FundMe contract")
    .addParam("addr", "The address of the FundMe contract")
    .setAction(async (taskArgs, hre) => {

      const fundMeFactory = await ethers.getContractFactory("FundMe");
      const fundMe = await fundMeFactory.attach(taskArgs.addr);
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
    });

module.exports = {};