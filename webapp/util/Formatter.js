sap.ui.arcelor.util.Formatter = {

	formatarValor: function (value) {
		return '123456';
	},

	formatterCpfCnpj: function (sInputValue) {

		var retorno = "";

		if ($.isNumeric(sInputValue) && sInputValue.length <= 11) {
			retorno = sInputValue.substring(0, 3) + "." + sInputValue.substring(4, 6) + "." + sInputValue.substring(7, 9) + "." + sInputValue.substring(
				10, 11);
		} else if ($.isNumeric(sInputValue) && sInputValue.length > 11) {
			retorno = sInputValue.substring(0, 2) + "." + sInputValue.substring(3, 5) + "." + sInputValue.substring(6, 8) + "/" + sInputValue.substring(
				9, 12) + "-" + sInputValue.substring(13, 14);

		}
		return retorno;
	}
};