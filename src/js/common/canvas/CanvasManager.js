export default class CanvasManager {
	constructor() {
	}

	init() {
		this.canvasContainer = document.getElementById("canvas-container");
		this.menuContainer = document.getElementById("menu-container");

		this.calculateSizes();

		this.screenCanvas = this.createCanvas();
		this.screenCanvas.id = "map-canvas";
		this.screenCtx = this.getCanvasContext(this.screenCanvas);
		this.canvasContainer.appendChild(this.screenCanvas);

		this.bufferCanvas = this.createCanvas();
		this.bufferCtx = this.getCanvasContext(this.bufferCanvas);

		this.translucentCanvas = this.createCanvas();
		this.translucentCtx = this.getCanvasContext(this.translucentCanvas);

		window.addEventListener("resize", () => this.onResize(), false);
		this.onResize();
	}

	createCanvas() {
		var canvas = document.createElement("canvas");

		canvas.width = this.canvasWidth;
		canvas.height = this.canvasHeight;
		canvas.style.backgroundColor = "rgba(255, 255, 255, 1)";

		return canvas;
	}

	getCanvasContext(canvas) {
		var ctx = canvas.getContext("2d");

		ctx.globalCompositeOperation = "source-over";
		ctx.save();

		return ctx;
	}

	calculateSizes() {
		var menuWidth = 300;
		this.menuHeight = window.innerHeight;

		this.canvasWidth = window.innerWidth - menuWidth;
		this.canvasHeight = window.innerHeight;
	}

	onResize() {
		this.calculateSizes();

		this.screenCanvas.width = this.canvasWidth;
		this.screenCanvas.height = this.canvasHeight;
		this.bufferCanvas.width = this.canvasWidth;
		this.bufferCanvas.height = this.canvasHeight;
		this.translucentCanvas.width = this.canvasWidth;
		this.translucentCanvas.height = this.canvasHeight;

		this.canvasContainer.width = this.canvasWidth + "px";
		this.canvasContainer.height = this.canvasHeight + "px";
		this.menuContainer.style.height = this.menuHeight + "px";
		this.menuContainer.style.marginLeft = this.canvasWidth + "px";
	}

	clearBuffer() {
		this.bufferCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}

	clearScreen() {
		this.screenCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}

	clearTranslucent() {
		this.translucentCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	}

	flip() {
		this.screenCtx.globalAlpha = 0.25;
		this.screenCtx.drawImage(this.translucentCanvas, 0, 0);
		this.screenCtx.globalAlpha = 1;
		this.screenCtx.drawImage(this.bufferCanvas, 0, 0);
	}
}