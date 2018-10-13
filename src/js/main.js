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
    minesNumber: 5,
    gridRows: 8,
    longPressTime: 400,

    // levels
    levelCurrent: 1,
    levelBest: null,

    positions: [
        { // top
            row(row) { return row - 1 },
            col(col) { return col }
        },
        { // topRight
            row(row) { return row - 1 },
            col(col) { return col + 1 }
        },
        { // right
            row(row) { return row },
            col(col) { return col + 1 }
        },
        { // rightBottom
            row(row) { return row + 1 },
            col(col) { return col + 1 }
        },
        { // bottom
            row(row) { return row + 1 },
            col(col) { return col }
        },
        { // bottomLeft
            row(row) { return row + 1 },
            col(col) { return col - 1 }
        },
        { // left
            row(row) { return row },
            col(col) { return col - 1 }
        },
        { // leftTop
            row(row) { return row - 1 },
            col(col) { return col - 1 }
        },
    ],

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
        this.isFirstMove = true;
        this.maxCoordinate = this.gridRows - 1;

        this.renderLevels();
        
        // add random mines
        for (let i = 0; i < this.minesNumber; i++) {
            this.addMine();
        }

        this.setGrid();
        this.renderGrid();
    },

    //#region SET
    addMine() {

        const _this = this;

        var row = _randomIntFromInterval();
        var col = _randomIntFromInterval();

        // check if is repeated
        var isRepeated = this.mines.findIndex(x => {
            return x.row == row && x.col == col
        });

        // push to array if is not repeated
        if (isRepeated < 0) {
            this.mines.push({
                row: row,
                col: col
            });
        }
        else {
            this.addMine(); // run function until mine position is not repeated
        }

        function _randomIntFromInterval() {
            return Math.floor(Math.random() * (_this.maxCoordinate - 0 + 1) + 0); // 0 == min coordinate
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

        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];

            var rowPos = pos.row(row);
            var colPos = pos.col(col);

            if (this.isCellInsideGrid(rowPos, colPos)) {// check if cell is inside the grid
                this.grid[rowPos][colPos].number++;
            }
        }
    },
    //#endregion SET


    //#region RENDER
    revealCell(btn) {

        var _this = this;
        var row = parseInt(btn.dataset.row);
        var col = parseInt(btn.dataset.col);
        
        var html = '';
        var cell = this.grid[row][col];

        if (cell.hasMine) {

            // prevent to loose on first move
            if (this.isFirstMove) {

                // remove mine
                var indexOfMine = this.mines.findIndex(x => x.row === row && x.col === col);
                this.mines.splice(indexOfMine, 1);

                // change the position of the mine
                this.addMine();

                // restart
                this.grid = [];
                this.setGrid();
                this.renderGrid();

                var btn = this.elements.grid.querySelector(`[data-row="${row}"][data-col="${col}"]`)
                this.revealCell(btn);
            }
            else {
                // Lost :( !!!
                btn.classList.add('has-mine');
                this.isLost = true;
            }
        }
        else if (cell.number > 0) { // has number
            html = this.renderCellContent(cell.number);
        }
        else { // is empty
            
            for (let i = 0; i < this.positions.length; i++) {
                var pos = this.positions[i];
                
                var rowPos = pos.row(row);
                var colPos = pos.col(col);
                
                if (this.isCellInsideGrid(rowPos, colPos)) {// check if cell is inside the grid
                    var btnX = this.elements.grid.querySelector(`[data-row="${rowPos}"][data-col="${colPos}"]`);
                    if (btnX) {
                        var isRevealed = btnX.classList.contains('is-revealed');
                        if (!isRevealed) {
                            
                            // reveal cell
                            var cellX = this.grid[rowPos][colPos];
                            var htmlX = this.renderCellContent(cellX.number);
                            _render(btnX, htmlX);
                        }
                    }
                    
                }
            }
        }

        _render(btn, html);

        this.isFirstMove = false;
        
        function _render(btn, html) {
            // reveal cell
            btn.classList.add('is-revealed');
            btn.innerHTML = html;
            btn.disabled = true;
            _this.revealedCells++; // add one revealed cell
        }

    },
    renderCellContent(number) {
        var number = number || ''; // prevent zeros
        return `<span>${number}</span>`
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
            if(!this.isLost && !this.isWon)
                _this.enableGrid();
        }, 60);

        if (!this.longPress && e.target.matches('button') && !e.target.matches('.has-flag')) {

            this.revealCell(e.target);

            if (this.isLost) {

                // GAME LOST :(

                this.elements.grid.querySelectorAll('button').forEach(e => {
                    this.revealCell(e);
                });
                
                this.disableGrid();

                this.elements.restart.textContent = this.content.restart; // set restart text
                document.body.classList.add('is-lost');

                this.levelCurrent = 1; // back to level 1
                this.minesNumber = 5; // back to level 1 difficulty
                
            }
            else {
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

                    ++this.levelCurrent; // add one level
                    this.minesNumber = this.minesNumber + 2; // increase difficulty (nr of mines)

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
    },
    isCellInsideGrid(rowPos, colPos) {
        // check if cell with the given coordinates is inside the grid
        return rowPos > -1 & rowPos < this.gridRows && colPos > -1 && colPos < this.gridRows;
    }
    //#endregion GENERAL
}
Minesweeper.init();

// set Minesweeper global
//window.Minesweeper = Minesweeper;