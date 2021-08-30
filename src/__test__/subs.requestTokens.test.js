const RequestTokens = require('../requestTokens')
const RequestTokenTest = require('./lib')

describe('Subs', () => {

    it('gifts 1 sub, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 1 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onSub('#jeanettemusic', 'thefinaledge', 1)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(1)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 1 sub, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 1 token(s). They now have 8 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onSub('#jeanettemusic', 'thefinaledge', 1)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(8)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 5 sub, new user', async () => {
        const testDB = new RequestTokenTest()
        testDB.setIsNewUser()

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 5 token(s). They now have 5 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onSub('#jeanettemusic', 'thefinaledge', 5)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(5)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })

    it('gifts 5 sub, existing user', async () => {
        const testDB = new RequestTokenTest()
        
        testDB.setTokens(7)

        const client = {
            say: (target, msg) => {
                expect(target).toEqual('#jeanettemusic')
                expect(msg).toEqual('@thefinaledge got 5 token(s). They now have 12 token(s).')
            }
        }
        const rt = new RequestTokens(client, testDB)

        await rt.onSub('#jeanettemusic', 'thefinaledge', 5)
        expect(testDB.getChannel()).toEqual('jeanettemusic')
        expect(testDB.getUsername()).toEqual('thefinaledge')
        expect(testDB.getTokens()).toEqual(12)
        expect(testDB.getMod()).toEqual('thefinaledge')
    })
})