// let canvas = document.getElementById("#canvas");
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let introSentence = document.getElementsByClassName("sentence")[0];
let grid, animation;

let mineImg = new Image();
let mineActive = new Image();
let flag = new Image();

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
	mineImg.src = "./images/mine.png";
	mineActive.src = "./images/mine-active.png";
	flag.src = "./images/flag.svg";
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
	constructor(length, x, y, loc, hue) {
		this.length = length;
		this.x = x;
		this.y = y;
		this.loc = loc;
		this.minesUnder = false;
		this.mines = 0;
		this.checked = false;
		this.hue = hue;
		this.flagged = false;
		this.animation = false;
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
		this.fillStyle = `hsl(${this.hue} ${this.theme[this.choose].sat}% ${
			this.theme[this.choose].light
		}%`;
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
			if (this.minesUnder) {
				ctx.drawImage(
					mineImg,
					this.x,
					this.y,
					this.length,
					this.length
				);
			}
		} else {
			ctx.fillStyle = this.fillStyle;
			ctx.fillRect(this.x, this.y, this.length, this.length);
			if (this.flagged) {
				ctx.drawImage(flag, this.x, this.y, this.length, this.length);
			}
		}
	}

	open() {
		this.checked = true;
		this.opacity = 100;
		this.animation = true;
	}

	openAnimation() {
		this.opacity -= 5;
		if (this.opacity > 0) {
			ctx.fillStyle = this.fillStyle + " / " + this.opacity + "%)";
			console.log(ctx.fillStyle);
			ctx.translate(this.x, this.y);
			ctx.rotate(Math.PI / 4);
			ctx.fillRect(0, 0, this.length, this.length);
			ctx.rotate(-Math.PI / 4);
			ctx.translate(-this.x, -this.y);
		} else this.animation = false;
	}
}

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

class Grid {
	constructor(dimension, mines, hue) {
		this.dimension = dimension;
		this.grid = [];
		this.mines = mines;
		this.hue = hue;
		this.allClosed = true;
		this.init();
		this.gridSetup();
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
				let cell = new Cell(this.cellLength, x, y, [i, j], this.hue);
				row.push(cell);
			}
			this.grid.push(row);
		}
	}

	firstClick(loc) {
		let opened = [];

		openMore(this.grid, loc, 0);

		function openMore(grid, loc, counter, direction) {
			counter++;
			if (direction) {
				let prob = Math.random();
				let currentLoc = [loc[0] + direction[0], loc[1] + direction[1]];
				try {
					if (!grid[currentLoc[0]][currentLoc[1]].checked) {
						opened.push(currentLoc);
					}
					grid[currentLoc[0]][currentLoc[1]].open();
				} catch (e) {}
				if (prob > 0.5) {
					openMore(grid, currentLoc, counter, direction);
				}
				if (prob > 0.4) {
					iAmRunningOUTofNames(grid, currentLoc, counter);
				}
			} else iAmRunningOUTofNames(grid, loc, counter);
		}

		function iAmRunningOUTofNames(grid, loc, counter) {
			directions.forEach((direction) => {
				let prob = Math.random();
				let currentLoc = [loc[0] + direction[0], loc[1] + direction[1]];
				try {
					if (!grid[currentLoc[0]][currentLoc[1]].checked) {
						opened.push(currentLoc);
					}
					grid[currentLoc[0]][currentLoc[1]].open();
				} catch (e) {}
				if (prob > 0.8 && counter < 5)
					openMore(grid, currentLoc, counter, direction);
			});
		}

		this.goldenBlocks = [];
		this.border = [];
		for (let i = 0; i < opened.length; i++) {
			directions.forEach((direction) => {
				let loc = [
					opened[i][0] + direction[0],
					opened[i][1] + direction[1],
				];
				let alreadyExists = false;
				for (let j = 0; j < this.goldenBlocks.length; j++) {
					if (
						this.goldenBlocks[j][0] == loc[0] &&
						this.goldenBlocks[j][1] == loc[1]
					) {
						alreadyExists = true;
					}
				}

				try {
					if (!this.grid[loc[0]][loc[1]].checked) {
						this.border.push(opened[i]);
						if (!alreadyExists) this.goldenBlocks.push(loc);
					}
				} catch (e) {}
			});
		}

		function removeDuplicates(arr) {
			let newArr = [];
			for (let i = 0; i < arr.length; i++) {
				let alreadyExists = false;
				for (let j = 0; j < newArr.length; j++) {
					if (
						arr[i][0] == newArr[j][0] &&
						arr[i][1] == newArr[j][1]
					) {
						alreadyExists = true;
						break;
					}
				}
				if (!alreadyExists) newArr.push(arr[i]);
			}
			return newArr;
		}
		this.border = removeDuplicates(this.border);
		this.placeMines();
	}

	placeMines() {
		this.minesLoc = [];
		let selectedGoldenBlocks = Math.round(this.goldenBlocks.length * 0.5);
		let selectedIndicies = [];
		if (selectedGoldenBlocks > this.mines)
			selectedGoldenBlocks = this.mines;
		for (let i = 0; i < selectedGoldenBlocks; i++) {
			let index,
				alreadyExists = true;
			while (alreadyExists) {
				index = Math.floor(Math.random() * this.goldenBlocks.length);
				for (let j = 0; j < selectedIndicies.length; j++) {
					if (selectedIndicies[j] == index) {
						alreadyExists = true;
						break;
					} else alreadyExists = false;
				}
				if (selectedIndicies.length == 0) alreadyExists = false;
			}
			selectedIndicies.push(index);
			this.grid[this.goldenBlocks[index][0]][
				this.goldenBlocks[index][1]
			].minesUnder = true;
			this.minesLoc.push(this.goldenBlocks[index]);
		}

		let mineLoc;
		for (let i = 0; i < this.mines - selectedGoldenBlocks; i++) {
			mineLoc = locCalc(this.dimension);
			check(this.minesLoc, mineLoc, this.dimension, this.grid);
			this.minesLoc.push(mineLoc);
			this.grid[mineLoc[0]][mineLoc[1]].minesUnder = true;
		}
		function locCalc(dimension) {
			let x = Math.floor(Math.random() * dimension[1]);
			let y = Math.floor(Math.random() * dimension[0]);
			return [x, y];
		}
		function check(minesLoc, testMine, dimension, grid) {
			if (grid[testMine[0]][testMine[1]].checked) {
				mineLoc = locCalc(dimension);
				check(minesLoc, mineLoc, dimension, grid);
			} else {
				for (let i = 0; i < minesLoc.length; i++) {
					if (
						minesLoc[i][0] == testMine[0] &&
						minesLoc[i][1] == testMine[1]
					) {
						mineLoc = locCalc(dimension);
						check(minesLoc, mineLoc, dimension, grid);
					}
				}
			}
		}
		this.nearbyMines();
	}

	nearbyMines() {
		for (let i = 0; i < this.minesLoc.length; i++) {
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

		for (let i = 0; i < this.border.length; i++) {
			if (this.grid[this.border[i][0]][this.border[i][1]].mines == 0) {
				directions.forEach((direction) => {
					let loc = [
						this.border[i][0] + direction[0],
						this.border[i][1] + direction[1],
					];
					try {
						if (!this.grid[loc[0]][loc[1]].checked) {
							this.grid[loc[0]][loc[1]].open();
							if (this.grid[loc[0]][loc[1]].mines == 0)
								removeRemaining(this.grid, loc);
						}
					} catch (e) {}
				});
			}
		}

		function removeRemaining(grid, loc) {
			directions.forEach((direction) => {
				let current = [loc[0] + direction[0], loc[1] + direction[1]];
				try {
					if (!grid[current[0]][current[1]].checked) {
						grid[current[0]][current[1]].open();
						if (grid[current[0]][current[1]].mines == 0)
							removeRemaining(grid, current);
					}
				} catch (e) {}
			});
		}
	}
}

