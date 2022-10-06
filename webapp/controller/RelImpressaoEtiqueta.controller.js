sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"arcelor/model/formatter",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/Token",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/core/util/Export", "sap/ui/core/util/ExportTypeCSV",
], function (BaseController, JSONModel, FilterOperator, Filter, MessageToast, History, formatter, Dialog, Button, MessageBox,
	Token, MessagePopover, MessagePopoverItem, Export, ExportTypeCSV) {
	"use strict";

	var oModel;
	var sField;

	return BaseController.extend("arcelor.controller.RelImpressaoEtiqueta", {

		formatter: formatter,

		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched,
				this);
		},

		onExit: function () {
			this.destroy();
		},

		_onRouteMatched: function (oEvent) {

			if (!oEvent || oEvent.getParameters().name === "RelImpressaoEtiqueta") {

				var oview = this;
				var oData = this.getView().getModel();
				var sPath = "/LogInfSet(usuario='user')";

				var onSuccess = function (odata) {
					oview.getView().byId("FilterCentro").setValue(odata.loja);
				}

				var onError = function (odata, response) {}

				this.onClear();

				oData.read(sPath, {
					success: onSuccess,
					error: onError
				});

				this.onLoadLista();
				this.onSegmento();

				var oEntry = {};
				let oModelProduct = new sap.ui.model.json.JSONModel();

				oModelProduct.setSizeLimit(1000);
				oModelProduct.setData(oEntry);
				sap.ui.getCore().setModel(oModelProduct, "selection_relatorio");

				let oModelData = new JSONModel();
				this.byId("tabela_relatorio").setModel(oModelData);
				this.byId("tabela_relatorio").setVisible(false);

			} else {
				this.destroy();
				let oModelData = new JSONModel();
				this.byId("tabela_relatorio").setModel(oModelData);
				this.byId("tabela_relatorio").setVisible(false);
				this.byId("tabela_relatorio").destroyItems()
			}
		},

		onSearch: function (OEvent) {
			this._loadDados(true);
		},

		onChangeQtd: function (oEvent) {
			this.getView().setBusy(true);
			var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.getObject();
			var sPath = "/CalculaEtiqueSet(Item='',Material='" + oObj.Matnr + "',Unidade='" + oEvent.mParameters.value +
				"',Quantidade='" + 1 + "',Centro='" + oObj.Werks + "',UnidadeOld='" + oObj.MeinsOrig + "')";
			var thisView = this;
			var onError = function (odata, response) {
				thisView.getView().setBusy(false);
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(odata.responseText, {
					styleClass: "sapUiSizeCompact"
				});
			};
			var meins = oEvent.mParameters.value;
			var onSuccess = function (odata) {
				thisView.getView().setBusy(false);
				oObj.Meins = meins;
				oObj.MeinsOrig = meins;
				oObj.Preco = parseFloat(odata.PrecoBase);
				thisView.byId("tabela_relatorio").getModel().refresh(true);
			};
			if (oObj.MeinsOrig == oEvent.mParameters.value) {
				oObj.Preco = oObj.OrigPrec;
				oObj.Meins = oObj.MeinsOrig;
				thisView.getView().setBusy(false);
				thisView.byId("tabela_relatorio").getModel().refresh(true);

			} else {
				this.getView().getModel().read(sPath, {
					success: onSuccess.bind(this),
					error: onError.bind(this)
				});
				var oView = this;
			}
		},

		onClear: function (oEvent) {

			this.getView().byId("filterProduto").setSelected(false);
			this.getView().byId("search1").setValue("");
			this.getView().byId("search2").setValue("");
			this.getView().byId("filterSegmento").setSelectedKey(null);
			this.getView().byId("filterLista").setSelectedKey(null);

			var oEntry = {};
			let oModelProduct = new sap.ui.model.json.JSONModel();
			oModelProduct.setSizeLimit(1000);
			oModelProduct.setData(oEntry);
			sap.ui.getCore().setModel(oModelProduct, "selection_relatorio");
		},

		_loadDados: function (sVisible) {

			let oModel = this.getModel();
			var aFilters = [];
			var that = this;
			var oModelProduct = sap.ui.getCore().getModel("selection_relatorio");
			that.getView().setBusy(true);

			var check = "";
			if (this.getView().byId("filterProduto").getSelected()) {
				check = "X";
			}

			var materialDe = this.getView().byId("search1").getValue();
			var materialAte = this.getView().byId("search2").getValue();
			var segmento = this.getView().byId("filterSegmento").getSelectedKey();
			var lista = this.getView().byId("filterLista").getSelectedKey();
			var prod = check;

			if (oModelProduct.getData().item == undefined && materialDe.length == 0 && segmento.length == 0 && lista.length == 0) {
				MessageToast.show('Preencher pelo menos um campo de busca');
				that.getView().setBusy(false);
				return;
			}

			if (materialDe.length > 0 && materialAte.length > 0) {
				aFilters.push(this._createFilterBT("Matnr", materialDe, materialAte));

			} else if (materialDe.length > 0) {
				aFilters.push(this._createFilterEQ("Matnr", materialDe));
			}

			if (segmento.length > 0) {
				aFilters.push(this._createFilterEQ("Codgrpmacromerc", segmento));
			}

			if (lista.length > 0) {
				aFilters.push(this._createFilterEQ("Lista", lista));
			}

			// Passando o valor X para não precisar filtrar
			aFilters.push(this._createFilterEQ("Werks", "X"));

			if (prod.length > 0) {
				aFilters.push(this._createFilterEQ("ProdutoEstoq", prod));
			}

			if (oModelProduct.getData().item !== undefined) {

				oModelProduct.getData().item.forEach(function (e) {
					aFilters.push(that._createFilterEQ("Matnr", e.Matnr));
				});
			}
			var oView = -this;
			var UnitHelper = [];
			oModel.read("/RelImpressaoEtiquetaSet", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results.length === 0) {
						let oModelData = new JSONModel();
						oModelData.setSizeLimit(10000);
						oModelData.setData(oData);

						oModelData.setData(oData);
						that.byId("tabela_relatorio").setModel(oModelData);
						that.byId("tabela_relatorio").setVisible(false);
						that.getView().setBusy(false);
						MessageToast.show('Sem resultados para a busca selecionada');
					} else {

						let oModelData = new JSONModel();
						oModelData.setSizeLimit(10000);
						oModelData.setData(oData);

						that.byId("tabela_relatorio").setModel(oModelData);
						that.byId("tabela_relatorio").getModel().getData().results.forEach(function (prod) {
							that._loadMaterialData("UN", prod.Matnr).then(function (oDataHelper) {
								var UnitHelper = [];
								var unittest = false;
								oDataHelper.results.forEach(function (oResult) {

									if (oResult.Coddadomestre == 'KG') {
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
										Coddadomestre: 'KG',
										Textodadomestre: 'KG'
									});
								}
								prod.OrigPrec = prod.Preco;
								prod.MeinsOrig = prod.Meins;

								if (!that.getView().byId("filterLista").getSelectedKey()) {
									prod.Preco = prod.Preco / 1000;
									prod.OrigPrec = prod.Preco;
									prod.MeinsOrig = 'KG';
									prod.Meins = 'KG';
								}
								prod.UnitHelper = UnitHelper;
								that.byId("tabela_relatorio").getModel().refresh(true);
							})
							prod.UnitHelper = UnitHelper;
							that.byId("tabela_relatorio").getModel().refresh(true);
						})
						that.byId("tabela_relatorio").setVisible(sVisible);
						that._bindTableExcel(aFilters);

					}

					that.getView().setBusy(false);

				},
				error: function (oError) {
					that.getView().setBusy(false);
				}
			});
		},

		_createFilterEQ(sFieldName, sValue) {
			return new Filter(sFieldName, FilterOperator.EQ, sValue);
		},

		_createFilterBT(sFieldName, sValueDe, sValueAte) {
			return new Filter(sFieldName, FilterOperator.BT, sValueDe, sValueAte);
		},

		onNavBack: function () {
			this.getOwnerComponent().getRouter().navTo("relatorios");
		},

		_bindTableExcel: function (aAllFilters) {
			let oTab = this.byId("tabRelatorio");
			let oTabBinding = oTab.getBinding("rows");
			var that = this;

			oTabBinding.oModel.setSizeLimit(1000000);
			oTabBinding.filter(aAllFilters);
		},

		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: "Material",
				property: "Matnr",
				type: "string"
			});
			aCols.push({
				label: "Descrição do Material",
				property: "Maktx",
				type: "string"
			});
			aCols.push({
				label: "UM",
				property: "Meins",
				type: "string"
			});

			aCols.push({
				label: "Preço",
				property: "Preco",
				type: "number"
			});

			return aCols;
		},

		exportSpreadsheet: function () {
			var oTab = this.getView().byId("tabela_relatorio");
			var oBinding = oTab.getBinding("items");
			var oModel = oTab.getModel();
			var oData = oModel.getData();
			if (oModel.getData().results != undefined) {
				if (oModel.getData().results.length > 0) {
					for (var i = 0; i < oModel.getData().results.length; i++) {
						if (oModel.getData().results[i].Preco.toString().indexOf(",") == -1) {

							if (typeof oModel.getData().results[i].Preco != "string") {
								oModel.getData().results[i].Preco = oModel.getData().results[i].Preco.toFixed(2).toString().replace(".", ",");
							} else {
								oModel.getData().results[i].Preco = oModel.getData().results[i].Preco.toString().replace(".", ",");

							}
						}
					}
					var oExport = new sap.ui.core.util.Export({
						exportType: new ExportTypeCSV({
							separatorChar: ";"
						}),
						models: oModel,
						rows: {
							path: "/results"
						},
						columns: [{
								name: "Material",
								template: {
									content: "{Matnr}"
								}
							}, {
								name: "Descrição do material",
								template: {
									content: "{Maktx}"
								}
							}, {
								name: "Preço",
								template: {
									content: "{Preco}"
								}
							}, {
								name: "Unidade",
								template: {
									content: "{Meins}"
								}
							}

						]
					});

					this.onExcel(oExport);

				} else {
					MessageToast.show('Lista Vazia: impossível gerar Excel');
				}
			} else {
				MessageToast.show('Lista Vazia: impossível gerar Excel');
			}

		},
		onExcel: sap.m.Table.prototype.exportData || function (oExport) {
			var vText = this.getResourceBundle().getText("errorPressExcel");
			oExport.saveFile().catch(function (oError) {}).then(function () {
				oExport.destroy();
			});
		},

		onSearchMaterial: function (oEvent) {
			
			if (this._oDialog) {
				this._oDialog.destroy();
			}

			sField = oEvent.getSource().sId.substr(oEvent.getSource().sId.length - 7, 11);

			var sQuery = oEvent.getSource().getValue();
			var aFilters = [];
			
			if (sQuery.length > 0) {
				if ($.isNumeric(sQuery)) {
					aFilters.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.EQ, sQuery));
				} else {
					aFilters.push(new sap.ui.model.Filter("Texto", sap.ui.model.FilterOperator.EQ, sQuery));
				}
				aFilters.push(new sap.ui.model.Filter("Setorativ", sap.ui.model.FilterOperator.EQ, sQuery));
			}
			
			var oview = this;
			this._oDialog = sap.ui.xmlfragment("arcelor.view.ProdutosConsultaFrag", this);
			this._oDialog.setModel(this.getView().getModel());
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.getBinding("items").filter(
				aFilters
			);
			
			this._oDialog.open();
		},

		handleSearchMaterial: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getParameter("value");
			if (sQuery.length > 0) {
				if ($.isNumeric(sQuery)) {
					aFilters.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.EQ, sQuery));
				} else {
					aFilters.push(new sap.ui.model.Filter("Texto", sap.ui.model.FilterOperator.EQ, sQuery));
				}
				aFilters.push(new sap.ui.model.Filter("Setorativ", sap.ui.model.FilterOperator.EQ, sQuery));
			}
			oEvent.getSource().getBinding("items").filter(aFilters);
		},

		handleCloseMaterial: function (oEvent) {

			if (oEvent.sId == "confirm") {

				var aContexts = oEvent.getParameter("selectedContexts");
				var frete = "";

				if (aContexts && aContexts.length > 0) {
					var oObject = aContexts[0].getObject();

					if (sField == "search1") {
						this.getView().byId("search1").setValue(this.formatter.setIntFormat(oObject.Codproduto));
					} else if (sField == "search2") {
						this.getView().byId("search2").setValue(this.formatter.setIntFormat(oObject.Codproduto));
					}
				}
			}

			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		toFloat: function (sValue) {

			return sValue.split(" .")[sValue.split(" .").length - 1];;

		},

		onSave: function (sLista) {
			var aSelectedProducts, i, sPath, oProduct;
			var item = [];
			var oEntry1 = {};
			var that = this;
			that.getView().setBusy(true);

			var oTable = this.getView().byId("tabela_relatorio");
			aSelectedProducts = oTable.getSelectedItems();

			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {

					oProduct = aSelectedProducts[i];

					item.push({
						Matnr: oProduct.getBindingContext().getProperty("Matnr"),
						Meins: oProduct.getBindingContext().getProperty("Meins"),
						Werks: oProduct.getBindingContext().getProperty("Werks"),
						Maktx: oProduct.getBindingContext().getProperty("Maktx"),
						Preco: parseFloat(oProduct.getBindingContext().getProperty("Preco")).toFixed(2),
						Estoque: parseFloat(oProduct.getBindingContext().getProperty("Preco")).toFixed(2),
						Codgrpmacromerc: oProduct.getBindingContext().getProperty("Codgrpmacromerc"),
						Lista: sLista.toUpperCase(),
						ProdutoEstoq: ""

					});

				}

				oEntry1.Matnr = oProduct.getBindingContext().getProperty("Matnr");
				oEntry1.Lista = this.getView().byId("filterLista").getValue();
				oEntry1.Werks = oProduct.getBindingContext().getProperty("Werks");
				oEntry1.ListaSaveSet = item;
				this.getModel().create("/SalvaListaSet", oEntry1, {
					success: function (oData) {
						that.getView().setBusy(false);
						that.onLoadLista();
						MessageToast.show('Lista Salva');
					},
					error: function (oError) {
						that.getView().setBusy(false);
						MessageToast.show('Erro ao salvar a lista');
					}
				});

			}
		},

		onImprimir: function (oEvent) {
			//
		},

		onShowPopup: function (oEvent) {

			var that = this;

			if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

				MessageBox.information("Selecionar uma linha", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});

				return;
			}

			var oLabel = new sap.m.Label({
				text: "Nome da Lista:",
				labelFor: 'lista',
				width: '30%'
			});
			var oInput = new sap.m.Input({
				id: 'listaInput',
				width: '50%',
				height: "90%"
			});

			// Cria o Dialog
			var dialog = new Dialog({
				title: 'Lista',
				type: 'Message',
				contentWidth: "30%",
				contentHeight: "20%",
				content: [oLabel, oInput],
				beginButton: new sap.m.Button({
					text: 'Confirmar',
					type: 'Default',
					press: function () {

						var sLista = sap.ui.getCore().byId("listaInput").getValue();
						this.onSave(sLista);
						dialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Cancelar',
					type: "Default",
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
		onDelete: function (oEvent) {

			var that = this;

			var lista = that.getView().byId("filterLista").getValue();

			if (lista.length == 0) {
				MessageBox.information("Selecionar uma lista", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});

				return;
			}

			MessageBox.confirm("Deseja eliminar a lista selecionada?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction == "OK") {
						let oModel = that.getModel();
						var aFilters = [];

						if (lista.length > 0) {
							aFilters.push(that._createFilterEQ("Lista", lista));
						}

						that.getView().setBusy(true);

						oModel.read("/EliminaListaImpressaoSet", {
							filters: aFilters,
							success: function (oData) {
								MessageToast.show('Registro Eliminado');
								that.getView().setBusy(false);
								that.onLoadLista();
							},
							error: function (oError) {
								that.getView().setBusy(false);
							}
						});
					}
				}
			});

		},

		onLoadLista: function (oEvent) {

			let oModel = this.getModel();
			var aFilters = [];
			var that = this;

			oModel.read("/BuscaListaImpressaoSet", {
				filters: aFilters,
				success: function (oData) {
					var oModelLista = new sap.ui.model.json.JSONModel();
					oModelLista.setSizeLimit(1000);
					oModelLista.setData({
						modelLista: oData.results
					});
					var oDataLista = that.getView().byId("filterLista");
					oDataLista.setModel(oModelLista);

				},
				error: function (oError) {
					//console.log(oError);
				}
			});
		},

		onSegmento: function (oEvent) {

			let oModel = this.getModel();
			var aFilters = [];
			var that = this;

			oModel.read("/SegmentoSet", {
				filters: aFilters,
				success: function (oData) {

					var oModelSegmento = new sap.ui.model.json.JSONModel();
					oModelSegmento.setSizeLimit(1000);
					oModelSegmento.setData({
						modelSegmento: oData.results
					});
					var oDataSegmento = that.getView().byId("filterSegmento");
					oDataSegmento.setModel(oModelSegmento);

				},
				error: function (oError) {
					//console.log(oError);
				}
			});
		},

		onShowPopupUpload: function (oEvent) {

			var that = this;

			var fileUploader = new sap.ui.unified.FileUploader({
				id: "fileUploader",
				name: "myFileUpload",
				uploadUrl: "upload/",
				tooltip: "Upload de seu arquivo",
				uploadComplete: "handleUploadComplete",
				width: '100%'
			});

			// Cria o Dialog
			var dialog = new Dialog({
				title: 'Upload',
				type: 'Message',
				contentWidth: "35%",
				contentHeight: "20%",
				content: [fileUploader],
				beginButton: new sap.m.Button({
					text: 'Confirmar',
					type: 'Default',
					press: function () {

						if (sap.ui.getCore().byId("fileUploader").getValue().length > 0) {

							this._preencheMaterial(sap.ui.getCore().byId("fileUploader"));
						}

						dialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: 'Cancelar',
					type: "Default",
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

		_preencheMaterial: function (sFile) {

			var reader = new FileReader();
			var t = this;
			var fU = sFile;
			var domRef = fU.getFocusDomRef();
			var file = domRef.files[0];

			reader.onload = function (e) {
				var strCSV = e.target.result;
				var arrCSV = strCSV.match(/[\w .]+(?=,?)/g);
				var noOfCols = 30000;

				var oEntry = {};
				while (arrCSV.length > 0) {
					var item = [];
					// extract remaining rows one by one
					var row = arrCSV.splice(0, noOfCols)
					for (var i = 0; i < row.length; i++) {

						item.push({
							Matnr: row[i].trim()
						});

					}
					// push row to an array
					oEntry.item = item;
				}

				let oModelProduct = new sap.ui.model.json.JSONModel();
				oModelProduct.setSizeLimit(1000);
				oModelProduct.setData(oEntry);
				sap.ui.getCore().setModel(oModelProduct, "selection_relatorio");
				MessageToast.show('Arquivo Importado');

			};
			reader.readAsBinaryString(file);

		},
		gerarEtiqueta: function (oEvent) {
			var aSelectedContexts = this.getView().byId("tabela_relatorio").getSelectedContexts();
			var dialogo = document.createElement("dialog");
			var html_show = document.createElement("html");
			var header = document.createElement("header");
			header.innerHtml =
				'<style>body {        height: 28cm;        width: 22cm;        /* to centre page on screen*/    margin-top: 1,27cm;    margin-left: 0.4cm;        margin-right: 0.4cm;    }    </style>';
			var body = document.createElement("body");
			var div_html = ''
			if (aSelectedContexts.length > 0) {
				var conta = 0;
				for (var k = 0; k < aSelectedContexts.length; k++) {
					if (conta == 10) {
						conta = 0;
						div_html = div_html +
							'<div style="float: left; width: 10.16cm;  height: 5.08cm;  margin: 10px;  border-style: solid;    border-width: 3px;    border-left-width: 4px; border-right-width: 4px;   border-color: black;';
						div_html = div_html + 'page-break-before:always;page-break-inside: avoid;">';
					} else {
						div_html = div_html +
							'<div style="float: left; width: 10.16cm;  height: 5.08cm;   margin: 10px;  border-style: solid;    border-width: 3px;    border-left-width: 4px; border-right-width: 4px;   border-color: black;">';
					}
					div_html = div_html + '<h3>'
					div_html = div_html + '&nbsp;&nbsp;&nbsp;' + aSelectedContexts[k].getObject().Matnr
					div_html = div_html + '<br>';
					div_html = div_html + '&nbsp;&nbsp;&nbsp;' + aSelectedContexts[k].getObject().Maktx.substring(0, 28);
					div_html = div_html + '<br>';
					div_html = div_html + '&nbsp;&nbsp;&nbsp;R$&nbsp;' + parseFloat(aSelectedContexts[k].getObject().Preco).toFixed(2).toString().replace(
						".", ",");
					div_html = div_html + '<br>';
					div_html = div_html + '&nbsp;&nbsp;&nbsp;' + aSelectedContexts[k].getObject().Meins;

					div_html = div_html + '</h3></div>';
					conta = conta + 1
				}
				body.innerHtml = div_html;
				html_show.appendChild(header)
				html_show.appendChild(body)
				dialogo.appendChild(html_show);
				var myWindow = window.open("", "MsgWindow", "width=793,height=900");
				myWindow.document.write("<html>" + header.innerHtml + "<body>" + div_html + "</body></html>");
				myWindow.print();
				myWindow.close();

				header.innerHtml = "";
				div_html = "";

			} else {
				MessageBox.error("Selecionar pelo menos um produto")
			}

		},

		handleUploadComplete: function (oEvent) {
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}
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