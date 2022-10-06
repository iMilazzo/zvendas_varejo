sap.ui.define([
  'sap/ui/core/format/NumberFormat'
], function (NumberFormat) {
  "use strict";

  var mStatusState = {
    "A": "Success",
    "O": "Warning",
    "D": "Error"
  };

  var formatter = {
    /**
     * Formats the price
     * @param {string} sValue model price value
     * @return {string} formatted price
     */
    price: function (sValue) {
      if (!isNaN(sValue)) {
        var numberFormat = NumberFormat.getFloatInstance({
          maxFractionDigits: 2,
          minFractionDigits: 2,
          groupingEnabled: true,
          groupingSeparator: ".",
          decimalSeparator: ","
        });
        if(sValue!=null){
        return numberFormat.format(sValue.toString().trim());
      }else{return numberFormat.format(sValue)}
      }
      return sValue;
    },

    price3: function (sValue) {

      sValue = sValue != null ? sValue.toString().trim() : sValue;

      if (!isNaN(sValue)) {
        var numberFormat = NumberFormat.getFloatInstance({
          maxFractionDigits: 3,
          minFractionDigits: 3,
          groupingEnabled: true,
          groupingSeparator: ".",
          decimalSeparator: ","
        });
        if(sValue!=null){
          return numberFormat.format(sValue.toString().trim());
        }else{return numberFormat.format(sValue)}
        }
        return sValue;
    },
    totalServ: function (oCartEntries) {
      var fTotalPrice = 0;
      var totalst = 0;
      if (oCartEntries) {
        Object.keys(oCartEntries).forEach(function (Item) {
          var oProduct = oCartEntries[Item];
          if (!oProduct.Deleted) {
            fTotalPrice += (parseFloat(oProduct.ValZnsv) + totalst);
          }
        });
      }
      fTotalPrice = Math.round(fTotalPrice*100)/100;
      return formatter.price(fTotalPrice);
    },    
    /**
     * Sums up the price for all products in the cart
     * @param {object} oCartEntries current cart entries
     * @return {string} string with the total value
     */
    totalPrice: function (oCartEntries) {
      var fTotalPrice = 0;
      var totalst = 0;
      if (oCartEntries) {
        Object.keys(oCartEntries).forEach(function (Item) {
          var oProduct = oCartEntries[Item];
          if (oProduct.ValorST !== "") {
            totalst = parseFloat(oProduct.ValorST)
          } else {
            totalst = 0
          }
          if (!oProduct.Deleted) {
            fTotalPrice += (parseFloat(oProduct.ValorTotItem) + totalst);
          }
        });
      }
      fTotalPrice = Math.round(fTotalPrice*100)/100;
      return formatter.price(fTotalPrice);
    },
    _formatarHorario: function (pTime) {
      var oTimeStr = "00:00:00";
      if (pTime) {
        var ms = pTime.ms % 1000;
        pTime.ms = (pTime.ms - ms) / 1000;
        var secs = pTime.ms % 60;
        pTime.ms = (pTime.ms - secs) / 60;
        var mins = pTime.ms % 60;
        var hrs = (pTime.ms - mins) / 60;
        if (secs.toString().length == 1) {
          secs = "0" + secs
        };
        if (mins.toString().length == 1) {
          mins = "0" + mins
        };
        if (hrs.toString().length == 1) {
          hrs = "0" + hrs
        };
        oTimeStr = hrs + ':' + mins + ':' + secs;
      }

      return oTimeStr;
    },

    totalItems: function (oCartEntries) {

      var iTotalItens = 0;

      if (oCartEntries) {
        Object.keys(oCartEntries).forEach(function (Item) {
          var oProduct = oCartEntries[Item];
          if (!oProduct.Deleted) {
            iTotalItens += 1;
          }
        });
      }

      return "" + iTotalItens + " " + "itens";
    },

    /**
     * Returns the status text based on the product status
     * @param {string} sStatus product status
     * @return {string} the corresponding text if found or the original value
     */
    statusText: function (sStatus) {
      var oBundle = this.getResourceBundle();

      var mStatusText = {
        "A": oBundle.getText("statusA"),
        "O": oBundle.getText("statusO"),
        "D": oBundle.getText("statusD")
      };

      return mStatusText[sStatus] || sStatus;
    },

    /**
     * Returns the product state based on the status
     * @param {string} sStatus product status
     * @return {string} the state text
     */
    statusState: function (sStatus) {
      return mStatusState[sStatus] || "None";
    },

    /**
     * Returns the relative URL to a product picture
     * @param {string} sUrl image URL
     * @return {string} relative image URL
     */
    pictureUrl: function (sId) {
      return jQuery.sap.getResourcePath("sap/ui/demo/cart/") + "/img/products/" + sId + ".jpg";
    },

    /**
     * Returns the footer text for the cart based on the amount of products
     * @param {object} oSavedForLaterEntries the entries in the cart
     * @return {string} "" for no products, the i18n text for >0 products
     */
    footerTextForCart: function (oSavedForLaterEntries) {
      var oBundle = this.getResourceBundle();

      if (Object.keys(oSavedForLaterEntries).length === 0) {
        return "";
      }
      return oBundle.getText("cartSavedForLaterFooterText");
    },

    /**
     * Checks if one of the collections contains items.
     * @param {object} oCollection1 First array or object to check
     * @param {object} oCollection2 Second array or object to check
     * @return {boolean} true if one of the collections is not empty, otherwise - false.
     */
    hasItems: function (oCollection1, oCollection2) {
      return !(jQuery.isEmptyObject(oCollection1) && jQuery.isEmptyObject(oCollection2));
    },

    formatterCPFCNPJ: function (sValue) {
      var retorno = "";

      if ($.isNumeric(sValue)) {
        if (sValue.length <= 11) {
          retorno = sValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
        } else {
          retorno = sValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3\/\$4\-\$5");
        }
      }

      return retorno;
    },

    decimalQtd: function (d) {
      if (!isNaN(d)) {
        return parseFloat(d).toFixed(3);
      }
      return d;
    },

    setIntFormat: function (d) {
      if (!isNaN(d) && d != null && d != "") {
        return parseInt(d);
      }
      return d;
    },

    setFreigthText: function (sValue) {
      switch (sValue) {
      case '0':
        return 'CIF';
        break;
      case '1':
        return 'EXW';
        break;
      case '2':
        return 'FOB';
        break;
      case '9':
        return 'ZST';
        break;
      default:
        return '-';
      }
    },

    strToDataBr: function (sValue) {
      if (null != sValue && sValue.toString().length > 0) {
        try {
          var newDate = new Date(sValue);
          return newDate.toLocaleDateString(newDate);
        } catch (err) {
          //console.log(err.message);
        }
      }
      return "";
    },

    strToDataBrOneDay: function (sValue) {
      if (null != sValue && sValue.toString().length > 0) {
        try {
          var newDate = new Date(sValue);
          newDate = newDate.setDate(newDate.getDate() + 1);
          newDate = new Date(newDate);
          return newDate.toLocaleDateString();
        } catch (err) {
          //console.log(err.message);
        }
      }
      return "";
    },

    setSalesTypeText: function (sValue) {
      switch (sValue) {
      case '1':
        return 'Ordem de Vendas';
        break;
      case '2':
        return 'Venda n�o Identificada';
        break;
      default:
        return '-';
      }
    },

    setBooleanToStr: function (sValue) {
      return sValue == "X" ? "Sim" : "N�o";
    },

    setBooleanToStrBr: function (sValue) {

      return sValue ? "Sim" : "N�o";
    },

    removerEspacos: function (sValue) {
      return sValue != null ? sValue.trim() : sValue;
    },

    stringVazia: function (sValue) {

      if (typeof (sValue) != "undefined" && sValue != null) {
        if (sValue.length > 0) {
          return true;
        }

      }
      return false;
    }
  };

  return formatter;
});