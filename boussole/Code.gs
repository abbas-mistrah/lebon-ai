/*
 * LeBon AI — Apps Script (store + gouvernance)
 * Déploiement : Déployer > Déploiement web > Exécuter en tant que : Moi
 *               Accès : Tout le monde (qui a le lien) → /exec = LE LIEN
 */

var LEBON_AI_CATALOG = [
  { id:'qwen3:0.6b', name:'LeBon AI Flash', size:'~400 Mo', tag:'Ultra-rapide' },
  { id:'qwen3:1.7b', name:'LeBon AI Fast',  size:'~1.5 Go', tag:'Rapide' },
  { id:'qwen3:4b',   name:'LeBon AI Pro',   size:'~3.1 Go', tag:'Recommandé ★' },
  { id:'qwen3:8b',   name:'LeBon AI Max',   size:'~5.2 Go', tag:'Le plus puissant' },
];

var DRIVE_ZIP_URL = ''; // À remplir : lien public Google Drive du zip LeBon AI

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'catalog') return jsonOut_({ catalog: LEBON_AI_CATALOG });
  if (action === 'gouv') {
    var pin = (e && e.parameter && e.parameter.pin) || '';
    var storedPin = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
    if (!storedPin) return jsonOut_({ error: 'Aucun PIN défini.' });
    if (pin !== storedPin) return jsonOut_({ error: 'PIN requis.' });
    return jsonOut_({ logs: readLogs_() });
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('LeBon AI')
    .addMetaTag('viewport', 'width=device-width,initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch(err) {}
  appendLog_(body.user||'anonyme', body.event||'', body.model||'', body.detail||'', body.device||'');
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function getZipUrl() { return DRIVE_ZIP_URL; }

function logSheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LOG_SHEET_ID');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch(e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('LeBon_AI_Gouvernance');
    ss.insertSheet('LOGS').appendRow(['Date','Utilisateur','Événement','Modèle','Détail','Device']);
    props.setProperty('LOG_SHEET_ID', ss.getId());
  }
  return ss.getSheetByName('LOGS') || ss.getSheets()[0];
}

function appendLog_(user, event, model, detail, device) {
  try { logSheet_().appendRow([new Date(), user, event, model, (detail||'').toString().slice(0,200), (device||'').toString().slice(0,120)]); } catch(e) {}
}

function readLogs_() {
  var vals = logSheet_().getDataRange().getValues();
  return vals.slice(1).map(function(r) {
    return { date: r[0], user: r[1], event: r[2], model: r[3], detail: r[4], device: r[5] };
  });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
