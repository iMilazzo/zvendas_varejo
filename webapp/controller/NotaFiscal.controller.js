sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"arcelor/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/Dialog"
], function (BaseController, JSONModel, History, Filter, FilterOperator, Device, formatter, MessageBox, MessageToast,
	Token, MessagePopover, MessagePopoverItem, Dialog) {
	"use strict";

	var _aMotivos = [];
	var _sViewBack;
	var _sVbeln;
	var _sFatura;

	return BaseController.extend("arcelor.controller.NotaFiscal", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("NotaFiscal").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {
			this.onClear();
			this._loadMotivos();

			_sVbeln = sessionStorage.getItem("Vbeln");
			_sViewBack = sessionStorage.getItem("ViewBack");

			sessionStorage.removeItem("Vbeln");
			sessionStorage.removeItem("ViewBack");

			var oArgument = oEvent.getParameter("arguments");

			if (oArgument && oArgument.fatura) {
				_sFatura = oArgument.fatura;

				if (_sFatura > 0) {
					this._findNotaFiscalByFatura(_sFatura);
				}
			}
		},

		onClear: function () {
			this.byId("filterDocnum").setValue("");
			this.byId("filterVbeln").setValue("");
			this.byId("filterNfenum").setValue("");
			this.byId("filterSerie").setValue("");
			this.byId("filterPstdat").setValue("");
			this.byId("pnlNotaFiscal").setVisible(false);
			this.getView().setModel(new JSONModel(), "view");
		},

		onBeforeRendering: function () {
			this.getView().setBusy(true);

			var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divNotaFiscal");
			if (!autorizado) {
				this.getRouter().getTargets().display("Unauthorized");
				return false;
			} else {
				this.getView().setBusy(false);
			}
		},

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();
		},

		onNavBack: function (oEvent) {
			if (_sViewBack === "Vendas") {
				this.getOwnerComponent().getRouter().navTo(_sViewBack, {
					mode: "Change",
					salesorder: _sVbeln
				}, true);
			} else {
				this.getOwnerComponent().getRouter().navTo(_sViewBack, {
					mode: "Change"
				}, true);
			}
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		_findNotaFiscal: function (sDocnum) {
			var onSuccess = function (oResult, oResponse) {
				var oModel = new JSONModel();
				var oData = oResult;

				oData.items = oResult.ToItems.results;
				oModel.setData(oData);

				this.getView().setModel(oModel, "view");
				this.getView().setBusy(false);
				this.byId("pnlNotaFiscal").setVisible(true);
			}.bind(this);

			var onError = function (oError) {
				this.getView().setBusy(false);
			}.bind(this);

			this.getModel().read("/NotaFiscalSet('" + sDocnum + "')", {
				urlParameters: {
					$expand: 'ToItems'
				},
				success: onSuccess,
				error: onError
			});
			this.getView().setBusy(true);
		},

		_findNotaFiscalByFatura: function (sFatura) {
			var onSuccess = function (oResult, oResponse) {
				this._findNotaFiscal(oResult.Docnum);
				this.byId("filterNfenum").setValue(oResult.Nfenum);
			}.bind(this);

			var onError = function (oError) {
				this.getView().setBusy(false);
			}.bind(this);

			this.getModel().read("/NotaFiscalListSet('" + sFatura + "')", {
				success: onSuccess,
				error: onError
			});
			this.getView().setBusy(true);
		},

		onSearch: function (oEvent) {
			var oFilters = this._createFilter();

			if (oFilters.length === 0) {
				MessageBox.error("Informe um dos filtros", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});

				return;
			}

			var onSuccess = function (oResultData, oResponse) {
				var oResult = oResultData.results;
				var oModel = new JSONModel();
				var oData = {};

				oData.notas = oResult;
				oModel.setData(oData);

				this.getView().setModel(oModel, "view");
				this.getView().setBusy(false);

				if (oResultData.results.length === 0) {
					MessageBox.error("Nenhum registro encontrado", {
						title: "ArcelorMittal",
						styleClass: "sapUiSizeCompact"
					});
					return;
				}

				if (oResultData.results.length === 1) {
					var oNota = oResultData.results[0];
					this._findNotaFiscal(oNota.Docnum);
					return;
				}

				// Chama o popup de Notas Fiscais
				if (!this._oDialog) {
					this._oDialog = sap.ui.xmlfragment("arcelor.view.NotaFiscalDialog", this);
					this.getView().addDependent(this._oDialog);
				}

				this._oDialog.open();

			}.bind(this);

			var onError = function (oError) {
				this.getView().setBusy(false);
			}.bind(this);

			this.getModel().read("/NotaFiscalListSet", {
				filters: oFilters,
				success: onSuccess,
				error: onError
			});
			this.getView().setBusy(true);
			this.byId("pnlNotaFiscal").setVisible(false);
		},

		onShowPopupCancelNF: function (oEvent) {
			var sDocnum = this.getModel("view").getProperty("/Docnum");

			if (!sDocnum) {
				MessageBox.error("Informe o número do documento", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
				return;
			}

			// Monta os componentes do Dialog
			var oLabel = new sap.m.Label({
				text: 'Motivo',
				labelFor: 'motivo',
				width: '100%'
			});
			var oComboBox = new sap.m.ComboBox('motivo', {
				showSecondaryValues: true,
				filterSecondaryValues: true,
				width: '100%'
			});

			for (var i = 0; i < _aMotivos.length; i++) {
				var oItem = new sap.ui.core.ListItem(i);
				var motivo = _aMotivos[i];

				oItem.setKey(motivo.Id);
				oItem.setText(motivo.Descricao);
				oItem.setAdditionalText(motivo.Id);

				oComboBox.addItem(oItem);
			}

			// Cria o Dialog
			var dialog = new Dialog({
				title: 'Cancelar Nota Fiscal',
				type: 'Message',
				contentWidth: "30%",
				contentHeight: "20%",
				content: [oLabel, oComboBox],
				beginButton: new sap.m.Button({
					text: 'Confirmar',
					type: 'Default',
					press: function () {
						var sMotivo = sap.ui.getCore().byId("motivo").getSelectedKey();

						if (!sMotivo) {
							MessageBox.error("Motivo é obrigatório", {
								title: "ArcelorMittal",
								styleClass: "sapUiSizeCompact"
							});
							return;
						}

						MessageBox.confirm('Confirma o cancelamento da nota fiscal?', {
							title: 'Confirmar',
							onClose: function (oAction) {
								if (oAction == 'OK') {
									this._cancelNotaFiscal(sDocnum, sMotivo);
									dialog.close();
								}
							}.bind(this),
							initialFocus: 'CANCEL'
						});
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

		_cancelNotaFiscal: function (sDocnum, sMotivo) {
			var oParameters = {
				Docnum: sDocnum,
				Motivo: sMotivo
			};

			this.getModel().callFunction("/CancelarNotaFiscal", {
				method: "GET",
				urlParameters: oParameters,
				success: function (oData) {
					MessageBox.information(oData.Message, {
						title: "ArcelorMittal",
						styleClass: "sapUiSizeCompact"
					});
				},
				error: function (oError) {

					MessageBox.information("Cancelamento impossível, verificar Cheque Moradia", {
						title: "ArcelorMittal",
						styleClass: "sapUiSizeCompact"
					});
				}
			});
		},

		_loadMotivos: function () {
			_aMotivos = [];

			this.getModel().read("/MotivoCancelNFSet", {
				success: function (results, oResponse) {
					if (results.results) {
						results.results.forEach(function (e) {
							_aMotivos.push({
								Id: e.Reason,
								Descricao: e.Reason1
							});
						});
					}
				},
				error: function (oError) {
					this.getView().setBusy(false);
				}.bind(this)
			});
		},

		_createFilter: function () {
			var aFilters = [],
				dDateFrom,
				dDateTo,
				sValue;

			if (this.byId("filterDocnum").getValue()) {
				sValue = this.byId("filterDocnum").getValue();
				aFilters.push(new Filter('Docnum', FilterOperator.EQ, sValue));
			}

			if (this.byId("filterVbeln").getValue()) {
				sValue = this.byId("filterVbeln").getValue();
				aFilters.push(new Filter('Vbeln', FilterOperator.EQ, sValue));
			}

			if (this.byId("filterNfenum").getValue()) {
				sValue = this.byId("filterNfenum").getValue();
				aFilters.push(new Filter('Nfenum', FilterOperator.EQ, sValue));
			}

			if (this.byId("filterSerie").getValue()) {
				sValue = this.byId("filterSerie").getValue();
				aFilters.push(new Filter('Series', FilterOperator.EQ, sValue));
			}

			if (this.getView().byId("filterPstdat").getDateValue()) {
				dDateFrom = this.getView().byId("filterPstdat").getFrom();
				dDateTo = this.getView().byId("filterPstdat").getTo();

				if (dDateFrom) {
					if (dDateTo) {
						aFilters.push(new Filter('Pstdat', FilterOperator.BT, dDateFrom, dDateTo));
					} else {
						aFilters.push(new Filter('Pstdat', FilterOperator.EQ, dDateFrom));
					}
				}
			}

			return aFilters;
		},
		
		onShowDevolver: function () {			
			var sDocnum = this.getModel("view").getProperty("/Docnum");
			var sNfenum = this.getModel("view").getProperty("/Nfenum");
					
			sessionStorage.setItem("Vbeln", _sVbeln);
			sessionStorage.setItem("ViewBack", _sViewBack);
			this.getOwnerComponent().getRouter().navTo("DevolucaoNFPesq", {
				mode: "Change",
				doc: sDocnum,
				nfenum: sNfenum,
				fatura: _sFatura
			}, true);			
		},
		
		formatData: function (value) {
			var dia = value.getDate();
			var mes = value.getMonth();
			var ano = value.getFullYear();

			mes += 1;

			dia = dia.toString().length === 1 ? "0" + dia : dia;
			mes = mes.toString().length === 1 ? "0" + mes : mes;

			return dia + "/" + mes + "/" + ano;
		},

		formatSaida: function (value) {
			return value === "2" ? "Sim" : "Não";
		},

		formatFrete: function (value) {
			return value === true ? "Sim" : "Não";
		},

		formatValor: function (value) {
			if (value) {
				return parseFloat(value).toLocaleString("pt-BR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
			}

			return null;
		},

		formatQtdPeso: function (value) {
			if (value) {
				var aCasas = value.split(",");

				if (aCasas.length == 1) {
					value = value + ",000";
				} else {
					var decimal = aCasas[1];

					if (decimal.length == 1) {
						value = value + "00";
					} else if (decimal.length == 2) {
						value = value + "0";
					}
				}

				return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			}
		},

		formatStatus: function (value) {
			return value === "X" ? "Estornada" : "Ativa";
		},

		formatState: function (value) {
			return value === "X" ? "Error" : "Success";
		},

		formatIcon: function (value) {
			return value === "X" ? "sap-icon://status-negative" : "sap-icon://status-positive";
		},

		onSearchHelper: function (oEvent, oTable) {
			var sValue = oEvent.getParameter("value");

			this._oGlobalFilter = new Filter([
				new Filter("Docnum", FilterOperator.Contains, sValue),
				new Filter("Nftype", FilterOperator.Contains, sValue),
				new Filter("Nfenum", FilterOperator.Contains, sValue),
				new Filter("Series", FilterOperator.Contains, sValue)
				//        new Filter("Pstdat", FilterOperator.Contains, sValue)
			]);

			var oFilter = this._oGlobalFilter;
			sap.ui.getCore().byId("tbNotaFiscal").getBinding("items").filter(oFilter, "Application");
		},

		onConfirmShlp: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");

			if (aContexts && aContexts.length) {
				var oObject = aContexts.map(function (oContext) {
					return oContext.getObject();
				})[0];

				if (oObject.Docnum) {
					this.byId("filterDocnum").setValue(oObject.Docnum);
					this.byId("filterNfenum").setValue(oObject.Nfenum);
					this.byId("filterSerie").setValue(oObject.Series);
					this._findNotaFiscal(oObject.Docnum);
				}
			}
		},

		onPrintNF: function (oEvent) {
			var oModel = this.getView().oModels.view.oData;
			var header =
				"<div style='background-color: #e3f6f5';text-align:'center'>" +
				"<h3 class='itemTitl'>Nota Fiscal</h3>" +
				"</div>";
			var table =
				"<table width='100%' border='0'>" +
				"<tr>" +
				"<td>Num. Documento: </td>" +
				"<td>" + oModel.Nfenum + "</td>" +
				"<td>Série: </td>" +
				"<td>" + oModel.VcSeries + "</td>" +
				"<td>Data: </td>" +
				"<td>" + oModel.Docdat.getMonth() + '/' + "</td>" +
				"</tr>" +
				"</table>";

			var wind = window.open("", "PrintWindow");
			wind.document.write(header + table + '<br>');
		}

	});
});