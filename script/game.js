// let canvas = document.getElementById("#canvas");
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let introSentence = document.getElementsByClassName("sentence")[0];
let grid;

function resize() {
	canvas.width = window.innerWidth - 60;
	canvas.height = window.innerHeight - 125;
}

window.addEventListener("resize", resize);
window.addEventListener("load", () => {
	resize();
	write(introSentence.innerHTML);
});

let writing;

function write(text) {
	if (writing) {
		clearInterval(writing);
	}

	introSentence.innerHTML = "";
	text = text.split("");
	let index = 0;

	writing = setInterval(() => {
		if (index < text.length) {
			introSentence.innerHTML += text[index];
			index++;
		} else clearInterval(writing);
	}, 90);
}

class Cell {
	constructor(length, x, y, loc, minesUnder, mines, checked) {
		this.length = length;
		this.x = x;
		this.y = y;
		this.loc = loc;
		this.minesUnder = minesUnder;
		this.mines = mines;
		this.checked = checked;
	}

	draw() {}
}

class Grid {
	constructor(dimension, mines) {
		this.dimension = dimension;
		this.grid = [];
		this.mines = mines;
		this.init();
	}

	init() {
		this.length = [canvas.width, canvas.height];
		this.divs =
			this.dimension[0] > this.dimension[1]
				? this.dimension[0]
				: this.dimension[1];
		if (this.length[0] > this.length[1]) {
			this.cellLength = this.length[0] / this.divs;
			this.dimension[0] < this.dimension[1]
				? ([this.dimension[0], this.dimension[1]] = [
						this.dimension[1],
						this.dimension[0],
				  ])
				: null;
		} else {
			this.cellLength = this.length[1] / this.divs;
			this.dimension[0] > this.dimension[1]
				? ([this.dimension[0], this.dimension[1]] = [
						this.dimension[1],
						this.dimension[0],
				  ])
				: null;
		}
		this.gridLength = [
			this.dimension[0] * this.cellLength,
			this.dimension[1] * this.cellLength,
		];
		this.offX = (this.length[0] - this.gridLength[0]) / 2;
		this.offY = (this.length[1] - this.gridLength[1]) / 2;
		this.gridSetup();
	}

	gridSetup() {
		for (let i = 0; i < this.dimension[1]; i++) {
			let row = [];
			for (let j = 0; j < this.dimension[0]; j++) {
				let y = this.cellLength * i + this.offY;
				let x = this.cellLength * j + this.offX;
				let cell = new Cell(
					this.cellLength,
					x,
					y,
					[i, j],
					false,
					0,
					false
				);
				row.push(cell);
			}
			this.grid.push(row);
		}
		this.placeMines();
	}

	placeMines() {
		this.minesLoc = [];
		let mineLoc;
		for (let i = 0; i < this.mines; i++) {
			mineLoc = locCalc(this.dimension);
			check(this.minesLoc, mineLoc, this.dimension);
			this.minesLoc.push(mineLoc);
			this.grid[mineLoc[0]][mineLoc[1]].minesUnder = true;
		}
		function locCalc(dimension) {
			let x = Math.floor(Math.random() * dimension[1]);
			let y = Math.floor(Math.random() * dimension[0]);
			return [x, y];
		}
		function check(minesLoc, testMine, dimension) {
			for (let i = 0; i < minesLoc.length; i++) {
				if (
					minesLoc[i][0] == testMine[0] &&
					minesLoc[i][1] == testMine[1]
				) {
					mineLoc = locCalc(dimension);
					check(minesLoc, mineLoc, dimension);
				}
			}
		}
		this.nearbyMines();
	}

	nearbyMines() {
		for (let i = 0; i < this.minesLoc.length; i++) {
			let directions = [
				[0, 1],
				[0, -1],
				[1, 0],
				[-1, 0],
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1],
			];
			directions.forEach((direction) => {
				try {
					let current = [
						this.minesLoc[i][0] + direction[0],
						this.minesLoc[i][1] + direction[1],
					];
					let mineCount = 0;
					directions.forEach((direction) => {
						try {
							this.grid[current[0] + direction[0]][
								current[1] + direction[1]
							].minesUnder
								? mineCount++
								: null;
						} catch (e) {}
					});
					this.grid[current[0]][current[1]].mines = mineCount;
				} catch (e) {}
			});
		}
	}
}

canvas.addEventListener("click", () => console.log("click"));

function test() {
	let table = [];
	for (let i = 0; i < grid.grid.length; i++) {
		let row = [];
		for (let j = 0; j < grid.grid[0].length; j++) {
			grid.grid[i][j].minesUnder
				? row.push("❌")
				: row.push(grid.grid[i][j].mines);
		}
		table.push(row);
	}
	return table;
}
