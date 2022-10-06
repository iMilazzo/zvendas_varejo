sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, MessageToast, History) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelChequeMoradiaPesq", {

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

			this.getView().byId("idDataCriacaoDe").setValue("");
			this.getView().byId("idDataCriacaoAte").setValue("");
			this.getView().byId("salesOrderFilterFrom").setValue("");
			this.getView().byId("salesOrderFilterTo").setValue("");
			this.getView().byId("checkFrom").setValue("");
			this.getView().byId("checkTo").setValue("");
			this.getView().byId("salesCPFCNPF").setValue("");
			this.getView().byId("salesBaixaFrom").setValue("");
			this.getView().byId("salesBaixaTo").setValue("");
			this.getView().byId("status").setSelectedKey("");
		},

		onSearch: function (oEvt) {
			if (this.getView().byId("idDataCriacaoDe").getValue()) {
				var aSelection = {
					beginDate: this.getView().byId("idDataCriacaoDe").getValue(),
					endDate: this.getView().byId("idDataCriacaoAte").getValue(),
					salesFrom: this.getView().byId("salesOrderFilterFrom").getValue(),
					salesTo: this.getView().byId("salesOrderFilterTo").getValue(),
					checkFrom: this.getView().byId("checkFrom").getValue(),
					checkTo: this.getView().byId("checkTo").getValue(),
					cpfCNPJ: this.getView().byId("salesCPFCNPF").getValue(),
					baixaFrom: this.getView().byId("salesBaixaFrom").getValue(),
					baixaTo: this.getView().byId("salesBaixaTo").getValue(),
					Status: this.getView().byId("status").getSelectedKey()
				};

				var oViewReport = sap.ui.getCore().byId("idViewRelCancelamentoNfsRes");

				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");

				var oRouter = UIComponent.getRouterFor(this);
				oRouter.navTo("chequemoradiarelatorio");
			} else {
				MessageToast.show("Campo data obrigatório");
			}
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("financeiro");
		}

	});

});