sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/core/routing/History"
], function (BaseController, UIComponent, History) {
  "use strict";

  return BaseController.extend("arcelor.controller.RelCarteiraOvsDetPesq", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.RelCarteiraOvsDetPesq
     */
    onInit: function () {

      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
      this.oModelSelection = new sap.ui.model.json.JSONModel();
    },

    _onRouteMatched: function (oEvent) {

      if (!oEvent || oEvent.getParameters().name === "RelCarteiraOvsDetPesq") {

        this.byId("idDataCriacaoOrdemDe").setValue("");
        this.byId("idDataCriacaoOrdemAte").setValue("");
        this.byId("idDataRemessaOrdemDe").setValue("");
        this.byId("idDataRemessaOrdemAte").setValue("");
        this.byId("idEmissorOrdemDe").setValue("");
        this.byId("idEmissorOrdemAte").setValue("");
        this.byId("idDocVendasDe").setValue("");
        this.byId("idDocVendasAte").setValue("");

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

    onSearch: function (oEvt) {
      if (this._requiredFieldSimple(this.getView(), "idDataCriacaoOrdemDe") === true) {
        return;
      }
      if (this._validateSelOptDate(this.getView(), "idDataCriacaoOrdemDe", "idDataCriacaoOrdemAte")) {
        return;
      }

      var aSelection = {
        idTesteRfc: (jQuery.sap.getUriParameters().get("TesteRfc") !== null ? "X" : ""),
        idDataCriacaoOrdemDe: this.getView().byId("idDataCriacaoOrdemDe").getValue(),
        idDataCriacaoOrdemAte: this.getView().byId("idDataCriacaoOrdemAte").getValue(),
        idEmissorOrdemDe: this.getView().byId("idEmissorOrdemDe").getValue(),
        idEmissorOrdemAte: this.getView().byId("idEmissorOrdemAte").getValue(),
        idDocVendasDe: this.getView().byId("idDocVendasDe").getValue(),
        idDocVendasAte: this.getView().byId("idDocVendasAte").getValue(),
        idStatusCreditoDe: this.getView().byId("idStatusCreditoDe").getValue(),
        idStatusCreditoAte: this.getView().byId("idStatusCreditoAte").getValue(),
        idStatusFaturamentoDe: this.getView().byId("idStatusFaturamentoDe").getValue(),
        idStatusFaturamentoAte: this.getView().byId("idStatusFaturamentoAte").getValue(),
        idDataRemessaOrdemDe: this.getView().byId("idDataRemessaOrdemDe").getValue(),
        idDataRemessaOrdemAte: this.getView().byId("idDataRemessaOrdemAte").getValue()
      };

      var oViewReport = sap.ui.getCore().byId("idViewRelCarteiraOvsDetRes");
      if (oViewReport !== undefined) {
        this._loadFilterRelCateiraOvsDet(oViewReport, aSelection);
      } else {
        this.oModelSelection.setData(aSelection);
        sap.ui.getCore().setModel(this.oModelSelection, "dados_selecao_relatorio");
      }

      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("RelCarteiraOvsDetRes");
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("relatorios");
    }

  });

});