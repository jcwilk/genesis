playerManagerFactory = require("../lib/playerManager").playerManagerFactory

describe "playerManager", ->
  _subject = _subject_return = _subject_ran = undefined

  subject = (f) ->
    if f
      _subject = f
    else
      throw("no subject defined!") if !_subject
      if !_subject_ran
        _subject_ran = true
        _subject_return = _subject()
      return _subject_return

  man = undefined
  beforeEach ->
    _subject = _subject_return = _subject_ran = undefined
    man = playerManagerFactory()

  describe ".create", ->
    newPlayer = undefined
    pickNewPlayer = -> newPlayer = man.create()

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
          expect(subject()).toEqual(id: 20)

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

  describe ".destroy", ->
    player = undefined
    describe "for the list of players", ->
      beforeEach ->
        subject -> man.all()
        player = man.create()

      it "does not include destroyed players", ->
        man.destroy player
        expect(subject()).not.toContain player

  describe ".all", ->
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
        expect(subject()).toContain player

  describe ".findById", ->
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

  describe ".exists", ->
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

