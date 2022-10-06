sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
    "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, MessageBox, MessageToast, Filter, FilterOperator) {
  "use strict";

  return BaseController.extend("arcelor.controller.CancelarFornecimento", {

    onInit: function () {
      this.getView().setModel(new JSONModel(), "view");
      this.getRouter().getRoute("CancelarFornecimento").attachPatternMatched(this._onObjectMatched.bind(this), this);
    },

    _onObjectMatched: function (oEvent) {
      var oParameters = oEvent.getParameters();

      if (oParameters.arguments.mode !== "Change") {
        this.onClear();
      }
    },

    onClearFilters: function() {
      this.byId("multiinput-ordem").setValue("");
      this.byId("multiinput-ordem").setTokens([]);
      this.byId("input-Cliente").setValue(null);
      this.byId("multiinput-remessa").setValue("");
      this.byId("multiinput-remessa").setTokens([]);
      this.byId("input-remessa").setValue("");
      this.byId("input-remessa").setDateValue(null);
    },

    onClear: function () {
      this.onClearFilters();
      this.byId("button-eliminar").setEnabled(false);

      var oModel = this.getView().getModel("fornecimentos");
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
          sap.ui.controller("arcelor.controller.Inicio").authControl();
          this._attachIconRendering(this.byId("icon1"), null);
          this._attachIconRendering(this.byId("icon2"), null);
          this._attachIconRendering(this.byId("icon3"), null);
      },

      _attachIconRendering: function (iconId, classe) {
          iconId.addEventDelegate({
            onAfterRendering: function (oEvent) {
              var sStatus = oEvent.srcControl.data("status");

              if (sStatus === "C") {
                sStatus = "LL1";
              } else if (sStatus === "A" || sStatus === "B") {
                sStatus = "CL0";
              } else {
                sStatus = "RL1";
              }
 
              var sStatusClass = (sStatus && sStatus.length > 0 ? "statusUiIcon" + sStatus : "");
              let icone = oEvent.srcControl;
              icone.removeStyleClass("statusUiIconL1");
              icone.removeStyleClass("statusUiIconL2");
              icone.removeStyleClass("statusUiIconL3")
              icone.addStyleClass(sStatusClass);
            }
          });
      },

    onNavBack: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("logistica", {
        mode: "Change"
      }, true);
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

      onAddTokenOrdem: function () {

          var oMultiInput = this.getView().byId("multiinput-ordem");
          var tokens = oMultiInput.getTokens();

          var value = oMultiInput.getValue();

          if (value !== "") {

            if ($.isNumeric(value)) {

              if (value.length <= 10) {

                oMultiInput.setValue("");
                var token = new sap.m.Token({
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
        
      onAddTokenRemessa: function () {

          var oMultiInput = this.getView().byId("multiinput-remessa");
          var tokens = oMultiInput.getTokens();
          
          var value = oMultiInput.getValue();

          if (value !== "") {

            if ($.isNumeric(value)) {

              if (value.length <= 10) {

                oMultiInput.setValue("");
                var token = new sap.m.Token({
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
        
        onSearch: function (oEvent) {
      var aFilters = this._createFilter();

      var oFilterVgbel = aFilters.filter(function(e) { return e.sPath === "Vgbel" })[0];
      var oFilterVbeln = aFilters.filter(function(e) { return e.sPath === "Vbeln" })[0];
      var oFilterLfdat = aFilters.filter(function(e) { return e.sPath === "Lfdat" })[0];

      if (!oFilterVgbel && !oFilterVbeln && !oFilterLfdat) {
        MessageBox.error("Data da Remessa é obrigatória", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      this.getView().setBusy(true);

      this.getModel().read("/FornecimentoSet", {
        filters: aFilters,
        success: function(oResultData, oResponse) {
          this.getView().setBusy(false);

          var aItens = oResultData.results;

          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setSizeLimit(aItens.length);
          oModel.setData(aItens);

          this.getView().setModel(oModel, "fornecimentos");
          this.byId("button-eliminar").setEnabled(aItens.length > 0);
          this.byId("button-alterar").setEnabled(aItens.length > 0);

        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    onOrdemVendaPress: function(oEvent) {
      var oSource = oEvent.getSource();
      var sPath   = oEvent.getSource().getParent().getBindingContextPath();
      var oModel  = oSource.getModel("fornecimentos");
      var oItem   = oModel.getProperty(sPath);

      sessionStorage.setItem("ViewBack", "CancelarFornecimento");
          this.getOwnerComponent().getRouter().navTo("Vendas", {
              mode: "Change",
              salesorder: oItem.Vgbel
          }, true);
      },
      
      onFornecimentoPress: function(oEvent) {
      var oSource = oEvent.getSource();
      var sPath   = oEvent.getSource().getParent().getBindingContextPath();
      var oModel  = oSource.getModel("fornecimentos");
      var oItem   = oModel.getProperty(sPath);

          this.getOwnerComponent().getRouter().navTo("Fornecimento", {
              vgbel: oItem.Vgbel,
            vbeln: oItem.Vbeln
          }, true);
      },

        onSearch_sales: function () {
      this.byId("List").removeSelections();
      var thisView = this;
      var sVbeln = sessionStorage.getItem("sVbeln");
      var filters = [];
      var filter;
      var value;
      this.byId("input-Tdnlr").setVisible(false);
      this.byId("input-SIGNI").setVisible(false);
      this.byId("input-DtMerc").setVisible(false);
      this.byId("input-Tdnlr1").setVisible(true);
      this.byId("input-SIGNI1").setVisible(true);
      this.byId("input-DtMerc1").setVisible(true);


      if (sVbeln.length > 0) {
        var ordem;
        ordem = sVbeln;
        filter = new sap.ui.model.Filter("Tknum", sap.ui.model.FilterOperator.BT, ordem, 'X');
        filters.push(filter);
      }
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
      this.getModel().read("/transporteSet", {
        filters: filters,
        success: function (oSalesOrders) {
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
onAlterar: function () {
    var aFilters_1 = [];
    var Vbeln = this.getView().byId('List').getSelectedItem().getCells()[2].getTitle();
    aFilters_1.push(Vbeln);
    var a = new Date('04-04-2022');
                sessionStorage.setItem("sVbeg", Vbeln);
                sessionStorage.setItem("sRetorno", Vbeln);
   this.getOwnerComponent().getRouter().navTo("transporteres");
},
    onEliminar: function (oEvent) {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();

      if (aSelectedContexts.length === 0) {
        MessageBox.error("Selecionar pelo menos 1 item!");
            return;
          }

      var sMessage = "Confirma a eliminação da remessa?";
      var sWbstk   = "";
      var bConfEstForn = true;
      var bConfEstSm   = false;

      var aRemessas = [];

            aSelectedContexts.forEach(function(e) {
          if (e.getObject().Wbstk === "B" || e.getObject().Wbstk === "C") {
            sMessage = "Saída de Mercadoria já foi realizada. Confirma estorno da Saída de Mercadoria?";
            bConfEstForn = false;
            bConfEstSm   = true;
          }

              aRemessas.push({ 
                DelivNumb: e.getObject().Vbeln,
            ConfEstForn: bConfEstForn,
            ConfEstSm: bConfEstSm
              });
            });
                        
      MessageBox.confirm(sMessage, {
        title: "Confirmar",
        onClose: function (oAction) {
          if (oAction === "OK") {
            this._eliminarRemessas(aRemessas);
          }
        }.bind(this),
        initialFocus: "CANCEL"
      });            
    },

    _eliminarRemessas: function(aRemessas) {
            this.getView().setBusy(true);

            var oModel = this.getModel();
            oModel.setDeferredGroups(["batchDelete"]);        
                
        aRemessas.forEach(function(e) {
           var oEntry = {
             DelivNumb: e.DelivNumb,
             ConfEstForn: e.ConfEstForn,
             ConfEstSm: e.ConfEstSm
           };
           oModel.create("/FornecimentoItemSet", oEntry, { groupId: "batchDelete" });
        });
                
            oModel.submitChanges({ groupId: "batchDelete", 
                  success: function(oData, oResponse) {
                    this.getView().setBusy(false);
                    this.showLogFornecimento(oData);
                  }.bind(this),
                  error: function(oError) {
                    this.getView().setBusy(false);
                  }.bind(this)
            });
    },

      showLogFornecimento: function(oObject) {
        var aFornecimentos = this.getView().getModel("fornecimentos").getData();
        var oBillingData = this.getView().getModel("BillingModel").getData();
          oBillingData.Log = [];
          
          
          oObject.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
              if (oResponse.headers["custom-return"]) {
                var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]) || [];
                var sIconType  = "";
                var sIconColor = "";
                
                oBillingReturn.forEach(function(e) {
                    switch (e.type) {
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
                    
                    var oItem = aFornecimentos.filter(function(x) { return x.Vbeln === e.delivNumb })[0]; 

                  oBillingData.Log.push({
                    SalesOrder: oItem.Vgbel,
                    DeliveryDocument: e.delivNumb,
                    BillingDocument: "",
                    FiscalNote: "",
                    MessageType: sIconType,
                    MessageColor: sIconColor,
                    Message: this._convertMessage(e.message)
                  });
                }.bind(this));
              }
            }.bind(this));        

        this.getView().getModel("BillingModel").refresh(true);
        this._getBillingLogDialog().open();
      },
      
      _getBillingLogDialog: function() {
          if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment("arcelor.view.FaturamentoLog", this);
            this.getView().addDependent(this._oDialog);
          }
          
          this._oDialog.setTitle("Log Faturamento");
          
          return this._oDialog;
        },
        
        onConfirmPopup: function (oEvent) {
          this._getBillingLogDialog().close();            
        },
        
        _convertMessage: function (sMessage) {
            var tTextArea = document.createElement('textarea');
            tTextArea.innerHTML = sMessage;
            return tTextArea.value;
        },         

    _createFilter: function () {
      var aFilters = [],
          aSelectedItems,
        dDateFrom,
        dDateTo,
        sValue;

      if (this.getView().byId("multiinput-ordem").getTokens()) {
        aSelectedItems = this.getView().byId("multiinput-ordem").getTokens();

        if (aSelectedItems.length) {
          for (var i = 0; i < aSelectedItems.length; i++) {
            sValue = aSelectedItems[i].getText();
            aFilters.push(new Filter("Vgbel", FilterOperator.EQ, sValue));
          }
        }
      }

      if (this.byId("input-Cliente").getValue()) {
        sValue = this.byId("input-Cliente").getValue();
        aFilters.push(new Filter("Kunnr", FilterOperator.EQ, sValue));
      }

      if (this.getView().byId("multiinput-remessa").getTokens()) {
        aSelectedItems = this.getView().byId("multiinput-remessa").getTokens();

        if (aSelectedItems.length) {
          for (var i = 0; i < aSelectedItems.length; i++) {
            sValue = aSelectedItems[i].getText();
            aFilters.push(new Filter("Vbeln", FilterOperator.EQ, sValue));
          }
        }
      }

      if (this.getView().byId("input-remessa").getDateValue()) {
        dDateFrom = this.getView().byId("input-remessa").getFrom();
        dDateTo   = this.getView().byId("input-remessa").getTo();

        if (dDateFrom) {
          if (dDateTo) {
            aFilters.push(new Filter("Lfdat", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
          } else {
            aFilters.push(new Filter("Lfdat", FilterOperator.EQ, dDateFrom));
          }
        }
      }

      return aFilters;
    },

    statusCmgst: function(value) {
      var status;

      switch (value) {
        case "A":
          status = "Verif.crédito foi efetuada, operação oK";
          break;
        case "B":
          status = "Verif.crédito foi efetuada, operação não oK";
          break;
        case "C":
          status = "Verif.crédito efetuada, operação não oK, liberação parcial";
          break;
        case "D":
          status = "Operação liberada pelo responsável crédito"
          break;
        default:
          status = "Verif.crédito não foi efetuada/status não foi definido";
      }

      return status;
    },

      statusText: function (value) {
          var texto = "";

          switch (value) {
            case "A":
            case "B":
              texto = "Em Processamento";
              break;
            case "C":
              texto = "Concluído";
              break;
            default:
              texto = "Não relevante"
              break;
          }

          return texto;
        },

      status: function (value) {
          var icone = "";

          switch (value) {
            case "A":
            case "B":
              icone = "sap-icon://status-inactive";
              break;
            case "C":
              icone = "sap-icon://status-positive";
              break;
            default:
              icone = "sap-icon://status-critical";
              break;
          }

          return icone;
        }   
  });
});