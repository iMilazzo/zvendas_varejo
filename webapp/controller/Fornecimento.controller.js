sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, History, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("arcelor.controller.Fornecimento", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("Fornecimento").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function(oEvent) {	
			var oArgument = oEvent.getParameter("arguments");
			
			if (oArgument && oArgument.vbeln) {
				this.onSearch(oArgument.vgbel, oArgument.vbeln);
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
		
	    _attachIconRendering: function (iconId) {
	    	var icon = iconId.getProperty("src");
	    	var sStatus;
	    	
    		if (icon === "sap-icon://status-positive") {
	    		sStatus = "LL1";
    		} else if (icon === "sap-icon://status-inactive") {
	    		sStatus = "CL0";
    		} else {
	    		sStatus = "RL1";
	    	}
 
            var sStatusClass = "statusUiIcon" + sStatus;

            iconId.removeStyleClass("statusUiIconL1");
            iconId.removeStyleClass("statusUiIconL2");
            iconId.removeStyleClass("statusUiIconL3")
            iconId.addStyleClass(sStatusClass);
	    },			
		
		onSearch: function(sVgbel, sVbeln) {
					
			var onSuccess = function (oResult, oResponse) {
				this.getView().setBusy(false);
				
				var aItens = oResult.ToItens.results;
				var status = this._getStatus(oResult);
				
				this.getViewModel().setProperty("/Status", status);
				this.getViewModel().setProperty("/Vgbel", sVgbel);
				this.getViewModel().setProperty("/Vbeln", oResult.Vbeln);
				this.getViewModel().setProperty("/Kunnr", oResult.Kunnr);
				this.getViewModel().setProperty("/Name1", oResult.Name1);
				this.getViewModel().setProperty("/Lfdat", oResult.Lfdat);
				this.getViewModel().setProperty("/Btgew", oResult.Btgew);
				this.getViewModel().setProperty("/Gewei", oResult.Gewei);	
				this.getViewModel().setProperty("/Wbstk", oResult.Wbstk);
				this.getViewModel().setProperty("/Fkstk", oResult.Fkstk);
				this.getViewModel().setProperty("/Itens", aItens);
				this.getViewModel().setProperty("/WbstkIcon", this._getStatusIcon(oResult.Wbstk));
				this.getViewModel().setProperty("/WbstkText", this._getStatusText(oResult.Wbstk));				
				this.getViewModel().setProperty("/KostkIcon", this._getStatusIcon(oResult.Kostk));
				this.getViewModel().setProperty("/KostkText", this._getStatusText(oResult.Kostk));
				this.getViewModel().setProperty("/FkstkIcon", this._getStatusIcon(oResult.Fkstk));
				this.getViewModel().setProperty("/FkstkText", this._getStatusText(oResult.Fkstk));				
				this.getViewModel().setProperty("/ShowDesfazer", (oResult.Kostk === "B" || oResult.Kostk === "C"));
							
		        this._attachIconRendering(this.byId("icon1"));
		        this._attachIconRendering(this.byId("icon2"));
		        this._attachIconRendering(this.byId("icon3"));				
				
			}.bind(this);

			var onError = function (oError) {
				this.getView().setBusy(false);
			}.bind(this);

			this.getModel().read("/FornecimentoSet('" + sVbeln + "')", {
				urlParameters: {
					$expand: "ToItens"
				},
				success: onSuccess,
				error: onError
			});
			
			this.getView().setBusy(true);			
		},
		
		onDesfazer: function(oEvent) {
			var sVbeln = this.getViewModel().getProperty("/Vbeln");
			
			var oObject = {
	    		DelivNumb: sVbeln
			};
			
			var aRemessas = [];			
			aRemessas.push(oObject);
			           
			MessageBox.confirm("Confirma eliminação do Picking?", {
				title: "Confirmar",
				onClose: function (oAction) {
					if (oAction === "OK") {
						this._desfazerPicking(aRemessas);
					}
				}.bind(this),
				initialFocus: "CANCEL"
			});             
		},
		
		onEliminar: function(oEvent) {			
			var sFkstk = this.getViewModel().getProperty("/Fkstk");
			
			if (sFkstk === "B" || sFkstk === "C") {
				MessageBox.error("Documento já faturado. Para eliminar o fornecimento é necessário antes estornar a NF", {
					title: "ArcelorMittal",
					styleClass: "sapUiSizeCompact"
				});
				return;
			}
			
			var sMessage = "Confirma a eliminação da remessa?";
			var sVbeln   = this.getViewModel().getProperty("/Vbeln");
			var sWbstk   = this.getViewModel().getProperty("/Wbstk");			
			var bConfEstForn = true;
			var bConfEstSm   = false;
			
			if (sWbstk === "B" || sWbstk === "C") {
				sMessage = "Saída de Mercadoria já foi realizada. Confirma estorno da Saída de Mercadoria?";
				bConfEstForn = false;
				bConfEstSm   = true;
			}
						
			var aRemessas = [];
			var oObject = {
	    		DelivNumb: sVbeln,
				ConfEstForn: bConfEstForn,
				ConfEstSm: bConfEstSm    					
			};
			
			aRemessas.push(oObject);
                        
			MessageBox.confirm(sMessage, {
				title: "Confirmar",
				onClose: function (oAction) {
					if (oAction === "OK") {
						this._eliminarRemessas(aRemessas);
					}
				}.bind(this),
				initialFocus: "CANCEL"
			});  			
		},
		
		_desfazerPicking: function(aRemessas) {
			this.getView().setBusy(true);
		  	
		    var oModel = this.getModel();
		    oModel.setDeferredGroups(["batchDelete"]);        
		      
		    aRemessas.forEach(function(e) {
		    	var oEntry = {
	    			DelivNumb: e.DelivNumb,
	    			AltPicking: "D"
	    		};	
		    	oModel.create("/FornecimentoItemSet", oEntry, { groupId: "batchDelete" });
		    });
		      
		    oModel.submitChanges({ groupId: "batchDelete", 
		        success: function(oData, oResponse) {
		        	this.getView().setBusy(false);
		        	this.showLogFornecimento(oData);
		        }.bind(this),
		        error: function(oError) {
		        	this.getView().setBusy(false);
		        }.bind(this)
		    });			
		},		
		
		_eliminarRemessas: function(aRemessas) {
			this.getView().setBusy(true);
		  	
		    var oModel = this.getModel();
		    oModel.setDeferredGroups(["batchDelete"]);        
		      
		    aRemessas.forEach(function(e) {
		    	var oEntry = {
	    		  DelivNumb: e.DelivNumb,
	    		  ConfEstForn: e.ConfEstForn,
	    		  ConfEstSm: e.ConfEstSm
	    		};	
		    	oModel.create("/FornecimentoItemSet", oEntry, { groupId: "batchDelete" });
		    });
		      
		    oModel.submitChanges({ groupId: "batchDelete", 
		        success: function(oData, oResponse) {
		        	this.getView().setBusy(false);
		        	this.showLogFornecimento(oData);
		        }.bind(this),
		        error: function(oError) {
		        	this.getView().setBusy(false);
		        }.bind(this)
		    });			
		},
		
	    showLogFornecimento: function(oObject) {
	    	var sVgbel = this.getViewModel().getProperty("/Vgbel");
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
		                SalesOrder: sVgbel,
		                DeliveryDocument: e.delivNumb,
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
	        
	        this._oDialog.setTitle("Log Cancelamento Fornecimento");
	        
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
			this.getOwnerComponent().getRouter().navTo("CancelarFornecimento", {
				mode: "Change"
			}, true);
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},
		
		_getStatus: function(oObject) {
			var status = "";
			
			if (oObject.Wbstk === "C" && oObject.Kostk === "C" && oObject.Fkstk === "C") {
				status = "Concluído";
			} else if (oObject.Wbstk === "A" || oObject.Kostk === "A" || oObject.Fkstk === "A" ||
					oObject.Wbstk === "B" || oObject.Kostk === "B" || oObject.Fkstk === "B") {
				status = "Em processamento";
			}
			
			return status;
		},
		
	    _getStatusText: function (value) {
	        var texto = "";

	        switch (value) {
		        case "A":
		        case "B":
		          texto = "Em Processamento";
		          break;
		        case "C":
		          texto = "Concluído";
		          break;
		        default:
		        	texto = "Não relevante"
		          break;
	        }

	        return texto;
        },		
		
	    _getStatusIcon: function (value) {
	        var icone = "";

	        switch (value) {
		        case "A":
		        case "B":	
		          icone = "sap-icon://status-inactive";
		          break;
		        case "C":
		          icone = "sap-icon://status-positive";
		          break;
		        default:
		        	icone = "sap-icon://status-critical";
		          break;
	        }

	        return icone;
        },
        
		quantityValue: function (value) {
			if (!value) {
				return "";
			}
			
			return parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
		},        
	});
});