sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	  "sap/m/MessageToast"
], function (BaseController, UIComponent, History, MessageToast) {
	"use strict";

	var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

	return BaseController.extend("arcelor.controller.RelelimiPesq", {

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

			if (oEvent.getParameters().name === "RelelimiPesq") {

			//	this.getView().byId("idNumOrdem").setValue("");
			//	this.getView().byId("idDataAteCria").setValue("");
			//	this.getView().byId("idDataDeCria").setValue("");

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
				//var oDataRotas = this.getView().byId("idComboBoxRotas");
				//oDataRotas.setModel(oModelRotas);
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

			if(this.getView().byId("idDataDeCria").getValue() == ""){
				
	            MessageToast.show('Data inicial obrigatória!');
	            return false;
			}
			var bloq = '';
			//var idTipoRel = this.getView().byId("idTipoRel").getSelectedIndex();
			if (this.byId("elimi").getSelected()) {
				var elimi = 'X';
				bloq = 'X';
			}
			if (this.byId("limb").getSelected()) {
				var lib = 'X';
				bloq = 'X';
			}
			if (this.byId("cred").getSelected()) {
				var Cred = 'X';
				bloq = 'X';
			}
			if(bloq!='X'){
				
	            MessageToast.show('Escolha pelo menos uma das opções: Eliminaçã0, Lib. Crédito ou Lib. Limbo.');
	            return false;
			}
			var aSelection = {
				idNumOrdem: this.getView().byId("idNumOrdem").getValue(),
				idDataDeCria: this.getView().byId("idDataDeCria").getValue(),
				idDataAteCria: this.getView().byId("idDataAteCria").getValue(),
				idTipoEli: elimi,
				idLib: lib,
				idCred: Cred
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelelimiRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelElimi(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelelimiRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});