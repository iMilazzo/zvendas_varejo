sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/routing/History",
"sap/ui/core/util/Export",
"sap/ui/core/util/ExportTypeCSV",
  "arcelor/model/formatter"
], function (BaseController, History, Export, ExportTypeCSV, formatter) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelTransferenciaRes", {

    formatter: formatter,

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.vendasvarejo.relatorios.view.RelTransferenciaRes
     */
    onAfterRendering: function () {
      this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
      this._loadFilterRelTransferencia(this.getView(), this.oModelSel.getData());
    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: this._loadI18n(this.getView(), "rt_reswk"),
        property: "Reswk",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_werks"),
        property: "Werks",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_matkl"),
        property: "Matkl",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_bedat"),
        property: "Bedat",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_ebeln"),
        property: "Ebeln",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_ebelp"),
        property: "Ebelp",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_banfn"),
        property: "Banfn",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_bnfpo"),
        property: "Bnfpo",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_matnr"),
        property: "Matnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_txz01"),
        property: "Txz01",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_menge"),
        property: "Menge",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_meins"),
        property: "Meins",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_eindt"),
        property: "Eindt",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_budat"),
        property: "Budat",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_belnr"),
        property: "Belnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_lfimg"),
        property: "Lfimg",
        type: "number"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_vrkme"),
        property: "Vrkme",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_erdat_transp"),
        property: "ErdatTransp",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_vbeln_transp"),
        property: "VbelnTransp",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_tknum_sub1"),
        property: "TknumSub1",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_tknum_sub2"),
        property: "TknumSub2",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_erdat_fat"),
        property: "ErdatFat",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_xblnr"),
        property: "Xblnr",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_nfe"),
        property: "Nfe",
        type: "string"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_erdat_recep"),
        property: "ErdatRecep",
        type: "datetime"
      });
      aCols.push({
        label: this._loadI18n(this.getView(), "rt_iap"),
        property: "Iap",
        type: "string"
      });

      return aCols;
    },

    exportSpreadsheet: function () {
    var text = this;
          var oTab = this.getView().byId("relatorio_transferencia");
          var oModel = oTab.getModel();
          var oData = oModel.getData();

          for (var i = 0; i < oModel.getData().results.length; i++) {

        if (oModel.getData().results[i].Bedat) {
          if (oModel.getData().results[i].Bedat.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].Bedat);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].Bedat);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].Bedat);
            oModel.getData().results[i].Bedat = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }
        }
