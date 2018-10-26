const defaults = {
    boardWidth: 7,
    boardHeight: 6,
    firstPlayer: 1,
    difficulty: 5,
    vsComputer: true,
};

var tableheaders = ["Name", "Wins", "Losses", "Ties"];

const colors = {
    1: "red",
    2: "yellow",
}

/*const EASY = 2;
const NORMAL = 5;
const HARD = 8;*/

window.onload = function () {

    var TIE;
    var OVERLAY_OPEN = false;
    
    var leaderboard = {}

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


    loadSettings(defaults);
    init();
    createBoard(settings.boardWidth, settings.boardHeight);
    play();

    function init() {
        document.getElementById("login-button").onclick = login;
        document.getElementById("playGame").onclick = startGame;
        document.getElementById("showHelp").onclick = showHelp;
        document.getElementById("showScores").onclick = showScores;
        document.getElementById("giveup").onclick = giveUp;
        document.getElementById("overlay").onclick = closeOverlay;
    }

    function login() {
        status.playername = document.getElementById("username-box").value;
        //let password = document.getElementById("password-box").value; 
        document.getElementById("login-section").style.display = "none";
        document.getElementById("side").style.display = "block";
        document.getElementById("game").style.display = "block";
        if (!(status.playername in leaderboard)) {
            leaderboard[status.playername] = {
                wins: 0,
                losses: 0,
                ties: 0,
            }
        }
    }

    function startGame() {
        settings.boardWidth  = clamp(parseInt(document.getElementById("boardWidth").value), 1, 10);
        settings.boardHeight = clamp(parseInt(document.getElementById("boardHeight").value), 1, 10);
        settings.firstPlayer = parseInt(document.getElementById("firstPlayer").value);
        settings.difficulty  = parseInt(document.getElementById("difficulty").value);
        loadSettings(settings);
        clearBoard();
        createBoard(settings.boardWidth, settings.boardHeight);
        play();
    }

    function showHelp() {
        if (OVERLAY_OPEN == true) {
            document.getElementById("overlay").style.display = "none";
            OVERLAY_OPEN = false;
            return;
        }
        document.getElementById("scores").style.display  = "none";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("help").style.display    = "block";
        OVERLAY_OPEN = true;
    }

    function showScores() {
        if (OVERLAY_OPEN == true) {
            document.getElementById("overlay").style.display = "none";
            OVERLAY_OPEN = false;
            return;
        }

        document.getElementById("help").style.display     = "none";
        document.getElementById("overlay").style.display  = "block";
        let scores = document.getElementById("scores");
        scores.style.display = "block";
        
        while (scores.firstChild) {
            scores.removeChild(scores.firstChild);
        }
        
        let header = document.createElement("h1");
        header.innerText = "Scoreboard";
        scores.appendChild(header);
        
        let table = document.createElement("table");
        
        let thead = document.createElement("thead");
        for(field in tableheaders) {
            let th = document.createElement("th");
            th.innerText = tableheaders[field];
            thead.appendChild(th);
        }
        table.appendChild(thead);

        for (let username in leaderboard) {
            let tr = document.createElement("tr");
            let name = document.createElement("td");
            name.innerText = username;
            tr.appendChild(name);
            let score = leaderboard[username];
            for(let field in score) {
                let td = document.createElement("td");
                td.innerText = score[field];
                tr.appendChild(td);
            }
            table.appendChild(tr)
        }

        table.align = "center";
        table.id = "scoretable";
        scores.appendChild(table);
        OVERLAY_OPEN = true;
    }

    function closeOverlay() {
        document.getElementById("overlay").style.display = "none";
    }
    
    function loadSettings(table) {
        document.getElementById("boardWidth").value  = table.boardWidth;
        document.getElementById("boardHeight").value = table.boardHeight;
        document.getElementById("difficulty").value  = table.difficulty;
        document.getElementById("firstPlayer").value = table.firstPlayer;
    }
    
    function clearBoard() {
        document.getElementById("board").innerHTML = "";
        document.getElementById("banner").innerText = "";
        status.board = new Array();
        status.columnHeight = new Array();
        cells = {};
    }

    function createBoard(width, height) {
        let board = document.getElementById("board");
        let table = document.createElement("table");
        
        clearBoard();

        for(let x = 0; x < width; x++) {
            status.columnHeight[x] = 0;
            status.board[x] = new Array();
            for (let y = 0; y < height; y++) {
				status.board[x].push(0);
			}
        }

        for(let y = 0; y < height; y++) {
            let tr = document.createElement("tr");
			for (let x = 0; x < width; x++) {
				let td = document.createElement("td");
                tr.appendChild(td);
                cells[x+","+(settings.boardHeight-1-y)] = td;
			}
			table.appendChild(tr);
        }

        table.onclick = function(e){
            if("cellIndex" in e.target && status.active == true)
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
            status.lastPlayed = c;
            changePlayer();
        }
    }

    function doWin() {
        status.active = false;
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

    function giveUp() {
        if (status.active) {
            status.player = (status.player == 1 ? 2 : 1);
            doWin();
        }
    }

    function changePlayer() {
        status.player = (status.player == 1 ? 2 : 1);
        if (settings.vsComputer == true && status.player == 2)
            makeMove();
        if (status.player == 1) 
            status.active = true;
    }

    function makeMove() {
        status.active = false;

        let available = new Array();
        for(let i = 0; i < settings.boardWidth; i++)
            if (status.columnHeight[i] < settings.boardHeight)
                available.push(i);

        let c = available[getRandomInt(0, available.length-1)];

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
        while(i > 0 && j < settings.boardHeight) {
            i--; j++;
        }
        while(y > 0) {
            y--;
        }
        let win = 0;
        for(; i < settings.boardWidth && j >= y; i++, j--) {
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
        banner.display = "block";
        if (status.player == 2 )
            banner.innerText = "The computer wins!";
        else 
            banner.innerText = status.playername + " wins!";
		banner.style.background = colors[status.player];
    }

}