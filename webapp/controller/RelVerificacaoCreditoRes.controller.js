sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History, formatter, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelVerificacaoCreditoRes", {

		formatter: formatter,

		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			var dataAtual = new Date();
			this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

			this._loadFilterRelVerificacaoCredito(this.getView(), this.oModelSel.getData());

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
				label: this._loadI18n(this.getView(), "vbeln"),
				property: "Vbeln",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "cmngv"),
				property: "Cmngv",
				type: "datetime"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "kunnr"),
				property: "Knkli",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "name1"),
				property: "Name1",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "netwr"),
				property: "Netwr",
				type: "number"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "klprz"),
				property: "Klprz",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "zterm"),
				property: "Zterm",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "ztermtext"),
				property: "ZtermText",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "cstat"),
				property: "Cstat",
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
				this.getOwnerComponent().getRouter().navTo("RelVerificacaoCreditoPesq", null, true);
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