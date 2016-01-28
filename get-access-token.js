var fs = require('fs')
var https = require('https')
var qs = require('querystring')

module.exports = function getAccessToken (clientId, clientSecret, cb) {
  var authHeader = Buffer(clientId + ':' + clientSecret).toString('base64')
  var refresh = fs.readFileSync('./refresh-token.txt', 'utf8').trim()
  var reqopts = {
    host: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + authHeader,
      'Content-type': 'application/x-www-form-urlencoded'
    }
  }
  var refopts = qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: refresh
  })

  https.request(reqopts, function (res) {
    var body = ''
    res.setEncoding('utf8')
    res.on('data', function (d) { body += d })
    res.on('end', function () {
      var parsed = JSON.parse(body)
      if (parsed.error) {
        return cb(null)
      }

      if (parsed.refresh_token)
        fs.writeFileSync('./refresh-token.txt', parsed.refresh_token)

      return cb(parsed.access_token)
    })
  }).end(refopts)
}
