sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History"
], function (BaseController, JSONModel, History) {
	"use strict";

	var url = "";

	return BaseController.extend("arcelor.controller.ProdutosDetalhe", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.ProdutosDetalhe
		 */
		onInit: function () {

			if (this._oDialog) {
				this._oDialog.destroy();
			}

			var oRouter = this.getRouter();
			oRouter.getRoute("produtosdetalhe").attachMatched(this._onRouterMatched, this);

		},
		
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf arcelor.view.ProdutosDetalhe
		 */
		onExit: function () {
			this.destroy();
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("produtos");
			try {
				this._oDialog.destroy();
			} catch (ex) {}
		},

		_onRouterMatched: function (oEvent) {

			var oArgs, oView;
			oArgs = oEvent.getParameter("arguments");

			var url;
			if (window.location.hostname === "localhost") {
				url = 'http://mb1abdb0.bms.com.br/SAP/PUBLIC/BC/UI2/ZVENDASVAREJO/IMG/PRODUTOS parseInt(oArgs.Id)/' + +'.jpg';
			} else {
				url = window.location.origin + '/SAP/PUBLIC/BC/UI2/ZVENDASVAREJO/IMG/PRODUTOS/' + parseInt(oArgs.Id) + '.jpg';
			}
			oView = this.getView();
			var image = this.getView().byId("imgProduto");
			var sPath = "/ProdutosSet(Codproduto='" + oArgs.Id +
				"',Grpmercmacro='',Texto='',Loja='',Orgvendas='',Canal='',Setorativ='',Escrvendas='',Eqpvendas='',Grupomerc='',Grupomat='')";

			var that = this;
			this.byId("imgProduto").bindElement({
				path: "/ImagemProdutoSet(Codprod='" + oArgs.Id + "')/$value",
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function (oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function (oEvent) {
						var imgUrl = window.location.origin + this.getModel().sServiceUrl + oEvent.getSource().sPath;
						var imagem = new Image();
						imagem.src = imgUrl;
						oView.byId("imgProduto").setSrc(imagem.src);
						oView.setBusy(false);
					}
				}
			});

			oView.bindElement({
				path: "/ProdutosSet(Codproduto='" + oArgs.Id +
					"',Grpmercmacro='',Texto='',Loja='',Orgvendas='',Canal='',Setorativ='',Escrvendas='',Eqpvendas='',Grupomerc='',Grupomat='')",
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function (oEvent) {
						oView.setBusy(true);
					},
					dataReceived: function (oEvent) {
						oView.setBusy(false);
					}
				}
			});

		},
		_onBindingChange: function (oEvent) {
			//
		},
		
		/**
		 *@memberOf arcelor.controller.ProdutosDetalhe
		 */
		onPress: function (oEvent) {
			this._showObject(oEvent.getSource());
		},

		onPressAplicacao: function (oEvent) {
			var sRef = oEvent.getSource().getBindingContext().getProperty("Urlyoutube1");
			sap.m.URLHelper.redirect("http://" + sRef, true);
		},

		onPressRecomendacao: function (oEvent) {
			var sRef = oEvent.getSource().getBindingContext().getProperty("Urlyoutube2");
			sap.m.URLHelper.redirect("http://" + sRef, true);
		},

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("produtosestoque", {
				Id: oItem.getBindingContext().getProperty("Codproduto")
			});
		}
	});
});