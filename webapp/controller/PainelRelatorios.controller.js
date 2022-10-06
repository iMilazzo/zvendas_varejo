sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("arcelor.controller.PainelRelatorios", {

		onNavBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("master");
		},

		onAfterRendering: function () {
			sap.ui.controller("arcelor.controller.Inicio").authControl();
		},

		onPressPowerBI: function (oEvent) {
			window.open("https://app.powerbi.com/groups/me/reports", "_blank");
		},

		onPressGRCNfe: function () {
			let ambiente = sap.ui.getCore().getModel("modelUser").system;
			if (ambiente === "MB1" || ambiente === "MB4") {
				window.open("http://xq0abdb0.belgo.com.br:8001/sap/bc/webdynpro/xnfe/nfe_outb_monitor?sap-client=320", "_blank");
			} else {
				window.open("http://xp0abdb0.belgo.com.br:8001/sap/bc/webdynpro/xnfe/nfe_servsta_monitor?sap-client=320", "_blank");
			}
		},

		onPressTilesRelatorios: function (oEvt) {
			var oRouter = UIComponent.getRouterFor(this);
			var sHeaderName = oEvt.getSource().getId();

			if (sHeaderName.includes("idTileRelVolumeVendas")) {
				oRouter.navTo("RelVolumeVendasPesq");
			} else if (sHeaderName.includes("idTileRelDadosCobranca")) {
				oRouter.navTo("RelDadosCobrancaPesq");
			} else if (sHeaderName.includes(" ")) {
				oRouter.navTo("RelOvsCarteiraPesq");
			} else if (sHeaderName.includes("idTileRelCarteiraOvsDet")) {
				oRouter.navTo("RelCarteiraOvsDetPesq");
			} else if (sHeaderName.includes("idTileRelVendasDiarias")) {
				oRouter.navTo("RelVendasDiariasPesq");
			} else if (sHeaderName.includes("idTileRelTransferencia")) {
				oRouter.navTo("RelTransferenciaPesq");
			} else if (sHeaderName.includes("idTileRelCancelamentoNfs")) {
				oRouter.navTo("RelCancelamentoNfsPesq");
			} else if (sHeaderName.includes("idTileRelNfPeriodo")) {
				oRouter.navTo("RelNfPeriodoPesq");
			} else if (sHeaderName.includes("idTileRelInfoComercial")) {
				oRouter.navTo("RelInfoComercialPesq");
			} else if (sHeaderName.includes("idTileRelTabelaPreco")) {
				oRouter.navTo("RelTabelaPrecoPesq");
			} else if (sHeaderName.includes("idTileRelVolumeFaturamento")) {
				oRouter.navTo("RelVolumeFaturamentoPesq");
			} else if (sHeaderName.includes("idTileRelPagamentoAntecipado")) {
				oRouter.navTo("RelPagAntPesq");
			} else if (sHeaderName.includes("idTileChequeMoradia")) {
				oRouter.navTo("RelChequeMoradiaPesq");
			} else if (sHeaderName.includes("idTileRelVerificacaoCredito")) {
				oRouter.navTo("RelVerificacaoCreditoPesq");
			} else if (sHeaderName.includes("idTileRelOvsLimboPesq")) {
				oRouter.navTo("RelOvsLimboPesq");
			} else if (sHeaderName.includes("idTileRelOvsCarteiraPesq")) {
				oRouter.navTo("RelOvsCarteiraPesq");
			} else if (sHeaderName.includes("idTileRelImpressaoEtiqueta")) {
				oRouter.navTo("RelImpressaoEtiqueta");
			} else if (sHeaderName.includes("idTileRelDevolucao")) {
				oRouter.navTo("RelDevolucaoPesq");
			} else if(sHeaderName.includes("idTileRelelimi")){
				oRouter.navTo("RelelimiPesq");
			} else if(sHeaderName.includes("idTileRelEstoque")){
				oRouter.navTo("RelGrupoPesq");
			} else if(sHeaderName.includes("idTileRelPosicaoFinanceira")){
				oRouter.navTo("RelPosicaoFinanceira");
			}
		},

		onPressMenuButton: function () {
			sap.ui.controller("arcelor.controller.Inicio").onPressMenuButton();
		}

	});

});