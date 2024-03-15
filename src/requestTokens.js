const LIVE_LEARN_TOKEN = 5 // TODO: change this to a channel setting
const BUMP_TOKEN = 1 // TODO: change this to a channel setting
const MAX_GIVE_TOKENS = 100

const TOKENS_FROM_BITS_5 = 2500
const TOKENS_FROM_BITS_3 = 1500
const TOKENS_FROM_BITS_1 = 500

const MILLISECONDS_IN_A_SECOND = 1000

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

// TODO: auto add tokens from gift subs
// TODO: auto add tokens via donations

class RequestTokens {
  constructor({client, db, config, target, username, recipient, numOfSubs, songTitle}) {
    this.client = client
    this.db = db
    this.config = config

    this.target = target
    this.channel = target.substring(1, target.length)
    this.username = username?.toLowerCase()
    this.recipient = recipient
    this.numOfTokens = numOfSubs
    this.songTitle = songTitle
    this.tokenEmote = this.config.tokenEmotes[this.channel] || ''
  }

  // **************************
  // ****** SUB RECEIVED ******
  // **************************

  async onSub() {
    await this.tokenAdd(true)

    // console.log(`Subs - ${username} ${numOfSubs}`)
    // 1 sub = 1 token
  }

  // ***************************
  // ****** BITS RECEIVED ******
  // ***************************

  async onBits(numOfBits) {
    console.log({ numOfBits })

    if (numOfBits >= TOKENS_FROM_BITS_1) {
      this.numOfTokens = Math.floor(numOfBits / TOKENS_FROM_BITS_1)

      await this.tokenAdd(true)
    }

    // console.log(`Bits - ${username} ${numOfBits}`)
  }

  // **************************
  // ****** MSG RECEIVED ******
  // **************************

  onMessage(context, chatMsg) {
    return (async () => {
      this.context = context
      this.chatMsg = chatMsg

      this.isSuperUser =
        (this.context['badges'] &&
          this.context['badges']['broadcaster'] === '1') ||
        this.context['mod'] === true ||
        this.context['username'] === this.config.me

      if (!this.chatMsg.includes('!token')) return

      this.parseMessageComponents()
      await this.runMessageCommand()
    })()
  }

  parseMessageComponents() {
    const parts = this.chatMsg.split(' ')
    parts.forEach((part) => {
      if (part.includes('!token')) return
      if (
        !this.username ||
        ((this.operation.includes('transfer') ||
          this.operation.includes('move')) &&
          !this.recipient)
      ) {
        if (!this.username && part[0] === '@') {
          this.username = part.substring(1, part.length)
        } else if (!this.recipient && part[0] === '@') {
          this.recipient = part.substring(1, part.length)
        } else if (isNumeric(part)) {
          this.numOfTokens = parseInt(part)
        } else {
          if (!this.operation) {
            this.operation = '' + part
          } else {
            this.operation += part
          }
        }
      } else {
        if (!this.numOfTokens && isNumeric(part)) {
          this.numOfTokens = parseInt(part)
        } else {
          if (!this.songTitle) {
            this.songTitle = '' + part + ' '
          } else {
            this.songTitle += part + ' '
          }
        }
      }
    })
    if (!this.operation) this.operation = 'check'
    this.songTitle = this.songTitle.trim()
    this.operation = this.operation?.toLowerCase()
    this.username = this.username?.toLowerCase()
    this.recipient = this.recipient?.toLowerCase()

    const { username, recipient, operation, numOfTokens, songTitle } = this
    const mod = this.context['username']
    console.log({
      mod,
      username,
      recipient,
      operation,
      numOfTokens,
      songTitle
    })
  }

