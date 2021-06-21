let gameState // ready, started, paused
let players = []
let imposters = []
let crewmates = []

// ---- Among Us Game ----
const AmongUs = (target, context, chatMsg, client) => {
  // ----- ANYONE -----
  if (chatMsg.includes('!join') && gameState === 'ready') {
    // add user to among us game
    players.push(context['username']);
    players = Array.from(new Set(players));
    console.log(`* Executed ${chatMsg} command`);
  }
  if (chatMsg.includes('!players') && (gameState === 'ready' || gameState === 'started')) {
    if (players.length <= 0) {
      client.say(target, `No one has joined yet!`);
    } else {
      client.say(target, `Among Us players: ${players.join(', ')}`);
    }
    console.log(`* Executed ${chatMsg} command`);
  }

  // ----- MODS ONLY -----
  if (context['mod'] === true || context['username'] === 'thefinaledge') {
    if (chatMsg.includes('!amongus on')) {
      // initialize the game
      gameState = 'ready';
      client.say(target, `Oh, it's about to get all sus up in here! Type !join to play!`);
      console.log(`* Executed ${chatMsg} command`);
    }
    if (chatMsg.includes('!amongus start')) {
      if (players.length <= 1) {
        client.say(target, `Only 1 player is set up to play D: Add more players to begin!`);
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      // play!!!
      gameState = 'started'
      client.say(target, `Shhhhhhhh, game is a startin'`);
      console.log(`* Executed ${chatMsg} command`);

      // TODO: choose imposters and crewmates
      // (1 imposter for 1-5 regulars, 2 imposters for 6-10 regulars, or for > 12 players: 1 for every 3-5 regulars)
    }
    if (chatMsg.includes('!amongus pause')) {
      // pause play
      gameState = 'paused';
      client.say(target, `Freeze!`);
      console.log(`* Executed ${chatMsg} command`);
    }
    if (chatMsg.includes('!amongus unpause')) {
      // unpause play
      gameState = 'started';
      client.say(target, `Unfreeze!`);
      console.log(`* Executed ${chatMsg} command`);
    }
    if (chatMsg.includes('!amongus off')) {
      // destruct the game
      gameState = null;
      players = [];
      imposters = [];
      crewmates = [];
      client.say(target, `Thank you for playing!`);
      console.log(`* Executed ${chatMsg} command`);
    }
  }
}

module.exports = AmongUs