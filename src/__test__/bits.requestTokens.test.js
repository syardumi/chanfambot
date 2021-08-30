const RequestTokens = require('../requestTokens')
const RequestTokenTest = require('./lib')

describe('Bits', () => {

    it('gifts 499 bits', async () => {
        const testDB = new RequestTokenTest()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('')
                expect(msg).toEqual('')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 499)
        expect(testDB.getChannel()).toEqual('')
        expect(testDB.getUsername()).toEqual('')
        expect(testDB.getTokens()).toEqual(0)
        expect(testDB.getMod()).toEqual('')
    })

    it('gifts 501 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 1 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 501)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(1)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 501 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 8 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 501)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(8)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 999 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 1 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 999)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(1)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 999 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 8 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 999)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(8)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1001 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 3 token(s). They now have 3 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1001)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(3)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1001 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 3 token(s). They now have 10 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1001)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(10)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1499 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 3 token(s). They now have 3 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1499)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(3)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1499 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 3 token(s). They now have 10 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1499)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(10)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1501 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 5 token(s). They now have 5 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1501)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(5)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1501 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 5 token(s). They now have 12 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 1501)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(12)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 2000 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 6 token(s). They now have 6 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 2000)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(6)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 2000 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 6 token(s). They now have 13 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 2000)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(13)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 2500 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 8 token(s). They now have 8 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 2500)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(8)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 2500 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 8 token(s). They now have 15 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 2500)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(15)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 3500 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 11 token(s). They now have 11 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 3500)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(11)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 3500 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 11 token(s). They now have 18 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 3500)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(18)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 4000 bits, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 13 token(s). They now have 13 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 4000)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(13)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 4000 bits, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 13 token(s). They now have 20 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onBits('#jeanettemusic', 'thefinaledge', 4000)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(20)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })
})