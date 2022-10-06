sap.ui.define([
	"arcelor/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("arcelor.controller.Pagamento", {
        
        onNavBack : function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("RevisaoVenda", null, true);
		}

	});

});