  async runMessageCommand() {
    let anyoneCmdFound = true,
      modCmdFound = true

    // ANYONE

    //  - !token :: check tokens for this user
    if (this.chatMsg === '!token' || this.chatMsg === '!tokens') {
      await this.tokenCheck(this.context['username'])
    }

    //  - !token rules :: says the rules
    else if (
      this.chatMsg.replace(' ', '').includes('!tokenrules') ||
      this.chatMsg.replace(' ', '').includes('!tokensrules')
    ) {
      this.client.say(
        this.target,
        `${this.tokenEmote} A song bump (costs 1 token) is having donated $5, 500 bits, or 1 gift sub to the channel. An English live learn (costs 5 tokens) is having donated $25, 2500 bits, or 5 gift subs to the channel. A Spanish/Rap/Piano live learn (costs 10 tokens) is having donated $50, 5000 bits, or 10 gift subs to the channel. ${this.tokenEmote}`
      )
    } else {
      anyoneCmdFound = false
    }

    if (!this.isSuperUser) {
      if (anyoneCmdFound) {
        console.log(`* Executed ${this.chatMsg} command`)
      } else {
        this.client.say(
          this.target,
          `Command not found or you are not a mod. Example: !token {operation} {@user} {# of tokens} {song title}`
        )
        console.log(`* No match: ${this.chatMsg} command`)
      }
      return
    }

    // BROADCASTER & MODS ONLY

    // - !token help :: shows example
    if (
      this.chatMsg.replace(' ', '').includes('!tokenhelp') ||
      this.chatMsg.replace(' ', '').includes('!tokenshelp')
    ) {
      this.client.say(
        this.target,
        `Example: !token {operation} {@user} {# of tokens} {song title}`
      )
    }

    // - !token operation help :: shows operations
    else if (
      this.chatMsg.includes('!token operation help') ||
      this.chatMsg.includes('!tokens operation help')
    ) {
      this.client.say(
        this.target,
        `Operations: check, [add, give], [take, sub, subtract, remove, rm, livelearn, llearn, ll, songbump, bump], [transfer, move], clear, history, modhistory`
      )
    }

    // - !token (check) {@user} :: check tokens for the param user
    else if (
      this.chatMsg !== '!token' &&
      this.chatMsg !== '!tokens' &&
      this.operation === 'check' &&
      this.username
    ) {
      await this.tokenCheck(this.username)
    }

    // - !token add {@user} {# of tokens} :: add tokens to user
    else if (
      (this.operation === 'add' || this.operation === 'give') &&
      this.username &&
      this.numOfTokens
    ) {
      await this.tokenAdd()
    }

    // - !token (take|sub|subtract|remove|rm|ll|llearn|livelearn|bump|songbump) {@user} {# of tokens} {"Song Title"} :: subtract tokens from user, optionally save the song title
    else if (
      (((this.operation === 'take' ||
        this.operation === 'sub' ||
        this.operation === 'subtract' ||
        this.operation === 'remove' ||
        this.operation === 'rm') &&
        this.numOfTokens) ||
        this.operation === 'll' ||
        this.operation === 'llearn' ||
        this.operation === 'livelearn' ||
        this.operation === 'bump' ||
        this.operation === 'songbump') &&
      this.username
    ) {
      await this.tokenSubtract()
    }

    // - !token (transfer/move) {@user} {@recipient} {# of tokens}
    else if (
      (this.operation.includes('transfer') ||
        this.operation.includes('move')) &&
      this.username &&
      this.recipient &&
      this.numOfTokens
    ) {
      await this.tokenTransfer()
    }

    // - !token clear {@user} :: set user tokens to zero, clear history using is_cleared flag
    else if (this.operation === 'clear') {
      if (!this.username) {
        this.username = this.context['username']
      }
      await this.tokenClear()
    }

    //  - !token history {@user}
    else if (this.operation === 'history') {
      if (!this.username) {
        this.username = this.context['username']
      }
      await this.tokenHistory()
    }

    //  - !token (modhistory|mod history) {@mod}
    else if (this.operation === 'modhistory') {
      if (!this.username) {
        this.username = this.context['username']
      }
      await this.tokenModHistory()
    } else {
      modCmdFound = false
    }

    if (anyoneCmdFound || modCmdFound) {
      console.log(`* Executed ${this.chatMsg} command`)
    } else {
      this.client.say(
        this.target,
        `Command not found or is missing parameters. Example: !token {operation} {@user} {# of tokens} {song title}`
      )
      console.log(`* No match: ${this.chatMsg} command`)
    }
  }

  // ***********************
  // ****** TOKEN OPS ******
  // ***********************

