sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History, formatter, Export, ExportTypeCSV, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelelimiRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelOvsCarteiraRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelElimi(this.getView(), this.oModelSel.getData());
		},


		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "vbeln"),
				property: "VBELN",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "FNAME"),
				property: "FNAME",
				type: "string"
			});
			aCols.push({
				label: 'Modificação',
				property: "UDATE",
				type: "string"
			});
			aCols.push({
				label: 'Hora',
				property: "UTIME",
				type: "string"
			});
			aCols.push({
				label: 'Usuário',
				property: "USERNAME",
				type: "string"
			});
			return aCols;
		},

		exportSpreadsheet: function () {
			this.exportSpreadsheet1(this.byId("tabela_relatorio"), this.createColumnConfig());
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RelelimiPesq", null, true);
			}
		},
		exportSpreadsheet1: function () {
			var oTab = this.getView().byId("tabela_relatorio");

			var oBinding = oTab.getBinding("items");
			var oModel = oTab.getModel();
			var oData = oModel.getData();
			for (var i = 0; i < oModel.getData().results.length; i++) {

				if (oModel.getData().results[i].UDATE) {
					if (oModel.getData().results[i].UDATE.toString().indexOf("/") == -1) {
						
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
								content: "{VBELN}"
							}
						}, {
							name: "Motivo",
							template: {
								content: "{FNAME}"
							}
						}, {
							name: "DATA",
							template: {
								content: "{UDATE}"
							}
						}, {
							name: "HORA",
							template: {
								content: "{UTIME}"
							}
						}, {
							name: "Usuário",
							template: {
								content: "{USERNAME}"
							}
						}

					]
				});

			}
			this.onExcel(oExport);

		},


		onExcel: sap.m.Table.prototype.exportData || function (oExport) {
			var vText = this.getResourceBundle().getText("errorPressExcel");

			oExport.saveFile().catch(function (oError) {
				//
			}).then(function () {
				oExport.destroy();
			});
		},
		onImprimirPress: function (oEvent) {
			var bind = this.byId("tabela_relatorio").getBinding("items");
			var contexts = bind.getCurrentContexts();
			var sum = 0;
			var cond = false;
			var that = this;

			window.print();
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

	});

});