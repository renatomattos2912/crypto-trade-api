const { createHmac } = require('crypto')
const axios = require('axios')
const secretsManager = require('../lib/aws-secrets-manager')

const API_BASE = process.env.BINANCE_API_BASE

module.exports = {
  getPrice: () => {
    return axios.get(`${API_BASE}/v3/ticker/price`)
  },
  getAccountInfo: async () => {
    const secrets = await secretsManager.get()
    const BINANCE_API_KEY = secrets.BINANCE_API_KEY
    const BINANCE_API_SECRET = secrets.BINANCE_API_SECRET

    const timestamp = new Date().getTime()

    const makeQueryString = q =>
      q
        ? `?${Object.keys(q)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
            .join('&')}`
        : ''

    const signature = createHmac('sha256', BINANCE_API_SECRET)
      .update(makeQueryString({ timestamp }).substr(1))
      .digest('hex')

    const newData = { timestamp, signature }

    const url = `${API_BASE}/v3/account${makeQueryString(newData)}`
    const headers = {
      'X-MBX-APIKEY': BINANCE_API_KEY
    }

    return axios.get(url, { headers })
  },
  doTrade: async ({ action, p1, p2, amount, test = true }) => {
    const secrets = await secretsManager.get()
    const BINANCE_API_KEY = secrets.BINANCE_API_KEY
    const BINANCE_API_SECRET = secrets.BINANCE_API_SECRET

    const timestamp = new Date().getTime()

    const makeQueryString = q =>
      q
        ? `?${Object.keys(q)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
            .join('&')}`
        : ''

    const data = {
      timestamp,
      recvWindow: 5000,
      symbol: `${p1}${p2}`,
      side: action.toUpperCase(),
      type: 'MARKET',
      quantity: Number(amount)
    }

    const signature = createHmac('sha256', BINANCE_API_SECRET)
      .update(makeQueryString(data).substr(1))
      .digest('hex')

    data.signature = signature

    const url = `${API_BASE}/v3/order${test ? '/test' : ''}${makeQueryString(
      data
    )}`

    const headers = {
      'X-MBX-APIKEY': BINANCE_API_KEY
    }

    return axios.post(url, null, { headers })
  }
}
