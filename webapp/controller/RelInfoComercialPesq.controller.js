sap.ui.define([

	"arcelor/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
	"use strict";

	var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

	return BaseController.extend("arcelor.controller.RelInfoComercialPesq", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelInfoComercialPesq
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.oModelSelection = new sap.ui.model.json.JSONModel();
		},

		_onRouteMatched: function (oEvent) {

			if (!oEvent || oEvent.getParameters().name === "RelInfoComercialPesq") {

				this.byId("idComboBoxCentro").setSelectedKey(null);
				this.byId("idComboBoxGrupoMateriaisDe").setSelectedKey(null);
				this.byId("idComboBoxGrupoMateriaisAte").setSelectedKey(null);
				this.byId("idComboBoxSetorAtivDe").setSelectedKey(null);
				this.byId("idComboBoxSetorAtivAte").setSelectedKey(null);

			}
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelInfoComercialPesq
		 */
		onAfterRendering: function () {
			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CEN;CGM;SA");
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
			var aCentro = [], //CEN
				aGrupoMateriais = [], //CGM
				aSetorAtiv = []; //SA

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

					if (vCodconsulta === "CEN") {
						aCentro.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					if (vCodconsulta === "CGM") {
						aGrupoMateriais.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					if (vCodconsulta === "SA") {
						aSetorAtiv.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}
				}

				// Centro
				var oModelCentro = new sap.ui.model.json.JSONModel();
				oModelCentro.setSizeLimit(1000);
				oModelCentro.setData({
					modelCentro: aCentro
				});
				var oDataCentro = this.getView().byId("idComboBoxCentro");
				oDataCentro.setModel(oModelCentro);

				// Cond. Grupo de Materiais
				var oModelGrupoMateriais = new sap.ui.model.json.JSONModel();
				oModelGrupoMateriais.setSizeLimit(1000);
				oModelGrupoMateriais.setData({
					modelGrupoMateriais: aGrupoMateriais
				});
				var oDataGrupoMateriaisDe = this.getView().byId("idComboBoxGrupoMateriaisDe");
				var oDataGrupoMateriaisAte = this.getView().byId("idComboBoxGrupoMateriaisAte");
				oDataGrupoMateriaisDe.setModel(oModelGrupoMateriais);
				oDataGrupoMateriaisAte.setModel(oModelGrupoMateriais);

				// Setor de Atividade
				var oModelSetorAtiv = new sap.ui.model.json.JSONModel();
				oModelSetorAtiv.setSizeLimit(1000);
				oModelSetorAtiv.setData({
					modelSetorAtiv: aSetorAtiv
				});
				var oDataSetorAtivDe = this.getView().byId("idComboBoxSetorAtivDe");
				var oDataSetorAtivAte = this.getView().byId("idComboBoxSetorAtivAte");
				oDataSetorAtivDe.setModel(oModelSetorAtiv);
				oDataSetorAtivAte.setModel(oModelSetorAtiv);
			}
		},

		onLoadItemsCbCentro: function () {
			this._carregaDadoMestre();
		},

		onLoadItemsCbGrupoMateriais: function () {
			this._carregaDadoMestre();
		},

		onLoadItemsCbSetorAtiv: function () {
			this._carregaDadoMestre();
		},

		onSearch: function (oEvt) {
			if (this._requiredFieldSimple(this.getView(), "idComboBoxCentro") === true) {
				return;
			}

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idComboBoxCentro: this.getView().byId("idComboBoxCentro").getValue(),
				idComboBoxGrupoMateriaisDe: this.getView().byId("idComboBoxGrupoMateriaisDe").getValue(),
				idComboBoxGrupoMateriaisAte: this.getView().byId("idComboBoxGrupoMateriaisAte").getValue(),
				idComboBoxSetorAtivDe: this.getView().byId("idComboBoxSetorAtivDe").getValue(),
				idComboBoxSetorAtivAte: this.getView().byId("idComboBoxSetorAtivAte").getValue()
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelInfoComercialRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelInfoComercial(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("RelInfoComercialRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		}

	});

});