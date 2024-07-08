// let canvas = document.getElementById("#canvas");
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let introSentence = document.getElementsByClassName("sentence")[0];
let grid, animation;

function resize() {
	canvas.width = window.innerWidth - 60;
	canvas.height = window.innerHeight - 125;
	if (grid) {
		grid.init();
		grid.cellUpdate();
		for (let i = 0; i < grid.grid.length; i++) {
			for (let j = 0; j < grid.grid[0].length; j++) {
				grid.grid[i][j].textMeasurement();
			}
		}
	}
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
	constructor(length, x, y, loc, minesUnder, mines, checked, hue) {
		this.length = length;
		this.x = x;
		this.y = y;
		this.loc = loc;
		this.minesUnder = minesUnder;
		this.mines = mines;
		this.checked = checked;
		this.hue = hue;
		this.setUp();
	}
	setUp() {
		this.evenX = this.loc[0] % 2 ? false : true;
		this.evenY = this.loc[1] % 2 ? false : true;
		this.theme = [
			{
				sat: 79,
				light: 46,
			},
			{
				sat: 90,
				light: 61,
			},
		];
		this.choose =
			(this.evenX && !this.evenY) || (!this.evenX && this.evenY) ? 1 : 0; // 0 -> dark, 1 -> light
		this.fillStyle = `hsl(${this.hue}, ${this.theme[this.choose].sat}%, ${
			this.theme[this.choose].light
		}%)`;
		// ground: #d7b899 -> dark, #e5c29f -> light
		this.choose
			? (this.groundFill = "#e5c29f")
			: (this.groundFill = "#d7b899");
	}
	textConfig() {
		let colors = [
			"#558b2f",
			"#004d40",
			"#fdd835",
			"#ff9800",
			"#1976d2",
			"#673ab7",
			"#e91e63",
			"#37474f",
		];
		this.color = colors[this.mines - 1];
		console.log(this.mines, this.color);
		this.textMeasurement();
	}
	textMeasurement() {
		ctx.font = `900 ${this.length / 2}px Roboto`;
		let measure = ctx.measureText(this.mines.toString());
		this.textWidth = measure.width;
		this.textHeight =
			measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
	}
	draw() {
		if (this.checked) {
			ctx.fillStyle = this.groundFill;
			ctx.fillRect(this.x, this.y, this.length, this.length);
			ctx.fillStyle = this.color;
			if (this.mines != 0) {
				ctx.fillText(
					this.mines,
					this.x + this.length / 2 - this.textWidth / 2,
					this.y + this.length - this.textHeight
				);
			}
		} else {
			ctx.fillStyle = this.fillStyle;
			ctx.fillRect(this.x, this.y, this.length, this.length);
		}
	}
}

class Grid {
	constructor(dimension, mines, hue) {
		this.dimension = dimension;
		this.grid = [];
		this.mines = mines;
		this.hue = hue;
		this.setUp();
	}

	setUp() {
		this.init();
		this.gridSetup();
		this.placeMines();
		this.nearbyMines();
	}

	init() {
		this.length = [canvas.width, canvas.height];
		if (
			this.length[0] > this.length[1] &&
			this.dimension[0] < this.dimension[1]
		) {
			[this.dimension[0], this.dimension[1]] = [
				this.dimension[1],
				this.dimension[0],
			];
		} else if (
			this.length[0] < this.length[1] &&
			this.dimension[0] > this.dimension[1]
		) {
			[this.dimension[0], this.dimension[1]] = [
				this.dimension[1],
				this.dimension[0],
			];
		}
		let Wwise = Math.floor(this.length[0] / this.dimension[0]);
		let Hwise = Math.floor(this.length[1] / this.dimension[1]);
		this.cellLength = Wwise > Hwise ? Hwise : Wwise;
		this.gridLength = [
			this.dimension[0] * this.cellLength,
			this.dimension[1] * this.cellLength,
		];
		this.offX = (this.length[0] - this.gridLength[0]) / 2;
		this.offY = (this.length[1] - this.gridLength[1]) / 2;
	}

	cellUpdate() {
		if (this.dimension[1] != this.grid.length) {
			let temp = [];
			for (let i = 0; i < this.dimension[1]; i++) {
				let row = [];
				for (let j = 0; j < this.dimension[0]; j++) {
					this.grid[j][i].loc = [i, j];
					row.push(this.grid[j][i]);
				}
				temp.push(row);
			}
			this.grid = temp;
		}
		for (let i = 0; i < this.dimension[1]; i++) {
			for (let j = 0; j < this.dimension[0]; j++) {
				this.grid[i][j].length = this.cellLength;
				let y = this.cellLength * i + this.offY;
				let x = this.cellLength * j + this.offX;
				this.grid[i][j].x = x;
				this.grid[i][j].y = y;
			}
		}
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
					false,
					this.hue
				);
				row.push(cell);
			}
			this.grid.push(row);
		}
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
					if (!this.grid[current[0]][current[1]].minesUnder) {
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
						this.grid[current[0]][current[1]].textConfig();
					}
				} catch (e) {}
			});
		}
	}
}

canvas.addEventListener("click", (eve) => {
	let x = eve.offsetX - grid.offX;
	let y = eve.offsetY - grid.offY;
	console.log(
		Math.floor(x / grid.cellLength),
		Math.floor(y / grid.cellLength)
	);
	let xLoc = Math.floor(x / grid.cellLength);
	let yLoc = Math.floor(y / grid.cellLength);

	if (
		xLoc >= 0 &&
		xLoc < grid.dimension[0] &&
		yLoc >= 0 &&
		yLoc < grid.dimension[1]
	) {
		grid.grid[yLoc][xLoc].checked = true;
	}
});

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
let abort = false;
function drawFrames() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < grid.grid.length; i++) {
		for (let j = 0; j < grid.grid[0].length; j++) {
			grid.grid[i][j].draw();
		}
	}
	animation = requestAnimationFrame(drawFrames);
	if (abort) cancelAnimationFrame(animation);
}
