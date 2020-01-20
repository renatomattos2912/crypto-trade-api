const secretsManager = require('../lib/aws-secrets-manager')
const { getQueryParam } = require('../lib/utils')

module.exports = {
  authenticate: async event => {
    const secrets = await secretsManager.get()
    const validToken = secrets.AUTH_TOKEN

    const token = getQueryParam({
      params: event.queryStringParameters,
      name: 'token'
    })

    return token === validToken
  }
}
