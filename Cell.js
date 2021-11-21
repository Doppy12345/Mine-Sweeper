import GameBoard from "./GameBoard.js"

export default class Cell {
    hasBomb
    index
    numOfNearbyBombs
    flagged
    revealed
    numOfNeighboors
    neighboorCells

    constructor(hasBomb,index){
        this.hasBomb = hasBomb
        this.index = index
        this.numOfNearbyBombs = 0
        this.numOfNeighboors = 0
        this.revealed = false
        this.flagged = false
    }

    /**
     * Determine which board indecies represent valid neighboors to the original cell
     * @param  {GameBoard} gameBoard the game board containing the game state
     */
    determineValidNeighboors(gameBoard){
        let [above, below] = [this.index - gameBoard.colNum, this.index + gameBoard.colNum]
        let neighboors = [above-1, above, above+1, this.index-1, -1, this.index+1, below-1, below, below+1]
       //above is checked by default
       
        //check below
        if(below > gameBoard.boardData.length-1){
            neighboors[6] = -1
            neighboors[7] = -1
            neighboors[8] = -1
        }
        //check left
        if(this.index % gameBoard.colNum == 0){
            neighboors[6] = -1
            neighboors[3] = -1
            neighboors[0] = -1
        }
        //check right
        else if(this.index % gameBoard.colNum == gameBoard.colNum-1){
            neighboors[5] = -1
            neighboors[8] = -1
            neighboors[2] = -1
        }
        
        this.neighboorCells = neighboors.filter(neighboor => neighboor >= 0)

    }

}