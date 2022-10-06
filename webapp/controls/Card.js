sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Image",
	"sap/m/Text",
	"sap/m/Label"
], function (Control, Image, Text, Label) {

	"user strict";

	return Control.extend("arcelor.controls.Card", {
		metadata: {
			properties: {
				title: {
					type: "string",
					defaultValue: "Titulo"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "8rem"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "9rem"
				},
				image: {
					type: "string",
					defaultValue: "./image/arcelormittal-500.png"
				},
				backgroundColor: {
					type: "string",
					defaultValue: "white"
				}
			},
			aggregations: {
				_imagem: {
					type: "sap.m.Image",
					multiple: false,
					visibility: "hidden"
				},
				_subtitle: {
					type: "sap.m.Label",
					multiple: false
				}
			},
			events: {
				press: {
					enablePreventDefault: true
				},
				getTexto: {}
			}
		},

		init: function () {

			this.setAggregation("_imagem", new Image({
				width: "100%",
				height: '6rem',
				src: this.getImage(),
				press: this.press.bind(this)
			}));

			this.setAggregation("_subtitle", new Label({
				design: "Bold",
				wrapping: true,
				wrappingType: sap.m.WrappingType.Normal,
				textAlign: sap.ui.core.TextAlign.Center
			}));
		},

		renderer: function (oRm, oControl) {

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("card");
			oRm.addClass("sapUiTinyMargin");
			oRm.writeClasses();
			oRm.addStyle("width", oControl.getProperty('width'));
			oRm.addStyle("height", oControl.getProperty('height'));
			oRm.addStyle("background-color", oControl.getProperty('backgroundColor'));

			oRm.writeStyles();
			oRm.write(">");

			oRm.renderControl(oControl.getAggregation("_imagem"));
			oRm.write("<div");
			oRm.addClass("container");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_subtitle"));
			oRm.write("</div></div>");
		},

		setTitle: function (sTitle) {
			this.setProperty("title", sTitle, true);
			this.getAggregation("_subtitle").setText(sTitle);
		},

		setImage: function (sSrc) {
			this.setProperty("image", sSrc, true);
			this.getAggregation("_imagem").setSrc(sSrc);
		},

		_onPress: function (oEvent) {
			this.fireEvent("press", {
				value: this.getId()
			});
		},

		press: function (oEvent) {
			this.firePress(oEvent);
		},

		onAfterRendering: function () {
			if (sap.ui.core.Control.prototype.onAfterRendering) {
				sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments);
			}
		},

		getTexto: function () {
			return this.getProperty("title");
		}

	});
});