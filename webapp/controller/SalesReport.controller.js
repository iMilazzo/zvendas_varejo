sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "arcelor/model/formatter",
  "sap/m/MessageBox"
], function (Controller, BaseController, JSONModel, formatter, MessageBox) {

  "use strict";

  return BaseController.extend("arcelor.controller.SalesReport", {

    formatter: formatter,

    onInit: function () {

      this.getRouter().getRoute("SalesReport").attachPatternMatched(this._onObjectMatched.bind(this), this);
      var that = this;

      var beforePrint = function () {
      };

      var afterPrint = function () {
        that.onNavBack();
      };

      this.getView().addEventDelegate({
        onAfterShow: function () {
          window.onbeforeprint = beforePrint;
          window.onafterprint = afterPrint;
          window.print();
        }
      });
    },

    onAfterRendering: function () {

    },

    onNavBack: function () {

      let sVbeln = this.byId("numOv").getText() + "&&&" + this.getModel("SalesModel").getData().CustomerName.replace('/', '&&&&&');

      this.getOwnerComponent().getRouter().navTo("Vendas", {
        mode: "Change",
        salesorder: sVbeln
      }, true);
    },

    _onObjectMatched: function (oEvent) {
      var oParameters = oEvent.getParameters();

      if (typeof (oParameters.arguments.orderid) == "undefined") {
        var oModelData = new JSONModel(this.getModel("SalesModel").getData());
      } else {
        var aSelectedContexts = sap.ui.getCore().byId("__component0---ordemvendafatura--List").getSelectedContexts();
        if (aSelectedContexts.length > 1) {
          MessageBox.error("Selecionar apenas um item!");
          return false;
        } else {
          var oModelData = new JSONModel(aSelectedContexts[0].oModel);
        }
      }
      this.getView().setModel(oModelData, "SalesModel");

      var oModelData = this.getModel("SalesModel");
      var oData = this.getView().getModel();
      var oModelUser = sap.ui.getCore().getModel("modelUser");
      var sPath = "/LogInfSet(usuario='user')";
      var that = this;

      var onSuccess = function (odata) {
        that.byId("centro").setText(odata.loja);
        that.byId("loja").setText(odata.dist);
      };

      var onError = function (odata, response) {
        //console.log(JSON.parse(response));
      };

      var total = 0;

      oData.read(sPath, {
        success: onSuccess,
        error: onError
      });

      let oEnderecoEntrega = oModelData.getData().ComboEntrega.filter((item) => {
        return item.Coddadomestre == oModelData.getData().DeliveryAddress;
      });

      let oEnderecoCobranca = oModelData.getData().ComboCobranca.filter((item) => {
        return item.Coddadomestre == oModelData.getData().BillingAddress;
      });

      total = oModelData.getData().SalesItems.reduce((item, valor) => parseFloat(item) + parseFloat(valor.ValorST) + parseFloat(valor.ValorTotItem), 0);

      this.byId("entrega").setText(oEnderecoEntrega[0].Textodadomestre.substring(12));
      this.byId("cobranca").setText(oEnderecoCobranca[0].Textodadomestre.substring(12));
      this.byId("dataov").setText(new Date(Date.now()).toLocaleString());
      this.byId("vendedor").setText(oModelUser.id + " " + oModelUser.name);
      total = Math.round(total*100)/100;
      this.byId("total").setText(formatter.price(total));

    },

    setFreigthText: function (sValue) {
      switch (sValue) {
      case '0':
        return 'CIF';
        break;
      case '1':
        return 'EXW';
        break;
      case '2':
        return 'FOB';
        break;
      case '9':
        return 'ZST';
        break;
      default:
        return '-';
      }
    }
  });
});