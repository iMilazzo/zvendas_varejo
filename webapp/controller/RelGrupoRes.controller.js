sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/routing/History",
  "arcelor/model/formatter"
], function (BaseController, History, formatter) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelGrupoRes", {

    formatter: formatter,

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.vendasvarejo.relatorios.view.RelTransferenciaRes
     */
    onAfterRendering: function () {
      this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
      this._loadFilterRelGrupo(this.getView(), this.oModelSel.getData());
    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: 'Material',
        property: "Matnr",
        type: "string"
      });
      aCols.push({
        label: 'Descrição',
        property: "Maktx",
        type: "string"
      });
      aCols.push({
        label: 'Fisico',
        property: "Fisico",
        type: "string"
      });
      aCols.push({
        label: 'Disponivel',
        property: "Disponivel",
        type: "string"
      });
      aCols.push({
        label: 'Data',
        property: "DataConfirmada",
        type: "datetime"
      });
      aCols.push({
        label: 'Unidade',
        property: "UNIT",
        type: "string"
      });
      aCols.push({
        label: 'Grupo Merc',
        property: "Grupo_1",
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
        this.getOwnerComponent().getRouter().navTo("RelGrupoPesq", null, true);
      }
    },

    onImprimirPress: function (oEvent) {
      window.print();
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    }

  });

});