sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/UIComponent",  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/routing/History"
], function (BaseController, UIComponent, Filter, FilterOperator, History) {
  "use strict";

  var bDadoMestre = false; // Controle para carregar o "Dado Mestre" uma vez

  return BaseController.extend("arcelor.controller.RelGrupoPesq", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.RelTransferenciaPesq
     */
    onInit: function () {
      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
      this.oModelSelection = new sap.ui.model.json.JSONModel();
    },

    _onRouteMatched: function (oEvent) {

      if (!oEvent || oEvent.getParameters().name === "RelGrupoPesq") {

        this.byId("idComboBoxMaterial").setSelectedKey(null);
        this.getView().byId("idComboBoxGrupo").setSelectedKey(null);
        this.getView().byId("idComboBoxUnidade").setSelectedKey('TO');
      }
    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf arcelor.view.RelTransferenciaPesq
     */
    onAfterRendering: function () {
      var filters = [];
      var filter = "";

      filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "MT;MUU;MTU");
      filters.push(filter);
      filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
        null ? "X" : ""));
      filters.push(filter);

      var list = this.getView().byId("inputDadoMestre");
      var binding = list.getBinding("items");
      binding.oModel.setSizeLimit(10000);

      binding.filter(filters);
      this.onChange();

    },
onChange: function()
{//var sMaterial = this.getView().byId("idComboBoxMaterial").getSelectedKey();
var aMeasureHelper = [];
var that = this;
this._loadMaterialData("CU;UN;FR", '00000').then(function (oDataHelper) {
  var aMeasureHelper = [];
  oDataHelper.results.forEach(function (oResult) {
    switch (oResult.Codconsulta) {
      case "UN":
            aMeasureHelper.push({
              Codconsulta: oResult.Codconsulta,
              Coddadomestre: oResult.Coddadomestre,
              Textodadomestre: oResult.Textodadomestre
            });
            break;
      };
  });
  var oModelTipo = new sap.ui.model.json.JSONModel();
  oModelTipo.setSizeLimit(10000);
  oModelTipo.setData({
    modelUnidade:aMeasureHelper
  });
  var oDataMaterialtipo = that.getView().byId("idComboBoxUnidade");
  oDataMaterialtipo.setModel(oModelTipo); 
  that.getView().byId("idComboBoxUnidade").setSelectedKey('TO');


});

  },
    _loadMaterialData: function (sQuery, sMaterial) {
        return new Promise(function (fnResolve, fnReject) {
          var aFilters = [];
          aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, sQuery));
          aFilters.push(new Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial));
          this.getModel().read("/DM_DadoMestreUNSet", {
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

    inicioUpdateTabela: function (oEvt) {
      this.getView().setBusy(true);
    },

    fimUpdateTabela: function (oEvt) {
      this._carregaDadoMestre();
      this.getView().setBusy(false);
    },

    _carregaDadoMestre: function () {
      var aMaterial = []; //MT
      var aTipo = []; //MTU
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

          // Material
          if (vCodconsulta === "MT") {
            aMaterial.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }
          if (vCodconsulta === "MTU") {
            aTipo.push({
              Codconsulta: vCodconsulta,
              Coddadomestre: vCoddadomestre,
              Textodadomestre: vTextodadomestre
            });
          }
        }

        // Material
        var oModelMaterial = new sap.ui.model.json.JSONModel();
        oModelMaterial.setSizeLimit(10000);
        oModelMaterial.setData({
          modelMaterial: aMaterial
        });
        var oDataMaterial = this.getView().byId("idComboBoxMaterial");
        oDataMaterial.setModel(oModelMaterial);
        var oModelTipo = new sap.ui.model.json.JSONModel();
        oModelTipo.setSizeLimit(10000);
        oModelTipo.setData({
          modelTipo:aTipo
        });
        var oDataMaterialtipo = this.getView().byId("idComboBoxTipo");
        oDataMaterialtipo.setModel(oModelTipo);

      }

    },

    onLoadItemsCbMaterial: function () {
      this._carregaDadoMestre();
    },

    onSearch: function (oEvt) {

      var aSelection,
        sTipoRel;


      aSelection = {
        idComboBoxMaterial: this.getView().byId("idComboBoxMaterial").getSelectedKey(),
        idComboBoxTipo: this.getView().byId("idComboBoxTipo").getSelectedKey(),
        idComboBoxUnidade: this.getView().byId("idComboBoxUnidade").getSelectedKey()

      };

      var oViewReport = sap.ui.getCore().byId("idViewRelGrupoRes");
      if (oViewReport !== undefined) {
        this._loadFilterRelGrupo(oViewReport, aSelection);
      } else {
        this.oModelSelection.setData(aSelection);
        sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
      }

      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RelGrupoRes");
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("relatorios");
    }

  });

});