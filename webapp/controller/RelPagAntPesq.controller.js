sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/routing/History",
  "arcelor/model/formatter",
  "sap/m/GroupHeaderListItem",
  "sap/m/MessageBox",
  "sap/ui/core/UIComponent"
], function (BaseController, History, formatter, GroupHeaderListItem, MessageBox, UIComponent) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelPagAntPesq", {

    formatter: formatter,

    onInit: function () {

      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
      this.oModelSelection = new sap.ui.model.json.JSONModel();

    },

    _onRouteMatched: function (oEvent) {

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
        oEvt.getSource().setShowValueStateMessage(false);
        oEvt.getSource().getBinding("suggestionRows").filter(aFilters, false);
      }
    },

   onDPChange: function(oEvent) {

      var sTxtDataRequerida = "Preenchimento obrigatório.";
      var sTxtDataInvalida  = "Data inválida, verifique.";

      var oDP = oEvent.getSource();
      var bValid = oEvent.getParameter("valid");
      oDP.setValueState(sap.ui.core.ValueState.None);

      if (!bValid) {
        oDP.setValueState(sap.ui.core.ValueState.Error);
        oDP.setValueStateText(sTxtDataInvalida);

      } //else if (oDP.getDateValue() === null){
        //oDP.setValueState(sap.ui.core.ValueState.Error);
        //oDP.setValueStateText(sTxtDataRequerida);
      //}
    },

    onInputChange: function (oEvent) {

     var oBloqueadas = this.byId("cbBloqueadas");

      if (oBloqueadas){
        if (oBloqueadas.getSelected() === false){
          return;
        }
      }

      var oCliente = this.byId("inClienteDe"),
          oOrdem   = this.byId("inOrdemDe");

      if (oCliente.getValue().length === 0 &&
          oOrdem.getValue().length === 0 ){
          oCliente.setRequired(true);
          oCliente.setValueStateText("Preencha Cliente ou Ordem");
          oCliente.setValueState("Warning");
          oOrdem.setRequired(true);
          oOrdem.setValueStateText("Preencha Cliente ou Ordem");
          oOrdem.setValueState("Warning");
      }
      else{
        oCliente.setRequired(false);
        oCliente.setValueState("None");
        oOrdem.setRequired(false);
        oOrdem.setValueState("None");
      }

    },

    onCheckSelect: function () {

      var oEfetuados    = this.byId("cbEfetuados"),
          oNaoEfetuados = this.byId("cbNaoEfetuados"),
          oBloqueadas   = this.byId("cbBloqueadas"),
          oDataPagtoDe  = this.byId("dpDataPgtoDe"),
          oDataPagtoAte = this.byId("dpDataPgtoAte"),
          oCliente      = this.byId("inClienteDe"),
          oOrdem        = this.byId("inOrdemDe");

      if (oEfetuados || oNaoEfetuados){
        if (oEfetuados.getSelected() === true ||
            oNaoEfetuados.getSelected() === true ){

          //oDataPagtoDe.setRequired(true);
          oDataPagtoDe.setEditable(true);

          //if (oDataPagtoDe.isValidValue() === false ||
          //    oDataPagtoDe.getDateValue() === null){
          //  oDataPagtoDe.setValueState("Error");
          //  oDataPagtoDe.setValueStateText("Preenchimento obrigatório.");
          //  oDataPagtoDe.focus();
          //}

          //oDataPagtoAte.setRequired(true);
          oDataPagtoAte.setEditable(true);

          //if (oDataPagtoAte.isValidValue() === false ||
          //    oDataPagtoAte.getDateValue() === null){
          //  oDataPagtoAte.setValueStateText("Preenchimento obrigatório.");
          //  oDataPagtoAte.setValueState("Error");
          //}

          oCliente.setRequired(false);
          oCliente.setValueState("None");
          oOrdem.setRequired(false);
          oOrdem.setValueState("None");

          return;
        }
      }

      if (oBloqueadas){
        if (oBloqueadas.getSelected() === true){

          //Data nao requerida
          oDataPagtoDe.setValue("");
          oDataPagtoDe.setRequired(false);
          oDataPagtoDe.setEditable(false);
          oDataPagtoDe.setValueState("None");

          oDataPagtoAte.setValue("");
          oDataPagtoAte.setRequired(false);
          oDataPagtoAte.setEditable(false);
          oDataPagtoAte.setValueState("None");

          if (oCliente.getValue().length === 0 &&
              oOrdem.getValue().length === 0){

            oCliente.setRequired(true);
            oCliente.setValueStateText("Preencha Cliente ou Ordem");
            oCliente.setValueState("Warning");
            oCliente.setShowValueStateMessage(true);
            oCliente.focus();

            oOrdem.setRequired(true);
            oOrdem.setValueStateText("Preencha Cliente ou Ordem");
            oOrdem.setValueState("Warning");
          }

        }
        else{

          // Data é requerida
          //oDataPagtoDe.setRequired(true);
          oDataPagtoDe.setEditable(true);

          //if (oDataPagtoDe.isValidValue() === false ||
          //    oDataPagtoDe.getDateValue() === null){
          //  oDataPagtoDe.setValueState("Error");
          //  oDataPagtoDe.setValueStateText("Preenchimento obrigatório.");
          //  oDataPagtoDe.focus();
          //}

          //oDataPagtoAte.setRequired(true);
          oDataPagtoAte.setEditable(true);

          //if (oDataPagtoAte.isValidValue() === false ||
          //    oDataPagtoAte.getDateValue() === null){
          //  oDataPagtoAte.setValueStateText("Preenchimento obrigatório.");
          //  oDataPagtoAte.setValueState("Error");
          //}

          oCliente.setRequired(false);
          oCliente.setValueState("None");

          oOrdem.setRequired(false);
          oOrdem.setValueState("None");
        }
      }

    },

    onSearch: function (oEvt) {

      var oDataPagtoDe  = this.byId("dpDataPgtoDe"),
          oDataPagtoAte = this.byId("dpDataPgtoAte");

      if ( oDataPagtoDe.getValueState() !== "None" ||
           oDataPagtoAte.getValueState() !== "None" ){
        oDataPagtoDe.focus();
        return;
      }

      var oCliente = this.byId("inClienteDe");
      if (oCliente.getValueState() !== "None"){
        oCliente.focus();
        return;
      }

      var oOrdem = this.byId("inOrdemDe");
      if (oOrdem.getValueState() !== "None"){
        oOrdem.focus();
        return;
      }

      var sEfetuados    = "",
          sNaoEfetuados = "",
          sBloqueadas   = "";

      if (this.getView().byId("cbEfetuados").getSelected()) {
        sEfetuados = "X";
      }
      if (this.getView().byId("cbNaoEfetuados").getSelected()) {
        sNaoEfetuados = "X";
      }
      if (this.getView().byId("cbBloqueadas").getSelected()) {
        sBloqueadas = "X";
      }

      var aSelection = {
        idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
        idEmpresaDe: this.getView().byId("inEmpresaDe").getValue(),
        idEmpresaAte: this.getView().byId("inEmpresaAte").getValue(),
        idDataDe: this.getView().byId("dpDataPgtoDe").getValue(),
        idDataAte: this.getView().byId("dpDataPgtoAte").getValue(),
        idCodClienteDe: this.getView().byId("inClienteDe").getValue(),
        idCodClienteAte: this.getView().byId("inClienteAte").getValue(),
        idOrdemDe: this.getView().byId("inOrdemDe").getValue(),
        idOrdemAte: this.getView().byId("inOrdemAte").getValue(),
        idCheckBoxEf: sEfetuados,
        idCheckBoxNe: sNaoEfetuados,
        idCheckBoxBl: sBloqueadas
      };

    if (aSelection.idDataAte === "" && aSelection.idCodClienteDe === "" && aSelection.idOrdemDe === "") {
      MessageBox.error("Preencher Data, Cliente ou Ordem.");
      return;
    }

      var oViewReport = sap.ui.getCore().byId("idViewRelPagAntRes");

      if (oViewReport !== undefined) {
        this._loadFilterRelPagAnt(oViewReport, aSelection);
      }
      else {
        this.oModelSelection.setData(aSelection);
        sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
      }

      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RelPagAntRes");
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("relatorios");
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

  });

});