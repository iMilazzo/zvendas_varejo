sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter"
], function (BaseController, UIComponent, History, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelNfPeriodoPesq", {

		formatter: formatter,
		
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelNfPeriodoPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {
			this.byId("idCheckBoxNfe").setSelected(null);
			this.byId("idNotasFiscaisDe").setValue("");
			this.byId("idNotasFiscaisAte").setValue("");
			this.byId("idDataDe").setValue("");
			this.byId("idDataAte").setValue("");
		},

		onSearch: function (oEvt) {
			if (this._validateSelOptDate(this.getView(), "idDataDe", "idDataAte")) {
				return;
			}

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idCheckBoxNfe: this.getView().byId("idCheckBoxNfe").getSelected(),
				idNotasFiscaisDe: this.getView().byId("idNotasFiscaisDe").getValue(),
				idNotasFiscaisAte: this.getView().byId("idNotasFiscaisAte").getValue(),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelNfPeriodoRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelNfPeriodo(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelNfPeriodoRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});