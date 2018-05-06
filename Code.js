var FIRST_ROW = 3;

var COLUMN_TITLE = 2;
var COLUMN_NAME = 3;
var COLUMN_IC = 4;
var COLUMN_BIRTH = 5;
var COLUMN_RC = 6;
var COLUMN_CHECK_DATE = 7;
var COLUMN_RESULT = 8;

function main() {
    var currentRow = getCurrentRow();
    console.log("Statrting for row " + currentRow.getRow() + ': ' + currentRow.getCell(1,1).getValue());

    var parameters = getParamsFromRow(currentRow);
    var response = getApiResponse(parameters);
    console.log("API call success");

    try {
        var url = parseResponse(response);
        console.info("Finish clean; response: " + url);
        writeState(currentRow, url);
    }
    catch (e) {
      if (e instanceof ResponseError) {
          var error = 'Error ' + e.code + ': ' + e.message;
          console.error("Finish with error; error: " + error);
          writeState(currentRow, error);
      }
      else {
        throw e;
      }
    }

    rotateRow(currentRow);
}

function getCurrentRow() {
    var sheet = getDataSheet();
    var lastRow = sheet.getLastRow();
    var currentRow = PropertiesService.getDocumentProperties().getProperty('currentRow');

    if (!currentRow || currentRow < FIRST_ROW || currentRow > lastRow) {
        PropertiesService.getDocumentProperties().setProperty('currentRow', currentRow = FIRST_ROW);
    }

    return sheet.getRange(currentRow, 1, 1, sheet.getLastColumn());
}

function getDataSheet() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function getLogSheet() {
    return SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
}

function getParamsFromRow(row) {
    var parameters = {};

    addEntityParameter(row, parameters, 'ic', COLUMN_IC);
    addEntityParameter(row, parameters, 'rc', COLUMN_RC);
    addEntityParameter(row, parameters, 'nazevOsoby', COLUMN_TITLE);
    addEntityParameter(row, parameters, 'jmeno', COLUMN_NAME);
    addEntityParameter(row, parameters, 'datumNarozeni', COLUMN_BIRTH);

    parameters['filtrAktualniRizeni'] = 'T';

    return parameters;
}

function addEntityParameter(row, parameters, key, column) {
    var value = row.getCell(1, column).getValue();

    if (value === '') {
        return;
    }

    parameters[key] = value;
}

function getApiResponse(parameters) {
    var xml = getBaseXml();
    var soapenv = XmlService.getNamespace('http://schemas.xmlsoap.org/soap/envelope/');
    var typ = XmlService.getNamespace('http://isirws.cca.cz/types/');
    var requestElement = xml.getRootElement().getChild('Body', soapenv).getChild('getIsirWsCuzkDataRequest', typ);

    for (var i in parameters) {
        if (parameters.hasOwnProperty(i) === false) {
            continue
        }
        var element = XmlService.createElement(i)
            .setText(parameters[i]);
        requestElement.addContent(element);
    }

    var string = XmlService.getPrettyFormat().format(xml);

    var response = callIsirApi(string);
    return response;
}

function getBaseXml() {
    var string = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://isirws.cca.cz/types/">'
        + '<soapenv:Header/>'
        + '<soapenv:Body>'
        + '<typ:getIsirWsCuzkDataRequest>'
        + '</typ:getIsirWsCuzkDataRequest>'
        + '</soapenv:Body>'
        + '</soapenv:Envelope>';

    var xml = XmlService.parse(string);
    return xml;
}

function callIsirApi(body) {
    var url = 'https://isir.justice.cz:8443/isir_cuzk_ws/IsirWsCuzkService';
    var params = {
        'method': 'post',
        'payload': body,
        'contentType': 'text/xml'
    };

    var response = UrlFetchApp.fetch(url, params);
    return response.getContentText();
}

function parseResponse(response) {
    var xml = XmlService.parse(response);

    var soapenv = XmlService.getNamespace('http://schemas.xmlsoap.org/soap/envelope/');
    var typ = XmlService.getNamespace('http://isirws.cca.cz/types/');

    var contentEntity = xml.getRootElement().getChild('Body', soapenv).getChild('getIsirWsCuzkDataResponse', typ);
    var stavEntity = contentEntity.getChild('stav');

    if (stavEntity.getChild('kodChyby')) {
        var code = stavEntity.getChildText('kodChyby');
        if (code === 'WS2') // Just not found
        {
            return null;
        }
        throw new ResponseError(stavEntity.getChildText('textChyby'), code);
    }

    var url = contentEntity.getChild('data').getChildText('urlDetailRizeni');
    return url;
}

function writeState(row, result) {
  row.getCell(1, COLUMN_CHECK_DATE).setValue(new Date());
  row.getCell(1, COLUMN_RESULT).setValue(result === null ? 'OK' : result);
}

function rotateRow(row) {
  PropertiesService.getDocumentProperties().setProperty('currentRow', row.getRow() + 1);
}

function ResponseError(message, code) {
    this.code = code;
    this.message = message;
    this.name = 'ResponseError';
}