if (oModel.getData().results[i].Budat) {
          if (oModel.getData().results[i].Budat.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].Budat);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].Budat);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].Budat);
            oModel.getData().results[i].Budat = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }
        }

        if (oModel.getData().results[i].ErdatTransp) {
          if (oModel.getData().results[i].ErdatTransp.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].ErdatTransp);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].ErdatTransp);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].ErdatTransp);
            oModel.getData().results[i].ErdatTransp = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }
        }

        if (oModel.getData().results[i].ErdatFat) {
          if (oModel.getData().results[i].ErdatFat.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].ErdatFat);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].ErdatFat);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].ErdatFat);
            oModel.getData().results[i].ErdatFat = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }
        }

      if (oModel.getData().results[i].Eindt) {
          if (oModel.getData().results[i].Eindt.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].Eindt);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].Eindt);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].Eindt);
            oModel.getData().results[i].Eindt = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }}

        if (oModel.getData().results[i].ErdatRecep) {
          if (oModel.getData().results[i].ErdatRecep.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].ErdatRecep);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].ErdatRecep);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].ErdatRecep);
            oModel.getData().results[i].ErdatRecep = da + "/" + mo + "/" + ye;
        //    oModel.getData().results[i].VTotconf = this.priceqtd3(oModel.getData().results[i].VTotconf);
          }
        }

    if (oModel.getData().results[i].Menge) {
        var newMenge = this.formatter.price(oModel.getData().results[i].Menge);
        oModel.getData().results[i].Menge = newMenge;
    }
    if (oModel.getData().results[i].Lfimg){
        var newLfimg = this.formatter.price(oModel.getData().results[i].Lfimg);
        oModel.getData().results[i].Lfimg = newLfimg;
    }

        }
              var oExport = new sap.ui.core.util.Export({
        exportType: new ExportTypeCSV({separatorChar: ";"}),
        models: oModel,
        rows: {path: "/results"},
        columns: [{name: text._loadI18n(text.getView(), "rt_reswk"), template: { content: "{Reswk}"}},
                  {name: text._loadI18n(text.getView(), "rt_werks"), template: { content: "{Werks}"}},
                  {name: text._loadI18n(text.getView(), "rt_matkl"), template: { content: "{Matkl}"}},
                  {name: text._loadI18n(text.getView(), "rt_bedat"), template: { content: "{Bedat}"}},
                  {name: text._loadI18n(text.getView(), "rt_ebeln"), template: { content: "{Ebeln}"}},
                  {name: text._loadI18n(text.getView(), "rt_ebelp"), template: { content: "{Ebelp}"}},
                  {name: text._loadI18n(text.getView(), "rt_banfn"), template: { content: "{Banfn}"}},
                  {name: text._loadI18n(text.getView(), "rt_bnfpo"), template: { content: "{Bnfpo}"}},
                  {name: text._loadI18n(text.getView(), "rt_matnr"), template: { content: "{Matnr}"}},
                  {name: text._loadI18n(text.getView(), "rt_txz01"), template: { content: "{Txz01}"}},
                  {name: text._loadI18n(text.getView(), "rt_menge"), template: { content: "{Menge}"}},
                  {name: text._loadI18n(text.getView(), "rt_meins"), template: { content: "{MeinsPo}"}},
                  {name: text._loadI18n(text.getView(), "rt_eindt"), template: { content: "{Eindt}"}},
                  {name: text._loadI18n(text.getView(), "rt_budat"), template: { content: "{Budat}"}},
                  {name: text._loadI18n(text.getView(), "rt_belnr"), template: { content: "{Belnr}"}},
                  {name: text._loadI18n(text.getView(), "rt_lfimg"), template: { content: "{Lfimg}"}},
                  {name: text._loadI18n(text.getView(), "rt_vrkme"), template: { content: "{Vrkme}"}},
                  {name: text._loadI18n(text.getView(), "rt_erdat_transp"), template: { content: "{ErdatTransp}"}},
                  {name: text._loadI18n(text.getView(), "rt_vbeln_transp"), template: { content: "{VbelnTransp}"}},
                  {name: text._loadI18n(text.getView(), "rt_tknum_sub1"), template: { content: "{TknumSub1}"}},
                  {name: text._loadI18n(text.getView(), "rt_tknum_sub2"), template: { content: "{TknumSub2}"}},
                  {name: text._loadI18n(text.getView(), "rt_erdat_fat"), template: { content: "{ErdatFat}"}},
                  {name: text._loadI18n(text.getView(), "rt_xblnr"), template: { content: "{Xblnr}"}},
                  {name: text._loadI18n(text.getView(), "rt_nfe"), template: { content: "{Nfe}"}},
                  {name: text._loadI18n(text.getView(), "rt_erdat_recep"), template: { content: "{ErdatRecep}"}},
                  {name: text._loadI18n(text.getView(), "rt_iap"), template: { content: "{Iap}"}}]
    });
            this.onExcel(oExport);

  //    this._exportSpreadsheet(this.byId("tabRelatorio"), this.createColumnConfig());
    },
  onExcel: sap.m.Table.prototype.exportData || function (oExport) {
            //var vText = this.getResourceBundle().getText("errorPressExcel");

            oExport.saveFile().catch(function (oError) {
                //
            }).then(function () {
                oExport.destroy();
            });
        },

    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("RelTransferenciaPesq", null, true);
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