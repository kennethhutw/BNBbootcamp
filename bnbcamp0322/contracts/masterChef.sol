// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./MyToken.sol";


contract MasterChef{

    using SafeMath for uint256;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accSushiPerShare;
    }

    MyToken public sushi;

    PoolInfo[] public poolInfo;

    mapping(uint256 => mapping(address =>UserInfo)) public userInfo;

    uint256 public totalAllocPoint = 0;
    uint256 public sushiPerBlock =1000;

    uint256 public startBlock = 0 ;
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event UpdatePool(uint256 indexed pid, uint256 lastRewardBlock, uint256 lpSupply, uint256 accSushiPerShare);
    event Reward(uint256 indexed pid, uint256 rewardAmount,uint256 multiplier, uint256 accSushiPerShare, uint256 allocPoint, uint256 totalAllocPoint);
    event Pendingfee( uint256 pendingAmount, uint256 amount, uint256 accSushiPerShare, uint256 rewardDebt);

    event Add(address indexed lpToken, uint256 indexed pid);
    constructor(MyToken _sushi){
           sushi = _sushi;
    }

    function add(IERC20 _lpToken) public{
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(100);
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            allocPoint:100,
            lastRewardBlock: lastRewardBlock,
            accSushiPerShare:0
        }));
        emit Add(address(_lpToken), poolInfo.length-1);
    }

    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user =  userInfo[_pid][msg.sender];
        updatePool(_pid);
     
        if(user.amount >0){
            uint256 pending = user.amount.mul(pool.accSushiPerShare).div(1e12).sub(user.rewardDebt);
            sushi.transfer(msg.sender, pending);
            emit Pendingfee(pending, user.amount, pool.accSushiPerShare, user.rewardDebt);
        }
      
        pool.lpToken.transferFrom(address(msg.sender), address(this), _amount);

        user.amount = user.amount.add(_amount);
        user.rewardDebt = user.amount.mul(pool.accSushiPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount); 

    }

    function withdraw(uint256 _pid, uint256 _amount) public{
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accSushiPerShare).div(1e12).sub(user.rewardDebt);
        emit Pendingfee(pending, user.amount, pool.accSushiPerShare, user.rewardDebt);

        sushi.transfer(msg.sender, pending);
        user.amount = user.amount.sub(_amount);
        user.rewardDebt = user.amount.mul(pool.accSushiPerShare).div(1e12);
        pool.lpToken.transfer(address(msg.sender), _amount);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    function updatePool(uint256 _pid) public {
        
        PoolInfo storage pool = poolInfo[_pid];
        if(block.number <= pool.lastRewardBlock){
              return;
        }

        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if(lpSupply ==0){
              pool.lastRewardBlock = block.number;
              return;
        }
        uint256 multiplier = block.number.sub(pool.lastRewardBlock);
        uint256 sushiReward  =
            multiplier.mul(sushiPerBlock).mul(pool.allocPoint).div(
                 totalAllocPoint
            );
       // uint256 sushiReward  =10 *ACC_SUSHI_PRECISION;
        
        emit  Reward(_pid, sushiReward, multiplier, pool.accSushiPerShare, pool.allocPoint, totalAllocPoint);
        sushi.mint(address(this),sushiReward);
        pool.accSushiPerShare= pool.accSushiPerShare.add(
              sushiReward.mul(1e12).div(lpSupply)
          );

        pool.lastRewardBlock = block.number;

        emit  UpdatePool(_pid, block.number, lpSupply, pool.accSushiPerShare);
    }

}