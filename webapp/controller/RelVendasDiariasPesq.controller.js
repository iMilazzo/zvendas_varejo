sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	// Controle para carregar o "Dado Mestre" uma vez
	var bDadoMestre = false;

	return BaseController.extend("arcelor.controller.RelVendasDiariasPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVendasDiariasPesq
		 */
		onInit: function () {
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVendasDiariasPesq
		 */
		onAfterRendering: function () {

			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CP");
			filters.push(filter);
			filter = new sap.ui.model.Filter(
				"Testerfc", sap.ui.model.FilterOperator.EQ,
				(jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : "")
			);
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);
			binding.filter(filters);

			// Data Inicial da tela
			var oData = new Date();
			this.getView().byId("idDataAte").setValue(this._formatDataBr(oData));
			oData.setDate(oData.getDate() - 90);
			this.getView().byId("idDataDe").setValue(this._formatDataBr(oData));

			var filters_centro = [];
			filters_centro.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.Contains, ""));
			var combocentro = this.getView().byId("idComboBoxCentro");
			var combobinding = combocentro.getBinding("items");
			combobinding.filter(filters_centro);
		},

		inicioUpdateTabela: function (oEvt) {
			this.getView().setBusy(true);
		},

		fimUpdateTabela: function (oEvt) {
			this._carregaDadoMestre();
			this.getView().setBusy(false);
		},

		_carregaDadoMestre: function () {
			var aCondPagamento = []; //CP

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

					// Condição de Pagamento
					if (vCodconsulta === "CP") {
						aCondPagamento.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				// Canal de Distribuição
				var oModelCondPagamento = new sap.ui.model.json.JSONModel();
				oModelCondPagamento.setSizeLimit(1000);
				oModelCondPagamento.setData({
					modelCondPagamento: aCondPagamento
				});
				var oDataCondPagamento = this.getView().byId("idComboBoxCondPagamento");
				oDataCondPagamento.setModel(oModelCondPagamento);
			}
		},

		onLoadItemsCbCondPagamento: function () {
			this._carregaDadoMestre();
		},

		onSearch: function (oEvt) {
			this.getView().setBusy(true);
			if (this._validateSelOptDate(this.getView(), "idDataDe", "idDataAte")) {
				this.getView().setBusy(false);
				return;
			}

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idComboBoxCondPagamento: this.getView().byId("idComboBoxCondPagamento").getSelectedKey(),
				idCentro: this.getView().byId("idComboBoxCentro").getSelectedKey()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelVendasDiariasRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelVendasDiarias(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			this.getView().setBusy(false);
			oRouter.navTo("RelVendasDiariasRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		}

	});

});