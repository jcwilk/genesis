var playerManagerFactory = require('../playerManager').playerManagerFactory;

describe('playerManager', function(){
  var _subject,
      _subject_return,
      _subject_ran,
      subject = function(f){
        if(f){
          _subject = f;
        } else {
          if(_subject === undefined) throw('no subject defined!');
          if(_subject_ran) return _subject_return;
          _subject_ran = true;
          return (_subject_return = _subject());
        }
      }

  var man;

  beforeEach(function(){
    _subject = _subject_return = _subject_ran = undefined;
    man = playerManagerFactory();
  });

  describe('.create',function(){
    var newPlayer;

    var pickNewPlayer = function(){
      newPlayer = man.create();
    }

    it('autoincrements the id',function(){
      pickNewPlayer();
      expect(newPlayer).toEqual(0);
      pickNewPlayer();
      expect(newPlayer).toEqual(1);
    });
  });

  describe('.destroy',function(){
    var player;

    describe('for the list of players',function(){
      beforeEach(function(){
        subject(function(){
          return man.all();
        });

        player = man.create();
      })

      it('does not include destroyed players',function(){
        man.destroy(player);
        expect(subject()).not.toContain(player);
      });
    });
  });

  describe('.all',function(){
    beforeEach(function(){
      subject(function(){
        return man.all();
      });
    });

    describe('with no players',function(){
      it('is empty',function(){
        expect(subject().length).toEqual(0);
      });
    });

    describe('with a player added',function(){
      var player;

      beforeEach(function(){
        player = man.create();
      })

      it('contains the player',function(){
        expect(subject()).toContain(player);
      });
    });
  });
});