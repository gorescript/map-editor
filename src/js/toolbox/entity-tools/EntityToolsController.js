import EditorModes from "../../common/enums/EditorModes";
import BaseToolsController from "../BaseToolsController";

export default class EntityToolsController extends BaseToolsController {
	constructor() {
		super();

		this.id = "entityTools";
		this.layer = GS.MapLayers.Entity;

		this.mousePressed = false;

		this.entityTypes = Object.keys(GS.MapEntities).map(x => { return { id: x, name: GS.MapEntities[x].name }; });
		this.selectedEntityType = this.entityTypes[0];
	}

	onComputeYClick() {
		this.mapManager.computeYForEntities(this.selected);
	}

	update() {
		if (!GS.InputHelper.leftMouseDown) {
			this.mousePressed = false;
		}

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

		this.mapManager.drawEntity({ pos: v, type: this.selectedEntityType.id });

		if (GS.InputHelper.leftMouseDown && !this.mousePressed) {
			if (this.inCanvas(mx, my)) {
				var containsEntity = this.mapManager.isEntityAt(v);

				if (!containsEntity) {
					let ntt = this.mapManager.constructLayerObject(this.layer, {
						pos: v,
						y: 0,
						type: this.selectedEntityType.id,
						rotation: 0
					});

					this.mapManager.addLayerObject(this.layer, ntt);
					this.actionLog.push(this.getAddAction(ntt.id));
				}

				this.mousePressed = true;
			}
		}

		this.mapManager.drawCursor(v);
	}

	validateInteger(value) {
		if (!isNaN(value)) {
			return { value: parseInt(value, 10) };
		} else {
			return false;
		}
	}

	validateAngle(value) {
		if (!isNaN(value)) {
			let n = parseInt(value, 10) % 360;

			return { value: n };
		} else {
			return false;
		}
	}

	applyToAllSelected(propertyName) {
		this.selectedObjects.forEach((obj) => {
			obj[propertyName] = this.entity[propertyName];
		});
	}

	selectionChange() {
		super.selectionChange();

		this.selectedObjects = Object.keys(this.selected).map((key) => this.mapManager.getLayerObject(this.layer, key));

		if (this.selectedObjects.length > 0) {
			if (this.selectedObjects.length === 1) {
				let entity = angular.copy(this.selectedObjects[0]);

				this.selectedId = entity.id;

				entity.isStatic = (entity.isStatic !== undefined) ? entity.isStatic : false;
				entity.showRotation = (GS.MapEntities[entity.type].type === "Monster");

				this.entity = entity;
			} else {
				this.selectedId = `${this.selectedObjects.length} selected`;
				this.entity = {
					showRotation: true
				};
			}
		}
	}
}