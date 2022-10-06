sap.ui.define([
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

  
  return BaseController.extend("arcelor.controller.OrdemVendaFatura", {

    onInit: function () {

      this.setInitalDateValue();

      // Model Inicial
      if (!this.getModel("OVModel")) {
        this.setModel(new JSONModel(), "OVModel");
      }

      this.getRouter().getRoute("OrdemVendaFatura").attachPatternMatched(this._onObjectMatched.bind(this), this);
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
          icone.removeStyleClass("statusUiIconCL0");
          icone.removeStyleClass("statusUiIconCL1");
          icone.removeStyleClass("statusUiIconCL2");
          icone.removeStyleClass("statusUiIconCL3");
          icone.removeStyleClass("statusUiIconLL1");
          icone.removeStyleClass("statusUiIconLL2");
          icone.removeStyleClass("statusUiIconLL3");
          icone.removeStyleClass("statusUiIconGL0");
          icone.removeStyleClass("statusUiIconGL1");
          icone.removeStyleClass("statusUiIconGL2");
          icone.removeStyleClass("statusUiIconGL3");
          icone.addStyleClass(sStatusClass);
        }
      });
    },
dialogAfterclose:function(oEvent) {
    this._oChargDialog.destroy();
},
    _onObjectMatched: function (Event) {
      var oParameters = Event.getParameters();
      if (oParameters.arguments.mode == "Change") {
        this.onSearch();
      } else {
        this.handleClearFields();
      }
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
      this._attachIconRendering(this.byId("icon1"), null);
      this._attachIconRendering(this.byId("icon2"), null);
      this._attachIconRendering(this.byId("icon3"), null);
      this._attachIconRendering(this.byId("icon4"), null);
      this._attachIconRendering(this.byId("icon5"), null);
    },
    onSalesOrderFrag: function (oEvent) {
/* D0012620 - Alterar processo de consulta de fluxo de documentos */

//      var iItem = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
//      var sVbeln = this.getView().getModel("OVModel").getData().OVData[iItem].Ordem + "&&&" + this.getView().getModel("OVModel").getData()
//      .OVData[iItem].DescCliente.replace('/', '&&&&&');
//
//      this.oModelOV = new sap.ui.model.json.JSONModel();
//      this.oModelOV.setData(this.getView().getModel("OVModel").getData());
//      sap.ui.getCore().setModel(this.oModelOV, "ov_exibir_dados");
//      this.getOwnerComponent().getRouter().navTo("Vendas", {
//        mode: "Change",
//        salesorder: sVbeln
//      }, true);

      var oSource = oEvent.getSource();
      var sPath   = oSource.getParent().getBindingContext().sPath;
      var oModel  = oEvent.getSource().getModel();
        var oItem   = oModel.getProperty(sPath);
        
        if (oItem.VbtypN === "C") {
          this.oModelOV = new sap.ui.model.json.JSONModel();
          this.oModelOV.setData(this.getView().getModel("OVModel").getData());
          sap.ui.getCore().setModel(this.oModelOV, "ov_exibir_dados");
          this.getOwnerComponent().getRouter().navTo("Vendas", {
            mode: "Change",
            salesorder: oItem.Docnum
          }, true);
        } else if (oItem.VbtypN === "1") {
            sessionStorage.setItem("ViewBack", "OrdemVendaFatura");

            this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
              mode: "Change",
              fatura: oItem.Refkey
            }, true);
        }
