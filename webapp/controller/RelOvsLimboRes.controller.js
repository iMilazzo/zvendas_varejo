sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter"
], function (BaseController, History, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelOvsLimboRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.RelOvsLimboRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelOvsLimbo(this.getView(), this.oModelSel.getData());
		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "vbeln"),
				property: "Vbeln",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "auart"),
				property: "Auart",
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
				label: this._loadI18n(this.getView(), "matnr"),
				property: "Matnr",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "arktx"),
				property: "Arktx",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "vrkme"),
				property: "Vrkme",
				type: "string"
			});

			aCols.push({
				label: "Preço Liq.",

				property: "Netwr",
				type: "number"
			});
			aCols.push({
				label: "Preço Com Imp.",

				property: "Netpr",
				type: "number"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "erdat"),

				property: "Erdat",
				type: "datetime"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "werks"),
				property: "Werks",
				type: "string"
			});

			aCols.push({
				label: "Escritório Vend",
				property: "Vkbur",
				type: "string"
			});

			aCols.push({
				label: "Desc.Escritório Vend.",
				property: "VkburTxt",
				type: "string"
			});

			aCols.push({
				label: "Vendedor",
				property: "Vkgrp",
				type: "string"
			});

			aCols.push({
				label: "Desc.Vendedor",
				property: "VkgrpTxt",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vtweg"),
				property: "Vtweg",
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
				this.getOwnerComponent().getRouter().navTo("RelOvsLimboPesq", null, true);
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
		},

	});

});