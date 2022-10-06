sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/ui/export/Spreadsheet",
	"sap/m/GroupHeaderListItem"
], function (BaseController, History, formatter, Spreadsheet, GroupHeaderListItem) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelOvsCarteiraRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelOvsCarteiraRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelOvsCarteira(this.getView(), this.oModelSel.getData());
		},

		getGroupHeader: function (oGroup) {

			var tabela = this.getView().byId("tabela_relatorio");
			var filter = tabela.getModel().getData().results.filter((element) => {
				return element.Vbeln == oGroup.key;
			});

			var data = formatter.strToDataBrOneDay(filter[0].Erdat);
			var erzet = formatter._formatarHorario(filter[0].Erzet);
			var total = formatter.price(filter[0].Total);

			var title_ = "" + oGroup.key + "   -   " + filter[0].Zterm + "   -   " + filter[0].Kunnr + "   -   " + filter[0].Name1 + "   -   " +
				filter[0].Ort01 + "   -   " + filter[0].Stras + "   -   " + data + "  -   " + erzet + "   -   " + filter[0].Inco1 + "   -   " +
				filter[0].Credito + "   -  " + filter[0].Rota + "   -   " + filter[0].DescRota;

			return new GroupHeaderListItem({
				title: title_,
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
				property: "Maktg",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "matkl"),
				property: "Matkl",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "zterm"),
				property: "Zterm",
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
				label: this._loadI18n(this.getView(), "ort01"),
				property: "Ort01",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "stras"),
				property: "Stras",
				type: "string"
			});
			aCols.push({
				label: "Data Criação",
				property: "Erdat",
				type: "datetime"
			});
			aCols.push({
				label: "Data Remessa",
				property: "Edatu",
				type: "datetime"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "erzet"),
				property: "Erzet",
				type: "time"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "inco1"),
				property: "Inco1",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "credito"),
				property: "Credito",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "rota"),
				property: "Rota",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "descRota"),
				property: "DescRota",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "v_totitem"),
				property: "VTotitem",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "v_saldo"),
				property: "VSaldo",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "vrkme"),
				property: "Vrkme",
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
				this.getOwnerComponent().getRouter().navTo("RelOvsDevolvidasPesq", null, true);
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