canvas.addEventListener("click", (eve) => {
	let [xLoc, yLoc] = findLoc(eve);

	if (typeof xLoc == "number") {
		if (grid.grid[yLoc][xLoc].flagged) {
			grid.grid[yLoc][xLoc].flagged = false;
			mineInfo.innerHTML++;
		} else {
			if (
				!grid.grid[yLoc][xLoc].minesUnder &&
				grid.grid[yLoc][xLoc].mines == 0 &&
				!grid.grid[yLoc][xLoc].checked &&
				!grid.allClosed
			) {
				console.log("passed");
				removeZeroBlock([yLoc, xLoc]);
			}
			grid.grid[yLoc][xLoc].open();
		}

		if (grid.allClosed) {
			grid.allClosed = false;
			grid.firstClick([yLoc, xLoc]);
		}
	}
});

function removeZeroBlock(loc) {
	let more = [];
	directions.forEach((direction) => {
		let current = [loc[0] + direction[0], loc[1] + direction[1]];
		try {
			if (!grid.grid[current[0]][current[1]].checked) {
				grid.grid[current[0]][current[1]].open();
				if (grid.grid[current[0]][current[1]].mines == 0)
					more.push(current);
			}
		} catch (e) {}
	});
	for (let i = 0; i < more.length; i++) removeZeroBlock(more[i]);
}

canvas.addEventListener("contextmenu", (eve) => {
	eve.preventDefault();
	if (eve.pointerType == "mouse") {
		let [xLoc, yLoc] = findLoc(eve);
		if (
			typeof xLoc == "number" &&
			!grid.allClosed &&
			mineInfo.innerHTML > 0
		) {
			if (!grid.grid[yLoc][xLoc].checked) {
				if (!grid.grid[yLoc][xLoc].flagged) {
					grid.grid[yLoc][xLoc].flagged = true;
					mineInfo.innerHTML--;
				} else {
					grid.grid[yLoc][xLoc].flagged = false;
					mineInfo.innerHTML++;
				}
			}
		}
	}
});

function findLoc(eve) {
	let x = eve.offsetX - grid.offX;
	let y = eve.offsetY - grid.offY;

	let xLoc = Math.floor(x / grid.cellLength);
	let yLoc = Math.floor(y / grid.cellLength);
	if (
		xLoc >= 0 &&
		xLoc < grid.dimension[0] &&
		yLoc >= 0 &&
		yLoc < grid.dimension[1]
	) {
		return [xLoc, yLoc];
	} else return [false, false];
}

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
			if (grid.grid[i][j].animation) {
				grid.grid[i][j].openAnimation();
			}
		}
	}
	animation = requestAnimationFrame(drawFrames);
	if (abort) cancelAnimationFrame(animation);
}
