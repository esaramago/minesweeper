import '/src/css/main.scss';


const Minesweeper = {

    isLost: false,
    isWon: false,

    mines: 2,
    revealedCells: 0,
    gridRows: 3,
    grid: [
        {
            row: [
                {
                    cell: {
                        hasMine: false,
                        number: 0,
                        row: 1
                    }
                },
                {
                    cell: {
                        hasMine: false,
                        number: 0,
                        row: 1
                    }
                },
                {
                    cell: {
                        hasMine: true,
                        number: 0,
                        row: 1
                    }
                }
            ]
        },
        {
            row: [
                {
                    cell: {
                        hasMine: false,
                        number: 0,
                        row: 2
                    }
                },
                {
                    cell: {
                        hasMine: true,
                        number: 0,
                        row: 2
                    }
                },
                {
                    cell: {
                        hasMine: false,
                        number: 0,
                        row: 2
                    }
                }
            ]
        },
        {
            row: [
                {
                    cell: {
                        hasMine: false,
                        number: 0
                    }
                },
                {
                    cell: {
                        hasMine: false,
                        number: 0
                    }
                },
                {
                    cell: {
                        hasMine: false,
                        number: 0
                    }
                }
            ]
        }

    ],

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
                this.grid[rowPos].row[colPos].cell.number++;
            }
        }
    },

    init() {
        
        this.renderGrid();
        console.log(this.grid);
        //this.renderGrid();

        document.getElementById('grid').addEventListener('click', this.onClickCell.bind(this));

    },
    onClickCell(e) {

        if (e.target.matches('button')) {

            this.revealCell(e.target);

            if (this.isLost) {

                document.getElementById('grid').querySelectorAll('button').forEach(e => {
                    this.revealCell(e);
                });

                alert('Perdeste!');
            }
            else {
                this.revealedCells++; // add one revealed cell
                var totalCells = this.gridRows * this.gridRows; // get number of cells
                var notrevealedCells = totalCells - this.mines - this.revealedCells;

                if (notrevealedCells === 0) {
                    this.isWon = true;
                    alert('Ganhaste!!!');
                }
            }
        }
    },
    revealCell(btn) {

        var row = btn.dataset.row;
        var col = btn.dataset.col;

        var html = '';
        var cell = this.grid[row].row[col].cell;
        if (cell.hasMine) {
            html = this.renderCellContent('⚑');
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
            const cells = this.grid[row].row;

            for (let col = 0; col < cells.length; col++) {
                var colNr = col;
                const cell = cells[col].cell;

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
