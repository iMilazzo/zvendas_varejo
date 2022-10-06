sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("arcelor.controller.Logistica", {

    actionCriarFornecimento: function () {
    	this.getOwnerComponent().getRouter().navTo("CriarFornecimento", {}, true);
    },

    actionCancelarFornecimento: function () {
      this.getOwnerComponent().getRouter().navTo("CancelarFornecimento", { mode: "Search" }, true);
    },
    
    actionNotaFiscal: function () {
      sessionStorage.setItem("ViewBack", "logistica");
      this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
        fatura: "0"
      }, true);
    },

    actionTransporte: function () {
    	sessionStorage.setItem("ViewBack", "logistica");
    	this.getOwnerComponent().getRouter().navTo("transporte")
    },
    
    actionLogProcessamento: function() {
    	this.getOwnerComponent().getRouter().navTo("LogProcFornecimentoAut", { mode: "Search" }, true);
    },
      
    onAfterRendering: function () {
      try {
        sap.ui.controller("arcelor.controller.Inicio").authControl();
        let modelUsuario = this.getOwnerComponent().getModel("usuario").getData();
        this.byId("idUsuario").setText(modelUsuario.getId());
        this.byId("nomeUsuario").setText(modelUsuario.getFirstName());
        this.byId("nomeLoja").setText(sap.ui.getCore().getModel("centroloja").getData()[0].loja);
      } catch {

      };
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("master");
    }

  });

});