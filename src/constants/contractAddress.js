import { DEST_PKH } from "utils/txConfig";

export const DELEGATOR_ADD = process.env.REACT_APP_DELEGATOR_CONTRACT
export const TESTNET = process.env.REACT_APP_TESTNET_ACTIVE === "true";
export const ETHEREUM_BLOCKCHAIN_NAME = TESTNET ? "Seoplia" : "Ethereum";

export const BLOCKCHAIN_NAME = (TESTNET ? "vrsctest" : "vrsc").toUpperCase();


export const GLOBAL_ADDRESS = TESTNET ? { // vrsctest hex 'id' names of currencies must be checksummed i.e. mixture of capitals
  VNATI: process.env.REACT_APP_NATI_TESTNET_CONTRACT,
  NATI: process.env.REACT_APP_NATI_TESTNET_ERC20,
  vETH: "0x67460C2f56774eD27EeB8685f29f6CEC0B090B00",
  bridge: "0xffEce948b8A38bBcC813411D2597f7f8485a0689"
} : {

  VNATI: process.env.REACT_APP_NATI_MAIN_ERC20,
  NATI: process.env.REACT_APP_NATI_MAIN_CONTRACT,
  vETH: "0x454CB83913D688795E237837d30258d11ea7c752",
  bridge: "0x0200EbbD26467B866120D84A0d37c82CdE0acAEB"
}


export const ETH_FEES = {
  SATS: 300000, // 0.003 ETH FEE SATS (8 decimal places)
  ETH: "0.003", // 0.003 ETH FEE
  GAS_TRANSACTIONIMPORTFEE: "1000000", // Transactionimportfee as defined in vETH: as (TX GAS AMOUNT)
  MINIMUM_GAS_PRICE_WEI: "10000000000", // Minimum WEI price as defined in contract. (10 GWEI)
  VRSC_SATS_FEE: 2000000
}


export const FLAGS = {

  MAPPING_ETHEREUM_OWNED: 1,
  MAPPING_VERUS_OWNED: 2,
  MAPPING_PARTOF_BRIDGEVETH: 4,
  MAPPING_ISBRIDGE_CURRENCY: 8,
  MAPPING_ERC1155_NFT_DEFINITION: 16,
  MAPPING_ERC20_DEFINITION: 32,
  MAPPING_ERC1155_ERC_DEFINITION: 64,
  MAPPING_ERC721_NFT_DEFINITION: 128
}

export const addresstype = {
  DEST_PKH: 2,
  DEST_ID: 4
}

export const HEIGHT_LOCATION_IN_FORKS = 130