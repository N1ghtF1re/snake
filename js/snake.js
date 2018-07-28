// CONSTANTS: 

// FIELD SIZES
var HOR_COUNT = 20
var VERT_COUNT = 20


// DIRRECTIONS 
var DIR_TOP = 1
var DIR_BOTTOM = 2
var DIR_LEFT = 3
var DIR_RIGHT = 4

// VIRTUAL KEYS
var VK_UP = 38
var VK_DOWN = 40
var VK_LEFT = 37
var VK_RIGHT = 39
var VK_W = 87
var VK_S = 83
var VK_A = 65
var VK_D = 68
var VK_SPACE = 32



// MOVING TIMEOUT (ms):
var MOVE_TIMEOUT = 60

// STRING:
var STR_SCORES = 'Scores: '

// BOOOL CONST
var IS_EDGES_OBST = true // Obstacles at the edges

// OBSTACLE ARRAY:
var ARR_OBSTACLES = [{'x':10,'y':10}, {'x':10, 'y':9}, {'x':10,'y':8}, {'x':9, 'y':10}, 
					{'x':8, 'y':10}, {'x':5, 'y':5}, {'x':6, 'y':5}, {'x':7,'y':5},
					{'x':15,'y':15}, {'x':15, 'y':16}, {'x':15, 'y':17}]




// CLASSES:

/** Each cell of the field is a div block of cells class 
	
	Additional cell classes:

	's' - Snake cell
	'a' - Apple cell
	'o' - Obstacle cell
**/


// The main game class - the field class
let Field = class {

	constructor(field, y_size, x_size) {
		// GENERATE NEW FIELD
		for(let i = 0; i < y_size; i++) {
			for(let j=0; j < x_size; j++) {

				let newCell = document.createElement('div');
				newCell.className = 'cell ' + j + '_' + i 
				if ( IS_EDGES_OBST && ((i % (VERT_COUNT-1) == 0) || (j % (HOR_COUNT-1) == 0))) {
					newCell.className += ' o' // Along the edges of the obstacle
				}
				newCell.setAttribute('x',j)
				newCell.setAttribute('y',i)

				field.appendChild(newCell);
			}

			let delimiter = document.createElement('br'); // After 20 cells - delemiter (new line)
			field.appendChild(delimiter);
		}


		let scores = document.createElement('div') // Scores counter
		scores.innerText = STR_SCORES + '0' 
		scores.className = 'scores'
		field.appendChild(scores)
		this.scoresEl = scores
		this.scores = 0

		this.field = field // field DOM element

		this.drawAdditionalObstacles() 

		// GAME OBJECTS: 
		this.apple = new Apple(this) // CREATE NEW APPLE-OBJECT
		this.snake = new Snake(this) // CREATE NEW SNAKE-OBJECT

	}

	drawAdditionalObstacles() {
		for(let i = 0; i < ARR_OBSTACLES.length; i++) {
			let obstacle = ARR_OBSTACLES[i]
			console.log(obstacle.x)
			this.redrawCell(obstacle.x, obstacle.y, 'o')
		}
	}
	retry() {
		let cells = this.field.getElementsByClassName('cell')
		for (let i = 0; i < cells.length; i++) {
			let x = cells[i].getAttribute('x')
			let y = cells[i].getAttribute('y')
			cells[i].className =  'cell ' + x + '_' + y 
			if( IS_EDGES_OBST && ((x % (HOR_COUNT-1) ==0) || (y % (VERT_COUNT-1)  == 0))){
				cells[i].className += ' o'
			} 
		}
		this.drawAdditionalObstacles()
		this.scores = 0
		this.scoresEl.innerText = STR_SCORES + '0'

		this.field.className = ''

		// New game-objects
		this.apple = new Apple(this) 
		this.snake = new Snake(this) 
	
	}

	incScores() {
		this.scoresEl.innerText = STR_SCORES + ++this.scores
	}

	gameOver() {
		clearInterval(this.snake.moveInterval) // Stop move-timer
		let cells = this.field.getElementsByClassName('cell') 
		for(let i = 0; i < cells.length; i++) {
			cells[i].className = 'cell gameover' // Set class 'gameover' for all cells
		}
		this.field.className = 'end'
		this.snake = null
		this.apple = null

	}

	choiceAction(cell) { // The choice of action depending on the cell that you stumbled upon
  		switch(cell) {
  			case 'a': 
  				this.apple.generate()
  				this.incScores()
  				break
  			case 'o':
  				this.gameOver()
  				break
  			case 's':
  				this.gameOver()
  				break
  			case 'n':
  				break
  		}
  	}

	// Returns the div object of the cell with the coordinates x, y
	getCell(x,y) {
		return this.field.getElementsByClassName(x + '_' + y)[0]
	}

	// Change the "belonging" of the cell (reassign classes)
	redrawCell(x,y, needClasses = '') {
		let cell = this.getCell(x,y)
		cell.className = 'cell ' + x + '_' + y + ' ' + needClasses
	}

	// Returns true if the cell does not have a snake / obstacle / apple / ...
	isCellEmpty(x,y) {
		let cell = this.getCell(x, y)

		if(cell.classList.contains('s')) { // Cell have snake
			return false
		}
		if(cell.classList.contains('o')) { // Cell have obstacle
			return false
		}
		if(cell.classList.contains('a')) { // Cell have obstacle
			return false
		}
		return true
	}

	// Returns main cell class (snake/obstacle/apple/none)
	getOwnClass(x,y) {
		let cell = this.getCell(x, y)
		if(cell.classList.contains('s')) { // Cell have snake
			return 's'
		}
		if(cell.classList.contains('o')) { // Cell have obstacle
			return 'o'
		}
		if(cell.classList.contains('a')) { // Cell have obstacle
			return 'a'
		}
		return 'n' // Nothing is in the cell
	}

	onKeyDown(e) {
		let k = e.keyCode;
		let snake = this.snake
		
		if(snake == null) { // if snake == null => GAME OVER
			if(k == VK_SPACE) {this.retry()}
			return false
		}
		let d = snake.getDirection() // Curr Direction

		if ((k == VK_RIGHT || k == VK_D) && d != DIR_LEFT) {snake.changeDirection(DIR_RIGHT)} 
		if ((k == VK_DOWN || k == VK_S) && d != DIR_TOP) {snake.changeDirection(DIR_BOTTOM)} 
		if ((k == VK_LEFT || k == VK_A) && d != DIR_RIGHT) {snake.changeDirection(DIR_LEFT)}; 
		if ((k == VK_UP || k == VK_W) && d != DIR_BOTTOM) {snake.changeDirection(DIR_TOP)}; 
	}
}

