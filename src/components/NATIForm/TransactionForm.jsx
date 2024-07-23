import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/system';
import { useWeb3React } from '@web3-react/core';
import { useForm } from 'react-hook-form';
import web3 from 'web3';

import ERC20_ABI from 'abis/ERC20Abi.json';
import NATI_ABI from 'abis/NatiAbi.json';
import {
  GLOBAL_ADDRESS,
  ETHEREUM_BLOCKCHAIN_NAME,
  DELEGATOR_ADD
} from 'constants/contractAddress';
import useContract from 'hooks/useContract';
import { getContract } from 'utils/contract';
import { convertVerusAddressToEthAddress } from "utils/convert";
import { validateAddress, NFTAddressType, isiAddress, isRAddress } from 'utils/rules'

import AddressField from './AddressField';
import AmountField from './AmountField';
import DestinationField from './DestinationField';
import { useToast } from '../Toast/ToastProvider';


const maxGasApprove = 60000;
const maxGasSwap = 3000000;

export default function TransactionForm() {

  const [isTxPending, setIsTxPending] = useState(false);
  const [alert, setAlert] = useState(null);
  const { addToast } = useToast();
  const { account, library } = useWeb3React();
  const natiContract = useContract(GLOBAL_ADDRESS.VNATI, NATI_ABI);

  const { handleSubmit, control, watch } = useForm({
    mode: 'all'
  });

  const destination = watch('Swap to');
  const address = watch('address');
  const authoriseOneTokenAmount = async (amount) => {
    setAlert(`Metamask will now pop up to allow the spend ${amount}(NATI) from your ${ETHEREUM_BLOCKCHAIN_NAME} balance.`);

    const tokenERC = GLOBAL_ADDRESS.NATI;
    const tokenInstContract = getContract(tokenERC, ERC20_ABI, library, account)
    const decimals = web3.utils.toBN(await tokenInstContract.decimals());

    const ten = new web3.utils.BN(10);
    const base = ten.pow(new web3.utils.BN(decimals));
    const comps = amount.split('.');
    if (comps.length > 2) { throw new Error('Too many decimal points'); }

    let whole = comps[0];
    let fraction = comps[1];

    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > decimals) {
      throw new Error('Too many decimal places');
    }

    while (fraction.length < decimals) {
      fraction += '0';
    }

    whole = new web3.utils.BN(whole);
    fraction = new web3.utils.BN(fraction);
    const bigAmount = (whole.mul(base)).add(fraction);

    const approve = await tokenInstContract.approve(GLOBAL_ADDRESS.VNATI, bigAmount.toString(), { from: account, gasLimit: maxGasApprove })

    setAlert(`Authorising ERC20 Token, please wait...`);
    const reply = await approve.wait();

    if (reply.status === 0) {
      throw new Error("Authorising ERC20 Token Spend Failed, please check your balance.")
    }
    setAlert(`
      Your ${ETHEREUM_BLOCKCHAIN_NAME} account has authorised the bridge to spend your NATI token, the amount: ${amount}. 
      \n Next, after this window please check the amount in Metamask is what you wish to send.`
    );
  }

  const onSubmit = async (values) => {
    const { amount, destination } = values;
    setAlert(null);
    setIsTxPending(true);
    const validAccount = await validateAddress(account);
    if (validAccount !== true) {
      addToast({ type: "error", description: 'Sending Account invalid' })
      setAlert(null);
      setIsTxPending(false);
      return;
    }

    let destinationaddress = '';
    if (isiAddress(address)) {
      destinationaddress = convertVerusAddressToEthAddress(address)
    } else if (isRAddress(address)) {
      destinationaddress = convertVerusAddressToEthAddress(address)
    } else {
      addToast({ type: "error", description: 'Send to address invalid' })
      setAlert(null);
      setIsTxPending(false);
      return;
    }

    try {
      await authoriseOneTokenAmount(amount);
      const addressType = NFTAddressType(address);

      const txResult = await natiContract.swapToBridge(
        web3.utils.toWei(amount, 'ether'),
        destinationaddress,
        addressType,
        DELEGATOR_ADD,
        GLOBAL_ADDRESS.bridge,
        GLOBAL_ADDRESS.vETH,
        { from: account, gasLimit: maxGasSwap, value: web3.utils.toWei("0.003", 'ether') });

      await txResult.wait();

      addToast({ type: "success", description: 'Transaction Success!' });
      setAlert(null);
      setIsTxPending(false);

    } catch (error) {
      if (error.message) {
        addToast({ type: "error", description: error.message })
      } else {
        addToast({ type: "error", description: 'Transaction Failed!' })
      }
      setAlert(null);
      setIsTxPending(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {alert &&
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography>
              {alert}
            </Typography>
          </Alert>
        }
        {!account && <Alert severity="info" sx={{ mb: 3 }}>
          <Typography>
            <b>Wallet not connected</b>
          </Typography>
        </Alert>
        }
        <Grid item xs={12}>
          <AddressField
            control={control}
          />
        </Grid>
        <Grid item xs={12}>
          <DestinationField
            control={control}
          />
        </Grid>
        <Grid item xs={12}>
          <AmountField
            control={control}
            destination={destination}

          />
        </Grid>
        <Box mt="30px" textAlign="center" width="100%">
          <LoadingButton loading={isTxPending} disabled={isTxPending} type="submit" color="primary" variant="contained">Send</LoadingButton>
        </Box>

      </form >
    </>
  );
}
