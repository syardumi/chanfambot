const Watermelons = require('./watermelons');
const Songs = require('./songs')
const AmongUs = require('./amongUs')
const RequestTokens = require('./requestTokens')

const tmi = require('tmi.js');
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

open({
  filename: '/home/syardumi/chanfambot.db',
  driver: sqlite3.cached.Database
}).then((db) => {
  // Called every time a message comes in
  function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from edges of chat message
    const chatMsg = msg.trim().toLowerCase();

    // ----- CHAT MESSAGES -----
    if (context["message-type"] === 'chat') {

      if (chatMsg.includes('!token')) {
        RequestTokens(target, context, chatMsg, client, db)
      }

      Watermelons(target, context, chatMsg, client)
      
      Songs(target, context, chatMsg, client)

      // AmongUs(target, context, chatMsg, client)
    }
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  // Define configuration options
  const opts = {
    options: {
      debug: false
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
      username: 'chanfambot',
      password: 'oauth:c9q3pr36gnly00bd8u0lggfs197bzv'
    },
    channels: [
      'thefinaledge',
      'chanfambot',
      'jeanettemusic'
    ]
  };

  // Create a client with our options
  const client = new tmi.client(opts);

  // // Register our event handlers (defined below)
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);

  // // Connect to Twitch:
  client.connect();
})