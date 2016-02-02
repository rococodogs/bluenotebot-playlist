require('dotenv').config()
var debug = require('debug')('index.js')

// twitter setup
var Twitter = require('twitter')
var t = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

// spotify setup

var spotToken = require('./get-access-token')
var updatePlaylist = require('./update-playlist')
var spotify_album_prefix = 'https://open.spotify.com/album/'

// debug by getting the latest tweet
// t.get('statuses/user_timeline', {screen_name: 'bluenotebot'}, function (err, tweets) {
//   return handleTweet(tweets[0])
// })

t.stream('user', function (stream) {
  debug('watching yr own timeline')
  stream.on('data', function (tweet) {
    if (!tweet.user)
      return

    if (tweet.user.screen_name === 'bluenotebot' && !tweet.in_reply_to_status_id)
      return handleTweet(tweet)
  })
  stream.on('error', function (err) {
    debug('err!', err)
  })
})

function handleTweet (tweet) {
  debug('got a tweet!')
  var urls = tweet.entities.urls
  var url
  if (urls.length > 1) {
    for (var i = 0; i < urls.length; i++) {
      if (urls[i].expanded_url.indexOf(spotify_album_prefix) === 0) {
        url = urls[i].expanded_url
        break
      }
    }
  } else {
    url = urls[0].expanded_url
  }

  if (!url) {
    debug('no url found in tweet. leaving!')
    return
  }

  var reg = /^https:\/\/open\.spotify\.com\/(\w+)\/(.+)/
  var m = url.match(reg)

  if (!m || m.length === 1) {
    debug('reg did not match url (%s)', url)
    return
  }

  var type = m[1]
  var id = m[2]

  debug('type:', type)
  debug('id:', id)

  return spotifyHandoff(type, id)
}

function spotifyHandoff (type, id) {
  spotToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET, function (token) {
    if (!token) {
      debug('could not get a spotify token :(')
      return
    }

    var spotopts = {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      playlistId: process.env.SPOTIFY_PLAYLIST_ID,
      username: process.env.SPOTIFY_USERNAME,
      accessToken: token,
      type: type,
      id: id
    }

    return updatePlaylist(spotopts, function (err) {
      if (err) {
        debug('error with updating playlist:', err.message)
        debug(err)
        return
      }

      debug('ok!')
    })
  })
}

