
module.exports = {
  getQueryParam: ({ params, name }) => {
    if (!params) return null
    if (!params[name]) return null
    return params[name]
  }
}
