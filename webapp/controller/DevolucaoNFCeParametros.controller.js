sap.ui.define([
    "arcelor/controller/BaseController", 
    "sap/ui/model/json/JSONModel", 
    "sap/m/MessageBox"],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("arcelor.controller.DevolucaoNFCeParametros", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf arcelor.view.Venda
       */
       onInit: function () {
        if (!this.getModel("devolucaoNFCeParametros")) {
          this.setModel(
            new JSONModel({
              motivo: "",
              motivos: [{
                key: "05",
                text: "Erro na Ordem de Vendas"
              },{
                key: "06",
                text: "Desistência do Cliente"
              }],
              ordemVenda: "123456",
            }),
            "devolucaoNFCeParametros"
          );
        }

        // Route Handler
        sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onMasterMatched, this);
      },

      _onMasterMatched: function () {
        this.getModel("devolucaoNFCeParametros").setData({
          motivo: "",
          motivos: [{
            key: "05",
            text: "Erro na Ordem de Vendas"
          },{
            key: "06",
            text: "Desistência do Cliente"
          }],
          ordemVenda: "123456",
        });
        this.getModel("devolucaoNFCeParametros").refresh(true);
      },

      onNavBase: function () {
        this.getRouter().navTo("financeiro");
      },

      onDevolucaoNFCe: function () {
        var sMotivo = this.getModel("devolucaoNFCeParametros").getData().motivo;

      },

      onCadastrarCliente: function (){
        this.getOwnerComponent().getRouter().navTo("ClientesCadastroNFCe");        
      },
      _convertMessage: function (sMessage) {
        var tTextArea = document.createElement("textarea");
        tTextArea.innerHTML = sMessage;
        return tTextArea.value;
      },
    });
  }
);
