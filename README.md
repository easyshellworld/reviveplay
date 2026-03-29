# Polkadot Revive Playground

![Tests](https://github.com/easyshellworld/reviveplayground/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-22-brightgreen.svg)
![License](https://img.shields.io/github/license/your-username/reviveplayground.svg)
![Status](https://img.shields.io/badge/status-active-blue.svg)

> Polkadot Hub TestNet 交互式教学 playground，让初学者体验完整的 Web3 开发流程。

## 📖 项目简介

Polkadot Revive Playground 是一个面向 Web3 初学者的交互式教学平台，运行在 **Polkadot Hub TestNet (REVM)**。

通过 6 个步骤完成完整的区块链体验：

1. **连接钱包** - 连接 MetaMask 配置网络
2. **领测试水** - 获取 PAS 测试代币
3. **部署 ERC20** - 部署你自己的测试代币
4. **添加到钱包** - 将代币添加到 MetaMask
5. **Swap 兑换** - 使用 ERC20 兑换 PAS
6. **Mint NFT** - 铸造你的结业纪念 NFT

## ✨ 功能特点

- 🎨 **现代UI设计** - Tailwind CSS + 玻璃态效果 + Polkadot 主题
- 🔗 **开箱即用** - 预部署 `TeachingSwapRouter` 和 `PlaygroundNFT` 合约
- 🧪 **完整测试覆盖** - 智能合约和前端都有完整测试
- 🔄 **持续集成** - GitHub Actions 自动测试
- 📱 **响应式设计** - 完美支持桌面和移动端
- 🔍 **区块浏览器集成** - mint 后直接查看交易详情

## 🛠️ 技术栈

### 智能合约
- **Solidity** `^0.8.28`
- **Hardhat** - 开发框架
- **OpenZeppelin** - 安全合约库
- **Ethers** - 链上交互

### 前端
- **React 18** + **TypeScript**
- **Vite** - 极速构建
- **Tailwind CSS** - 样式框架
- **Wagmi** + **Viem** - 以太坊交互
- **Zustand** - 状态管理
- **TanStack Query** - 数据获取
- **Vitest** - 单元测试

## 🚀 快速开始

### 前置要求
- Node.js 22+
- npm/yarn/pnpm

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装合约依赖
cd contracts && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 开发运行

```bash
# 运行前端开发服务器
cd frontend && npm run dev
```

### 合约测试

```bash
cd contracts
npx hardhat test
```

### 前端测试

```bash
cd frontend
npm test
```

### 部署合约到测试网

```bash
cd contracts
npx hardhat run scripts/deploy-swap-router.ts --network polkadotHubTestnet
```

## 📝 已部署合约 (Polkadot Hub TestNet)

| 合约 | 地址 |
|------|------|
| TeachingSwapRouter | `0x19E7930f1d3DCc4995ba2065279Fb4092B212fb1` |
| PlaygroundNFT | `0x6d429C7455c35C5bcbA9efd95a951982e2c9A979` |

## 📁 项目结构

```
├── .github/
│   └── workflows/
│       └── test.yml          # GitHub CI 配置
├── contracts/
│   ├── contracts/            # 智能合约源码
│   ├── scripts/              # 部署脚本
│   └── test/                 # 合约测试
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── lib/              # 工具函数
│   │   └── store/            # Zustand 状态管理
│   └── public/               # 静态资源
├── docs/                     # 开发文档和修改日志
└── README.md
```

## 🎯 教学目标

这个项目帮助初学者学习：

- ✅ 如何在 Polkadot Hub REVM 部署智能合约
- ✅ ERC20 代币的部署和交互
- ✅ ERC721 NFT 铸造
- ✅ `approve` + `swap` 模式的工作原理
- ✅ 前端如何连接钱包和区块链交互
- ✅ Polkadot Hub TestNet 开发体验

## 🌐 网络配置

**Polkadot Hub TestNet**
- **Chain ID**: `420420417`
- **RPC URL**: `https://eth-rpc-testnet.polkadot.io/`
- **Blockscout**: `https://blockscout-testnet.polkadot.io/`
- **Symbol**: PAS

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🙏 鸣谢

- [Polkadot](https://polkadot.network/) - 提供强大的区块链基础设施
- [OpenZeppelin](https://openzeppelin.com/) - 安全智能合约库
- [revive](https://github.com/polkadot/revive) - Polkadot REVM 实现
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-openagent) - AI 辅助开发

---

Happy hacking on Polkadot! 🎉
