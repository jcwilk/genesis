INSTALL
=======

You need to install nodejs and ought to install npm.

node: http://nodejs.org/
npm: http://npmjs.org/

All node dependencies are listed (some with loose versions) in package.json. The packages should be able to be required without installing via npm since they're checked in under ./node_modules/ and that path is unshifted into load paths. If not, give it the old `npm install`. 

To run the app, you'll need the foreman gem (yeah, it's weird that it's a gem, but it's how github suggests running it locally) then just do `foreman start` and open localhost:5000 (or whatever port it says). Try opening it in different browsers/tabs and seeing the websockets magic in action.

Also, this now works on heroku. Just run something like the following commands to get it up and running: (will make a raketask for this soon)

	heroku create --stack cedar
	git push heroku master
	heroku ps:scale web=1
	heroku logs (look for "State changed from starting to up" at the end)
	heroku open (or just go to the url in your web browser from the output of those commands)

Note: AFAIK heroku doesn't currently support websockets so I have it limited to xhr long polling, which as long as you're not continuously streaming data isn't bad at all. I could imagine it having a noticable impact on a sketchy connection like mobile though.

Known bugs:
- Doesn't get past "Loading" on a Samsung Galaxy S2
- If a window is left alone for a long time it eventually gets confused about which character is which, or at least about which sprite set they are
- When joining existing players, the existing players appear stacked in the center to the new player until they move

Features coming soon:
- Collision detection
- Server side room data
- Chat
- Server side tracking of player positions (rather than just rebroadcasting and discarding)
- Scrolling map rather than static room
- Server side heuristics to detect cheaters (specifically, forging your location)
- Hazards/Death/Respawning

Planned delegation to a rails server:
- Player persistence
- Movement validation (anti cheat)
- Entity tracking (mobs, items, etc)
- Admin interface for editing rooms
- Player cookie-based authentication
- Limit information to line of sight

Special thanks
- Lucas Nasif ( http://lucasnasif.com/ ) for the idea and implementation of combining socket.io with craftyjs. This is his project that I've, at least for the time being, picked up and as you can see from above, have great ambitions for :D