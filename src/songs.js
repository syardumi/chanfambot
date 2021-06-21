const Songs = (target, context, chatMsg, client) => {
  if (chatMsg.includes('!3sides')) {
    // song: 3 sides
    client.say(target, `jeanet3Yoda SingsNote There's yours, there's mine, ... and the truth SingsNote jeanet3Yoda`);
    console.log(`* Executed ${chatMsg} command`);
  }
}

module.exports = Songs