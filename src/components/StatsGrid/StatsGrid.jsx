import React from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery';
import useSWR from 'swr'
import { VerusdRpcInterface } from 'verusd-rpc-ts-client'

import { ReactComponent as Chevron } from '../../images/icons/chevron-icon.svg'

const CoinGeckoVRSC = 'https://api.coingecko.com/api/v3/coins/verus-coin'
const CoinGeckoETH = 'https://api.coingecko.com/api/v3/coins/ethereum'
const CoinGeckotBTC = 'https://api.coingecko.com/api/v3/coins/tbtc'
const CoinGeckoNATI = 'https://api.coingecko.com/api/v3/coins/nati'

const urls = [CoinGeckoVRSC, CoinGeckoETH, CoinGeckotBTC, CoinGeckoNATI]

const verusd = new VerusdRpcInterface("iExBJfZYK7KREDpuhj6PzZBzqMAKaFg7d2", process.env.REACT_APP_VERUS_RPC_URL)

const blockNumber = process.env.REACT_APP_VERUS_END_BLOCK || '0'

const getDetails = (res) => {
  const bestState = res.result.bestcurrencystate
  const currencyNames = res.result.currencynames
  const currencies = bestState.reservecurrencies
  const count = currencies.length
  const { supply } = bestState

  return { bestState, currencyNames, count, supply }
}

let conversions = [
  { symbol: 'vrsc', price: 0 },
  { symbol: 'eth', price: 0 },
  { symbol: 'tBTC', price: 0 },
  { symbol: 'nati', price: 0 }
]

const fetchConversion = async () => {
  const res = await verusd.getCurrency('bridge.NATI');

  const info = await verusd.getInfo()


  const block = info.result.longestchain

  const bestState = res.result.bestcurrencystate
  const currencyNames = res.result.currencynames
  const currencies = bestState.reservecurrencies
  const count = currencies.length
  const { supply } = bestState
  const blockdiff = blockNumber - block
  const tbtcKey = Object.keys(res?.result?.currencynames).find((key) => currencyNames !== undefined && currencyNames[key] === 'tBTC.vETH')
  const tbtcAmount = currencies.find(c => c.currencyid === tbtcKey).reserves
  const verusKey = Object.keys(res?.result?.currencynames).find((key) => currencyNames !== undefined && currencyNames[key] === 'VRSC')
  const verusAmount = currencies.find(c => c.currencyid === verusKey).reserves

  let list = currencies.map((token) => ({ name: currencyNames[token.currencyid], amount: token.reserves, tbtcPrice: tbtcAmount / token.reserves, verusprice: verusAmount / token.reserves }))
  const bridge = { name: 'Bridge.NATI', amount: supply, tbtcPrice: (tbtcAmount * count) / supply, verusprice: (verusAmount * count) / supply }


  try {
    conversions = await Promise.all(
      urls.map(async (url) => fetch(url)
        .then((res) => res.json())
        .then((c) => ({
          symbol: c.symbol,
          price: c.market_data.current_price.usd
        })))
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('%s: fetching prices %s', Date().toString(), error.message)
  }
  list = list.map((token) => {
    switch (token.name) {
      case 'VRSCTEST':
      case 'VRSC':
        return {
          ...token,
          price:
            conversions.find((c) => c.symbol === 'vrsc')?.price
        }
      case 'Bridge.vETH':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'bridge')?.price
        }
      case 'NATI':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'nati')?.price
        }
      case 'tBTC.vETH':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'tbtc')?.price
        }
      // return { ...token, price: vrscPrice }
      default:
        return { ...token }
    }
  })
  return { list, bridge, blockdiff, currencies }
}

const StatsGrid = () => {

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const { data: conversionList } = useSWR("fetchConversion", fetchConversion, {
    refreshInterval: 60_000 // every minute
  })

  if (!conversionList) return null

  return (
    <>
      <Grid container className="blueRowTitle" justifyContent="space-between">
        <Grid item xs={3}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Liquidity pool</Typography></Grid>

        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Supply</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Price in Verus</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Price in USD</Typography></Grid>
      </Grid>

      <Grid container className='blueRow' mb={5} justifyContent="space-between">
        <Grid item xs={3}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{conversionList.bridge.name}</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}> {Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 0
        }).format(conversionList.bridge.amount)}</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 8,
          minimumFractionDigits: 3
        }).format(conversionList.bridge.verusprice)}</Typography><Typography sx={{ fontSize: isMobile ? '10px' : '10px', color: '#3165d4', fontWeight: 'bold' }}>{"("}{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }).format(conversionList.bridge.verusprice * conversionList.list[0].price)}{" USD)"}</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}> {Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }).format(conversionList.bridge.verusprice * conversionList.list[0].price)}</Typography></Grid>
      </Grid>

      <Grid container className="blueRowTitle" justifyContent="space-between">
        <Grid item xs={3} textAlign="left"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Bridge.NATI<br />reserve currencies</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>in reserves</Typography></Grid>
        <Grid item xs={2} textAlign="right" sx={{ ml: 2 }}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Price in Verus</Typography></Grid>
        <Grid item xs={2} textAlign="right" ><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Compared to<br />CoinGecko</Typography></Grid>
      </Grid>
      {conversionList.list && conversionList.list.map((token) => {
        const dollarPrice = token.verusprice * conversionList.list[0].price
        // eslint-disable-next-line no-nested-ternary
        const rate = dollarPrice < token.price ? 'less' : dollarPrice > token.price ? 'greater' : 'equal'
        const percent = Math.abs(dollarPrice / token.price) - 1

        return (
          <Grid container className="blueRow" key={token.name} justifyContent="space-between">
            <Grid item xs={3}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{token.name}</Typography></Grid>
            <Grid item xs={2} textAlign="right">
              <Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: 'rgba(49, 101, 212, 0.59)', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 3
                }).format(token.amount)}
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign="right" sx={{ ml: 2 }}>
              <Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 4,
                  minimumFractionDigits: 2
                }).format(token.verusprice)}
              </Typography><Typography sx={{ fontSize: isMobile ? '10px' : '10px', color: '#3165d4', fontWeight: 'bold' }}>
                {"("}{Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(dollarPrice)}
                {" USD)"}</Typography></Grid>
            <Grid item xs={2} textAlign="right" >
              <Typography className={rate} noWrap sx={{ fontSize: isMobile ? '10px' : '14px' }}>
                <Chevron />
                {Intl.NumberFormat('en-US', {
                  style: 'percent',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(Math.abs(percent))}</Typography></Grid>
          </Grid >
        )
      })}
      <Grid container className='white' mb={3} justifyContent="space-between"> </Grid>
      <Grid container className='blueRow' mb={3} justifyContent="space-between">
        <Grid item xs={6}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>Total Value of Liquidity</Typography></Grid>

        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 3,
          minimumFractionDigits: 3
        }).format(conversionList.bridge.verusprice * conversionList.bridge.amount)}</Typography><Typography sx={{ fontSize: isMobile ? '10px' : '10px', color: '#3165d4', fontWeight: 'bold' }}>{"("}{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }).format(conversionList.bridge.verusprice * conversionList.bridge.amount * conversionList.list[0].price)} {" USD)"}</Typography></Grid>
        <Grid item xs={2}>{" "} </Grid>
      </Grid>
    </>
  )
}

export default StatsGrid
