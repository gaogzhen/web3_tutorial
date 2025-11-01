// 检查环境变量配置的脚本
require("@chainlink/env-enc").config(); // 加载加密环境变量

const env = process.env; // 获取环境变量引用

function checkEnvVariables() {
    console.log("🔍 检查环境变量配置...\n");
    
    const requiredVars = [
        { name: "SEPOLIA_URL", value: env.SEPOLIA_URL }, // Sepolia RPC 地址
        { name: "PRIVATE_KEY", value: env.PRIVATE_KEY }, // 主账户私钥
        { name: "PRIVATE_KEY_1", value: env.PRIVATE_KEY_1 }, // 可选第二个账户私钥
        { name: "ETHERSCAN_API_KEY", value: env.ETHERSCAN_API_KEY } // Etherscan 密钥
    ]; // 需要检查的变量列表
    
    let allGood = true;
    
    requiredVars.forEach(({ name, value }) => {
        if (!value) { // 未设置变量
            console.log(`❌ ${name}: 未设置`);
            allGood = false;
        } else {
            // 隐藏敏感信息
            const isSensitive = name === "PRIVATE_KEY" || name === "PRIVATE_KEY_1"; // 判断是否敏感
            const displayValue = isSensitive ? 
                `${value.substring(0, 6)}...${value.substring(value.length - 4)}` : // 打印掩码
                value; // 非敏感直接显示
            console.log(`✅ ${name}: ${displayValue}`);

            // 对私钥进行格式校验（必须0x开头且长度为66）
            if (isSensitive) { // 仅对私钥做额外校验
                const valid = typeof value === 'string' && value.length === 66; // 校验条件
                if (!valid) { // 如果无效
                    console.log(`⚠️  ${name}: 格式可能不正确（应为0x开头且64位十六进制）`); // 提示修正
                    allGood = false; // 视为未通过
                }
            }
        }
    });
    
    console.log("\n" + "=".repeat(50));
    
    if (allGood) {
        console.log("🎉 所有环境变量都已正确配置！"); // 打印成功提示
        console.log("\n📋 配置摘要:");
        console.log(`🌐 网络: Sepolia`); // 网络名称
        console.log(`🔗 RPC URL: ${env.SEPOLIA_URL ? '已设置' : '未设置'}`); // RPC 状态
        console.log(`🔑 私钥: ${env.PRIVATE_KEY ? '已设置' : '未设置'}`); // 主私钥状态
        console.log(`🔑 私钥_1: ${env.PRIVATE_KEY_1 ? '已设置' : '未设置'}`); // 第二私钥状态
        console.log(`🔍 Etherscan API: ${env.ETHERSCAN_API_KEY ? '已设置' : '未设置'}`); // Etherscan 状态
        
        console.log("\n🚀 可以尝试验证合约:");
        console.log("npm run verify");
    } else {
        console.log("⚠️  部分环境变量未设置或格式不正确！"); // 打印错误提示
        console.log("\n📝 请确保 .env 文件包含以下变量:");
        console.log("SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY"); // RPC 示例
        console.log("PRIVATE_KEY=0x<64位十六进制私钥>"); // 主私钥示例
        console.log("PRIVATE_KEY_1=0x<64位十六进制私钥>  # 可选，用于第二账户"); // 第二私钥示例
        console.log("ETHERSCAN_API_KEY=your_etherscan_api_key_here"); // Etherscan 示例
    }
}

checkEnvVariables(); // 执行检查

