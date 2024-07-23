import { NetworkConnector } from '@web3-react/network-connector';

import { NAME_ID_MAPPING } from '../constants/chain';

const RPC_URLS = {
  [NAME_ID_MAPPING.SEPOLIA.id]: process.env.REACT_APP_RPC_URL_SEPOLIA || ''
};

export const networkConnector = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: NAME_ID_MAPPING.SEPOLIA.id
});
