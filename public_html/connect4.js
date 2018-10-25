window.onload = function () {

    var defaults = {
        boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
		playerColors: [
			"#FF0000",
			"#0000FF"
		],
		winColor: "#FFFF00",
    }

    var settings = {
		boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
	};

    var status = {
        board: [],
        player: 1,
        gameStarted: false,
        totalPieces: 0,
    };

    loadSettings(defaults);
    init();
    createBoard(settings.boardWidth, settings.boardHeight);   

    function init() {
        // TODO: seperate functions 

        document.getElementById("login-button").onclick = function() {
            
            let username = document.getElementById("username-box").value;
            let password = document.getElementById("password-box").value;

            // verification not implemente yet 

            let login    = document.getElementById("login-section");
            let settings = document.getElementById("side");
            let game     = document.getElementById("board");
            

            login.style.display = "none"; 
            settings.style.display = "block"
            game.style.display  = "block";

        }

        document.getElementById("playGame").onclick = function(){
            settings.boardWidth  = clamp(parseInt(document.getElementById("boardWidth").value), 1, 10);
            settings.boardHeight = clamp(parseInt(document.getElementById("boardHeight").value), 1, 10);
            settings.firstPlayer = parseInt(document.getElementById("firstPlayer").value);
            settings.difficulty  = parseInt(document.getElementById("difficulty").value);

            loadSettings(settings);
            clearBoard();
            createBoard();
            play();
        }
        
        document.getElementById("resetSettings").onclick = function() {
            settings = defaults;
            loadSettings(defaults);
        }
    }
    
    function loadSettings(table) {
        document.getElementById("boardWidth").value  = table.boardWidth;
        document.getElementById("boardHeight").value = table.boardHeight;
        document.getElementById("difficulty").value  = table.difficulty;
        document.getElementById("firstPlayer").value = table.firstPlayer;
    }
    
    function clearBoard() {
        status.board = [];
    }

    function createBoard(width, height) {
        let board = document.getElementById("board");

        let table = document.createElement("table");

        // Initialize game board
        for(let i = 0; i < width; i++) {
            let column = [];
            for (let j = 0; j < height; j++) {
				column.push(0);
			}
			status.board.push(column);
        }

        // Create HTML board
        for(let i = 0; i < height; i++) {
            let tr = document.createElement("tr");
			for (let j = 0; j < width; j++){
				let td = document.createElement("td");
				tr.appendChild(td);
			}
			table.appendChild(tr);
        }

        // Events
        
        table.onclick = function(e){
			columnDrop(e.target.cellIndex);
			e.preventDefault();
        }
        
        table.onmouseover = function(e) {
            unhighlightColumn();
            highlightColumn(e.target.cellIndex)
            e.preventDefault
        }

        table.onmouseleave = function(e) {
            unhighlightColumn();
            highlightColumn(e.target.cellIndex)
            e.preventDefault
        }

        board.appendChild(table);
        resizeCells();
    }

    function resizeCells(){
		var windowWidth = window.innerWidth-status.board.length*3;
		var windowHeight = window.innerHeight-75-status.board[0].length*3;
		var w = Math.ceil(windowWidth / status.board.length);
		var h = Math.ceil(windowHeight / status.board[0].length);
		var shorterSide = (w < h ? w : h);
		var cells = document.getElementById("board").getElementsByTagName("td");
		for (var i = 0; i < cells.length; i++){
			cells[i].style.width = shorterSide+"px";
			cells[i].style.height = shorterSide+"px";
		}
		styleTokens();
	}

    function initGame() {
        status.totalPieces = 0;
        status.board = [];
        status.player = settings.firstPlayer;
        status.gameStarted = true;
    }

    function play() {
        initGame();
        
    }
    
    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }

}

