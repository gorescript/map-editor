import EditorModes from "../../common/enums/EditorModes";
import BaseToolsController from "../BaseToolsController";
import AppConfig from "../../common/AppConfig";

export default class SegmentToolsController extends BaseToolsController {
	constructor() {
		super();

		this.id = "segmentTools";
		this.layer = GS.MapLayers.Segment;
		this.AppConfig = AppConfig;

		this.isDrawingLine = false;
		this.connectOnlyExisting = false;
	}

	init(mapManager, actionLog, inCanvas, $timeout) {
		super.init(mapManager, actionLog, inCanvas, $timeout);

		this.initVisibleTypesMultiSelect();
	}

	onConvertToSectorsClick() {
		this.mapManager.convertSegmentsToSectors(this.selected);
		this.resetSelection();
	}

	onFlipNormalsClick() {
		this.mapManager.flipSegmentNormals(this.selected);
	}

	onRegenerateSidesClick() {
		this.mapManager.convertEdgesToSegments();
		this.resetSelection();
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

		if (this.isDrawingLine && GS.InputHelper.shift) {
			var angle = Math.abs(GS.MathHelper.vec2Angle(v, this.lineStart) / 2);
			if (angle >= 45 && angle < 135) {
				v.x = this.lineStart.x;
			} else {
				v.y = this.lineStart.y;
			}
		}

		var containsSegmentPoint = false;
		if (this.connectOnlyExisting) {
			containsSegmentPoint = this.mapManager.isSegmentPointAt(v) ||
				(this.lineStart !== undefined && this.mapManager.isSegmentPointAt(this.lineStart));
		}

		this.mapManager.drawCursorExtensions(v);

		var color;
		if (GS.InputHelper.leftMouseDown) {
			if (this.inCanvas(mx, my)) {
				if (this.isDrawingLine === false) {
					this.isDrawingLine = true;
					this.lineStart = new THREE.Vector2(mx, my);
					this.mapManager.convertToGridCellCoords(this.lineStart);
				}

				color = "#000";
				if (this.connectOnlyExisting) {
					color = containsSegmentPoint ? "#00ff00" : "#ff0000";
				}
			}

			if (this.isDrawingLine) {
				this.mapManager.drawSegment(this.lineStart, v, color);
			}
		} else {
			if (this.isDrawingLine) {
				this.isDrawingLine = false;

				if (this.inCanvas(mx, my) && (this.connectOnlyExisting && containsSegmentPoint || !this.connectOnlyExisting)) {
					if (this.lineStart.x != v.x || this.lineStart.y != v.y) {
						var seg = this.mapManager.constructLayerObject(this.layer, {
							start: this.lineStart.clone(),
							end: v,
							type: GS.SegmentTypes.User,
							bottomY: 0,
							topY: 64,
							texId: "wall",
						});

						this.mapManager.addLayerObject(this.layer, seg);
						this.actionLog.push(this.getAddAction(seg.id));
						this.mapManager.drawSegment(this.lineStart, v);
					}
				}
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

	onTVScreenChange() {
		this.selectedObjects.forEach((obj) => {
			if (this.segment.tvScreen) {
				obj.type = GS.SegmentTypes.TVScreen;
			} else {
				obj.type = GS.SegmentTypes.User;
			}

			this.segment.switch = false;
		});
	}

	onSwitchChange() {
		this.selectedObjects.forEach((obj) => {
			if (this.segment.switch) {
				obj.type = GS.SegmentTypes.Switch;
			} else {
				obj.type = GS.SegmentTypes.User;
			}

			this.segment.tvScreen = false;
		});
	}

	initVisibleTypesMultiSelect() {
		this.visibleTypes = [
			{ propertyName: "showUserDrawnSegments", name: "User-drawn segments" },
			{ propertyName: "showGeneratedInteriorFloorSides", name: "Generated interior floor sides" },
			{ propertyName: "showGeneratedInteriorCeilingSides", name: "Generated interior ceiling sides" },
			{ propertyName: "showGeneratedExteriorSides", name: "Generated exterior sides" },
			{ propertyName: "showTVScreens", name: "TV screens and switches" }
		];

		var count = 0;

		this.visibleTypes.forEach(x => {
			x._selected = this.mapManager[x.propertyName];

			if (x._selected) {
				count++;
			}
		});

		this.visibleTypesButtonText = this.getVisibleTypesText(count);
	}

	onVisibleTypesChange() {
		var count = 0;

		this.visibleTypes.forEach(x => {
			this.mapManager[x.propertyName] = x._selected;

			if (x._selected) {
				count++;
			}
		});

		this.visibleTypesButtonText = this.getVisibleTypesText(count);
	}

	getVisibleTypesText(count) {
		var str = "Visible segment types: ";

		if (count < 5) {
			return str + count;
		}

		return str + " All";
	}

	applyToAllSelected(propertyName) {
		this.selectedObjects.forEach((obj) => {
			obj[propertyName] = this.segment[propertyName];
		});
	}

	selectionChange() {
		super.selectionChange();

		this.selectedObjects = Object.keys(this.selected).map((key) => this.mapManager.getLayerObject(this.layer, key));

		if (this.selectedObjects.length > 0) {
			if (this.selectedObjects.length === 1) {
				let segment = angular.copy(this.selectedObjects[0]);

				this.selectedId = segment.id;

				segment.tvScreen = (segment.type === GS.SegmentTypes.TVScreen);
				segment.switch = (segment.type === GS.SegmentTypes.Switch);

				this.segment = segment;
			} else {
				this.selectedId = `${this.selectedObjects.length} selected`;
				this.segment = {};
			}
		}
	}
}