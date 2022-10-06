sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

	return BaseController.extend("arcelor.controller.RelTransferenciaPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelTransferenciaPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (!oEvent || oEvent.getParameters().name === "RelTransferenciaPesq") {

				this.byId("idComboBoxMaterial").setSelectedKey(null);
				this.byId("idDataDe").setValue("");
				this.byId("idDataAte").setValue("");

			}
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.view.RelTransferenciaPesq
		 */
		onAfterRendering: function () {
			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "MT");
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
			var aMaterial = []; //MT

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

					// Material
					if (vCodconsulta === "MT") {
						aMaterial.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				// Material
				var oModelMaterial = new sap.ui.model.json.JSONModel();
				oModelMaterial.setSizeLimit(1000);
				oModelMaterial.setData({
					modelMaterial: aMaterial
				});
				var oDataMaterial = this.getView().byId("idComboBoxMaterial");
				oDataMaterial.setModel(oModelMaterial);
			}
		},

		onLoadItemsCbMaterial: function () {
			this._carregaDadoMestre();
		},

		onSearch: function (oEvt) {
			if (this._requiredFieldSimple(this.getView(), "idDataDe") === true) {
				return;
			}
			if (this._validateSelOptDate(this.getView(), "idDataDe", "idDataAte")) {
				return;
			}

			var aSelection,
				sTipoRel;

			if (this.getView().byId("RB1-1").getSelected() === true) {
				sTipoRel = "T"; //"TODO"
			} else if (this.getView().byId("RB1-2").getSelected() === true) {
				sTipoRel = "A"; //"ABER"
			} else if (this.getView().byId("RB1-3").getSelected() === true) {
				sTipoRel = "R"; //"RECE"
			}

			aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idTipoRel: sTipoRel,
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idComboBoxMaterial: this.getView().byId("idComboBoxMaterial").getSelectedKey(),
				idCheckBoxExcRemFinal: this.getView().byId("idCheckBoxExcRemFinal").getSelected()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelTransferenciaRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelTransferencia(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelTransferenciaRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});