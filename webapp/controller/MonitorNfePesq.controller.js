sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, History, formatter, GroupHeaderListItem, UIComponent, Filter, FilterOperator) {
	"use strict";

	var bDadoMestre = false;

	return BaseController.extend("arcelor.controller.MonitorNfePesq", {

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

		onAfterRendering: function () {

			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CD;EV;SAS");
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);
			binding.filter(filters);

		},

		_onRouteMatched: function (oEvent) {

			if (oEvent.getParameters().name != "MonitorNfeRes" &&
				oEvent.getParameters().name != "MonitorNfePesq") {
				this.byId("idDoc").setValue("");
				this.byId("idNotaFiscal").setValue("");
				this.byId("idOrdem").setValue("");
				this.byId("idCodCliente").setValue("");
				this.byId("idDataDe").setValue("");
				this.byId("idDataAte").setValue("");
				this.getView().byId("idComboBoxEscritVendasVen").setSelectedKey(null);
				this.byId("idMaterial").setValue("");
			}

		},

		inicioUpdateTabela: function (oEvt) {
			this.getView().setBusy(true);
		},

		fimUpdateTabela: function (oEvt) {
			this._carregaDadoMestre();
			this.getView().setBusy(false);
		},

		onLoadItemsCbSetorAtiv: function () {
			this._carregaDadoMestre();
		},

		_carregaDadoMestre: function () {
			var aCanalDistr = [], //CD
				aEscritVendasVend = [], //EV
				aGrupoMateriais = [], //GM
				aSetorAtiv = []; //SAS

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

					// Escritório de Vendas / Vendedor
					if (vCodconsulta === "EV") {
						aEscritVendasVend.push({
							Codconsulta: vCodconsulta.split('/')[1],
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

				}

				// Escritório de Vendas / Vendedor
				var oEscritVendasVend = new sap.ui.model.json.JSONModel();
				oEscritVendasVend.setSizeLimit(1000);
				oEscritVendasVend.setData({
					modelEscritVendasVen: aEscritVendasVend
				});
				var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVen");
				var oDataEscritVendasVendAte = this.getView().byId("idComboBoxEscritVendasVenAte");
				oDataEscritVendasVend.setModel(oEscritVendasVend);

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

			var view = this.getView().byId("page");
			view.setBusy(true);

			if (this._requiredFieldSimple(this.getView(), "idDataDe") === true) {
				return;
			}

			this.getView().setBusy(true);

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idNotaFiscal: this.getView().byId("idNotaFiscal").getValue(),
				idOrdem: this.getView().byId("idOrdem").getValue(),
				idCodCliente: this.getView().byId("idCodCliente").getValue(),
				idMaterial: this.getView().byId("idMaterial").getValue(),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idDoc: this.getView().byId("idDoc").getValue(),
				idEscritorioVendas: this.getView().byId("idComboBoxEscritVendasVen").getSelectedKey(),

			};

			this.oModelSelection.setData(aSelection);
			sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("MonitorNfeRes");
			this.getView().setBusy(false);

			view.setBusy(false);
		},

		onNavBack: function () {

			this.getOwnerComponent().getRouter().navTo("financeiro");
		}

	});

});