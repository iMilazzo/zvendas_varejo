sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Filter",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History",
  "sap/ui/core/util/Export",
  "sap/ui/core/util/ExportTypeCSV",
  "arcelor/model/formatter",
], function (BaseController, JSONModel, FilterOperator, Filter, MessageToast, History,  Export, ExportTypeCSV, formatter) {
  "use strict";

  var oModel;

  return BaseController.extend("arcelor.controller.RelDadosCobrancaRes", {

    formatter: formatter,

    onInit: function () {
      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
    },

    onExit: function () {
      this.destroy();
    },

    _onRouteMatched: function (oEvent) {

      var oTblRel = this.byId("tabela_relatorio");
      oTblRel.setNoDataText("Sem dados");

      // Limpeza Tabela
      var oModelRel = oTblRel.getModel();
      if (oModelRel){
        var oData  = oModelRel.getData();
        if (oData){
          oData.results = [];
          oModelRel.setData(oData);
        }
      }

      this.oModel = sap.ui.getCore().getModel("selection_relatorio");
      if (oEvent.getParameter("name") === "RelDadosCobrancaRes") {
        oTblRel.setBusy(true);
        this._loadDadosCobranca();
      }
    },

    _loadDadosCobranca() {

      let oModel = this.getModel();
      let aSelection = this.oModel.getData();
      var aFilters = [];
      var that = this;
      var total_geral = 0;

      if (aSelection.clienteDe.length > 0 && aSelection.clienteAte.length > 0) {
        aFilters.push(this._createFilterBT("Kunnr", aSelection.clienteDe, aSelection.clienteAte));
      } else if (aSelection.clienteDe.length > 0) {
        aFilters.push(this._createFilterEQ("Kunnr", aSelection.clienteDe));
      }

      if (aSelection.dtEmissaoDe.length > 0 && aSelection.dtEmissaoAte.length > 0) {
        aFilters.push(this._createFilterBT("Bldat", new Date(aSelection.dtEmissaoDe), new Date(aSelection.dtEmissaoAte)));
      } else if (aSelection.dtEmissaoDe.length > 0) {
        aFilters.push(this._createFilterEQ("Bldat", aSelection.dtEmissaoDe));
      }

      if (aSelection.dtVencimentoDe.length > 0 && aSelection.dtVencimentoAte.length > 0) {
        aFilters.push(this._createFilterBT("Dtvenc", new Date(aSelection.dtVencimentoDe), new Date(aSelection.dtVencimentoAte)));
      } else if (aSelection.dtVencimentoDe.length > 0) {
        aFilters.push(this._createFilterEQ("Dtvenc", new Date(aSelection.dtVencimentoDe)));
      }

      if (aSelection.tipoDocDe.length > 0 && aSelection.tipoDocAte.length > 0) {
        aFilters.push(this._createFilterBT("Blart", aSelection.tipoDocDe, aSelection.tipoDocAte));
      } else if (aSelection.tipoDocDe.length > 0) {
        aFilters.push(this._createFilterEQ("Blart", aSelection.tipoDocDe));
      }

      oModel.read("/RelDadosCobrancaSet", {

        filters: aFilters,
        success: function (oData) {

          var oTblRel = that.byId("tabela_relatorio");
          oTblRel.setNoDataText("Nenhum registro encontrado.");
          oTblRel.setBusy(false);

          if (oData.results.length === 0) {
            MessageToast.show("Sem resultados para a busca selecionada",{
              at: sap.ui.core.Popup.Dock.CenterCenter
            });
          }
          else {

            let oModelData = new JSONModel();
            var Kunnr = false;

            oModelData.setData(oData);
            oModelData.getData().results.forEach(function (context, i) {

              if (context.Kunnr != Kunnr) {
                var totals = oModelData.getData().results.filter((element) => {
                  return element.Kunnr === context.Kunnr;
                });

                Kunnr = context.Kunnr;

                var total = 0;
                for (var x = 0; x < totals.length; x++) {
                  total = parseFloat(total) + parseFloat(totals[x].Dmbtr);
                }

                var oModelTotal = {
                  Kunnr: context.Kunnr,
                  Name1: context.Name1,
                  Blart: "TOTAL: ",
                  Dmbtr: parseFloat(total).toFixed(2),
                };

                oModelData.getData().results.push(oModelTotal);
                total_geral += total;
              }
            });

            var oModelTotalGeral = {
              Kunnr: 99999999,
              Name1: "TOTAL GERAL: ",
              Dmbtr: parseFloat(total_geral).toFixed(2),
            };
            oModelData.getData().results.push(oModelTotalGeral);
            that.byId("tabela_relatorio").setModel(oModelData);
            that._bindTableExcel(aFilters);
            that.getView().setBusy(false);
          }
        },
        error: function (oError) {
          var oTblRel = that.byId("tabela_relatorio");
          oTblRel.setNoDataText("Erro ao obter dados.");
          oTblRel.setBusy(false);
        }
      });
    },

    _createFilterEQ(sFieldName, sValue) {
      return new Filter(sFieldName, FilterOperator.EQ, sValue);
    },

    _createFilterBT(sFieldName, sValueDe, sValueAte) {
      return new Filter(sFieldName, FilterOperator.BT, sValueDe, sValueAte);
    },

    onNavBack: function () {

      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (typeof (sPreviousHash) !== "undefined") {
        window.history.go(-1);
      } else {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("RelDadosCobrancaPesq", true);
      }
    },

    _bindTableExcel: function (aAllFilters) {
      let oTab = this.byId("tabRelatorio");
      let oTabBinding = oTab.getBinding("rows");
      var that = this;

      oTabBinding.oModel.setSizeLimit(1000000);
      oTabBinding.filter(aAllFilters);
    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: "Empresa",
        property: "Bukrs",
        type: "string"
      });
      aCols.push({
        label: "Cliente",
        property: "Kunnr",
        type: "string"
      });
      aCols.push({
        label: "Razão Social",
        property: "Name1",
        type: "string"
      });
      aCols.push({
        label: "Divisão",
        property: "Gsber",
        type: "string"
      });
      aCols.push({
        label: "Tipo Documento",
        property: "Blart",
        type: "string"
      });
      aCols.push({
        label: "Numero Documento",
        property: "Belnr",
        type: "string"
      });
      aCols.push({
        label: "Referência",
        property: "Xblnr",
        type: "string"
      });
      aCols.push({
        label: "Item",
        property: "Buzei",
        type: "string"
      });
      aCols.push({
        label: "Registro Emissao",
        property: "Bldat",
        type: "date"
      });
      aCols.push({
        label: "Vencimento Atual",
        property: "Data",
        type: "date"
      });
      aCols.push({
        label: "Valor",
        property: "Dmbtr",
        type: "number"
      });

      return aCols;
    },
exportSpreadsheet: function () {
      var text = this;
          var oTab = this.getView().byId("tabela_relatorio");
          var oModel = oTab.getModel();
          var oData = oModel.getData();

        for (var i = 0; i < oModel.getData().results.length; i++) {

        if (oModel.getData().results[i].Bldat) {

          var data1 = new Date(oModel.getData().results[i].Bldat);
          data1 = data1.setDate(data1.getDate()+1);
          data1 = new Date(data1);
          oModel.getData().results[i].Bldat2 = data1;


          if (oModel.getData().results[i].Bldat2.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].Bldat2);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].Bldat2);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].Bldat2);
            oModel.getData().results[i].Bldat2 = da + "/" + mo + "/" + ye;
          }
        };
    if (oModel.getData().results[i].Data) {

          var data2 = new Date(oModel.getData().results[i].Data);
          data2 = data2.setDate(data2.getDate()+1);
          data2 = new Date(data2);
          oModel.getData().results[i].Data2 = data2;

          if (oModel.getData().results[i].Data2.toString().indexOf("/") == -1) {
            var ye = new Intl.DateTimeFormat('en', {
              year: 'numeric'
            }).format(oModel.getData().results[i].Data2);
            var mo = new Intl.DateTimeFormat('en', {
              month: '2-digit'
            }).format(oModel.getData().results[i].Data2);
            var da = new Intl.DateTimeFormat('en', {
              day: '2-digit'
            }).format(oModel.getData().results[i].Data2);
            oModel.getData().results[i].Data2 = da + "/" + mo + "/" + ye;
          }
        }


};
        var oExport = new sap.ui.core.util.Export({
        exportType: new ExportTypeCSV({separatorChar: ";"}),
        models: oModel,
        rows: {path: "/results"},
        columns: [{name: "Empresa", template: { content: "{Bukrs}"}},
                  {name: "Cliente", template: { content: "{Kunnr}"}},
                  {name: "Razão Social", template: { content: "{Name1}"}},
                  {name: "Divisão", template: { content: "{Gsber}"}},
                  {name: "Tipo Documento", template: { content: "{Blart}"}},
                  {name: "Numero Documento", template: { content: "{Belnr}"}},
                  {name: "Referência", template: { content: "{Xblnr}"}},
                  {name: "Item", template: { content: "{Buzei}"}},
                  {name: "Registro Emissao", template: { content: "{Bldat2}"}},
                  {name: "Vencimento Atual", template: { content: "{Data2}"}},
                  {name: "Valor", template: { content: "{Dmbtr}"}}]
    });
        this.onExcel(oExport);
  },
    onExcel: sap.m.Table.prototype.exportData || function (oExport) {
            //var vText = this.getResourceBundle().getText("errorPressExcel");

            oExport.saveFile().catch(function (oError) {
                //
            }).then(function () {
                oExport.destroy();
            });
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onImprimirPress: function () {
      window.print();
    }

  });
});