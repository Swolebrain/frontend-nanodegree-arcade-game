/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

module.exports = function(global, {player, allEnemies, Player, Gem}) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
	var initialized = false;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
	ctx.font = '24px Georgia';

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
		 ctx.clearRect(0,0,canvas.width, canvas.height);
		 ctx.strokeRect(0,0,canvas.width, canvas.height);
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {

        reset();
        lastTime = Date.now();
		/*When not initialized, I'm gonna run a different game loop for
		the start menu. This code is at the end of this file.*/
		if (!initialized)
			startMenu();
		else
        	main(); //Game engine is initialized (char has been chosen), run main game loop
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (player.dead) {
			reset();
			player.dead = false;
		}
		//generate a random gem/powerup 2% of the time
		//whenever there's no powerup already active and
		if (!powerup){
			if (Math.random() < 0.02){
				var clr = Math.random();
				if (clr < 0.33)
					powerup = new Gem(Math.random()*(canvasWidth-100), Math.random()*(canvasHeight-200)+25,
									0,'images/gem-blue.png');
				else if (clr < 0.66)
					powerup = new Gem(Math.random()*(canvasWidth-100), Math.random()*(canvasHeight-200)+25,
									0,'images/gem-green.png');
				else
					powerup = new Gem(Math.random()*(canvasWidth-100), Math.random()*(canvasHeight-200)+25,
									0,'images/gem-orange.png');
			}
		}
		else{
			powerup.update();
		}
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/grass-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/stone-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }


        renderEntities();

		if (powerup) powerup.render();
		ctx.fillText("Score: "+player.score, 20, 20);
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
		if (player) player.reset();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-flipped.png',
        'images/char-boy.png',
        'images/char-boy2.png',
		'images/menu.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png',
		'images/arrow.png',
		'images/gem-blue.png',
		'images/gem-green.png',
		'images/gem-orange.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
	global.canvasWidth = canvas.width;
	global.canvasHeight = canvas.height;


	//Object to hold x. y position of where the character selection arrow
	//will be drawn
	var arrowLoc = {x: 14, y: 100};
	/* 	Menu loop.
	*
	*/
	function startMenu(){
		//Rectangles that enclose each of the characters
		//if mouse is moved onto them, the arrow will move to
		//point to the correct character. If mouse is clicked
		//on these rectangles, the appropriate character will
		//be chosen and the game will start
		var girl1Rect = {x1: 20, y1: 196, x2: 85, y2: 258};
		var girl2Rect = {x1: 216, y1: 196, x2: 281, y2: 258};
		var girl3Rect = {x1: 406, y1: 196, x2: 471, y2: 258};
		var boy1Rect = {x1: 126, y1: 452, x2: 191, y2: 514};
		var boy2Rect = {x1: 346, y1: 452, x2: 411, y2: 514};
		/* 	Function to determine whether a given x,y position
		*	on the canvas is inside a rectangle of this kind
		*/
		function isInside(pos, rect){
			return pos.x < rect.x2 && pos.x > rect.x1 && pos.y > rect.y1 && pos.y < rect.y2;
		}

		/*	Click Event handler. If one of the character rectangles is clicked, the player
		*	object is instantiated and the game is initialized.
		*/
		var onclick = function(e){
			var pos = getMousePos(e);
			if (isInside(pos, girl1Rect)) player = new Player('images/char-cat-girl.png', 15, 600);
			else if (isInside(pos, girl2Rect))  player = new Player('images/char-horn-girl.png', 20, 700);
			else if (isInside(pos, girl3Rect))  player = new Player('images/char-pink-girl.png', 25, 900);
			else if (isInside(pos, boy1Rect))  player = new Player('images/char-boy.png', 10, 500);
			else if (isInside(pos, boy2Rect)) player = new Player('images/char-boy2.png', 5, 700);
			if (player){
				initialized = true;
				canvas.removeEventListener('click', onclick);
				canvas.removeEventListener('mousemove', onmousemove);
				init();
			}
		};
		canvas.addEventListener('click', onclick);

		/*	Mouse move handler. If one of the character rectangles is moused over,
		*	that character will be highlighted by an arrow
		*/
		var onmousemove = function(e){
			var pos = getMousePos(e);
			if (isInside(pos, girl1Rect)) arrowLoc = {x: 14, y: 100};
			else if (isInside(pos, girl2Rect)) arrowLoc = {x: 210, y: 100};
			else if (isInside(pos, girl3Rect)) arrowLoc = {x: 400, y: 100};
			else if (isInside(pos, boy1Rect)) arrowLoc = {x: 120, y: 358};
			else if (isInside(pos, boy2Rect)) arrowLoc = {x: 340, y: 358};

		};
		canvas.addEventListener('mousemove', onmousemove);

		menuLoop();


	}
	/*	Menu rendering Loop. Just draws the bg image,
	*	chracters, and also draws the arrow at the
	*	position based on the results of mousemove handler
	*/
	function menuLoop(){
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.strokeStyle = "#FFF";
		var menu = Resources.get('images/menu.png');
		var girl1 = Resources.get('images/char-cat-girl.png');
		var girl2 = Resources.get('images/char-horn-girl.png');
		var girl3 = Resources.get('images/char-pink-girl.png');
		var boy1 = Resources.get('images/char-boy.png');
		var boy2 = Resources.get('images/char-boy2.png');
		var arrow = Resources.get('images/arrow.png');
		ctx.drawImage(menu, 0, 0);
		ctx.drawImage(arrow, arrowLoc.x, arrowLoc.y);
		ctx.drawImage(girl1, 4, 124);
		ctx.drawImage(girl2, 200, 124);
		ctx.drawImage(girl3, 390, 124);
		ctx.drawImage(boy1, 110, 380);
		ctx.drawImage(boy2, 330, 380);

		//if a character has been clicked, stop running this menu rendering loop
		if (initialized)
			return;
		else	//keep running menu rendering loop
			requestAnimationFrame(menuLoop);
	}

	/*	Translates client mouse coordinates into
	*	coordinates relative to canvas
	*/
	function getMousePos(e){
		var rect = canvas.getBoundingClientRect();
		return {x: e.clientX - rect.left, y: e.clientY -rect.top};
	}


};
