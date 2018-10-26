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
        vsComputer: true,
    }

    var colors = {
        1: "red",
        2: "yellow",
    }
    
    var EASY = 2;
    var NORMAL = 5;
    var HARD = 8;
    var TIE;

    var settings = {
        boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
        vsComputer: true,
    };

    var status = {
        board: new Array(),
        columnHeight: new Array(),
        player: 1,
        playername: "",
        active: false,
        totalPieces: 0,
        lastPlayed: 0,
    };

    var leaderboard = {}

    loadSettings(defaults);
    init();
    createBoard(settings.boardWidth, settings.boardHeight);   
    play();

    function init() {

        document.getElementById("login-button").onclick = function() {
            let username = document.getElementById("username-box").value;
            let password = document.getElementById("password-box").value; 
            let login    = document.getElementById("login-section");
            let settings = document.getElementById("side");
            let game     = document.getElementById("game");
            login.style.display = "none"; 
            settings.style.display = "block"
            game.style.display  = "block";
            status.playername = username;
            if (!(username in leaderboard)) {
                leaderboard[username] = {
                    wins: 0,
                    losses: 0,
                    ties: 0,
                }
            }
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
            if("cellIndex" in e.target)
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
        
        if (status.player == 1 && !status.active ) {
            return false;
        }
        
		if (status.columnHeight[c] == settings.boardHeight) {
            return false;
        }
        
        status.active = false;

        let y = status.columnHeight[c];
        let key = c + "," + y

        cells[key].style.background = colors[status.player];
        status.board[c][y] = status.player;

        status.columnHeight[c]++;
        status.totalPieces++;

        if (status.totalPieces >= TIE) {
            doTie();
        } else if (checkWin(c, y)) {
            doWin(); 
        } else {
            changePlayer();
            status.lastPlayed = c;
            status.active = true;
        }
    }

    function doWin() {
        updateBanner();
        if (status.player == 1) {
            leaderboard[status.playername].wins++;
        } else {
            leaderboard[status.playername].losses++;
        }
    }

    function doTie() {
        leaderboard[names[status.player]].ties++;
    }

    function changePlayer() {
        status.player = (status.player == 1 ? 2 : 1);
        if (settings.vsComputer == true && status.player == 2)
            makeMove();
    }

    function makeMove() {
        status.active = false;
        available = new Array();
        for(let i = 0; i < settings.boardWidth; i++) {
            if (status.columnHeight[i] < settings.boardHeight)
                available.push(i);
        }
        let c;
        if (settings.difficulty == EASY)
            c = getRandomColumn(0, settings.boardWidth);
        else if (settings.difficulty == NORMAL)
            c = getRandomColumn(status.lastPlayed-3, status.lastPlayed+3);
        else 
            c = getRandomColumn(status.lastPlayed-1, status.lastPlayed+1);
        console.log("ai played at", c);
        columnDrop(c);
    }

    function checkWin(x, y) {
        return (checkHorizontal(y)) 
            || (checkVertical(x))
            || (checkLDiagonal(x,y))
            || (checkRDiagonal(x,y));
    }

    function checkHorizontal(y) {
        let win = 0;
        for(let i = 0; i < settings.boardWidth; i++) {
            if (status.board[i][y] == status.player)
                win++;
            else 
                win = 0;
            if (win >= 4) 
                return true;
        }
        return false;
    }

    function checkVertical(x) {
        let win = 0;
        for(let i = 0; i < settings.boardHeight; i++) {
            if (status.board[x][i] == status.player)
                win++;
            else 
                win = 0;
            if (win >= 4) 
                return true;
        }
        return false;     
    }

    function checkRDiagonal(x,y) {
        let i = x, j = y;
        while(i > 0 && j > 0) {
            i--; j--;
        }
        while(x < settings.boardWidth && y < settings.boardHeight) {
            x++; y++;
        }
        let win = 0;
        for(; i < x && j < y; i++, j++) {
            if (status.board[i][j] == status.player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;   
    }

    function checkLDiagonal(x,y) {
        let i = x, j = y;
        while(i > 0 && j < settings.boardHeight-1) {
            i--; j++;
        }
        while(x < settings.boardWidth && y > 0) {
            x++; y--;
        }
        console.log("ij", i,j,"to xy",x,y);
        let win = 0;
        for(; i < x && j >= y; i++, j--) {
            console.log(i,j);
            if (status.board[i][j] == status.player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;   
    }

    function initGame() {
        status.totalPieces = 0;
        status.player = settings.firstPlayer;
        status.active = true;
        TIE = settings.height * settings.width;
    }

    function play() {
        initGame();
        if (status.player == 2)
            makeMove();

    }

    function updateBanner() {
        let banner = document.getElementById("banner");
        banner.innerText = status.playername + " wins!";
		banner.style.background = colors[status.player];
        console.log(colors[status.player]);
    }


    function clamp(x, min, max) {
        return Math.max(min, Math.min(x, max));
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomColumn(min, max) {
        console.log("hi", min, max, clamp(-1,min,max));
        return clamp(getRandomInt(min,max), 0, settings.boardWidth-1);
    }

}

