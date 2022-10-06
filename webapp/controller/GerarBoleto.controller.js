sap.ui.define([
  "arcelor/controller/BaseController",
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
  "sap/m/Dialog"
], function (BaseController, JSONModel, History, Filter, FilterOperator, Device, formatter, MessageBox, MessageToast,
  Token, MessagePopover, MessagePopoverItem, Dialog) {
  "use strict";

  var _aMotivos = [];
  var _sViewBack;
  var _sVbeln;

  return BaseController.extend("arcelor.controller.GerarBoleto", {

    onInit: function () {
      this.getView().setModel(new JSONModel(), "view");
      this.getRouter().getRoute("GerarBoleto").attachPatternMatched(this._onObjectMatched.bind(this), this);
    },

    onBeforeRendering: function () {
      this.getView().setBusy(true);

      var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divGerarBoleto");
      if (!autorizado) {
        this.getRouter().getTargets().display("Unauthorized");
        return false;
      } else {
        this.getView().setBusy(false);
      }
    },

    _onObjectMatched: function (oEvent) {

      _sVbeln = sessionStorage.getItem("Vbeln");
      _sViewBack = sessionStorage.getItem("ViewBack");

      sessionStorage.removeItem("Vbeln");
      sessionStorage.removeItem("ViewBack");

      var oArgument = oEvent.getParameter("arguments");

      if (oArgument && oArgument.fatura) {
        var sFatura = oArgument.fatura;

        if (sFatura > 0) {
          this._findNotaFiscalByFatura(sFatura);
        }
      }
    },
    onParentClicked: function (oEvent) {
      var bSelected = oEvent.getParameter("selected");
      if (bSelected) {
        this.byId("libera-apos_r").setEnabled(true);
        this.byId("libera-imediatamente_r").setEnabled(true);

      } else {
        this.byId("libera-apos_r").setEnabled(false);
        this.byId("libera-imediatamente_r").setEnabled(false);
        this.byId("libera-apos_r").setSelected(false);
        this.byId("libera-imediatamente_r").setSelected(false);
      }
    },
    onParentEmailClicked: function (oEvent) {
      var bSelected = oEvent.getParameter("selected");
      if (bSelected) {
        this.byId("email1").setEnabled(true);
        this.byId("email1").setEditable(true);
        this.byId("email2").setEnabled(true);
        this.byId("email2").setEditable(true);
        this.byId("email3").setEnabled(true);
        this.byId("email3").setEditable(true);
      } else {
        this.byId("email1").setEnabled(false);
        this.byId("email1").setEditable(false);
        this.byId("email2").setEnabled(false);
        this.byId("email2").setEditable(false);
        this.byId("email3").setEnabled(false);
        this.byId("email3").setEditable(false);
      }
    },

    onNavBack: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("financeiro");
    },

    onProsseguir: function (oEvent) {
      var sKeys = this.byId("ordem").getValue();
      var email1 = this.byId("email1").getValue();
      var email2 = this.byId("email2").getValue();
      var email3 = this.byId("email3").getValue();
      var date = this.byId("nova_data").getValue();
      var libera = '';
      if (this.byId("libera-imediatamente_r").getSelected()) {
        libera = 'X';
      }
      if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname +
          (window.location.port ? ':' + window.location.port : '');
      }
      var sDtDesejada = '';
      var sDtDesejadaSplit = date.split("/");
      sDtDesejada = sDtDesejadaSplit[2] + "" + sDtDesejadaSplit[1] + "" + sDtDesejadaSplit[0];

      var spath = window.location.origin + this.getModel().sServiceUrl;

      var sUrl = spath + "/GerarBoletoSet(vbeln='" + sKeys + "',email1='" + email1 + "',email2='" + email2 + "',email3='" + email3 +
        "',data='" + sDtDesejada + "',liberacheque='" + libera + "')/$value";
      var path = "/GerarBoletoValidaSet(vbeln='" + sKeys + "',email1='" + email1 + "',email2='" + email2 + "',email3='" + email3 + "',data='" +
        sDtDesejada + "',liberacheque='" + libera + "')";
      var oModel = this.getModel();
      sUrl = encodeURI(sUrl);
 //     window.open(sUrl);
      oModel.read(path, {
        success: function (data, result) {
          window.open(sUrl);
        },
        error: function (err) {
          if (err.message == 'no handler for data') {
            window.open(sUrl);
          } else {
            MessageBox.error(JSON.parse(err.responseText).error.message.value);
          }
        }
      });
    },

    formatData: function (value) {

      var dateObject = new Date(value);
      var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "dd/MM/yyyy"
      });
      var dateFormatted = dateFormat.format(dateObject);
      return dateFormatted;
    },

    onChangeDate: function (oEvent) {
      this.byId("nova_data").setValue(this.formatData(oEvent.getParameter("value")));
    },

    formatValor: function (value) {
      if (value) {
        return parseFloat(value).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }

      return null;
    },
  });
});