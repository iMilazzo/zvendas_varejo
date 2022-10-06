sap.ui.define([

	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter"
], function (BaseController, History, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.RelInfoComercialRes", {

		formatter: formatter,

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf arcelor.vendasvarejo.relatorios.view.RelInfoComercialRes
		 */
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelInfoComercial(this.getView(), this.oModelSel.getData());

			var dataAtual = new Date();
			this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

			var mesAno = dataAtual.toLocaleDateString(dataAtual).substring(3);

			this.getView().byId("__label0").setText("Data de Vigência:" + dataAtual.toLocaleDateString(dataAtual));
			this.getView().byId("__label1").setText("Política Comercial:" + mesAno);

		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: this._loadI18n(this.getView(), "name2"),
				property: "Name",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "kondm"),
				property: "Kondm",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "vtext"),
				property: "Vtext",
				type: "string"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "mark_up"),
				property: "MarkUp",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "desc_max"),
				property: "DescMax",
				type: "number"
			});
			aCols.push({
				label: this._loadI18n(this.getView(), "markup_min"),
				property: "MarkupMin",
				type: "number"
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
				this.getOwnerComponent().getRouter().navTo("RelInfoComercialPesq", null, true);
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