sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History, formatter, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelPagAntRes", {

		formatter: formatter,

		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");

			var dataAtual = new Date();
			this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

			this._loadFilterRelPagAnt(this.getView(), this.oModelSel.getData());

		},

		getGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});
		},

		createColumnConfig: function () {

			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "bukrs"),
				property: "Bukrs",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "belnr"),
				property: "Belnr",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vbeln"),
				property: "Vbel2",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "kunnr"),
				property: "Kunnr",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "bldat"),
				property: "Bldat",
				type: "datetime"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "wrbtr"),
				property: "Wrbtr",
				type: "number"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "txtlog"),
				property: "TxtLog",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "txtpgant"),
				property: "TxtPgant",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "datadblq"),
				property: "DataDblq",
				type: "datetime"
			});

			return aCols;
		},

		exportSpreadsheet: function () {
			this._exportSpreadsheet(
				this.byId("tabRelatorio"),
				this.createColumnConfig()
			);
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("RelRelPagAntPesq", null, true);
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