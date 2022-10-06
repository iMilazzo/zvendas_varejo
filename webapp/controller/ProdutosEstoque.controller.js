sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Popover",
	"arcelor/model/cart"
], function (BaseController, JSONModel, History, Filter, FilterOperator, Dialog, HorizontalLayout, VerticalLayout, Text, TextArea,
	Button, MessageToast, MessageBox, Popover, cart) {
	"use strict";

	var aDataItensCarrinho = [];

	return BaseController.extend("arcelor.controller.ProdutosEstoque", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.ProdutosEstoque
		 */
		onInit: function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("produtosestoque").attachMatched(this._onRouterMatched, this);

		},

		onAfterRendering: function () {
			var oModelData = this.getModel("ProductsModelEstoq").getData();
			oModelData.itens = [];
			this.getModel("ProductsModelEstoq").refresh(true);

		},
		onBeforeRendering: function () {
			var oModelData = this.getModel("ProductsModelEstoq").getData();
			oModelData.itens = [];
			this.getModel("ProductsModelEstoq").refresh(true);

		},

		onSearchProd: function (filters) {

			var oData = this.getView().getModel();
			var sPath = "/ProdutosSet";
			var oView = this;
			var oModelData = this.getModel("ProductsModelEstoq").getData();

			this.getView().setBusy(true);
			var onSuccess = function (odata) {
				oView.getView().setBusy(false);

				oModelData.itens = [];
				odata.results.forEach(function (prod) {
					var precoOriginal = prod.Precodezx;
					var estoqueOriginal = prod.Estoque;

					var oProduto = {
						Codproduto: prod.Codproduto,
						Descrprod: prod.Descrprod,
						Loja: prod.Loja,
						Setorativ: prod.Setorativ,
						Descrsetor: prod.Descrsetor,
						Precovista: prod.Precovista,
						Fisico: prod.Fisico.trim(),
						Precodezx: prod.Precodezx,
						Estoque: prod.Estoque,
						Undmedida: prod.Undmedida,
						Descrundmed: prod.Descrundmed,
						Grupomat: prod.Grupomat,
						Descrmat: prod.Descrmat,
						Classprod: prod.Classprod,
						Grupomerc: prod.Grupomerc,
						EstljQuan1: prod.EstljQuan1,
						Estloja1: prod.Estloja1,
						EstljQuan2: prod.EstljQuan2,
						EstljQuan3: prod.EstljQuan3,

						Proprio: prod.Proprio
					};

					oView._loadMaterialData("UN", prod.Codproduto.toString()).then(function (oDataHelper) {
						var UnitHelper = [];
						var unittest = false;

						oDataHelper.results.forEach(function (oResult) {
							if (prod.Undmedida == oResult.Coddadomestre) {
								unittest = true;
							}
							switch (oResult.Codconsulta) {
							case "UN":
								UnitHelper.push({
									Codconsulta: oResult.Codconsulta,
									Coddadomestre: oResult.Coddadomestre,
									Textodadomestre: oResult.Textodadomestre
								});
								break;
							}

						})

						if (!unittest) {
							UnitHelper.push({
								Codconsulta: 'UN',
								Coddadomestre: prod.Undmedida,
								Textodadomestre: prod.Undmedida
							});
						}
						oModelData.itens.push({
							Codproduto: parseFloat(prod.Codproduto),
							Descrprod: prod.Descrprod,
							Precodezx: parseFloat(prod.Precodezx),
							Estoque: parseFloat(prod.Estoque),
							Loja: prod.Loja,
							UnitHelper: UnitHelper,
							Undmedida: prod.Undmedida,
							Grupomerc: prod.Grupomerc,
							Fisico: prod.Fisico.trim(),
							oProduto: oProduto
						});
						oView.getModel("ProductsModelEstoq").refresh(true);

					});

				})

				oView.getModel("ProductsModelEstoq").refresh(true);
			};

			var onError = function (odata) {
				//  
			};

			oData.read(sPath, {
				filters: filters,
				success: onSuccess,
				error: onError
			});

		},

		onChangeQtd: function (oEvent) {
			this.getView().setBusy(true);
			var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.ProductsModelEstoq.getObject();
			var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + oObj.Codproduto + "',Unidade='" + oObj.Undmedida +
				"',Quantidade='" + 1 + "',Centro='" + oObj.Loja + "')";
			var thisView = this;
			var onError = function (odata, response) {
				thisView.getView().setBusy(false);
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(odata.responseText, {
					styleClass: "sapUiSizeCompact"
				});
			};

			var onSuccess = function (odata) {
				thisView.getView().setBusy(false);
				oObj.Precodezx = parseFloat(odata.PrecoBase);
				oObj.oProduto.Undmedida = oObj.Undmedida;
				oObj.oProduto.Precodezx = parseFloat(odata.PrecoBase);
				oObj.oProduto.Estoque = parseFloat(odata.Estoque);
				oObj.oProduto.Fisico = odata.Fisico.trim();
				oObj.Estoque = parseFloat(odata.Estoque);
				oObj.Fisico = odata.Fisico.trim();
				this.getModel("ProductsModelEstoq").refresh(true);
			};
			this.getView().getModel().read(sPath, {
				success: onSuccess.bind(this),
				error: onError.bind(this)
			});
			var oView = this;

		},

		setCartLength: function (oEntries) {
			return (oEntries ? Object.keys(oEntries).length : "0");
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._searchProdutos(sQuery, 'S');
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("ProdutosDetalhe", null, true);
		},

		_searchProdutos: function (sProduct) {
			// Filtros 
			var aFilters = [];

			// Produto
			aFilters.push(new Filter("Codproduto", FilterOperator.EQ, sProduct));

			// Itens Pr�prios
			aFilters.push(new Filter("Proprio", FilterOperator.EQ, false));

			this._carregarDados(aFilters);
		},

		/**
		 *@memberOf arcelor.controller
		 */
		_carregarDados: function (aFilters) {
			this.onSearchProd(aFilters);
		},

		_onRouterMatched: function (oEvent) {
			var oModelData = this.getModel("ProductsModelEstoq").getData();
			oModelData.itens = [];
			this.getModel("ProductsModelEstoq").refresh(true);

			var oArgs;
			oArgs = oEvent.getParameter("arguments");
			this._searchProdutos(oArgs.Id);
		},

		_onBindingChange: function () {
			if (!this.getView.getBindingContext()) {
				this.getRouter().getTargets().display("notFound");
			}
		},

		_loadMaterialData: function (sQuery, sMaterial) {

			return new Promise(function (fnResolve, fnReject) {
				var aFilters = [];
				aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, sQuery));
				aFilters.push(new Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial));

				this.getModel().read("/DM_DadoMestreOVSet", {
					filters: aFilters,
					success: function (oData) {
						fnResolve(oData);
					},
					error: function (oError) {
						fnReject(oError);
					}
				});
			}.bind(this));
		},

		onAddCarrinho: function (oEvent, oProduto) {
			if (typeof oEvent.getSource().getBindingContext() === 'undefined') {
				if (oProduto) {
					var oEntry = oProduto;
				} else if (oEvent.getSource().data("mydata")) {
					var oEntry = oEvent.getSource().data("mydata");
				}
			} else if (oEvent.getSource().data("mydata")) {
				var oEntry = oEvent.getSource().data("mydata");
			} else {
				var oEntry = oEvent.getSource().getBindingContext().getObject();

			}

			var aModelFilter = {
				MaterialData: oEntry,
				MeasureHelper: [],
				PlantHelper: [],
				FreightHelper: []
			};
			if (!this.getView().getModel("CartHelperModel")) {
				this.getView().setModel(new JSONModel(aModelFilter), "CartHelperModel");
			} else {
				this.getView().getModel("CartHelperModel").setData(aModelFilter);
			}

			this.getView().setBusy(true);
			this._loadMaterialData("CU;UN;FR", oEntry.Codproduto).then(function (oData) {
				var oModelFilterData = this.getView().getModel("CartHelperModel").getData();

				function customMaterialFind(sKey) {
					return function (oElement) {
						var oObject = oElement.getObject();
						return oObject.Loja === sKey && parseFloat(oObject.Estoque) > 0;
					};
				}

				var aMaterialContexts = this.byId("List").getBinding("items").getContexts().filter(function (oElement) {
					return oElement.getObject().Codproduto === oModelFilterData.MaterialData.Codproduto;
				});

				var aPlantBaseHelper = [];

				oData.results.forEach(function (oResult) {
					switch (oResult.Codconsulta) {
					case "UN":
						oModelFilterData.MeasureHelper.push({
							Codconsulta: oResult.Codconsulta,
							Coddadomestre: oResult.Coddadomestre,
							Textodadomestre: oResult.Textodadomestre
						});
						break;
					case "FR":
						oModelFilterData.FreightHelper.push({
							Codconsulta: oResult.Codconsulta,
							Coddadomestre: oResult.Coddadomestre,
							Textodadomestre: oResult.Textodadomestre
						});
						break;
					case "CU":
						if (aMaterialContexts.find(customMaterialFind(oResult.Coddadomestre))) {
							aPlantBaseHelper.push({
								Codconsulta: oResult.Codconsulta,
								Coddadomestre: oResult.Coddadomestre,
								Textodadomestre: oResult.Textodadomestre
							});
						}
						break;

					case "CZ":
						aPlantBaseHelper.push({
							Codconsulta: oResult.Codconsulta,
							Coddadomestre: oResult.Coddadomestre,
							Textodadomestre: oResult.Textodadomestre
						});
						break;
					}
				});

				var aHelpChecker = {};
				aPlantBaseHelper.forEach(function (oObject) {
					if (!aHelpChecker[oObject.Coddadomestre]) {
						aHelpChecker[oObject.Coddadomestre] = true;
						oModelFilterData.PlantHelper.push(oObject);
					}
				});

				this.getView().setBusy(false);
				this._openMaterialPopup();

			}.bind(this));
		},

		_checkMaterialPopup: function (iValue) {
			var bQuantityValid = $.isNumeric(iValue.replace(",", ".")) && iValue.replace(",", ".") > 0;
			var bPlantValid = (sap.ui.getCore().getElementById("input-comboCentro").getValue().length > 0);
			var bMeasureValid = (sap.ui.getCore().getElementById("input-comboMedida").getValue().length > 0);
			return bQuantityValid && bPlantValid && bMeasureValid;
		},

		_openMaterialPopup: function () {
			var oEntry = this.getView().getModel("CartHelperModel").getData().MaterialData;

			var dialog = new Dialog({
				title: 'Adicionar ao Carrinho',
				type: 'Message',
				content: [
					new HorizontalLayout({
						content: [
							new VerticalLayout({
								width: '120px',
								content: [
									new Text({
										text: 'Quantidade: '
									})
								]
							}),
							new VerticalLayout({
								content: [
									new sap.m.Input('incluirQtd', {
										width: '100%',
										Text: "Quantidade",
										liveChange: function (oEvent) {
											var value = oEvent.getParameter("value");
											var valueState = isNaN(value.replace(",", ".")) ? "Error" : value <= 0 ? "Error" : "Success";
											oEvent.getSource().setValueState(valueState);

											if (((!$.isNumeric(value.replace(",", ".")) || value <= 0) && value !== "") || value === "") {
												sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(false);
											} else {
												sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(value));
											}
										}.bind(this)
									}),
									new sap.m.ComboBox({
										id: 'input-comboMedida',
										Text: 'Medida',
										width: "100%",
										placeholder: "Medida",
										showSecondaryValues: true,
										value: oEntry.Undmedida,
										change: function () {
											var iQuantity = sap.ui.getCore().getElementById("incluirQtd").getValue();
											sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(iQuantity));

										}.bind(this),
										loadItems: function (oEvent) {
											var oModelComboMedida = new sap.ui.model.json.JSONModel();
											oModelComboMedida.setSizeLimit(5000);
											oModelComboMedida.setData({
												modelDataComboMedida: this.getView().getModel("CartHelperModel").getData().MeasureHelper
											});
											oEvent.getSource().setModel(oModelComboMedida);
										}.bind(this),
										items: {
											path: "/modelDataComboMedida",
											template: new sap.ui.core.ListItem({
												text: "{Coddadomestre}",
												key: "{Codconsulta}",
												additionalText: "{Textodadomestre}"
											})
										}
									}),
									new sap.m.ComboBox({
										id: 'input-comboCentro',
										width: "100%",
										placeholder: "Centro",
										value: oEntry.Loja,
										showSecondaryValues: true,
										change: function () {
											var iQuantity = sap.ui.getCore().getElementById("incluirQtd").getValue();
											sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(iQuantity));

										}.bind(this),
										loadItems: function (oEvent) {
											var oModelComboCentro = new sap.ui.model.json.JSONModel();
											oModelComboCentro.setSizeLimit(5000);
											oModelComboCentro.setData({
												modelDataComboCentro: this.getView().getModel("CartHelperModel").getData().PlantHelper
											});
											oEvent.getSource().setModel(oModelComboCentro);
										}.bind(this),
										items: {
											path: "/modelDataComboCentro",
											template: new sap.ui.core.ListItem({
												text: "{Coddadomestre}",
												key: "{Codconsulta}",
												additionalText: "{Textodadomestre}"
											})
										}
									})

								]
							})
						]
					})
				],
				beginButton: new Button('btnQtdCarrinho', {

					enabled: false,
					text: 'Incluir',
					icon: 'sap-icon://cart',
					press: function (oEvent) {

						var oEntry = this.getView().getModel("CartHelperModel").getData().MaterialData;
						var oCartModel = this.getView().getModel("cartProducts");
						var oCollectionEntries = $.extend({}, oCartModel.getData().cartEntries);

						var centro = sap.ui.getCore().getElementById("input-comboCentro").getValue();
						var medida = sap.ui.getCore().getElementById("input-comboMedida").getValue();

						var sChave = oEntry.Codproduto + centro;
						var oCartEntry = oCollectionEntries[sChave];

						if (oCartEntry !== undefined) {
							MessageBox.error("Produto já incluído no carrinho.", {
								styleClass: "sapUiSizeCompact"
							});
							return;
						}

						var onError = function (odata, response) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(odata.responseText, {
								styleClass: "sapUiSizeCompact"
							});
						};

						var onSuccess = function (odata) {
							sap.ui.core.BusyIndicator.hide();
							aDataItensCarrinho = [];

							aDataItensCarrinho.push({
								Item: "",
								Material: oEntry.Codproduto,
								Descricao: oEntry.Descrprod,
								Estque: oEntry.Estoque,
								QtdBase: sap.ui.getCore().byId("incluirQtd").getValue(),
								Qtd: sap.ui.getCore().byId("incluirQtd").getValue(),
								Unidade: odata.Unidade,
								PrecoBase: odata.PrecoBase,
								PrecoTbSemIPI: odata.Preco,
								PrecoNegComIPI: "",
								Markup: odata.Markup,
								PrecoNegSemIPI: "",
								DescPercentual: "",
								ValorTotItem: odata.Preco,
								Fisico: odata.Fisico.trim().replace(".", ","),
								PrecoTarget: "",
								ValorST: "",
								Centro: sap.ui.getCore().getElementById("input-comboCentro").getValue(),
								Frete: "",
								ItemPedCli: "",
								PrecoNegSemIPIState: sap.ui.core.ValueState.None,
								PrecoNegSemIPIStateText: oEntry.Precodezx,
								DescPercentualState: sap.ui.core.ValueState.None,
								DescPercentualText: "",
								UnitHelper: this.getView().getModel("CartHelperModel").getData().MeasureHelper,
								PlantHelper: this.getView().getModel("CartHelperModel").getData().PlantHelper,
								FreightHelper: this.getView().getModel("CartHelperModel").getData().FreightHelper
							});

							if (parseFloat(oEntry.Estoque) < parseFloat(sap.ui.getCore().byId("incluirQtd").getValue().replace(",", "."))) {
								MessageBox.error("Estoque menor que a quantidade estipulada. ", {
										styleClass: "sapUiSizeCompact"
									}),
									dialog.close();

							} else {
								cart.addToCart(null, aDataItensCarrinho[0], oCartModel);

								MessageBox.success("Um novo item foi adicionado ao seu carrinho de compras. ", {
										styleClass: "sapUiSizeCompact"
									}),
									dialog.close();
							}

						};

						var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + oEntry.Codproduto + "',Unidade='" + medida +
							"',Quantidade='" + sap.ui.getCore().byId("incluirQtd").getValue().replace(",", ".") + "',Centro='" + centro + "')";

						this.getView().getModel().read(sPath, {
							success: onSuccess.bind(this),
							error: onError.bind(this)
						});

						sap.ui.core.BusyIndicator.show();
					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancelar',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onVisualizarCarrinho: function () {
			this.getRouter().navTo("itenscarrinho", {
				Id: 1
			}, true);
		}
	});

});