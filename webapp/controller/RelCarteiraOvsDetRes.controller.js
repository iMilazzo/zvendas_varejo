sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/routing/History",
  "arcelor/model/formatter"
], function (BaseController, History, formatter) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelCarteiraOvsDetRes", {

    formatter: formatter,

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.view.RelCarteiraOvsDetRes
     */
    onAfterRendering: function () {

      this.getView().setBusy(true);
      this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
      this._loadFilterRelCateiraOvsDet(this.getView(), this.oModelSel.getData());
      var dataAtual = new Date();
      this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));
    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: this._loadI18n(this.getView(), "vbeln"),
        property: "Vbeln",
        type: "string"
      });

      aCols.push({
        label: this._loadI18n(this.getView(), "posnr"),
        property: "Posnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "matnr"),
        property: "Matnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "arktx"),
        property: "Arktx",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "matkl"),
        property: "Matkl",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "matkltext"),
        property: "MatklText",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "kwmeng"),
        property: "Kwmeng",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "meins"),
        property: "Vrkme",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "klmeng"),
        property: "Klmeng",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "kunnr"),
        property: "Kunnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "name1"),
        property: "Name1",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "ort01"),
        property: "Ort01",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "ort02"),
        property: "Ort02",
        type: "string"
      });

      aCols.push({
        label: this._loadI18n(this.getView(), "cmgst"),
        property: "Cmgst",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "cmgsttext"),
        property: "CmgstText",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "erdat"),
        property: "Erdat",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "zterm"),
        property: "Zterm",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "ztermtext"),
        property: "ZtermText",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "edatu"),
        property: "Edatu",
        type: "datetime"
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
        this.getOwnerComponent().getRouter().navTo("RelCarteiraOvsDetPesq", null, true);
      }
    },

    getGroupHeader: function (oGroup) {
      return new sap.m.GroupHeaderListItem({
        title: oGroup.key,
        upperCase: false,
      });
    },

    onImprimirPress: function (oEvent) {
      var bind = this.byId("tabela_relatorio").getBinding("items");
      var contexts = bind.getCurrentContexts();
      var sum = 0;
      var cond = false;
      var that = this;

      window.print();
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    }

  });

});