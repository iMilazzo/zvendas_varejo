sap.ui.define([
	"arcelor/controller/BaseController",
	"arcelor/model/formatter",
	"sap/m/MessageBox",
], function (BaseController, formatter, MessageBox) {
	"use strict";

	var bDadoMestre = false;

	return BaseController.extend("arcelor.controller.NecessidadeEstoq", {

		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.RelCarteiraOvsDetPesq
		 */
		onInit: function () {

			this.getOwnerComponent().getRouter().attachRouteMatched(this._onRouteMatched, this);
		},

		onAfterRendering: function () {

		},

		_onRouteMatched: function (oEvent) {

			if (oEvent.getParameters().name == "NecessidadeEstoq") {

				this.getView().byId("Matnr").setText("");
				this.getView().byId("Maktx").setText("");
				this.getView().byId("Werks").setText("");
				this.getView().byId("Dismm").setText("");
				this.getView().byId("Mtart").setText("");
				this.getView().byId("Meins").setText("");

				this._onLoad();

			}

		},

		_onLoad: function () {

			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");

			this.aAllFilters = [];
			// Material
			if (this.oModelSel.getData().idMaterial !== "") {
				this.oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idMaterial);
				this.aAllFilters.push(this.oFilter);
			}

			var that = this;
			this.getView().setBusy(true);
			var tabela = this.getView().byId("tabela_relatorio");
			var oModelP = new sap.ui.model.json.JSONModel();
			tabela.setBusy(true);

			var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
			var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

			oModel.read("/NecessidadeEstoqueSet", {

				filters: this.aAllFilters,
				success: function (data) {

					var oData = {};
					oData.result = data.results;
					let oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setSizeLimit(1000000);
					tabela.setModel(oModel);
					that.getView().setModel(oModel);
					that.getView().setBusy(false);
					tabela.setBusy(false);

					if (oData.result.length > 0) {
						that.getView().byId("Matnr").setText(oData.result[0].Matnr);
						that.getView().byId("Maktx").setText(oData.result[0].Maktx);
						that.getView().byId("Werks").setText(oData.result[0].Werks);
						that.getView().byId("Dismm").setText(oData.result[0].Dismm);
						that.getView().byId("Mtart").setText(oData.result[0].Mtart);
						that.getView().byId("Meins").setText(oData.result[0].Meins);
					} else {
						MessageBox.information("Não existe dados para essa seleção", {
							title: "ArcelorMittal",
							styleClass: "sapUiSizeCompact",
							onClose: function (oAction) {
								that.getOwnerComponent().getRouter().navTo("produtos");
							}
						});

					}

				},
				error: function (erro) {
					that.getView().setBusy(false);
					tabela.setBusy(false);
				}
			});
		},

		onNavBack: function () {

			this.getOwnerComponent().getRouter().navTo("produtos");
		}

	});

});