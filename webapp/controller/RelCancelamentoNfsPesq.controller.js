sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelCancelamentoNfsPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelCancelamentoNfsPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (!oEvent || oEvent.getParameters().name === "RelCancelamentoNfsPesq") {

				this.byId("idDataDe").setValue("");
				this.byId("idDataAte").setValue("");

			}
		},

		onSearch: function (oEvt) {
			if (this._validateSelOptDate(this.getView(), "idDataDe", "idDataAte")) {
				return;
			}

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelCancelamentoNfsRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelCancelamentoNfs(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelCancelamentoNfsRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});