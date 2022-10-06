sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"arcelor/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Token",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/m/Dialog"
], function (BaseController, JSONModel, History, Filter, FilterOperator, Device, formatter, MessageBox, MessageToast,
	Token, MessagePopover, MessagePopoverItem, Dialog) {
	"use strict";
	var _aMotivos = [];
	var _sData;
	var _sVbeln;

	return BaseController.extend("arcelor.controller.GerarBoletoOv", {
		onInit: function () {
			this.getView().setModel(new JSONModel(), "view");
			this.getRouter().getRoute("GerarBoletoOv").attachPatternMatched(this._onObjectMatched.bind(this), this);
		},
		onBeforeRendering: function () {
			this.getView().setBusy(true);
			var autorizado = sap.ui.controller("arcelor.controller.Inicio").authControlRoute("divGerarBoleto");
			if (!autorizado) {
				this.getRouter().getTargets().display("Unauthorized");
				return false;
			} else {
				this.getView().setBusy(false);
			}
		},
		_onObjectMatched: function (oEvent) {
			this.aAllFilters = [];
			_sVbeln = sessionStorage.getItem("Vbeln");
			_sData = sessionStorage.getItem("Vdata");
			sessionStorage.removeItem("Vbeln");
			sessionStorage.removeItem("Vdata");
			this.oFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, _sVbeln);
			this.aAllFilters.push(this.oFilter);
			this.oFilter = new sap.ui.model.Filter("Ubnkl", sap.ui.model.FilterOperator.EQ, _sData);
			this.aAllFilters.push(this.oFilter);
			this.oTab = this.byId("List");
			this.oTabBinding = this.oTab.getBinding("items");
			this.oTabBinding.oModel.setSizeLimit(1000000);

			var xhttp = new XMLHttpRequest();

			this.getModel().read("/GerarBoletoOvSet", {
				filters: this.aAllFilters,
				success: function (oData) {

					var mapForm = document.createElement("form");
					mapForm.target = "Map";
					mapForm.method = "POST";
					mapForm.action = "http://bms317/ConsultasBelgoNetQA/ScriptsArcelorMittal/boleto_vendas.asp";
					var mapInput = document.createElement("input");
					mapInput.type = "text";
					mapInput.name = "NAME";
					mapInput.value = oData.results[0].Name1;
					mapForm.appendChild(mapInput);
					var mapInput1 = document.createElement("input");
					mapInput1.type = "text";
					mapInput1.name = "BLDAT";
					mapInput1.value = oData.results[0].Bldat.substring(0, 4) + '/' + oData.results[0].Bldat.substring(4, 6) + '/' + oData.results[
						0].Bldat.substring(6, 8);
					mapForm.appendChild(mapInput1);
					var mapInput2 = document.createElement("input");
					mapInput2.type = "text";
					mapInput2.name = "XBLNR";
					mapInput2.value = oData.results[0].Xblnr;
					mapForm.appendChild(mapInput1);

					var mapInput3 = document.createElement("input");
					mapInput3.type = "text";
					mapInput3.name = "BUZEI";
					mapInput3.value = oData.results[0].Buzei;
					mapForm.appendChild(mapInput2);

					var mapInput4 = document.createElement("input");
					mapInput4.type = "text";
					mapInput4.name = "DMBTR";
					mapInput4.value = oData.results[0].Dmbtr;
					mapForm.appendChild(mapInput4);

					var mapInput5 = document.createElement("input");
					mapInput5.type = "text";
					mapInput5.name = "STRAS";
					mapInput5.value = oData.results[0].Stras;
					mapForm.appendChild(mapInput5);

					var mapInput6 = document.createElement("input");
					mapInput6.type = "text";
					mapInput6.name = "ANFAE";
					mapInput6.value = oData.results[0].Anfae;
					mapForm.appendChild(mapInput6);

					var mapInput7 = document.createElement("input");
					mapInput7.type = "text";
					mapInput7.name = "LAUFD";
					mapInput7.value = oData.results[0].Laufd;
					mapForm.appendChild(mapInput7);

					var mapInput8 = document.createElement("input");
					mapInput8.type = "text";
					mapInput8.name = "PSTLZ";
					mapInput8.value = oData.results[0].Pstlz;
					mapForm.appendChild(mapInput8);

					var mapInput9 = document.createElement("input");
					mapInput9.type = "text";
					mapInput9.name = "ORT01";
					mapInput9.value = oData.results[0].Ort01;
					mapForm.appendChild(mapInput9);

					var mapInput10 = document.createElement("input");
					mapInput10.type = "text";
					mapInput10.name = "STCD1";
					mapInput10.value = oData.results[0].Stcd1;
					mapForm.appendChild(mapInput10);

					var mapInput11 = document.createElement("input");
					mapInput11.type = "text";
					mapInput11.name = "UBKNT";
					mapInput11.value = oData.results[0].Ubknt;
					mapForm.appendChild(mapInput11);

					var mapInput12 = document.createElement("input");
					mapInput12.type = "text";
					mapInput12.name = "UBKON";
					mapInput12.value = oData.results[0].Ubkon;
					mapForm.appendChild(mapInput12);

					var mapInput13 = document.createElement("input");
					mapInput13.type = "text";
					mapInput13.name = "UBKON_AUX";
					mapInput13.value = oData.results[0].UbkonAux;
					mapForm.appendChild(mapInput13);

					var mapInput14 = document.createElement("input");
					mapInput14.type = "text";
					mapInput14.name = "UBNKL";
					mapInput14.value = oData.results[0].Ubnkl;
					mapForm.appendChild(mapInput14);

					var mapInput15 = document.createElement("input");
					mapInput15.type = "text";
					mapInput15.name = "BARCODE";
					mapInput15.value = oData.results[0].Barcode;
					mapForm.appendChild(mapInput15);

					var mapInput16 = document.createElement("input");
					mapInput16.type = "text";
					mapInput16.name = "NOSSO";
					mapInput16.value = oData.results[0].Nosso;
					mapForm.appendChild(mapInput16);

					var mapInput17 = document.createElement("input");
					mapInput17.type = "text";
					mapInput17.name = "CARTEIRA";
					mapInput17.value = oData.results[0].Carteira;
					mapForm.appendChild(mapInput17);

					var mapInput18 = document.createElement("input");
					mapInput18.type = "text";
					mapInput18.name = "JUROS";
					mapInput18.value = oData.results[0].Juros;
					mapForm.appendChild(mapInput18);

					var mapInput19 = document.createElement("input");
					mapInput19.type = "text";
					mapInput19.name = "CEDENTE";
					mapInput19.value = oData.results[0].Cedente;
					mapForm.appendChild(mapInput19);

					var mapInput20 = document.createElement("input");
					mapInput20.type = "text";
					mapInput20.name = "VENC";
					mapInput20.value = oData.results[0].Venc.substring(0, 4) + '/' + oData.results[0].Venc.substring(4, 6) + '/' + oData.results[0]
						.Venc.substring(6, 8);
					mapForm.appendChild(mapInput20);

					var mapInput21 = document.createElement("input");
					mapInput21.type = "text";
					mapInput21.name = "CIP";
					mapInput21.value = oData.results[0].Cip;
					mapForm.appendChild(mapInput21);

					var mapInput22 = document.createElement("input");
					mapInput22.type = "text";
					mapInput22.name = "INSTRUCAO";
					mapInput22.value = oData.results[0].Instrucao;
					mapForm.appendChild(mapInput22);

					var mapInput23 = document.createElement("input");
					mapInput23.type = "text";
					mapInput23.name = "INSTRUCAO2";
					mapInput23.value = oData.results[0].Instrucao2;
					mapForm.appendChild(mapInput23);

					var mapInput24 = document.createElement("input");
					mapInput24.type = "text";
					mapInput24.name = "HBKID";
					mapInput24.value = oData.results[0].Hbkid;
					mapForm.appendChild(mapInput24);

					var mapInput25 = document.createElement("input");
					mapInput25.type = "text";
					mapInput25.name = "empresa";
					mapInput25.value = oData.results[0].Bukrs;
					mapForm.appendChild(mapInput25);

					var mapInput26 = document.createElement("input");
					mapInput26.type = "text";
					mapInput26.name = "ABATIMENTO";
					mapInput26.value = oData.results[0].Abatimento;
					mapForm.appendChild(mapInput26);

					var mapInput27 = document.createElement("input");
					mapInput27.type = "text";
					mapInput27.name = "TXT_ABATIM";
					mapInput27.value = oData.results[0].TxtAbatim;
					mapForm.appendChild(mapInput27);

					var mapInput28 = document.createElement("input");
					mapInput28.type = "text";
					mapInput28.name = "ENDERECO";
					mapInput28.value = oData.results[0].Zendereco;
					mapForm.appendChild(mapInput28);

					var mapInput28 = document.createElement("input");
					mapInput28.type = "text";
					mapInput28.name = "CNPJ";
					mapInput28.value = oData.results[0].Zcnpj;
					mapForm.appendChild(mapInput28);

					mapForm.appendChild(mapInput23);
					document.body.appendChild(mapForm);
					mapForm.submit();

				},
				error: function (oError) {
					alert(oError);
				}
			});
		},

		GerarBoleto: function () {
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					document.getElementById("demo").innerHTML = this.responseText;
				}
			};
			xhttp.open("POST", "http://bms317/ConsultasBelgoNetQA/ScriptsArcelorMittal/boleto_vendas.asp", true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhttp.send("fname=Henry&lname=Ford");
		},
		formatData: function (value) {

			var dateObject = new Date(value);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/yyyy"
			});
			var dateFormatted = dateFormat.format(dateObject);
			return dateFormatted;
		},

		onChangeDate: function (oEvent) {
			this.byId("nova_data").setValue(this.formatData(oEvent.getParameter("value")));
		},
		formatValor: function (value) {
			if (value) {
				return parseFloat(value).toLocaleString("pt-BR", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				});
			}
			return null;
		},
	});
});