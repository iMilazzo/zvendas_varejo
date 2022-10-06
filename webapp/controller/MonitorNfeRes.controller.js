sap.ui.define(["arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/Device",
  "arcelor/model/formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/Token",
  "sap/m/MessagePopover",
  "sap/m/MessagePopoverItem",
  "sap/m/Dialog",
  "sap/m/GroupHeaderListItem"
], function (BaseController, JSONModel, History, Filter, FilterOperator, Device, formatter, MessageBox, MessageToast,
  Token, MessagePopover, MessagePopoverItem, Dialog, GroupHeaderListItem) {
  "use strict";


  var _aMotivos = [];

  return BaseController.extend("arcelor.controller.MonitorNfeRes", {

    formatter: formatter,
    onInit: function () {

      this.getOwnerComponent().getRouter().getRoute("MonitorNfeRes").attachMatched(this._onRouteMatched, this);

    },

    onAfterRendering: function () {
      sap.ui.controller("arcelor.controller.Inicio").authControl();
      var thisView = this;
    },
    _onRouteMatched: function (oEvent) {

      if (!oEvent || oEvent.getParameters().name === "MonitorNfeRes") {

        this._loadMotivos();
        this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");

        this.aAllFilters = [];
        // Documento
        if (this.oModelSel.getData().idDoc !== "") {
          this.oFilter = new sap.ui.model.Filter("Docnum", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idDoc);
          this.aAllFilters.push(this.oFilter);
        }

        // NotaFiscal
        if (this.oModelSel.getData().idNotaFiscal !== "") {
          this.oFilter = new sap.ui.model.Filter("Nfenum", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idNotaFiscal);
          this.aAllFilters.push(this.oFilter);
        }

        // Ordem de Venda
        if (this.oModelSel.getData().idOrdem !== "") {
          this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idOrdem);
          this.aAllFilters.push(this.oFilter);
        }

        // Cliente
        if (this.oModelSel.getData().idCodCliente !== "") {
          this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idCodCliente);
          this.aAllFilters.push(this.oFilter);
        }

        // Material
        if (this.oModelSel.getData().idMaterial !== "") {
          this.oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idMaterial);
          this.aAllFilters.push(this.oFilter);
        }

        // Período do Relatório
        if (this.oModelSel.getData().idDataDe !== "" && this.oModelSel.getData().idDataAte !== "") {
          this.oDataDe = this._convDateBrStringToObj(this.oModelSel.getData().idDataDe); //new Date(oJson.idDataDe.slice(6, 10), oJson.idDataDe.slice(3, 5), oJson.idDataDe.slice(0, 2));
          this.oDataAte = this._convDateBrStringToObj(this.oModelSel.getData().idDataAte); //new Date(oJson.idDataAte.slice(6, 10), oJson.idDataAte.slice(3, 5), oJson.idDataAte.slice(0, 2));

          this.oFilter = new sap.ui.model.Filter("Docdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
          this.aAllFilters.push(this.oFilter);
        } else if (this.oModelSel.getData().idDataDe !== "") {
          this.oDataDe = this._convDateBrStringToObj(this.oModelSel.getData().idDataDe); //new Date(oJson.idDataDe.slice(6, 10), oJson.idDataDe.slice(3, 5), oJson.idDataDe.slice(0, 2));

          this.oFilter = new sap.ui.model.Filter("Docdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
          this.aAllFilters.push(this.oFilter);
        }

        // Escritório de Vendas        
        if (this.oModelSel.getData().idEscritorioVendas !== "") {
          this.oFilter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, this.oModelSel.getData().idEscritorioVendas);
          this.aAllFilters.push(this.oFilter);
        }

        var that = this;
        this.getView().setBusy(true);
        var tabela = this.getView().byId("tabela_relatorio");

        tabela.setBusy(true);

        var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
        var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

        oModel.read("/RelMonitorNfeSet", {

          filters: this.aAllFilters,
          success: function (data) {

            var oData = {};
            oData.result = data.results;
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            oModel.setSizeLimit(1000000);
            tabela.setModel(oModel);
            that.getView().setModel(oModel);
            that.getView().setBusy(false);
            tabela.setBusy(false);
            tabela.getItems()[0].focus();

          },
          error: function (erro) {
            that.getView().setBusy(false);
            tabela.setBusy(false);
          }
        });

      }
    },

    onShowReiviarNF: function (oEvent) {
      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);
      var sDocnum = oRow.Docnum;
      var sPath = "/ReiniciarNfSet(Nfe='" + sDocnum + "')";
      var oData = this.getView().getModel();
      var oView = this.getView();
      oView.setBusy(true);
      var that = this;
      var onSuccess = function (odata) {
        oView.setBusy(false);
        MessageBox.information(odata.message);
        that._onRouteMatched();
      };
      var onError = function (odata, response) {
        oView.setBusy(false);
      }
      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      oModel.read(sPath, {
        success: onSuccess,
        error: onError
      });

    },

    onShowSincronizarNF: function (oEvent) {
      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);
      var sDocnum = oRow.Docnum;
      var sPath = "/SincronizarNfeSet(Nfe='" + sDocnum + "')";
      var oData = this.getView().getModel();
      var oView = this.getView();
      oView.setBusy(true);
      var that = this;
      var onSuccess = function (odata) {
        oView.setBusy(false);
        MessageBox.information(odata.message);
        that._onRouteMatched();
      };
      var onError = function (odata, response) {
        oView.setBusy(false);
      }
      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      oModel.read(sPath, {
        success: onSuccess,
        error: onError
      });

    },

    onShowReimprimirNF: function (oEvent) {
      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);
      var sDocnum = oRow.Nfenum;
      var sPath = "/CertificadoNfeSet(Nfe='" + sDocnum + "')";
      var oData = this.getView().getModel();
      var oView = this.getView();
      oView.setBusy(true);
      var onSuccess = function (odata) {
        oView.setBusy(false);
        MessageBox.information('Reimpressão do certificado solicitada');
      };
      var onError = function (odata, response) {
        oView.setBusy(false);
      }
      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      oModel.read(sPath, {
        success: onSuccess,
        error: onError
      });

    },

    onShowPopupCancelNF: function (oEvent) {

      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);
      var sDocnum = oRow.Docnum;

      if (!sDocnum) {
        MessageBox.error("Informe o n�mero do documento", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      // Monta os componentes do Dialog
      var oLabel = new sap.m.Label({
        text: 'Motivo',
        labelFor: 'motivo',
        width: '100%'
      });
      var oComboBox = new sap.m.ComboBox('motivo', {
        showSecondaryValues: true,
        filterSecondaryValues: true,
        width: '100%'
      });

      for (var i = 0; i < _aMotivos.length; i++) {
        var oItem = new sap.ui.core.ListItem(i);
        var motivo = _aMotivos[i];

        oItem.setKey(motivo.Id);
        oItem.setText(motivo.Descricao);
        oItem.setAdditionalText(motivo.Id);

        oComboBox.addItem(oItem);
      }

      // Cria o Dialog
      var dialog = new Dialog({
        title: 'Cancelar Nota Fiscal',
        type: 'Message',
        contentWidth: "30%",
        contentHeight: "20%",
        content: [oLabel, oComboBox],
        beginButton: new sap.m.Button({
          text: 'Confirmar',
          type: 'Default',
          press: function () {
            var sMotivo = sap.ui.getCore().byId("motivo").getSelectedKey();

            if (!sMotivo) {
              MessageBox.error("Motivo é obrigatório", {
                title: "ArcelorMittal",
                styleClass: "sapUiSizeCompact"
              });
              return;
            }

            MessageBox.confirm('Confirma o cancelamento da nota fiscal?', {
              title: 'Confirmar',
              onClose: function (oAction) {
                if (oAction == 'OK') {
                  this._cancelNotaFiscal(sDocnum, sMotivo, that);
                  dialog.close();
                }
              }.bind(this),
              initialFocus: 'CANCEL'
            });
          }.bind(this)
        }),
        endButton: new sap.m.Button({
          text: 'Cancelar',
          type: "Default",
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function () {
          dialog.destroy();
        }
      });

      dialog.open();
    },

    _cancelNotaFiscal: function (sDocnum, sMotivo, that) {
      var oParameters = {
        Docnum: sDocnum,
        Motivo: sMotivo
      };

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

      var tabela = that.getView().byId("tabela_relatorio");
      tabela.setBusy(true);
      that.getView().setBusy(true);

      oModel.callFunction("/CancelarNotaFiscal", {
        method: "GET",
        urlParameters: oParameters,
        success: function (oData) {

          tabela.setBusy(false);
          that.getView().setBusy(false);

          MessageBox.information(oData.Message, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        },
        error: function (oError) {
          MessageBox.error("Não foi possivel cancelar a nota, favor verificar");
          tabela.setBusy(false);
          that.getView().setBusy(false);
        }
      });
    },

    _loadMotivos: function () {
      _aMotivos = [];

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

      oModel.read("/MotivoCancelNFSet", {
        success: function (results, oResponse) {
          if (results.results) {
            results.results.forEach(function (e) {
              _aMotivos.push({
                Id: e.Reason,
                Descricao: e.Reason1
              });
            });
          }
        },
        error: function (oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    onShowPopupCarta: function (oEvent) {

      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);
      var sDocnum = oRow.Docnum;
      var dataAtual = new Date();
      var sData = dataAtual.toLocaleDateString(oRow.Docdat);
      // Monta os componentes do Dialog

      let oPlaca = sap.ui.getCore().byId("placa");
      if (typeof (oPlaca) === "undefined") {
        var oLabelNfed = new sap.m.Label({
          text: "Número Nf-e:",
          labelFor: 'nfe1',
          width: '20%'
        });
        var oLabelNfe = new sap.m.Label({
          id: 'Nfe',
          text: oRow.Nfenum,
          labelFor: 'nfe',
          width: '20%'
        });
        var oLabelDtd = new sap.m.Label({
          text: 'Data emissão:',
          labelFor: 'data1',
          width: '20%'
        });
        var oLabelDt = new sap.m.Label({
          id: 'data',
          text: sData,
          labelFor: 'data',
          width: '40%'
        });
        var oLabel1 = new sap.m.Label({
          text: 'Placa/Região:',
          labelFor: 'placa',
          width: '20%'
        });
        var oInput1 = new sap.m.Input({
          id: 'placa',
          width: '40%',
          height: "90%"
        });
        var oLabel2 = new sap.m.Label({
          text: '',
          labelFor: 'regio',
          width: '5%'
        });
        var oInput2 = new sap.m.Input({
          id: 'regiao',
          width: '30%',
          height: "90%"
        });
        var oLabel3 = new sap.m.Label({
          text: 'Cei:',
          labelFor: 'cei',
          width: '20%'
        });
        var oInput3 = new sap.m.Input({
          id: 'cei',
          width: '70%',
          height: "90%",
          width: '75%'
        });
        var oLabel4 = new sap.m.Label({
          text: 'Endereço:',
          labelFor: 'endereco',
          width: '20%'
        });
        var oInput4 = new sap.m.Input({
          id: 'end',
          width: '70%',
          height: "90%",
          width: '75%'
        });
        var oLabel5 = new sap.m.Label({
          text: 'Inf.Adicionais:',
          labelFor: 'inf',
          width: '20%'
        });
        var oInput5 = new sap.m.Input({
          id: 'inf',
          width: '70%',
          height: "90%",
          width: '75%'
        });
      } else {
        sap.ui.getCore().byId("placa").setValue("");
        sap.ui.getCore().byId("regiao").setValue("");
        sap.ui.getCore().byId("cei").setValue("");
        sap.ui.getCore().byId("end").setValue("");
        sap.ui.getCore().byId("inf").setValue("");
        sap.ui.getCore().byId("Nfe").setText("");
      }

      // Cria o Dialog
      var dialog = new Dialog({
        title: 'Criar Carta Correção',
        type: 'Message',
        contentWidth: "40%",
        contentHeight: "40%",
        content: [oLabelNfed, oLabelNfe, oLabelDtd, oLabelDt, oLabel1, oInput1, oLabel2, oInput2, oLabel3, oInput3, oLabel4, oInput4,
          oLabel5, oInput5
        ],
        beginButton: new sap.m.Button({
          text: 'Enviar CC-e',
          type: 'Default',
          press: function () {

            var sPlaca = sap.ui.getCore().byId("placa").getValue();
            var sRegio = sap.ui.getCore().byId("regiao").getValue();
            var sCei = sap.ui.getCore().byId("cei").getValue();
            var sEnd = sap.ui.getCore().byId("end").getValue();
            var SInf = sap.ui.getCore().byId("inf").getValue();
            var SNfenum = sap.ui.getCore().byId("Nfe").getText();

            this._criaCarta(sPlaca, sRegio, sCei, sEnd, SInf, SNfenum, that);
            dialog.close();

          }.bind(this)
        }),
        endButton: new sap.m.Button({
          text: 'Cancelar',
          type: "Default",
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function () {
          dialog.destroy();
        }
      });

      dialog.open();
    },

    _criaCarta: function (sPlaca, sRegio, sCei, sEnd, SInf, SNfenum, that) {

      var tabela = that.getView().byId("tabela_relatorio");
      tabela.setBusy(true);
      that.getView().setBusy(true);
      var flag = "A";

      this.aAllFilters = [];

      if (sPlaca !== "") {
        this.oFilter = new sap.ui.model.Filter("Placa", sap.ui.model.FilterOperator.EQ, sPlaca);
        this.aAllFilters.push(this.oFilter);
        flag = "X";
      }

      if (sRegio !== "") {
        this.oFilter = new sap.ui.model.Filter("Regio", sap.ui.model.FilterOperator.EQ, sRegio);
        this.aAllFilters.push(this.oFilter);
        flag = "X";
      }

      if (sCei !== "") {
        this.oFilter = new sap.ui.model.Filter("Cei", sap.ui.model.FilterOperator.EQ, sCei);
        this.aAllFilters.push(this.oFilter);
        flag = "X";
      }

      if (sEnd !== "") {
        this.oFilter = new sap.ui.model.Filter("Endereco", sap.ui.model.FilterOperator.EQ, sEnd);
        this.aAllFilters.push(this.oFilter);
        flag = "X";
      }

      if (SInf !== "") {
        this.oFilter = new sap.ui.model.Filter("Inf", sap.ui.model.FilterOperator.EQ, SInf);
        this.aAllFilters.push(this.oFilter);
        flag = "X";
      }

      if (SNfenum !== "") {
        this.oFilter = new sap.ui.model.Filter("Nfenum", sap.ui.model.FilterOperator.EQ, SNfenum);
        this.aAllFilters.push(this.oFilter);
      }

      if (flag == "A") {
        MessageBox.error("Favor preencher pelo menos um campo", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
        tabela.setBusy(false);
        that.getView().setBusy(false);
        return;
      }

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

      oModel.read("/CartaCorrecaoSet", {

        filters: this.aAllFilters,
        success: function (oData) {

          tabela.setBusy(false);
          that.getView().setBusy(false);

          MessageBox.information(oData.results[0].Mensagem, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        },
        error: function (oError) {
          MessageBox.error("Não foi possivel criar a carta");
          tabela.setBusy(false);
          that.getView().setBusy(false);
        }
      });
    },

    onNotaFiscalFrag: function (oEvent) {

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);

      sessionStorage.setItem("ViewBack", "MonitorNfeRes");

      this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
        mode: "Change",
        fatura: oRow.Vbelv
      }, true);
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("MonitorNfePesq", null, true);
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onImprimirPress: function (oEvent) {

      var that = this;

      if (this.getView().byId("tabela_relatorio").getSelectedItem() == null) {

        MessageBox.information("Selecionar uma linha", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });

        return;
      }

      var sPatch = this.getView().byId("tabela_relatorio").getSelectedItem().getBindingContext().getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel();
      var oRow = oModel.getProperty(sPatch);

      this.aAllFilters = [];
      // Documento
      if (oRow.Docnum !== "") {
        this.oFilter = new sap.ui.model.Filter("Docnum", sap.ui.model.FilterOperator.EQ, oRow.Docnum);
        this.aAllFilters.push(this.oFilter);
      } else {
        MessageBox.information("Número do documento vazio", {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      var sPathM = "/ReimprimirNFSet(Docnum='" + oRow.Docnum + "')/$value"
      var spath2 = window.location.origin + sUrl;
      var sUrl2 = spath2 + sPathM;

      var tabela = that.getView().byId("tabela_relatorio");
      tabela.setBusy(true);
      that.getView().setBusy(true);

      oModel.read(sPathM, {

        success: function (oData) {

          tabela.setBusy(false);
          that.getView().setBusy(false);

          MessageBox.information("Nota Reimpressa!", {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        },
        error: function (oError) {
          if (oError.message == 'no handler for data') {
            window.open(sUrl2);
          } else {
            MessageBox.error("Não foi possivel abrir o arquivo");
          }

          tabela.setBusy(false);
          that.getView().setBusy(false);
        }
      });

    }

  });

});