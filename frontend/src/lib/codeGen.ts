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

${cm('// Polkadot Hub Testnet — Revive (REVM backend)')}
${cm('// TESTNET ONLY')}

${kw('import')} ${st('"@openzeppelin/contracts/token/ERC20/ERC20.sol"')};
${kw('import')} ${st('"@openzeppelin/contracts/access/Ownable.sol"')};

${kw('contract')} ${ty(contractName)} ${kw('is')} ${ty('ERC20')}, ${ty('Ownable')} {

    ${ty('uint8')} ${kw('private immutable')} _tokenDecimals = ${nm(String(decimals))};

    ${fn('constructor')}(${ty('address')} initialOwner)
        ${fn('ERC20')}(${st(`"${name || 'My Test Token'}"`)}, ${st(`"${symbol || 'MTT'}"`)})
        ${fn('Ownable')}(initialOwner)
    {
        ${fn('_mint')}(
            initialOwner,
            ${nm(String(supply || 1000000))} * ${nm('10')} ** ${nm(String(decimals))}
        );
    }

    ${kw('function')} ${fn('decimals')}()
        ${kw('public view override returns')} (${ty('uint8')})
    {
        ${kw('return')} _tokenDecimals;
    }

    ${kw('function')} ${fn('mint')}(${ty('address')} to, ${ty('uint256')} amount)
        ${kw('external onlyOwner')}
    {
        ${fn('_mint')}(to, amount * ${nm('10')} ** ${nm(String(decimals))});
    }
}`;
}

interface SwapCodeParams {
  tokenAddress: string;
  routerAddress: string;
  amount: string;
  decimals: number;
  symbol: string;
}

/**
 * Generate syntax-highlighted HTML for swap code.
 */
export function generateSwapCodeHTML({
  tokenAddress, routerAddress, amount, decimals,
}: SwapCodeParams): string {
  const kw = (s: string) => `<span class="c-kw">${s}</span>`;
  const fn = (s: string) => `<span class="c-fn">${s}</span>`;
  const st = (s: string) => `<span class="c-str">${s}</span>`;
  const nm = (s: string) => `<span class="c-num">${s}</span>`;
  const cm = (s: string) => `<span class="c-comment">${s}</span>`;
  const dy = (s: string) => `<span class="c-dynamic">${s}</span>`;

   return `${cm('// Step 1/2 — Approve')}
${kw('await')} ${fn('writeContractAsync')}({
    address: ${st(`"${tokenAddress || '0x...'}"`)},
    functionName: ${st('"approve"')},
    args: [
        ${st(`"${routerAddress || '0x...'}"`)},
        ${fn('parseUnits')}(${dy(`"${amount || '0'}"`)}, ${nm(String(decimals))}),
    ],
});

${cm('// Step 2/2 — Swap')}
${kw('await')} ${fn('writeContractAsync')}({
    address: ${st(`"${routerAddress || '0x...'}"`)},
    functionName: ${st('"swap"')},
    args: [
        ${st(`"${tokenAddress || '0x...'}"`)},
        ${fn('parseUnits')}(${dy(`"${amount || '0'}"`)}, ${nm(String(decimals))}),
    ],
});`;
}