let Apple = class {
	constructor(ParentField) {
		this.pfield = ParentField
		this.x = 0
		this.y = 0
		this.generate()
	}
	generate() {
		this.x = getRandomInt(0, HOR_COUNT)
		this.y = getRandomInt(0, VERT_COUNT)
		if (!this.pfield.isCellEmpty(this.x, this.y)) { 
			this.generate() // There is something in the cell => regenerate coords
		} else {
			this.draw() // Drawing an apple
		}

	}
	draw(){
		this.pfield.redrawCell(this.x, this.y, 'a')
	}

}


let Snake = class {
	constructor(ParentField) {
    	this.direction = DIR_BOTTOM; // Direction of movement of snake
    	this.body = [{'x':1,'y':3}, {'x':1,'y':2}, {'x':1,'y':1}]
    	this.pfield = ParentField // Parent field object
    	var self = this;
    	this.moveInterval = setInterval(function () { self.move() }, MOVE_TIMEOUT);
    	
    	this.draw() // Draw a snake
  	}
  	draw() {
  		for(let i = 0; i < this.body.length; i++) {
  			let SnakeCell = this.body[i]
  			this.pfield.redrawCell(SnakeCell.x, SnakeCell.y,'s') // Make the cell a snake cell
  		}
  	}
  	changeDirection(direction) {
  		this.direction = direction 
  	}
  	getDirection() {
  		return this.direction
  	}

  	
  	move() {
  		// Get tail:
  		let tail = this.body[this.body.length-1]
  		
  		let head = {'x':0, 'y':0} // Copy of old head
  		head.x = this.body[0].x 
  		head.y = this.body[0].y

  		switch(this.direction) {
  			case DIR_TOP:
  				head.y -= 1
  				break
  			case DIR_BOTTOM:
  				head.y += 1
  				break
  			case DIR_LEFT:
  				head.x -= 1
  				break
  			case DIR_RIGHT:
  				head.x += 1

  		}

  		// If there are no obstacles along the edges => cyclic movement
  		head.x = head.x % HOR_COUNT
  		head.y = head.y % VERT_COUNT
  		if (head.x == -1){head.x = HOR_COUNT-1}
  		if (head.y == -1){head.y = VERT_COUNT-1}

  		this.body.unshift(head) // New head (first element)

  		let oldCellClass = this.pfield.getOwnClass(head.x, head.y) // Old cell coloring
  	
  		this.pfield.redrawCell(head.x, head.y, 's') // Make the new head-cell a snake cell

  		if (oldCellClass != 'a') { // If not apple-cell
  			this.body.pop() // Remove tail
  			this.pfield.redrawCell(tail.x, tail.y) // Recolor the cell in the default color
  		} // if apple-cell => + 1 snake-cell => not delete tail

  		this.pfield.choiceAction(oldCellClass)
  	}


}

// Additional function
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}