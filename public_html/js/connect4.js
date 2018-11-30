const server = "http://twserver.alunos.dcc.fc.up.pt:8008/"

const defaults = {
    boardWidth: 7,
    boardHeight: 6,
    firstPlayer: 1,
    difficulty: 5,
    vsComputer: false,
};

var tableheaders = ["Name", "Wins", "Losses", "Ties"];

const colors = {
    1: "red",
    2: "yellow",
}

// const EASY = 2;
// const NORMAL = 5;
// const HARD = 8;

window.onload = function () {

    var TIE;
    var OVERLAY_OPEN = false;

    var settings = {
        boardWidth: 7,
        boardHeight: 6,
        firstPlayer: 1,
        difficulty: 5,
        vsComputer: false,
    };

    var status = {
        board: new Array(),
        columnHeight: new Array(),
        player: 1,
        playername: "",
        password: "",
        game: "",
        gameStarted: false,
        active: false,
        lastPlayed: 0,
    };


    loadSettings(defaults);
    init();

    /**
     * Setup
     */
    function init() {
        document.getElementById("login-button").onclick = login;
        document.getElementById("register-button").onclick = register;
        document.getElementById("playGame").onclick = startGame;
        document.getElementById("showHelp").onclick = showHelp;
        document.getElementById("showScores").onclick = showScores;
        document.getElementById("giveup").onclick = giveUp;
        document.getElementById("overlay").onclick = closeOverlay;
    }


    /**
     * Authentication
     */
    function login() {
        let user_box = document.getElementById("username-box");
        let pw_box = document.getElementById("password-box");

        status.playername = user_box.value;
        status.password = pw_box.value;

        let credentials = {
            nick: status.playername,
            pass: status.password
        };

        makeRequest("POST", "register", credentials, (response) => {
            if ("error" in response) {
                user_box.value = response.error;
            }
            else {
                document.getElementById("login-section").style.display = "none";
                document.getElementById("side").style.display = "block";
                document.getElementById("game").style.display = "block";
            }
        });
    }

    /**
     * Registration
     * (server doesn't differentiate registration from login)
     */
    function register() {
        login();
    }


    /**
     * Creates the board elements in the page and starts listening to events from the server
     */
    function startGame() {
        settings.boardWidth = clamp(parseInt(document.getElementById("boardWidth").value), 1, 10);
        settings.boardHeight = clamp(parseInt(document.getElementById("boardHeight").value), 1, 10);
        settings.firstPlayer = parseInt(document.getElementById("firstPlayer").value);
        settings.difficulty = parseInt(document.getElementById("difficulty").value);

        let data = {
            group: "grupo13",
            nick: status.playername,
            pass: status.password,
            size: {
                rows: settings.boardHeight,
                columns: settings.boardWidth
            }
        }

        makeRequest("POST", "join", data, (response) => {
            if ("error" in response) {
                // error stuff
            } else {
                status.game = response.game;
                console.log(status.game);

                loadSettings(settings);
                clearBoard();
                createBoard(settings.boardWidth, settings.boardHeight);
                
                eventSource = getListener(status.playername, status.game, onUpdate);
                updateBanner("Waiting for another player...", "green");

                play();
            }
        });
    }

    /**
     * Open the help overlay
     */
    function showHelp() {
        if (OVERLAY_OPEN == true) {
            document.getElementById("overlay").style.display = "none";
            OVERLAY_OPEN = false;
            return;
        }
        document.getElementById("scores").style.display = "none";
        document.getElementById("overlay").style.display = "block";
        document.getElementById("help").style.display = "block";
        OVERLAY_OPEN = true;
    }

    /**
     * Open the score table overlay
     */
    function showScores() {
        if (OVERLAY_OPEN == true) {
            document.getElementById("overlay").style.display = "none";
            OVERLAY_OPEN = false;
            return;
        }

        document.getElementById("help").style.display = "none";
        document.getElementById("overlay").style.display = "block";
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
        for (field in tableheaders) {
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
            for (let field in score) {
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

    /**
     * Closes the open overlay
     */
    function closeOverlay() {
        document.getElementById("overlay").style.display = "none";
    }


    /**
     * Load settings to the page
     */
    function loadSettings(table) {
        document.getElementById("boardWidth").value = table.boardWidth;
        document.getElementById("boardHeight").value = table.boardHeight;
        document.getElementById("difficulty").value = table.difficulty;
        document.getElementById("firstPlayer").value = table.firstPlayer;
    }

    /**
     * Destroy the drawn board
     */
    function clearBoard() {
        document.getElementById("board").innerHTML = "";
        document.getElementById("banner").innerText = "";
        cells = {};
    }

    /**
     * Create the board's HTML elements
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    function createBoard(width, height) {
        let board = document.getElementById("board");
        let table = document.createElement("table");

        for (let y = 0; y < height; y++) {
            let tr = document.createElement("tr");
            for (let x = 0; x < width; x++) {
                let td = document.createElement("td");
                tr.appendChild(td);
                let key = getKey(x, (settings.boardHeight - y - 1))
                cells[key] = td;
            }
            table.appendChild(tr);
        }

        table.onclick = function (e) {
            if ("cellIndex" in e.target && status.active == true)
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

    /**
     * Resize the board to fit the window
     */
    function resizeCells() {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight - 75; // hacks

        // Cells need to be sized relative to the smallest space available
        let w = Math.ceil(windowWidth / settings.boardWidth);
        let h = Math.ceil(windowHeight / settings.boardHeight);
        let size = (w < h ? w : h);

        let cells = document.getElementById("board").getElementsByTagName("td");
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.width = size + "px";
            cells[i].style.height = size + "px";
            cells[i].style.borderRadius = size + "px";
        }
    }

    /**
     * Draw the board received from server
     * @param {Array<Array<String>>} boardArray 
     */
    function updateBoard(boardArray, column) {
        for (let y = 0; y < settings.boardHeight; y++) {
            for (let x = 0; x < settings.boardWidth; x++) {
                let key = getKey(x, settings.boardHeight - y - 1);
                let cell = boardArray[x][y];
                if (cell == status.playername) {
                    cells[key].style.background = colors[1];
                }else if (cell != null)
                    cells[key].style.background = colors[2];
            }
        }
    }

    /**
     * Play a piece in a given column.
     * @param {Number} column 
     */
    function columnDrop(column) {
        status.active = false;

        let data = {
            nick: status.playername,
            pass: status.password,
            game: status.game,
            column: column,
        }
        
        //let y = status.board.columnHeight[column];
        
        // if (status.board.columnDrop(status.player, column) == false)
        //     return false;
        
        makeRequest("POST", "notify", data, (response) => {
            if ("error" in response) {
                status.active = true;
            } else {
                //let key = getKey(column, y);
                //cells[key].style.background = colors[status.player];
            }
        });

    }

    /**
     * Win animation
     */
    function doWin() {
        status.active = false;
        if (status.player == 1) {
            updateBanner(status.playername + " wins!", colors[1]);
        } else {
            updateBanner("Other player wins!", colors[2]);
        }
        eventSource.close();
    }

    /**
     * Tie animation
     */
    function doTie() {
    }

    /**
     * Let the other player win
     */
    function giveUp() {
        let data = {
            game: status.game,
            nick: status.playername
        };

        makeRequest("POST", "leave", data, (response) => {
            if ("error" in reponse) {
                // error stuff
            } else {
                status.player = 2;
                doWin();
            }
        });
    }

    /**
     * Switch active players
     */
    function changePlayer() {
        status.player = (status.player == 1 ? 2 : 1);
        if (settings.vsComputer == true && status.player == 2)
            makeMove();
        if (status.player == 1)
            status.active = true;
    }

    /**
     * Set the active player
     * @param {String} playerName 
     */
    function changePlayer(playerName) {
        if (playerName == status.playername) {
            status.player = 1;
            status.active = true;
            updateBanner("Your turn.", colors[1]);
        }
        else {
            status.player = 2;
            updateBanner(playerName + "'s turn.", colors[2]);
        }
    }

    /**
     * Play a piece in a random column
     */
    function makeMove() {
        status.active = false;

        let available = new Array();
        for (let i = 0; i < settings.boardWidth; i++)
            if (status.board.columnHeight[i] < status.board.height)
                available.push(i);

        let c = available[getRandomInt(0, available.length - 1)];

        columnDrop(c);
    }

    /**
     * Initialize game variables
     */
    function initGame() {
        status.board = new Board(settings.boardWidth, settings.boardHeight, settings.firstPlayer);
        status.player = settings.firstPlayer;
        status.active = false;
        TIE = settings.height * settings.width;
    }

    /**
     * Play
     */
    function play() {
        initGame();
        if (status.player == 2)
            makeMove();
    }

    /**
     * Turn on the announcement banner
     * 
     * @param {String} text 
     * @param {String} color 
     */
    function updateBanner(text, color) {
        let banner = document.getElementById("banner");
        banner.display = "block";
        banner.innerText = text;
        banner.style.background = color;
    }

    /**
     * Close the announcement banner
     */
    function closeBanner() {
        let banner = document.getElementById("banner");
        banner.display = "none";
        banner.innerText = "";
    }


    /**
     * Process events from the server
     */
    function onUpdate(event) {
        console.log("Update");
        console.log(event);

        if (event.data == "{}")
            return

        let data = JSON.parse(event.data);

        if ("error" in data) {
            // error stuff
        } else {
            if (status.gameStarted == false){
                status.gameStarted = true;
                console.log("Other player connected");
            }

            if ("turn" in data) {
                changePlayer(data.turn);
                if ("column" in data && data.turn != status.playername)
                    status.board.columnDrop(status.player, data.column);
            }

            if ("board" in data) {
                if ("board" in data.board)
                    updateBoard(data.board.board);
                else updateBoard(data.board); 
            }
                
            if ("winner" in data) {
                doWin();
            }
        }
    }

    function getKey(x, y) {
        return x + "," + y;
    }
}