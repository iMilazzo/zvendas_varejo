sap.ui.define(
  ["arcelor/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
  function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("arcelor.controller.LiberarBloqueioCondPagto", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf arcelor.view.Venda
       */
      onInit: function () {
        if (!this.getModel("liberarBloqueioCondPagto")) {
          this.setModel(
            new JSONModel({
              ordemVenda: "",
              dataSaida: new Date(),
            }),
            "liberarBloqueioCondPagto"
          );
        }

        // Route Handler
        sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onMasterMatched, this);
      },

      _onMasterMatched: function () {
        this.getModel("liberarBloqueioCondPagto").setData({
          ordemVenda: "",
          dataSaida: new Date(),
        });
        this.getModel("liberarBloqueioCondPagto").refresh(true);
      },

      onNavBase: function () {
        this.getRouter().navTo("financeiro");
      },

      onLiberarBloqueio: function () {
        var bOk = true;
        var sOrdemVenda = this.getModel("liberarBloqueioCondPagto").getData().ordemVenda;
        var oDateSaida = this.getModel("liberarBloqueioCondPagto").getData().dataSaida;
        var sLoja = "";
        var oFldOv = this.getView().byId("fldOv");
        var oFldDate = this.getView().byId("fldDataSaidaMercadoria");

        //validate fields
        if (sOrdemVenda === null || sOrdemVenda === "") {
          oFldOv.setValueState(sap.ui.core.ValueState.Error);
          bOk = false;
        } else {
          oFldOv.setValueState(sap.ui.core.ValueState.None);
        }
        if (oDateSaida === null || oDateSaida === "") {
          oFldDate.setValueState(sap.ui.core.ValueState.Error);
          bOk = false;
        } else {
          oFldDate.setValueState(sap.ui.core.ValueState.None);
        }

        if (!bOk) {
          MessageBox.error("Preencher todos os campos obrigatórios");
          return;
        }

        if (sap.ui.getCore().getModel("centroloja").getProperty("/0/loja") !== undefined) {
          sLoja = sap.ui.getCore().getModel("centroloja").getProperty("/0/loja");
        }

        var oParameters = {};
        oParameters = {
          ov: sOrdemVenda,
          data: oDateSaida,
          loja: sLoja,
        };

        this.getView().setBusy(true);
        
        this.getModel().callFunction("/LiberarBloqCondPagto", {
          method: "GET",
          urlParameters: oParameters,
          success: function (oReturn) {
            this.getView().setBusy(false);
            if (oReturn.Type === "E") {
              MessageBox.information(oReturn.Message);
            } else {
//              MessageBox.success("Documento liberado com sucesso!", {
              MessageBox.success(oReturn.Message, {
                  onClose: function () {
                  this.onNavBase();
                }.bind(this),
              });
            }
          }.bind(this),
          error: function () {
            this.getView().setBusy(false);
          }.bind(this),
        });
      },

      _convertMessage: function (sMessage) {
        var tTextArea = document.createElement("textarea");
        tTextArea.innerHTML = sMessage;
        return tTextArea.value;
      },
    });
  }
);
