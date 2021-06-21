const numeral = require('numeral');

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 1000000;
  return Math.floor(Math.random() * sides) + 1;
}

const Watermelons = (target, context, chatMsg, client) => {
  // ----- ANYONE -----
  if (chatMsg.includes('!watermelon')) {
    // give out some watermelons

    const num = rollDice();

    // personalize
    let owner = '@' + context['display-name']
    if (chatMsg.includes('@')) {
      const chatParts = chatMsg.split(' ')
      chatParts.forEach(function (part) {
        if (part.includes('@')) {
          owner = part
        }
      })
    }

    client.say(target, `${owner}, you get to take home watermelon #${numeral(num).format('0,0')}. Be good to it!`);
    console.log(`* Executed ${chatMsg} command`);
  }
}

module.exports = Watermelons