sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "arcelor/model/formatter",
  "sap/m/Popover",
  "sap/m/Button"
], function (Controller, History, formatter, Popover, Button) {

  "use strict";
  var bError = false;

  return Controller.extend("arcelor.controller.BaseController", {

    /**
     * Convenience method for accessing the router in every controller of the application.
     * @public
     * @returns {sap.ui.core.routing.Router} the router for this component
     */
    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    getRouterVarejo: function () {
      return this.getRouter();
    },

    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function (sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function () {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    /**
     * Event handler for navigating back.
     * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the master route.
     * @public
     */
    onNavBack: function () {
      var sPreviousHash = History.getInstance().getPreviousHash(),
        oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

      if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
        history.go(-1);
      } else {
        this.getRouter().navTo("master", {}, true);
      }
    },

    utilFormatterCPFCNPJ: function (sValue, sTipo) {
      var retorno = "";

      if (sTipo === "F") {
        retorno = sValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
      } else {
        retorno = sValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3\/\$4\-\$5");
      }

      return retorno;
    },

    _loadFilterRelOvsLimbo: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Emissor da OV
      if (oJson.idEmissorOrdemDe !== "" && oJson.idEmissorOrdemAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.BT, oJson.idEmissorOrdemDe, oJson.idEmissorOrdemAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idEmissorOrdemDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oJson.idEmissorOrdemDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Doc. Vendas
      if (oJson.idDocVendasDe !== "" && oJson.idDocVendasAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.BT, oJson.idDocVendasDe, oJson.idDocVendasAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDocVendasDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oJson.idDocVendasDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Escrit�rio de Vendas / Vendedor
      if (oJson.idComboBoxEscritVendasVenDe !== "" && oJson.idComboBoxEscritVendasVenAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Escrvend", sap.ui.model.FilterOperator.BT, oJson.idComboBoxEscritVendasVenDe, oJson.idComboBoxEscritVendasVenAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxEscritVendasVenDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Escrvend", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxEscritVendasVenDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Vendedor
      if (oJson.idVendedorDe !== "" && oJson.idVendedorAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.BT, oJson.idVendedorDe, oJson.idVendedorAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idVendedorDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.EQ, oJson.idVendedorDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var that = this;
      var tabela = oViewReport.byId("tabela_relatorio");
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);

      this.getModel().read("/RelOvsLimboSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          tabela.setModel(oModel);
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        },
        error: function (error) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },

    utilFormatterCPFCNPJClear: function (sValue) {
      return sValue.replace(/\D+/g, '');
    },

    utilClearCharToNumber: function (sValue) {
      if (typeof sValue != "undefined") {
        return sValue.replace(/\D+/g, '');
      }
      return "";
    },

    _formatarHorario: function (pTime) {
      var oTimeStr = "00:00:00";
      if (pTime) {
        var ms = pTime.ms % 1000;
        pTime.ms = (pTime.ms - ms) / 1000;
        var secs = pTime.ms % 60;

        pTime.ms = (pTime.ms - secs) / 60;
        var mins = pTime.ms % 60;
        var hrs = (pTime.ms - mins) / 60;
        if (secs.toString().length == 1) {
          secs = "0" + secs
        };
        if (mins.toString().length == 1) {
          mins = "0" + mins
        };
        if (hrs.toString().length == 1) {
          hrs = "0" + hrs
        };
        var oTimeStr = hrs + ':' + mins + ':' + secs;
      }

      return oTimeStr;
    },

    utilFormatterCPFCNPJClearSearch: function (sValue) {
      var exp = /\-|\.|\/|\(|\)| /g;
      var campoSoNumeros = sValue.toString().replace(exp, "");
      return campoSoNumeros;
    },

    utilFormatterCEP: function (sValue) {
      return sValue.replace(/^([\d]{5})([\d]{3})/, "$1-$2");
    },

    utilFormatterTelefone: function (sValue) {
      sValue = sValue.replace(/\D/g, ""); // Remove tudo o que nao � digito
      sValue = sValue.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parenteses em volta dos tres primeiros d�gitos
      sValue = sValue.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca h�fen entre o quarto e o quinto d�gitos
      return sValue;
    },

    _requiredFieldSimple: function (oView, pFieldName) {
      bError = false;

      if (oView.byId(pFieldName).getValue() === "") {
        sap.m.MessageToast.show(this._loadI18n(this.getView(), "preencherCamposObrig"));
        oView.byId(pFieldName).setValueState(sap.ui.core.ValueState.Error);
        oView.byId(pFieldName).focus();
        bError = true;
      } else {
        oView.byId(pFieldName).setValueState(sap.ui.core.ValueState.None);
      }

      return bError;
    },

    _loadI18n: function (oView, pTextId) {
      return oView.getModel("i18n").getResourceBundle().getText(pTextId);
    },

    _loadFilterRelInfoComercial: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Centro
      if (oJson.idComboBoxCentro !== "") {
        this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxCentro);
        this.aAllFilters.push(this.oFilter);
      }
      // Cond. Grupo de Materiais
      if (oJson.idComboBoxGrupoMateriaisDe !== "" && oJson.idComboBoxGrupoMateriaisAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.BT, oJson.idComboBoxGrupoMateriaisDe, oJson.idComboBoxGrupoMateriaisAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxGrupoMateriaisDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxGrupoMateriaisDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Setor de Atividade
      if (oJson.idComboBoxSetorAtivDe !== "" && oJson.idComboBoxSetorAtivAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Setor", sap.ui.model.FilterOperator.BT, oJson.idComboBoxSetorAtivDe, oJson.idComboBoxSetorAtivAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxSetorAtivDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Setor", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxSetorAtivDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      oViewReport.byId("__label2").setText("Abrang�ncia ");
      //Bind new table 
      var tabela = oViewReport.byId("tabela_relatorio");
      oViewReport.setBusy(true);
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);
      tabela.setBusy(true);

      this.getModel().read("/RelInfoComercialSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);

          if (data.results.length > 0) {
            oViewReport.byId("__label2").setText("Abrang�ncia: " + data.results[0].Werks);
          }

          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },

    _loadFilterRelTabelaPreco: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Centro
      if (oJson.idComboBoxCentro !== "") {
        this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxCentro);
        this.aAllFilters.push(this.oFilter);
      }
      // Vers�o
      if (oJson.idComboBoxVersao !== "") {
        this.oFilter = new sap.ui.model.Filter("Vrsio", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxVersao);
        this.aAllFilters.push(this.oFilter);
      }
      // Cond. Grupo de Materiais
      if (oJson.idComboBoxGrupoMateriaisDe !== "" && oJson.idComboBoxGrupoMateriaisAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.BT, oJson.idComboBoxGrupoMateriaisDe, oJson.idComboBoxGrupoMateriaisAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxGrupoMateriaisDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Kondm", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxGrupoMateriaisDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Canal de Distribui��o
      if (oJson.idComboBoxCanalDistrDe !== "" && oJson.idComboBoxCanalDistrAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.BT, oJson.idComboBoxCanalDistrDe, oJson.idComboBoxCanalDistrAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxCanalDistrDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxCanalDistrDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Setor de Atividade
      if (oJson.idComboBoxSetorAtivSdDe !== "" && oJson.idComboBoxSetorAtivSdAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.BT, oJson.idComboBoxSetorAtivSdDe, oJson.idComboBoxSetorAtivSdAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxSetorAtivSdDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxSetorAtivSdDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Escritório Vendas
      if (oJson.idCboEscritorioDe !== "" && oJson.idCboEscritorioAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.BT, oJson.idCboEscritorioDe, oJson.idCboEscritorioAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idCboEscritorioDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, oJson.idCboEscritorioDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Com IPI
      if (oJson.idComIpi !== "") {
        this.oFilter = new sap.ui.model.Filter("Op", sap.ui.model.FilterOperator.EQ, "1");
        this.aAllFilters.push(this.oFilter);
      }

      // Data
      if (oJson.idDate !== "") {
        this.oFilter = new sap.ui.model.Filter("Datbi", sap.ui.model.FilterOperator.EQ, new Date(oJson.idDate));
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      //Bind new table 
      var tabela = oViewReport.byId("tabela_relatorio");
      var form = this.formatter;

      oViewReport.setBusy(true);
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);
      tabela.setBusy(true);
      this.getModel().read("/RelTabelaPrecoSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};

          if (oJson.idComIpi !== "") {

            oViewReport.byId("idIpi").setVisible(true);
            oViewReport.byId("idBr").setVisible(true);
            oViewReport.byId("cipi").setVisible(true);
            oViewReport.byId("cbr").setVisible(true);
            oViewReport.byId("sipi").setVisible(false);
            oViewReport.byId("sbr").setVisible(false);

            oViewReport.byId("idIpiS").setVisible(false);
            oViewReport.byId("idBrS").setVisible(false);

          } else {
            oViewReport.byId("idIpi").setVisible(false);
            oViewReport.byId("idBr").setVisible(false);
            oViewReport.byId("idIpiS").setVisible(true);
            oViewReport.byId("idBrS").setVisible(true);

            oViewReport.byId("cipi").setVisible(false);
            oViewReport.byId("cbr").setVisible(false);
            oViewReport.byId("sipi").setVisible(true);
            oViewReport.byId("sbr").setVisible(true);
          }

          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);

          if (data.results.length > 0) {
            oViewReport.byId("__label1").setText("Vers�o: " + data.results[0].Vrsio);
            oViewReport.byId("__label3").setText("Centro: " + data.results[0].Werks + "-" + data.results[0].Name1);
          }

          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },
    _loadFilterRelElimi: function (oViewReport, oJson) {
        this.aAllFilters = [];

        // N�mero da Ordem
        if (oJson.idNumOrdem !== "") {
          this.oFilter = new sap.ui.model.Filter("VBELN", sap.ui.model.FilterOperator.EQ, oJson.idNumOrdem);
          this.aAllFilters.push(this.oFilter);
        }
        // Data da Remessa
        if (oJson.idDataDeCria !== "" && oJson.idDataAteCria !== "") {
          this.oDataDe = oJson.idDataDeCria;
            //this._convDateBrStringToObj(oJson.idDataDeCria);
          this.oDataAte = oJson.idDataAteCria;
            //this._convDateBrStringToObj(oJson.idDataAteCria);

          this.oFilter = new sap.ui.model.Filter("DATEINI", sap.ui.model.FilterOperator.EQ, this.oDataDe);
          this.aAllFilters.push(this.oFilter);
          this.oFilter = new sap.ui.model.Filter("DATEFIM", sap.ui.model.FilterOperator.EQ,  this.oDataAte);
          this.aAllFilters.push(this.oFilter);
        } else if (oJson.idDataDeCria !== "") {
          this.oDataDe = oJson.idDataDeCria;
          //this._convDateBrStringToObj(oJson.idDataDeCria);
          this.oFilter = new sap.ui.model.Filter("DATEINI", sap.ui.model.FilterOperator.EQ, this.oDataDe);
          this.aAllFilters.push(this.oFilter);
        
        }

          // Tipo Relat�rio 
          if (oJson.idTipoEli) {
              this.oFilter = new sap.ui.model.Filter("ELIM", sap.ui.model.FilterOperator.EQ, oJson.idTipoEli);
              this.aAllFilters.push(this.oFilter);        
          }
          if (oJson.idLib) {
              this.oFilter = new sap.ui.model.Filter("LIM", sap.ui.model.FilterOperator.EQ, oJson.idLib);
              this.aAllFilters.push(this.oFilter);        
          }
          if (oJson.idCred) {
              this.oFilter = new sap.ui.model.Filter("LIT", sap.ui.model.FilterOperator.EQ, oJson.idCred);
              this.aAllFilters.push(this.oFilter);        
          }
            
        // Efetua o binding dos dados na Table
        this.oTab = oViewReport.byId("tabRelatorio");
        this.oTabBinding = this.oTab.getBinding("rows");
        this.oTabBinding.oModel.setSizeLimit(1000000);

        this.oTabBinding.oModel.attachRequestSent(function () {
          this.setBusy(true);
        }, oViewReport);

        this.oTabBinding.oModel.attachRequestCompleted(function () {
          this.setBusy(false);
        }, oViewReport);

        this.oTabBinding.filter(this.aAllFilters);

        var that = this;
        var tabela = oViewReport.byId("tabela_relatorio");
        oViewReport.setBusy(true);
        tabela.setBusy(true);

        this.getModel().read("/RelElimiSet", {
          filters: this.aAllFilters,
          success: function (oData) {
            oViewReport.setBusy(false);
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            oModel.refresh(true);
            tabela.setModel(oModel);
            tabela.setVisible(true);
            tabela.setBusy(false);
           // oViewReport.byId("indic").setVisible(false);
          },
          error: function (error) {
            oViewReport.setBusy(false);
            tabela.setBusy(false);
            tabela.setVisible(true);
            oViewReport.byId("indic").setVisible(false);
          }
        });

      },


    
    
    
    
    
    _loadFilterRelOvsCarteira: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Rota
      if (oJson.idComboBoxRotas !== "") {
        this.oFilter = new sap.ui.model.Filter("Rota", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxRotas);
        this.aAllFilters.push(this.oFilter);
      }
      // N�mero da Ordem
      if (oJson.idNumOrdem !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oJson.idNumOrdem);
        this.aAllFilters.push(this.oFilter);
      }
      // Data da Remessa
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Edatu", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Edatu", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Data da criacao
      if (oJson.idDataDeCria !== "" && oJson.idDataAteCria !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDeCria);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAteCria);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDeCria !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDeCria);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // C�digo do Cliente
      if (oJson.idCodCliente !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oJson.idCodCliente);
        this.aAllFilters.push(this.oFilter);
      }
        // Tipo Relat�rio 
        if (oJson.idTipoRel) {
            this.oFilter = new sap.ui.model.Filter("TipoRel", sap.ui.model.FilterOperator.EQ, oJson.idTipoRel);
            this.aAllFilters.push(this.oFilter);        
        }
          
      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var that = this;
      var tabela = oViewReport.byId("tabela_relatorio");
      oViewReport.setBusy(true);
      tabela.setBusy(true);

      this.getModel().read("/RelOvCarteiraSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          oViewReport.setBusy(false);
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.refresh(true);
          tabela.setModel(oModel);
          tabela.setVisible(true);
          tabela.setBusy(false);
          oViewReport.byId("indic").setVisible(false);
        },
        error: function (error) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
          tabela.setVisible(true);
          oViewReport.byId("indic").setVisible(false);
        }
      });

    },

    _loadFilterRelNfPeriodo: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Eletr�nica
      if (oJson.idCheckBoxNfe !== "") {
        this.oFilter = new sap.ui.model.Filter("NfeFlag", sap.ui.model.FilterOperator.EQ, oJson.idCheckBoxNfe);
        this.aAllFilters.push(this.oFilter);
      }
      // Notas Fiscais
      if (oJson.idNotasFiscaisDe !== "" && oJson.idNotasFiscaisAte !== "") {
        if (oJson.idCheckBoxNfe !== "") {
          this.oFilter = new sap.ui.model.Filter("Nfenum", sap.ui.model.FilterOperator.BT, oJson.idNotasFiscaisDe, oJson.idNotasFiscaisAte);
        } else {
          this.oFilter = new sap.ui.model.Filter("Nfnum", sap.ui.model.FilterOperator.BT, oJson.idNotasFiscaisDe, oJson.idNotasFiscaisAte);
        }
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idNotasFiscaisDe !== "") {
        if (oJson.idCheckBoxNfe !== "") {
          this.oFilter = new sap.ui.model.Filter("Nfenum", sap.ui.model.FilterOperator.EQ, oJson.idNotasFiscaisDe);
        } else {
          this.oFilter = new sap.ui.model.Filter("Nfnum", sap.ui.model.FilterOperator.EQ, oJson.idNotasFiscaisDe);
        }
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Docdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Docdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var that = this;
      var tabela = oViewReport.byId("tb_nf");
      var oDataModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZCHSD_VENDASVAREJO_SRV/");

      oViewReport.setBusy(true);
      oDataModel.read("/RelNfPeriodoSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          oViewReport.setBusy(false);
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.refresh(true);
          tabela.setModel(oModel);
        },
        error: function (error) {
          oViewReport.setBusy(false);
        }
      });
    },

    _loadFilterRelGrupo: function (oViewReport, oJson) {
        this.aAllFilters = [];

        // Teste RFC
            // Material
        if (oJson.idComboBoxMaterial !== "") {
          this.oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxMaterial);
          this.aAllFilters.push(this.oFilter);
        }
        if (oJson.idComboBoxTipo !== "") {
            this.oFilter = new sap.ui.model.Filter("Grupo_1", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxTipo);
            this.aAllFilters.push(this.oFilter);
          }
        if (oJson.idComboBoxUnidade !== "") {
            this.oFilter = new sap.ui.model.Filter("UNIT", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxUnidade);
            this.aAllFilters.push(this.oFilter);
          }
        this.oTab = oViewReport.byId("tabRelatorio");
        this.oTabBinding = this.oTab.getBinding("rows");
        this.oTabBinding.oModel.setSizeLimit(1000000);

        this.oTabBinding.oModel.attachRequestSent(function () {
          this.setBusy(true);
        }, oViewReport);

        this.oTabBinding.oModel.attachRequestCompleted(function () {
          this.setBusy(false);
        }, oViewReport);

        this.oTabBinding.filter(this.aAllFilters);

        var that = this;
        var tabela = oViewReport.byId("relatorio_grupo");
        tabela.setModel(new sap.ui.model.json.JSONModel());
        tabela.getModel().refresh(true);

        oViewReport.setBusy(true);
        tabela.setBusy(true);

        this.getModel().read("/GrupoSet", {
          filters: this.aAllFilters,
          success: function (oData) {
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            tabela.setModel(oModel);
            oViewReport.setBusy(false);
            tabela.setBusy(false);
          },
          error: function (error) {
            oViewReport.setBusy(false);
            tabela.setBusy(false);
          }
        });

      },

    
    
    
    
    _loadFilterRelTransferencia: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Tipo de Relat�rio
      if (oJson.idTipoRel !== "") {
        this.oFilter = new sap.ui.model.Filter("Fornecimento", sap.ui.model.FilterOperator.EQ, oJson.idTipoRel);
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo da Pesquisa
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Bedat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Bedat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Material
      if (oJson.idComboBoxMaterial !== "") {
        this.oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxMaterial);
        this.aAllFilters.push(this.oFilter);
      }
      // Excluir Remessa Final
      if (oJson.idCheckBoxExcRemFinal !== "") {
        this.oFilter = new sap.ui.model.Filter("ExcRemessa", sap.ui.model.FilterOperator.EQ, oJson.idCheckBoxExcRemFinal);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var that = this;
      var tabela = oViewReport.byId("relatorio_transferencia");
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);

      this.getModel().read("/RelTransferenciaSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          tabela.setModel(oModel);
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        },
        error: function (error) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },

    _loadFilterRelCancelamentoNfs: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Candat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Candat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      //Bind new table 
      var tabela = oViewReport.byId("tabela_relatorio");
      oViewReport.setBusy(true);
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);
      tabela.setBusy(true);
      var oView = this;
      this.getModel().read("/RelCancelamentoNfsSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          for (var j = 0; j < oData.result.length; j++) {
            oData.result[j].Chatim = oView._formatarHorario(oData.result[j].Chatim);

          };
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);
          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },

    _formatarHorario: function (pTime) {
      var oTimeStr = "00:00:00";
      if (pTime) {
        var ms = pTime.ms % 1000;
        pTime.ms = (pTime.ms - ms) / 1000;
        var secs = pTime.ms % 60;
        pTime.ms = (pTime.ms - secs) / 60;
        var mins = pTime.ms % 60;
        var hrs = (pTime.ms - mins) / 60;
        if (secs.toString().length == 1) {
          secs = "0" + secs
        };
        if (mins.toString().length == 1) {
          mins = "0" + mins
        };
        if (hrs.toString().length == 1) {
          hrs = "0" + hrs
        };
        oTimeStr = hrs + ':' + mins + ':' + secs;
      }

      return oTimeStr;
    },

    _loadFilterRelVolumeVendas: function (oViewReport, oJson) {

      if (oJson.idPeriodoMesAnofim.substring(0, 2) != "") {
        oViewReport.byId("periodo").setText("Per�odo: " + oJson.idPeriodoMesAno + " a " + oJson.idPeriodoMesAnofim);
      } else {
        oViewReport.byId("periodo").setText("Per�odo: " + oJson.idPeriodoMesAno);
      }

      oJson.idPeriodoMesAno = oJson.idPeriodoMesAno.slice(-4) + oJson.idPeriodoMesAno.substring(0, 2)
      oJson.idPeriodoMesAnofim = oJson.idPeriodoMesAnofim.slice(-4) + oJson.idPeriodoMesAnofim.substring(0, 2);

      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Escrit�rio de Vendas / Vendedor
      if (oJson.idComboBoxEscritVendasVen !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxEscritVendasVen);
        this.aAllFilters.push(this.oFilter);
      }
      if (oJson.idVkbur !== "") {
        this.oFilter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, oJson.idVkbur);
        this.aAllFilters.push(this.oFilter);
      }
      //Centro
      if (oJson.idCentro !== "") {
        this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, oJson.idCentro);
        this.aAllFilters.push(this.oFilter);
      }
      // Canal de Distribui��o
      if (oJson.idComboBoxCanalDistr !== "") {
        this.oFilter = new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.Contains, oJson.idComboBoxCanalDistr);
        this.aAllFilters.push(this.oFilter);
      }
      // Grupo de Materiais
      if (oJson.idComboBoxGrupoMateriais !== "") {
        this.oFilter = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxGrupoMateriais);
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo (M�s/Ano)
      if (oJson.idPeriodoMesAno !== "") {
        this.oFilter = new sap.ui.model.Filter("Spmon", sap.ui.model.FilterOperator.Contains, oJson.idPeriodoMesAno);
        this.aAllFilters.push(this.oFilter);
      }

      // Per�odo - fim (M�s/Ano)
      if (oJson.idPeriodoMesAnofim !== "") {
        this.oFilter = new sap.ui.model.Filter("Spmon_fim", sap.ui.model.FilterOperator.Contains, oJson.idPeriodoMesAnofim);
        this.aAllFilters.push(this.oFilter);
      }

      // C�digo do Cliente
      if (oJson.idCodCliente !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.Contains, oJson.idCodCliente);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var tabela = oViewReport.byId("tb_volume_vendas");
      var context = this;
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);
      tabela.setBusy(true);

      this.getModel().read("/RelVolumeVendasSet", {
        filters: this.aAllFilters,
        success: function (oData) {

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.refresh(true);
          tabela.setModel(oModel);
          tabela.setBusy(false);

        },
        error: function (error) {
          tabela.setBusy(false);
        }
      });

    },

    _exportSpreadsheet: function (oTable, aCols) {

      var oExportLibLoadPromise = sap.ui.getCore().loadLibrary("sap.ui.export", true);

      oExportLibLoadPromise.then(function () {
        sap.ui.require(["sap/ui/export/Spreadsheet"], function (Spreadsheet) {

          var oRowBinding,
            oSettings,
            oSheet;

          oRowBinding = oTable.getBinding("rows");

          var oModel = oRowBinding.getModel();
          var oModelInterface = oModel.getInterface();

          oSettings = {
            workbook: {
              columns: aCols
            },
            dataSource: {
              type: "odata",
              dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
              serviceUrl: oModelInterface.sServiceUrl,
              headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
              count: oRowBinding.getLength ? oRowBinding.getLength() : null,
              useBatch: oModelInterface.bUseBatch,
              sizeLimit: oModelInterface.iSizeLimit
            },
            worker: true
          };

          oSheet = new Spreadsheet(oSettings);

          oSheet.build().finally(function () {
            oSheet.destroy();
          });

        });
      });
    },

    utilFormatterNumber: function (sValue) {
      var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        maxFractionDigits: 2,
        groupingEnabled: true,
        groupingSeparator: ",",
        decimalSeparator: "."
      });

      return oNumberFormat.parse(sValue);

    },

    utilFormatterNumberUS: function (sValue) {

      var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        maxFractionDigits: 3,
        groupingEnabled: true,
        groupingSeparator: ".",
        decimalSeparator: ","
      });

      return oNumberFormat.parse(sValue);

    },

    uitlFormatterFieldMoeda: function (sValue) {

      sValue = sValue + '';
      sValue = parseInt(sValue.replace(/[\D]+/g, ''));
      sValue = sValue + '';
      sValue = sValue.replace(/([0-9]{2})$/g, ",$1");
      if (sValue.length > 6) {
        sValue = sValue.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
      }

      return sValue;

    },

    uitlFormatterFieldMoeda2: function (sValue) {

      var formatado = sValue.replace(/\D/g, '');
      formatado = (formatado / 100).toFixed(2) + '';
      formatado = formatado.replace(".", ",");
      formatado = formatado.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
      formatado = formatado.replace(/(\d)(\d{3}),/g, "$1.$2,");

      sValue = formatado;
      return sValue;
    },

    utilFormatterCurrency: function (sValue, sLocale) {

      return sValue.toLocaleString(sLocale);

    },

    utilMonthDateGet: function (sValue) {

      var month;

      switch (sValue) {

      case 0:
        month = '01';
        break;

      case 1:
        month = '02';
        break;

      case 2:
        month = '03';
        break;

      case 3:
        month = '04';
        break;

      case 4:
        month = '05';
        break;

      case 5:
        month = '06';
        break;

      case 6:
        month = '07';
        break;

      case 7:
        month = '08';
        break;

      case 8:
        month = '09';
        break;

      case 9:
        month = '10';
        break;

      case 10:
        month = '11';
        break;

      case 11:
        month = '12';
        break;

      default:
        break;
      }
      return month;
    },

    utilFormatterDateToBR: function (sValue) {

      var date = new Date(sValue);
      date.setDate(date.getDate() + 1);

      var day = date.getDate();
      var month = this.utilMonthDateGet(date.getMonth());
      var year = date.getFullYear();

      return day + '/' + month + '/' + year;

    },

    _convDateBrStringToObj: function (pStringDate) {
      return new Date(pStringDate.slice(6, 10), (pStringDate.slice(3, 5) - 1), pStringDate.slice(0, 2));
    },

    _loadFilterRelVolumeVendasFaturamento: function (oViewReport, oJson) {
      this.aAllFilters = [];

      if (oJson.dataInicial !== "" && oJson.dataFinal !== "") {
        this.oDataDe = new Date(oJson.dataInicial.split("/").reverse().join("-"));
        this.oDataAte = new Date(oJson.dataFinal.split("/").reverse().join("-"))

        this.oFilter = new sap.ui.model.Filter("Sptag", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oFilter = new sap.ui.model.Filter("Sptag", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Escrit�rio de Vendas / Vendedor
      if (oJson.escritorioVendasDe !== "" && oJson.escritorioVendasAte != "") {
        this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.BT, oJson.escritorioVendasDe, oJson.escritorioVendasAte);
        this.aAllFilters.push(this.oFilter);
      } else {
        this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.EQ, oJson.escritorioVendasDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Canal de Distribui��o
      if (oJson.canalDistDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.BT, oJson.canalDistDe, oJson.canalDistAte);
        this.aAllFilters.push(this.oFilter);
      }
      if (oJson.canalDistAte != "") {
        this.oFilter = new sap.ui.model.Filter("Vtweg", sap.ui.model.FilterOperator.Contains, oJson.canalDistAte);
        this.aAllFilters.push(this.oFilter);
      }

      // Setor de Atividade
      if (oJson.idComboBoxSetorAtivDe !== "" && oJson.idComboBoxSetorAtivAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.BT, oJson.idComboBoxSetorAtivDe, oJson.idComboBoxSetorAtivAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idComboBoxSetorAtivDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Spart", sap.ui.model.FilterOperator.EQ, oJson.idComboBoxSetorAtivDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.tabela_relatorio = oViewReport.byId("tabela_relatorio");
      var that = this;
      oViewReport.setBusy(true);

      if (oViewReport.sId.includes("RelVolumeFaturamentoRes")) {
        this.getModel().read("/RelVolumeFatSet", {
          filters: this.aAllFilters,
          success: function (oData) {
            oViewReport.setBusy(false);
            let oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            that.tabela_relatorio.setModel(oModel);
          },
          error: function (oError) {
            //console.log(oError);
          }
        });
      }

      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      var oContext = this;
      oViewReport.setBusy(true);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

    },

    _loadFilterRelVendasDiarias: function (oViewReport, oJson) {

      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Centro
      if (oJson.idCentro !== "") {
        this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, oJson.idCentro);
        this.aAllFilters.push(this.oFilter);
      }
      // Condi��o de Pagamento
      if (oJson.idComboBoxCondPagamento !== "") {
        this.oFilter = new sap.ui.model.Filter("Zterm", sap.ui.model.FilterOperator.Contains, oJson.idComboBoxCondPagamento);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);
      var tabela = oViewReport.byId("tabela_relatorio");
      var oContext = this;
      oViewReport.setBusy(true);

      this.getModel().read("/RelVendasDiariasSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          var cond = false;
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          tabela.setModel(oModel);

          oModel.getData().results.forEach(function (context, i) {
            if (context.ZtermText != cond) {
              var totals = oModel.getData().results.filter((element) => {
                return element.ZtermText == context.ZtermText;
              })
              cond = context.ZtermText;

              var total = totals.reduce((a, b) => {
                return parseFloat(a) + parseFloat(b.Total);
              }, 0);

              var oModelTotal = {
                Xblnr: typeof context.ZtermText == 'undefined' ? "" : context.ZtermText.toString().toUpperCase(),
                Fkdat: "",
                Zterm: context.ZtermText,
                ZtermText: context.ZtermText,
                Quant: "TOTAL: ",
                Total: total,
              };

              oModel.getData().results.push(oModelTotal);
            }
          });

          oModel.refresh(true);
          tabela.setModel(oModel);
          oViewReport.setBusy(false);
        },
        error: function (erro) {
          oViewReport.setBusy(false);
        }
      });

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);
    },

    _loadFilterRelCateiraOvsDet: function (oViewReport, oJson) {

      oViewReport.setBusy(true);

      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }
      // Data de cria��o da O.V.
      if (oJson.idDataCriacaoOrdemDe !== "" && oJson.idDataCriacaoOrdemAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataCriacaoOrdemDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataCriacaoOrdemAte);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataCriacaoOrdemDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataCriacaoOrdemDe);

        this.oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Emissor da OV
      if (oJson.idEmissorOrdemDe !== "" && oJson.idEmissorOrdemAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.BT, oJson.idEmissorOrdemDe, oJson.idEmissorOrdemAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idEmissorOrdemDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oJson.idEmissorOrdemDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Doc. Vendas
      if (oJson.idDocVendasDe !== "" && oJson.idDocVendasAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.BT, oJson.idDocVendasDe, oJson.idDocVendasAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDocVendasDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oJson.idDocVendasDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Status de Cr�dito
      if (oJson.idStatusCreditoDe !== "" && oJson.idStatusCreditoAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Cmgst", sap.ui.model.FilterOperator.BT, oJson.idStatusCreditoDe, oJson.idStatusCreditoAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idStatusCreditoDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Cmgst", sap.ui.model.FilterOperator.Contains, oJson.idStatusCreditoDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Status de Faturamento
      if (oJson.idStatusFaturamentoDe !== "" && oJson.idStatusFaturamentoAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Fksak", sap.ui.model.FilterOperator.BT, oJson.idStatusFaturamentoDe, oJson.idStatusFaturamentoAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idStatusFaturamentoDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Fksak", sap.ui.model.FilterOperator.Contains, oJson.idStatusFaturamentoDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Data Remessa
      if (oJson.idDataRemessaOrdemDe !== "" && oJson.idDataRemessaOrdemAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataRemessaOrdemDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataRemessaOrdemAte);

        this.oFilter = new sap.ui.model.Filter("Edatu", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataRemessaOrdemDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataRemessaOrdemDe);

        this.oFilter = new sap.ui.model.Filter("Edatu", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      //Bind new table carteira
      var tabela = oViewReport.byId("tabela_relatorio");
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);
      this.getModel().read("/RelCarteiraOvsDetSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);
          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });

    },

    _loadFilterRelPagAnt: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }

      // Empresa
      if (oJson.idEmpresaDe !== "" && oJson.idEmpresaAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.BT, oJson.idEmpresaDe, oJson.idEmpresaAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idEmpresaDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.EQ, oJson.idEmpresaDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      //Cliente
      if (oJson.idCodClienteDe !== "" && oJson.idCodClienteAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.BT, oJson.idCodClienteDe, oJson.idCodClienteAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idCodClienteDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oJson.idCodClienteDe);
        this.aAllFilters.push(this.oFilter);
      }
      //Ordem
      if (oJson.idOrdemDe !== "" && oJson.idOrdemAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbel2", sap.ui.model.FilterOperator.BT, oJson.idOrdemDe, oJson.idOrdemAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idOrdemDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Vbel2", sap.ui.model.FilterOperator.EQ, oJson.idOrdemDe);
        this.aAllFilters.push(this.oFilter);
      }

      //Lan�amentos Efetuados
      if (oJson.idCheckBoxEf !== "") {
        this.oFilter = new sap.ui.model.Filter("LancEf", sap.ui.model.FilterOperator.EQ, oJson.idCheckBoxEf);
        this.aAllFilters.push(this.oFilter);
      }
      //Lan�amentos n�o Efetuados
      if (oJson.idCheckBoxNe !== "") {
        this.oFilter = new sap.ui.model.Filter("LancNe", sap.ui.model.FilterOperator.EQ, oJson.idCheckBoxNe);
        this.aAllFilters.push(this.oFilter);
      }
      //Ordem de Vendas Bloqueadas       
      if (oJson.idCheckBoxBl !== "") {
        this.oFilter = new sap.ui.model.Filter("LancBl", sap.ui.model.FilterOperator.EQ, oJson.idCheckBoxBl);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var tabela = oViewReport.byId("tabela_relatorio");
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);
      this.getModel().read("/RelPagAntSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);
          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });
    },

    _loadFilterRelVerificacaoCredito: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Teste RFC
      if (oJson.idTesteRfc !== "") {
        this.oFilter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.Contains, "X");
        this.aAllFilters.push(this.oFilter);
      }

      // Classe
      if (oJson.idClasseDe !== "" && oJson.idClasseAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Ctlpc", sap.ui.model.FilterOperator.BT, oJson.idClasseDe, oJson.idClasseAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idClasseDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Ctlpc", sap.ui.model.FilterOperator.EQ, oJson.idClasseDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Cmngv", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Cmngv", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      //Cliente
      if (oJson.idCodCliente !== "") {
        this.oFilter = new sap.ui.model.Filter("Knkli", sap.ui.model.FilterOperator.EQ, oJson.idCodCliente);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var tabela = oViewReport.byId("tabela_relatorio");
      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);
      this.getModel().read("/RelVerificacaoCreditoSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);
          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.setBusy(false);
          tabela.setBusy(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
        }
      });
    },

    _loadFilterRelFechamentoCaixa: function (oViewReport, oJson) {

      var tabela = oViewReport.byId("tabela_relatorio");
      var tabela_geral = oViewReport.byId("tabela_relatorio_geral");
      tabela_geral.setVisible(false);
      tabela.setVisible(false);

      tabela.setModel(new sap.ui.model.json.JSONModel());
      tabela.getModel().refresh(true);

      tabela_geral.setModel(new sap.ui.model.json.JSONModel());
      tabela_geral.getModel().refresh(true);

      oViewReport.setBusy(true);
      tabela.setBusy(true);
      tabela_geral.setBusy(true);
      var that = this;

      this.aAllFilters = [];

      if (oJson.idCentro.length > 0) {
        for (var l = 0; l < oJson.idCentro.length; l++) {

          this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, oJson.idCentro[l]);
          this.aAllFilters.push(this.oFilter);
        }
      }

      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Pstdat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Pstdat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      if (oJson.idEscritorioVendas.length > 0) {
        for (var i = 0; i < oJson.idEscritorioVendas.length; i++) {

          this.oFilter = new sap.ui.model.Filter("Vkbur", sap.ui.model.FilterOperator.EQ, oJson.idEscritorioVendas[i]);
          this.aAllFilters.push(this.oFilter);
        }
      }
      //Vendedor
      if (oJson.idVendedor.length > 0) {
        for (var j = 0; j < oJson.idVendedor.length; j++) {

          this.oFilter = new sap.ui.model.Filter("Vkgrp", sap.ui.model.FilterOperator.EQ, oJson.idVendedor[j]);
          this.aAllFilters.push(this.oFilter);
        }
      }
      //Condi��o de Pagamento
      if (oJson.idCondicao.length > 0) {
        for (var l = 0; l < oJson.idCondicao.length; l++) {

          this.oFilter = new sap.ui.model.Filter("Zterm", sap.ui.model.FilterOperator.EQ, oJson.idCondicao[l]);
          this.aAllFilters.push(this.oFilter);
        }
      }

      //Detalhado

      this.oFilter = new sap.ui.model.Filter("Detalhado", sap.ui.model.FilterOperator.EQ, oJson.idDetalhe);
      this.aAllFilters.push(this.oFilter);

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      this.getModel().read("/RelFechamentoCaixaSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          var geral = {};
          if (oJson.idDetalhe !== "X") {
            geral = data.results;
            tabela_geral.setVisible(true);
            tabela.setVisible(false);
            oData.result = geral;
          } else {
            oData.result = data.results;
            tabela_geral.setVisible(false);
            tabela.setVisible(true);
          }

          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.setSizeLimit(1000000);
          tabela.setModel(oModel);
          tabela_geral.setModel(oModel);
          oViewReport.byId("tabela_relatorio").getModel().refresh(true);
          oViewReport.byId("tabela_relatorio_geral").getModel().refresh(true);

          oViewReport.setBusy(false);
          tabela.setBusy(false);
          tabela_geral.setBusy(false);
          oViewReport.byId("indic").setVisible(false);

        },
        error: function (erro) {
          oViewReport.setBusy(false);
          tabela.setBusy(false);
          tabela_geral.setBusy(false);
        }
      });
    },

    removeDuplicates: function (array) {

      var sorted = array.slice().sort();
      var result = [];

      sorted.forEach((item, index) => {
        if (sorted[index + 1] !== undefined) {
          if (sorted[index + 1].Zterm !== item.Zterm) {
            result.push(item)
          }
        }
      })
      return result
    },

    _loadFilterRelDadosCobranca: function (oViewReport, oJson) {
      this.aAllFilters = [];

      // Cliente
      if (oJson.idCliente !== "") {
        this.oFilter = new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, oJson.idCliente);
        this.aAllFilters.push(this.oFilter);
      }
      // Banco
      if (oJson.idBancoDe !== "" && oJson.idBancoAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.BT, oJson.idBancoDe, oJson.idBancoAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idBancoDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Hbkid", sap.ui.model.FilterOperator.EQ, oJson.idBancoDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Per�odo do Relat�rio
      if (oJson.idDataDe !== "" && oJson.idDataAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataAte);

        this.oFilter = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataDe);

        this.oFilter = new sap.ui.model.Filter("Bldat", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Data Vencimento
      if (oJson.idDataVencDe !== "" && oJson.idDataVencAte !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataVencDe);
        this.oDataAte = this._convDateBrStringToObj(oJson.idDataVencAte);

        this.oFilter = new sap.ui.model.Filter("Dtvenc", sap.ui.model.FilterOperator.BT, this.oDataDe, this.oDataAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idDataVencDe !== "") {
        this.oDataDe = this._convDateBrStringToObj(oJson.idDataVencDe);

        this.oFilter = new sap.ui.model.Filter("Dtvenc", sap.ui.model.FilterOperator.EQ, this.oDataDe);
        this.aAllFilters.push(this.oFilter);
      }
      // Tipo Documento
      if (oJson.idTipoDe !== "" && oJson.idTipoAte !== "") {
        this.oFilter = new sap.ui.model.Filter("Blart", sap.ui.model.FilterOperator.BT, oJson.idTipoDe, oJson.idTipoAte);
        this.aAllFilters.push(this.oFilter);
      } else if (oJson.idBancoDe !== "") {
        this.oFilter = new sap.ui.model.Filter("Blart", sap.ui.model.FilterOperator.EQ, oJson.idTipoDe);
        this.aAllFilters.push(this.oFilter);
      }

      // Efetua o binding dos dados na Table
      this.oTab = oViewReport.byId("tabRelatorio");
      this.oTabBinding = this.oTab.getBinding("rows");
      this.oTabBinding.oModel.setSizeLimit(1000000);

      this.oTabBinding.oModel.attachRequestSent(function () {
        this.setBusy(true);
      }, oViewReport);

      this.oTabBinding.oModel.attachRequestCompleted(function () {
        this.setBusy(false);
      }, oViewReport);

      this.oTabBinding.filter(this.aAllFilters);

      var that = this;
      var tabela = oViewReport.byId("tabela_relatorio");
      oViewReport.setBusy(true);

      this.getModel().read("/RelDadosCobrancaSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          oViewReport.setBusy(false);
          let oModel = new sap.ui.model.json.JSONModel();
          oModel.setData(oData);
          oModel.refresh(true);
          tabela.setModel(oModel);
        },
        error: function (error) {
          oViewReport.setBusy(false);
        }
      });
    },

    _formatDateBr: function (oDate) {
      return (oDate.getDate() + "/" + // Dia
        // M�s ajustado para adicionar zero a esquerda se for menor que 10
        ((oDate.getMonth() + 1).length > 1 ? (oDate.getMonth() + 1) : "0" + (oDate.getMonth() + 1)) + "/" +
        oDate.getFullYear()); // Ano
    },

    _formatDataBr: function (oDate) {
      let novaData = new Date(oDate);
      return novaData.toLocaleDateString(oDate);
    },

    _validateSelOptDate: function (oView, pDateLow, pDateHigh) {
      var oDateLow,
        oDateHigh;
      var vDateLow = oView.byId(pDateLow).getValue(),
        vDateHigh = oView.byId(pDateHigh).getValue();

      bError = false;

      if (vDateLow !== "" && vDateHigh !== "") {
        oDateLow = this._convDateBrStringToObj(vDateLow);
        oDateHigh = this._convDateBrStringToObj(vDateHigh);
        if (oDateLow > oDateHigh) {
          sap.m.MessageToast.show(this._loadI18n(this.getView(), "erroDataLowHigh"));
          oView.byId(pDateLow).setValueState(sap.ui.core.ValueState.Error);
          oView.byId(pDateHigh).setValueState(sap.ui.core.ValueState.Error);
          bError = true;
        } else {
          oView.byId(pDateLow).setValueState(sap.ui.core.ValueState.None);
          oView.byId(pDateHigh).setValueState(sap.ui.core.ValueState.None);
        }
      }

      return bError;
    },

    utilSearchCity: function (oEvent, thisView) {

      var filters = [];
      var filter;

      filter = new sap.ui.model.Filter("Estado", sap.ui.model.FilterOperator.EQ, oEvent);
      filters.push(filter);

      var cidades = thisView.getView().byId("input-Cidade");
      var binding = cidades.getBinding("items");
      binding.filter(filters);

    },

    handleUserNamePress: function (oEvent) {
      var popover = new Popover({
        showHeader: false,
        placement: sap.m.PlacementType.Bottom,
        content: [
          new Button({
            text: 'Feedback',
            type: sap.m.ButtonType.Transparent
          }),
          new Button({
            text: 'Help',
            type: sap.m.ButtonType.Transparent
          }),
          new Button({
            text: 'Logout',
            type: sap.m.ButtonType.Transparent,
            press: function () {
              window.close();
            }
          })
        ]
      }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');

      popover.openBy(oEvent.getSource());
    },

    camelize: function (str) {
      str = str.toLowerCase();
      str = str.split(' ');

      for (let i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }
      return str.join(' ');
    },

    onSearchClientes: function (oEvent) {

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
      }

      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);

    },
    
	ajustHours: function(oDate) {
		var newDate = new Date(oDate);
		newDate.setTime(newDate.getTime() - (6 * 60 * 60 * 1000));
		return newDate;
	}   

  });

});