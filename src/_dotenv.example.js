const config = {
  dbLocation: '/home/user/somebot.db',
  oauthUsername: 'somebot',
  oauthPassword: 'oauth:someencryptedkeyhere',
  channels: [
    'atwitchchannel'
  ],
  tokenEmotes: {
    atwitchchannel: 'thisEmote'
  },
  modules: {
    amongUs: false,
    requestTokens: true,
    songs: true,
    watermelons: true
  },
  me: 'myusername'
}

module.exports = config
