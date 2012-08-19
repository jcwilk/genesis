playerManagerFactory = require("../playerManager").playerManagerFactory
describe "playerManager", ->
  _subject = undefined
  _subject_return = undefined
  _subject_ran = undefined

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
    pickNewPlayer = ->
      newPlayer = man.create()

    it "autoincrements the id", ->
      pickNewPlayer()
      expect(newPlayer).toEqual 0
      pickNewPlayer()
      expect(newPlayer).toEqual 1

  describe ".destroy", ->
    player = undefined
    describe "for the list of players", ->
      beforeEach ->
        subject ->
          man.all()

        player = man.create()

      it "does not include destroyed players", ->
        man.destroy player
        expect(subject()).not.toContain player

  describe ".all", ->
    beforeEach ->
      subject ->
        man.all()

    describe "with no players", ->
      it "is empty", ->
        expect(subject().length).toEqual 0

    describe "with a player added", ->
      player = undefined
      beforeEach ->
        player = man.create()

      it "contains the player", ->
        expect(subject()).toContain player

