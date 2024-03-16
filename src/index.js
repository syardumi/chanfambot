const Watermelons = require('./watermelons')
const Songs = require('./songs')
const AmongUs = require('./amongUs')
const RequestTokens = require('./requestTokens')
const config = require('./.env.js')

const tmi = require('tmi.js')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

let tokenSubTimeouts = []

open({
  filename: config.dbLocation,
  driver: sqlite3.cached.Database
}).then((db) => {
  // Called every time a message comes in
  async function onMessageHandler(target, context, msg, self) {
    if (self) return // Ignore messages from the bot
    if (context['message-type'] !== 'chat') return // ignore messages that are not chat type

    // Remove whitespace from edges of chat message
    const chatMsg = msg?.trim().toLowerCase()

    // console.log(context)

    if (config.modules.requestTokens) {
      const rt = new RequestTokens({ config, client, db, target})
      await rt.onMessage(context, chatMsg)
      delete rt
    }

    if (config.modules.watermelons) {
      Watermelons(target, context, chatMsg, client)
    }

    if (config.modules.songs) {
      Songs(target, context, chatMsg, client)
    }

    if (config.modules.amongUs) {
      AmongUs(target, context, chatMsg, client)
    }

    if (chatMsg === '!cfbot reset') {
      tokenSubTimeouts = []
      client.say(
        target,
        `...beep boop!`
      )
    }
  }

  async function onSubHandler(target, username, methods, msg, tags) {
    console.log('Sub', {target, username})
    if (config.modules.requestTokens) {
      if (tokenSubTimeouts.includes(username)) return
      const rt = new RequestTokens({ config, client, db, target, username, numOfSubs: 1})
      await rt.onSub()
      delete rt
    }
  }

  async function onReSubHandler(target, username, streakMonths, msg, tags, methods) {
    console.log('ReSub', {target, username})
    if (config.modules.requestTokens) {
      if (tokenSubTimeouts.includes(username)) return
      const rt = new RequestTokens({ config, client, db, target, username, numOfSubs: 1})
      await rt.onSub()
      delete rt
    }
  }

  async function onSubGiftHandler(
    target,
    username,
    streakMonths,
    recipient,
    methods,
    tags
  ) {
    console.log('Sub Gift', {target, username})
    if (config.modules.requestTokens) {
      if (tokenSubTimeouts.includes(username)) return
      const rt = new RequestTokens({ config, client, db, target, username, recipient, numOfSubs: 1})
      await rt.onSub()
      delete rt
    }
  }

  async function onSubMysteryHandler(target, username, giftSubCount, methods, tags) {
    console.log('Sub Mystery', { target, username, giftSubCount })
    // client.say(
    //   target,
    //   `@${username} got ${giftSubCount} ${
    //     config.tokenEmotes[target.substring(1, target.length)]
    //   } token(s).`
    // )
    if (config.modules.requestTokens) {
      if (tokenSubTimeouts.includes(username)) return
      if (giftSubCount > 1 && !tokenSubTimeouts.includes(username)) {
        tokenSubTimeouts.push(username)
        setTimeout(() => {
          const index = tokenSubTimeouts.indexOf(username);
          if (index > -1) { 
            tokenSubTimeouts.splice(index, 1); 
          }
        }, 5e3 + (Math.random() * 5e3))

        const rt = new RequestTokens({ config, client, db, target, username, numOfSubs: giftSubCount})
        await rt.onSub()
        delete rt
      }
    }
  }

  function onPrimeUpgradeHandler(target, username, methods, tags) {
    console.log('Prime Upgrade', { target, username })
    //     if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onGiftUpgradeHandler(target, username, sender, tags) {
    console.log('Gift Upgrade', { target, username })
    //     if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onAnonGiftUpgradeHandler(target, username, tags) {
    console.log('Anon Gift upgrade', { target, username })
    //     if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  async function onRawMsgHandler(msg) {
    const bits = parseInt(msg.tags.bits)
    let target
    msg.params.forEach((param) => {
      if (param.includes('#')) {
        target = param
      }
    })
    if (config.modules.requestTokens && bits) {
      const rt = new RequestTokens({ config, client, db, target, username: msg.tags['display-name']})
      await rt.onBits(bits)
      delete rt
    }
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`)
  }

  // Create a client with our options
  const client = new tmi.client({
    options: {
      debug: false
    },
    connection: {
      reconnect: true,
      secure: true
    },
    identity: {
      username: config.oauthUsername,
      password: config.oauthPassword
    },
    channels: config.channels
  })
  
  // // Register our event handlers (defined below)
  client.on('raw_message', onRawMsgHandler)
  client.on('message', onMessageHandler)

  client.on('sub', onSubHandler)
  client.on('resub', onReSubHandler)
  client.on('subgift', onSubGiftHandler)
  client.on('submysterygift', onSubMysteryHandler)
  client.on('primepaidupgrade', onPrimeUpgradeHandler)
  client.on('giftpaidupgrade', onGiftUpgradeHandler)
  client.on('anongiftpaidupgrade', onAnonGiftUpgradeHandler)

  client.on('connected', onConnectedHandler)

  // // Connect to Twitch:
  client.connect()
})
