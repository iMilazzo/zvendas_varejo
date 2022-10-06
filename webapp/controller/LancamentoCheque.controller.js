sap.ui.define(
  [
    "arcelor/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, MessageBox, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("arcelor.controller.LancamentoCheque", {
      /**
       * Called when a controller is instantiated and its View controls (if available) are already created.
       * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
       * @memberOf arcelor.view.Venda
       */
      onInit: function () {
        if (!this.getModel("lctoChequeModel")) {
          this.setModel(
            new JSONModel({
              salesOrder: "",
              checkNumber: "",
              checkValue: ["0", "BRL"],
              checkDate: new Date(),
              identNumber: "",
              totalVisible: false,
              checkEnabled: false,
              orderBalance: "0",
              orderTotal: "0",
              checkItems: [],
            }),
            "lctoChequeModel"
          );
        }

        // Route Handler
        sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
          this._onMasterMatched,
          this
        );
      },

      _onMasterMatched: function (oEvent) {
        this.getModel("lctoChequeModel").setData({
          salesOrder: "",
          checkNumber: "",
          checkValue: ["0", "BRL"],
          checkDate: new Date(),
          identNumber: "",
          totalVisible: false,
          checkEnabled: false,
          orderBalance: "0",
          orderTotal: "0",
          checkItems: [],
        });
        this.getModel("lctoChequeModel").refresh(true);
      },

      onDeleteCheckItem: function (oEvent) {
        this._deleteItem(oEvent);
      },

      _deleteItem: function (oEvent) {
        var iIndex = oEvent
          .getSource()
          .getParent()
          .getParent()
          .indexOfItem(oEvent.getSource().getParent());
        var iLinetoDel = iIndex + 1;
        var iCounter = 0;
        var oModelData = this.getModel("lctoChequeModel").getData();
        oModelData.checkItems.forEach(function (oItem) {
          if (!oItem.Deleted) {
            iCounter++;
          }
          if (iCounter === iLinetoDel) {
            oItem.Deleted = true;
          }
        });
        this.getModel("lctoChequeModel").refresh(true);
        this._recalcOrderTotal();
        this._recalcOrderBalance();
      },

      formatPrice: function (sPrice) {
        return new sap.ui.model.type.Currency({
          showMeasure: false,
        }).formatValue([sPrice, "BRL"], "string");
      },

      formatStatus: function (sStatus) {
        switch (sStatus) {
          case "P":
            return "Pendente";
          case "B":
            return "Baixado";
          case "F":
            return "Faturado";
          default:
            return "Pendente";
        }
      },

      onSaveCheckData: function () {
        var sGroupId = "1",
          sChangeSetId = "Create";

        var oCheckMetadata = this.getView()
          .getModel()
          .getServiceMetadata()
          .dataServices.schema[0].entityType.find(function (oEntity) {
            return oEntity.name === "ChequeMoradia";
          });

        var oCheckData = this.getModel("lctoChequeModel").getData();
        var valor_cheque = oCheckData.TotalLiquido;

        //14.06.2022 - FLS - Begin
        //check total value
        var sumCheque = oCheckData.checkItems.reduce(function (s, a) {
          if (a.Deleted) {
            return parseFloat(s);
          } else {
            return parseFloat(s) + parseFloat(a.ValorCheque);
          }
        }, 0);
        var total = parseFloat(oCheckData.TotalLiquido);
        var maxValue = parseFloat(oCheckData.TotalLiquido) + parseFloat(0.99);

        if (sumCheque <= maxValue && sumCheque >= total) {
          //ok
        }else{
          MessageBox.error(
            "Valor lançado maior do que o valor da Ordem de Vendas"
          );
          return;
        }
        //14.06.2022 - FLS - End

        this.getView().getModel().setDeferredGroups([sGroupId]);
        oCheckData.checkItems.forEach(
          function (oItem) {
            var oObject = oItem;
            var oPayload = {};
            oObject.CnpjCpf = oObject.CnpjCpf.replace(".", "");
            oObject.CnpjCpf = oObject.CnpjCpf.replace(".", "");
            oObject.CnpjCpf = oObject.CnpjCpf.replace(".", "");
            oObject.CnpjCpf = oObject.CnpjCpf.replace(".", "");
            oObject.CnpjCpf = oObject.CnpjCpf.replace("-", "");
            oObject.CnpjCpf = oObject.CnpjCpf.replace("/", "");

            oCheckMetadata.property.forEach(function (oProperty) {
              if (
                oObject.hasOwnProperty(oProperty.name) &&
                oObject[oProperty.name]
              ) {
                oPayload[oProperty.name] = oObject[oProperty.name];
              }
            });
            //oPayload.ValorCheque = parseFloat(valor_cheque).toFixed(2).toString();
            if (typeof oPayload.ValorCheque.toFixed !== "undefined") {
              oPayload.ValorCheque = oPayload.ValorCheque.toFixed(2).toString();
            }

            this.getView().getModel().create(
              "/ChequeMoradiaSet",
              oPayload,
              {
                groupId: sGroupId,
              },
              {
                changeSetId: sChangeSetId,
              }
            );
          }.bind(this)
        );

        this.getView().setBusy(true);
        this.getView()
          .getModel()
          .submitChanges(
            {
              groupId: sGroupId,
              changeSetId: sChangeSetId,
              success: function (oData) {
                this.getView().setBusy(false);
                var bErrorFound = false;
                try {
                  oData.__batchResponses[0].__changeResponses.forEach(
                    function (oResponse) {
                      if (oResponse.headers["custom-return"]) {
                        var oMessageReturn = JSON.parse(
                          oResponse.headers["custom-return"]
                        );
                        MessageBox.error(
                          this._convertMessage(oMessageReturn.message)
                        );
                        bErrorFound = true;
                      }
                    }.bind(this)
                  );
                } catch (ex) {}
                if (!bErrorFound) {
                  MessageBox.success("Cheque Moradia gravado com sucesso!", {
                    onClose: function (oAction) {
                      this.onCheckemessa();
                      //            this.onNavBase();
                    }.bind(this),
                  });
                }
              }.bind(this),
              error: function () {
                MessageBox.error("Erro ao gravar Cheque Moradia");
                this.getView().setBusy(false);
              }.bind(this),
            },
            this
          );
      },

      _convertMessage: function (sMessage) {
        var tTextArea = document.createElement("textarea");
        tTextArea.innerHTML = sMessage;
        return tTextArea.value;
      },

      onAddCheckData: function () {
        if (
          this._validateFields(this.getView(), [
            "idCheckNumber",
            "idCheckValue",
            "idCheckDate",
            "idCPFCNPJ",
          ])
        ) {
          var oCheckData = this.getModel("lctoChequeModel").getData();

          //14.06.2022 - FLS - Begin
          //check duplicated
          var bHasDuplicated = oCheckData.checkItems.some(function (el) {
            return el.NumCheque === oCheckData.checkNumber && el.Deleted === false;
          });
          if (bHasDuplicated) {
            MessageBox.error("Número de Cheque já foi lançado");
            return;
          }
          //14.06.2022 - FLS - End

          oCheckData.checkItems.push({
            Deleted: false,
            ValidadeChque: oCheckData.checkDate,
            CnpjCpf: oCheckData.identNumber,
            DtLctoCheque: new Date(),
            Excluir: true,
            OrdemVenda: oCheckData.salesOrder,
            Status: "P",
            NumCheque: oCheckData.checkNumber,
            ValorCheque: oCheckData.checkValue[0],
          });
          oCheckData.checkNumber = "";
          oCheckData.checkValue = ["0", "BRL"];
          oCheckData.checkDate = new Date();
          //14.06.2022 - FLS - Begin
          //keep CPJ/CNPJ codes
          //oCheckData.identNumber = "";
          //14.06.2022 - FLS - End
          this.getModel("lctoChequeModel").refresh(true);
          this._recalcOrderTotal();
          this._recalcOrderBalance();
        }
      },

      onSalesOrderChange: function () {
        var sSalesOrder = this.getModel("lctoChequeModel").getData().salesOrder;
        if (sSalesOrder.length > 0) {
          this._readSalesOrder(sSalesOrder).then(
            function (oSalesOrderAppt) {
              var oCheckData = this.getModel("lctoChequeModel").getData();
              oCheckData.checkEnabled = true;
              oCheckData.totalVisible = true;
              oCheckData.TotalLiquido = oSalesOrderAppt.TotalLiquido;
              oCheckData.TotalImpostos = oSalesOrderAppt.TotalImpostos;
              //14.06.2022 - FLS - Begin
              if (
                oSalesOrderAppt.CNPJCliente !== null &&
                oSalesOrderAppt.CNPJCliente !== ""
              ) {
                oCheckData.identNumber = oSalesOrderAppt.CNPJCliente;
              }
              if (
                oSalesOrderAppt.CPFCliente !== null &&
                oSalesOrderAppt.CPFCliente !== ""
              ) {
                oCheckData.identNumber = oSalesOrderAppt.CPFCliente;
              }
              //14.06.2022 - FLS - End
              oCheckData.checkItems = [];
              this.getModel("lctoChequeModel").refresh(true);

              // Dados do Cheque
              this._readCheckData(oSalesOrderAppt.Id);
            }.bind(this)
          );
        }
      },

      formatOrderBalance: function (nOrderBalance) {
        return this.formatPrice(nOrderBalance.toString());
      },

      formatOrderTotal: function (nOrderTotal) {
        return this.formatPrice(nOrderTotal.toString());
      },
      onCheckemessa: function () {
        var oCheckData = this.getModel("lctoChequeModel").getData();
        var nTotal = 0.0;
        oCheckData.checkItems.forEach(function (oItem) {
          if (!oItem.Deleted) {
            nTotal += parseFloat(oItem.ValorCheque);
          }
        });

        if (oCheckData.TotalLiquido - nTotal <= 1) {
          this.handleLiberarParaRemessaPress();
        }
      },
      _recalcOrderTotal: function () {
        var oCheckData = this.getModel("lctoChequeModel").getData();
        var nTotal = 0.0;
        oCheckData.checkItems.forEach(function (oItem) {
          if (!oItem.Deleted) {
            nTotal += parseFloat(oItem.ValorCheque);
          }
        });

        oCheckData.orderTotal = nTotal;
        this.getModel("lctoChequeModel").refresh(true);
      },

      formatCPFCNPJ: function (sValue) {
        var sValueOut = sValue.replace(/\D/g, "").replace(/^0+/, "");

        if (sValueOut.length <= 14) {
          //CPF

          sValueOut = sValueOut.replace(/(\d{3})(\d)/, "$1.$2");
          sValueOut = sValueOut.replace(/(\d{3})(\d)/, "$1.$2");
          sValueOut = sValueOut.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
          //CNPJ

          sValueOut = sValueOut.replace(/^(\d{2})(\d)/, "$1.$2");
          sValueOut = sValueOut.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
          sValueOut = sValueOut.replace(/\.(\d{3})(\d)/, ".$1/$2");
          sValueOut = sValueOut.replace(/(\d{4})(\d)/, "$1-$2");
        }

        return sValueOut;
      },

      _recalcOrderBalance: function () {
        var oCheckData = this.getModel("lctoChequeModel").getData();
        var nTotal = 0.0;
        oCheckData.checkItems.forEach(function (oItem) {
          if (!oItem.Deleted) {
            nTotal += parseFloat(oItem.ValorCheque);
          }
        });

        nTotal = parseFloat(oCheckData.TotalLiquido) - nTotal;
        oCheckData.orderBalance = nTotal;
        this.getModel("lctoChequeModel").refresh(true);
      },

      handleLiberarParaRemessaPress: function () {
        var oview = this;
        var oCheckData = this.getModel("lctoChequeModel").getData();
        var oSalesOrderData = this.getModel("SalesModel").getData();
        var oData = {
          ordem: oCheckData.salesOrder,
        };
        var box = new sap.m.VBox({
          items: [
            new sap.m.Text({
              text: "Deseja realmente liberar remessa?",
            }),
          ],
        });
        box.setModel(
          new sap.ui.model.json.JSONModel({
            message: "",
          })
        );
        sap.m.MessageBox.show(box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              var sGroupId = "1",
                sChangeSetId = "Create";
              var oCheckMetadata = oview
                .getView()
                .getModel()
                .getServiceMetadata()
                .dataServices.schema[0].entityType.find(function (oEntity) {
                  return oEntity.name === "ChequeMoradiaLib";
                });
              var oCheckData = oview.getModel("lctoChequeModel").getData();
              var valor_cheque = oCheckData.TotalLiquido;
              oview.getView().getModel().setDeferredGroups([sGroupId]);
              var oPayload = {};
              oCheckData.checkItems.forEach(function (oItem) {
                var oObject = oItem;

                oCheckMetadata.property.forEach(function (oProperty) {
                  if (
                    oObject.hasOwnProperty(oProperty.name) &&
                    oObject[oProperty.name]
                  ) {
                    oPayload[oProperty.name] = oObject[oProperty.name];
                  }
                });
                if (typeof oPayload.ValorCheque.toFixed !== "undefined") {
                  oPayload.ValorCheque =
                    oPayload.ValorCheque.toFixed(2).toString();
                }
              });
              oview
                .getView()
                .getModel()
                .create("/ChequeMoradiaLibSet", oPayload, {
                  success: function (odata) {
                    if (odata.OrdemVenda == "E") {
                      MessageBox.error(odata.ChaveAcesso + odata.NomeCliente, {
                        onClose: function (oAction) {
                          oview.onNavBase();
                        }.bind(oview),
                      });
                    } else {
                      MessageBox.success("Remessa Liberada!", {
                        onClose: function (oAction) {
                          oview.onNavBase();
                        }.bind(oview),
                      });
                    }
                  },
                  error: function (odata) {
                    //
                  },
                });
            } else {
              oview.getView().setBusy(false);
            }
          },
        });
      },

      _readCheckData: function (sSalesOrder) {
        var aFilters = [];

        aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, sSalesOrder));

        this.getView().setBusy(true);
        this.getModel().read("/ChequeMoradiaSet", {
          filters: aFilters,
          success: function (oCheckItems) {
            var oCheckData = this.getModel("lctoChequeModel").getData();
            oCheckItems.results.forEach(function (oItem) {
              var oObject = oItem;
              oObject.Deleted = false;
              oCheckData.checkItems.push(oObject);
            });

            this.getView().setBusy(false);
            this.getModel("lctoChequeModel").refresh(true);
            this._recalcOrderTotal();
            this._recalcOrderBalance();
          }.bind(this),
        });
      },

      _readSalesOrder: function (sSalesOrder) {
        var aFilters = [];

        aFilters.push(new Filter("OrdemVenda", FilterOperator.EQ, sSalesOrder));
        return new Promise(
          function (fnResolve, fnReject) {
            var oParameters = {};
            oParameters = {
              Id: sSalesOrder,
            };

            this.getView().setBusy(true);
            this.getModel().callFunction("/GetOrdemVenda", {
              method: "GET",
              urlParameters: oParameters,
              success: function (oSalesOrderAppt) {
                this.getView().setBusy(false);
                fnResolve(oSalesOrderAppt);
              }.bind(this),
              error: function () {
                this.getView().setBusy(false);
                fnReject();
              }.bind(this),
            });
          }.bind(this)
        );
      },

      onNavBase: function () {
        this.getRouter().navTo("financeiro");
      },

      _validateFields: function (oView, oFields) {
        var that = this;
        var bValidationError = false;

        oFields.forEach(function (oInput) {
          bValidationError =
            that._validateInput(oView.byId(oInput)) || bValidationError;
        });

        if (!bValidationError) {
          sap.ui.getCore().getMessageManager().removeAllMessages();
          return true;
        } else {
          var vText = "Preencher campos obrigatórios";
          var vTitle = "Ocorreu um erro";
          MessageBox.show(vText, {
            icon: MessageBox.Icon.ERROR,
            title: vTitle,
            actions: [MessageBox.Action.OK],
          });
          return false;
        }
      },

      formatDate: function (dValue) {
        jQuery.sap.require("sap.ui.core.format.DateFormat");

        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd/MM/YYYY",
        });

        return oDateFormat.format(new Date(dValue), true);
      },

      _validateInput: function (oInput) {
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
    });
  }
);
