/*****************************************************/
/* Server Logic                                      */
/*****************************************************/
var express = require('express'),
    app = express(),
//    port = 3700, // local version:    http://localhost:3700/     node pong_local.js
    port = 80,     // online version:   103....       NODE_ENV=production PORT=80 grunt
                   //  104.131.6.162:3700/
    io = require('socket.io').listen(app.listen(port), { log: false });

//App Config
app.set('views', __dirname + '/views')
   .engine('html', require('ejs').renderFile)
   .use(app.router)
   .use(express.static(__dirname + '/public'))
   .get('/', function (req, res) {
    	res.render('index.html');
   }).get('/chat', function (req, res) {
    	res.render('chat.html');
   });

/*****************************************************/
/* Application Logic                                 */
/*****************************************************/

//Paddle Class
function paddle(){
	this.w = 22;
	this.h = 120;
	this.x = this.w * 2;
	this.y = Math.round(canvas.h/2 - this.h/2);
	this.s = 5;
}

//Manage Game Mechanics
function gameStart(){
	io.sockets.emit('dialog', {"action":"hide"});
	console.log('GAME START!!!!');
	gint = setInterval(gameMove, 33);
}
function gameStop(name){
	io.sockets.emit('dialog', {"msg":"\""+name+"\" got away....", "action":"show"});
	console.log('GAME STOP!!!!');
	clearInterval(gint);
}
function gameMove(){
	var isCollide = ballMove(), //Move ball
	    lp        = players[players.left],
	    rp        = players[players.right],
	    obj       = {};

	if(lp && rp) {
		//If Cheatmode enabled, bloat Ball!
		if(cheatMode && players[cheatMode].paddle.h + 40 < canvas.h) players[cheatMode].paddle.h += 10;

		obj = {"ball":ball, "paddle":lp.paddle, "oppPaddle":rp.paddle, "score":[lp.score, rp.score], "collide": isCollide};
		io.sockets.in('players').emit('game', obj);
		io.sockets.in('observers').volatile.emit('game', obj);
	}
}
function score(who){
	players[who].score++;
	ball = defaultBall();
}
function defaultBall(){
	return {
		w :30,
		h :30,
		x :Math.round(canvas.w/2 - 15), //minus half of width
		y :Math.round(canvas.h/2 - 15), //minus half of height
		s :12 * (Math.round(Math.random())==1?1:-1),
		sy:12 * (Math.round(Math.random())==1?1:-1)
	};
}
function ballMove(){
	var B  = ball,
	    lp = players[players.left],
	    rp = players[players.right],
			c  = false;

	B.x += B.s;
	B.y += B.sy;

	//Check x position against table
	if(B.x+B.w > canvas.w) score(players.left);
	else if(B.x < 0) score(players.right);

	//Check y position against table
	if(B.y+B.h > canvas.h) {
		B.y -= B.sy;
		B.sy *= -1;
	} else if(B.y < 0) {
		B.sy *= -1;
		B.y += B.sy;
	}

	//Check ball against paddles
	if(boxCollision(ball, lp.paddle)) {
		c = 0;
		B.s *= -1;
		if(B.s > 0) B.s += 2;
		else B.s -= 2;
	} else if(boxCollision(ball, rp.paddle)) {
		c = 1;
		B.s *= -1;
		if(B.s > 0) B.s += 2;
		else B.s -= 2;
	}

	return c;
}
function boxCollision(B, P){
	if((B.x <= P.x + P.w && B.x + B.w >= P.x) || (B.x + B.w >= P.x && B.x <= P.x + P.w)) {
    	if(B.y <= P.y + P.h && B.y + B.h >= P.y) return true;
	}
	return false;
}
function paddleMove(dir, pid){
	var p = players[pid].paddle;

	switch(dir) {
		case 'u': //Up Button
			p.y -= p.s;
			if(p.y < 0) p.y = 0;
			break;
		case 'd': //Down Button
			p.y += p.s;
			if(p.y > canvas.h - p.h) p.y = canvas.h - p.h;
			break;
	}
}

//Canvas Object
var canvas = {w:1920, h:1080},

//Cheat mode stores the Socket of the player who's "cheating"
cheatMode = false,

//Players Object
players = {length:0, left:false, right:false},

//Ball Object
ball = defaultBall(),

//Game Interval
gint;

//Socket.IO
io.sockets.on('connection', function (socket){
	//Global Welcome Message
	socket.emit('console', "Welcome to Pong! We're working on connecting you to the game!");

	//Set default socket name to socket.id
	socket.set('name', socket.id);

	//Limit server to two players
	if(players.length < 2) {
		players[socket.id] = {
			"score" :0,
			"paddle":new paddle(),
			"socket":socket
		};
		players.length++;
		if(!players.left) {
			players.left = socket.id;
			socket.emit('dialog', {"msg":"You're playing on the left side!", "action":"show"});
		} else {
			players.right = socket.id;
			players[socket.id].paddle.x = canvas.w - players[socket.id].paddle.w * 3;
			socket.emit('dialog', {"msg":"You're playing on the right side!", "action":"show"});
		}

		//Player Room - leave observers if this socket was a part of this group
		socket.leave('observers');
		socket.join('players');

		//Start the game if we have two players
		if(players.length == 2) {
			io.sockets.emit('dialog', {"msg":"Both players ready, starting game in about 5 seconds!", "action":"show"});
			setTimeout(gameStart, 5000);
		}
		else socket.emit('dialog', {"msg":"We're still waiting on another player!", "action":"show"});
	} else {
		socket.emit('dialog', {"msg":"Sorry, the room is full, feel free to stick around and watch the match!", "action":"show"});
		socket.join('observers');
	}

	//When the client 'sends" data to the server
	socket.on('receive', function (data) {
		//Set Game Dimensions for user
		if(data === 'get_dimensions') socket.emit('game', {"canvas":canvas});
		//Handle Chat Stuff
		else if(data.action && data.action == "chat") {
			var d = new Date();
			socket.set('name', data.name.replace(/<(?:.|\n)*?>/g, ''));
			// INVINCIBLE: if string matchs
			if(players[socket.id] && data.msg == '|BLOAT-PADDLE|' && !cheatMode) cheatMode = socket.id;
			io.sockets.emit('message', '<b>'+data.name.replace(/<(?:.|\n)*?>/g, '')+'</b> <small>['+d.toLocaleTimeString()+']</small>'+data.msg.replace(/<(?:.|\n)*?>/gm, ''));
		}
		//Process User's Up/Down Key Information
		else if(data.keys){
			//Up Key Pressed
			if(data.keys.k38 === true) paddleMove('u', socket.id);
			if(data.keys.k40 === true) paddleMove('d', socket.id);
		}
	});

	socket.on('disconnect', function () {
		//Stop the game
		socket.get('name', function(err, val) {

			//Remove player from left/right property
			if(players.left == socket.id){
				players.left = false;
				if(players.right) {
					players[players.right].score = 0;
					players[players.right].paddle = new paddle();
					players[players.right].paddle.x = canvas.w - players[players.right].paddle.w * 3;
				}
				stopGamePlayerLeft();
			} else if(players.right == socket.id) {
				players.right = false;
				if(players.left) {
					players[players.left].score = 0;
					players[players.left].paddle = new paddle();
				}
				stopGamePlayerLeft();
			}

			//Function to be called if a player leaves
			function stopGamePlayerLeft() {
				gameStop(val);

				//Remove player from players object
				delete players[socket.id];

				//Reduce player length
				players.length--;
			}
		});
	});
});