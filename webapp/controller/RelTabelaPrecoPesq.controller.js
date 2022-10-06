sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
  "use strict";

  var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

  return BaseController.extend("arcelor.controller.RelTabelaPrecoPesq", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.RelTabelaPrecoPesq
     */
    onInit: function () {
      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
      this.oModelSelection = new sap.ui.model.json.JSONModel();
    },

    _onRouteMatched: function (oEvent) {

      if (!oEvent || oEvent.getParameters().name === "RelTabelaPrecoPesq") {

        this.byId("idComboBoxCentro").setSelectedKey(null);
        this.byId("idComboBoxVersao").setSelectedKey(null);
        this.byId("idComboBoxGrupoMateriaisDe").setSelectedKey(null);
        this.byId("idComboBoxGrupoMateriaisAte").setSelectedKey(null);
        this.byId("idComboBoxCanalDistrDe").setSelectedKey(null);
        this.byId("idComboBoxCanalDistrAte").setSelectedKey(null);
        this.byId("idComboBoxSetorAtivSdDe").setSelectedKey(null);
        this.byId("idComboBoxSetorAtivSdAte").setSelectedKey(null);

        // Sempre apresentar EV principal
        var oDataEV = this.byId("idCboEscritorioDe").getModel().getData();
        this.byId("idCboEscritorioDe").setSelectedKey(oDataEV.modelEV[0].Coddadomestre);

      }
    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.vendasvarejo.relatorios.view.RelTabelaPrecoPesq
     */
    onAfterRendering: function () {
      var filters = [];
      var filter = "";

      filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CEN;CGM;CD;SAS;VS;EVN");
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
      var aCentro = [],       //CEN
        aGrupoMateriais = [], //CGM
        aCanalDistr = [],     //CD
        aSetorAtivSd = [],    //SAS
        aEscritorio = [];     // EVN - Escritório Vendas Novo

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

          // Centro
          if (vCodconsulta === "CEN") {
            aCentro.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }

          // Cond. Grupo de Materiais
          if (vCodconsulta === "CGM") {
            aGrupoMateriais.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }

          // Canal de Distribuição
          if (vCodconsulta === "CD") {
            aCanalDistr.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }

          // Setor de Atividade SD
          if (vCodconsulta === "SAS") {
            aSetorAtivSd.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }

          // Escritórios de Venda
          if (vCodconsulta === "EVN") {
            aEscritorio.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }

        }

        // Centro
        var oModelCentro = new sap.ui.model.json.JSONModel();
        oModelCentro.setSizeLimit(1000);
        oModelCentro.setData({
          modelCentro: aCentro
        });
        var oDataCentro = this.getView().byId("idComboBoxCentro");
        oDataCentro.setModel(oModelCentro);

        // Grupo de Materiais
        var oModelGrupoMateriais = new sap.ui.model.json.JSONModel();
        oModelGrupoMateriais.setSizeLimit(1000);
        oModelGrupoMateriais.setData({
          modelGrupoMateriais: aGrupoMateriais
        });
        var oDataGrupoMateriais = this.getView().byId("idComboBoxGrupoMateriaisDe");
        oDataGrupoMateriais.setModel(oModelGrupoMateriais);
        oDataGrupoMateriais = this.getView().byId("idComboBoxGrupoMateriaisAte");
        oDataGrupoMateriais.setModel(oModelGrupoMateriais);

        // Canal de Distribuicao
        var oModelCanalDistr = new sap.ui.model.json.JSONModel();
        oModelCanalDistr.setSizeLimit(1000);
        oModelCanalDistr.setData({
          modelCanalDistr: aCanalDistr
        });
        var oDataCanalDistr = this.getView().byId("idComboBoxCanalDistrDe");
        oDataCanalDistr.setModel(oModelCanalDistr);
        oDataCanalDistr = this.getView().byId("idComboBoxCanalDistrAte");
        oDataCanalDistr.setModel(oModelCanalDistr);

        // Setor de Atividade SD
        var oModelSetorAtivSd = new sap.ui.model.json.JSONModel();
        oModelSetorAtivSd.setSizeLimit(1000);
        oModelSetorAtivSd.setData({
          modelSetorAtivSd: aSetorAtivSd
        });
        var oDataSetorAtivSd = this.getView().byId("idComboBoxSetorAtivSdDe");
        oDataSetorAtivSd.setModel(oModelSetorAtivSd);
        oDataSetorAtivSd = this.getView().byId("idComboBoxSetorAtivSdAte");
        oDataSetorAtivSd.setModel(oModelSetorAtivSd);

        // Escritório de Vendas
        var oModelEV = new sap.ui.model.json.JSONModel();
        oModelEV.setSizeLimit(100);
        oModelEV.setData({
          modelEV: aEscritorio
        });

        var oDataEV = this.getView().byId("idCboEscritorioDe");
        oDataEV.setModel(oModelEV);
        oDataEV = this.getView().byId("idCboEscritorioAte");
        oDataEV.setModel(oModelEV);

        this.byId("idCboEscritorioDe").setSelectedKey(aEscritorio[0].Coddadomestre);

      }
    },

    _carregaDadoVersao: function () {
      var aVersao = []; //VER

      var oTabela = this.getView().byId("inputDadoMestreVersao");
      var oLinha = oTabela.getItems();
      var oItem,
        oCelulas;
      var vCodconsulta,
        vCoddadomestre,
        vTextodadomestre;

      for (var i = 0; i < oLinha.length; i++) {
        oItem = oLinha[i];
        oCelulas = oItem.getCells();
        if (oCelulas[0].getValue() == 'VS') {
          vCodconsulta = oCelulas[0].getValue();
          vCoddadomestre = oCelulas[1].getValue();
          vTextodadomestre = oCelulas[2].getValue();

          // Centro
          if (vCodconsulta === "VS") {
            aVersao.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre.slice(6, 8) + "/" + vTextodadomestre.slice(4, 6) + "/" + vTextodadomestre.slice(0, 4)
            });
          }
        }
      }

      // Versão
      var oModelVersao = new sap.ui.model.json.JSONModel();
      oModelVersao.setSizeLimit(1000);
      oModelVersao.setData({
        modelVersao: aVersao
      });
      var oDataVersao = this.getView().byId("idComboBoxVersao");
      oDataVersao.setModel(oModelVersao);

    },

    onLoadItemsCbCentro: function () {
      this._carregaDadoMestre();
    },

    onLoadItemsCbVersao: function () {
      if (this.getView().byId("idComboBoxCentro").getSelectedKey() !== "") {
        this._carregaDadoVersao();
      }
    },

    onLoadItemsCbGrupoMateriais: function () {
      this._carregaDadoMestre();
    },

    onLoadItemsCbCanalDistr: function () {
      this._carregaDadoMestre();
    },

    onLoadItemsCbSetorAtivSd: function () {
      this._carregaDadoMestre();
    },

    onSearch: function (oEvt) {
      var aSelection,
        sComIpi = "";

      if (this.getView().byId("RB1-1").getSelected() === true) {
        sComIpi = "X";
      } else if (this.getView().byId("RB1-2").getSelected() === true) {
        sComIpi = "";
      }

      var versa = this.getView().byId("idComboBoxVersao").getValue().split("-", 2);
      var descVers;
      if (versa !== undefined && versa[0] !== "") {
        descVers = versa[1].trim();
        descVers = descVers.substr(6, 4) + '-' + descVers.substr(3, 2) + '-' + descVers.substr(0, 2);
        descVers = descVers.trim();
      }

      var versBoxaux = this.getView().byId("idComboBoxVersao").getSelectedKey().split("-", 1);
      var versBox;
      if (versBoxaux !== undefined && versBoxaux[0] !== "") {
        versBox = versBoxaux[0].trim();
      }

      aSelection = {
        idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
        idComboBoxCentro: this.getView().byId("idComboBoxCentro").getSelectedKey(),
        idComboBoxVersao: versBox,
        idComboBoxGrupoMateriaisDe: this.getView().byId("idComboBoxGrupoMateriaisDe").getSelectedKey(),
        idComboBoxGrupoMateriaisAte: this.getView().byId("idComboBoxGrupoMateriaisAte").getSelectedKey(),
        idComboBoxCanalDistrDe: this.getView().byId("idComboBoxCanalDistrDe").getSelectedKey(),
        idComboBoxCanalDistrAte: this.getView().byId("idComboBoxCanalDistrAte").getSelectedKey(),
        idComboBoxSetorAtivSdDe: this.getView().byId("idComboBoxSetorAtivSdDe").getSelectedKey(),
        idComboBoxSetorAtivSdAte: this.getView().byId("idComboBoxSetorAtivSdAte").getSelectedKey(),
        idCboEscritorioDe: this.getView().byId("idCboEscritorioDe").getSelectedKey(),
        idCboEscritorioAte: this.getView().byId("idCboEscritorioAte").getSelectedKey(),
        idComIpi: sComIpi,
        idDate: descVers
      };

      var oViewReport = sap.ui.getCore().byId("idViewRelTabelaPrecoRes");

      if (oViewReport !== undefined) {
        this._loadFilterRelTabelaPreco(oViewReport, aSelection);
      } else {
        this.oModelSelection.setData(aSelection);
        sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
      }

      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RelTabelaPrecoRes");
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("relatorios");
    }

  });

});