sap.ui.define(["arcelor/controller/BaseController",
	"sap/ui/core/routing/History", "arcelor/model/formatter",
	"sap/ui/core/util/Export", "sap/ui/core/util/ExportTypeCSV",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History,
	formatter, Export, ExportTypeCSV, GroupHeaderListItem) {
	"use strict";

	var detalhe = false;

	return BaseController.extend("arcelor.controller.RelFechamentoCaixaRes", {

		formatter: formatter,

		onAfterRendering: function () {

			this.getView().setBusy(true);

			this.oModelSel = sap.ui.getCore().getModel(
				"dados_selecao_relatorio");

			var dataAtual = new Date();
			this.byId("dataAtual").setText(
				dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

			this._loadFilterRelFechamentoCaixa(this.getView(), this.oModelSel
				.getData());

		},

		getGroupHeader: function (oGroup) {

			var tabela = this.getView().byId("tabela_relatorio");
			var filter = tabela.getModel().getData().result.filter((element) => {
				return element.Zterm == oGroup.key;
			});

			var dataAtual = new Date();
			var data = dataAtual.toLocaleDateString(dataAtual);

			var zterm = filter[0].Zterm;
			var vtext = filter[0].Vtext;
			var total = formatter.price(filter[0].Total);

			var title_ = "Cond.Pag: " + oGroup.key + " " + vtext + "  -  Valor Total: " + total;

			return new GroupHeaderListItem({
				title: title_,
				upperCase: false,
			});
		},

		getGroup: function (oContext) {

			var oModel = oContext.getModel();
			var oRow = oModel.getProperty(oContext.sPath);
			return {
				key: oRow.Zterm
			};
		},

		createColumnConfig: function () {
			var aCols = [];

			let selecao = sap.ui.getCore().getModel("dados_selecao_relatorio");
			if (selecao.oData.idDetalhe === "X") {

				aCols.push({
					label: this._loadI18n(this.getView(), "zterm"),
					property: "Zterm",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "ztermtext"),
					property: "Vtext",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "nfenum"),
					property: "Nfenum",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "vbeln"),
					property: "Vbeln",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "escritorio"),
					property: "Vkbur",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "Vkgrp"),
					property: "Vkgrp",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "kunnr"),
					property: "Kunnr",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "name1"),
					property: "Name1",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "valorov"),
					property: "ValorOrdem",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "valorfat"),
					property: "Nftot",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "valorpago"),
					property: "Autwr",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "diferenca"),
					property: "Dife",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "conciliado"),
					property: "Conciliado",
					type: "string"
				});
				aCols.push({
					label: this._loadI18n(this.getView(), "dtconciliado"),
					property: "AudatCo",
					type: "datetime"
				});
			} else {

				aCols.push({
					label: this._loadI18n(this.getView(), "zterm"),
					property: "Zterm",
					type: "string"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "ztermtext"),
					property: "Vtext",
					type: "string"
				});
				aCols.push({
					label: this._loadI18n(this.getView(), "valorov"),
					property: "TotalOrdem",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "valorfat"),
					property: "Total",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "valorpago"),
					property: "TotalPago",
					type: "number"
				});

				aCols.push({
					label: this._loadI18n(this.getView(), "diferenca"),
					property: "TotalDif",
					type: "number"
				});
			}

			return aCols;
		},

		exportSpreadsheet: function () {
			var oTab = this.getView().byId("tabela_relatorio_geral");
			var oBinding = oTab.getBinding("items");
			var oModel = oTab.getModel();
			var oData = oModel.getData();
			for (var i = 0; i < oModel.getData().result.length; i++) {
				oModel.getData().result[i].ValorOrdem = oModel.getData().result[i].ValorOrdem.replace(".", ",");
				oModel.getData().result[i].Nftot = oModel.getData().result[i].Nftot.replace(".", ",");
				oModel.getData().result[i].Autwr = oModel.getData().result[i].Autwr.replace(".", ",");
				oModel.getData().result[i].Dife = oModel.getData().result[i].Dife.replace(".", ",");

				if (oModel.getData().result[i].AudatCo) {
					if (oModel.getData().result[i].AudatCo.toString().indexOf("/") == -1) {
						var ye = new Intl.DateTimeFormat('en', {
							year: 'numeric'
						}).format(oModel.getData().result[i].AudatCo);
						var mo = new Intl.DateTimeFormat('en', {
							month: '2-digit'
						}).format(oModel.getData().result[i].AudatCo);
						var da = new Intl.DateTimeFormat('en', {
							day: '2-digit'
						}).format(oModel.getData().result[i].AudatCo);
						oModel.getData().result[i].AudatCo = da + "/" + mo + "/" + ye;

					}
				}
				if (oModel.getData().result[i].fkdat) {
					if (oModel.getData().result[i].fkdat.toString().indexOf("/") == -1) {
						oModel.getData().result[i].fkdat = oModel.getData().result[i].fkdat.substring(8, 10) + "/" + oModel.getData().result[i].fkdat.substring(
							5, 7) + "/" + oModel.getData().result[i].fkdat.substring(0, 4);

					}
				}
			}
			var oExport = new sap.ui.core.util.Export({
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),
				models: oModel,
				rows: {
					path: "/result"
				},
				columns: [{
						name: this._loadI18n(this.getView(), "ztermtext"),
						template: {
							content: "{Zterm} - {Vtext}"
						}
					}, {
						name: this._loadI18n(this.getView(), "nfenum"),
						template: {
							content: "{Nfenum}"
						}
					}, {
						name: this._loadI18n(this.getView(), "vbeln"),
						template: {
							content: "{Vbeln}"
						}
					}, {
						name: this._loadI18n(this.getView(), "escritorio"),
						template: {
							content: "{Vkbur}"
						}
					}, {
						name: this._loadI18n(this.getView(), "Vkgrp"),
						template: {
							content: "{Vkgrp}"
						}
					}, {
						name: this._loadI18n(this.getView(), "Kunnr"),
						template: {
							content: "{Kunnr}"
						}
					}, {
						name: this._loadI18n(this.getView(), "name1"),
						template: {
							content: "{Name1}"
						}
					}, {
						name: "Data Fatura",
						template: {
							content: "{fkdat}"
						}
					}, {
						name: this._loadI18n(this.getView(), "valorov"),
						template: {
							content: "{ValorOrdem}"
						}
					}, {
						name: this._loadI18n(this.getView(), "valorfat"),
						template: {
							content: "{Nftot}"
						}
					}, {
						name: this._loadI18n(this.getView(), "valorpago"),
						template: {
							content: "{Autwr}"
						}
					},

					{
						name: this._loadI18n(this.getView(), "diferenca"),
						template: {
							content: "{Dife}"
						}
					}, {
						name: this._loadI18n(this.getView(), "conciliado"),
						template: {
							content: "{Conciliado}"
						}
					}, {
						name: this._loadI18n(this.getView(), "dtconciliado"),
						template: {
							content: "{AudatCo}"
						}
					}

				]
			});

			this.onExcel(oExport);

		},

		onExcel: sap.m.Table.prototype.exportData || function (oExport) {
			var vText = this.getResourceBundle().getText("errorPressExcel");
			// download exported file
			oExport.saveFile().catch(function (oError) {
				//Handle your error
			}).then(function () {
				oExport.destroy();
			});
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("fechamentocaixa", null, true);
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onImprimirPress: function () {
			window.print();
		}

	});

});