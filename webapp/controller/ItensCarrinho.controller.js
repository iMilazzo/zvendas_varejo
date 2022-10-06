sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"arcelor/model/formatter",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Device, MessageToast, MessageBox, formatter, JSONModel) {
	"use strict";

	var sCartModelName = "cartProducts";
	var sCartEntries = "cartEntries";
	return BaseController.extend("arcelor.controller.ItensCarrinho", {

		formatter: formatter,

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();
		},
		
		_loadMaterialData: function (sQuery, sMaterial, unidade, centro) {

			return new Promise(function (fnResolve, fnReject) {
				var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + sMaterial + "',Unidade='" + unidade +
					"',Quantidade='" + 1 + "',Centro='" + centro + "')";

				this.getModel().read(sPath, {

					success: function (oData) {
						fnResolve(oData);
					},
					error: function (oError) {
						fnReject(oError);
					}
				});
			}.bind(this));
		},

		onResetCart: function () {
			var oCartModel = this.getView().getModel(sCartModelName);

			oCartModel.setProperty("/cartEntries", {});
			oCartModel.setProperty("/totalPrice", "0");

		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("produtos");
		},

		onSaveCart: function () {

			var that = this;

			var box = new sap.m.VBox({
				items: [
					new sap.m.Text({
						text: 'Deseja fechar o pedido?'
					}),
					new sap.m.HBox({
						items: [
							new sap.m.FormattedText({
								htmlText: '<strong><u>Observação: </u></strong>'
							}),
							new sap.m.Text({
								text: ' o carrinho só será eliminado após salvar a ordem de venda.'
							})
						]
					})
				]
			});
			box.setModel(new sap.ui.model.json.JSONModel({
				message: ''
			}));
			sap.m.MessageBox.show(
				box, {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "ArcelorMittal",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							var oCartModel = that.getModel("cartProducts");
							var aSalesItems = [];

							// Modelo de Tela
							if (!this.getModel("SalesModel")) {
								this.setModel(new JSONModel({
									ComboTipoOperacao: [],
									ComboEscritorio: [],
									ComboCondPagamento: []
								}), "SalesModel");
							}

							for (var sProperty in oCartModel.getData().cartEntries) {
								var oEntry = oCartModel.getData().cartEntries[sProperty];
								aSalesItems.push({
									Item: (aSalesItems.length * 10) + 10,
									Centro: oEntry.Centro,
									DescPercentual: oEntry.DescPercentual,
									DescPercentualState: "None",
									DescPercentualText: oEntry.DescPercentualText,
									Descricao: oEntry.Descricao,
									Unidade: oEntry.Unidade,
									Estque: oEntry.Estque.replace(".", ","),
									Frete: oEntry.Frete,
									ItemPedCli: oEntry.ItemPedCli,
									Material: oEntry.Material,
									PrecoBase: oEntry.PrecoBase,
									PrecoNegComIPI: oEntry.PrecoNegComIPI,
									PrecoNegSemIPI: oEntry.PrecoNegSemIPI,
									PrecoNegSemIPIState: "None",
									PrecoNegSemIPIStateText: oEntry.PrecoNegSemIPIStateText,
									PrecoTarget: oEntry.PrecoTarget,
									PrecoTbSemIPI: oEntry.PrecoBase,
									ValorTotItem: oEntry.ValorTotItem,
									Qtd: oEntry.Qtd.replace(",", "."),
									QtdBase: oEntry.QtdBase,
									Deleted: false,
									Fisico: oEntry.Fisico,
									UnitHelper: oEntry.UnitHelper,
									PlantHelper: oEntry.PlantHelper,
									FreightHelper: oEntry.FreightHelper,
									Editable: true
								});

							}
							that.getModel("SalesModel").getData().SalesItems = aSalesItems;
							that.getModel("SalesModel").refresh(true);
							that.getOwnerComponent().getRouter().navTo("Vendas", {
								mode: "Create"
							}, true);
						}
					}.bind(this)
				}
			);
		},

		onImprimir: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("CartReport", true);
		},

		onCartEntriesDelete: function (oEvent) {
			this._deleteProduct(sCartEntries, oEvent);
		},

		onCartEntriesUpdate: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			var oProduct = oBindingContext.getObject();
			if (parseFloat(((oProduct.PrecoTbSemIPI * oProduct.Qtd.replace(",", ".")) / oProduct.QtdBase.replace(",", ".")).toFixed(2)) >
				parseFloat((oProduct.PrecoNegSemIPIStateText * oProduct.Estque).toFixed(2))) {
				MessageBox.error("Estoque menor que a quantidade estipulada. ", {
					styleClass: "sapUiSizeCompact"
				});

				oProduct.Qtd = 0;
				oProduct.ValorTotItem = 0;

				var oCartModel = oBindingContext.getModel();
				var oModelData = oCartModel.getData();

				var oListToAddItem = $.extend({}, oModelData[sCartEntries]);

				var sProductId = oProduct.Material + oProduct.Centro;

				if (oListToAddItem[sProductId] === undefined) {
					oListToAddItem[sProductId] = $.extend({}, oProduct);
				}

				oCartModel.setProperty("/" + sCartEntries, oListToAddItem);

				var totalprice = formatter.totalPrice(oListToAddItem);

				oCartModel.setProperty("/totalPrice", totalprice);
				this.getView().byId("totalPriceText").setText("Total: " + totalprice);

			} else {
				this._changeList(sCartEntries, oBindingContext);
			}
		},

		_deleteProduct: function (sCollection, oEvent) {

			var oSelectedItem = oEvent.getSource().getParent();
			var oPath = oSelectedItem.oBindingContexts.cartProducts.sPath;

			var oCartModel = this.getView().getModel(sCartModelName);
			var oCollectionEntries = $.extend({}, oCartModel.getData()[sCollection]);

			var sEntryId = oPath.split("/");
			delete oCollectionEntries[sEntryId[2]];

			oCartModel.setProperty("/" + sCollection, $.extend({}, oCollectionEntries));

			sap.m.MessageToast.show("Produto removido!");

			var totalprice = formatter.totalPrice(oCollectionEntries);

			oCartModel.setProperty("/totalPrice", totalprice);
			this.getView().byId("totalPriceText").setText("Total: " + totalprice);

		},

		_changeList: function (sListToAddItem, oBindingContext) {

			var oCartModel = oBindingContext.getModel();
			var oProduct = oBindingContext.getObject();
			oProduct.Qtd = oProduct.Qtd.replace(",", ".");
			oProduct.QtdBase = oProduct.QtdBase.replace(",", ".");

			oProduct.ValorTotItem = (oProduct.PrecoTbSemIPI * oProduct.Qtd) / oProduct.QtdBase;
			var oModelData = oCartModel.getData();

			var oListToAddItem = $.extend({}, oModelData[sListToAddItem]);
			var sProductId = oProduct.Material + oProduct.Centro;
			oProduct.Qtd = oProduct.Qtd.replace(".", ",");
			oProduct.QtdBase = oProduct.QtdBase.replace(".", ",");

			if (oListToAddItem[sProductId] === undefined) {
				oListToAddItem[sProductId] = $.extend({}, oProduct);
			}

			oCartModel.setProperty("/" + sListToAddItem, oListToAddItem);

			var totalprice = formatter.totalPrice(oListToAddItem);

			oCartModel.setProperty("/totalPrice", totalprice);
			this.getView().byId("totalPriceText").setText("Total: " + totalprice);

		}

	});

});