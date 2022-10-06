sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (BaseController, MessageToast, JSONModel) {
  "use strict";
  var valueHelpDialog1;

  return BaseController.extend("arcelor.controller.App", {

    onInit: function () {


      var oViewModel,
        fnSetAppNotBusy,
        oListSelector = this.getOwnerComponent().oListSelector,
        iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

      oViewModel = new JSONModel({
        busy: true,
        delay: 0
      });

      this.setModel(oViewModel, "appView");

      fnSetAppNotBusy = function () {
        oViewModel.setProperty("/busy", false);
        oViewModel.setProperty("/delay", iOriginalBusyDelay);
      };

      this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);

      // Makes sure that master view is hidden in split app
      // after a new list entry has been selected.
      oListSelector.attachListSelectionChange(function () {
        this.byId("idAppControl").hideMaster();
      }, this);

      // apply content density mode to root view
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

      if (!valueHelpDialog1) {
        valueHelpDialog1 = sap.ui.xmlfragment(
          "arcelor.view.Inicio",
          this
        );
        valueHelpDialog1.setEscapeHandler(this.onEscapePress);
        this.getView().addDependent(valueHelpDialog1);
      }
    },

    onEscapePress: function () {

    },

    onAfterRendering: function () {

      var filters = [];
      var filter = "";
      filter = new sap.ui.model.Filter("cod_dist", sap.ui.model.FilterOperator.EQ, "");
      filters.push(filter);

      var list = sap.ui.getCore().byId("idComboLojaFragment");
      var binding = list.getBinding("items");
      binding.oModel.setSizeLimit(10000);

      binding.filter(filters);
      var oModel = this.getView().getModel();
      var thisview = this;

      oModel.read("/atualiza_lojaSet", {
        filters: filters,
        success: function (success, response, odata) {
          if (success.results.length > 1) {
            valueHelpDialog1.open();
          } else {
            thisview.onSetLoja(success.results[0]);
            valueHelpDialog1.destroy();
          }
        },
        error: function (oError, response) {
          thisView.getView().setBusy(false);
          MessageToast.show(hdrMessage);
          valueHelpDialog1.destroy();
        }
      })
    },

    onClose: function (Evt) {

      if (sap.ui.getCore().byId("idComboLojaFragment").getSelectedKey() !== "") {

        valueHelpDialog1.close();

        var oData;
        oData = {
          "cod_dist": sap.ui.getCore().byId("idComboLojaFragment").getSelectedKey()
        }

        var oCartModel = this.getView().getModel("cartProducts");
        oCartModel.setProperty("/cartEntries", {});
        oCartModel.setProperty("/totalPrice", "0");
        this.getView().setBusy(true);

        var thisView = this;
        this.CentroLoja = new sap.ui.model.json.JSONModel();

        var loja = [];
        loja.push({
          loja: sap.ui.getCore().byId("idComboLojaFragment").getSelectedKey()
        })
        this.CentroLoja.setData(loja);
        sap.ui.getCore().setModel(this.CentroLoja, "centroloja");

        let nomeLoja = sap.ui.getCore().byId("__component0---inicio--nomeLoja");

        if (typeof nomeLoja != undefined) {
          nomeLoja.setText(sap.ui.getCore().byId("idComboLojaFragment").getSelectedKey());
        }

        var oModel = this.getView().getModel();
        oModel.read("/atualiza_lojaSet(cod_dist='" + sap.ui.getCore().byId("idComboLojaFragment").getSelectedKey() + "')", {
          success: function (success, response, odata) {
            thisView.getView().setBusy(false);
            MessageToast.show("Loja selecionada");
            valueHelpDialog1.destroy();
          },
          error: function (oError, response) {
            thisView.getView().setBusy(false);
            MessageToast.show(hdrMessage);
            valueHelpDialog1.destroy();
          }
        })
      } else {
        MessageToast.show("Selecione uma loja");
      }
    },

    onSetLoja: function (Result) {

      valueHelpDialog1.close();

      var oData;
      oData = {
        "cod_dist": Result.cod_dist
      }

      this.getView().setBusy(true);

      var thisView = this;
      this.CentroLoja = new sap.ui.model.json.JSONModel();

      var loja = [];
      loja.push({
        loja: Result.cod_dist
      })

      this.CentroLoja.setData(loja);

      sap.ui.getCore().setModel(this.CentroLoja, "centroloja");
      sap.ui.getCore().byId("__component0---inicio--nomeLoja").setText(Result.cod_dist);

      var oModel = this.getView().getModel();

      oModel.read("/atualiza_lojaSet(cod_dist='" + Result.cod_dist + "')", {
        success: function (success, response, odata) {
          thisView.getView().setBusy(false);
          MessageToast.show("Loja selecionada: " + Result.cod_dist);
          valueHelpDialog1.destroy();
        },
        error: function (oError, response) {
          thisView.getView().setBusy(false);
          MessageToast.show(hdrMessage);
          valueHelpDialog1.destroy();
        }
      })
    }
  });
})