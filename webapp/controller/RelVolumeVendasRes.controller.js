sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History, formatter, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelVolumeVendasRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelVolumeVendasRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			let dataInicial = this.oModelSel.getData().idPeriodoMesAno.substring(0, 2) + "/" + this.oModelSel.getData().idPeriodoMesAno.slice(-
				4);
			let dataFinal = this.oModelSel.getData().idPeriodoMesAnofim.substring(0, 2) + "/" + this.oModelSel.getData().idPeriodoMesAnofim.slice(-
				4);

			this._loadFilterRelVolumeVendas(this.getView(), this.oModelSel.getData());
		},

		getGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false,
			});
		},

		createColumnConfig: function () {
			var aCols = [];

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
				label: this._loadI18n(this.getView(), "maktx"),
				property: "Maktx",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "bmeng"),
				property: "Bmeng",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "fkimg"),
				property: "Fkimg",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "valfat"),
				property: "Valfat",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "liqfat"),
				property: "Liqfat",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "qtddev"),
				property: "Qtddev",
				type: "number"
			});
			aCols.push({
				label: "Receita Liq Devolv.",
				property: "REKZWI5"
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
				this.getOwnerComponent().getRouter().navTo("RelVolumeVendasPesq", null, true);
			}
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onImprimirPress: function () {
			window.print();
		}

	});

});