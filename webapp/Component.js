sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"arcelor/model/models",
	"arcelor/controller/ListSelector",
	"arcelor/controller/ErrorHandler",
	"arcelor/model/LocalStorageModel",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, ListSelector, ErrorHandler, LocalStorageModel, $, JSONModel) {
	"use strict";

	return UIComponent.extend("arcelor.Component", {
	
		metadata: {
			manifest: "json",
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {

			this.oListSelector = new ListSelector();
			this._oErrorHandler = new ErrorHandler(this);

			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createFLPModel(), "FLP");

			var oCartModel = new LocalStorageModel("SHOPPING_CART", {
				cartEntries: {},
				cartEntriesPedidos: {},
				savedForLaterEntries: {}
			});

			this.setModel(oCartModel, "cartProducts");

			try {
				var oUser = sap.ui2.shell.getUser();
				var oThis = this;

				oUser.load({}, () => {
					let oUserModel = new sap.ui.model.json.JSONModel();
					oUserModel.setData(oUser);
					oThis.setModel(oUserModel, "usuario");
				}, () => {
					alert('Erro ao obter dados do usuário.');
				});
			} catch {

			};

			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();

		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			this.oListSelector.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {

			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});