var Spotify = require('spotify-web-api-node')
var debug = require('debug')('update-playlist.js')

module.exports = function updatePlaylist (opts, callback) {
  var clientId = opts.clientId
  var clientSecret = opts.clientSecret
  var username = opts.username
  var playlistId = opts.playlistId
  var token = opts.accessToken
  var id = opts.id
  var type = opts.type

  var method, params

  switch (type) {
    case 'artist':
      method = 'getArtistTopTracks'
      params = 'US'
      break
    case 'album':
      method = 'getAlbumTracks'
      params = {limit: 50}
      break
  }

  if (!method) {
    debug('unknown type:', type)
    return
  }

  var s = new Spotify({
    clientId: clientId,
    clientSecret: clientSecret
  })

  s.setAccessToken(token)

  s[method](id, params)
    .then(function (data) {
      debug('mapping tracks')
      return data.body[type === 'artist' ? 'tracks' : 'items'].map(function (t) { return t.uri })
    })
    .then(function (tracks) {
      debug('got %d tracks, replacing playlist', tracks.length)
      console.log('replacing tracks')
      return s.replaceTracksInPlaylist(username, playlistId, tracks)
    })
    .then(function () {
      return callback()
    })
    .catch(function (err) {
      return callback(err)
    })
}
