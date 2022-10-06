sap.ui.core.Icon.extend('arcelor.controls.StatusIcon', {
	metadata: {
		properties: {
			status: {
				type: "string"
			}
		},
		defaultAggregation: "content",
		aggregations: {
			"dependents": {
				type: "sap.ui.core.Element",
				multiple: false
			},
			"content": {
				type: "sap.ui.core.Control",
				multiple: false
			}
		},
		events: {
			"hover": {},
			"out": {}
		}
	},

	init: function () {
		this.setAggregation("dependents", new sap.ui.core.Element());
	},

	renderer: function (oRm, oControl) {

		sap.ui.core.IconRenderer.render.apply(this, arguments);
	},

	onAfterRendering: function () {
		var sStatusClass = (this.getStatus() && this.getStatus().length > 0 ? "statusUiIcon" + this.getStatus() : "");
		this.removeStyleClass("statusUiIconL1");
		this.removeStyleClass("statusUiIconL2");
		this.removeStyleClass("statusUiIconL3");
		this.addStyleClass(sStatusClass);
	},

	onmouseover: function (oEvent) {
		this.fireHover();
	},

	onmouseout: function (oEvent) {
		this.fireOut();
	}
});