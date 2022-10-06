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
	var classe_ris = "";
	return BaseController.extend("arcelor.controller.ClientesCreditoAlterar", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.view.ClientesCreditoTransfResp
		 */

		onInit: function () {

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(999);

			this._wizard = this.getView().byId("TransferenciaCreditoWizard");
			this._oNavContainer = this.getView().byId("wizardContentPage");
			this._oWizardContentPage = this.getView().byId("wizardNavContainer");
			this._clearFields();

		},

		onChangeClasse: function (Evt) {
			if (Evt.getSource().getSelectedItem().getKey() == 'I') {
				this.byId("input-LimiteCredito").setValue(0);
				this.byId("input-LimiteCredito").setEnabled(false)
			} else {
				this.byId("input-LimiteCredito").setEnabled(true)
			}
		},

		onBeforeRendering: function () {
			this.getView().setBusy(true);

			var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divAlterarCredito");
			if (!autorizado) {
				this.getRouter().getTargets().display("Unauthorized");
				return false;
			} else {
				this.getView().setBusy(false);
			}
		},
		onAfterRendering: function () {
			var filters = [];
			var filter = "";

			filter = new sap.ui.model.Filter("SPRAS", sap.ui.model.FilterOperator.EQ, "");
			filters.push(filter);
			filter = new sap.ui.model.Filter("CTLPC", sap.ui.model.FilterOperator.EQ, "");
			filters.push(filter);
			filter = new sap.ui.model.Filter("KKBER", sap.ui.model.FilterOperator.EQ, "");
			filters.push(filter);

			var list = this.getView().byId("idComboBoxClasseRisco");
			var binding = list.getBinding("items");
			binding.oModel.setSizeLimit(10000);

			binding.filter(filters);
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

		handleWizardCancel: function (oEvent) {

			this._fieldsDisableEnable("Cancel");
			this._clearFields();

		},

		handleWizardSubmit: function (oEvent) {

			var thisView = this;

			var codCliente = thisView.byId("show-Cliente").getText();

			if (this.getView().byId("input-LimiteCredito").getValue() === "") {
				MessageBox.error("Favor preencher o Limite de Cr�dito.", {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}

			if (this.getView().byId("input-DtVerificacao").getValue() === "") {
				MessageBox.error("Favor preencher o Data Verifica��o.", {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}

			if (this.getView().byId("show-Cliente").getText() === "") {
				MessageBox.error("Favor preencher o Cliente.", {
					styleClass: "sapUiSizeCompact"
				});
				return;
			}
			if (this.getView().byId("idComboBoxClasseRisco").getValue().split("-")[0].substr(0, 1) == 'I') {
				if (classe_ris.split("-")[0].substr(0, 1) == "M") {
					MessageBox.error("N�o � permitido mudar classe de risco de M para I.", {
						styleClass: "sapUiSizeCompact"
					});
					this.getView().byId("idComboBoxClasseRisco").setValue(classe_ris);
					return;
				}
			}

			var sLimite = this.utilFormatterNumberUS(thisView.byId("input-LimiteCredito").getValue());

			var sLimiteSplit = sLimite.toString().split(".");

			if (sLimiteSplit.length > 1) {
				if (sLimiteSplit[1] !== "") {
					sLimite = sLimite + "0";
				} else {
					sLimite = sLimite + ".000";
				}
			} else {
				sLimite = sLimite + ".000";
			}

			var sDataSeguiSplit = thisView.byId("input-DtVerificacao").getValue().split("/");

			var sDataSegui = sDataSeguiSplit[2] + "-" + sDataSeguiSplit[1] + "-" + sDataSeguiSplit[0];

			if (sDataSegui !== "") {
				sDataSegui = new Date(sDataSegui);
			} else {
				sDataSegui = null;
			}

			var texto1 = thisView.byId("showText1").getValue();

			var bloq = '';
			if (this.byId("Bloqueio").getSelected()) {
				bloq = 'X';
			}
			var oData = {
				"Cliente": codCliente,
				"Limite": sLimite,
				"DataSegui": sDataSegui,
				"LimiteTotal": "00.000",
				"LimiteIndividual": "00.000",
				"GrupoRespCredito": "XXX",
				"Cl_risco": thisView.byId("idComboBoxClasseRisco").getValue().split('-')[0],
				"Bloqueio": "",
				"Vlr_antecip": "",
				"text1": texto1,
				"text2": "",
				"text3": "",
				"text4": "",
				"text5": "",
				"text6": "",
				"obloq": bloq
			};

			var oModel = this.getView().getModel();

			oModel.update("/TransferenciaCreditoClienteSet(Cliente='" + codCliente + "')", oData, {

				success: function (success, response, odata) {

					thisView.getView().setBusy(false);
					var hdrMessage = response.headers["sap-message"];
					var hdrMessageObject = JSON.parse(hdrMessage);

					var sMsg = hdrMessageObject.message.split("-");

					if (sMsg[0] === "S") {
						thisView._clearFields();
						thisView.handleWizardCancel();
						MessageBox.success(sMsg[1], {
							styleClass: "sapUiSizeCompact"
						});
					} else {
						MessageBox.error(sMsg[1], {
							styleClass: "sapUiSizeCompact"
						});
					}

				},

				error: function (oError, response) {

					thisView.getView().setBusy(false);

					MessageBox.error(oError.responseText, {
						styleClass: "sapUiSizeCompact"
					});

				}
			});

			oModel.submitChanges();

			thisView.getView().setBusy(true);

		},

		checkFindClientStep: function () {

			var sQuery = "";

			var oView = this.getView();
			var oData = this.getView().getModel();

			var thisView = this;

			sQuery = this.getView().byId("show-Cliente").getText();

			//Carregar Grupo Atual
			var onError = function (odata, response) {

				oView.setBusy(false);
				thisView.byId("button-save").setVisible(false);
				thisView.byId("button-cancel").setVisible(false);
				thisView._clearFields();

			};

			var onSuccess = function (success, odata, response) {

				oView.setBusy(false);

				var hdrMessage = odata.headers["sap-message"];
				var hdrMessageObject = JSON.parse(hdrMessage);

				if (hdrMessageObject.severity === "error") {
					MessageBox.error(hdrMessageObject.message, {
						styleClass: "sapUiSizeCompact"
					});
					thisView.byId("button-save").setVisible(false);
					thisView.byId("button-cancel").setVisible(false);
					thisView._clearFields();
					thisView._fieldsDisableEnable("Cancel");
					return;
				}
				
				var sDataLimiteTotal = odata.data.LimiteTotal.split(".");
				var sDataLimiteIndividual = odata.data.LimiteIndividual.split(".");
				var sDataLimiteCredito = odata.data.Limite.split(".");

				var sLimiteTotal = sDataLimiteTotal[0] + "," + sDataLimiteTotal[1].substring(0, 2);
				var sLimiteIndividual = sDataLimiteIndividual[0] + "," + sDataLimiteIndividual[1].substring(0, 2);
				var sLimiteCredito = sDataLimiteCredito[0] + "," + sDataLimiteCredito[1].substring(0, 2);

				sLimiteTotal = thisView.uitlFormatterFieldMoeda(sLimiteTotal);
				sLimiteIndividual = thisView.uitlFormatterFieldMoeda(sLimiteIndividual);
				sLimiteCredito = thisView.uitlFormatterFieldMoeda(sLimiteCredito);

				var sDategui = ""
				if (odata.data.DataSegui) {
					odata.data.DataSegui.setDate(odata.data.DataSegui.getDate() + 1)
					var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd/MM/yyyy"
					});

					sDategui = oDateFormat.format(odata.data.DataSegui);
				}

				thisView.byId("show-Gruporesponsavel").setText(odata.data.GrpCredCli);
				thisView.byId("show-LimiteTotal").setText(sLimiteTotal);
				thisView.byId("show-LimiteIndividual").setText(sLimiteIndividual);
				thisView.byId("show-Gruporesponsavel").setText(odata.data.GrupoRespCredito);
				thisView.byId("input-LimiteCredito").setValue(sLimiteCredito);
				thisView.byId("input-DtVerificacao").setValue(sDategui);

				var classe_risco = odata.data.Cl_risco + " - " + odata.data.cla_desc;
				classe_ris = classe_risco;
				thisView.byId("idComboBoxClasseRisco").setValue(classe_risco)
				var ind = odata.data.text1.split('<br>');
				var texto_aux="";
				for(var j=0;j<ind.length;j++){
				if(ind[j]!=""){
					  texto_aux = texto_aux + ind[j].replace('<br/>','\n') +'\n' 
					

				}

				}
								thisView.byId("showText2").setValue(texto_aux +'\n'+ odata.data.text2);

				if (odata.data.obloq == "X") {
					thisView.byId("Bloqueio").setSelected(true);
				} else {
					thisView.byId("Bloqueio").setSelected(false);
				}

			};

			oView.setBusy(true);
			var sPath = "/TransferenciaCreditoClienteSet(Cliente='" + sQuery + "')";
			oData.read(sPath, {
				success: onSuccess,
				error: onError
			});
		},
		_fieldsDisableEnable: function (action) {

			var thisView = this;

			if (action === "Edit") {
				thisView.byId("input-LimiteCredito").setEnabled(true);
				thisView.byId("input-DtVerificacao").setEnabled(true);
				this.getView().byId("showText1").setEnabled(true);
				thisView.byId("input-ClasseRisco").setEnabled(true);
				this.getView().byId("button-save").setVisible(true);
				this.getView().byId("button-cancel").setVisible(true);
			} else {
				thisView.byId("input-LimiteCredito").setEnabled(false);
				thisView.byId("input-DtVerificacao").setEnabled(false);
				this.getView().byId("showText1").setEnabled(false);
				thisView.byId("input-ClasseRisco").setEnabled(false);
				this.getView().byId("button-save").setVisible(false);
				this.getView().byId("button-cancel").setVisible(false);
			}
		},

		_clearFields: function () {

			var thisView = this;

			thisView.byId("show-Cliente").setText("");
			thisView.byId("show-Nome").setText("");
			thisView.byId("show-LimiteTotal").setText("");
			thisView.byId("show-LimiteIndividual").setText("");
			thisView.byId("input-LimiteCredito").setValue();
			thisView.byId("show-Gruporesponsavel").setText("");
			thisView.byId("input-DtVerificacao").setValue("");
			thisView.byId("input-ClasseRisco").setValue("");
			thisView.byId("idComboBoxClasseRisco").setValue("");
			thisView.byId("show-GrupoAtual").setValue("");
			this.getView().byId("showText1").setValue("");
			this.getView().byId("showText2").setValue("");
			this.getView().byId("Bloqueio").setSelected(false);
		},

		onNavBack: function (oEvent) {
			this._clearFields();
			this._fieldsDisableEnable("Cancel");
			this.getOwnerComponent().getRouter().navTo("clientes");
		},

		onMaskNumberValue: function (oEvent) {

			var thisView = this;

			thisView.byId("input-LimiteCredito").setValue(thisView.uitlFormatterFieldMoeda2(oEvent.getParameter("value")));

		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		}

	});

});