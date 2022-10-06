sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	'jquery.sap.global'

], function (BaseController, JSONModel, Filter, FilterOperator, History, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("arcelor.controller.ClientesCreditoTransfResp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.view.ClientesCreditoAlterar
		 */
		onInit: function () {

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(999);

			this._wizard = this.getView().byId("TransferenciaCreditoWizard");
			this._oNavContainer = this.getView().byId("wizardContentPage");
			this._oWizardContentPage = this.getView().byId("wizardNavContainer");

		},

		onNavBack: function (oEvent) {
			this._clearObjects();
			this._fieldsDisableEnable();
			this.getOwnerComponent().getRouter().navTo("clientes");
		},

		handleSearchClientes: function (oEvent) {
			//create model filter

			var filters = [];
			var query = oEvent.getParameter("value");
			var query2 = query;

			query = this.utilFormatterCPFCNPJClearSearch(query);

			if ((query && query.length > 0) && (query.trim() != '')) {

				var filter;

				if ($.isNumeric(query) && query.length == 11) {
					filter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, query);
				}
				if ($.isNumeric(query) && query.length < 11) {
					filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, query);
				} else if ($.isNumeric(query) && query.length > 11) {
					filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
				} else if (!$.isNumeric(query)) {
					filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
				}
				filters.push(filter);
			}

			var binding = oEvent.getSource().getBinding("items");
			binding.filter(filters);

		},

		handleValueHelp: function (oEvent) {

			var sInputValue, sSearchFiled;

			sInputValue = oEvent.getSource().getValue();

			if ($.isNumeric(sInputValue) && sInputValue.length == 11) {
				sSearchFiled = "Cpf";
			}
			if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
				sSearchFiled = "Codcliente";
			} else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
				sSearchFiled = "Cnpj";
			} else if (!$.isNumeric(sInputValue)) {
				sSearchFiled = "Nome";
			}

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"arcelor.view.ClientesPesquisaDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter(
				[new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue)]
			);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);

		},

		_handleValueHelpSearch: function (evt) {

			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Name",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);

		},

		_handleValueHelpClose: function (evt) {

			var oSelectedItem, fieldInput;

			oSelectedItem = evt.getParameter("selectedItem");

			if (oSelectedItem) {
				fieldInput = this.getView().byId(this.inputId);
				fieldInput.setValue(oSelectedItem.getDescription());

				this.getView().byId("show-Cliente").setText(oSelectedItem.getDescription());
				this.getView().byId("show-Nome").setText(oSelectedItem.getTitle());

				this.checkFindClientStep();
				this._fieldsDisableEnable("Edit");
			}

			evt.getSource().getBinding("items").filter([]);

		},

		handleWizardSubmit: function (oEvent) {

			var thisView = this;
			var codCliente = thisView.byId("show-Cliente").getText();
			var grpNovo = thisView.byId("show-GrupoNovo").getSelectedKey();

			if (grpNovo == "") {
				MessageBox.error("Selecionar Grupo de Respons�vel", {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}

			var oData = {
				"GrpCredCli": "",
				"GrpResp": ""
			};

			var oModel = this.getView().getModel();

			oModel.update("/GrupoResponsaveCreditoSet(Cliente='" + codCliente + "',Gruporespnovo='" + grpNovo + "')", oData, {
				success: function (success, response, odata) {

					thisView.getView().setBusy(false);
					var hdrMessage = response.headers["sap-message"];
					var hdrMessageObject = JSON.parse(hdrMessage);

					MessageBox.success(hdrMessageObject.message, {
						styleClass: "sapUiSizeCompact"
					});
					thisView._clearObjects();
					thisView._fieldsDisableEnable("Cancel");
				},

				error: function (oError, response) {

					thisView.getView().setBusy(false);
					var hdrMessage = $(oError.responseText).find("message").first().text();
					MessageToast.show(hdrMessage);

				}
			});

			oModel.submitChanges();

			thisView.getView().setBusy(true);

		},

		checkFindClientStep: function () {

			var filters = [];
			var filter = "";
			var sQuery = "";

			var oView = this.getView();
			var oData = this.getView().getModel();

			var thisView = this;

			sQuery = this.getView().byId("show-Cliente").getText();

			//Carregar Grupo Atual
			var onError = function (odata, response) {

				oView.setBusy(false);
				var hdrMessageObject = JSON.parse(odata.responseText);

				MessageBox.error(hdrMessageObject.error.message.value, {
					styleClass: "sapUiSizeCompact"
				});

				thisView.byId("button-save").setVisible(false);
				thisView.byId("button-cancel").setVisible(false);

				thisView._fieldsDisableEnable("Cancel");
				thisView.byId("show-Gruporesponsavel").setText("");
				thisView.byId("show-Cliente").setText("");
				thisView.byId("show-Nome").setText("");
				thisView.byId("show-GrupoNovo").setSelectedKey(null);
				thisView.byId("show-GrupoNovo").setValue("");

			};

			var onSuccess = function (odata) {

				oView.setBusy(false);

				thisView.byId("show-Gruporesponsavel").setText(odata.GrpResp);

			};

			oView.setBusy(true);
			var sPath = "/GrupoResponsaveCreditoSet(Cliente='" + sQuery + "',Gruporespnovo='')";
			oData.read(sPath, {
				success: onSuccess,
				error: onError
			});

			//Carregar Grupo Novo

			filter = new sap.ui.model.Filter("Cliente", sap.ui.model.FilterOperator.EQ, sQuery);
			filters.push(filter);

			var list = this.getView().byId("show-GrupoNovo");
			var binding = list.getBinding("items");

			binding.filter(filters);

		},

		onFillTransfer: function (oEvent) {

			var thisView = this;

			thisView.byId("input-Cliente").setText(this.getView().byId("show-Cliente").getText());
			thisView.byId("input-Nome").setText(this.getView().byId("show-Nome").getText());
			thisView.byId("input-Gruporesponsavel").setText(this.getView().byId("show-Gruporesponsavel").getText());
			thisView.byId("input-Grupo").setText(thisView.byId("show-GrupoNovo").getSelectedKey());
			thisView.byId("button-save").setVisible(true);

		},

		_clearObjects: function () {

			var thisView = this;

			thisView.byId("show-GrupoNovo").setValue("");
			thisView.byId("show-GrupoNovo").setSelectedKey(null);
			thisView.byId("show-Gruporesponsavel").setText("");
			thisView.byId("show-Nome").setText("");
			thisView.byId("show-Cliente").setText("");
			thisView.byId("show-GrupoAtual").setValue("");

		},

		handleWizardCancel: function () {
			this._fieldsDisableEnable("Cancel");
			this._clearObjects();
		},

		backToWizardContent: function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},

		completedHandler: function () {
			this._oNavContainer.to(this._oWizardReviewPage);
		},

		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			var that = this;
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						that._wizard.discardProgress(that._wizard.getSteps()[0]);
						that._clearObjects();
						that._navBackToList();

					}
				}
			});
		},

		_navBackToList: function () {
			this._navBackToStep(this.getView().byId("ContentsStep"));
		},

		_navBackToStep: function (step) {
			var that = this;

			function fnAfterNavigate() {
				that._wizard.goToStep(step);
				that._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this._oNavContainer.to(this._oWizardContentPage);
		},

		_fieldsDisableEnable: function (action) {

			var thisView = this;

			if (action === "Edit") {
				thisView.byId("show-GrupoNovo").setEnabled(true);
				this.getView().byId("button-save").setVisible(true);
				this.getView().byId("button-cancel").setVisible(true);
			} else {
				thisView.byId("show-GrupoNovo").setEnabled(false);
				this.getView().byId("button-save").setVisible(false);
				this.getView().byId("button-cancel").setVisible(false);
			}

		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		}

	});

});