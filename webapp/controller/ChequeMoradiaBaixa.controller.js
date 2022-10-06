sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, MessageBox, Filter, FilterOperator) {
	"use strict";
	var ordem = "";
	return BaseController.extend("arcelor.controller.ChequeMoradiaBaixa", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.Venda
		 */
		onInit: function () {
			if (!this.getModel("baixaChequeModel")) {
				this.setModel(new JSONModel({
					salesOrder: "",
					CodTransacao: "",
					CodBaixa: "",
					transDate: new Date(),
					totalVisible: false,
					checkEnabled: false,
					saveEnabled: false,
					orderBalance: "0",
					orderTotal: "0",
					checkItems: []
				}), "baixaChequeModel");
			}

			// Route Handler 
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
				this._onMasterMatched, this);
		},

		_onMasterMatched: function (oEvent) {
			var oParameters = oEvent.getParameters();

			if (oParameters.arguments.salesorder) {
				ordem = oParameters.arguments.salesorder;
				this.getModel("baixaChequeModel").setData({
					salesOrder: oParameters.arguments.salesorder,
					CodTransacao: "",
					CodBaixa: "",
					transDate: new Date(),
					totalVisible: false,
					checkEnabled: false,
					saveEnabled: false,
					orderBalance: "0",
					orderTotal: "0",
					checkItems: []
				});
				this.getModel("baixaChequeModel").refresh(true);
				this.onSalesOrderChange();
			} else {
				this.getModel("baixaChequeModel").setData({
					salesOrder: "",
					CodTransacao: "",
					CodBaixa: "",
					transDate: new Date(),
					totalVisible: false,
					checkEnabled: false,
					saveEnabled: false,
					orderBalance: "0",
					orderTotal: "0",
					checkItems: []
				});
				this.getModel("baixaChequeModel").refresh(true);
			}
		},

		onDeleteCheckItem: function (oEvent) {
			this._deleteItem(oEvent);
		},

		_deleteItem: function (oEvent) {
			var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var iLinetoDel = iIndex + 1;
			var iCounter = 0;
			var oModelData = this.getModel("baixaChequeModel").getData();
			oModelData.checkItems.forEach(function (oItem) {
				if (!oItem.Deleted) {
					iCounter++;
				}
				if (iCounter === iLinetoDel) {
					oItem.Deleted = true;
				}
			});
			this.getModel("baixaChequeModel").refresh(true);
			this._recalcOrderTotal();
			this._recalcOrderBalance();
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

		onSaveCheckData: function () {
			var sGroupId = "1",
				sChangeSetId = "Create";

			var oCheckMetadata = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType.find(
				function (oEntity) {
					return oEntity.name === "BaixaChequeMoradia";
				});

			var oCheckData = this.getModel("baixaChequeModel").getData();
			this.getView().getModel().setDeferredGroups([sGroupId]);
			oCheckData.checkItems.forEach(function (oItem) {
				var oObject = oItem;
				var oPayload = {};

				oCheckMetadata.property.forEach(function (oProperty) {
					if (oObject.hasOwnProperty(oProperty.name) && oObject[oProperty.name]) {
						oPayload[oProperty.name] = oObject[oProperty.name];
					}
				});

				// Dados Adicionais
				oPayload.Marca = "X";

				this.getView().getModel().create("/BaixaChequeMoradiaSet", oPayload, {
					groupId: sGroupId
				}, {
					changeSetId: sChangeSetId
				});
			}.bind(this));

			this.getView().setBusy(true);
			this.getView().getModel().submitChanges({
				groupId: sGroupId,
				changeSetId: sChangeSetId,
				success: function (oData) {
					this.getView().setBusy(false);
					var bErrorFound = false;
					try {
						oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
							if (oResponse.headers["custom-return"]) {
								var oMessageReturn = JSON.parse(oResponse.headers["custom-return"]);
								MessageBox.error(this._convertMessage(oMessageReturn.message));
								bErrorFound = true;
							}
						}.bind(this));
					} catch (ex) {}
					if (!bErrorFound) {
						MessageBox.success("Baixa de Cheque Moradia gravado com sucesso!", {
							onClose: function (oAction) {
								this.onNavBase();
							}.bind(this)
						});
					}
				}.bind(this),
				error: function () {
					MessageBox.error("Erro ao gravar Cheque Moradia");
					this.getView().setBusy(false);
				}.bind(this)
			}, this);
		},

		_convertMessage: function (sMessage) {
			var tTextArea = document.createElement('textarea');
			tTextArea.innerHTML = sMessage;
			return tTextArea.value;
		},

		onAddCheckData: function () {
			if (this._validateFields(this.getView(), ["idTransCode", "idTransNumber", "idTransDate"])) {
				var oCheckData = this.getModel("baixaChequeModel").getData();

				var oCheckItem = oCheckData.checkItems.find(function (oItem) {
					return oItem.CodTransacao.length === 0;
				});

				if (oCheckItem) {
					oCheckItem.CodTransacao = oCheckData.CodTransacao;
					oCheckItem.CodBaixa = oCheckData.CodBaixa;
					oCheckItem.DataBaixa = oCheckData.DataBaixa;
				}

				oCheckData.CodTransacao = "";
				oCheckData.CodBaixa = "";
				oCheckData.DataBaixa = new Date();
				oCheckData.saveEnabled = this._checkSaveEnabled();
				this.getModel("baixaChequeModel").refresh(true);

			}
		},

		onSalesOrderChange: function () {
			var sSalesOrder = this.getModel("baixaChequeModel").getData().salesOrder;
			if (sSalesOrder.length > 0) {
				this._readSalesOrder(sSalesOrder).then(function (oSalesOrderAppt) {
					var oCheckData = this.getModel("baixaChequeModel").getData();
					oCheckData.checkEnabled = true;
					oCheckData.totalVisible = true;
					oCheckData.TotalLiquido = oSalesOrderAppt.TotalLiquido;
					oCheckData.TotalImpostos = oSalesOrderAppt.TotalImpostos;
					oCheckData.checkItems = [];
					this.getModel("baixaChequeModel").refresh(true);

					// Dados do Cheque 
					this._readCheckData(oSalesOrderAppt.Id);
				}.bind(this));
			}
		},

		formatOrderBalance: function (nOrderBalance) {
			return this.formatPrice(nOrderBalance.toString());
		},

		formatOrderTotal: function (nOrderTotal) {
			return this.formatPrice(nOrderTotal.toString());
		},

		_checkSaveEnabled: function () {
			var oCheckData = this.getModel("baixaChequeModel").getData();
			return !oCheckData.checkItems.some(function (oItem) {
				return oItem.CodTransacao.length === 0;
			});
		},

		_recalcOrderTotal: function () {
			var oCheckData = this.getModel("baixaChequeModel").getData();
			var nTotal = 0.00;
			oCheckData.checkItems.forEach(function (oItem) {
				if (!oItem.Deleted) {
					nTotal += parseFloat(oItem.ValorCheque);
				}
			});

			oCheckData.orderTotal = nTotal;
			this.getModel("baixaChequeModel").refresh(true);
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
		},

		_recalcOrderBalance: function () {
			var oCheckData = this.getModel("baixaChequeModel").getData();
			var nTotal = 0.00;
			oCheckData.checkItems.forEach(function (oItem) {
				if (!oItem.Deleted) {
					nTotal += parseFloat(oItem.ValorCheque);
				}
			});

			nTotal = parseFloat(oCheckData.TotalLiquido) - nTotal;
			oCheckData.orderBalance = nTotal;
			this.getModel("baixaChequeModel").refresh(true);
		},

		_readCheckData: function (sSalesOrder) {
			var aFilters = [];

			aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, sSalesOrder));

			this.getView().setBusy(true);
			this.getModel().read("/ChequeMoradiaSet", {
				filters: aFilters,
				success: function (oCheckItems) {
					var oCheckData = this.getModel("baixaChequeModel").getData();
					oCheckItems.results.forEach(function (oItem) {
						var oObject = oItem;
						oObject.Deleted = false;
						oCheckData.checkItems.push(oObject);
					});

					this.getView().setBusy(false);
					this.getModel("baixaChequeModel").refresh(true);
					this._recalcOrderTotal();
					this._recalcOrderBalance();
				}.bind(this)
			});
		},

		_readSalesOrder: function (sSalesOrder) {
			var aFilters = [];

			aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, sSalesOrder));
			return new Promise(function (fnResolve, fnReject) {
				var oParameters = {};
				oParameters = {
					Id: sSalesOrder
				};

				this.getView().setBusy(true);
				this.getModel().callFunction("/GetOrdemVenda", {
					method: "GET",
					urlParameters: oParameters,
					success: function (oSalesOrderAppt) {
						this.getView().setBusy(false);
						fnResolve(oSalesOrderAppt);
					}.bind(this),
					error: function () {
						this.getView().setBusy(false);
						fnReject();
					}.bind(this)
				});
			}.bind(this));
		},

		onNavBase: function () {
			if (ordem == "") {
				this.getRouter().navTo("financeiro");
			} else {
				this.getRouter().navTo("chequemoradiarelatorio");
				ordem = "";
			}
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

		formatDate: function (dValue) {
			if (dValue) {
				jQuery.sap.require("sap.ui.core.format.DateFormat");
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/YYYY"
				});
				return oDateFormat.format(new Date(dValue), true);
			} else {
				return "";
			}
		},

		_validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oValueInput = "";
			if (!oInput) {
				return false;
			}

			switch ("function") {
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

			if (oValueInput === "") {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);
			return bValidationError;
		}
	});

});