sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, MessageToast, History) {
	"use strict";

	var bDadoMestre = false;
	const aFields = ["dtEmissaoDe", "dtEmissaoAte"];
	return BaseController.extend("arcelor.controller.RelDevolucaoPesq", {

		onInit: function () {

			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);

			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {
			//
		},

		onAfterRendering: function () {
			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CD;EV;GM");
			filters.push(filter);
			filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
				null ? "X" : ""));
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);

			binding.filter(filters);
			var filters_centro = [];
			filters_centro.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.Contains, ""));
		},

		inicioUpdateTabela: function (oEvt) {
			this.getView().setBusy(true);
		},

		fimUpdateTabela: function (oEvt) {
			this._carregaDadoMestre();
			this.getView().setBusy(false);
		},

		_carregaDadoMestre: function () {
			var aCanalDistr = [], //CD
				aEscritVendasVend = [], //EV
				aGrupoMateriais = []; //GM

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

					// Canal de Distribuição
					if (vCodconsulta === "CD") {
						aCanalDistr.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					// Equipe de Vendas / Vendedor
					if (vCodconsulta === "EV") {
						aEscritVendasVend.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					// Grupo de Materiais
					if (vCodconsulta === "GM") {
						aGrupoMateriais.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				// Canal de Distribuição
				var oModelCanalDistr = new sap.ui.model.json.JSONModel();
				oModelCanalDistr.setSizeLimit(1000);

				aCanalDistr = aCanalDistr.filter(item => {
					return item.Coddadomestre.includes("10") || item.Coddadomestre.includes("20") ||
						item.Coddadomestre.includes("30") || item.Coddadomestre.includes("40")
				});

				oModelCanalDistr.setData({
					modelCanalDistr: aCanalDistr
				});

				// Escritório de Vendas / Vendedor
				var oEscritVendasVend = new sap.ui.model.json.JSONModel();
				oEscritVendasVend.setSizeLimit(1000);
				oEscritVendasVend.setData({
					modelEscritVendasVen: aEscritVendasVend
				});
				var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVen");
				oDataEscritVendasVend.setModel(oEscritVendasVend);
			}
		},

		onLoadItemsCbCanalDistr: function () {
			this._carregaDadoMestre();
		},

		onLoadItemsCbEscritVendasVen: function () {
			this._carregaDadoMestre();
		},

		onLoadItemsCbGrupoMateriais: function () {
			this._carregaDadoMestre();
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

			var sVkbur = "";
			var escrit;
			var vend = "";

			if (this.getView().byId("idComboBoxEscritVendasVen").getSelectedItem() !== null) {
				escrit = this.getView().byId("idComboBoxEscritVendasVen").getSelectedItem().getText().split("/")
				sVkbur = escrit[0].trim();
				vend = escrit[1].substr(0, 3).trim();
			}
			var dataate;
			
			if (this.getView().byId("idDataAte").getValue() == "") {
				dataate = this.getView().byId("idDataDe").getValue();
			} else {
				dataate = this.getView().byId("idDataAte").getValue()
			}
			
			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idCentro: 9607, 
				idComboBoxEscritVendasVen: vend, 
				idVkbur: sVkbur,
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: dataate,
				idCodCliente: this.getView().byId("idCodCliente").getValue()
			};
			
			if (this.getView().byId("idDataDe").getValue() == "") {
				MessageToast.show('O campo de data de início é obrigatório');
				return;
			}
			
			var oViewReport = sap.ui.getCore().byId("idViewRelDevolucaoRes");
			this.oModelSelection.setData(aSelection);
			sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelDevolucaoRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		},

		onLimparFiltros: function () {
			this._clearInputField("idDataDe");
			this._clearInputField("idDataAte");
			this._clearInputField("idCodCliente");
			this._clearComboboxField("idComboBoxEscritVendasVen");
		},

		_clearInputField: function (sId) {
			this.getView().byId(sId).setValue("");
		},

		_clearComboboxField: function (sId) {
			this.getView().byId(sId).setSelectedKey("");
		}

	});

});