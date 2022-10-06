sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/export/Spreadsheet",
	"../model/formatter",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter"
], function (BaseController, Spreadsheet, Formatter, History, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelCancelamentoNfsRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelCancelamentoNfsRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelCancelamentoNfs(this.getView(), this.oModelSel.getData());
			var dataAtual = new Date();
			this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "bukrs"),
				property: "Bukrs",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "branch"),
				property: "Branch",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "werks"),
				property: "Werks",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "nfnum"),
				property: "Nfnum",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "candat"),
				property: "Candat",
				type: "datetime"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "chatim"),
				property: "Chatim",
				type: "time"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "chaman"),
				property: "Chaman",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "motivo"),
				property: "Motivo",
				type: "string"
			});

			return aCols;
		},

		exportSpreadsheet: function () {
			this._exportSpreadsheet(this.byId("tabRelatorio"), this.createColumnConfig());
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RelCancelamentoNfsPesq", null, true);
			}
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
		}

	});

});