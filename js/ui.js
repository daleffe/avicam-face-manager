const stor = {'devices': 'avicam-face-devices'};
const dialogs = {};
const elements = {};
const endpoints = {'params': '/GetGeneralParam','opendoor': '/OpenDoor'};

var devices = [];

const DEF_URI_PATH='/action';

window.addEventListener("DOMContentLoaded", () => {
	const qParamDeviceId = "deviceId";
	const qParamAction = "action";

  const qParams = new URLSearchParams(window.location.search);
	const qKeys = new Set([qParamDeviceId,qParamAction]);

	if ([...qKeys].every(qKey => qParams.has(qKey))) {
		processCommand(getDevice(qParams.get(qParamDeviceId)),qParams.get(qParamAction));
		// A maioria dos navegdores não permite, mas vamos deixar aqui para efeitos de documentação
		window.close();
	}
});

window.addEventListener('load', () => {
	document.body.addEventListener('click', function(e) {
		if (e.target.classList.contains('device-remove')) {
			e.preventDefault();
			e.stopPropagation();

			const deviceId = e.target.getAttribute('data-deviceid');

			if (deviceId) {
				const row = e.target.closest('tr');

				if (row) {
					row.remove();

					if (devices.length > 1) {
						devices = devices.filter(device => device.id != deviceId);
						setData(stor['devices'],devices);
					} else if (devices.length == 1) {
						devices = [];
						removeData(stor['devices']);

						hide(elements['devices-list']);
						showAlert('','','doors');
					}

					alertSuccess("Dispositivo removido com sucesso");
				} else { alertWarning("Não foi remover o dispositivo"); }
			} else { alertDanger("Não foi possível identificar o dispositivo para remover"); }
    }
	});

	elements['door-submit'] = document.getElementById('crud-submit');
	elements['devices-list'] = document.getElementById('list-devices');

	dialogs['main'] = document.getElementById('alert-main');
	dialogs['doors'] = document.getElementById('alert-doors');

	printDevices();

	elements['door-submit'].addEventListener('click',function(e) {
		e.preventDefault();
		e.stopPropagation();

		const validation = validateInputs(getInputs());

		if (validation['status'] == false) return;

		const { host, port, user, passwd }  = validation['values'];
		const url = "http://" + host + ":" + port + DEF_URI_PATH;

		const xhr = new XMLHttpRequest();

		let onErr = function () { alertDanger("Falha ao conectar no dispositivo"); };
		let onComm = function () {
			if (xhr.readyState == xhr.DONE) {
				if (xhr.status == 200) {
					if (xhr.response.hasOwnProperty('DeviceID')) {
						validation['values']['id'] = xhr.response['DeviceID'];

						if (!devices.some(device => device.id === validation['values']['id'])) {
							devices.push(validation['values']);

							if (setData(stor['devices'],devices).length > 0) {
								buildDevicesTable([validation['values']]);
								alertSuccess("Dispositivo cadastrado com sucesso");
							} else { alertWarning("Não foi possível cadastrar o dispositivo"); }
						} else { alertWarning("Este dispositivo já está cadastrado"); }
					} else { alertWarning("Não foi possível identificar o ID do dispositivo"); }
				} else { alertDanger("Erro ao comunicar-se com o dispositivo (" + xhr.status + ")"); }
			} else {
				let message = undefined;

				switch (xhr.readyState) {
					case xhr.OPENED:
						message = "Conectando...";
						break;
					case xhr.HEADERS_RECEIVED:
						message = "Conectado";
						break;
					case xhr.LOADING:
						message = "Carregando...";
						break;
					default:
						message = "Aguarde...";
				}

				if (message) { alertWarning(message); } else { hide(dialogs['main']); }
			}
		};

		httpRequest(xhr, url + endpoints['params'],onErr, onComm, btoa(user + ":" + passwd));
	});
});

function httpRequest(xhr, url, onError, onComm, auth = undefined, payload = undefined, method = 'POST') {
	xhr.responseType = 'json';
	xhr.timeout = 20000;
	xhr.withCredentials = false;

	xhr.onreadystatechange = onComm;
	xhr.onerror = onError;

	xhr.open(method, url, true);
	if (auth) xhr.setRequestHeader("Authorization", "Basic " + auth);
	if (payload) xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(payload);
}

function buildDevicesTable(devices) {
	if (devices == undefined || devices.length == 0) return;

	hide(dialogs['doors']);

	const schema = elements['devices-list'].getElementsByTagName('tbody')[0];

	for (let i = 0; i < devices.length; i++) {
		const device = devices[i];

		const row = schema.insertRow();

		const colDevice = row.insertCell(0);
		const colCmd = row.insertCell(1);
		const colActions = row.insertCell(2);

		colDevice.innerHTML = `<a target="_blank" href="http://${device['host']}:${device['port']}" title="Acessar o dispositivo ${device['name']}">${device['name']} (${device['id']})</a>`;
		colCmd.innerHTML = `<button type="button" class="button-success pure-button" title="Abrir a porta (${device['name']})" onclick="deviceOpenDoor(${device['id']})">Abrir porta</button>`;
		colActions.innerHTML = `<div class="pure-button-group" role="group"><button type="button" class="button-secondary pure-button" onclick="addToFav('${device['id']}','${device['name']} [${device['id']}]')">Favoritar</button><button type="button" class="device-remove button-error pure-button" data-deviceid="${device['id']}" title="Remover o dispositivo ${device['name']}">Remover</button></div>`;
	}
	show(elements['devices-list']);
}

function printDevices() {
	devices = getData(stor['devices']);

	if (devices == null || devices == undefined || devices.length == 0) {
		devices = [];
		showAlert('','','doors');
	} else { buildDevicesTable(devices); }
}