  async tokenCheck(username) {
    const result = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      username,
      this.channel
    )

    if (result) {
      this.client.say(
        this.target,
        `@${username} has ${result.tokens} ${this.tokenEmote} token(s) left`
      )
    } else {
      this.client.say(
        this.target,
        `@${username} has no ${this.tokenEmote} tokens right now`
      )
    }
  }

  async tokenAdd(isAuto) {
    if (this.numOfTokens > MAX_GIVE_TOKENS) this.numOfTokens = MAX_GIVE_TOKENS

    let result = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.username,
      this.channel
    )

    // insert or update
    if (!result) {
      await this.db.run(
        'INSERT INTO request_token (channel, username, tokens, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)',
        this.channel,
        this.username,
        this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
        isAuto ? this.username : this.context['username']
      )
    } else {
      await this.db.run(
        'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
        result.tokens + this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
        isAuto ? this.username : this.context['username'],
        this.username,
        this.channel
      )
    }

    // add to history
    if (this.channel && this.username && this.numOfTokens !== undefined)
      await this.db.run(
        'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, song_title, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        this.channel,
        this.username,
        isAuto ? this.username : this.context['username'],
        'add',
        this.numOfTokens,
        this.songTitle,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND)
      )

    // speak to us
    result = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.username,
      this.channel
    )
    if (isAuto) {
      if (this.username && this.numOfTokens)
        this.client.say(
          this.target,
          `@${this.username} got ${this.numOfTokens} ${this.tokenEmote} token(s). They now have ${result.tokens} token(s).`
        )
    } else {
      this.client.say(
        this.target,
        `Mod<${this.context['username']}> adds ${this.numOfTokens} ${this.tokenEmote} token(s) to @${this.username}. They now have ${result.tokens} ${this.tokenEmote} token(s).`
      )
    }
  }

  async tokenSubtract() {
    if (
      this.operation === 'll' ||
      this.operation === 'llearn' ||
      this.operation === 'livelearn'
    ) {
      this.numOfTokens = LIVE_LEARN_TOKEN
    } else if (this.operation === 'bump' || this.operation === 'songbump') {
      this.numOfTokens = BUMP_TOKEN
    }

    let result = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.username,
      this.channel
    )

    if (!result || result.tokens - this.numOfTokens < 0) {
      const userTokens = result ? result.tokens : 0
      this.client.say(
        this.target,
        `@${this.username} only has ${userTokens} ${this.tokenEmote} token(s), so it's a no go!`
      )
      console.log(`* Executed ${this.chatMsg} command`)
      return
    }

    await this.db.run(
      'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
      result.tokens - this.numOfTokens,
      Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
      this.context['username'],
      this.username,
      this.channel
    )

    // add to history
    if (this.channel && this.username && this.numOfTokens !== undefined)
      await this.db.run(
        'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, song_title, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
        this.channel,
        this.username,
        this.context['username'],
        'subtract',
        this.numOfTokens,
        this.songTitle,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND)
      )

    // speak to us
    result = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.username,
      this.channel
    )
    this.client.say(
      this.target,
      `Mod<${this.context['username']}> subtracts ${this.numOfTokens} ${
        this.tokenEmote
      } token(s) from @${this.username}${
        this.songTitle ? ' for ' + this.songTitle : ''
      }${
        this.numOfTokens === BUMP_TOKEN
          ? ' (song bump)'
          : this.numOfTokens === LIVE_LEARN_TOKEN
          ? ' (live learn)'
          : ''
      }. They now have ${result.tokens} ${this.tokenEmote} token(s).`
    )
  }

  async tokenTransfer() {
    if (this.numOfTokens > MAX_GIVE_TOKENS) this.numOfTokens = MAX_GIVE_TOKENS

    let usernameResult = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.username,
      this.channel
    )

    if (!usernameResult || usernameResult.tokens - this.numOfTokens < 0) {
      const userTokens = usernameResult ? usernameResult.tokens : 0
      this.client.say(
        this.target,
        `@${this.username} only has ${userTokens} ${this.tokenEmote} token(s), so it's a no go!`
      )
      console.log(`* Executed ${this.chatMsg} command`)
      return
    }

    await this.db.run(
      'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
      usernameResult.tokens - this.numOfTokens,
      Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
      this.context['username'],
      this.username,
      this.channel
    )

    let recipientResult = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.recipient,
      this.channel
    )

    // insert or update
    if (!recipientResult) {
      await this.db.run(
        'INSERT INTO request_token (channel, username, tokens, updated_at, updated_by) VALUES (?, ?, ?, ?, ?)',
        this.channel,
        this.recipient,
        this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
        this.context['username']
      )
    } else {
      await this.db.run(
        'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
        recipientResult.tokens + this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
        this.context['username'],
        this.recipient,
        this.channel
      )
    }

    // add to history
    if (this.channel && this.recipient && this.username && this.numOfTokens !== undefined) {
      await this.db.run(
        'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        this.channel,
        this.recipient,
        this.context['username'],
        'add',
        this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND)
      )
      await this.db.run(
        'INSERT INTO request_token_history (channel, username, mod_username, operation, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        this.channel,
        this.username,
        this.context['username'],
        'subtract',
        this.numOfTokens,
        Math.floor(new Date() / MILLISECONDS_IN_A_SECOND)
      )
    }

    // speak to us
    recipientResult = await this.db.get(
      'SELECT tokens FROM request_token WHERE username = ? AND channel = ?',
      this.recipient,
      this.channel
    )
    this.client.say(
      this.target,
      `Mod<${this.context['username']}> transfers ${this.numOfTokens} ${
        this.tokenEmote
      } token(s) from @${this.username} to @${this.recipient}. @${
        this.username
      } has ${usernameResult.tokens - this.numOfTokens} ${
        this.tokenEmote
      } token(s). @${this.recipient} has ${recipientResult.tokens} ${
        this.tokenEmote
      } token(s).`
    )
  }

  async tokenClear() {
    await this.db.run(
      'UPDATE request_token SET tokens = ?, updated_at = ?, updated_by = ? WHERE username = ? AND channel = ?',
      0,
      Math.floor(new Date() / MILLISECONDS_IN_A_SECOND),
      this.context['username'],
      this.username,
      this.channel
    )
    await this.db.run(
      'UPDATE request_token_history SET is_cleared = 1 WHERE username = ? and channel = ?',
      this.username
    )
    this.client.say(this.target, `@${this.username}'s tokens have been cleared`)
  }

  async tokenHistory() {
    const result = await this.db.all(
      'SELECT * FROM request_token_history WHERE username = ? AND channel = ? AND is_cleared = 0 ORDER BY timestamp DESC LIMIT 5',
      this.username,
      this.channel
    )
    let msg = `No token history for ${this.username}`
    if (result && result.length) {
      msg = `@${this.username} Token History (Last 5): `
      result.forEach((record, i) => {
        if (i > 0) msg += ', '
        msg += `[${i + 1}] Mod<${record.mod_username}> ${record.operation}s ${
          record.amount
        } token(s)`
        if (record.song_title) {
          msg += ` for ${
            record.amount === LIVE_LEARN_TOKEN ? 'live learn' : 'song bump'
          } ${record.song_title}`
        }
      })
    }
    this.client.say(this.target, msg)
  }

  async tokenModHistory() {
    const result = await this.db.all(
      'SELECT * FROM request_token_history WHERE mod_username = ? AND channel = ? AND is_cleared = 0 ORDER BY timestamp DESC LIMIT 5',
      this.username,
      this.channel
    )
    let msg = `No token history for ${this.username}`
    if (result && result.length) {
      msg = `Mod<${this.username}> Token History (Last 5): `
      result.forEach((record, i) => {
        if (i > 0) msg += ', '
        msg += `[${i + 1}] ${record.operation}s ${record.amount} token(s) on @${
          record.username
        }`
        if (record.song_title) {
          msg += ` for ${
            record.amount === LIVE_LEARN_TOKEN ? 'live learn' : 'song bump'
          } ${record.song_title}`
        }
      })
    }
    this.client.say(this.target, msg)
  }
}

module.exports = RequestTokens
