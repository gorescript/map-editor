import ActionTypes from "../editor/ActionTypes";
import EditorModes from "../editor/EditorModes";

import MapManager from "../core/MapManager";

import EntityTools from "../editor/tools/EntityTools";
import SectorTools from "../editor/tools/SectorTools";
import SegmentTools from "../editor/tools/SegmentTools";
import ZoneTools from "../editor/tools/ZoneTools";

export default class ToolboxController {
	constructor($timeout) {
		this.$timeout = $timeout;
		this.MapLayers = GS.MapLayers;
		this.EditorModes = EditorModes;

		this.layer = GS.MapLayers.Segment;

		this.keys = {
			Escape: 27,
			Delete: 46,
			A: 65,
			Z: 90,
			G: 71,
			Minus: 189,
			Plus: 187,
			Zero: 48,
		};

		this.actionLog = [];
		this.init();
	}

	init() {
		var that = this;

		this.canvasContainer = document.getElementById("canvas-container");
		this.menuContainer = document.getElementById("menu-container");

		this.calculateSizes();

		var screenCanvas = document.createElement("canvas");
		screenCanvas.width = this.canvasWidth;
		screenCanvas.height = this.canvasHeight;
		screenCanvas.style.backgroundColor = "rgba(255, 255, 255, 1)";
		screenCanvas.id = "map-canvas";
		$(this.canvasContainer).append(screenCanvas);
		this.screenCanvas = screenCanvas;

		var screenCtx = screenCanvas.getContext("2d");
		screenCtx.globalCompositeOperation = "source-over";
		screenCtx.save();
		this.screenCtx = screenCtx;

		var bufferCanvas = document.createElement("canvas");
		bufferCanvas.width = this.canvasWidth;
		bufferCanvas.height = this.canvasHeight;
		bufferCanvas.style.backgroundColor = "rgba(255, 255, 255, 1)";
		this.bufferCanvas = bufferCanvas;

		var bufferCtx = bufferCanvas.getContext("2d");
		bufferCtx.globalCompositeOperation = "source-over";
		bufferCtx.save();
		this.bufferCtx = bufferCtx;

		var translucentCanvas = document.createElement("canvas");
		translucentCanvas.width = this.canvasWidth;
		translucentCanvas.height = this.canvasHeight;
		translucentCanvas.style.backgroundColor = "rgba(255, 255, 255, 1)";
		this.translucentCanvas = translucentCanvas;

		var translucentCtx = translucentCanvas.getContext("2d");
		translucentCtx.globalCompositeOperation = "source-over";
		translucentCtx.save();
		this.translucentCtx = translucentCtx;

		window.addEventListener("resize", function() { that.onResize(); }, false);
		this.onResize();

		this.initComponents();
		this.initMenuControls();
		this.initModifyOriginEvent();

		$(this.canvasContainer).show();
		$(this.menuContainer).css("display", "block");

		this.importTestMap();
		this.draw();
	}

	initModifyOriginEvent() {
		var that = this;

		$(document).mousemove(function(e) {
			if (GS.InputHelper.rightMouseDown) {
				var mx = GS.InputHelper.mouseX;
				var my = GS.InputHelper.mouseY;
				var dx = (mx - that.ox);
				var dy = (my - that.oy);
				that.ox = mx;
				that.oy = my;

				that.mapManager.modifyOrigin(dx, dy);

				$("#map-canvas").css("cursor", "move");
			} else {
				that.ox = GS.InputHelper.mouseX;
				that.oy = GS.InputHelper.mouseY;

				$("#map-canvas").css("cursor", "default");
			}
		});
	}

	initComponents() {
		var that = this;
		var inCanvas = function(mx, my) { return that.inCanvas(mx, my); };

		this.mapManager = new MapManager(this.bufferCanvas, this.bufferCtx);
		this.mapManager.init();

		this.layerTools = {};
		this.layerTools[GS.MapLayers.Segment] = new SegmentTools(this.mapManager, this.actionLog, inCanvas);
		this.layerTools[GS.MapLayers.Segment].init();
		this.layerTools[GS.MapLayers.Sector] = new SectorTools(this.mapManager, this.actionLog, inCanvas);
		this.layerTools[GS.MapLayers.Sector].init();
		this.layerTools[GS.MapLayers.Entity] = new EntityTools(this.mapManager, this.actionLog, inCanvas);
		this.layerTools[GS.MapLayers.Entity].init();
		this.layerTools[GS.MapLayers.Zone] = new ZoneTools(this.mapManager, this.actionLog, inCanvas);
		this.layerTools[GS.MapLayers.Zone].init();
	}

	initMenuControls() {
		this.mapManager.addEventListener("mapLoad", () => this.$timeout());
		this.mapManager.addEventListener("mapLoad", () => window.map = this.mapManager.map);
		this.mapManager.addEventListener("triangleCountChange", () => this.$timeout());

		for (var i in this.layerTools) {
			this.layerTools[i].initMenuControls();
		}

		$("#field-import").change(() => {
			this.importMap();
		});
	}

	onEditorModeChange() {
		var mode = this.layerTools[this.layer].mode;

		for (var i in this.layerTools) {
			this.layerTools[i].mode = mode;
		}
		this.layerTools[GS.MapLayers.Sector].mode = EditorModes.Selecting;
	}

	onSaveMapClick() {
		var map = this.mapManager.getMap();
		this.saveMap(map);
	}

