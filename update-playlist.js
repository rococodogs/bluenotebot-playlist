var debug = require('debug')('update-playlist.js')

var Spotify = require('spotify-web-api-node')
var spotifyUri = require('spotify-uri')

module.exports = function updatePlaylist (opts, callback) {
  var clientId = opts.clientId
  var clientSecret = opts.clientSecret
  var username = opts.username
  var playlistId = opts.playlistId
  var token = opts.accessToken
  var url = opts.url
  var parsed = spotifyUri.parse(url)
  var type = parsed.type
  var method, params

  debug('url parsed: %s', JSON.stringify(parsed))

  switch (type) {
    case 'artist':
      method = 'getArtistTopTracks'
      params = 'US'
      id = parsed.id
      break
    case 'album':
      method = 'getAlbumTracks'
      params = {limit: 50}
      id = parsed.id
      break
    case 'playlist':
      method = 'getPlaylistTracks'
      params = parsed.id
      id = parsed.user
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

  debug(
    'calling `spotify.%s` with id (%s) and params (%s)',
    method,
    id,
    JSON.stringify(params)
  )

  s[method](id, params)
    .then(function (data) {
      debug('mapping tracks')
      return data.body[type === 'artist' ? 'tracks' : 'items'].map(function (t) {
        if (type === 'playlist')
          return t.track.uri

        return t.uri
      })
    })
    .then(function (tracks) {
      var len = tracks.length

      debug('found %d tracks', len)

      if (len === 0)
        throw new Error('No tracks found')

      return s.replaceTracksInPlaylist(username, playlistId, tracks)
    })
    .then(function () {
      return callback()
    })
    .catch(function (err) {
      return callback(err)
    })
}
