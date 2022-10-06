sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/ui/Device",
  "arcelor/model/formatter",
  'sap/ui/model/odata/ODataModel'

], function (BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, ODataModel) {
  "use strict";

  return BaseController.extend("arcelor.controller.Clientes", {

    onAfterRendering: function () {

      try {
        sap.ui.controller("arcelor.controller.Inicio").authControl();

        let modelUsuario = this.getOwnerComponent().getModel("usuario").getData();
        this.byId("idUsuario").setText(modelUsuario.getId());
        this.byId("nomeUsuario").setText(modelUsuario.getFirstName());
        this.byId("nomeLoja").setText(sap.ui.getCore().getModel("centroloja").getData()[0].loja);
      } catch {

      };

    },

    onInit: function () {

    },

    actionConsulta: function (oEvent) {
      this._clearClienteConsulta();
      this.getOwnerComponent().getRouter().navTo("ClientesConsulta");
    },

    actionADC: function (oEvent) {
      this._clearClienteConsulta();
      this.getOwnerComponent().getRouter().navTo("ClientesConsultaADC");
    },

    actionCadastro: function (oEvent) {
      this._clearClienteCadastro();
      this._fieldsDisableClieCadastro();
      this.getOwnerComponent().getRouter().navTo("ClientesCadastro", null, true);
    },

    actionCreditoAlterar: function (oEvent) {
      this._clearClientesCreditoAlterar();
      this.getOwnerComponent().getRouter().navTo("ClientesCreditoAlterar", null, true);
    },

    actionCreditoTransfResp: function (oEvent) {
      this._clearClientesCreditoTransfResp();
      this.getOwnerComponent().getRouter().navTo("ClientesCreditoTransfResp", null, true);
    },

    actionFaturamento: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("Faturamento", null, true);
    },

    _clearClientesCreditoTransfResp: function () {

      var view = sap.ui.getCore().byId("__component0---clientescreditotransfresp");

      if (view !== undefined) {
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--show-GrupoAtual").setValue("");
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--show-Cliente").setText("");
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--show-Nome").setText("");
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--show-Gruporesponsavel").setText("");
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--show-GrupoNovo").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--button-save").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescreditotransfresp--button-cancel").setVisible(false);
      }
    },

    _clearClientesCreditoAlterar: function () {

      var view = sap.ui.getCore().byId("__component0---clientescreditoalterar");

      if (view !== undefined) {
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-GrupoAtual").setValue("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-Cliente").setText("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-Nome").setText("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-LimiteTotal").setText("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-LimiteIndividual").setText("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--input-LimiteCredito").setValue("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--show-Gruporesponsavel").setText("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--input-DtVerificacao").setValue("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--input-ClasseRisco").setValue("");
        sap.ui.getCore().byId("__component0---clientescreditoalterar--button-save").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescreditoalterar--button-cancel").setVisible(false);
      }
    },

    _clearClienteCadastro: function () {

      var view = sap.ui.getCore().byId("__component0---clientescadastro");

      if (view !== undefined) {
        sap.ui.getCore().byId("__component0---clientescadastro--combo-tipoPessoa").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--searchCnpjCpf").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Codcliente").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-nome").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cep").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-endereco").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-numero").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Complemento").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Bairro").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Regiao").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cidade").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Telefone").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Email").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Origem").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Kukla").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Classifcli").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cnae").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-DomicilioFiscal").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-SubstTributaria").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Matriz").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-SetorInd").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientescadastro--input-InscricaoEstadual").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-Suframa").setValue("");
        sap.ui.getCore().byId("__component0---clientescadastro--input-DtSufurama").setValue("");

        //limpar areas de venda
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxOrganizacao").setSelectedItems([]);
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxCanal").setSelectedItems(["40"]);
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxSetorAtividade").setSelectedItems([]);

        //limpar contatos
        var oTable = sap.ui.getCore().byId("__component0---clientescadastro--input-listContatos");
        if (oTable === undefined) {
          var m = oTable.getModel();
          var data;
          data = m.getProperty("/modelData");

          if (data !== undefined) {
            while (data.length !== 0) {
              data.splice(0, 1);
            }
          }

          m.setProperty("/modelData", data);
        }

        // Limpar Recebedor Mercadoria
        oTable = sap.ui.getCore().byId("__component0---clientescadastro--listRecebedorMerc");
        m = oTable.getModel();
        data = m.getProperty("/modelDataRecebedorMerc");

        if (data !== undefined) {
          while (data.length !== 0) {
            data.splice(0, 1);
          }
        }

        m.setProperty("/modelDataRecebedorMerc", data);

        //Limpa Cobranca
        oTable = sap.ui.getCore().byId("__component0---clientescadastro--listCobrancaMerc");
        m = oTable.getModel();
        data = m.getProperty("/modelDataCobrancaMerc");

        if (data !== undefined) {
          while (data.length !== 0) {
            data.splice(0, 1);
          }
        }

        m.setProperty("/modelDataCobrancaMerc", data);

      }
    },

    _clearClienteConsulta: function () {

      var view = sap.ui.getCore().byId("__component0---clientesconsulta");

      if (view !== undefined) {

        sap.ui.getCore().byId("__component0---clientesconsulta--__field3").setValue("");

        // limpar lista
        var list = sap.ui.getCore().byId("__component0---clientesconsulta--List");
        var filters = [];
        var filter;

        filter = new sap.ui.model.Filter("Codcliente", sap.ui.model.FilterOperator.Contains, "");
        filters.push(filter);

        list.removeAllItems();
        var binding = list.getBinding("items");
        binding.filter();
      }
    },

    _fieldsDisableClieCadastro: function () {

      var view = sap.ui.getCore().byId("__component0---clientescadastro");

      if (view !== undefined) {

        sap.ui.getCore().byId("__component0---clientescadastro--input-nome").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cep").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-endereco").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-numero").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Complemento").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Bairro").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Regiao").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cidade").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Telefone").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Email").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Origem").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Kukla").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Classifcli").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Cnae").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-DomicilioFiscal").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-SubstTributaria").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Matriz").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-SetorInd").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-InscricaoEstadual").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-Suframa").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-DtSufurama").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxOrganizacao").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxCanal").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--input-multiComboxSetorAtividade").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientescadastro--SimpleFormVincularCliente").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--SimpleFormRecebedorMerc").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--SimpleFormContatos").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--SimpleFormCobrancaMerc").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--save").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--edit").setVisible(false);
        sap.ui.getCore().byId("__component0---clientescadastro--cancel").setVisible(false);
      }
    },

    _showObject: function (oItem) {
      this.getRouter().navTo("clientesconsulta");
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("master");
    }

  });
});