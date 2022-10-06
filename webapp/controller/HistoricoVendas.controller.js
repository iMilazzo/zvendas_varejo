sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"arcelor/model/formatter",
	"sap/ui/core/routing/History"
], function (Controller, BaseController, JSONModel, formatter, History) {

	"use strict";

	return BaseController.extend("arcelor.controller.HistoricoVendas", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("HistoricoVendas").attachPatternMatched(
				this._onObjectMatched.bind(this),
				this
			);
		},

		_hideElements: function () {
			this.byId("ovsTable").setVisible(false);
			this.byId("btnVoltar").setVisible(false);
			this.byId("btnCopiar").setVisible(false);
			this.byId("boxItens").setVisible(false);
			this.byId("ovSelecionada").setVisible(false);
			this.byId("totalOv").setVisible(false);
		},

		_showElements: function () {
			this.byId("ovsTable").setVisible(true);
			this.byId("btnVoltar").setVisible(true);
			this.byId("btnCopiar").setVisible(true);
			this.byId("boxItens").setVisible(true);
			this.byId("ovSelecionada").setVisible(true);
			this.byId("totalOv").setVisible(true);
		},

		onItemPress: function (oEvent) {
			
			var oService = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZCHSD_VENDASVAREJO_SRV/");
			var oObject = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
			var sOrderId = oObject.Vbeln;
			var totalOv = oEvent.getSource().getSelectedItem().getBindingContext().getObject().Total;
			var oTableItems = this.byId("ovsTable");
			var that = this;
			var tabela = this.byId("ovsTable");

			this.getView().setBusy(true);
			oService.read("/SalesOrderSet('" + sOrderId + "')", {
				urlParameters: {
					"$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
				},
				success: function (data) {
					that._showElements();
					that.byId("ovSelecionada").setText("OV Selecionada: " + sOrderId);
					that.byId("totalOv").setText("Total da OV R$: " + formatter.price(totalOv));

					var oModelOv = new JSONModel();
					oModelOv.setData(data);
					sap.ui.getCore().setModel(oModelOv, "OVModel");

					var oData = {};
					oData.others = data.SalesOrderItemSetNavig.results;
					var oJsonModel = new JSONModel(oData);
					that.getView().setModel(oJsonModel);
					that.getView().setBusy(false);
				},
				error: function (oError) {
					that.getView().setBusy(false);
				}
			});
		},

		_onObjectMatched: function (oEvent) {
			this._hideElements();
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZCHSD_VENDASVAREJO_SRV/");
			let sIdCliente = oEvent.getParameter("arguments").idcliente;
			this.byId("ovs").setModel(null);

			if (typeof sIdCliente != "undefined") {

				let aFilters = [];
				let aFilter = new sap.ui.model.Filter(
					"Kunnr",
					sap.ui.model.FilterOperator.EQ,
					sIdCliente
				);

				aFilters.push(aFilter);

				this.getView().setBusy(true);
				var that = this;

				oModel.read("/SalesOrderUltSet", {
					filters: aFilters,
					success: function (oData) {
						let oModels = new sap.ui.model.json.JSONModel();
						oModels.setData(oData);
						that.byId("ovs").setModel(oModels);
						that.getView().setModel("OVModels", oModels);
						that.getView().setBusy(false);
					},
					error: function (oError) {
						this.getView().setBusy(false);
					}
				});
			} else {
				this.getRouter().getTargets().display("notFound");
			}
		},

		pressCopiarOv: function (oEvent) {

			let sNomeCliente = sap.ui.getCore().getModel("OVModel").getData().Kunnrname;

			this.getOwnerComponent().getRouter().navTo("Vendas", {
				mode: "Copy",
				salesorder: oEvent.getSource().getModel().getData().others[0].Ordem + "&&&" + sNomeCliente.replace('/', '&&&&&')
			}, true);
		},

		pressVoltar: function (oEvent) {

			this.getOwnerComponent().getRouter().navTo("Vendas", {
				mode: "Copy",
			}, true);
		},

		onPressMenuButton: function () {
			let menu = sap.ui.getCore().byId("__component0---app--idAppControl-Master");
			if (menu.hasStyleClass("menuFechado")) {
				menu.setWidth("170px");
				menu.removeStyleClass("menuFechado");
				menu.addStyleClass("menuAberto");
			} else {
				menu.setWidth("0");
				menu.removeStyleClass("menuAberto");
				menu.addStyleClass("menuFechado")
			}
		}
	});
});