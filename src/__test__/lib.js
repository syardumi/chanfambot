
class RequestTokenTest {

    constructor () {
        this.channel = ''
        this.username = ''
        this.mod = ''
        this.tokens = 0
        this.numRuns = 0

        this.recipient = ''
        this.recipientTokens = 0
        this.numRecipRuns = 0
        
        this.get = async function (query) {
            return new Promise((resolve, reject) => resolve({
                tokens: this.tokens
            }))
        }
        this.run = function (query) {
            const args = Array.prototype.slice.call(arguments, 1)
            if (query.includes(' request_token ')) {
                this.tokens = args[0]
                this.mod = args[2]
                this.username = args[3]
                this.channel = args[4]
            }
        }
        this.all = (query) => {}
    }

    setIsNewUser () {
        // INSERT
        this.run = function (query) {
            const args = Array.prototype.slice.call(arguments, 1)
            if (query.includes(' request_token ')) {
                this.channel = args[0]
                this.username = args[1]
                this.tokens = args[2]
                this.mod = args[4]
            }
        }
        this.get = async function (query) {
            this.numRuns++
            if (this.numRuns <= 1) {
                return new Promise((resolve, reject) => resolve(null))
            }
            return new Promise((resolve, reject) => resolve({
                tokens: this.tokens
            }))
        }
    }

    setIsTransfer (isNewRecipient) {
        this.run = function (query) {
            const args = Array.prototype.slice.call(arguments, 1)

            this.numRecipRuns++
            if (query.includes(' request_token ')) {
                if (this.numRecipRuns <= 1) {
                    this.tokens = args[0]
                    this.mod = args[2]
                    this.username = args[3]
                    this.channel = args[4]
                } else if (this.numRecipRuns <= 2) {
                    if (isNewRecipient) {
                        this.recipient = args[1]
                        this.recipientTokens = args[2]
                    } else {
                        this.recipient = args[3]
                        this.recipientTokens = args[0]
                    }
                }
            }
        }
        this.get = async function (query) {
            this.numRuns++
            if (this.numRuns <= 1) {
                return new Promise((resolve, reject) => resolve({
                    tokens: this.tokens
                }))
            } else if (this.numRuns <= 2) {
                if (isNewRecipient) {
                    return new Promise((resolve, reject) => resolve(null))
                }
                else {
                    return new Promise((resolve, reject) => resolve({
                        tokens: this.recipientTokens
                    }))
                }
            } else if (this.numRuns <= 3) {
                return new Promise((resolve, reject) => resolve({
                    tokens: this.recipientTokens
                }))
            }
        }
    }

    getChannel () {
        return this.channel
    }

    getUsername () {
        return this.username
    }

    getMod () {
        return this.mod
    }

    getTokens () {
        return this.tokens
    }

    getRecipient () {
        return this.recipient
    }

    getRecipientTokens () {
        return this.recipientTokens
    }

    setTokens (tokens) {
        this.tokens = tokens
    }
}

module.exports = RequestTokenTest