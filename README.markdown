## Genesis ##
The name of the project was chosen by its creator, Lucas Nasif, to suggest a grand beginning. This is an experiment of
combining [Crafty.js](http://craftyjs.com) and [Socket.IO](http://socket.io/) to make a dom/canvas only (no flash) form
of a simple MMO. Currently the features are extremely limited (you can only walk around in a room and see others walking)
but hopefully it will grow much beyond that. Your help would be appreciated towards that goal too. Feel free to file an issue, open a pull request, or to get in contact for help setting it up/deploying it/whatever. Note that this is currently entirely free (as in speech and beer, since it runs on heroku).

### Dev setup ###
You need to install nodejs and ought to install npm.

node: http://nodejs.org/
npm: http://npmjs.org/

All node dependencies are listed (some with loose versions) in package.json. All the dependencies are vendored in the
node_modules directory, as per convention for a deployed app. 

To run the app, you'll need the foreman gem (yeah, it's weird that it's a gem, but it's how github suggests running it
locally) then just do `foreman start` and open localhost:5000 (or whatever port it says). Try opening it in different browsers/tabs and seeing the websockets magic in action.

Also, this now works on heroku. Just run something like the following commands to get it up and running: (will make a raketask for this soon)

	heroku create --stack cedar
	git push heroku master
	heroku ps:scale web=1
	heroku logs (look for "State changed from starting to up" at the end)
	heroku open (or just go to the url in your web browser from the output of those commands)

#### Heroku limitations ####
- AFAIK heroku doesn't currently support websockets so I have it limited to xhr long polling, which, as long as
you're not continuously streaming data, isn't bad at all. I could imagine it having a noticable impact on a sketchy
connection like mobile though.
- The hiredis package cannot compile on heroku since it's missing the underlying library. This means you should be careful when updating the vendored dependencies as Socket.IO seems to try to include it by default. I deleted the hiredis folder as the Socket.IO code suggested it had a transparent fallback and now it seems to work fine... Though I would expect if I did an ```npm install``` again that it would put it right back.
- Heroku currently (AFAIK) limits you to 1000 connections. If that becomes a limiting factor though, I would consider that a non-problem problem, as Adam Carolla would say.


### Known bugs ###
- Doesn't get past "Loading" on a Samsung Galaxy S2
- If a window is left alone for a long time it eventually gets confused about which character is which, or at least about which sprite set they are
- When joining existing players, the existing players appear stacked in the center to the new player until they move


### Features coming soon ###
- Collision detection
- Server side room data
- Chat
- Server side tracking of player positions (rather than just rebroadcasting and discarding)
- Scrolling map rather than static room
- Server side heuristics to detect cheaters (specifically, forging your location)
- Hazards/Death/Respawning


### Planned delegation to a rails server ###
- Player persistence
- Movement validation (anti cheat)
- Entity tracking (mobs, items, etc)
- Admin interface for editing rooms
- Player cookie-based authentication
- Limit information to line of sight


### Testing ###
- Install jasmine-node
- ```jasmine-node --coffee spec```

### Pull request dogma ###
- Make a branch and get it in sync with master of this repo (either rebase or cherry pick)
- Include only the code you want to contribute on top of that
- Please thoroughly test the code before sending it over, either manually or, preferably, via automated test
- Send the pull request with a relatively detailed description of the whats and whys
- Thank you!


### Special thanks ###
- Lucas Nasif ( http://lucasnasif.com/ ) for the idea and implementation of combining socket.io with craftyjs. This is his project that I've, at least for the time being, picked up and as you can see from above, have great ambitions for :D