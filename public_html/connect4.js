/*
for(let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
        console.log(cells[j+","+i]);
    }
}*/

window.onload = function () {

    var defaults = {
        boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
    }

    var settings = {
        boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
    };

    var status = {
        board: new Array(),
        columnHeight: new Array(),
        player: 1,
        active: false,
        totalPieces: 0,
    };

    var colors = ["red","yellow"];

    loadSettings(defaults);
    init();
    createBoard(settings.boardWidth, settings.boardHeight);   
    play();

    function init() {
        // TODO: seperate functions 

        document.getElementById("login-button").onclick = function() {
            let username = document.getElementById("username-box").value;
            let password = document.getElementById("password-box").value; 
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
            createBoard(settings.boardWidth, settings.boardHeight);
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
        document.getElementById("board").innerHTML = "";
        status.board = new Array();
        status.columnHeight = new Array();
        cells = {};
    }

    function createBoard(width, height) {
        let board = document.getElementById("board");
        let table = document.createElement("table");
        
        clearBoard();

        // Initialize game board
        for(let x = 0; x < width; x++) {
            status.columnHeight[x] = 0;
            status.board[x] = new Array();
            for (let y = 0; y < height; y++) {
				status.board[x].push(0);
			}
        }

        // Create HTML board
        for(let y = 0; y < height; y++) {
            let tr = document.createElement("tr");
			for (let x = 0; x < width; x++) {
				let td = document.createElement("td");
                tr.appendChild(td);
                cells[x+","+(settings.boardHeight-1-y)] = td;
			}
			table.appendChild(tr);
        }

        // Events
        table.onclick = function(e){
			columnDrop(e.target.cellIndex);
			e.preventDefault();
        }
        /*
        table.onmouseover = function(e) {
            unhighlightColumn();
            highlightColumn(e.target);
            e.preventDefault();
        }

        table.onmouseleave = function(e) {
            unhighlightColumn();
            highlightColumn(e.target.cellIndex)
            e.preventDefault();
        }*/

        board.appendChild(table);
        resizeCells();
    }

    function resizeCells(){
        let windowWidth  = window.innerWidth;
        let windowHeight = window.innerHeight - 75; // hacks

        // Cells need to be sized relative to the smallest space available
		let w = Math.ceil(windowWidth / settings.boardWidth);
		let h = Math.ceil(windowHeight / settings.boardHeight);
        let size = (w < h ? w : h);

		let cells = document.getElementById("board").getElementsByTagName("td");
        for(let i = 0; i < cells.length; i++){
			cells[i].style.width        = size+"px";
            cells[i].style.height       = size+"px";
            cells[i].style.borderRadius = size+"px";
        }
	}      

    function columnDrop(c) {
        //console.log("Column " + c);
        
        if (!status.active) {
            return false;
        }
        
		if (status.columnHeight[c] == settings.boardHeight) {
            return false;
        }
        
        status.active = false;

        let y = status.columnHeight[c];
        let key = c + "," + y

        cells[key].style.background = colors[status.player-1];
        status.board[c][y] = status.player;

        status.columnHeight[c]++;
        status.totalPieces++;

        console.log(checkWin(c,y));
        changePlayer();

        status.active = true;
    }

    function changePlayer() {
        status.player = (status.player == 1 ? 2 : 1);
    }

    function checkWin(x, y) {
        return (checkHorizontal(x,y)) 
            || (checkVertical(x,y))
            || (checkLDiagonal(x,y))
            || (checkRDiagonal(x,y));
    }

    function checkHorizontal(x,y) {
        let i = clamp(x, 0, x-4);
        let j = clamp(x, x+4, settings.boardWidth);
        console.log("range",i,j);
        let win = 0;
        for(; i < j; i++) {
            console.log("infor",i,y,status.board[i][y]);
            if (status.board[i][y] == status.player)
                win++;
            else win = 0;
            if (win >= 4) return true;
        }
        return false;
    }
    function checkVertical(x,y) {
        return false;
    }

    function checkLDiagonal(x,y) {
        return false;
    }

    function checkRDiagonal(x,y) {
        return false;
    }

    function initGame() {
        status.totalPieces = 0;
        status.player = settings.firstPlayer;
        status.active = true;
    }

    function play() {
        initGame();
    }

    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }

}

