sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/GroupHeaderListItem",
	"arcelor/model/formatter"
], function (BaseController, History, GroupHeaderListItem, formatter) {
	"use strict";
	var bDadoMestre = false;

	return BaseController.extend("arcelor.controller.RelVolumeFaturamentoPesq", {

		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVendasDiariasRes
		 */
		onInit: function () {
			this.oModelSelection = new sap.ui.model.json.JSONModel();
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);

		},

		_onRouteMatched: function (oEvent) {
			//
		},

		onAfterRendering: function () {
			var filters = [];
			var filter = "";
			var oData = new Date();

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CD;EV;SAS");
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

					// Canal de Distribuição
					if (vCodconsulta === "CD") {
						aCanalDistr.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					// Escritório de Vendas / Vendedor
					if (vCodconsulta === "EV") {
						aEscritVendasVend.push({
							Codconsulta: vCodconsulta.split('/')[1],
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					// Setor de atividade
					if (vCodconsulta === "SAS") {
						aSetorAtiv.push({
							Codconsulta: vCodconsulta,
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

					// Organização de Vendas
					if (vCodconsulta === "OV") {
						aOrgVenda.push({
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
				var oDataCanalDistr = this.getView().byId("idComboBoxCanalDistr");
				var oDataCanalDistrAte = this.getView().byId("idComboBoxCanalDistrAte");
				var oBindingComboCanal = oDataCanalDistr.getBinding("items");
				var oBindingComboCanalAte = oDataCanalDistrAte.getBinding("items");
				oDataCanalDistr.setModel(oModelCanalDistr);
				oDataCanalDistrAte.setModel(oModelCanalDistr);

				//Setor de atividade
				var oModelSetorAtiv = new sap.ui.model.json.JSONModel();
				oModelSetorAtiv.setSizeLimit(1000);
				oModelSetorAtiv.setData({
					modelSetorAtiv: aSetorAtiv
				});
				var oDataSetorAtivDe = this.getView().byId("idComboBoxSetorAtivDe");
				var oDataSetorAtivAte = this.getView().byId("idComboBoxSetorAtivAte");
				oDataSetorAtivDe.setModel(oModelSetorAtiv);
				oDataSetorAtivAte.setModel(oModelSetorAtiv);

				// Escritório de Vendas / Vendedor
				var oEscritVendasVend = new sap.ui.model.json.JSONModel();
				oEscritVendasVend.setSizeLimit(1000);
				oEscritVendasVend.setData({
					modelEscritVendasVen: aEscritVendasVend
				});
				var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVen");
				var oDataEscritVendasVendAte = this.getView().byId("idComboBoxEscritVendasVenAte");
				oDataEscritVendasVend.setModel(oEscritVendasVend);
				oDataEscritVendasVendAte.setModel(oEscritVendasVend);

			}
		},

		onPesquisar: function (oEvent) {

			if (this._requiredFieldSimple(this.getView(), "idPeriodoMesAno") ||
				this._requiredFieldSimple(this.getView(), "idPeriodoMesAnofim")) {
				return;
			}

			var that = this;

			var aSelection = {
				idComboBoxSetorAtivDe: this.getView().byId("idComboBoxSetorAtivDe").getValue(),
				idComboBoxSetorAtivAte: this.getView().byId("idComboBoxSetorAtivAte").getValue(),
				dataInicial: this.getView().byId("idPeriodoMesAno").getValue(),
				dataFinal: this.getView().byId("idPeriodoMesAnofim").getValue(),
				escritorioVendasDe: this._formataEquipeVendas(that.getView().byId("idComboBoxEscritVendasVen").getValue()),
				escritorioVendasAte: this._formataEquipeVendas(that.getView().byId("idComboBoxEscritVendasVenAte").getValue()),
				canalDistDe: this.getView().byId("idComboBoxCanalDistr").getValue(),
				canalDistAte: this.getView().byId("idComboBoxCanalDistrAte").getValue(),
			};

			var oViewReport = sap.ui.getCore().byId("idViewRelVolumeFaturamentoRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelVolumeVendasFaturamento(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			this.getOwnerComponent().getRouter().navTo("RelVolumeFaturamentoRes");
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		},

		onLimpar: function () {
			this.byId("idPeriodoMesAno").setValue("");
			this.byId("idPeriodoMesAnofim").setValue("");
			this.byId("idComboBoxCanalDistr").setSelectedKey(null);
			this.byId("idComboBoxCanalDistrAte").setSelectedKey(null);
			this.byId("idComboBoxEscritVendasVen").setSelectedKey(null);
			this.byId("idComboBoxEscritVendasVenAte").setSelectedKey(null);
			this.byId("idComboBoxSetorAtivDe").setSelectedKey(null);
			this.byId("idComboBoxSetorAtivAte").setSelectedKey(null);
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		_formataEquipeVendas: function (sValue) {
			if (sValue != "") {
				return sValue.split("/")[1].split("-")[0].trim();
			} else {
				return "";
			}
		}
	});
});