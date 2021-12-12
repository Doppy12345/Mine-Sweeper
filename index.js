import Cell from "./Cell.js";
import GameBoard from "./GameBoard.js"

const revealSound = document.getElementById('cell-reveal-sound')
revealSound.volume = 0.1


/**
 * Shows the inital game select screen when the game is first initialized
 */
function showInitialSelect(gameboard){
    const gameselectWindow = document.getElementById('game-select-window')
    const gameSelect = document.getElementById('game-select')
    const diffSwitch =  document.getElementById('difficulty-switch')
    fadeIn(gameSelect)
    setUpSelectMenu('Choose Difficulty', 
    [{text: 'Easy', onClick: function(){
            gameselectWindow.classList.toggle('hidden')
            gameSelect.classList.remove('visible')
            diffSwitch.checked = false
            gameboard = updateDifficulty('easy')
        }
        }, {text: 'Hard', onClick: function(){
            gameselectWindow.classList.toggle('hidden')
            diffSwitch.checked = true
            gameboard = updateDifficulty('hard')
        }
    }])
}

function showLossScreen(gameboard){
    const gameSelectWindow = document.getElementById('game-select-window')
    const gameSelect = document.getElementById('game-select')
    const diffSwitch =  document.getElementById('difficulty-switch')
    gameSelectWindow.classList.remove('hidden')
    fadeIn(gameSelect)
    setUpSelectMenu('You Lost!', 
    [{text: 'Try Again?', onClick: function(){
            gameSelectWindow.classList.add('hidden')
            gameSelect.classList.remove('visible')
            if(diffSwitch.checked){
                gameboard = updateDifficulty('hard')
                return
            }
            if(!diffSwitch.checked){
                gameboard = updateDifficulty('easy')
            }
        }
    }])
}

function showWinScreen(gameboard){
    const gameSelectWindow = document.getElementById('game-select-window')
    const gameSelect = document.getElementById('game-select')
    const diffSwitch =  document.getElementById('difficulty-switch')
    gameSelectWindow.classList.remove('hidden')
    fadeIn(gameSelect)
    setUpSelectMenu('You Won!', 
    [{text: 'Go Again?', onClick: function(){
            gameSelectWindow.classList.add('hidden')
            gameSelect.classList.remove('visible')
            if(diffSwitch.checked){
                gameboard = updateDifficulty('hard')
                return
            }
            if(!diffSwitch.checked){
                gameboard = updateDifficulty('easy')
            }
        }
    }])
}

/**
 * sets up the game select menu by adding in the subtitle and available buttons
 * @param  {String} subtitle the subtitle for the game select window
 * @param  {Array<{text: String , onClick: function}>} options array containing the text for the options to display in the select window and their onclick functions
 */
function setUpSelectMenu(subtitle, options){
    const gameSelectSubtitle = document.getElementById('game-select-subtitle')
    const gameSelectOptions = document.getElementById('game-select-options')
    gameSelectSubtitle.innerHTML = subtitle
    gameSelectOptions.innerHTML = ''
    options.forEach(option => {
       let selectOption = document.createElement('p')
       selectOption.classList.add('game-select-menu-item')
       selectOption.textContent = option.text
       selectOption.addEventListener('click', e => option.onClick())
       gameSelectOptions.append(selectOption)
    })
}

/**
 * creates the game board object to store the state of the game
 * @param  {String} difficulty either easy or hard, determines board size and bomb number
 * @returns {GameBoard} a new GameBoard object
 */
function createGameboard(difficulty){
    let bombNum
    let boardSize
    const diffSwitch = document.getElementById('difficulty-switch')
    switch (difficulty){
        case 'hard':
            bombNum = Math.floor(Math.random() * 16) + 30;
            boardSize = [18,14]
            diffSwitch.checked = true
            break
        case 'easy':
            bombNum = Math.floor(Math.random() * 10) + 10;
            boardSize = [10, 8]
    }

    return new GameBoard(buildGameBoard(bombNum, boardSize), boardSize, bombNum)    
}

/**
 * Sets up event listener to listen to diffulty toggle
 */
