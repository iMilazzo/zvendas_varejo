sap.ui.define([
	'jquery.sap.global',
	'sap/m/MessageBox',
	'sap/m/MessageToast'

], function ($, MessageBox, MessageToast) {
	"use strict";

	return {

		addToCart: function (oBundle, oProduct, oCartModel) {
			if (oProduct !== undefined) {
				oProduct = oProduct;
			}
			this._updateCartItem(oBundle, oProduct, oCartModel);
		},

		_updateCartItem: function (oBundle, oProductToBeAdded, oCartModel) {

			var cartKey = oProductToBeAdded.Material + oProductToBeAdded.Centro;
			var oCollectionEntries = $.extend({}, oCartModel.getData()["cartEntries"]);
			var oCartEntry = oCollectionEntries[cartKey];

			if (oCartEntry === undefined) {
				oCartEntry = $.extend({}, oProductToBeAdded);
				oCartEntry.Quantity = oProductToBeAdded.Qtd;
				oCollectionEntries[cartKey] = oCartEntry;
			} else {
				oCartEntry.Quantity += 1;
			}

			oCartModel.setProperty("/cartEntries", $.extend({}, oCollectionEntries));
			oCartModel.refresh(true);

		}
	};
});