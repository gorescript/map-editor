import ActionTypes from "../common/enums/ActionTypes";
import EditorModes from "../common/enums/EditorModes";

export default class BaseToolsController {
	constructor() {
		this.count = 0;
		this.layer = undefined;

		this.isSelecting = false;
		this.mode = EditorModes.Selecting;

		this.selected = {};
		this.selectedObjects = [];
	}

	init(mapManager, actionLog, inCanvas, $timeout) {
		this.mapManager = mapManager;
		this.actionLog = actionLog;
		this.inCanvas = inCanvas;
		this.$timeout = $timeout;

		this.count = this.mapManager.getLayerObjectCount(this.layer);

		this.mapManager.addEventListener("layerObjectCountChange", (e) => {
			if (e.layer == this.layer) {
				this.count = this.mapManager.getLayerObjectCount(this.layer);
				this.$timeout();
			}
		});
	}

	deleteSelected() {
		this.actionLog.push(this.getRemoveAction());
		this.mapManager.removeLayerObjects(this.layer, this.selected);
		this.selected = {};
		this.selectionChange();
	}

	resetSelection() {
		this.selected = {};
		this.selectionChange();
	}

	onSelectAll() {
		this.selected = this.mapManager.getSelectionOfAllLayerObjects(this.layer);
		this.selectionChange();
	}

	onEscape() {
		this.selected = {};
		this.selectionChange();
	}

	onDelete() {
		this.deleteSelected();
	}

	goTo(id) {
		var obj = this.mapManager.getLayerObject(this.layer, id);

		if (obj !== undefined) {
			this.selected = {};
			this.selected[id] = true;
			this.selectionChange();
			return true;
		}

		return false;
	}

	handleSelecting(mx, my) {
		if (!this.inCanvas(mx, my)) {
			return;
		}

		var v = new THREE.Vector2(mx, my);

		if (GS.InputHelper.leftMouseDown) {
			if (this.inCanvas(mx, my)) {
				if (this.isSelecting === false) {
					this.isSelecting = true;
					this.selectStart = v;
				}
			}

			if (this.isSelecting) {
				this.mapManager.drawSelection(this.selectStart, v);
			}
		} else {
			if (this.isSelecting) {
				this.isSelecting = false;
				var selection = this.mapManager.getLayerObjectsInSelection(this.layer, this.selectStart, v);

				if (GS.InputHelper.ctrl) {
					this.addSelection(selection);
				} else {
					this.selected = selection;
				}

				this.selectionChange();
			}
		}
	}

	selectionChange() {
		this.$timeout();
	}

	addSelection(selection) {
		var n = Object.keys(this.selected).length;

		if (n === 0) {
			this.selected = selection;
			return;
		}

		Object.keys(selection).forEach((key) => {
			if (this.selected[key] === undefined) {
				this.selected[key] = true;
			} else {
				delete this.selected[key];
			}
		});
	}

	undoAdd(action) {
		this.mapManager.removeLayerObject(this.layer, action.info.id);
	}

	undoRemove(action) {
		for (var i = 0; i < action.info.objects.length; i++) {
			this.mapManager.addLayerObject(this.layer, action.info.objects[i]);
		}
	}

	getSelected() {
		return this.selected;
	}

	getAddAction(id) {
		var action = {
			type: ActionTypes.Add,
			layer: this.layer,
			info: { id: id },
		};

		return action;
	}

	getRemoveAction() {
		var objects = [];
		for (var i in this.selected) {
			var obj = this.mapManager.getLayerObject(this.layer, i);
			var clone = {};
			$.extend(true, clone, obj);
			objects.push(clone);
		}

		var action = {
			type: ActionTypes.Remove,
			layer: this.layer,
			info: { objects: objects },
		};

		return action;
	}
}