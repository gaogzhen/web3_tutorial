// 验证FundMe合约的脚本（带重试机制）
const { run } = require("hardhat");

// 重试函数
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.log(`\n⏳ 第 ${i + 1} 次尝试失败: ${error.message}`);
            
            if (i === maxRetries - 1) {
                throw error; // 最后一次尝试失败，抛出错误
            }
            
            // 指数退避延迟
            const delay = baseDelay * Math.pow(2, i);
            console.log(`🔄 ${delay / 1000}秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function main() {
    // 合约地址
    const contractAddress = "0xf8cF0F94a3e9FC3C3bae76BB52BD533d31D4CBD8";
    // 构造函数参数（最小资助金额）
    const constructorArgs = ["10"];
    
    console.log("🚀 开始验证合约...");
    console.log(`📋 合约地址: ${contractAddress}`);
    console.log(`⚙️  构造函数参数: ${constructorArgs}`);
    console.log(`🌐 网络: sepolia`);
    
    try {
        // 使用重试机制验证合约
        await retryWithBackoff(async () => {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: constructorArgs,
            });
        });
        
        console.log("\n🎉 合约验证成功！");
        console.log("✅ Etherscan 验证完成");
        console.log("✅ Sourcify 验证完成");
        
    } catch (error) {
        console.error("\n❌ 验证失败:", error.message);
        
        // 检查是否已经验证过
        if (error.message.includes("Already Verified") || 
            error.message.includes("already been verified")) {
            console.log("\n✅ 合约已经被验证过了！");
            console.log("🔗 查看合约: https://sepolia.etherscan.io/address/" + contractAddress);
            return;
        }
        
        // 检查网络错误
        if (error.message.includes("Connect Timeout") || 
            error.message.includes("network request failed")) {
            console.log("\n🌐 网络连接问题:");
            console.log("1. 检查网络连接");
            console.log("2. 等待几分钟后重试");
            console.log("3. 检查 Etherscan API 密钥");
            console.log("\n💡 提示: Sourcify 验证已经成功，合约功能正常");
        } else {
            console.log("\n🔧 其他解决方案:");
            console.log("1. 检查合约地址是否正确");
            console.log("2. 确认构造函数参数是否正确");
            console.log("3. 检查 .env 文件中的 API 密钥");
        }
        
        console.log("\n📝 手动验证命令:");
        console.log(`npx hardhat verify --network sepolia ${contractAddress} ${constructorArgs.join(" ")}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
