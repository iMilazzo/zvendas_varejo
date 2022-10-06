sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/GroupHeaderListItem"

], function (BaseController, History, formatter, GroupHeaderListItem) {

	"use strict";

	return BaseController.extend("arcelor.controller.RelVolumeFaturamentoRes", {

		formatter: formatter,

		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			this._loadFilterRelVolumeVendasFaturamento(this.getView(), this.oModelSel.getData());
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
				label: this._loadI18n(this.getView(), "werks"),
				property: "Werks",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vkorg"),
				property: "VkorgText",
				type: "string"
			});

			aCols.push({
				label: "Cód Organização de Vendas",
				property: "Vkorg",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vkbur"),
				property: "VkburText",
				type: "string"
			});

			aCols.push({
				label: "Cód. Escritório de Vendas",
				property: "Vkbur",
				type: "string"
			});

			aCols.push({
				label: "Equipe de Vendas",
				property: "Bezei",
				type: "string"
			});

			aCols.push({
				label: "Cód. Equipe Vendas",
				property: "Vkgrp",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vtweg"),
				property: "VtwegText",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "spart"),
				property: "SpartText",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "vtext"),
				property: "Vtext",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "kondm"),
				property: "Kondm",
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
				label: this._loadI18n(this.getView(), "matkl"),
				property: "Matkl",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "wgbez"),
				property: "Wgbez",
				type: "string"
			});

			aCols.push({
				label: this._loadI18n(this.getView(), "fkimg"),
				property: "Fkimg",
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