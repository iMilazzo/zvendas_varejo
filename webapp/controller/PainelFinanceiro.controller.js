sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/m/MessageBox"
], function (BaseController, UIComponent, MessageBox) {

  "use strict";


  return BaseController.extend("arcelor.controller.PainelFinanceiro", {

    onClickRelChequeMoradia: function (oEvent) {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RelChequeMoradiaPesq");
    },
    onAfterRendering: function () {
      sap.ui.controller("arcelor.controller.Inicio").authControl();
    },
    onLancamento: function () {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("lctocheque");
    },

    onPressSaldoICMS: function (oEvent) {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("saldoicms");
    },

    onPressLiberacaoBloqueio: function (oEvent) {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("liberacaobloqueio");
    },

    onPressChequeMoradiaBaixa: function (oEvent) {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("ChequeMoradiaBaixa");
    },

    onPressSolicitarAdiantamento: function (oEvent) {
      let oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("Adiantamento");
    },

    actionBoleto: function () {
      this.getOwnerComponent().getRouter().navTo("GerarBoleto", {
        telaOrigem: 'painel'
      }, true);
    },

    //DMND0021004 - FLS - 09.08.2022 - Begin
    actionLiberarBloqueioCondPgto: function() {
      this.getOwnerComponent().getRouter().navTo("LiberarCondPgto", {
        telaOrigem: 'painel'
      }, true);
    },
    //DMND0021004 - FLS - 09.08.2022 - End

    //DMND0018863 - IM - 27.09.2022 - Begin
    actionDevolucaoNFCe: function() {
      this.getOwnerComponent().getRouter().navTo("DevolucaoNFCe", {
        telaOrigem: 'painel'
      }, true);
    },
    //DMND0018863 - IM - 27.09.2022 - End

    onPressNavBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("master");
    },

    actionMonitorNfe: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("MonitorNfePesq", null, true);
    },

    onPressMenuButton: function () {
      let menu = sap.ui.getCore().byId("__component0---app--idAppControl-Master");

      if (menu.hasStyleClass("menuFechado")) {
        menu.setWidth("170px");
        menu.removeStyleClass("menuFechado");
        menu.addStyleClass("menuAberto");
      } else {
        menu.setWidth("0");
        menu.removeStyleClass("menuAberto");
        menu.addStyleClass("menuFechado")
      }
    },

    actionGerarArquivo: function() {
      MessageBox.confirm("Confirma geração do arquivo?", {
        title: "Confirmar",
        onClose: function (oAction) {
          if (oAction === "OK") {
            this._gerarArquivo();
          }
        }.bind(this),
        initialFocus: "CANCEL"
      });
    },

    _gerarArquivo: function() {
      this.getView().setBusy(true);

      this.getModel().callFunction("/GerarArquivo", {
        method: "GET",
        success: function (oData) {
          this.getView().setBusy(false);

          MessageBox.information(oData.Message, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);

          MessageBox.information("Erro ao gerar arquivo", {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        }.bind(this)
      });
    }
  });
});