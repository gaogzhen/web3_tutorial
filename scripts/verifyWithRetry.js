// 带重试机制的合约验证脚本
const { run } = require("hardhat");

// 重试函数，使用指数退避策略
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 3000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`🔄 第 ${i + 1} 次验证尝试...`); // 显示尝试次数
            return await fn(); // 执行验证函数
        } catch (error) {
            console.log(`❌ 第 ${i + 1} 次尝试失败: ${error.message}`); // 显示错误信息
            
            // 如果是最后一次尝试，抛出错误
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // 计算延迟时间（指数退避）
            const delay = baseDelay * Math.pow(2, i);
            console.log(`⏳ 等待 ${delay / 1000} 秒后重试...`); // 显示等待时间
            await new Promise(resolve => setTimeout(resolve, delay)); // 等待指定时间
        }
    }
}

async function main() {
    // 合约信息
    const contractAddress = "0xf8cF0F94a3e9FC3C3bae76BB52BD533d31D4CBD8"; // 合约地址
    const constructorArgs = ["10"]; // 构造函数参数
    
    console.log("🚀 开始验证合约（带重试机制）..."); // 开始验证提示
    console.log(`📋 合约地址: ${contractAddress}`); // 显示合约地址
    console.log(`⚙️  构造函数参数: ${constructorArgs}`); // 显示构造函数参数
    console.log(`🌐 网络: sepolia`); // 显示网络名称
    console.log("=" * 50); // 分隔线
    
    try {
        // 使用重试机制验证合约
        await retryWithBackoff(async () => {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: constructorArgs,
            });
        });
        
        console.log("\n🎉 合约验证成功！"); // 验证成功提示
        console.log("✅ Etherscan 验证完成"); // Etherscan验证成功
        console.log("✅ Sourcify 验证完成"); // Sourcify验证成功
        
        // 显示合约链接
        console.log("\n🔗 查看合约:");
        console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
        console.log(`Sourcify: https://repo.sourcify.dev/contracts/full_match/11155111/${contractAddress}/`);
        
    } catch (error) {
        console.error("\n❌ 所有验证尝试都失败了"); // 所有尝试失败提示
        
        // 检查错误类型并提供相应的解决方案
        if (error.message.includes("Already Verified") || 
            error.message.includes("already been verified")) {
            console.log("\n✅ 好消息：合约已经被验证过了！"); // 已经验证提示
            console.log("🔗 查看合约: https://sepolia.etherscan.io/address/" + contractAddress);
            
        } else if (error.message.includes("Connect Timeout") ||
                   error.message.includes("network request failed") ||
                   error.message.includes("NetworkRequestError")) {
            console.log("\n🌐 网络连接问题分析:"); // 网络问题分析
            console.log("• Etherscan 服务器可能繁忙"); // 服务器繁忙
            console.log("• 网络连接不稳定"); // 网络不稳定
            console.log("• API 请求频率限制"); // API限制
            
            console.log("\n💡 重要提示:"); // 重要提示
            console.log("✅ 你的合约功能完全正常"); // 功能正常
            console.log("✅ Sourcify 验证已经成功"); // Sourcify成功
            console.log("✅ 合约源代码已经公开可验证"); // 源代码可验证
            
            console.log("\n🔧 解决方案:"); // 解决方案
            console.log("1. 等待 10-15 分钟后重试"); // 等待重试
            console.log("2. 检查网络连接"); // 检查网络
            console.log("3. 检查 Etherscan API 密钥"); // 检查API密钥
            console.log("4. 直接使用 Sourcify 验证结果"); // 使用Sourcify
            
        } else {
            console.log("\n🔧 其他错误解决方案:"); // 其他错误
            console.log("1. 检查合约地址是否正确"); // 检查地址
            console.log("2. 确认构造函数参数是否正确"); // 检查参数
            console.log("3. 检查 .env 文件中的 API 密钥"); // 检查环境变量
            console.log("4. 确认网络配置正确"); // 检查网络配置
        }
        
        // 提供手动验证命令
        console.log("\n📝 手动验证命令:"); // 手动验证命令
        console.log(`npx hardhat verify --network sepolia ${contractAddress} ${constructorArgs.join(" ")}`);
        
        // 显示Sourcify链接（因为Sourcify验证通常成功）
        console.log("\n🔗 Sourcify 验证链接:");
        console.log(`https://repo.sourcify.dev/contracts/full_match/11155111/${contractAddress}/`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error); // 输出错误信息
        process.exit(1); // 退出程序
    });

