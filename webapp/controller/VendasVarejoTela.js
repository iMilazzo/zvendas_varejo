sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (BaseController, Controller, History) {
	"use strict";

	return BaseController.extend("arcelor.controller.VendasVarejoTela", {

		utilFormatterCPFCNPJ: function (sValue, sTipo) {
			var retorno = "";

			if (sTipo === "F") {
				retorno = sValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
			} else {
				retorno = sValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3\/\$4\-\$5");
			}

			return retorno;
		},

		utilFormatterCPFCNPJClear: function (sValue) {
			return sValue.replace(/\D+/g, '');
		},

		utilClearCharToNumber: function (sValue) {
			return sValue.replace(/\D+/g, '');
		},

		utilFormatterCPFCNPJClearSearch: function (sValue) {
			var exp = /\-|\.|\/|\(|\)| /g;
			var campoSoNumeros = sValue.toString().replace(exp, "");
			return campoSoNumeros;
		},

		utilFormatterCEP: function (sValue) {
			return sValue.replace(/^([\d]{5})([\d]{3})/, "$1-$2");
		},

		utilFormatterTelefone: function (sValue) {
			sValue = sValue.replace(/\D/g, ""); //Remove tudo o que n�o � d�gito
			sValue = sValue.replace(/^(\d{2})(\d)/g, "($1) $2"); //Coloca par�nteses em volta dos tres primeiros d�gitos
			sValue = sValue.replace(/(\d)(\d{4})$/, "$1-$2"); //Coloca h�fen entre o quarto e o quinto d�gitos
			return sValue;
		},

		utilFormatterNumber: function (sValue) {
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			return oNumberFormat.parse(sValue);
		},

		utilFormatterNumberUS: function (sValue) {
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 3,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});
			return oNumberFormat.parse(sValue);
		},

		uitlFormatterFieldMoeda: function (sValue) {
			sValue = sValue + '';
			sValue = parseInt(sValue.replace(/[\D]+/g, ''));
			sValue = sValue + '';
			sValue = sValue.replace(/([0-9]{2})$/g, ",$1");

			if (sValue.length > 6) {
				sValue = sValue.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
			}

			return sValue;
		},

		uitlFormatterFieldMoeda2: function (sValue) {
			var formatado = sValue.replace(/\D/g, '');
			formatado = (formatado / 100).toFixed(2) + '';
			formatado = formatado.replace(".", ",");
			formatado = formatado.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
			formatado = formatado.replace(/(\d)(\d{3}),/g, "$1.$2,");

			sValue = formatado;
			return sValue;
		}

			utilFormatterCurrency: function (sValue, sLocale) {
			return sValue.toLocaleString(sLocale);
		},

		utilMonthDateGet: function (sValue) {

			var month;

			switch (sValue) {

			case 0:
				month = '01';
				break;

			case 1:
				month = '02';
				break;

			case 2:
				month = '03';
				break;

			case 3:
				month = '04';
				break;

			case 4:
				month = '05';
				break;

			case 5:
				month = '06';
				break;

			case 6:
				month = '07';
				break;

			case 7:
				month = '08';
				break;

			case 8:
				month = '09';
				break;

			case 9:
				month = '10';
				break;

			case 10:
				month = '11';
				break;

			case 11:
				month = '12';
				break;

			default:
				break;
			}
			return month;
		},

		utilFormatterDateToBR: function (sValue) {

			var date = new Date(sValue);
			date.setDate(date.getDate() + 1);

			var day = date.getDate();
			var month = this.utilMonthDateGet(date.getMonth());
			var year = date.getFullYear();

			return day + '/' + month + '/' + year;

		},

		utilSearchCity: function (oEvent, thisView) {

			var filters = [];
			var filter;

			filter = new sap.ui.model.Filter("Estado", sap.ui.model.FilterOperator.EQ, oEvent);
			filters.push(filter);

			var cidades = thisView.getView().byId("input-Cidade");
			var binding = cidades.getBinding("items");
			binding.filter(filters);
		}

	});
});