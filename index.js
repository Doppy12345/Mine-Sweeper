import Cell from "./Cell.js";
import GameBoard from "./GameBoard.js"

let difficulty = 'hard' 
const revealSound = document.getElementById('cell-reveal-sound')
revealSound.volume = 0.1
const flagSound = document.getElementById('flag-sound')
flagSound.volume = 0.1

/**
 * creates the game board object to store the state of the game
 * @param  {String} difficulty either easy or hard, determines board size and bomb number
 * @returns {GameBoard} a new GameBoard object
 */
function createGameboard(difficulty){
    let bombNum
    let boardSize
    switch (difficulty){
        case 'hard':
            bombNum = Math.floor(Math.random() * 16) + 30;
            boardSize = [18,14]
            break
        case 'easy':
            bombNum = Math.floor(Math.random() * 10) + 10;
            boardSize = [10, 8]
    }

    return new GameBoard(buildGameBoard(bombNum, boardSize), boardSize, bombNum)    
}

/**
 * creates all the cells and creates the board state array
 * @param  {Number} bombNum number of bombs for the game session
 * @param  {Number} boardWidth the number of columns for the game board
 * @param  {Number} boardLength the number of rows for the game board
 * @returns {Cell[]} an array containing all the cells for the game board
 */
function buildGameBoard(bombNum, [boardWidth, boardLength]){
    let board = []

    let bombsAllocated = 0
    for(let r = 0; r < boardLength; r++){
        for(let c = 0; c < boardWidth; c++){
            let currentPosition = r*boardWidth + c
            let cellsToFill = boardLength*boardWidth - (currentPosition+1)

            let outcome = Math.floor(Math.random() * cellsToFill) + bombsAllocated
            let allocateBomb = false

            if(outcome < bombNum){
                allocateBomb = true
                bombsAllocated += 1
            } 

            board.push(new Cell(allocateBomb,currentPosition))
        }
    }
    return board
}


/**
 * Draws the gameboard visually on the web page
 * @param  {GameBoard} gameBoard the game board containing the game state
 */
function drawNewGameBoard(gameBoard){
    const gameWindow = document.getElementById('game-window')
    const flagCounter = document.getElementById('flag-counter').lastChild
    flagCounter.textContent = gameBoard.bombNum

    if(difficulty === 'easy'){
        gameWindow.classList.toggle('easy')
    }

    if(difficulty === 'hard'){
        gameWindow.classList.toggle('hard')
    }

    gameBoard.setUpCellWarnings()
    for(let i = 0; i < gameBoard.boardData.length; i++){
        let cell = document.createElement('div')
        cell.classList.add('cell')
       
       
        cell.setAttribute('cell-position-data', i)
        
        
        if(gameBoard.boardData[i].hasBomb){
            cell.classList.add('bomb')
        }
        
        
        cell.addEventListener('mousedown', e => {
            if(e.button != 2) return
            
            toggleCellFlag(cell, gameBoard.boardData, flagCounter)


            
        })
        cell.addEventListener('contextmenu', e => e.preventDefault())

        cell.addEventListener('mousedown', e => {
            if(e.button != 0) return 
            
            revealCell(cell, gameBoard.boardData)
        })
        
        gameWindow.append(cell)
    }

}

/**
 * Toggles the flag to cells both visually and in the state
 * @param  {HTMLElement} cell the visual representation of the cell to add/remove flag
 * @param  {Cell[]} board array containing all Cells of the gameBoard
 * @param  {HTMLElement} flagCounter the label displaying the number of available flags
 */
function toggleCellFlag(cell, board, flagCounter){
    let cellData = board[cell.getAttribute('cell-position-data')]
    if(!cellData.flagged && !cellData.revealed){
        const flag = document.createElement('div')
        flag.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="flag" class="svg-inline--fa fa-flag fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M349.565 98.783C295.978 98.783 251.721 64 184.348 64c-24.955 0-47.309 4.384-68.045 12.013a55.947 55.947 0 0 0 3.586-23.562C118.117 24.015 94.806 1.206 66.338.048 34.345-1.254 8 24.296 8 56c0 19.026 9.497 35.825 24 45.945V488c0 13.255 10.745 24 24 24h16c13.255 0 24-10.745 24-24v-94.4c28.311-12.064 63.582-22.122 114.435-22.122 53.588 0 97.844 34.783 165.217 34.783 48.169 0 86.667-16.294 122.505-40.858C506.84 359.452 512 349.571 512 339.045v-243.1c0-23.393-24.269-38.87-45.485-29.016-34.338 15.948-76.454 31.854-116.95 31.854z"></path></svg>'
        cell.append(flag)
        flagCounter.textContent = parseInt(flagCounter.textContent)-1
    } else if(cellData.flagged){
        cell.removeChild(cell.firstChild)
        flagCounter.textContent = parseInt(flagCounter.textContent)+1
    }
    flagSound.play()
    flagSound.currentTime = 0
    cellData.flagged = !cellData.flagged
    
    
    }

/**
 * reveals the state of the cell to the user
 * @param  {HTMLElement} cell the visual representation of the cell
 * @param  {Cell[]} board array containing all Cells of the gameBoard
 */
function revealCell(cell, board){
    let cellData = board[cell.getAttribute('cell-position-data')]
    
    if(cellData.flagged) return

    if(cellData.hasBomb) {
        endGame(-1)
        return
    }

    if(cellData.revealed) return
    
    cellData.revealed = true
    cell.classList.add('revealed')
    revealSound.play()

    if(cellData.numOfNearbyBombs === 0) {
        revealNeighbooringCells(cell, board)
        return
    }

    cell.classList.add(`bomb-${cellData.numOfNearbyBombs}`)
    cell.textContent = cellData.numOfNearbyBombs
}

/**
 * Reveals neighbooring  cells for when the initially revealed cell is nearby no bombs
 * @param  {HTMLElement} cell the visual representation of the cell
 * @param  {Cell[]} board array containing all Cells of the gameBoard
 */
function revealNeighbooringCells(cell, board){
    let cellData = board[cell.getAttribute('cell-position-data')]

    cellData.neighboorCells.forEach(neighboorCell => revealCell(
        document.querySelectorAll(`[cell-position-data="${neighboorCell}"]`).item(0),
        board,
        true)
        )
}

function endGame(gameStatus){
    if(gameStatus === -1) console.log('player lost')

    if(gameStatus === 1) console.log('player won')
}

const currentGame = createGameboard(difficulty)

drawNewGameBoard(currentGame)
