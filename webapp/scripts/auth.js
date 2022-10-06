function getAuthMap() {

	return new Promise(function (resolve, reject) {

		let mockAuthMap = [];
		mockAuthMap.push({
			technicalName: 'doLogin',
			type: 'button',
			hidden: false
		});
		mockAuthMap.push({
			technicalName: 'userNameLabel',
			type: 'label',
			hidden: true
		});
		mockAuthMap.push({
			technicalName: 'password',
			type: 'input',
			hidden: false,
			disable: false,
			readonly: false
		});
		mockAuthMap.push({
			technicalName: 'credito',
			type: 'div',
			hidden: false,
			disable: false,
			readonly: false
		});
		mockAuthMap.push({
			ItemId: 'trasnferirGrupo',
			ItemType: 'div',
			Hidden: false,
			Disable: false,
			ReadOnly: false
		});

		resolve(mockAuthMap);

	});
}

function isAuthRoute(urlRoute, oData) {

	if (oData.length === 0) {
		return false;
	}

	let currentAuthItem = oData.filter(function (authItem) {
		if (authItem.ItemId === urlRoute) {
			return authItem;
		}
	});

	if (currentAuthItem && currentAuthItem.length === 1) {
		if (currentAuthItem[0].Hidden == "true") {
			return false; // usuario nao autorizado nesta rota informada
		}
	}
	return true; //rota nao veio no objeto, entao, usuario autorizado default
}

function applyAuthComponent(oData, authKey) {

	if (oData.length === 0) {
		return false;
	}

	let currentAuthItem = oData.filter(function (authItem) {
		if (authItem.ItemId === authKey) {
			return authItem;
		}
	});

	if (currentAuthItem && currentAuthItem.length === 1) {
		if (currentAuthItem[0].Hidden == "true") {
			return false; // usuario nao autorizado para este componente informado
		}
	}
	return true;
}

function applyAuthMap(odata) {

	let authMapData = odata;

	$("[data-auth]").each(function (index, control) {

		let currentAuthItem = authMapData.filter(function (authItem) {
			if (control.attributes['data-auth'] && control.attributes['data-auth'].value === authItem.ItemId) {
				return authItem;
			}
		});

		if (currentAuthItem && currentAuthItem.length === 1) {

			let currentControl = $('#' + control.id)[0];

			if (currentAuthItem[0].Hidden == "true") {
				currentControl.remove();
			} else {
				if (currentControl.childNodes.length > 0) {
					if (currentAuthItem[0].ItemType === 'btn') {
						currentAuthItem[0].ItemType = 'Button';
					}
					currentControl = $(currentControl).find(currentAuthItem[0].ItemType)[0];
				}
				switch (currentAuthItem[0].ItemType) {
				case 'input':
					currentControl.disabled = currentAuthItem[0].Disable;
					currentControl.readOnly = currentAuthItem[0].ReadOnly;
					break;
				case 'text':
					currentControl.hidden = currentAuthItem[0].Hidden;
					break;
				case 'span':
					currentAuthItem[0].Hidden == true ? currentControl.remove() : '';
					break;
				case 'div':
					currentAuthItem[0].Hidden == true ? currentControl.remove() : '';
					break;
				case 'Button':
					currentAuthItem[0].Hidden == true ? currentControl.remove() : '';
				}
			}
		}
	});
}