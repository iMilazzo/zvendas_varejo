sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"	
], function (BaseController, JSONModel, History, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("arcelor.controller.EncerraPedidoList", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("EncerraPedidoList").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {			
			var oParameters = oEvent.getParameters();
			
			if (oParameters.arguments.mode !== "Change") {
				this.onClear();
			}			
		},
		
		onClearFilters: function() {
			this.byId("multiinput-ordem").setValue("");
			this.byId("multiinput-ordem").setTokens([]);
			this.byId("input-Cliente").setValue(null);
			this.byId("input-remessa").setValue("");
			this.byId("input-remessa").setDateValue(null);
		},

		onClear: function () {
			this.onClearFilters();
			this.byId("button-recusar").setEnabled(false);
			
			var oModel = this.getView().getModel("ordens");
			if (oModel) {
				oModel.setData(null);
			}
		},

		onBeforeRendering: function () {
//			this.getView().setBusy(true);
//
//			var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divNotaFiscal");
//			if (!autorizado) {
//				this.getRouter().getTargets().display("Unauthorized");
//				return false;
//			} else {
//				this.getView().setBusy(false);
//			}
		},

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("pedidos");
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},

		onClearFilters: function() {
			this.byId("multiinput-ordem").setValue("");
			this.byId("multiinput-ordem").setTokens([]);
			this.byId("input-Cliente").setValue(null);		
			this.byId("input-remessa").setValue("");
			this.byId("input-remessa").setDateValue(null);			
		},
		
	    onAddToken: function () {

	        var oMultiInput = this.getView().byId("multiinput-ordem");
	        var tokens = oMultiInput.getTokens();
	
	        var value = oMultiInput.getValue();
	
	        if (value !== "") {
	
	          if ($.isNumeric(value)) {
	
	            if (value.length <= 10) {
	
	              oMultiInput.setValue("");
	              var token = new sap.m.Token({
	                text: value,
	                key: tokens.length + 1
	              });
	              oMultiInput.addToken(token);
	
	            } else {
	
	              MessageBox.error('Permitido no máximo 10 caracteres!', {
	                title: "ArcelorMittal",
	                styleClass: "sapUiSizeCompact"
	              });
	
	              return false;	
	            }
	          } else {	
	            MessageBox.error('Valor informado deve ser numérico!', {
	              title: "ArcelorMittal",
	              styleClass: "sapUiSizeCompact"
	            });
	
	            return false;	
              }	
	        }
        },     

        handleValueHelp: function(oEvent) {

            var sInputValue, sSearchFiled;

            sInputValue = oEvent.getSource().getValue();
            sInputValue = this.utilFormatterCPFCNPJClearSearch(sInputValue);

            if ($.isNumeric(sInputValue) && sInputValue.length === 11) {
              sSearchFiled = "Cpf";
            }
            if ($.isNumeric(sInputValue) && sInputValue.length < 11) {
              sSearchFiled = "Codcliente";
            } else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
              sSearchFiled = "Cnpj";
            } else if (!$.isNumeric(sInputValue)) {
              sSearchFiled = "Nome";
            }

            if (this._oDialog) {
              this._oDialog.destroy();
            }

            this.inputId = oEvent.getSource().getId();

            this._oDialog = sap.ui.xmlfragment("arcelor.view.ClientesPesquisaDialog", this);
            this._oDialog.setModel(this.getView().getModel());

            // toggle compact style
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);

            // create a filter for the bindinghandleValueHelp
            var filters = [];
            filters.push(new sap.ui.model.Filter(sSearchFiled, sap.ui.model.FilterOperator.Contains, sInputValue));
            filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, 'W'));
            this._oDialog.getBinding("items").filter(filters);

            // open value help dialog filtered by the input value
            this._oDialog.open(sInputValue);
        },
          
        handleSearchClientes: function (oEvent) {
            var filters = [];
            var query = oEvent.getParameter("value");
            var query2 = query;
            query = this.utilFormatterCPFCNPJClearSearch(query);

            if ((query && query.length > 0) && (query.trim() !== "")) {

              var filter;

              if ($.isNumeric(query) && query.length === 11) {
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
              filters.push(new sap.ui.model.Filter('Tipocliente', sap.ui.model.FilterOperator.Contains, "W"));
            }

            var binding = oEvent.getSource().getBinding("items");
            binding.filter(filters);        	
        },
        
        _handleValueHelpClose: function (evt) {
            var oSelectedItem, fieldInput;

            oSelectedItem = evt.getParameter("selectedItem");

            if (oSelectedItem) {
              fieldInput = this.getView().byId(this.inputId);
              fieldInput.setValue(oSelectedItem.getDescription());
            }
            evt.getSource().getBinding("items").filter([]);
        },        
        
        onSearch: function (oEvent) {
			var aFilters = this._createFilter();
			
			if (aFilters.length === 0) {
				MessageBox.error("Preencha a Ordem ou Cliente ou a Data de Remessa", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});

				return;
			}
			
			this.getView().setBusy(true);
			
			this.getModel().read("/OVFornSaldoPendenteSet", {
				filters: aFilters,				
				success: function(oResultData, oResponse) {
					this.getView().setBusy(false);
					
					var aItens = oResultData.results;
					
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setSizeLimit(aItens.length);
					oModel.setData(aItens);							
					
					this.getView().setModel(oModel, "ordens");
					this.byId("button-recusar").setEnabled(aItens.length > 0);
					
				}.bind(this),
				error: function(oError) {
					this.getView().setBusy(false);
				}.bind(this)
			});
		},
		
		onOrdemVendaPress: function(oEvent) {
			var oSource = oEvent.getSource();
			var sPath   = oEvent.getSource().getParent().getBindingContextPath();
			var oModel  = oSource.getModel("ordens");
			var oItem   = oModel.getProperty(sPath);
			
	        this.getOwnerComponent().getRouter().navTo("EncerraPedido", {
    	        vbeln: oItem.Vbeln
	        }, true);
	    },

		onRecusar: function (oEvent) {
			var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
			
			if (aSelectedContexts.length === 0) {
				MessageBox.error("Selecionar pelo menos 1 item!");
		        return;
	        }
						
			var aPedidos = [];
			
            aSelectedContexts.forEach(function(e) {
            	aPedidos.push({ 
            		DelivNumb: e.getObject().Vbeln,
            	});            	
            });
                        
			MessageBox.confirm("Confirma a recusa do(s) registro(s) selecionado(s)?", {
				title: "Confirmar",
				onClose: function (oAction) {
					if (oAction === "OK") {
						this._recusarPedido(aPedidos);
					}
				}.bind(this),
				initialFocus: "CANCEL"
			});            
		},
		
		_recusarPedido: function(aPedidos) {
	          this.getView().setBusy(true);
	      	
	          var oModel = this.getModel();
	          oModel.setDeferredGroups(["batchCreate"]);        
	              
	          aPedidos.forEach(function(e) {
			  	 var oEntry = {
		  			DelivNumb: e.DelivNumb
			  	 };	
			     oModel.create("/OVFornSaldoPendenteItemSet", oEntry, { groupId: "batchCreate" });
			  });
	              
	          oModel.submitChanges({ groupId: "batchCreate", 
                  success: function(oData, oResponse) {
                    this.getView().setBusy(false);
                    this._showLogRecusa(oData);
                  }.bind(this),
                  error: function(oError) {
                    this.getView().setBusy(false);
                  }.bind(this)
	          });			
		},
		
		_showLogRecusa: function(oObject) {
	    	var oBillingData = this.getView().getModel("BillingModel").getData();
	        oBillingData.Log = [];
	                
	        oObject.__batchResponses[0].__changeResponses.forEach(function (oResponse) {
	            if (oResponse.headers["custom-return"]) {
	              var oBillingReturn = JSON.parse(oResponse.headers["custom-return"]) || [];
	              var sIconType  = "";
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
		                SalesOrder: e.messageV1 || "",
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
	      this._getBillingLogDialog().open();
	    },
	    
	    _getBillingLogDialog: function() {
	        if (!this._oDialog) {
	        	this._oDialog = sap.ui.xmlfragment("arcelor.view.FaturamentoLog", this);
	        	this.getView().addDependent(this._oDialog);
	        }
	        
	        this._oDialog.setTitle("Log Recusa OV");
	        
	        return this._oDialog;
        },
        
        onConfirmPopup: function (oEvent) {
        	this._getBillingLogDialog().close();            
        },
        
        _convertMessage: function (sMessage) {
            var tTextArea = document.createElement('textarea');
            tTextArea.innerHTML = sMessage;
            return tTextArea.value;
        },         
		
		_createFilter: function () {
			var aFilters = [],
     			aSelectedItems,
				dDateFrom,
				dDateTo,
				sValue;

			if (this.getView().byId("multiinput-ordem").getTokens()) {
				aSelectedItems = this.getView().byId("multiinput-ordem").getTokens();
				
				if (aSelectedItems.length) {
					for (var i = 0; i < aSelectedItems.length; i++) {
						sValue = aSelectedItems[i].getText();
						aFilters.push(new Filter("Vbeln", FilterOperator.EQ, sValue));
					}				
				}
			}

			if (this.byId("input-Cliente").getValue()) {
				sValue = this.byId("input-Cliente").getValue();
				aFilters.push(new Filter("Kunnr", FilterOperator.EQ, sValue));
			}

			if (this.getView().byId("input-remessa").getDateValue()) {
				dDateFrom = this.getView().byId("input-remessa").getFrom();
				dDateTo   = this.getView().byId("input-remessa").getTo();

				if (dDateFrom) {
					if (dDateTo) {
						aFilters.push(new Filter("Lfdat", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
					} else {
						aFilters.push(new Filter("Lfdat", FilterOperator.EQ, dDateFrom));
					}
				}
			}

			return aFilters;
		}     
	});
});