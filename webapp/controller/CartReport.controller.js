sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"arcelor/model/formatter"
], function (Controller, BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.CartReport", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("CartReport").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {

			var oCartModel = this.getView().getModel("cartProducts").getData();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oModelUser = sap.ui.getCore().getModel("modelUser");
			var that = this;
			var oData = this.getView().getModel();
			var totalCart = 0;

			var sPath = "/LogInfSet(usuario='user')";
			var onSuccess = function (odata) {
				that.byId("centro").setText(odata.loja);
				that.byId("loja").setText(odata.dist);
			};
			var onError = function (odata, response) {
				//console.log(JSON.parse(response));
			};

			oData.read(sPath, {
				success: onSuccess,
				error: onError
			});

			oJsonModel.setData(oCartModel.cartEntries);

			Object.values(oJsonModel.getData()).forEach(item => {
				totalCart += parseFloat(item.ValorTotItem);
				that.byId("total").setText(formatter.price(totalCart));
			});

			this.byId("vendedor").setText(oModelUser.id + " " + oModelUser.name);
			this.byId("dataorc").setText(new Date(Date.now()).toLocaleString());
		},

		onAfterRendering: function () {

			var that = this;
			var beforePrint = function () {
				//console.log('Rodando before printing...');
			};

			var afterPrint = function () {
				that.onNavBack();
			};

			this.getView().addEventDelegate({
				onAfterShow: function () {
					window.onbeforeprint = beforePrint;
					window.onafterprint = afterPrint;
					window.print();
				}
			});
		},

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("itenscarrinho", {
				Id: 1
			}, true);
		},

		setFreigthText: function (sValue) {
			switch (sValue) {
			case '0':
				return 'CIF';
				break;
			case '1':
				return 'EXW';
				break;
			case '2':
				return 'FOB';
				break;
			case '9':
				return 'ZST';
				break;
			default:
				return '-';
			}
		}
	});
});