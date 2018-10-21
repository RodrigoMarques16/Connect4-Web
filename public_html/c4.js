window.onload = function(){
	
	var settings = {
		boardWidth: 7,
		boardHeight: 6,
		lengthNeeded: 4,
		gravity: 100,
		playerColors: [
			"#FF0000",
			"#0000FF"
		],
		winColor: "#FFFF00",
	};
	
	var cache = {};
	
	var defaultSettings = JSON.parse(JSON.stringify(settings));
	
	var game = {
		board: [],
		player: 1,
		active: false,
		totalPiecesDropped: 0,
	};
	
	loadSettings();
	initSettings();
	createBoard();

	setInterval(function(){
		if (document.getElementById("homeLogo") == null)
			return;
		if (game.totalPiecesDropped > 0)
			document.getElementById("homeLogo").style.display = "none";
		else
			document.getElementById("homeLogo").style.display = "";
	}, 250);
	
	window.applicationCache.addEventListener('updateready', function(){
		location.reload();
	}, false);
	
	function loadSettings(){
		if (localStorage.getItem("fourinarow-settings") != null){
			settings = JSON.parse(localStorage.getItem("fourinarow-settings"));
			if (Object.keys(settings).length != Object.keys(defaultSettings).length || JSON.stringify(Object.keys(settings)) !=  JSON.stringify(Object.keys(defaultSettings))){
				localStorage.setItem("fourinarow-settings", JSON.stringify(defaultSettings));
				loadSettings();
				initSettings();
			}
		}
	}
	
	function saveSettings(){
		localStorage.setItem("fourinarow-settings", JSON.stringify(settings));
	}
	
	function saveGame(){
		localStorage.setItem("fourinarow-save", JSON.stringify(game));
	}
	
	function loadGame(){
		try{
			if (localStorage.getItem("fourinarow-save") != null){
				game = JSON.parse(localStorage.getItem("fourinarow-save"));
				status("Player "+game.player+"'s Turn", settings.playerColors[game.player-1], .7);
				for (var x = 0; x < game.board.length; x++){
					for (var y = 0; y < game.board[x].length; y++){
						if (game.board[x][y] > 0){
							var token = document.createElement("div");
							token.style.height = "100%";
							token.style.backgroundColor = settings.playerColors[game.board[x][y] -1];
							token.className = "token";
							styleToken(token);
							cache.cells["cell-"+x+"-"+y].appendChild(token);
						}
					}
				}
			}
		}catch(e){
			localStorage.removeItem("fourinarow-save");
		}
	}
	
	function initSettings(){
		document.getElementById("boardWidth").value = settings.boardWidth;
		document.getElementById("boardHeight").value = settings.boardHeight;
		document.getElementById("lengthNeeded").value = settings.lengthNeeded;
		document.getElementById("gravity").value = settings.gravity;
		document.getElementById("player1Color").value = settings.playerColors[0];
		document.getElementById("player2Color").value = settings.playerColors[1];
		document.getElementById("winColor").value = settings.winColor;
		var colorPickers = document.getElementById("settings").getElementsByClassName("color-input");
		if (colorPickers.length > 0 && colorPickers[0].type != "color"){
			for (var i = 0; i < colorPickers.length; i++){
				colorPickers[i].oninput = function(){
					var rgb = hexToRgb(this.value);
					if (rgb.r*0.299 + rgb.g*0.587 + rgb.b*0.114 > 186)
						this.style.color = "#000000";
					else
						this.style.color = "#FFFFFF";
					this.style.background = this.value;
				}
				colorPickers[i].oninput();
			}
		}else{
			for (var i = colorPickers.length-1; i >= 0; i--)
				colorPickers[i].className = "";
		}
		document.getElementById("applySettings").onclick = function(){
			settings.boardWidth = parseInt(document.getElementById("boardWidth").value);
			settings.boardHeight = parseInt(document.getElementById("boardHeight").value);
			settings.lengthNeeded = parseInt(document.getElementById("lengthNeeded").value);
			settings.gravity = parseInt(document.getElementById("gravity").value);
			settings.playerColors[0] = document.getElementById("player1Color").value.substr(0, 7);
			settings.playerColors[1] = document.getElementById("player2Color").value.substr(0, 7);
			settings.winColor = document.getElementById("winColor").value.substr(0, 7);
			if (settings.boardWidth < 1)
				settings.boardWidth = 1;
			if (settings.boardWidth > 40)
				settings.boardWidth = 40;
			if (settings.boardHeight < 1)
				settings.boardHeight = 1;
			if (settings.boardHeight > 40)
				settings.boardHeight = 40;
			if (settings.lengthNeeded < 1)
				settings.lengthNeeded = 1;
			if (settings.gravity < 1)
				settings.gravity = 1;
			if (settings.gravity > 1000)
				settings.gravity = 1000;
			if (!settings.playerColors[0].match("#[0-9A-Fa-f]{6}"))
				settings.playerColors[0] = defaultSettings.playerColors[0];
			if (!settings.playerColors[1].match("#[0-9A-Fa-f]{6}"))
				settings.playerColors[1] = defaultSettings.playerColors[1];
			if (!settings.winColor.match("#[0-9A-Fa-f]{6}"))
				settings.winColor = defaultSettings.winColor;
			if (settings.lengthNeeded > settings.boardWidth && settings.lengthNeeded > settings.boardHeight){
				if (settings.boardWidth > settings.boardHeight)
					settings.lengthNeeded = settings.boardWidth;
				else
					settings.lengthNeeded = settings.boardHeight;
			}
			initSettings();
			document.getElementById("toggleSettings").click();
			saveSettings();
			localStorage.removeItem("fourinarow-save");
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
	
	function createBoard(){
		game.board = [];
		cache.cells = {};
		document.getElementById("game").innerHTML = "";
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");
		for (var x = 0; x < settings.boardWidth; x++){
			var column = [];
			for (var y = 0; y < settings.boardHeight; y++){
				column.push(0);
			}
			game.board.push(column);
		}
		for (var y = 0; y < settings.boardHeight; y++){
			var tr = document.createElement("tr");
			var row = [];
			for (var x = 0; x < settings.boardWidth; x++){
				var td = document.createElement("td");
				cache.cells["cell-"+x+"-"+(settings.boardHeight-1-y)] = td;
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		tbody.onclick = function(e){
			columnDrop(e.target.cellIndex);
			e.preventDefault();
		}
		tbody.onmouseover = function(e){
			columnUnhighlight();
			columnHighlight(e.target.cellIndex);
			e.preventDefault();
		}
		tbody.onmouseleave = function(e){
			columnUnhighlight();
			e.preventDefault();
		}
		tbody.ontouchstart = function(e){
			columnUnhighlight();
			columnHighlight(e.target.cellIndex);
			e.preventDefault();
		}
		tbody.ontouchmove = function(e){
			var c = columnInside(e.touches[0].clientX, e.touches[0].clientY);
			columnUnhighlight();
			if (c != null){
				columnHighlight(c);
			}
			e.preventDefault();
		}
		tbody.ontouchend = function(e){
			var c = columnInside(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
			columnUnhighlight();
			if (c != null){
				columnDrop(c);
				columnHighlight(c);
			}
			e.preventDefault();
		}
		
		document.getElementById("game").appendChild(table);
		resizeCells();
		startGame();
		loadGame();
	}
	
	function startGame(){
		game.active = false;
		for (var i = 0; i < rand(0, 5); i++)
			changePlayer();
		game.active = true;
		game.totalPiecesDropped = 0;
		changePlayer();
	}
	
	function columnInside(x, y){
		var table = document.getElementById("game").getElementsByTagName("table")[0];
		if (y >= table.offsetTop && y <= table.offsetTop+table.clientHeight){
			for (var i = 0; i < settings.boardWidth; i++){
				var elem = cache.cells["cell-"+i+"-0"];
				if (x >= elem.offsetLeft+elem.offsetParent.offsetLeft && x <= elem.offsetLeft+elem.clientWidth+elem.offsetParent.offsetLeft)
					return i;
			}
		}
		return null;
	}
	
	function resizeCells(){
		var windowWidth = window.innerWidth-game.board.length*3;
		var windowHeight = window.innerHeight-75-game.board[0].length*3;
		var w = Math.ceil(windowWidth / game.board.length);
		var h = Math.ceil(windowHeight / game.board[0].length);
		var shorterSide = (w < h ? w : h);
		cache.cellSize = shorterSide;
		cache.cellInnerSize = shorterSide-4;
		cache.boardHeight = (shorterSide == w ? windowWidth : windowHeight);
		var cells = document.getElementById("game").getElementsByTagName("td");
		for (var i = 0; i < cells.length; i++){
			cells[i].style.width = shorterSide+"px";
			cells[i].style.height = shorterSide+"px";
		}
		styleTokens();
	}
	
	function styleTokens(){
		var windowWidth = window.innerWidth-game.board.length*3;
		var windowHeight = window.innerHeight-75-game.board[0].length*3;
		var w = Math.ceil(windowWidth / game.board.length);
		var h = Math.ceil(windowHeight / game.board[0].length);
		var shorterSide = (w < h ? w : h);
		var tokens = Object.keys(cache.cells);
		for (var i = 0; i < tokens.length; i++){
			if (cache.cells[tokens[i]].children.length == 0)
				continue;
			cache.cells[tokens[i]].children[0].style.borderRadius = shorterSide+"px";
		}
	}
	
	function styleToken(elem){
		var windowWidth = window.innerWidth-game.board.length*3;
		var windowHeight = window.innerHeight-75-game.board[0].length*3;
		var w = Math.ceil(windowWidth / game.board.length);
		var h = Math.ceil(windowHeight / game.board[0].length);
		var shorterSide = (w < h ? w : h);
		elem.style.borderRadius = shorterSide+"px";
	}
	
	function columnDrop(c){
		if (!game.active)
			return false;
		var column = game.board[c];
		if (column[column.length-1] != 0)
			return false;
		if (cache.newToken){
			cache.newToken.className = "token";
			delete cache.newToken;
		}
		dropAnimation(c, column.length-1, function(){
			for (var i = 0; i < column.length; i++){
				if (column[i] == 0){
					column[i] = game.player;
					game.totalPiecesDropped++;
					var winData = didWin(game.board, game.player, c, i);
					if (winData.win){
						game.active = false;
						columnUnhighlight();
						winAnimation(winData.cells);
						status("Player "+game.player+" won!", settings.playerColors[game.player-1], 5);
						localStorage.removeItem("fourinarow-save");
						return;
					}
					if (winData.tie){
						game.active = false;
						status("It's a Draw!", "#000000", 5);
						localStorage.removeItem("fourinarow-save");
						return;
					}
					changePlayer();
					updateColumnHighlight();
					saveGame();
					break;
				}
			}
		});
		return true;
	}
	
	function dropAnimation(x, y, callback){
		game.active = false;
		setTimeout(function(){
			if (y < 0 || cache.cells["cell-"+x+"-"+y].children.length == 1){
				game.active = true;
				callback();
				return;
			}else{
				if (typeof cache.cells["cell-"+x+"-"+(y+1)] != "undefined")
					cache.cells["cell-"+x+"-"+(y+1)].innerHTML = "";

				var token = document.createElement("div");
				token.style.backgroundColor = settings.playerColors[game.player-1];
				token.className = "token new-token";
				token.style.height = "100%";
				styleToken(token);
				cache.cells["cell-"+x+"-"+y].appendChild(token);
				dropAnimation(x, y-1, callback);
			}
		}, 50);
	}

	function updateColumnHighlight(){
		var cells = Object.keys(cache.cells);
		for (var i = 0; i < cells.length; i++){
			if (cache.cells[cells[i]].className.indexOf(" highlight") != -1){
				var rgb = hexToRgb(settings.playerColors[game.player-1]);
				cache.cells[cells[i]].style.background = "rgba("+rgb.r+", "+rgb.g+", "+rgb.b+", .7)";
			}
		}
	}
	
	function columnHighlight(c){
		if (!game.active)
			return;
		var column = game.board[c];
		if (column[column.length-1] != 0)
			return;
		for (var i = 0; i < column.length; i++){
			if (cache.cells["cell-"+c+"-"+i].className.indexOf("highlight") == -1){
				cache.cells["cell-"+c+"-"+i].className += " highlight";
				var rgb = hexToRgb(settings.playerColors[game.player-1]);
				cache.cells["cell-"+c+"-"+i].style.background = "rgba("+rgb.r+", "+rgb.g+", "+rgb.b+", .7)";
			}
		}
	}
	
	function columnUnhighlight(){
		var cells = Object.keys(cache.cells);
		for (var i = 0; i < cells.length; i++){
			if (cache.cells[cells[i]].className.indexOf(" highlight") != -1){
				cache.cells[cells[i]].className = cache.cells[cells[i]].className.replace(/ highlight/g, "");
				cache.cells[cells[i]].style.background = "";
			}
		}
	}
	
	function changePlayer(){
		if (game.player == 1)
			game.player = 2;
		else
			game.player = 1;
		
		status("Player "+game.player+"'s Turn", settings.playerColors[game.player-1], .7);
	}
	
	function didWin(board, player, x, y){
		var streak = [];
		var counter = [];
		//Horizontal
		for (var w = 0; w < settings.boardWidth; w++){
			if (board[w][y] == player)
				counter.push("cell-"+w+"-"+y);
			else{
				if (counter.length > streak.length)
					streak = counter;
				counter = [];
			}
		}
		if (counter.length > streak.length)
			streak = counter;
		if (streak.length >= settings.lengthNeeded)
			return {cells: streak, win: true};
		
		//Vertical
		streak = [];
		counter = [];
		for (var h = 0; h < settings.boardHeight; h++){
			if (board[x][h] == player)
				counter.push("cell-"+x+"-"+h);
			else{
				if (counter.length > streak.length)
					streak = counter;
				counter = [];
			}
		}
		if (counter.length > streak.length)
			streak = counter;
		if (streak.length >= settings.lengthNeeded)
			return {cells: streak, win: true};
		
		//Left to Right Diagonal
		streak = [];
		counter = [];
		var startX = x
		var startY = y;
		while (startX > 0 && startY > 0){
			startX--;
			startY--;
		}
		while (startX < settings.boardWidth && startY < settings.boardHeight){
			if (board[startX][startY] == player)
				counter.push("cell-"+startX+"-"+startY);
			else{
				if (counter.length > streak.length)
					streak = counter;
				counter = [];
			}
			startX++;
			startY++;
		}
		if (counter.length > streak.length)
			streak = counter;
		if (streak.length >= settings.lengthNeeded)
			return {cells: streak, win: true};
		
		//Right to Left Diagonal
		streak = [];
		counter = [];
		startX = x
		startY = y;
		while (startX < settings.boardWidth-1 && startY > 0){
			startX++;
			startY--;
		}
		while (startX >= 0 && startY < settings.boardHeight){
			if (board[startX][startY] == player)
				counter.push("cell-"+startX+"-"+startY);
			else{
				if (counter.length > streak.length)
					streak = counter;
				counter = [];
			}
			startX--;
			startY++;
		}
		if (counter.length > streak.length)
			streak = counter;
		if (streak.length >= settings.lengthNeeded)
			return {cells: streak, win: true};
		
		if (game.totalPiecesDropped == settings.boardWidth*settings.boardHeight)
			return {tie: true};
		
		return {win: false};
	}
	
	function winAnimation(cells){
		for (var i = 0; i < cells.length; i++){
			if (i >= settings.lengthNeeded)
				return;
			cache.cells[cells[i]].style.backgroundColor = settings.winColor;
		}
	}
	
	function status(text, color, opacity){
		var cells = Object.keys(cache.cells);
		for (var i = 0; i < cells.length; i++)
			cache.cells[cells[i]].style.borderColor = color;
		document.getElementById("status").style.opacity = opacity;
		document.getElementById("status").innerText = text;
		document.getElementById("status").style.background = color;
	}
	
	setInterval(function(){
		document.getElementById("status").style.opacity -= .01;
		if (document.getElementById("status").style.opacity <= 0){
			document.getElementById("status").style.opacity = 0;
		}
	}, 30);
	
	document.getElementById("reset").onclick = function(){
		localStorage.removeItem("fourinarow-save");
		clearBoard(0, 0, createBoard);
	};
	
	function clearBoard(top, col, callback){
		game.active = false;
		var table = document.getElementById("game").getElementsByTagName("table")[0];
		var tableBottom = table.offsetTop+table.clientHeight;
		if (!cache.tokens)
			cache.tokens = Object.keys(cache.cells);
		
		setTimeout(function(){
			var changed = false;
			for (var i = cache.tokens.length-1; i >= 0; i--){
				if (cache.cells[cache.tokens[i]].children.length == 0){
					cache.tokens.splice(i, 1);
					continue;
				}
				if (!cache.styleReset){
					cache.cells[cache.tokens[i]].style.backgroundColor = "";
					if (cache.cells[cache.tokens[i]].children.length == 1){
						cache.cells[cache.tokens[i]].children[0].style.width = window.getComputedStyle(cache.cells[cache.tokens[i]].children[0]).width;
						cache.cells[cache.tokens[i]].children[0].style.height = window.getComputedStyle(cache.cells[cache.tokens[i]].children[0]).height;
						cache.cells[cache.tokens[i]].children[0].style.top = cache.cells[cache.tokens[i]].offsetTop+2+table.offsetTop+"px";
						cache.cells[cache.tokens[i]].children[0].style.position = "absolute";
						
					}
				}
				if (cache.cells[cache.tokens[i]].cellIndex != col)
					continue;
				changed = true;
				if (((isNaN(parseInt(cache.cells[cache.tokens[i]].children[0].style.top)) ? 0 : parseInt(cache.cells[cache.tokens[i]].children[0].style.top))+top) > tableBottom-cache.cellSize){
					cache.cells[cache.tokens[i]].innerHTML = "";
					cache.tokens.splice(i, 1);
				}else{
					cache.cells[cache.tokens[i]].children[0].style.top = ((isNaN(parseInt(cache.cells[cache.tokens[i]].children[0].style.top)) ? 0 : parseInt(cache.cells[cache.tokens[i]].children[0].style.top))+top)+"px";
				}
			}
			if (!changed){
				col++;
				top = 0;
			}
			cache.styleReset = true;
			if (cache.tokens.length > 0)
				clearBoard(top+Math.round((Math.round(cache.cellSize/30))*(settings.gravity/100))+1, col, callback);
			else{
				cache.styleReset = false;
				delete cache.tokens;
				callback();
			}
		}, 20);
	}
	
	document.getElementById("resizeCells").onclick = function(){
		resizeCells();
		document.body.scrollTop = 0;
	};
	
	function rand(min, max){
		return Math.floor(Math.random()*(max-min+1)+min);
	}
	
	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}
}