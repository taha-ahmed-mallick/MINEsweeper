let levels = [
	{
		name: "Hard",
		mines: 75,
		dimension: [13, 28],
	},
	{
		name: "Medium",
		mines: 35,
		dimension: [10, 21],
	},
	{
		name: "Easy",
		mines: 10,
		dimension: [6, 13],
	},
	{
		name: "Custom",
		mines: null,
		dimension: [null, null],
	},
];
let colors = [
	{
		name: "red", 
		light: "",
		dark: ""
	},
	{
		name: "blue"
	},
	{
		name: "green"
	}
];

let difficulty = 1;

let dropdown = document.getElementsByClassName("select")[0];
let caret = document.getElementsByClassName("caret")[0];
let ulElements = document.querySelectorAll("li");
let ul = document.getElementsByTagName("ul")[0];

dropdown.addEventListener("click", toggleDropdown);

function toggleDropdown() {
	caret.classList.toggle("closed");
	ul.classList.toggle("closed");
	for (let i = 0; i < ulElements.length; i++) {
		ulElements[i].classList.toggle("closed");
	}
}

let selectedText = document.getElementsByClassName("selected")[0];
let inputs = document.getElementsByTagName("input");

ulElements.forEach((element) => {
	element.addEventListener("click", () => {
		difficultyChange(element.id);
		if (levels[difficulty].name != "Custom") {
			inputs[0].value = levels[difficulty].mines;
			inputs[1].value = levels[difficulty].dimension[0];
			inputs[2].value = levels[difficulty].dimension[1];
		} else setCustom();
		toggleDropdown();
	});
});

let levelInfo = document.querySelector(".info .level");
let mineInfo = document.querySelector(".mines-time .mines span");

function difficultyChange(id) {
	ulElements[difficulty].classList.remove("active");
	difficulty = id;
	ulElements[id].classList.add("active");
	selectedText.innerText = levels[difficulty].name;
	levelInfo.innerText = levels[difficulty].name;
	mineInfo.innerText = levels[difficulty].mines;
}

function setCustom() {
	levels[difficulty].mines = parseInt(inputs[0].value);
	levels[difficulty].dimension[0] = parseInt(inputs[1].value);
	levels[difficulty].dimension[1] = parseInt(inputs[2].value);
	mineInfo.innerText = levels[difficulty].mines;
}

for (let i = 0; i < inputs.length; i++) {
	inputs[i].addEventListener("keypress", (eve) => {
		eve.preventDefault();
		if (/\d/g.test(eve.key)) {
			inputs[i].value += eve.key;
			difficultyChange(3);
			inputChange();
		}
	});
	inputs[i].addEventListener("input", (eve) => {
		inputs[i].value < 0
			? (inputs[i].value = Math.abs(inputs[i].value))
			: false;
		eve.data == null ? difficultyChange(3) : false;
		inputChange();
	});
}

let error = document.getElementsByClassName("error")[0];
let advice = document.getElementsByClassName("advice")[0];

function inputChange() {
	setCustom();
	let area = levels[3].dimension[0] * levels[3].dimension[1];
	let minePerc = levels[3].mines / area;
	if (minePerc >= 1) {
		error.classList.add("appear");
		advice.classList.remove("appear");
	} else if (minePerc > 0.3) {
		advice.classList.add("appear");
		error.classList.remove("appear");
	} else if (minePerc < 0.3) {
		advice.classList.remove("appear");
		error.classList.remove("appear");
	}
}

let strtBtn = document.getElementsByClassName("start-btn")[0];
let screens = document.getElementsByClassName("screen");
let writingScreen = document.querySelector(".container>div");

strtBtn.addEventListener("mousedown", () => {
	if (error.classList.contains("appear")) {
		strtBtn.classList.add("err");
		setTimeout(() => strtBtn.classList.remove("err"), 250);
	} else {
		screens[0].style.opacity = 0;
		setTimeout(() => screens[0].classList.remove("shown"), 250);
		screens[1].classList.add("shown");
		write("Now Starting!");
		grid = new Grid(levels[difficulty].dimension, levels[difficulty].mines);
		// grid = new Grid([10, 2], 20);
		setTimeout(() => {
			writingScreen.classList.add("opacity-0");
			setTimeout(() => writingScreen.classList.add("hide"), 500);
		}, 1400);
	}
});
