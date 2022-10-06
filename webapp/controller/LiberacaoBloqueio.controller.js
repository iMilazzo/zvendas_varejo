sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("arcelor.controller.LiberacaoBloqueio", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.Venda
		 */
		onInit: function() {
			if (!this.getModel("librBloqueioModel")) {
				this.setModel(new JSONModel({
					billingDocument: ""
				}), "librBloqueioModel");
			}

			// Route Handler 
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
				this._onMasterMatched, this);
		},

		_onMasterMatched: function() {
			this.getModel("librBloqueioModel").setData({
				billingDocument: ""
			});
			this.getModel("librBloqueioModel").refresh(true);
		},

		onNavBase: function() {
			this.getRouter().navTo("financeiro");
		},
		
		onRealeaseBilling: function() {
			var sBillingDocument = this.getModel("librBloqueioModel").getData().billingNumber;

			var oParameters = {};
			oParameters = {
				Id: sBillingDocument
			};

			if (sBillingDocument.length > 0) {
				this.getView().setBusy(true);
				this.getModel().callFunction("/ReleaseFaturamento", {
					method: "GET",
					urlParameters: oParameters,
					success: function(oReturn) {
						this.getView().setBusy(false);
						if (oReturn.Type === "E") {
							MessageBox.error(this._convertMessage(oReturn.Message));
						} else {
							MessageBox.success("Documento liberado com sucesso!", {
								onClose: function() {
									this.onNavBase();
								}.bind(this)
							});
						}
					}.bind(this),
					error: function() {
						this.getView().setBusy(false);

					}.bind(this)
				});
			} else {
				MessageBox.error("Informe o n�mero de documento para realizar esta a��o");
			}
		},
		
		_convertMessage: function(sMessage) {
			var tTextArea = document.createElement('textarea');
			tTextArea.innerHTML = sMessage;
			return tTextArea.value;
		}
	});

});