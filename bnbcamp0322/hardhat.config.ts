import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

type HardhatUserEtherscanConfig = HardhatUserConfig ;

const BNB_PRIVATE_KEY = process.env.BNB_PRIVATE_KEY || "";
const config: HardhatUserEtherscanConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
      },
    ],
    overrides: {
      "contracts/ERC20.sol": {
        version: "0.8.18",
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    hardhat: {
      blockGasLimit: 100000000429720, // whatever you want here
      gas: 2100000,
      gasPrice: 8000000000
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      blockGasLimit: 100000000429720, 
      gas: 2100000,
      gasPrice: 8000000000
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [BNB_PRIVATE_KEY]
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [BNB_PRIVATE_KEY]
    },

    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  mocha: {
    timeout: 200000,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
