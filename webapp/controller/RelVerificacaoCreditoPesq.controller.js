sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/UIComponent"
], function (BaseController, History, formatter, GroupHeaderListItem, UIComponent) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelVerificacaoCreditoPesq", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelCarteiraOvsDetPesq
		 */
		onInit: function () {

			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (!oEvent || oEvent.getParameters().name === "RelVerificacaoCreditoPesq") {

				this.byId("idClasseDe").setValue("");
				this.byId("idClasseAte").setValue("");
				this.byId("idDataDe").setValue("");
				this.byId("idDataAte").setValue("");
				this.byId("idCodCliente").setValue("");
			}
		},

		handleSuggest: function (oEvt) {
			var aFilters = [];
			var oFilter;
			var sTermo = oEvt.getParameter("suggestValue");
			var sTermoOrig = sTermo;

			sTermo = this.utilFormatterCPFCNPJClearSearch(sTermo);

			if ((sTermo && sTermo.length > 0) && (sTermo.trim() !== "")) {

				if ($.isNumeric(sTermo) && sTermo.length === 11) {
					oFilter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, sTermo);
				}
				if ($.isNumeric(sTermo) && sTermo.length < 11) {
					oFilter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, sTermo);
				} else if ($.isNumeric(sTermo) && sTermo.length > 11) {
					sTermo = this.utilFormatterCPFCNPJClearSearch(sTermo);
					oFilter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, sTermo);
				} else if (!$.isNumeric(sTermo)) {
					oFilter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sTermoOrig);
				}

				aFilters.push(oFilter);

				oEvt.getSource().getBinding("suggestionRows").filter(aFilters, false);
			}
		},

		onSearch: function (oEvt) {

			if (this._requiredFieldSimple(this.getView(), "idDataDe") === true) {
				return;
			}

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idClasseDe: this.getView().byId("idClasseDe").getValue(),
				idClasseAte: this.getView().byId("idClasseAte").getValue(),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idCodCliente: this.getView().byId("idCodCliente").getValue()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelVerificacaoCreditoRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelVerificacaoCredito(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelVerificacaoCreditoRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});