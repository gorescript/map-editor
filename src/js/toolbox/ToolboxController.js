import ActionTypes from "../common/enums/ActionTypes";
import EditorModes from "../common/enums/EditorModes";

import CanvasManager from "../common/canvas/CanvasManager";

import MapManager from "../core/MapManager";

export default class ToolboxController {
	constructor($timeout) {
		this.$timeout = $timeout;

		this.MapLayers = GS.MapLayers;
		this.EditorModes = EditorModes;

		this.canvas = new CanvasManager();

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
		this.canvas.init();

		this.initComponents();
		this.initMenuControls();
		this.initModifyOriginEvent();

		$(this.canvas.canvasContainer).show();
		$(this.canvas.menuContainer).css("display", "block");

		this.importTestMap();
		this.draw();
	}

	initModifyOriginEvent() {
		$(document).mousemove((e) => {
			if (GS.InputHelper.rightMouseDown) {
				var mx = GS.InputHelper.mouseX;
				var my = GS.InputHelper.mouseY;
				var dx = (mx - this.ox);
				var dy = (my - this.oy);
				this.ox = mx;
				this.oy = my;

				this.mapManager.modifyOrigin(dx, dy);

				$("#map-canvas").css("cursor", "move");
			} else {
				this.ox = GS.InputHelper.mouseX;
				this.oy = GS.InputHelper.mouseY;

				$("#map-canvas").css("cursor", "default");
			}
		});
	}

	initComponents() {
		this.mapManager = new MapManager(this.canvas.bufferCanvas, this.canvas.bufferCtx);
		this.mapManager.init();

		this.layerTools = {};
		// this.layerTools[GS.MapLayers.Segment] = new SegmentTools(this.mapManager, this.actionLog, inCanvas);
		// this.layerTools[GS.MapLayers.Segment].init();
		// this.layerTools[GS.MapLayers.Sector] = new SectorTools(this.mapManager, this.actionLog, inCanvas);
		// this.layerTools[GS.MapLayers.Sector].init();
		// this.layerTools[GS.MapLayers.Entity] = new EntityTools(this.mapManager, this.actionLog, inCanvas);
		// this.layerTools[GS.MapLayers.Entity].init();
		// this.layerTools[GS.MapLayers.Zone] = new ZoneTools(this.mapManager, this.actionLog, inCanvas);
		// this.layerTools[GS.MapLayers.Zone].init();
	}

	onLayerToolInit(layer, layerTool) {
		var inCanvas = (mx, my) => this.inCanvas(mx, my);

		this.layerTools[layer] = layerTool;
		this.layerTools[layer].init(this.mapManager, this.actionLog, inCanvas, this.$timeout);
	}

	initMenuControls() {
		this.mapManager.addEventListener("mapLoad", () => this.$timeout());
		this.mapManager.addEventListener("mapLoad", () => window.map = this.mapManager.map);
		this.mapManager.addEventListener("triangleCountChange", () => this.$timeout());

		$("#field-import").change(() => {
			this.importMap();
		});
	}

	onEditorModeChange() {
		var mode = this.layerTools[this.layer].mode;

		for (var i in this.layerTools) {
			this.layerTools[i].mode = mode;
		}
		//this.layerTools[GS.MapLayers.Sector].mode = EditorModes.Selecting;
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
		var importField = $("#field-import");
		var files = importField[0].files;

		if (files === undefined || files.length === 0) {
			importField.trigger("click");
			return;
		}

		var file = files[0];
		var fileReader = new FileReader();

		fileReader.onload = (e) => {
			this.mapManager.importMap(e.target.result);
			this.actionLog.length = 0;

			for (var i in this.layerTools) {
				this.layerTools[i].resetSelection();
			}
		};

		fileReader.onerror = function(e) {
			alert("File read error: " + e.target.error.code);
		};

		fileReader.readAsText(file);
		importField.val("");
	}

	update() {
		this.updatePositionLabel();

		// TODO: remove if
		if (this.layerTools[this.layer]) {
			this.layerTools[this.layer].update();
		}

		this.processKeyboardInput();
		this.processZoom();
	}

	updatePositionLabel() {
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
	}

	processKeyboardInput() {
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
	}

	processZoom() {
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
		return mx < this.canvas.canvasWidth;
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
		this.canvas.clearBuffer();

		// TODO: remove if
		var selected;
		if (this.layerTools[this.layer]) {
			selected = this.layerTools[this.layer].getSelected();
		}
		this.mapManager.drawLayer(this.canvas.bufferCtx, this.layer, selected);

		this.update();

		this.canvas.clearScreen();
		this.drawOtherLayers();

		this.canvas.flip();

		requestAnimationFrame(() => this.draw());
	}

	drawOtherLayers() {
		this.canvas.clearTranslucent();

		switch (this.layer) {
			case GS.MapLayers.Segment:
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Entity);
				break;

			case GS.MapLayers.Entity:
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Segment);
				break;

			case GS.MapLayers.Sector:
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Entity);
				break;

			case GS.MapLayers.Zone:
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Sector);
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Segment);
				this.mapManager.drawLayer(this.canvas.translucentCtx, GS.MapLayers.Entity);
				break;
		}
	}
}

ToolboxController.$inject = [
	"$timeout"
];