	validateMapName(value) {
		var validate = (name) => {
			var re = /^[0-9a-zA-Z_]+$/;
			return re.exec(name);
		};

		var mapNameError = [
			"invalid map name:",
			"only a-z, A-Z, 0-9 and _ are allowed as characters",
			"name must be at least 1 character long",
		].join("\n");

		if (validate(value)) {
			return { value: value };
		} else {
			alert(mapNameError);
			return false;
		}
	}

	validateInteger(value) {
		if (!isNaN(value)) {
			return { value: parseInt(value, 10) };
		} else {
			return false;
		}
	}

	validatePositiveInteger(value) {
		if (!isNaN(value) && parseInt(value, 10) >= 0) {
			return { value: parseInt(value, 10) };
		} else {
			return false;
		}
	}

	saveMap(map) {
		window.localStorage.testMap = JSON.stringify(map);
	}

	clearMap() {
		window.localStorage.removeItem("testMap");
		window.location.reload();
	}

	importTestMap() {
		var testMap = window.localStorage.testMap;

		if (testMap) {
			this.mapManager.importMap(testMap);
			this.actionLog.length = 0;

			for (var i in this.layerTools) {
				this.layerTools[i].resetSelection();
			}
		}
	}

	importMap() {
		var that = this;

		var $fieldImport = $("#field-import");

		var files = $fieldImport[0].files;
		if (files === undefined || files.length === 0) {
			$fieldImport.trigger("click");
			return;
		}
		var file = files[0];

		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			that.mapManager.importMap(e.target.result);
			that.actionLog.length = 0;
			for (var i in that.layerTools) {
				that.layerTools[i].resetSelection();
			}
		};
		fileReader.onerror = function(e) {
			alert("File read error: " + e.target.error.code);
		};
		fileReader.readAsText(file);

		$fieldImport.val("");
	}

	update() {
		var mx = GS.InputHelper.mouseX;
		var my = GS.InputHelper.mouseY;

		if (this.inCanvas(mx, my)) {
			let v = new THREE.Vector2(mx, my);
			this.mapManager.convertToGridCellCoords(v);

			$("#position-field").text(`X: ${v.x.toFixed(0)}, Y: ${v.y.toFixed(0)}`);
		}
		else {
			$("#position-field").text(`X: ---, Y: ---`);
		}

		this.layerTools[this.layer].update();

		GS.InputHelper.checkPressedKeys();

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.A)) {
			this.layerTools[this.layer].onSelectAll();
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.G)) {
			GS.InputHelper.keyState[this.keys.G] = false;
			this.showGoTo();
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Escape)) {
			this.layerTools[this.layer].onEscape();
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.Z)) {
			this.undoLastAction();
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Delete)) {
			this.layerTools[this.layer].onDelete();
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.Minus)) {
			this.mapManager.modifyZoom(-1);
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.Plus)) {
			this.mapManager.modifyZoom(1);
		}

		if (!GS.InputHelper.keysPressed && GS.InputHelper.ctrl && GS.InputHelper.isKeyDown(this.keys.Zero)) {
			this.mapManager.resetZoom();
		}

		while (GS.InputHelper.mouseWheelEvents.length > 0) {
			var delta = GS.InputHelper.mouseWheelEvents.shift();

			if (delta < 0) {
				this.mapManager.modifyZoom(-1);
			}
			if (delta > 0) {
				this.mapManager.modifyZoom(1);
			}
		}
	}

	showGoTo() {
		var str = window.prompt("Go to layer object ID:", "");
		var n = parseInt(str);
		if (!isNaN(n)) {
			if (this.layerTools[this.layer].goTo(n)) {
				return;
			}
		}
		alert("layer object not found");
	}

	inCanvas(mx, my) {
		return mx < this.canvasWidth;
	}

	undoLastAction() {
		var action = this.actionLog.pop();
		if (action) {
			switch (action.type) {
				case ActionTypes.Add:
					this.layerTools[action.layer].undoAdd(action);
					break;
				case ActionTypes.Remove:
					this.layerTools[action.layer].undoRemove(action);
					break;
			}
		}
	}

	draw() {
		var that = this;
		this.bufferCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.mapManager.drawLayer(this.bufferCtx, this.layer, this.layerTools[this.layer].getSelected());
		this.update();

		this.screenCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		this.drawOtherLayers();

		this.screenCtx.globalAlpha = 0.25;
		this.screenCtx.drawImage(this.translucentCanvas, 0, 0);
		this.screenCtx.globalAlpha = 1;
		this.screenCtx.drawImage(this.bufferCanvas, 0, 0);

		requestAnimationFrame(function() { that.draw(); });
	}

	drawOtherLayers() {
		switch (this.layer) {
			case GS.MapLayers.Segment:
				this.translucentCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Entity);
				break;
			case GS.MapLayers.Entity:
				this.translucentCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Segment);
				break;
			case GS.MapLayers.Sector:
				this.translucentCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Entity);
				break;
			case GS.MapLayers.Zone:
				this.translucentCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Segment);
				this.mapManager.drawLayer(this.translucentCtx, GS.MapLayers.Entity);
				break;
		}
	}

	calculateSizes() {
		this.minWidth = 1280;
		this.minHeight = 720;

		this.menuWidth = 300;
		this.menuHeight = Math.max(window.innerHeight, this.minHeight);
		this.canvasWidth = Math.max(window.innerWidth - this.menuWidth, this.minWidth - this.menuWidth);
		this.canvasHeight = Math.max(window.innerHeight, this.minHeight);
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
		this.menuContainer.style.width = this.menuWidth + "px";
		this.menuContainer.style.height = this.menuHeight + "px";
		this.menuContainer.style.marginLeft = this.canvasWidth + "px";
	}
}

ToolboxController.$inject = [
	"$timeout"
];