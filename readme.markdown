# ["@bluenotebot recommends"][url] playlist generator

[@bluenotebot][bnb] is a twitter bot by [Daniel Canet][dcanetma] that links to
random(?) jazz albums released by Blue Note Records. This watches for general
tweets from the bot (as opposed to @ mentions, which was how it started) and
adds the album's tracks (or artist's top tracks in the US) to a public playlist.

## Getting a refresh token

For this to work, you'll need to get a refresh token and store it in a file named
`refresh-token.txt` w/in this directory. To the best that I could find, Spotify
does not issue access tokens for apps outside of an authentication flow. However,
refresh tokens, which are issued when you get an access token, live for a lot longer
(no idea if it's forever, but it's definitely a few days).

To get one, follow Spotify's [auth flow instructions][auth-flow] (you don't need to
set up a server, you can get a token with a combination of browser/cURL requests!).
Stash the refresh token value in `refresh-token.txt` and you're off to the races!

[url]: https://open.spotify.com/user/malantonio/playlist/6BiCkToyct2QYWBbh84Qrp
[bnb]: https://twitter.com/bluenotebot
[dcanetma]: https://twitter.com/dcanetma
[auth-flow]: https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
