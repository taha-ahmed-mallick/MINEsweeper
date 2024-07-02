// let canvas = document.getElementById("#canvas");
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");
let introSentence = document.getElementsByClassName("sentence")[0];

function resize() {
	canvas.width = window.innerWidth - 60;
	canvas.height = window.innerHeight - 125;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize);
window.addEventListener("load", () => {
	resize();
	write(introSentence.innerHTML);
});

let writingInst = 0;

function write(text) {
	let inst = ++writingInst;
	console.log(inst);
	introSentence.innerHTML = "";
	text = text.split("");
	let index = 0;
	let writing = setInterval(() => {
		if (index < text.length) {
			introSentence.innerHTML += text[index];
			index++;
			if (writingInst > 1 && inst == 1) {
				clearInterval(writing);
				introSentence.innerHTML = "";
			}
		} else {
			clearInterval(writing);
			writingInst--;
		}
	}, 90);
}
