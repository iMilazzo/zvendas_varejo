sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/routing/History",
  "arcelor/model/formatter"
], function (BaseController, History, formatter) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelNfPeriodoRes", {

    formatter: formatter,

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.view.RelNfPeriodoRes
     */
    onAfterRendering: function () {
      this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
      this._loadFilterRelNfPeriodo(this.getView(), this.oModelSel.getData());
      this.byId("dataAtual").setText(this.oModelSel.getData().idDataDe + " a " + this.oModelSel.getData().idDataAte);
    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: this._loadI18n(this.getView(), "docnum"),
        property: "Docnum",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "nfnum"),
        property: "Nfnum",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "series"),
        property: "Series",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "nfenum"),
        property: "Nfenum",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "nfttxt"),
        property: "Nfttxt",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "docdat"),
        property: "Docdat",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "name1ad"),
        property: "Name1Ad",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "valipi"),
        property: "Valipi",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "bezei"),
        property: "Bezei",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "werks"),
        property: "Werks",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "ntgew"),
        property: "Ntgew",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "tdline"),
        property: "Tdline",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "name1gp"),
        property: "Name1Gp",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "cancel"),
        property: "Cancel",
        type: "string"
      });

      return aCols;
    },

    exportSpreadsheet: function () {
      this._exportSpreadsheet(this.byId("tabRelatorio"), this.createColumnConfig());
    },

    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("RelNfPeriodoPesq", null, true);
      }
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onImprimirPress: function () {
      window.print();
    }

  });

});