# Polkadot Revive Playground — 教学项目设计文档

**面向 Web3 初学者的 Polkadot Hub REVM 智能合约交互教学平台**

> Version 1.1.0 · Draft · 2026-03  
> All code, comments, variable names, and commit messages MUST be written in English.

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. Polkadot Revive 技术背景](#2-polkadot-revive-技术背景)
- [3. 技术架构总览](#3-技术架构总览)
- [4. 网络配置 & 参数速查](#4-网络配置--参数速查)
- [5. 智能合约设计](#5-智能合约设计)
- [6. 前端设计](#6-前端设计)
- [7. 教学流程设计](#7-教学流程设计)
- [8. 目录结构](#8-目录结构)
- [9. 合约完整实现](#9-合约完整实现)
- [10. 前端核心实现](#10-前端核心实现)
- [11. 部署流程](#11-部署流程)
- [12. 测试策略](#12-测试策略)
- [13. 开发规范](#13-开发规范)
- [14. 快速开始](#14-快速开始)
- [15. 故障排查](#15-故障排查)
- [附录](#附录)

---

## 1. 项目概述

### 1.1 定位

**Polkadot Revive Playground** 是一个面向 Web3 初学者的交互式教学 DApp，运行于 Polkadot Hub TestNet 上，基于 Revive 智能合约平台的 REVM 执行后端。它将"连接钱包 → 获取测试币 → 部署 ERC20 合约 → 添加代币 → 体验 Swap → Mint 纪念 NFT"这条完整的链上学习路径压缩到一个单页应用中，让学习者在 30 分钟内跑通真实的 REVM 链上操作。

核心设计原则：

- **Polkadot Hub 通过 REVM 提供完整 REVM 兼容性**，直接使用 MetaMask + viem + wagmi 操作，无需任何 Polkadot.js 或 SS58 地址
- **所有操作真实上链**，非模拟，学习者可在 Blockscout 上验证每一笔交易
- **代码可视化**，合约源码随参数实时更新，帮助学习者理解"表单输入 → Solidity 代码 → 字节码部署"的完整映射
- **教学优先**，每一步都有说明文字和链接，Swap 功能为教学级演示（固定汇率），帮助理解 approve→swap 交互模式
- **NFT 作为结业凭证**，最后一步通过项目预部署的 Playground NFT 合约 Mint 一枚专属纪念 NFT，无需自己部署合约

### 1.2 教学目标

学习者完成本 Playground 后，将掌握以下能力：

| 能力 | 对应步骤 |
|------|----------|
| 在 MetaMask 中添加自定义 REVM 网络 | Step 01 |
| 从官方水龙头领取测试网 Gas 代币 | Step 02 |
| 阅读 ERC20 Solidity 合约源码 | Step 03 |
| 使用前端界面部署 ERC20 合约（via Revive REVM）| Step 03 |
| 将自定义代币添加到 MetaMask 资产列表 | Step 04 |
| 理解 REVM 上的 ERC20 approve + swap 两步交互模型 | Step 05 |
| 调用预部署合约 Mint ERC721 纪念 NFT | Step 06 |
| 将 NFT 添加到 MetaMask 钱包并在 Blockscout 上查看 | Step 06 |

---

## 2. Polkadot Revive 技术背景

> 本节为教学文档的核心背景说明，开发者必读。

### 2.1 什么是 Revive

**Revive** 是 Polkadot Hub 的智能合约平台，于 **2026 年 1 月 27 日**正式上线（通过 referendum 完成链上治理升级）。技术上对应 Substrate 运行时中的 `pallet-revive` 模块，是 `pallet-contracts`（原 Wasm 合约）的重大升级版。

Revive 提供**双虚拟机架构**：

| 后端 | 全称 | 执行方式 | 适用场景 |
|------|------|----------|----------|
| **REVM** | Rust EVM | 直接执行标准 REVM 字节码 | 从以太坊迁移、完整工具链兼容 |
| **PVM** | PolkaVM | 编译到 RISC-V 字节码后执行 | 高性能、计算密集型合约 |

> 📌 **本项目使用 REVM 后端**。学习者编写标准 Solidity，使用 Hardhat 编译为普通 REVM 字节码，使用 MetaMask / viem / wagmi 与链交互——与以太坊主网体验完全一致。

### 2.2 REVM 与传统 EVM 的关键区别

| 维度 | 以太坊 EVM | Polkadot REVM (via Revive) |
|------|-----------|--------------------------|
| 执行引擎 | 各客户端实现（Geth 等）| REVM（Rust 实现，内存安全）|
| 字节码格式 | 标准 EVM 字节码 | 标准 REVM 字节码（完全兼容）|
| 工具链 | Hardhat / Foundry / Remix | 同上（无需修改）|
| 钱包 | MetaMask、标准 EIP-1193 | 同上 |
| 库支持 | ethers.js, viem, wagmi | 同上（viem / wagmi 官方支持）|
| 预编译合约 | 以太坊标准预编译 | REVM 预编译 + Polkadot 原生预编译（治理、XCM 等）|
| Gas 代币 | ETH | PAS（Paseo）|

> ⚠️ **术语注意**：虽然 Polkadot Hub 的 REVM 后端与 EVM 完全兼容，但 Polkadot 官方文档特别指出，称 Polkadot 为"EVM 兼容"在技术上并不完全准确，因为其底层执行引擎是 REVM 而非传统的 EVM 实现。本文档统一使用 **REVM** 指代该执行环境。

### 2.3 Revive 与开发者的关系

对于本教学项目的学习者而言，Revive 的存在是**透明的**——你照常写 Solidity，照常用 Hardhat，照常用 MetaMask。Revive 在底层将标准 REVM 字节码路由到 REVM 执行引擎，开发者无需关心这一层。

```
开发者写 Solidity
    │ Hardhat 编译（solc → REVM 字节码）
    ▼
MetaMask / viem 发送部署交易
    │ Polkadot Hub JSON-RPC（与以太坊 JSON-RPC 完全相同）
    ▼
pallet-revive (Revive)
    │ 识别为 REVM 合约
    ▼
REVM 执行引擎（Rust 实现）
    │ 执行字节码，返回结果
    ▼
链上状态更新
```

---

## 3. 技术架构总览

### 3.1 系统架构图

```
┌────────────────────────────────────────────────────────────────────┐
│               Polkadot Revive Playground Architecture              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   React 18 + Vite 5 + TypeScript                                   │
│   [Step01 Connect] [Step02 Faucet] [Step03 ERC20 Deploy]           │
│   [Step04 Add Token] [Step05 Swap] [Step06 Mint NFT]               │
│          │                                                          │
│          │  wagmi v2 + viem 2.x                                    │
│          │  window.ethereum (EIP-1193)                             │
│          ▼                                                          │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │        Polkadot Hub TestNet — Revive Platform            │    │
│   │        Chain ID: 420420417 | REVM Compatible             │    │
│   │                                                          │    │
│   │  [REVM Backend — pallet-revive]                         │    │
│   │                                                          │    │
│   │  PlaygroundERC20.sol   ← 学习者自行部署                  │    │
│   │  TeachingSwapRouter.sol ← 项目预部署                    │    │
│   │  PlaygroundNFT.sol     ← 项目预部署（共享合约）          │    │
│   │                                                          │    │
│   │  RPC: https://eth-rpc-testnet.polkadot.io/              │    │
│   │  Explorer: https://blockscout-testnet.polkadot.io/       │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                     │
│   Hardhat 2.x（合约编译 + 部署脚本）                               │
│   No backend — 纯前端 + 链交互                                     │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 技术栈

| 层级 | 选型 | 版本 | 说明 |
|------|------|------|------|
| **目标链** | Polkadot Hub TestNet (Revive) | — | Chain ID `420420417`，REVM 全兼容 |
| **合约语言** | Solidity | 0.8.28 | 标准 Solidity，无需修改直接在 REVM 上运行 |
| **合约工具** | Hardhat + hardhat-toolbox-viem | 2.x | 编译、测试、部署，viem 插件版 |
| **前端框架** | React 18 + Vite 5 + TypeScript | — | SPA，Hash Router |
| **样式** | Tailwind CSS v4 + @tailwindcss/vite | — | CSS Variables + Polkadot 品牌色系 |
| **钱包交互** | wagmi v2 + viem 2.x | — | 官方支持 Polkadot Hub，标准 EIP-1193 |
| **钱包连接 UI** | RainbowKit v2 | — | 可选，或直接用 wagmi hooks |
| **状态管理** | Zustand + @tanstack/react-query | — | 全局链状态 + 合约数据缓存 |
| **合约部署** | Hardhat scripts（运营侧）+ viem（用户侧）| — | 运营预部署 Router & NFT；用户通过前端部署 ERC20 |

### 3.3 架构决策说明

**为什么选 React + viem 而不是 Vanilla JS？**

Polkadot 官方文档和 NFTMozaic 教学项目均以 wagmi v2 + viem 为推荐前端技术栈。viem 是类型安全的 TypeScript-first 库，比 ethers.js 更适合与 React 生态集成，且对 Polkadot Hub 的 JSON-RPC 有原生支持（直接 `createPublicClient` 指向 Polkadot Hub RPC 即可）。对学习者而言，掌握 wagmi hooks（`useAccount`、`useWriteContract`、`useReadContract`）是当前 Web3 前端开发的主流路径。

**为什么 NFT 使用预部署合约而不是让用户自己部署？**

ERC721 合约部署需要合约 owner 权限才能 mint。如果每个学习者都部署自己的合约，意味着他们既是 owner 又是 minter，体验与真实 NFT 项目（合约固定，用户 mint）有本质差别。使用项目预部署的**共享 Playground NFT 合约**（`open mint` 模式，任何人都可以调用 `safeMint`），更贴近真实 NFT 发售体验——学习者感受的是"参与一个 NFT 项目的 mint"，而不是"自己部署自己 mint"。此外这也降低了学习者需要管理的合约数量，降低认知负担。

**为什么 Swap 使用固定汇率 Router？**

真实 Uniswap V2/V3 的 AMM 数学逻辑（恒定乘积公式、流动性管理）超出本教学的范畴。教学目标是让学习者理解 `approve → swap` 这个两步交互模型。固定汇率 Router 让学习者专注于钱包交互流程，而不是 AMM 背后的数学。

---

## 4. 网络配置 & 参数速查

### 4.1 Polkadot Hub TestNet

| 参数 | 值 |
|------|-----|
| Network Name | `Polkadot Hub TestNet` |
| Chain ID (Dec) | `420420417` |
| Chain ID (Hex) | `0x18F82281` |
| Currency Symbol | `PAS` |
| Currency Decimals | `18` |
| 执行后端 | REVM（via Revive / pallet-revive）|
| RPC URL | `https://eth-rpc-testnet.polkadot.io/` |
| 备用 RPC | `https://services.polkadothub-rpc.com/testnet/` |
| Block Explorer | `https://blockscout-testnet.polkadot.io/` |
| 官方水龙头 | `https://faucet.polkadot.io/` |
| 官方文档 | `https://docs.polkadot.com/smart-contracts/` |

### 4.2 wagmi 链定义（`src/lib/wagmi.ts`）

```typescript
// src/lib/wagmi.ts
import { defineChain } from 'viem';
import { createConfig, http } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'Paseo',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-testnet.polkadot.io/'],
    },
    fallback: {
      http: ['https://services.polkadothub-rpc.com/testnet/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-testnet.polkadot.io',
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [polkadotHubTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [polkadotHubTestnet.id]: http(),
  },
});
```

### 4.3 MetaMask 一键添加网络

```typescript
// 通过 wagmi 的 switchChain / addChain 自动处理
// 或直接调用 wallet_addEthereumChain
await walletClient.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x18F82281',
    chainName: 'Polkadot Hub TestNet',
    nativeCurrency: { name: 'Paseo', symbol: 'PAS', decimals: 18 },
    rpcUrls: ['https://eth-rpc-testnet.polkadot.io/'],
    blockExplorerUrls: ['https://blockscout-testnet.polkadot.io/'],
  }],
});
```

### 4.4 测试代币领取

**PAS（Gas 代币）**

- 水龙头地址：**https://faucet.polkadot.io/**
- 操作：打开页面 → 选择 `Polkadot Hub TestNet` → 粘贴 `0x...` 地址 → 领取
- 说明：PAS 是本项目唯一需要从外部领取的代币。ERC20 通过合约 mint 函数在链上铸造，NFT 通过预部署合约 mint。

---

## 5. 智能合约设计

### 5.1 合约总览

| 合约 | 文件 | 部署方 | 职责 |
|------|------|--------|------|
| `PlaygroundERC20` | `PlaygroundERC20.sol` | **学习者自行部署** | 可自定义名称/符号/精度的 ERC20，含 mint |
| `TeachingSwapRouter` | `TeachingSwapRouter.sol` | **项目预部署** | 固定汇率 ERC20→PAS 兑换，演示 approve→swap |
| `PlaygroundNFT` | `PlaygroundNFT.sol` | **项目预部署** | 开放 mint 的 ERC721，任何人可铸造纪念 NFT |

### 5.2 合约关系图

```
学习者钱包 (MetaMask)
    │
    ├─ 部署 ──► PlaygroundERC20（学习者自己的 ERC20）
    │               └─ approve(swapRouter, amount) → 授权 Router
    │
    ├─ 交互 ──► TeachingSwapRouter（项目预部署）
    │               └─ swap(tokenAddr, amountIn) → 收 ERC20，返 PAS
    │
    └─ 交互 ──► PlaygroundNFT（项目预部署，open mint）
                    └─ safeMint(to, tokenURI) → 铸造纪念 NFT（任何人可调用）
                    └─ tokenURI = data:application/json;base64,...（前端构建）
```

### 5.3 PlaygroundERC20 设计要点

- 继承 OpenZeppelin `ERC20` + `Ownable`（v5）
- `decimals` 在构造函数中传入，支持 0–18
- 构造函数向 `initialOwner` 铸造 `initialSupply * 10^decimals` 枚代币
- `mint(address to, uint256 amount)` 仅 `onlyOwner`，`amount` 为整数单位（非 wei）
- 无暂停、无销毁，保持最小复杂度，专注教学

### 5.4 TeachingSwapRouter 设计要点

- 接受任意 ERC20（需用户先 `approve`）
- 固定汇率 `rate`：`rate` 个 token-wei = 1 PAS-wei，默认 `rate = 1000`（即 1000 token 单位 = 1 PAS 单位）
- `owner` 通过 `setRate(uint256)` 可调整汇率
- 合约预存 PAS 作为流动性（项目部署后注入）
- `receive() external payable` 接受 PAS 注入
- 触发 `Swapped` 事件，前端通过 viem 的 `watchContractEvent` 监听

> ⚠️ **教学声明**：无滑点保护、无重入保护，**仅供测试网教学使用**。

### 5.5 PlaygroundNFT 设计要点

- 继承 `ERC721URIStorage` + `Ownable`（v5）
- **关键设计：`safeMint` 为 `public`，任何人可调用**（open mint 模式，无需白名单）
- token ID 从 1 自动递增
- `tokenURI` 由前端构建为 `data:application/json;base64,...` 格式，内嵌完整 metadata
- metadata 格式兼容 OpenSea 标准：包含 `name`、`description`、`image`、`attributes`
- `attributes` 中包含学习者地址、Mint 时间戳、"Polkadot Revive Playground Graduate" 成就标签
- `totalMinted()` 公开函数用于前端显示当前总 mint 数量

---

## 6. 前端设计

### 6.1 页面布局

```
┌──────────────────────────────────────────────────────────────────┐
│  Header: Logo | 网络状态 Pill (Polkadot Hub TestNet / REVM) | 钱包按钮 │
├──────────────────────────────────────────────────────────────────┤
│  [!] Connect Banner（未连接时显示）                               │
├──────────────────────────────────────────────────────────────────┤
│  STEP 01 ─ 连接钱包 & 配置 REVM 网络                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │ Polkadot Hub TestNet    │  │ 钱包状态面板                  │  │
│  │ 参数速查（REVM标注）    │  │ 地址 / 网络 / PAS 余额       │  │
│  │ [添加到 MetaMask]       │  │ [连接] [切换到 Polkadot Hub] │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  STEP 02 ─ 领取测试代币                                           │
│  说明文字 + 水龙头链接（https://faucet.polkadot.io/）明文展示    │
│  当前 PAS 余额实时显示 + [刷新余额]                               │
├──────────────────────────────────────────────────────────────────┤
│  STEP 03 ─ 部署 ERC20 合约（via REVM）                           │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │ 参数表单              │  │ 实时 Solidity 代码预览            │ │
│  │ 名称/符号/精度/供应量 │  │ 随输入动态更新，语法高亮         │ │
│  │ [部署] 四步进度条     │  │ 文件名实时更新（SYMBOL.sol）     │ │
│  │ 部署结果 + Blockscout │  └──────────────────────────────────┘ │
│  └──────────────────────┘                                         │
├──────────────────────────────────────────────────────────────────┤
│  STEP 04 ─ 添加代币到 MetaMask                                    │
│  Token 预览卡（图标 / 名称 / 合约地址 / 余额）                    │
│  [添加 ERC20 到 MetaMask] [Mint 更多代币]                        │
├──────────────────────────────────────────────────────────────────┤
│  STEP 05 ─ Swap 演示（ERC20 → PAS）                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Swap 表单             │  │ 合约调用代码说明（随输入更新）   │ │
│  │ From/To/汇率/影响     │  │ 交易记录 Feed                   │ │
│  │ [执行 Swap]           │  └──────────────────────────────────┘ │
│  └──────────────────────┘                                         │
├──────────────────────────────────────────────────────────────────┤
│  STEP 06 ─ Mint 纪念 NFT（结业凭证）                             │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │ NFT 自定义表单        │  │ NFT 卡片预览                     │ │
│  │ NFT 名称/描述/头像URL │  │ 图片 + metadata JSON 预览        │ │
│  │ [Mint 我的纪念 NFT]  │  │ 当前已 mint 总数                 │ │
│  │ [添加 NFT 到 MetaMask│  └──────────────────────────────────┘ │
│  └──────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 设计规范

**色彩系统（CSS Variables）**

| 变量 | 值 | 用途 |
|------|-----|------|
| `--dot-pink` | `#E6007A` | Polkadot 品牌粉，主操作色 |
| `--dot-purple` | `#6D3AEE` | 辅助紫，渐变/强调 |
| `--neon-green` | `#00FFA3` | 成功/余额/链上确认 |
| `--bg-void` | `#070A10` | 主背景 |
| `--bg-card` | `#111823` | 卡片背景 |
| `--text-primary` | `#F0F4FF` | 主文字 |
| `--text-secondary` | `#7A8BA8` | 次要文字/标签 |

**字体**

- Display/UI：`Syne`（Google Fonts）— 800/700/600/400
- Mono/代码/地址：`Space Mono`（Google Fonts）— 700/400

**动效**

- 卡片 hover：`border-color` 200ms ease
- 按钮：`translateY(-1px)` + `box-shadow` glow
- 进度步骤：`pulse` keyframe 动画（dot 闪烁）
- NFT 卡片 mint 后：`fadeSlideUp` 入场
- Toast：`translateX(20px)` 滑入 + 淡出

### 6.3 React 组件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 顶部 Logo + 网络状态 + 钱包按钮
│   │   └── ConnectBanner.tsx     # 未连接时顶部横幅提示
│   ├── steps/
│   │   ├── Step01Connect.tsx     # 连接钱包 + 添加网络
│   │   ├── Step02Faucet.tsx      # 水龙头引导 + 余额显示
│   │   ├── Step03DeployERC20.tsx # 部署表单 + 代码预览 + 进度条
│   │   ├── Step04AddToken.tsx    # 代币预览 + wallet_watchAsset
│   │   ├── Step05Swap.tsx        # Swap 表单 + 代码说明 + TX feed
│   │   └── Step06MintNFT.tsx     # NFT 定制表单 + 预览 + Mint + 添加到钱包
│   ├── shared/
│   │   ├── CodeViewer.tsx        # Solidity 代码语法高亮面板
│   │   ├── ProgressSteps.tsx     # 四步部署进度条
│   │   ├── TxFeed.tsx            # 交易记录 Feed
│   │   ├── Toast.tsx             # Toast 通知系统
│   │   └── NFTCard.tsx           # NFT 展示卡片（图片 + metadata）
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── hooks/
│   ├── useDeployERC20.ts         # ERC20 部署逻辑（viem deployContract）
│   ├── useSwap.ts                # approve + swap 两步逻辑
│   ├── useMintNFT.ts             # 调用预部署 NFT 合约的 safeMint
│   ├── useAddToken.ts            # wallet_watchAsset ERC20 / ERC721
│   ├── useNetworkSwitch.ts       # 切换到 Polkadot Hub TestNet
│   └── useTokenBalance.ts        # 读取 ERC20 余额（useReadContract）
├── lib/
│   ├── wagmi.ts                  # wagmi config + polkadotHubTestnet 链定义
│   ├── contracts/
│   │   ├── abis.ts               # 合约 ABI 常量（从 Hardhat artifacts 导出）
│   │   ├── bytecodes.ts          # ERC20 字节码（用于前端部署）
│   │   └── addresses.ts          # 预部署合约地址常量
│   └── codeGen.ts                # 根据表单参数生成 Solidity HTML 字符串
├── store/
│   └── appStore.ts               # Zustand 全局状态
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

### 6.4 Zustand 全局状态（`src/store/appStore.ts`）

```typescript
// src/store/appStore.ts
import { create } from 'zustand';
import type { Address } from 'viem';

interface TxRecord {
  type: string;
  description: string;
  hash: `0x${string}`;
  amount: string;
  direction: 'in' | 'out';
  timestamp: number;
}

interface MintedNFT {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  txHash: `0x${string}`;
}

interface AppStore {
  // ERC20 state
  erc20Address: Address | null;
  erc20Symbol: string;
  erc20Name: string;
  erc20Decimals: number;
  setERC20(address: Address, symbol: string, name: string, decimals: number): void;

  // NFT state
  mintedNFT: MintedNFT | null;
  setMintedNFT(nft: MintedNFT): void;

  // TX history
  txHistory: TxRecord[];
  addTxRecord(record: TxRecord): void;
}

export const useAppStore = create<AppStore>((set) => ({
  erc20Address: null,
  erc20Symbol: 'MTT',
  erc20Name: 'My Test Token',
  erc20Decimals: 18,
  setERC20: (address, symbol, name, decimals) =>
    set({ erc20Address: address, erc20Symbol: symbol, erc20Name: name, erc20Decimals: decimals }),

  mintedNFT: null,
  setMintedNFT: (nft) => set({ mintedNFT: nft }),

  txHistory: [],
  addTxRecord: (record) =>
    set((s) => ({ txHistory: [record, ...s.txHistory].slice(0, 20) })),
}));
```

---

## 7. 教学流程设计

### 7.1 步骤详细说明

#### Step 01 — 连接钱包 & 配置 REVM 网络

**用户操作**：点击"连接 MetaMask" → 点击"添加到 MetaMask"

**前端实现**：

```typescript
// hooks/useNetworkSwitch.ts
import { useSwitchChain, useWalletClient } from 'wagmi';
import { polkadotHubTestnet } from '@/lib/wagmi';

export function useNetworkSwitch() {
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const addAndSwitchToPolkadot = async () => {
    try {
      await switchChainAsync({ chainId: polkadotHubTestnet.id });
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not in wallet — add it first
        await walletClient?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x18F82281',
            chainName: 'Polkadot Hub TestNet',
            nativeCurrency: { name: 'Paseo', symbol: 'PAS', decimals: 18 },
            rpcUrls: ['https://eth-rpc-testnet.polkadot.io/'],
            blockExplorerUrls: ['https://blockscout-testnet.polkadot.io/'],
          }],
        });
      } else if (err.code !== 4001) {
        throw err;
      }
    }
  };

  return { addAndSwitchToPolkadot };
}
```

**教学要点**：讲解 EIP-1193 Provider API，`eth_requestAccounts`，`wallet_addEthereumChain`，以及 Polkadot Hub TestNet 通过 REVM 提供与以太坊完全相同的 JSON-RPC 接口。

---

#### Step 02 — 领取测试代币

**用户操作**：点击链接跳转官方水龙头，复制地址领取 PAS

**显示内容**：
- 明文水龙头地址：`https://faucet.polkadot.io/`（不使用跳转卡片，直接显示 URL）
- 操作步骤：选择 `Polkadot Hub TestNet` → 粘贴 `0x` 地址 → 点击领取
- 当前 PAS 余额（`useBalance` hook 实时读取）
- [刷新余额] 按钮

---

#### Step 03 — 部署 ERC20 合约（via REVM）

**用户操作**：填写表单 → 右侧代码实时更新 → 点击"部署" → MetaMask 弹窗确认

**viem 部署实现**：

```typescript
// hooks/useDeployERC20.ts
import { useWalletClient, usePublicClient } from 'wagmi';
import { PLAYGROUND_ERC20_ABI, PLAYGROUND_ERC20_BYTECODE } from '@/lib/contracts/abis';

export function useDeployERC20() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const deploy = async ({
    name, symbol, decimals, initialSupply,
  }: {
    name: string; symbol: string; decimals: number; initialSupply: bigint;
  }) => {
    if (!walletClient || !publicClient) throw new Error('Wallet not connected');

    // viem deployContract — sends tx with bytecode + encoded constructor args
    const hash = await walletClient.deployContract({
      abi: PLAYGROUND_ERC20_ABI,
      bytecode: PLAYGROUND_ERC20_BYTECODE,
      args: [name, symbol, decimals, initialSupply, walletClient.account.address],
    });

    // Wait for receipt (1 confirmation)
    const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
    if (!receipt.contractAddress) throw new Error('Deploy failed: no contract address in receipt');

    return { contractAddress: receipt.contractAddress, txHash: hash };
  };

  return { deploy };
}
```

**四步进度条**：

```
[1: 编译字节码] ──► [2: MetaMask 签名] ──► [3: 等待确认] ──► [4: 部署成功]
```

**部署结果**：合约地址（可复制）+ Tx Hash + Gas 消耗 + 区块高度 + Blockscout 链接

---

#### Step 04 — 将代币添加到 MetaMask

**用户操作**：点击"添加 ERC20 到 MetaMask"

**实现**：

```typescript
// hooks/useAddToken.ts
import { useWalletClient } from 'wagmi';

export function useAddToken() {
  const { data: walletClient } = useWalletClient();

  const addERC20 = async ({
    address, symbol, decimals,
  }: { address: `0x${string}`; symbol: string; decimals: number }) => {
    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: { address, symbol, decimals },
      },
    });
  };

  const addERC721 = async ({
    address, tokenId,
  }: { address: `0x${string}`; tokenId: string }) => {
    await walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: { address, tokenId },
      },
    });
  };

  return { addERC20, addERC721 };
}
```

**同时提供**：
- [Mint 更多代币] 按钮（调用合约 `mint` 函数，仅 owner 可用）
- 当前余额（`useReadContract` 实时读取 `balanceOf`）

---

#### Step 05 — Swap 演示（ERC20 → PAS）

**用户操作**：输入兑换数量 → 点击"执行 Swap"（内部自动 approve + swap 两步）

**两步流程**：

```
[用户点击 "执行 Swap"]
    │
    ▼
Step 1/2: Approve
    │  token.approve(swapRouterAddress, amountIn)
    │  MetaMask 弹窗 #1 → 用户确认
    ▼
Step 2/2: Swap
    │  router.swap(tokenAddress, amountIn)
    │  MetaMask 弹窗 #2 → 用户确认
    ▼
Swapped 事件 → 更新余额 → 添加 TX 记录
```

**viem 实现**：

```typescript
// hooks/useSwap.ts
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

export function useSwap() {
  const { writeContractAsync } = useWriteContract();

  const executeSwap = async ({
    tokenAddress, tokenSymbol, tokenDecimals,
    swapRouterAddress, amountIn,
  }: SwapParams) => {
    const amountWei = parseUnits(amountIn, tokenDecimals);

    // Step 1: Approve
    const approveTxHash = await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [swapRouterAddress, amountWei],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash: approveTxHash, confirmations: 1 });

    // Step 2: Swap
    const swapTxHash = await writeContractAsync({
      address: swapRouterAddress,
      abi: SWAP_ROUTER_ABI,
      functionName: 'swap',
      args: [tokenAddress, amountWei],
    });
    const swapReceipt = await waitForTransactionReceipt(wagmiConfig, {
      hash: swapTxHash, confirmations: 1,
    });

    return { approveTxHash, swapTxHash, receipt: swapReceipt };
  };

  return { executeSwap };
}
```

**右侧代码面板**：随输入金额实时更新合约调用参数，帮助学习者将界面操作与链上调用对应。

---

#### Step 06 — Mint 纪念 NFT（结业凭证）

**核心理念**：学习者完成前五步后，通过调用项目预部署的 `PlaygroundNFT` 合约铸造一枚专属纪念 NFT，作为完成本教学课程的凭证。

**用户操作**：填写 NFT 名称/描述/头像图片 URL → 右侧实时预览 → 点击"Mint 我的纪念 NFT" → MetaMask 确认 → Mint 成功 → 点击"添加 NFT 到 MetaMask"

**metadata 构建**：

```typescript
// lib/buildNFTMetadata.ts
export function buildNFTTokenURI({
  nftName,
  description,
  imageUrl,
  ownerAddress,
  tokenId,
}: BuildNFTParams): string {
  const metadata = {
    name: nftName || `Polkadot Revive Graduate #${tokenId}`,
    description: description || 'Awarded for completing the Polkadot Revive Playground tutorial.',
    image: imageUrl || 'https://via.placeholder.com/400x400?text=Polkadot+NFT',
    attributes: [
      { trait_type: 'Course',     value: 'Polkadot Revive Playground' },
      { trait_type: 'Network',    value: 'Polkadot Hub TestNet (REVM)' },
      { trait_type: 'Graduate',   value: ownerAddress },
      { trait_type: 'Token ID',   value: String(tokenId) },
      { trait_type: 'Mint Date',  value: new Date().toISOString().slice(0, 10) },
    ],
  };
  // data URI: no IPFS needed for testnet education
  return 'data:application/json;base64,' + btoa(JSON.stringify(metadata));
}
```

**NFT Mint 实现**：

```typescript
// hooks/useMintNFT.ts
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { PLAYGROUND_NFT_ADDRESS, PLAYGROUND_NFT_ABI } from '@/lib/contracts/addresses';
import { wagmiConfig } from '@/lib/wagmi';
import { buildNFTTokenURI } from '@/lib/buildNFTMetadata';

export function useMintNFT() {
  const { writeContractAsync } = useWriteContract();

  const mintNFT = async ({
    nftName, description, imageUrl, ownerAddress, nextTokenId,
  }: MintNFTParams) => {
    const tokenURI = buildNFTTokenURI({ nftName, description, imageUrl, ownerAddress, tokenId: nextTokenId });

    const hash = await writeContractAsync({
      address: PLAYGROUND_NFT_ADDRESS,
      abi: PLAYGROUND_NFT_ABI,
      functionName: 'safeMint',
      args: [ownerAddress, tokenURI],
    });

    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, confirmations: 1 });

    // Parse NFTMinted event to get actual tokenId
    // (in case nextTokenId was stale)
    return { hash, receipt };
  };

  return { mintNFT };
}
```

**添加 NFT 到 MetaMask**：

```typescript
// Mint 成功后，展示"添加 NFT 到 MetaMask"按钮
const handleAddNFT = async () => {
  await walletClient?.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC721',
      options: {
        address: PLAYGROUND_NFT_ADDRESS,
        tokenId: String(mintedTokenId),
      },
    },
  });
};
```

---

### 7.2 用户状态流转

```
[未连接]
    │ connectWallet()
    ▼
[已连接（非 Polkadot Hub）]
    │ switchToPolkadot()
    ▼
[已连接 Polkadot Hub TestNet · REVM]
    │ deployERC20()
    ▼
[ERC20 已部署]
    │ addERC20ToWallet() → 可选
    │ swap()
    ▼
[Swap 已体验]
    │ mintNFT()
    ▼
[NFT 已 Mint]
    │ addNFTToWallet()
    ▼
[全流程完成 🎓]
```

---

## 8. 目录结构

```
polkadot-revive-playground/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Pages 自动部署
│
├── contracts/                        # Hardhat 项目
│   ├── contracts/
│   │   ├── PlaygroundERC20.sol
│   │   ├── PlaygroundNFT.sol
│   │   └── TeachingSwapRouter.sol
│   ├── scripts/
│   │   ├── deploy-swap-router.ts     # 部署 Router + 注入 PAS 流动性
│   │   ├── deploy-nft.ts             # 部署 PlaygroundNFT（项目运营方执行）
│   │   └── export-abis.ts           # 导出 ABI + Bytecode 到 frontend
│   ├── test/
│   │   ├── PlaygroundERC20.test.ts
│   │   ├── PlaygroundNFT.test.ts
│   │   └── TeachingSwapRouter.test.ts
│   ├── hardhat.config.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/                         # React + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── ConnectBanner.tsx
│   │   │   ├── steps/
│   │   │   │   ├── Step01Connect.tsx
│   │   │   │   ├── Step02Faucet.tsx
│   │   │   │   ├── Step03DeployERC20.tsx
│   │   │   │   ├── Step04AddToken.tsx
│   │   │   │   ├── Step05Swap.tsx
│   │   │   │   └── Step06MintNFT.tsx
│   │   │   ├── shared/
│   │   │   │   ├── CodeViewer.tsx
│   │   │   │   ├── ProgressSteps.tsx
│   │   │   │   ├── TxFeed.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   └── NFTCard.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Card.tsx
│   │   ├── hooks/
│   │   │   ├── useDeployERC20.ts
│   │   │   ├── useSwap.ts
│   │   │   ├── useMintNFT.ts
│   │   │   ├── useAddToken.ts
│   │   │   ├── useNetworkSwitch.ts
│   │   │   └── useTokenBalance.ts
│   │   ├── lib/
│   │   │   ├── wagmi.ts              # wagmi config + polkadotHubTestnet 定义
│   │   │   ├── buildNFTMetadata.ts   # data URI tokenURI 构建
│   │   │   ├── codeGen.ts            # Solidity 代码动态生成（语法高亮 HTML）
│   │   │   └── contracts/
│   │   │       ├── abis.ts           # 合约 ABI 常量（auto-generated）
│   │   │       ├── bytecodes.ts      # ERC20 字节码（auto-generated）
│   │   │       └── addresses.ts      # 预部署合约地址
│   │   ├── store/
│   │   │   └── appStore.ts           # Zustand 全局状态
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                 # Tailwind + CSS Variables
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 9. 合约完整实现

### 9.1 PlaygroundERC20.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/PlaygroundERC20.sol
// Runs on Polkadot Hub TestNet via Revive (REVM backend)
// TESTNET ONLY — Educational use. NOT for production.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlaygroundERC20
 * @notice A customizable ERC20 token for educational use.
 *         Deployed by learners on Polkadot Hub TestNet (REVM via Revive).
 * @dev Standard Solidity — runs on REVM without modification.
 */
contract PlaygroundERC20 is ERC20, Ownable {
    uint8 private immutable _tokenDecimals;

    event Minted(address indexed to, uint256 amount);

    /**
     * @param name_         Token name (e.g. "My Test Token")
     * @param symbol_       Token symbol (e.g. "MTT")
     * @param decimals_     Decimal places (0–18)
     * @param initialSupply Whole-unit initial supply (minted to initialOwner)
     * @param initialOwner  Owner of the contract and initial supply
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner
    )
        ERC20(name_, symbol_)
        Ownable(initialOwner)
    {
        _tokenDecimals = decimals_;
        _mint(initialOwner, initialSupply * (10 ** uint256(decimals_)));
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }

    /**
     * @notice Mint additional tokens (whole units). TESTNET ONLY — no cap.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * (10 ** uint256(_tokenDecimals)));
        emit Minted(to, amount);
    }
}
```

### 9.2 PlaygroundNFT.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/PlaygroundNFT.sol
// Pre-deployed by the Playground project on Polkadot Hub TestNet (REVM via Revive)
// OPEN MINT — anyone can call safeMint to receive a graduation NFT.
// TESTNET ONLY — Educational use.

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlaygroundNFT
 * @notice Pre-deployed ERC-721 graduation NFT for Polkadot Revive Playground.
 *         Open mint: any address may call safeMint() to receive a certificate NFT.
 *         Token metadata is supplied as a data-URI (base64-encoded JSON) by the frontend.
 * @dev Standard Solidity — runs on REVM backend (Revive / pallet-revive).
 */
contract PlaygroundNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    /// @notice Maximum NFTs a single address can mint (anti-spam)
    uint256 public maxPerWallet = 5;

    mapping(address => uint256) public mintedPerWallet;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    error ExceedsMaxPerWallet(address minter, uint256 current, uint256 max);

    constructor(address initialOwner)
        ERC721("Polkadot Revive Playground Graduate", "PRPG")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint a graduation NFT. Open to any address (up to maxPerWallet).
     * @param to        Recipient address (usually msg.sender)
     * @param tokenUri  data:application/json;base64,... metadata URI built by frontend
     * @return tokenId  The newly minted token ID (starts at 1)
     */
    function safeMint(address to, string calldata tokenUri)
        external
        returns (uint256 tokenId)
    {
        if (mintedPerWallet[msg.sender] >= maxPerWallet)
            revert ExceedsMaxPerWallet(msg.sender, mintedPerWallet[msg.sender], maxPerWallet);

        _tokenIdCounter++;
        tokenId = _tokenIdCounter;
        mintedPerWallet[msg.sender]++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        emit NFTMinted(to, tokenId, tokenUri);
    }

    /**
     * @notice Total NFTs minted across all users.
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Next token ID that will be assigned.
     */
    function nextTokenId() external view returns (uint256) {
        return _tokenIdCounter + 1;
    }

    /**
     * @notice Owner can update the per-wallet limit.
     */
    function setMaxPerWallet(uint256 newMax) external onlyOwner {
        maxPerWallet = newMax;
    }
}
```

### 9.3 TeachingSwapRouter.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// contracts/TeachingSwapRouter.sol
// Pre-deployed by the Playground project on Polkadot Hub TestNet (REVM via Revive)
// Fixed-rate ERC20 → PAS swap for teaching the approve + swap pattern.
// WARNING: No slippage protection, no reentrancy guard — TESTNET ONLY.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TeachingSwapRouter
 * @notice A simplified fixed-rate swap: ERC20 tokens → PAS (native gas token).
 *         Demonstrates the two-step approve → swap interaction pattern on REVM.
 * @dev rate = token-wei per 1 PAS-wei. Default: 1000 (1000 MTT = 1 PAS).
 */
contract TeachingSwapRouter is Ownable {
    uint256 public rate;

    event Swapped(address indexed user, address indexed token, uint256 amountIn, uint256 amountOut);
    event RateUpdated(uint256 oldRate, uint256 newRate);

    error InvalidAmount();
    error InvalidRate();
    error InsufficientPASLiquidity();

    constructor(address initialOwner, uint256 initialRate) Ownable(initialOwner) {
        if (initialRate == 0) revert InvalidRate();
        rate = initialRate;
    }

    /**
     * @notice Swap ERC20 tokens for PAS.
     * @dev    MUST call token.approve(address(this), amountIn) first.
     * @param  token     ERC20 token address
     * @param  amountIn  Token amount in wei
     */
    function swap(address token, uint256 amountIn) external {
        if (amountIn == 0) revert InvalidAmount();
        uint256 amountOut = amountIn / rate;
        if (amountOut == 0) revert InvalidAmount();
        if (address(this).balance < amountOut) revert InsufficientPASLiquidity();

        IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        (bool sent, ) = payable(msg.sender).call{value: amountOut}("");
        require(sent, "PAS transfer failed");

        emit Swapped(msg.sender, token, amountIn, amountOut);
    }

    function setRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();
        emit RateUpdated(rate, newRate);
        rate = newRate;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function withdrawPAS(uint256 amount) external onlyOwner {
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "PAS withdraw failed");
    }

    function pasBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
```

---

## 10. 前端核心实现

### 10.1 viem 链配置（`src/lib/wagmi.ts`）

见第 4.2 节完整代码。

### 10.2 ERC20 代码动态生成（`src/lib/codeGen.ts`）

```typescript
// src/lib/codeGen.ts

interface ERC20CodeParams {
  name: string;
  symbol: string;
  decimals: number | string;
  supply: number | string;
}

/**
 * Generate syntax-highlighted HTML for PlaygroundERC20 Solidity source.
 * Called on every form input change to update the code preview panel.
 */
export function generateERC20SolidityHTML({ name, symbol, decimals, supply }: ERC20CodeParams): string {
  const contractName = (symbol || 'MTT').replace(/[^a-zA-Z0-9_]/g, '') || 'MyToken';
  const kw = (s: string) => `<span class="c-kw">${s}</span>`;
  const ty = (s: string) => `<span class="c-type">${s}</span>`;
  const fn = (s: string) => `<span class="c-fn">${s}</span>`;
  const st = (s: string) => `<span class="c-str">${s}</span>`;
  const nm = (s: string) => `<span class="c-num">${s}</span>`;
  const cm = (s: string) => `<span class="c-comment">${s}</span>`;

  return `${cm('// SPDX-License-Identifier: MIT')}
${kw('pragma solidity')} ^${nm('0.8.28')};

${cm('// Polkadot Hub TestNet — Revive (REVM backend)')}
${cm('// TESTNET ONLY')}

${kw('import')} ${st('"@openzeppelin/contracts/token/ERC20/ERC20.sol"')};
${kw('import')} ${st('"@openzeppelin/contracts/access/Ownable.sol"')};

${kw('contract')} ${ty(contractName)} ${kw('is')} ${ty('ERC20')}, ${ty('Ownable')} {

  ${ty('uint8')} ${kw('private immutable')} _tokenDecimals = ${nm(String(decimals))};

  ${fn('constructor')}(${ty('address')} initialOwner)
    ${fn('ERC20')}(${st(`"${name || 'My Test Token'}"`)} , ${st(`"${symbol || 'MTT'}"`)} )
    ${fn('Ownable')}(initialOwner)
  {
    ${fn('_mint')}(initialOwner,
      ${nm(String(supply || 1000000))} * ${nm('10')} ** ${nm(String(decimals))});
  }

  ${kw('function')} ${fn('decimals')}()
    ${kw('public view override returns')} (${ty('uint8')})
  { ${kw('return')} _tokenDecimals; }

  ${kw('function')} ${fn('mint')}(${ty('address')} to, ${ty('uint256')} amount)
    ${kw('external onlyOwner')}
  {
    ${fn('_mint')}(to, amount * ${nm('10')} ** ${nm(String(decimals))});
  }
}`;
}
```

### 10.3 NFT Metadata 构建（`src/lib/buildNFTMetadata.ts`）

```typescript
// src/lib/buildNFTMetadata.ts

interface BuildNFTParams {
  nftName: string;
  description: string;
  imageUrl: string;
  ownerAddress: string;
  tokenId: number;
}

/**
 * Build an OpenSea-compatible NFT metadata JSON encoded as a data URI.
 * Using data URI avoids needing IPFS or any file hosting for testnet education.
 */
export function buildNFTTokenURI(params: BuildNFTParams): string {
  const { nftName, description, imageUrl, ownerAddress, tokenId } = params;

  const metadata = {
    name: nftName || `Polkadot Revive Graduate #${tokenId}`,
    description: description || 'Awarded for completing the Polkadot Revive Playground tutorial on Polkadot Hub TestNet.',
    image: imageUrl || `https://via.placeholder.com/500x500/E6007A/FFFFFF?text=PRPG+%23${tokenId}`,
    external_url: 'https://blockscout-testnet.polkadot.io/',
    attributes: [
      { trait_type: 'Course',        value: 'Polkadot Revive Playground' },
      { trait_type: 'Network',       value: 'Polkadot Hub TestNet' },
      { trait_type: 'VM Backend',    value: 'REVM (via Revive)' },
      { trait_type: 'Graduate',      value: ownerAddress },
      { trait_type: 'Token ID',      value: String(tokenId) },
      { trait_type: 'Mint Date',     value: new Date().toISOString().slice(0, 10) },
      { trait_type: 'Achievement',   value: 'First On-Chain NFT' },
    ],
  };

  const json = JSON.stringify(metadata);
  return `data:application/json;base64,${btoa(unescape(encodeURIComponent(json)))}`;
}

/**
 * Decode a data URI token URI back to metadata object (for preview).
 */
export function decodeTokenURI(tokenURI: string): Record<string, unknown> | null {
  try {
    if (!tokenURI.startsWith('data:application/json;base64,')) return null;
    const base64 = tokenURI.replace('data:application/json;base64,', '');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}
```

### 10.4 Step06MintNFT 组件（`src/components/steps/Step06MintNFT.tsx`）

```tsx
// src/components/steps/Step06MintNFT.tsx
import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useMintNFT } from '@/hooks/useMintNFT';
import { useAddToken } from '@/hooks/useAddToken';
import { buildNFTTokenURI, decodeTokenURI } from '@/lib/buildNFTMetadata';
import { PLAYGROUND_NFT_ADDRESS, PLAYGROUND_NFT_ABI } from '@/lib/contracts/addresses';
import { useAppStore } from '@/store/appStore';
import { NFTCard } from '@/components/shared/NFTCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Step06MintNFT() {
  const { address } = useAccount();
  const { mintNFT, isPending } = useMintNFT();
  const { addERC721 } = useAddToken();
  const { mintedNFT, setMintedNFT, addTxRecord } = useAppStore();

  const [nftName, setNftName]           = useState('');
  const [description, setDescription]   = useState('');
  const [imageUrl, setImageUrl]         = useState('');

  // Read next token ID from pre-deployed contract
  const { data: nextTokenId } = useReadContract({
    address: PLAYGROUND_NFT_ADDRESS,
    abi: PLAYGROUND_NFT_ABI,
    functionName: 'nextTokenId',
    query: { refetchInterval: 5_000 },
  });

  const { data: totalMinted } = useReadContract({
    address: PLAYGROUND_NFT_ADDRESS,
    abi: PLAYGROUND_NFT_ABI,
    functionName: 'totalMinted',
  });

  // Build preview metadata
  const previewTokenURI = address
    ? buildNFTTokenURI({
        nftName, description, imageUrl,
        ownerAddress: address,
        tokenId: Number(nextTokenId ?? 1n),
      })
    : null;
  const previewMetadata = previewTokenURI ? decodeTokenURI(previewTokenURI) : null;

  const handleMint = async () => {
    if (!address || !nextTokenId) return;
    const tokenId = Number(nextTokenId);
    const tokenURI = buildNFTTokenURI({ nftName, description, imageUrl, ownerAddress: address, tokenId });

    const { hash } = await mintNFT({ nftName, description, imageUrl, ownerAddress: address, nextTokenId: tokenId });

    setMintedNFT({ tokenId, name: nftName || `Graduate #${tokenId}`, description, image: imageUrl, txHash: hash });
    addTxRecord({ type: 'mint-nft', description: `Mint NFT #${tokenId}`, hash, amount: `#${tokenId}`, direction: 'in', timestamp: Date.now() });
  };

  const handleAddToWallet = () => {
    if (!mintedNFT) return;
    addERC721({ address: PLAYGROUND_NFT_ADDRESS, tokenId: String(mintedNFT.tokenId) });
  };

  return (
    <section id="step06" className="mb-16">
      <div className="section-header">
        <span className="step-badge">STEP 06</span>
        <h2 className="section-title">Mint 纪念 NFT — 你的结业凭证</h2>
      </div>

      <div className="callout callout-purple">
        <span className="callout-icon">🎓</span>
        <p>
          恭喜完成前五步！现在通过调用项目预部署的 <code>PlaygroundNFT</code> 合约（REVM），
          铸造一枚专属纪念 NFT。合约地址：
          <a href={`https://blockscout-testnet.polkadot.io/address/${PLAYGROUND_NFT_ADDRESS}`}
             target="_blank" rel="noopener" className="link">
            {PLAYGROUND_NFT_ADDRESS}
          </a>
          。当前已铸造：<strong>{String(totalMinted ?? 0n)}</strong> 枚。
        </p>
      </div>

      <div className="two-col-grid">
        {/* Left: Form */}
        <div className="card">
          <div className="form-group">
            <label className="form-label">NFT 名称</label>
            <Input
              placeholder={`Polkadot Revive Graduate #${nextTokenId ?? '?'}`}
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">描述</label>
            <Input
              placeholder="我完成了 Polkadot Revive Playground 教学课程！"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">头像图片 URL（可选）</label>
            <Input
              placeholder="https://example.com/my-avatar.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleMint}
            loading={isPending}
            disabled={!address || isPending || !!mintedNFT}
            className="w-full mt-2"
          >
            {mintedNFT ? '✅ 已铸造' : '🎓 Mint 我的纪念 NFT'}
          </Button>

          {mintedNFT && (
            <Button
              variant="success"
              onClick={handleAddToWallet}
              className="w-full mt-2"
            >
              🦊 添加 NFT 到 MetaMask
            </Button>
          )}

          {mintedNFT && (
            <div className="deploy-result show mt-4">
              <div className="result-row">
                <span className="result-label">Token ID</span>
                <span className="result-value">#{mintedNFT.tokenId}</span>
              </div>
              <div className="result-row">
                <span className="result-label">合约地址</span>
                <span className="result-value font-mono text-xs">{PLAYGROUND_NFT_ADDRESS}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Tx Hash</span>
                <a
                  href={`https://blockscout-testnet.polkadot.io/tx/${mintedNFT.txHash}`}
                  target="_blank" rel="noopener"
                  className="result-value link text-xs"
                >
                  在 Blockscout 查看 ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: NFT Preview */}
        <div>
          <NFTCard
            metadata={previewMetadata}
            tokenId={Number(nextTokenId ?? 1n)}
            isPreview={!mintedNFT}
          />
        </div>
      </div>
    </section>
  );
}
```

---

## 11. 部署流程

### 11.1 前置准备

```bash
# 克隆项目
git clone https://github.com/your-org/polkadot-revive-playground.git
cd polkadot-revive-playground/contracts

npm install

cp .env.example .env
# 填写 DEPLOYER_PRIVATE_KEY（用于部署 Router 和 NFT 合约）
```

`.env.example`：

```bash
# contracts/.env.example — NEVER commit .env
DEPLOYER_PRIVATE_KEY=0xYourPrivateKeyHere
POLKADOT_HUB_RPC=https://eth-rpc-testnet.polkadot.io/
POLKADOT_EXPLORER=https://blockscout-testnet.polkadot.io/
```

### 11.2 Hardhat 配置（`contracts/hardhat.config.ts`）

```typescript
// contracts/hardhat.config.ts
import type { HardhatUserConfig } from 'hardhat/config';
import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import { vars } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Polkadot Hub TestNet — REVM via Revive (pallet-revive)
    polkadotHubTestnet: {
      url: vars.get('POLKADOT_HUB_RPC', 'https://eth-rpc-testnet.polkadot.io/'),
      chainId: 420420417,
      accounts: [vars.get('PRIVATE_KEY')],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
};

export default config;
```

### 11.3 部署脚本（运营方执行）

```bash
# 1. 编译
npx hardhat compile

# 2. 部署 TeachingSwapRouter
npx hardhat run scripts/deploy-swap-router.ts --network polkadotHubTestnet

# 3. 部署 PlaygroundNFT（学习者共享合约）
npx hardhat run scripts/deploy-nft.ts --network polkadotHubTestnet

# 4. 将 ABI 和 Bytecode 导出到前端
npx hardhat run scripts/export-abis.ts
```

`scripts/deploy-nft.ts`：

```typescript
import { viem } from 'hardhat';

async function main() {
  const [deployer] = await viem.getWalletClients();
  console.log('Deploying PlaygroundNFT with:', deployer.account.address);

  const nft = await viem.deployContract('PlaygroundNFT', [deployer.account.address]);
  console.log('PlaygroundNFT deployed to:', nft.address);
  console.log('Add to frontend/src/lib/contracts/addresses.ts:');
  console.log(`  PLAYGROUND_NFT_ADDRESS = "${nft.address}"`);
}

main().catch(console.error);
```

### 11.4 前端 ABI 导出（`scripts/export-abis.ts`）

```typescript
// contracts/scripts/export-abis.ts
import fs from 'fs';
import path from 'path';

const contracts = ['PlaygroundERC20', 'PlaygroundNFT', 'TeachingSwapRouter'];
const outDir = path.resolve(__dirname, '../../frontend/src/lib/contracts');

let abisContent = `// AUTO-GENERATED — run: npm run export-abis\n`;
let bytecodesContent = `// AUTO-GENERATED — run: npm run export-abis\n`;

for (const name of contracts) {
  const artifact = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`), 'utf8')
  );
  abisContent += `\nexport const ${name.toUpperCase()}_ABI = ${JSON.stringify(artifact.abi)} as const;\n`;
  if (name === 'PlaygroundERC20') {
    bytecodesContent += `\nexport const PLAYGROUND_ERC20_BYTECODE = "${artifact.bytecode}" as const;\n`;
  }
}

fs.writeFileSync(path.join(outDir, 'abis.ts'), abisContent);
fs.writeFileSync(path.join(outDir, 'bytecodes.ts'), bytecodesContent);
console.log('ABIs and bytecodes exported to frontend/src/lib/contracts/');
```

### 11.5 前端启动

```bash
cd frontend
npm install
npm run dev      # 开发模式
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

`frontend/vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### 11.6 前端部署（静态托管）

| 平台 | 方式 |
|------|------|
| GitHub Pages | `npm run build` → 推送 `dist/` 到 `gh-pages` 分支 |
| Netlify | 拖拽 `dist/` 或连接仓库，Build Command: `npm run build` |
| Vercel | `vercel --cwd frontend` |

---

## 12. 测试策略

### 12.1 合约单元测试（Hardhat + viem）

```typescript
// contracts/test/PlaygroundNFT.test.ts
import { expect } from 'chai';
import { viem } from 'hardhat';

describe('PlaygroundNFT', () => {
  async function deploy() {
    const [owner, user1, user2] = await viem.getWalletClients();
    const nft = await viem.deployContract('PlaygroundNFT', [owner.account.address]);
    return { nft, owner, user1, user2 };
  }

  it('mints with auto-incrementing ID starting at 1', async () => {
    const { nft, user1 } = await deploy();
    const client = await viem.getPublicClient();

    expect(await nft.read.nextTokenId()).to.equal(1n);
    await nft.write.safeMint([user1.account.address, 'data:application/json;base64,test'], {
      account: user1.account,
    });
    expect(await nft.read.totalMinted()).to.equal(1n);
  });

  it('stores tokenURI correctly', async () => {
    const { nft, user1 } = await deploy();
    const uri = 'data:application/json;base64,eyJuYW1lIjoidGVzdCJ9';
    await nft.write.safeMint([user1.account.address, uri], { account: user1.account });
    expect(await nft.read.tokenURI([1n])).to.equal(uri);
  });

  it('enforces maxPerWallet limit', async () => {
    const { nft, owner, user1 } = await deploy();
    // Set limit to 1
    await nft.write.setMaxPerWallet([1n], { account: owner.account });
    await nft.write.safeMint([user1.account.address, 'uri1'], { account: user1.account });
    await expect(
      nft.write.safeMint([user1.account.address, 'uri2'], { account: user1.account })
    ).to.be.rejectedWith('ExceedsMaxPerWallet');
  });

  it('allows any address to mint (open mint)', async () => {
    const { nft, user1, user2 } = await deploy();
    // user1 mints to user2 — allowed
    await expect(
      nft.write.safeMint([user2.account.address, 'uri'], { account: user1.account })
    ).not.to.be.rejected;
  });

  it('emits NFTMinted event', async () => {
    const { nft, user1 } = await deploy();
    const publicClient = await viem.getPublicClient();

    const hash = await nft.write.safeMint([user1.account.address, 'test-uri'], {
      account: user1.account,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    // Check event in logs
    expect(receipt.logs.length).to.be.greaterThan(0);
  });
});
```

### 12.2 运行测试

```bash
cd contracts

# 本地 hardhat 节点测试
npx hardhat test

# 覆盖率报告
npx hardhat coverage
```

覆盖率目标：

| 合约 | 目标行覆盖率 |
|------|------------|
| `PlaygroundERC20` | ≥ 90% |
| `PlaygroundNFT` | ≥ 90% |
| `TeachingSwapRouter` | ≥ 85% |

### 12.3 前端手动测试清单

在提交前对照以下清单在真实 MetaMask + Polkadot Hub TestNet 上验证：

- [ ] 未安装 MetaMask 时，显示安装引导链接
- [ ] `wallet_addEthereumChain` 成功添加 Polkadot Hub TestNet
- [ ] 切换后 Chain ID 显示正确（420420417）
- [ ] 水龙头链接以明文 URL 显示，点击在新标签页打开
- [ ] ERC20 表单输入 → 代码预览实时更新（名称、符号、精度、供应量）
- [ ] ERC20 合约部署成功，地址在 Blockscout 可查
- [ ] Blockscout 链接跳转正确
- [ ] `wallet_watchAsset`（ERC20）弹出 MetaMask 确认窗口
- [ ] Swap Step 1 approve 弹窗出现
- [ ] Swap Step 2 swap 弹窗出现
- [ ] Swap 成功后 ERC20 余额减少，PAS 余额增加
- [ ] NFT Mint 前显示实时预览（图片 + metadata JSON）
- [ ] NFT Mint 成功，在 Blockscout 可查看 tokenURI
- [ ] `wallet_watchAsset`（ERC721）弹出 MetaMask 确认窗口
- [ ] 多次 Mint NFT 不超过 `maxPerWallet` 限制

---

## 13. 开发规范

### 13.1 代码风格

- 所有代码（变量名、注释、commit message）**必须使用英文**
- TypeScript strict mode 开启
- React：函数组件 + hooks，无 class component
- Solidity：OpenZeppelin v5 风格，`_privateVar`，`CONSTANT_CASE`
- 术语：前端 & 文档中统一使用 **REVM** 指代执行环境（不使用"EVM 兼容"），使用 **Revive** 指代平台

### 13.2 Git 规范

```bash
feat(step06): add NFT mint form with live metadata preview
fix(swap): handle approve rejection without crashing swap flow
docs(tdd): update REVM terminology, remove PolkaHyper references
test(nft): add maxPerWallet enforcement test
chore(contracts): export abis to frontend after recompile
```

### 13.3 安全红线

- `.env` 文件禁止 commit（`contracts/.gitignore` 已包含）
- 前端禁止存储或展示私钥（所有签名通过 MetaMask 完成）
- 合约中所有教学简化点必须注释 `// TESTNET ONLY`
- `DEPLOYER_PRIVATE_KEY` 仅用于运营方部署 Router 和 NFT 合约，绝不暴露到前端

### 13.4 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Solidity 合约 | `PascalCase.sol` | `PlaygroundNFT.sol` |
| React 组件 | `PascalCase.tsx` | `Step06MintNFT.tsx` |
| Hooks | `camelCase.ts` | `useMintNFT.ts` |
| 工具函数 | `camelCase.ts` | `buildNFTMetadata.ts` |
| 部署脚本 | `kebab-case.ts` | `deploy-nft.ts` |

---

## 14. 快速开始

### 30 分钟完整体验路径

**Step 1**（2 min）— 安装 MetaMask  
> https://metamask.io/download/

**Step 2**（2 min）— 启动前端

```bash
git clone https://github.com/your-org/polkadot-revive-playground.git
cd polkadot-revive-playground/frontend
npm install && npm run dev
# 打开 http://localhost:5173
```

**Step 3**（3 min）— 连接钱包 & 添加网络  
> 页面 Step 01：点击"连接 MetaMask"→"添加到 MetaMask"

**Step 4**（5 min）— 领取 PAS  
> 打开 https://faucet.polkadot.io/  
> 选择 `Polkadot Hub TestNet` → 粘贴 `0x` 地址 → 领取

**Step 5**（5 min）— 部署 ERC20  
> 填写代币参数，观察代码实时变化，点击"部署"，MetaMask 确认

**Step 6**（3 min）— 添加代币到 MetaMask  
> 点击"添加 ERC20 到 MetaMask"，在 MetaMask 资产列表确认出现

**Step 7**（5 min）— 体验 Swap  
> 填写兑换数量，依次确认 Approve + Swap 两笔交易

**Step 8**（5 min）— Mint 纪念 NFT  
> 填写 NFT 信息，点击"Mint 我的纪念 NFT"，完成后"添加 NFT 到 MetaMask"

**Step 9**（1 min）— 验证  
> 在 https://blockscout-testnet.polkadot.io/ 搜索你的地址，确认所有交易 ✅

---

## 15. 故障排查

### MetaMask 无法添加网络

```
错误: "wallet_addEthereumChain: rpc url is invalid"
→ RPC URL 必须带 https:// 前缀，末尾带 /
→ chainId 必须是 hex string: '0x18F82281'

错误: "user rejected" (code 4001)
→ 重新点击"添加到 MetaMask"按钮
```

### ERC20 部署时 Gas 不足

```
错误: "insufficient funds for gas * price + value"
→ 需要更多 PAS，前往 https://faucet.polkadot.io/
→ 确认选择了 "Polkadot Hub TestNet"
→ 确认钱包已切换到 Polkadot Hub TestNet（Chain ID 420420417）
```

### Swap 失败

```
错误: "InsufficientPASLiquidity"
→ Router 合约 PAS 流动性不足
→ 联系项目方补充，或减小兑换数量

错误: "execution reverted" 在 approve 步骤
→ 确认 ERC20 合约地址已正确存入 appStore
→ 刷新页面后重试

错误: "user rejected" 在 approve 步骤
→ Approve 是 swap 的必要前置步骤，必须确认
→ 两笔交易都需要在 MetaMask 中确认
```

### NFT Mint 失败

```
错误: "ExceedsMaxPerWallet"
→ 当前钱包已达到 mint 上限（默认 5 枚）
→ 更换钱包地址或联系项目方提高上限

错误: "data URI too long"
→ 图片 URL 或描述文字过长
→ 使用较短的图片 URL 或留空使用默认图片

Mint 后"添加 NFT 到 MetaMask"无响应
→ 部分 MetaMask 版本对 wallet_watchAsset ERC721 支持有限
→ 可在 MetaMask 中手动导入：NFTs → Import NFT → 输入合约地址 + Token ID
```

### 前端开发启动失败

```
错误: "Cannot find module '@wagmi/core'"
→ cd frontend && npm install

错误: "PLAYGROUND_NFT_ADDRESS is undefined"
→ contracts/src/lib/contracts/addresses.ts 中需填写实际部署地址
→ 运行 npx hardhat run scripts/deploy-nft.ts --network polkadotHubTestnet 获取地址
```

---

## 附录

### 附录 A：完整网络参数

**Polkadot Hub TestNet（Revive 平台 · REVM 后端）**

| 参数 | 值 |
|------|-----|
| Network Name | `Polkadot Hub TestNet` |
| Chain ID (Dec) | `420420417` |
| Chain ID (Hex) | `0x18F82281` |
| 执行环境 | REVM（Rust EVM via Revive / pallet-revive）|
| RPC URL | `https://eth-rpc-testnet.polkadot.io/` |
| 备用 RPC | `https://services.polkadothub-rpc.com/testnet/` |
| Currency Symbol | `PAS` |
| Currency Decimals | `18` |
| Block Explorer | `https://blockscout-testnet.polkadot.io/` |
| 官方水龙头 | `https://faucet.polkadot.io/` |

### 附录 B：预部署合约地址（待填写）

```typescript
// frontend/src/lib/contracts/addresses.ts
// Fill in after running deploy scripts on Polkadot Hub TestNet

export const PLAYGROUND_NFT_ADDRESS   = '0x...' as const; // deploy-nft.ts
export const TEACHING_SWAP_ROUTER_ADDRESS = '0x...' as const; // deploy-swap-router.ts
```

### 附录 C：NFT Metadata JSON 标准（OpenSea 兼容）

```json
{
  "name": "Polkadot Revive Graduate #42",
  "description": "Awarded for completing the Polkadot Revive Playground tutorial.",
  "image": "https://example.com/avatar.png",
  "external_url": "https://blockscout-testnet.polkadot.io/",
  "attributes": [
    { "trait_type": "Course",      "value": "Polkadot Revive Playground" },
    { "trait_type": "Network",     "value": "Polkadot Hub TestNet" },
    { "trait_type": "VM Backend",  "value": "REVM (via Revive)" },
    { "trait_type": "Graduate",    "value": "0x1234...5678" },
    { "trait_type": "Token ID",    "value": "42" },
    { "trait_type": "Mint Date",   "value": "2026-03-28" },
    { "trait_type": "Achievement", "value": "First On-Chain NFT" }
  ]
}
```

### 附录 D：OpenZeppelin 依赖版本

```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox-viem": "^3.0.0",
    "hardhat": "^2.22.0",
    "dotenv": "^16.0.0"
  }
}
```

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "viem": "^2.0.0",
    "wagmi": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 附录 E：参考链接

**Polkadot Revive 官方资料**
- 智能合约概览：https://docs.polkadot.com/smart-contracts/overview/
- Polkadot Hub 智能合约：https://docs.polkadot.com/reference/polkadot-hub/smart-contracts/
- 连接指南（网络参数）：https://docs.polkadot.com/smart-contracts/connect/
- 快速开始：https://docs.polkadot.com/smart-contracts/get-started/
- viem 集成：https://docs.polkadot.com/smart-contracts/libraries/viem/
- 部署 ERC-721（Hardhat）：https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-hardhat/
- Hardhat 环境：https://docs.polkadot.com/smart-contracts/dev-environments/hardhat/

**区块浏览器 & 工具**
- Blockscout（测试网）：https://blockscout-testnet.polkadot.io/
- 官方水龙头：https://faucet.polkadot.io/
- OpenZeppelin Wizard for Polkadot：https://wizard.openzeppelin.com/

**Revive 项目背景**
- Revive 状态更新（Forum）：https://forum.polkadot.network/t/revive-smart-contracts-status-update/16366
- pallet-revive 源码：https://github.com/paritytech/revive

**前端技术栈**
- wagmi v2 文档：https://wagmi.sh
- viem 文档：https://viem.sh
- Zustand：https://zustand-demo.pmnd.rs/
- TanStack Query v5：https://tanstack.com/query/v5

**EIP 标准**
- EIP-1193（Provider API）：https://eips.ethereum.org/EIPS/eip-1193
- EIP-747（`wallet_watchAsset`）：https://eips.ethereum.org/EIPS/eip-747
- EIP-3085（`wallet_addEthereumChain`）：https://eips.ethereum.org/EIPS/eip-3085

---

*Polkadot Revive Playground Design Document v1.1 · 2026-03*  
*Learn REVM Smart Contracts on Polkadot Hub — One Step at a Time.*