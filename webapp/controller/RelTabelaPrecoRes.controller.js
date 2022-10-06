sap.ui.define([
"arcelor/controller/BaseController",
"sap/ui/core/routing/History",
"sap/ui/export/Spreadsheet",
"sap/ui/core/util/Export",
"sap/ui/core/util/ExportTypeCSV",
"arcelor/model/formatter"
], function (BaseController, History, Spreadsheet, Export, ExportTypeCSV, formatter) {
"use strict";

return BaseController.extend("arcelor.controller.RelTabelaPrecoRes", {

    formatter: formatter,

    /**
    * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
    * This hook is the same one that SAPUI5 controls get after being rendered.
    * @memberOf arcelor..view.RelTabelaPrecoRes
    */
    onAfterRendering: function () {
    this.oModelSel = sap.ui.getCore().getModel("dados_selecao_relatorio");
    this._loadFilterRelTabelaPreco(this.getView(), this.oModelSel.getData());
    var dataAtual = new Date();
    this.byId("dataAtual").setText(dataAtual.toLocaleDateString(dataAtual) + " " + dataAtual.toLocaleTimeString(dataAtual));

    var mesAno = dataAtual.toLocaleDateString(dataAtual).substring(3);

    },

    createColumnConfig: function () {
    var aCols = [];

    aCols.push({
        label: this._loadI18n(this.getView(), "vkbur"),
        property: "Vkbur",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "bezei1"),
        property: "Bezei",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "datbi"),
        property: "Datbi",
        type: "datetime"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "vtweg"),
        property: "Vtweg",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "vtext2"),
        property: "Vtext2",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "spart"),
        property: "Spart",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "vtext3"),
        property: "Vtext",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "kondm"),
        property: "Kondm",
        type: "string"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "vtext1"),
        property: "Vtext1",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "matnr"),
        property: "Matnr",
        type: "string"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "maktx"),
        property: "Maktx",
        type: "string"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "umrez"),
        property: "Umrez",
        type: "number"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "ipi"),
        property: "Ipi",
        type: "string"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "icms"),
        property: "Icms",
        type: "number"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "ipito"),
        property: "IpiTo",
        type: "number"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "ipibr"),
        property: "IpiBr",
        type: "number"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "semto"),
        property: "SemTo",
        type: "number"
    });
    aCols.push({
        label: this._loadI18n(this.getView(), "sembr"),
        property: "SemBr",
        type: "number"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "werks"),
        property: "Werks",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "descwerks"),
        property: "Name1",
        type: "string"
    });

    aCols.push({
        label: this._loadI18n(this.getView(), "vrsio"),
        property: "Vrsio",
        type: "string"
    });

    return aCols;
    },

    exportSpreadsheet: function () {
    var text = this;
    var oTab = this.getView().byId("tabela_relatorio");
    var oModel = oTab.getModel();
    var oData = oModel.getData();

for (var i = 0; i < oModel.getData().result.length; i++) {

if (oModel.getData().result[i].Ipi){
var newIpi = this.formatter.price3(oModel.getData().result[i].Ipi);
oModel.getData().result[i].Ipi = newIpi;
}
if (oModel.getData().result[i].Icms) {
var newIcms = this.formatter.price3(oModel.getData().result[i].Icms);
oModel.getData().result[i].Icms = newIcms;
}
if (oModel.getData().result[i].Umrez) {
var newUmrez = this.formatter.price3(oModel.getData().result[i].Umrez);
oModel.getData().result[i].Umrez = newUmrez;
}
if (oModel.getData().result[i].IpiTo){
var newIpiTo = this.formatter.price3(oModel.getData().result[i].IpiTo);
oModel.getData().result[i].IpiTo = newIpiTo;
}
if (oModel.getData().result[i].IpiBr) {
var newIpiBr = this.formatter.price3(oModel.getData().result[i].IpiBr);
oModel.getData().result[i].IpiBr = newIpiBr;
}
if (oModel.getData().result[i].SemTo){
var newSemTo = this.formatter.price3(oModel.getData().result[i].SemTo);
oModel.getData().result[i].SemTo = newSemTo;
}
if (oModel.getData().result[i].SemBr){
var newSemBr = this.formatter.price3(oModel.getData().result[i].SemBr);
oModel.getData().result[i].SemBr = newSemBr;
}

}

    var oExport = new sap.ui.core.util.Export({
        exportType: new ExportTypeCSV({separatorChar: ";"}),
        models: oModel,
        rows: {path: "/result"},
        columns: [{name: text._loadI18n(text.getView(), "vkbur"), template: { content: "{Vkbur}"}},
                  {name: text._loadI18n(text.getView(), "bezei1"), template: { content: "{Bezei}"}},
                  {name: text._loadI18n(text.getView(), "datbi"), template: { content: "{Datbi}"}},
                  {name: text._loadI18n(text.getView(), "vtweg"), template: { content: "{Vtweg}"}},
                  {name: text._loadI18n(text.getView(), "vtext2"), template: { content: "{vtext2}"}},
                  {name: text._loadI18n(text.getView(), "spart"), template: { content: "{spart}"}},
                  {name: text._loadI18n(text.getView(), "vtext3"), template: { content: "{Vtext}"}},
                  {name: text._loadI18n(text.getView(), "kondm"), template: { content: "{Kondm}"}},
                  {name: text._loadI18n(text.getView(), "vtext1"), template: { content: "{Vtext1}"}},
                  {name: text._loadI18n(text.getView(), "matnr"), template: { content: "{Matnr}"}},
                  {name: text._loadI18n(text.getView(), "maktx"), template: { content: "{Maktx}"}},
                  {name: text._loadI18n(text.getView(), "umrez"), template: { content: "{Umrez}"}},
{name: text._loadI18n(text.getView(), "ipi"), template: { content: "{Ipi}"}},
{name: text._loadI18n(text.getView(), "icms"), template: { content: "{Icms}"}},
                  {name: text._loadI18n(text.getView(), "ipito"), template: { content: "{IpiTo}"}},
                  {name: text._loadI18n(text.getView(), "ipibr"), template: { content: "{IpiBr}"}},
                  {name: text._loadI18n(text.getView(), "semto"), template: { content: "{SemTo}"}},
                  {name: text._loadI18n(text.getView(), "sembr"), template: { content: "{SemBr}"}},
                  {name: text._loadI18n(text.getView(), "werks"), template: { content: "{Werks}"}},
                  {name: text._loadI18n(text.getView(), "descwerks"), template: { content: "{Name1}"}},
                  {name: text._loadI18n(text.getView(), "vrsio"), template: { content: "{Vrsio}"}}]
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
        },

    onNavBack: function () {
    var sPreviousHash = History.getInstance().getPreviousHash();
    if (sPreviousHash !== undefined) {
        window.history.go(-1);
    } else {
        this.getOwnerComponent().getRouter().navTo("RelTabelaPrecoPesq", null, true);
    }
    },

    onImprimirPress: function (oEvent) {
    var bind = this.byId("tabela_relatorio").getBinding("items");
    var contexts = bind.getCurrentContexts();
    var sum = 0;
    var cond = false;
    var that = this;

    window.print();
    },

    onPressMenuButton: function () {
    sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
    },

});

});