import EditorModes from "../../common/enums/EditorModes";
import BaseToolsController from "../BaseToolsController";
import AppConfig from "../../common/AppConfig";

export default class ZoneToolsController extends BaseToolsController {
	constructor() {
		super();

		this.AppConfig = AppConfig;

		this.id = "zoneTools";
		this.layer = GS.MapLayers.Zone;

		this.isDrawingZone = false;
	}

	update() {
		var mx = GS.InputHelper.mouseX;
		var my = GS.InputHelper.mouseY;

		switch (this.mode) {
			case EditorModes.Selecting:
				this.handleSelecting(mx, my);
				break;

			case EditorModes.Drawing:
				this.handleDrawing(mx, my);
				break;
		}
	}

	handleDrawing(mx, my) {
		var v = new THREE.Vector2(mx, my);
		this.mapManager.convertToGridCellCoords(v);
		this.mapManager.drawCursorExtensions(v);

		if (GS.InputHelper.leftMouseDown) {
			if (this.inCanvas(mx, my)) {
				if (this.isDrawingZone === false) {
					this.isDrawingZone = true;
					this.zoneStart = new THREE.Vector2(mx, my);
					this.mapManager.convertToGridCellCoords(this.zoneStart);
				}
			}

			if (this.isDrawingZone) {
				this.mapManager.drawZone(this.zoneStart, v);
			}
		} else {
			if (this.isDrawingZone) {
				this.isDrawingZone = false;
				if (this.inCanvas(mx, my)) {
					if (!this.zoneStart.equalsEpsilon(v)) {
						var zone = this.mapManager.constructLayerObject(this.layer, {
							start: this.zoneStart.clone(),
							end: v,
						});

						this.mapManager.addLayerObject(this.layer, zone);
						this.actionLog.push(this.getAddAction(zone.id));
						this.mapManager.drawZone(this.zoneStart, v);
					}
				}
			}
		}

		this.mapManager.drawCursor(v);
	}

	validateZoneName(value) {
		var validate = (name) => {
			var re = /^[0-9a-zA-Z_]+$/;
			return re.exec(name);
		};

		var zoneNameError = [
			"invalid zone name:",
			"only a-z, A-Z, 0-9 and _ are allowed as characters",
			"name must be at least 1 character long",
		].join("\n");

		if (validate(value)) {
			return { value: value };
		} else {
			alert(zoneNameError);
			return false;
		}
	}

	onNameChange() {
		this.selectedObjects.forEach((obj) => {
			obj.name = this.selectedName;
		});
	}

	selectionChange() {
		super.selectionChange();

		this.selectedObjects = Object.keys(this.selected).map((key) => this.mapManager.getLayerObject(this.layer, key));

		if (this.selectedObjects.length > 0) {
			if (this.selectedObjects.length === 1) {
				let zone = this.selectedObjects[0];

				this.selectedId = zone.id;
				this.selectedName = zone.name;
			} else {
				this.selectedId = `${this.selectedObjects.length} selected`;
				this.selectedName = "";
			}
		}
	}
}