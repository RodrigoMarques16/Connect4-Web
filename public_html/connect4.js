;function login() {
    // Login details aren't saved yet
    var form = document.getElementById("login");
    if (form.style.display === "none") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}

function connect4(width, height) {
    var base = document.getElementById("tabuleiro");
    var pilha = document.getElementById("pilha");
    var slot = document.getElementById("vazio");
    
    
    for(i = 0; i < height; i++) {
        var s = slot.cloneNode(false);
        pilha.appendChild(s);
    }
    for(i = 0; i < width; i++) {
        var p = pilha.cloneNode(true);
        base.appendChild(p);
    }
}