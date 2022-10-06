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

	return BaseController.extend("arcelor.controller.RelFechamentoCaixaPesq", {

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
			var that = this;

			filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CP"); //"CD;EV;SAS;ESCN;CP");
			filters.push(filter);

			var list = this.getView().byId("inputDadoMestre");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);
			binding.filter(filters);

			var aFilters = [];
			aFilters.push(new Filter("Codproduto", FilterOperator.EQ, "1"));

			let oModel = this.getModel();
			oModel.read("/LojasSet", {
				filters: aFilters,
				success: function (oData) {
					let oCentroAux = oData.results.filter(centro => centro.Loja !== "");
					let oCentro = new sap.ui.model.json.JSONModel();
					oCentro.setSizeLimit(1000);
					oCentro.setData({
						LojasSet: oCentroAux
					});
					let oDataCentro = that.getView().byId("combo2");
					oDataCentro.setModel(oCentro);

				},
				error: function (oError) {
					//console.log(oError);
				}
			});

			this.onLoadEscritorio();

			var oview = this.getView().byId("combo2");
			var oData = this.getView().getModel();
			var sPath = "/LogInfSet(usuario='user')";
			var onSuccess = function (odata) {
				oview.clearSelection();
			}
			var onError = function (odata, response) {}
			oData.read(sPath, {
				success: onSuccess,
				error: onError
			});

		},

		_onRouteMatched: function (oEvent) {

			if (oEvent.getParameters().name != "RelFechamentoCaixaRes" &&
				oEvent.getParameters().name != "fechamentocaixa") {

				var oview = this.getView().byId("combo2");
				var oData = this.getView().getModel();
				var sPath = "/LogInfSet(usuario='user')";
				var onSuccess = function (odata) {
					oview.clearSelection();
				}
				var onError = function (odata, response) {}
				oData.read(sPath, {
					success: onSuccess,
					error: onError
				});

				this.byId("idDataDe").setValue("");
				this.byId("idDataAte").setValue("");
				this.byId("idCheckBoxDetalhe").setSelected(true);
				this.getView().byId("idComboBoxCondicao").clearSelection();
				this.getView().byId("idComboBoxEscritVendasVen").clearSelection();
				this.getView().byId("idComboBoxVend").clearSelection();
				this.getView().byId("combo2").clearSelection();

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
				aSetorAtiv = [], //SAS
				aEscProx = [], //ESCN
				aVendProx = [], //VENN
				aCond = []; //CP

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

					//Condição de Pagamento
					if (vCodconsulta === "CP") {
						aCond.push({
							Codconsulta: vCodconsulta.split('/')[1],
							Coddadomestre: vCoddadomestre,
							Textodadomestre: vTextodadomestre
						});
					}

				}

				//Condição de Pagamento
				var oCond = new sap.ui.model.json.JSONModel();
				oCond.setSizeLimit(1000);
				oCond.setData({
					modelCondicao: aCond
				});
				var oDataCond = this.getView().byId("idComboBoxCondicao");
				oDataCond.setModel(oCond);

			}
		},

		handleSelectionFinish: function (oEvent) {
			this.onLoadVendedor();
		},

		handleSelectionEscritorioFinish: function (oEvent) {
			this.onLoadEscritorio();
		},

		onLoadEscritorio: function (oEvent) {

			let oModel = this.getModel();
			var filters = [];
			var filter = "";
			var that = this;

			var oDataCentro = this.getView().byId("combo2");

			if (oDataCentro.getSelectedKeys().length > 0) {

				for (var i = 0; i < oDataCentro.getSelectedKeys().length; i++) {
					filter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oDataCentro.getSelectedKeys()[i]);
					filters.push(filter);
				}

			}

			oModel.read("/EscritorioCentroSet", {
				filters: filters,
				success: function (oData) {
					//Escritório Proximo
					let oEscritProximo = new sap.ui.model.json.JSONModel();
					oEscritProximo.setSizeLimit(1000);
					
					oEscritProximo.setData({
						modelEscritVendasVen: oData.results
					});
					
					let oDataEscritVendasVend = that.getView().byId("idComboBoxEscritVendasVen");
					oDataEscritVendasVend.setModel(oEscritProximo);
				},
				error: function (oError) {
					
				}
			});

		},

		onLoadVendedor: function (oEvent) {

			let oModel = this.getModel();
			var filters = [];
			var filter = "";
			var that = this;

			var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVen");

			if (oDataEscritVendasVend.getSelectedKeys().length == "1") {

				for (var i = 0; i < oDataEscritVendasVend.getSelectedKeys().length; i++) {

					filter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, oDataEscritVendasVend.getSelectedKeys()[i]);
					filters.push(filter);
				}

				oModel.read("/EscritorioCentroSet", {
					filters: filters,
					success: function (oData) {

						//Vendedor Proximo
						var oVendProximo = new sap.ui.model.json.JSONModel();
						oVendProximo.setSizeLimit(1000);
						oVendProximo.setData({
							modelVend: oData.results
						});
						let oVend = that.getView().byId("idComboBoxVend");
						oVend.setModel(oVendProximo);

					},
					error: function (oError) {
						
					}
				});
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

			var check = "";
			if (this.getView().byId("idCheckBoxDetalhe").getSelected()) {
				check = "X";
			}

			if (this.getView().byId("idComboBoxEscritVendasVen").getSelectedKeys().length <= 0 &&
				this.getView().byId("combo2").getSelectedKeys().length <= 0) {

				sap.m.MessageToast.show(this._loadI18n(this.getView(), "preencherCamposObrig"));
				this.getView().byId("idComboBoxEscritVendasVen").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("idComboBoxEscritVendasVen").focus();

				sap.m.MessageToast.show(this._loadI18n(this.getView(), "preencherCamposObrig"));
				this.getView().byId("combo2").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("combo2").focus();
				return;
			}

			this.getView().byId("idComboBoxEscritVendasVen").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("combo2").setValueState(sap.ui.core.ValueState.None);

			var aSelection = {
				idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
				idCentro: this.getView().byId("combo2").getSelectedKeys(),
				idDataDe: this.getView().byId("idDataDe").getValue(),
				idDataAte: this.getView().byId("idDataAte").getValue(),
				idDetalhe: check,
				idEscritorioVendas: this.getView().byId("idComboBoxEscritVendasVen").getSelectedKeys(),
				idVendedor: this.getView().byId("idComboBoxVend").getSelectedKeys(),
				idCondicao: this.getView().byId("idComboBoxCondicao").getSelectedKeys(),
			};

			this.oModelSelection.setData(aSelection);
			sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			var oViewReport = sap.ui.getCore().byId("idViewFechamentoCaixaRes");
			if (oViewReport !== undefined) {
				this._loadFilterRelFechamentoCaixa(oViewReport, aSelection);
			} else {
				this.oModelSelection.setData(aSelection);
				sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
			}

			var oRouter = UIComponent.getRouterFor(this);

			oRouter.navTo("RelFechamentoCaixaRes");
		},

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("master");
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		}

	});

});