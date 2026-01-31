// HypurrFi Mewler - Euler V2 (EVK) deployment on HyperliquidEVM
// Parent Protocol: Euler (https://defillama.com/protocol/euler)
// Includes Prime (cross-collateralized lending), Earn (yield aggregators), and Yield (isolated strategies)

// Perspective contracts that track verified vaults
const GOVERNED_PERSPECTIVE = "0x4936Cd82936b6862fDD66CC8c36e1828127a6b57"; // EVaults (Prime + Yield)
const EULER_EARN_PERSPECTIVE = "0x7b27dED9344D9c66FeAF58D151b52d1359aeA807"; // EulerEarn vaults

async function tvl(api) {
  // Get verified EVaults from governed perspective (Prime + Yield)
  const evaults = await api.call({ abi: "address[]:verifiedArray", target: GOVERNED_PERSPECTIVE });
  
  // Get verified EulerEarn vaults from earn perspective
  const earnVaults = await api.call({ abi: "address[]:verifiedArray", target: EULER_EARN_PERSPECTIVE });

  // Get TVL from EVaults - use totalAssets() for total deposits (supply side)
  const evaultAssets = await api.multiCall({ abi: "address:asset", calls: evaults });
  const evaultTotalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: evaults });
  api.add(evaultAssets.map(a => a.toLowerCase()), evaultTotalAssets);

  // Get TVL from Earn vaults (ERC4626) - totalAssets
  const earnAssets = await api.multiCall({ abi: "address:asset", calls: earnVaults });
  const earnTotalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: earnVaults });
  api.add(earnAssets.map(a => a.toLowerCase()), earnTotalAssets);
}

async function borrowed(api) {
  // Get verified EVaults from governed perspective
  const evaults = await api.call({ abi: "address[]:verifiedArray", target: GOVERNED_PERSPECTIVE });

  // Only EVaults have borrows
  const assets = await api.multiCall({ abi: "address:asset", calls: evaults });
  const borrows = await api.multiCall({ abi: "uint256:totalBorrows", calls: evaults });
  api.add(assets, borrows);
}

module.exports = {
  doublecounted: true,
  methodology: "TVL is the total value of assets deposited across HypurrFi Mewler markets (Prime lending, Earn yield aggregators, and Yield strategies) on HyperliquidEVM. Earn vaults may deposit into EVaults, so TVL is marked as double-counted. Borrowed shows outstanding loans from the lending markets.",
  hyperliquid: {
    tvl,
    borrowed,
  },
};
