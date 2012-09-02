steamyGrabBag = require("../lib/playerManager")
playerManagerFactory = steamyGrabBag.playerManagerFactory
dataDrivenComponentFactory = steamyGrabBag.dataDrivenComponentFactory

_subject = _subject_return = _subject_ran = undefined

clearSubject = -> _subject = _subject_return = _subject_ran = undefined

subject = (f) ->
  if f
    _subject = f
  else
    throw("no subject defined!") if !_subject
    if !_subject_ran
      _subject_ran = true
      _subject_return = _subject()
    return _subject_return


numKeys = (h) ->
  keys = []
  keys.push(key) for key in h
  keys.length

describe "playerManager", ->
  newPlayer = undefined
  pickNewPlayer = -> newPlayer = man.create()

  man = undefined
  beforeEach ->
    clearSubject()
    man = playerManagerFactory()

  describe ".create()", ->
    describe 'for the autoselected id', ->
      beforeEach ->
        subject -> pickNewPlayer().id

      it 'autoincrements', ->
        pickNewPlayer()
        expect(newPlayer.id).toEqual 0
        expect(subject()).toEqual 1

      describe 'when it collides with an existing id', ->
        beforeEach ->
          man.create(id: 0)

        it 'autoincrements past it', ->
          expect(subject()).toEqual 1

      describe 'after a non-colliding id has been created previously', ->
        beforeEach ->
          man.create(id: 10)

        it 'still autoincrements starting at 0', ->
          expect(subject()).toEqual(0)

    describe 'with a specified id', ->
      specifiedId = undefined
      beforeEach ->
        subject -> man.create(id: specifiedId)

      describe 'when the specified id is a string', ->
        beforeEach ->
          specifiedId = '20'

        it 'returns a player with the id as an integer', ->
          expect(subject().id).toEqual(20)

      describe 'when the specified id exists', ->
        beforeEach ->
          specifiedId = man.create().id

        it 'returns false', ->
          expect(subject()).toEqual(false)

      describe 'when the specified id does not exist', ->
        beforeEach ->
          specifiedId = 12345

        it 'returns a player with the specified id', ->
          expect(subject().id).toEqual(specifiedId)

    describe 'with an arbitrary key/value', ->
      attributes = undefined
      beforeEach ->
        subject -> man.create(attributes)
        attributes = {key: 'value'}

      it 'assigns the key/value to the player', ->
        expect(subject().key).toEqual('value')

      describe 'when the value is an object', ->
        fun = ->
        beforeEach ->
          attributes.key = fun

        it 'assigns the object', ->
          expect(subject().key).toEqual fun

  describe ".destroy()", ->
    player = undefined
    describe "for the list of players", ->
      beforeEach ->
        subject -> man.all()
        player = man.create()

      it "does not include destroyed players", ->
        man.destroy player
        expect(subject()).not.toContain player

  describe ".all()", ->
    beforeEach ->
      subject -> man.all()

    describe "with no players", ->
      it "is empty", ->
        expect(subject().length).toEqual 0

    describe "with a player added", ->
      player = undefined
      beforeEach ->
        player = man.create()

      it "contains the player", ->
        expect(subject()[0].id).toEqual(player.id)

      describe 'when extra attributes are on the player', ->
        beforeEach ->
          player.extra = 'stuff'

        it "only includes the data and id attributes", ->
          expect(subject()[0].extra).toBeUndefined()
          expect(subject()[0].id).toEqual(player.id)
          expect(subject()[0].data).toEqual({})

  describe ".findById()", ->
    playerId = undefined
    player = undefined
    beforeEach ->
      subject -> man.findById playerId

    describe "with the playerId existing", ->
      beforeEach ->
        player = man.create()
        playerId = player.id

      it 'returns the player', ->
        expect(subject()).toEqual player

      describe 'as a string', ->
        beforeEach ->
          playerId = playerId.toString()

        it 'returns the player', ->
          expect(subject()).toEqual player

    describe "with the playerId not existing", ->
      beforeEach ->
        playerId = 10

      it 'returns null', ->
        expect(subject()).toEqual null

  describe ".exists()", ->
    playerId = undefined
    beforeEach ->
      subject -> man.exists playerId

    describe "with the player existing", ->
      beforeEach ->
        playerId = man.create().id

      it 'returns true', ->
        expect(subject()).toEqual(true)

    describe 'with the player not existing', ->
      beforeEach ->
        playerId = 10

      it 'returns false', ->
        expect(subject()).toEqual(false)

