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
        totalPIeces: 0,
    };

    loadSettings();
    initSettings();
    
    function loadSettings() {
        document.getElementById("boardWidth").value      = settings.boardWidth;
        document.getElementById("boardHeight").value     = settings.boardHeight;
        document.getElementById("gameDifficulty").value  = settings.gameDifficulty;
        document.getElementById("gameFirstPlayer").value = settings.firstPlayer;
    }

    function initSettings() {
		document.getElementById("playGame").onclick = function(){
			settings.boardWidth  = clamp(parseInt(document.getElementById("boardWidth").value), 1, 10);
			settings.boardHeight = clamp(parseInt(document.getElementById("boardHeight").value), 1, 10);
			settings.firstPlayer = parseInt(document.getElementById("firstPlayer").value);
			settings.difficulty  = parseInt(document.getElementById("difficulty").value);

			loadSettings();
			clearBoard(0, 0, createBoard);
		}
		document.getElementById("resetSettings").onclick = function(){
			localStorage.setItem("fourinarow-settings", JSON.stringify(defaultSettings));
			loadSettings();
			initSettings();
			document.getElementById("toggleSettings").click();
			localStorage.removeItem("fourinarow-save");
			saveSettings();
			clearBoard(0, 0, createBoard);
		}
		document.getElementById("toggleSettings").onclick = function(){
			if (document.getElementById("settingsCollapsable").style.display == "none")
				document.getElementById("settingsCollapsable").style.display = "";
			else
				document.getElementById("settingsCollapsable").style.display = "none";
		}
	}

    createBoard();
    
}



function login() {
    // Login details aren't saved yet
    var login_section = document.getElementById("login-section");
    var game_div  = document.getElementById("game");

    login_section.style.display = "none"; 
    game_div.style.display  = "block";
 
}

function connect4(width, height) {

    if (gameStarted)
        return;

    gameStarted = true;

    var base = document.getElementById("tabuleiro");
    var pilha = document.getElementById("pilha");
    var slot = document.getElementById("vazio");
    var board = document.getElementById("board");

    board.width = width * 25;
    board.height = height * 25;

    for(i = 0; i < height; i++) {
        var s = slot.cloneNode(false);
        pilha.appendChild(s);
    }
    for(i = 0; i < width; i++) {
        var p = pilha.cloneNode(true);
        base.appendChild(p);
    }
}

function clamp(x, min, max) {
    return max(x, min(x, max));
}