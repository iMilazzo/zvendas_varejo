sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"	
], function (BaseController, JSONModel, History, MessageBox, MessageToast, Filter, FilterOperator, 
		Spreadsheet, Export, ExportTypeCSV) {
	"use strict";

	var bDadoMestre = false;
	
	return BaseController.extend("arcelor.controller.LogProcFornecimentoAut", {

		onInit: function () {
			this.getRouter().getRoute("LogProcFornecimentoAut").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},

		_onObjectMatched: function (oEvent) {
			this.onClear();
			
			var oModel = this.getModel("log");
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
		

	    onAfterRendering: function () {
	        var filters = [];
	        var filter = "";

	        filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "CEN;CGM;CD;SAS;VS;EVN");
	        filters.push(filter);
	        filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
	          null ? "X" : ""));
	        filters.push(filter);

	        var list = this.getView().byId("inputDadoMestre");
	        var binding = list.getBinding("items");
	        binding.oModel.setSizeLimit(10000);

	        binding.filter(filters);

	        // Versão
	        filters = [];
	        filter = new sap.ui.model.Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, "VS");
	        filters.push(filter);
	        filter = new sap.ui.model.Filter("Testerfc", sap.ui.model.FilterOperator.EQ, (jQuery.sap.getUriParameters().get("TesteRfc") !==
	          null ? "X" : ""));
	        filters.push(filter);

	        var list2 = this.getView().byId("inputDadoMestreVersao");
	        var binding2 = list2.getBinding("items");
	        binding2.oModel.setSizeLimit(10000);

	        binding2.filter(filters);
	      },

	      inicioUpdateTabela: function (oEvt) {
	        this.getView().setBusy(true);
	      },

	      fimUpdateTabela: function (oEvt) {
	        this._carregaDadoMestre();
	        this.getView().setBusy(false);
	      },

	      _carregaDadoMestre: function () {
	        var aCentro = [],       //CEN
	          aGrupoMateriais = [], //CGM
	          aCanalDistr = [],     //CD
	          aSetorAtivSd = [],    //SAS
	          aEscritorio = [];     //EVN - Escritório Vendas Novo

	        if (bDadoMestre === false) {
	          bDadoMestre = true;

	          var oTabela = this.getView().byId("inputDadoMestre");
	          var oLinha = oTabela.getItems();
	          var oItem,
	            oCelulas;
	          var vCodconsulta,
	            vCoddadomestre,
	            vTextodadomestre;

	          for (var i = 0; i < oLinha.length; i++) {
	            oItem = oLinha[i];
	            oCelulas = oItem.getCells();

	            vCodconsulta = oCelulas[0].getValue();
	            vCoddadomestre = oCelulas[1].getValue();
	            vTextodadomestre = oCelulas[2].getValue();

	            // Centro
	            if (vCodconsulta === "CEN") {
	              aCentro.push({
	                Codconsulta: vCodconsulta,
	                Coddadomestre: vCoddadomestre,
	                Textodadomestre: vTextodadomestre
	              });
	            }

	            // Escritórios de Venda
	            if (vCodconsulta === "EVN") {
	              aEscritorio.push({
	                Codconsulta: vCodconsulta,
	                Coddadomestre: vCoddadomestre,
	                Textodadomestre: vTextodadomestre
	              });
	            }

	          }

	          // Centro
	          var oModelCentro = new sap.ui.model.json.JSONModel();
	          oModelCentro.setSizeLimit(1000);
	          oModelCentro.setData({
	            modelCentro: aCentro
	          });
	          var oDataCentro = this.getView().byId("idComboBoxCentro");
	          oDataCentro.setModel(oModelCentro);

	          // Escritório de Vendas
	          var oModelEV = new sap.ui.model.json.JSONModel();
	          oModelEV.setSizeLimit(100);
	          oModelEV.setData({
	            modelEV: aEscritorio
	          });

	          var oDataEV = this.getView().byId("idCboEscritorioDe");
	          oDataEV.setModel(oModelEV);
	          oDataEV = this.getView().byId("idCboEscritorioAte");
	          oDataEV.setModel(oModelEV);
	        }
	      },     

		onNavBack: function (oEvent) {
			this.getOwnerComponent().getRouter().navTo("logistica", {
				mode: "Change"
			}, true);
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		},
		
		onSearch: function() {
			var aFilters = this._createFilter();
			
			var oFilterWerks = aFilters.filter(function(e) { return e.sPath === "Werks" })[0];
			var oFilterProce = aFilters.filter(function(e) { return e.sPath === "ErdatProc" })[0];
			
			if (!oFilterWerks) {
				MessageBox.error("Centro é obrigatório", { title: "ArcelorMittal", styleClass: "sapUiSizeCompact" });
				return;
			}
			
			if (!oFilterProce) {
				MessageBox.error("Data de Processamento é obrigatório", { title: "ArcelorMittal", styleClass: "sapUiSizeCompact" });
				return;
			}			
			
			this.getView().setBusy(true);
			
			this.getModel().read("/LogFornecimentoAutSet", {
				filters: aFilters,				
				success: function(oResultData, oResponse) {
					this.getView().setBusy(false);
					
					var aLogs  = oResultData.results;
					
					aLogs.forEach(function(e) {
						e.ErdatStr	   = this._convertToDataStr(e.Erdat);
						e.ErdatProcStr = this._convertToDataStr(e.ErdatProc);
						e.ErzetStr     = this._convertToHoraStr(e.Erdat);						
						e.ErzetProcStr = this._convertToHoraStr(e.ErdatProc);
					}.bind(this));
					
					var oModel = new sap.ui.model.json.JSONModel();
					
					oModel.setSizeLimit(aLogs.length);
					oModel.setData(aLogs);
					
					this.getView().setModel(oModel, "log");					
				}.bind(this),
				error: function(oError) {
					this.getView().setBusy(false);
				}.bind(this)
			});
		},
		
		onClear: function() {
			this.byId("idComboBoxTipo").setSelectedKey("1");
			this.byId("idComboBoxCentro").setSelectedKey(null);
			this.byId("idCboEscritorioDe").setSelectedKey(null);
			this.byId("idCboEscritorioAte").setSelectedKey(null);
			
			this.byId("idOrdem").setValue("");
			this.byId("idOrdem").setTokens([]);
			this.byId("idFornecimento").setValue("");
			this.byId("idFornecimento").setTokens([]);
			
			this.byId("idDataCriacao").setValue("");
			this.byId("idDataCriacao").setDateValue(null);
			this.byId("idDataProc").setValue("");	
			this.byId("idDataProc").setDateValue(null);		
						
			this.byId("idDataRem").setValue("");
			this.byId("idDataRem").setDateValue(null);
		},
		
		_convertToDataStr: function(data) {
			var dia = data.getDate();
			var mes = data.getMonth() + 1;
			var ano = data.getFullYear();
			
			dia = dia.toString().length === 1 ? '0' + dia : dia;
			mes = mes.toString().length === 1 ? '0' + mes : mes;
					
			return dia + "/" + mes + "/" + ano;			
		},
		
		_convertToHoraStr: function(data) {
			var hor = data.getHours();
			var min = data.getMinutes();
			var seg = data.getSeconds();
			
			return hor + ":" + min + ":" + seg;
		},
		
		_createFilter: function () {
			var aFilters = [],
				aSelectedItems,
				aSelectedItem,
				aSelectedItemFrom,
				aSelectedItemTo,
				dDateFrom,
				dDateTo,
				sValue;
			
			if (this.getView().byId("idComboBoxCentro").getSelectedItem()) {
				aSelectedItem = this.getView().byId("idComboBoxCentro").getSelectedItem();
				sValue = aSelectedItem.getKey();
				
				if (sValue) {
					aFilters.push(new Filter("Werks", FilterOperator.EQ, sValue));
				}
			}

			if (this.getView().byId("idCboEscritorioDe").getSelectedItem()) {
				aSelectedItemFrom = this.getView().byId("idCboEscritorioDe").getSelectedItem();
				aSelectedItemTo   = this.getView().byId("idCboEscritorioAte").getSelectedItem();
				
				if (aSelectedItemFrom) {
					if (aSelectedItemTo) {
						aFilters.push(new Filter("Vkbur", FilterOperator.BT, aSelectedItemFrom.getKey(), aSelectedItemTo.getKey()));
					} else {
						aFilters.push(new Filter("Vkbur", FilterOperator.EQ, aSelectedItemFrom.getKey()));
					}
				}
			} else if (this.getView().byId("idCboEscritorioAte").getSelectedItem()) {
				aSelectedItemTo = this.getView().byId("idCboEscritorioAte").getSelectedItem();
				
				if (aSelectedItemTo) {
					aFilters.push(new Filter("Vkbur", FilterOperator.EQ, aSelectedItemTo.getKey()));
				}
			}
			
			if (this.getView().byId("idOrdem").getTokens()) {
				aSelectedItems = this.getView().byId("idOrdem").getTokens();
				
				if (aSelectedItems.length) {
					for (var i = 0; i < aSelectedItems.length; i++) {
						sValue = aSelectedItems[i].getText();
						aFilters.push(new Filter("Vbeln", FilterOperator.EQ, sValue));
					}				
				}
			}

			if (this.getView().byId("idUsuario").getValue()) {
				sValue = this.getView().byId("idUsuario").getValue();
				
				if (sValue) {
					aFilters.push(new Filter("ErnamProc", FilterOperator.EQ, sValue));
				}
			}
			
			if (this.getView().byId("idComboBoxStatus").getSelectedItems()) {
				aSelectedItems = this.getView().byId("idComboBoxStatus").getSelectedItems();
				
				for (var i = 0; i < aSelectedItems.length; i++) {
					sValue = aSelectedItems[i].getKey();
					aFilters.push(new Filter("Status", FilterOperator.EQ, sValue));
				}
			}
			
			if (this.getView().byId("idFornecimento").getTokens()) {
				aSelectedItems = this.getView().byId("idFornecimento").getTokens();
				
				if (aSelectedItems.length) {
					for (var i = 0; i < aSelectedItems.length; i++) {
						sValue = aSelectedItems[i].getText();
						aFilters.push(new Filter("VbelnVl", FilterOperator.EQ, sValue));
					}				
				}
			}			
			
			if (this.getView().byId("idDataCriacao").getDateValue()) {
				dDateFrom = this.getView().byId("idDataCriacao").getFrom();
				dDateTo   = this.getView().byId("idDataCriacao").getTo();

				if (dDateFrom) {
					if (dDateTo) {
						aFilters.push(new Filter("Erdat", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
					} else {
						aFilters.push(new Filter("Erdat", FilterOperator.EQ, dDateFrom));
					}
				}
			}
			
			if (this.getView().byId("idDataProc").getDateValue()) {
				dDateFrom = this.getView().byId("idDataProc").getFrom();
				dDateTo   = this.getView().byId("idDataProc").getTo();

				if (dDateFrom) {
					if (dDateTo) {
						aFilters.push(new Filter("ErdatProc", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
					} else {
						aFilters.push(new Filter("ErdatProc", FilterOperator.EQ, dDateFrom));
					}
				}
			}
			
			if (this.getView().byId("idComboBoxTipo").getSelectedItem()) {
				aSelectedItem = this.getView().byId("idComboBoxTipo").getSelectedItem();				
				sValue = aSelectedItem.getKey();
				
				if (sValue) {
					aFilters.push(new Filter("TipoSel", FilterOperator.EQ, sValue));
				}
			}
			
			if (this.getView().byId("idDataRem").getDateValue()) {
				dDateFrom = this.getView().byId("idDataRem").getFrom();
				dDateTo   = this.getView().byId("idDataRem").getTo();

				if (dDateFrom) {
					if (dDateTo) {
						aFilters.push(new Filter("Edatu", FilterOperator.BT, dDateFrom, this.ajustHours(dDateTo)));
					} else {
						aFilters.push(new Filter("Edatu", FilterOperator.EQ, dDateFrom));
					}
				}
			}
			
			return aFilters;
		},
		
	    onAddTokenOrdem: function () {

	        var oMultiInput = this.getView().byId("idOrdem");
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
        
	    onAddTokenFornecimento: function () {

	        var oMultiInput = this.getView().byId("idFornecimento");
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
        
        onImprimirPress: function (oEvent) {
            var bind = this.byId("tbLog").getBinding("rows");
            var contexts = bind.getCurrentContexts();
            var sum  = 0;
            var cond = false;
            var that = this;

            window.print();
        },
        
        exportSpreadsheet: function () {
            var oModel  = this.getModel("log")
            var rows    = { path: "/" };
            var columns = [
	        	  {name: "Ordem de Vendas", template: { content: "{Vbeln}"}},
	              {name: "Item OV", template: { content: "{Posnr}"}},
	              {name: "Material", template: { content: "{Matnr}"}},
	              {name: "Descrição", template: { content: "{Arktx}"}},
	              {name: "Centro", template: { content: "{Werks}"}},
	              {name: "Esc. Vendas", template: { content: "{Vkbur}"}},
	              {name: "Data Criação OV", template: { content: "{ErdatStr}"}},
	              {name: "Hora Criação OV", template: { content: "{ErzetStr}"}},
	              {name: "Usuario Criação OV", template: { content: "{Ernam}"}},
	              {name: "Fornecimento", template: { content: "{VbelnVl}"}},
	              {name: "Bloqueio Remessa", template: { content: "{Lifsk}"}},
	              {name: "Status", template: { content: "{Status}"}},
	              {name: "Mensagem", template: { content: "{Mensagem}"}},
	              {name: "Data Processamento", template: { content: "{ErdatProcStr}"}},
	              {name: "Hora Processamento", template: { content: "{ErzetProcStr}"}},
	              {name: "Usuário Processamento", template: { content: "{ErnamProc}"}}
            ];
            
            var oExport = new sap.ui.core.util.Export({
                exportType: new ExportTypeCSV({ separatorChar: ";" }),
                models: oModel,
                rows: rows,
                columns: columns
            });
            this.onExcel(oExport);
        },

	    onExcel: sap.m.Table.prototype.exportData || function (oExport) {
	        //var vText = this.getResourceBundle().getText("errorPressExcel");
	
	        oExport.saveFile().catch(function (oError) {
	            //
	        }).then(function () {
	            oExport.destroy();
	        });
        }
        
	});
});