describe "player", ->
  newPlayer = undefined
  pickNewPlayer = -> newPlayer = playerManagerFactory().create()

  beforeEach ->
    clearSubject()
    pickNewPlayer()

  describe ".toData()", ->
    it 'does not include the id', ->
      expect(newPlayer.toData().id).toBeUndefined()

    describe 'for the data attribute', ->
      beforeEach ->
        subject -> newPlayer.toData().data

      describe 'when it has no set data', ->
        it 'is empty', ->
          expect(numKeys(subject())).toEqual(0)

      describe 'when it has data set', ->
        beforeEach ->
          newPlayer.fromData({data: {a: 'b'}})

        it 'returns the set data', ->
          expect(subject().a).toEqual('b')

  describe '.fromData()', ->
    describe 'by the returned data representation', ->
      args = {data: {a: 'b'}}
      beforeEach ->
        subject -> newPlayer.fromData(args)

      it 'stores the data attribute', ->
        expect(subject().data.a).toEqual('b')

      describe 'when passed extraneous arguments', ->
        beforeEach ->
          args.bogus = 'whatever'

        it 'ignores them', ->
          expect(subject().bogus).toBeUndefined()

      describe 'with a new id passed', ->
        beforeEach ->
          args.id = 99

        it 'does not change its id value', ->
          oldId = newPlayer.id
          subject()
          expect(newPlayer.id).toEqual(oldId)

      describe 'after being called a second time with new data fields', ->
        beforeEach ->
          subject()
          newPlayer.fromData({data: {c: 'd'}})

        it 'merges the data with the old data', ->
          expect(subject().data.a).toEqual('b')
          expect(subject().data.c).toEqual('d')

  describe '.delegate()', ->
    describe 'when an object is assigned as a delegate', ->
      delegate = undefined
      delegatedData = undefined

      beforeEach ->
        delegatedData = undefined
        delegate = {
          fromData: (args) ->
            delegatedData = args
        }
        newPlayer.delegate(delegate)

      describe 'and fromData is called with an object', ->
        obj = undefined
        data = undefined

        beforeEach ->
          data = {some: 'data'}
          obj = {data: data}
          newPlayer.fromData(obj)

        it 'passes the data into the delegate', ->
          expect(delegatedData.data).toEqual(data)

        it 'still stores the data', ->
          expect(newPlayer.toData().data).toEqual(data)

      describe 'and a second object is assigned as a delegate', ->
        secondDelegate = undefined
        secondDelegatedData = undefined

        beforeEach ->
          secondDelegate = {
            fromData: (args) ->
              secondDelegatedData = args
          }
          newPlayer.delegate(secondDelegate)

        describe 'and fromData is called with an object', ->
          obj = undefined
          data = undefined

          beforeEach ->
            data = {some: 'data'}
            obj = {data: data}
            newPlayer.fromData(obj)

          it 'passes the data into both delegates', ->
            expect(delegatedData.data).toEqual(data)
            expect(secondDelegatedData.data).toEqual(data)

          it 'still stores the data', ->
            expect(newPlayer.toData().data).toEqual(data)

describe 'dataDrivenComponent', ->
  beforeEach ->
    clearSubject()

  describe 'for a Crafty-style entity', ->
    receivedData = undefined

    beforeEach ->
      receivedData = undefined
      subject ->
        entity = dataDrivenComponentFactory()
        entity.init()
        entity

    describe 'when fromData is called with some data', ->
      beforeEach ->
        subject().fromData({data: {it: 'works'}})

      it 'is stored in the component', ->
        expect(subject().toData().data.it).toEqual('works')

    describe 'when delegating to another dataNode', ->
      dataNode = undefined

      beforeEach ->
        dataNode = playerManagerFactory().create()
        subject().delegate(dataNode)
        subject().fromData({data: {some: 'thing'}})

      it 'sends the data to the node', ->
        expect(dataNode.toData().data.some).toEqual('thing')

    describe 'when delegated to by another dataNode', ->
      dataNode = undefined

      beforeEach ->
        dataNode = playerManagerFactory().create()
        dataNode.delegate(subject())
        dataNode.fromData({data: {an: 'iota'}})

      it 'receives data received by the dataNode', ->
        expect(subject().toData().data.an).toEqual('iota')