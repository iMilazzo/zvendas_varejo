sap.ui.define([
	"arcelor/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("arcelor.controller.RevisaoVenda", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.controller.view.RevisaoVenda
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
		},

		_onMasterMatched: function (oEvent) {
			var oParameters = oEvent.getParameters();
			var oModelData = this.getModel("SalesModelPag").getData();
			var oModelDataProd = this.getModel("ProdutosSet").getData();
		},

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("Vendas", null, true);
		},

		onPressconfirmar: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("Pagamento", null, true);
		}

	});

});