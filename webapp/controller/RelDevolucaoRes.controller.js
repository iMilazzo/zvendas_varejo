sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	'sap/ui/core/format/NumberFormat'
], function (BaseController, JSONModel, FilterOperator, Filter, MessageToast, History, formatter, Export, ExportTypeCSV, NumberFormat) {
	"use strict";

	var oModel;

	return BaseController.extend("arcelor.controller.RelDevolucaoRes", {

		formatter: formatter,

		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
		},

		onExit: function () {
			this.destroy();
		},

		_onRouteMatched: function (oEvent) {
			this.oModel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			if (oEvent.getParameter("name") === "RelDevolucaoRes") {
				this._loadDevolucao();
			}
		},

		_loadDevolucao() {

			let oModel = this.getModel();
			let aSelection = this.oModel.getData();
			var aFilters = [];
			var that = this;
			this.getView().setBusy(true);
			var total_geral = 0;

			if (aSelection.idCodCliente.length > 0 && aSelection.idCodCliente.length > 0) {
				aFilters.push(this._createFilterBT("Kunnr", aSelection.idCodCliente, aSelection.idCodCliente));
			} else if (aSelection.idCodCliente.length > 0) {
				aFilters.push(this._createFilterEQ("Kunnr", aSelection.idCodCliente));
			}

			// Período do Relatório
			if (aSelection.idDataDe !== "" && aSelection.idDataAte !== "") {
				this.oDataDe = this._convDateBrStringToObj(aSelection.idDataDe); //new Date(aSelection.idDataDe.slice(6, 10), aSelection.idDataDe.slice(3, 5), aSelection.idDataDe.slice(0, 2));
				this.oDataAte = this._convDateBrStringToObj(aSelection.idDataAte); //new Date(aSelection.idDataAte.slice(6, 10), aSelection.idDataAte.slice(3, 5), aSelection.idDataAte.slice(0, 2));

				this.oFilter = new sap.ui.model.Filter("Edatu", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
				aFilters.push(this.oFilter);
			} else if (aSelection.idDataDe !== "") {
				this.oDataDe = this._convDateBrStringToObj(aSelection.idDataDe); //new Date(aSelection.idDataDe.slice(6, 10), aSelection.idDataDe.slice(3, 5), aSelection.idDataDe.slice(0, 2));

				this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
				aFilters.push(this.oFilter);
				this.oFilter = new sap.ui.model.Filter("Fdatu", sap.ui.model.FilterOperator.EQ, this.oDataDe);
				aFilters.push(this.oFilter);
			}
			if (aSelection.idComboBoxEscritVendasVen !== "") {
				this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.EQ, aSelection.idComboBoxEscritVendasVen);
				aFilters.push(this.oFilter);
			}

			oModel.read("/DevolucaoSet", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results.length === 0) {
						let oModelData = new JSONModel();
						var Kunnr = false;

						oModelData.setData(oData);

						that.byId("tabela_relatorio").setModel(oModelData);
						that.getView().setBusy(false);

					} else {
						let oModelData = new JSONModel();
						var Kunnr = false;

						oModelData.setData(oData);

						oModelData.getData().results.forEach(function (context, i) {
							if (context.Kunnr != Kunnr) {
								var totals = oModelData.getData().results.filter((element) => {
									return element.Kunnr === context.Kunnr;
								});
							}
						});

						that.byId("tabela_relatorio").setModel(oModelData);
						that._bindTableExcel(aFilters);
						that.getView().setBusy(false);
					}
				},
				error: function (oError) {
					that.getView().setBusy(false);
				}
			});
		},

		_createFilterEQ(sFieldName, sValue) {
			return new Filter(sFieldName, FilterOperator.EQ, sValue);
		},

		_createFilterBT(sFieldName, sValueDe, sValueAte) {
			return new Filter(sFieldName, FilterOperator.BT, sValueDe, sValueAte);
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (typeof (sPreviousHash) !== "undefined") {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RelDadosCobrancaPesq", true);
			}
		},

		_bindTableExcel: function (aAllFilters) {
			let oTab = this.byId("tabRelatorio");
			let oTabBinding = oTab.getBinding("rows");
			var that = this;

			oTabBinding.oModel.setSizeLimit(1000000);

			oTabBinding.filter(aAllFilters);
		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: "Empresa",
				property: "Bukrs",
				type: "string"
			});
			aCols.push({
				label: "Cliente",
				property: "Kunnr",
				type: "string"
			});
			aCols.push({
				label: "Razão Social",
				property: "Name1",
				type: "string"
			});
			aCols.push({
				label: "Divisão",
				property: "Gsber",
				type: "string"
			});
			aCols.push({
				label: "Tipo Documento",
				property: "Blart",
				type: "string"
			});
			aCols.push({
				label: "Numero Documento",
				property: "Belnr",
				type: "string"
			});
			aCols.push({
				label: "Referência",
				property: "Xblnr",
				type: "string"
			});
			aCols.push({
				label: "Item",
				property: "Buzei",
				type: "string"
			});
			aCols.push({
				label: "Registro Emissao",
				property: "Bldat",
				type: "date"
			});
			aCols.push({
				label: "Vencimento Atual",
				property: "Data",
				type: "date"
			});
			aCols.push({
				label: "Valor",
				property: "Dmbtr",
				type: "number"
			});

			return aCols;
		},

		exportSpreadsheet: function () {
			var oTab = this.getView().byId("tabela_relatorio");

			var oBinding = oTab.getBinding("items");
			var oModel = oTab.getModel();
			var oData = oModel.getData();
			for (var i = 0; i < oModel.getData().results.length; i++) {

				if (oModel.getData().results[i].Edatu) {
					if (oModel.getData().results[i].Edatu.toString().indexOf("/") == -1) {
						var ye = new Intl.DateTimeFormat('en', {
							year: 'numeric'
						}).format(oModel.getData().results[i].Edatu);
						var mo = new Intl.DateTimeFormat('en', {
							month: '2-digit'
						}).format(oModel.getData().results[i].Edatu);
						var da = new Intl.DateTimeFormat('en', {
							day: '2-digit'
						}).format(oModel.getData().results[i].Edatu);
						oModel.getData().results[i].Edatu = da + "/" + mo + "/" + ye;
						oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
					}
				}
				var oExport = new sap.ui.core.util.Export({
					exportType: new ExportTypeCSV({
						separatorChar: ";"
					}),
					models: oModel,
					rows: {
						path: "/results"
					},
					columns: [{
							name: "Ordem de Venda",
							template: {
								content: "{Vbeln}"
							}
						}, {
							name: "Motivo",
							template: {
								content: "{Motivo}"
							}
						}, {
							name: "Cliente",
							template: {
								content: "{Kunnr}"
							}
						}, {
							name: "Razão Social",
							template: {
								content: "{Name1}"
							}
						}, {
							name: "Cidade",
							template: {
								content: "{Ort01}"
							}
						}, {
							name: "Data de Criação",
							template: {
								content: "{Edatu}"
							}
						}, {
							name: "Grupo de Vendedor",
							template: {
								content: "{Grupo}"
							}
						}, {
							name: "Item da Devolução",
							template: {
								content: "{Posnr}"
							}
						}, {
							name: "Código do Material",
							template: {
								content: "{Matnr}"
							}
						}, {
							name: "Descrição do Materia",
							template: {
								content: "{Maktg}"
							}
						}, {
							name: "Grupo de Mercadorias",
							template: {
								content: "{Matkl}"
							}
						}, {
							name: "Quantidade",
							template: {
								content: "{VTotconf}"
							}
						}, {
							name: "Unidade de Medida",
							template: {
								content: "{Vrkme}"
							}
						},

						{
							name: "Documento Referência",
							template: {
								content: "{Zuonr}"
							}
						}

					]
				});

			}
			this.onExcel(oExport);

		},
		priceqtd3: function (sValue) {

			sValue = sValue != null ? sValue.toString().trim() : sValue;

			if (!isNaN(sValue)) {
				var numberFormat = NumberFormat.getFloatInstance({
					maxFractionDigits: 3,
					minFractionDigits: 3,
					groupingEnabled: true,
					groupingSeparator: ".",
					decimalSeparator: ","
				});
				return numberFormat.format(sValue);
			}
			return sValue;
		},

		onExcel: sap.m.Table.prototype.exportData || function (oExport) {
			var vText = this.getResourceBundle().getText("errorPressExcel");

			oExport.saveFile().catch(function (oError) {
				//
			}).then(function () {
				oExport.destroy();
			});
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onImprimirPress: function () {
			window.print();
		}

	});
});