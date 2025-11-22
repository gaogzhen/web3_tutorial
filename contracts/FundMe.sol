// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.创建一个收款函数
// 2.记录投资人并且查看
// 3.在锁定期内，达到目标值，生产商可以提款
// 4.在锁定期内，没有达到目标值，投资人可以在锁定期以后退款

contract FundMe {
    // 筹款人 => 筹款金额
    mapping (address => uint256) public  fundersToAmount;

    // 最小筹款金额
    uint256 constant MINIMUM_VALUE = 4 * 10 ** 18; // USD

    AggregatorV3Interface internal dataFeed;

    // 目标金额
    uint256 constant TARGET = 10 * 10 ** 18;

    // 合约所有者
    address public  owner;

    // 合约部署时间
    uint256 public deploymentTimestamp;
    // 合约锁定时间
    uint256 public lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime, address _dataFeedAddr) {
        // sepolia testnet
        dataFeed = AggregatorV3Interface(
            _dataFeedAddr
        );
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
         // 判断锁定时间
        require( (block.timestamp < deploymentTimestamp + lockTime), "the lock time is over");
        // 控制台打印等价usd值
        uint256 usdValue = convertEthToUsd(msg.value);
        
        require(usdValue >= MINIMUM_VALUE, "cannot be less than the minimum limit");
         fundersToAmount[msg.sender] += msg.value;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view  returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / (10 ** 8);
        return ethAmountInUsd;
    
    }

    // 判断合约所有者可以提取
    function transferOwnship(address newOwner) public {
        require(owner == msg.sender, "this function can only be called by owner");
        owner = newOwner;
    }

    // 达到目标值，生产商可以提款
    function getFund() external windowClosed onlyOwner{    
        // 判断筹款金额大于等于目标金额
        uint256 balance = address(this).balance;
        require(convertEthToUsd(balance) >= TARGET, "Target is not reached.");
        // payable(msg.sender).transfer(balance);
        // bool success = payable(msg.sender).send(balance);
        bool success;
        (success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer failed");
        // 余额清空
         fundersToAmount[msg.sender] = 0;
        getFundSuccess = true;
    }

    // 没有达到目标值，投资人可以在锁定期以后退款
    function refund() external windowClosed{
        // 判断筹款金额小于目标金额
        uint256 balance = address(this).balance;
        require(convertEthToUsd(balance) < TARGET, "Target is  reached.");
        uint256 amount =  fundersToAmount[msg.sender];
        require(amount != 0, "there is not fund for you");
        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "transfer failed");
         fundersToAmount[msg.sender] = 0;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external  {
        require(msg.sender == erc20Addr, "You don't have permission to call this funciton.");
         fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner {
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed() {
        // 判断锁定时间
        require( (block.timestamp > deploymentTimestamp + lockTime), "the lock time is not  over");
        _;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "this function can only be called by owner");
        _;
    }
}
