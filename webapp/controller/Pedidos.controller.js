sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("arcelor.controller.Pedidos", {

    actionVendas: function () {
      var oModelData = this.getView().getModel("SalesModel").getData();
      oModelData.SalesItems = [];
      this.getView().getModel("SalesModel").refresh(true);
      this.getOwnerComponent().getRouter().navTo("Vendas", {
        mode: "Create"
      }, true);
    },

    actionOrdemVendaFatura: function () {
      this.ClearFieldsOrdemVendaFatura();
      this.getOwnerComponent().getRouter().navTo("OrdemVendaFatura", {
        mode: "search"
      }, true);
    },
    actionTransporte: function () {
      this.getOwnerComponent().getRouter().navTo("transporte")
    },

    actionNotaFiscal: function () {
      sessionStorage.setItem("ViewBack", "pedidos");
      this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
        fatura: "0"
      }, true);
    },

    actionAdiantamento: function () {
      this.getOwnerComponent().getRouter().navTo("Adiantamento", true);
    },
    actionBoleto: function () {
      this.getOwnerComponent().getRouter().navTo("GerarBoleto", {
        telaOrigem: 'pedidos'
      }, true);
    },
    
    actionEncerraPedido: function() {
    	this.getOwnerComponent().getRouter().navTo("EncerraPedidoList", { mode: "Search" }, true);
    },
    
    onPress: function () {
      this.getOwnerComponent().getRouter().navTo("Finalizar", null, true);
    },

    _destroyFormVendas: function () {

    },

    ClearFieldsOrdemVendaFatura: function () {

      var view = sap.ui.getCore().byId("__component0---ordemvendafatura");

      if (view !== undefined) {

        sap.ui.getCore().byId("__component0---ordemvendafatura--multiinput-ordem").removeAllTokens();
        sap.ui.getCore().byId("__component0---ordemvendafatura--input-DtRemessa").setValue("");
        sap.ui.getCore().byId("__component0---ordemvendafatura--input-Cliente").setValue("");
        sap.ui.getCore().byId("__component0---ordemvendafatura--input-dateEmitidas").setValue("");

        var filters = [];
        var list = sap.ui.getCore().byId("__component0---ordemvendafatura--List");
        var binding = list.getBinding("items");
        binding.filter(filters);

        this.setInitalDateValue();

      }

    },

    setInitalDateValue: function () {

      var date = sap.ui.getCore().byId("__component0---ordemvendafatura--input-dateEmitidas");
      date.setDelimiter("-");
      date.setDateValue(new Date());
      date.setSecondDateValue(new Date());
      date.setValueFormat("dd/MM/yyyy");

      date.addEventDelegate({
        onAfterRendering: function () {
          var oDateInner = this.$().find('.sapMInputBaseInner');
          var oID = oDateInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, date);

      date = sap.ui.getCore().byId("__component0---ordemvendafatura--input-DtRemessa");

      date.addEventDelegate({
        onAfterRendering: function () {
          var oDateInner = this.$().find('.sapMInputBaseInner');
          var oID = oDateInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, date);

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