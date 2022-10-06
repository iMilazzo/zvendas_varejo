sap.ui.define([
  "arcelor/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/format/DateFormat",
  "sap/m/Dialog",
  "sap/ui/layout/HorizontalLayout",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Text",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Popover",
  "arcelor/model/cart",
  "arcelor/controls/Card",
  'sap/ui/core/format/NumberFormat'
], function (BaseController, JSONModel, Filter, FilterOperator, DateFormat, Dialog, HorizontalLayout, VerticalLayout, Text, TextArea,
  Button, MessageToast, MessageBox, Popover, cart, Card, NumberFormat) {
  "use strict";


  var aDataItensCarrinho = [];
  var gl_grupomarc = '';

  // Utilizar formatos abaixo em toLocaleString()
  // formato para dinheiro sem R$
  var formatoMoney = {
    minimumFractionDigits: 2
  };

  // formato geral para numero com 3 casas decimais, (ex.: Estoque)
  var formatoNumber = {
    minimumFractionDigits: 3
  };

  const estoqueZero = 'X',
    precoZero = 'P',
    estoquePrecoZero = 'Z';

  return BaseController.extend("arcelor.controller.Produtos", {

    onInit: function () {

      if (!this.getModel("ProductsSettings")) {
        this.setModel(new JSONModel({
          GroupVisible: false
        }), "ProductsSettings");
      }

      var oBtnMais = this.byId("input-button");

      this.getView().byId("Lista_table").attachUpdateFinished(null, function (oEvent) {
        var count = oEvent.getParameter("total");
        if (count > 0) {
          oBtnMais.setVisible(true);
        } else {
          oBtnMais.setVisible(false);
        }
      });

    },
updateFin: function(){
sap.ui.controller("arcelor.controller.Inicio").authControl();
console.log("mierda")

},
    _onRouteMatched: function () {

      var that = this;
      this.byId("__hbox3").setBusy(true);

      this.getModel().read("/SegmentoSet", {
        success: function (oData) {

          oData.results.forEach((item) => {
            var oCard = sap.ui.getCore().byId("_" + item.Codgrpmacromerc);
            if (oCard === undefined ){
              var card = new Card("_" + item.Codgrpmacromerc, {
                press: () => {
                  that.onPressCard(item.Codgrpmacromerc, item.Descrgrpmerc)
                },
              });
              card.setTitle(item.Descrgrpmerc);
              card.setBackgroundColor("#ff5a16E6");
              card.addEventDelegate({
                "onAfterRendering": function () {
                  that._setCardImage(card.getId());
                }
              }, this);

              that.byId("__hbox3").addItem(card);
            }
          });

          that.byId("__hbox3").setBusy(false);
        },
        error: function (oError) {
          //console.log(oError);
        }
      });

    },

    onAfterRendering: function () {

      sap.ui.controller("arcelor.controller.Inicio").authControl();

      this._onRouteMatched();

      var thisView = this;
      let filtroEstoqueModel = this._loadFilterEstoque();
      this.getView().byId("comboEstoque").setModel(filtroEstoqueModel);
      this.getView().byId("comboEstoque").setSelectedKey(0);

      var filters = [];

      this.getModel("ProductsModel").setSizeLimit(5000000);
      var oModelData = this.getModel("ProductsModel").getData();
      this.getModel("ProductsModel").refresh(true);
      filters.push(new Filter("Codproduto", sap.ui.model.FilterOperator.Contains, ""));

      //Loja
      this.getView().byId("combo2").getBinding("items").filter(filters);
      var oview = this;
      var oData = this.getView().getModel();
      var sPath = "/LogInfSet(usuario='user')";
      var onSuccess = function (odata) {
        oview.getView().byId("combo2").setSelectedKey(odata.loja);
      }

      var onError = function (odata, response) {}
      oData.read(sPath, {
        success: onSuccess,
        error: onError
      });
    },

    _loadFilterEstoque: function () {

      let lista = {
        items: [{
          key: 0,
          title: 'Todos'
        }, {
          key: estoqueZero,
          title: 'C/ Estoque'
        }, {
          key: precoZero,
          title: 'C/ Preço'
        }, {
          key: estoquePrecoZero,
          title: 'C/ Estoque e Preço'
        }]
      };

      let linhas = new sap.ui.model.json.JSONModel(lista);
      return linhas;
    },

    setCartLength: function (oEntries) {
      return (oEntries ? Object.keys(oEntries).length : "0");
    },

    onSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query");
      this._searchProdutos(sQuery, "S");
    },

    /**
     * Internal helper method to apply both filter and search state together on the list binding
     * @private
     */
    _applySearch: function (oTableSearchState) {
      var oViewModel = this.getModel("worklistView");
    },

    _onLabelGrupoMacro: function (filtro, label) {
      var oText = this.getView().byId("labelGrupoMercadoria");
      oText.setText(filtro);
      var oLabel = this.getView().byId("label1");

      oLabel.setText(label);
      oLabel.addStyleClass("labelMacro");
      var oLabel1 = this.getView().byId("label30");

      this.getModel("ProductsSettings").getData().GroupVisible = true;
      this.getModel("ProductsSettings").refresh(true);
    },

    onPressCard(sId, sLabel) {
      var filtro = sId;
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, this.camelize(sLabel));
    },

    _setCardImage(sId) {
      var oView = sap.ui.getCore().byId(sId);
      oView.bindElement({
        path: "/ImagemSegmentoSet(Codgrpmacromerc='" + sId.replace("_", "") + "')/$value",
        events: {
          dataRequested: function (oEvent) {
            oView.setBusy(true);
          },
          dataReceived: function (oEvent) {
            var imgUrl = window.location.origin + this.getModel().sServiceUrl + oEvent.getSource().sPath;
            var imagem = new Image();
            imagem.src = imgUrl;
            oView.setImage(imagem.src);
            oView.setBusy(false);
          }
        }
      });
    },

    onSearchProd: function (filters) {

      let filtroPrecoEstoqueSelect = this.byId("comboEstoque").getSelectedKey();
      if (filtroPrecoEstoqueSelect != "" && filtroPrecoEstoqueSelect != 0) {
        filters.push(new Filter("estoquezero", sap.ui.model.FilterOperator.EQ, filtroPrecoEstoqueSelect));
      }

      var oData = this.getView().getModel();
      var sPath = "/ProdutosSet";
      var oView = this;
      var oModelData = this.getModel("ProductsModel").getData();
      var list = this.getView().byId("Lista_table");
      this.getView().setBusy(true);

      var onSuccess = function (odata) {
        oView.getView().setBusy(false);

        if (odata.results.length === 0) {
          oView.byId("input-button").setVisible(false);
          MessageToast.show('Fim da lista', {
            duration: 300
          });
        }

        oModelData.itens = [];

        odata.results.forEach(function (prod) {
          var precoOriginal = prod.Precodezx;
          var estoqueOriginal = prod.Estoque;
          var lott = false;

          if (prod.lote == 'X') {
            lott = true;
          };

          var oProduto = {
            Codproduto: prod.Codproduto,
            Descrprod: prod.Descrprod,
            Loja: prod.Loja,
            Setorativ: prod.Setorativ,
            Descrsetor: prod.Descrsetor,
            Precovista: prod.Precovista,
            Precodezx: prod.Precodezx,
            PrecodezxOri: prod.Precodezx,
            Estoque: prod.Estoque,
            EstoqueOri: prod.Estoque,
            Undmedida: prod.Undmedida,
            UndmedidaOri: prod.Undmedida,
            Descrundmed: prod.Descrundmed,
            Grupomat: prod.Grupomat,
            Descrmat: prod.Descrmat,
            Classprod: prod.Classprod,
            Grupomerc: prod.Grupomerc,
            EstljQuan1: prod.EstljQuan1,
            Estloja1: prod.Estloja1,
            EstljQuan2: prod.EstljQuan2,
            EstljQuan3: prod.EstljQuan3,
            Fisico: prod.Fisico.trim(),
            Proprio: prod.Proprio,
            Lote: lott
          };

          oView._loadMaterialData("UN", prod.Codproduto.toString()).then(function (oDataHelper) {
            var UnitHelper = [];
            var unittest = false;
            oDataHelper.results.forEach(function (oResult) {
              if (prod.Undmedida == oResult.Coddadomestre) {
                unittest = true;
              }
              switch (oResult.Codconsulta) {
              case "UN":
                UnitHelper.push({
                  Codconsulta: oResult.Codconsulta,
                  Coddadomestre: oResult.Coddadomestre,
                  Textodadomestre: oResult.Textodadomestre
                });
                break;
              }
            })
            if (!unittest) {
              UnitHelper.push({
                Codconsulta: 'UN',
                Coddadomestre: prod.Undmedida,
                Textodadomestre: prod.Undmedida
              });
            }
            var lot = false;
            if (prod.lote == 'X') {
              lot = true;
            };
            oModelData.itens.push({
              Codproduto: parseFloat(prod.Codproduto),
              Descrprod: prod.Descrprod,
              Precodezx: parseFloat(prod.Precodezx),
              Estoque: parseFloat(prod.Estoque),
              EstoqueOri: parseFloat(prod.Estoque),
              Loja: prod.Loja,
              UnitHelper: UnitHelper,
              Undmedida: prod.Undmedida,
              Grupomerc: prod.Grupomerc,
              Fisico: prod.Fisico.trim(),
              Lote: lot,
              oProduto: oProduto
            });
            oView.getModel("ProductsModel").refresh(true);
          });
          if (parseFloat(oView.getView().byId("searchField").getValue()) != parseFloat(prod.Codproduto)) {

          }
        })

        oView.getModel("ProductsModel").refresh(true);
                sap.ui.controller("arcelor.controller.Inicio").authControl();

      };
      var onError = function (odata) {

      };
      oData.read(sPath, {
        filters: filters,
        success: onSuccess,
        error: onError
      });
    },

    onCancelGroup: function () {

      this.getView().byId("label1").setText("");
      this.getView().byId("labelGrupoMercadoria").setText("");
      this.getView().byId("label1").removeStyleClass("labelMacro");
      this.getModel("ProductsSettings").getData().GroupVisible = false;
      this.getModel("ProductsSettings").refresh(true);
      gl_grupomarc = "";
      this._searchProdutos("", "G");
      var filters1 = [];
      filters1.push(new Filter("Codproduto", sap.ui.model.FilterOperator.EQ, ""));
      this.getView().byId("combo1").getBinding("items").filter(filters1);
      var filters = [];
      filters.push(new Filter("Codproduto", sap.ui.model.FilterOperator.Contains, ""));
      //Loja
      this.getView().byId("combo2").getBinding("items").filter(filters);

    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro1: function (evt) {
      var filtro = "000005BBA";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 6);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro2: function () {
      var filtro = "000004INDSTRIA";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 7);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro3: function () {
      var filtro = "000003CONSTRUOCIVIL";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 8);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro4: function () {
      var filtro = "000006PLANOSEDERIVAD";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 9);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro5: function () {
      var filtro = "000044TUBOS";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 20);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro6: function () {
      var filtro = "000426AOSINOX";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 21);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro7: function () {
      var filtro = "000424LINHACOMPLEMEN";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 22);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro8: function () {
      var filtro = "000002ACINDAR";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 23);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro9: function () {
      var filtro = "000480PERFILIMPORTAD";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 24);
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onGrupoMacro10: function () {
      var filtro = "000487STEELDECK";
      gl_grupomarc = filtro;
      this._searchProdutos(filtro, "G");
      this._onLabelGrupoMacro(filtro, 25);
    },

    onMaisItens: function () {

      var filtro = this.getView().byId("Lista_table").getItems().length - 1;
      var produto = this.getView().byId("Lista_table").getItems()[filtro].mAggregations.cells[0].mProperties.number
      var oTable = this.getView().byId("Lista_table");
      var m = oTable.getModel();
      var oComboBoxCategoria = this.getView().byId("combo1");
      var aComboboxItems = oComboBoxCategoria.getSelectedKeys();
      var filters = [];

      //Loja
      var oComboBox = this.getView().byId("combo2");
      var sLoja = oComboBox.getSelectedKey();

      //Grupo Mercadoria
      var oText = this.getView().byId("labelGrupoMercadoria");
      var sGrpMercadoria = oText.getText();

      if (aComboboxItems.length > 0) {
        filters.push(this._filterCategoria(aComboboxItems));
      }

      if (sLoja.length > 0) {
        filters.push(new Filter("Loja", sap.ui.model.FilterOperator.EQ, sLoja));
      }

      let filtroPrecoEstoqueSelect = this.byId("comboEstoque").getSelectedKey();

      if (filtroPrecoEstoqueSelect != "" && filtroPrecoEstoqueSelect != 0) {
        filters.push(new Filter("estoquezero", sap.ui.model.FilterOperator.EQ, filtroPrecoEstoqueSelect));
      }

      var oData = this.getView().getModel();
      var sPath = "/ProdutosSet";
      var oSearchField = this.getView().byId("searchField").getValue();
      var oSearchField1 = this.getView().byId("searchField1").getValue();
      var sSearchField = "";

      if (oSearchField !== "") {
        sSearchField = oSearchField;
      } else if (oSearchField1 !== "") {
        sSearchField = oSearchField1;
      }

      if (sSearchField == "") {
        filters.push(new Filter("Codproduto", FilterOperator.Contains, produto));
        filters.push(new Filter("Grpmercmacro", FilterOperator.Contains, gl_grupomarc));
        filters.push(new Filter("Texto", FilterOperator.EQ, "NEX"));
      } else {
        if (sSearchField.length > 0) {
          if ($.isNumeric(sSearchField)) {
            filters.push(new Filter("Codproduto", FilterOperator.EQ, sSearchField));
          } else {
            filters.push(new Filter("Codproduto", FilterOperator.Contains, produto));
            filters.push(new Filter("Grpmercmacro", FilterOperator.Contains, gl_grupomarc));
            filters.push(new Filter("Texto", FilterOperator.EQ, 'NEX&-&' + sSearchField));
          }
        }
      }

      var oView = this;

      var oModelData = this.getModel("ProductsModel").getData();
      this.getView().setBusy(true);

      var onSuccess = function (odata) {
        oView.getView().setBusy(false);
        if (odata.results.length === 0) {
          oView.byId("input-button").setVisible(false);
          MessageToast.show('Fim da lista', {
            duration: 300
          });
        }

        odata.results.forEach(function (prod) {
          var precoOriginal = prod.Precodezx;
          var estoqueOriginal = prod.Estoque;
          prod.Precodezx = parseFloat(prod.Precodezx).toLocaleString('pt-BR', formatoMoney);

          oView._loadMaterialData("UN", prod.Codproduto.toString()).then(function (oDataHelper) {
            var lotte = false;
            if (prod.lote == 'X') {
              lotte = true;
            };
            var oProduto = {
              Codproduto: prod.Codproduto,
              Descrprod: prod.Descrprod,
              Loja: prod.Loja,
              Setorativ: prod.Setorativ,
              Descrsetor: prod.Descrsetor,
              Precovista: prod.Precovista,
              Precodezx: prod.Precodezx,
              PrecodezxOri: prod.Precodezx,
              Estoque: prod.Estoque,
              EstoqueOri: prod.Estoque,
              Undmedida: prod.Undmedida,
              UndmedidaOri: prod.Undmedida,
              Descrundmed: prod.Descrundmed,
              Grupomat: prod.Grupomat,
              Descrmat: prod.Descrmat,
              Classprod: prod.Classprod,
              Grupomerc: prod.Grupomerc,
              EstljQuan1: prod.EstljQuan1,
              Estloja1: prod.Estloja1,
              EstljQuan2: prod.EstljQuan2,
              EstljQuan3: prod.EstljQuan3,
              Proprio: prod.Proprio,
              Lote: lotte
            };
            var unittest = false;
            var UnitHelper = [];
            oDataHelper.results.forEach(function (oResult) {
              if (prod.Undmedida == oResult.Coddadomestre) {
                unittest = true;
              }
              switch (oResult.Codconsulta) {
              case "UN":
                UnitHelper.push({
                  Codconsulta: oResult.Codconsulta,
                  Coddadomestre: oResult.Coddadomestre,
                  Textodadomestre: oResult.Textodadomestre
                });
                break;
              }
            })
            if (!unittest) {
              UnitHelper.push({
                Codconsulta: 'UN',
                Coddadomestre: prod.Undmedida,
                Textodadomestre: prod.Undmedida
              });
            }
            var lott = false;
            if (prod.lote == 'X') {
              lott = true;
            };
            oModelData.itens.push({
              Codproduto: parseFloat(prod.Codproduto),
              Descrprod: prod.Descrprod,
              Precodezx: parseFloat(prod.Precodezx),
              PrecodezxOri: parseFloat(prod.Precodezx),
              Estoque: parseFloat(prod.Estoque),
              EstoqueOri: parseFloat(prod.Estoque),
              EstoqueOri: parseFloat(prod.Estoque),
              Loja: parseFloat(prod.Loja),
              Fisico: prod.Fisico.trim(),
              FisicoOri: prod.Fisico.trim(),
              UnitHelper: UnitHelper,
              Undmedida: prod.Undmedida,
              UndmedidaOri: prod.Undmedida,
              Grupomerc: prod.Grupomerc,
              oProduto: oProduto,
              Lote: lott
            });
            oView.getModel("ProductsModel").refresh(true);
          });
          if (parseFloat(oView.getView().byId("searchField").getValue()) != parseFloat(prod.Codproduto)) {

          }
        })

      };
      var onError = function (odata) {

      };

      if (sSearchField == "") {
        oData.read(sPath, {
          filters: filters,
          success: onSuccess,
          error: onError
        });
      } else {
        MessageToast.show('Fim da lista', {
          duration: 300
        });
        oView.byId("input-button").setVisible(false);
        this.getView().setBusy(false);
      }
    },

    price34: function (sValue) {

      sValue = sValue != null ? sValue.toString().trim() : sValue;

      if (!isNaN(sValue)) {
        var numberFormat = NumberFormat.getFloatInstance({
          maxFractionDigits: 3,
          minFractionDigits: 3,
          groupingEnabled: true,
          groupingSeparator: ".",
          decimalSeparator: ","
        });
        return numberFormat.format(sValue);
      }
      return sValue;
    },

    onChangeQtd: function (oEvent) {
      this.getView().setBusy(true);
      var oObj = oEvent.getSource().oPropagatedProperties.oBindingContexts.ProductsModel.getObject();
      var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + oObj.Codproduto + "',Unidade='" + oObj.Undmedida +
        "',Quantidade='" + 1 + "',Centro='" + oObj.Loja + "')";
      var thisView = this;
      var onError = function (odata, response) {
        thisView.getView().setBusy(false);
        sap.ui.core.BusyIndicator.hide();
        MessageBox.error(odata.responseText, {
          styleClass: "sapUiSizeCompact"
        });
      };
      var onSuccess = function (odata) {
        thisView.getView().setBusy(false);
        oObj.Precodezx = parseFloat(odata.PrecoBase);
        oObj.oProduto.Undmedida = oObj.Undmedida;
        oObj.oProduto.Precodezx = parseFloat(odata.PrecoBase);
        oObj.oProduto.Estoque = parseFloat(odata.Estoque);
        oObj.Estoque = parseFloat(odata.Estoque);
        oObj.Fisico = odata.Fisico.trim();
        this.getModel("ProductsModel").refresh(true);
      };
      if (oObj.UndmedidaOri == oEvent.mParameters.value) {
        thisView.getView().setBusy(false);
        oObj.Precodezx = parseFloat(oObj.PrecodezxOri);
        oObj.oProduto.UndmedidaOri = oObj.UndmedidaOri;
        oObj.oProduto.Precodezx = parseFloat(oObj.PrecodezxOri);
        oObj.oProduto.Estoque = parseFloat(oObj.EstoqueOri);
        oObj.Estoque = parseFloat(oObj.EstoqueOri);
        oObj.Fisico = oObj.FisicoOri;
        this.getModel("ProductsModel").refresh(true);

      } else {
        this.getView().getModel().read(sPath, {
          success: onSuccess.bind(this),
          error: onError.bind(this)
        });
      }
      var oView = this;
    },

    /**
     * Event handler when a table item gets pressed
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    onPress: function (oEvent) {
      // The source is the list item that got pressed
      this._showObject(oEvent.getSource());
    },

    /**
     * Shows the selected item on the object page
     * On phones a additional history entry is created
     * @param {sap.m.ObjectListItem} oItem selected Item
     * @private
     */
    _showObject: function (oItem) {
      var oView = this;
      var url = 'url';
      var nNumber = '';
      if (oItem.getBindingContext()) {
        nNumber = oItem.getBindingContext().getProperty("Codproduto");
      } else {
        nNumber = oItem.mAggregations.cells[0].mProperties.number;
      }
      var onSuccess = function (odata) {
        if (odata.Urlprod != '') {
          url = odata.Urlprod.replace(/\//g, "&");
        }
        oView.getRouter().navTo("produtosdetalhe", {
          Id: nNumber,
          Img: url
        });
      };
      var onError = function (odata) {

      };
      var sPath = "/ProdutosSet(Codproduto='" + nNumber +
        "',Grpmercmacro='',Texto='',Loja='',Orgvendas='',Canal='',Setorativ='',Escrvendas='',Eqpvendas='',Grupomerc='',Grupomat='')";
      var oData = this.getView().getModel();
      oData.read(sPath, {
        async: false,
        success: onSuccess,
        error: onError
      });
    },

    _searchProdutos: function (query, tipo) {
      //Filtro Categoria
      var oComboBoxCategoria = this.getView().byId("combo1");
      var aComboboxItems = oComboBoxCategoria.getSelectedKeys();
      //Loja
      var oComboBox = this.getView().byId("combo2");
      var sLoja = oComboBox.getSelectedKey();
      //Grupo Mercadoria
      var oText = this.getView().byId("labelGrupoMercadoria");
      var sGrpMercadoria = oText.getText();
      //Searchfield
      var oSearchField = this.getView().byId("searchField").getValue();
      var oSearchField1 = this.getView().byId("searchField1").getValue();
      var sSearchField = "";
      if (gl_grupomarc == "" && oSearchField == "") {
        sLoja = "";
      }
      if (tipo === "S") {
        sSearchField = query;
      } else {
        if (oSearchField !== "") {
          sSearchField = oSearchField;
        } else if (oSearchField1 !== "") {
          sSearchField = oSearchField1;
        }
      }
      var aFilters = [];
      // Grupo Macro
      if (tipo === "G") {
        if (query.length > 0) {
          aFilters.push(new Filter("Grpmercmacro", FilterOperator.Contains, query));
        }
      } else {
        if (sGrpMercadoria.length > 0) {
          aFilters.push(new Filter("Grpmercmacro", FilterOperator.Contains, sGrpMercadoria));
        }
      }
      // Produto - Texto
      if (sSearchField.length > 0) {
        if ($.isNumeric(sSearchField)) {
          aFilters.push(new Filter("Codproduto", FilterOperator.EQ, sSearchField));
        } else {
          aFilters.push(new Filter("Texto", FilterOperator.EQ, sSearchField));
        }
      }
      // Categorias
      if (aComboboxItems.length > 0) {
        aFilters.push(this._filterCategoria(aComboboxItems));
      }
      // Loja
      if (sLoja.length > 0) {
        aFilters.push(new Filter("Loja", sap.ui.model.FilterOperator.EQ, sLoja));
      }
      // Itens Próprios
      aFilters.push(new Filter("Proprio", FilterOperator.EQ, true));
      this._carregarDados(aFilters, tipo);
    },

    /**
     *@memberOf arcelor.controller
     */
    _filterCategoria: function (comboboxItems) {
      var filter = '',
        query = '';
      if (comboboxItems.length != '') {
        for (var i = 0; i < comboboxItems.length; i++) {
          query += "" + comboboxItems[i].toString() + "";
          if (i != comboboxItems.length - 1) {
            query += ",";
          }
        }
        filter = new sap.ui.model.Filter("Grupomat", sap.ui.model.FilterOperator.Contains, query);
      }
      return filter;
    },

    /**
     *@memberOf arcelor.controller
     */
    _carregarDados: function (filters, tipo) {
      //Grupo Mercadoria
      var oText = this.getView().byId("labelGrupoMercadoria");
      var grpMercadoria = oText.getText();

      this.onSearchProd(filters);
      if ((tipo === "G") || (tipo === "S" && grpMercadoria === "")) {
        // Filtros Permitidos 
        var aDropDownFilters = filters.filter(function (oFilter) {
          return (oFilter.sPath === "Codproduto" || oFilter.sPath === "Grpmercmacro" || oFilter.sPath === "Texto" ||
            oFilter.sPath === "Loja" || oFilter.sPath === "Orgvendas" || oFilter.sPath === "Canal" || oFilter.sPath === "Setorativ" ||
            oFilter.sPath === "Escrvendas" || oFilter.sPath === "Grupomerc");
        });
        if (aDropDownFilters.length > 0) {
          if (aDropDownFilters[0].sPath == "Grpmercmacro") {
            this.getView().byId("combo1").getBinding("items").filter(aDropDownFilters[0]);
            //Loja
            this.getView().byId("combo2").getBinding("items").filter(aDropDownFilters[0]);
          }
        }
      }
    },

    onLojaFilter: function () {
      if (gl_grupomarc != "" || this.getView().byId("searchField").getValue() != "") {
        this._searchProdutos('', 'L');
      }
    },

    onCategoriaFilter: function () {
      if (this.byId("Lista_table").getItems().length > 0) {
        this._searchProdutos('', 'C');
      }

    },

    radiobuttonselect: function () {
      if (this.byId("Lista_table").getItems().length > 0) {
        this._searchProdutos('', 'C');
      }
    },

    _onBindingChange: function () {
      if (!this.getView.getBindingContext()) {
        this.getRouter().getTargets().display("notFound");
      }
    },

    /**
     *@memberOf arcelor.controller.Produtos
     */
    onChangeImageGrid: function () {
      //This code was generated by the layout editor.
      var oComboBox = this.getView().byId("imagemGrid");
      var valor = oComboBox.getSelectedKey();
      var tabelaGrid = this.getView().byId("Lista_table");

      if (valor === "Imagem") {
        tabelaGrid.setVisible(false);
      } else {
        tabelaGrid.setVisible(true);
      }
    },

    _loadMaterialData: function (sQuery, sMaterial) {
      return new Promise(function (fnResolve, fnReject) {
        var aFilters = [];
        aFilters.push(new Filter("Codconsulta", sap.ui.model.FilterOperator.EQ, sQuery));
        aFilters.push(new Filter("Material", sap.ui.model.FilterOperator.EQ, sMaterial));
        this.getModel().read("/DM_DadoMestreOVSet", {
          filters: aFilters,
          success: function (oData) {
            fnResolve(oData);
          },
          error: function (oError) {
            fnReject(oError);
          }
        });
      }.bind(this));
    },

    onAddCarrinho: function (oEvent, oProduto) {
      if (typeof oEvent.getSource().getBindingContext() === 'undefined') {
        if (oProduto) {
          var oEntry = oProduto;
        } else if (oEvent.getSource().data("mydata")) {
          var oEntry = oEvent.getSource().data("mydata");
        }
      } else if (oEvent.getSource().data("mydata")) {
        var oEntry = oEvent.getSource().data("mydata");
      } else {
        var oEntry = oEvent.getSource().getBindingContext().getObject();
      }

      var aModelFilter = {
        MaterialData: oEntry,
        MeasureHelper: [],
        PlantHelper: [],
        FreightHelper: []
      };
      if (!this.getView().getModel("CartHelperModel")) {
        this.getView().setModel(new JSONModel(aModelFilter), "CartHelperModel");
      } else {
        this.getView().getModel("CartHelperModel").setData(aModelFilter);
      }
      this.getView().setBusy(true);
      this._loadMaterialData("CU;UN;FR", oEntry.Codproduto).then(function (oData) {
        var oModelFilterData = this.getView().getModel("CartHelperModel").getData();

        function customMaterialFind(sKey) {
          return function (oElement) {
            var oObject = oElement.getObject();
            return oObject.Loja === sKey && parseFloat(oObject.Estoque) > 0;
          };
        }
        var aMaterialContexts = this.byId("Lista_table").getBinding("items").getContexts().filter(function (oElement) {
          return oElement.getObject().Codproduto === oModelFilterData.MaterialData.Codproduto;
        });
        var aPlantBaseHelper = [];
        oData.results.forEach(function (oResult) {
          switch (oResult.Codconsulta) {
          case "UN":
            oModelFilterData.MeasureHelper.push({
              Codconsulta: oResult.Codconsulta,
              Coddadomestre: oResult.Coddadomestre,
              Textodadomestre: oResult.Textodadomestre
            });
            break;
          case "FR":
            oModelFilterData.FreightHelper.push({
              Codconsulta: oResult.Codconsulta,
              Coddadomestre: oResult.Coddadomestre,
              Textodadomestre: oResult.Textodadomestre
            });
            break;
          case "CU":
            if (aMaterialContexts.find(customMaterialFind(oResult.Coddadomestre))) {
              aPlantBaseHelper.push({
                Codconsulta: oResult.Codconsulta,
                Coddadomestre: oResult.Coddadomestre,
                Textodadomestre: oResult.Textodadomestre
              });
            }
            break;
          case "CZ":

            aPlantBaseHelper.push({
              Codconsulta: oResult.Codconsulta,
              Coddadomestre: oResult.Coddadomestre,
              Textodadomestre: oResult.Textodadomestre
            });

            break;
          }
        });
        var aHelpChecker = {};
        aPlantBaseHelper.forEach(function (oObject) {
          if (!aHelpChecker[oObject.Coddadomestre]) {
            aHelpChecker[oObject.Coddadomestre] = true;
            oModelFilterData.PlantHelper.push(oObject);
          }
        });
        this.getView().setBusy(false);
        this._openMaterialPopup();
      }.bind(this));
    },

    _checkMaterialPopup: function (iValue) {
      var bQuantityValid = $.isNumeric(iValue.replace(",", ".")) && iValue.replace(",", ".") > 0;
      var bPlantValid = (sap.ui.getCore().getElementById("input-comboCentro").getValue().length > 0);
      var bMeasureValid = (sap.ui.getCore().getElementById("input-comboMedida").getValue().length > 0);
      return bQuantityValid && bPlantValid && bMeasureValid;
    },

    _openMaterialPopup: function () {
      var oEntry = this.getView().getModel("CartHelperModel").getData().MaterialData;
      var dialog = new Dialog({
        title: 'Adicionar ao Carrinho Item: ' + parseInt(oEntry.Codproduto),
        type: 'Message',
        content: [
          new HorizontalLayout({
            content: [
              new VerticalLayout({
                width: '120px',
                content: [
                  new Text({
                    text: 'Quantidade: '
                  })
                ]
              }),
              new VerticalLayout({
                content: [
                  new sap.m.Input('incluirQtd', {
                    width: '100%',
                    Text: "Quantidade",
                    liveChange: function (oEvent) {
                      var value = oEvent.getParameter("value");
                      var valueState = isNaN(value.replace(",", ".")) ? "Error" : value <= 0 ? "Error" : "Success";
                      oEvent.getSource().setValueState(valueState);
                      if (((!$.isNumeric(value.replace(",", ".")) || value <= 0) && value !== "") || value === "") {
                        sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(false);
                      } else {
                        sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(value));
                      }
                    }.bind(this)
                  }),
                  new sap.m.ComboBox({
                    id: 'input-comboMedida',
                    Text: 'Medida',
                    width: "100%",
                    placeholder: "Medida",
                    showSecondaryValues: true,
                    value: oEntry.Undmedida,
                    change: function () {
                      var iQuantity = sap.ui.getCore().getElementById("incluirQtd").getValue();
                      sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(iQuantity));
                    }.bind(this),
                    loadItems: function (oEvent) {
                      var oModelComboMedida = new sap.ui.model.json.JSONModel();
                      oModelComboMedida.setSizeLimit(5000);
                      oModelComboMedida.setData({
                        modelDataComboMedida: this.getView().getModel("CartHelperModel").getData().MeasureHelper
                      });
                      oEvent.getSource().setModel(oModelComboMedida);
                    }.bind(this),
                    items: {
                      path: "/modelDataComboMedida",
                      template: new sap.ui.core.ListItem({
                        text: "{Coddadomestre}",
                        key: "{Coddadomestre}",
                        additionalText: "{Textodadomestre}"
                      })
                    }
                  }),
                  new sap.m.ComboBox({
                    id: 'input-comboCentro',
                    width: "100%",
                    placeholder: "Centro",
                    value: oEntry.Loja,
                    showSecondaryValues: true,
                    change: function () {
                      var iQuantity = sap.ui.getCore().getElementById("incluirQtd").getValue();
                      sap.ui.getCore().byId("btnQtdCarrinho").setEnabled(this._checkMaterialPopup(iQuantity));
                    }.bind(this),
                    loadItems: function (oEvent) {
                      var oModelComboCentro = new sap.ui.model.json.JSONModel();
                      oModelComboCentro.setSizeLimit(5000);
                      oModelComboCentro.setData({
                        modelDataComboCentro: this.getView().getModel("CartHelperModel").getData().PlantHelper
                      });
                      oEvent.getSource().setModel(oModelComboCentro);
                    }.bind(this),
                    items: {
                      path: "/modelDataComboCentro",
                      template: new sap.ui.core.ListItem({
                        text: "{Coddadomestre}",
                        key: "{Codconsulta}",
                        additionalText: "{Textodadomestre}"
                      })
                    }
                  })
                ]
              })
            ]
          })
        ],
        beginButton: new Button('btnQtdCarrinho', {
          enabled: false,
          text: 'Incluir',
          icon: 'sap-icon://cart',
          press: function (oEvent) {
            var oEntry = this.getView().getModel("CartHelperModel").getData().MaterialData;
            var oCartModel = this.getView().getModel("cartProducts");
            var oCollectionEntries = $.extend({}, oCartModel.getData().cartEntries);
            var centro = sap.ui.getCore().getElementById("input-comboCentro").getValue();
            var medida = sap.ui.getCore().getElementById("input-comboMedida").getValue();
            var sChave = oEntry.Codproduto + centro;
            var oCartEntry = oCollectionEntries[sChave];
            if (oCartEntry !== undefined) {
              MessageBox.error("Produto já incluído no carrinho.", {
                styleClass: "sapUiSizeCompact"
              });
              return;
            }
            var onError = function (odata, response) {
              sap.ui.core.BusyIndicator.hide();
              MessageBox.error(odata.responseText, {
                styleClass: "sapUiSizeCompact"
              });
            };
            var onSuccess = function (odata) {
              sap.ui.core.BusyIndicator.hide();
              aDataItensCarrinho = [];
              aDataItensCarrinho.push({
                Item: "",
                Material: oEntry.Codproduto,
                Descricao: oEntry.Descrprod,
                Estque: odata.Estoque,
                Fisico: oEntry.Fisico,
                QtdBase: sap.ui.getCore().byId("incluirQtd").getValue(),
                Qtd: sap.ui.getCore().byId("incluirQtd").getValue(),
                Unidade: medida,
                PrecoBase: odata.PrecoBase,
                PrecoTbSemIPI: odata.Preco,
                PrecoNegComIPI: "",
                Markup: odata.ValZmkp,
                PrecoNegSemIPI: "",
                DescPercentual: "",
                ValorTotItem: odata.Preco,
                PrecoTarget: "",
                ValorST: "",
                Centro: sap.ui.getCore().getElementById("input-comboCentro").getValue(),
                Frete: "",
                ItemPedCli: "",
                PrecoNegSemIPIState: sap.ui.core.ValueState.None,
                PrecoNegSemIPIStateText: oEntry.Precodezx,
                DescPercentualState: sap.ui.core.ValueState.None,
                DescPercentualText: "",
                UnitHelper: this.getView().getModel("CartHelperModel").getData().MeasureHelper,
                PlantHelper: this.getView().getModel("CartHelperModel").getData().PlantHelper,
                FreightHelper: this.getView().getModel("CartHelperModel").getData().FreightHelper
              });
              if (parseFloat(oEntry.Estoque) < parseFloat(sap.ui.getCore().byId("incluirQtd").getValue().replace(",", "."))) {
                MessageBox.error("Estoque menor que a quantidade estipulada. ", {
                    styleClass: "sapUiSizeCompact"
                  }),
                  dialog.close();
              } else {
                cart.addToCart(null, aDataItensCarrinho[0], oCartModel);
                MessageBox.success("Um novo item foi adicionado ao seu carrinho de compras. ", {
                    styleClass: "sapUiSizeCompact"
                  }),
                  dialog.close();
              }
            };
            var quantidade1 = sap.ui.getCore().byId("incluirQtd").getValue();
            var sPath = "/CalculaItemCarrinhoSet(Item='',Material='" + oEntry.Codproduto + "',Unidade='" + medida +
              "',Quantidade='" + quantidade1.replace(",", ".") + "',Centro='" + centro + "')";
            this.getView().getModel().read(sPath, {
              success: onSuccess.bind(this),
              error: onError.bind(this)
            });
            sap.ui.core.BusyIndicator.show();
          }.bind(this)
        }),
        endButton: new Button({
          text: 'Cancelar',
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function () {
          dialog.destroy();
        }
      });
      dialog.open();
    },

    handleUserNamePress: function (oEvent) {
      var popover = new Popover({
        showHeader: false,
        placement: sap.m.PlacementType.Bottom,
        content: [
          new Button({
            text: 'Feedback',
            type: sap.m.ButtonType.Transparent
          }),
          new Button({
            text: 'Help',
            type: sap.m.ButtonType.Transparent
          }),
          new Button({
            text: 'Logout',
            type: sap.m.ButtonType.Transparent,
            press: function () {
              window.close();
            }
          })
        ]
      }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
      popover.openBy(oEvent.getSource());
    },

    onVisualizarCarrinho: function (oEvent) {
      this.getRouter().navTo("itenscarrinho", {
        Id: 1
      }, true);
    },

    onSelectionChange: function (oEvent) {

      var sPatch = oEvent.getSource().getBindingContext("ProductsModel").getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel("ProductsModel");
      var oRow = oModel.getProperty(sPatch);
      var oModelSelectionA = new sap.ui.model.json.JSONModel();

      var aSelection = {
        idMaterial: oRow.Codproduto
      };

      oModelSelectionA.setData(aSelection);
      sap.ui.getCore().setModel(oModelSelectionA, "dados_selecao_relatorio");

      this.getRouter().navTo("NecessidadeEstoq", {
        Id: oRow.Codproduto
      }, true);

    },

    onShowLote: function (oEvent) {
      var sPatch = oEvent.getSource().getBindingContext("ProductsModel").getPath();
      var index = sPatch.substring(sPatch.length - 1);
      var oSource = oEvent.getSource();
      var oModel = oSource.getModel("ProductsModel");
      var oRow = oModel.getProperty(sPatch);
      var oModelSelectionA = new sap.ui.model.json.JSONModel();
      this.aAllFilters = [];

      this.oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, oRow.Codproduto);
      this.aAllFilters.push(this.oFilter);

      this.oFilter = new sap.ui.model.Filter("Meins", sap.ui.model.FilterOperator.EQ, oRow.Undmedida);
      this.aAllFilters.push(this.oFilter);
      var produto = oRow.Descrprod;
      var loja = oRow.Loja;
      var that = this;

      this.getModel().read("/EstoqueLoteSet", {
        filters: this.aAllFilters,
        success: function (oData) {
          let oModel = new sap.ui.model.json.JSONModel();
          let total = 0;
          if (oData.results.length == 0) {
            MessageToast.show("Material sem estoque nos lotes");
            return;
          }
          for (var g = 0; g < oData.results.length; g++) {
            total += parseFloat(oData.results[g].Clabs);
          }
          var box1 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start
          })
          var texto_button = '';
          var text1 = new sap.m.Label({
            text: "Material: ",
            design: "Bold",
            class: "sapUiSmallMarginEnd"
          });
          var text13 = new sap.m.Text({
            text: '   '
          });
          text13.setRenderWhitespace(true);
          var text133 = new sap.m.Text({
            text: '   '
          });
          text133.setRenderWhitespace(true);
          var text12 = new sap.m.Label({
            text: oData.results[0].Matnr.replace(/^0+/, '') + ' - ' + produto
          });
          box1.addItem(text1);
          box1.addItem(text133);
          box1.addItem(text12);

          var box2 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start
          })
          var text2 = new sap.m.Label({
            text: "Tipo Material: ",
            design: "Bold"
          });
          var text22 = new sap.m.Label({
            text: oData.results[0].Mtart + ' - ' + oData.results[0].Mtbez
          });
          box2.addItem(text2);
          var text134 = new sap.m.Text({
            text: '   '
          });
          text134.setRenderWhitespace(true);
          box2.addItem(text134);
          box2.addItem(text22);
          var box3 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start
          })
          var text3 = new sap.m.Label({
            text: "Unidade Selecionada: ",
            design: "Bold"
          });
          var text33 = new sap.m.Label({
            text: oData.results[0].Meins
          });
          var text34 = new sap.m.Label({
            text: "Unidade Básica: ",
            design: "Bold"
          });
          var text35 = new sap.m.Label({
            text: oData.results[0].MeinsBas
          });

          box3.addItem(text3);
          var text135 = new sap.m.Text({
            text: '   '
          });
          text135.setRenderWhitespace(true);
          box3.addItem(text135);
          box3.addItem(text33);
          var text136 = new sap.m.Text({
            text: '   '
          });
          text136.setRenderWhitespace(true);
          box3.addItem(text136);
          box3.addItem(text34);
          box3.addItem(text13);
          box3.addItem(text35);

          var box4 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start,
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
          })
          text3 = new sap.m.Label({
            text: "Centro/Depósitos/Lotes",
            design: "Bold"
          });
          var text4 = new sap.m.Label({
            text: "Estoque",
            design: "Bold"
          });
          box4.addItem(text3);
          box4.addItem(text4);

          var box5 = new sap.m.HBox({
            width: "100%",
            direction: sap.m.FlexDirection.Row,
            alignContent: sap.m.FlexAlignContent.Center,
            alignItems: sap.m.FlexAlignItems.Start,
            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
          })
          text3 = new sap.m.Label({
            text: loja + " - " + oData.results[0].nome
          });
          text4 = new sap.m.Label({
            text: that.price34(total)
          });
          box5.addItem(text3);
          box5.addItem(text4);
          var totlog = 0;
          var lgort = oData.results[0].Lgort;
          var sayings = new Map();
          var controller1 = 'X';
          var box6 = []
          for (var g = 0; g < oData.results.length; g++) {
            if (lgort == oData.results[g].Lgort) {
              totlog += parseFloat(oData.results[g].Clabs);

            } else {
              sayings.set(lgort, that.price34(totlog));
              totlog = parseFloat(oData.results[g].Clabs);

            }
          }
          sayings.set(lgort, that.price34(totlog));
          lgort = oData.results[0].Lgort;
          for (var g = 0; g < oData.results.length; g++) {
            if (lgort == oData.results[g].Lgort) {
              if (controller1 == 'X') {
                var text1367 = new sap.m.Text({
                  text: '    ' + oData.results[g].Lgort + ' - ' + oData.results[g].deposito
                });
                text1367.setRenderWhitespace(true);

                box6.push(new sap.m.HBox({
                  width: "100%",
                  alignContent: sap.m.FlexAlignContent.SpaceBetween,
                  direction: sap.m.FlexDirection.Row,
                  alignContent: sap.m.FlexAlignContent.Stretch,
                  alignItems: sap.m.FlexAlignItems.Center,
                  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                  items: [
                    text1367,
                    new Text({
                      text: sayings.get(oData.results[g].Lgort)
                    })
                  ]
                }))
                var text1367 = new sap.m.Text({
                  text: '    '
                });
                text1367.setRenderWhitespace(true);

                box6.push(new sap.m.HBox({
                  width: "100%",
                  alignContent: sap.m.FlexAlignContent.SpaceBetween,
                  direction: sap.m.FlexDirection.Row,
                  alignContent: sap.m.FlexAlignContent.Stretch,
                  alignItems: sap.m.FlexAlignItems.Center,
                  justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                  items: [
                    text1367,
                  ]
                }))
                controller1 = 'Z'
              }

            } else {
              lgort = oData.results[g].Lgort;
              controller1 == 'X';

            }
            var text1367 = new sap.m.Text({
              text: '         ' + oData.results[g].Charg
            });
            text1367.setRenderWhitespace(true);
            box6.push(new sap.m.HBox({
              width: "100%",
              alignContent: sap.m.FlexAlignContent.SpaceBetween,
              direction: sap.m.FlexDirection.Row,
              alignContent: sap.m.FlexAlignContent.Stretch,
              alignItems: sap.m.FlexAlignItems.Start,
              justifyContent: sap.m.FlexJustifyContent.SpaceBetween,

              items: [

                text1367,
                new Text({
                  text: that.price34(oData.results[g].Clabs)
                })
              ]
            }))
            var text1367 = new sap.m.Text({
              text: '      '
            });
            text1367.setRenderWhitespace(true);

            box6.push(new sap.m.HBox({
              width: "100%",
              alignContent: sap.m.FlexAlignContent.SpaceBetween,
              direction: sap.m.FlexDirection.Row,
              alignContent: sap.m.FlexAlignContent.Stretch,
              alignItems: sap.m.FlexAlignItems.Center,
              justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
              items: [
                text1367,
              ]
            }))
          }
          var boxPai = new sap.m.HBox({
            width: "100%",
            fitContainer: false,
            direction: sap.m.FlexDirection.Column,
            alignItems: sap.m.FlexAlignItems.Start,
          });
          boxPai.addItem(box1);
          boxPai.addItem(box2);
          boxPai.addItem(box3);
          boxPai.addItem(box4);
          boxPai.addItem(box5);
          box6.forEach(function (box) {
            boxPai.addItem(box);
          });
          var dialog = new Dialog({
            title: 'Estoque por Lote',
            type: 'Message',
            contentWidth: '40%',
            content: boxPai,
            beginButton: new Button({
              text: 'OK',
              press: function () {
                dialog.close();
              }
            }),
            afterClose: function () {
              dialog.destroy();
            }
          });

          dialog.open();
        },
        error: function (error) {
          oViewReport.setBusy(false);
        }
      });

    },

    onPressRecebimento: function (oEvent) {
      this.getRouter().navTo("RecebimentoNf", true);
    },

    onPressMenuButton: function () {
      sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

    onNavBack: function () {
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("master");
    }

  });
});