sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

	return BaseController.extend("arcelor.controller.RelOvsCarteiraPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelOvsCarteiraPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (oEvent.getParameters().name != "RelOvsCarteiraPesq" &&
				oEvent.getParameters().name != "RelOvsCarteiraRes") {

				this.getView().byId("idNumOrdem").setValue("");
				this.getView().byId("idCodCliente").setValue("");
				this.getView().byId("idDataAteCria").setValue("");
				this.getView().byId("idDataDeCria").setValue("");
				this.getView().byId("idComboBoxRotas").setSelectedKey(null);

				var oData = new Date();
				this.getView().byId("idDataAte").setValue(oData.toLocaleDateString(oData));
				oData.setDate(oData.getDate() - 90);
				this.getView().byId("idDataDe").setValue(oData.toLocaleDateString(oData));
			}
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelOvsCarteiraPesq
		 */
		onAfterRendering: function () {
			var filters = [];
			var filter = "";
			var oData = new Date();

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "RO");
			filters.push(filter);
			filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
				null ? "X" : ""));
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);

			binding.filter(filters);

			// Valores de data padrão
			this.getView().byId("idDataAte").setValue(oData.toLocaleDateString(oData));
			oData.setDate(oData.getDate() - 90);
			this.getView().byId("idDataDe").setValue(oData.toLocaleDateString(oData));
		},

		inicioUpdateTabela: function (oEvt) {
			this.getView().setBusy(true);
		},

		fimUpdateTabela: function (oEvt) {
			this._carregaDadoMestre();
			this.getView().setBusy(false);
		},

		_carregaDadoMestre: function () {
			var aRotas = []; //RO

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

					if (vCodconsulta === "RO") {
						aRotas.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				var oModelRotas = new sap.ui.model.json.JSONModel();
				oModelRotas.setSizeLimit(1000);
				oModelRotas.setData({
					modelRotas: aRotas
				});
				var oDataRotas = this.getView().byId("idComboBoxRotas");
				oDataRotas.setModel(oModelRotas);
			}
		},

		x: function () {
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
			if (this._requiredFieldSimple(this.getView(), "idDataDe") === true) {
				return;
			}

			if (this._validateSelOptDate(this.getView(), "idDataDe", "idDataAte")) {
				return;
			}
			
			var idTipoRel = this.getView().byId("idTipoRel").getSelectedIndex();

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idNumOrdem: this.getView().byId("idNumOrdem").getValue(),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idComboBoxRotas: this.getView().byId("idComboBoxRotas").getSelectedKey(),
				idCodCliente: this.getView().byId("idCodCliente").getValue(),
				idDataDeCria: this.getView().byId("idDataDeCria").getValue(),
				idDataAteCria: this.getView().byId("idDataAteCria").getValue(),
				idTipoRel: idTipoRel === 0 ? "D" : idTipoRel === 1 ? "R" : "N"
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelOvsCarteiraRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelOvsCarteira(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelOvsCarteiraRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});