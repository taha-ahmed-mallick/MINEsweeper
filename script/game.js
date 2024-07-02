// let canvas = document.getElementById("#canvas");
let canvas = document.getElementsByTagName("canvas")[0];
let ctx = canvas.getContext("2d");

function resize() {
	canvas.width = window.innerWidth - 60;
	canvas.height = window.innerHeight - 125;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize);
window.addEventListener("load", resize);
