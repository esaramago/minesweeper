import '/src/css/main.scss';


const Minesweeper = {

    // constants
    mines: 2,
    gridRows: 9,
    longPress: false,
    longPressTime: 500,
    delay: null,

    // variables
    isLost: false,
    isWon: false,
    revealedCells: 0,
    grid: [],


    init() {

        this.setGrid();
        this.renderGrid();
        console.log(this.grid);

        var grid = document.getElementById('grid');

        grid.addEventListener('mousedown', this.onPressCell.bind(this));
        grid.addEventListener('mouseup', this.onLeaveCell.bind(this));
        /* document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }); */

    },
    setGrid() {

        for (let row = 0; row < this.gridRows; row++) {
            
            var cells = [];
            for (let cell = 0; cell < this.gridRows; cell++) {
                
                var hasMine = false;
                if (row === 0 && cell === 2 || row === 1 && cell === 1) {
                    hasMine = true;
                }

                cells.push({
                    hasMine: hasMine,
                    number: 0
                });
            }
            this.grid.push(cells);
        }

    },
    setPositions(row, col) {

        var positions = [
            { // top
                row(row) {return row-1},
                col(col) {return col}
            },
            { // topRight
                row(row) {return row-1},
                col(col) {return col+1}
            },
            { // right
                row(row) {return row},
                col(col) {return col+1}
            },
            { // rightBottom
                row(row) {return row+1},
                col(col) {return col+1}
            },
            { // bottom
                row(row) {return row+1},
                col(col) {return col}
            },
            { // bottomLeft
                row(row) {return row+1},
                col(col) {return col-1}
            },
            { // left
                row(row) {return row},
                col(col) {return col-1}
            },
            { // leftTop
                row(row) {return row-1},
                col(col) {return col-1}
            },
        ];

        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];

            var rowPos = pos.row(row);
            var colPos = pos.col(col);

            //debugger
            if (rowPos > -1 & rowPos < this.gridRows && colPos > -1 && colPos < this.gridRows) {// check if cell is inside the grid
                this.grid[rowPos][colPos].number++;
            }
        }
    },  

    onPressCell(e) {
        this.longPress = false;
        this.delay = setTimeout(toggleFlag.bind(this, e.target), this.longPressTime);

        function toggleFlag(btn) {
            this.longPress = true;
            btn.classList.toggle('has-flag');
        }
    },
    onLeaveCell(e) {

        if (!this.longPress && e.target.matches('button') && !e.target.matches('.has-flag')) {

            this.revealCell(e.target);

            if (this.isLost) {

                document.getElementById('grid').querySelectorAll('button').forEach(e => {
                    this.revealCell(e);
                });

                _disableGrid();
                alert('Perdeste!');
            }
            else {
                this.revealedCells++; // add one revealed cell
                var totalCells = this.gridRows * this.gridRows; // get number of cells
                var notrevealedCells = totalCells - this.mines - this.revealedCells;

                if (notrevealedCells === 0) {
                    this.isWon = true;
                    _disableGrid();
                    alert('Ganhaste!!!');
                }
            }
        }

        function _disableGrid() {
            document.getElementById('grid').classList.add('is-disabled');
        }

        clearTimeout(this.delay);
    },


    revealCell(btn) {

        var row = btn.dataset.row;
        var col = btn.dataset.col;

        var html = '';
        var cell = this.grid[row][col];
        if (cell.hasMine) {
            btn.classList.add('has-mine');
            this.isLost = true;
        }
        else if (cell.number > 0) {
            html = this.renderCellContent(cell.number);
        }

        btn.classList.add('is-revealed');
        btn.innerHTML = html;
        btn.disabled = true;

    },
    renderCellContent(content) {
        return `<span>${content}</span>`
    },

    renderGrid() {

        var html = '';

        for (let row = 0; row < this.grid.length; row++) {
            var rowNr = row;
            const cells = this.grid[row];

            for (let col = 0; col < cells.length; col++) {
                var colNr = col;
                const cell = cells[col];

                // set data
                if (cell.hasMine) {
                    this.setPositions(rowNr, colNr);
                }

                // render cell
                html = html + _renderCell(rowNr, colNr);

            }
        }

        function _renderCell(row, col) {
            return `<button class="c-cell" data-col="${col}" data-row="${row}"></button>`;
        }

        document.getElementById('grid').innerHTML = html;

    }
}
Minesweeper.init();