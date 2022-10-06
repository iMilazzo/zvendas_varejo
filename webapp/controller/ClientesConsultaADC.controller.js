sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/GroupHeaderListItem",
  "sap/ui/Device",
  "arcelor/model/formatter",
  'sap/ui/core/Fragment'
], function (BaseController, JSONModel, Filter, FilterOperator, History, GroupHeaderListItem, Device, formatter, Fragment) {
  "use strict";

  return BaseController.extend("arcelor.controller.ClientesConsultaADC", {

    onInit: function () {

      var oTable = this.getView().byId("List");
      oTable.addEventDelegate({
        onAfterRendering: function () {
          var oHeader = this.$().find(".sapMListTblHeaderCell");
          for (var i = 0; i < oHeader.length; i++) {
            try {
              oHeader[i].children[0].className = oHeader[i].children[0].className + " " + "customMText";
            } catch (ex) {
              //console.log(ex)
            }
          }
        }
      }, oTable);
    },

    onBeforeRendering: function () {

      this.getView().setBusy(true);

      var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divConsultarClientes");
      if (!autorizado) {
        this.getRouter().getTargets().display("Unauthorized");
        return false;
      } else {
        this.getView().setBusy(false);
      }
    },

    _showObject: function (oItem) {

      var bReplace = !Device.system.phone;

      var aSelection = {
        cliente: oItem.getBindingContext().getProperty("Codcliente")
      };
      sap.ui.getCore().setModel(aSelection, "dados_selecao_relatorio");
      this.getOwnerComponent().getRouter().navTo("CreditoAdm");

    },


    onNavBack: function (oEvent) {
      this.getOwnerComponent().getRouter().navTo("clientes");
    },

    onSearch: function (evt) {
      //create model filter
      var filters = [];
      var query = evt.getParameter("query");
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
          query = this.utilFormatterCPFCNPJClearSearch(query);
          filter = new sap.ui.model.Filter("Cnpj", sap.ui.model.FilterOperator.Contains, query);
        } else if (!$.isNumeric(query)) {
          filter = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, query2);
        }

        filters.push(filter);
      }
      //update list binding
      var list = this.getView().byId("List");
      var binding = list.getBinding("items");
      binding.filter(filters);
    },

    onItemPress: function (oEvent) {

      this._clearClienteConsulta();
      this._fieldsDisableClieConsulta();
      this._showObject(oEvent.getParameter("listItem") || oEvent.getSource());

    },

    _clearClienteConsulta: function () {

      var view = sap.ui.getCore().byId("__component0---clientesdetalhe");

      if (view !== undefined) {

        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Codcliente").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-nome").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cep").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-endereco").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-numero").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Complemento").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Bairro").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Regiao").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cidade").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Telefone").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Email").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Origem").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Kukla").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Classifcli").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cnae").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-DomicilioFiscal").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-SubstTributaria").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Matriz").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-SetorInd").setSelectedKey(null);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-InscricaoEstadual").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Suframa").setValue("");
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-DtSufurama").setValue("");

        //limpar Areas de venda
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxOrganizacao").setSelectedItems([]);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxCanal").setSelectedItems([]);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxSetorAtividade").setSelectedItems([]);

        //limpar contatos
        var oTable = sap.ui.getCore().byId("__component0---clientesdetalhe--input-listContatos");
        var m = oTable.getModel();
        var data = [];
        m.setProperty("/modelData", data);

        //Limpa Recebedor Mercadoria
        oTable = sap.ui.getCore().byId("__component0---clientesdetalhe--listRecebedorMerc");
        m = oTable.getModel();
        m.setProperty("/modelDataRecebedorMerc", data);

        //Limpa Cobran�a
        oTable = sap.ui.getCore().byId("__component0---clientesdetalhe--listCobrancaMerc");
        m = oTable.getModel();
        m.setProperty("/modelDataCobrancaMerc", data);
      }
    },

    _fieldsDisableClieConsulta: function () {

      var view = sap.ui.getCore().byId("__component0---clientesdetalhe");

      if (view !== undefined) {

        sap.ui.getCore().byId("__component0---clientesdetalhe--input-nome").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cep").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-endereco").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-numero").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Complemento").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Bairro").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Regiao").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cidade").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Telefone").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Email").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Origem").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Kukla").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Classifcli").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Cnae").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-DomicilioFiscal").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-SubstTributaria").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Matriz").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-SetorInd").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-InscricaoEstadual").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Suframa").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-DtSufurama").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxOrganizacao").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxCanal").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-multiComboxSetorAtividade").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--SimpleFormVincularCliente").setVisible(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--SimpleFormRecebedorMerc").setVisible(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--SimpleFormContatos").setVisible(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--SimpleFormCobrancaMerc").setVisible(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--btn-Pagador").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--input-Pagador").setEnabled(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--save").setVisible(false);
        sap.ui.getCore().byId("__component0---clientesdetalhe--edit").setVisible(true);
        sap.ui.getCore().byId("__component0---clientesdetalhe--cancel").setVisible(false);
      }
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

  });
});