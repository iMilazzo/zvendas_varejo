0,sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/ui/Device",
  "arcelor/model/formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/Token",
  "sap/m/MessagePopover",
  "sap/m/MessagePopoverItem"
], function (BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, MessageBox, MessageToast,
  Token, MessagePopover, MessagePopoverItem) {
  "use strict";
  var aMessagePopover = [];
  var l_ovs = [];
  var valueHelpDialogData;
  var oMessageTemplate = new MessagePopoverItem({
    type: '{type}',
    title: '{title}',
    description: '{description}',
    subtitle: '{subtitle}',
    counter: '{counter}',
    link: ""
  });
  var oMessagePopover = new MessagePopover({
    items: {
      path: '/modelDataMessagePopover',
      template: oMessageTemplate
    }
  });
  return BaseController.extend("arcelor.controller.transporteres", {
    onInit: function () {
      if (!this.getModel("OVModel")) {
        this.setModel(new JSONModel(), "OVModel");
      }
      this.getRouter().getRoute("transporteres").attachPatternMatched(this._onObjectMatched.bind(this), this);
    },

    _attachIconRendering: function (iconId, classe) {
      iconId.addEventDelegate({
        onAfterRendering: function (oEvent) {
          var sStatus = oEvent.srcControl.data("status");
          var sStatusClass = (sStatus && sStatus.length > 0 ? "statusUiIcon" + sStatus : "");
          let icone = oEvent.srcControl;
          icone.removeStyleClass("statusUiIconL1");
          icone.removeStyleClass("statusUiIconL2");
          icone.removeStyleClass("statusUiIconL3")
          icone.addStyleClass(sStatusClass);
        }
      });
    },

    onDisable: function () {
      var sayings = new Map();
      var tbl = this.getView().byId('List');
      var header = tbl.$().find('thead');
      var selectAllCb = header.find('.sapMCb');
      selectAllCb.remove();

      tbl.getItems().forEach(function (r) {
        var obj = r.oBindingContexts.OVModel.getObject();
        var oStatus = obj.Vgbel;
        var cb = r.$().find('.sapMCb');
        var oCb = sap.ui.getCore().byId(cb.attr('id'));
        if (sayings.has(oStatus)) {
          oCb.setEnabled(false);
        }
        sayings.set(oStatus, true);

      });
    },

    _onObjectMatched: function (Event) {
      var oParameters = Event.getParameters();
      this.onSearch()
    },

    onBeforeRendering: function () {
      this.getView().setBusy(true);
      var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divBuscarPedido");
      if (!autorizado) {
        this.getRouter().getTargets().display("Unauthorized");
        return false;
      } else {
        this.getView().setBusy(false);
      }
    },

    handleCancelboletoPress: function () {
      valueHelpDialogData.close();
      valueHelpDialogData.destroy();
    },

    onAfterRendering: function () {
      sap.ui.controller("arcelor.controller.Inicio").authControl();
      this._attachIconRendering(this.byId("icon3"), null);
      this._attachIconRendering(this.byId("icon4"), null);
      this._attachIconRendering(this.byId("icon5"), null);
    },

    onSalesOrderFrag: function (oEvent) {
      var iItem = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
      var sVbeln = this.getView().getModel("OVModel").getData().OVData[iItem].Ordem + "&&&" + this.getView().getModel("OVModel").getData()
        .OVData[iItem].DescCliente.replace('/', '&&&&&');
      this.oModelOV = new sap.ui.model.json.JSONModel();
      this.oModelOV.setData(this.getView().getModel("OVModel").getData());
      sap.ui.getCore().setModel(this.oModelOV, "ov_exibir_dados");
      this.getOwnerComponent().getRouter().navTo("Vendas", {
        mode: "Change",
        salesorder: sVbeln
      }, true);
    },

    onNotaFiscalFrag: function (oEvent) {
      var oSource = oEvent.getSource();
      var sPath = oSource.getBindingContext().getPath();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPath);
      sessionStorage.setItem("ViewBack", "OrdemVendaFatura");
      this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
        mode: "Change",
        fatura: oRow.fatura
      }, true);
    },

    handleBoletoOVPress: function (oEvent) {
      this.aAllFilters = [];
      var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: "dd/MM/yyyy"
      });
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          if (aSelectedContexts[0].getObject().StatusFatura == "FL3") {
            var date_time = new Date();
            var subFromDate = oDateFormat.format(new Date(date_time));
            this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem);
            this.aAllFilters.push(this.oFilter);
            this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
            var oview = this;
            this.aAllFilters.push(this.oFilter);
            this.getModel().read("/GerarBoletoOVVeriSet", {
              filters: this.aAllFilters,
              success: function (oData) {
                if (oData.results.length > 0) {
                  MessageToast.show("Boleto Enviado a Impressora");
                } else {
                  if (valueHelpDialogData) {
                    valueHelpDialogData = null;
                  }
                  valueHelpDialogData = sap.ui.xmlfragment(
                    "arcelor.view.DataPicker",
                    oview
                  );
                  oview.getView().addDependent(valueHelpDialogData);
                  valueHelpDialogData.open();
                }
              },
              error: function (Error) {}
            });
          } else {
            MessageBox.error("Item não faturado!");
          }
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    onSalesOrder: function (oEvent) {
      var iItem = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
      var sVbeln = oEvent.getSource().getParent().mAggregations.cells[0].mProperties.title + "&&&" + this.getView().getModel("OVModel").getData()
        .OVData[iItem].DescCliente.replace('/', '&&&&&');
      var status = [];
      status.push({
        status1: oEvent.getSource().getParent().mAggregations.cells[5].mProperties.src,
        status2: oEvent.getSource().getParent().mAggregations.cells[6].mProperties.src,
        status3: oEvent.getSource().getParent().mAggregations.cells[7].mProperties.src,
        status4: oEvent.getSource().getParent().mAggregations.cells[8].mProperties.src
      });
      this.oModelOV = new sap.ui.model.json.JSONModel();
      this.oModelOV.setData(status);
      sap.ui.getCore().setModel(this.oModelOV, "ov_exibir_dados");
      sessionStorage.setItem("Vbeln", sVbeln); // Usado na tela de Nota Fiscal
      this.getOwnerComponent().getRouter().navTo("Vendas", {
        mode: "Change",
        salesorder: sVbeln
      }, true);
    },

    onNavBack: function (oEvent) {
      this.handleClearFields();
      if(sessionStorage.getItem("sRetorno")) {
      this.getOwnerComponent().getRouter().navTo("CancelarFornecimento", { mode: "Change" }, true);
sessionStorage.removeItem("sRetorno");
sessionStorage.removeItem("sVbeln")
      }else{
      this.getOwnerComponent().getRouter().navTo("transporte", null, true);
      sessionStorage.removeItem("sVbeln")
      }
    },

    setInitalDateValue: function () {
      var date = this.getView().byId("input-dateEmitidas");
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
    },

    classColor: function (sStatus) {
      return (sStatus && sStatus.length > 0 ? "statusUiIcon" + sStatus : "");
    },

    statusText: function (Status) {
      var texto = "";
      if(Status){
      switch (Status.substr(0, 3)) {
      case "FL0":
        texto = "PENDENTE";
        break;
      case "FL1":
        texto = "PENDENTE";
        break;
      case "FL2":
        texto = "PENDENTE";
        break;
      case "FL3":
        texto = "FATURADO";
        break;
      case "CL0":
        texto = "IRRELEVANTE";
        break;
      case "CL1":
        texto = "DOC. LIBERADO";
        break;
      case "CL2":
        texto = "CRÉDITO RECUSADO";
        break;
      case "CL3":
        texto = "LIBERADO PARCIALMENTE";
        break;
      case "CL4":
        texto = "CRÉDITO LIBERADO";
        break;
      case "GL0":
        texto = "EM PROCESSAMENTO";
        break;
      case "GL1":
        texto = "VENDA CONCLUÍDA";
        break;
      case "GL2":
        texto = "RECUSADA";
        break;
      case "GL3":
        texto = "RECUSADA";
        break;
      case "LL0":
        texto = "IRRELEVANTE";
        break;
      case "LL1":
        texto = "PREÇO PREVISTO OK";
        break;
      case "LL2":
        texto = "PENDENTE LIBERAÇÃO";
        break;
      case "LL3":
        texto = "LIMBO LIBERADO";
        break;
      case "RL0":
        texto = "PENDENTE";
        break;
      case "RL1":
        texto = "AGUARDANDO";
        break;
      case "RL2":
        texto = "AGUARDANDO";
        break;
      case "RL3":
        texto = "FORNECIDO COMPLETAMENTE";
        break;
      case "RL4":
        texto = "FORNECIMENTO BLOQUEADO";
        break;
      default:
        break;
      }}else{texto = "IRRELEVANTE" }
      return texto;
    },

    status: function (Status) {
      var icone;
      if(Status){
      switch (Status.substr(0, 3)) {
      case "FL0":
        icone = "sap-icon://status-inactive";
        break;
      case "FL1":
        icone = "sap-icon://status-critical";
        break;
      case "FL2":
        icone = "sap-icon://status-critical";
        break;
      case "FL3":
        icone = "sap-icon://status-positive";
        break;
      case "CL0":
        icone = "sap-icon://status-inactive";
        break;
      case "CL1":
        icone = "sap-icon://status-positive";
        break;
      case "CL2":
        icone = "sap-icon://status-error";
        break;
      case "CL3":
        icone = "sap-icon://status-critical";
        break;
      case "CL4":
        icone = "sap-icon://status-positive";
        break;
      case "GL0":
        icone = "sap-icon://status-inactive";
        break;
      case "GL1":
        icone = "sap-icon://status-positive";
        break;
      case "GL2":
        icone = "sap-icon://status-error";
        break;
      case "GL3":
        icone = "sap-icon://status-error";
        break;
      case "LL0":
        icone = "sap-icon://status-inactive";
        break;
      case "LL1":
        icone = "sap-icon://status-positive";
        break;
      case "LL2":
        icone = "sap-icon://status-error";
        break;
      case "LL3":
        icone = "sap-icon://status-positive";
        break;
      case "RL0":
        icone = "sap-icon://status-inactive";
        break;
      case "RL1":
        icone = "sap-icon://status-critical";
        break;
      case "RL2":
        icone = "sap-icon://status-critical";
        break;
      case "RL3":
        icone = "sap-icon://status-positive";
        break;
      case "RL4":
        icone = "sap-icon://status-error";
        break;
      default:
        break;
      }}else{ icone = "sap-icon://status-inactive" }
      return icone;
    },

    onAddToken: function () {
      var oMultiInput = this.getView().byId("multiinput-ordem");
      var tokens = oMultiInput.getTokens();
      var value = oMultiInput.getValue();
      if (value !== "") {
        if ($.isNumeric(value)) {
          if (value.length <= 10) {
            oMultiInput.setValue("");
            var token = new Token({
              text: value,
              key: tokens.length + 1
            });
            oMultiInput.addToken(token);
          } else {
            MessageBox.error('Permitido no máximo 10 caracteres!', {
              title: "ArcelorMittal",
              styleClass: "sapUiSizeCompact"
            });
            return false;
          }
        } else {
          MessageBox.error('Valor informado deve ser numérico!', {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
          return false;
        }
      }
    },

    onSearchCombo: function (oEvent) {
      var aFilters = [];
      var oOVModelData = this.getView().getModel("OVModel").getData();
      if (oOVModelData.OVData.length > 0) {
        for (var sProperty in oOVModelData) {
          switch (sProperty) {
          case "GeralFilter":
            if (oOVModelData[sProperty].substring(1, 3) != "") {
              aFilters.push(new Filter("StatusGlobal", FilterOperator.EQ, oOVModelData[sProperty].substring(0, 3)));
            }
            break;
          case "LimboFilter":
            if (oOVModelData[sProperty].substring(1, 3) != "") {
              aFilters.push(new Filter("StatusLimbo", FilterOperator.EQ, oOVModelData[sProperty].substring(0, 3)));
            }
            break;
          case "CreditoFilter":
            if (oOVModelData[sProperty].substring(1, 3) != "") {
              aFilters.push(new Filter("StatusCred", FilterOperator.EQ, oOVModelData[sProperty].substring(0, 3)));
            }
            break;
          case "RemessaFilter":
            if (oOVModelData[sProperty].substring(1, 3) != "") {
              aFilters.push(new Filter("StatusReme", FilterOperator.EQ, oOVModelData[sProperty].substring(0, 3)));
            }
            break;
          case "FaturaFilter":
            if (oOVModelData[sProperty].substring(1, 3) != "") {
              aFilters.push(new Filter("StatusFatura", FilterOperator.EQ, oOVModelData[sProperty].substring(0, 3)));
            }
            break;
          default:
            break;
          }
        }
        if (aFilters.length > 0) {
          this.getView().byId("List").getBinding("items").filter(aFilters);
        } else {
          this.onSearch();
        }
      }
    },

    handleClearFields: function () {

      var filters = [];
      var list = this.getView().byId("List");
      var binding = list.getBinding("items");
      binding.filter(filters);
      this.getModel("OVModel").setData({});
      this.getModel("OVModel").refresh(true);
      this.byId("input-DtMerc1").setValue("");
    },

    onSearch: function () {
      this.byId("List").removeSelections();
      var thisView = this;
      var sVbeln = sessionStorage.getItem("sVbeln");
      var fornecimento = sessionStorage.getItem("sVbeg");
      var filters = [];
      var filter;
      var value;
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-DtMerc").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(true);
      this.byId("input-SIGNI1").setVisible(true);
      this.byId("input-DtMerc1").setVisible(true);
      this.byId("__panel1").setVisible(true);
      this.byId("__panel9").setVisible(false);

if(sVbeln){
      if (sVbeln.length > 0) {
        var ordem;
        ordem = sVbeln;
        filter = new sap.ui.model.Filter("Tknum", sap.ui.model.FilterOperator.BT, ordem, 'X');
        filters.push(filter);
      }}
      value = '2020-01-01';

      if (value !== "") {
        var from = value;
        if (from !== null) {
          var to = from;
          filter = new sap.ui.model.Filter("Data", sap.ui.model.FilterOperator.BT, from, to);
          filters.push(filter);
        } else {
          if (value.length == 0 || ordem.length == 0) {
            MessageBox.error('Informar data Emitidas no período.', {
              title: "ArcelorMittal",
              styleClass: "sapUiSizeCompact"
            });
            return false;
          }
        }
      }

      // Busca de Ordens de Venda
      if (filters.length == 0) {
        MessageToast.show("Preencher pelo menos um campo de seleção");
        return false;
      }
      this.getView().setBusy(true);
if(sessionStorage.getItem("sVbeg")){
this.byId("__panel1").setVisible(false);
this.byId("__panel9").setVisible(true);
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-DtMerc").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(false);
      this.byId("input-SIGNI1").setVisible(false);
      this.byId("input-DtMerc1").setVisible(false);
this.getView().byId("List").setVisible(false);
this.getView().byId("List2").setVisible(true  );
      this.byId("input-Tdnlr").setEnabled(false);
      this.byId("input-SIGNI").setEnabled(false);
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(false);
      this.byId("input-SIGNI1").setVisible(false);
      this.byId("button-maisOvs").setVisible(false);
      this.byId("button-salvarALt").setVisible(false);
      this.byId("button-liberarlimbo").setVisible(false);
      this.byId("button-alterar").setVisible(false);
      this.byId("button-MenosOvs").setVisible(false);
      this.byId("button-custo").setVisible(false);
      this.byId("button-atualizar").setVisible(true);
      this.byId("button-CancelALt").setVisible(false);
      this.byId("button-custoExcluir").setVisible(false);
      this.byId("button-excluirTransporte").setVisible(false);
filters = [];
          filter = new sap.ui.model.Filter("Vgbel", sap.ui.model.FilterOperator.EQ, sessionStorage.getItem("sVbeg"));
          filters.push(filter);
          var flag_ov = sessionStorage.getItem("sVbeg");
sessionStorage.removeItem("sVbeg")
if(flag_ov.length<10){
for(var i = 0; i<(10-flag_ov.length);i++){
flag_ov = '0'+flag_ov;
}
}
      this.getModel().read("/FornecimentoSet('" + flag_ov + "')", {
        urlParameters: {
          $expand: "ToItens"
        },
        success: function(oResultData, oResponse) {
       this.getView().byId("multiinput-remessa").setText(oResultData.Vbeln)
       var dia = oResultData.Lfdat.getDate().toString()+'/'+oResultData.Lfdat.getMonth().toString()+'/'+oResultData.Lfdat.getFullYear().toString();
       var result = [];
         this.getView().byId("input-dateEmitidas_remessa").setText(dia)
         this.getView().byId("input-dateEmitidas_ov").setText(oResultData.Vgbel)
         this.getView().setBusy(false);
/*
var resultado = {}
for(i = 0; i<oResultData.ToItens.results.length;i++ ){
resultado.Vgbel = oResultData.Vgbel
resultado.Fornecimento = oResultData.Vbeln
resultado.ItemFornecimento = oResultData.ToItens.results[i].DelivItem
resultado.Lfimg = oResultData.ToItens.results[i].DlvQty
resultado.Meins = oResultData.ToItens.results[i].Vrkme
//DMND0020093 - 14.06.2022 - FLS - Begin
resultado.Material = oResultData.ToItens.results[i].Material
resultado.Maktx = oResultData.ToItens.results[i].Maktx
//DMND0020093 - 14.06.2022 - FLS - End
result.push(resultado)
}
*/
          //DMND0020093 - 14.06.2022 - FLS - Begin
          for(i = 0; i<oResultData.ToItens.results.length;i++ ){
            var oResult = {};
            oResult.Vgbel = oResultData.Vgbel;
            oResult.Fornecimento = oResultData.Vbeln;
            oResult.ItemFornecimento = oResultData.ToItens.results[i].DelivItem;
            oResult.Lfimg = oResultData.ToItens.results[i].DlvQty;
            oResult.Meins = oResultData.ToItens.results[i].Vrkme;
            oResult.Material = oResultData.ToItens.results[i].Material;
            oResult.Maktx = oResultData.ToItens.results[i].Maktx;
            result.push(oResult);
          }
          //DMND0020093 - 14.06.2022 - FLS - End
          this.getModel("OVModel").setData({
            OVData: result
          });

        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    }else{

this.getView().byId("List").setVisible(true);
this.getView().byId("List2").setVisible(false);
  this.getModel().read("/transporteSet", {
        filters: filters,
        success: function (oSalesOrders) {
        this.getView().setBusy(false);
          this.byId("multiinput-ordem").setText(oSalesOrders.results[0].Tknum);
          this.byId("input-dateEmitidas").setText(this.strToDataBr2(oSalesOrders.results[0].Data))
          this.byId("input-TPLST").setText(oSalesOrders.results[0].Tplst)
          this.byId("input-Tdnlr").setValue(oSalesOrders.results[0].Tdlnr)
          this.byId("input-Tdnlr1").setText(oSalesOrders.results[0].Tdlnr);
          this.byId("input-SIGNI1").setText(oSalesOrders.results[0].Signi);

          this.byId("input-Tdnlr").setEnabled(false);
          this.byId("input-NAME1").setText(oSalesOrders.results[0].Name1)
          this.byId("input-SIGNI").setValue(oSalesOrders.results[0].Signi)
          this.byId("input-SIGNI").setEnabled(false);
          this.byId("input-ANTT").setText(oSalesOrders.results[0].Antt)
          this.byId("input-UF_ANTT").setText(oSalesOrders.results[0].UfAntt)
          this.byId("input-STTRG").setText(oSalesOrders.results[0].Sttrg)
          if (parseFloat(oSalesOrders.results[0].Sttrg) >= 5) {
            this.byId("button-liberarlimbo").setVisible(false);
            this.byId("button-alterar").setVisible(false);
            this.byId("button-MenosOvs").setVisible(false);
            this.byId("button-atualizar").setVisible(false);
          } else {
            this.byId("button-atualizar").setVisible(true);
            this.byId("button-liberarlimbo").setVisible(true);
            this.byId("button-alterar").setVisible(true);
            this.byId("button-MenosOvs").setVisible(true);
            this.byId("button-custo").setVisible(true);
          }
          this.byId("input-STATUS_DESC").setText(oSalesOrders.results[0].StatusDesc)
          var cod = '';

          if (oSalesOrders.results[0].CodDocCusto != '') {
            this.byId("button-custoExcluir").setVisible(true);
            this.byId("button-custo").setVisible(false);
            cod = parseFloat(oSalesOrders.results[0].CodDocCusto).toString();
          } else {
            this.byId("button-custoExcluir").setVisible(false);
            this.byId("button-custo").setVisible(true);
          };

          this.byId("input-CodDocCusto").setText(cod)
          this.byId("input-CustoTotal").setText(oSalesOrders.results[0].CustoTotal.toString().replace(".", ","));
          this.byId("input-Custofrete").setText(oSalesOrders.results[0].Custofrete.toString().replace(".", ","));
          this.byId("input-pesofrete").setText(oSalesOrders.results[0].PesoTotal.toString().replace(".", ","));
          this.getView().setBusy(false);

          for (var z = 0; z < oSalesOrders.results.length; z++) {
            oSalesOrders.results[z].ItemFornecimento = parseFloat(oSalesOrders.results[z].ItemFornecimento).toString();
            oSalesOrders.results[z].Vgpos = parseFloat(oSalesOrders.results[z].Vgpos).toString();
          }

          this.getModel("OVModel").setData({
            OVData: oSalesOrders.results
          });
          this.byId("button-maisOvs").setVisible(false);
          this.byId("button-salvarALt").setVisible(false);
          this.byId("button-CancelALt").setVisible(false)
          this.getModel("OVModel").refresh(true);
          this.getView().byId("List").getBinding("items").filter([]);
          this.onDisable();

        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);
          MessageBox.error('Erro ao buscar Ordens de Venda', {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        }.bind(this)
      });
    }
    },

    acharTransporta: function () {
      var tknum = this.byId("input-Tdnlr").getValue();
      var that = this;
      var sPathpag  =  "/transporte1Set(Tknum='" + tknum + "')";
      this.getModel().read(sPathpag, {
        success: function (oResult) {
          if (oResult.Tknum == '1000000001') {
            MessageToast.show("Transportador não encontrado.")

            that.byId("input-NAME1").setText(oResult.Name1);
            that.byId("input-Tdnlr").setValue("");
          } else {
            that.byId("input-Tdnlr").setValue(tknum);
            that.byId("input-Tdnlr1").setText(tknum);
            that.byId("input-NAME1").setText(oResult.Name1);
          }
        },
        error: function (oResult) {
          MessageToast.show("Transportadora nao existe.")
        },
      });

    },

    handleCustoPress: function () {
      var sVbeln = sessionStorage.getItem("sVbeln");
      var ordem = sVbeln;
      var filters = [];
      var filter = new sap.ui.model.Filter("Tknum", sap.ui.model.FilterOperator.BT, ordem, 'X');

      filters.push(filter);
      this.getView().setBusy(true);
      var texto = '';

      if (this.byId("input-CodDocCusto").getText() != "") {
        texto = "Deseja realmente excluir o cálculo do custo de frete?";
      } else {
        texto = "Deseja realmente calcular o custo de frete?";
      }

      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: texto
          })
        ]
      });

      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));

      var oview = this;
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().read("/transporteresSet", {
                filters: filters,
                success: function (odata) {
                  if (odata.results.length > 0) {
                    if (odata.results[0].Tknum == '1000000001') {
                      var hdrMessage = odata.results[0].StatusDesc;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.getView().setBusy(false);
                      return false;
                    }
                    if (odata.results[0].Tknum == '200LL00002') {
                      var hdrMessage = odata.results[0].StatusDesc + odata.results[0].Name1;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    } else {
                      var hdrMessage = odata.results[0].StatusDesc;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }
                  }
                }.bind(oview),
                error: function (oError) {
                  oview.getView().setBusy(false);
                  var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(hdrMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    handleAlterarPress: function () {
      this.byId("input-Tdnlr").setEnabled(true);
      this.byId("input-Tdnlr1").setVisible(false);
      this.byId("input-SIGNI1").setVisible(false);
      this.byId("input-Tdnlr").setVisible(true);
      this.byId("input-SIGNI").setVisible(true);
      this.byId("input-SIGNI").setEnabled(true);
      this.byId("button-maisOvs").setVisible(true);
      this.byId("button-salvarALt").setVisible(true);
      this.byId("button-liberarlimbo").setVisible(false);
      this.byId("button-alterar").setVisible(false);
      this.byId("button-MenosOvs").setVisible(false);
      this.byId("button-custo").setVisible(false);
      this.byId("button-atualizar").setVisible(false);
      this.byId("button-CancelALt").setVisible(true);
    },

    handleSalvarTransporte: function (oEvent) {
      var aOrdens = this.getView().getModel("OVModel").getData().OVData;
      aOrdens = aOrdens.filter((e) => { return e.cabecalho === "" }); 

      if (aOrdens.length === 0) {
        MessageBox.error("Nenhuma OV informada!");
            return;
          }

      MessageBox.confirm("Deseja atualizar transporte?", {
        title: "Confirmar",
        onClose: function (oAction) {
          if (oAction === "OK") {
            this._obtemFornecimentosOv(aOrdens);
          }
        }.bind(this),
        initialFocus: "CANCEL"
      });
    },

    _obtemFornecimentosOv: function(aOrdens) {
      var aFilters = [];

      aOrdens.map((e) => {
        var oFilter = new Filter("Vbeln", FilterOperator.EQ, e.Vgbel);
        aFilters.push(oFilter);
      });

      this.getModel().read("/FornecimentoOVSet", {
        filters: aFilters,
        success: function (oResult, oResponse) {
          this.getView().setBusy(false);
          var fornecimentos = oResult.results;

          if (fornecimentos.length === 0) {
            this.handleSalvar();
          } else {
                  var oModel = new sap.ui.model.json.JSONModel();
                  oModel.setData(fornecimentos);
                  
                  this.getView().setModel(oModel, "view");

                  if (!this._oDialogFornecimentoOV) {
                      this._oDialogFornecimentoOV = sap.ui.xmlfragment("arcelor.view.FornecimentoOV", this);
                  }
                  
                  this.getView().addDependent(this._oDialogFornecimentoOV);
            this._oDialogFornecimentoOV.open();
          }
        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    prosseguirDialogFornecimentoOV: function() {
      this.cancelarDialogFornecimentoOV();
      this.handleSalvar();
    },

    cancelarDialogFornecimentoOV: function() {
          if (this._oDialogFornecimentoOV) {
            this._oDialogFornecimentoOV.close();
          }
    },

    handleSalvar: function () {
      var oItemsSelected = this.getView().byId("List").getSelectedContexts();
      var oPayload = {};
      var ov = '';
      var sayings = new Map();

      oItemsSelected.forEach(function (oItem) {
        sayings.set(oItem.Ordem, oItem.Lfimg)
      })

      var oBillingData = this.getView().byId("List").getItems();
      oBillingData.forEach(function (oItem) {
        if (oItem.getCells()[2].getText() == "") {
          ov += oItem.getCells()[1].getValue() + ';'
        }
      })

      var sVbeln = sessionStorage.getItem("sVbeln");
      var ordem = sVbeln;
      var filters = [];
      var filter = new sap.ui.model.Filter("tknum", sap.ui.model.FilterOperator.EQ, ordem);
      filters.push(filter);
      var filter = new sap.ui.model.Filter("placa", sap.ui.model.FilterOperator.EQ, this.byId("input-SIGNI").getValue());
      filters.push(filter);
      var filter = new sap.ui.model.Filter("tipo", sap.ui.model.FilterOperator.EQ, 'Z');
      filters.push(filter);
      var filter = new sap.ui.model.Filter("transportadora", sap.ui.model.FilterOperator.EQ, this.byId("input-Tdnlr").getValue());
      filters.push(filter);
      var filter = new sap.ui.model.Filter("ov", sap.ui.model.FilterOperator.EQ, ov);
      filters.push(filter);

      this.getView().setBusy(true);
//      var box = new sap.m.VBox({
//        items: [
//          new sap.m.Text({
//            text: 'Deseja atualizar transporte?'
//          })
//        ]
//      });
//      box.setModel(new sap.ui.model.json.JSONModel({
//        message: ''
//      }));

      var oview = this;
//      sap.m.MessageBox.show(
//        box, {
//          icon: sap.m.MessageBox.Icon.INFORMATION,
//          title: "ArcelorMittal",
//          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
//          onClose: function (oAction) {
//            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().read("/transporteresMarcaSet", {
                filters: filters,
                success: function (odata) {
                  if (odata.results.length > 0) {
                    if (odata.results[0].tknum == '1000000001') {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.getView().setBusy(false);
                      return false;
                    }
                    if (odata.results[0].tknum == '200LL00002') {
                      var hdrMessage = odata.results[0].ov;
                      if (odata.results[0].ov.indexOf('Sucesso') != -1) {
                        hdrMessage = 'Processamento finalizado com sucesso'
                      }
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    } else {
                      var hdrMessage = odata.results[0].ov;
                      if (odata.results[0].ov.indexOf('Sucesso') != -1) {
                        hdrMessage = 'Processamento finalizado com sucesso'
                      }

                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }
                  }
                }.bind(oview),
                error: function (oError) {
                  oview.getView().setBusy(false);
                  var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(hdrMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                }.bind(oview)
              });
//            } else {
//              oview.getView().setBusy(false);
//            }
//          }
//        });

      this.byId("input-Tdnlr").setEnabled(false);
      this.byId("input-SIGNI").setEnabled(false);
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(true);
      this.byId("input-SIGNI1").setVisible(true);
      this.byId("button-maisOvs").setVisible(false);
      this.byId("button-salvarALt").setVisible(false);
      this.byId("button-liberarlimbo").setVisible(true);
      this.byId("button-alterar").setVisible(true);
      this.byId("button-MenosOvs").setVisible(true);
      this.byId("button-custo").setVisible(true);
      this.byId("button-atualizar").setVisible(true);
      this.byId("button-CancelALt").setVisible(false);
    },

    handleMaisOvs: function () {
      var oBillingData = this.getView().byId("List").getModel();
      this.getModel("OVModel").oData.OVData.push({
        cabecalho: "",
        Vgbel: "",
        enabled: true,
        Vgpos: "",
        Matnr: "",
        Arktx: "",
        Name1: "",
        Fornecimento: "",
        ItemFornecimento: "",
        Lfimg: "",
        Meins: "",
        NotaFiscal: "",
        visible: false,
        Custofrete: "",
        StatusFatura: "LL1",
        StatusGlobal: "LL1",
        StatusReme: "LL1"
      });
      this.getModel("OVModel").refresh(true)
    },

    handleCancelar: function () {
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(true);
      this.byId("input-SIGNI1").setVisible(true);
      this.onSearch();
    },

    handleAtualizarPress: function () {

      var oItemsSelected = this.getView().byId("List").getSelectedContexts();
      var oBillingData = this.getView().byId("List").getItems();
      var sayings = new Map();
            var oPayload = {};
      var ov = '';
      if(oItemsSelected.length ==0)
      {
      oItemsSelected = this.getView().byId("List2").getSelectedContexts();
       oBillingData = this.getView().byId("List2").getItems();

      oBillingData.forEach(function (oItem) {
        if (sayings.has(oItem.getCells()[1].getValue())) {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[7].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[4].getText() + ";X<>"
        } else {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[7].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[4].getText() + ";0<>"
        }
      })
      }
      else{

      oBillingData.forEach(function (oItem) {
        if (sayings.has(oItem.getCells()[1].getValue())) {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[8].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[2].getText() + ";X<>"
        } else {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[8].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[2].getText() + ";0<>"
        }
      })
      }


      oItemsSelected.forEach(function (oItem) {
        sayings.set(oItem.getObject().Vgbel, oItem.getObject().Lfimg)
      })




      var sVbeln = sessionStorage.getItem("sVbeln");
      if(!sVbeln){
      sVbeln='';
      }
      var ordem = sVbeln;
      var filters = [];
      var filter = new sap.ui.model.Filter("tknum", sap.ui.model.FilterOperator.EQ, ordem);
      filters.push(filter);
      var filter = new sap.ui.model.Filter("placa", sap.ui.model.FilterOperator.EQ, ordem);
      filters.push(filter);
      var filter = new sap.ui.model.Filter("tipo", sap.ui.model.FilterOperator.EQ, 'D');
      filters.push(filter);
      var filter = new sap.ui.model.Filter("transportadora", sap.ui.model.FilterOperator.EQ, 'D');
      filters.push(filter);
      var filter = new sap.ui.model.Filter("ov", sap.ui.model.FilterOperator.EQ, ov);
      filters.push(filter);

      this.getView().setBusy(true);
      if(this.getView().byId("List").getSelectedContexts().length>0){
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja atualizar transporte?'
          })
        ]
      });
      }else{
            var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja atualizar remessa?'
          })
        ]
      });
      }
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().read("/transporteresMarcaSet", {
                filters: filters,
                success: function (odata) {
                          if(oview.getView().byId("List2").getSelectedItem()){
                      sessionStorage.setItem("sVbeg", oview.getView().byId("List2").getSelectedItem().getCells()[3].getText());

                      }
                  if (odata.results.length > 0) {
                    if (odata.results[0].tknum == '1000000001') {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.getView().setBusy(false);
                      return false;
                    }
                    if (odata.results[0].tknum == '200LL00002') {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    } else {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });

                      oview.onSearch();
                    }
                  }
                }.bind(oview),
                error: function (oError) {
                  oview.getView().setBusy(false);
                  var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(hdrMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    handleLiberarLimboPress: function () {
      var sVbeln = sessionStorage.getItem("sVbeln");
      var ordem = sVbeln;
      var filters = [];
      var filter = new sap.ui.model.Filter("Tknum", sap.ui.model.FilterOperator.BT, ordem, 'X');
      filters.push(filter);

      var filter = new sap.ui.model.Filter("DTMERC", sap.ui.model.FilterOperator.BT, this.byId("input-DtMerc1").getValue(), 'X');
      filters.push(filter);

      this.getView().setBusy(true);
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente faturar transporte?'
          })
        ]
      });

      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));

      var oview = this;
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().read("/faturatransporteSet", {
                filters: filters,
                success: function (odata) {
                  if (odata.results.length > 0) {
                    if (odata.results[0].Tknum == '1000000001') {
                      var hdrMessage = odata.results[0].StatusDesc + odata.results[0].Name1;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.getView().setBusy(false);
                      return false;
                    }
                    if (odata.results[0].Tknum == '200LL00002') {
                      var hdrMessage = odata.results[0].StatusDesc + odata.results[0].Name1;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    } else {
                      l_ovs = odata.results;
                      var ov = l_ovs[0].Vgbel;
                      l_ovs.shift();
                      var dtmerc = this.byId("input-DtMerc1").getValue();
                      oview._loadSalesOrder(ov, dtmerc)
                    }
                  }
                }.bind(oview),
                error: function (oError) {
                  oview.getView().setBusy(false);
                  var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(hdrMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    strToDataBr2: function (sValue) {
      if (null != sValue && sValue.toString().length > 0) {
        try {
          var newDate = new Date(sValue);
          return newDate.toLocaleDateString(newDate);
        } catch (err) {
          //console.log(err.message);
        }
      }
      return "";
    },

    handleSearchClientes: function (oEvent) {
      this.onSearchClientes(oEvent, 'W');
    },

    handleOkboletoPress: function () {
      if (sap.ui.getCore().byId("idStartDate").getDateValue()) {
        var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
        sessionStorage.setItem("Vbeln", aSelectedContexts[0].getObject().Ordem);
        sessionStorage.setItem("Vdata", sap.ui.getCore().byId("idStartDate").getDateValue());
        valueHelpDialogData.close();
        this.aAllFilters = [];
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd/MM/yyyy"
        });
        var date_time = sap.ui.getCore().byId("idStartDate").getDateValue()
        var subFromDate = oDateFormat.format(new Date(date_time));
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem);
        this.aAllFilters.push(this.oFilter);
        this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
        this.getModel().read("/GerarBoletoOvSet", {
          filters: this.aAllFilters,
          success: function (oData) {
            if (oData.results.length > 0) {
              var mapForm = document.createElement("form");
              mapForm.target = "Map";
              mapForm.acceptCharset = "iso-8859-1";
              mapForm.method = "POST";
              mapForm.action = "http://bms317/ConsultasBelgoNetQA/ScriptsArcelorMittal/boleto_vendas.asp";
              var mapInput = document.createElement("input");
              mapInput.type = "text";
              mapInput.name = "NAME";
              mapInput.value = oData.results[0].Name1;
              mapForm.appendChild(mapInput);
              var mapInput1 = document.createElement("input");
              mapInput1.type = "text";
              mapInput1.name = "BLDAT";
              mapInput1.value = oData.results[0].Bldat.substring(6, 8) + '/' + oData.results[0].Bldat.substring(4, 6) + '/' + oData.results[
                0].Bldat.substring(0, 4);
              mapForm.appendChild(mapInput1);
              var mapInput2 = document.createElement("input");
              mapInput2.type = "text";
              mapInput2.name = "XBLNR";
              mapInput2.value = oData.results[0].Xblnr;
              mapForm.appendChild(mapInput2);
              var mapInput3 = document.createElement("input");
              mapInput3.type = "text";
              mapInput3.name = "BUZEI";
              mapInput3.value = oData.results[0].Buzei;
              mapForm.appendChild(mapInput3);
              var mapInput4 = document.createElement("input");
              mapInput4.type = "text";
              mapInput4.name = "DMBTR";
              mapInput4.value = oData.results[0].Dmbtr;
              mapForm.appendChild(mapInput4);
              var mapInput5 = document.createElement("input");
              mapInput5.type = "text";
              mapInput5.name = "STRAS";
              mapInput5.value = oData.results[0].Stras;
              mapForm.appendChild(mapInput5);
              var mapInput6 = document.createElement("input");
              mapInput6.type = "text";
              mapInput6.name = "ANFAE";
              mapInput6.value = oData.results[0].Anfae.substring(6, 8) + '/' + oData.results[0].Anfae.substring(4, 6) + '/' + oData.results[
                0].Anfae.substring(0, 4);
              mapForm.appendChild(mapInput6);
              var mapInput7 = document.createElement("input");
              mapInput7.type = "text";
              mapInput7.name = "LAUFD";
              mapInput7.value = oData.results[0].Laufd.substring(6, 8) + '/' + oData.results[0].Laufd.substring(4, 6) + '/' + oData.results[
                0].Laufd.substring(0, 4);
              mapForm.appendChild(mapInput7);
              var mapInput8 = document.createElement("input");
              mapInput8.type = "text";
              mapInput8.name = "PSTLZ";
              mapInput8.value = oData.results[0].Pstlz;
              mapForm.appendChild(mapInput8);
              var mapInput9 = document.createElement("input");
              mapInput9.type = "text";
              mapInput9.name = "ORT01";
              mapInput9.value = oData.results[0].Ort01;
              mapForm.appendChild(mapInput9);
              var mapInput10 = document.createElement("input");
              mapInput10.type = "text";
              mapInput10.name = "STCD1";
              mapInput10.value = oData.results[0].Stcd1;
              mapForm.appendChild(mapInput10);
              var mapInput11 = document.createElement("input");
              mapInput11.type = "text";
              mapInput11.name = "UBKNT";
              mapInput11.value = oData.results[0].Ubknt;
              mapForm.appendChild(mapInput11);
              var mapInput12 = document.createElement("input");
              mapInput12.type = "text";
              mapInput12.name = "UBKON";
              mapInput12.value = oData.results[0].Ubkon;
              mapForm.appendChild(mapInput12);
              var mapInput13 = document.createElement("input");
              mapInput13.type = "text";
              mapInput13.name = "UBKON_AUX";
              mapInput13.value = oData.results[0].UbkonAux;
              mapForm.appendChild(mapInput13);
              var mapInput14 = document.createElement("input");
              mapInput14.type = "text";
              mapInput14.name = "UBNKL";
              mapInput14.value = oData.results[0].Ubnkl;
              mapForm.appendChild(mapInput14);
              var mapInput15 = document.createElement("input");
              mapInput15.type = "text";
              mapInput15.name = "BARCODE";
              mapInput15.value = oData.results[0].Barcode;
              mapForm.appendChild(mapInput15);
              var mapInput16 = document.createElement("input");
              mapInput16.type = "text";
              mapInput16.name = "NOSSO";
              mapInput16.value = oData.results[0].Nosso;
              mapForm.appendChild(mapInput16);
              var mapInput17 = document.createElement("input");
              mapInput17.type = "text";
              mapInput17.name = "CARTEIRA";
              mapInput17.value = oData.results[0].Carteira;
              mapForm.appendChild(mapInput17);
              var mapInput18 = document.createElement("input");
              mapInput18.type = "text";
              mapInput18.name = "JUROS";
              mapInput18.value = oData.results[0].Juros;
              mapForm.appendChild(mapInput18);
              var mapInput19 = document.createElement("input");
              mapInput19.type = "text";
              mapInput19.name = "CEDENTE";
              mapInput19.value = oData.results[0].Cedente;
              mapForm.appendChild(mapInput19);
              var mapInput20 = document.createElement("input");
              mapInput20.type = "text";
              mapInput20.name = "VENC";
              mapInput20.value = oData.results[0].Venc.substring(6, 8) + '/' + oData.results[0].Venc.substring(4, 6) + '/' + oData.results[
                0].Venc.substring(0, 4);
              mapForm.appendChild(mapInput20);
              var mapInput21 = document.createElement("input");
              mapInput21.type = "text";
              mapInput21.name = "CIP";
              mapInput21.value = oData.results[0].Cip;
              mapForm.appendChild(mapInput21);
              var mapInput22 = document.createElement("input");
              mapInput22.type = "text";
              mapInput22.name = "INSTRUCAO";
              mapInput22.value = oData.results[0].Instrucao;
              mapForm.appendChild(mapInput22);
              var mapInput23 = document.createElement("input");
              mapInput23.type = "text";
              mapInput23.name = "INSTRUCAO2";
              mapInput23.value = oData.results[0].Instrucao2;
              mapForm.appendChild(mapInput23);
              var mapInput24 = document.createElement("input");
              mapInput24.type = "text";
              mapInput24.name = "HBKID";
              mapInput24.value = oData.results[0].Hbkid;
              mapForm.appendChild(mapInput24);
              var mapInput25 = document.createElement("input");
              mapInput25.type = "text";
              mapInput25.name = "empresa";
              mapInput25.value = oData.results[0].Bukrs;
              mapForm.appendChild(mapInput25);
              var mapInput26 = document.createElement("input");
              mapInput26.type = "text";
              mapInput26.name = "ABATIMENTO";
              mapInput26.value = oData.results[0].Abatimento;
              mapForm.appendChild(mapInput26);
              var mapInput27 = document.createElement("input");
              mapInput27.type = "text";
              mapInput27.name = "TXT_ABATIM";
              mapInput27.value = oData.results[0].TxtAbatim;
              mapForm.appendChild(mapInput27);
              var mapInput28 = document.createElement("input");
              mapInput28.type = "hidden";
              mapInput28.name = "ENDERECO";
              mapInput28.value = oData.results[0].Zendereco;
              mapForm.appendChild(mapInput28);
              var mapInput28 = document.createElement("input");
              mapInput28.type = "text";
              mapInput28.name = "CNPJ";
              mapInput28.value = oData.results[0].Zcnpj;
              mapForm.appendChild(mapInput28);
              mapForm.appendChild(mapInput23);
              document.body.appendChild(mapForm);
              mapForm.submit();
            } else {
              MessageToast.show("Sem dados para criação do boleto");
            }
          },
          error: function (oError) {
            MessageToast.show(oError);
          }
        });
        valueHelpDialogData.destroy();
      } else {
        MessageToast.show("Selecione uma data");
      }
    },
    onSearchClientes: function (oEvent, tipo) {
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
        filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, tipo));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    handleValueHelp: function (oEvent) {
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

      jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
      // create a filter for the bindinghandleValueHelp
      var filters = [];
      filters.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, 'W'));
      this._oDialog.getBinding("items").filter(filters);
      // open value help dialog filtered by the input value
      this._oDialog.open(sInputValue);
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

    handleFecharPress: function () {
      this._oDialog.close();
      this._oDialog.destroy();
    },

    handleExibirFluxoPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      var view = this;
      var onSuccess = function (odata) {
        var oModel = new JSONModel($.parseJSON(odata.results[0].json));
        if (view._oDialog) {
          view._oDialog.destroy();
        }
        view._oDialog = sap.ui.xmlfragment("arcelor.view.remessa", view);
        view._oDialog.setModel(oModel);
        view._oDialog.open();
      };
      var onError = function (odata) {}
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          var aFilters = [];
          aFilters.push(new Filter("ordem", FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem));
          var oview = this;
          this.getModel().read("/FloxoOvSet", {
            filters: aFilters,
            success: onSuccess,
            error: onError
          });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    handleEliminarOVPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          MessageBox.confirm('Confirma a eliminação da OV?', {
            title: 'Confirmar',
            onClose: function (oAction) {
              if (oAction == 'OK') {
                var sPath = aSelectedContexts[0].getPath();
                var oObject = aSelectedContexts[0].getModel().getProperty(sPath);
                this._eliminarOV(oObject.Ordem);
              }
            }.bind(this),
            initialFocus: 'CANCEL'
          });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    _eliminarOV: function (sVbeln) {
      this.getView().setBusy(true);
      var oParameters = {
        Vbeln: sVbeln
      };
      this.getModel().callFunction("/EliminarOV", {
        method: "GET",
        urlParameters: oParameters,
        success: function (oData) {
          this.getView().setBusy(false);
          MessageBox.information(oData.Message, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
          this.onSearch();
        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },
    
    /*
    DMND0020540 - 08.02.2022 - FLS
    Button exluir transporte
    */
    handleTransporteExcluir: function(){
      MessageBox.confirm('Confirma a eliminação do transporte ?', {
        title: 'Confirmar',
        onClose: function (oAction) {
          if (oAction == 'OK') {
            var sTknum = sessionStorage.getItem("sVbeln");
            this._excluirTransporte(sTknum);
          }
        }.bind(this),
        initialFocus: 'CANCEL'
      });
    },
    
    /*
    DMND0020540 - 08.02.2022 - FLS
    Button exluir transporte
    */
    _excluirTransporte: function(sTknum){
      this.getView().setBusy(true);
      var oParameters = {
        Tknum: sTknum
      };
      this.getModel().callFunction("/ExcluirTransporte", {
        method: "GET",
        urlParameters: oParameters,
        success: function (oData) {
          this.getView().setBusy(false);
          MessageBox.information(oData.Message, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
          this.onSearch();
        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    handleLiberarParaRemessaPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          var oData = {
            "ordem": aSelectedContexts[0].getObject().Ordem
          };
          this.getView().setBusy(true);
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente liberar remessa para OV?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview.getModel().create("/RemessaPOvSet", oData, {
                    success: function (oCreatedEntry, success) {
                      oview.getView().setBusy(false);
                      var hdrMessage = success.data.retorno;
                      var sMessage = hdrMessage;
                      MessageBox.show(sMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }.bind(oview),
                    error: function (oError) {
                      oview.getView().setBusy(false);
                      var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }.bind(oview)
                  });
                } else {
                  oview.getView().setBusy(false);
                }
              }
            });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    handleLiberarRemessaPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          var oData = {
            "ordem": aSelectedContexts[0].getObject().Ordem
          };
          this.getView().setBusy(true);
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente liberar remessa?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview.getModel().create("/RemessaSet", oData, {
                    success: function (oCreatedEntry, success) {
                      oview.getView().setBusy(false);
                      var hdrMessage = success.data.retorno;
                      var sMessage = hdrMessage;
                      var n = sMessage.includes('Erro');
                      var n = sMessage.includes('Erro');
                      if (!n) {
                        MessageBox.information(sMessage, {
                          title: "ArcelorMittal",
                          styleClass: "sapUiSizeCompact"
                        });
                        oview.onSearch();
                      } else {
                        MessageBox.error(sMessage, {
                          title: "ArcelorMittal",
                          styleClass: "sapUiSizeCompact"
                        });
                      }
                    }.bind(oview),
                    error: function (oError) {
                      oview.getView().setBusy(false);
                      var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                    }.bind(oview)
                  });
                } else {
                  oview.getView().setBusy(false);
                }
              }
            });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    _loadSalesOrder: function (sOrder, dtmerc) {
      this.getView().setBusy(true);
      var l_test = "K";
      this.getModel().metadataLoaded().then(function () {
        var sKey = this.getModel().createKey("/SalesOrderSet", {
          Ordem: sOrder
        });
        this.getModel().read(sKey, {
          urlParameters: {
            "$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
          },
          success: function (oData) {
            if (l_test != "K") {
              this.getView().setBusy(false);
              return;
            } else {
              l_test = "N";
            }
            var oModelData = this.getModel("SalesModel").getData();
            this.getView().setBusy(false);
            oModelData.SalesItems = [];
            oModelData.SalesOrder = oData.Ordem;
            oModelData.DtMerca = dtmerc;
            oData.SalesOrderItemSetNavig.results.forEach(function (oItem) {
              this._loadMaterialData("CU;UN;FR", oItem.Material.toString()).then(function (oDataHelper) {
                var aMeasureHelper = [];
                var aPlantBaseHelper = [];
                var aPlantHelper = [];
                var aFreightHelper = [];
                var validado = '0';
                oModelData.CarrierFreightHelper = aFreightHelper;
                oModelData.SalesItems.push({
                  Item: oItem.Item,
                  Material: oItem.Material,
                  Descricao: oItem.Descricao,
                  Estque: oItem.Estoque.replace(".", ","),
                  Qtd: parseFloat(oItem.Quantidade).toString().replace(".", ","),
                  Unidade: oItem.UnidadeMedida,
                  PrecoTbSemIPI: oItem.ValPrecoT,
                  Fisico: oItem.Fisico.replace(".", ","),
                  PrecoNegComIPI: oModelData.Mode === "Copy" ? 0 : oItem.PrCIpi,
                  Markup: oModelData.Mode === "Copy" ? 0 : oItem.ValZmkp,
                  PrecoNegSemIPI: oItem.PrecoUnitSugerido,
                  DescPercentual: oItem.ValZvnd,
                  ValorTotItem: oModelData.Mode === "Copy" ? 0 : oItem.ValorTotalItem,
                  PrecoTarget: oModelData.Mode === "Copy" ? 0 : oItem.VlPrecoTarget,
                  ValorST: oModelData.Mode === "Copy" ? 0 : oItem.ValSt,
                  Centro: oItem.Centro,
                  Frete: oItem.Frete,
                  ItemPedidoCliente: oItem.Pedido,
                  Deleted: false,
                  Lote: oItem.Lote,
                  UnitHelper: aMeasureHelper,
                  PlantHelper: aPlantHelper,
                  FreightHelper: aFreightHelper,
                  Editable: false,
                  Cepok: oModelData.Mode === "Copy" ? "" : oItem.Cepok === "B" ? "Não Ok" : "Ok"
                });
                this.getModel("SalesModel").refresh(true);
              }.bind(this));
              this.getModel("SalesModel").refresh(true);
            }.bind(this));

            // Lotes Disponíveis
            oModelData.SalesCharges = [];
            oData.SalesOrderToAvailability.results.forEach(function (oItemCharg) {
              oModelData.SalesCharges.push({
                Item: oItemCharg.Item,
                Lote: oItemCharg.Lote,
                Quantidade: oItemCharg.Quantidade
              });
            });
            this.getModel("SalesModel").refresh(true);
            this._geraRemessa1(sOrder);
          }.bind(this)
        });
      }.bind(this));
    },

    _loadMaterialData: function (sQuery, sMaterial) {
      return new Promise(function (fnResolve, fnReject) {
        var aFilters = [];
        aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, sQuery));
        aFilters.push(new Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial));
        this.getModel().read("/DM_DadoMestreOVSet", {
          filters: aFilters,
          success: function (oData) {
            fnResolve(oData);
          },
          error: function (oError) {
            fnReject(oError);
          }
        });
      }.bind(this));
    },

    _geraRemessa1: function (sSalesOrder) {
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        OrdemVenda: sSalesOrder,
        TpExecucao: "L"
      };
      var oview = this;
      var remessa_false = "";
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function (oData) {
          oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
            if (oResponse.headers["custom-return"]) {
              var aMessage = [];
              var sIconType = "";
              var sIconColor = "";
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
              if (!oBillingReturn.fornecimento) {
                var sMessage = oview._convertMessage(oBillingReturn.message);
                aMessage = sMessage.split("-");
                aMessage[0] = aMessage[0].trim();
                if (aMessage.length > 1) {
                  aMessage[1] = aMessage[1].replace(/^\s+/, "");
                }
                if (aMessage[0] == "S") {
                  oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
                } else {
                  sap.m.MessageToast.show(aMessage[1]);
                  oview.getView().setBusy(false);
                  remessa_false = "X";
                  return false;
                }
              } else {
                oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
              }
            }
          });
          if (remessa_false == "X") {
            return false;
          }
          this.getView().setBusy(false);
          this.getView().getModel("BillingModel").refresh(true);
          this._openChargControl();
        }.bind(this),
        error: function () {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
    },
    _openChargControl: function () {
      this.getView().getModel("BillingModel").refresh(true);

      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oSalesData = this.getModel("SalesModel").getData();
      // Filtro de Itens
      var oItem4Charg = oSalesData.SalesItems.filter(function (oItem) {
        return oItem.Lote;
      });
      // Matriz de Controle de Itens x Quantidade x Disponibilidade
      oBillingData.ChargItems = [];
      oItem4Charg.forEach(function (oItem) {
        oBillingData.ChargItems.push({
          Item: oItem.Item,
          Material: oItem.Material,
          Descricao: oItem.Descricao,
          Quantidade: oItem.Qtd,
          Centro: oItem.Centro,
          Unidade: oItem.Unidade,
          AvailableQuantity: oItem.Qtd,
          Attribuition: []
        });
        oBillingData.ChargItems[oBillingData.ChargItems.length - 1].Lotes = oSalesData.SalesCharges.filter(function (oSalesCharg) {
          return oSalesCharg.Item === oItem.Item;
        });
      });
      oBillingData.ItemPointer = 0;
      oBillingData.MaxItems = oItem4Charg.length - 1;
      this.getView().getModel("BillingModel").refresh(true);
      oBillingData.CurrentItem = this._getItemCharg(0);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
      this._getChargDialog().open();
    },

    _getChargDialog: function () {
      if (!this._oChargDialog) {
        this._oChargDialog = sap.ui.xmlfragment("arcelor.view.FaturamentoLote", this);
        this.getView().addDependent(this._oChargDialog);
      }
      return this._oChargDialog;
    },

    onAddCharg: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (!oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition = [];
      }
      // Validação da Quantidade
      var fQuantity = parseFloat(oBillingData.CurrentItem.Quantity.replace(",", "."));
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", "."));
      if (fQuantity > 0) {
        if (fQuantity <= fAvalbQty) {
          if (fQuantity <= parseFloat(oBillingData.CurrentItem.ChargAvailability)) {
            oBillingData.CurrentItem.Attribuition.push({
              Charg: oBillingData.CurrentItem.Charg,
              Lgort: oBillingData.CurrentItem.Centro,
              Available: oBillingData.CurrentItem.ChargAvailability,
              Quantity: fQuantity
            });
            this._recalcQuantity2Insert();
            this.getView().getModel("BillingModel").refresh(true);
          } else {
            MessageBox.error("Quantidade deve ser menor ou igual a quantidade lote");
          }
        } else {
          MessageBox.error("Quantidade deve ser menor ou igual a quantidade disponível");
        }
      } else {
        MessageBox.error("Quantidade deve ser maior que zero");
      }
    },

    onDeleteCharg: function (oEvent) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oItem = oEvent.getSource().getParent();
      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oItem);
      oBillingData.CurrentItem.Attribuition.splice(iIndex, 1);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
    },

    onPreviousItem1: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer > 0) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer -= 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    onNextItem1: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer < oBillingData.MaxItems) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer += 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    onFinishCharg: function () {
      // Valida se há algum item a ser validado
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oSalesData = this.getModel("SalesModel").getData();
      var bInvalid = oBillingData.ChargItems.some(function (oItem) {
        return oItem.AvailableQuantity > 0;
      });
      if (!bInvalid) {
        if (this._checkCurrentItem()) {
          var aSalesBatches = [];
          oBillingData.ChargItems.forEach(function (oItem) {
            oItem.Attribuition.forEach(function (oChargItem) {
              aSalesBatches.push({
                Item: oItem.Item,
                Id: oChargItem.Charg,
                Quantidade: oChargItem.Quantity,
                Unidade: oItem.Unidade
              });
            });
          });
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente faturar ordem?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          this.getView().setBusy(true);
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview._createBillingDocument(oSalesData.SalesOrder, aSalesBatches, oSalesData.DtMerca);
                } else {}
              }
            });
        }
      } else {
        MessageBox.error("Ainda há itens a serem corrigidos");
      }
    },

    onCancelCharg: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        TpExecucao: "D",
        Remessa: oBillingData.Remessa
      };
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function (oData) {
          this.getView().setBusy(false);
        }.bind(this),
        error: function () {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
      this._getChargDialog().close();
    },

    handleLiberarCreditoPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          var oData = {
            "Ordemvenda": aSelectedContexts[0].getObject().Ordem
          };
          this.getView().setBusy(true);
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente liberar crédito?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview.getModel().create("/LiberarCreditoOVSet", oData, {
                    success: function (oCreatedEntry, success) {
                      oview.getView().setBusy(false);
                      var hdrMessage = success.headers["sap-message"];
                      var hdrMessageObject = JSON.parse(hdrMessage);
                      var sMessage = hdrMessageObject.message;
                      MessageBox.information(sMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }.bind(oview),
                    error: function (oError) {
                      oview.getView().setBusy(false);
                      var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                    }.bind(oview)
                  });
                } else {
                  oview.getView().setBusy(false);
                }
              }
            });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    _getItemCharg: function (iItem) {
      this.getView().getModel("BillingModel").refresh(true);
      var oItem = this.getView().getModel("BillingModel").getData().ChargItems[iItem];
      oItem.MaterialOut = oItem.Material.replace(oItem.Material.match("^0+(?!$)"), "");
      oItem.ChargAvlVisible = false;
      return this.getView().getModel("BillingModel").getData().ChargItems[iItem];
    },

    faturarLote: function (item) {
      var oPayload = {};
      var oview = this;
      this.getModel().metadataLoaded().then(function () {
        var sKey = this.getModel().createKey("/SalesOrderSet", {
          Ordem: item[0].getObject().Ordem
        });
        this.getModel().read(sKey, {
          urlParameters: {
            "$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
          },
          success: function (oData) {
            var bBatchControl = oData.SalesOrderItemSetNavig.results.some(function (oItem) {
              return oItem.Lote
            });
            if (bBatchControl) {
              this._geraRemessa(item[0].getObject().Ordem, oData.SalesOrderItemSetNavig.results, oData.SalesOrderToAvailability.results);
            } else {
              var sGroupId = "1",
                sChangeSetId = "Create";
              oview.getView().getModel().setDeferredGroups([sGroupId]);
              item.forEach(function (oItem) {
                var oObject = oItem.getObject();
                oPayload = {
                  OrdemVenda: oObject.Ordem,
                  TpExecucao: "C"
                };
                oview.getView().getModel().create("/FaturamentoSet", oPayload, {
                  groupId: sGroupId
                }, {
                  changeSetId: sChangeSetId
                });
              }.bind(oview));
              oview.getView().setBusy(true);
              oview.getView().getModel().submitChanges({
                groupId: sGroupId,
                changeSetId: sChangeSetId,
                success: function (oData) {
                  this.getView().setBusy(false);
                  var oBillingData = this.getView().getModel("BillingModel").getData();
                  oBillingData.Log = [];

                  oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
                    if (oResponse.headers["custom-return"]) {
                      var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
                      var aMessage = [];
                      var sIconType = "";
                      var sIconColor = "";
                      if (oBillingReturn.message.length > 0) {
                        var sMessage = this._convertMessage(oBillingReturn.message);
                        aMessage = sMessage.split("-");
                        aMessage[0] = aMessage[0].trim();
                        if (aMessage.length > 1) {
                          aMessage[1] = aMessage[1].replace(/^\s+/, "");
                        }
                        switch (aMessage[0]) {
                        case "S":
                          sIconType = "sap-icon://status-positive";
                          sIconColor = "L1";
                          break;
                        case "I":
                          sIconType = "sap-icon://status-inactive";
                          sIconColor = "L0";
                          break;
                        case "W":
                          sIconType = "sap-icon://status-critical";
                          sIconColor = "L2";
                          break;
                        case "E":
                          sIconType = "sap-icon://status-error";
                          sIconColor = "L3";
                          break;
                        }
                      }
                      oBillingData.Log = [];
                      oBillingData.Log.push({
                        SalesOrder: oBillingReturn.numOrdem,
                        DeliveryDocument: (oBillingReturn.fornecimento ? oBillingReturn.fornecimento : ""),
                        BillingDocument: (oBillingReturn.fatura ? oBillingReturn.fatura : ""),
                        FiscalNote: (oBillingReturn.notaFiscal ? oBillingReturn.notaFiscal : ""),
                        MessageType: sIconType,
                        MessageColor: sIconColor,
                        Message: (aMessage[1] ? aMessage[1] : "")
                      });
                    }
                  }.bind(oview));
                  oview.getView().getModel("BillingModel").refresh(true);
                  oview._getBillingLogDialog().open();
                }.bind(oview),
                error: function () {
                  oview.getView().setBusy(false);
                }.bind(this)
              }, oview);
            }
          }.bind(this),
          error: function (error) {
            alert(error);
          }
        });
      }.bind(this));
    },

    _geraRemessa: function (sSalesOrder, itens, lotes) {
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        OrdemVenda: sSalesOrder,
        TpExecucao: "L"
      };
      var oview = this;
      var remessa_false = "";
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function (oData) {
          oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
            if (oResponse.headers["custom-return"]) {
              var aMessage = [];
              var sIconType = "";
              var sIconColor = "";
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
              if (!oBillingReturn.fornecimento) {
                var sMessage = oview._convertMessage(oBillingReturn.message);
                aMessage = sMessage.split("-");
                aMessage[0] = aMessage[0].trim();
                if (aMessage.length > 1) {
                  aMessage[1] = aMessage[1].replace(/^\s+/, "");
                }
                if (aMessage[0] == "S") {
                  oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
                } else {
                  sap.m.MessageToast.show(aMessage[1]);
                  oview.getView().setBusy(false);
                  remessa_false = "X";
                  return false;
                }
              } else {
                oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
              }
            }
          });
          if (remessa_false == "X") {
            return false;
          }
          this.getView().setBusy(false);
          this.getView().getModel("BillingModel").refresh(true);
          this._openChargControl(itens, lotes);
        }.bind(this),
        error: function () {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
    },

    _openChargControl1: function (itens, lotes) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      // Filtro de Itens 
      var oItem4Charg = itens.filter(function (oItem) {
        return oItem.Lote;
      });
      // Matriz de Controle de Itens x Quantidade x Disponibilidade 
      oBillingData.ChargItems = [];
      oItem4Charg.forEach(function (oItem) {
        oBillingData.ChargItems.push({
          Item: oItem.Item,
          Material: oItem.Material,
          Descricao: oItem.Descricao,
          Quantidade: oItem.Quantidade,
          Centro: oItem.Centro,
          Unidade: oItem.UnidadeMedida,
          AvailableQuantity: oItem.Quantidade,
          Attribuition: []
        });
        oBillingData.ChargItems[oBillingData.ChargItems.length - 1].Lotes = lotes.filter(function (oSalesCharg) {
          return oSalesCharg.Item === oItem.Item;
        });
      });
      oBillingData.ItemPointer = 0;
      oBillingData.MaxItems = oItem4Charg.length - 1;
      oBillingData.CurrentItem = this._getItemCharg(0);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
      this._getChargDialog().open();
    },

    _getChargDialog1: function () {
      if (!this._oChargDialog) {
        this._oChargDialog = sap.ui.xmlfragment("arcelor.view.FaturamentoLote", this);
        this.getView().addDependent(this._oChargDialog);
      }
      return this._oChargDialog;
    },

    onPreviousItem: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer > 0) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer -= 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    onNextItem: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer < oBillingData.MaxItems) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer += 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    onFinishCharg1: function () {
      // Valida se há algum item a ser validado
      var oBillingData = this.getView().getModel("BillingModel").getData();
      //var oSalesData = this.getModel("SalesModel").getData();
      var bInvalid = oBillingData.ChargItems.some(function (oItem) {
        return oItem.AvailableQuantity > 0;
      });
      if (!bInvalid) {
        if (this._checkCurrentItem()) {
          var aSalesBatches = [];
          oBillingData.ChargItems.forEach(function (oItem) {
            oItem.Attribuition.forEach(function (oChargItem) {
              aSalesBatches.push({
                Item: oItem.Item,
                Id: oChargItem.Charg,
                Quantidade: oChargItem.Quantity,
                Unidade: oItem.Unidade
              });
            });
          });
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente faturar ordem?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          this.getView().setBusy(true);
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function (oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview._createBillingDocument(oBillingData.CurrentItem.Lotes[0].OrdemVenda, aSalesBatches);
                } else {}
              }
            });
        }
      } else {
        MessageBox.error("Ainda há itens a serem corrigidos");
      }
    },

    _createBillingDocument: function (sSalesOrder, aSalesBatches, sDataMercadoria) {
      var sGroupId = "1",
        sChangeSetId = "Create";
      this._getChargDialog().setBusy(true);
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oBillingData1 = this.getView().getModel("BillingModel").getData();
      if (!oBillingData1.Remessa) {
        var oPayload = {
          OrdemVenda: sSalesOrder,
          TpExecucao: "C",
          Mercadoria: sDataMercadoria
        };
      } else {
        var oPayload = {
          OrdemVenda: sSalesOrder,
          TpExecucao: "F",
          Remessa: oBillingData1.Remessa,
          Mercadoria: sDataMercadoria
        };
      };
      if (aSalesBatches && aSalesBatches.length > 0) {
        oPayload.ToLote = [];
        aSalesBatches.forEach(function (oItemBatch) {
          oPayload.ToLote.push({
            Item: oItemBatch.Item,
            Id: oItemBatch.Id,
            Quantidade: parseFloat(oItemBatch.Quantidade).toFixed(3).toString(),
            Unidade: oItemBatch.Unidade
          });
        });
      }
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function (oData) {
          this.getView().setBusy(false);
          this._getChargDialog().setBusy(false);
          var oBillingData = this.getView().getModel("BillingModel").getData();
          oBillingData.Log = [];

          oBillingData.Log.push({
            SalesOrder: sSalesOrder,
            DeliveryDocument: oBillingData1.Remessa,
            BillingDocument: "",
            FiscalNote: "",
            MessageType: "sap-icon://status-positive",
            MessageColor: "LL",
            Message: 'Ordem faturada com sucesso'
          });
          oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
            if (oResponse.headers["custom-return"]) {
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
              var aMessage = [];
              var sIconType = "";
              var sIconColor = "";
              if (oBillingReturn.message.length > 0) {
                var sMessage = this._convertMessage(oBillingReturn.message);
                aMessage = sMessage.split("-");
                aMessage[0] = aMessage[0].trim();
                if (aMessage.length > 1) {
                  aMessage[1] = aMessage[1].replace(/^\s+/, "");
                }
                switch (aMessage[0]) {
                case "S":
                  sIconType = "sap-icon://status-positive";
                  sIconColor = "LL1";
                  break;
                case "I":
                  sIconType = "sap-icon://status-inactive";
                  sIconColor = "LL0";
                  break;
                case "W":
                  sIconType = "sap-icon://status-critical";
                  sIconColor = "LL2";
                  break;
                case "E":
                  sIconType = "sap-icon://status-error";
                  sIconColor = "LL3";
                  break;
                }
              }
              if (aMessage[0] === "S" && this._oChargDialog) {
                this._getChargDialog().close();
              }
              oBillingData.Log = [];
              oBillingData.Log.push({
                SalesOrder: oBillingReturn.numOrdem,
                DeliveryDocument: (oBillingReturn.fornecimento ? oBillingReturn.fornecimento : ""),
                BillingDocument: (oBillingReturn.fatura ? oBillingReturn.fatura : ""),
                FiscalNote: (oBillingReturn.notaFiscal ? oBillingReturn.notaFiscal : ""),
                MessageType: sIconType,
                MessageColor: sIconColor,
                Message: (aMessage[1] ? aMessage[1] : "")
              });
            }
          }.bind(this));
          this.getView().getModel("BillingModel").refresh(true);
          if (oBillingData.Log[0].Message.indexOf('sucesso') != -1) {
            this._getChargDialog().close();
            if (l_ovs.length > 0) {
              var ov = l_ovs[0].Vgbel;
              l_ovs.shift();
              this._loadSalesOrder(ov);
            } else {
              var hdrMessage = 'Fim do faturamento';
              MessageBox.information(hdrMessage, {
                styleClass: "sapUiSizeCompact"
              });
              this.onSearch();
            }
          } else {
            this._getBillingLogDialog().open();
          }
        }.bind(this),
        error: function () {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
    },

    onChargSelection: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oChargData = oBillingData.CurrentItem.Lotes.find(function (oCharg) {
        return oCharg.Lote === oBillingData.CurrentItem.Charg;
      });
      var qtd = oChargData.Quantidade.replace(".", ",");
      oBillingData.CurrentItem.ChargAvailability = qtd;
      oBillingData.CurrentItem.ChargAvlVisible = true;
      this.getView().getModel("BillingModel").refresh(true);
    },

    handleMenosOvs: function () {

      var oItemsSelected = this.getView().byId("List").getSelectedContexts();
      var oPayload = {};
      var ov = '';
      var sayings = new Map();
      oItemsSelected.forEach(function (oItem) {
        sayings.set(oItem.getObject().Vgbel, oItem.getObject().Lfimg)
      })
      var oBillingData = this.getView().byId("List").getItems();
      oBillingData.forEach(function (oItem) {
        if (sayings.has(oItem.getCells()[1].getValue())) {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[8].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[2].getText() + ";X<>"
        } else {
          ov += oItem.getCells()[1].getValue() + ';' + parseFloat(oItem.getCells()[8].getValue().replace(".", "").replace(",", ".")).toString() +
            ';' + oItem.getCells()[2].getText() + ";0<>"
        }
      })
      var sVbeln = sessionStorage.getItem("sVbeln");
      var ordem = sVbeln;
      var filters = [];
      var filter = new sap.ui.model.Filter("tknum", sap.ui.model.FilterOperator.EQ, ordem);
      filters.push(filter);
      var filter = new sap.ui.model.Filter("placa", sap.ui.model.FilterOperator.EQ, ordem);
      filters.push(filter);
      var filter = new sap.ui.model.Filter("tipo", sap.ui.model.FilterOperator.EQ, 'D');
      filters.push(filter);
      var filter = new sap.ui.model.Filter("transportadora", sap.ui.model.FilterOperator.EQ, 'Z');
      filters.push(filter);
      var filter = new sap.ui.model.Filter("ov", sap.ui.model.FilterOperator.EQ, ov);
      filters.push(filter);

      this.getView().setBusy(true);
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja excluir?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().read("/transporteresMarcaSet", {
                filters: filters,
                success: function (odata) {
                  if (odata.results.length > 0) {
                    if (odata.results[0].tknum == '1000000001') {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.error(hdrMessage, {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.getView().setBusy(false);
                      return false;
                    }
                    if (odata.results[0].tknum == '200LL00002') {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    } else {
                      var hdrMessage = odata.results[0].ov;
                      MessageBox.information(hdrMessage, {
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }
                  }
                }.bind(oview),
                error: function (oError) {
                  oview.getView().setBusy(false);
                  var hdrMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(hdrMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });

    },

    _checkCurrentItem: function () {
      var bValid = true;
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
      if (!fAvalbQty) {
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.error("Este item ainda possui quantidade a ser atribuída");
        bValid = false;
      }
      return bValid;
    },

    _setItemCharg: function (iItem, oItem) {
      this.getView().getModel("BillingModel").getData().ChargItems[iItem] = oItem;
      this.getView().getModel("BillingModel").refresh(true);
    },

    onCancelCharg1: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        TpExecucao: "D",
        Remessa: oBillingData.Remessa
      };
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function (oData) {
          this.getView().setBusy(false);
        }.bind(this),
        error: function () {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
      this._getChargDialog().close();
    },

    onDeleteCharg1: function (oEvent) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oItem = oEvent.getSource().getParent();
      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oItem);
      oBillingData.CurrentItem.Attribuition.splice(iIndex, 1);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
    },

    onAddCharg1: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (!oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition = [];
      }
      // Validação da Quantidade 
      var fQuantity = parseFloat(oBillingData.CurrentItem.Quantity.replace(",", "."));
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", "."));
      if (fQuantity > 0) {
        if (fQuantity <= fAvalbQty) {
          if (fQuantity <= parseFloat(oBillingData.CurrentItem.ChargAvailability)) {
            oBillingData.CurrentItem.Attribuition.push({
              Charg: oBillingData.CurrentItem.Charg,
              Lgort: oBillingData.CurrentItem.Centro,
              Available: oBillingData.CurrentItem.ChargAvailability,
              Quantity: fQuantity
            });
            this._recalcQuantity2Insert();
            this.getView().getModel("BillingModel").refresh(true);
          } else {
            MessageBox.error("Quantidade deve ser menor ou igual a quantidade lote");
          }
        } else {
          MessageBox.error("Quantidade deve ser menor ou igual a quantidade disponível");
        }
      } else {
        MessageBox.error("Quantidade deve ser maior que zero");
      }
    },

    _recalcQuantity2Insert: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var i = 0;
      oBillingData.CurrentItem.AvailableQuantity = oBillingData.CurrentItem.Quantidade;
      if (oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition.forEach(function (oCharg) {
          i = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", ".")) - oCharg.Quantity;
          oBillingData.CurrentItem.AvailableQuantity = i.toString();
        });
      }
      oBillingData.CurrentItem.Quantity = "";
    },

    handleFaturarOVPress: function () {
      var oItemsSelected = this.getView().byId("List").getSelectedContexts();
      var oPayload = {};
      this.getView().setBusy(true);
      var oview = this;
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente faturar ov?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      if (oItemsSelected.length > 0) {
        sap.m.MessageBox.show(
          box, {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                if (oItemsSelected.length > 0) {
                  if (oItemsSelected.length == 1) {
                    oview.faturarLote(oItemsSelected);
                  } else {
                    var sGroupId = "1",
                      sChangeSetId = "Create";
                    oview.getView().getModel().setDeferredGroups([sGroupId]);
                    oItemsSelected.forEach(function (oItem) {
                      var oObject = oItem.getObject();
                      oPayload = {
                        OrdemVenda: oObject.Ordem,
                        TpExecucao: "C"
                      };
                      oview.getView().getModel().create("/FaturamentoSet", oPayload, {
                        groupId: sGroupId
                      }, {
                        changeSetId: sChangeSetId
                      });
                    }.bind(oview));
                    oview.getView().setBusy(true);
                    oview.getView().getModel().submitChanges({
                      groupId: sGroupId,
                      changeSetId: sChangeSetId,
                      success: function (oData) {
                        this.getView().setBusy(false);
                        var oBillingData = this.getView().getModel("BillingModel").getData();
                        oBillingData.Log = [];
                        oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
                          if (oResponse.headers["custom-return"]) {
                            var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
                            var aMessage = [];
                            var sIconType = "";
                            var sIconColor = "";
                            if (oBillingReturn.message.length > 0) {
                              var sMessage = this._convertMessage(oBillingReturn.message);
                              aMessage = sMessage.split("-");
                              aMessage[0] = aMessage[0].trim();
                              if (aMessage.length > 1) {
                                aMessage[1] = aMessage[1].replace(/^\s+/, "");
                              }
                              switch (aMessage[0]) {
                              case "S":
                                sIconType = "sap-icon://status-positive";
                                sIconColor = "L1";
                                break;
                              case "I":
                                sIconType = "sap-icon://status-inactive";
                                sIconColor = "L0";
                                break;
                              case "W":
                                sIconType = "sap-icon://status-critical";
                                sIconColor = "L2";
                                break;
                              case "E":
                                sIconType = "sap-icon://status-error";
                                sIconColor = "L3";
                                break;
                              }
                            }
                            oBillingData.Log.push({
                              SalesOrder: oBillingReturn.numOrdem,
                              DeliveryDocument: (oBillingReturn.fornecimento ? oBillingReturn.fornecimento : ""),
                              BillingDocument: (oBillingReturn.fatura ? oBillingReturn.fatura : ""),
                              FiscalNote: (oBillingReturn.notaFiscal ? oBillingReturn.notaFiscal : ""),
                              MessageType: sIconType,
                              MessageColor: sIconColor,
                              Message: (aMessage[1] ? aMessage[1] : "")
                            });
                          }
                        }.bind(oview));
                        oview.getView().getModel("BillingModel").refresh(true);
                        oview._getBillingLogDialog().open();
                      }.bind(oview),
                      error: function () {
                        oview.getView().setBusy(false);
                      }.bind(this)
                    }, oview);
                  }
                } else {
                  MessageBox.error("Selecione ao menos uma ordem de venda para faturamento");
                }
              } else {
                oview.getView().setBusy(false);
              }
            }
          });
      } else {
        MessageBox.error("Selecione ao menos uma ordem de venda para faturamento");
        oview.getView().setBusy(false);
      }
    },

    gerarEtiqueta: function () {
      var oItemsSelected = this.getView().byId("List").getSelectedContexts();
      var oPayload = {};
      this.getView().setBusy(true);
      var oview = this;
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente Gerar Etiqueta?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      if (oItemsSelected.length > 0) {
        sap.m.MessageBox.show(
          box, {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                if (oItemsSelected.length > 0) {
                  var sGroupId = "1",
                    sChangeSetId = "Create";
                  oview.getView().getModel().setDeferredGroups([sGroupId]);
                  oItemsSelected.forEach(function (oItem) {
                    var oObject = oItem.getObject();
                    oPayload = {
                      Ordem: oObject.Ordem
                    };
                    oview.getView().getModel().create("/ImprimeEtiquetaSet", oPayload, {
                      groupId: sGroupId
                    }, {
                      changeSetId: sChangeSetId
                    });
                  }.bind(oview));
                  oview.getView().setBusy(true);
                  oview.getView().getModel().submitChanges({
                    groupId: sGroupId,
                    changeSetId: sChangeSetId,
                    success: function (oData) {
                      this.getView().setBusy(false);
                      var oBillingData = this.getView().getModel("BillingModel").getData();
                      oBillingData.Log = [];
                      var hdrMessage = [];
                      oData.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
                        if (oResponse.data) {
                          var aMessage = [];
                          var sIconType = "";
                          var sIconColor = "";
                          hdrMessage.push(oResponse.data.Ordem + ":" + oResponse.data.Message)
                        }
                      }.bind(oview));
                      var sMessage = hdrMessage;
                      MessageBox.show(sMessage.join("\n"), {
                        title: "ArcelorMittal",
                        styleClass: "sapUiSizeCompact"
                      });
                      oview.onSearch();
                    }.bind(oview),
                    error: function (error) {
                      oview.getView().setBusy(false);
                    }.bind(this)
                  }, oview);
                } else {
                  MessageBox.error("Selecione ao menos uma ordem de venda para imprimir etiqueta");
                }
              } else {
                oview.getView().setBusy(false);
              }
            }
          });
      } else {
        MessageBox.error("Selecione ao menos uma ordem de venda para imprimir etiqueta");
        oview.getView().setBusy(false);
      }
    },

    _getBillingLogDialog: function () {
      if (!this._oDialog2) {
        this._oDialog2 = sap.ui.xmlfragment("arcelor.view.FaturamentoLog", this);
        this.getView().addDependent(this._oDialog2);
      }
      return this._oDialog2;
    },

    onConfirmPopup: function () {
      this._getBillingLogDialog().close();
      this._getChargDialog().close();
      if (l_ovs.length > 0) {
        var ov = l_ovs[0].Vgbel;
        l_ovs.shift();
        this._loadSalesOrder(ov);
      } else {
        var hdrMessage = 'Fim do faturamento';
        MessageBox.information(hdrMessage, {
          styleClass: "sapUiSizeCompact"
        });

        this.onSearch();
      }
    },

    handleMessagePopoverPress: function (oEvent) {
      oMessagePopover.openBy(oEvent.getSource());
    },

    _convertMessage: function (sMessage) {
      var tTextArea = document.createElement('textarea');
      tTextArea.innerHTML = sMessage;
      return tTextArea.value;
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onEfetuarPagamento: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {
        if (aSelectedContexts.length === 1) {
          var view = this;
          var sKey = this.getModel().createKey("/SalesOrderSet", {
            Ordem: aSelectedContexts[0].getObject().Ordem
          });
          this.getModel().read(sKey, {
            urlParameters: {
              "$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
            },
            success: function (oData) {
              if (view._oDialog14) {
                view._oDialog14.destroy();
              }
              view._oDialog14 = sap.ui.xmlfragment("arcelor.view.PagamentoCartao", view);
              sap.ui.getCore().byId("textValorTotalVendapag").setText(aSelectedContexts[0].getObject().ValorOrdem);
              sap.ui.getCore().byId("input-Cliente_pag").setText(aSelectedContexts[0].getObject().DescCliente);
              sap.ui.getCore().byId("input-ovPag").setText(aSelectedContexts[0].getObject().Ordem);
              sap.ui.getCore().byId("input-condpag").setText(oData.CondPagamento);
              view._oDialog14.open();
            },
            error: function (oData) {}
          });
        } else {
          MessageBox.error("Selecionar apenas um item!");
        }
      } else {
        MessageBox.error("Selecionar pelo menos 1 item!");
      }
    },

    showStatus: function (msg) {
      document.getElementById("tef_titulo").innerHTML = msg;
      document.getElementById("tef_corpo").innerHTML = "";
    },

    showMessage: function (msg) {
      document.getElementById("tef_corpo").innerHTML = msg +
        "<br/><br/><table width=\"120\"><tr><td><input type=\"BUTTON\" class=\"btn1\" value=\"OK\" onclick=\"this.resetView();\"/></td></tr></table>";
      document.getElementById("tef_corpo").style.display = "block";
    },

    obtemSessaoId: function () {
      $.ajax({
          url: agent_url + "/session",
          type: "get",
          data: {},
        })
        .done(function (data) {
          if (data.serviceStatus == 0) {
            // Salva a sessionId
            sessao.sessionId = data.sessionId;
            sessao.usandoSessao = 1;
            showMessage("Sessao atual [" + data.sessionId + "]");
          } else {
            showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
    },

    destroiSessaoId: function () {
      var ret = [];
      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = "";
      sessao.dataFiscal = "";
      sessao.horaFiscal = "";
      $.ajax({
          url: agent_url + "/session",
          type: "delete",
        })
        .done(function (data) {
          if (data.serviceStatus == 0) {
            showMessage("Sessao finalizada");
          } else {
            showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
      // Limpa a sessionId, independente de ter dado erro.
      sessao.sessionId = "";
      sessao.usandoSessao = 0;
    },

    inicio: function (tipo, funcao) {
      var ret = [];
      var data_d = new Date()
      var mm = data_d.getMonth() + 1; // getMonth() is zero-based
      var dd = data_d.getDate();
      var date_dat = [data_d.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
      ].join('');
      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = '';
      sessao.dataFiscal = date_dat;
      sessao.horaFiscal = '';
      this.showStatus("Iniciando transação...");
      var oview = this;
      var args = {};
      if (tipo == 1) {
        // Envia dados para uma nova sessão
        args.sitefIp = '127.0.0.1';
        args.storeId = this.getModel("SalesModel").getData().Loja;
        args.terminalId = 'REST0001';
      } else if (tipo == 2 && sessao.sessionId) {
        args.sessionId = sessao.sessionId;
      }
      // Argumentos comuns
      args.functionId = funcao;
      args.trnAmount = this.getView().byId("textValorTotalVenda").getText();
      args.taxInvoiceNumber = '';
      args.taxInvoiceDate = date_dat;
      args.taxInvoiceTime = '';
      args.cashierOperator = 'CAIXA';
      args.trnAdditionalParameters = '';
      args.trnInitParameters = '';
      $.ajax({
          url: agent_url + "/startTransaction",
          type: "post",
          data: jQuery.param(args),
        })
        .done(function (data) {
          if (data.serviceStatus != 0) {
            oview.showMessage("Agente ocupado: " + data.serviceStatus + " " + data.serviceMessage);
          } else if (data.clisitefStatus != 10000) {
            oview.showMessage("Retorno " + data.clisitefStatus + " da CliSiTef");
          } else {
            // Inicia retornou 10000 (via clisitef)
            sessao.continua = 0;
            // Salva a sessionId para usar na confirmacao
            sessao.sessionId = data.sessionId;
            // Continua no fluxo de coleta
            oview.continua("");
          }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText + "<br>" + jQuery.param(args));
        });
    },

    _recalcQuantity2Insert: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var i = 0;
      oBillingData.CurrentItem.AvailableQuantity = oBillingData.CurrentItem.Quantidade;
      if (oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition.forEach(function (oCharg) {
          i = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", ".")) - oCharg.Quantity;
          oBillingData.CurrentItem.AvailableQuantity = i.toString();
        });
      }
      oBillingData.CurrentItem.Quantity = "";
    },

    continua: function (dados) {
      // lembrete: chamada ajax é assincrona, então sai da função continua imediatamente
      var oview = this;
      $.ajax({
          url: agent_url + "/continueTransaction",
          type: "post",
          data: {
            "sessionId": sessao.sessionId,
            "data": dados,
            "continue": sessao.continua,
          },
        })
        .done(function (data) {
          if (data.serviceStatus != 0) {
            oview.showMessage(data.serviceStatus + " " + data.serviceMessage);
            return;
          }
          if (data.clisitefStatus != 10000) {
            var s = "";
            if (data.clisitefStatus == 0) {
              s = JSON.stringify(sessao.ret);
              s = s.replace(/},{/g, "},<br>{");
              oview.finaliza(1, false, false);
            }
            oview.showMessage("Fim - Retorno: " + data.clisitefStatus + "<br>");
            if (oview._oDialog14) {
              oview._oDialog14.close();
              oview._oDialog14.destroy();
            }
            return;
          }
          document.getElementById("tef_corpo").style.display = "none";
          if (data.commandId != 23) {
            // tratamento para nao piscar a tela (refresh)
            lastContents23 = '';
          }
          switch (data.commandId) {
          case 0:
            var item = {
              "TipoCampo": data.fieldId,
              "Valor": data.data
            };
            // acumula o resultado em um JSON, pode ser usado no final da transação para POST ao servidor da automação
            sessao.ret.push(item);

            if (data.fieldId == 121) {
              alert("Cupom Estabelecimento: " + data.data);
              if (oview._oDialog14) {
                oview._oDialog14.close();
                oview._oDialog14.destroy();
              }
            }
            if (data.fieldId == 122)
              alert("Cupom Cliente: " + data.data);
            oview.continua("");
            break;
          case 1:
          case 2:
          case 3:
          case 4:
          case 15:
            document.getElementById("tef_titulo").innerHTML = data.data;
            oview.continua("");
            break;
          case 11:
          case 12:
          case 13:
          case 14:
          case 16:
            //Apaga display
            document.getElementById("tef_titulo").innerHTML = "";
            oview.continua("");
            break;
          case 22:
            alert(data.data + "enter");
            oview.continua("");
            break;
          case 23:
            var contents =
              '<table><tr><td width="150"><input type="BUTTON" class="btn1" value="Cancelar" onclick="sessao.continua=-1;"/></td></tr></table>';
            if (lastContents23 != contents) {
              document.getElementById("tef_corpo").innerHTML = contents;
              lastContents23 = contents;
            }
            // No comando 23, faz o reset da flag de continuidade, para sensibilizar tratamento de confirmações de cancelamento da clisitef.
            setTimeout(function () {
              oview.continua("");
              sessao.continua = 0;
            }, 500);
            break;
          case 20:
            document.getElementById("tef_titulo").innerHTML = data.data;
            sap.ui.getCore().byId("bnt_cancelpag").setVisible(true);
            sap.ui.getCore().byId("bnt_simPag").setVisible(true);
            break;
          case 21:
          case 30:
          case 31:
          case 32:
          case 33:
          case 34:
          case 35:
          case 38:
            var s = data.data;
            if (data.commandId == 21)
              s = s.replace(/;/g, "<br/>");
            document.getElementById("tef_corpo").innerHTML = '<table><tr><td colspan="2">' + s + '</td></tr></table>';
            sap.ui.getCore().byId("DADOS").setVisible(true);
            sap.ui.getCore().byId("bnt_okPag").setVisible(true);
            sap.ui.getCore().byId("bnt_cancel").setVisible(true);
            document.getElementById("tef_corpo").style.display = "block";
            setTimeout(function () {
              document.getElementById("DADOS").focus();
            }, 100);
            break;
          default:
            document.getElementById("tef_corpo").innerHTML = "Chegou uma captura desconhecida.[" + data.commandId + "]";
            document.getElementById("tef_corpo").style.display = "block";
            oview.continua("");
          }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
          oview.showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
    },

    criaSessaoId: function () {
      var ret = [];
      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = "";
      sessao.dataFiscal = "";
      sessao.horaFiscal = "";
      this.showStatus("Criando sessão...");
      var loja = this.getModel("SalesModel").getData().Plant.split("-")[0].trim();
      loja = '0000' + loja;
      var oview = this;
      $.ajax({
          url: agent_url + "/session",
          type: "post",
          data: {
            "sitefIp": "127.0.0.1",
            "storeId": '00000000',
            "terminalId": "REST0001",
            "sessionParameters": "",
          },
        })
        .done(function (data) {
          if (data.serviceStatus == 0) {
            // Salva a sessionId e dados da conexao
            sessao.sessionId = data.sessionId;
            sessao.usandoSessao = 1;
            sessao.empresa = '00000000';
            sessao.terminal = 'REST0001';
            sessao.siTefIP = '127.0.0.1';
            oview.inicio(2, 3);
          } else {
            oview.showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
    },

    onConfirmPagamento: function () {
      if (!sessao.sessionId) {
        this.criaSessaoId();
      } else {
        this.inicio(2, 3);
      }
    },

    resetView: function () {
      if (!sessao.usandoSessao) {
        // Foi usada uma sessao temporária, faz a limpeza pois o servidor removeu a sessão
        sessao.sessionId = 0;
      }
    },

    trataColeta: function (cont) {
      if (cont.mParameters.id == "bnt_okPag") {
        sessao.continua = 0
      } else {
        sessao.continua = -1
      };
      this.continua(sap.ui.getCore().byId("DADOS").getValue());
      sap.ui.getCore().byId("DADOS").setVisible(false);
      sap.ui.getCore().byId("DADOS").setValue("");
      sap.ui.getCore().byId("bnt_okPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancel").setVisible(false);
    },

    simPag: function () {
      this.continua(0)
      sap.ui.getCore().byId("bnt_simPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancelpag").setVisible(false);
    },

    cancelPag: function () {
      this.continua(1)
      sap.ui.getCore().byId("bnt_simPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancelpag").setVisible(false);
    },

    onImprimir: function (oEvent) {
      var orderId = this.getView().byId("List").getSelectedContexts()[0].getObject().Ordem;
      var oModel = new sap.ui.model.json.JSONModel();
      var that = this;
      this.getModel().read("/SalesOrderSet('" + orderId + "')", {
        urlParameters: {
          "$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
        },
        success: function (oData) {
          oModel.setData(oData);
          that.getOwnerComponent().getRouter().navTo("SalesReport", null, true);
        }
      });
    }
  });
});