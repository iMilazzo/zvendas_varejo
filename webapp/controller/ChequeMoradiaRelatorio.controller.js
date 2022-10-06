sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, MessageBox, Filter, Export, exportCSV, FilterOperator) {
	"use strict";

	return BaseController.extend("arcelor.controller.ChequeMoradiaRelatorio", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.Venda
		 */
		onInit: function () {
			if (!this.getModel("chequeMoradiaRelatorioModel")) {
				this.setModel(new JSONModel({
					periodFrom: "",
					periodTo: ""
				}), "chequeMoradiaRelatorioModel");
			};
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
				this._onMasterMatched, this);

		},

		onNavBase: function () {
			this.getModel("chequeMoradiaRelatorioModel").getData().checkItems = [];
			this.getModel("chequeMoradiaRelatorioModel").refresh(true);

			this.getRouter().navTo("RelChequeMoradiaPesq");
		},
		onAfterRendering: function () {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			var ofilterData = this.getModel("chequeMoradiaRelatorioModel").getData();
			ofilterData.beginDate = this.oModelSel.oData.beginDate;
			ofilterData.endDate = this.oModelSel.oData.endDate;
			ofilterData.salesFrom = this.oModelSel.oData.salesFrom;
			ofilterData.salesTo = this.oModelSel.oData.salesTo;
			ofilterData.checkFrom = this.oModelSel.oData.checkFrom;
			ofilterData.checkTo = this.oModelSel.oData.checkTo;
			ofilterData.cpfCNPJ = this.oModelSel.oData.cpfCNPJ;
			ofilterData.baixaFrom = this.oModelSel.oData.baixaFrom;
			ofilterData.baixaTo = this.oModelSel.oData.baixaTo;
			ofilterData.Status = this.oModelSel.oData.Status;
			this.getModel("chequeMoradiaRelatorioModel").refresh(true);
			this.onSearch()
		},

		formatTime: function (time) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm:ss"
			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
			return timeStr;
		},

		formatPeriod: function (sPeriod) {
			return sPeriod.substring(1, 3) + "/" + sPeriod.substring(3, 7);
		},
		_onMasterMatched: function (oEvent) {
			this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
			var ofilterData = this.getModel("chequeMoradiaRelatorioModel").getData();
			ofilterData.beginDate = this.oModelSel.oData.beginDate;
			ofilterData.endDate = this.oModelSel.oData.endDate;
			ofilterData.salesFrom = this.oModelSel.oData.salesFrom;
			ofilterData.salesTo = this.oModelSel.oData.salesTo;
			ofilterData.checkFrom = this.oModelSel.oData.checkFrom;
			ofilterData.checkTo = this.oModelSel.oData.checkTo;
			ofilterData.cpfCNPJ = this.oModelSel.oData.cpfCNPJ;
			ofilterData.baixaFrom = this.oModelSel.oData.baixaFrom;
			ofilterData.baixaTo = this.oModelSel.oData.baixaTo;
			ofilterData.Status = this.oModelSel.oData.Status;
			this.getModel("chequeMoradiaRelatorioModel").refresh(true);
			this.onSearch()

		},

		onSearch: function () {
			var ofilterData = this.getModel("chequeMoradiaRelatorioModel").getData();

			if (ofilterData.beginDate) {
				var aFilters = [];

				// Per�odo 
				aFilters.push(new Filter("DtLctoCheque", FilterOperator.BT, new Date(ofilterData.beginDate.substring(3, 5) + "/" + ofilterData.beginDate
					.substring(0, 2) + "/" + ofilterData.beginDate.substring(6, 10)), new Date(ofilterData.endDate.substring(3, 5) + '/' +
					ofilterData.endDate.substring(0, 2) + '/' + ofilterData.endDate.substring(6, 10))));

				// Ordem de Venda
				if ((ofilterData.salesFrom && ofilterData.salesFrom.length > 0) ||
					(ofilterData.salesTo && ofilterData.salesTo.length > 0)) {

					if ((ofilterData.salesFrom && ofilterData.salesFrom.length > 0) &&
						(ofilterData.salesTo && ofilterData.salesTo.length > 0)) {
						aFilters.push(new Filter("OrdemVenda", FilterOperator.BT, ofilterData.salesFrom, ofilterData.salesTo));
					} else if (ofilterData.salesFrom && ofilterData.salesFrom.length > 0) {
						aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, ofilterData.salesFrom));
					} else {
						aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, ofilterData.salesTo));
					}
				}

				// Cheque
				if ((ofilterData.checkFrom && ofilterData.checkFrom.length > 0) ||
					(ofilterData.checkTo && ofilterData.checkTo.length > 0)) {

					if ((ofilterData.checkFrom && ofilterData.checkFrom.length > 0) &&
						(ofilterData.checkTo && ofilterData.checkTo.length > 0)) {
						aFilters.push(new Filter("NumCheque", FilterOperator.BT, ofilterData.checkFrom, ofilterData.checkTo));
					} else if (ofilterData.checkFrom && ofilterData.checkFrom.length > 0) {
						aFilters.push(new Filter("NumCheque", FilterOperator.EQ, ofilterData.checkFrom));
					} else {
						aFilters.push(new Filter("NumCheque", FilterOperator.EQ, ofilterData.checkTo));
					}
				}

				// CPF / CNPJ
				if ((ofilterData.cpfCNPJ && ofilterData.cpfCNPJ.length > 0)) {
					aFilters.push(new Filter("CnpjCpf", FilterOperator.EQ, ofilterData.cpfCNPJ));
				}

				// Nro.Baixa
				if ((ofilterData.baixaFrom && ofilterData.baixaFrom.length > 0) ||
					(ofilterData.baixaTo && ofilterData.baixaTo.length > 0)) {

					if ((ofilterData.baixaFrom && ofilterData.baixaFrom.length > 0) &&
						(ofilterData.baixaTo && ofilterData.baixaTo.length > 0)) {
						aFilters.push(new Filter("CodBaixa", FilterOperator.BT, ofilterData.baixaFrom, ofilterData.baixaTo));
					} else if (ofilterData.baixaFrom && ofilterData.baixaFrom.length > 0) {
						aFilters.push(new Filter("CodBaixa", FilterOperator.EQ, ofilterData.baixaFrom));
					} else {
						aFilters.push(new Filter("CodBaixa", FilterOperator.EQ, ofilterData.baixaTo));
					}
				}

				// Status 
				if (ofilterData.Status && ofilterData.Status.length) {
					aFilters.push(new Filter("Status", FilterOperator.EQ, ofilterData.Status));
				}

				// Leitura dos Dados 
				this.getView().setBusy(true);
				this.getModel().read("/ChequeMoradiaSet", {
					filters: aFilters,
					success: function (oData) {
						this.getView().setBusy(false);
						if (oData && oData.results) {
							this.getModel("chequeMoradiaRelatorioModel").getData().checkItems = oData.results;
							this.getModel("chequeMoradiaRelatorioModel").refresh(true);
						}
					}.bind(this)
				});
			}
		},
		onImprimirPress: function (oEvent) {
			var sum = 0;
			var cond = false;
			var that = this;

			window.print();
		},

		ExcelExport: function () {
			var oModel = this.getView().getModel("chequeMoradiaRelatorioModel");
			for (var k = 0; k < oModel.getData().checkItems.length; k++) {
				oModel.getData().checkItems[k].validadeNova = this.formatDate(oModel.getData().checkItems[k].ValidadeChque);
				oModel.getData().checkItems[k].DtLctoChequenova = this.formatDate(oModel.getData().checkItems[k].DtLctoCheque);
				oModel.getData().checkItems[k].DataBaixanova = this.formatDate(oModel.getData().checkItems[k].DataBaixa);
				oModel.getData().checkItems[k].DataDocumentoNova = this.formatDate(oModel.getData().checkItems[k].DataDocumento);
			}
			oModel.refresh(true)
			var oExport = new Export({
				exportType: new exportCSV({
					fileExtension: "xls",
					separatorChar: "\t",
					charset: "utf-8",
					mimeType: "application/vnd.ms-excel"

				}),
				models: oModel,

				rows: {
					path: "/checkItems"
				},
				columns: [{
						name: "Empresa",
						template: {
							content: "{Empresa}"
						}
					}, {
						name: "Filial",
						template: {
							content: "{Filial}"
						}
					}, {
						name: "Centro",
						template: {
							content: "{Centro}"
						}
					}, {
						name: "Nome do Cliente",
						template: {
							content: "{NomeCliente}"
						}
					}, {
						name: "Escritorio de vendas",
						template: {
							content: "{EscritVendas}"
						}
					}, {
						name: "Ordem de Venda",
						template: {
							content: "{OrdemVenda}"
						}
					}, {
						name: "Cheque",
						template: {
							content: "{NumCheque}"
						}
					}, {
						name: "Cpf/Cnpj",
						template: {
							content: "{CnpjCpf}"
						}
					}, {
						name: "Cliente",
						template: {
							content: "{Cliente}"
						}
					}, {
						name: "Validade do Cheque",
						template: {
							content: "{validadeNova}"
						}
					}, {
						name: "Valor do Cheque",
						template: {
							content: "{ValorCheque}"
						}
					}, {
						name: "Dt.Lancamento",
						template: {
							content: "{DtLctoChequenova}"
						}
					}, {
						name: "Usuario",
						template: {
							content: "{CriadorCheque}"
						}
					}, {
						name: "Fatura",
						template: {
							content: "{Faturamento}"
						}
					}, {
						name: "Nro nota fiscal",
						template: {
							content: "{NFeNum}"
						}
					}, {
						name: "Data do documento",
						template: {
							content: "{DataDocumentoNova}"
						}
					}, {
						name: "Status",
						template: {
							content: "{Status}"
						}
					}, {
						name: "Codigo da transaco",
						template: {
							content: "{CodTransacao}"
						}
					}, {
						name: "Numero da baixa",
						template: {
							content: "{CodBaixa}"
						}
					}, {
						name: "Data da baixa",
						template: {
							content: "{DataBaixanova}"
						}
					}, {
						name: "Documento",
						template: {
							content: "{Documento}"
						}
					}

				]
			});
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageToast.show("Generate is not possible beause no model was set");
			}).then(function () {
				oExport.destroy();
			});
		},

		_validateFields: function (oView, oFields) {
			var that = this;
			var bValidationError = false;

			oFields.forEach(function (oInput) {
				bValidationError = that._validateInput(oView.byId(oInput)) || bValidationError;
			});

			if (!bValidationError) {
				sap.ui.getCore().getMessageManager().removeAllMessages();
				return true;
			} else {
				var vText = "Preencher campos obrigatórios";
				var vTitle = "Ocorreu um erro";
				MessageBox.show(
					vText, {
						icon: MessageBox.Icon.ERROR,
						title: vTitle,
						actions: [MessageBox.Action.OK]
					}
				);
				return false;
			}
		},
		onSalesOrder: function (oEvent) {
			var iItem = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var sVbeln = oEvent.getSource().getParent().mAggregations.cells[4].mProperties.title;
			this.getOwnerComponent().getRouter().navTo("ChequeMoradiaBaixa", {

				salesorder: sVbeln
			}, true);
		},
		_validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oValueInput = "";
			if (!oInput) {
				return false;
			}

			switch ("function") {
			case typeof oInput.getDateValue:
				oValueInput = oInput.getDateValue();
				break;
			case typeof oInput.getValue:
				oValueInput = oInput.getValue();
				break;
			case typeof oInput.getSelectedKey:
				oValueInput = oInput.getSelectedKey();
				break;
			case typeof oInput.getSelected:
				oValueInput = oInput.getSelected();
				break;
			default:
				break;
			}

			if (oValueInput === "" || oValueInput === null) {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);
			return bValidationError;
		},

		formatPrice: function (sPrice) {
			return new sap.ui.model.type.Currency({
				showMeasure: false
			}).formatValue([sPrice, "BRL"], "string");
		},

		formatStatus: function (sStatus) {
			switch (sStatus) {
			case "P":
				return "Pendente";
			case "B":
				return "Baixado";
			case "F":
				return "Faturado";
			default:
				return "Pendente";
			}
		},

		formatDate: function (dValue) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});

			if (dValue) {
				return oDateFormat.format(new Date(dValue), true);
			} else {
				return ""
			}
		},

		formatCPFCNPJ: function (sValue) {
			var sValueOut = sValue.replace(/\D/g, "").replace(/^0+/, '');

			if (sValueOut.length <= 14) { //CPF

				sValueOut = sValueOut.replace(/(\d{3})(\d)/, "$1.$2");
				sValueOut = sValueOut.replace(/(\d{3})(\d)/, "$1.$2");
				sValueOut = sValueOut.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

			} else { //CNPJ

				sValueOut = sValueOut.replace(/^(\d{2})(\d)/, "$1.$2");
				sValueOut = sValueOut.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
				sValueOut = sValueOut.replace(/\.(\d{3})(\d)/, ".$1/$2");
				sValueOut = sValueOut.replace(/(\d{4})(\d)/, "$1-$2");

			}

			return sValueOut;
		}
	});

});