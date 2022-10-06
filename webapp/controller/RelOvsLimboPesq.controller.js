sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

	return BaseController.extend("arcelor.controller.RelOvsLimboPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelOvsLimboPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (oEvent.getParameters().name != "RelOvsLimboPesq" &&
				oEvent.getParameters().name != "RelOvsLimboRes") {

				this.getView().byId("idEmissorOrdemDe").setValue("");
				this.getView().byId("idEmissorOrdemAte").setValue("");
				this.getView().byId("idDocVendasDe").setValue("");
				this.getView().byId("idDocVendasAte").setValue("");
				this.getView().byId("idComboBoxEscritVendasVenDe").setSelectedKey(null);
				this.getView().byId("idComboBoxEscritVendasVenAte").setSelectedKey(null);

			}
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.view.RelOvsLimboPesq
		 */
		onAfterRendering: function () {
			var filters = [];
			var filter = "";
			//var filter1 = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "EVV");
			filters.push(filter);
			filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
				null ? "X" : ""));
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);

			binding.filter(filters);
		},

		inicioUpdateTabela: function (oEvt) {
			this.getView().setBusy(true);
		},

		fimUpdateTabela: function (oEvt) {
			this._carregaDadoMestre();
			this.getView().setBusy(false);
		},

		_carregaDadoMestre: function () {
			var aEscritVendasVend = []; //EVV

			if (bDadoMestre === false) {
				bDadoMestre = true;

				var oTabela = this.getView().byId("inputDadoMestre");
				var oLinha = oTabela.getItems();
				var oItem,
					oCelulas;
				var vCodconsulta,
					vCoddadomestre,
					vTextodadomestre;

				for (var i = 0; i < oLinha.length; i++) {
					oItem = oLinha[i];
					oCelulas = oItem.getCells();

					vCodconsulta = oCelulas[0].getValue();
					vCoddadomestre = oCelulas[1].getValue();
					vTextodadomestre = oCelulas[2].getValue();

					if (vCodconsulta === "EVV") {
						aEscritVendasVend.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				var oModelEscritVendasVend = new sap.ui.model.json.JSONModel();
				oModelEscritVendasVend.setSizeLimit(1000);
				oModelEscritVendasVend.setData({
					modelEscritVendasVend: aEscritVendasVend
				});
				var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVenDe");
				oDataEscritVendasVend.setModel(oModelEscritVendasVend);
				oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVenAte");
				oDataEscritVendasVend.setModel(oModelEscritVendasVend);
			}
		},

		onLoadItemsCbEscritVendasVen: function () {
			this._carregaDadoMestre();
		},

		onSearch: function (oEvt) {

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idEmissorOrdemDe: this.getView().byId("idEmissorOrdemDe").getValue(),
				idEmissorOrdemAte: this.getView().byId("idEmissorOrdemAte").getValue(),
				idDocVendasDe: this.getView().byId("idDocVendasDe").getValue(),
				idDocVendasAte: this.getView().byId("idDocVendasAte").getValue(),
				idComboBoxEscritVendasVenDe: this.getView().byId("idComboBoxEscritVendasVenDe").getValue(), //.getSelectedKey(),
				idComboBoxEscritVendasVenAte: this.getView().byId("idComboBoxEscritVendasVenAte").getValue(), //.getSelectedKey()
				idVendedorDe: this.getView().byId("idComboBoxEscritVendasVenDe").getSelectedKey(),
				idVendedorAte: this.getView().byId("idComboBoxEscritVendasVenAte").getSelectedKey()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelOvsLimboRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelOvsLimbo(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelOvsLimboRes");
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

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});