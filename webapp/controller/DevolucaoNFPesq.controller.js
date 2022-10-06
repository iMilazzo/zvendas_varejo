sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/BusyIndicator"
	], function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, BusyIndicator) {
	"use strict";
	
	var valueHelpDialog1;
	var aDataCargaDados = 0;
    var aItensRemoved = [];
    var aDataContatos = [];
    var aDataRecebedorMerc = [];
	var _sViewBack;
	var _sVbeln;
	  
	return BaseController.extend("arcelor.controller.DevolucaoNFPesq", {
	
		onInit: function () {
			this.getRouter().getRoute("DevolucaoNFPesq").attachPatternMatched(this._onObjectMatched, this);
		},
		
		_onObjectMatched: function (oEvent) {			
			this.onClear();

			var oArgument = oEvent.getParameter("arguments");
			
			_sVbeln = sessionStorage.getItem("Vbeln");
			_sViewBack = sessionStorage.getItem("ViewBack");

			if (oArgument && oArgument.doc) {
				this.byId("idNotaFiscal").setValue(oArgument.nfenum);
				this.byId("idNotaFiscal").setEnabled(false);
				this.getViewModel().setProperty("/Docnum", oArgument.doc);
				this.getViewModel().setProperty("/Nfenum", oArgument.nfenum);
				this.getViewModel().setProperty("/Fatura", oArgument.fatura);
			}
		},
				
		onClear: function () {
			this.byId("idMotivo").setSelectedItem(null);			
			this.byId("idTipo").setSelectedKey("ROB");			
			this.byId("idCliente").setValue("");
			this.byId("pnlNota").setVisible(false);
			this.byId("btnDevolver").setVisible(false);
						
			var oObject = {
				Docnum: "",	
				Nfenum: "",
				Fatura: "",
				Kunnr: "",				
				Name1: "",
				Vbeln: "",
				VbelnVl: "",
				Xblnr: "",
				Docstat: "",
				Code: "",
				Items: []
			};
			
			var oModel = new JSONModel(oObject);
			this.getView().setModel(oModel, "view");
			this._destroyCadastroCliente();			
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
		
		onSearchNf: function(oEvt){
			var idNotaFiscal = this.getViewModel().getProperty("/Docnum"),
				idMotivo     = this.byId("idMotivo").getSelectedKey(),
				idTipo       = this.byId("idTipo").getSelectedKey(),
				idCliente    = this.byId("idCliente").getValue(),
				aFilters 	 = [];

	        if (!idNotaFiscal || !idMotivo || !idTipo || !idCliente) {
				MessageBox.information("Preencher todos os campos antes de prosseguir", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
				
	        	return;
	        }

        	aFilters.push(new Filter("Docnum", FilterOperator.EQ, idNotaFiscal));
        	aFilters.push(new Filter("Auart", FilterOperator.EQ, idTipo));
        	aFilters.push(new Filter("Kunnr", FilterOperator.EQ, idCliente));

        	this.getView().setBusy(true);
	        
	        this.getModel().read("/ItensOrdemDevolSet", {
	        	filters: aFilters,
		        success: function(oResultData, oResponse) {
		        	this.getView().setBusy(false);
		        	
		        	var aItens = oResultData.results;
		        	var oItem  = aItens.filter(function(e) { return e.Mensagem !== "" })[0];
		        	
		        	if (oItem) {
						MessageBox.information(oItem.Mensagem, {
							title: "ArcelorMittal",
							styleClass: "sapUiSizeCompact"
						});
						return;
		        	}
		        	
		        	var isVisible = aItens.length > 0 ? aItens[0].Model === "65" : false;
		        	
		        	this.getViewModel().setProperty("/Items", aItens);
					this.byId("btnDevolver").setVisible(isVisible);
		        	this.byId("pnlNota").setVisible(true);
		        }.bind(this),
	        	error: function(erro) {
	        		this.getView().setBusy(false);
           		}.bind(this)
	        });	       
		},
		
		onDevolver: function() {
			var idNotaFiscal = this.getViewModel().getProperty("/Docnum"),			
				idNfenum     = this.getViewModel().getProperty("/Nfenum"),
				idMotivo     = this.byId("idMotivo").getSelectedKey(),
				idTipo       = this.byId("idTipo").getSelectedKey(),
				idCliente    = this.byId("idCliente").getValue();

	        if (!idNotaFiscal || !idMotivo || !idTipo || !idCliente) {
				MessageBox.information("Preencher todos os campos antes de prosseguir", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
				
	        	return;
	        }
        		
	        var sConfirmacao = "Você irá devolver a Nota Fiscal " + idNfenum + ". Confirma a operação?";

		    MessageBox.confirm(sConfirmacao, {
				title: "Confirmar",
				onClose: function(oAction) {					
					if (oAction === "OK") {
			        	this._devolveNotaFiscal(idNotaFiscal, idMotivo, idTipo, idCliente);		        	
					}
				}.bind(this),
				initialFocus: "CANCEL"
			});	
		},
		
		onDevolverRob: function() {		
			var sDocnum  = this.getViewModel().getProperty("/Docnum"),
				sVbeln   = this.getViewModel().getProperty("/Vbeln"),
				sVbelnVl = this.getViewModel().getProperty("/VbelnVl"),
				sAuart   = this.byId("idTipo").getSelectedKey(),
				sAction  = "F"; // Faturar
			
			this._devolveNotaFiscalRob(sDocnum, sVbeln, sVbelnVl, sAuart, sAction);			
		},
		
		onCancelarRob: function() {		
			var sDocnum  = this.getViewModel().getProperty("/Docnum"),
				sVbeln   = this.getViewModel().getProperty("/Vbeln"),
				sVbelnVl = this.getViewModel().getProperty("/VbelnVl"),
				sAuart   = this.byId("idTipo").getSelectedKey(),
				sAction  = "C"; // Cancelar
			
			this._devolveNotaFiscalRob(sDocnum, sVbeln, sVbelnVl, sAuart, sAction);			
		},		
		
		_devolveNotaFiscal: function(sDocnum, sAugru, sAuart, sKunnr) {
			BusyIndicator.show();
			
			var sKey = "Docnum='" + sDocnum + "'," +
					   "Augru='"  + sAugru  + "'," +
					   "Auart='"  + sAuart  + "'," +
					   "Kunnr='"  + sKunnr  + "'";
			
			var sPath = "/DevolucaoNfceSet(" + sKey + ")";
			
	        this.getModel().read(sPath, {
		        success: function(oResultData, oResponse) {
		        	BusyIndicator.hide();
		        	
		        	var oItem = oResultData;

		        	if (oItem.Message) {
						MessageBox.information(oItem.Message, {
							title: "ArcelorMittal",
							styleClass: "sapUiSizeCompact"
						});
						return;
		        	}
		        	
		        	if (oItem.DevolRob) {
		        		this._showDevolveNotaFiscalRob(oItem);
		        		return;
		        	}
		        
		        	this._showResultado(oItem);

		        }.bind(this),
	        	error: function(erro) {
	        		BusyIndicator.hide();
           		}.bind(this)
	        });	
		},
		
		_devolveNotaFiscalRob: function(sDocnum, sVbeln, sVbelnVl, sAuart, sAction) {		
			BusyIndicator.show();
			
			var sKey = "Docnum='"  + sDocnum  + "'," +
					   "Vbeln='"   + sVbeln   + "'," +
					   "VbelnVl='" + sVbelnVl + "'," + 
					   "Auart='"   + sAuart   + "'," +
					   "Action='"  + sAction  + "'";
			
			var sPath = "/DevolucaoNfceRobSet(" + sKey + ")";
			
	        this.getModel().read(sPath, {
		        success: function(oResultData, oResponse) {
		        	BusyIndicator.hide();
		        	
		        	var oItem = oResultData;

		        	if (oItem.Message) {
						MessageBox.information(oItem.Message, {
							title: "ArcelorMittal",
							styleClass: "sapUiSizeCompact"
						});
						this._valueHelpDialog.close();
						return;
		        	}
		        		        	
		        	// Faturar
		        	if (sAction === "F") {
		        		this._showResultado(oItem);
		        	} else {
		        		this.onCloseNF();
		        	}
		        }.bind(this),
	        	error: function(erro) {
	        		BusyIndicator.hide();
           		}.bind(this)
	        });	
		},		
		
		_showDevolveNotaFiscalRob: function(oItem) {
			var oViewModel = this.getViewModel();
			
			oViewModel.setProperty("/Vbeln", oItem.Vbeln);
			oViewModel.setProperty("/VbelnVl", oItem.VbelnVl);
			
			if (this._valueHelpDialog) {
				this._valueHelpDialog = null;
			}
			
			this._valueHelpDialog = sap.ui.xmlfragment("arcelor.view.DevolucaoNFPesqRob", this);		
			this.getView().addDependent(this._valueHelpDialog); 			
			this._valueHelpDialog.open();				
		},
		
		_showResultado : function(oItem) {
			var oViewModel = this.getViewModel();
			
			oViewModel.setProperty("/Vbeln", oItem.Vbeln);
			oViewModel.setProperty("/VbelnVl", oItem.VbelnVl);
			oViewModel.setProperty("/VbelnVf", oItem.VbelnVf);
			oViewModel.setProperty("/Xblnr", oItem.Xblnr);
			oViewModel.setProperty("/Docstat", oItem.Docstat);
			oViewModel.setProperty("/Code", oItem.Code);
			
			if (this._valueHelpDialog) {
				this._valueHelpDialog = null;
			}
			
			this._valueHelpDialog = sap.ui.xmlfragment("arcelor.view.DevolucaoNFPesqResult", this);		
			this.getView().addDependent(this._valueHelpDialog); 			
			this._valueHelpDialog.open();				
		},
		
		onCloseNF: function() {
			this._valueHelpDialog.close();
			this.onNavBack();
		},
		
		onNavBack: function (oEvent) {
			var sFatura = this.getViewModel().getProperty("/Fatura");
			
			sessionStorage.setItem("Vbeln", _sVbeln);
			sessionStorage.setItem("ViewBack", _sViewBack);					
			this.getOwnerComponent().getRouter().navTo("NotaFiscal", {
				mode: "Change",
		        fatura: sFatura
			}, true);
		},		
		
		getViewModel: function () {
			return this.getView().getModel("view");
		},			
		
		// Exibe pop-up Pesquisar Cliente
		onCustomerValueHelp: function (oEvent) {
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
			
			this._valueHelpDialog = sap.ui.xmlfragment("arcelor.view.ClientesPesquisaDialog", this);
			this.getView().addDependent(this._valueHelpDialog);
			this._valueHelpDialog.getBinding("items").filter(
				[new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue)]
			);

			this._valueHelpDialog.open(sInputValue);
		},
		
		// Pesquisa Cliente
		handleSearchClientes: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getParameter("value");

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

			oEvent.getSource().getBinding("items").filter(aFilters);
		},
			
		// Exibe pop-up Cadastrar Cliente
	    actionCadastro: function (oEvent) {
	    	if (!valueHelpDialog1) {
	    		valueHelpDialog1 = sap.ui.xmlfragment("arcelor.view.ClientesCadastro", this);
		        this.getView().addDependent(valueHelpDialog1);
	    	}
	    	this._loadMasterData();
	        this._readListMasterData();
	        var oview = this;
	        sap.ui.getCore().byId("input-Matriz").addEventDelegate({
	          onfocusout: function (e) {
	            oview.lonChangeMatriz(e)
	          }
	        });		    		    	
	    	
	    	var thisView = this;
	    	 
	    	valueHelpDialog1.open();	    	
			sap.ui.getCore().byId("combo-tipoPessoacadastro").setSelectedKey("F");
			sap.ui.getCore().byId("combo-tipoPessoacadastro").setEnabled(false);	
	    },
	    
	    // Fechar pop-up Pesquisar e Cadastrar Cliente
        _handleValueHelpClose: function (oEvent) {
            var oSelectedItem, fieldInput, aContexts, oModel;
            var bc, pos, codigo, nome, oTable, m, data, property1;
            var codigo, nome;
            var nomeSplit, localidadeSplit, enderecoSplit, localSplit, endereco, local;
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oModelData = this.getModel("SalesModel").getData();
            
            fieldInput = this.getView().byId(this.inputId);
            if (fieldInput === undefined) {
              fieldInput = sap.ui.getCore().byId(this.inputId);
            }
            
            if (oSelectedItem) {
              fieldInput.setValue(oSelectedItem.getDescription());
            }
            oEvent.getSource().getBinding("items").filter([]);
            if (this.inputId === "input-Contatos") {
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
                function (oContext) {
                  return oContext.getObject().Codcliente;
                }
              );
              nome = aContexts.map(
                function (oContext) {
                  return oContext.getObject().Nome;
                }
              );
              sap.ui.getCore().byId("input-PagadorCodigo").setValue(codigo);
              sap.ui.getCore().byId("input-PagadorNome").setValue(nome);
            }
            if (this.inputId === "input-RecebedorFatura") {
              aContexts = oEvent.getParameter("selectedContexts");
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
            if (this.inputId === "__component0---devolucaonf--idCliente") {
              if (oSelectedItem) {
                var oCustomerObject = oEvent.getParameter("selectedContexts")[0].getObject();
                oModelData.CustomerId = oCustomerObject.Codcliente;
                oModelData.CustomerName = oCustomerObject.Nome;
                oModelData.TaxDomcl = (oCustomerObject.Domiciliofiscal === "X" || oCustomerObject.Domiciliofiscal === "J" ? "X - Contribuinte" :
                  "Z - Não-Contribuinte");
                oModelData.CustomerDoct = (oCustomerObject.Cpf && oCustomerObject.Cpf.length > 0 ? oCustomerObject.Cpf : oCustomerObject.Cnpj);
                oModelData.CustomerVisible = true;
              }
              oEvent.getSource().getBinding("items").filter([]);
              this.getModel("SalesModel").refresh(true);
              this._loadCustomerHelpers();
            }
        },	    
	    
/* Todo código daqui em diante é referente ao Cadastro de Cliente. */
        
	    handleCancelPress: function () {
	        this._fieldsDisableEnable("Cancel");
	        this._clearForm();
	        valueHelpDialog1.close();
        },
        
        onSearch: function (evt) {
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
            var onError = function (odata, response) {
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
                  onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      thisView._clearForm();
                      sap.ui.getCore().byId("save").setVisible(true);
                      thisView._fieldsDisableEnable("Edit");
                      jQuery.sap.delayedCall(500, this, function () {
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
            var onSuccess = function (odata) {
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
                      onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {

                          thisView._clearForm();
                          sap.ui.getCore().byId("save").setVisible(true);
                          sap.ui.getCore().byId("cancel").setVisible(true);
                          thisView._fieldsDisableEnable("Edit");
                          thisView._loadMasterData();
                          jQuery.sap.delayedCall(500, this, function () {
                            sap.ui.getCore().byId("input-nome").focus();
                          });
                          if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F" || sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() ===
                            "G") {
                            sap.ui.getCore().byId("input-DomicilioFiscal").setSelectedKey('Z');
                            sap.ui.getCore().byId("input-SubstTributaria").setSelectedKey('X');
                            sap.ui.getCore().byId("input-SetorInd").setSelectedKey('1051');
                            sap.ui.getCore().byId("input-multiComboxOrganizacao").addSelectedKeys('OVJF');
                            sap.ui.getCore().byId("input-multiComboxCanal").addSelectedKeys("40");
                          }
                          if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "F" || sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() ===
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
                      onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {

                          thisView._clearForm();
                          sap.ui.getCore().byId("save").setVisible(true);
                          sap.ui.getCore().byId("cancel").setVisible(true);
                          thisView._fieldsDisableEnable("Edit");
                          thisView._loadMasterData();
                          jQuery.sap.delayedCall(2000, this, function () {
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
        
        _loadMasterData: function () {
            var filters = [];
            var filter = "";
            var filter1 = "";
            filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "OV;CD;SA;CL;CN;UF;SI");
            filter1 = new sap.ui.model.Filter("Coddadomestre", sap.ui.model.FilterOperator.EQ, "X");
            filters.push(filter, filter1);
            var list = sap.ui.getCore().byId("input-dadosMestres");
            var binding = list.getBinding("items");
            binding.filter(filters);
        },

        handleSavePress: function () {
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
                  success: function (success, response, odata) {
                    thisView.getView().setBusy(false);
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
                success: function (oCreatedEntry, success, response, odata) {
                  var hdrMessage = success.headers["sap-message"];
                  var hdrMessageObject = JSON.parse(hdrMessage);
                  var message = hdrMessageObject.message.split("-");
                  if (message[0] !== "E" && message[0].indexOf("Erro") == -1) {
                    var messageCodCliente = hdrMessageObject.message.split(" ");
                    sap.ui.getCore().byId("input-Codcliente").setValue(messageCodCliente[1]);
                    thisView.byId("idCliente").setValue(messageCodCliente[1]);
//                    sap.ui.getCore().byId("combo-tipoPessoacadastro").setSelectedKey(null);
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
                    sap.ui.getCore().byId("input-Codcliente").setValue(oModelData.CustomerId + " - " + oModelData.CustomerName);
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
                error: function (oError, response) {
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

          onMaskTelefone: function (oEvent) {
            var telefone = oEvent.getParameter("value");
            sap.ui.getCore().byId("input-Telefone").setValue(this.utilFormatterTelefone(telefone));
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
        
        onSearchCity: function () {
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

        utilSearchCity1: function (oEvent) {
            var filters = [];
            var filter;
            filter = new sap.ui.model.Filter("Estado", sap.ui.model.FilterOperator.EQ, oEvent);
            filters.push(filter);
            var cidades = sap.ui.getCore().byId("input-Cidade");
            var binding = cidades.getBinding("items");
            binding.filter(filters);
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
            var oTableData = sap.ui.getCore().byId("listRecebedorMerc");
            oTableData.setModel(oModel);
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
        
        onDeleteSelectedItemsRecebedor: function (oEvent) {
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
            if (sap.ui.getCore().byId("input-Codcliente").getValue() !== "") {
              filter.push(new sap.ui.model.Filter('codclicanal', sap.ui.model.FilterOperator.EQ, this.byId("input-Codcliente").getValue()));
            }
            if (sap.ui.getCore().byId("combo-tipoPessoacadastro").getSelectedKey() === "J") {
              filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'M'));
            } else {
              filters.push(new Filter("Tipocliente", sap.ui.model.FilterOperator.Contains, 'Q'));
            }
            var binding = oEvent.getSource().getBinding("items");
            binding.filter(filters);
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
                     
        _fieldsDisableEnable: function (action) {
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
        
        _clearForm: function () {
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
        
        _readContatos: function (field) {
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
        
        onMaskCEP: function (oEvent) {
            var thisView = this;
            var cep = thisView.utilClearCharToNumber(oEvent.getParameter("value"));
            if (cep.length >= 8) {
              sap.ui.getCore().byId("input-Cep").setValue(this.utilFormatterCEP(cep));
              var oView = this.getView();
              var oData = this.getView().getModel();
              var estaView = this;
              var onError = function (odata, response) {
                oView.setBusy(false);
                sap.m.MessageBox.show('Cep não encontrado', {
                  icon: sap.m.MessageBox.Icon.INFORMATION,
                  title: "ArcelorMittal",
                  actions: [sap.m.MessageBox.Action.OK],
                  onClose: function (oAction) {
                    sap.ui.getCore().byId("input-endereco").setValue("");
                    sap.ui.getCore().byId("input-Bairro").setValue("");
                    sap.ui.getCore().byId("input-numero").setValue("");
                    sap.ui.getCore().byId("input-Complemento").setValue("");
                    sap.ui.getCore().byId("input-Regiao").setSelectedKey(null);
                    sap.ui.getCore().byId("input-Cidade").setSelectedKey(null);
                  }
                });
              };
              var onSuccess = function (odata) {
                estaView.utilSearchCity1(odata.Estado);
                var endereco = odata.TpLogradouro + " " + odata.Logradouro;
                sap.ui.getCore().byId("input-endereco").setValue(endereco);
                sap.ui.getCore().byId("input-Bairro").setValue(odata.Bairro);
                sap.ui.getCore().byId("input-Regiao").setSelectedKey(odata.Estado);
                sap.ui.getCore().byId("input-numero").setValue("");
                sap.ui.getCore().byId("input-Complemento").setValue("");
                sap.ui.getCore().byId("input-Cidade").setSelectedKey(odata.CodCidade);
                
                var sEnd = sap.ui.getCore().byId("input-endereco").getValue();
				var sBair = sap.ui.getCore().byId("input-Bairro").getValue();
				sEnd = sEnd.toUpperCase();
				sBair = sBair.toUpperCase();
				sap.ui.getCore().byId("input-endereco").setValue(sEnd);
				sap.ui.getCore().byId("input-Bairro").setValue(sBair);
                
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
        
        buscaMatriz: function () {
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
            var onSuccess = function (odata) {
              oView.setBusy(false);
              if (odata.results[0].message == 'Sucesso') {
                sap.ui.getCore().byId("input-Matriz").setValue(odata.results[0].matriz);
                var sPathpag  =  "/ClientesSet(Codcliente='" + odata.results[0].matriz +
                  "',Nome='',Cnpj='',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='" + sap.ui.getCore().byId("input-Codcliente").getValue() +
                  "')";
                var sInputValue = odata.results[0].matriz;
                oDataPag.read(sPathpag, {
                  success: function (oResult) {
                    sap.ui.getCore().byId("input-PagadorCodigo").setValue(sInputValue);
                    sap.ui.getCore().byId("input-PagadorNome").setValue(oResult.Nome);
                    sap.ui.getCore().byId("input-Pagador").setValue("");
                  },
                  error: function (oResult) {
                    // alert("Código do cliente não encontrado.")
                  },
                });
              }
            };
            var onError = function (odata) {
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

        liveChangeCobranca: function (oEvent) {
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

        lonChangeMatriz: function (oEvent) {
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
              success: function (oResult) {
                sap.ui.getCore().byId("input-PagadorCodigo").setValue(sInputValue);
                sap.ui.getCore().byId("input-PagadorNome").setValue(oResult.Nome);
              },
              error: function (oResult) {
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
        
        handleTableDialogPress: function (oEvent) {
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
              jQuery.sap.delayedCall(2500, thisView, function () {
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
            
            if (oEvent.getParameter("selectedItem")) {
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
	                    sap.ui.getCore().byId("save").setVisible(true);
	                    sap.ui.getCore().byId("cancel").setVisible(true);
	                    thisView._fieldsDisableEnable("Edit");
	                    thisView._loadMasterData();
	                    jQuery.sap.delayedCall(500, this, function () {
	                      sap.ui.getCore().byId("input-nome").focus();
	                    });
	                    var sPath = "/ClientesSet(Codcliente='" + id + "',Nome='',Cnpj='" + thisView.utilFormatterCPFCNPJClear(sap.ui.getCore().byId(
	                      "searchCnpjCpf").getValue()) + "',Cpf='',Tipocliente='',Tipoclientesap='',codclicanal='')";
	                    oData.read(sPath, {
	                      success: onSuccess,
	                      error: onError
	                    });
	                    thisView.buscaMatriz();
	                  }
	                }
	              }
	            );
            }
        }, 
        
        _readCustomerData: function (sCustomerId) {
            var aFilters = [];
            this.getView().setBusy(true);
            var oModelData = this.getModel("SalesModel").getData();
            aFilters.push(new Filter("Codcliente", FilterOperator.EQ, sCustomerId));
            if (oModelData.Mode == 'Change' || oModelData.Model == 'Copy') {
              aFilters.push(new Filter("Tipocliente", FilterOperator.EQ, 'W'));
            }
            this.getModel().read("/ClientesSet", {
              filters: aFilters,
              success: function (oData) {
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
        
        _loadCustomerHelpers: function () {
            var thisView = this.getView();
            var aFilters = [];
            var sCliente = this.getModel("SalesModel").getData().CustomerId;
            var sOrdemVenda = this.getModel("SalesModel").getData().SalesOrder;
            aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CE;CC;CD,CE;CC;CD"));
            aFilters.push(new Filter("Codcliente", sap.ui.model.FilterOperator.EQ, sCliente));
            aFilters.push(new Filter("OrdemVenda", sap.ui.model.FilterOperator.EQ, sOrdemVenda));
            this.getView().setBusy(true);
            this.getModel().read("/DM_DadoMestreOVSet", {
              filters: aFilters,
              success: function (oData) {
                this.getView().setBusy(false);
                var aComboEntrega = [];
                var aComboCobranca = [];
                var aComboCanal = [];
                oData.results.forEach(function (oEntry) {
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
//                var oModelData = this.getModel("SalesModel").getData();
//                oModelData.ComboCanal = aComboCanal;
//
//                if (aComboCanal.length == 1) {
//                  oModelData.SalesChannel = aComboCanal[0].Coddadomestre;
//                  thisView.byId("id-ComboCanal").setSelectedKey(oModelData.SalesChannel);
//                  this._evalSalesChannel();
//                }
//
//                oModelData.ComboEntrega = aComboEntrega;
//                if (aComboEntrega.length == 1) {
//                  oModelData.DeliveryAddress = aComboEntrega[0].Coddadomestre;
//                  this.byId("id-ComboEntrega").setSelectedKey(oModelData.DeliveryAddress);
//                }
//                oModelData.ComboCobranca = aComboCobranca;
//                if (aComboCobranca.length == 1) {
//                  oModelData.BillingAddress = aComboCobranca[0].Coddadomestre;
//                  this.byId("id-ComboCobranca").setSelectedKey(oModelData.BillingAddress);
//                }
                this.getModel("SalesModel").refresh(true);
              }.bind(this),
              error: function () {
                this.getView().setBusy(false);
              }.bind(this)
            });

        },

        _loadInitialHelpers: function (a) {
            var aFilters = [];
            var that = this;
            var sOrdemVenda = this.getModel("SalesModel").getData().SalesOrder;
            aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "TO;ES;CP;UT;VS"));
            aFilters.push(new Filter("OrdemVenda", sap.ui.model.FilterOperator.EQ, sOrdemVenda));
            this.getView().setBusy(true);
            this.getModel().read("/DM_DadoMestreOVSet", {
              filters: aFilters,
              success: function (oData) {
                this.getView().setBusy(false);
                var aComboTipoOperacao = [];
                var aComboEscritorio = [];
                var aComboCondPagto = [];
                var aComboCanal = [];
                var aComboUtilizacao = [];
                var aComboVersao = [];
                oData.results.forEach(function (oEntry) {
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
                this.getModel("SalesModel").refresh(true);
              }.bind(this),
              error: function () {
                this.getView().setBusy(false);
              }.bind(this)
            });
        },

        onCustomerValueHelp: function (oEvent) {
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
        }     
        

	});
});