function setUpDifficultySelector(gameboard){
    const diffSwitch =  document.getElementById('difficulty-switch')
    diffSwitch.addEventListener('change', (e) => {
        if(e.target.checked) {
            gameboard = updateDifficulty('hard')
            return 
        }
        gameboard = updateDifficulty('easy')
        
    })
}
/**
 * Updates the difficulty of the game and draws a new gameboard using that difficulty
 * @param  {String} difficulty string representing the difficulty to set the game either hard or easy
 */
function updateDifficulty(difficulty){
    const gameWindow = document.getElementById('game-window')
    const difficultyComplements = {easy: 'hard', hard: 'easy'}
    gameWindow.classList.replace(difficultyComplements[difficulty], difficulty)
    drawNewGameBoard(createGameboard(difficulty))
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
    clearGameBoard(gameWindow)
    const flagCounter = document.getElementById('flag-counter').lastChild
    flagCounter.textContent = gameBoard.bombNum

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
            
            revealCell(cell, gameBoard)
        })
        
        gameWindow.append(cell)
    }

}

function clearGameBoard(gameWindow){
    gameWindow.innerHTML = ''
}

function fadeIn(Element){
    setTimeout(function(){
        Element.classList.add('visible')}, 10)
    
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

        if(parseInt(flagCounter.textContent) == 0) return

        const flag = document.createElement('div')
        flag.innerHTML = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="flag" class="svg-inline--fa fa-flag fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M349.565 98.783C295.978 98.783 251.721 64 184.348 64c-24.955 0-47.309 4.384-68.045 12.013a55.947 55.947 0 0 0 3.586-23.562C118.117 24.015 94.806 1.206 66.338.048 34.345-1.254 8 24.296 8 56c0 19.026 9.497 35.825 24 45.945V488c0 13.255 10.745 24 24 24h16c13.255 0 24-10.745 24-24v-94.4c28.311-12.064 63.582-22.122 114.435-22.122 53.588 0 97.844 34.783 165.217 34.783 48.169 0 86.667-16.294 122.505-40.858C506.84 359.452 512 349.571 512 339.045v-243.1c0-23.393-24.269-38.87-45.485-29.016-34.338 15.948-76.454 31.854-116.95 31.854z"></path></svg>'
        cell.append(flag)
        flagCounter.textContent = parseInt(flagCounter.textContent)-1
    } else if(cellData.flagged){
        cell.removeChild(cell.firstChild)
        flagCounter.textContent = parseInt(flagCounter.textContent)+1
    }
    cellData.flagged = !cellData.flagged
    
    
    }

/**
 * reveals the state of the cell to the user
 * @param  {HTMLElement} cell the visual representation of the cell
 * @param  {GameBoard} gameboard the current gameBoard
 */
function revealCell(cell, gameboard){
    const boardData = gameboard.boardData
    let cellData = boardData[cell.getAttribute('cell-position-data')]
    
    if(cellData.flagged) return

    if(cellData.hasBomb) {
        endGame(-1, gameboard)
        return
    }

    if(cellData.revealed) return
    
    cellData.revealed = true
    cell.classList.add('revealed')
    revealSound.play()
    gameboard.cellsRevealed += 1

    if(cellData.numOfNearbyBombs === 0) {
        revealNeighbooringCells(cell, gameboard)
        return
    }

    cell.classList.add(`bomb-${cellData.numOfNearbyBombs}`)
    cell.textContent = cellData.numOfNearbyBombs
    checkForWin(gameboard)
}

/**
 * Reveals neighbooring  cells for when the initially revealed cell is nearby no bombs
 * @param  {HTMLElement} cell the visual representation of the cell
 * @param  {GameBoard} gameboard the current GameBoard
 */
function revealNeighbooringCells(cell, gameboard){
    let cellData = gameboard.boardData[cell.getAttribute('cell-position-data')]

    cellData.neighboorCells.forEach(neighboorCell => revealCell(
        document.querySelectorAll(`[cell-position-data="${neighboorCell}"]`).item(0),
        gameboard)
        )
}
/**
 * @param  {GameBoard} gameboard the current GameBoard Object
 */
function checkForWin(gameboard){
   if(gameboard.boardData.length - gameboard.cellsRevealed == gameboard.bombNum)
    endGame(1, gameboard)
}

function endGame(gameStatus, gameboard){
    if(gameStatus < 0) showLossScreen(gameboard)
    if(gameStatus === 1) showWinScreen(gameboard)
}


let gameBoard
setUpDifficultySelector(gameBoard)
showInitialSelect(gameBoard)


