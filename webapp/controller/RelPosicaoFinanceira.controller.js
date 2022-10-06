sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
    "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/export/Spreadsheet",
  "sap/ui/core/util/Export",
  "sap/ui/core/util/ExportTypeCSV",
  "sap/ui/core/format/NumberFormat"
], function (BaseController, JSONModel, History, MessageBox, MessageToast, Filter, FilterOperator, 
    Spreadsheet, Export, ExportTypeCSV, NumberFormat) {
  "use strict";

  var bDadoMestre = false;

  return BaseController.extend("arcelor.controller.RelPosicaoFinanceira", {

    onInit: function () {

      var oViewModel = new sap.ui.model.json.JSONModel({
        dataAtual : "",
        horaAtual : ""
      });

      this.getView().setModel(oViewModel, "worklistView");

      this.getRouter().getRoute("RelPosicaoFinanceira").attachPatternMatched(this._onObjectMatched.bind(this), this);
    },

    _onObjectMatched: function (oEvent) {
      this.onClear();

      var oModel = this.getModel("PosicaoFinanceira");
      if (oModel) {
        oModel.setData(null);
      }
    },

    onBeforeRendering: function () {
//      this.getView().setBusy(true);
//
//      var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divNotaFiscal");
//      if (!autorizado) {
//        this.getRouter().getTargets().display("Unauthorized");
//        return false;
//      } else {
//        this.getView().setBusy(false);
//      }
    },


      onAfterRendering: function () {
          var filters = [];
          var filter = "";

          filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "EV");
          filters.push(filter);
          filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
            null ? "X" : ""));
          filters.push(filter);

          var list = this.getView().byId("inputDadoMestre");
          var binding = list.getBinding("items");
          binding.oModel.setSizeLimit(10000);

          binding.filter(filters);

          // Versão
          filters = [];
          filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "VS");
          filters.push(filter);
          filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
            null ? "X" : ""));
          filters.push(filter);

          var list2 = this.getView().byId("inputDadoMestreVersao");
          var binding2 = list2.getBinding("items");
          binding2.oModel.setSizeLimit(10000);

          binding2.filter(filters);
        },

        inicioUpdateTabela: function (oEvt) {
          this.getView().setBusy(true);
        },

        fimUpdateTabela: function (oEvt) {
          this._carregaDadoMestre();
          this.getView().setBusy(false);
        },

        _carregaDadoMestre: function () {
            var aEscritVendasVend = []; //EV

          if (bDadoMestre === false) {
            bDadoMestre = true;

            var oTabela = this.getView().byId("inputDadoMestre");
            var oLinha = oTabela.getItems();
            var oItem,
              oCelulas;
            var vCodconsulta,
              vCoddadomestre,
              vTextodadomestre;

            for (var i = 0; i < oLinha.length; i++) {
              oItem = oLinha[i];
              oCelulas = oItem.getCells();

              vCodconsulta = oCelulas[0].getValue();
              vCoddadomestre = oCelulas[1].getValue();
              vTextodadomestre = oCelulas[2].getValue();

              // Equipe de Vendas / Vendedor
              if (vCodconsulta === "EV") {
                aEscritVendasVend.push({
                  Codconsulta: vCodconsulta,
                  Coddadomestre: vCoddadomestre,
                  Textodadomestre: vTextodadomestre
                });
              }
            }

            // Escritório de Vendas / Vendedor
            var oEscritVendasVend = new sap.ui.model.json.JSONModel();
            oEscritVendasVend.setSizeLimit(1000);
            oEscritVendasVend.setData({
              modelEscritVendasVen: aEscritVendasVend
            });
            var oDataEscritVendasVend = this.getView().byId("idComboBoxEscritVendasVen");
            oDataEscritVendasVend.setModel(oEscritVendasVend);

          }
        },     

    onNavBack: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("relatorios");
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

        handleValueHelp: function(oEvent) {

            var sInputValue, sSearchFiled;

            sInputValue = oEvent.getSource().getValue();
            sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);

            if ($.isNumeric(sInputValue) && sInputValue.length === 11) {
              sSearchFiled = "Cpf";
            }
            if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
              sSearchFiled = "Codcliente";
            } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
              sSearchFiled = "Cnpj";
            } else if (!$.isNumeric(sInputValue)) {
              sSearchFiled = "Nome";
            }

            if (this._oDialog) {
              this._oDialog.destroy();
            }

            this.inputId = oEvent.getSource().getId();

            this._oDialog = sap.ui.xmlfragment("arcelor.view.ClientesPesquisaDialog", this);
            this._oDialog.setModel(this.getView().getModel());

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);

            // create a filter for the bindinghandleValueHelp
            var filters = [];
            filters.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
            filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, 'W'));
            this._oDialog.getBinding("items").filter(filters);

            // open value help dialog filtered by the input value
            this._oDialog.open(sInputValue);
        },
          
        handleSearchClientes: function (oEvent) {
            var filters = [];
            var query = oEvent.getParameter("value");
            var query2 = query;
            query = this.utilFormatterCPFCNPJClearSearch(query);

            if ((query && query.length > 0) && (query.trim() !== "")) {

              var filter;

              if ($.isNumeric(query) && query.length === 11) {
                filter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, query);
              }
              if ($.isNumeric(query) && query.length < 11) {
                filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, query);
              } else if ($.isNumeric(query) && query.length > 11) {
                filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
              } else if (!$.isNumeric(query)) {
                filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
              }
              filters.push(filter);
              filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, "W"));
            }

            var binding = oEvent.getSource().getBinding("items");
            binding.filter(filters);
        },
        
        _handleValueHelpClose: function (evt) {
            var oSelectedItem, fieldInput;

            oSelectedItem = evt.getParameter("selectedItem");

            if (oSelectedItem) {
              fieldInput = this.getView().byId(this.inputId);
              fieldInput.setValue(oSelectedItem.getDescription());
            }
            evt.getSource().getBinding("items").filter([]);
        },        


    onSearch: function() {

      var aFilters = this._createFilter();

//      var oFilterKunnr = aFilters.filter(function(e) { return e.sPath === "Kunnr" })[0];
//
//      if (!oFilterKunnr) {
//        MessageBox.error("Cliente é obrigatório", { title: "ArcelorMittal", styleClass: "sapUiSizeCompact" });
//        return;
//      }

      this.getView().setBusy(true);

      this.getView().getModel("worklistView").setProperty("/dataAtual", "");
      this.getView().getModel("worklistView").setProperty("/horaAtual", "");

      this.getModel().read("/RelPosicaoFinanceiraSet", {
        filters: aFilters,
        success: function(oResultData, oResponse) {
          this.getView().setBusy(false);

          var aRegisters  = oResultData.results;

          aRegisters.forEach(function(e) {
            e.BudatStr       = this._convertToDataStr(e.Budat);
            e.DtvncStr       = this._convertToDataStr(e.Dtvnc);
            e.DmbtrStr       = this._convertToNumberBrazil(e.Dmbtr);
            e.KlimkStr       = this._convertToNumberBrazil(e.Klimk);

            if(!!e.ActualData)
              this.getView().getModel("worklistView").setProperty("/dataAtual", this._convertToDataStr(e.ActualData));

            if(!!e.ActualTime.ms)
              this.getView().getModel("worklistView").setProperty("/horaAtual", this._convertToHoraStr(e.ActualTime));

          }.bind(this));

          var oModel = new sap.ui.model.json.JSONModel();

          oModel.setSizeLimit(aRegisters.length);
          oModel.setData(aRegisters);

          this.getView().setModel(oModel, "PosicaoFinanceira");
        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    onClear: function() {
      this.byId("idComboBoxEscritVendasVen").setSelectedKey(null);

      this.byId("idDataCriacao").setValue("");
      this.byId("idDataCriacao").setDateValue(null);

      this.byId("input-Cliente").setValue("");
    },

    _convertToDataStr: function(data) {

      if(!data)
        return null;

      var dia = data.getDate();
      var mes = data.getMonth() + 1;
      var ano = data.getFullYear();

      dia = dia.toString().length === 1 ? '0' + dia : dia;
      mes = mes.toString().length === 1 ? '0' + mes : mes;

      return dia + "/" + mes + "/" + ano;
    },

    _convertToHoraStr: function(milliseconds) {
      /*var hor = data.getHours();
      var min = data.getMinutes();
      var seg = data.getSeconds();

      return hor + ":" + min + ":" + seg;*/

      if(!milliseconds.ms)
        return null;

      //Get hours from milliseconds
        var hours = milliseconds.ms / (1000*60*60);
        var absoluteHours = Math.floor(hours);
        var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

        //Get remainder from hours and convert to minutes
        var minutes = (hours - absoluteHours) * 60;
        var absoluteMinutes = Math.floor(minutes);
        var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

        //Get remainder from minutes and convert to seconds
        var seconds = (minutes - absoluteMinutes) * 60;
        var absoluteSeconds = Math.floor(seconds);
        var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


        return h + ':' + m + ':' + s;
    },

    _convertToNumberBrazil : function(pValue){
        var oNumberFormat = NumberFormat.getFloatInstance({
                                  maxFractionDigits: 2,
                                  groupingEnabled: true,
                                  groupingSeparator: ".",
                                  decimalSeparator: ","
                                  });
        
        if(isNaN(pValue)){
          pValue = 0;
        }
        
        var text = oNumberFormat.format(pValue);
        return text;
           
    },

    _createFilter: function () {
      var aFilters = [],
        aSelectedItems,
        aSelectedItem,
        aSelectedItemFrom,
        aSelectedItemTo,
        dDateFrom,
        dDateTo,
        sValue;

      if (this.getView().byId("idComboBoxEscritVendasVen").getSelectedItem()) {
        aSelectedItem = this.getView().byId("idComboBoxEscritVendasVen").getSelectedItem();
        sValue = aSelectedItem.getKey();

        if (sValue) {
          var parts  = sValue.split("/");
          var sVkbur = parts[0];
          var sVkgrp = parts[1];

          aFilters.push(new Filter("Vkgrp", FilterOperator.EQ, sVkgrp));
          aFilters.push(new Filter("Vkbur", FilterOperator.EQ, sVkbur));
        }
      }

      if (this.getView().byId("idDataCriacao").getDateValue()) {
        dDateFrom = this.getView().byId("idDataCriacao").getFrom();
        dDateTo   = this.getView().byId("idDataCriacao").getTo();

        if (dDateFrom) {
          if (dDateTo) {
            aFilters.push(new Filter("Budat", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
          } else {
            aFilters.push(new Filter("Budat", FilterOperator.EQ, dDateFrom));
          }
        }
      }

      if (this.byId("input-Cliente").getValue()) {
        sValue = this.byId("input-Cliente").getValue();
        aFilters.push(new Filter("Kunnr", FilterOperator.EQ, sValue));
      }

      return aFilters;
    },
        
        onImprimirPress: function (oEvent) {
            var bind = this.byId("tbPosicaoFinanceira").getBinding("rows");
            var contexts = bind.getCurrentContexts();
            var sum  = 0;
            var cond = false;
            var that = this;

            window.print();
        },
        
        exportSpreadsheet: function () {
            var oModel  = this.getModel("PosicaoFinanceira")

for (var i = 0; i < oModel.oData.length; i++) {

                                                                               if (oModel.oData[i].BudatStr) {

                                                                                 var nDataLanc = new Date(oModel.oData[i].Budat);
                                                                                 nDataLanc = nDataLanc.setDate(nDataLanc.getDate()+1);
                                                                                 nDataLanc = new Date(nDataLanc);
                                                                                 oModel.oData[i].BudatStr2 = nDataLanc;

                                                                                 if (oModel.oData[i].BudatStr2.toString().indexOf("/") == -1) {
                                                                                              var ye = new Intl.DateTimeFormat('en', {
                                                                                                year: 'numeric'
                                                                                              }).format(oModel.oData[i].BudatStr2);
                                                                                              var mo = new Intl.DateTimeFormat('en', {
                                                                                                month: '2-digit'
                                                                                              }).format(oModel.oData[i].BudatStr2);
                                                                                              var da = new Intl.DateTimeFormat('en', {
                                                                                                day: '2-digit'
                                                                                              }).format(oModel.oData[i].BudatStr2);

                                                                                              oModel.oData[i].BudatStr2 = da + "/" + mo + "/" + ye;
                                                                                 }
                                                                               };

                                                                               if (oModel.oData[i].DtvncStr) {

                                                                                 var nDataVenc = new Date(oModel.oData[i].Dtvnc);
                                                                                 nDataVenc = nDataVenc.setDate(nDataVenc.getDate()+1);
                                                                                 nDataVenc = new Date(nDataVenc);
                                                                                 oModel.oData[i].DtvncStr2 = nDataVenc;

                                                                                 if (oModel.oData[i].DtvncStr2.toString().indexOf("/") == -1) {
                                                                                              var ye = new Intl.DateTimeFormat('en', {
                                                                                                year: 'numeric'
                                                                                              }).format(oModel.oData[i].DtvncStr2);
                                                                                              var mo = new Intl.DateTimeFormat('en', {
                                                                                                month: '2-digit'
                                                                                              }).format(oModel.oData[i].DtvncStr2);
                                                                                              var da = new Intl.DateTimeFormat('en', {
                                                                                                day: '2-digit'
                                                                                              }).format(oModel.oData[i].DtvncStr2);

                                                                                              oModel.oData[i].DtvncStr2 = da + "/" + mo + "/" + ye;
                                                                                 }
                                                                               };
                                               };


            var rows    = { path: "/" };
            var columns = [
              {name: "Esc. Vendas", template: { content: "{Vkbur}"}},
                {name: "Grp. Vendedores", template: { content: "{Vkgrp}"}},
                {name: "Cliente", template: { content: "{Kunnr}"}},
                {name: "Razão Social", template: { content: "{Name1}"}},
                {name: "Risco", template: { content: "{Ctlpc}"}},
                {name: "Lim. Crédito", template: { content: "{KlimkStr}"}},
                {name: "Telefone", template: { content: "{Telf1}"}},
                {name: "Estado", template: { content: "{Regio}"}},
                {name: "Cidade", template: { content: "{Ort01}"}},
                {name: "Status", template: { content: "{Status}"}},
                {name: "Tp. Documento", template: { content: "{Blart}"}},
                {name: "Belnr", template: { content: "{Documento}"}},
                {name: "Item", template: { content: "{Buzei}"}},
                {name: "Referência", template: { content: "{Xblnr}"}},
                {name: "Cod. Pagto.", template: { content: "{Zterm}"}},
                {name: "Razão Especial", template: { content: "{Umskz}"}},
                {name: "Data Lançamento", template: { content: "{BudatStr2}"}},
                {name: "Data Vencimento", template: { content: "{DtvncStr2}"}},
                {name: "Atraso", template: { content: "{Atraso}"}},
                {name: "Valor", template: { content: "{DmbtrStr}"}},
                {name: "Banco", template: { content: "{Hbkid}"}},
                {name: "Nº Banco", template: { content: "{Xref3}"}},
                {name: "PEFIN", template: { content: "{Hzuon}"}}
            ];
            
            var oExport = new sap.ui.core.util.Export({
                exportType: new ExportTypeCSV({ separatorChar: ";" }),
                models: oModel,
                rows: rows,
                columns: columns
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
        }
        
  });
});