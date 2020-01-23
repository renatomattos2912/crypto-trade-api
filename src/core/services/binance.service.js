const { createHmac } = require('crypto')
const axios = require('axios')
const secretsManager = require('../lib/aws-secrets-manager')

const API_BASE = process.env.BINANCE_API_BASE

async function _getBinanceCallSigned (data = null) {
  const secrets = await secretsManager.get()
  const BINANCE_API_KEY = secrets.BINANCE_API_KEY
  const BINANCE_API_SECRET = secrets.BINANCE_API_SECRET

  const timestamp = new Date().getTime()

  if (!data) {
    data = {}
  }

  data.timestamp = timestamp

  const makeQueryString = q =>
    q
      ? `?${Object.keys(q)
          .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
          .join('&')}`
      : ''

  const signature = createHmac('sha256', BINANCE_API_SECRET)
    .update(makeQueryString(data).substr(1))
    .digest('hex')

  data.signature = signature

  const headers = {
    'X-MBX-APIKEY': BINANCE_API_KEY
  }

  return {
    headers,
    data: makeQueryString(data)
  }
}

module.exports = {
  getPrice: () => {
    return axios.get(`${API_BASE}/v3/ticker/price`)
  },
  getAccountInfo: async () => {
    const signed = await _getBinanceCallSigned()
    const url = `${API_BASE}/v3/account${signed.data}`
    const res = await axios.get(url, { headers: signed.headers })
    const balances = res.data.balances
    const obj = {}
    balances.map(item => {
      if (Number(item.free) > 0) {
        obj[item.asset] = Number(item.free)
      }
    })
    return { binance: obj }
  },
  doTrade: async ({ action, p1, p2, amount, test = true }) => {
    const data = {
      recvWindow: 5000,
      symbol: `${p1}${p2}`,
      side: action.toUpperCase(),
      type: 'MARKET',
      quantity: Number(amount)
    }

    const signed = await _getBinanceCallSigned(data)
    const url = `${API_BASE}/v3/order${test ? '/test' : ''}${signed.data}`
    return axios.post(url, null, { headers: signed.headers })
  }
}
