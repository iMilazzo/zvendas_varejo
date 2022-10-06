sap.ui.define([
	//"sap/ui/core/mvc/Controller"
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/GroupHeaderListItem",
	"arcelor/model/formatter"
], function (BaseController, History, GroupHeaderListItem, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelVendasDiariasRes", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVendasDiariasRes
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);

		},

		_onRouteMatched: function (oEvent) {
			//this.onAfterRendering();
		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVendasDiariasRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelVendasDiarias(this.getView(), this.oModelSel.getData());
			var dataAtual = new Date();
			this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));
		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "xblnr"),
				property: "Xblnr",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "aubel"),
				property: "Aubel",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "fkdat"),
				property: "Fkdat",
				type: "datetime"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "kunag"),
				property: "Kunag",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "name"),
				property: "Name",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "zterm"),
				property: "Zterm",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "zterm"),
				property: "ZtermText",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "posnr"),
				property: "Posnr",
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
				label: this._loadI18n(this.getView(), "quant"),
				property: "Quant",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "total"),
				property: "Total",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "vkbur"),
				property: "Vkbur",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "vkbur"),
				property: "VkburText",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "Vkgrp"),
				property: "Vkgrp",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "Vkgrp"),
				property: "VkgrpText",
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
				this.getOwnerComponent().getRouter().navTo("RelCreditoPesq", null, true);
			}
		},

		getGroupHeader: function (oGroup) {

			return new GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false,
			});
		},

		getTotal: function (oContext) {
			return oContext.getProperty('Total');
		},

		onImprimirPress: function (oEvent) {
			var bind = this.byId("tabela_relatorio").getBinding("items");
			var contexts = bind.getCurrentContexts();
			var sum = 0;
			var cond = false;
			var that = this;

			window.print();
		},

		_createAddLine: function (sId, text) {
			var columListItem = new sap.m.ColumnListItem(sId, {

				cells: [
					new sap.m.Text({
						text: text
					})
				]
			});

			return columListItem;
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onNavBack: function () {

			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RelTabelaPrecoPesq", null, true);
			}

		}

	});

});