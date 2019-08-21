const io = require('socket.io')()

let draw = null
let word = null
let difficulty = 0
let points = 0
const players = {'one': null, 'two': null}
let player = 'one'
let canContinue = false
let wordGuessed = false;


function reset() {
  draw = null
  word = null
  difficulty = 0
  points = 0
  players['one'] = null
  players['two'] = null
  player = 'one'
  canContinue = false;
  wordGuessed = false;
}

io.on('connection', function (socket) {
  if (players['one'] == null) {
    players['one'] = socket
    socket.emit('user', 'one')
  } else if (players['two'] == null) {
  	// When second player joins, the game starts and the turn is for the first player
    players['two'] = socket
    socket.emit('user', 'two')
    io.emit('turn', 'one')
  } else {
    socket.disconnect()
  }

  socket.on('disconnect', function () {
    if (players['one'] === socket) {
      players['one'] = null
    } else if (players['two'] === socket) {
      players['two'] = null
    }
  })

  socket.on('word', function(wordChosen) {
  	word = wordChosen;
  	io.emit('wordReceived', wordChosen);
  })

  socket.on('difficulty', function(difficultyChosen) {
  	difficulty = difficultyChosen
  })

  socket.on('wordGuessing', function(wordGuessing) {
  	if(wordGuessing === word) {
  		points += difficulty
  		notGuessed = false;
  		io.emit('wordGuessed', points)
  	} else {
  		notGuessed = true;
  		io.emit('notGuessed')
  	}
  })

  socket.on('draw', function (urlDraw) {
    // Toggle the player
    player = player === 'one' ? 'two' : 'one'
    io.emit('turn', player)

    io.emit('drawReceived', urlDraw)
  })

  socket.on('continue', function(user) {
  	// Var 'canContinue' used to wait both players to click continue
  	if(canContinue) {
  		// If word is not guessed, the player who drawed, draws again
  		if(notGuessed) {
  			player = player === 'one' ? 'two' : 'one'
        notGuessed = false;
  		}
  		io.emit('turn', player)
  		canContinue = false
  	} else {
  		canContinue = true
  	}
  })
})

reset()
const port = 1337
io.listen(port)
console.log('Listening on port ' + port + '...')