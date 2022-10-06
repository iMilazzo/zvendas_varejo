sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/Dialog",
  "sap/m/Button",
  "arcelor/model/formatter",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  'sap/m/Text',
  "sap/m/ButtonType",
  "sap/ui/core/Fragment"
], function(BaseController, JSONModel, Filter, FilterOperator, Dialog, Button, formatter, MessageBox, MessageToast, Text, ButtonType,
  Fragment) {
  "use strict";

  var aItensRemoved = [];
  var aDataContatos = [];
  var aDataRecebedorMerc = [];
  var agent_url = 'https://127.0.0.1/agente/clisitef';
  var sessao = {};
  var lastContents23 = "";
  var aDataCobrancaMerc = [];
  var frete_9 = [{
    Codconsulta: "FR",
    Coddadomestre: "9",
    Textodadomestre: " ZST"
  }];
  var frete_geral = [];
  var aTipoOperacao = 0; //Utilizado em LiveChange para obter valor before change
  var aDataCargaDados = 0;
  var _sViewBack;
  var _scliente;
  this.oValidaOvPagtoCartao = {};
  this.oRetornoProcessoSitef = {};
  var valueHelpDialog1;
  var lpreco = new Map();
  var valueHelpDialogData;

  return BaseController.extend("arcelor.controller.VendasNew", {
    formatter: formatter,

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf arcelor.view.Venda
     */
    onInit: function() {
      var oTable = this.getView().byId("List");

      oTable.addEventDelegate({
        onAfterRendering: function() {
          var oHeader = this.$().find(".sapMListTblHeaderCell");
          for (var i = 0; i < oHeader.length; i++) {
            try {
              oHeader[i].children[0].className = oHeader[i].children[0].className + " " + "customMText";
            } catch (ex) {}
          }
        }
      }, oTable);

      var myModel = this.getOwnerComponent().getModel();
      myModel.setSizeLimit(5000);

      // Route Handler
      sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(
        this._onMasterMatched, this);
    },

    dialogAfterclose: function(oEvent) {
      this._oChargDialog.close();
      this._oChargDialog.destroy();
      this._oChargDialog = null;
    },
    onBeforeRendering: function() {
      this.getView().setBusy(true);

      //      var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divCriarPedido");
      //      if (!autorizado) {
      //        this.getRouter().getTargets().display("Unauthorized");
      //        return false;
      //      } else {
      //        this.getView().setBusy(false);
      //      }

      if (valueHelpDialog1) {
        this._destroyCadastroCliente();
      }

      valueHelpDialog1 = sap.ui.xmlfragment(
        "arcelor.view.ClientesCadastro",
        this
      );
      this.getView().addDependent(valueHelpDialog1);

      this._loadMasterData();
      this._readListMasterData();
      var oview = this;
      sap.ui.getCore().byId("input-Matriz").addEventDelegate({
        onfocusout: function(e) {
          oview.lonChangeMatriz(e)
        }
      })
    },

    onAfterRendering: function() {
      sap.ui.controller("arcelor.controller.Inicio").authControl();
      var thisView = this;

      var oObjNumber = this.getView().byId("objNumberPercMarkup");
      var oCol = this.getView().byId("nameColumn18");
			var oData = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZCHSD_VENDASVAREJO_SRV/");
			oData.read("/AuthSet", null, null, false, function (oData, Response) {
				if (Response.statusCode === 200) {
					var oAuth = oData.results.find(x => x.ItemId === 'spClmMarkupValue');
					if(oAuth){
            if(oAuth.Hidden==="true"){
						oObjNumber.setVisible(false);
						oCol.setVisible(false);
            }else{
              oObjNumber.setVisible(true);
              oCol.setVisible(true);
            }
					}else{
						oObjNumber.setVisible(true);
						oCol.setVisible(true);
          }
				}
			});

    },

    _destroyCadastroCliente: function() {
      if (sap.ui.getCore().byId("dlgFragCadCliente")) {
        sap.ui.getCore().byId("dlgFragCadCliente").destroyContent();
        sap.ui.getCore().byId("dlgFragCadCliente").destroy();
      }

      if (sap.ui.getCore().byId("input-listContatosNome"))
        sap.ui.getCore().byId("input-listContatosNome").destroy();
      if (sap.ui.getCore().byId("input-listContatosSobrenome"))
        sap.ui.getCore().byId("input-listContatosSobrenome").destroy();
      if (sap.ui.getCore().byId("input-listContatosTelefone"))
        sap.ui.getCore().byId("input-listContatosTelefone").destroy();
      if (sap.ui.getCore().byId("input-listContatosEmail"))
        sap.ui.getCore().byId("input-listContatosEmail").destroy();
      if (sap.ui.getCore().byId("combo-Funcao"))
        sap.ui.getCore().byId("combo-Funcao").destroy();
      if (sap.ui.getCore().byId("input-listContatosDelete"))
        sap.ui.getCore().byId("input-listContatosDelete").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercPesquisa"))
        sap.ui.getCore().byId("input-recebedorMercPesquisa").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercCodigo"))
        sap.ui.getCore().byId("input-recebedorMercCodigo").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercNome"))
        sap.ui.getCore().byId("input-recebedorMercNome").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercEndereco"))
        sap.ui.getCore().byId("input-recebedorMercEndereco").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercLocal"))
        sap.ui.getCore().byId("input-recebedorMercLocal").destroy();
      if (sap.ui.getCore().byId("input-recebedorMercDelete"))
        sap.ui.getCore().byId("input-recebedorMercDelete").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercPesquisa"))
        sap.ui.getCore().byId("input-cobrancaMercPesquisa").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercCodigo"))
        sap.ui.getCore().byId("input-cobrancaMercCodigo").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercNome"))
        sap.ui.getCore().byId("input-cobrancaMercNome").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercEndereco"))
        sap.ui.getCore().byId("input-cobrancaMercEndereco").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercLocal"))
        sap.ui.getCore().byId("input-cobrancaMercLocal").destroy();
      if (sap.ui.getCore().byId("input-cobrancaMercDelete"))
        sap.ui.getCore().byId("input-cobrancaMercDelete").destroy();

      valueHelpDialog1 = null;
    },

    _attachIconRendering: function(iconId, classe) {
      iconId.addEventDelegate({
        onAfterRendering: function(oEvent) {
          var sStatus = oEvent.srcControl.data("status");
          var sStatusClass = (sStatus && sStatus.length > 0 ? "statusUiIcon" + sStatus : "");
          let icone = oEvent.srcControl;
          if (oEvent.srcControl.sId.indexOf("icon4") != -1) {
            sStatusClass = "statusUiIcon" + this.pegaClasse(sap.ui.getCore().getModel("ov_exibir_dados").getData()[0].status4);
          }
          if (oEvent.srcControl.sId.indexOf("icon3") != -1) {
            sStatusClass = "statusUiIcon" + this.pegaClasse(sap.ui.getCore().getModel("ov_exibir_dados").getData()[0].status3);
          }
          if (oEvent.srcControl.sId.indexOf("icon2") != -1) {
            sStatusClass = "statusUiIcon" + this.pegaClasse(sap.ui.getCore().getModel("ov_exibir_dados").getData()[0].status2);
          }
          if (oEvent.srcControl.sId.indexOf("icon1") != -1) {
            sStatusClass = "statusUiIcon" + this.pegaClasse(sap.ui.getCore().getModel("ov_exibir_dados").getData()[0].status1);
          }
          icone.removeStyleClass("statusUiIconL1");
          icone.removeStyleClass("statusUiIconL2");
          icone.removeStyleClass("statusUiIconL3")
          icone.addStyleClass(sStatusClass);
        }
      });
    },

    pegaClasse: function(Classe) {
      var texto;
      switch (Classe) {
        case "sap-icon://status-critical":
          texto = "CL3";
          break;
        case "sap-icon://status-error":
          texto = "CL2";
          break;
        case "sap-icon://status-positive":
          texto = "CL1";
          break;
        case "sap-icon://status-inactive":
          texto = "CL0";
          break;
        default:
          break;
      }
      return texto;
    },

    _onMasterMatched: function(oEvent) {
      var oParameters = oEvent.getParameters();

      if (oParameters.name !== "HistoricoVendas" && oParameters.arguments.mode !== "Copy") {

        // Dados de Entrada
        var order = "";

        if (oParameters.arguments.salesorder) {
          order = oParameters.arguments.salesorder.split("&&&")[0];
          if (typeof oParameters.arguments.salesorder.split("&&&")[1] !== "undefined") {
            this.getView().byId("input-Codigo").setText(oParameters.arguments.salesorder.split("&&&")[1].replace('&&&&&', '/'));
          }
        }

        if (oParameters.arguments.mode == "Create" || oParameters.arguments.mode == "Copy") {
          this.getView().byId("id-CriaCliente").setVisible(true);
          this.getView().byId("id-HistoricoOV").setVisible(true);
        }

        _sViewBack = sessionStorage.getItem("ViewBack");
        _scliente = sessionStorage.getItem("Cliente");

        sessionStorage.removeItem("Cliente");
        sessionStorage.removeItem("ViewBack");

        var oModelData = this.getModel("SalesModel").getData();
        oModelData.SalesTitle = "Criar Venda";
        oModelData.ComboTipoOperacao = [];
        oModelData.ComboEscritorio = [];
        oModelData.ComboCondPagamento = [];
        oModelData.ComboTransportadoras = [];
        oModelData.ComboEstados = [];
        oModelData.FinalizeEnabled = false;
        oModelData.Mode = oParameters.arguments.mode;
        oModelData.SalesOrder = order;
        oModelData.Status = "Em Processamento";
        oModelData.CustomerVisible = false;
        oModelData.CustomerId = "";
        oModelData.SalesType = "";
        oModelData.DeliveryAddress = "";
        oModelData.BillingAddress = "";
        oModelData.SalesOffice = "";
        oModelData.SalesCondition = "";
        oModelData.SalesFrete = "";
        oModelData.DeliveryDate = "";
        oModelData.TaxDomcl = "";
        oModelData.TaxDefnt = "";
        oModelData.SalesChannel = "";
        oModelData.PurchaseOrder = "";
        oModelData.Utilization = "";
        oModelData.Version = "";
        oModelData.NFObs01 = "";
        oModelData.NFObs02 = "";
        oModelData.NFObs03 = "";
        oModelData.NFObs04 = "";
        oModelData.LDObs01 = "";
        oModelData.LDObs02 = "";
        oModelData.MercadoriaDate = "";
        oModelData.AdditionalDays = "";
        oModelData.Changeable01 = true;
        oModelData.Changeable02 = true;
        oModelData.CalculateVisible = true;
        oModelData.LiberaUnFre = true;
        oModelData.LiberaUnFre2 = true; //DMND0021249 - 04.08.2022 - FLS
        oModelData.LiberaUnFreBtn = true; //DMND0021249 - 04.08.2022 - FLS
        oModelData.FinalizeVisible = true;
        oModelData.EditVisible = false;
        oModelData.FunctionsVisible = false;
        oModelData.CancelVisible = false;
        oModelData.CarrierVisible = false;

        // Transportadora
        oModelData.Carrier = "";
        oModelData.CarrierName = "";
        oModelData.CarrierDoctTp = "";
        oModelData.CarrierDoct = "";
        oModelData.CarrierIE = "";
        oModelData.CarrierCEP = "";
        oModelData.CarrierStreet = "";
        oModelData.CarrierNeighb = "";
        oModelData.CarrierCity = "";
        oModelData.CarrierPlate = "";
        oModelData.CarrierANTT = "";
        oModelData.CarrierState = "";
        oModelData.CarrierVisible = false;
        oModelData.Status1 = "";
        oModelData.Status2 = "";
        oModelData.Status3 = "";
        oModelData.Status4 = "";
        //20.06.2022 - FLS - Begin
        oModelData.Status1Txt = "";
        oModelData.Status2Txt = "";
        oModelData.Status3Txt = "";
        oModelData.Status4Txt = "";
        //20.06.2022 - FLS - End
        //DMND0021249 - 04.08.2022 - FLS - Begin
        oModelData.Status3Code = "";
        //DMND0021249 - 04.08.2022 - FLS - End

        if (!oModelData.SalesItems) {
          oModelData.SalesItems = [];
        }

        oModelData.NivelServ = "";
        oModelData.ValorServ = "";
        //oModelData.ValorTotServ = "";

        this.getModel("SalesModel").refresh(true);
        this._evalSalesChannel();

        if (oParameters.arguments.mode === "Change" || oParameters.arguments.mode === "Copy") {
          if (typeof oParameters.arguments.salesorder !== "undefined") {
            this._loadSalesOrder(oParameters.arguments.salesorder.split("&&&")[0]);
          } else {
            this._loadSalesOrder(oModelData.SalesOrder);
          }
        } else {
          this._loadInitialHelpers();
        }

        if (oParameters.arguments.salesorder) {
          this.validaOvPagtoCartao(oParameters.arguments.salesorder.split("&&&")[0]);
        }

        if (oParameters.arguments.mode == "Create" || oParameters.arguments.mode == "Copy") {
          this.getView().byId("Transportadora_panel").setVisible(false);
        } else {
          this.getView().byId("Transportadora_panel").setVisible(true);
        }

        this.getView().byId("id-ComboCanal").setEnabled(true);

      } else if (oParameters.arguments.mode === "Copy") {
        this.getModel("SalesModel").getData().Mode = oParameters.arguments.mode;
        this._loadSalesOrder(oParameters.arguments.salesorder.split("&&&")[0]);
      }
    },

    _loadMaterialData: function(sQuery, sMaterial) {
      return new Promise(function(fnResolve, fnReject) {
        var aFilters = [];
        aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, sQuery));
        aFilters.push(new Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial));
        this.getModel().read("/DM_DadoMestreOVSet", {
          filters: aFilters,
          success: function(oData) {
            fnResolve(oData);
          },
          error: function(oError) {
            fnReject(oError);
          }
        });
      }.bind(this));
    },

    _loadStatus: function(sQuery) {
      return new Promise(function(fnResolve, fnReject) {
        var aFilters = [];
        aFilters.push(new Filter("Ordem", sap.ui.model.FilterOperator.EQ, sQuery));
        this.getModel().read("/OrdemVendaFaturaSet", {
          filters: aFilters,
          success: function(oData) {
            fnResolve(oData);
          },
          error: function(oError) {
            fnReject(oError);
          }
        });
      }.bind(this));
    },

    _loadSalesOrder: function(sOrder) {
      this.getView().setBusy(true);
      var l_test = "K";
      this.getModel().metadataLoaded().then(function() {
        var sKey = this.getModel().createKey("/SalesOrderSet", {
          Ordem: sOrder
        });
        this.getModel().read(sKey, {
          urlParameters: {
            "$expand": "SalesOrderItemSetNavig,SalesOrderToAvailability"
          },
          success: function(oData) {

            if (l_test != "K") {
              this.getView().setBusy(false);
              return;
            } else {
              l_test = "N";
            }

            this.getModel("SalesModel").setSizeLimit(200);
            var oModelData = this.getModel("SalesModel").getData();

            var sDeliveryDate = "";
            this.getView().setBusy(false);

            if (oData.DataDesEntrega) {
              oData.DataDesEntrega.setMinutes(oData.DataDesEntrega.getMinutes() + oData.DataDesEntrega.getTimezoneOffset());

              sDeliveryDate = (oData.DataDesEntrega.getDate() < 10 ? "0" + oData.DataDesEntrega.getDate() : oData.DataDesEntrega.getDate()) +
                "/" +
                ((oData.DataDesEntrega.getMonth() + 1) < 10 ? "0" + (oData.DataDesEntrega.getMonth() + 1) : oData.DataDesEntrega.getMonth() +
                  1) + "/" +
                (oData.DataDesEntrega.getFullYear());
            }

            oModelData.Mode == "Change" ? this.getView().byId("id-CriaCliente").setVisible(false) : this.getView().byId(
              "id-CriaCliente").setVisible(true);
            oModelData.Mode == "Change" ? this.getView().byId("id-HistoricoOV").setVisible(false) : this.getView().byId(
              "id-HistoricoOV").setVisible(true);

            this.getView().byId("label-CustomerDoct").setEnabled(false);
            var emissor = this.getView().byId("input-Codigo").getText();
            this.getView().byId("input-Codigo").setText(emissor);

            oModelData.SalesTitle = oModelData.Mode === "Copy" ? "Copiar Venda" : "Exibir Venda";
            oModelData.Editing = oModelData.Mode === "Copy" ? true : false;
            oModelData.ComboTipoOperacao = [];
            oModelData.ComboEscritorio = [];
            oModelData.ComboCondPagamento = [];
            oModelData.Frete = oData.Frete;
            oModelData.Status = oModelData.Mode === "Copy" ? "" : oData.Global;
            oModelData.FinalizeEnabled = oModelData.Mode === "Copy" ? false : true;
            oModelData.SalesOrder = oModelData.Mode === "Copy" ? "" : oData.Ordem;
            oModelData.CustomerVisible = true;
            oModelData.CustomerId = oData.Cliente;
            oModelData.SalesType = oData.TipoOperacao;
            var thisStatus = this;

            if (oModelData.Mode !== "Copy") {
              thisStatus.byId("icon1").removeStyleClass("statusUiIconL1");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconL2");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconL3");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconCL0");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconCL1");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconCL2");
              thisStatus.byId("icon1").removeStyleClass("statusUiIconCL3");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconL1");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconL2");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconL3");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconCL0");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconCL1");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconCL2");
              thisStatus.byId("icon2").removeStyleClass("statusUiIconCL3");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconL1");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconL2");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconL3");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconCL0");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconCL1");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconCL2");
              thisStatus.byId("icon3").removeStyleClass("statusUiIconCL3");

              this._loadStatus(sOrder).then(function(oDataHelper) {
                oDataHelper.results.forEach(function(oResult) {
                  oModelData.Status1 = thisStatus.status(oResult.StatusLimbo);
                  //20.06.2022 - FLS - Begin
                  oModelData.Status1Txt = oResult.LimboTxt;
                  //20.06.2022 - FLS - End
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconL1");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconL2");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconL3");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconCL0");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconCL1");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconCL2");
                  thisStatus.byId("icon1").removeStyleClass("statusUiIconCL3");
                  var sStatusClass = "statusUiIcon" + thisStatus.pegaClasse(oModelData.Status1);
                  thisStatus.byId("icon1").addStyleClass(sStatusClass);
                  oModelData.Status2 = thisStatus.status(oResult.StatusCred);
                  //20.06.2022 - FLS - Begin
                  oModelData.Status2Txt = oResult.CredTxt;
                  //20.06.2022 - FLS - End
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconL1");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconL2");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconL3");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconCL0");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconCL1");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconCL2");
                  thisStatus.byId("icon2").removeStyleClass("statusUiIconCL3");
                  var sStatusClass = "statusUiIcon" + thisStatus.pegaClasse(oModelData.Status2);
                  thisStatus.byId("icon2").addStyleClass(sStatusClass);
                  oModelData.Status3 = thisStatus.status(oResult.StatusReme);
                  //DMND0021249 - 04.08.2022 - FLS - Begin
                  oModelData.Status3Code = oResult.StatusReme;
                  //DMND0021249 - 04.08.2022 - FLS - End
                  //20.06.2022 - FLS - Begin
                  oModelData.Status3Txt = oResult.RemeTxt;
                  //20.06.2022 - FLS - End
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconL1");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconL2");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconL3");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconCL0");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconCL1");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconCL2");
                  thisStatus.byId("icon3").removeStyleClass("statusUiIconCL3");
                  var sStatusClass = "statusUiIcon" + thisStatus.pegaClasse(oModelData.Status3);
                  thisStatus.byId("icon3").addStyleClass(sStatusClass);
                  oModelData.Status4 = thisStatus.status(oResult.StatusFatura);
                  //20.06.2022 - FLS - Begin
                  oModelData.Status4Txt = oResult.FatTxt;
                  //20.06.2022 - FLS - End
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconL1");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconL2");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconL3");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconCL0");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconCL1");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconCL2");
                  thisStatus.byId("icon4").removeStyleClass("statusUiIconCL3");
                  var sStatusClass = "statusUiIcon" + thisStatus.pegaClasse(oModelData.Status4);
                  thisStatus.byId("icon4").addStyleClass(sStatusClass);
                })
              });
            }

            if (this.getModel("SalesModel").getData().Mode !== "Copy" && oModelData.SalesType != "2") {
              this.getView().byId("Transportadora_panel").setVisible(true);
            } else {
              this.getView().byId("Transportadora_panel").setVisible(false);
            };

            oModelData.DeliveryAddress = oData.ClienteEntrega;
            oModelData.BillingAddress = oData.ClienteCobranca;
            oModelData.SalesOffice = oData.EscritorioVendas.split("-")[0];
            oModelData.SalesFrete = oData.Frete;
            oModelData.SalesCondition = oData.CondPagamento;
            oModelData.DeliveryDate = oModelData.Mode === "Copy" ? "" : sDeliveryDate;
            oModelData.TaxDomcl = oData.Domicilio;
            oModelData.Plant = oData.Centro;
            oModelData.TaxDefnt = oData.Impdesc;
            oModelData.TaxDefntCode = oData.Imposto;
            oModelData.SalesChannel = oData.Canalsetor.split("/")[1];
            oModelData.PurchaseOrder = oData.Pedido;
            var utl = '';

            if (oData.Codutil.split("-")[0]) {
              utl = oData.Codutil.split("-")[0].trim();
            }

            oModelData.Utilization = utl;
            oModelData.Version = oData.Versao;
            oModelData.NFObs01 = oData.Obs1;
            oModelData.NFObs02 = oData.Obs2;
            oModelData.NFObs03 = oData.Obs3;
            oModelData.NFObs04 = oData.Obs4;
            oModelData.LDObs01 = oData.Obs5;
            oModelData.LDObs02 = oData.Obs6;
            oModelData.AdditionalDays = oData.Valtg;

            
            //*>>> 7000015098- DMND0025261-Inf. logística na OV - 18.04.2022
            oData.SalesOrderItemSetNavig.results.forEach(salesItem => {
            	//Remove o texto Tipo da Observação e monta o campo Tipo para cada Item
            	var tipoReto     = "Reto";
            	var tipoDobrado  = "Dobrado";
            	var textoReto	 = parseInt(salesItem.Item) + "-" + tipoReto;            	
            	var textoDobrado = parseInt(salesItem.Item) + "-" + tipoDobrado;
            	
            	if (oModelData.LDObs01.indexOf(textoReto) > -1) {
            		salesItem.Tipo     = tipoReto;
            		oModelData.LDObs01 = oModelData.LDObs01.replace(textoReto, '');
            	} else if (oModelData.LDObs01.indexOf(textoDobrado) > -1) {
            		salesItem.Tipo     = tipoDobrado;
            		oModelData.LDObs01 = oModelData.LDObs01.replace(textoDobrado, '');
            	} 
            	if (oModelData.LDObs02.indexOf(textoReto) > -1) {
            		salesItem.Tipo     = tipoReto;
            		oModelData.LDObs02 = oModelData.LDObs02.replace(textoReto, '');
            	} else if (oModelData.LDObs02.indexOf(textoDobrado) > -1) {
            		salesItem.Tipo     = tipoDobrado;
            		oModelData.LDObs02 = oModelData.LDObs02.replace(textoDobrado, '');
            	}
            });
            
            oModelData.LDObs01 = oModelData.LDObs01.replace('|', '');
            oModelData.LDObs01 = oModelData.LDObs01.replace(',', '');
            oModelData.LDObs02 = oModelData.LDObs02.replace('|', '');
            oModelData.LDObs02 = oModelData.LDObs02.replace(',', '');
            //*<< 7000015098- DMND0025261-Inf. logística na OV - 18.04.2022
            
            
            // Transportadora
            oModelData.Carrier = oData.LifnrTransp;

            if (oModelData.Carrier.length > 0 && oModelData.Carrier.length < 10 && oModelData.Carrier.indexOf("AC") === -1) {
              var iRemaining = 10 - oModelData.Carrier.length;
              for (var x = 0; x < iRemaining; x++) {
                oModelData.Carrier = "0" + oModelData.Carrier;
              }
            }

            oModelData.CarrierName = oData.Name1Transp;
            oModelData.CarrierDoctTp = (oData.CpfCnpjTransp.length <= 11 ? 1 : 2);
            oModelData.CarrierDoct = oData.CpfCnpjTransp;
            oModelData.CarrierIE = oData.IeTransp;
            oModelData.CarrierCEP = oData.CepTransp;
            oModelData.CarrierStreet = oData.RuaTransp;
            oModelData.CarrierNeighb = oData.BairroTransp;
            oModelData.CarrierCity = oData.CidadeTransp;
            oModelData.CarrierPlate = oData.PlacaTransp;
            oModelData.CarrierANTT = oData.AnttTransp;
            oModelData.CarrierState = oData.RegiaoTransp;
            oModelData.CarrierRegion = oData.Regio;
            oModelData.CarrierVisible = true;
            oModelData.CarrierNumber = oData.nrumtransp;
            oModelData.CarrierFreightHelper = [];
            oModelData.CarrierPermitirCIF = oData.PermitirTransp === "" ? false : true;

            // Botões
            oModelData.CalculateVisible = oModelData.Mode === "Copy" ? true : false;
            oModelData.LiberaUnFre = false;
            oModelData.LiberaUnFre2 = false; //DMND0021249 - 04.08.2022 - FLS
            oModelData.LiberaUnFreBtn = false; //DMND0021249 - 04.08.2022 - FLS
            oModelData.FinalizeVisible = false;

            oModelData.EditVisible = true;
            oModelData.FunctionsVisible = true;
            oModelData.CancelVisible = oModelData.Mode === "Copy" ? true : false;
            oModelData.Changeable01 = oModelData.Mode === "Copy" ? true : false;
            oModelData.Changeable02 = oModelData.Mode === "Copy" ? true : false;
            var frete = oModelData.Frete;

            oModelData.SalesItems = [];

            oData.SalesOrderItemSetNavig.results.forEach(function(oItem) {
              this._loadMaterialData("CU;UN;FR", oItem.Material.toString()).then(function(oDataHelper) {

                var aMeasureHelper = [];
                var aPlantBaseHelper = [];
                var aPlantHelper = [];
                var aFreightHelper = [];

                oDataHelper.results.forEach(function(oResult) {

                  switch (oResult.Codconsulta) {
                    case "UN":
                      aMeasureHelper.push({
                        Codconsulta: oResult.Codconsulta,
                        Coddadomestre: oResult.Coddadomestre,
                        Textodadomestre: oResult.Textodadomestre
                      });
                      break;
                    case "FR":
                      if (thisStatus.byId("id-ComboTipoOperacao").getSelectedKey() == '2') {
                        if (oResult.Coddadomestre == 9) {
                          aFreightHelper.push({
                            Codconsulta: oResult.Codconsulta,
                            Coddadomestre: oResult.Coddadomestre,
                            Textodadomestre: oResult.Textodadomestre
                          });
                        }
                      } else {
                        aFreightHelper.push({
                          Codconsulta: oResult.Codconsulta,
                          Coddadomestre: oResult.Coddadomestre,
                          Textodadomestre: oResult.Textodadomestre
                        });
                      }
                      break;
                    case "CU":
                      aPlantBaseHelper.push({
                        Codconsulta: oResult.Codconsulta,
                        Coddadomestre: oResult.Coddadomestre,
                        Textodadomestre: oResult.Textodadomestre
                      });
                      break;
                    case "CZ":
                      aPlantBaseHelper.push({
                        Codconsulta: oResult.Codconsulta,
                        Coddadomestre: oResult.Coddadomestre,
                        Textodadomestre: oResult.Textodadomestre
                      });
                      break;
                  }
                });

                var validado = '0';
                for (var h = 0; h < aPlantBaseHelper.length; h++) {
                  if (aPlantBaseHelper[h].Coddadomestre == oItem.Centro) {
                    validado = 'X'
                  }
                };

                if (validado == '0') {
                  aPlantBaseHelper.push({
                    Codconsulta: "CU",
                    Coddadomestre: oItem.Centro,
                    Textodadomestre: oItem.Centro
                  });
                }

                var aHelpChecker = {};
                aPlantBaseHelper.forEach(function(oObjectCheck) {
                  if (!aHelpChecker[oObjectCheck.Coddadomestre]) {
                    aHelpChecker[oObjectCheck.Coddadomestre] = true;
                    aPlantHelper.push(oObjectCheck);
                  }
                });

                // Frete do Transportador
                oModelData.Frete = frete;
                oModelData.CarrierFreightHelper = aFreightHelper;

                oModelData.SalesItems.push({
                  Item: oItem.Item,
                  Material: oItem.Material,
                  Descricao: oItem.Descricao,
                  Estque: oItem.Estoque.replace(".", ","),
                  Qtd: parseFloat(oItem.Quantidade).toString().replace(".", ","),
                  Unidade: oItem.UnidadeMedida,
                  PrecoTbSemIPI: oItem.ValPrecoT,
                  Fisico: oItem.Fisico.replace(".", ","),
                  PrecoNegComIPI: oModelData.Mode === "Copy" ? 0 : oItem.PrCIpi,
                  Markup: oModelData.Mode === "Copy" ? 0 : oItem.ValZmkp,
                  PrecoNegSemIPI: oItem.PrecoUnitSugerido,
                  DescPercentual: oItem.ValZvnd,
                  ValorTotItem: oModelData.Mode === "Copy" ? 0 : oItem.ValorTotalItem,
                  PrecoTarget: oModelData.Mode === "Copy" ? 0 : oItem.VlPrecoTarget,
                  ValorST: oModelData.Mode === "Copy" ? 0 : oItem.ValSt,
                  Centro: oItem.Centro,
                  Frete: oItem.Frete,
                  dtconfirmada: oItem.dtconfirmada,
                  ItemPedidoCliente: oItem.Pedido,
                  Deleted: false,
                  Lote: oItem.Lote,
                  UnitHelper: aMeasureHelper,
                  PlantHelper: aPlantHelper,
                  FreightHelper: aFreightHelper,
                  Editable: false,
                  Cepok: oModelData.Mode === "Copy" ? "" : oItem.Cepok === "B" ? "Não Ok" : "Ok",                  
                  PermiteTipo: oItem.PermiteTipo,
                  Tipo: oItem.Tipo
                });

                this.getModel("SalesModel").refresh(true);
                this.getModel("SalesModel").refresh(true);

              }.bind(this));

              oModelData.Frete = frete;
              this.getModel("SalesModel").refresh(true);
            }.bind(this));

            //Ordena a lista pelos Itens	
            oModelData.SalesItems.sort(function(a,b) { return a.Item < b.Item ? -1 : a.Item > b.Item ? 1 : 0; });
            
            // Lotes Disponíveis
            oModelData.SalesCharges = [];
            oData.SalesOrderToAvailability.results.forEach(function(oItemCharg) {
              oModelData.SalesCharges.push({
                Item: oItemCharg.Item,
                Lote: oItemCharg.Lote,
                Quantidade: oItemCharg.Quantidade
              });
            });

            this.getModel("SalesModel").refresh(true);
            this._loadInitialHelpers(oData.EscritorioVendas);
            this._loadCustomerHelpers();
            this._readCarriers(oModelData.Frete);
            this._readStates();
            this._readCustomerData(oModelData.CustomerId);

            oModelData = this.getModel("SalesModel").getData();
            var totalText = 0;
            var totalServ = 0;
            var totalVend = 0;
            oData.SalesOrderItemSetNavig.results
              .forEach(function(item) {
                totalText += parseFloat(item.ValorTotalItem);
                totalServ += parseFloat(item.ValZnsv);
              });
            totalVend = totalText + totalServ;
            totalVend = sap.ui.core.format.NumberFormat.getFloatInstance({
              "decimalSeparator": ",",
              "decimals": 2
            }).format(totalVend);

            totalText = sap.ui.core.format.NumberFormat.getFloatInstance({
              "decimalSeparator": ",",
              "decimals": 2
            }).format(totalText);

            totalServ = sap.ui.core.format.NumberFormat.getFloatInstance({
              "decimalSeparator": ",",
              "decimals": 2
            }).format(totalServ);

            this.byId("textValorTotalVenda").setText(totalText);
            this.byId("textNivelServico").setText(oData.NivServ);
            this.byId("textValorServico").setText(totalServ);
            //this.byId("textValorTotServ").setText(totalVend);
            sap.ui.controller("arcelor.controller.Inicio").authControl();

            if (oModelData.Mode === "Copy") {
              this.onAlterarOV();
            }

          }.bind(this)
        });
      }.bind(this));
    },

    onCEPChange: function() {
      var sCEP = this.utilClearCharToNumber(this.getModel("SalesModel").getData().CarrierCEP);
      var sAddressKey = this.getModel().createKey("/EnderecoSet", {
        Cep: sCEP
      });
      this.getView().setBusy(true);
      this.getModel().read(sAddressKey, {
        success: function(oData) {
          this.getView().setBusy(false);
          if (oData) {
            var oSalesOrderData = this.getModel("SalesModel").getData();
            oSalesOrderData.CarrierCEP = this.utilFormatterCEP(oData.Cep);
            oSalesOrderData.CarrierStreet = oData.Logradouro;
            oSalesOrderData.CarrierNeighb = oData.Bairro;
            oSalesOrderData.CarrierState = oData.Estado;
            oSalesOrderData.CarrierCity = oData.Cidade;
            oSalesOrderData.CarrierRegion = oData.Estado;
            this.getModel("SalesModel").refresh(true);
          }
          var totalText = 0;
          oData.SalesOrderItemSetNavig.results
            .forEach(function(item) {
              totalText += parseFloat(item.ValZvti);
            });
          totalText = sap.ui.core.format.NumberFormat.getFloatInstance({
            "decimalSeparator": ",",
            "decimals": 2
          }).format(totalText);
          this.byId("textValorTotalVenda").setText(totalText);
        }.bind(this)
      });
    },

    onAlterarOV: function() {

      var oSalesOrderData = this.getModel("SalesModel").getData();
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      var view = this;

      //DMND0021249 - 04.08.2022 - FLS - Begin
      var bFieldsDisabled = false;
      if(oSalesOrderData.Status3Code === "RL2" || oSalesOrderData.Status3Code === "RL3"){
        //disable all editable fields
        bFieldsDisabled = true;
      }
      //DMND0021249 - 04.08.2022 - FLS - End
      
      var onSuccess = function(odata) {

        var aFluxos = odata.results;
        var sFatura = aFluxos.some(function(e) {
          return e.VbtypN === "M"
        });
        //      var oModel = new JSONModel($.parseJSON(odata.results[0].json));
        //      if (oModel.getData()[0].fatura != "") {
        if (sFatura) {
          MessageBox.error("Ordem já faturada");
          return false;
        } else {
          var oModelData = view.getModel("SalesModel").getData();
          oModelData.SalesTitle = oModelData.Mode === "Copy" ? "Criar Venda" : "Alterar Venda";
          oModelData.CalculateVisible = oModelData.Mode === "Copy" ? true : false;
          oModelData.LiberaUnFre = true;
          //DMND0021249 - 04.08.2022 - FLS - Begin    
          oModelData.LiberaUnFre2 = true;
          oModelData.LiberaUnFreBtn = true; //DMND0021249 - 04.08.2022 - FLS
          if(bFieldsDisabled){
            //disable all fields
            oModelData.LiberaUnFre = false; 
            //enable fields transportador/placa/antt/regiao
            oModelData.LiberaUnFre2 = true;
            //view.getView().byId("id-ComboTransportador").setEnabled(false);
            //view.getView().byId("placaCarrier").setEnabled(false);
            //view.getView().byId("anttCarrier").setEnabled(false);
            //view.getView().byId("estadosCarrier").setEnabled(false);
          }
          //DMND0021249 - 04.08.2022 - FLS - End
          oModelData.FinalizeVisible = true;
          oModelData.EditVisible = false;
          oModelData.FunctionsVisible = false;
          oModelData.CancelVisible = true;
          view.getModel("SalesModel").refresh(true);
          view.getView().byId("id-ComboCanal").setEnabled(true);

          // DMND0013111: Bloquear campos Transportadora
          view.getView().byId("id-ComboTransportador").setEnabled(oModelData.CarrierPermitirCIF);

          if (view.getView().byId("id-ComboTransportador").getSelectedKey().length > 0) {
            view.getView().byId("placaCarrier").setEnabled(oModelData.CarrierPermitirCIF);
            view.getView().byId("anttCarrier").setEnabled(oModelData.CarrierPermitirCIF);
            view.getView().byId("estadosCarrier").setEnabled(oModelData.CarrierPermitirCIF);
          }
        }

      };

      var onError = function(odata) {}
      var aFilters = [];
      aFilters.push(new Filter("Docnum", FilterOperator.EQ, oSalesOrderData.SalesOrder));

      this.getModel().read("/FloxoOvSet", {
        filters: aFilters,
        success: onSuccess,
        error: onError
      });

    },

    onLimparTela: function() {
      var oController = this;
      var oModelData = this.getModel("SalesModel").getData();
      var comboCanal = this.byId("id-ComboCanal");
      var comboEscritorio = this.byId("id-ComboEscritorio");
      var comboPagamento = this.byId("id-ComboCondPgto");
      oModelData.AdditionalDays = "";
      oModelData.SalesTitle = "Exibir Venda";
      oModelData.CalculateVisible = true;
      oModelData.LiberaUnFre = true;
      oModelData.LiberaUnFre2 = true; //DMND0021249 - 04.08.2022 - FLS
      oModelData.LiberaUnFreBtn = true; //DMND0021249 - 04.08.2022 - FLS
      oModelData.FinalizeVisible = true;
      oModelData.EditVisible = false;
      oModelData.FunctionsVisible = false;
      oModelData.CancelVisible = false;
      oModelData.SalesItems = [];
      oModelData.BillingAddress = "";
      oModelData.DeliveryAddress = "";
      oModelData.CustomerDoct = "";
      oModelData.CustomerId = "";
      oModelData.CustomerName = "";
      oModelData.CustomerVisible = false;
      oModelData.DeliveryAddress = "";
      oModelData.DeliveryDate = "";
      oModelData.PurchaseOrder = "";
      oModelData.SalesType = "";
      oModelData.TaxDomcl = "";
      oModelData.Utilization = "";
      oModelData.Version = "";
      oModelData.TaxDefnt = "";
      comboCanal.setSelectedKey(null);
      comboEscritorio.setSelectedKey(null);
      comboPagamento.setSelectedKey(null);
      oController.getModel("SalesModel").refresh(true);
      oController._loadInitialHelpers();
    },

    onCancelar: function() {
      var oController = this;
      var oModelData = this.getModel("SalesModel").getData();
      var comboEscritorio = this.byId("id-ComboEscritorio");
      var comboPagamento = this.byId("id-ComboCondPgto");

      if (!oModelData.SalesOrder) {
        sap.m.MessageBox.show(
          "Confirma cancelamento da venda?", {
            icon: "sap.m.MessageBox.Icon.INFORMATION",
            title: "Cancelamento de venda",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function(oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                oModelData.AdditionalDays = "";
                oModelData.SalesTitle = "Exibir Venda";
                oModelData.CalculateVisible = true;
                oModelData.FinalizeVisible = true;
                oModelData.EditVisible = false;
                oModelData.FunctionsVisible = false;
                oModelData.CancelVisible = false;
                oModelData.SalesItems = [];
                oModelData.BillingAddress = "";
                oModelData.DeliveryAddress = "";
                oModelData.CustomerDoct = "";
                oModelData.CustomerId = "";
                oModelData.CustomerName = "";
                oModelData.CustomerVisible = false;
                oModelData.DeliveryAddress = "";
                oModelData.DeliveryDate = "";
                oModelData.PurchaseOrder = "";
                oModelData.SalesType = "";
                oModelData.TaxDomcl = "";
                oModelData.Utilization = "";
                oModelData.Version = "";
                oModelData.TaxDefnt = "";
                comboEscritorio.setSelectedKey(null);
                comboPagamento.setSelectedKey(null);
                oController.getModel("SalesModel").refresh(true);
                oController._loadInitialHelpers();
              }
            }
          }
        );
      } else {
        sap.m.MessageBox.show(
          "Confirma cancelamento da alteração?", {
            icon: "sap.m.MessageBox.Icon.INFORMATION",
            title: "Cancelamento de alteração",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function(oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                oModelData.CalculateVisible = false;
                oModelData.LiberaUnFre = false;
                oModelData.LiberaUnFre2 = false; //DMND0021249 - 04.08.2022 - FLS
                oModelData.LiberaUnFreBtn = false; //DMND0021249 - 04.08.2022 - FLS
                oModelData.FinalizeVisible = false;
                oModelData.EditVisible = true;
                oModelData.FunctionsVisible = true;
                oModelData.CancelVisible = false;
                oModelData.Changeable01 = false;
                oModelData.Changeable02 = false;
                oController.getModel("SalesModel").refresh(true);
                oController._loadSalesOrder(oModelData.SalesOrder);
              }
            }
          }
        );
      }
    },

    onNavBack: function() {

      var oModelData = this.getModel("SalesModel").getData();

      if (_sViewBack === "clientesdetalhe") {
        this.getOwnerComponent().getRouter().navTo(_sViewBack, {
          Id: _scliente
        }, true);
      } else if (_sViewBack === "CancelarFornecimento") {
        this.getOwnerComponent().getRouter().navTo(_sViewBack, {
          mode: "Change"
        }, true);
      } else {
        if (oModelData.Mode === "Create") {
          this.getOwnerComponent().getRouter().navTo("pedidos");
        } else {
          this.getOwnerComponent().getRouter().navTo("OrdemVendaFatura", {
            mode: "Change"
          }, true);
        }
      }
    },

    _readCustomerData: function(sCustomerId) {
      var aFilters = [];
      this.getView().setBusy(true);
      var oModelData = this.getModel("SalesModel").getData();
      aFilters.push(new Filter("Codcliente", FilterOperator.EQ, sCustomerId));
      if (oModelData.Mode == 'Change' || oModelData.Model == 'Copy') {
        aFilters.push(new Filter("Tipocliente", FilterOperator.EQ, 'W'));
      }
      this.getModel().read("/ClientesSet", {
        filters: aFilters,
        success: function(oData) {
          this.getView().setBusy(false);
          var oModelData = this.getModel("SalesModel").getData();
          if (oData.results.length > 0) {
            oModelData.CustomerName = oData.results[0].Nome;
            oModelData.CustomerDoct = (oData.results[0].Cpf && oData.results[0].Cpf.length > 0 ? oData.results[0].Cpf : oData.results[0]
              .Cnpj);
          } else {
            oModelData.CustomerName = "";
            oModelData.CustomerDoct = "";
          }
          this.getModel("SalesModel").refresh(true);
        }.bind(this)
      });
    },

    onSelectCarrier: function(oEvent) {
      var oModelData = this.getModel("SalesModel").getData();
      var sObjectPath = this.getModel().createKey("/TransportadoraSet", {
        Id: oModelData.Carrier
      });
      var oCarrierData = this.getModel().getData(sObjectPath);
      if (typeof oCarrierData !== "undefined") {
        if (oCarrierData.Grupo !== "9015") {
          oModelData.CarrierName = oCarrierData.Descricao;
          oModelData.CarrierDoct = oCarrierData.CNPJ;
          oModelData.CarrierDoctTp = (oModelData.CarrierDoct.length <= 11 ? 1 : 2);
          oModelData.CarrierIE = oCarrierData.IE;
          oModelData.CarrierCEP = oCarrierData.CEP;
          oModelData.CarrierStreet = oCarrierData.Rua;
          oModelData.CarrierNeighb = oCarrierData.Bairro;
          oModelData.CarrierNumber = oCarrierData.Numero;
          oModelData.CarrierCity = oCarrierData.Cidade;
          oModelData.CarrierState = oCarrierData.Estado;
          oModelData.CarrierRegion = "";
        } else {
          oModelData.CarrierName = "";
          oModelData.CarrierDoct = "";
          oModelData.CarrierDoctTp = (oModelData.CarrierDoct.length <= 11 ? 1 : 2);
          oModelData.CarrierIE = "";
          oModelData.CarrierCEP = "";
          oModelData.CarrierStreet = "";
          oModelData.CarrierNeighb = "";
          oModelData.CarrierNumber = "";
          oModelData.CarrierCity = "";
          oModelData.CarrierState = "";
          oModelData.CarrierRegion = "";
          oModelData.CarrierPlate = "";
          oModelData.CarrierANTT = "";
        }
        oModelData.Changeable02 = (oCarrierData.Grupo === "9015");
      }
      this.getModel("SalesModel").refresh(true);
      this._onRequireFieldsCarrier(oEvent, oModelData.CarrierPermitirCIF);
    },

    _onRequireFieldsCarrier: function(oObject, bPermitirAlterarTransp) {
      if (oObject.getSource().getProperty("value").length > 0) {
        this.byId("nomeCarrier").setRequired(true);
        this.byId("cpfcnpjCarrier").setRequired(true);
        this.byId("carrierIE").setRequired(true);
        this.byId("cepCarrier").setRequired(true);
        this.byId("ruaCarrier").setRequired(true);
        this.byId("numeroCarrier").setRequired(true);
        this.byId("bairroCarrier").setRequired(true);
        this.byId("estadoCarrier").setRequired(true);
        this.byId("cidadeCarrier").setRequired(true);

        if (bPermitirAlterarTransp) {
          this.byId("estadosCarrier").setEnabled(bPermitirAlterarTransp);
          //this.byId("estadosCarrier").setRequired(bPermitirAlterarTransp);
          this.byId("placaCarrier").setEnabled(bPermitirAlterarTransp);
          //this.byId("placaCarrier").setRequired(bPermitirAlterarTransp);
          this.byId("anttCarrier").setEnabled(bPermitirAlterarTransp);
          //this.byId("anttCarrier").setRequired(bPermitirAlterarTransp);
        }

      } else {
        this.byId("nomeCarrier").setRequired(false);
        this.byId("cpfcnpjCarrier").setRequired(false);
        this.byId("carrierIE").setRequired(false);
        this.byId("cepCarrier").setRequired(false);
        this.byId("ruaCarrier").setRequired(false);
        this.byId("numeroCarrier").setRequired(false);
        this.byId("bairroCarrier").setRequired(false);
        this.byId("estadoCarrier").setRequired(false);
        this.byId("estadosCarrier").setRequired(false);
        this.byId("cidadeCarrier").setRequired(false);
        this.byId("placaCarrier").setRequired(false);
        this.byId("anttCarrier").setRequired(false);
      }
    },

    _readStates: function() {
      this.getView().setBusy(true);
      this.getModel().read("/EstadoSet", {
        success: function(oData) {
          this.getView().setBusy(false);
          var oModelData = this.getModel("SalesModel").getData();
          oModelData.ComboEstados = [];
          oData.results.forEach(function(oState) {
            oModelData.ComboEstados.push({
              Id: oState.Id,
              Descricao: oState.Descricao
            });
          });
          this.getModel("SalesModel").refresh(true);
        }.bind(this)
      });
    },

    _readCarriers: function(sFreight) {
      var aFilters = [];
      this.getView().setBusy(true);
      aFilters.push(new Filter("Frete", FilterOperator.EQ, sFreight));
      this.getModel().read("/TransportadoraSet", {
        filters: aFilters,
        success: function(oData) {
          this.getView().setBusy(false);
          var oModelData = this.getModel("SalesModel").getData();
          oModelData.ComboTransportadoras = [];
          oData.results.forEach(function(oCarrier) {
            oModelData.ComboTransportadoras.push({
              Id: oCarrier.Id,
              Descricao: oCarrier.Descricao,
              CNPJ: oCarrier.CNPJ,
              IE: oCarrier.IE,
              Rua: oCarrier.Rua,
              Cidade: oCarrier.Cidade,
              CEP: oCarrier.CEP,
              Bairro: oCarrier.Bairro,
              Estado: oCarrier.Estado,
              Grupo: oCarrier.Grupo,
              Frete: oCarrier.Frete,
              Numero: oCarrier.Numero
            });
          });
          this.getModel("SalesModel").refresh(true);
        }.bind(this)
      });

    },

    onCanalChange: function() {
      this._evalSalesChannel();
    },

    _evalSalesChannel: function() {
      var oModelData = this.getModel("SalesModel").getData();
      var sKey = oModelData.SalesChannel;

      switch (sKey) {
        case "40":
          oModelData.TaxDefnt = "C3 - Consumo: ICMS + IPI";
          oModelData.TaxDefntCode = "C3";
          break;
        default:
          oModelData.TaxDefnt = "I3 - Industrialização: ICMS + IPI";
          oModelData.TaxDefntCode = "I3";
          break;
      }

      this.getModel("SalesModel").refresh(true);
    },

    onChangeQtd: function(oEvent) {
      var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.SalesModel.getObject();
      this.getModel("SalesModel").getData().FinalizeEnabled = false;

      var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + oObj.Material + "',Unidade='" + oObj.Unidade +
        "',Quantidade='" + oObj.Qtd.toString().replace(",", ".") + "',Centro='" + oObj.Centro + "')";
      var onError = function(odata, response) {
        sap.ui.core.BusyIndicator.hide();
        MessageBox.error(odata.responseText, {
          styleClass: "sapUiSizeCompact"
        });
      };
      var oModelData_sales = this.getModel("SalesModel").getData();
      var onSuccess = function(odata) {
        oObj.PrecoTbSemIPI = odata.PrecoBase;
        oObj.ValorTotItem = oObj.PrecoNegSemIPI === "" ? odata.PrecoBase * oObj.Qtd.toString().replace(",", ".") : oObj.PrecoNegSemIPI *
          oObj.Qtd.toString().replace(",", ".");
        oObj.Markup = odata.ValZmkp;
        oObj.Estque = odata.Estoque.replace(".", ",");
        oObj.Fisico = odata.Fisico;
        this.getModel("SalesModel").refresh(true);
      };

      this.getView().getModel().read(sPath, {
        success: onSuccess.bind(this),
        error: onError.bind(this)
      });

      var oView = this;
      var find = '0';
      var onSuccessProd = function(odata) {
        odata.results.forEach(function(prod) {
          if (prod.Loja == oObj.Centro) {
            oObj.Estque = prod.Estoque.replace(".", ",");
            find = '1';
          }
        });
        if (find == '0') {
          oObj.Estque = '0,000';
        }

        oView.getModel("SalesModel").refresh(true);
        oView._scrollToItens();
      };
      var onErrorProd = function(odata) {
        alert(odata); //nada
      };
      var sPathprod = "/ProdutosSet";
      var filters = [];
      filters.push(new Filter("Codproduto", FilterOperator.Contains, oObj.Material));

      if (oEvent.getSource().getId().includes("freteItem") && (this.getModel("SalesModel").getData().Mode == "Change" || this.getModel(
          "SalesModel").getData().Mode == "Copy")) {
        this._changeItemsFrete(oEvent.getSource().getValue());
      }

    },

    onChangeDesconto: function(oEvent) {
      var thisView = this;
      var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.SalesModel.getObject();
      oObj.PrecoNegSemIPI = "";
      oObj.ValorTotItem = parseFloat(oObj.Qtd.toString().replace(",", ".")) * parseFloat(oEvent.getParameter("value"));
      this._setValuesFields(oObj);
      oObj.DescPercentual = oEvent.getParameter("value");
      oObj.DescPercentualText = oEvent.getParameter("value");
      lpreco.delete(oObj.Item);
      this.byId("bnt-salvar").setEnabled(false);
    },

    onChangePrecoSemIPI: function(oEvent) {
      var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.SalesModel.getObject();
      oObj.DescPercentual = "";
      oObj.DescPercentualText = "";
      oObj.PrecoNegSemIPI = oEvent.getParameter("value");
      if (oEvent.getParameter("value") > 0) {
        oObj.ValorTotItem = parseFloat(oObj.Qtd.toString().replace(",", ".")) * parseFloat(oEvent.getParameter("value"));
        lpreco.set(oObj.Item, oEvent.getParameter("value"));
      } else {
        lpreco.delete(oObj.Item);
      }
      this._setValuesFields(oObj);
      this.byId("bnt-salvar").setEnabled(false);
    },

    onChangeFrete: function(oEvent) {},

    onChangeCentro: function(oEvent) {},

    _getTotalItemComDesconto(obj) {
      var vSubTotal = obj.Qtd * obj.PrecoTbSemIPI;
      var vDesconto = (obj.DescPercentual * vSubTotal) / 100;
      return vSubTotal - vDesconto;
    },

    status: function(Status) {
      var icone;
      switch (Status.substr(0, 3)) {
        case "FL0":
          icone = "sap-icon://status-inactive";
          break;
        case "FL1":
          icone = "sap-icon://status-critical";
          break;
        case "FL2":
          icone = "sap-icon://status-critical";
          break;
        case "FL3":
          icone = "sap-icon://status-positive";
          break;

        case "CL0":
          icone = "sap-icon://status-inactive";
          break;
        case "CL1":
          icone = "sap-icon://status-positive";
          break;
        case "CL2":
          icone = "sap-icon://status-error";
          break;
        case "CL3":
          icone = "sap-icon://status-critical";
          break;
        case "CL4":
          icone = "sap-icon://status-positive";
          break;
        case "GL0":
          icone = "sap-icon://status-inactive";
          break;
        case "GL1":
          icone = "sap-icon://status-positive";
          break;
        case "GL2":
          icone = "sap-icon://status-error";
          break;
        case "GL3":
          icone = "sap-icon://status-error";
          break;
        case "LL0":
          icone = "sap-icon://status-positive";
          break;
        case "LL1":
          icone = "sap-icon://status-positive";
          break;
        case "LL2":
          icone = "sap-icon://status-error";
          break;
        case "LL3":
          icone = "sap-icon://status-positive";
          break;

        case "RL0":
          icone = "sap-icon://status-inactive";
          break;
        case "RL1":
          icone = "sap-icon://status-critical";
          break;
        case "RL2":
          icone = "sap-icon://status-critical";
          break;
        case "RL3":
          icone = "sap-icon://status-positive";
          break;
        case "RL4":
          icone = "sap-icon://status-error";
          break;
        default:
          break;
      }
      return icone;
    },

    _resetPriceValues: function(obj) {
      obj.DescPercentual = "";
      obj.DescPercentualText = "";
      obj.PrecoNegSemIPI = "";
      obj.PrecoTarget = 0;
      obj.PrecoNegComIPI = 0;
      obj.ValorST = 0;
      obj.PrecoTarget = 0;
      this._setValuesFields(obj);
      this.getModel("SalesModel").getData().FinalizeEnabled = false;
    },

    _setValuesFields(obj) {
      var thisView = this;
      var totalText = 0;
      this.getModel("SalesModel").getData()
        .SalesItems
        .forEach(function(item) {
          totalText += parseFloat(item.ValorTotItem);
        });
      totalText = sap.ui.core.format.NumberFormat.getFloatInstance({
        "decimalSeparator": ",",
        "decimals": 2
      }).format(totalText);
      this.byId("textValorTotalVenda").setText(totalText);
    },

    onChangeTipoOperacao(oEvent) {
      var thisView = this;
      var op = this.byId("id-ComboTipoOperacao").getSelectedKey();
      var oViewModel = this.getModel("SalesModel");
      var oModel = oViewModel.getData();
      if (oModel.SalesItems.length > 0) {
        if (op == "2" || op == "1" && aTipoOperacao != 0) {
          oModel.CustomerId = "";
          oModel.SalesOffice = [];
          oModel.BillingAddress = [];
          oModel.BillingAddress = "";
          oModel.ComboCanal = [];
          oModel.ComboCondPagamento = [];
          oModel.ComboCobranca = [];
          oModel.ComboEntrega = [];
          oModel.CondPagto = [];
          oModel.ComboEntrega = [];
          oModel.ComboTransportadora = [];
          oModel.CustomerDoct = "";
          oModel.CustomerName = "";
          oModel.CustomerVisible = false;
          oModel.DeliveryAddress = "";
          oModel.DeliveryDate = "";
          oModel.SalesChannel = [];
          oModel.TaxDefnt = "";
          oModel.TaxDomcl = "";
          oModel.Utilization = "";
          oModel.Version = "";
          oModel.SalesOrder = "";
          oModel.PurchaseOrder = "";
          oModel.SalesCondition = "";
          oModel.SalesFrete = "";
          oModel.TaxDefntCode = "";
          oModel.TaxDefntCode = "";
          oModel.TaxDefnt = "";
          oModel.AdditionalDays = "";
          if (op == "1" && frete_geral.length > 0) {
            for (var g = 0; g < oModel.SalesItems.length; g++) {
              oModel.SalesItems[g].FreightHelper = frete_geral;
            }
          }
          if (op == "2") {
            frete_geral = oModel.SalesItems[0].FreightHelper;
            for (var g = 0; g < oModel.SalesItems.length; g++) {
              oModel.SalesItems[g].FreightHelper = frete_9;
            }
          }
          thisView.getModel("SalesModel").refresh(true);
        }
        aTipoOperacao = op;
        thisView._loadZterm(op);

      } else {
        if (op == "2" || op == "1" && aTipoOperacao != 0) {
          oModel.CustomerId = "";
          oModel.SalesOffice = [];
          oModel.BillingAddress = [];
          oModel.BillingAddress = "";
          oModel.ComboCanal = [];
          oModel.ComboCondPagamento = [];
          oModel.ComboCobranca = [];
          oModel.ComboEntrega = [];
          oModel.CondPagto = [];
          oModel.ComboEntrega = [];
          oModel.ComboTransportadora = [];
          oModel.CustomerDoct = "";
          oModel.CustomerName = "";
          oModel.CustomerVisible = false;
          oModel.DeliveryAddress = "";
          oModel.DeliveryDate = "";
          oModel.SalesChannel = [];
          oModel.TaxDefnt = "";
          oModel.TaxDomcl = "";
          oModel.Utilization = "";
          oModel.Version = "";
          oModel.SalesOrder = "";
          oModel.PurchaseOrder = "";
          oModel.SalesCondition = "";
          oModel.SalesFrete = "";
          oModel.TaxDefntCode = "";
          oModel.TaxDefntCode = "";
          oModel.TaxDefnt = "";
          oModel.AdditionalDays = "";
          thisView.getModel("SalesModel").refresh(true);
        }
        aTipoOperacao = op;
        thisView._loadZterm(op);
      }
    },

    _loadCustomerHelpers: function() {
      var thisView = this.getView();
      var aFilters = [];
      var sCliente = this.getModel("SalesModel").getData().CustomerId;
      var sOrdemVenda = this.getModel("SalesModel").getData().SalesOrder;
      aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CE;CC;FR;CD,CE;CC;CD"));
      aFilters.push(new Filter("Codcliente", sap.ui.model.FilterOperator.EQ, sCliente));
      aFilters.push(new Filter("OrdemVenda", sap.ui.model.FilterOperator.EQ, sOrdemVenda));
      this.getView().setBusy(true);
      this.getModel().read("/DM_DadoMestreOVSet", {
        filters: aFilters,
        success: function(oData) {
          this.getView().setBusy(false);
          var aComboEntrega = [];
          var aComboCobranca = [];
          var aComboCanal = [];
          oData.results.forEach(function(oEntry) {
            switch (oEntry.Codconsulta) {
              case "CE":
                aComboEntrega.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "CC":
                aComboCobranca.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "CD":
                aComboCanal.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
            }
          });
          var oModelData = this.getModel("SalesModel").getData();
          oModelData.ComboCanal = aComboCanal;

          if (aComboCanal.length == 1) {
            oModelData.SalesChannel = aComboCanal[0].Coddadomestre;
            thisView.byId("id-ComboCanal").setSelectedKey(oModelData.SalesChannel);
            this._evalSalesChannel();
          }

          oModelData.ComboEntrega = aComboEntrega;
          if (aComboEntrega.length == 1) {
            oModelData.DeliveryAddress = aComboEntrega[0].Coddadomestre;
            this.byId("id-ComboEntrega").setSelectedKey(oModelData.DeliveryAddress);
          }
          oModelData.ComboCobranca = aComboCobranca;
          if (aComboCobranca.length == 1) {
            oModelData.BillingAddress = aComboCobranca[0].Coddadomestre;
            this.byId("id-ComboCobranca").setSelectedKey(oModelData.BillingAddress);
          }
          this.getModel("SalesModel").refresh(true);
        }.bind(this),
        error: function() {
          this.getView().setBusy(false);
        }.bind(this)
      });

    },

    _loadInitialHelpers: function(a) {
      var aFilters = [];
      var that = this;
      var sOrdemVenda = this.getModel("SalesModel").getData().SalesOrder;
      aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "TO;ES;FR;CP;UT;VS"));
      aFilters.push(new Filter("OrdemVenda", sap.ui.model.FilterOperator.EQ, sOrdemVenda));
      this.getView().setBusy(true);
      this.getModel().read("/DM_DadoMestreOVSet", {
        filters: aFilters,
        success: function(oData) {
          this.getView().setBusy(false);
          var aComboTipoOperacao = [];
          var aComboEscritorio = [];
          var aComboCondPagto = [];
          var aComboCanal = [];
          var aComboUtilizacao = [];
          var aComboVersao = [];
          var aFreightHelper = [];
          oData.results.forEach(function(oEntry) {
            switch (oEntry.Codconsulta) {
              case "TO":
                if (that.getModel("SalesModel").getData().Mode === "Copy" && oEntry.Flag === "X") {
                  aComboTipoOperacao.push({
                    Codconsulta: oEntry.Codconsulta,
                    Coddadomestre: oEntry.Coddadomestre,
                    Textodadomestre: that.camelize(oEntry.Textodadomestre),
                    Flag: oEntry.Flag,
                  });
                } else {
                  aComboTipoOperacao.push({
                    Codconsulta: oEntry.Codconsulta,
                    Coddadomestre: oEntry.Coddadomestre,
                    Textodadomestre: that.camelize(oEntry.Textodadomestre),
                    Flag: oEntry.Flag,
                  });
                }
                break;
              case "ES":
                aComboEscritorio.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "CP":
                aComboCondPagto.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "UT":
                aComboUtilizacao.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "FR":
                aFreightHelper.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
              case "VS":
                aComboVersao.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
            }
          });
          var oModelData = this.getModel("SalesModel").getData();
          if (a) {
            var ab = aComboEscritorio.indexOf({
              Codconsulta: 'ES',
              Coddadomestre: a.split("-")[0],
              Textodadomestre: a.split(a.split("-")[0])[1].substring(1, a.split(a.split("-")[0])[1].lenght)
            });

            if (ab == -1) {
              aComboEscritorio.push({
                Codconsulta: 'ES',
                Coddadomestre: a.split("-")[0],
                Textodadomestre: a.split(a.split("-")[0])[1].substring(1, a.split(a.split("-")[0])[1].lenght)
              });
            }
            oModelData.ComboEscritorio = aComboEscritorio;
          } else {
            oModelData.ComboEscritorio = aComboEscritorio;
          }

          oModelData.ComboTipoOperacao =
            oModelData.Mode === "Change" ? aComboTipoOperacao :
            aComboTipoOperacao.filter((item) => {
              return item.Flag === "X"
            });

          oModelData.ComboCondPagto = aComboCondPagto;
          oModelData.ComboCanal = aComboCanal;
          oModelData.ComboUtilizacao = aComboUtilizacao;
          oModelData.ComboVersao = aComboVersao;
          oModelData.CarrierFreightHelper = aFreightHelper;
          this.getModel("SalesModel").refresh(true);
        }.bind(this),
        error: function() {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    onCustomerValueHelp: function(oEvent) {
      var sInputValue, sSearchFiled;
      sInputValue = oEvent.getSource().getValue();
      if ($.isNumeric(sInputValue) && sInputValue.length === 11) {
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
        "arcelor.view.ClientesPesquisaDialog",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);
      this._valueHelpDialog.getBinding("items").filter(
        [new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue)]
      );
      this._valueHelpDialog.open(sInputValue);
    },

    handleSearchClientes: function(oEvent) {
      var aFilters = [];
      var sQuery = oEvent.getParameter("value");
      var venda = this.getView().byId("id-ComboTipoOperacao").getSelectedKey();
      if ((sQuery && sQuery.length > 0) && (sQuery.trim().length > 0)) {
        if ($.isNumeric(sQuery) && sQuery.length === 11) {
          aFilters.push(new Filter("Cpf", sap.ui.model.FilterOperator.Contains, sQuery));
        }
        if ($.isNumeric(sQuery) && sQuery.length < 11) {
          aFilters.push(new Filter("Codcliente", sap.ui.model.FilterOperator.Contains, sQuery));
        } else if ($.isNumeric(sQuery) && sQuery.length > 11) {
          aFilters.push(new Filter("Cnpj", sap.ui.model.FilterOperator.Contains, sQuery));
        } else if (!$.isNumeric(sQuery)) {
          aFilters.push(new Filter("Nome", sap.ui.model.FilterOperator.Contains, sQuery));
        }
      }
      if (venda === "2") {
        aFilters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, "C"));
      } else {
        aFilters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, "V"));
      }
      oEvent.getSource().getBinding("items").filter(aFilters);
    },

    onSearchMaterial: function(oEvent) {
      if (this._oDialog) {
        this._oDialog.destroy();
      }
      var sQuery = oEvent.getSource().getValue();
      var aFilters = [];
      if (sQuery.length > 0) {
        if ($.isNumeric(sQuery)) {
          aFilters.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.EQ, sQuery));
        } else {
          aFilters.push(new sap.ui.model.Filter("Texto", sap.ui.model.FilterOperator.EQ, sQuery));
        }
        aFilters.push(new sap.ui.model.Filter("Setorativ", sap.ui.model.FilterOperator.EQ, sQuery));
      }
      var oview = this;
      this._oDialog = sap.ui.xmlfragment("arcelor.view.ProdutosConsultaFrag", this);
      this._oDialog.setModel(this.getView().getModel());
      jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
      this._oDialog.getBinding("items").filter(
        aFilters
      );
      this._oDialog.open();
    },

    toFloat: function(sValue) {
      return sValue.split(" .")[sValue.split(" .").length - 1];;
    },

    handleSearchMaterial: function(oEvent) {
      var aFilters = [];
      var sQuery = oEvent.getParameter("value");
      if (sQuery.length > 0) {
        if ($.isNumeric(sQuery)) {
          aFilters.push(new sap.ui.model.Filter("Codproduto", sap.ui.model.FilterOperator.EQ, sQuery));
        } else {
          aFilters.push(new sap.ui.model.Filter("Texto", sap.ui.model.FilterOperator.EQ, sQuery));
        }
        aFilters.push(new sap.ui.model.Filter("Setorativ", sap.ui.model.FilterOperator.EQ, sQuery));
      }
      oEvent.getSource().getBinding("items").filter(aFilters);
    },

    handleCloseMaterial: function(oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var frete = "";

      if (aContexts && aContexts.length > 0) {
        var oObject = aContexts[0].getObject();
        var oModelData = this.getModel("SalesModel").getData();
        if (oModelData.Mode === "Change") {
          let oItem = oObject;
          if (oItem.Loja != oModelData.SalesItems[0].Centro) {
            MessageToast.show('Não é possível incluir um item com Centro diferente da OV atual.');
            return false;
          }
          frete = oModelData.SalesItems[0].Frete;
        }
        this._loadMaterialData("CU;UN;FR", oObject.Codproduto.toString()).then(function(oData) {
          var aMeasureHelper = [];
          var aPlantBaseHelper = [];
          var aPlantHelper = [];
          var aFreightHelper = [];
          var thisView = this;
          oData.results.forEach(function(oResult) {
            switch (oResult.Codconsulta) {
              case "UN":
                aMeasureHelper.push({
                  Codconsulta: oResult.Codconsulta,
                  Coddadomestre: oResult.Coddadomestre,
                  Textodadomestre: oResult.Textodadomestre
                });
                break;
              case "FR":
                if (thisView.byId("id-ComboTipoOperacao").getSelectedKey() == '2') {
                  if (oResult.Coddadomestre == 9) {
                    aFreightHelper.push({
                      Codconsulta: oResult.Codconsulta,
                      Coddadomestre: oResult.Coddadomestre,
                      Textodadomestre: oResult.Textodadomestre
                    });
                  }
                } else {
                  aFreightHelper.push({
                    Codconsulta: oResult.Codconsulta,
                    Coddadomestre: oResult.Coddadomestre,
                    Textodadomestre: oResult.Textodadomestre
                  });
                }
                break;
              case "CU":
                aPlantBaseHelper.push({
                  Codconsulta: oResult.Codconsulta,
                  Coddadomestre: oResult.Coddadomestre,
                  Textodadomestre: oResult.Textodadomestre
                });
                break;
              case "CZ":
                aPlantBaseHelper.push({
                  Codconsulta: oResult.Codconsulta,
                  Coddadomestre: oResult.Coddadomestre,
                  Textodadomestre: oResult.Textodadomestre
                });
                break;
            }
          });
          var aHelpChecker = {};
          aPlantBaseHelper.forEach(function(oObjectCheck) {
            if (!aHelpChecker[oObjectCheck.Coddadomestre]) {
              aHelpChecker[oObjectCheck.Coddadomestre] = true;
              aPlantHelper.push(oObjectCheck);
            }
          });
          var lastItem = oModelData.SalesItems.length - 1;
          var nextItem = 10;
          if (oModelData.SalesItems.length !== 0) {
        	  oModelData.SalesItems.sort(function(a,b) { return a.Item < b.Item ? -1 : a.Item > b.Item ? 1 : 0; });  
            nextItem = Number(oModelData.SalesItems[lastItem].Item) + 10;
          }
          oModelData.SalesItems.push({
            Item: nextItem,
            //(oModelData.SalesItems.length * 10) + 10,
            Material: oObject.Codproduto.toString(),
            Descricao: oObject.Descrprod.toString(),
            Estque: oObject.EstljQuan1.toString().replace(".", ","),
            Qtd: "1",
            Unidade: oObject.Undmedida.toString(),
            PrecoTbSemIPI: oObject.Precodezx.toString(),
            PrecoNegComIPI: "",
            Markup: "0",
            PrecoNegSemIPI: "",
            DescPercentual: "",
            ValorTotItem: oObject.Precodezx,
            PrecoTarget: "",
            ValorST: "",
            Centro: oObject.Loja.toString(),
            Frete: frete,
            ItemPedCli: "",
            Deleted: false,
            Fisico: oObject.Fisico.trim().replace(".", ","),
            UnitHelper: aMeasureHelper,
            PlantHelper: aPlantHelper,
            FreightHelper: aFreightHelper,
            Editable: true,
            PermiteTipo: oObject.PermiteTipo
          });

          this.getModel("SalesModel").refresh(true);
          this.getView().byId("__field4").setValue("");
          this.byId("bnt-salvar").setEnabled(false);
        }.bind(this));
      }

      if (this._oDialog) {
        this._oDialog.destroy();
      }

    },

    onCalcular: function(oEvent) {
      if (this._validarOV()) {
        //        this._processarOV(oEvent, "S");
        this._regraPoliticaComercial(oEvent, "S");
      }
    },

    //    _processarOV: function (sEvent, sTipoExecucao) {
    //
    //      var aSalesOrderItemSetNavig = [];
    //      var oDataOV = {};
    //      var oModelData = this.getModel("SalesModel").getData();
    //      var teste_frete = '';
    //      var frete = '';
    //
    //      oModelData.SalesItems.forEach(function (oSalesItem) {
    //
    //        if (!oSalesItem.Deleted) {
    //          if (oSalesItem.Frete == '') {
    //            MessageToast.show('Preencher campo frete item: ' + oSalesItem.Item);
    //            teste_frete = 'X';
    //          }
    //          if (oSalesItem.Qtd == '') {
    //            MessageToast.show('Preencher campo quantidade item: ' + oSalesItem.Item);
    //            teste_frete = 'X';
    //          }
    //        }
    //
    //        var preco_tot = '';
    //
    //        if (oSalesItem.DescPercentual.length > 0) {
    //          preco_tot = oSalesItem.PrecoNegSemIPI.toString();
    //        } else {
    //          if (lpreco.has(oSalesItem.Item)) {
    //            preco_tot = lpreco.get(oSalesItem.Item);
    //          } else {
    //            preco_tot = '';
    //          }
    //        }
    //
    //        aSalesOrderItemSetNavig.push({
    //          Item: (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oSalesItem.Item.toString()),
    //          Ordem: (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oModelData.SalesOrder),
    //          Material: oSalesItem.Material,
    //          Quantidade: oSalesItem.Qtd.toString().replace(",", "."),
    //          UnidadeMedida: oSalesItem.Unidade,
    //          Centro: oSalesItem.Centro,
    //          Frete: oSalesItem.Frete,
    //          Pedido: oSalesItem.ItemPedidoCliente,
    //          PrecoUnitSugerido: preco_tot.length > 0 ? preco_tot : "0",
    //          ValZvnd: oSalesItem.DescPercentual.length > 0 ? oSalesItem.DescPercentual : "0",
    //          Deletar: oSalesItem.Deleted ? "X" : ""
    //        });
    //      });
    //
    //      if (teste_frete == 'X') {
    //        teste_frete = '';
    //        return false;
    //      }
    //
    //      var sDtDesejada = "";
    //
    //      if (oModelData.DeliveryDate.length > 0) {
    //        var sDtDesejadaSplit = oModelData.DeliveryDate.split("/");
    //        sDtDesejada = sDtDesejadaSplit[2] + "-" + sDtDesejadaSplit[1] + "-" + sDtDesejadaSplit[0];
    //        sDtDesejada = new Date(sDtDesejada);
    //      }
    //
    //      oDataOV = {
    //        "Ordem": (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oModelData.SalesOrder),
    //        "TipoOperacao": oModelData.SalesType,
    //        "Cliente": oModelData.CustomerId,
    //        "TipoExecucao": sTipoExecucao, //S:SIMULACAO - C: CRIACAO - A:ALTERACAO
    //        "User": "",
    //        "CondPagamento": oModelData.SalesCondition,
    //        "Frete": oModelData.Frete,
    //        "Imposto": oModelData.TaxDefntCode,
    //        "Canalsetor": oModelData.SalesChannel,
    //        "Contribuinte": "",
    //        "ClienteCobranca": oModelData.BillingAddress,
    //        "ClienteEntrega": oModelData.DeliveryAddress,
    //        "EscritorioVendas": oModelData.SalesOffice,
    //        "Transporte": "",
    //        "Lifnr": "",
    //        "DescTransp": "",
    //        "DataDesEntrega": sDtDesejada,
    //        "Pedido": oModelData.PurchaseOrder,
    //        "Obs1": oModelData.NFObs01,
    //        "Obs2": oModelData.NFObs02,
    //        "Obs3": oModelData.NFObs03,
    //        "Obs4": oModelData.NFObs04,
    //        "Obs5": oModelData.LDObs01,
    //        "Obs6": oModelData.LDObs02,
    //        "Regio": oModelData.CarrierRegion,
    //        "Versao": oModelData.Version,
    //        "Util": oModelData.Utilization,
    //        "Valtg": this.getView().byId("input-diasAdd").getValue(),
    //        SalesOrderItemSetNavig: aSalesOrderItemSetNavig
    //      };
    //
    //      if (oModelData.CarrierVisible) {
    //        oDataOV.LifnrTransp = oModelData.Carrier;
    //        oDataOV.Name1Transp = oModelData.CarrierName;
    //        oDataOV.NomeTransp = oModelData.CarrierName;
    //        oDataOV.DescTransp = oModelData.CarrierName;
    //        oDataOV.CpfCnpjTransp = oModelData.CarrierDoct;
    //        oDataOV.IeTransp = oModelData.CarrierIE;
    //        oDataOV.CepTransp = oModelData.CarrierCEP;
    //        oDataOV.RuaTransp = oModelData.CarrierStreet;
    //        oDataOV.BairroTransp = oModelData.CarrierNeighb;
    //        oDataOV.CidadeTransp = oModelData.CarrierCity;
    //        oDataOV.PlacaTransp = oModelData.CarrierPlate;
    //        oDataOV.AnttTransp = oModelData.CarrierANTT;
    //        oDataOV.RegiaoTransp = oModelData.CarrierState;
    //        oDataOV.FreteTransp = oModelData.Frete;
    //        oDataOV.nrumtransp = oModelData.CarrierNumber;
    //      }
    //
    //      this.getView().setBusy(true);
    //
    //      this.getView().getModel().create("/SalesOrderSet", oDataOV, {
    //        success: function (oCreatedEntry, success, response, odata) {
    //          this.getView().setBusy(false);
    //          var oController = this
    //          var totalText = 0;
    //
    //          totalText = this.formatter.totalPrice(oModelData.SalesItems);
    //          if (sTipoExecucao != "S") {
    //            var iTotalItens = oModelData.SalesItems.length;
    //            var iTotalRemov = aItensRemoved.length;
    //
    //            if (iTotalItens === iTotalRemov) {
    //              aItensRemoved = [];
    //
    //              MessageBox.success("OV " + oModelData.SalesOrder + " eliminada com sucesso!", {
    //                onClose: function () {
    //                  oController.onNavBack();
    //                }
    //              });
    //
    //              return;
    //            }
    //
    //            aItensRemoved.forEach(function (item) {
    //              totalText -= parseFloat(item.ValorTotItem);
    //            });
    //          }
    //
    //          aItensRemoved = [];
    //
    //          var aDataRetorno = success.data.SalesOrderItemSetNavig.results;
    //          var aSalesItems = this.getModel("SalesModel").getData().SalesItems;
    //          aSalesItems.forEach(function (oItemProcess) {
    //            if (!oItemProcess.Deleted) {
    //              aDataRetorno.forEach(function (oItemReturn) {
    //                if (oItemReturn.Item == oItemProcess.Item && oItemReturn.Material === oItemProcess.Material && oItemReturn.Centro ===
    //                  oItemProcess.Centro && oItemReturn.Frete === oItemProcess.Frete && parseFloat(oItemReturn.Quantidade, 10) ==
    //                  parseFloat(oItemProcess.Qtd.toString().replace(",", "."))) {
    //                  oItemProcess.PrecoTbSemIPI = oItemReturn.ValPrecoT;
    //                  oItemProcess.PrecoNegComIPI = oItemReturn.ValZvti;
    //                  oItemProcess.Markup = oItemReturn.ValZmkp === 9999 ? 0 : oItemReturn.ValZmkp;
    //                  oItemProcess.PrecoNegSemIPI = parseFloat(oItemReturn.PrecoSugerido);
    //                  oItemProcess.DescPercentual = parseFloat(oItemReturn.ValZvnd).toFixed(2);
    //                  oItemProcess.PrecoTarget = oItemReturn.VlPrecoTarget;
    //                  oItemProcess.ValorTotItem = oItemReturn.ValorTotalItem;
    //                  oItemProcess.ValorST = oItemReturn.ValSt;
    //                }
    //              });
    //            }
    //          });
    //          this.getModel("SalesModel").refresh(true);
    //
    //          var hdrMessage = success.headers["sap-message"];
    //          var hdrMessageObject = JSON.parse(hdrMessage);
    //          var sMessage = [];
    //          sMessage.push(hdrMessageObject.message);
    //          hdrMessageObject.details.forEach(function (item_detail) {
    //            sMessage.push(item_detail.message);
    //          });
    //
    //          var box1 = new sap.m.HBox({
    //            width: "100%",
    //            direction: sap.m.FlexDirection.Row,
    //            alignContent: sap.m.FlexAlignContent.Center,
    //            alignItems: sap.m.FlexAlignItems.Start,
    //            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
    //          })
    //          var texto_button = '';
    //          var text1 = new sap.m.Label({
    //            text: "N° OV"
    //          });
    //          var text2 = new sap.m.Label({
    //            text: "Emissor"
    //          });
    //          var text3 = new sap.m.Label({
    //            text: "Valor"
    //          });
    //          var text4 = new sap.m.Label({
    //            text: "Processamento"
    //          });
    //          if (sTipoExecucao == 'B') {
    //            box1.addItem(text1);
    //            box1.addItem(text2);
    //            box1.addItem(text3);
    //            box1.addItem(text4);
    //          }
    //          var boxPai = new sap.m.HBox({
    //            width: "auto",
    //            fitContainer: false,
    //            direction: sap.m.FlexDirection.Column,
    //            alignItems: sap.m.FlexAlignItems.Start,
    //          });
    //          var box2 = [];
    //
    //          sMessage.forEach(function (texto) {
    //            if (sTipoExecucao == 'C') {
    //              texto_button = 'R$ ' + texto.split(" ")[8].substring(0, texto.split(" ")[8].length - 2).replace(".", ",");
    //              box2.push(new sap.m.HBox({
    //                width: "100%",
    //                alignContent: sap.m.FlexAlignContent.SpaceBetween,
    //                direction: sap.m.FlexDirection.Row,
    //                alignContent: sap.m.FlexAlignContent.Stretch,
    //                alignItems: sap.m.FlexAlignItems.Center,
    //                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
    //                items: [
    //                  new sap.m.Link({
    //                    text: texto.split(" ")[3],
    //                    press: [oController.handleLinkPress, oController]
    //                  }),
    //                  new Text({
    //                    text: oController.byId("input-Codigo").getText()
    //                  }),
    //                  new Text({
    //                    text: 'R$ ' + texto.split(" ")[8].substring(0, texto.split(" ")[8].length - 2).replace(".", ",")
    //                  }),
    //                  new Text({
    //                    text: texto.split(texto.split(" ")[8])[1]
    //                  })
    //                ]
    //              }))
    //              boxPai.addItem(box1);
    //            } else {
    //              var texto_valor = '';
    //              var texto_inf = '';
    //              if (texto.split("(a)")[1]) {
    //                texto_valor = parseFloat(texto.split("(a)")[1].split(" ")[2]).toFixed(2);
    //                texto_inf = texto.split("(a)")[1].split("ini")[1];&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\&nbsp;
    //                if (!texto_inf) {
    //                  texto_inf = texto.split("(a)")[1].split("Ordem")[1];
    //                  texto_inf = texto_inf.replace("gerada", "alterada")
    //                }
    //              }
    //              var nro_text = '';
    //              if (texto.indexOf("NFCe") != -1) {
    //                nro_text = texto.split(" ")[2]
    //              } else {
    //              var sOv  = texto.split(" ")[0];
    //                nro_text = texto.split(" ")[3];
    //                nro_text = sOv + " " + nro_text;
    //              }
    //              box2.push(new sap.m.HBox({
    //                width: "100%",
    //                alignContent: sap.m.FlexAlignContent.SpaceBetween,
    //                direction: sap.m.FlexDirection.Row,
    //                alignItems: sap.m.FlexAlignItems.Right,
    //                justifyContent: sap.m.FlexJustifyContent.SpaceAround,
    //                items: [
    //                  new Text({
    //                    text: nro_text
    //                  }),
    //                  new Text({
    //                    text: oController.byId("input-Codigo").getText()
    //                  }),
    //                  new Text({
    //                    text: 'R$ ' + texto_valor
    //                  }),
    //                  new Text({
    //                    text: texto_inf
    //                  })
    //                ]
    //              }))
    //            }
    //          });
    //          box2.forEach(function (box) {
    //            boxPai.addItem(box);
    //          });
    //
    //          var dialog = new Dialog({
    //            title: 'Resultado do processamento',
    //            type: 'Message',
    //            contentWidth: '100%',
    //            content: boxPai,
    //            beginButton: new Button({
    //              text: 'OK',
    //              press: function () {
    //                if (oController.getModel("SalesModel").getData().Mode != 'Change') {
    //                  oController.onLimparTela();
    //                  oController.onLimparTela();
    //                } else {
    //                  oController.getModel("SalesModel").getData().EditVisible = true;
    //                  oController.getModel("SalesModel").getData().FunctionsVisible = true;
    //                  oController.getModel("SalesModel").getData().CancelVisible = false;
    //                  oController.getModel("SalesModel").getData().Changeable01 = false;
    //                  oController.getModel("SalesModel").getData().Changeable02 = false;
    //                  oController.getModel("SalesModel").refresh(true);
    //                  oController._loadSalesOrder(oModelData.SalesOrder);
    //                }
    //                dialog.close();
    //                oController.onResetCart();
    //              }
    //            }),
    //            afterClose: function () {
    //              dialog.destroy();
    //            }
    //          });
    //
    //          var link = new sap.m.Link({
    //            text: sMessage,
    //            press: [this.handleLinkPress, this]
    //          });
    //
    //          if (hdrMessageObject.severity !== "error") {
    //            this.getModel("SalesModel").getData().DoNavigation = ((sTipoExecucao === "C" || sTipoExecucao === "A") && hdrMessageObject.severity !==
    //              "error");
    //            if (sTipoExecucao != 'S') {
    //              dialog.open();
    //            } else {
    //              MessageBox.success(sMessage[0], {
    //                onClose: function () {
    //                  dialog.destroy();
    //                }.bind(this),
    //                dialogId: "messageBoxId"
    //              });
    //            }
    //          } else {
    //            MessageBox.error(sMessage);
    //          }
    //
    //          if (!this.getModel("SalesModel").getData().DoNavigation) {
    //            this.getModel("SalesModel").getData().FinalizeEnabled = (hdrMessageObject.severity !== "error");
    //            this.getModel("SalesModel").refresh(true);
    //          }
    //        }.bind(this),
    //        error: function (oError) {
    //          this.getView().setBusy(false);
    //          var aSalesItems = this.getView().getModel("SalesModel").getData().SalesItems;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\&nbsp;
    //          var sMessage = JSON.parse(oError.responseText).error.message.value;
    //          var n = sMessage.includes('gravado');
    //          if (!n) {
    //            aSalesItems.forEach(function (oItemProcess) {
    //              oItemProcess.PrecoNegComIPI = oItemProcess.PrecoNegComIPI;
    //              oItemProcess.Markup = oItemProcess.Markup === 9999 ? 0 : oItemProcess.Markup;
    //              oItemProcess.DescPercentual = oItemProcess.DescPercentual;
    //              oItemProcess.PrecoTarget = oItemProcess.PrecoTarget;
    //              oItemProcess.ValorTotItem = oItemProcess.ValorTotItem;
    //              oItemProcess.ValorST = oItemProcess.ValorST;
    //            });
    //            this.getView().getModel("SalesModel").refresh(true);
    //          }
    //
    //          if (n) {
    //            MessageBox.success(sMessage, {
    //              onClose: function () {
    //                this._loadSalesOrder(oModelData.SalesOrder);
    //              }.bind(this),
    //              dialogId:  "messageBoxId"
    //            });
    //            var oModelData = this.getModel("SalesModel").getData();
    //            oModelData.CalculateVisible = false;
    //            oModelData.LiberaUnFre = false;
    //            oModelData.FinalizeVisible = false;
    //            oModelData.EditVisible = true;
    //            oModelData.FunctionsVisible = true;
    //            oModelData.CancelVisible = false;
    //            oModelData.Changeable01 = false;
    //            oModelData.Changeable02 = false;
    //
    //            this.getView().getModel("SalesModel").refresh(true);
    //            this._loadSalesOrder(oModelData.SalesOrder);
    //          } else {
    //            MessageBox.error(sMessage, {
    //              onClose: function () {}.bind(this),
    //              dialogId:  "messageBoxId"
    //            });
    //          }
    //        }.bind(this)
    //      });
    //    },

    onConfirmShlp: function(oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");

      if (aContexts && aContexts.length) {
        var oObject = aContexts.map(function(oContext) {
          return oContext.getObject();
        })[0];
        this.getView().byId("textNivelServico").setText(oObject.nivserv);
        this.getView().byId("textValorServico").setText("");
          this.getModel("SalesModel").getData().FinalizeEnabled = false;
          this.getModel("SalesModel").refresh(true);
      } //else {
        //this.getView().byId("textNivelServico").setText("");
      //}
      //this.getView().byId("textValorTotServ").setText("");

      if (this._oDialog) {
        this._oDialog.destroy();
      }
    },

    onServico: function(oEvent) {

      var oModelData = this.getModel("SalesModel").getData();
      var kunnr = oModelData.CustomerId;
      var inco1 = "";
      oModelData.CarrierFreightHelper.forEach(function(oCarrierItem){
        if (oCarrierItem.Coddadomestre == oModelData.SalesFrete){
          inco1 = oCarrierItem.Textodadomestre.trim();
        }
      });
      var vkbur = oModelData.SalesOffice;
      var today = new Date();
      var oDeliveryDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var oSalesOrderItem = [];
      var filter;
      var filters = [];

      oModelData.SalesItems.forEach(function(oSalesItem) {
        filter = new sap.ui.model.Filter("centro", sap.ui.model.FilterOperator.EQ, oSalesItem.Centro);
        filters.push(filter);
        filter = new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.EQ, oSalesItem.Material);
        filters.push(filter);
      });
      filter = new sap.ui.model.Filter("data", sap.ui.model.FilterOperator.EQ, oDeliveryDate);
      filters.push(filter);
      filter = new sap.ui.model.Filter("inco1", sap.ui.model.FilterOperator.EQ, inco1);
      filters.push(filter);
      filter = new sap.ui.model.Filter("vkbur", sap.ui.model.FilterOperator.EQ, vkbur);
      filters.push(filter);
      filter = new sap.ui.model.Filter("kunnr", sap.ui.model.FilterOperator.EQ, kunnr);
      filters.push(filter);
      filter = new sap.ui.model.Filter("datab", sap.ui.model.FilterOperator.EQ, oDeliveryDate);
      filters.push(filter);

      this.getModel().read("/NivServSet", {
        filters: filters,
        success: function(oReadEntry, success, response, odata) {

          var oJsonModel = new sap.ui.model.json.JSONModel();
          oJsonModel.setData(oReadEntry.results);
          this.getView().setModel(oJsonModel, "viewNS");
          this._oDialog = sap.ui.xmlfragment("arcelor.view.NiveisServ", this);
          this.getView().addDependent(this._oDialog);

          this._oDialog.open();

        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
          this._processarOVError(oEvent, oError, sTipoExecucao, sRegraTipo, oModelData);
        }.bind(this)
      });

    },

    _processarOV: function(oEvent, sTipoExecucao, sRegraTipo) {

      var aSalesOrderItemSetNavig = [];
      var oDataOV = {};
      var oModelData = this.getModel("SalesModel").getData();
      var teste_frete = '';
      var frete = '';

      oModelData.SalesItems.forEach(function(oSalesItem) {

        if (!oSalesItem.Deleted) {
          if (oSalesItem.Frete == '') {
            MessageToast.show('Preencher campo frete item: ' + oSalesItem.Item);
            teste_frete = 'X';
          }
          if (oSalesItem.Qtd == '') {
            MessageToast.show('Preencher campo quantidade item: ' + oSalesItem.Item);
            teste_frete = 'X';
          }
        }
        
        var preco_tot = '';

        if (oSalesItem.DescPercentual.length > 0) {
          preco_tot = oSalesItem.PrecoNegSemIPI.toString();
        } else {
          if (lpreco.has(oSalesItem.Item)) {
            preco_tot = lpreco.get(oSalesItem.Item);
          } else {
            preco_tot = '';
          }
        }

        aSalesOrderItemSetNavig.push({
          Item: (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oSalesItem.Item.toString()),
          Ordem: (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oModelData.SalesOrder),
          Material: oSalesItem.Material,
          Quantidade: oSalesItem.Qtd.toString().replace(",", "."),
          UnidadeMedida: oSalesItem.Unidade,
          Centro: oSalesItem.Centro,
          Frete: oSalesItem.Frete,
          Pedido: oSalesItem.ItemPedidoCliente,
          PrecoUnitSugerido: preco_tot.length > 0 ? preco_tot : "0",
          ValZvnd: oSalesItem.DescPercentual.length > 0 ? oSalesItem.DescPercentual : "0",
          Deletar: oSalesItem.Deleted ? "X" : "",
          Tipo: oSalesItem.Tipo		  
        });
      });

      if (teste_frete == 'X') {
        teste_frete = '';
        return false;
      }
      
      var sDtDesejada = "";

      if (oModelData.DeliveryDate.length > 0) {
        var sDtDesejadaSplit = oModelData.DeliveryDate.split("/");
        sDtDesejada = sDtDesejadaSplit[2] + "-" + sDtDesejadaSplit[1] + "-" + sDtDesejadaSplit[0];
        sDtDesejada = new Date(sDtDesejada);
      }

      oDataOV = {
        "Ordem": (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "" : oModelData.SalesOrder),
        "TipoOperacao": oModelData.SalesType,
        "Cliente": oModelData.CustomerId,
        "TipoExecucao": sTipoExecucao, //S:SIMULACAO - C: CRIACAO - A:ALTERACAO
        "User": "",
        "CondPagamento": oModelData.SalesCondition,
        "Frete": oModelData.Frete,
        "Imposto": oModelData.TaxDefntCode,
        "Canalsetor": oModelData.SalesChannel,
        "Contribuinte": "",
        "ClienteCobranca": oModelData.BillingAddress,
        "ClienteEntrega": oModelData.DeliveryAddress,
        "EscritorioVendas": oModelData.SalesOffice,
        "Transporte": "",
        "Lifnr": "",
        "DescTransp": "",
        "DataDesEntrega": sDtDesejada,
        "Pedido": oModelData.PurchaseOrder,
        "Obs1": oModelData.NFObs01,
        "Obs2": oModelData.NFObs02,
        "Obs3": oModelData.NFObs03,
        "Obs4": oModelData.NFObs04,
        "Obs5": oModelData.LDObs01,
        "Obs6": oModelData.LDObs02,
        "Regio": oModelData.CarrierRegion,
        "Versao": oModelData.Version,
        "Util": oModelData.Utilization,
        "Valtg": this.getView().byId("input-diasAdd").getValue(),
        "ShowErro": sRegraTipo ? true : false,
        "NivServ": oModelData.NivelServ,
        SalesOrderItemSetNavig: aSalesOrderItemSetNavig
      };

      if (oModelData.CarrierVisible) {
        oDataOV.LifnrTransp = oModelData.Carrier;
        oDataOV.Name1Transp = oModelData.CarrierName;
        oDataOV.NomeTransp = oModelData.CarrierName;
        oDataOV.DescTransp = oModelData.CarrierName;
        oDataOV.CpfCnpjTransp = oModelData.CarrierDoct;
        oDataOV.IeTransp = oModelData.CarrierIE;
        oDataOV.CepTransp = oModelData.CarrierCEP;
        oDataOV.RuaTransp = oModelData.CarrierStreet;
        oDataOV.BairroTransp = oModelData.CarrierNeighb;
        oDataOV.CidadeTransp = oModelData.CarrierCity;
        oDataOV.PlacaTransp = oModelData.CarrierPlate;
        oDataOV.AnttTransp = oModelData.CarrierANTT;
        oDataOV.RegiaoTransp = oModelData.CarrierState;
        oDataOV.FreteTransp = oModelData.Frete;
        oDataOV.nrumtransp = oModelData.CarrierNumber;
      }

      this.getView().setBusy(true);
      var evento = oEvent.getSource();

      this.getView().getModel().create("/SalesOrderSet", oDataOV, {
        success: function(oCreatedEntry, success, response, odata) {
          this.getView().setBusy(false);
          var oController = this
          var totalText = 0;
          var totalServText = 0;
          var totServSoma = '';

          var tValue = [];

          oModelData.SalesItems.forEach(function(oValItem){
            tValue.push({
              ValZnsv: oValItem.ValorTotItem
            });
          });

          oCreatedEntry.SalesOrderItemSetNavig.results.forEach(function(oValServ){
            tValue.push({
              ValZnsv: oValServ.ValZnsv
            });
          });

          totalText = this.formatter.totalPrice(oModelData.SalesItems);

          totalServText = this.formatter.totalServ(oCreatedEntry.SalesOrderItemSetNavig.results);
          this.getView().byId("textValorServico").setText(totalServText);

          totServSoma = this.formatter.totalServ(tValue);
          //totServSoma = parseFloat(totalText) + parseFloat(totalServText);
          //this.getView().byId("textValorTotServ").setText(totServSoma);
          if (sTipoExecucao != "S") {
            var iTotalItens = oModelData.SalesItems.length;
            var iTotalRemov = aItensRemoved.length;

            if (iTotalItens === iTotalRemov) {
              aItensRemoved = [];

              MessageBox.success("OV " + oModelData.SalesOrder + " eliminada com sucesso!", {
                onClose: function() {
                  oController.onNavBack();
                }
              });

              return;
            }

            aItensRemoved.forEach(function(item) {
              totalText -= parseFloat(item.ValorTotItem);
            });
          }

          aItensRemoved = [];

          var aDataRetorno = success.data.SalesOrderItemSetNavig.results;
          var aSalesItems = this.getModel("SalesModel").getData().SalesItems;
          aSalesItems.forEach(function(oItemProcess) {
            if (!oItemProcess.Deleted) {
              aDataRetorno.forEach(function(oItemReturn) {
                if (oItemReturn.Item == oItemProcess.Item && oItemReturn.Material === oItemProcess.Material && oItemReturn.Centro ===
                  oItemProcess.Centro && oItemReturn.Frete === oItemProcess.Frete && parseFloat(oItemReturn.Quantidade, 10) ==
                  parseFloat(oItemProcess.Qtd.toString().replace(",", "."))) {
                  oItemProcess.PrecoTbSemIPI = oItemReturn.ValPrecoT;
                  oItemProcess.PrecoNegComIPI = oItemReturn.ValZvti;
                  oItemProcess.Markup = oItemReturn.ValZmkp === 9999 ? 0 : oItemReturn.ValZmkp;
                  oItemProcess.PrecoNegSemIPI = parseFloat(oItemReturn.PrecoSugerido);
                  oItemProcess.DescPercentual = parseFloat(oItemReturn.ValZvnd).toFixed(2);
                  oItemProcess.PrecoTarget = oItemReturn.VlPrecoTarget;
                  oItemProcess.ValorTotItem = oItemReturn.ValorTotalItem;
                  oItemProcess.ValorST = oItemReturn.ValSt;
                  oItemProcess.dtconfirmada = oItemReturn.dtconfirmada;
                }
              });
            }
          });
          this.getModel("SalesModel").refresh(true);

          var hdrMessage = success.headers["sap-message"];
          var hdrMessageObject = JSON.parse(hdrMessage);
          var sMessage = [];
          sMessage.push(hdrMessageObject.message);
          hdrMessageObject.details.forEach(function(item_detail) {
            sMessage.push(item_detail.message);
          });

          var box1 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start,
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
          })
          var texto_button = '';
          var text1 = new sap.m.Label({
            text: "N° OV"
          });
          var text2 = new sap.m.Label({
            text: "Emissor"
          });
          var text3 = new sap.m.Label({
            text: "Valor"
          });
          var text4 = new sap.m.Label({
            text: "Processamento"
          });
          if (sTipoExecucao == 'B') {
            box1.addItem(text1);
            box1.addItem(text2);
            box1.addItem(text3);
            box1.addItem(text4);
          }
          var boxPai = new sap.m.HBox({
            width: "auto",
            fitContainer: false,
            direction: sap.m.FlexDirection.Column,
            alignItems: sap.m.FlexAlignItems.Start,
          });
          var box2 = [];

          sMessage.forEach(function(texto) {
            if (sTipoExecucao == 'C') {
              texto_button = 'R$ ' + texto.split(" ")[8].substring(0, texto.split(" ")[8].length - 2).replace(".", ",");
              box2.push(new sap.m.HBox({
                width: "100%",
                alignContent: sap.m.FlexAlignContent.SpaceBetween,
                direction: sap.m.FlexDirection.Row,
                alignContent: sap.m.FlexAlignContent.Stretch,
                alignItems: sap.m.FlexAlignItems.Center,
                justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                items: [
                  new sap.m.Link({
                    text: texto.split(" ")[3],
                    press: [oController.handleLinkPress, oController]
                  }),
                  new Text({
                    text: oController.byId("input-Codigo").getText()
                  }),
                  new Text({
                    text: 'R$ ' + texto.split(" ")[8].substring(0, texto.split(" ")[8].length - 2).replace(".", ",")
                  }),
                  new Text({
                    text: texto.split(texto.split(" ")[8])[1]
                  })
                ]
              }))
              boxPai.addItem(box1);
            } else {
              var texto_valor = '';
              var texto_inf = '';
              if (texto.split("(a)")[1]) {
                texto_valor = parseFloat(texto.split("(a)")[1].split(" ")[2]).toFixed(2);
                texto_inf = texto.split("(a)")[1].split("ini")[1];
                if (!texto_inf) {
                  texto_inf = texto.split("(a)")[1].split("Ordem")[1];
                  texto_inf = texto_inf.replace("gerada", "alterada")
                }
              }
              var nro_text = '';
              if (texto.indexOf("NFCe") != -1) {
                nro_text = texto.split(" ")[2]
              } else {
                var sOv = texto.split(" ")[0];
                nro_text = texto.split(" ")[3];
                nro_text = sOv + " " + nro_text;
              }
              box2.push(new sap.m.HBox({
                width: "100%",
                alignContent: sap.m.FlexAlignContent.SpaceBetween,
                direction: sap.m.FlexDirection.Row,
                alignItems: sap.m.FlexAlignItems.Right,
                justifyContent: sap.m.FlexJustifyContent.SpaceAround,
                items: [
                  new Text({
                    text: nro_text
                  }),
                  new Text({
                    text: oController.byId("input-Codigo").getText()
                  }),
                  new Text({
                    text: 'R$ ' + texto_valor
                  }),
                  new Text({
                    text: texto_inf
                  })
                ]
              }))
            }
          });
          box2.forEach(function(box) {
            boxPai.addItem(box);
          });

          var dialog = new Dialog({
            title: 'Resultado do processamento',
            type: 'Message',
            contentWidth: '100%',
            content: boxPai,
            beginButton: new Button({
              text: 'OK',
              press: function() {
                if (oController.getModel("SalesModel").getData().Mode != 'Change') {
                  oController.onLimparTela();
                  oController.onLimparTela();
                } else {
                  oController.getModel("SalesModel").getData().EditVisible = true;
                  oController.getModel("SalesModel").getData().FunctionsVisible = true;
                  oController.getModel("SalesModel").getData().CancelVisible = false;
                  oController.getModel("SalesModel").getData().Changeable01 = false;
                  oController.getModel("SalesModel").getData().Changeable02 = false;
                  oController.getModel("SalesModel").refresh(true);
                  oController._loadSalesOrder(oModelData.SalesOrder);
                }
                dialog.close();
                oController.onResetCart();
              }
            }),
            afterClose: function() {
              dialog.destroy();
            }
          });

          var link = new sap.m.Link({
            text: sMessage,
            press: [this.handleLinkPress, this]
          });

          if (hdrMessageObject.severity !== "error") {
            this.getModel("SalesModel").getData().DoNavigation = ((sTipoExecucao === "C" || sTipoExecucao === "A") && hdrMessageObject.severity !==
              "error");
            if (sTipoExecucao != 'S') {
              dialog.open();
            } else {
              MessageBox.success(sMessage[0], {
                onClose: function() {
                  dialog.destroy();
                }.bind(this),
                dialogId: "messageBoxId"
              });
            }
          } else {
            MessageBox.error(sMessage);
          }

          if (!this.getModel("SalesModel").getData().DoNavigation) {
            this.getModel("SalesModel").getData().FinalizeEnabled = (hdrMessageObject.severity !== "error");
            this.getModel("SalesModel").refresh(true);
          }
        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
          this._processarOVError(oEvent, oError, sTipoExecucao, sRegraTipo, oModelData);
        }.bind(this)
      });
    },

    _processarOVError: function(oEvent, oError, sTipoExecucao, sRegraTipo, oModelData) {
      var aSalesItems = this.getView().getModel("SalesModel").getData().SalesItems;
      var oErrorJson = JSON.parse(oError.responseText).error;
      var sMessage = "";

      if (oErrorJson.innererror && oErrorJson.innererror.errordetails) {
        var aErrorDetails = oErrorJson.innererror.errordetails;

        aErrorDetails.forEach(function(e) {
          sMessage += (e.message + "\n");
        });
      }

      var isPoliticaComercial = sMessage.includes("Política Comercial");

      if (!isPoliticaComercial) {
        sMessage = JSON.parse(oError.responseText).error.message.value;
      }

      var n = sMessage.includes('gravado');
      if (!n) {
        aSalesItems.forEach(function(oItemProcess) {
          oItemProcess.PrecoNegComIPI = oItemProcess.PrecoNegComIPI;
          oItemProcess.Markup = oItemProcess.Markup === 9999 ? 0 : oItemProcess.Markup;
          oItemProcess.DescPercentual = oItemProcess.DescPercentual;
          oItemProcess.PrecoTarget = oItemProcess.PrecoTarget;
          oItemProcess.ValorTotItem = oItemProcess.ValorTotItem;
          oItemProcess.ValorST = oItemProcess.ValorST;
        });
        this.getView().getModel("SalesModel").refresh(true);
      }

      if (n) {
        MessageBox.success(sMessage, {
          onClose: function() {
            this._loadSalesOrder(oModelData.SalesOrder);
          }.bind(this),
          dialogId: "messageBoxId"
        });
        oModelData = this.getModel("SalesModel").getData();
        oModelData.CalculateVisible = false;
        oModelData.LiberaUnFre = false;
        oModelData.LiberaUnFre2 = false; //DMND0021249 - 04.08.2022 - FLS
        oModelData.LiberaUnFreBtn = false; //DMND0021249 - 04.08.2022 - FLS
        oModelData.FinalizeVisible = false;
        oModelData.EditVisible = true;
        oModelData.FunctionsVisible = true;
        oModelData.CancelVisible = false;
        oModelData.Changeable01 = false;
        oModelData.Changeable02 = false;

        this.getView().getModel("SalesModel").refresh(true);
        this._loadSalesOrder(oModelData.SalesOrder);
      } else {
        if (isPoliticaComercial && sRegraTipo === "W") {
          // Mensagem da Política Comercial configurada como Warning
          MessageBox.show(
            sMessage, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: ["Salvar", "Cancelar"],
              onClose: function(oAction) {
                if (oAction === "Salvar") {
                  if (this._validarOV()) {
                    this._processarOV(oEvent, sTipoExecucao, "");
                  }
                }
              }.bind(this)
            }
          );
        } else {
          MessageBox.error(sMessage, {
            onClose: function() {}.bind(this),
            dialogId:   "messageBoxId"
          });
        }
      }
    },

    handleLinkPress: function(oEvent) {
      var teste = oEvent.getSource().mProperties.text + "&&&" + this.getView().byId("input-Codigo").getText().replace('/', '&&&&&');

      this.getOwnerComponent().getRouter().navTo("Vendas", {
        mode: "Change",
        salesorder: teste
      }, true);
      oEvent.getSource().getParent().getParent().getParent().close()
    },

    onFinalizar: function(oEvent) {
      var oModelData = this.getModel("SalesModel").getData();
      var thisv = this;
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente finalizar a venda?'
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
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              if (thisv._validarOV()) {
                //                thisv._processarOV(oEvent, (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "C" : "A"));
                thisv._regraPoliticaComercial(oEvent, (oModelData.Mode === "Create" || oModelData.Mode === "Copy" ? "C" : "A"));
              }
            };
          }
        }
      );
    },

    _regraPoliticaComercial: function(sEvent, sTipoExecucao) {
      var onSuccess = function(oResult, oResponse) {
        var oRegra = oResult.results[0];
        var sTipo = "";

        if (oRegra) {
          sTipo = oRegra.Tipo;
        }

        this._processarOV(sEvent, sTipoExecucao, sTipo);
      }.bind(this);

      var onError = function(oError) {
        this.getView().setBusy(false);
      }.bind(this);

      this.getModel().read("/PoliticaComercialSet", {
        success: onSuccess,
        error: onError
      });
      this.getView().setBusy(true);
    },

    _validarOV: function() {

      var bValid = true;
      var bValidationError = false;
      var oModelData = this.getModel("SalesModel").getData();

      // Tipo de Operação "id-ComboEntrega",
      var aFields = ["id-ComboTipoOperacao", "input-Cliente",
        "id-ComboEscritorio", "input-DtDEntrega", "id-ComboCondPgto", "id-ComboCanal",
      ];

      if (this.byId("id-ComboTransportador").getSelectedKey().length > 0) {
        aFields.push("nomeCarrier");
        aFields.push("tipoDocCarrier");
        aFields.push("cepCarrier");
        aFields.push("ruaCarrier");
        aFields.push("numeroCarrier");
        aFields.push("bairroCarrier");
        aFields.push("cidadeCarrier");
        aFields.push("carrierIE");
        aFields.push("cpfcnpjCarrier");
        aFields.push("estadoCarrier");

        //if (oModelData.CarrierPermitirCIF){
        //  aFields.push("placaCarrier");
        //  aFields.push("anttCarrier");
        //  aFields.push("estadosCarrier");
        //}

      } else {
        this.byId("nomeCarrier").setValueState("None");
        this.byId("tipoDocCarrier").setValueState("None");
        this.byId("cepCarrier").setValueState("None");
        this.byId("ruaCarrier").setValueState("None");
        this.byId("numeroCarrier").setValueState("None");
        this.byId("bairroCarrier").setValueState("None");
        this.byId("cidadeCarrier").setValueState("None");
        this.byId("placaCarrier").setValueState("None");
        this.byId("anttCarrier").setValueState("None");
        this.byId("carrierIE").setValueState("None");
        this.byId("cpfcnpjCarrier").setValueState("None");
        this.byId("estadoCarrier").setValueState("None");
        this.byId("estadosCarrier").setValueState("None");
      }

      aFields.forEach(function(sInput) {
        bValidationError = this._validarEntrada(this.byId(sInput)) || bValidationError;
      }, this);

      bValid = !bValidationError;

      // Itens
      if (bValid) {
        if (oModelData.SalesItems.length > 0) {
          for (var iItem in oModelData.SalesItems) {
            if (!bValid) {
              break;
            }
            var oItem = oModelData.SalesItems[iItem];
            // PrecoNegSemIPIState / Text
            oItem.PrecoNegSemIPIState = (isNaN(oItem.PrecoNegSemIPI) ? "Error" : oItem.PrecoNegSemIPI < 0 ? "Error" : "None");
            oItem.PrecoNegSemIPIStateText = (isNaN(oItem.PrecoNegSemIPI) || oItem.PrecoNegSemIPI < 0 ?
              "Informar um valor válido para este item" : "");
            // DescPercentualState / Text
            oItem.DescPercentualState = (isNaN(oItem.DescPercentual) ? "Error" : oItem.DescPercentual < 0 ? "Error" : "None");
            oItem.DescPercentualStateText = (isNaN(oItem.DescPercentual) || oItem.DescPercentual < 0 ?
              "Informar um valor válido para este item" : "");
            bValid = oItem.PrecoNegSemIPIState !== "Error" && oItem.DescPercentualState !== "Error";
            oItem.Frete = oModelData.SalesFrete;
            if (bValid) {
              //
            }
          }
          if (!bValid) {
            MessageBox.error("Corrigir os itens para executar esta funcionalidade!");
          }

          //*>>> 7000010566: D0018131- Correção data confirmada - 20.08.2021
          if (oModelData.SalesOrder) {
            var sDtConfirmada;

            oModelData.SalesItems.forEach((e) => {
              if (!e.Deleted && e.dtconfirmada) {
                if (!sDtConfirmada) {
                  sDtConfirmada = e.dtconfirmada;
                } else {
                  var dataConfirmada = e.dtconfirmada.replaceAll(".", "/");

                  if (sDtConfirmada !== dataConfirmada) {
                    bValid = false;
                    MessageBox.error(
                      "Impossível seguir com alteração. Material (ais) com data(s) de confirmação diferentes dos itens já gravados na OV");
                  }
                }
              }
            });
          }
          //*<<< 7000010566: D0018131- Correção data confirmada - 20.08.2021
          
          
          //*>>> 7000015098- DMND0025261-Inf. logística na OV - 18.04.2022
          var itemInvalido = oModelData.SalesItems.find(e => { return e.PermiteTipo && !e.Tipo });
          if (itemInvalido) {
        	  MessageBox.error('Preencher o campo tipo para o item: ' + itemInvalido.Item);
        	  bValid = false;
          }          
          //*<<< 7000015098- DMND0025261-Inf. logística na OV - 18.04.2022

          
          this.getView().getModel("cartProducts").refresh(true);
        } else {
          bValid = false;
          MessageBox.error("Inserir ao menos um item para executar esta funcionalidade!");
        }
      } else {
        MessageBox.error("Preencher todos os campos obrigatórios");
      }
      this.getModel("SalesModel").refresh(true);

      return bValid;
    },

    _validarEntrada: function(oInput) {

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

    onDeleteSalesItem: function(oEvent) {
    	var oSource = oEvent.getSource();
    	var sPath   = oSource.getParent().getBindingContextPath();
    	var oModel  = this.getModel("SalesModel");
    	var oItem   = oModel.getProperty(sPath);
  	
//      var produto = oEvent;
//      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());

	    MessageBox.confirm("Confirma exclusão do produto?", {
	        icon: sap.m.MessageBox.Icon.CONFIRMATION,
	        title: "Exclusão do produto",
	        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
	        onClose: function(oAction) {
	        	if (oAction === sap.m.MessageBox.Action.YES) {
	        		this._validaExclusaoItemOV(oItem)
	        	}
	        }.bind(this)
	    });
    },

    onEfetuarFaturamento: function() {
      var aSalesBatches = [];
      var oSalesData = this.getView().getModel("SalesModel").getData();
      var bBatchControl = oSalesData.SalesItems.some(function(oItem) {
        return oItem.Lote;
      });
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente faturar ordem?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      this.getView().setBusy(true);
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              if (bBatchControl) {
                oview._geraRemessa(oSalesData.SalesOrder, oSalesData.MercadoriaDate);
              } else {
                oview._createBillingDocument(oSalesData.SalesOrder, aSalesBatches, oSalesData.MercadoriaDate);
              }
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    _geraRemessa: function(sSalesOrder, smercadoria) {
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        OrdemVenda: sSalesOrder,
        TpExecucao: "L",
        Mercadoria: smercadoria
      };
      var oview = this;
      var remessa_false = "";
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function(oData) {

          oData.__batchResponses[0].__changeResponses.forEach(function(oResponse) {
            if (oResponse.headers["custom-return"]) {
              var aMessage = [];
              var sIconType = "";
              var sIconColor = "";
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
              if (!oBillingReturn.fornecimento) {
                var sMessage = oview._convertMessage(oBillingReturn.message);
                aMessage = sMessage.split("-");
                aMessage[0] = aMessage[0].trim();
                if (aMessage.length > 1) {
                  aMessage[1] = aMessage[1].replace(/^\s+/, "");
                }
                if (aMessage[0] == "S") {
                  oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
                } else {
                  sap.m.MessageToast.show(aMessage[1]);
                  oview.getView().setBusy(false);
                  remessa_false = "X";
                  return false;
                }
              } else {
                oBillingData.Remessa = JSON.parse(oResponse.headers["custom-return"]).fornecimento;
              }
            }
          });

          if (remessa_false == "X") {
            return false;
          }
          this.getView().setBusy(false);
          this.getView().getModel("BillingModel").refresh(true);
          this._openChargControl();
        }.bind(this),
        error: function() {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
    },

    _loadZterm: function(tipo) {
      var aFilters = [];
      aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, tipo));
      this.getView().setBusy(true);
      this.getModel().read("/ztermSet", {
        filters: aFilters,
        success: function(oData) {
          this.getView().setBusy(false);
          var aComboCondPagto = [];
          oData.results.forEach(function(oEntry) {
            switch (oEntry.Codconsulta) {
              case "CP":
                aComboCondPagto.push({
                  Codconsulta: oEntry.Codconsulta,
                  Coddadomestre: oEntry.Coddadomestre,
                  Textodadomestre: oEntry.Textodadomestre
                });
                break;
            }
          });
          var oModelData = this.getModel("SalesModel").getData();
          oModelData.ComboCondPagto = aComboCondPagto;
          this.getModel("SalesModel").refresh(true);
        }.bind(this),
        error: function(erro) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    _openChargControl: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oSalesData = this.getModel("SalesModel").getData();
      // Filtro de Itens
      var oItem4Charg = oSalesData.SalesItems.filter(function(oItem) {
        return oItem.Lote;
      });
      // Matriz de Controle de Itens x Quantidade x Disponibilidade
      oBillingData.ChargItems = [];
      oItem4Charg.forEach(function(oItem) {
        oBillingData.ChargItems.push({
          Item: oItem.Item,
          Material: oItem.Material,
          Descricao: oItem.Descricao,
          Quantidade: oItem.Qtd,
          Centro: oItem.Centro,
          Unidade: oItem.Unidade,
          AvailableQuantity: oItem.Qtd,
          Attribuition: []
        });
        oBillingData.ChargItems[oBillingData.ChargItems.length - 1].Lotes = oSalesData.SalesCharges.filter(function(oSalesCharg) {
          return oSalesCharg.Item === oItem.Item;
        });
      });
      oBillingData.ItemPointer = 0;
      oBillingData.MaxItems = oItem4Charg.length - 1;
      oBillingData.CurrentItem = this._getItemCharg(0);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
      this._getChargDialog().open();
    },

    onFinishCharg: function() {
      // Valida se há algum item a ser validado
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oSalesData = this.getModel("SalesModel").getData();
      var bInvalid = oBillingData.ChargItems.some(function(oItem) {
        return oItem.AvailableQuantity > 0;
      });
      if (!bInvalid) {
        if (this._checkCurrentItem()) {
          var aSalesBatches = [];
          oBillingData.ChargItems.forEach(function(oItem) {
            oItem.Attribuition.forEach(function(oChargItem) {
              aSalesBatches.push({
                Item: oItem.Item,
                Id: oChargItem.Charg,
                Quantidade: oChargItem.Quantity,
                Unidade: oItem.Unidade
              });
            });
          });
          var box = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: 'Deseja realmente faturar ordem?'
              })
            ]
          });
          box.setModel(new sap.ui.model.json.JSONModel({
            message: ''
          }));
          var oview = this;
          this.getView().setBusy(true);
          sap.m.MessageBox.show(
            box, {
              icon: sap.m.MessageBox.Icon.INFORMATION,
              title: "ArcelorMittal",
              actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
              onClose: function(oAction) {
                if (oAction === sap.m.MessageBox.Action.YES) {
                  oview._createBillingDocument(oSalesData.SalesOrder, aSalesBatches);
                } else {}
              }
            });
        }
      } else {
        MessageBox.error("Ainda há itens a serem corrigidos");
      }
    },

    _setItemCharg: function(iItem, oItem) {
      this.getView().getModel("BillingModel").getData().ChargItems[iItem] = oItem;
      this.getView().getModel("BillingModel").refresh(true);
    },

    _getItemCharg: function(iItem) {
      var oItem = this.getView().getModel("BillingModel").getData().ChargItems[iItem];
      oItem.MaterialOut = oItem.Material.replace(oItem.Material.match("^0+(?!$)"), "");
      oItem.ChargAvlVisible = false;
      return this.getView().getModel("BillingModel").getData().ChargItems[iItem];
    },

    onChargSelection: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oChargData = oBillingData.CurrentItem.Lotes.find(function(oCharg) {
        return oCharg.Lote === oBillingData.CurrentItem.Charg;
      });
      var qtd = oChargData.Quantidade.replace(".", ",");
      oBillingData.CurrentItem.ChargAvailability = qtd;
      oBillingData.CurrentItem.ChargAvlVisible = true;
      this.getView().getModel("BillingModel").refresh(true);
    },

    _recalcQuantity2Insert: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var i = 0;
      oBillingData.CurrentItem.AvailableQuantity = oBillingData.CurrentItem.Quantidade;
      if (oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition.forEach(function(oCharg) {
          i = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", ".")) - oCharg.Quantity;
          i = Math.round(i * 1000) / 1000;
          oBillingData.CurrentItem.AvailableQuantity = i.toString();
        });
      }
      oBillingData.CurrentItem.Quantity = "";
    },

    onPreviousItem: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer > 0) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);

        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer -= 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    onNextItem: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (oBillingData.ItemPointer < oBillingData.MaxItems) {
        var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);

        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        oBillingData.ItemPointer += 1;
        oBillingData.CurrentItem = this._getItemCharg(oBillingData.ItemPointer);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.information("Último item já atingido");
      }
    },

    _checkCurrentItem: function() {
      var bValid = true;
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity);
      if (!fAvalbQty) {
        this._setItemCharg(oBillingData.ItemPointer, oBillingData.CurrentItem);
        this._recalcQuantity2Insert();
        this.getView().getModel("BillingModel").refresh(true);
      } else {
        MessageBox.error("Este item ainda possui quantidade a ser atribuída");
        bValid = false;
      }
      return bValid;
    },

    onAddCharg: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      if (!oBillingData.CurrentItem.Attribuition) {
        oBillingData.CurrentItem.Attribuition = [];
      }
      // Validação da Quantidade
      var fQuantity = parseFloat(oBillingData.CurrentItem.Quantity.replace(",", "."));
      var fAvalbQty = parseFloat(oBillingData.CurrentItem.AvailableQuantity.toString().replace(",", "."));
      var fAvalcQty = parseFloat(oBillingData.CurrentItem.ChargAvailability.replace(",", "."));
      if (fQuantity > 0) {
        if (fQuantity <= fAvalbQty) {
          // if (fQuantity <= parseFloat(oBillingData.CurrentItem.ChargAvailability)) {
          if (fQuantity <= fAvalcQty) {
            oBillingData.CurrentItem.Attribuition.push({
              Charg: oBillingData.CurrentItem.Charg,
              Lgort: oBillingData.CurrentItem.Centro,
              Available: oBillingData.CurrentItem.ChargAvailability,
              Quantity: fQuantity
            });
            this._recalcQuantity2Insert();
            this.getView().getModel("BillingModel").refresh(true);
          } else {
            MessageBox.error("Quantidade deve ser menor ou igual a quantidade lote");
          }
        } else {
          MessageBox.error("Quantidade deve ser menor ou igual a quantidade disponível");
        }
      } else {
        MessageBox.error("Quantidade deve ser maior que zero");
      }
    },

    onDeleteCharg: function(oEvent) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var oItem = oEvent.getSource().getParent();
      var iIndex = oEvent.getSource().getParent().getParent().indexOfItem(oItem);
      oBillingData.CurrentItem.Attribuition.splice(iIndex, 1);
      this._recalcQuantity2Insert();
      this.getView().getModel("BillingModel").refresh(true);
    },

    onCancelCharg: function() {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      var sGroupId = "1",
        sChangeSetId = "Create";
      var oBillingData = this.getView().getModel("BillingModel").getData();
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oPayload = {
        TpExecucao: "D",
        Remessa: oBillingData.Remessa
      };
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function(oData) {
          this.getView().setBusy(false);
        }.bind(this),
        error: function() {
          this.getView().setBusy(false);
        }.bind(this)
      }, this);
      this._oChargDialog.destroy();
      this._getChargDialog().close();
    },

    _createBillingDocument: function(sSalesOrder, aSalesBatches, smercadoria) {
      var oview = this;
      var sGroupId = "1",
        sChangeSetId = "Create";
      this._getChargDialog().setBusy(true);
      this.getView().getModel().setDeferredGroups([sGroupId]);
      var oSalesOrderData = this.getModel("SalesModel").getData();
      var oBillingData1 = this.getView().getModel("BillingModel").getData();
      if (!oBillingData1.Remessa) {
        var oPayload = {
          OrdemVenda: sSalesOrder,
          TpExecucao: "C",
          Mercadoria: smercadoria
        };
      } else {
        var oPayload = {
          OrdemVenda: sSalesOrder,
          TpExecucao: "F",
          Remessa: oBillingData1.Remessa,
          Mercadoria: smercadoria
        };
      };
      if (aSalesBatches && aSalesBatches.length > 0) {
        oPayload.ToLote = [];
        aSalesBatches.forEach(function(oItemBatch) {
          oPayload.ToLote.push({
            Item: oItemBatch.Item,
            Id: oItemBatch.Id,
            Quantidade: parseFloat(oItemBatch.Quantidade).toFixed(3).toString(),
            Unidade: oItemBatch.Unidade
          });
        });
      }
      this.getView().getModel().create("/FaturamentoSet", oPayload, {
        groupId: sGroupId
      }, {
        changeSetId: sChangeSetId
      });
      this.getView().setBusy(true);
      this.getView().getModel().submitChanges({
        groupId: sGroupId,
        changeSetId: sChangeSetId,
        success: function(oData) {
          this.getView().setBusy(false);
          this._getChargDialog().setBusy(false);
          var oBillingData = this.getView().getModel("BillingModel").getData();
          oBillingData.Log = [];
          oData.__batchResponses[0].__changeResponses.forEach(function(oResponse) {
            if (oResponse.headers["custom-return"]) {
              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]);
              var aMessage = [];
              var sIconType = "";
              var sIconColor = "";
              if (oBillingReturn.message.length > 0) {
                var sMessage = this._convertMessage(oBillingReturn.message);
                aMessage = sMessage.split("-");
                aMessage[0] = aMessage[0].trim();
                if (aMessage.length > 1) {
                  aMessage[1] = aMessage[1].replace(/^\s+/, "");
                }
                switch (aMessage[0]) {
                  case "S":
                    sIconType = "sap-icon://status-positive";
                    sIconColor = "LL1";
                    break;
                  case "I":
                    sIconType = "sap-icon://status-inactive";
                    sIconColor = "LL0";
                    break;
                  case "W":
                    sIconType = "sap-icon://status-critical";
                    sIconColor = "LL2";
                    break;
                  case "E":
                    sIconType = "sap-icon://status-error";
                    sIconColor = "LL3";
                    break;
                }
              }
              if (aMessage[0] === "S" && this._oChargDialog) {
                this._getChargDialog().close();
              }
              oBillingData.Log.push({
                SalesOrder: oBillingReturn.numOrdem,
                DeliveryDocument: (oBillingReturn.fornecimento ? oBillingReturn.fornecimento : ""),
                BillingDocument: (oBillingReturn.fatura ? oBillingReturn.fatura : ""),
                FiscalNote: (oBillingReturn.notaFiscal ? oBillingReturn.notaFiscal : ""),
                MessageType: sIconType,
                MessageColor: sIconColor,
                Message: (aMessage[1] ? aMessage[1] : "")
              });
            }
          }.bind(this));
          this.getView().getModel("BillingModel").refresh(true);
          this._getBillingLogDialog().open();
          oview._loadSalesOrder(oSalesOrderData.SalesOrder);
        }.bind(this),
        error: function() {
          this.getView().setBusy(false);
          oview._loadSalesOrder(oSalesOrderData.SalesOrder);
        }.bind(this)
      }, this);
    },

    _validaExclusaoItemOV: function(oItem) {
      var aFilters = [];
      var sOrdem = this.getView().getModel("SalesModel").getProperty("/SalesOrder");

      aFilters.push(new Filter("Docnum", FilterOperator.EQ, sOrdem));

      this.getView().setBusy(true);

      this.getView().getModel().read("/FloxoOvSet", {
        filters: aFilters,
        success: function(data, response) {
          this.getView().setBusy(false);

          var aFluxos = data.results;
          var sFornecimento = aFluxos.some(function(e) {
            return e.VbtypN === "J"
          });
          //        var oJsonModel = new sap.ui.model.json.JSONModel();
          //        oJsonModel.setJSON(data.results[0].json);
          //        var oObject = oJsonModel.getData()[0];
          //        if (oObject.fornecimento) {
          if (sFornecimento) {
            MessageBox.error("Item não pode ser excluído pois a ordem de venda já tem remessa e/ou fatura criada");
          } else {
            this._deleteProduct(oItem);
          }
        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    _deleteProduct: function(oItem) {
//      var iIndex = oEvent;
//      var iLinetoDel = iIndex + 1;
      var iCounter   = 0;
      var oModelData = this.getModel("SalesModel").getData();
      oModelData.SalesItems.forEach(function(item) {
        if (!item.Deleted) {
          iCounter++;
        }
        if (item.Item === oItem.Item) {
//        if (iCounter === iLinetoDel) {
          item.Deleted = true;
          aItensRemoved.push(item);
        }
      });
      if (oModelData.Mode !== 'Change') {
        var y = 0;
        for (var x = 0; x < oModelData.SalesItems.length; x++) {
          if (oModelData.SalesItems[x].Deleted) {
            oModelData.SalesItems.splice(x, 1);
            for (var z = 0; z < oModelData.SalesItems.length; z++) {
              oModelData.SalesItems[z].Item = (y * 10) + 10;
              y += 1;
            }
          }
        }
      }

      this.getModel("SalesModel").refresh(true);
    },

    onDeletePagador: function() {
      sap.ui.getCore().byId("input-Pagador").setValue("");
      sap.ui.getCore().byId("input-PagadorCodigo").setValue("");
      sap.ui.getCore().byId("input-PagadorNome").setValue("");
    },

    onChangeMatriz: function(oEvent) {
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
          sap.ui.getCore().byId("input-Codcliente").getValue() + "')";
      }
      var thisview = this;
      oData.read(sPath, {
        success: function(oResult) {
          sap.ui.getCore().byId("input-PagadorCodigo").setValue(sInputValue);
          sap.ui.getCore().byId("input-PagadorNome").setValue(oResult.Nome);
          sap.ui.getCore().byId("input-Pagador").setValue("");
        },
        error: function(oResult) {
          // alert("Código do cliente não encontrado.")
        },
      });
    },

    buscaMatriz: function() {
      var tipo = sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey();
      var cpf = '';
      var cnpj = '';
      var oData = this.getView().getModel();
      var oDataPag = this.getView().getModel();
      var oView = this.getView();
      var filter;
      var filters = [];
      filter = new sap.ui.model.Filter("tipopessoa", sap.ui.model.FilterOperator.Contains, tipo);
      filters.push(filter);
      if (tipo == 'F') {
        cpf = this.utilFormatterCPFCNPJClear(sap.ui.getCore().byId("searchCnpjCpf").getValue());
        filter = new sap.ui.model.Filter("cpf", sap.ui.model.FilterOperator.Contains, cpf);
        filters.push(filter);
      } else if (tipo == 'G') {
        cpf = this.utilFormatterCPFCNPJClear(sap.ui.getCore().byId("searchCnpjCpf").getValue());
        filter = new sap.ui.model.Filter("cpf", sap.ui.model.FilterOperator.Contains, cpf);
        filters.push(filter);
      } else {
        cnpj = this.utilFormatterCPFCNPJClear(sap.ui.getCore().byId("searchCnpjCpf").getValue());
        filter = new sap.ui.model.Filter("cnpj", sap.ui.model.FilterOperator.Contains, cnpj);
        filters.push(filter);
      };
      var thisView = this;
      var onSuccess = function(odata) {
        oView.setBusy(false);
        if (odata.results[0].message == 'Sucesso') {
          sap.ui.getCore().byId("input-Matriz").setValue(odata.results[0].matriz);
          var sPathpag  =  "/ClientesSet(Codcliente='" + odata.results[0].matriz +
            "',Nome='',Cnpj='',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='" + sap.ui.getCore().byId("input-Codcliente").getValue() +
            "')";
          var sInputValue = odata.results[0].matriz;
          oDataPag.read(sPathpag, {
            success: function(oResult) {
              sap.ui.getCore().byId("input-PagadorCodigo").setValue(sInputValue);
              sap.ui.getCore().byId("input-PagadorNome").setValue(oResult.Nome);
              sap.ui.getCore().byId("input-Pagador").setValue("");
            },
            error: function(oResult) {
              // alert("Código do cliente não encontrado.")
            },
          });
        }
      };
      var onError = function(odata) {
        oView.setBusy(false);
      };

      oView.setBusy(true);
      var sPath = "/MatrizSet"

      oData.read(sPath, {
        filters: filters,
        success: onSuccess,
        error: onError
      });
    },

    liveChangeCobranca: function(oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      sInputValue = oEvent.target.value;

      var tipocli = '';
      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== sInputValue) {
        tipocli = 'O';
      }
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + sap.ui.getCore().byId("input-Codcliente").getValue() + "')";
      }

      var oTable = sap.ui.getCore().byId("listCobrancaMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataCobrancaMerc");

      oData.read(sPath, {
        success: function(oResult) {
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
        error: function(oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
        },
      });
    },

    liveChangeRecebedor: function(oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      var tipocli = '';
      sInputValue = oEvent.target.value;

      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== sInputValue) {
        if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "J") {
          tipocli = 'M';
        } else {
          tipocli = 'Q';
        }
      }
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + sap.ui.getCore().byId("input-Codcliente").getValue() + "')";
      }

      var oTable = sap.ui.getCore().byId("listRecebedorMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataRecebedorMerc");
      oData.read(sPath, {
        success: function(oResult) {
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
        error: function(oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
        },
      });
    },

    lonChangeMatriz: function(oEvent) {
      var sInputValue, sSearchField, sPath = "",
        fieldInput,
        codigo, nome, endereco, local, property1;
      var oData = this.getView().getModel();
      sInputValue = oEvent.target.value;
      fieldInput = oEvent.target.value;
      var tipocli = '';
      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "J") {
        tipocli = 'P';
      } else {
        tipocli = 'I';
      }
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        sPath  =  "/ClientesSet(Codcliente='" + sInputValue + "',Nome='',Cnpj='',Cpf='',Tipocliente='" + tipocli +
          "',Tipoclientesap='',codclicanal='" + sap.ui.getCore().byId("input-Codcliente").getValue() + "')";
      }
      var thisview = this;
      oData.read(sPath, {
        success: function(oResult) {
          sap.ui.getCore().byId("input-PagadorCodigo").setValue(sInputValue);
          sap.ui.getCore().byId("input-PagadorNome").setValue(oResult.Nome);
        },
        error: function(oResult) {
          var reader = JSON.parse(oResult.responseText);
          if (reader.error.message.value.search("Parceiro") != -1) {
            MessageBox.error("Parceiro não se encontra nos canais do Cliente Principal")
          } else {
            MessageBox.error(reader.error.message.value);
          }
          sap.ui.getCore().byId("input-Pagador").setValue('');
          sap.ui.getCore().byId("input-Matriz").setValue('');
        },
      });
      if (!$.isNumeric(sInputValue) || (sInputValue.length < 6)) {
        return false;
      } else if ($.isNumeric(sInputValue) && (sInputValue.length >= 7 || sInputValue.length <= 10)) {
        //this.buscaMatriz();
      }
    },

    _handleValueHelpClose: function(oEvent) {
      var oSelectedItem, fieldInput, aContexts, oModel;
      var bc, pos, codigo, nome, oTable, m, data, property1;
      var codigo, nome;
      var nomeSplit, localidadeSplit, enderecoSplit, localSplit, endereco, local;
      var oSelectedItem = oEvent.getParameter("selectedItem");
      var oModelData = this.getModel("SalesModel").getData();
      if (oSelectedItem) {
        fieldInput = this.getView().byId(this.inputId);
        if (fieldInput === undefined) {
          fieldInput = sap.ui.getCore().byId(this.inputId);
        }
        fieldInput.setValue(oSelectedItem.getDescription());
      }
      oEvent.getSource().getBinding("items").filter([]);
      if (this.inputId === "input-Contatos") {
        aContexts = evt.getParameter("selectedContexts");
        fieldInput.setValue("");
        nome = aContexts.map(
          function(oContext) {
            return oContext.getObject().Nome;
          }
        );
        var telefone = aContexts.map(
          function(oContext) {
            return oContext.getObject().Telefone;
          }
        );
        var email = aContexts.map(
          function(oContext) {
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
        var oTableData = sap.ui.getCore().byId("ListContatosChange");
        oTableData.setModel(oModel);
      }
      if (fieldInput.oParent.oParent.sId === "listRecebedorMerc") {
        fieldInput = sap.ui.getCore().byId(this.inputId);
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
        oTable = sap.ui.getCore().byId("listRecebedorMerc");
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
      if (this.inputId === "input-Pagador" || this.inputId ===
        "input-Matriz") {
        aContexts = oEvent.getParameter("selectedContexts");
        codigo = aContexts.map(
          function(oContext) {
            return oContext.getObject().Codcliente;
          }
        );
        nome = aContexts.map(
          function(oContext) {
            return oContext.getObject().Nome;
          }
        );
        sap.ui.getCore().byId("input-PagadorCodigo").setValue(codigo);
        sap.ui.getCore().byId("input-PagadorNome").setValue(nome);
      }
      if (this.inputId === "input-RecebedorFatura") {
        aContexts = oEvent.getParameter("selectedContexts");
        codigo = aContexts.map(
          function(oContext) {
            return oContext.getObject().Codcliente;
          }
        );
        nome = aContexts.map(
          function(oContext) {
            return oContext.getObject().Nome;
          }
        );
        sap.ui.getCore().byId("input-RecebedorFaturaCodigo").setValue(codigo);
        sap.ui.getCore().byId("input-RecebedorFaturaNome").setValue(nome);
      }
      if (fieldInput.oParent.oParent.sId === "listCobrancaMerc") {
        fieldInput = sap.ui.getCore().byId(this.inputId);
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
        oTable = sap.ui.getCore().byId("listCobrancaMerc");
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
      if (this.inputId === "__component0---vendas--input-Cliente") {
        if (oSelectedItem) {
          var oCustomerObject = oEvent.getParameter("selectedContexts")[0].getObject();
          oModelData.CustomerId = oCustomerObject.Codcliente;
          oModelData.CustomerName = oCustomerObject.Nome;
          oModelData.TaxDomcl = (oCustomerObject.Domiciliofiscal === "X" || oCustomerObject.Domiciliofiscal === "J" ? "X - Contribuinte" :
            "Z - Não-Contribuinte");
          oModelData.CustomerDoct = (oCustomerObject.Cpf && oCustomerObject.Cpf.length > 0 ? oCustomerObject.Cpf : oCustomerObject.Cnpj);
          oModelData.CustomerVisible = true;
          if (oModelData.SalesType === "2") {
            this.byId("label-CustomerDoct").setEnabled(false);
          } else {
            this.byId("label-CustomerDoct").setEnabled(false);
          }
          this.byId("input-Codigo").setText(oCustomerObject.Nome);
        }
        oEvent.getSource().getBinding("items").filter([]);
        this.getModel("SalesModel").refresh(true);
        this._loadCustomerHelpers();
      }
    },

    actionCadastro: function(oEvent) {
      valueHelpDialog1.open();
    },

    handleFecharPress: function() {
      this._oDialog4.close();
      this._oDialog4.destroy();
    },

    handleBoletoOVPress: function(oEvent) {
      this.aAllFilters = [];
      var oSalesOrderData = this.getModel("SalesModel").getData();
      var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: "dd/MM/yyyy"
      });
      var subFromDate = oDateFormat.format(new Date());
      this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oSalesOrderData.SalesOrder);
      this.aAllFilters.push(this.oFilter);
      this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
      this.aAllFilters.push(this.oFilter);
      var oview = this;
      this.aAllFilters.push(this.oFilter);
      this.getModel().read("/GerarBoletoOVVeriSet", {
        filters: this.aAllFilters,
        success: function(oData) {
          if (oData.results.length > 0) {
            MessageToast.show("Boleto Enviado a Impressora");
          } else {
            if (valueHelpDialogData) {
              valueHelpDialogData = null;
            }
            valueHelpDialogData = sap.ui.xmlfragment(
              "arcelor.view.DataPicker",
              oview
            );
            oview.getView().addDependent(valueHelpDialogData);
            oview.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oSalesOrderData.SalesOrder);
            oview.aAllFilters.push(oview.oFilter);
            oview.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
            oview.getModel().read("/GerarBoletoOvSet", {
              filters: oview.aAllFilters,
              success: function(oData) {
                if (oData.results.length > 0) {
                  var sheetNames;
                  sheetNames = '{"myList" : ['
                  for (var i = 0; i < oData.results.length; i++) {
                    var parcela = i + 1;
                    sheetNames += '{"Parcela" : "' + parcela.toString() + '","Name" : "' + parcela.toString() + '"}';
                    if (i + 1 != oData.results.length) {
                      sheetNames += ',';
                    }
                  }
                  sheetNames += ']}';
                  sheetNames = JSON.parse(sheetNames);
                  var sheets = new sap.ui.model.json.JSONModel(sheetNames);
                  var comboBox = sap.ui.getCore().byId("idParcelas");
                  comboBox.setModel(sheets);
                  comboBox.setSelectedKey(oData.results.length);
                  valueHelpDialogData.open();
                } else {
                  valueHelpDialogData.destroy();
                }
              },
              error: function(oData) {}
            });
          }
        },
        error: function(Error) {}
      });
    },

    handleCancelboletoPress: function() {
      valueHelpDialogData.close();
      valueHelpDialogData.destroy();
    },

    handleOkboletoPress: function() {
      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      if (sap.ui.getCore().byId("idStartDate").getDateValue()) {
        var oSalesOrderData = this.getModel("SalesModel").getData();
        valueHelpDialogData.close();
        var parcela_text = sap.ui.getCore().byId("idParcelas").getSelectedItem().getText();
        var date_time = sap.ui.getCore().byId("idStartDate").getDateValue();
        valueHelpDialogData.destroy();
        this.aAllFilters = [];
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd/MM/yyyy"
        });
        var subFromDate = oDateFormat.format(new Date(date_time));
        this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, oSalesOrderData.SalesOrder);
        this.aAllFilters.push(this.oFilter);
        this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, subFromDate);
        this.aAllFilters.push(this.oFilter);
        this.getModel().read("/GerarBoletoOvSet", {
          filters: this.aAllFilters,
          success: function(oData) {
            if (oData.results.length > 0) {

              var parcela = parseInt(parcela_text);
              parcela = parcela - 1;

              var mapForm = document.createElement("form");
              mapForm.target = "Map";
              mapForm.acceptCharset = "iso-8859-1"
              mapForm.method = "POST"; // or "post" if appropriate
              mapForm.action = "http://bms317/ConsultasBelgoNetQA/ScriptsArcelorMittal/boleto_vendas.asp";
              var mapInput = document.createElement("input");
              mapInput.type = "text";
              mapInput.name = "NAME";
              mapInput.value = oData.results[parcela].Name1;
              mapForm.appendChild(mapInput);
              var mapInput1 = document.createElement("input");
              mapInput1.type = "text";
              mapInput1.name = "BLDAT";
              mapInput1.value = oData.results[parcela].Bldat.substring(6, 8) + '/' + oData.results[parcela].Bldat.substring(4, 6) + '/' +
                oData.results[
                  parcela].Bldat.substring(0, 4);
              mapForm.appendChild(mapInput1);
              var mapInput2 = document.createElement("input");
              mapInput2.type = "text";
              mapInput2.name = "XBLNR";
              mapInput2.value = oData.results[parcela].Xblnr;
              mapForm.appendChild(mapInput2);

              var mapInput3 = document.createElement("input");
              mapInput3.type = "text";
              mapInput3.name = "BUZEI";
              mapInput3.value = oData.results[parcela].Buzei;
              mapForm.appendChild(mapInput3);

              var mapInput4 = document.createElement("input");
              mapInput4.type = "text";
              mapInput4.name = "DMBTR";
              mapInput4.value = oData.results[parcela].Dmbtr;
              mapForm.appendChild(mapInput4);

              var mapInput5 = document.createElement("input");
              mapInput5.type = "text";
              mapInput5.name = "STRAS";
              mapInput5.value = oData.results[parcela].Stras;
              mapForm.appendChild(mapInput5);

              var mapInput6 = document.createElement("input");
              mapInput6.type = "text";
              mapInput6.name = "ANFAE";
              mapInput6.value = oData.results[parcela].Anfae.substring(6, 8) + '/' + oData.results[parcela].Anfae.substring(4, 6) + '/' +
                oData.results[
                  parcela].Anfae.substring(0, 4);
              mapForm.appendChild(mapInput6);

              var mapInput7 = document.createElement("input");
              mapInput7.type = "text";
              mapInput7.name = "LAUFD";
              mapInput7.value = oData.results[parcela].Laufd.substring(6, 8) + '/' + oData.results[parcela].Laufd.substring(4, 6) + '/' +
                oData.results[
                  parcela].Laufd.substring(0, 4);
              mapForm.appendChild(mapInput7);

              var mapInput8 = document.createElement("input");
              mapInput8.type = "text";
              mapInput8.name = "PSTLZ";
              mapInput8.value = oData.results[parcela].Pstlz;
              mapForm.appendChild(mapInput8);

              var mapInput9 = document.createElement("input");
              mapInput9.type = "text";
              mapInput9.name = "ORT01";
              mapInput9.value = oData.results[parcela].Ort01;
              mapForm.appendChild(mapInput9);

              var mapInput10 = document.createElement("input");
              mapInput10.type = "text";
              mapInput10.name = "STCD1";
              mapInput10.value = oData.results[parcela].Stcd1;
              mapForm.appendChild(mapInput10);

              var mapInput11 = document.createElement("input");
              mapInput11.type = "text";
              mapInput11.name = "UBKNT";
              mapInput11.value = oData.results[parcela].Ubknt;
              mapForm.appendChild(mapInput11);

              var mapInput12 = document.createElement("input");
              mapInput12.type = "text";
              mapInput12.name = "UBKON";
              mapInput12.value = oData.results[parcela].Ubkon;
              mapForm.appendChild(mapInput12);

              var mapInput13 = document.createElement("input");
              mapInput13.type = "text";
              mapInput13.name = "UBKON_AUX";
              mapInput13.value = oData.results[parcela].UbkonAux;
              mapForm.appendChild(mapInput13);

              var mapInput14 = document.createElement("input");
              mapInput14.type = "text";
              mapInput14.name = "UBNKL";
              mapInput14.value = oData.results[parcela].Ubnkl;
              mapForm.appendChild(mapInput14);

              var mapInput15 = document.createElement("input");
              mapInput15.type = "text";
              mapInput15.name = "BARCODE";
              mapInput15.value = oData.results[parcela].Barcode;
              mapForm.appendChild(mapInput15);

              var mapInput16 = document.createElement("input");
              mapInput16.type = "text";
              mapInput16.name = "NOSSO";
              mapInput16.value = oData.results[parcela].Nosso;
              mapForm.appendChild(mapInput16);

              var mapInput17 = document.createElement("input");
              mapInput17.type = "text";
              mapInput17.name = "CARTEIRA";
              mapInput17.value = oData.results[parcela].Carteira;
              mapForm.appendChild(mapInput17);

              var mapInput18 = document.createElement("input");
              mapInput18.type = "text";
              mapInput18.name = "JUROS";
              mapInput18.value = oData.results[parcela].Juros;
              mapForm.appendChild(mapInput18);

              var mapInput19 = document.createElement("input");
              mapInput19.type = "text";
              mapInput19.name = "CEDENTE";
              mapInput19.value = oData.results[parcela].Cedente;
              mapForm.appendChild(mapInput19);

              var mapInput20 = document.createElement("input");
              mapInput20.type = "text";
              mapInput20.name = "VENC";
              mapInput20.value = oData.results[parcela].Venc.substring(6, 8) + '/' + oData.results[parcela].Venc.substring(4, 6) + '/' +
                oData.results[
                  parcela].Venc.substring(0, 4);
              mapForm.appendChild(mapInput20);

              var mapInput21 = document.createElement("input");
              mapInput21.type = "text";
              mapInput21.name = "CIP";
              mapInput21.value = oData.results[parcela].Cip;
              mapForm.appendChild(mapInput21);

              var mapInput22 = document.createElement("input");
              mapInput22.type = "text";
              mapInput22.name = "INSTRUCAO";
              mapInput22.value = oData.results[parcela].Instrucao;
              mapForm.appendChild(mapInput22);

              var mapInput23 = document.createElement("input");
              mapInput23.type = "text";
              mapInput23.name = "INSTRUCAO2";
              mapInput23.value = oData.results[parcela].Instrucao2;
              mapForm.appendChild(mapInput23);

              var mapInput24 = document.createElement("input");
              mapInput24.type = "text";
              mapInput24.name = "HBKID";
              mapInput24.value = oData.results[parcela].Hbkid;
              mapForm.appendChild(mapInput24);

              var mapInput25 = document.createElement("input");
              mapInput25.type = "text";
              mapInput25.name = "empresa";
              mapInput25.value = oData.results[parcela].Bukrs;
              mapForm.appendChild(mapInput25);

              var mapInput26 = document.createElement("input");
              mapInput26.type = "text";
              mapInput26.name = "ABATIMENTO";
              mapInput26.value = oData.results[parcela].Abatimento;
              mapForm.appendChild(mapInput26);

              var mapInput27 = document.createElement("input");
              mapInput27.type = "text";
              mapInput27.name = "TXT_ABATIM";
              mapInput27.value = oData.results[parcela].TxtAbatim;
              mapForm.appendChild(mapInput27);

              var mapInput28 = document.createElement("input");
              mapInput28.type = "hidden";
              mapInput28.name = "ENDERECO";
              mapInput28.value = oData.results[parcela].Zendereco;
              mapForm.appendChild(mapInput28);

              var mapInput28 = document.createElement("input");
              mapInput28.type = "text";
              mapInput28.name = "CNPJ";
              mapInput28.value = oData.results[parcela].Zcnpj;
              mapForm.appendChild(mapInput28);

              mapForm.appendChild(mapInput23);
              document.body.appendChild(mapForm);
              mapForm.submit();

            } else {
              MessageToast.show("Selecione uma loja");
            }
          },
          error: function(oError) {
            MessageToast.show(oError);
          }
        });

        valueHelpDialogData.destroy();

      } else {
        MessageToast.show("Selecione uma loja");
      }
    },

    handleExibirFluxoPress: function() {
      this._showDialogFluxos();

      //      var oSalesOrderData = this.getModel("SalesModel").getData();
      //      var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
      //      var view = this;
      //      var onSuccess = function (odata) {
      //        var oModel = new JSONModel($.parseJSON(odata.results[0].json));
      //        if (view._oDialog4) {
      //          view._oDialog4.destroy();
      //        }
      //&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\&nbsp;
      //        view._oDialog4 = sap.ui.xmlfragment("arcelor.view.remessa", view);
      //        view._oDialog4.setModel(oModel);
      //        view._oDialog4.open();
      //      };
      //      var onError = function (odata) {}
      //      var aFilters = [];
      //      aFilters.push(new Filter("ordem", FilterOperator.EQ, oSalesOrderData.SalesOrder));
      //      this.getModel().read("/FloxoOvSet", {
      //        filters: aFilters,
      //        success: onSuccess,
      //        error: onError
      //      });
    },

    handleEliminarOVPress: function() {
      MessageBox.confirm('Confirma a eliminação da OV?', {
        title: 'Confirmar',
        onClose: function(oAction) {
          if (oAction == 'OK') {
            var sVbeln = this.getModel("SalesModel").getProperty("/SalesOrder");
            this._eliminarOV(sVbeln);
          }
        }.bind(this),
        initialFocus: 'CANCEL'
      });
    },

    _eliminarOV: function(sVbeln) {
      this.getView().setBusy(true);
      var oParameters = {
        Vbeln: sVbeln
      };
      this.getModel().callFunction("/EliminarOV", {
        method: "GET",
        urlParameters: oParameters,
        success: function(oData) {
          this.getView().setBusy(false);
          MessageBox.information(oData.Message, {
            title: "ArcelorMittal",
            styleClass: "sapUiSizeCompact"
          });
        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    handleLiberarParaRemessaPress: function() {
      var oview = this;
      var oSalesOrderData = this.getModel("SalesModel").getData();
      var oData = {
        "ordem": oSalesOrderData.SalesOrder
      };
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente liberar remessa?'
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
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().create("/RemessaPOvSet", oData, {
                success: function(oCreatedEntry, success) {
                  var hdrMessage = success.data.retorno;
                  var sMessage = hdrMessage;
                  MessageBox.show(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview),
                error: function(oError) {
                  oview.getView().setBusy(false);
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    handleLiberarRemessaPress: function() {
      var oview = this;
      var oSalesOrderData = this.getModel("SalesModel").getData();
      this.getView().setBusy(true);
      var oData = {
        "ordem": oSalesOrderData.SalesOrder
      };
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente liberar remessa?'
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
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().create("/RemessaSet", oData, {
                success: function(oCreatedEntry, success) {
                  oview.getView().setBusy(false);
                  var hdrMessage = success.data.retorno;
                  var sMessage = hdrMessage;
                  MessageBox.show(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview),
                error: function(oError) {
                  oview.getView().setBusy(false);
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    onLiberarLimbo: function() {
      var oSalesOrderData = this.getModel("SalesModel").getData();
      var oData = {
        "Ordemvenda": oSalesOrderData.SalesOrder
      };
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente ordem do limbo?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      this.getView().setBusy(true);
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().create("/LimboSet", oData, {
                success: function(oCreatedEntry, success) {
                  oview.getView().setBusy(false);
                  var aHeaderMessage = success.headers["sap-message"];
                  var oMessageObject = JSON.parse(aHeaderMessage);
                  var sMessage = oMessageObject.message;
                  MessageBox.success(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview),
                error: function(oError) {
                  oview.getView().setBusy(false);
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    onLiberarCredito: function() {
      var oSalesOrderData = this.getModel("SalesModel").getData();
      var oData = {
        "Ordemvenda": oSalesOrderData.SalesOrder
      };
      this.getView().setBusy(true);
      var box = new sap.m.VBox({
        items: [
          new sap.m.Text({
            text: 'Deseja realmente liberar crédito?'
          })
        ]
      });
      box.setModel(new sap.ui.model.json.JSONModel({
        message: ''
      }));
      var oview = this;
      sap.m.MessageBox.show(
        box, {
          icon: sap.m.MessageBox.Icon.INFORMATION,
          title: "ArcelorMittal",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              oview.getModel().create("/LiberarCreditoOVSet", oData, {
                success: function(oCreatedEntry, success) {
                  oview.getView().setBusy(false);
                  var aHeaderMessage = success.headers["sap-message"];
                  var oMessageObject = JSON.parse(aHeaderMessage);
                  var sMessage = oMessageObject.message;
                  MessageBox.success(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview),
                error: function(oError) {
                  oview.getView().setBusy(false);
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  MessageBox.error(sMessage, {
                    title: "ArcelorMittal",
                    styleClass: "sapUiSizeCompact"
                  });
                  oview._loadSalesOrder(oSalesOrderData.SalesOrder);
                }.bind(oview)
              });
            } else {
              oview.getView().setBusy(false);
            }
          }
        });
    },

    onConfirmPopup: function() {
      this._getBillingLogDialog().close();
      var oSalesOrderData = this.getModel("SalesModel").getData();
      this._loadSalesOrder(oSalesOrderData.SalesOrder);
    },

    _getBillingLogDialog: function(sTitle) {
      if (!this._oDialog1) {
        this._oDialog1 = sap.ui.xmlfragment("arcelor.view.FaturamentoLog", this);
        this.getView().addDependent(this._oDialog1);
      }

      this._oDialog1.setTitle(sTitle || "Log Faturamento");

      return this._oDialog1;
    },

    _getChargDialog: function() {
      if (!this._oChargDialog) {
        this._oChargDialog = sap.ui.xmlfragment("arcelor.view.FaturamentoLote", this);
        this.getView().addDependent(this._oChargDialog);
      }
      return this._oChargDialog;
    },

    _convertMessage: function(sMessage) {
      var tTextArea = document.createElement("textarea");
      tTextArea.innerHTML = sMessage;
      return tTextArea.value;
    },

    validaOvPagtoCartao: function(pSalesOrder) {
      var oData = this.getView().getModel();
      var sPath = "/ValidaOvPagtoCartaoSet(NumOrdem='" + pSalesOrder + "')";
      this.oValidaOvPagtoCartao = {};
      oData.read(sPath, {
        async: false,
        success: this.validaOvPagtoCartaoSucessoCb.bind(this),
        error: this.validaOvPagtoCartaoErroCb
      });
    },

    validaOvPagtoCartaoSucessoCb: function(oDataReturned) {
      this.oValidaOvPagtoCartao = {
        NumOrdem: oDataReturned.NumOrdem,
        Cliente: oDataReturned.Cliente,
        Condicao: oDataReturned.Condicao,
        Empresa: oDataReturned.Empresa,
        CodDist: oDataReturned.CodDist,
        Total: oDataReturned.Total,
        DataAtual: oDataReturned.DataAtual,
        HoraAtual: oDataReturned.HoraAtual,
        PagtoCartao: oDataReturned.PagtoCartao,
        ClassIdCartao: oDataReturned.ClassIdCartao,
        ClassIdMyBoxCC: oDataReturned.ClassIdMyBoxCC,
        Ip: oDataReturned.Ip,
        Mensagem: oDataReturned.Mensagem
      };
      if (this.oValidaOvPagtoCartao.ClassIdCartao) {
        document.getElementById("IQSign").setAttribute("classid", "clsid:" + this.oValidaOvPagtoCartao.ClassIdCartao);
      }
      if (this.oValidaOvPagtoCartao.ClassIdMyBoxCC) {
        document.getElementById("MyBoxCC").setAttribute("classid", "clsid:" + this.oValidaOvPagtoCartao.ClassIdMyBoxCC);
      }
    },

    validaOvPagtoCartaoErroCb: function(oError) {
      var sMessage = JSON.parse(oError.responseText).error.message.value;
      MessageToast.show(sMessage);
    },

    concluiProcessoSitef: function(pSalesOrder) {
      var oData = this.getView().getModel();
      var sPath = "/ProcessamentoPosSitefSet(" +
        "Nsusitef='" + document.getElementById("--sitef-nsuSitef").value + "'" +
        ",Nsuhost='" + document.getElementById("--sitef-nsuHostAutorizador").value + "'" +
        ",DataTransacao=datetime'" + document.getElementById("--sitef-dataHoraTransacao").value + "T00:00:00'" +
        ",Instituicao='" + document.getElementById("--sitef-nomeInstituicao").value + "'" +
        ",Estabelecimento='" + document.getElementById("--sitef-codigoEstabelecimento").value + "'" +
        ",CodRede='" + document.getElementById("--sitef-codigoRedeAutorizadora").value + "'" +
        ",OrdemVenda='" + pSalesOrder + "'" +
        ",Kunnr='" + this.oValidaOvPagtoCartao.Cliente + "'" +
        ",CondicaoPgto='" + this.oValidaOvPagtoCartao.Condicao + "'" +
        ",Valor='" + this.oValidaOvPagtoCartao.Total + "'" +
        ",ViaCliente1='" + document.getElementById("--sitef-primeiraViaCliente").value.slice(0, 250) + "'" +
        ",ViaCliente2='" + document.getElementById("--sitef-primeiraViaCliente").value.slice(250, 500) + "'" +
        ",ViaCliente3='" + document.getElementById("--sitef-primeiraViaCliente").value.slice(500, 750) + "'" +
        ",ViaCliente4='" + document.getElementById("--sitef-primeiraViaCliente").value.slice(750, 1000) + "'" +
        ",ViaCaixa1='" + document.getElementById("--sitef-segundaViaCaixa").value.slice(0, 250) + "'" +
        ",ViaCaixa2='" + document.getElementById("--sitef-segundaViaCaixa").value.slice(250, 500) + "'" +
        ",ViaCaixa3='" + document.getElementById("--sitef-segundaViaCaixa").value.slice(500, 750) + "'" +
        ",ViaCaixa4='" + document.getElementById("--sitef-segundaViaCaixa").value.slice(750, 1000) + "'" +
        ",CodAutorizacao='" + document.getElementById("--sitef-codAutorizacao").value + "')";
      this.oRetornoProcessoSitef = {};
      oData.read(sPath, {
        async: false,
        success: this.concluiProcessoSitefSucessoCb.bind(this),
        error: this.concluiProcessoSitefErroCb
      });
    },

    concluiProcessoSitefSucessoCb: function(oDataReturned) {
      var sMessage = "";
      this.oRetornoProcessoSitef = {
        NumFornecimento: oDataReturned.NumFornecimento,
        NumFatura: oDataReturned.NumFatura,
        Externo: oDataReturned.Externo,
        Docstat: oDataReturned.Docstat,
        Code: oDataReturned.Code,
        Mensagem: oDataReturned.Mensagem
      };
      if (this.oRetornoProcessoSitef.NumFornecimento && this.oRetornoProcessoSitef.NumFatura) {
        sMessage = "Fornecimento " + this.oRetornoProcessoSitef.NumFornecimento + " e Fatura " + this.oRetornoProcessoSitef.NumFatura +
          " gerados com sucesso.";
        MessageBox.success(sMessage, {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
      } else {
        sMessage = "Erro ao concluir o processo do SITEF no SAP:  " + this.oRetornoProcessoSitef.Mensagem;
        MessageBox.error(sMessage, {
          title: "ArcelorMittal",
          styleClass: "sapUiSizeCompact"
        });
      }
    },

    concluiProcessoSitefErroCb: function(oError) {
      var sMessage = JSON.parse(oError.responseText).error.message.value;
      MessageToast.show(sMessage);
    },

    onEfetuarPagamento: function() {
      var view = this;
      if (view._oDialog14) {
        view._oDialog14.destroy();
      }
      view._oDialog14 = sap.ui.xmlfragment("arcelor.view.PagamentoCartao", view);
      sap.ui.getCore().byId("textValorTotalVendapag").setText(this.getView().byId("textValorTotalVenda").getText());
      sap.ui.getCore().byId("input-Cliente_pag").setText(this.getView().byId("input-Codigo").getText());
      sap.ui.getCore().byId("input-ovPag").setText(this.getView().getModel('SalesModel').getData().SalesOrder);
      sap.ui.getCore().byId("input-condpag").setText(this.getView().byId("id-ComboCondPgto").getValue());

      // DMND0011793 - Interface maxiPago!
      // Buscar dados de contato do Cliente
      var aMaxiPagoFilters = [];

      aMaxiPagoFilters.push(new sap.ui.model.Filter(
        "Vbeln",
        sap.ui.model.FilterOperator.EQ,
        this.getView().getModel('SalesModel').getData().SalesOrder
      ));

      sap.ui.getCore().byId("inEmail").setBusy(true);
      sap.ui.getCore().byId("inTelefone").setBusy(true);

      view.getModel().read("/PagtoMaxiPagoSet", {
        filters: aMaxiPagoFilters,
        error: function(oData) {
          sap.ui.getCore().byId("inEmail").setBusy(false);
          sap.ui.getCore().byId("inTelefone").setBusy(false);
        },
        success: function(oData) {
          if (oData.results.length > 0) {
            sap.ui.getCore().byId("inEmail").setValue(oData.results[0].EmailAddr);
            sap.ui.getCore().byId("inTelefone").setValue(oData.results[0].Telf1);
          }
          sap.ui.getCore().byId("inEmail").setBusy(false);
          sap.ui.getCore().byId("inTelefone").setBusy(false);
        }
      });

      // Habilitar forma de pagamento
      sap.ui.getCore().byId("sfMaxiPago").setVisible(true);
      sap.ui.getCore().byId("btnCriarLinkMaxiPago").setVisible(true);
      sap.ui.getCore().byId("btnCancelar").setVisible(true);

      view._oDialog14.open();

    },

    onEfetuarPagamentoOld: function() {
      debugger;
      var oModelData = this.getModel("SalesModel").getData();
      this.getView().setBusy(true);
      this._validateSalesPayment(oModelData.SalesOrder).then(function(oReturn) {
        this.getView().setBusy(false);
        if (!oReturn || oReturn.Type !== "E") {} else {
          MessageBox.error(this._convertMessage(oReturn.Message));
        }
      }.bind(this)).catch(function() {
        this.getView().setBusy(false);
        MessageBox.error("Erro ao validar Ordem de Venda");
      }.bind(this));
    },

    _loadMasterData: function() {
      var filters = [];
      var filter = "";
      var filter1 = "";
      filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "OV;CD;SA;FR;CL;CN;UF;SI");
      filter1 = new sap.ui.model.Filter("Coddadomestre", sap.ui.model.FilterOperator.EQ, "X");
      filters.push(filter, filter1);
      var list = sap.ui.getCore().byId("input-dadosMestres");
      var binding = list.getBinding("items");
      binding.filter(filters);
    },

    _readListMasterData: function() {
      var aDataOrgVendas = []; // OV
      var aDataCanalDist = []; // CD
      var aDataSetorAtiv = []; // SA
      var aDataClassific = []; // CL
      var aDataCnae = []; // CN
      var aDataUf = []; // UF
      var aDataSetorInd = []; // SI
      if (aDataCargaDados === 0) {
        var table = sap.ui.getCore().byId("input-dadosMestres");
        var rowItems = table.getItems();
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
            if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
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
              Textodadomestre: Textodadomestre
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
        var oDataOrgVendas = sap.ui.getCore().byId("input-multiComboxOrganizacao");
        oDataOrgVendas.setModel(oModelOrgVendas);
        var oModelCanalDist = new sap.ui.model.json.JSONModel();
        oModelCanalDist.setSizeLimit(5000);
        oModelCanalDist.setData({
          modelDataCanalDist: aDataCanalDist
        });
        var oDataCanalDist = sap.ui.getCore().byId("input-multiComboxCanal");
        oDataCanalDist.setModel(oModelCanalDist);
        var oModelSetorAtiv = new sap.ui.model.json.JSONModel();
        oModelSetorAtiv.setSizeLimit(5000);
        oModelSetorAtiv.setData({
          modelDataSetorAtiv: aDataSetorAtiv
        });
        var oDataSetorAtiv = sap.ui.getCore().byId("input-multiComboxSetorAtividade");
        oDataSetorAtiv.setModel(oModelSetorAtiv);
        var oModelClassific = new sap.ui.model.json.JSONModel();
        oModelClassific.setSizeLimit(5000);
        oModelClassific.setData({
          modelDataClassific: aDataClassific
        });
        var oDataClassific = sap.ui.getCore().byId("input-Kukla");
        oDataClassific.setModel(oModelClassific);
        var oModelCnae = new sap.ui.model.json.JSONModel();
        oModelCnae.setSizeLimit(5000);
        oModelCnae.setData({
          modelDataCnae: aDataCnae
        });
        var oDataCnae = sap.ui.getCore().byId("input-Cnae");
        oDataCnae.setModel(oModelCnae);
        var oModelUf = new sap.ui.model.json.JSONModel();
        oModelUf.setSizeLimit(5000);
        oModelUf.setData({
          modelDataUf: aDataUf
        });
        var oDataUf = sap.ui.getCore().byId("input-Regiao");
        oDataUf.setModel(oModelUf);
        var oModelSetorInd = new sap.ui.model.json.JSONModel();
        oModelSetorInd.setSizeLimit(5000);
        oModelSetorInd.setData({
          modelDataSetorInd: aDataSetorInd
        });
        var oDataSetorInd = sap.ui.getCore().byId("input-SetorInd");
        oDataSetorInd.setModel(oModelSetorInd);
      }
    },

    onSearch: function(evt) {
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

      var combo = sap.ui.getCore().byId("combo-tipoPessoacadastro");
      if (combo.getSelectedKey() === "") {
        // limpar o cpf ou cnpj
        MessageBox.error("Informar Tipo Pessoa. ", {
          styleClass: "sapUiSizeCompact"
        });
        sap.ui.getCore().byId("combo-tipoPessoacadastro").focus();
        sap.ui.getCore().byId("searchCnpjCpf").setValue("");
        return;
      }
      // 0 - Cliente | 1 - Prospect
      var oRadioTipoCliente = 0;

      if (oRadioTipoCliente === 0) {
        tipoCliente = 'S';
      } else {
        tipoCliente = 'P';
      }
      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
        if ($.isNumeric(sInputValue) && sInputValue.length <= 11) {
          cpf = sInputValue;
          sap.ui.getCore().byId("label-Cnae").setRequired(false);
        } else {
          sap.ui.getCore().byId("searchCnpjCpf").setValue("");
          MessageBox.error("CPF inválido.", {
            styleClass: "sapUiSizeCompact"
          });
          return;
        }
      } else {
        if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
          cnpj = sInputValue;
          sap.ui.getCore().byId("label-Cnae").setRequired(true);
        } else {
          sap.ui.getCore().byId("searchCnpjCpf").setValue("");
          MessageBox.error("CPF / CNPJ inválido.", {
            styleClass: "sapUiSizeCompact"
          });
          return;
        }
      }
      oView = this.getView();

      var oData = this.getView().getModel();
      var tipoPessoa = sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey();
      var onError = function(odata, response) {
        valueHelpDialog1.setBusy(false);
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
        thisView._readListMasterData();
        sap.m.MessageBox.show(
          box, {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            onClose: function(oAction) {
              if (oAction === sap.m.MessageBox.Action.YES) {
                thisView._clearForm();
                sap.ui.getCore().byId("save").setVisible(true);
                thisView._fieldsDisableEnable("Edit");
                jQuery.sap.delayedCall(500, this, function() {
                  sap.ui.getCore().byId("input-nome").focus();
                });
                if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
                  sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey('Z');
                  sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey('X');
                  sap.ui.getCore().byId("input-SetorInd").setSelectedKey('1051');
                  sap.ui.getCore().byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                  sap.ui.getCore().byId("input-multiComboxCanal").addSelectedKeys('40');
                }
              } else {
                thisView.byId("save").setVisible(false);
                thisView.byId("cancel").setVisible(false);
                thisView._clearForm();
                thisView._fieldsDisableEnable("Cancel");
              }
              thisView.buscaMatriz();
            }
          }
        );
        oView.setBusy(false);
      };
      thisView._loadMasterData();
      thisView._readListMasterData();
      var onSuccess = function(odata) {
        valueHelpDialog1.setBusy(false);
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
                onClose: function(oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {

                    thisView._clearForm();
                    sap.ui.getCore().byId("save").setVisible(true);
                    sap.ui.getCore().byId("cancel").setVisible(true);
                    thisView._fieldsDisableEnable("Edit");
                    thisView._loadMasterData();
                    jQuery.sap.delayedCall(500, this, function() {
                      sap.ui.getCore().byId("input-nome").focus();
                    });
                    if (sap.ui.getCore().byId("combo-tipoPessoa").getSelectedKey() === "F" || sap.ui.getCore().byId("combo-tipoPessoa").getSelectedKey() ===
                      "G") {
                      sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey('Z');
                      sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey('X');
                      sap.ui.getCore().byId("input-SetorInd").setSelectedKey('1051');
                      sap.ui.getCore().byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                      sap.ui.getCore().byId("input-multiComboxCanal").addSelectedKeys("40");
                    }
                    if (sap.ui.getCore().byId("combo-tipoPessoa").getSelectedKey() === "F" || sap.ui.getCore().byId("combo-tipoPessoa").getSelectedKey() ===
                      'J') {
                      thisView.buscaMatriz();
                    }
                    sap.ui.getCore().byId("input-Codcliente").setValue(odata.Codcliente);
                    sap.ui.getCore().byId("searchCnpjCpf").setValue(odata.Cpf + odata.Cnpj);
                    sap.ui.getCore().byId("input-endereco").setValue(odata.Endereco);
                    sap.ui.getCore().byId("input-numero").setValue(odata.Numero);
                    sap.ui.getCore().byId("input-Complemento").setValue(odata.Complemento);
                    sap.ui.getCore().byId("input-Bairro").setValue(odata.Bairro);
                    sap.ui.getCore().byId("input-Cidade").setValue(odata.Cidade);
                    sap.ui.getCore().byId("input-Cep").setValue(odata.Cep);
                    sap.ui.getCore().byId("input-Cep").fireLiveChange();
                    sap.ui.getCore().byId("input-Regiao").setValue(odata.Regiao);
                    sap.ui.getCore().byId("input-Classifcli").setValue(odata.Classicli);
                    sap.ui.getCore().byId("input-nome").setValue(odata.Nome);
                    sap.ui.getCore().byId("input-Origem").setValue(odata.Origem);
                    sap.ui.getCore().byId("input-Matriz").setValue(odata.Clientematriz);
                    sap.ui.getCore().byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
                    sap.ui.getCore().byId("input-Email").setValue(odata.Email);
                    sap.ui.getCore().byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
                    sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal);
                    sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal);
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
                onClose: function(oAction) {
                  if (oAction === sap.m.MessageBox.Action.YES) {

                    thisView._clearForm();
                    sap.ui.getCore().byId("save").setVisible(true);
                    sap.ui.getCore().byId("cancel").setVisible(true);
                    thisView._fieldsDisableEnable("Edit");
                    thisView._loadMasterData();
                    jQuery.sap.delayedCall(2000, this, function() {
                      sap.ui.getCore().byId("input-nome").focus();
                    });
                    if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F" || sap.ui.getCore().byId(
                        "combo-tipoPessoacadastro").getSelectedKey() === "G") {
                      sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey('Z');
                      sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey('X');
                      sap.ui.getCore().byId("input-SetorInd").setSelectedKey('1051');
                      sap.ui.getCore().byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                      sap.ui.getCore().byId("input-multiComboxCanal").addSelectedKeys("40");
                    }
                    if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F" || sap.ui.getCore().byId(
                        "combo-tipoPessoacadastro").getSelectedKey() === 'J') {
                      thisView.buscaMatriz();
                    }
                    sap.ui.getCore().byId("input-Codcliente").setValue(odata.Codcliente);
                    sap.ui.getCore().byId("searchCnpjCpf").setValue(odata.Cpf + odata.Cnpj);
                    sap.ui.getCore().byId("input-endereco").setValue(odata.Endereco);
                    sap.ui.getCore().byId("input-numero").setValue(odata.Numero);
                    sap.ui.getCore().byId("input-Complemento").setValue(odata.Complemento);
                    sap.ui.getCore().byId("input-Bairro").setValue(odata.Bairro);
                    sap.ui.getCore().byId("input-Cnae").setSelectedKey(odata.Cnae);
                    sap.ui.getCore().byId("input-Regiao").setSelectedKey(odata.Regiao);
                    sap.ui.getCore().byId("input-Cidade").setValue(odata.Cidade);
                    sap.ui.getCore().byId("input-Cep").setValue(odata.Cep);
                    sap.ui.getCore().byId("input-Cep").fireLiveChange();
                    sap.ui.getCore().byId("input-Classifcli").setValue(odata.Classicli);
                    sap.ui.getCore().byId("input-nome").setValue(odata.Nome);
                    sap.ui.getCore().byId("input-Origem").setValue(odata.Origem);
                    sap.ui.getCore().byId("input-Matriz").setValue(odata.Clientematriz);
                    sap.ui.getCore().byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
                    sap.ui.getCore().byId("input-Email").setValue(odata.Email);
                    sap.ui.getCore().byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
                    sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal);
                    sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal);

                  }
                }

              });
          }
        }

      };

      valueHelpDialog1.setBusy(true);
      oView.setBusy(true);
      var sPath = "/ClientesSet(Codcliente='',Nome='',Cnpj='" + cnpj + "',Cpf='" + cpf + "',Tipocliente='" + tipoCliente +
        "',Tipoclientesap='" + tipoPessoa + "',codclicanal='')";
      oData.read(sPath, {
        success: onSuccess,
        error: onError
      });
    },

    handleTableDialogPress: function(oEvent) {
      if (!this._oDialog9) {
        this._oDialog9 = sap.ui.xmlfragment("arcelor.view.ClientesTableDialog", this);
      }
      this._oDialog9._oSearchField.oParent.setVisible(false);
      this._oDialog9._oCancelButton.mProperties.text = "Fechar";
      this.getView().addDependent(this._oDialog9);
      // toggle compact style
      jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog9);

      var sSearchFiled = 'Cnpj';
      // create a filter for the binding
      this._oDialog9.getBinding("items").filter(
        [new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, oEvent)]
      );
      // open value help dialog filtered by the input value
      this._oDialog9.open(oEvent);
    },

    handleTableClose: function(oEvent) {
      var thisView = this;
      var oData = this.getView().getModel();
      var onError = function(odata, response) {
        thisView.getView().setBusy(false);
      };
      var onSuccess = function(odata) {
        thisView.getView().setBusy(false);
        var cpf = "";
        var cnpj = "";
        cpf = thisView.utilFormatterCPFCNPJ(odata.Cpf, "F");
        cnpj = thisView.utilFormatterCPFCNPJ(odata.Cnpj, "J");
        jQuery.sap.delayedCall(2000, this, function() {
          thisView._readListMasterData();
        });
        sap.ui.getCore().byId("searchCnpjCpf").setValue(cpf + cnpj);
        sap.ui.getCore().byId("input-endereco").setValue(odata.Endereco);
        sap.ui.getCore().byId("input-numero").setValue(odata.Numero);
        sap.ui.getCore().byId("input-Complemento").setValue(odata.Complemento);
        sap.ui.getCore().byId("input-Bairro").setValue(odata.Bairro);
        sap.ui.getCore().byId("input-Cidade").setValue(odata.Cidade);
        sap.ui.getCore().byId("input-Cep").setValue(odata.Cep);
        sap.ui.getCore().byId("input-Cnae").setValue(odata.Cnae);
        sap.ui.getCore().byId("input-Classifcli").setValue(odata.Classicli);
        sap.ui.getCore().byId("input-nome").setValue(odata.Nome);
        sap.ui.getCore().byId("input-Origem").setValue(odata.Origem);
        sap.ui.getCore().byId("input-Matriz").setValue(odata.Clientematriz);
        sap.ui.getCore().byId("input-Telefone").setValue(thisView.utilFormatterTelefone(odata.Telefone));
        sap.ui.getCore().byId("input-Email").setValue(odata.Email);
        sap.ui.getCore().byId("input-InscricaoEstadual").setValue(odata.Inscrestadual);
        sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey(odata.Domiciliofiscal);
        sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey(odata.Gruposubfiscal);
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
        sap.ui.getCore().byId("input-Regiao").setSelectedKey(odata.Regiao);
        sap.ui.getCore().byId("input-Cnae").setSelectedKey(odata.Cnae);
        sap.ui.getCore().byId("input-SetorInd").setSelectedKey(odata.Setorindustrial);
        sap.ui.getCore().byId("input-RecebedorCodigo").setValue(odata.Recebedormercadoria);
        sap.ui.getCore().byId("input-RecebedorFaturaCodigo").setValue(odata.Recebedorfatura);
        sap.ui.getCore().byId("input-RecebedorMercadoriaNome").setValue(odata.Nomerecebedormercadoria);
        sap.ui.getCore().byId("input-Suframa").setValue(odata.Suframa);

        if (odata.Suframa !== "") {
          var sDategui = thisView.utilFormatterDateToBR(odata.Datasuframa);
          sap.ui.getCore().byId("input-DtSufurama").setValue(sDategui);
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

        var oDataCanalDist = sap.ui.getCore().byId("input-multiComboxCanal");
        oDataCanalDist.setModel(oModelCanalDist);
        var arrayCanaldistr_splt = odata.Canaldistr_splt.split(";");
        jQuery.sap.delayedCall(2500, thisView, function() {
          var table = sap.ui.getCore().byId("input-multiComboxCanal");
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
          oDataCanalDist = sap.ui.getCore().byId("input-multiComboxCanal");
          oDataCanalDist.setModel(oModelCanalDist);

          for (var i = 0; i < arrayCanaldistr_splt.length; i++) {
            sap.ui.getCore().byId("input-multiComboxCanal").addSelectedKeys(arrayCanaldistr_splt[i]);
          }

          sap.ui.getCore().byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
          sap.ui.getCore().byId("input-SetorInd").setSelectedKey(odata.Setorindustrial);
          sap.ui.getCore().byId("input-Regiao").setSelectedKey(odata.Regiao);
          sap.ui.getCore().byId("input-endereco").setValue(odata.Endereco);
          sap.ui.getCore().byId("input-numero").setValue(odata.Numero);
          sap.ui.getCore().byId("input-Complemento").setValue(odata.Complemento);
          sap.ui.getCore().byId("input-Bairro").setValue(odata.Bairro);
          sap.ui.getCore().byId("input-Cidade").setValue(odata.Cidade);
          sap.ui.getCore().byId("input-Cep").setValue(odata.Cep);
          sap.ui.getCore().byId("input-Cnae").setSelectedKey(odata.Cnae);
        });
        //Fim Canal Distribuicao
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
          onClose: function(oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {
              thisView._clearForm();
              sap.ui.getCore().byId("save").setVisible(true);
              sap.ui.getCore().byId("cancel").setVisible(true);
              thisView._fieldsDisableEnable("Edit");
              thisView._loadMasterData();
              jQuery.sap.delayedCall(500, this, function() {
                sap.ui.getCore().byId("input-nome").focus();
              });
              var sPath = "/ClientesSet(Codcliente='" + id + "',Nome='',Cnpj='" + thisView.utilFormatterCPFCNPJClear(sap.ui.getCore().byId(
                "searchCnpjCpf").getValue()) + "',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='')";
              oData.read(sPath, {
                success: onSuccess,
                error: onError
              });
              thisView.buscaMatriz();
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

    onChangeSuframa: function(evt) {
      if (sap.ui.getCore().byId("input-Suframa").getValue() !== "") {
        sap.ui.getCore().byId("input-DtSufurama").setEnabled(true);
      } else {
        sap.ui.getCore().byId("input-DtSufurama").setEnabled(false);
        sap.ui.getCore().byId("input-DtSufurama").setValue("");
      }
    },

    _fieldsDisableEnable: function(action) {
      if (action === "Edit") {
        sap.ui.getCore().byId("input-endereco").setEnabled(true);
        sap.ui.getCore().byId("input-numero").setEnabled(true);
        sap.ui.getCore().byId("input-Complemento").setEnabled(true);
        sap.ui.getCore().byId("input-Bairro").setEnabled(true);
        sap.ui.getCore().byId("input-Cidade").setEnabled(true);
        sap.ui.getCore().byId("input-Regiao").setEnabled(true);
        sap.ui.getCore().byId("input-Cep").setEnabled(true);
        sap.ui.getCore().byId("input-nome").setEnabled(true);
        sap.ui.getCore().byId("input-Origem").setEnabled(true);
        sap.ui.getCore().byId("input-SubstTributaria").setEnabled(true);
        sap.ui.getCore().byId("input-SetorInd").setEnabled(true);
        sap.ui.getCore().byId("input-Telefone").setEnabled(true);
        sap.ui.getCore().byId("input-Email").setEnabled(true);
        sap.ui.getCore().byId("input-multiComboxOrganizacao").setEnabled(true);
        sap.ui.getCore().byId("input-multiComboxCanal").setEnabled(true);
        sap.ui.getCore().byId("input-multiComboxSetorAtividade").setEnabled(true);
        sap.ui.getCore().byId("input-Pagador").setEnabled(true);
        sap.ui.getCore().byId("input-buttonRecebedor").setEnabled(true);
        sap.ui.getCore().byId("input-buttonCobranca").setEnabled(false);

        if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() !== "F") {
          sap.ui.getCore().byId("input-RecebedorMercadoria").setEnabled(true);
          sap.ui.getCore().byId("input-Pagador").setEnabled(true);
          sap.ui.getCore().byId("input-RecebedorFatura").setEnabled(true);
          sap.ui.getCore().byId("input-Cobranca").setEnabled(true);
          if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "J") {
            sap.ui.getCore().byId("input-buttonCobranca").setEnabled(true);
            sap.ui.getCore().byId("input-Matriz").setEnabled(true);
            sap.ui.getCore().byId("SimpleFormVincularCliente").setVisible(true);
            sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(true);
            sap.ui.getCore().byId("SimpleFormCobrancaMerc").setVisible(true);
            sap.ui.getCore().byId("SimpleFormContatos").setVisible(true);
          } else {
            sap.ui.getCore().byId("input-Matriz").setEnabled(false);
            sap.ui.getCore().byId("SimpleFormVincularCliente").setVisible(true);
            sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(true);
            sap.ui.getCore().byId("SimpleFormCobrancaMerc").setVisible(true);
            sap.ui.getCore().byId("SimpleFormContatos").setVisible(true);
          }
          sap.ui.getCore().byId("btn-Recebedor").setEnabled(true);
          sap.ui.getCore().byId("btn-Pagador").setEnabled(true);
          sap.ui.getCore().byId("btn-RecebedorFatura").setEnabled(true);
          sap.ui.getCore().byId("btn-Cobranca").setEnabled(true);
          sap.ui.getCore().byId("input-InscricaoEstadual").setEnabled(true);
          sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(true);
          sap.ui.getCore().byId("input-Suframa").setEnabled(true);
          sap.ui.getCore().byId("input-Cnae").setEnabled(true);
        } else {
          sap.ui.getCore().byId("SimpleFormVincularCliente").setVisible(true);
          sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(true);
          sap.ui.getCore().byId("SimpleFormCobrancaMerc").setVisible(true);
          sap.ui.getCore().byId("SimpleFormContatos").setVisible(false);
          sap.ui.getCore().byId("input-Matriz").setEnabled(true);
          sap.ui.getCore().byId("input-InscricaoEstadual").setEnabled(true);
        }
        sap.ui.getCore().byId("input-Kukla").setEnabled(true);
        sap.ui.getCore().byId("input-DomicilioFiscal").setEnabled(true);
      } else if (action === "Save") {
        sap.ui.getCore().byId("searchCnpjCpf").setValue("");
      } else {
        sap.ui.getCore().byId("input-endereco").setEnabled(false);
        sap.ui.getCore().byId("input-numero").setEnabled(false);
        sap.ui.getCore().byId("input-Complemento").setEnabled(false);
        sap.ui.getCore().byId("input-Bairro").setEnabled(false);
        sap.ui.getCore().byId("input-Cidade").setEnabled(false);
        sap.ui.getCore().byId("input-Regiao").setEnabled(false);
        sap.ui.getCore().byId("input-Cep").setEnabled(false);
        sap.ui.getCore().byId("input-Cnae").setEnabled(false);
        sap.ui.getCore().byId("input-Classifcli").setEnabled(false);
        sap.ui.getCore().byId("input-nome").setEnabled(false);
        sap.ui.getCore().byId("input-Origem").setEnabled(false);
        sap.ui.getCore().byId("input-SetorInd").setEnabled(false);
        sap.ui.getCore().byId("input-Matriz").setEnabled(false);
        sap.ui.getCore().byId("input-Telefone").setEnabled(false);
        sap.ui.getCore().byId("input-Email").setEnabled(false);
        sap.ui.getCore().byId("input-multiComboxOrganizacao").setEnabled(false);
        sap.ui.getCore().byId("input-multiComboxCanal").setEnabled(false);
        sap.ui.getCore().byId("input-multiComboxSetorAtividade").setEnabled(false);
        sap.ui.getCore().byId("input-SubstTributaria").setEnabled(false);
        sap.ui.getCore().byId("input-button").setEnabled(false);
        sap.ui.getCore().byId("input-buttonRecebedor").setEnabled(true);
        sap.ui.getCore().byId("input-buttonCobranca").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorMercadoria").setEnabled(false);
        sap.ui.getCore().byId("input-Cobranca").setEnabled(false);
        sap.ui.getCore().byId("input-Pagador").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorFatura").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorCodigo").setEnabled(false);
        sap.ui.getCore().byId("input-PagadorCodigo").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorFaturaCodigo").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorMercadoria").setEnabled(false);
        sap.ui.getCore().byId("input-PagadorNome").setEnabled(false);
        sap.ui.getCore().byId("input-RecebedorFaturaNome").setEnabled(false);
        sap.ui.getCore().byId("input-InscricaoEstadual").setEnabled(true);
        sap.ui.getCore().byId("input-Cnae").setEnabled(false);
        sap.ui.getCore().byId("input-Kukla").setEnabled(false);
        sap.ui.getCore().byId("btn-Recebedor").setEnabled(false);
        sap.ui.getCore().byId("btn-Pagador").setEnabled(false);
        sap.ui.getCore().byId("btn-RecebedorFatura").setEnabled(false);
        sap.ui.getCore().byId("btn-Cobranca").setEnabled(false);
        sap.ui.getCore().byId("input-Suframa").setEnabled(false);
        sap.ui.getCore().byId("input-DtSufurama").setEnabled(false);
        sap.ui.getCore().byId("input-DomicilioFiscal").setEnabled(false);
        sap.ui.getCore().byId("SimpleFormVincularCliente").setVisible(false);
        sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(false);
        sap.ui.getCore().byId("SimpleFormCobrancaMerc").setVisible(false);
        sap.ui.getCore().byId("SimpleFormContatos").setVisible(false);
        if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
          sap.ui.getCore().byId("SimpleFormVincularCliente").setVisible(true);
          sap.ui.getCore().byId("SimpleFormRecebedorMerc").setVisible(true);
          sap.ui.getCore().byId("SimpleFormCobrancaMerc").setVisible(true);
          sap.ui.getCore().byId("SimpleFormContatos").setVisible(true);
          sap.ui.getCore().byId("input-DtSufurama").setEnabled(false);
          sap.ui.getCore().byId("input-Suframa").setEnabled(false);
        }
      }
    },

    handleSavePress: function() {
      var thisView = this,
        oModel = this.getView().getModel();
      var tipoCliente = "";
      var cpf = "";
      var cnpj = "";
      if (sap.ui.getCore().byId("input-nome").getValue() === "") {
        sap.ui.getCore().byId("input-nome").focus();
        MessageBox.error("Campo Nome Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-Cep").getValue() === "") {
        sap.ui.getCore().byId("input-Cep").focus();
        MessageBox.error("Campo CEP Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-endereco").getValue() === "") {
        sap.ui.getCore().byId("input-endereco").focus();
        MessageBox.error("Campo Rua Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-numero").getValue() === "") {
        sap.ui.getCore().byId("input-numero").focus();
        MessageBox.error("Campo Número Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-Bairro").getValue() === "") {
        sap.ui.getCore().byId("input-Bairro").focus();
        MessageBox.error("Campo Bairro Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-Cidade").getValue() === "") {
        sap.ui.getCore().byId("input-Cidade").focus();
        MessageBox.error("Campo Cidade Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-Regiao").getSelectedKey() === "") {
        sap.ui.getCore().byId("input-Regiao").focus();
        MessageBox.error("Campo Estado Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-DomicilioFiscal").getSelectedKey() === "") {
        sap.ui.getCore().byId("input-DomicilioFiscal").focus();
        MessageBox.error("Campo Domicílio Fiscal Inválido.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
      if (sap.ui.getCore().byId("input-SubstTributaria").getSelectedKey() === "") {
        sap.ui.getCore().byId("input-SubstTributaria").focus();
        MessageBox.error("Campo Subst. Tributária Inválida.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      if (sap.ui.getCore().byId("input-SetorInd").getSelectedKey() === "") {
        sap.ui.getCore().byId("input-SetorInd").focus();
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

      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
        cpf = thisView.utilFormatterCPFCNPJClear(sap.ui.getCore().byId("searchCnpjCpf").getValue());
      } else {
        cnpj = thisView.utilFormatterCPFCNPJClear(sap.ui.getCore().byId("searchCnpjCpf").getValue());
      }

      if (sap.ui.getCore().byId("input-Suframa").getValue() !== "" && sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() ===
        "F") {
        MessageBox.error("Suframa só pode ser preeenchido para Pessoa Jurídica.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      if (sap.ui.getCore().byId("input-DtSufurama").getValue() !== "" && sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() ===
        "F") {
        MessageBox.error("Data Suframa só pode ser preeenchido para Pessoa Jurídica.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      var oData;
      var oComboBoxOrganizacao = sap.ui.getCore().byId("input-multiComboxOrganizacao").getSelectedKeys();
      var inputOrgvendas = this._splitMultiCombo(oComboBoxOrganizacao);
      var oComboBoxCanal = sap.ui.getCore().byId("input-multiComboxCanal").getSelectedKeys();
      var inputCanal = this._splitMultiCombo(oComboBoxCanal);
      var oComboBoxSetorAtividade = sap.ui.getCore().byId("input-multiComboxSetorAtividade").getSelectedKeys();
      var inputSetorAtividade = this._splitMultiCombo(oComboBoxSetorAtividade);

      var oTable = sap.ui.getCore().byId("listRecebedorMerc");
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

      //Cobranca
      oTable = "";
      m = "";
      data = "";
      oTable = sap.ui.getCore().byId("listCobrancaMerc");
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

      //Contatos
      var nomeContato = this._readContatos("Nome");
      var sobrenomeContato = this._readContatos("Sobrenome");
      var telefoneContato = this._readContatos("Telefone");
      var emailContato = this._readContatos("Email");
      var funcaoContato = this._readContatos("Funcao");
      var sDtSuframa = null;

      if (sap.ui.getCore().byId("input-Suframa").getValue() !== "" && sap.ui.getCore().byId("input-DtSufurama").getValue() === "") {
        MessageBox.alert("Suframa preenchido, favor cadastrar uma data.", {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }

      if (sap.ui.getCore().byId("input-DtSufurama").getValue() !== "") {
        var sDtSuframaSplit = sap.ui.getCore().byId("input-DtSufurama").getValue().split("/");
        var sDtSuframa = sDtSuframaSplit[2] + "-" + sDtSuframaSplit[1] + "-" + sDtSuframaSplit[0];
        if (sDtSuframa !== "") {
          sDtSuframa = new Date(sDtSuframa);
        } else {
          sDtSuframa = null;
        }
      }

      var inscest = sap.ui.getCore().byId("input-InscricaoEstadual").getValue();
      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() == "J") {
        if (inscest == "") {
          inscest = "ISENTO";
        }
      }

      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
        oData = {
          "Nome": sap.ui.getCore().byId("input-nome").getValue(),
          "Endereco": sap.ui.getCore().byId("input-endereco").getValue(),
          "Numero": sap.ui.getCore().byId("input-numero").getValue(),
          "Complemento": sap.ui.getCore().byId("input-Complemento").getValue(),
          "Bairro": sap.ui.getCore().byId("input-Bairro").getValue(),
          "Cidade": sap.ui.getCore().byId("input-Cidade").getValue(),
          "Regiao": sap.ui.getCore().byId("input-Regiao").getSelectedKey(),
          "Cep": sap.ui.getCore().byId("input-Cep").getValue(),
          "Pais": "BR",
          "Telefone": sap.ui.getCore().byId("input-Telefone").getValue(),
          "Email": sap.ui.getCore().byId("input-Email").getValue(),
          "Pessoacontato": "",
          "Clientematriz": sap.ui.getCore().byId("input-Matriz").getValue(),
          "Setorindustrial": sap.ui.getCore().byId("input-SetorInd").getSelectedKey(),
          "Classifcli": sap.ui.getCore().byId("input-Classifcli").getValue(),
          "Origem": sap.ui.getCore().byId("input-Origem").getValue(),
          "Orgvendas_splt": inputOrgvendas,
          "Canaldistr_splt": inputCanal,
          "Setorativ_splt": inputSetorAtividade,
          "Inscrestadual": inscest,
          "Tipocliente": tipoCliente,
          "Cnae": sap.ui.getCore().byId("input-Cnae").getSelectedKey(),
          "Kukla": sap.ui.getCore().byId("input-Kukla").getSelectedKey(),
          "Nomecontato_split": nomeContato,
          "Fonecontato_split": telefoneContato,
          "Emailcontato_split": emailContato,
          "Domiciliofiscal": sap.ui.getCore().byId("input-SubstTributaria").getSelectedKey(),
          "Recebedorfatura": sap.ui.getCore().byId("input-RecebedorFaturaCodigo").getValue(),
          "Recebedormercadoria": recebedorMercCodigo, //this.getView().byId("input-RecebedorCodigo").getValue(),
          "Pagador": sap.ui.getCore().byId("input-PagadorCodigo").getValue(),
          "Cobranca": cobrancaMercCodigo,
          "Nomecobranca": cobrancaMercNome,
          "Enderecorecebedormercadoria": recebedorMercEndereco,
          "Localrecebedormercadoria": recebedorMercLocal,
          "Enderecocobranca": cobrancaMercEndereco,
          "Localcobranca": cobrancaMercLocal
        };

        oModel.update("/ClientesSet(Codcliente='" + this.byId("input-Codcliente").getValue() + "',Nome='',Cnpj='" + cnpj + "',Cpf='" + cpf +
          "',Tipocliente='" + tipoCliente + "')", oData, {
            success: function(success, response, odata) {
              thisView.getView().setBusy(false);
              var hdrMessage = response.headers["sap-message"];
              var hdrMessageObject = JSON.parse(hdrMessage);
              MessageToast.show(hdrMessageObject.message);
            },
            error: function(oError, response) {
              thisView.getView().setBusy(false);
              var hdrMessage = $(oError.responseText).find("message").first().text();
              MessageToast.show(hdrMessage);
            }
          });
      } else {
        oData = {
          "Nome": sap.ui.getCore().byId("input-nome").getValue(),
          "Cnpj": cnpj,
          "Cpf": cpf,
          "Endereco": sap.ui.getCore().byId("input-endereco").getValue(),
          "Numero": sap.ui.getCore().byId("input-numero").getValue(),
          "Complemento": sap.ui.getCore().byId("input-Complemento").getValue(),
          "Bairro": sap.ui.getCore().byId("input-Bairro").getValue(),
          "Cidade": sap.ui.getCore().byId("input-Cidade").getValue(),
          "Regiao": sap.ui.getCore().byId("input-Regiao").getSelectedKey(),
          "Cep": sap.ui.getCore().byId("input-Cep").getValue(),
          "Pais": "BR",
          "Telefone": sap.ui.getCore().byId("input-Telefone").getValue(),
          "Email": sap.ui.getCore().byId("input-Email").getValue(),
          "Pessoacontato": "",
          "Clientematriz": sap.ui.getCore().byId("input-Matriz").getValue(),
          "Setorindustrial": sap.ui.getCore().byId("input-SetorInd").getSelectedKey(),
          "Classifcli": sap.ui.getCore().byId("input-Classifcli").getValue(),
          "Origem": sap.ui.getCore().byId("input-Origem").getValue(),
          "Orgvendas_splt": inputOrgvendas,
          "Canaldistr_splt": inputCanal,
          "Setorativ_splt": inputSetorAtividade,
          "Inscrestadual": inscest,
          "Tipocliente": tipoCliente,
          "Cnae": sap.ui.getCore().byId("input-Cnae").getSelectedKey(),
          "Kukla": sap.ui.getCore().byId("input-Kukla").getSelectedKey(),
          "Nomecontato_split": nomeContato,
          "Sobrenomecontato_split": sobrenomeContato,
          "Fonecontato_split": telefoneContato,
          "Emailcontato_split": emailContato,
          "Domiciliofiscal": sap.ui.getCore().byId("input-DomicilioFiscal").getSelectedKey(),
          "Recebedorfatura": sap.ui.getCore().byId("input-RecebedorFaturaCodigo").getValue(),
          "Recebedormercadoria": recebedorMercCodigo,
          "Pagador": sap.ui.getCore().byId("input-PagadorCodigo").getValue(),
          "Tipoclientesap": sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey(),
          "Suframa": sap.ui.getCore().byId("input-Suframa").getValue(),
          "Datasuframa": sDtSuframa,
          "Gruposubfiscal": sap.ui.getCore().byId("input-SubstTributaria").getSelectedKey(),
          "Cobranca": cobrancaMercCodigo,
          "Nomecobranca": cobrancaMercNome,
          "Enderecorecebedormercadoria": recebedorMercEndereco,
          "Localrecebedormercadoria": recebedorMercLocal,
          "Enderecocobranca": cobrancaMercEndereco,
          "Localcobranca": cobrancaMercLocal,
          "FUNCAO_CONTA": funcaoContato
        };

        var oModelData = this.getModel("SalesModel").getData();
        var clearView = this;
        valueHelpDialog1.setBusy(true);

        oModel.create("/ClientesSet", oData, {
          success: function(oCreatedEntry, success, response, odata) {
            var hdrMessage = success.headers["sap-message"];
            var hdrMessageObject = JSON.parse(hdrMessage);
            var message = hdrMessageObject.message.split("-");
            if (message[0] !== "E" && message[0].indexOf("Erro") == -1) {
              var messageCodCliente = hdrMessageObject.message.split(" ");
              sap.ui.getCore().byId("input-Codcliente").setValue(messageCodCliente[1]);
              sap.ui.getCore().byId("combo-tipoPessoacadastro").setSelectedKey(null);
              sap.ui.getCore().byId("save").setVisible(false);
              thisView._fieldsDisableEnable("Cancel");
              thisView._fieldsDisableEnable("Save");
              MessageBox.success(message[1], {
                styleClass: "sapUiSizeCompact"
              });
              oModelData.CustomerId = messageCodCliente[1];
              oModelData.CustomerName = sap.ui.getCore().byId("input-nome").getValue();
              oModelData.TaxDomcl = (sap.ui.getCore().byId("input-DomicilioFiscal").getSelectedKey() === "X" || sap.ui.getCore().byId(
                  "input-DomicilioFiscal").getSelectedKey() === "J" ? "X - Contribuinte" :
                "Z - Não-Contribuinte");
              if (cnpj != "") {
                oModelData.CustomerDoct = cnpj;
                oModelData.CarrierDoct = cnpj;
              } else {
                oModelData.CustomerDoct = cpf;
                oModelData.CarrierDoct = cpf;
              }
              clearView.getView().byId("input-Codigo").setText(oModelData.CustomerId + " - " + oModelData.CustomerName);
              oModelData.CustomerVisible = true;
              clearView._readCustomerData(messageCodCliente[1]);
              clearView._clearForm();
              thisView.getView().setBusy(false);
              clearView.getModel("SalesModel").refresh(true);
              clearView._loadCustomerHelpers();
              valueHelpDialog1.close();
            } else {
              if (message[1]) {
                MessageBox.error(message[1], {
                  styleClass: "sapUiSizeCompact"
                });
              } else {
                MessageBox.error(message[0], {
                  styleClass: "sapUiSizeCompact"
                });
              }
              thisView.getView().setBusy(false);
              valueHelpDialog1.setBusy(false);
            }
          },
          error: function(oError, response) {
            var hdrMessage = JSON.parse(oError.responseText).error.message.value;
            MessageBox.error(hdrMessage, {
              styleClass: "sapUiSizeCompact"
            });
            thisView.getView().setBusy(false);
          }
        });
      }
      oModel.submitChanges();
      thisView.getView().setBusy(true);
    },

    onMaskTelefone: function(oEvent) {
      var telefone = oEvent.getParameter("value");
      sap.ui.getCore().byId("input-Telefone").setValue(this.utilFormatterTelefone(telefone));
    },

    _splitMultiCombo: function(comboboxItems) {
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

    openConfirmDialog: function(fnOK, aArguments, si18nTitle, si18nText) {
      MessageBox.show(
        this._oText.getText(si18nText), {
          icon: MessageBox.Icon.QUESTION,
          title: this._oText.getText(si18nTitle),
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function(sAnswer) {
            if (sAnswer === MessageBox.Action.YES) {
              fnOK.apply(this, aArguments);
            }
          }
        }
      );
    },

    _readContatos: function(field) {
      var oTable = sap.ui.getCore().byId("input-listContatos");
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

    handleValueHelpCobranca: function(oEvent) {
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
        "arcelor.view.ClientesPesquisaDialogCobranca",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      var filter = [];
      filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'O'));
      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }

      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    handleValueHelpRecebedor: function(oEvent) {
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
      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F") {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'Q'));
      } else {
        filter.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.EQ, 'M'));
      }

      filter.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("input-Codcliente").getValue()));
      }

      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        filter
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    onMaskCEP: function(oEvent) {
      var thisView = this;
      var cep = thisView.utilClearCharToNumber(oEvent.getParameter("value"));
      if (cep.length >= 8) {
        sap.ui.getCore().byId("input-Cep").setValue(this.utilFormatterCEP(cep));
        var oView = this.getView();
        var oData = this.getView().getModel();
        var estaView = this;
        var onError = function(odata, response) {
          oView.setBusy(false);
          sap.m.MessageBox.show('Cep não encontrado', {
            icon: sap.m.MessageBox.Icon.INFORMATION,
            title: "ArcelorMittal",
            actions: [sap.m.MessageBox.Action.OK],
            onClose: function(oAction) {
              sap.ui.getCore().byId("input-endereco").setValue("");
              sap.ui.getCore().byId("input-Bairro").setValue("");
              sap.ui.getCore().byId("input-numero").setValue("");
              sap.ui.getCore().byId("input-Complemento").setValue("");
              sap.ui.getCore().byId("input-Regiao").setSelectedKey(null);
              sap.ui.getCore().byId("input-Cidade").setSelectedKey(null);
            }
          });
        };
        var onSuccess = function(odata) {
          estaView.utilSearchCity1(odata.Estado);
          var sBairro = "";
          var sEndereco = odata.TpLogradouro + " " + odata.Logradouro;

          if (sEndereco) {
            sEndereco = sEndereco.toUpperCase();
          }
          if (odata.Bairro) {
            sBairro = odata.Bairro.toUpperCase();
          }

          sap.ui.getCore().byId("input-endereco").setValue(sEndereco);
          sap.ui.getCore().byId("input-Bairro").setValue(sBairro);
          sap.ui.getCore().byId("input-Regiao").setSelectedKey(odata.Estado);
          sap.ui.getCore().byId("input-numero").setValue("");
          sap.ui.getCore().byId("input-Complemento").setValue("");
          sap.ui.getCore().byId("input-Cidade").setSelectedKey(odata.CodCidade);
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

    handleSearchClientesRecebedor: function(oEvent) {
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
      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
      }
      if (sap.ui.getCore().byId("combo-tipoPessoa").getSelectedKey() === "J") {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'M'));
      } else {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'Q'));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    handleSearchClientesCobranca: function(oEvent) {
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
      if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
        filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, sap.ui.getCore().byId("input-Codcliente").getValue()));
      }
      if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "J") {
        filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'O'));
      }
      var binding = oEvent.getSource().getBinding("items");
      binding.filter(filters);
    },

    onSearchCity: function() {
      var thisView = this;
      var oView = this.getView();
      var estado = sap.ui.getCore().byId("input-Regiao").getSelectedKey();
      sap.ui.getCore().byId("input-endereco").setValue("");
      sap.ui.getCore().byId("input-Bairro").setValue("");
      sap.ui.getCore().byId("input-numero").setValue("");
      sap.ui.getCore().byId("input-Complemento").setValue("");
      sap.ui.getCore().byId("input-Cidade").setSelectedKey(null);
      if (estado !== " ") {
        oView.setBusy(true);
        this.utilSearchCity1(estado, thisView);
        oView.setBusy(false);
      }
    },

    utilSearchCity1: function(oEvent) {
      var filters = [];
      var filter;
      filter = new sap.ui.model.Filter("Estado", sap.ui.model.FilterOperator.EQ, oEvent);
      filters.push(filter);
      var cidades = sap.ui.getCore().byId("input-Cidade");
      var binding = cidades.getBinding("items");
      binding.filter(filters);
    },

    handleValueHelp: function(oEvent) {
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
        "arcelor.view.ClientesPesquisaDialog",
        this
      );
      this.getView().addDependent(this._valueHelpDialog);

      // create a filter for the binding
      this._valueHelpDialog.getBinding("items").filter(
        [new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue)]
      );
      // open value help dialog filtered by the input value
      this._valueHelpDialog.open(sInputValue);
    },

    onCreateItems: function() {
      var sPath = "/ContatoClientesSet";
      var onSuccess = function(odata) {
        var combodados = [];
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
        var oTableData = sap.ui.getCore().byId("input-listContatos");
        oTableData.setModel(oModel);
      };
      var onError = function(odata) {
        teste = odata;
      };
      this.getView().getModel().read(sPath, {
        success: onSuccess.bind(this),
        error: onError.bind(this)
      });
    },

    onCreateItemsRecebedor: function() {
      aDataRecebedorMerc.push({
        RecebedorMercCodigo: "",
        RecebedorMercNome: ""
      });
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        modelDataRecebedorMerc: aDataRecebedorMerc
      });
      var oTableData = sap.ui.getCore().byId("listRecebedorMerc");
      oTableData.setModel(oModel);
      var oview = this;
      oTableData.setModel(oModel);
      oTableData.getItems().forEach(function(oItem) {
        oItem.mAggregations.cells[0].addEventDelegate({
          onfocusout: function(e) {
            oview.liveChangeRecebedor(e)
          }
        })
      })
    },

    onCreateItemsCobranca: function() {
      aDataCobrancaMerc.push({
        CobrancaMercCodigo: "",
        CobrancaMercNome: ""
      });
      var oModel = new sap.ui.model.json.JSONModel();
      oModel.setData({
        modelDataCobrancaMerc: aDataCobrancaMerc
      });
      var oTableData = sap.ui.getCore().byId("listCobrancaMerc");
      oTableData.setModel(oModel);
      var oview = this;
      oTableData.getItems().forEach(function(oItem) {
        oItem.mAggregations.cells[0].addEventDelegate({
          onfocusout: function(e) {
            oview.liveChangeCobranca(e)
          }
        })
      })
    },

    onDeleteSelectedItemsCobranca: function(oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = sap.ui.getCore().byId("listCobrancaMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataCobrancaMerc");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelDataCobrancaMerc", data);
      sap.m.MessageToast.show("Cobrança removido!");
    },

    onDeleteRecebedor: function() {
      sap.ui.getCore().byId("input-RecebedorCodigo").setValue("");
      sap.ui.getCore().byId("input-RecebedorMercadoriaNome").setValue("");
    },

    onDeleteSelectedItemsRecebedor: function(oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = sap.ui.getCore().byId("listRecebedorMerc");
      var m = oTable.getModel();
      var data = m.getProperty("/modelDataRecebedorMerc");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelDataRecebedorMerc", data);
      sap.m.MessageToast.show("Recebedor removido!");
    },

    onDeleteSelectedItems: function(oEvent) {
      var oSelectedItem = oEvent.getSource().getParent();
      var oPath = oSelectedItem.getBindingContext().getPath();
      var oIndex = parseInt(oPath.substring(oPath.lastIndexOf('/') + 1));
      var oTable = sap.ui.getCore().byId("input-listContatos");
      var m = oTable.getModel();
      var data = m.getProperty("/modelData");
      var removed = data.splice(oIndex, 1);
      m.setProperty("/modelData", data);
      sap.m.MessageToast.show("Contato removido!");
    },

    _clearForm: function() {
      var thisView = this;
      sap.ui.getCore().byId("input-Codcliente").setValue("");
      sap.ui.getCore().byId("input-endereco").setValue("");
      sap.ui.getCore().byId("input-numero").setValue("");
      sap.ui.getCore().byId("input-Complemento").setValue("");
      sap.ui.getCore().byId("input-Bairro").setValue("");
      sap.ui.getCore().byId("input-Cidade").setSelectedKey(null);
      sap.ui.getCore().byId("input-Cep").setValue("");
      sap.ui.getCore().byId("input-nome").setValue("");
      sap.ui.getCore().byId("input-Origem").setValue("");
      sap.ui.getCore().byId("input-Telefone").setValue("");
      sap.ui.getCore().byId("input-Email").setValue("");
      sap.ui.getCore().byId("input-InscricaoEstadual").setValue("");
      sap.ui.getCore().byId("input-Cnae").setSelectedKey(null);
      sap.ui.getCore().byId("input-SubstTributaria").setValue("");
      sap.ui.getCore().byId("input-Matriz").setValue("");
      sap.ui.getCore().byId("input-Regiao").setSelectedKey(null);
      sap.ui.getCore().byId("input-SetorInd").setSelectedKey(null);
      sap.ui.getCore().byId("input-Kukla").setValue("");
      sap.ui.getCore().byId("input-multiComboxOrganizacao").setValue("");
      sap.ui.getCore().byId("input-multiComboxCanal").setValue("");
      sap.ui.getCore().byId("input-multiComboxSetorAtividade").setValue("");
      sap.ui.getCore().byId("input-multiComboxOrganizacao").setValue("");
      sap.ui.getCore().byId("input-multiComboxCanal").setValue("");
      sap.ui.getCore().byId("input-multiComboxSetorAtividade").setValue("");
      sap.ui.getCore().byId("input-RecebedorMercadoria").setValue("");
      sap.ui.getCore().byId("input-CobrancaCodigo").setValue("");
      sap.ui.getCore().byId("input-Cobranca").setValue("");
      sap.ui.getCore().byId("input-CobrancaNome").setValue("");
      sap.ui.getCore().byId("input-Pagador").setValue("");
      sap.ui.getCore().byId("input-RecebedorFatura").setValue("");
      sap.ui.getCore().byId("input-RecebedorCodigo").setValue("");
      sap.ui.getCore().byId("input-PagadorCodigo").setValue("");
      sap.ui.getCore().byId("input-RecebedorFaturaCodigo").setValue("");
      sap.ui.getCore().byId("input-RecebedorMercadoriaNome").setValue("");
      sap.ui.getCore().byId("input-PagadorNome").setValue("");
      sap.ui.getCore().byId("input-RecebedorFaturaNome").setValue("");
      sap.ui.getCore().byId("input-InscricaoEstadual").setValue("");
      sap.ui.getCore().byId("input-Suframa").setValue("");
      sap.ui.getCore().byId("input-DtSufurama").setValue("");
      sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey(null);

      //limpar contatos
      var oTable = sap.ui.getCore().byId("input-listContatos");
      var m = oTable.getModel();
      var data;
      data = m.getProperty("/modelData");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }

      m.setProperty("/modelData", data);

      //Limpa Recebedor Mercadoria
      oTable = sap.ui.getCore().byId("listRecebedorMerc");
      m = oTable.getModel();
      data = m.getProperty("/modelDataRecebedorMerc");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }

      m.setProperty("/modelDataRecebedorMerc", data);

      //Limpa Cobrança
      oTable = sap.ui.getCore().byId("listCobrancaMerc");
      m = oTable.getModel();
      data = m.getProperty("/modelDataCobrancaMerc");
      if (data !== undefined) {
        while (data.length !== 0) {
          data.splice(0, 1);
        }
      }
      m.setProperty("/modelDataCobrancaMerc", data);

      //limpar áreas de venda
      sap.ui.getCore().byId("input-multiComboxOrganizacao").setSelectedItems([]);
      sap.ui.getCore().byId("input-multiComboxCanal").setSelectedItems([]);
      sap.ui.getCore().byId("input-multiComboxSetorAtividade").setSelectedItems([]);
    },

    handleCancelPress: function() {
      var thisView = this;
      this._fieldsDisableEnable("Cancel");
      this._clearForm();
      valueHelpDialog1.close();
    },

    _scrollToItens: function() {
      var oObjectPageLayout = this.getView().byId("objectPageLayout");
      var oTargetSubSection = this.getView().byId("itens");
      oObjectPageLayout.scrollToSection(oTargetSubSection.getId());
    },

    _scrollToCarrier: function() {
      var oObjectPageLayout = this.getView().byId("objectPageLayout");
      var oTargetSubSection = this.getView().byId("sectionTransportadora");
      oObjectPageLayout.scrollToSection(oTargetSubSection.getId());
    },

    _stayCurrentPosition: function(position) {
      var oObjectPageLayout = this.getView().byId("objectPageLayout");
      var oTargetSubSection = this.getView().byId(position);
      oObjectPageLayout.scrollToSection(oTargetSubSection.getId());
    },

    _validateSalesPayment: function(sSalesOrder) {
      return new Promise(function(fnResolve, fnReject) {
        var oParameters = {
          OrdemVenda: sSalesOrder
        };
        this.getModel().callFunction("/ValidaPagamento", {
          method: "GET",
          urlParameters: oParameters,
          success: function(oReturn) {
            fnResolve(oReturn);
          },
          error: function() {
            fnReject();
          }
        });
      }.bind(this));
    },

    onPressMenuButton: function() {
      let menu = sap.ui.getCore().byId("__component0---app--idAppControl-Master");
      if (menu.hasStyleClass("menuFechado")) {
        menu.setWidth("170px");
        menu.removeStyleClass("menuFechado");
        menu.addStyleClass("menuAberto");
      } else {
        menu.setWidth("0");
        menu.removeStyleClass("menuAberto");
        menu.addStyleClass("menuFechado")
      }
    },

    onMaisItens: function() {
      var model = sap.ui.getCore().byId("ListProdutos").getModel();
    },

    onChangeIe: function(oEvent) {
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
        if (oEvent.getSource().getId() === "input-InscricaoEstadual") {
          sap.ui.getCore().byId(idInput).setValue(newValue);
        } else {
          this.byId("carrierIE").setValue(newValue);
        }
      }
    },

    onChangeQtdMask: function(oEvent) {
      this.byId("qtdItem").setValue(newValue);
      let sValue = oEvent.getParameter("value");
      let isValid = true;
      let regex = /^\d+(?:\,\d{1,3})?$/;
      let idInput = oEvent.getSource().getId();
      var newValue = sValue;
      isValid = regex.test(sValue);
      if (!isValid) {
        newValue = sValue.replace(oEvent.getParameter("value")[sValue.length - 1], ".");
        this.byId("qtdItem").setValue(newValue);
      }
      this.getModel("SalesModel").getData().FinalizeEnabled = false;
      this.getModel("SalesModel").refresh();
    },

    onLineChange: function() {
      this.getModel("SalesModel").getData().FinalizeEnabled = false;
      this.getModel("SalesModel").refresh();
    },

    onImprimir: function(oEvent) {
      let sPathM = "/ImpressaoOvSet(Vbeln='" + this.getModel("SalesModel").getData().SalesOrder + "')/$value";
      var sUrl = "/sap/opu/odata/SAP/ZCHSD_VENDASVAREJO_SRV/";
      var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl);
      var spath2 = window.location.origin + sUrl;
      var sUrl2 = spath2 + sPathM;

      oModel.read(sPathM, {
        success: function(oData) {

        },
        error: function(oError) {
          if (oError.message == 'no handler for data') {
            window.open(sUrl2, "_blank");
          } else {
            MessageBox.error("Não foi possivel abrir o arquivo");
          }
        }
      });
    },

    onImprimirOv: function() {
      this.getOwnerComponent().getRouter().navTo("SalesReport", true);
    },

    /* D0012620 - Alterar processo de consulta de fluxo de documentos */
    onSalesOrderFrag: function(oEvent) {
      var oSource = oEvent.getSource();
      var sPath = oSource.getParent().getBindingContext().sPath;
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty(sPath);

      if (oItem.VbtypN === "1") {
        sessionStorage.setItem("ViewBack", "Vendas");

        this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
          mode: "Change",
          fatura: oItem.Refkey
        }, true);
      }
    },

    //    onNotaFiscalFrag: function (oEvent) {
    //      var oSource = oEvent.getSource();
    //      var sPath = oSource.getBindingContext().getPath();
    //      var oModel = oSource.getModel();
    //      var oRow = oModel.getProperty(sPath);
    //      sessionStorage.setItem("ViewBack", "Vendas");
    //      this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
    //        mode: "Change",
    //        fatura: oRow.fatura
    //      }, true);
    //    },
    /* D0012620 - Alterar processo de consulta de fluxo de documentos */

    onResetCart: function() {
      var oCartModel = this.getView().getModel("cartProducts");
      oCartModel.setProperty("/cartEntries", {});
      oCartModel.setProperty("/totalPrice", "0");
    },

    actionHistorico: function(oEvent) {
      let idCliente = this.byId("input-Cliente").getValue();
      if (idCliente.length > 0) {
        this.getOwnerComponent().getRouter().navTo("HistoricoVendas", {
          idcliente: idCliente
        }, false);
      } else {
        MessageToast.show('Selecione um cliente para consultar o histórico');
      }
    },

    showStatus: function(msg) {
      document.getElementById("tef_titulo").innerHTML = msg;
      document.getElementById("tef_corpo").innerHTML = "";
    },

    showMessage: function(msg) {
      document.getElementById("tef_corpo").innerHTML = msg +
        "<br/><br/><table width=\"120\"><tr><td><input type=\"BUTTON\" class=\"btn1\" value=\"OK\" onclick=\"this.resetView();\"/></td></tr></table>";
      document.getElementById("tef_corpo").style.display = "block";
    },

    obtemSessaoId: function() {
      $.ajax({
          url: agent_url + "/session",
          type: "get",
          data: {},
        })
        .done(function(data) {
          if (data.serviceStatus == 0) {
            // Salva a sessionId
            sessao.sessionId = data.sessionId;
            sessao.usandoSessao = 1;
            showMessage("Sessao atual [" + data.sessionId + "]");
          } else {
            showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function(xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
    },

    destroiSessaoId: function() {
      var ret = [];
      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = "";
      sessao.dataFiscal = "";
      sessao.horaFiscal = "";

      $.ajax({
          url: agent_url + "/session",
          type: "delete",
        })
        .done(function(data) {
          if (data.serviceStatus == 0) {
            showMessage("Sessao finalizada");
          } else {
            showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function(xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });

      // Limpa a sessionId, independente de ter dado erro.
      sessao.sessionId = "";
      sessao.usandoSessao = 0;
    },

    inicio: function(tipo, funcao) {
      var ret = [];
      var data_d = new Date()
      var mm = data_d.getMonth() + 1;
      var dd = data_d.getDate();

      var date_dat = [data_d.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
      ].join('');

      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = '';
      sessao.dataFiscal = date_dat;
      sessao.horaFiscal = '';

      this.showStatus("Iniciando transação...");
      var oview = this;
      var args = {};

      if (tipo == 1) {
        // Envia dados para uma nova sessão
        args.sitefIp = '127.0.0.1';
        args.storeId = this.getModel("SalesModel").getData().Loja;
        args.terminalId = 'REST0001';

      } else if (tipo == 2 && sessao.sessionId) {
        args.sessionId = sessao.sessionId;
      }

      // Argumentos comuns
      args.functionId = funcao;
      args.trnAmount = this.getView().byId("textValorTotalVenda").getText();
      args.taxInvoiceNumber = '';
      args.taxInvoiceDate = date_dat;
      args.taxInvoiceTime = '';
      args.cashierOperator = 'CAIXA';
      args.trnAdditionalParameters = '';
      args.trnInitParameters = '';

      $.ajax({
          url: agent_url + "/startTransaction",
          type: "post",
          data: jQuery.param(args),
        })
        .done(function(data) {
          if (data.serviceStatus != 0) {
            oview.showMessage("Agente ocupado: " + data.serviceStatus + " " + data.serviceMessage);
          } else if (data.clisitefStatus != 10000) {
            oview.showMessage("Retorno " + data.clisitefStatus + " da CliSiTef");
          } else {
            // Inicia retornou 10000 (via clisitef)
            sessao.continua = 0;

            // Salva a sessionId para usar na confirmacao
            sessao.sessionId = data.sessionId;

            // Continua no fluxo de coleta
            oview.continua("");
          }
        })
        .fail(function(xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText + "<br>" + jQuery.param(args));
        });

    },

    continua: function(dados) {
      // lembrete: chamada ajax é assincrona, então sai da função continua imediatamente
      var oview = this;
      $.ajax({
          url: agent_url + "/continueTransaction",
          type: "post",
          data: {
            "sessionId": sessao.sessionId,
            "data": dados,
            "continue": sessao.continua,
          },
        })
        .done(function(data) {

          if (data.serviceStatus != 0) {
            oview.showMessage(data.serviceStatus + " " + data.serviceMessage);
            return;
          }

          if (data.clisitefStatus != 10000) {
            var s = "";

            if (data.clisitefStatus == 0) {
              s = JSON.stringify(sessao.ret);
              s = s.replace(/},{/g, "},<br>{");
              oview.finaliza(1, false, false);
            }
            oview.showMessage("Fim - Retorno: " + data.clisitefStatus + "<br>");
            if (oview._oDialog14) {
              oview._oDialog14.close();
              oview._oDialog14.destroy();
            }
            return;
          }

          document.getElementById("tef_corpo").style.display = "none";

          if (data.commandId != 23) {
            // tratamento para nao piscar a tela (refresh)
            lastContents23 = '';
          }
          switch (data.commandId) {
            case 0:
              var item = {
                "TipoCampo": data.fieldId,
                "Valor": data.data
              };

              // acumula o resultado em um JSON, pode ser usado no final da transação para POST ao servidor da automação
              sessao.ret.push(item);

              if (data.fieldId == 121) {
                alert("Cupom Estabelecimento: " + data.data);
                if (oview._oDialog14) {
                  oview._oDialog14.close();
                  oview._oDialog14.destroy();
                }
              }
              if (data.fieldId == 122)
                alert("Cupom Cliente: " + data.data);
              oview.continua("");
              break;

            case 1:
            case 2:
            case 3:
            case 4:
            case 15:
              document.getElementById("tef_titulo").innerHTML = data.data;
              oview.continua("");
              break;

            case 11:
            case 12:
            case 13:
            case 14:
            case 16:
              //Apaga display
              document.getElementById("tef_titulo").innerHTML = "";
              oview.continua("");
              break;

            case 22:
              alert(data.data + "enter");
              oview.continua("");
              break;

            case 23:
              var contents =
                '<table><tr><td width="150"><input type="BUTTON" class="btn1" value="Cancelar" onclick="sessao.continua=-1;"/></td></tr></table>';
              if (lastContents23 != contents) {
                document.getElementById("tef_corpo").innerHTML = contents;
                lastContents23 = contents;
              }

              // No comando 23, faz o reset da flag de continuidade, para sensibilizar tratamento de confirmações de cancelamento da clisitef.
              setTimeout(function() {
                oview.continua("");
                sessao.continua = 0;
              }, 500);
              break;

            case 20:
              document.getElementById("tef_titulo").innerHTML = data.data;
              sap.ui.getCore().byId("bnt_cancelpag").setVisible(true);
              sap.ui.getCore().byId("bnt_simPag").setVisible(true);
              break;

            case 21:
            case 30:
            case 31:
            case 32:
            case 33:
            case 34:
            case 35:
            case 38:
              var s = data.data;
              if (data.commandId == 21)
                s = s.replace(/;/g, "<br/>");
              document.getElementById("tef_corpo").innerHTML = '<table><tr><td colspan="2">' + s + '</td></tr></table>';

              sap.ui.getCore().byId("DADOS").setVisible(true);
              sap.ui.getCore().byId("bnt_okPag").setVisible(true);
              sap.ui.getCore().byId("bnt_cancel").setVisible(true);
              document.getElementById("tef_corpo").style.display = "block";
              setTimeout(function() {
                document.getElementById("DADOS").focus();
              }, 100);
              break;

            default:
              document.getElementById("tef_corpo").innerHTML = "Chegou uma captura desconhecida.[" + data.commandId + "]";
              document.getElementById("tef_corpo").style.display = "block";
              oview.continua("");
          }

        })
        .fail(function(xhr, ajaxOptions, thrownError) {
          oview.showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });

    },

    criaSessaoId: function() {
      var ret = [];
      sessao.ret = ret;
      sessao.continua = 0;
      sessao.cupomFiscal = "";
      sessao.dataFiscal = "";
      sessao.horaFiscal = "";

      this.showStatus("Criando sessão...");
      var loja = this.getModel("SalesModel").getData().Plant.split("-")[0].trim();
      loja = '0000' + loja;
      var oview = this;
      $.ajax({
          url: agent_url + "/session",
          type: "post",
          data: {

            "sitefIp": "127.0.0.1",
            "storeId": '00000000',
            "terminalId": "REST0001",
            "sessionParameters": "",
          },
        })
        .done(function(data) {
          if (data.serviceStatus == 0) {
            // Salva a sessionId e dados da conexao
            sessao.sessionId = data.sessionId;
            sessao.usandoSessao = 1;
            sessao.empresa = '00000000';
            sessao.terminal = 'REST0001';
            sessao.siTefIP = '127.0.0.1';
            oview.inicio(2, 3);

          } else {
            oview.showMessage(data.serviceStatus + " - " + data.serviceMessage);
          }
        })
        .fail(function(xhr, ajaxOptions, thrownError) {
          showMessage("Erro: " + xhr.status + " - " + thrownError + "<br>" + xhr.responseText);
        });
    },

    onConfirmPagamento: function() {
      if (!sessao.sessionId) {
        this.criaSessaoId();
      } else {
        this.inicio(2, 3);
      }
    },

    resetView: function() {
      if (!sessao.usandoSessao) {
        // Foi usada uma sessao temporária, faz a limpeza pois o servidor removeu a sessão
        sessao.sessionId = 0;
      }
    },

    trataColeta: function(cont) {
      if (cont.mParameters.id == "bnt_okPag") {
        sessao.continua = 0
      } else {
        sessao.continua = -1
      };
      this.continua(sap.ui.getCore().byId("DADOS").getValue());
      sap.ui.getCore().byId("DADOS").setVisible(false);
      sap.ui.getCore().byId("DADOS").setValue("");
      sap.ui.getCore().byId("bnt_okPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancel").setVisible(false);
    },

    simPag: function() {

      this.continua(0)
      sap.ui.getCore().byId("bnt_simPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancelpag").setVisible(false);
    },

    cancelPag: function() {
      this.continua(1)
      sap.ui.getCore().byId("bnt_simPag").setVisible(false);
      sap.ui.getCore().byId("bnt_cancelpag").setVisible(false);
    },

    _changeItemsFrete: function(sFrete) {
      this.getModel("SalesModel").getData().SalesItems.forEach(oItem => {
        oItem.Frete = sFrete;
      });
      this.getModel("SalesModel").getData().Frete = sFrete;
      this.getModel("SalesModel").refresh(true);

      this._readCarriers(sFrete);
      this.byId("id-ComboTransportador").setSelectedKey("");
      this.byId("nomeCarrier").setValue("");
      this.byId("cpfcnpjCarrier").setValue("");
      this.byId("carrierIE").setValue("");
      this.byId("cepCarrier").setValue("");
      this.byId("ruaCarrier").setValue("");
      this.byId("numeroCarrier").setValue("");
      this.byId("bairroCarrier").setValue("");
      this.byId("estadoCarrier").setSelectedKey("");
      this.byId("cidadeCarrier").setValue("");
      this.byId("placaCarrier").setValue("");
      this.byId("anttCarrier").setValue("");
      this.byId("estadosCarrier").setSelectedKey("");
    },

    onClosePagamentoDialog: function() {
      // Fechar o dialog de pagamento
      this._oDialog14.destroy();
    },

    // maxiPago!
    // Enviar requisição criação link pagamento
    onCriarLinkPagamento: function() {

      var oTelefone = sap.ui.getCore().byId("inTelefone"),
        oEmail = sap.ui.getCore().byId("inEmail");

      // Validação de preenchimento dos campos
      if (oEmail.getValue().length === 0) {
        oEmail.setRequired(true);
        oEmail.setValueStateText("Campo E-mail é requerido.");
        oEmail.setValueState("Error");
      } else {
        oEmail.setRequired(false);
        oEmail.setValueState("None");
      }

      if (oTelefone.getValue().length === 0) {
        oTelefone.setRequired(true);
        oTelefone.setValueStateText("Campo Telefone é requerido.");
        oTelefone.setValueState("Error");
        oTelefone.focus();
      } else {
        oTelefone.setRequired(false);
        oTelefone.setValueState("None");
      }

      if (oTelefone.getValueState() != sap.ui.core.ValueState.None) {
        oTelefone.focus();
        return false;
      }

      if (oEmail.getValueState() != sap.ui.core.ValueState.None) {
        oEmail.focus();
        return false;
      }

      // Montagem dos dados enviados
      var aPayload = {
        "Vbeln": sap.ui.getCore().byId("input-ovPag").getText(),
        "Telf1": sap.ui.getCore().byId("inTelefone").getValue(),
        "EmailAddr": sap.ui.getCore().byId("inEmail").getValue()
      };

      // Envio da requisição
      this.getModel().create(
        "/PagtoMaxiPagoSet",
        aPayload, {
          success: function(oData) {
            if (oData.Message.length === 0) {
              MessageBox.success("Link de Pagamento criado com sucesso.");
            } else {
              MessageBox.warning(oData.Message);
            }
          },
          error: function(oData) {
            MessageBox.error("Ocorreu um erro. Favor acionar o suporte para verificar.");
          }
        }
      );
      this._oDialog14.destroy();
    },

    /* D0012620 - Alocação de Estoque  Fornecimento - Início */
    handleFornecerOVPress: function() {
      MessageBox.confirm("Confirma a criação do Fornecimento?", {
        title: "Confirmar",
        onClose: function(oAction) {
          if (oAction === "OK") {
            this._criarFornecimento();
          }
        }.bind(this),
        initialFocus: "CANCEL"
      });
    },

    _criarFornecimento: function() {
      this.getView().setBusy(true);

      var oModel = this.getView().getModel();
      var oSalesData = this.getView().getModel("SalesModel").getData();

      var oEntry = {
        Vbeln: oSalesData.SalesOrder
      };

      oModel.setDeferredGroups(["batchCreate"]);
      oModel.create("/FornecimentoSet", oEntry, {
        groupId: "batchCreate"
      });

      oModel.submitChanges({
        groupId: "batchCreate",
        success: function(oData, oResponse) {
          this.getView().setBusy(false);
          this._showLogFornecimento(oData);
        }.bind(this),
        error: function(oError) {
          this.getView().setBusy(false);
        }.bind(this)
      });
    },

    _showLogFornecimento: function(oObject) {
      var oBillingData = this.getView().getModel("BillingModel").getData();
      oBillingData.Log = [];

      oObject.__batchResponses[0].__changeResponses.forEach(function(oResponse) {
        if (oResponse.headers["custom-return"]) {
          var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]) || [];
          var sIconType = "";
          var sIconColor = "";

          oBillingReturn.forEach(function(e) {
            switch (e.type) {
              case "S":
                sIconType = "sap-icon://status-positive";
                sIconColor = "L1";
                break;
              case "I":
                sIconType = "sap-icon://status-inactive";
                sIconColor = "L0";
                break;
              case "W":
                sIconType = "sap-icon://status-critical";
                sIconColor = "L2";
                break;
              case "E":
                sIconType = "sap-icon://status-error";
                sIconColor = "L3";
                break;
            }

            oBillingData.Log.push({
              SalesOrder: oResponse.data.Vbeln,
              DeliveryDocument: "",
              BillingDocument: "",
              FiscalNote: "",
              MessageType: sIconType,
              MessageColor: sIconColor,
              Message: this._convertMessage(e.message)
            });
          }.bind(this));
        }
      }.bind(this));

      this.getView().getModel("BillingModel").refresh(true);
      this._getBillingLogDialog("Log Fornecimento").open();
    },
    /* D0012620 - Alocação de Estoque  Fornecimento - Fim */

    /* D0012620 - Alterar processo de consulta de fluxo de documentos */
    _showDialogFluxos: function() {
      var oOrdem = this.getView().getModel("SalesModel").getData();
      var aFilters = [];

      aFilters.push(new sap.ui.model.Filter("Docnum", sap.ui.model.FilterOperator.EQ, oOrdem.SalesOrder));

      this.getView().setBusy(true);

      this.getModel().read("/FloxoOvSet", {
        filters: aFilters,
        success: function(odata) {
          this.getView().setBusy(false);

          if (odata.results.length === 0) {
            MessageBox.error("Nenhum registro encontrato");
            return;
          }

          var aList = odata.results;
          var aRoot = aList.filter(function(e) {
            return !e.Docnuv
          });

          aRoot.forEach(function(e) {
            var aChildren = aList.filter(function(x) {
              return x.Docnuv === e.Docnum
            });

            if (aChildren.length > 0) {
              e.nodes = this._getChildren(aChildren, aList);
            }
          }.bind(this));

          var json = {
            "nodes": aRoot
          };

          var oModel = new sap.ui.model.json.JSONModel();
          var oData = {};

          oData.Fluxos = json;
          oModel.setData(oData);

          if (this._oDialog4) {
            this._oDialog4.destroy();
          }

          this._oDialog4 = sap.ui.xmlfragment("arcelor.view.Fluxo", this);
          this._oDialog4.setModel(oModel);
          this._oDialog4.open();
        }.bind(this)
      });
    },

    _getChildren: function(aChildren, aList) {
      aChildren.forEach(function(e) {
        var aNodes = aList.filter(function(x) {
          return x.Docnuv === e.Docnum
        });

        if (aNodes.length > 0 && e.Docnum !== e.Docnuv) {
          e.nodes = aNodes.sort(function(a, b) {
            return a.Erzet.ms > b.Erzet.ms
          });
          this._getChildren(aNodes, aList);
        }
      }.bind(this));

      return aChildren;
    },

    statusText: function(sValue) {
      try {
        var texto = sValue;

        switch (sValue) {
          case "concluído":
            texto = "Concluído";
            break;
        }

        return texto;
      } catch (err) {
        return state;
      }
    },

    statusState: function(sValue) {
        try {
          var state = "None";

          switch (sValue) {
            case "Recusada":
            case "Rejeitada":
              state = "Error";
              break;
            case "concluído":
            case "Autorizada":
              state = "Success";
              break;
            case "Não compensado":
            case "Em processamento":
              state = "Warning";
              break;
            case "C":
              state = "None";
              break;
          }

          return state;
        } catch (err) {
          return state;
        }
      }
      /* D0012620 - Alterar processo de consulta de fluxo de documentos */
  });
});