import EditorModes from "../../common/enums/EditorModes";
import BaseToolsController from "../BaseToolsController";
import SectorTriangleModes from "../../core/SectorTriangleModes";

export default class SectorTools extends BaseToolsController {
	constructor() {
		super();

		this.id = "sectorTools";

		this.SectorTriangleModes = SectorTriangleModes;
		this.mode = EditorModes.Selecting;
		this.layer = GS.MapLayers.Sector;
	}

	update() {
		var mx = GS.InputHelper.mouseX;
		var my = GS.InputHelper.mouseY;

		switch (this.mode) {
			case EditorModes.Selecting:
				this.handleSelecting(mx, my);
				break;
		}
	}

	hexToStyle(hex) {
		return ("#" + this.pad(hex.toString(16), 6));
	}

	styleToHex(style) {
		style = style.substr(1);
		return parseInt(style, 16);
	}

	pad(n, width, z) {
		z = z || "0";
		n = n + "";
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	validatePositiveInteger(value) {
		if (!isNaN(value) && parseInt(value, 10) >= 0) {
			return { value: parseInt(value, 10) };
		} else {
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

	validateLightLevel(value) {
		if (!isNaN(value) && parseInt(value, 10) === parseFloat(value)) {
			let n = parseInt(value, 10);
			if (n < 0) {
				n = 0;
			}
			if (n > 10) {
				n = 10;
			}

			return { value: n };
		} else {
			return false;
		}
	}

	onFloorHeightChange() {
		this.selectedObjects.forEach((obj) => {
			var floorCeilDist = obj.ceilBottomY - obj.floorTopY;
			var ceilThickness = obj.ceilTopY - obj.ceilBottomY;

			obj.floorTopY = this.sector.floorTopY;
			obj.floorBottomY = this.sector.floorTopY;
			obj.ceilBottomY = this.sector.floorTopY + floorCeilDist;
			obj.ceilTopY = this.sector.floorTopY + floorCeilDist + ceilThickness;
		});
	}

	onFloorCeilDistChange() {
		this.selectedObjects.forEach((obj) => {
			var ceilThickness = obj.ceilTopY - obj.ceilBottomY;

			obj.ceilBottomY = obj.floorBottomY + this.sector.floorCeilDist;
			obj.ceilTopY = obj.ceilBottomY + ceilThickness;
		});
	}

	onCeilThicknessChange() {
		this.selectedObjects.forEach((obj) => {
			obj.ceilTopY = obj.ceilBottomY + this.sector.ceilThickness;
		});
	}

	onDoorChange() {
		this.selectedObjects.forEach((obj) => {
			obj.door = this.sector.door;

			if (this.sector.door) {
				this.sector.elevator = false;
				obj.elevator = false;
			}
		});
	}

	onElevatorChange() {
		this.selectedObjects.forEach((obj) => {
			obj.elevator = this.sector.elevator;

			if (this.sector.elevator) {
				this.sector.door = false;
				obj.door = false;
			}
		});
	}

	onLightColorChange() {
		this.selectedObjects.forEach((obj) => {
			let value = this.styleToHex(this.sector.lightColorStyle);

			obj.lightColor = value;
			obj.ceilingCatColor = value;
		});
	}

	applyToAllSelected(propertyName) {
		this.selectedObjects.forEach((obj) => {
			obj[propertyName] = this.sector[propertyName];
		});
	}

	selectionChange() {
		super.selectionChange();

		this.selectedObjects = Object.keys(this.selected).map((key) => this.mapManager.getLayerObject(this.layer, key));

		if (this.selectedObjects.length > 0) {
			if (this.selectedObjects.length === 1) {
				let sector = angular.copy(this.selectedObjects[0]);

				this.selectedId = sector.id;

				sector.ceiling = (sector.ceiling !== undefined) ? sector.ceiling : true;

				sector.floorCeilDist = sector.ceilBottomY - sector.floorTopY;
				sector.ceilThickness = sector.ceilTopY - sector.ceilBottomY;

				sector.door = (sector.door !== undefined) ? sector.door : false;
				sector.doorMaxHeight = (sector.doorMaxHeight !== undefined) ? sector.doorMaxHeight : 16;

				sector.elevator = (sector.elevator !== undefined) ? sector.elevator : false;
				sector.elevatorMaxHeight = (sector.elevatorMaxHeight !== undefined) ? sector.elevatorMaxHeight : 16;

				sector.useVertexColors = (sector.useVertexColors !== undefined) ? sector.useVertexColors : false;
				sector.lightColorStyle = this.hexToStyle(sector.lightColor);

				this.sector = sector;
			} else {
				this.selectedId = `${this.selectedObjects.length} selected`;

				this.sector = {
					lightColorStyle: "#ad00ad"
				};
			}
		}
	}
}