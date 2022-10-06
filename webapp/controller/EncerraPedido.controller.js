sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, History, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("arcelor.controller.EncerraPedido", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("EncerraPedido").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function(oEvent) {	
			var oArgument = oEvent.getParameter("arguments");
			
			if (oArgument && oArgument.vbeln) {
				this.onSearch(oArgument.vbeln);
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

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();			
		},
		
		onSearch: function(sVbeln) {
					
			var onSuccess = function (oResult, oResponse) {
				this.getView().setBusy(false);
				
				var aItens = oResult.ToItens.results;
				
				this.getViewModel().setProperty("/Vbeln", oResult.Vbeln);
				this.getViewModel().setProperty("/Kunnr", oResult.Kunnr);
				this.getViewModel().setProperty("/Name1", oResult.Name1);
				this.getViewModel().setProperty("/Werks", oResult.Werks);
				this.getViewModel().setProperty("/Itens", aItens);			
			}.bind(this);

			var onError = function (oError) {
				this.getView().setBusy(false);
			}.bind(this);

			this.getModel().read("/OVFornSaldoPendenteSet('" + sVbeln + "')", {
				urlParameters: {
					$expand: "ToItens"
				},
				success: onSuccess,
				error: onError
			});
			
			this.getView().setBusy(true);			
		},
			
		onRecusar: function(oEvent) {
			var aSelectedContexts = this.getView().byId("List").getSelectedContexts();
			
			if (aSelectedContexts.length === 0) {
				MessageBox.error("Selecionar pelo menos 1 item!");
		        return;
	        }
			
			var aPedidos = [];
			
            aSelectedContexts.forEach(function(e) {
            	aPedidos.push({ 
            		DelivNumb: e.getObject().RefDoc,
            		DelivItem: e.getObject().RefItem,
            	});            	
            });
			
			MessageBox.confirm("Confirma a recusa do registro?", {
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
	    			DelivNumb: e.DelivNumb,
	    			DelivItem: e.DelivItem
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
	    	var sVbeln = this.getViewModel().getProperty("/Vbeln");
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
		                SalesOrder: sVbeln,
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
		
		getViewModel: function() {
			return this.getView().getModel("view");	
		},		

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("EncerraPedidoList", {
				mode: "Change"
			}, true);		
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},		
        
		quantityValue: function (value) {
			if (!value) {
				return "";
			}
			
			return parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
		}        
	});
});