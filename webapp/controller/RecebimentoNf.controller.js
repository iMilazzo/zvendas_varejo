sap.ui.define([
  "arcelor/controller/BaseController",
  "arcelor/model/formatter",
  "sap/m/MessageBox",
], function (BaseController, formatter, MessageBox) {
  "use strict";

  var bDadoMestre = false;

  return BaseController.extend("arcelor.controller.RecebimentoNf", {

    formatter: formatter,
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.RelCarteiraOvsDetPesq
     */
    onInit: function () {

      this.getOwnerComponent().getRouter().attachRouteMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent){
      if (oEvent.getParameters().name == "RecebimentoNf") {
        this.getView().byId("idNfnum").setValue("");
        this.getView().byId("idSerie").setValue("");
        this.getView().byId("idData").setValue("");
        this.getView().byId("idComboBoxCentro").setSelectedKey(null);
        this.loadCentro();
      }
    },

    loadCentro: function () {

      var that = this;
      this.getView().setBusy(true);

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

      oModel.read("/CentroRecebimentoNfSet", {

        success: function (data) {

          var oData = {};
          oData.modelCentro = data.results;

          let oModel = new sap.ui.model.json.JSONModel(oData);
          oModel.setSizeLimit(1000000);
          let oDataCentro = that.getView().byId("idComboBoxCentro");
          oDataCentro.setModel(oModel);
          that.getView().setBusy(false);

        },
        error: function (erro) {
          that.getView().setBusy(false);
        }
      });
    },

    onSearch: function () {

      var idCentro = "";
      idCentro = this.getView().byId("idComboBoxCentro").getSelectedKey();
      this.aAllFilters = [];

      if (this._requiredFieldSimple(this.getView(), "idData") === true) {
        return;
      }

      if (this._requiredFieldSimple(this.getView(), "idNfnum") === true) {
        return;
      }

      if (this.getView().byId("idComboBoxCentro").getSelectedKey().length <= 0) {

        sap.m.MessageToast.show(this._loadI18n(this.getView(), "preencherCamposObrig"));
        this.getView().byId("idComboBoxCentro").setValueState(sap.ui.core.ValueState.Error);
        this.getView().byId("idComboBoxCentro").focus();

        return;
      }

      this.getView().byId("idComboBoxCentro").setValueState(sap.ui.core.ValueState.None);

      // Nota Fiscal
      if (this.getView().byId("idNfnum").getValue() !== "") {
        this.oFilter = new sap.ui.model.Filter("Nfnum", sap.ui.model.FilterOperator.EQ, this.getView().byId("idNfnum").getValue());
        this.aAllFilters.push(this.oFilter);
      }

      // Serie
      if (this.getView().byId("idSerie").getValue() !== "") {
        this.oFilter = new sap.ui.model.Filter("Series", sap.ui.model.FilterOperator.EQ, this.getView().byId("idSerie").getValue());
        this.aAllFilters.push(this.oFilter);
      }

      // Data da Nota
      if (this.getView().byId("idData").getValue() !== "") {
        var oDataDe = this._convDateBrStringToObj(this.getView().byId("idData").getValue());
        this.oFilter = new sap.ui.model.Filter("Docdat", sap.ui.model.FilterOperator.EQ, oDataDe);
        this.aAllFilters.push(this.oFilter);
      }

      //Centro
      if (idCentro !== "") {
        this.oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, idCentro);
        this.aAllFilters.push(this.oFilter);
      }

      var that = this;
      this.getView().setBusy(true);

      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);

      oModel.read("/RecebimentoNfeSet", {

        filters: this.aAllFilters,
        success: function (data) {

          var oData = {};
          oData.result = data.results;
          that.getView().setBusy(false);

          if (oData.result.length > 0) {
            MessageBox.information(oData.result[0].Message, {
              title: "ArcelorMittal",
              styleClass: "sapUiSizeCompact",
              onClose: function (oAction) {
              //DMND0021004 - IM - 14.09.2022 - Begin
                that.getView().byId("idNfnum").setValue("");
                that.getView().byId("idSerie").setValue("");
              //  that.getView().byId("idData").setValue("");
              //  that.getView().byId("idComboBoxCentro").setSelectedKey(null);
              //DMND0021004 - IM - 14.09.2022 - End
              }
            });
          } else {

            MessageBox.information("Nenhuma mensagem registrada", {
              title: "ArcelorMittal",
              styleClass: "sapUiSizeCompact",
              onClose: function (oAction) {

              }
            });

          }

        },
        error: function (erro) {
          that.getView().setBusy(false);
        }
      });
    },

    onNavBack: function () {
      this.getOwnerComponent().getRouter().navTo("produtos");
    }

  });

});