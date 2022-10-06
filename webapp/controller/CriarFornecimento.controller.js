sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, History, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("arcelor.controller.CriarFornecimento", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("CriarFornecimento").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {
			this.onClear();
		},

		onClear: function () {
			this.byId("input-DtRemessa").setDateValue(null);
		},

		onBeforeRendering: function () {
//			this.getView().setBusy(true);
//
//			var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divNotaFiscal");
//			if (!autorizado) {
//				this.getRouter().getTargets().display("Unauthorized");
//				return false;
//			} else {
//				this.getView().setBusy(false);
//			}
		},

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();
		},

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("logistica", {
				mode: "Change"
			}, true);
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onCreate: function (oEvent) {
			var dDateFrom,
				dDateTo,
				oParameters;
			
			var oDateRemessa = this.getView().byId("input-DtRemessa");
			
			if (oDateRemessa.getDateValue()) {
				oParameters = {
					DataIni: oDateRemessa.getFrom(),
					DataFim: this.ajustHours(oDateRemessa.getTo())					
				};
			}

			if (!oParameters) {
				MessageBox.error("Informe a data de remessa", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});

				return;
			}
			
			MessageBox.confirm('Confirma a geração automática do(s) fornecimento(s)?', {
				title: 'Confirmar',
				onClose: function (oAction) {
					if (oAction === "OK") {
						this.criarFornecimento(oParameters);
					}
				}.bind(this),
				initialFocus: "CANCEL"
			});
		},

		criarFornecimento: function(oParameters) {
			this.getView().setBusy(true);
			
			this.getModel().callFunction("/CriarFornecimento", {
				method: "GET",
				urlParameters: oParameters,
				success: function (oData) {
					this.getView().setBusy(false);
					
					MessageBox.information(oData.Message, {
						title: "ArcelorMittal",
						styleClass: "sapUiSizeCompact"
					});
				}.bind(this),
				error: function (oError) {
					this.getView().setBusy(false);
				}.bind(this)
			});			
		}
	});
});