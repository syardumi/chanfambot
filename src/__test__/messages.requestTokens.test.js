const RequestTokens = require('../requestTokens')
const RequestTokenTest = require('./lib')

describe('Message', () => {

    it('shows token rules', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('A live learn (costs 5 tokens) is having donated $15, 1500 bits, or 5 gift subs to the channel. A song bump (costs 1 token) is having donated $5, 500 bits, or 1 gift sub to the channel.')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!tokenrules')
    })

    it('does a token check on new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge has no tokens right now')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token')
    })

    it('does a token check w/ 7 tokens', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge has 7 token(s) left')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token')
    })

    it('does a token add but user is not a mod', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Command not found or you are not a mod. Example: !token {operation} {@user} {# of tokens} {song title}')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'testuser' }, '!token add 5 @thefinaledge')
    })

    it('shows help for token command', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Example: !token {operation} {@user} {# of tokens} {song title}')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token help')
    })

    it('shows help for token operations', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Operations: check, [add, give], [take, sub, subtract, remove, rm, livelearn, llearn, ll, songbump, bump], [transfer, move], clear, history, modhistory')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token operation help')
    })

    it('does a token check from a mod', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@chanfambot has 7 token(s) left')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token @chanfambot')
    })

    it('does a token add to a new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> adds 1 token(s) to @someuser. They now have 1 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token add 1 @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(1)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token add to an existing user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(7)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> adds 1 token(s) to @someuser. They now have 8 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token add 1 @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(8)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token subtract from a new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@someuser only has 0 token(s), so it\'s a no go!')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token sub 1 @someuser')
    })

    it('does a token subtract from an existing user, and they have enough tokens', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(12)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> subtracts 5 token(s) from @someuser (live learn). They now have 7 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token sub 5 @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(7)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token subtract from an existing user, and not enough tokens', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(3)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@someuser only has 3 token(s), so it\'s a no go!')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token sub 5 @someuser')
    })

    it('does a token subtract from an existing user, using shortcut livelearn command', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(12)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> subtracts 5 token(s) from @someuser (live learn). They now have 7 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token livelearn @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(7)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token subtract from an existing user, using shortcut bump command', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(12)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> subtracts 1 token(s) from @someuser (song bump). They now have 11 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token bump @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(11)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token transfer from a user, but user does not exist', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@someolduser only has 0 token(s), so it\'s a no go!')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token move @someolduser 10 @someotheruser')
    })

    it('does a token transfer from a user, but user does not have enough tokens', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(3)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@someolduser only has 3 token(s), so it\'s a no go!')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token move @someolduser 10 @someotheruser')
    })

    it('does a token transfer from a existing user to a new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsTransfer(true)
        testDB.setTokens(12)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> transfers 10 token(s) from @someolduser to @someotheruser. @someolduser has 2 token(s). @someotheruser has 10 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token move @someolduser 10 @someotheruser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someolduser')
        expect(testDB.getTokens()).toEqual(2)
        expect(testDB.getMod()).toEqual('thefinaledge')
        expect(testDB.getRecipient()).toEqual('someotheruser')
        expect(testDB.getRecipientTokens()).toEqual(10)
    })

    it('does a token transfer from a existing user to an existing user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsTransfer()
        testDB.setTokens(12)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Mod<thefinaledge> transfers 10 token(s) from @someolduser to @someotheruser. @someolduser has 2 token(s). @someotheruser has 10 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token move @someolduser 10 @someotheruser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someolduser')
        expect(testDB.getTokens()).toEqual(2)
        expect(testDB.getMod()).toEqual('thefinaledge')
        expect(testDB.getRecipient()).toEqual('someotheruser')
        expect(testDB.getRecipientTokens()).toEqual(10)
    })

    it('does a token clearing of a user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(12)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@someuser\'s tokens have been cleared')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token clear @someuser')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('someuser')
        expect(testDB.getTokens()).toEqual(0)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a token clearing of an assumed user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setTokens(12)


        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge\'s tokens have been cleared')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token clear')
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(0)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('does a bad command', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('Command not found or is missing parameters. Example: !token {operation} {@user} {# of tokens} {song title}')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onMessage('#jeanettemusic', { username: 'thefinaledge' }, '!token stuff')
    })
})
