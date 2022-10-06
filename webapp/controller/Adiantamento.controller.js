sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"arcelor/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/Dialog",
	"sap/ui/core/routing/History"
], function (BaseController, JSONModel, Device, Filter, FilterOperator, formatter, MessageBox, MessageToast,
	Token, MessagePopover, MessagePopoverItem, Dialog, History) {
	"use strict";

	return BaseController.extend("arcelor.controller.Adiantamento", {

		onInit: function () {
			this.getRouter().getRoute("Adiantamento").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {
			this.onClear();
		},

		onClear: function () {
			var oObject = {
				Kunnr: "",
				Name1: "",
				Wrbtr: "",
				Budat: "",
				Vbeln: "",
				Sgtxt: ""
			};

			var oModel = new JSONModel(oObject);
			this.getView().setModel(oModel, "view");
		},

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();
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
		},

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("financeiro");
		},

		onConfirm: function (oEvent) {
			var sMessage;
			var oViewModel = this.getViewModel();
			var oAdiantamento = {
				Kunnr: oViewModel.getProperty("/Kunnr"),
				Wrbtr: oViewModel.getProperty("/Wrbtr"),
				Budat: oViewModel.getProperty("/Budat"),
				Vbeln: oViewModel.getProperty("/Vbeln"),
				Sgtxt: oViewModel.getProperty("/Sgtxt")
			};

			if (!oAdiantamento.Kunnr) {
				sMessage = "Informar Cliente";
			}

			if (sMessage) {
				MessageBox.error(sMessage, {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
				return;
			}

			MessageBox.confirm('Confirma solicitação de adiantamento?', {
				title: 'Confirmar',
				onClose: function (oAction) {
					if (oAction == 'OK') {
						oAdiantamento.Budat = this.convertToDate(oAdiantamento.Budat);
						if (oAdiantamento.Budat == null) {
							oAdiantamento.Budat = '01-01-0001';
						}
						this._solicitarAdiantamento(oAdiantamento);
					}
				}.bind(this),
				initialFocus: 'CANCEL'
			});
		},

		_solicitarAdiantamento: function (oAdiantamento) {
			var onSuccess = function (oData) {
				this.getView().setBusy(false);
				this.onClear();
				MessageBox.information(oData.Message, {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
			}.bind(this);

			this.getModel().callFunction("/SolicitarAdiantamento", {
				method: "GET",
				urlParameters: oAdiantamento,
				success: onSuccess
			});

			this.getView().setBusy(true);
		},

		onCustomerValueHelp: function (oEvent) {
			var sInputValue, sSearchFiled;
			sInputValue = oEvent.getSource().getValue();
			if ($.isNumeric(sInputValue) && sInputValue.length === 11) {
				sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
				sSearchFiled = "Cpf";
			}
			if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
				sSearchFiled = "Codcliente";
			} else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
				sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
				sSearchFiled = "Cnpj";
			} else if (!$.isNumeric(sInputValue)) {
				sSearchFiled = "Nome";
			}

			this.inputId = oEvent.getSource().getId();
			if (this._valueHelpDialog) {
				this._valueHelpDialog = null;
			}
			this._valueHelpDialog = sap.ui.xmlfragment(
				"arcelor.view.ClientesPesquisaDialog",
				this
			);
			this.getView().addDependent(this._valueHelpDialog);
			this._valueHelpDialog.getBinding("items").filter(
				[new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue)]
			);

			this._valueHelpDialog.open(sInputValue);
		},

		handleSearchClientes: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getParameter("value");

			if ((sQuery && sQuery.length > 0) && (sQuery.trim().length > 0)) {
				if ($.isNumeric(sQuery) && sQuery.length === 11) {
					aFilters.push(new Filter("Cpf", sap.ui.model.FilterOperator.Contains, sQuery));
				}
				if ($.isNumeric(sQuery) && sQuery.length < 11) {
					aFilters.push(new Filter("Codcliente", sap.ui.model.FilterOperator.Contains, sQuery));
				} else if ($.isNumeric(sQuery) && sQuery.length > 11) {
					aFilters.push(new Filter("Cnpj", sap.ui.model.FilterOperator.Contains, sQuery));
				} else if (!$.isNumeric(sQuery)) {
					aFilters.push(new Filter("Nome", sap.ui.model.FilterOperator.Contains, sQuery));
				}
			}

			oEvent.getSource().getBinding("items").filter(aFilters);
		},

		_handleValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (oSelectedItem) {
				var oViewModel = this.getViewModel();
				oViewModel.setProperty("/Kunnr", oSelectedItem.getDescription());
				oViewModel.setProperty("/Name1", oSelectedItem.getTitle());
			}
		},

		convertToDate: function (sDate) {
			if (!sDate) return null;

			var aPartes = sDate.split("/");

			var sDia = aPartes[0];
			var sMes = aPartes[1];
			var sAno = aPartes[2];

			return new Date(sAno, (sMes - 1), sDia);
		},

		getViewModel: function () {
			return this.getView().getModel("view");
		}
	});
});