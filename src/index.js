const Watermelons = require('./watermelons');
const Songs = require('./songs')
const AmongUs = require('./amongUs')
const RequestTokens = require('./requestTokens')
const config = require('./.env.js')

const tmi = require('tmi.js');
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

open({
  filename: config.dbLocation,
  driver: sqlite3.cached.Database
}).then((db) => {
  // Called every time a message comes in
  async function onMessageHandler (target, context, msg, self) {
    if (self) return // Ignore messages from the bot
    if (context["message-type"] !== 'chat') return // ignore messages that are not chat type

    // Remove whitespace from edges of chat message
    const chatMsg = msg.trim().toLowerCase();

    // console.log(context)

    if (config.modules.requestTokens) {
      await rt.onMessage(target, context, chatMsg)
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
  }

  function onSubHandler (target, username, methods, msg, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onReSubHandler (target, username, streakMonths, msg, tags, methods) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onSubGiftHandler (target, username, streakMonths, recipient, methods, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onSubMysteryHandler (target, username, giftSubCount, methods, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, giftSubCount)
  }

  function onPrimeUpgradeHandler (target, username, methods, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onGiftUpgradeHandler (target, username, sender, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onAnonGiftUpgradeHandler (target, username, tags) {
    // console.log(target)
    if (config.modules.requestTokens) rt.onSub(target, username, 1)
  }

  function onRawMsgHandler(msg) {
    const bits = parseInt(msg.tags.bits)
    let target
    msg.params.forEach((param) => {
      if (param.includes('#')) {
        target = param
      }
    })
    if (bits && config.modules.requestTokens) rt.onBits(target, msg.tags['display-name'], bits)
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
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
  });
  const rt = new RequestTokens(client, db)

  // // Register our event handlers (defined below)
  client.on('raw_message', onRawMsgHandler)
  client.on('message', onMessageHandler);

  client.on('sub', onSubHandler)
  client.on('resub', onReSubHandler)
  client.on('subgift', onSubGiftHandler)
  client.on('submysterygift', onSubMysteryHandler)
  client.on('primepaidupgrade', onPrimeUpgradeHandler)
  client.on('giftpaidupgrade', onGiftUpgradeHandler)
  client.on('anongiftpaidupgrade', onAnonGiftUpgradeHandler)

  client.on('connected', onConnectedHandler);

  // // Connect to Twitch:
  client.connect();
})
