gameStarted = false;

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