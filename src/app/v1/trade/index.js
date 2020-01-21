const logger = require('../../../core/lib/logger')
const {
  successResponse,
  errorResponse,
  notAuthorized
} = require('../../../core/lib/api-response')
const binanceService = require('../../../core/services/binance.service')
const authService = require('../../../core/services/auth.service')
const utils = require('../../../core/lib/utils')

module.exports = {
  trade: async event => {
    const LOG_LABEL = 'app/v1/wallet.trade'

    logger.info({ label: LOG_LABEL, message: 'STARTED' })

    const isAuthenticated = await authService.authenticate(event)
    if (!isAuthenticated) return notAuthorized()

    let response = null

    try {
      const i = JSON.parse(event.body)
      const isTest = utils.getQueryParam({
        params: event.queryStringParameters,
        name: 'test'
      })

      const promises = []

      i.map(a => {
        promises.push(
          new Promise((resolve, reject) => {
            if (a === null) reject(new Error('error'))

            binanceService
              .doTrade({
                action: a.action,
                p1: a.p1,
                p2: a.p2,
                amount: a.amount,
                test: isTest === 'true'
              })
              .then(res => resolve({ code: res.status, msg: res.statusText }))
              .catch(err => resolve(err.response.data))
          })
        )
      })

      const q = await Promise.all(promises)

      const res = i.map((item, key) => {
        item.res = q[key]
        return item
      })

      logger.info({ label: LOG_LABEL, message: res })

      response = successResponse({ status: 200, message: res })
      return response
    } catch (err) {
      logger.error(err)
      response = errorResponse(err)
      throw err
    } finally {
      logger.info({ label: LOG_LABEL, message: 'ENDED' })
    }
  }
}
