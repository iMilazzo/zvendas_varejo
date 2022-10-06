sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (BaseController, UIComponent, MessageToast, History) {

  "use strict";
  var bDadoMestre = false;
  const aFields = ["dtEmissaoDe", "dtEmissaoAte"];

  return BaseController.extend("arcelor.controller.RelDadosCobrancaPesq", {

    onInit: function () {
      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
      this.oModelSelection = new sap.ui.model.json.JSONModel();
    },

    _onRouteMatched: function (oEvent) {
      if (!oEvent || oEvent.getParameter("name") === "RelDadosCobrancaPesq") {
        this._carregaDadoMestre();
      }
    },

    inicioUpdateTabela: function (oEvt) {
      this.getView().setBusy(true);
    },

    fimUpdateTabela: function (oEvt) {
      this.getView().setBusy(false);
    },

    _carregaDadoMestre: function () {
      var aTipoDoc = []; //TPDC
      var aFilters = [];
      var oModelTipoDoc = new sap.ui.model.json.JSONModel();
      oModelTipoDoc.setSizeLimit(99999);
      var that = this;
      var aFilter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "TP");
      aFilters.push(aFilter);

      this.byId("tipoDocDe").setBusy(true);
      this.byId("tipoDocAte").setBusy(true);
      this.getModel().read('/DM_DadoMestreAllSet', {
        filters: aFilters,
        success: function (oData) {
          oModelTipoDoc.setData(oData);
          that.byId("tipoDocDe").setModel(oModelTipoDoc);
          that.byId("tipoDocAte").setModel(oModelTipoDoc);
          that.byId("tipoDocDe").setBusy(false);
          that.byId("tipoDocAte").setBusy(false);
        },
        error: function (oError) {
        }
      })
    },

    onPesquisar: function () {

      var sTxtDataRequerida = "Preenchimento obrigatório.";
      var sTxtDataInvalida  = "Data inválida, verifique.";
      var bValidationError  = false;

      var oDPEmissaoDe = this.byId("dtEmissaoDe");
      if (oDPEmissaoDe){
        //if (oDPEmissaoDe.getDateValue() === null){
        //  bValidationError = true;
        //  oDPEmissaoDe.setValueState("Error");
        // oDPEmissaoDe.setValueStateText(sTxtDataRequerida);
        //} else if
         if (!oDPEmissaoDe.isValidValue()){
          bValidationError = true;
          oDPEmissaoDe.setValueState("Error");
          oDPEmissaoDe.setValueStateText(sTxtDataInvalida);
        }
      }

      var oDPEmissaoAte = this.byId("dtEmissaoAte");
      if (oDPEmissaoAte){
       // if (oDPEmissaoAte.getDateValue() === null){
        //  bValidationError = true;
        //  oDPEmissaoAte.setValueState("Error");
        //  oDPEmissaoAte.setValueStateText(sTxtDataRequerida);
       // } else if
         if (!oDPEmissaoAte.isValidValue()){
          bValidationError = true;
          oDPEmissaoAte.setValueState("Error");
          oDPEmissaoAte.setValueStateText(sTxtDataInvalida);
        }
      }

      if (bValidationError === true){
        oDPEmissaoDe.focus();
        return false;
      }

      this.getView().setBusy(true);

      let aSelection = {
        clienteDe: this.byId("cpfCnpjDe").getValue(),
        clienteAte: this.byId("cpfCnpjAte").getValue(),
        dtEmissaoDe: this.byId("dtEmissaoDe").getValue(),
        dtEmissaoAte: this.byId("dtEmissaoAte").getValue(),
        dtVencimentoDe: this.byId("dtVencimentoDe").getValue(),
        dtVencimentoAte: this.byId("dtVencimentoAte").getValue(),
        tipoDocDe: this.byId("tipoDocDe").getSelectedKey(),
        tipoDocAte: this.byId("tipoDocAte").getSelectedKey(),
      };

     // if (aSelection.tipoDocDe.length > 0) {
     //   if (aSelection.dtEmissaoDe.length <= 0 || aSelection.dtEmissaoAte.length <= 0 && (aSelection.clienteDe.length <= 0 || aSelection.clienteAte
     //       .length <= 0 || aSelection.cpfCnpj.length <= 0 || aSelection.dtEmissaoDe.length <= 0)) {

     //     MessageToast.show("Para filtro apenas de Tipo de Documento, selecione também data de Emissão", {
      //      duration: 7000
      //    });
      //    this.getView().setBusy(false);
       //   return false;
      //  }
     // }

      this.oModelSelection.setData(aSelection);
      sap.ui.getCore().setModel(this.oModelSelection, "selection_relatorio");

      var oRouter = UIComponent.getRouterFor(this);
      this.getView().setBusy(false);
      oRouter.navTo("RelDadosCobrancaRes");
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPreviousHash = oHistory.getPreviousHash();

      if (typeof (sPreviousHash) !== "undefined" && sPreviousHash !== "") {
        this.onLimpar();
        window.history.go(-1);
      } else {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        this.onLimpar();
        oRouter.navTo("PainelRelatorios", true);
      }
    },

    onLimpar: function () {
      this.byId("cpfCnpjDe").setValue("");
      this.byId("cpfCnpjAte").setValue("");
      this.byId("dtVencimentoDe").setValue("");
      this.byId("dtVencimentoAte").setValue("");
      this.byId("tipoDocDe").setSelectedKey("");
      this.byId("tipoDocAte").setSelectedKey("");

      var oDPEmissaoDe = this.byId("dtEmissaoDe");
      if (oDPEmissaoDe){
        oDPEmissaoDe.setValue(null);
        oDPEmissaoDe.setValueState("None");
      }

      var oDPEmissaoAte = this.byId("dtEmissaoAte");
      if (oDPEmissaoAte){
        oDPEmissaoAte.setValue(null);
        oDPEmissaoAte.setValueState("None");
      }

    },

    handleSuggest: function (oEvt) {
      var aFilters = [];
      var oFilter;
      var sTermo = oEvt.getParameter("suggestValue");
      var sTermoOrig = sTermo;

      sTermo = this.utilFormatterCPFCNPJClearSearch(sTermo);

      if ((sTermo && sTermo.length > 0) && (sTermo.trim() !== "")) {

        if ($.isNumeric(sTermo) && sTermo.length === 11) {
          oFilter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, sTermo);
        }
        if ($.isNumeric(sTermo) && sTermo.length < 11) {
          oFilter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, sTermo);
        } else if ($.isNumeric(sTermo) && sTermo.length > 11) {
          sTermo = this.utilFormatterCPFCNPJClearSearch(sTermo);
          oFilter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, sTermo);
        } else if (!$.isNumeric(sTermo)) {
          oFilter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sTermoOrig);
        }

        aFilters.push(oFilter);

        oEvt.getSource().getBinding("suggestionRows").filter(aFilters, false);
      }
    },

    _validarEntrada: function (oInput) {
      var sValueState = "None";
      var bValidationError = false;
      var oValueInput = "";
      if (!oInput) {
        return false;
      }
      switch ("function") {
      case typeof oInput.getValue:
        oValueInput = oInput.getValue();
        break;
      case typeof oInput.getSelectedKey:
        oValueInput = oInput.getSelectedKey();
        break;
      case typeof oInput.getSelected:
        oValueInput = oInput.getSelected();
        break;
      default:
        break;
      }
      if (oValueInput === "") {
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },

    handleEmissaoDP: function(oEvent) {

      var sTxtDataRequerida = "Preenchimento obrigatório.";
      var sTxtDataInvalida  = "Data inválida, verifique.";

      var oDP = oEvent.getSource();
      var bValid = oEvent.getParameter("valid");
      oDP.setValueState(sap.ui.core.ValueState.None);

      if (!bValid) {
        oDP.setValueState(sap.ui.core.ValueState.Error);
        oDP.setValueStateText(sTxtDataInvalida);

      } else if (oDP.getDateValue() === null){
        oDP.setValueState(sap.ui.core.ValueState.Error);
        oDP.setValueStateText(sTxtDataRequerida);
      }
    }

  });
});