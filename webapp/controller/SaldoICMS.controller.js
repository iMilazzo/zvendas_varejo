sap.ui.define([
	"arcelor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"arcelor/model/formatter"
], function (BaseController, JSONModel, MessageBox, Filter, FilterOperator, formatter) {
	"use strict";

	return BaseController.extend("arcelor.controller.SaldoICMS", {

		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf arcelor.view.Venda
		 */
		onInit: function () {
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
		},

		onAfterRendering: function () {
		},

		_onRouteMatched: function () {
			this.setModel(new JSONModel({
				periodFrom: "",
				periodTo: ""
			}), "saldoICMSModel");
			this.byId("idReportTable").destroyItems();
		},

		onNavBase: function () {
			this.getRouter().navTo("financeiro");
		},

		formatTime: function (time) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm:ss"
			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
			return timeStr;
		},

		formatPeriod: function (sPeriod) {
			if (sPeriod != null) {
				return sPeriod.substring(1, 3) + "/" + sPeriod.substring(3, 7);
			}
			return "";
		},

		onSearch: function () {
			var ofilterICMS = this.getModel("saldoICMSModel").getData();

			if (this._validateFields(this.getView(), ["periodFilterFrom", "periodFilterTo"])) {
				var sPeriodFrom = ofilterICMS.periodFrom.split("/")[1] + ofilterICMS.periodFrom.split("/")[0];
				var sPeriodTo = ofilterICMS.periodTo.split("/")[1] + ofilterICMS.periodTo.split("/")[0];

				if (ofilterICMS.periodFrom.length < 7 || isNaN(sPeriodFrom) || parseInt(ofilterICMS.periodFrom.split("/")[0]) < 1 || parseInt(
						ofilterICMS.periodFrom.split("/")[0]) > 12) {
					MessageBox.error("Campo Perído De possui valor inválido");
					return;
				}
				if (ofilterICMS.periodTo.length < 7 || isNaN(sPeriodTo) || parseInt(ofilterICMS.periodTo.split("/")[0]) < 1 || parseInt(
						ofilterICMS.periodTo.split("/")[0]) > 12) {
					MessageBox.error("Campo Período Até possui valor inválido");
					return;
				}

				if (parseInt(sPeriodFrom) <= parseInt(sPeriodTo)) {
					var aFilters = [];
					aFilters.push(new Filter("Periodo", FilterOperator.BT, sPeriodFrom, sPeriodTo));

					this.byId("idReportTable").getBinding("items").filter(aFilters);
				} else {
					MessageBox.error("Período inicial deve ser menor ou igual ao periodo final");
				}
			}
		},

		_validateFields: function (oView, oFields) {
			var that = this;
			var bValidationError = false;

			oFields.forEach(function (oInput) {
				bValidationError = that._validateInput(oView.byId(oInput)) || bValidationError;
			});

			if (!bValidationError) {
				sap.ui.getCore().getMessageManager().removeAllMessages();
				return true;
			} else {
				var vText = "Preencher campos obrigat�rios";
				var vTitle = "Ocorreu um erro";
				MessageBox.show(
					vText, {
						icon: MessageBox.Icon.ERROR,
						title: vTitle,
						actions: [MessageBox.Action.OK]
					}
				);
				return false;
			}
		},
		_validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oValueInput = "";
			if (!oInput) {
				return false;
			}

			switch ("function") {
			case typeof oInput.getValue:
				oValueInput = oInput.getValue();
				break;
			case typeof oInput.getSelectedKey:
				oValueInput = oInput.getSelectedKey();
				break;
			case typeof oInput.getSelected:
				oValueInput = oInput.getSelected();
				break;
			default:
				break;
			}

			if (oValueInput === "") {
				sValueState = "Error";
				bValidationError = true;
			}
			oInput.setValueState(sValueState);
			return bValidationError;
		}
	});

});