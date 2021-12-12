
export default class GameBoard{
    boardData = []
    rowNum = 0
    colNum = 0
    dimension = []
    bombNum = 0
    cellsRevealed = 0

    constructor(board, [colNum,rowNum], bombNum){
        this.boardData = board
        this.rowNum = rowNum
        this.colNum = colNum
        this.dimension = [colNum,rowNum]
        this.bombNum = bombNum
    }
    /**
     * Gives each cell the value of of bombs surrounding it and adds that number to the display
     */
    setUpCellWarnings(){
        this.boardData.forEach(cell =>{
            cell.determineValidNeighboors(this)
            if(cell.hasBomb){
                cell.neighboorCells.forEach(neighboor => this.boardData[neighboor].numOfNearbyBombs += 1)
            }
        })
    }
}