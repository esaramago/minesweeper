import '/src/css/main.scss';

const Minesweeper = {

    // content
    content: {
        nextLevel: 'Next level',
        restart: 'Restart',
        hiddenCell: 'Hidden cell',
    },

    // elements
    elements: {
        grid: document.getElementById('grid'),
        restart: document.querySelector('.js-restart'),
        levelCurrent: document.querySelector('.js-level-current'),
        levelBest: document.querySelector('.js-level-best'),
        levelBestContainer: document.querySelector('.js-level-best-container'),
    },

    // constants
    minesNumber: 15,
    gridRows: 8,
    longPressTime: 400,

    // levels
    levelCurrent: 1,
    levelBest: null,

    init() {
        // set grid styles
        this.elements.grid.style.gridTemplateColumns = `repeat(${this.gridRows}, 1fr)`;
        this.elements.grid.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;

        this.start();

        // events for desktop
        this.elements.grid.addEventListener('touchstart', this.onPressCell.bind(this), {passive: true});
        this.elements.grid.addEventListener('touchend', this.onLeaveCell.bind(this), {passive: true});

        // events for mobile
        this.elements.grid.addEventListener('mousedown', this.onPressCell.bind(this));
        this.elements.grid.addEventListener('mouseup', this.onLeaveCell.bind(this));

        // on restart event
        this.elements.restart.addEventListener('click', this.onRestart.bind(this));
        
    },
    start() {
        // variables
        this.delay = null;
        this.longPress = false;
        this.isLost = false;
        this.isWon = false;
        this.revealedCells = 0;
        this.mines = [];
        this.grid = [];
        this.levelBest = localStorage.getItem('levelBest');

        this.renderLevels();
        this.setMines();
        this.setGrid();
        this.renderGrid();
    },

    //#region SET
    setMines() {

        const that = this;

        // add random mines
        var min = 0;
        var max = this.gridRows - 1;
        for (let i = 0; i < this.minesNumber; i++) {
            _addMine();
        }

        function _addMine() {
            var row = _randomIntFromInterval(min, max);
            var col = _randomIntFromInterval(min, max);

            // check if is repeated
            var isRepeated = that.mines.findIndex(x => {
                return x.row == row && x.col == col
            });

            // push to array if is not repeated
            if (isRepeated < 0) {
                that.mines.push({
                    row: row,
                    col: col
                });
            }
            else {
                _addMine(); // run function until mine position is not repeated
            }
        }

        function _randomIntFromInterval(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    },
    setGrid() {

        for (let row = 0; row < this.gridRows; row++) {
            
            var cells = [];
            for (let cell = 0; cell < this.gridRows; cell++) {

                var hasMine = this.mines.findIndex(x => x.row === row && x.col === cell) > -1;
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

            if (rowPos > -1 & rowPos < this.gridRows && colPos > -1 && colPos < this.gridRows) {// check if cell is inside the grid
                this.grid[rowPos][colPos].number++;
            }
        }
    },
    //#endregion SET


    //#region RENDER
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

        var _this = this;
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
            return `
                <button class="c-cell" data-col="${col}" data-row="${row}">
                    <span class="is-visually-hidden">${_this.content.hiddenCell}</span>
                </button>`;
        }

        document.getElementById('grid').innerHTML = html;

    },

    renderLevels() {
        this.elements.levelCurrent.textContent = this.levelCurrent;
        if (this.levelBest) {
            this.elements.levelBest.textContent = this.levelBest;
            this.elements.levelBestContainer.removeAttribute('hidden');
        }
    },
    //#endregion RENDER


    //#region EVENTS
    onPressCell(e) {

        this.longPress = false;
        this.delay = setTimeout(toggleFlag.bind(this, e.target), this.longPressTime);

        function toggleFlag(btn) {
            btn.classList.toggle('has-flag');
            this.longPress = true;
        }
    },
    onLeaveCell(e) {

        // prevent tap more than one cell at the same time
        var _this = this;
        this.disableGrid();
        setTimeout(() => {
            _this.enableGrid();
        }, 80);

        if (!this.longPress && e.target.matches('button') && !e.target.matches('.has-flag')) {

            this.revealCell(e.target);

            if (this.isLost) {

                // GAME LOST :(

                document.getElementById('grid').querySelectorAll('button').forEach(e => {
                    this.revealCell(e);
                });
                
                this.disableGrid();
                this.elements.restart.textContent = this.content.restart; // set restart text
                document.body.classList.add('is-lost');

                
                this.levelCurrent = 1; // back to level 1
                
            }
            else {
                this.revealedCells++; // add one revealed cell
                var totalCells = this.gridRows * this.gridRows; // get number of cells
                var notRevealedCells = totalCells - this.minesNumber - this.revealedCells;
                if (notRevealedCells === 0) {

                    // GAME WON!!!
                    this.isWon = true;
                    
                    this.disableGrid();
                    this.elements.restart.textContent = this.content.nextLevel; // set restart text
                    document.body.classList.add('is-won');

                    // save level in localstorage
                    if (this.levelCurrent > this.levelBest) {
                        this.levelBest = this.levelCurrent;
                        localStorage.setItem('levelBest', this.levelCurrent);
                    }
                    ++this.levelCurrent;

                }
            }
        }

        clearTimeout(this.delay);


    },

    onRestart() {
        
        this.elements.grid.classList.remove('is-disabled');
        this.elements.grid.innerHTML = '';

        document.body.classList.remove('is-lost');
        document.body.classList.remove('is-won');

        this.start();
    },
    //#endregion EVENTS


    //#region GENERAL
    disableGrid() {
        this.elements.grid.classList.add('is-disabled');
    },
    enableGrid() {
        this.elements.grid.classList.remove('is-disabled');
    }
    //#endregion GENERAL
}
Minesweeper.init();

// set Minesweeper global
//window.Minesweeper = Minesweeper;