/* D0012620 - Alterar processo de consulta de fluxo de documentos */           
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
                  oview.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem);
                  oview.aAllFilters.push(oview.oFilter);
                  oview.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
                  oview.getModel().read("/GerarBoletoOvSet", {
                    filters: oview.aAllFilters,
                    success: function (oData) {

                      if (oData.results.length > 0){
                        var sheetNames;
                        sheetNames = '{"myList" : ['
                          for (var i = 0; i < oData.results.length; i++) {
                            var parcela = i + 1;
                            sheetNames += '{"Parcela" : "'+ parcela.toString() + '","Name" : "'+ parcela.toString() + '"}';
                            if (i+1 != oData.results.length){
                              sheetNames +=   ',';
                            }
                          }
                        sheetNames +=   ']}';
                        sheetNames = JSON.parse(sheetNames);
                        var sheets = new sap.ui.model.json.JSONModel(sheetNames);
                        var comboBox = sap.ui.getCore().byId("idParcelas");
                        comboBox.setModel(sheets);
                        comboBox.setSelectedKey(oData.results.length);
                        valueHelpDialogData.open();
                      }else{
                        valueHelpDialogData.destroy();
                      }
                    },
                    error: function (oData) {
                    valueHelpDialogData.destroy();
                    }
                  });
                }
              },
              error: function (Error) {}
            });
          } else {
            MessageBox.error("Item n�o faturado!");
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

      var sOrd = oEvent.getSource().getParent().mAggregations.cells[0].mProperties.title;
      var sMensagem = "" ; 
      sMensagem = sMensagem.concat("OV ",sOrd," pertence a centro/escritório de vendas diferente do usuário.");

      if (this.getView().getModel("OVModel").getData().OVData[iItem].Sbgrp != "") {
        MessageBox.error(sMensagem, {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
      } else {

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

      }
    },

    onNavBack: function (oEvent) {
      this.handleClearFields();      
      this.getOwnerComponent().getRouter().navTo("pedidos");
    },

    setInitalDateValue: function () {

      var date = this.getView().byId("input-dateEmitidas");

      date.addEventDelegate({
        onAfterRendering: function () {
          var oDateInner = this.$().find('.sapMInputBaseInner');
          var oID = oDateInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, date);

      date = this.getView().byId("input-DtRemessa");

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
      }

      return texto;

    },

    status: function (Status) {

      var icone;

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
        icone = "sap-icon://status-positive";
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
      case "":
        icone = "sap-icon://status-error";
        break;
      default:
        break;
      }

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

      this.getView().byId("multiinput-ordem").removeAllTokens();
      this.getView().byId("input-DtRemessa").setValue("");
      this.getView().byId("input-Cliente").setValue("");
      this.getView().byId("input-dateEmitidas").setValue("");

      var filters = [];
      var list = this.getView().byId("List");
      var binding = list.getBinding("items");
      binding.filter(filters);

      this.setInitalDateValue();

      this.getModel("OVModel").setData({});
      this.getModel("OVModel").refresh(true);
    },

    onSearch: function () {

      this.byId("List").removeSelections();
      var thisView = this;

      var filters = [];
      var filter;
      var value;

      value = this.getView().byId("multiinput-ordem");
      value = value.getTokens();

      if (value.length > 0) {

        var ordem;

        for (var i = 0; i < value.length; i++) {

          ordem = value[i].getProperty("text");
          filter = new sap.ui.model.Filter("Ordem", sap.ui.model.FilterOperator.Contains, ordem);
          filters.push(filter);

        }

      }

      value = this.getView().byId("input-Cliente").getValue("");
      if (value !== "") {
        filter = new sap.ui.model.Filter("Cliente", sap.ui.model.FilterOperator.Contains, value);
        filters.push(filter);
      }

      value = this.getView().byId("input-DtRemessa");
      if (value !== "") {

        var from = value.getDateValue();

        if (from !== null) {

          from = from.getFullYear() + '-' + this.utilMonthDateGet(from.getMonth()) + '-' + from.getDate();
          filter = new sap.ui.model.Filter("DtRemessaDe", sap.ui.model.FilterOperator.BT, from);
          filters.push(filter);

          var to = value.getSecondDateValue();
          to = to.getFullYear() + '-' + this.utilMonthDateGet(to.getMonth()) + '-' + to.getDate();
          filter = new sap.ui.model.Filter("DtRemessaAte", sap.ui.model.FilterOperator.BT, to);
          filters.push(filter);

        }

      }

      value = this.getView().byId("input-dateEmitidas");
      if (value !== "") {

        var from = value.getDateValue();

        if (from !== null) {

          from = from.getFullYear() + '-' + this.utilMonthDateGet(from.getMonth()) + '-' + from.getDate();
          filter = new sap.ui.model.Filter("DtEmiDe", sap.ui.model.FilterOperator.BT, from);
          filters.push(filter);

          var to = value.getSecondDateValue();
          to = to.getFullYear() + '-' + this.utilMonthDateGet(to.getMonth()) + '-' + to.getDate();
          filter = new sap.ui.model.Filter("DtEmiAte", sap.ui.model.FilterOperator.BT, to);
          filters.push(filter);

        } else {
          if (value.length == 0) {
            MessageBox.error('Informar data Emitidas no per�odo.', {
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
      }
      this.getView().setBusy(true);
      this.getModel().read("/OrdemVendaFaturaSet", {
        filters: filters,
        success: function (oSalesOrders) {
          this.getView().setBusy(false);
          this.getModel("OVModel").setData({
            OVData: oSalesOrders.results
          });
          this.getModel("OVModel").refresh(true);
          this.getView().byId("List").getBinding("items").filter([]);
        }.bind(this),
        error: function (oError) {
          this.getView().setBusy(false);
          MessageBox.error('Erro ao buscar Ordens de Venda', {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        }.bind(this)
      });

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
        var parcela_text = sap.ui.getCore().byId("idParcelas").getSelectedItem().getText()
        var subFromDate = oDateFormat.format(new Date(date_time));
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem);
        this.aAllFilters.push(this.oFilter);
        this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
        this.aAllFilters.push(this.oFilter);
        this.getModel().read("/GerarBoletoOvSet", {
          filters: this.aAllFilters,
          success: function (oData) {
            if (oData.results.length > 0) {

              var parcela = parseInt(parcela_text);
              parcela = parcela - 1;

              var mapForm = document.createElement("form");
              mapForm.target = "Map";
              mapForm.acceptCharset = "iso-8859-1";
              mapForm.method = "POST"; // or "post" if appropriate
              mapForm.action = "http://bms317/ConsultasBelgoNetQA/ScriptsArcelorMittal/boleto_vendas.asp";
              var mapInput = document.createElement("input");
              mapInput.type = "text";
              mapInput.name = "NAME";
              mapInput.value = oData.results[parcela].Name1;
              mapForm.appendChild(mapInput);
              var mapInput1 = document.createElement("input");
              mapInput1.type = "text";
              mapInput1.name = "BLDAT";
              mapInput1.value = oData.results[parcela].Bldat.substring(6, 8) + '/' + oData.results[0].Bldat.substring(4, 6) + '/' + oData.results[
                0].Bldat.substring(0, 4);
              mapForm.appendChild(mapInput1);
              var mapInput2 = document.createElement("input");
              mapInput2.type = "text";
              mapInput2.name = "XBLNR";
              mapInput2.value = oData.results[parcela].Xblnr;
              mapForm.appendChild(mapInput2);

              var mapInput3 = document.createElement("input");
              mapInput3.type = "text";
              mapInput3.name = "BUZEI";
              mapInput3.value = oData.results[parcela].Buzei;
              mapForm.appendChild(mapInput3);

              var mapInput4 = document.createElement("input");
              mapInput4.type = "text";
              mapInput4.name = "DMBTR";
              mapInput4.value = oData.results[parcela].Dmbtr;
              mapForm.appendChild(mapInput4);

              var mapInput5 = document.createElement("input");
              mapInput5.type = "text";
              mapInput5.name = "STRAS";
              mapInput5.value = oData.results[parcela].Stras;
              mapForm.appendChild(mapInput5);

              var mapInput6 = document.createElement("input");
              mapInput6.type = "text";
              mapInput6.name = "ANFAE";
              mapInput6.value = oData.results[parcela].Anfae.substring(6, 8) + '/' + oData.results[parcela].Anfae.substring(4, 6) + '/' + oData.results[
                parcela].Anfae.substring(0, 4);
              mapForm.appendChild(mapInput6);

              var mapInput7 = document.createElement("input");
              mapInput7.type = "text";
              mapInput7.name = "LAUFD";
              mapInput7.value = oData.results[parcela].Laufd.substring(6, 8) + '/' + oData.results[parcela].Laufd.substring(4, 6) + '/' + oData.results[
                parcela].Laufd.substring(0, 4);
              mapForm.appendChild(mapInput7);

              var mapInput8 = document.createElement("input");
              mapInput8.type = "text";
              mapInput8.name = "PSTLZ";
              mapInput8.value = oData.results[parcela].Pstlz;
              mapForm.appendChild(mapInput8);

              var mapInput9 = document.createElement("input");
              mapInput9.type = "text";
              mapInput9.name = "ORT01";
              mapInput9.value = oData.results[parcela].Ort01;
              mapForm.appendChild(mapInput9);

              var mapInput10 = document.createElement("input");
              mapInput10.type = "text";
              mapInput10.name = "STCD1";
              mapInput10.value = oData.results[parcela].Stcd1;
              mapForm.appendChild(mapInput10);

              var mapInput11 = document.createElement("input");
              mapInput11.type = "text";
              mapInput11.name = "UBKNT";
              mapInput11.value = oData.results[parcela].Ubknt;
              mapForm.appendChild(mapInput11);

              var mapInput12 = document.createElement("input");
              mapInput12.type = "text";
              mapInput12.name = "UBKON";
              mapInput12.value = oData.results[parcela].Ubkon;
              mapForm.appendChild(mapInput12);

              var mapInput13 = document.createElement("input");
              mapInput13.type = "text";
              mapInput13.name = "UBKON_AUX";
              mapInput13.value = oData.results[parcela].UbkonAux;
              mapForm.appendChild(mapInput13);

              var mapInput14 = document.createElement("input");
              mapInput14.type = "text";
              mapInput14.name = "UBNKL";
              mapInput14.value = oData.results[parcela].Ubnkl;
              mapForm.appendChild(mapInput14);

              var mapInput15 = document.createElement("input");
              mapInput15.type = "text";
              mapInput15.name = "BARCODE";
              mapInput15.value = oData.results[parcela].Barcode;
              mapForm.appendChild(mapInput15);

              var mapInput16 = document.createElement("input");
              mapInput16.type = "text";
              mapInput16.name = "NOSSO";
              mapInput16.value = oData.results[parcela].Nosso;
              mapForm.appendChild(mapInput16);

              var mapInput17 = document.createElement("input");
              mapInput17.type = "text";
              mapInput17.name = "CARTEIRA";
              mapInput17.value = oData.results[parcela].Carteira;
              mapForm.appendChild(mapInput17);

              var mapInput18 = document.createElement("input");
              mapInput18.type = "text";
              mapInput18.name = "JUROS";
              mapInput18.value = oData.results[parcela].Juros;
              mapForm.appendChild(mapInput18);

              var mapInput19 = document.createElement("input");
              mapInput19.type = "text";
              mapInput19.name = "CEDENTE";
              mapInput19.value = oData.results[parcela].Cedente;
              mapForm.appendChild(mapInput19);

              var mapInput20 = document.createElement("input");
              mapInput20.type = "text";
              mapInput20.name = "VENC";
              mapInput20.value = oData.results[parcela].Venc.substring(6, 8) + '/' + oData.results[parcela].Venc.substring(4, 6) + '/' + oData.results[
                parcela].Venc.substring(0, 4);
              mapForm.appendChild(mapInput20);

              var mapInput21 = document.createElement("input");
              mapInput21.type = "text";
              mapInput21.name = "CIP";
              mapInput21.value = oData.results[parcela].Cip;
              mapForm.appendChild(mapInput21);

              var mapInput22 = document.createElement("input");
              mapInput22.type = "text";
              mapInput22.name = "INSTRUCAO";
              mapInput22.value = oData.results[parcela].Instrucao;
              mapForm.appendChild(mapInput22);

              var mapInput23 = document.createElement("input");
              mapInput23.type = "text";
              mapInput23.name = "INSTRUCAO2";
              mapInput23.value = oData.results[parcela].Instrucao2;
              mapForm.appendChild(mapInput23);

              var mapInput24 = document.createElement("input");
              mapInput24.type = "text";
              mapInput24.name = "HBKID";
              mapInput24.value = oData.results[parcela].Hbkid;
              mapForm.appendChild(mapInput24);

              var mapInput25 = document.createElement("input");
              mapInput25.type = "text";
              mapInput25.name = "empresa";
              mapInput25.value = oData.results[parcela].Bukrs;
              mapForm.appendChild(mapInput25);

              var mapInput26 = document.createElement("input");
              mapInput26.type = "text";
              mapInput26.name = "ABATIMENTO";
              mapInput26.value = oData.results[parcela].Abatimento;
              mapForm.appendChild(mapInput26);

              var mapInput27 = document.createElement("input");
              mapInput27.type = "text";
              mapInput27.name = "TXT_ABATIM";
              mapInput27.value = oData.results[parcela].TxtAbatim;
              mapForm.appendChild(mapInput27);

              var mapInput28 = document.createElement("input");
              mapInput28.type = "hidden";
              mapInput28.name = "ENDERECO";
              mapInput28.value = oData.results[parcela].Zendereco;
              mapForm.appendChild(mapInput28);

              var mapInput28 = document.createElement("input");
              mapInput28.type = "text";
              mapInput28.name = "CNPJ";
              mapInput28.value = oData.results[parcela].Zcnpj;
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
      this._showDialogFluxos();

//      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
//      var view = this;
//      var onSuccess = function (odata) {
//        var oModel = new JSONModel($.parseJSON(odata.results[0].json));
//        if (view._oDialog) {
//          view._oDialog.destroy();
//        }
//        view._oDialog = sap.ui.xmlfragment("arcelor.view.remessa", view);
//        view._oDialog.setModel(oModel);
//        view._oDialog.open();
//
//      };
//      var onError = function (odata) {}
//      if (aSelectedContexts.length > 0) {
//        if (aSelectedContexts.length === 1) {
//          var aFilters = [];
//          aFilters.push(new Filter("ordem", FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem));
//
//          var oview = this;
//          this.getModel().read("/FloxoOvSet", {
//            filters: aFilters,
//            success: onSuccess,
//            error: onError
//          });
//        } else {
//          MessageBox.error("Selecionar apenas um item!");
//        }
//      } else {
//        MessageBox.error("Nenhum item foi selecionado");
//      }
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

    handleLiberarParaPagamentoPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      var sFlag = this.validaOv(aSelectedContexts);
      if (sFlag != "X"){
        this.handleLiberarParaRemessaPress("X");
      }
    },


    handleLiberarParaRemessaPress: function (sModo) {

      var sMen = "Liberar p/ Remessa";
      if (sModo == "X"){
       sMen = "Liberar Pgto Antecipado";
      }else{
        sModo = "";
      }

      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {

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

                  oview.getModel().setDeferredGroups(["group1"]);

                  for (var i = 0; i < aSelectedContexts.length; i++) {

                    var oData = {
                        "ordem": aSelectedContexts[i].getObject().Ordem,
                        "funcao": sModo
                    };
                    oview.getModel().create("/RemessaPOvSet", oData, {groupId: "group1"});

                  }

                  oview.getModel().submitChanges({
                    groupId: "group1",
                    success: function (oCreatedEntry, success) {
                      oview.getView().setBusy(false);
                      var hdrMessage = success.data.__batchResponses[0].__changeResponses[0].headers.retorno;
                      var sMessage = hdrMessage;

                      sMessage = sMessage.replace( /;/g, " \n\ " ); 
                      MessageBox.show(sMessage, {
                        title: sMen
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
        MessageBox.error("Nenhum item foi selecionado");

      }
    },

    validaOv: function(aSelectedContexts){

      var sOrd = "";
      var sMensagem = "";
      var sFlag = "";
      for (var i = 0; i < aSelectedContexts.length; i++) {

        if ( aSelectedContexts[i].getObject().Sbgrp != "undefined"  &&
            aSelectedContexts[i].getObject().Sbgrp != "") {

          sOrd = aSelectedContexts[i].getObject().Ordem;
          sMensagem = sMensagem.concat("OV ",sOrd," pertence a centro/escrit�rio de vendas diferente do usu�rio.");

          MessageBox.error(sMensagem, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });

          sFlag = "X";
          this.getView().setBusy(false);
          return sFlag;
          break;
        }
      }
    },

    handleLiberarRemessaPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      this.getView().setBusy(true);
      if (aSelectedContexts.length > 0) {

        //var sFlag = this.validaOv(aSelectedContexts);
        //if (sFlag != "X"){

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

                    oview.getModel().setDeferredGroups(["group1"]);

                    for (var i = 0; i < aSelectedContexts.length; i++) {

                      var oData = {
                          "ordem": aSelectedContexts[i].getObject().Ordem
                      };
                      oview.getModel().create("/RemessaSet", oData, {groupId: "group1"});

                    }

                    oview.getModel().submitChanges({
                      groupId: "group1",
                      success: function (oCreatedEntry, success) {

                        oview.getView().setBusy(false);
                        var hdrMessage = success.data.__batchResponses[0].__changeResponses[0].headers.retorno;

                        var sMessage = hdrMessage;
                        sMessage = sMessage.replace( /;/g, " \n\ " ); 
                        MessageBox.show(sMessage, {
                          title: "Liberar Crédito Remessa"
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

        //}
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }

    },
    handleLiberarLimboPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (aSelectedContexts.length > 0) {

        var sFlag = this.validaOv(aSelectedContexts);
        if (sFlag != "X"){

          this.getView().setBusy(true);
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente liberar do limbo?'
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
                    oview.getModel().setDeferredGroups(["group1"]);

                    for (var i = 0; i < aSelectedContexts.length; i++) {

                      var oData = {
                          "Ordemvenda": aSelectedContexts[i].getObject().Ordem
                      };
                      oview.getModel().create("/LimboSet", oData, {groupId: "group1"});

                    }

                    oview.getModel().submitChanges({
                      groupId: "group1",
                      success: function (oCreatedEntry, success) {

                        oview.getView().setBusy(false);
                        var hdrMessage = success.data.__batchResponses[0].__changeResponses[0].headers.retorno;
                        var sMessage = hdrMessage;

                        sMessage = sMessage.replace( /;/g, " \n\ " ); 
                        MessageBox.show(sMessage, {
                          title: "Liberar Limbo"
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
        } 
      } else {
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    handleLiberarCreditoPress: function () {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();

      if (aSelectedContexts.length > 0) {

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

                  oview.getModel().setDeferredGroups(["group1"]);

                  for (var i = 0; i < aSelectedContexts.length; i++) {

                    var oData = {
                        "Ordemvenda": aSelectedContexts[i].getObject().Ordem
                    };
                    oview.getModel().create("/LiberarCreditoOVSet", oData, {groupId: "group1"});

                  }

                  oview.getModel().submitChanges({
                    groupId: "group1",
                    success: function (oCreatedEntry, success) {
                      oview.getView().setBusy(false);

                      var hdrMessage = success.data.__batchResponses[0].__changeResponses[0].headers.retorno;
                      var sMessage = hdrMessage;

                      sMessage = sMessage.replace( /;/g, " \n\ " ); 
                      MessageBox.show(sMessage, {
                        title: "Liberar Crédito OV"
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
        MessageBox.error("Nenhum item foi selecionado");
      }
    },

    _getItemCharg: function (iItem) {
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

    _openChargControl: function (itens, lotes) {
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
      this._oChargDialog = null;
      this._getChargDialog().open();
    },

    _getChargDialog: function () {
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

    onFinishCharg: function () {
      // Valida se h� algum item a ser validado
      var oBillingData = this.getView().getModel("BillingModel").getData();
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
        MessageBox.error("Ainda h� itens a serem corrigidos");
      }
    },

    _createBillingDocument: function (sSalesOrder, aSalesBatches) {
      var sGroupId = "1",
      sChangeSetId = "Create";
      this._getChargDialog().setBusy(true);
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oBillingData1 = this.getView().getModel("BillingModel").getData();
      if (!oBillingData1.Remessa) {
        var oPayload = {
            OrdemVenda: sSalesOrder,
            TpExecucao: "C"
        };
      } else {
        var oPayload = {
            OrdemVenda: sSalesOrder,
            TpExecucao: "F",
            Remessa: oBillingData1.Remessa
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

                this._oChargDialog.destroy();
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
          }.bind(this));
          this.getView().getModel("BillingModel").refresh(true);
          this._getBillingLogDialog().open();
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

    _checkCurrentItem: function () {
      var bValid = true;
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
      if (!fAvalbQty) {
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.error("Este item ainda possui quantidade a ser atribu�da");
        bValid = false;
      }
      return bValid;
    },
    _setItemCharg: function (iItem, oItem) {
      this.getView().getModel("BillingModel").getData().ChargItems[iItem] = oItem;
      this.getView().getModel("BillingModel").refresh(true);
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
      this._oChargDialog.destroy();
    },

    onDeleteCharg: function (oEvent) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oItem = oEvent.getSource().getParent();
      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oItem);
      oBillingData.CurrentItem.Attribuition.splice(iIndex, 1);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
    },

    onAddCharg: function () {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (!oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition = [];
      }
      // Valida��o da Quantidade
      var fQuantity = parseFloat(oBillingData.CurrentItem.Quantity.replace(",", "."));
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", "."));
      var fAvalcQty = parseFloat(oBillingData.CurrentItem.ChargAvailability.replace(",", "."));
      if (fQuantity > 0) {
        if (fQuantity <= fAvalbQty) {
         // if (fQuantity <= parseFloat(oBillingData.CurrentItem.ChargAvailability)) {
          if (fQuantity <= fAvalcQty) {
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
          MessageBox.error("Quantidade deve ser menor ou igual a quantidade dispon�vel");
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
          i = Math.round(i*1000)/1000;
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
    onConfirmPopup: function (oEvent) {
      this._getBillingLogDialog().close();
      this.onSearch();
    },

    _getBillingLogDialog: function (sTitle) {
      if (!this._oDialog2) {
        this._oDialog2 = sap.ui.xmlfragment("arcelor.view.FaturamentoLog", this);
        this.getView().addDependent(this._oDialog2);
      }
      
      this._oDialog2.setTitle(sTitle || "Log Faturamento"); 
      return this._oDialog2;
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

              // DMND0011793 - Interface maxiPago!
              // Buscar dados de contato do Cliente
              var aMaxiPagoFilters = [];

              aMaxiPagoFilters.push(new sap.ui.model.Filter(
                "Vbeln",
                sap.ui.model.FilterOperator.EQ,
                aSelectedContexts[0].getObject().Ordem
              ));

              sap.ui.getCore().byId("inEmail").setBusy(true);
              sap.ui.getCore().byId("inTelefone").setBusy(true);

              view.getModel().read("/PagtoMaxiPagoSet", {
                filters: aMaxiPagoFilters,
                error: function (oData){
                    sap.ui.getCore().byId("inEmail").setBusy(false);
                    sap.ui.getCore().byId("inTelefone").setBusy(false);
                },
                success: function (oData) {
                    if (oData.results.length > 0){
                        sap.ui.getCore().byId("inEmail").setValue(oData.results[0].EmailAddr);
                        sap.ui.getCore().byId("inTelefone").setValue(oData.results[0].Telf1);
                    }
                    sap.ui.getCore().byId("inEmail").setBusy(false);
                    sap.ui.getCore().byId("inTelefone").setBusy(false);
                }
              });

              // Habilitar forma de pagamento
              sap.ui.getCore().byId("sfMaxiPago").setVisible(true);
              sap.ui.getCore().byId("btnCriarLinkMaxiPago").setVisible(true);
              sap.ui.getCore().byId("btnCancelar").setVisible(true);


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

    onMaskTelefone: function (oEvent) {
      var telefone = oEvent.getParameter("value");
      var oTelefone = sap.ui.getCore().byId("inTelefone").getValue();
      sap.ui.getCore().byId("inTelefone").setValue(this.utilFormatterTelefone(oTelefone));
    //  this.getView().byId("inTelefone").setValue(this.utilFormatterTelefone(telefone));
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

      this.showStatus("Iniciando transa��o...");
      var oview = this;
      var args = {};
      if (tipo == 1) {
        // Envia dados para uma nova sess�o
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
    continua: function (dados) {
      // lembrete: chamada ajax � assincrona, ent�o sai da fun��o continua imediatamente
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
          // acumula o resultado em um JSON, pode ser usado no final da transa��o para POST ao servidor da automa��o
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

          // No comando 23, faz o reset da flag de continuidade, para sensibilizar tratamento de confirma��es de cancelamento da clisitef.
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

      this.showStatus("Criando sess�o...");
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
        // Foi usada uma sessao tempor�ria, faz a limpeza pois o servidor removeu a sess�o
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
    },

        onClosePagamentoDialog: function () {
        // Fechar o dialog de pagamento
        this._oDialog14.destroy();
    },

    // maxiPago!
    // Enviar requisição criação link pagamento
    onCriarLinkPagamento: function () {

        var oMaxipago = 'Sucesso';
        var oTelefone = sap.ui.getCore().byId("inTelefone"),
            oEmail    = sap.ui.getCore().byId("inEmail");

        // Validação de preenchimento dos campos
        if (oEmail.getValue().length === 0){
            oEmail.setRequired(true);
            oEmail.setValueStateText("Campo E-mail é requerido.");
            oEmail.setValueState("Error");
        }
        else{
            oEmail.setRequired(false);
            oEmail.setValueState("None");
        }

        if (oTelefone.getValue().length === 0){
            oTelefone.setRequired(true);
            oTelefone.setValueStateText("Campo Telefone é requerido.");
            oTelefone.setValueState("Error");
            oTelefone.focus();
        }
        else{
            oTelefone.setRequired(false);
            oTelefone.setValueState("None");
        }

        if (oTelefone.getValueState() != sap.ui.core.ValueState.None){
            oTelefone.focus();
            return false;
        }

        if (oEmail.getValueState() != sap.ui.core.ValueState.None){
            oEmail.focus();
            return false;
        }

        // Montagem dos dados enviados
        var aPayload = {
            "Vbeln": sap.ui.getCore().byId("input-ovPag").getText(),
            "Telf1": sap.ui.getCore().byId("inTelefone").getValue(),
            "EmailAddr": sap.ui.getCore().byId("inEmail").getValue()
        };

        // Envio da requisição
        this.getModel().create(
            "/PagtoMaxiPagoSet",
            aPayload,
            {
                success: function (oData){
                    if (oData.Message.length === 0){
                        MessageBox.success("Link de Pagamento criado com sucesso.");
                    }
                    else{
                        MessageBox.warning(oData.Message);
                                            }
                },
                error: function (oData){
                    MessageBox.error("Ocorreu um erro. Favor acionar o suporte para verificar.");
                }
            }
        );
        this._oDialog14.destroy();
    },

    
/* D0012620 - Alocação de Estoque  Fornecimento - Início */      
    handleFornecerOVPress: function() {
        var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
        
        if (aSelectedContexts.length === 0) {
          MessageBox.error("Selecionar pelo menos 1 item!");
          return;
        }
        
    MessageBox.confirm("Confirma criação do Fornecimento para o(s) documento(s) selecionado(s)?", {
      title: "Confirmar",
      onClose: function (oAction) {
        if (oAction === "OK") {
          this._criarFornecimento(aSelectedContexts);
        }
      }.bind(this),
      initialFocus: "CANCEL"
    });
    },
    
    _criarFornecimento: function(aDocumentos) {
        this.getView().setBusy(true);

        var oModel = this.getModel();
        oModel.setDeferredGroups(["batchCreate"]);        
            
        aDocumentos.forEach(function(e) {
          var oEntry = {
            Vbeln: e.getObject().Ordem
          };
          oModel.create("/FornecimentoSet", oEntry, { groupId: "batchCreate" });
        });
            
        oModel.submitChanges({ groupId: "batchCreate", 
              success: function(oData, oResponse) {
                this.getView().setBusy(false);
                this._showLogFornecimento(oData);
              }.bind(this),
              error: function(oError) {
                this.getView().setBusy(false);
              }.bind(this)
        });
    },
    
    _showLogFornecimento: function(oObject) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
        oBillingData.Log = [];
        
        oObject.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
            if (oResponse.headers["custom-return"]) {
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]) || [];
              var sIconType  = "";
              var sIconColor = "";
              var sMessage   = "";
              
              oBillingReturn.forEach(function(e) {
              sMessage = this._convertMessage(e.message)

                switch (e.type) {
                  case "S":
                    sMessage = "Documento " + e.messageV1 + " criado com sucesso!";
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

                oBillingData.Log.push({
                  SalesOrder: oResponse.data.Vbeln,
                  DeliveryDocument: e.messageV1,
                  BillingDocument: "",
                  FiscalNote: "",
                  MessageType: sIconType,
                  MessageColor: sIconColor,
                  Message: sMessage
                });
              }.bind(this));
            }
          }.bind(this));        

      this.getView().getModel("BillingModel").refresh(true);
      this._getBillingLogDialog("Log Fornecimento").open();
    },
/* D0012620 - Alocação de Estoque  Fornecimento - Fim */ 
    
/* D0012620 - Alterar processo de consulta de fluxo de documentos */
  _showDialogFluxos: function() {
    var aSelectedContexts = this.getView().byId("List").getSelectedContexts();

        if (aSelectedContexts.length === 0) {
          MessageBox.error("Nenhum item foi selecionado");
          return;
        }
        
        if (aSelectedContexts.length > 1) {
          MessageBox.error("Selecionar apenas um item!");
          return;
        }

    var aFilters = [];
      aFilters.push(new sap.ui.model.Filter("Docnum", sap.ui.model.FilterOperator.EQ, aSelectedContexts[0].getObject().Ordem));
      
      this.getView().setBusy(true);
      
      this.getModel().read("/FloxoOvSet", {
          filters: aFilters,
          success: function (odata) {
            this.getView().setBusy(false);

            if (odata.results.length === 0) {
                MessageBox.error("Nenhum registro encontrato");
                return;
            }

            var aList = odata.results;
            var aRoot = aList.filter(function(e) { return !e.Docnuv });

            aRoot.forEach(function(e) {
              var aChildren = aList.filter(function(x) { return x.Docnuv === e.Docnum });

              if (aChildren.length > 0) {
                e.nodes = this._getChildren(aChildren, aList);
              }
            }.bind(this));

            var json = { "nodes": aRoot };
                            
            var oModel = new sap.ui.model.json.JSONModel();
              var oData  = {};
              
              oData.Fluxos = json;
              oModel.setData(oData);                  
              
              if (this._oDialog) {
                this._oDialog.destroy();
              }
              
              this._oDialog = sap.ui.xmlfragment("arcelor.view.Fluxo", this);
              this._oDialog.setModel(oModel);
              this._oDialog.open();
          }.bind(this)
      });
  },

  _getChildren: function(aChildren, aList) {
    aChildren.forEach(function(e) {
      var aNodes = aList.filter(function(x) { return x.Docnuv === e.Docnum });

      if (aNodes.length > 0 && e.Docnum !== e.Docnuv) {
        e.nodes = aNodes.sort(function(a,b) { return a.Erzet.ms > b.Erzet.ms });
        this._getChildren(aNodes, aList);
      }
    }.bind(this));

    return aChildren;
  },

  statusText: function(sValue) {
    try {
      var texto = sValue;

      switch (sValue) {
        case "concluído":
          texto = "Concluído";
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

      }

      return texto;
    } catch(err) {
      return state;
    }
  },


  statusState: function(sValue) {
    try {
      var state = "None";

      switch (sValue) {
        case "Recusada":
        case "Rejeitada":
          state = "Error";
          break;
        case "concluído":
        case "Autorizada":
          state = "Success";
          break;
        case "Não compensado":
        case "Em processamento":
          state = "Warning";
          break;
        case "C":
          state = "None";
          break;
      }

      return state;
    } catch(err) {
      return state;
    }
  }
/* D0012620 - Alterar processo de consulta de fluxo de documentos */    
  });
});