function validateInputs(inputs) {
	const validation = {'status': true,'values' : {}};

	if (inputs != undefined) for (key in inputs) {
		if (inputs.hasOwnProperty(key)) {
			validation['values'][key.replace('aligned-','')] = inputs[key].value;

			const required = document.getElementById(key + '-required');
			if (inputs[key].value.length == 0) { validation['status'] = false; show(required); } else { hide(required); }
		}
	}

	return validation;
}

function getInputs() {
	const ipts = {};
	const els = ['aligned-name','aligned-host','aligned-port','aligned-user','aligned-passwd'];

	for (let i = 0; i <= els.length; i++) {
		let el = document.getElementById(els[i]);

		if (el) ipts[els[i]] = el;
	}

	return ipts;
}

function getData(key) { return JSON.parse(localStorage.getItem(key)); }
function removeData(key) { return localStorage.removeItem(key); }
function setData(key, value) {
	localStorage.setItem(key,JSON.stringify(value));
	return  getData(key);
}

function getDevice(id) {
	const devices = getData(stor['devices']);
	let device = undefined;

	if (devices) {
		for (let i = 0; i < devices.length; i++) {
			if (devices[i].id == id) {
				device = devices[i];
				break;
			}
		}
	}

	return device;
}

function deviceOpenDoor(id) { processCommand(getDevice(id),'OpenDoor',false); }

function processCommand(device, action, qsMode = true) {
	if (device) {
		if (action == "OpenDoor") {
			const xhr = new XMLHttpRequest();

			var onErr = function () { alertDanger("Falha ao conectar no dispositivo", qsMode); };
			var onComm = function () {
				if (xhr.readyState == xhr.DONE) {
					if (xhr.status == 200) {
						if (xhr.response["code"] == 200) {
							alertSuccess(`Comando enviado com sucesso (${device['name']} [${device['id']}]) {${xhr.response["info"]["Result"]}}`, qsMode);
						} else { alertWarning(`Comando não aceito: ${xhr.response["info"]["Detail"]}`, qsMode); }
					} else { alertDanger("Erro ao comunicar-se com o dispositivo (" + xhr.status + ")", qsMode); }
				}
			};

			httpRequest(xhr, `http://${device.host}:${device.port}${DEF_URI_PATH}${endpoints['opendoor']}`,onErr, onComm, btoa(`${device.user}:${device.passwd}`),`{"operator": "${action}","info": {"DeviceID": "${device.id}","Chn": 0}}`);
		} else { alertWarning("Comando desconhecido", qsMode); }
	} else { alertWarning("Dispositivo não encontrado", qsMode); }
}

function addToFav(deviceId, title) {
	const url = window.location.href + `?deviceId=${deviceId}&action=OpenDoor`;

	if (window.chrome && chrome.bookmarks) { // Verifica se é o Chrome
		chrome.bookmarks.create({
				'url': url,
				'title': title
		}, function() { copyToClipboard(url, title); });
	} else if (window.sidebar && window.sidebar.addPanel) { // Para navegadores antigos (Firefox)
			window.sidebar.addPanel(title, url, '');
	} else if (window.external && ('AddFavorite' in window.external)) { // Para o Internet Explorer
			window.external.AddFavorite(url, title);
	} else if (window.opera && window.print) { // Para o Opera
		var mark = document.createElement('a');
		mark.setAttribute('href', url);
		mark.setAttribute('title', title);
		mark.setAttribute('rel', 'sidebar');
		mark.click();
	} else { copyToClipboard(url, title); }
}

function copyToClipboard(url, title) {
	// Ajustado para, primeiramente, tentar executar com a função assíncrona, mais atual,
	// caso contrário, faz no modo bruto, rústico e sistemático.
	if (navigator.clipboard) {
	navigator.clipboard.writeText(url).then(() => {
			alertSuccess(`Atalho copiado para a área de transferência (${title})"`);
		}).catch((error) => {
			alertWarning(`Não foi possível copiar o atalho para a área de transferência (${title})`);
			console.error('Falha ao copiar texto para a área de transferência:', error);
		});
	} else {
		const input = document.createElement('input');
		input.setAttribute('value', url);
		document.body.appendChild(input);

		input.select();
		input.setSelectionRange(0, 99999);

		document.execCommand('copy');
		document.body.removeChild(input);

		alertSuccess(`Atalho copiado para a área de transferência (${title})"`);
	}
}

var alertDanger = function(message, native = false) { showAlert(message, 'danger', native ? '' : 'main'); }
var alertWarning = function(message, native = false) { showAlert(message, 'warning', native ? '' : 'main'); }
var alertSuccess = function(message, native = false) { showAlert(message, 'success', native ? '' : 'main'); }

var showAlert = function(message = '', color = '', id = 'main') {
	if ((id == ''|| id == undefined) &&  (message != undefined || message.length > 0)) {
		alert(message);
		return;
	}

	const el = dialogs[id];
	if (!el) return;

	const colors = ['success','info','danger','warning','dark'];
	const elClass = ['alert'];

	if (colors.includes(color)) elClass.push('alert_' + color);

	const container = el.querySelector('.alert');

	if (elClass.length > 1) container.classList = elClass.join(" ");

	if (message !== undefined && message.length > 0) {
		const content = container.querySelector('.alert--content');
		if (content) content.innerText = message;
	}
	show(el);
}
var show = function (elem) { elem.style.display = ''; };
var hide = function (elem) { elem.style.display = 'none'; };
var toggle = function (elem) {
	if (window.getComputedStyle(elem).display != 'hide') {
		hide(elem);
		return;
	}
	show(elem);
};