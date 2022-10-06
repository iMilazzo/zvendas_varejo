sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/ui/Device",
  "arcelor/model/formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, MessageBox, MessageToast) {
  "use strict";
  var aDataContatos = [];

  var aDataRecebedorMerc = [];
  var aDataCobrancaMerc = [];
  var aDataCargaDados = 0;
  var autorizado = false;
  return BaseController.extend("arcelor.controller.ClientesCadastroNFCe", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.ClientesCadastro
     */
    onInit: function () {
      var myModel = this.getOwnerComponent().getModel();
      myModel.setSizeLimit(5000);
    },

    onBeforeRendering: function () {

    //   this.getView().setBusy(true);

    //   var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divCadastrarCliente");
    //   if (!autorizado) {
    //     this.getRouter().getTargets().display("Unauthorized");
    //     return false;
    //   } else {
    //     this.getView().setBusy(false);
    //   }

    //   var thisView = this;
    //   thisView._clearForm();
    //   thisView.getView().byId("searchCnpjCpf").setValue("");
    //   thisView.getView().byId("combo-tipoPessoa").setValue(null);
    },

    onAfterRendering: function () {
    //   var filters = [];
    //   var filter = "";
    //   var filter1 = "";
    //   filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "OV;CD;SA;CL;CN;UF;SI");
    //   filter1 = new sap.ui.model.Filter("Coddadomestre", sap.ui.model.FilterOperator.EQ, "X");
    //   filters.push(filter, filter1);
    //   var list = this.getView().byId("input-dadosMestres");
    //   var binding = list.getBinding("items");
    //   binding.filter(filters);
    //   var thisView = this;
    //   thisView._clearForm();
    //   thisView.getView().byId("searchCnpjCpf").setValue("");
    //   var oview = this;
    //   this.getView().byId("input-Matriz").addEventDelegate({
    //     onfocusout: function (e) {
    //       oview.lonChangeMatriz(e)
    //     }
    //   })
    },

    buscaMatriz: function () {
    //   var tipo = this.getView().byId("combo-tipoPessoa").getSelectedKey();
    //   var cpf = '';
    //   var cnpj = '';
    //   var oData = this.getView().getModel();
    //   var oDataPag = this.getView().getModel();
    //   var oView = this.getView();
    //   var filter;
    //   var filters = [];
    //   filter = new sap.ui.model.Filter("tipopessoa", sap.ui.model.FilterOperator.Contains, tipo);
    //   filters.push(filter);
    //   if (tipo == 'F') {
    //     cpf = this.utilFormatterCPFCNPJClear(this.getView().byId("searchCnpjCpf").getValue());
    //     filter = new sap.ui.model.Filter("cpf", sap.ui.model.FilterOperator.Contains, cpf);
    //     filters.push(filter);
    //   } else if (tipo == 'G') {
    //     cpf = this.utilFormatterCPFCNPJClear(this.getView().byId("searchCnpjCpf").getValue());
    //     filter = new sap.ui.model.Filter("cpf", sap.ui.model.FilterOperator.Contains, cpf);
    //     filters.push(filter);
    //   } else {
    //     cnpj = this.utilFormatterCPFCNPJClear(this.getView().byId("searchCnpjCpf").getValue());
    //     filter = new sap.ui.model.Filter("cnpj", sap.ui.model.FilterOperator.Contains, cnpj);
    //     filters.push(filter);
    //   };
    //   var thisView = this;
    //   var onSuccess = function (odata) {
    //     oView.setBusy(false);
    //     if (odata.results[0].message == 'Sucesso') {
    //       oView.byId("input-Matriz").setValue(odata.results[0].matriz);
    //       var sPathpag  =  "/ClientesSet(Codcliente='" + odata.results[0].matriz +
    //         "',Nome='',Cnpj='',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='" + oView.byId("input-Codcliente").getValue() + "')";
    //       var sInputValue = odata.results[0].matriz;
    //       oDataPag.read(sPathpag, {
    //         success: function (oResult) {
    //           oView.byId("input-PagadorCodigo").setValue(sInputValue);
    //           oView.byId("input-PagadorNome").setValue(oResult.Nome);
    //           oView.byId("input-Pagador").setValue("");
    //         },
    //         error: function (oResult) {
    //           //alert("Código do cliente não encontrado.")
    //         },
    //       });
    //     }
    //   };
    //   var onError = function (odata) {
    //     oView.setBusy(false);
    //   };
    //   oView.setBusy(true);
    //   var sPath = "/MatrizSet"
    //   oData.read(sPath, {
    //     filters: filters,
    //     success: onSuccess,
    //     error: onError
    //   });
    },

    _loadMasterData: function () {
      this._readListMasterData();
    },

    _readListMasterData: function () {
      var aDataOrgVendas = []; // OV
      var aDataCanalDist = []; // CD
      var aDataSetorAtiv = []; // SA
      var aDataClassific = []; // CL
      var aDataCnae = []; // CN
      var aDataUf = []; // UF
      var aDataSetorInd = []; // SI
      if (aDataCargaDados === 0) {
        aDataCargaDados = 1;
        var table = this.getView().byId("input-dadosMestres");
        var rowItems = table.getItems(); //getSelectedItems();
        for (var i = 0; i < rowItems.length; i++) {
          var item = rowItems[i];
          var Cells = item.getCells();
          var Codconsulta = Cells[0].getValue();
          var Coddadomestre = Cells[1].getValue();
          var Textodadomestre = Cells[2].getValue();
          if (Codconsulta === "OV") {
            aDataOrgVendas.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
          if (Codconsulta === "CD") {
            if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
              if (Coddadomestre == "40") {
                aDataCanalDist.push({
                  Codconsulta: Codconsulta,
                  Coddadomestre: Coddadomestre,
                  Textodadomestre: Textodadomestre
                });
                aDataCargaDados = 0;
              }
            } else {
              aDataCanalDist.push({
                Codconsulta: Codconsulta,
                Coddadomestre: Coddadomestre,
                Textodadomestre: Textodadomestre
              });
              aDataCargaDados = 0;
            }
          }
          if (Codconsulta === "SA") {
            aDataSetorAtiv.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
          if (Codconsulta === "CL") {
            aDataClassific.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
          if (Codconsulta === "CN") {
            aDataCnae.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
          if (Codconsulta === "UF") {
            aDataUf.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre.toUpperCase()
            });
          }
          if (Codconsulta === "SI") {
            aDataSetorInd.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
        }
        var oModelOrgVendas = new sap.ui.model.json.JSONModel();
        oModelOrgVendas.setSizeLimit(5000);
        oModelOrgVendas.setData({
          modelDataOrgVendas: aDataOrgVendas
        });
        var oDataOrgVendas = this.getView().byId("input-multiComboxOrganizacao");
        oDataOrgVendas.setModel(oModelOrgVendas);
        var oModelCanalDist = new sap.ui.model.json.JSONModel();
        oModelCanalDist.setSizeLimit(5000);
        oModelCanalDist.setData({
          modelDataCanalDist: aDataCanalDist
        });
        var oDataCanalDist = this.getView().byId("input-multiComboxCanal");
        oDataCanalDist.setModel(oModelCanalDist);
        var oModelSetorAtiv = new sap.ui.model.json.JSONModel();
        oModelSetorAtiv.setSizeLimit(5000);
        oModelSetorAtiv.setData({
          modelDataSetorAtiv: aDataSetorAtiv
        });
        var oDataSetorAtiv = this.getView().byId("input-multiComboxSetorAtividade");
        oDataSetorAtiv.setModel(oModelSetorAtiv);
        var oModelClassific = new sap.ui.model.json.JSONModel();
        oModelClassific.setSizeLimit(5000);
        oModelClassific.setData({
          modelDataClassific: aDataClassific
        });
        var oDataClassific = this.getView().byId("input-Kukla");
        oDataClassific.setModel(oModelClassific);
        var oModelCnae = new sap.ui.model.json.JSONModel();
        oModelCnae.setSizeLimit(5000);
        oModelCnae.setData({
          modelDataCnae: aDataCnae
        });
        var oDataCnae = this.getView().byId("input-Cnae");
        oDataCnae.setModel(oModelCnae);
        var oModelUf = new sap.ui.model.json.JSONModel();
        oModelUf.setSizeLimit(5000);
        oModelUf.setData({
          modelDataUf: aDataUf
        });
        var oDataUf = this.getView().byId("input-Regiao");
        oDataUf.setModel(oModelUf);
        var oModelSetorInd = new sap.ui.model.json.JSONModel();
        oModelSetorInd.setSizeLimit(5000);
        oModelSetorInd.setData({
          modelDataSetorInd: aDataSetorInd
        });
        var oDataSetorInd = this.getView().byId("input-SetorInd");
        oDataSetorInd.setModel(oModelSetorInd);
      }
    },

    onChangeSuframa: function (evt) {
      if (this.getView().byId("input-Suframa").getValue() !== "") {
        this.getView().byId("input-DtSufurama").setEnabled(true);
      } else {
        this.getView().byId("input-DtSufurama").setEnabled(false);
        this.getView().byId("input-DtSufurama").setValue("");
      }
    },

    onSearch: function (evt) {
      //create model filter
      var sInputValue, oView, cpf, cnpj, tipoCliente;
      cpf = "";
      cnpj = "";
      tipoCliente = "";
      sInputValue = this.utilFormatterCPFCNPJClear(evt.getParameter("query"));
      var thisView = this;
      if (!$.isNumeric(sInputValue)) {
        sap.m.MessageToast.show("CNPJ / CPF inválido!");
        thisView._clearForm();
        thisView._fieldsDisableEnable("Cancel");
        return;
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "") {
        // limpar o cpf ou cnpj
        MessageBox.error("Informar Tipo Pessoa. ", {
          styleClass: "sapUiSizeCompact"
        });
        thisView.byId("combo-tipoPessoa").focus();
        thisView.byId("searchCnpjCpf").setValue("");
        return;
      }
      // 0 - Cliente | 1 - Prospect
      var oRadioTipoCliente = 0;
      if (oRadioTipoCliente === 0) {
        tipoCliente = 'S';
      } else {
        tipoCliente = 'P';
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || this.getView().byId("combo-tipoPessoa").getSelectedKey() ===
        "G") {
        if ($.isNumeric(sInputValue) && sInputValue.length <= 11) {
          cpf = sInputValue;
          this.getView().byId("label-Cnae").setRequired(false);
        } else {
          thisView.byId("searchCnpjCpf").setValue("");
          MessageBox.error("CPF inválido.", {
            styleClass: "sapUiSizeCompact"
          });
          return;
        }
      } else {
        if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
          cnpj = sInputValue;
          this.getView().byId("label-Cnae").setRequired(true);
        } else {
          thisView.byId("searchCnpjCpf").setValue("");
          MessageBox.error("CPF / CNPJ inválido.", {
            styleClass: "sapUiSizeCompact"
          });
          return;
        }
      }
      oView = this.getView();
      var oData = this.getView().getModel();
      var tipoPessoa = this.getView().byId("combo-tipoPessoa").getSelectedKey();
      var onError = function (odata, response) {
        var box = new sap.m.VBox({
          items: [
            new sap.m.Text({
              text: 'Cliente não cadastrado, deseja cadastrar?'
            })
          ]
        });
        box.setModel(new sap.ui.model.json.JSONModel({
          message: ''
        }));
        sap.m.MessageBox.show(
          box, {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                thisView._clearForm();
                thisView.byId("save").setVisible(true);
                thisView.byId("cancel").setVisible(true);
                thisView._fieldsDisableEnable("Edit");
                thisView._loadMasterData();
                jQuery.sap.delayedCall(500, this, function () {
                  thisView.byId("input-nome").focus();
                });
                if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                  "G") {
                  thisView.byId("input-DomicilioFiscal").setSelectedKey('Z');
                  thisView.byId("input-SubstTributaria").setSelectedKey('X');
                  thisView.byId("input-SetorInd").setSelectedKey('1051');
                  thisView.byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                  thisView.byId("input-multiComboxCanal").addSelectedKeys("40");
                }
                if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                  'J') {
                  thisView.buscaMatriz();
                }
              } else {
                thisView.byId("save").setVisible(false);
                thisView.byId("cancel").setVisible(false);
                thisView._clearForm();
                thisView._fieldsDisableEnable("Cancel");
              }
            }
          }
        );
        oView.setBusy(false);
      };
      var onSuccess = function (odata) {
        oView.setBusy(false);
        if (odata.Status != "") {
          if (odata.Status == "Pendente") {
            MessageBox.warning("Cliente cadastrado, porém pendente de aprovação");
          } else {
            var box1 = new sap.m.VBox({
              items: [
                new sap.m.Text({
                  text: 'Cliente não cadastrado, deseja cadastrar?'
                })
              ]
            });

            box1.setModel(new sap.ui.model.json.JSONModel({
              message: ''
            }));

            sap.m.MessageBox.show(
              box1, {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "ArcelorMittal",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {

                    thisView._clearForm();
                    thisView.byId("save").setVisible(true);
                    thisView.byId("cancel").setVisible(true);
                    thisView._fieldsDisableEnable("Edit");
                    thisView._loadMasterData();
                    jQuery.sap.delayedCall(500, this, function () {
                      thisView.byId("input-nome").focus();
                    });
                    if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                      "G") {
                      thisView.byId("input-DomicilioFiscal").setSelectedKey('Z');
                      thisView.byId("input-SubstTributaria").setSelectedKey('X');
                      thisView.byId("input-SetorInd").setSelectedKey('1051');
                      thisView.byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                      thisView.byId("input-multiComboxCanal").addSelectedKeys("40");
                    }
                    if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                      'J') {
                      thisView.buscaMatriz();
                    }
                    thisView.byId("input-Codcliente").setValue(odata.Codcliente);
                    thisView.byId("searchCnpjCpf").setValue(odata.Cpf + odata.Cnpj);
                    thisView.byId("input-endereco").setValue(odata.Endereco);
                    thisView.byId("input-numero").setValue(odata.Numero);
                    thisView.byId("input-Complemento").setValue(odata.Complemento);
                    thisView.byId("input-Bairro").setValue(odata.Bairro);
                    thisView.byId("input-Cidade").setValue(odata.Cidade);
                    thisView.byId("input-Cep").setValue(odata.Cep);
                    thisView.byId("input-Cep").fireLiveChange();
                    thisView.byId("input-Regiao").setValue(odata.Regiao);
                    thisView.byId("input-Classifcli").setValue(odata.Classicli);
                    thisView.byId("input-nome").setValue(odata.Nome);
                    thisView.byId("input-Origem").setValue(odata.Origem);
                    thisView.byId("input-Matriz").setValue(odata.Clientematriz);
                    thisView.byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
                    thisView.byId("input-Email").setValue(odata.Email);
                    thisView.byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
                    thisView.byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal);
                    thisView.byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal);
                  }
                }

              });
          }

        } else {
          if (odata.Codcliente != "") {
            thisView.handleTableDialogPress(sInputValue);
          } else {

            var box2 = new sap.m.VBox({
              items: [
                new sap.m.Text({
                  text: 'Cliente não cadastrado, deseja cadastrar?'
                })
              ]
            });

            box2.setModel(new sap.ui.model.json.JSONModel({
              message: ''
            }));

            sap.m.MessageBox.show(
              box2, {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "ArcelorMittal",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {

                    thisView._clearForm();
                    thisView.byId("save").setVisible(true);
                    thisView.byId("cancel").setVisible(true);
                    thisView._fieldsDisableEnable("Edit");
                    thisView._loadMasterData();
                    jQuery.sap.delayedCall(500, this, function () {
                      thisView.byId("input-nome").focus();
                    });
                    if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                      "G") {
                      thisView.byId("input-DomicilioFiscal").setSelectedKey('Z');
                      thisView.byId("input-SubstTributaria").setSelectedKey('X');
                      thisView.byId("input-SetorInd").setSelectedKey('1051');
                      thisView.byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                      thisView.byId("input-multiComboxCanal").addSelectedKeys("40");
                    }
                    if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                      'J') {
                      thisView.buscaMatriz();
                    }
                    thisView.byId("input-Codcliente").setValue(odata.Codcliente);
                    thisView.byId("searchCnpjCpf").setValue(odata.Cpf + odata.Cnpj);
                    thisView.byId("input-endereco").setValue(odata.Endereco);
                    thisView.byId("input-numero").setValue(odata.Numero);
                    thisView.byId("input-Complemento").setValue(odata.Complemento);
                    thisView.utilSearchCity(odata.Regiao, thisView);
                    thisView.byId("input-Bairro").setValue(odata.Bairro);
                    thisView.byId("input-Cnae").setSelectedKey(odata.Cnae);
                    thisView.byId("input-Regiao").setSelectedKey(odata.Regiao);
                    thisView.byId("input-Cidade").setValue(odata.Cidade);
                    thisView.byId("input-Cep").setValue(odata.Cep);
                    thisView.byId("input-Cep").fireLiveChange();

                    thisView.byId("input-Classifcli").setValue(odata.Classicli);
                    thisView.byId("input-nome").setValue(odata.Nome);
                    thisView.byId("input-Origem").setValue(odata.Origem);
                    thisView.byId("input-Matriz").setValue(odata.Clientematriz);
                    thisView.byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
                    thisView.byId("input-Email").setValue(odata.Email);
                    thisView.byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
                    thisView.byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal === "" ? thisView.byId(
                      "input-DomicilioFiscal").getSelectedKey() : odata.Domiciliofiscal);
                    thisView.byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal === "" ? thisView.byId("input-SubstTributaria")
                      .getSelectedKey() : odata.Gruposubfiscal);

                  }
                }

              });
          }
        }

      };
      oView.setBusy(true);
      var sPath = "/ClientesSet(Codcliente='',Nome='',Cnpj='" + cnpj + "',Cpf='" + cpf + "',Tipocliente='" + tipoCliente +
        "',Tipoclientesap='" + tipoPessoa + "',codclicanal='')";
      oData.read(sPath, {
        success: onSuccess,
        error: onError
      });

      applyAuthMap(this.getView());
    },

    handleTableDialogPress: function (oEvent) {
      if (!this._oDialog) {
        this._oDialog = sap.ui.xmlfragment("arcelor.view.ClientesTableDialog", this);
      }
      this._oDialog._oSearchField.oParent.setVisible(false);
      this._oDialog._oCancelButton.mProperties.text = "Fechar";
      this.getView().addDependent(this._oDialog);
      // toggle compact style
      jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);

      var sSearchFiled = 'Cnpj';
      // create a filter for the binding
      this._oDialog.getBinding("items").filter(
        [new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, oEvent)]
      );
      // open value help dialog filtered by the input value
      this._oDialog.open(oEvent);
    },

    handleTableClose: function (oEvent) {
      var thisView = this;
      var oData = this.getView().getModel();
      var onError = function (odata, response) {
        thisView.getView().setBusy(false);
      };
      var onSuccess = function (odata) {
        thisView.getView().setBusy(false);
        var cpf = "";
        var cnpj = "";
        cpf = thisView.utilFormatterCPFCNPJ(odata.Cpf, "F");
        cnpj = thisView.utilFormatterCPFCNPJ(odata.Cnpj, "J");
        jQuery.sap.delayedCall(2000, this, function () {
          thisView._readListMasterData();
        });
        thisView.byId("searchCnpjCpf").setValue(cpf + cnpj);
        thisView.byId("input-endereco").setValue(odata.Endereco);
        thisView.byId("input-numero").setValue(odata.Numero);
        thisView.byId("input-Complemento").setValue(odata.Complemento);
        thisView.byId("input-Bairro").setValue(odata.Bairro);
        thisView.byId("input-Cidade").setValue(odata.Cidade);
        thisView.byId("input-Cep").setValue(odata.Cep);
        thisView.byId("input-Cep").fireLiveChange();
        thisView.byId("input-Cnae").setValue(odata.Cnae);
        thisView.byId("input-Classifcli").setValue(odata.Classicli);
        thisView.byId("input-nome").setValue(odata.Nome);
        thisView.byId("input-Origem").setValue(odata.Origem);
        thisView.byId("input-Matriz").setValue(odata.Clientematriz);
        thisView.byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
        thisView.byId("input-Email").setValue(odata.Email);
        thisView.byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
        thisView.byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal);
        thisView.byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal);
        var dateFormatted = "";
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd/MM/YYYY"
        });
        jQuery.sap.require("sap.ui.core.format.NumberFormat");
        var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
          maxFractionDigits: 2,
          groupingEnabled: true,
          groupingSeparator: ".",
          decimalSeparator: ","
        });
        thisView.byId("input-Regiao").setSelectedKey(odata.Regiao);
        thisView.utilSearchCity(odata.Regiao, thisView);
        thisView.byId("input-Cnae").setSelectedKey(odata.Cnae);
        thisView.byId("input-SetorInd").setSelectedKey(odata.Setorindustrial);
        thisView.byId("input-RecebedorCodigo").setValue(odata.Recebedormercadoria);
        thisView.byId("input-RecebedorFaturaCodigo").setValue(odata.Recebedorfatura);
        thisView.byId("input-RecebedorMercadoriaNome").setValue(odata.Nomerecebedormercadoria);
        thisView.byId("input-RecebedorFaturaNome").setValue(odata.Nomerecebedorfatura);
        thisView.byId("input-Suframa").setValue(odata.Suframa);
        if (odata.Suframa !== "") {
          var sDategui = thisView.utilFormatterDateToBR(odata.Datasuframa);

          thisView.byId("input-DtSufurama").setValue(sDategui);
        }

        //Início Canal de Distribuicao
        var aDataCanalDistNew = [];
        var aDataContatos = [];
        var aDataCanalDist = [];
        var oModelCanalDist = new sap.ui.model.json.JSONModel();
        oModelCanalDist.setSizeLimit(5000);
        oModelCanalDist.setData({
          modelDataCanalDist: aDataCanalDistNew
        });
        var oDataCanalDist = thisView.byId("input-multiComboxCanal");
        oDataCanalDist.setModel(oModelCanalDist);
        var arrayCanaldistr_splt = odata.Canaldistr_splt.split(";");
        jQuery.sap.delayedCall(2500, thisView, function () {
          var table = thisView.byId("input-multiComboxCanal");
          var rowItems = table.getItems();
          for (var i = 0; i < rowItems.length; i++) {
            var item = rowItems[i];
            var Cells = item.mProperties;
            var Codconsulta = Cells.key;
            var Coddadomestre = Cells.key;
            var Textodadomestre = Cells.text;
            aDataCanalDist.push({
              Codconsulta: Codconsulta,
              Coddadomestre: Coddadomestre,
              Textodadomestre: Textodadomestre
            });
          }
          for (var i = 0; i < aDataCanalDist.length; i++) {
            aDataCanalDistNew.push({
              Codconsulta: aDataCanalDist[i].Codconsulta,
              Coddadomestre: aDataCanalDist[i].Coddadomestre,
              Textodadomestre: aDataCanalDist[i].Textodadomestre.split("-")[1]
            });
          }

          oModelCanalDist = new sap.ui.model.json.JSONModel();
          oModelCanalDist.setSizeLimit(5000);
          oModelCanalDist.setData({
            modelDataCanalDist: aDataCanalDistNew
          });

          oDataCanalDist = thisView.byId("input-multiComboxCanal");
          oDataCanalDist.setModel(oModelCanalDist);

          for (var i = 0; i < arrayCanaldistr_splt.length; i++) {
            thisView.byId("input-multiComboxCanal").addSelectedKeys(arrayCanaldistr_splt[i]);
          }

          thisView.byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
          thisView.byId("input-SetorInd").setSelectedKey(odata.Setorindustrial);
          thisView.byId("input-Regiao").setSelectedKey(odata.Regiao);
          thisView.byId("input-endereco").setValue(odata.Endereco);
          thisView.byId("input-numero").setValue(odata.Numero);
          thisView.byId("input-Complemento").setValue(odata.Complemento);
          thisView.byId("input-Bairro").setValue(odata.Bairro);
          thisView.byId("input-Cidade").setValue(odata.Cidade);
          thisView.byId("input-Cep").setValue(odata.Cep);
          thisView.byId("input-Cep").fireLiveChange();
          thisView.byId("input-Cnae").setSelectedKey(odata.Cnae);
        });

      };
      var id = oEvent.getParameter("selectedItem").getCells()[0].mProperties.title.split(" ")[0];
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja cadastrar outro cliente para o CPF / CNPJ?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              thisView._clearForm();
              thisView.byId("save").setVisible(true);
              thisView.byId("cancel").setVisible(true);
              thisView._fieldsDisableEnable("Edit");
              thisView._loadMasterData();
              jQuery.sap.delayedCall(500, this, function () {
                thisView.byId("input-nome").focus();
              });
              var sPath = "/ClientesSet(Codcliente='" + id + "',Nome='',Cnpj='" + thisView.utilFormatterCPFCNPJClear(thisView.getView().byId(
                "searchCnpjCpf").getValue()) + "',Cpf='',Tipocliente='',Tipoclientesap=''" + ",codclicanal='')";
              oData.read(sPath, {
                success: onSuccess,
                error: onError
              });
              if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.getView().byId("combo-tipoPessoa").getSelectedKey() ===
                'J') {
                thisView.buscaMatriz();
              }
              thisView.getView().byId("input-Matriz").setEnabled(false);
              if (thisView.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
                //
              }
            } else {
              //
            }
          }
        }
      );
    },

    handleSavePress: function () {
      var thisView = this,
        oModel = this.getView().getModel();
      var tipoCliente = "";
      var cpf = "";
      var cnpj = "";
      this.getView().byId('save').setEnabled(false);
        if (this.getView().byId("input-nome").getValue() === "") {
        this.getView().byId("input-nome").focus();
        MessageBox.error("Campo Nome Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-Cep").getValue() === "") {
        this.getView().byId("input-Cep").focus();
        MessageBox.error("Campo CEP Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-endereco").getValue() === "") {
        this.getView().byId("input-endereco").focus();
        MessageBox.error("Campo Rua Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-numero").getValue() === "") {
        this.getView().byId("input-numero").focus();
        MessageBox.error("Campo Número Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-Bairro").getValue() === "") {
        this.getView().byId("input-Bairro").focus();
        MessageBox.error("Campo Bairro Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-Cidade").getValue() === "") {
        this.getView().byId("input-Cidade").focus();
        MessageBox.error("Campo Cidade Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-Regiao").getSelectedKey() === "") {
        this.getView().byId("input-Regiao").focus();
        MessageBox.error("Campo Estado Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-DomicilioFiscal").getSelectedKey() === "") {
        this.getView().byId("input-DomicilioFiscal").focus();
        MessageBox.error("Campo Domicílio Fiscal Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-SubstTributaria").getSelectedKey() === "") {
        this.getView().byId("input-SubstTributaria").focus();
        MessageBox.error("Campo Subst. Tributária Inválida.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (this.getView().byId("input-SetorInd").getSelectedKey() === "") {
        this.getView().byId("input-SetorInd").focus();
        MessageBox.error("Campo Setor Industrial Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      // 0 - Cliente | 1 - Prospect
      var oRadioTipoCliente = 0;

      if (oRadioTipoCliente === 0) {
        tipoCliente = 'S';
      } else {
        tipoCliente = 'P';
      }

      if (thisView.byId("combo-tipoPessoa").getSelectedKey() === "F" || thisView.byId("combo-tipoPessoa").getSelectedKey() === "G") {
        cpf = thisView.utilFormatterCPFCNPJClear(thisView.byId("searchCnpjCpf").getValue());
      } else {
        cnpj = thisView.utilFormatterCPFCNPJClear(thisView.byId("searchCnpjCpf").getValue());
      }
      if (thisView.byId("input-Suframa").getValue() !== "" && thisView.byId("combo-tipoPessoa").getSelectedKey() === "F") {
        MessageBox.error("Suframa só pode ser preeenchido para Pessoa Jurídica.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (thisView.byId("input-DtSufurama").getValue() !== "" && thisView.byId("combo-tipoPessoa").getSelectedKey() === "F") {
        MessageBox.error("Data Suframa só pode ser preeenchido para Pessoa Jurídica.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }


      var oData;
      var oComboBoxOrganizacao = this.getView().byId("input-multiComboxOrganizacao").getSelectedKeys();
      var inputOrgvendas = this._splitMultiCombo(oComboBoxOrganizacao);
      var oComboBoxCanal = this.getView().byId("input-multiComboxCanal").getSelectedKeys();
      var inputCanal = this._splitMultiCombo(oComboBoxCanal);

      var oComboBoxSetorAtividade = this.getView().byId("input-multiComboxSetorAtividade").getSelectedKeys();
      var inputSetorAtividade = this._splitMultiCombo(oComboBoxSetorAtividade);

      var oTable = this.getView().byId("listRecebedorMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataRecebedorMerc");
      var recebedorMercCodigo = "";
      var recebedorMercNome = "";
      var recebedorMercEndereco = "";
      var recebedorMercLocal = "";
      for (var property1 in data) {
        if (property1 === '0') {
          recebedorMercCodigo = data[property1].RecebedorMercCodigo;
          recebedorMercNome = data[property1].RecebedorMercNome;
          recebedorMercEndereco = data[property1].RecebedorMercEndereco;
          recebedorMercLocal = data[property1].RecebedorMercLocal;
        } else {
          recebedorMercCodigo = recebedorMercCodigo + ";" + data[property1].RecebedorMercCodigo;
          recebedorMercNome = recebedorMercNome + ";" + data[property1].RecebedorMercNome;
          recebedorMercEndereco = recebedorMercEndereco + ";" + data[property1].RecebedorMercEndereco;
          recebedorMercLocal = recebedorMercLocal + ";" + data[property1].RecebedorMercLocal;
        }
      }
      //Fim Recebedor
      //Cobranca
      oTable = "";
      m = "";
      data = "";

      oTable = this.getView().byId("listCobrancaMerc");
      m = oTable.getModel();
      data = m.getProperty("/modelDataCobrancaMerc");
      var cobrancaMercCodigo = "";
      var cobrancaMercNome = "";
      var cobrancaMercEndereco = "";
      var cobrancaMercLocal = "";

      for (var property1 in data) {
        if (property1 === '0') {
          cobrancaMercCodigo = data[property1].CobrancaMercCodigo;
          cobrancaMercNome = data[property1].CobrancaMercNome;
          cobrancaMercEndereco = data[property1].CobrancaMercEndereco;
          cobrancaMercLocal = data[property1].CobrancaMercLocal;
        } else {
          cobrancaMercCodigo = cobrancaMercCodigo + ";" + data[property1].CobrancaMercCodigo;
          cobrancaMercNome = cobrancaMercNome + ";" + data[property1].CobrancaMercNome;
          cobrancaMercEndereco = cobrancaMercEndereco + ";" + data[property1].CobrancaMercEndereco;
          cobrancaMercLocal = cobrancaMercLocal + ";" + data[property1].CobrancaMercLocal;
        }
      }
      //Fim Cobranca
      //Contatos
      var nomeContato = this._readContatos("Nome");
      var sobrenomeContato = this._readContatos("Sobrenome");
      var telefoneContato = this._readContatos("Telefone");
      var emailContato = this._readContatos("Email");
      var funcaoContato = this._readContatos("Funcao");
      var sDtSuframa = null;
      if (thisView.byId("input-Suframa").getValue() !== "" && thisView.byId("input-DtSufurama").getValue() === "") {
        MessageBox.alert("Suframa preenchido, favor cadastrar uma data.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (thisView.byId("input-DtSufurama").getValue() !== "") {
        var sDtSuframaSplit = thisView.byId("input-DtSufurama").getValue().split("/");
        var sDtSuframa = sDtSuframaSplit[2] + "-" + sDtSuframaSplit[1] + "-" + sDtSuframaSplit[0];
        if (sDtSuframa !== "") {
          sDtSuframa = new Date(sDtSuframa);
        } else {
          sDtSuframa = null;
        }
      }

      var inscest = this.byId("input-InscricaoEstadual").getValue();
      if (this.byId("combo-tipoPessoa").getSelectedKey() == "J") {
        if (inscest == "") {
          inscest = "ISENTO";
        }
      }
      if (this.byId("input-Codcliente").getValue() !== "") {
        oData = {
          "Nome": this.byId("input-nome").getValue(),
          "Endereco": this.byId("input-endereco").getValue(),
          "Numero": this.byId("input-numero").getValue(),
          "Complemento": this.byId("input-Complemento").getValue(),
          "Bairro": this.byId("input-Bairro").getValue(),
          "Cidade": this.byId("input-Cidade").getValue(),
          "Regiao": this.byId("input-Regiao").getSelectedKey(),
          "Cep": this.byId("input-Cep").getValue(),
          "Pais": "BR",
          "Telefone": this.byId("input-Telefone").getValue(),
          "Email": this.byId("input-Email").getValue(),
          "Pessoacontato": "",
          "Clientematriz": this.byId("input-Matriz").getValue(),
          "Setorindustrial": this.getView().byId("input-SetorInd").getSelectedKey(),
          "Classifcli": this.byId("input-Classifcli").getValue(),
          "Origem": this.byId("input-Origem").getValue(),
          "Orgvendas_splt": inputOrgvendas,
          "Canaldistr_splt": inputCanal,
          "Setorativ_splt": inputSetorAtividade,
          "Inscrestadual": inscest,
          "Tipoclientesap": this.getView().byId("combo-tipoPessoa").getSelectedKey(),
          "Tipocliente": tipoCliente,
          "Cnae": this.byId("input-Cnae").getSelectedKey(),
          "Kukla": this.getView().byId("input-Kukla").getSelectedKey(),
          "Nomecontato_split": nomeContato,
          "Fonecontato_split": telefoneContato,
          "Emailcontato_split": emailContato,
          "Domiciliofiscal": this.getView().byId("input-SubstTributaria").getSelectedKey(),
          "Recebedorfatura": this.getView().byId("input-RecebedorFaturaCodigo").getValue(),
          "Recebedormercadoria": recebedorMercCodigo, //this.getView().byId("input-RecebedorCodigo").getValue(),
          "Pagador": this.getView().byId("input-PagadorCodigo").getValue(),
          "Cobranca": cobrancaMercCodigo,
          "Nomecobranca": cobrancaMercNome,
          "Enderecorecebedormercadoria": recebedorMercEndereco,
          "Localrecebedormercadoria": recebedorMercLocal,
          "Enderecocobranca": cobrancaMercEndereco,
          "Localcobranca": cobrancaMercLocal
        };
        oModel.update("/ClientesSet(Codcliente='" + this.byId("input-Codcliente").getValue() + "',Nome='',Cnpj='" + cnpj + "',Cpf='" + cpf +
          "',Tipocliente='" + tipoCliente + "')", oData, {
            success: function (success, response, odata) {
              thisView.getView().setBusy(false);
              thisView.byId("input-InscricaoEstadual").setValue(inscest);
              var hdrMessage = response.headers["sap-message"];
              var hdrMessageObject = JSON.parse(hdrMessage);
              MessageToast.show(hdrMessageObject.message);
            },
            error: function (oError, response) {
              thisView.getView().setBusy(false);
              var hdrMessage = $(oError.responseText).find("message").first().text();
              MessageToast.show(hdrMessage);
            }
          });
      } else {
        oData = {
          "Nome": this.byId("input-nome").getValue(),
          "Cnpj": cnpj,
          "Cpf": cpf,
          "Endereco": this.byId("input-endereco").getValue(),
          "Numero": this.byId("input-numero").getValue(),
          "Complemento": this.byId("input-Complemento").getValue(),
          "Bairro": this.byId("input-Bairro").getValue(),
          "Cidade": this.byId("input-Cidade").getValue(),
          "Regiao": this.byId("input-Regiao").getSelectedKey(),
          "Cep": this.byId("input-Cep").getValue(),
          "Pais": "BR",
          "Telefone": this.byId("input-Telefone").getValue(),
          "Email": this.byId("input-Email").getValue(),
          "Pessoacontato": "",
          "Clientematriz": this.byId("input-Matriz").getValue(),
          "Setorindustrial": this.getView().byId("input-SetorInd").getSelectedKey(),
          "Classifcli": this.byId("input-Classifcli").getValue(),
          "Origem": this.byId("input-Origem").getValue(),
          "Orgvendas_splt": inputOrgvendas,
          "Canaldistr_splt": inputCanal,
          "Setorativ_splt": inputSetorAtividade,
          "Inscrestadual": inscest,
          "Tipocliente": tipoCliente,
          "Cnae": this.byId("input-Cnae").getSelectedKey(),
          "Kukla": this.getView().byId("input-Kukla").getSelectedKey(),
          "Nomecontato_split": nomeContato,
          "Sobrenomecontato_split": sobrenomeContato,
          "Fonecontato_split": telefoneContato,
          "Emailcontato_split": emailContato,
          "Domiciliofiscal": this.getView().byId("input-DomicilioFiscal").getSelectedKey(),
          "Recebedorfatura": this.getView().byId("input-RecebedorFaturaCodigo").getValue(),
          "Recebedormercadoria": recebedorMercCodigo,
          "Pagador": this.getView().byId("input-PagadorCodigo").getValue(),
          "Tipoclientesap": this.getView().byId("combo-tipoPessoa").getSelectedKey(),
          "Suframa": this.getView().byId("input-Suframa").getValue(),
          "Datasuframa": sDtSuframa,
          "Gruposubfiscal": this.getView().byId("input-SubstTributaria").getSelectedKey(),
          "Cobranca": cobrancaMercCodigo,
          "Nomecobranca": cobrancaMercNome,
          "Enderecorecebedormercadoria": recebedorMercEndereco,
          "Localrecebedormercadoria": recebedorMercLocal,
          "Enderecocobranca": cobrancaMercEndereco,
          "Localcobranca": cobrancaMercLocal,
          "FUNCAO_CONTA": funcaoContato
        };
        oModel.create("/ClientesSet", oData, {
          success: function (oCreatedEntry, success, response, odata) {
            var hdrMessage = success.headers["sap-message"];
            var hdrMessageObject = JSON.parse(hdrMessage);
            var message = hdrMessageObject.message.split("-");
            if (message[0] !== "E" && message[0].indexOf("Erro") == -1) {
              var messageCodCliente = hdrMessageObject.message.split(" ");
              thisView.byId("input-Codcliente").setValue(messageCodCliente[1]);
              thisView.byId("combo-tipoPessoa").setSelectedKey(null);
              thisView.byId("input-InscricaoEstadual").setValue(inscest);
              thisView.byId("save").setVisible(false);
              thisView._fieldsDisableEnable("Cancel");
              thisView._fieldsDisableEnable("Save");
              MessageBox.success(message[1], {
                styleClass: "sapUiSizeCompact"
              });
            } else {
              thisView._errorFieldFocus(hdrMessageObject.target);
              if (message[1]) {
                MessageBox.error(message[1], {
                  styleClass: "sapUiSizeCompact"
                });
              } else {
                MessageBox.error(message[0], {
                  styleClass: "sapUiSizeCompact"
                });
              }
            }
            thisView.getView().setBusy(false);

        thisView.getView().byId('save').setEnabled(true);
          },
          error: function (oError, response) {
            var hdrMessage = JSON.parse(oError.responseText).error.message.value;
            MessageBox.error(hdrMessage, {
              styleClass: "sapUiSizeCompact"
            });
            thisView.getView().setBusy(false);

          thisView.getView().byId('save').setEnabled(true);
          }
        });
      }
      oModel.submitChanges();
      thisView.getView().setBusy(true);

    },

    _errorFieldFocus: function (idFieldDePara) {
      var thisView = this;
      var retorno = "";
      //000      Cod. Cliente
      if (idFieldDePara === "000") {
        thisView.getView().byId("input-Codcliente").focus();
      }
      //001      Nome
      if (idFieldDePara === "001") {
        thisView.getView().byId("input-nome").focus();
      }
      //002      CEP
      if (idFieldDePara === "002") {
        thisView.getView().byId("input-Cep").focus();
      }
      //003      Rua
      if (idFieldDePara === "003") {
        thisView.getView().byId("input-endereco").focus();
      }
      //004      Numero
      if (idFieldDePara === "004") {
        thisView.getView().byId("input-numero").focus();
      }
      //005      Bairro
      if (idFieldDePara === "005") {
        thisView.getView().byId("input-Bairro").focus();
      }
      //006      Cidade
      if (idFieldDePara === "006") {
        thisView.getView().byId("input-Cidade").focus();
        //retorno = "input-Cidade";
      }
      //007      Estado
      if (idFieldDePara === "007") {
        thisView.getView().byId("input-Regiao").focus();
      }
      //008      CNAE
      if (idFieldDePara === "008") {
        thisView.getView().byId("input-Cnae").focus();
      }
      //009      Domic. Fiscal
      if (idFieldDePara === "009") {
        thisView.getView().byId("input-DomicilioFiscal").focus();
      }
      //010      Subst. Tributaria
      if (idFieldDePara === "010") {
        thisView.getView().byId("input-SubstTributaria").focus();
      }
      //011      Setor Ind.
      if (idFieldDePara === "011") {
        thisView.getView().byId("input-SetorInd").focus();
      }
      //012      Suframa
      if (idFieldDePara === "012") {
        thisView.getView().byId("input-Suframa").focus();
      }
      //013      Suframa Validade
      if (idFieldDePara === "013") {
        thisView.getView().byId("input-DtSufurama").focus();
      }
      //014      Grupo de Contas
      if (idFieldDePara === "014") {
        thisView.getView().byId("input-multiComboxCanal").focus();
      }
      //015      Telefone
      if (idFieldDePara === "015") {
        thisView.getView().byId("input-Telefone").focus();
      }
      //017      Email
      if (idFieldDePara === "017") {
        thisView.getView().byId("input-Email").focus();
      }
      return retorno;
    },

    handleCancelPress: function () {
      var thisView = this;
      this._fieldsDisableEnable("Cancel");
      thisView.byId("save").setVisible(false);
      thisView.byId("cancel").setVisible(false);
      thisView._clearForm();
      thisView.byId("combo-tipoPessoa").setSelectedKey(null);
      thisView.byId("searchCnpjCpf").setValue("");
    },

    _readContatos: function (field) {
      var oTable = this.getView().byId("input-listContatos");
      var m = oTable.getModel();
      var data = m.getProperty("/modelData");
      var retorno = "";
      var funcaoContato_tam = "";
      for (var property1 in data) {
        if (property1 > 0) {
          retorno += ";";
        }
        if (field === "Nome") {
          if (data[property1].Nome === undefined) {
            retorno += "";
          } else {
            retorno += data[property1].Nome;
          }
        }
        if (field === "Funcao") {
          if (data[property1].Nome === undefined) {
            retorno += "";
          } else {
            funcaoContato_tam = data[property1].Funcao.Kunnr;
            if (funcaoContato_tam.length == 1) {
              funcaoContato_tam = "0" + funcaoContato_tam;
            };
            retorno += funcaoContato_tam;
          }
        }
        if (field === "Sobrenome") {
          if (data[property1].Sobrenome === undefined) {
            retorno += "";
          } else {
            retorno += data[property1].Sobrenome;
          }
        }
        if (field === "Telefone") {
          retorno += data[property1].Telefone;
        }
        if (field === "Email") {
          retorno += data[property1].Email;
        }
      }
      return retorno;
    },

    _fieldsDisableEnable: function (action) {
      if (action === "Edit") {
        this.getView().byId("input-endereco").setEnabled(true);
        this.getView().byId("input-numero").setEnabled(true);
        this.getView().byId("input-Complemento").setEnabled(true);
        this.getView().byId("input-Bairro").setEnabled(true);
        this.getView().byId("input-Cidade").setEnabled(true);
        this.getView().byId("input-Regiao").setEnabled(true);
        this.getView().byId("input-Cep").setEnabled(true);
        this.getView().byId("input-nome").setEnabled(true);
        this.getView().byId("input-Origem").setEnabled(true);
        this.getView().byId("input-SubstTributaria").setEnabled(true);
        this.getView().byId("input-SetorInd").setEnabled(true);
        this.getView().byId("input-Telefone").setEnabled(true);
        this.getView().byId("input-Email").setEnabled(true);
        this.getView().byId("input-multiComboxOrganizacao").setEnabled(true);
        this.getView().byId("input-multiComboxCanal").setEnabled(true);
        this.getView().byId("input-multiComboxSetorAtividade").setEnabled(true);
        this.getView().byId("input-button").setEnabled(true);
        this.getView().byId("input-buttonRecebedor").setEnabled(true);
        this.getView().byId("input-buttonCobranca").setEnabled(false);
        this.getView().byId("input-Pagador").setEnabled(true);
        if (this.getView().byId("combo-tipoPessoa").getSelectedKey() !== "F") {
          this.getView().byId("input-RecebedorMercadoria").setEnabled(true);
          this.getView().byId("input-buttonCobranca").setEnabled(true);
          this.getView().byId("input-Pagador").setEnabled(true);
          this.getView().byId("input-RecebedorFatura").setEnabled(true);
          this.getView().byId("input-Cobranca").setEnabled(true);
          this.getView().byId("input-Matriz").setEnabled(true);
          if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
            this.getView().byId("input-Matriz").setEnabled(true);
            this.getView().byId("SimpleFormVincularCliente").setVisible(true);
            this.getView().byId("SimpleFormRecebedorMerc").setVisible(true);
            this.getView().byId("SimpleFormCobrancaMerc").setVisible(true);
            this.getView().byId("SimpleFormContatos").setVisible(true);
          } else {
            this.getView().byId("input-Matriz").setEnabled(true);
            this.getView().byId("input-buttonCobranca").setEnabled(false);
            this.getView().byId("input-Cobranca").setEnabled(false);
            this.getView().byId("SimpleFormVincularCliente").setVisible(true);
            this.getView().byId("SimpleFormRecebedorMerc").setVisible(true);
            this.getView().byId("SimpleFormCobrancaMerc").setVisible(true);
            this.getView().byId("SimpleFormContatos").setVisible(false);
          }
          this.getView().byId("btn-Recebedor").setEnabled(true);
          this.getView().byId("btn-Pagador").setEnabled(true);
          this.getView().byId("btn-RecebedorFatura").setEnabled(true);
          this.getView().byId("input-InscricaoEstadual").setEnabled(true);
          this.getView().byId("input-Suframa").setEnabled(true);
          this.getView().byId("input-Cnae").setEnabled(true);
        } else {
          this.getView().byId("SimpleFormVincularCliente").setVisible(true);
          this.getView().byId("SimpleFormRecebedorMerc").setVisible(true);
          this.getView().byId("SimpleFormCobrancaMerc").setVisible(true);
          this.getView().byId("SimpleFormContatos").setVisible(false);
          this.getView().byId("input-Matriz").setEnabled(true);
          this.getView().byId("input-InscricaoEstadual").setEnabled(true);
          this.getView().byId("SimpleFormRecebedorMerc").setVisible(true);
          this.getView().byId("SimpleFormContatos").setVisible(false);
        }
        this.getView().byId("input-Kukla").setEnabled(true);
        this.getView().byId("input-DomicilioFiscal").setEnabled(true);
      } else if (action === "Save") {
        this.getView().byId("searchCnpjCpf").setValue("");
      } else {
        this.getView().byId("input-endereco").setEnabled(false);
        this.getView().byId("input-numero").setEnabled(false);
        this.getView().byId("input-Complemento").setEnabled(false);
        this.getView().byId("input-Bairro").setEnabled(false);
        this.getView().byId("input-Cidade").setEnabled(false);
        this.getView().byId("input-Regiao").setEnabled(false);
        this.getView().byId("input-Cep").setEnabled(false);
        this.getView().byId("input-Cnae").setEnabled(false);
        this.getView().byId("input-Classifcli").setEnabled(false);
        this.getView().byId("input-nome").setEnabled(false);
        this.getView().byId("input-Origem").setEnabled(false);
        this.getView().byId("input-SetorInd").setEnabled(false);
        this.getView().byId("input-Matriz").setEnabled(false);
        this.getView().byId("input-Telefone").setEnabled(false);
        this.getView().byId("input-Email").setEnabled(false);
        this.getView().byId("input-multiComboxOrganizacao").setEnabled(false);
        this.getView().byId("input-multiComboxCanal").setEnabled(false);
        this.getView().byId("input-multiComboxSetorAtividade").setEnabled(false);
        this.getView().byId("input-SubstTributaria").setEnabled(false);
        this.getView().byId("input-button").setEnabled(false);
        this.getView().byId("input-buttonRecebedor").setEnabled(false);
        this.getView().byId("input-buttonCobranca").setEnabled(false);
        this.getView().byId("input-RecebedorMercadoria").setEnabled(false);
        this.getView().byId("input-Cobranca").setEnabled(false);
        this.getView().byId("input-Pagador").setEnabled(false);
        this.getView().byId("input-RecebedorFatura").setEnabled(false);
        this.getView().byId("input-RecebedorCodigo").setEnabled(false);
        this.getView().byId("input-PagadorCodigo").setEnabled(false);
        this.getView().byId("input-RecebedorFaturaCodigo").setEnabled(false);
        this.getView().byId("input-RecebedorMercadoria").setEnabled(false);
        this.getView().byId("input-PagadorNome").setEnabled(true);
        this.getView().byId("input-RecebedorFaturaNome").setEnabled(false);
        this.getView().byId("input-InscricaoEstadual").setEnabled(false);
        this.getView().byId("input-Cnae").setEnabled(false);
        this.getView().byId("input-Kukla").setEnabled(false);
        this.getView().byId("btn-Recebedor").setEnabled(false);
        this.getView().byId("btn-Pagador").setEnabled(false);
        this.getView().byId("btn-RecebedorFatura").setEnabled(false);
        this.getView().byId("btn-Cobranca").setEnabled(false);
        this.getView().byId("input-Suframa").setEnabled(false);
        this.getView().byId("input-DtSufurama").setEnabled(false);
        this.getView().byId("input-DomicilioFiscal").setEnabled(false);
        this.getView().byId("SimpleFormVincularCliente").setVisible(false);
        this.getView().byId("SimpleFormRecebedorMerc").setVisible(false);
        this.getView().byId("SimpleFormCobrancaMerc").setVisible(false);
        this.getView().byId("SimpleFormContatos").setVisible(false);
        if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
          this.getView().byId("SimpleFormVincularCliente").setVisible(true);
          this.getView().byId("SimpleFormRecebedorMerc").setVisible(true);
          this.getView().byId("SimpleFormCobrancaMerc").setVisible(true);
          this.getView().byId("SimpleFormContatos").setVisible(true);
          this.getView().byId("input-DtSufurama").setEnabled(false);
          this.getView().byId("input-Suframa").setEnabled(false);
        }
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "G") {
        this.getView().byId("input-Cnae").setEnabled(false);
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() == "E" || this.getView().byId("combo-tipoPessoa").getSelectedKey() ==
        "C" || this.getView().byId("combo-tipoPessoa").getSelectedKey() == "G") {
        this.getView().byId("btn-Pagador").setEnabled(false);
        this.getView().byId("input-Pagador").setEnabled(false);
        this.getView().byId("btn-Recebedor").setEnabled(false);
        this.getView().byId("input-buttonRecebedor").setVisible(false);
      }
    },

    _splitMultiCombo: function (comboboxItems) {
      var filter = '',
        query = '';
      if (comboboxItems.length != '') {
        for (var i = 0; i < comboboxItems.length; i++) {
          query += "" + comboboxItems[i].toString() + "";
          if (i != comboboxItems.length - 1) {
            query += ";";
          }
        }
        filter = query;
      }
      return filter;
    },

    _clearForm: function () {
      var thisView = this;
      thisView.byId("input-Codcliente").setValue("");
      thisView.byId("input-endereco").setValue("");
      thisView.byId("input-numero").setValue("");
      thisView.byId("input-Complemento").setValue("");
      thisView.byId("input-Bairro").setValue("");
      thisView.byId("input-Cidade").setSelectedKey(null);
      thisView.byId("input-Cep").setValue("");
      thisView.byId("input-nome").setValue("");
      thisView.byId("input-Origem").setValue("");
      thisView.byId("input-Telefone").setValue("");
      thisView.byId("input-Email").setValue("");
      thisView.byId("input-InscricaoEstadual").setValue("");
      thisView.byId("input-Cnae").setSelectedKey(null);
      thisView.byId("input-SubstTributaria").setValue("");
      thisView.byId("input-Matriz").setValue("");
      thisView.byId("input-Regiao").setSelectedKey(null);
      thisView.byId("input-SetorInd").setSelectedKey(null);
      thisView.byId("input-Kukla").setValue("");
      thisView.byId("input-multiComboxOrganizacao").setValue("");
      thisView.byId("input-multiComboxCanal").setValue("");
      thisView.byId("input-multiComboxSetorAtividade").setValue("");
      thisView.byId("input-multiComboxOrganizacao").setValue("");
      thisView.byId("input-multiComboxCanal").setValue("");
      thisView.byId("input-multiComboxSetorAtividade").setValue("");
      thisView.byId("input-RecebedorMercadoria").setValue("");
      thisView.byId("input-CobrancaCodigo").setValue("");
      thisView.byId("input-Cobranca").setValue("");
      thisView.byId("input-CobrancaNome").setValue("");
      thisView.byId("input-Pagador").setValue("");
      thisView.byId("input-RecebedorFatura").setValue("");
      thisView.byId("input-RecebedorCodigo").setValue("");
      thisView.byId("input-PagadorCodigo").setValue("");
      thisView.byId("input-RecebedorFaturaCodigo").setValue("");
      thisView.byId("input-RecebedorMercadoriaNome").setValue("");
      thisView.byId("input-PagadorNome").setValue("");
      thisView.byId("input-RecebedorFaturaNome").setValue("");
      thisView.byId("input-InscricaoEstadual").setValue("");
      thisView.byId("input-Suframa").setValue("");
      thisView.byId("input-DtSufurama").setValue("");
      thisView.byId("input-DomicilioFiscal").setSelectedKey(null);

      //limpar contatos
      var oTable = this.getView().byId("input-listContatos");
      var m = oTable.getModel();
      var data;
      data = m.getProperty("/modelData");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }

      m.setProperty("/modelData", data);
      //Fim limpar fim contatos
      //Limpa Recebedor Mercadoria
      oTable = this.getView().byId("listRecebedorMerc");
      m = oTable.getModel();
      data = m.getProperty("/modelDataRecebedorMerc");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }

      m.setProperty("/modelDataRecebedorMerc", data);
      //Limpa Cobran�a
      oTable = this.getView().byId("listCobrancaMerc");
      m = oTable.getModel();
      data = m.getProperty("/modelDataCobrancaMerc");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }
      m.setProperty("/modelDataCobrancaMerc", data);
      //limpar �reas de venda
      this.getView().byId("input-multiComboxOrganizacao").setSelectedItems([]);
      this.getView().byId("input-multiComboxCanal").setSelectedItems([]);
      this.getView().byId("input-multiComboxSetorAtividade").setSelectedItems([]);
    },

    handleSearchClientesRecebedor: function (oEvent) {
      //create model filter
      var filters = [];
      var query = oEvent.getParameter("value");
      var query2 = query;
      query = this.utilFormatterCPFCNPJClearSearch(query);
      if ((query && query.length > 0) && (query.trim() != '')) {
        var filter;
        if ($.isNumeric(query) && query.length == 11) {
          filter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, query);
        }
        if ($.isNumeric(query) && query.length < 11) {
          filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, query);
        } else if ($.isNumeric(query) && query.length > 11) {
          filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
        } else if (!$.isNumeric(query)) {
          filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
        }
        filters.push(filter);
      }
      if (this.getView().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'M'));
      } else {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'Q'));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    handleSearchClientesCobranca: function (oEvent) {
      //create model filter
      var filters = [];
      var query = oEvent.getParameter("value");
      var query2 = query;
      query = this.utilFormatterCPFCNPJClearSearch(query);
      if ((query && query.length > 0) && (query.trim() != '')) {
        var filter;
        if ($.isNumeric(query) && query.length == 11) {
          filter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, query);
        }
        if ($.isNumeric(query) && query.length < 11) {
          filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, query);
        } else if ($.isNumeric(query) && query.length > 11) {
          filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
        } else if (!$.isNumeric(query)) {
          filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
        }
        filters.push(filter);
      }
      if (this.getView().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'O'));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    handleSearchClientes: function (oEvent) {
      //create model filter
      var filters = [];
      var query = oEvent.getParameter("value");
      var query2 = query;
      query = this.utilFormatterCPFCNPJClearSearch(query);
      if ((query && query.length > 0) && (query.trim() != '')) {
        var filter;
        if ($.isNumeric(query) && query.length == 11) {
          filter = new sap.ui.model.Filter("Cpf", sap.ui.model.FilterOperator.Contains, query);
        }
        if ($.isNumeric(query) && query.length < 11) {
          filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, query);
        } else if ($.isNumeric(query) && query.length > 11) {
          filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
        } else if (!$.isNumeric(query)) {
          filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
        }
        filters.push(filter);
      }
      if (this.getView().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
        aFilters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'I'));
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        aFilters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'P'));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    lonChangeMatriz: function (oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();

      sInputValue = oEvent.target.value;
      fieldInput = oEvent.target.value;
      var tipocli = '';
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        tipocli = 'P';
      } else {
        tipocli = 'I';
      }
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + this.byId("input-Codcliente").getValue() + "')";
      }
      var thisview = this;
      oData.read(sPath, {

        success: function (oResult) {
          thisview.getView().byId("input-PagadorCodigo").setValue(sInputValue);
          thisview.getView().byId("input-PagadorNome").setValue(oResult.Nome);
          thisview.getView().byId("input-Pagador").setValue('');

        },
        error: function (oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
          thisview.getView().byId("input-Pagador").setValue('');
          thisview.getView().byId("input-Matriz").setValue('');
        },
      });

      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        //this.buscaMatriz();
      }

    },

    onChangeMatriz: function (oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      sInputValue = oEvent.getSource().getValue();
      fieldInput = oEvent.getSource().getId();
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='" +
          this.byId("input-Codcliente").getValue() + "')";
      }
      var thisview = this;
      oData.read(sPath, {
        success: function (oResult) {
          thisview.getView().byId("input-PagadorCodigo").setValue(sInputValue);
          thisview.getView().byId("input-PagadorNome").setValue(oResult.Nome);
          thisview.getView().byId("input-Pagador").setValue("");
        },
        error: function (oResult) {
          //       alert("Código do cliente não encontrado.")
        },
      });
    },

    liveChangeCobranca: function (oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      sInputValue = oEvent.target.value;

      var tipocli = '';
      if (this.getView().byId("input-Codcliente").getValue() !== sInputValue) {
        tipocli = 'O';
      }

      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && sInputValue.length == 7) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + this.byId("input-Codcliente").getValue() + "')";
      }
      var oview = this;
      var oTable = this.getView().byId("listCobrancaMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataCobrancaMerc");

      oData.read(sPath, {
        success: function (oResult) {
          console.table(oResult);
          codigo = sInputValue;
          aDataCobrancaMerc = [];
          var pos = data.length - 1;
          for (property1 in data) {
            if (property1 == pos) {
              aDataCobrancaMerc.push({
                CobrancaMercCodigo: sInputValue,
                CobrancaMercNome: oResult.Nome,
                CobrancaMercEndereco: oResult.Endereco,
                CobrancaMercLocal: oResult.Cidade,
              });
            } else {
              aDataCobrancaMerc.push({
                CobrancaMercCodigo: data[property1].CobrancaMercCodigo,
                CobrancaMercNome: data[property1].CobrancaMercNome,
                CobrancaMercEndereco: data[property1].CobrancaMercEndereco,
                CobrancaMercLocal: data[property1].CobrancaMercLocal,
                CobrancaMercLocalNovo: data[property1].CobrancaMercLocalNovo,
              });
            }
          }
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({
            modelDataCobrancaMerc: aDataCobrancaMerc
          });
          oTable.setModel(oModel);
          oModel.refresh(true);

        },
        error: function (oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
        },
      });
    },

    liveChangeRecebedor: function (oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      var tipocli = '';

      sInputValue = oEvent.target.value;

      if (this.getView().byId("input-Codcliente").getValue() !== sInputValue) {
        if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
          tipocli = 'M';
        } else {
          tipocli = 'Q';
        }
      }

      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && sInputValue.length == 7) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + this.byId("input-Codcliente").getValue() + "')";
      }

      var oview = this;
      var oTable = this.getView().byId("listRecebedorMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataRecebedorMerc");

      oData.read(sPath, {
        success: function (oResult) {
          console.table(oResult);
          codigo = sInputValue;
          aDataRecebedorMerc = [];
          var pos = data.length - 1;
          for (property1 in data) {
            if (property1 == pos) {
              aDataRecebedorMerc.push({
                RecebedorMercCodigo: sInputValue,
                RecebedorMercNome: oResult.Nome,
                RecebedorMercEndereco: oResult.Endereco,
                RecebedorMercLocal: oResult.Cidade,
              });
            } else {
              aDataRecebedorMerc.push({
                RecebedorMercCodigo: data[property1].RecebedorMercCodigo,
                RecebedorMercNome: data[property1].RecebedorMercNome,
                RecebedorMercEndereco: data[property1].RecebedorMercEndereco,
                RecebedorMercLocal: data[property1].RecebedorMercLocal,
                RecebedorMercLocalNovo: data[property1].RecebedorMercLocalNovo,
              });
            }
          }
          var oModel = new sap.ui.model.json.JSONModel();
          oModel.setData({
            modelDataRecebedorMerc: aDataRecebedorMerc
          });
          oTable.setModel(oModel);
          oModel.refresh(true);

        },
        error: function (oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
        },
      });
    },

    handleValueHelp: function (oEvent) {
      var sInputValue, sSearchFiled;
      sInputValue = oEvent.getSource().getValue();

      if ($.isNumeric(sInputValue) && sInputValue.length == 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cpf";
      }
      if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
        sSearchFiled = "Codcliente";
      } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cnpj";
      } else if (!$.isNumeric(sInputValue)) {
        sSearchFiled = "Nome";
      }
      this.inputId = oEvent.getSource().getId();
      if (this._valueHelpDialog) {
        this._valueHelpDialog = null;
      }

      // create value help dialog
      this._valueHelpDialog = sap.ui.xmlfragment(
        "arcelor.view.ClientesPesquisaDialog",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      var filter = [];
      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (this.byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'P'));
      } else {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'I'));
      }
      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    handleValueHelpRecebedor: function (oEvent) {
      var sInputValue, sSearchFiled;
      sInputValue = oEvent.getSource().getValue();

      if ($.isNumeric(sInputValue) && sInputValue.length == 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cpf";
      }
      if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
        sSearchFiled = "Codcliente";
      } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cnpj";
      } else if (!$.isNumeric(sInputValue)) {
        sSearchFiled = "Nome";
      }
      this.inputId = oEvent.getSource().getId();
      if (this._valueHelpDialog) {
        this._valueHelpDialog = null;
      }

      // create value help dialog
      this._valueHelpDialog = sap.ui.xmlfragment(
        "arcelor.view.ClientesPesquisaDialogRecebedor",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      var filter = [];
      if (this.getView().byId("combo-tipoPessoa").getValue() === "J") {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'Q'));
      } else {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'M'));
      }
      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (this.byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    handleValueHelpCobranca: function (oEvent) {
      var sInputValue, sSearchFiled;
      sInputValue = oEvent.getSource().getValue();
      //sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
      if ($.isNumeric(sInputValue) && sInputValue.length == 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cpf";
      }
      if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
        sSearchFiled = "Codcliente";
      } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cnpj";
      } else if (!$.isNumeric(sInputValue)) {
        sSearchFiled = "Nome";
      }
      this.inputId = oEvent.getSource().getId();
      if (this._valueHelpDialog) {
        this._valueHelpDialog = null;
      }
      this._valueHelpDialog = sap.ui.xmlfragment(
        "arcelor.view.ClientesPesquisaDialogCobranca",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      var filter = [];
      filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'O'));
      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (this.byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    handleValueHelpRecebedor: function (oEvent) {
      var sInputValue, sSearchFiled;
      sInputValue = oEvent.getSource().getValue();

      if ($.isNumeric(sInputValue) && sInputValue.length == 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cpf";
      }
      if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
        sSearchFiled = "Codcliente";
      } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
        sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);
        sSearchFiled = "Cnpj";
      } else if (!$.isNumeric(sInputValue)) {
        sSearchFiled = "Nome";
      }
      this.inputId = oEvent.getSource().getId();
      if (this._valueHelpDialog) {
        this._valueHelpDialog = null;
      }
      this._valueHelpDialog = sap.ui.xmlfragment(
        "arcelor.view.ClientesPesquisaDialogRecebedor",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      var filter = [];
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'Q'));
      } else {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'M'));
      }
      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (this.byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    _handleValueHelpSearch: function (evt) {
      var sValue = evt.getParameter("value");
      var oFilter = new Filter(
        "Name",
        sap.ui.model.FilterOperator.Contains, sValue
      );
      evt.getSource().getBinding("items").filter([oFilter]);
    },

    handleValueHelpCloseParceiro: function (oEvent) {
      var oSelectedItem, fieldInput;
      oSelectedItem = oEvent.getParameter("selectedItem");
      if (oSelectedItem) {
        fieldInput = this.getView().byId(this.inputId);
        fieldInput.setValue(oSelectedItem.getDescription());
        var bc = fieldInput.getBindingContext();
        var pos = bc.sPath.split("/");
        var codigo = oSelectedItem.getDescription();
        var nome = oSelectedItem.getTitle();
        var oTable = this.getView().byId("listRecebedorMerc");
        var m = oTable.getModel();
        var data = m.getProperty("/modelDataRecebedorMerc");
        aDataRecebedorMerc = [];
        for (var property1 in data) {
          if (property1 === pos[2]) {
            aDataRecebedorMerc.push({
              RecebedorMercCodigo: codigo,
              RecebedorMercNome: nome
            });
          } else {
            aDataRecebedorMerc.push({
              RecebedorMercCodigo: data[property1].RecebedorMercCodigo,
              RecebedorMercNome: data[property1].RecebedorMercNome
            });
          }
        }
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          modelDataRecebedorMerc: aDataRecebedorMerc
        });
        oTable.setModel(oModel);
      }
    },

    _handleValueHelpClose: function (evt) {
      var oSelectedItem, fieldInput, aContexts, oModel;
      var bc, pos, codigo, nome, oTable, m, data, property1;
      var codigo, nome;
      var nomeSplit, localidadeSplit, enderecoSplit, localSplit, endereco, local;
      oSelectedItem = evt.getParameter("selectedItem");
      if (oSelectedItem) {
        fieldInput = this.getView().byId(this.inputId);
        fieldInput.setValue(oSelectedItem.getDescription());
      }
      evt.getSource().getBinding("items").filter([]);
      if (this.inputId === "__component0---clientescadastro--input-Contatos") {
        aContexts = evt.getParameter("selectedContexts");
        fieldInput.setValue("");
        nome = aContexts.map(
          function (oContext) {
            return oContext.getObject().Nome;
          }
        );
        var telefone = aContexts.map(
          function (oContext) {
            return oContext.getObject().Telefone;
          }
        );
        var email = aContexts.map(
          function (oContext) {
            return oContext.getObject().Email;
          }
        );
        aDataContatos.push({
          Nome: nome,
          Telefone: telefone,
          Email: email
        });
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          modelData: aDataContatos
        });
        var oTableData = this.getView().byId("ListContatosChange");
        oTableData.setModel(oModel);
      }
      if (fieldInput.oParent.oParent.sId === "__component0---clientescadastro--listRecebedorMerc") {
        fieldInput = this.getView().byId(this.inputId);
        fieldInput.setValue(oSelectedItem.getDescription());
        bc = fieldInput.getBindingContext();
        pos = bc.sPath.split("/");
        codigo = oSelectedItem.getDescription();
        nomeSplit = oSelectedItem.getTitle().split("-");
        nome = nomeSplit[0];
        localidadeSplit = oSelectedItem.getInfo().split("/");
        enderecoSplit = localidadeSplit[0].split(":");
        localSplit = localidadeSplit[4].split(":");
        endereco = "";
        local = "";
        if (enderecoSplit[1] !== "undefined") {
          endereco = enderecoSplit[1].trim();
        }
        if (localSplit[1] !== "undefined") {
          local = localSplit[1].trim();
        }
        oTable = this.getView().byId("listRecebedorMerc");
        m = oTable.getModel();
        data = m.getProperty("/modelDataRecebedorMerc");
        aDataRecebedorMerc = [];
        for (property1 in data) {
          if (property1 === pos[2]) {
            aDataRecebedorMerc.push({
              RecebedorMercCodigo: codigo,
              RecebedorMercNome: nome,
              RecebedorMercEndereco: endereco,
              RecebedorMercLocal: local
            });
          } else {
            aDataRecebedorMerc.push({
              RecebedorMercCodigo: data[property1].RecebedorMercCodigo,
              RecebedorMercNome: data[property1].RecebedorMercNome,
              RecebedorMercEndereco: data[property1].RecebedorMercEndereco,
              RecebedorMercLocal: data[property1].RecebedorMercLocal
            });
          }
        }
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          modelDataRecebedorMerc: aDataRecebedorMerc
        });
        oTable.setModel(oModel);
      }
      if (this.inputId === "__component0---clientescadastro--input-Pagador" || this.inputId ===
        "__component0---clientescadastro--input-Matriz") {
        aContexts = evt.getParameter("selectedContexts");
        codigo = aContexts.map(
          function (oContext) {
            return oContext.getObject().Codcliente;
          }
        );
        nome = aContexts.map(
          function (oContext) {
            return oContext.getObject().Nome;
          }
        );
        this.getView().byId("input-PagadorCodigo").setValue(codigo);
        this.getView().byId("input-PagadorNome").setValue(nome);
      }
      if (this.inputId === "__component0---clientescadastro--input-RecebedorFatura") {
        aContexts = evt.getParameter("selectedContexts");
        codigo = aContexts.map(
          function (oContext) {
            return oContext.getObject().Codcliente;
          }
        );
        nome = aContexts.map(
          function (oContext) {
            return oContext.getObject().Nome;
          }
        );
        this.getView().byId("input-RecebedorFaturaCodigo").setValue(codigo);
        this.getView().byId("input-RecebedorFaturaNome").setValue(nome);
      }
      if (fieldInput.oParent.oParent.sId === "__component0---clientescadastro--listCobrancaMerc") {
        fieldInput = this.getView().byId(this.inputId);
        fieldInput.setValue(oSelectedItem.getDescription());
        bc = fieldInput.getBindingContext();
        pos = bc.sPath.split("/");
        codigo = oSelectedItem.getDescription();
        nomeSplit = oSelectedItem.getTitle().split("-");
        nome = nomeSplit[0];
        localidadeSplit = oSelectedItem.getInfo().split("/");
        enderecoSplit = localidadeSplit[0].split(":");
        localSplit = localidadeSplit[4].split(":");
        endereco = "";
        local = "";
        if (enderecoSplit[1] !== "undefined") {
          endereco = enderecoSplit[1].trim();
        }
        if (localSplit[1] !== "undefined") {
          local = localSplit[1].trim();
        }
        oTable = this.getView().byId("listCobrancaMerc");
        m = oTable.getModel();
        data = m.getProperty("/modelDataCobrancaMerc");
        aDataCobrancaMerc = [];
        for (property1 in data) {
          if (property1 === pos[2]) {
            aDataCobrancaMerc.push({
              CobrancaMercCodigo: codigo,
              CobrancaMercNome: nome,
              CobrancaMercEndereco: endereco,
              CobrancaMercLocal: local
            });
          } else {
            aDataCobrancaMerc.push({
              CobrancaMercCodigo: data[property1].CobrancaMercCodigo,
              CobrancaMercNome: data[property1].CobrancaMercNome,
              CobrancaMercEndereco: data[property1].CobrancaMercEndereco,
              CobrancaMercLocal: data[property1].CobrancaMercLocal
            });
          }
        }
        oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          modelDataCobrancaMerc: aDataCobrancaMerc
        });
        oTable.setModel(oModel);
      }
    },

    onCreateItems: function () {
      var sPath = "/ContatoClientesSet";
      var onSuccess = function (odata) {
        var combodados = [];
        var oview = this;
        for (var i = 0; i < odata.results.length; i++) {
          combodados.push({
            Kunnr: odata.results[i].Kunnr,
            Pafkt: odata.results[i].Pafkt,
            Parau: odata.results[i].Parau
          });
        };
        aDataContatos.push({
          Nome: "",
          Telefone: "",
          Email: "",
          Funcao: combodados
        });
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          modelData: aDataContatos
        });
        var oTableData = this.getView().byId("input-listContatos");
        oTableData.setModel(oModel);
      };
      var onError = function (odata) {
        teste = odata;
      };
      this.getView().getModel().read(sPath, {
        success: onSuccess.bind(this),
        error: onError.bind(this)
      });
    },

    onCreateItemsRecebedor: function () {
      aDataRecebedorMerc.push({
        RecebedorMercCodigo: "",
        RecebedorMercNome: ""
      });
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        modelDataRecebedorMerc: aDataRecebedorMerc
      });
      var oTableData = this.getView().byId("listRecebedorMerc");
      var oview = this;
      oTableData.setModel(oModel);
      oTableData.getItems().forEach(function (oItem) {
        oItem.mAggregations.cells[0].addEventDelegate({
          onfocusout: function (e) {
            oview.liveChangeRecebedor(e)
          }
        })
      })
    },

    onCreateItemsCobranca: function () {
      aDataCobrancaMerc.push({
        CobrancaMercCodigo: "",
        CobrancaMercNome: ""
      });
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        modelDataCobrancaMerc: aDataCobrancaMerc
      });
      var oTableData = this.getView().byId("listCobrancaMerc");
      oTableData.setModel(oModel);
      var oview = this;
      oTableData.getItems().forEach(function (oItem) {
        oItem.mAggregations.cells[0].addEventDelegate({
          onfocusout: function (e) {
            oview.liveChangeCobranca(e)
          }
        })
      })
    },

    onDeleteSelectedItems: function (oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = this.getView().byId("input-listContatos");
      var m = oTable.getModel();
      var data = m.getProperty("/modelData");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelData", data);
      sap.m.MessageToast.show("Contato removido!");
    },

    onDeleteSelectedItemsRecebedor: function (oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = this.getView().byId("listRecebedorMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataRecebedorMerc");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelDataRecebedorMerc", data);
      sap.m.MessageToast.show("Recebedor removido!");
    },

    onDeleteSelectedItemsCobranca: function (oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = this.getView().byId("listCobrancaMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataCobrancaMerc");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelDataCobrancaMerc", data);
      sap.m.MessageToast.show("Cobrança removido!");
    },

    _filterMulticombo: function (comboboxItems) {
      var retorno = '';
      if (comboboxItems.length != '') {
        for (var i = 0; i < comboboxItems.length; i++) {
          retorno += "" + comboboxItems[i].toString() + "";
          if (i != comboboxItems.length - 1) {
            retorno += ",";
          }
        }
      }
      return retorno;
    },

    _onBindingChange: function (oEvent) {

    },

    onNavBack: function (oEvent) {
      var thisView = this;
      thisView._clearForm();
      thisView._fieldsDisableEnable();
      thisView.getView().byId("searchCnpjCpf").setValue("");
      thisView.byId("combo-tipoPessoa").setSelectedKey(null);
      this.getOwnerComponent().getRouter().navTo("clientes");
    },

    onDeleteRecebedor: function () {
      this.getView().byId("input-RecebedorCodigo").setValue("");
      this.getView().byId("input-RecebedorMercadoriaNome").setValue("");
    },

    onDeletePagador: function () {
      this.getView().byId("input-PagadorCodigo").setValue("");
      this.getView().byId("input-PagadorNome").setValue("");
      this.getView().byId("input-Pagador").setValue("");
    },

    onDeleteRecebedorFatura: function () {
      this.getView().byId("input-RecebedorFaturaCodigo").setValue("");
      this.getView().byId("input-RecebedorFaturaNome").setValue("");
    },

    onDeleteCobranca: function () {
      this.getView().byId("input-CobrancaCodigo").setValue("");
      this.getView().byId("input-CobrancaNome").setValue("");
    },

    onMaskCPFCNPJ: function (oEvent) {
      var cpfCnpj = oEvent.getParameter("newValue");
      if (this.getView().byId("combo-tipoPessoa").getSelectedKey() === "F") {
        if (cpfCnpj.length === 11) {
          this.getView().byId("searchCnpjCpf").setValue(this.utilFormatterCPFCNPJ(cpfCnpj, "F"));
        }
      } else {
        if (cpfCnpj.length === 14) {
          this.getView().byId("searchCnpjCpf").setValue(this.utilFormatterCPFCNPJ(cpfCnpj, "J"));
        }
      }
    },

    onMaskCEP: function (oEvent, valor) {
      var thisView = this;
      if (typeof valor == "undefined") {
        var cep = thisView.utilClearCharToNumber(oEvent.getParameter("value"));
      } else {
        var cep = valor;
      }

      if (cep.length >= 8) {
        this.getView().byId("input-Cep").setValue(this.utilFormatterCEP(cep));
        var oView = this.getView();
        var oData = this.getView().getModel();
        var onError = function (odata, response) {
          oView.setBusy(false);
          sap.m.MessageBox.show('Cep não encontrado', {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function (oAction) {
              thisView.byId("input-endereco").setValue("");
              thisView.byId("input-Bairro").setValue("");
              thisView.byId("input-numero").setValue("");
              thisView.byId("input-Complemento").setValue("");
              thisView.byId("input-Regiao").setSelectedKey(null);
              thisView.byId("input-Cidade").setSelectedKey(null);
            }
          });
        };
        var onSuccess = function (odata) {
          thisView.utilSearchCity(odata.Estado, thisView);
          var endereco = odata.TpLogradouro + " " + odata.Logradouro;
          thisView.byId("input-endereco").setValue(endereco);
          thisView.byId("input-Bairro").setValue(odata.Bairro);
          thisView.byId("input-Regiao").setSelectedKey(odata.Estado);
          thisView.byId("input-numero").setValue("");
          thisView.byId("input-Complemento").setValue("");
          thisView.byId("input-Cidade").setSelectedKey(odata.CodCidade);

          var sEnd = thisView.byId("input-endereco").getValue();
          var sBair = thisView.byId("input-Bairro").getValue();
          sEnd = sEnd.toUpperCase();
          sBair = sBair.toUpperCase();
          thisView.byId("input-endereco").setValue(sEnd);
          thisView.byId("input-Bairro").setValue(sBair);

          oView.setBusy(false);
        };
        oView.setBusy(true);
        var sPath = "/EnderecoSet(Cep='" + cep + "')";
        oData.read(sPath, {
          success: onSuccess,
          error: onError
        });
      }
    },

    onLimiteCidade: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var thisView = this;

      if (sValue.length >= 36) {
        var sTamanho = sValue.substr(0, 35);
        thisView.byId("input-Cidade").setValue(sTamanho);
      }
    },

    onSearchCity: function () {
      var thisView = this;
      var oView = this.getView();
      var estado = thisView.getView().byId("input-Regiao").getSelectedKey();
      thisView.byId("input-endereco").setValue("");
      thisView.byId("input-Bairro").setValue("");
      thisView.byId("input-numero").setValue("");
      thisView.byId("input-Complemento").setValue("");
      thisView.byId("input-Cidade").setSelectedKey(null);
      if (estado !== " ") {
        oView.setBusy(true);
        thisView.utilSearchCity(estado, thisView);
        oView.setBusy(false);
      }
    },

    onSelectCity: function () {
      var thisView = this;
      thisView.byId("input-endereco").setValue("");
      thisView.byId("input-Bairro").setValue("");
      thisView.byId("input-numero").setValue("");
      thisView.byId("input-Complemento").setValue("");
    },

    onMaskTelefone: function (oEvent) {
      var telefone = oEvent.getParameter("value");
      this.getView().byId("input-Telefone").setValue(this.utilFormatterTelefone(telefone));
    },

    suggestionItemSelected: function (evt) {
      var oInput = this.getView().byId('productInput'),
        oText = this.getView().byId('selectedKey'),
        sKey = oInput.getSelectedKey();
      oText.setText(sKey);
    },

    onExit: function () {
      var thisView = this;
      thisView._clearForm();
      thisView.getView().byId("searchCnpjCpf").setValue("");
    },

    onMaskTelefoneContato: function (oEvent) {
      var telefone = oEvent.getParameter("value");
      var oTable = this.getView().byId("input-listContatos");
      var m = oTable.getModel();
      var data = m.getProperty("/modelData");

      aDataContatos = [];
      for (var property1 in data) {
        aDataContatos.push({
          Nome: data[property1].Nome,
          Sobrenome: data[property1].Sobrenome,
          Telefone: this.utilFormatterTelefone(data[property1].Telefone),
          Email: data[property1].Email,
          Funcao: data[property1].Funcao
        });
      }
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        modelData: aDataContatos
      });
      var oTableData = this.getView().byId("input-listContatos");
      oTableData.setModel(oModel);
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onChangeIe: function (oEvent) {
      let sValue = oEvent.getParameter("value");
      let isValid = false;
      let regex = /^[a-z0-9]+$/i;
      let idInput = oEvent.getSource().getId();
      var newValue = sValue;
      isValid = regex.test(sValue);
      if (!isValid) {
        if (sValue.length > 1) {
          for (var x = 0; x < sValue.length; x++) {
            if (!regex.test(oEvent.getParameter("value")[x])) {
              newValue = newValue.replace(oEvent.getParameter("value")[x], "");
            }
          }
        } else {
          newValue = sValue.replace(oEvent.getParameter("value")[sValue.length - 1], "");
        }
        if (oEvent.getSource().getId().includes("input-InscricaoEstadual")) {
          sap.ui.getCore().byId(idInput).setValue(newValue);
        } else {
          this.byId("carrierIE").setValue(newValue);
        }
      }
    }
  });
});