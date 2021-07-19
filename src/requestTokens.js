const LIVE_LEARN_TOKEN = 5 // TODO: change this to a channel setting
const BUMP_TOKEN = 1 // TODO: change this to a channel setting
const MAX_GIVE_TOKENS = 100

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// TODO: restart CF bot every 24 hrs

const RequestTokens = (target, context, chatMsg, client, db) => {
  (async () => {
    const channel = target.substring(1, target.length)

    // parse the command params
    let username
    let recipient
    let operation
    let numOfTokens
    let songTitle = null
    const parts = chatMsg.split(' ')
    parts.forEach((part) => {
      if (part.includes('!token')) return
      if (!username || ((operation.includes('transfer') || operation.includes('move')) && !recipient)) {
        if (!username && part[0] === '@') {
          username = part.substring(1, part.length)
        } else if (!recipient && part[0] === '@') {
          recipient = part.substring(1, part.length)
        } else if (isNumeric(part)) {
          numOfTokens = parseInt(part)
        } else {
          if (!operation) {
            operation = '' + part
          } else {
            operation += part
          }
        }
      }
      else {
        if (!numOfTokens && isNumeric(part)) {
          numOfTokens = parseInt(part)
        } else {
          if (!songTitle) {
            songTitle = '' + part + ' '
          } else {
            songTitle += part + ' '
          }
        }
      }
    })
    if (!operation) operation = 'check'
    if (songTitle) songTitle = songTitle.trim()
    console.log({ username, recipient, operation, numOfTokens, songTitle })

    // ANYONE
    //  - !token :: check tokens for this user
    if (chatMsg === '!token' || chatMsg === '!tokens') {
      const result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', context['username'], channel)
      
      if (result) {
        client.say(target, `@${context['username']} has ${result.tokens} token(s) left`);
      } else {
        client.say(target, `@${context['username']} has no tokens right now`);
      }

      console.log(`* Executed ${chatMsg} command`);
      return
    }

    //  - !token rules :: says the rules
    if (chatMsg.replace(' ', '').includes('!tokenrules') || chatMsg.replace(' ', '').includes('!tokensrules')) {
      client.say(target, `A live learn (costs 5 tokens) is having donated $15, 1500 bits, or 5 gift subs to the channel. A song bump (costs 1 token) is having donated $5, 500 bits, or 1 gift sub to the channel.`);
      console.log(`* Executed ${chatMsg} command`);
      return
    }

    // BROADCASTER & MODS ONLY
    if (context['badges']['broadcaster'] === '1' || context['mod'] === true || context['username'] === 'thefinaledge') {
      //  - !token help :: shows example
      if (chatMsg.replace(' ', '').includes('!tokenhelp') || chatMsg.replace(' ', '').includes('!tokenshelp')) {
        client.say(target, `Example: !token {operation} {@user} {# of tokens} {song title}`);
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token operation help :: shows operations
      if (chatMsg.includes('!token operation help') || chatMsg.includes('!tokens operation help')) {
        client.say(target, `Operations: add, give, take, sub, subtract, remove, rm, livelearn, llearn, ll, songbump, bump`);
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token (check) {@user} :: check tokens for the param user
      if (operation === 'check' && username) {
        const result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
        
        if (result) {
          client.say(target, `@${username} has ${result.tokens} token(s) left`);
        } else {
          client.say(target, `@${username} has no tokens right now`);
        }

        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token add {@user} {# of tokens} :: add tokens to user
      if ((operation === 'add' || operation === 'give') && username && numOfTokens) {
        if (numOfTokens > MAX_GIVE_TOKENS) numOfTokens = MAX_GIVE_TOKENS

        let result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
        
        // insert or update
        if (!result) {
          await db.run(
            'INSERT INTO request_token (channel, username, tokens, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)',
            channel, username, numOfTokens, Math.floor(new Date() / 1000), context['username']
          )
        } else {
          await db.run(
            'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
            result.tokens + numOfTokens, Math.floor(new Date() / 1000), context['username'], username, channel
          )          
        }

        // add to history
        await db.run(
          'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, song_title, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
          channel, username, context['username'], 'add', numOfTokens, songTitle, Math.floor(new Date() / 1000)
        )

        result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
        client.say(target, `Mod<${context['username']}> adds ${numOfTokens} token(s) to @${username}. They now have ${result.tokens} token(s).`);  
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token (take|sub|subtract|remove|rm|ll|llearn|livelearn|bump|songbump) {@user} {# of tokens} {"Song Title"} :: subtract tokens from user, optionally save the song title
      if (
        (((operation === 'take' || 
        operation === 'sub' || 
        operation === 'subtract' || 
        operation === 'remove' || 
        operation === 'rm') && numOfTokens) || 
        (operation === 'll' || 
        operation === 'llearn' || 
        operation === 'livelearn' || 
        operation === 'bump' || 
        operation === 'songbump')) 
        && username) {
          if (operation === 'll' || operation === 'llearn' || operation === 'livelearn') {
            numOfTokens = LIVE_LEARN_TOKEN
          } else if (operation === 'bump' || operation === 'songbump') {
            numOfTokens = BUMP_TOKEN
          }

          let result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
          
          if (!result || result.tokens - numOfTokens < 0) {
            const userTokens = result ? result.tokens : 0
            client.say(target, `@${username} only has ${userTokens} token(s), so it's a no go!`)
            console.log(`* Executed ${chatMsg} command`);
            return
          } else {
            await db.run(
              'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
              result.tokens - numOfTokens, Math.floor(new Date() / 1000), context['username'], username, channel
            )
          }

          // add to history
          await db.run(
            'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, song_title, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            channel, username, context['username'], 'subtract', numOfTokens, songTitle, Math.floor(new Date() / 1000)
          )

          result = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
          client.say(target, `Mod<${context['username']}> subtracts ${numOfTokens} token(s) from @${username}${songTitle ? ' for ' + songTitle : ''}${numOfTokens === BUMP_TOKEN ? ' (song bump)' : numOfTokens === LIVE_LEARN_TOKEN ? ' (live learn)' : ''}. They now have ${result.tokens} token(s).`);  
          console.log(`* Executed ${chatMsg} command`);
          return
      }

      //  - !token (transfer/move) {@user} {@recipient} {# of tokens} 
      if ((operation.includes('transfer') || operation.includes('move')) && username && recipient && numOfTokens) {
        if (numOfTokens > MAX_GIVE_TOKENS) numOfTokens = MAX_GIVE_TOKENS

        let usernameResult = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', username, channel)
        
        if (!usernameResult || usernameResult.tokens - numOfTokens < 0) {
          const userTokens = usernameResult ? usernameResult.tokens : 0
          client.say(target, `@${username} only has ${userTokens} token(s), so it's a no go!`)
          console.log(`* Executed ${chatMsg} command`);
          return
        }

        await db.run(
          'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
          usernameResult.tokens - numOfTokens, Math.floor(new Date() / 1000), context['username'], username, channel
        )

        let recipientResult = await db.get('SELECT tokens FROM request_token WHERE username = ? AND channel = ?', recipient, channel)

        // insert or update
        if (!recipientResult) {
          await db.run(
            'INSERT INTO request_token (channel, username, tokens, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)',
            channel, recipient, numOfTokens, Math.floor(new Date() / 1000), context['username']
          )
        } else {
          await db.run(
            'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
            recipientResult.tokens + numOfTokens, Math.floor(new Date() / 1000), context['username'], recipient, channel
          )          
        }

        // add to history
        await db.run(
          'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          channel, recipient, context['username'], 'add', numOfTokens, Math.floor(new Date() / 1000)
        )
        await db.run(
          'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          channel, username, context['username'], 'subtract', numOfTokens, Math.floor(new Date() / 1000)
        )

        client.say(target, `Mod<${context['username']}> transfers ${numOfTokens} token(s) from @${username} to @${recipient}. @${username} has ${usernameResult.tokens - numOfTokens} token(s). @${recipient} has ${recipientResult.tokens + numOfTokens} token(s).`);  
        console.log(`* Executed ${chatMsg} command`);
        return
      }
      
      //  - !token clear {@user} :: set user tokens to zero, clear history using is_cleared flag
      if (operation === 'clear' && username) {
        await db.run(
          'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
          0, Math.floor(new Date() / 1000), context['username'], username, channel
        )  
        await db.run(
          'UPDATE request_token_history SET is_cleared = 1 WHERE username = ? and channel = ?',
          username
        )
        client.say(target, `@${username}'s tokens have been cleared`);  
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token history {@user}
      if (operation === 'history' && username) {
        const result = await db.all('SELECT * FROM request_token_history WHERE username = ? AND channel = ? AND is_cleared = 0 ORDER BY timestamp DESC LIMIT 5', username, channel)
        let msg = `No token history for ${username}`
        if (result && result.length) {
          msg = `@${username} Token History (Last 5): `
          result.forEach((record, i) => {
            if (i > 0) msg += ', '
            msg += `[${i+1}] Mod<${record.mod_username}> ${record.operation}s ${record.amount} token(s)`
            if (record.song_title) {
              msg += ` for ${record.amount === LIVE_LEARN_TOKEN ? 'live learn' : 'song bump'} ${record.song_title}`
            }
          })
        }
        client.say(target, msg);
        console.log(`* Executed ${chatMsg} command`);
        return
      }

      //  - !token (modhistory|mod history) {@mod}
      if (operation === 'modhistory' && username) {
        const result = await db.all('SELECT * FROM request_token_history WHERE mod_username = ? AND channel = ? AND is_cleared = 0 ORDER BY timestamp DESC LIMIT 5', username, channel)
        let msg = `No token history for ${username}`
        if (result && result.length) {
          msg = `Mod<${username}> Token History (Last 5): `
          result.forEach((record, i) => {
            if (i > 0) msg += ', '
            msg += `[${i+1}] ${record.operation}s ${record.amount} token(s) on @${record.username}`
            if (record.song_title) {
              msg += ` for ${record.amount === LIVE_LEARN_TOKEN ? 'live learn' : 'song bump'} ${record.song_title}`
            }
          })
        }
        client.say(target, msg);
        console.log(`* Executed ${chatMsg} command`);
        return
      }
    }

    // client.say(target, `Command not found or is missing params. Example: !token {operation} {@user} {# of tokens} {song title}`)
    // console.log(`* No match: ${chatMsg} command`);
  })()
}

module.exports = RequestTokens
