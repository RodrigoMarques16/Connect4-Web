class Board {

    constructor(width, height, currentPlayer) {
        this.width         = width; 
        this.height        = height;
        this.board         = new Array();
        this.columnHeight  = new Array();
        this.totalPieces   = 0;
        this.currentPlayer = currentPlayer
        this.initBoard();
    }   

    /**
     * Initializes all the board's positions to 0.
     */
    initBoard() {
        this.totalPieces = 0;
        for (let i = 0; i < this.width; i++) {
            this.columnHeight[i] = 0;
            this.board[i] = new Array();
            for (let j = 0; j < this.height; j++) {
                this.board[i].push(0);
            }
        }
    }

    /**
     * Add a piece to the top of a column and switches the current player.
     * @param {number} currentPlayer 
     * @param {number} column 
     * @return {boolean} True if the play was valid.
     */
    columnDrop(player, column) {
        let y = this.columnHeight[column];
        
        if (y == this.height) 
            return false;
        
        this.board[column][y] = player;
        this.columnHeight[column]++;
        this.totalPieces++;
        
        return true;
    }

    /**
     * Test for a win in all directions which include position (x, y)
     * @param {number} x - The horizontal position.
     * @param {number} y - The vertical position.
     * @return {boolean} True if the game is won by the current player.
     */
    checkWin(player, x, y) {
        return (this.checkHorizontal(player, y))
            || (this.checkVertical(player, x))
            || (this.checkLDiagonal(player, x, y))
            || (this.checkRDiagonal(player, x, y));
    }

    /**
     * Checks for a win in row y
     * @param {number} player
     * @param {number} y 
     * @return {boolean} 
     */
    checkHorizontal(player, y) {
        let win = 0;
        for (let i = 0; i < this.width; i++) {
            if (this.board[i][y] == player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;
    }

    /**
     * Checks for win in row x
     * @param {number} x
     * @return {boolean}
     */
    checkVertical(player, x) {
        let win = 0;
        for (let i = 0; i < this.height; i++) {
            if (this.board[x][i] == player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;
    }

    /**
     * Checks for a win in the right diagonal which passes (x,y)
     * @param {number} x
     * @param {number} y 
     * @return {boolean}
     */
    checkRDiagonal(player, x, y) {
        let i = x, j = y;
        while (i > 0 && j > 0) {
            i--; j--;
        }
        while (x < this.width && y < this.height) {
            x++; y++;
        }
        let win = 0;
        for (; i < x && j < y; i++ , j++) {
            if (this.board[i][j] == player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;
    }

    /**
     * Checks for a win in the left diagonal which passes (x,y)
     * @param {number} x
     * @param {number} y 
     * @return {boolean}
     */
    checkLDiagonal(player, x, y) {
        let i = x, j = y;
        while (i > 0 && j < this.height) {
            i--; j++;
        }
        while (y > 0) {
            y--;
        }
        let win = 0;
        for (; i < this.width && j >= y; i++ , j--) {
            if (this.board[i][j] == player)
                win++;
            else
                win = 0;
            if (win >= 4)
                return true;
        }
        return false;
    }

}