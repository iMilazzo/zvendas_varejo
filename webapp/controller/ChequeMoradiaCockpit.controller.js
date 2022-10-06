sap.ui.define([
	"arcelor/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("arcelor.controller.ChequeMoradiaCockpit", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.Venda
		 */
		onInit: function() {

		},
		
		navigateICMSReport: function(){
			this.getRouter().navTo("saldoicms");
		},
		
		navigateCheckLaunch: function(){
			this.getRouter().navTo("lctocheque");
		},
		
		navigateBillingRelease: function(){
			this.getRouter().navTo("liberacaobloqueio");
		},
		
		navigateCheckRelease: function(){
			this.getRouter().navTo("chequemoradiabaixa");	
		},
		
		navigateCheckReport: function(){
			this.getRouter().navTo("chequemoradiarelatorio");
		}
	});

});