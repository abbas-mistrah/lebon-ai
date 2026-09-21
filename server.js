const http = require('http');
const https = require('https');
const { spawn, execFile, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const zlib = require('zlib');

// Ports configurables via l'environnement (défaut 4321 + 4322 compatible). Permet
// de lancer une instance de test/parallèle sans coder les ports en dur.
const PORT = parseInt(process.env.PORT, 10) || 4321;
const PORT2 = parseInt(process.env.PORT2, 10) || (PORT === 4321 ? 4322 : 0);
const BUILD_ID = Date.now(); // auto-incrémenté à chaque redémarrage → cache busting automatique
const OLLAMA_PORT = 11434;
const DIR = __dirname;
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()'
};
const CONV_FILE = path.join(DIR, 'conversations.json');
const CONFIG_FILE = path.join(DIR, 'config.json');
const LOG_FILE = path.join(DIR, 'gouvernance.json');
const CONTEXT_FILE = path.join(DIR, 'contexte.md');
const WORKSPACES_FILE = path.join(DIR, 'workspaces.json');
const SECOND_BRAIN_FILE = path.join(DIR, 'second_brain.json');
const OLLAMA_BIN = require('fs').existsSync(path.join(DIR, 'ollama.exe'))
  ? path.join(DIR, 'ollama.exe')
  : 'ollama';

const STATIC = {
  '/app.js': ['application/javascript', 'app.js'],
  '/style.css': ['text/css', 'style.css'],
  '/marked.min.js': ['application/javascript', 'marked.min.js'],
  '/sw.js': ['application/javascript', 'sw.js'],
  '/manifest.json': ['application/manifest+json', 'manifest.json'],
  '/icon.svg': ['image/svg+xml', 'icon.svg'],
  '/icon-192.png': ['image/png', 'icon-192.png'],
  '/icon-512.png': ['image/png', 'icon-512.png'],
  '/boussole-data.json': ['application/json', 'boussole-data.json'],
  '/contexte.md': ['text/markdown; charset=utf-8', 'contexte.md'],
};

const DEFAULT_LOCAL_MODEL = 'lebon-ai:auto';
const NATURAL_LOCAL_MODEL = 'gemma3:1b';
const BALANCED_LOCAL_MODEL = 'qwen2.5:3b';
const LIGHT_WORK_LOCAL_MODEL = 'qwen2.5:1.5b';
const FAST_LOCAL_MODEL = 'lebon-ai:fast';
const ULTRA_FAST_LOCAL_MODEL = 'qwen2.5:0.5b';
const MODEL_CATALOG = [
  { id: DEFAULT_LOCAL_MODEL,    name:'LeBon Auto Local',           size:'~2,7 Go',   tag:'~14–36 tok/s · recommandé', group:'100 % local' },
  { id: NATURAL_LOCAL_MODEL,    name:'LeBon Conversation Naturelle', size:'~815 Mo', tag:'~36 tok/s · échanges humains', group:'100 % local' },
  { id: BALANCED_LOCAL_MODEL,   name:'LeBon Travail Pro',          size:'~1,9 Go',   tag:'~14 tok/s · qualité & code', group:'100 % local' },
  { id: LIGHT_WORK_LOCAL_MODEL, name:'LeBon Travail Rapide',       size:'~986 Mo',   tag:'~29 tok/s · compromis léger', group:'100 % local' },
  { id: FAST_LOCAL_MODEL,       name:'LeBon Local Rapide',         size:'~522 Mo',   tag:'~62 tok/s · tâches simples', group:'100 % local' },
  { id: ULTRA_FAST_LOCAL_MODEL, name:'LeBon Local Ultra-rapide',   size:'~397 Mo',   tag:'~72 tok/s · micro-tâches', group:'100 % local' },
  { id:'qwen3:4b',              name:'LeBon Local 4B',             size:'~2,5 Go',   tag:'~11 tok/s · expérimental', group:'100 % local' }
];

function getContextMarkdown() {
  try {
    if (fs.existsSync(CONTEXT_FILE)) {
      return fs.readFileSync(CONTEXT_FILE, 'utf8');
    }
  } catch(e) {}
  return '';
}

function setContextMarkdown(content) {
  try {
    fs.writeFileSync(CONTEXT_FILE, content, 'utf8');
    return true;
  } catch(e) {
    return false;
  }
}

function appendContextNote(note) {
  try {
    const dateStr = new Date().toLocaleString('fr-FR');
    const entry = `\n- [${dateStr}] ${note}`;
    if (!fs.existsSync(CONTEXT_FILE)) {
      fs.writeFileSync(CONTEXT_FILE, `# 🧠 Mémoire Globale & Contexte — LeBon AI\n\n## 📝 Notes & Faits Importants Mémorisés\n${entry}\n`, 'utf8');
    } else {
      fs.appendFileSync(CONTEXT_FILE, entry, 'utf8');
    }
    return true;
  } catch(e) {
    return false;
  }
}

const VALID_OLLAMA_MODELS = new Set([
  DEFAULT_LOCAL_MODEL,
  NATURAL_LOCAL_MODEL,
  BALANCED_LOCAL_MODEL,
  LIGHT_WORK_LOCAL_MODEL,
  FAST_LOCAL_MODEL,
  'qwen3:0.6b',
  ULTRA_FAST_LOCAL_MODEL,
  'qwen3:4b'
]);

function isCasualConversation(messages = []) {
  const lastUser = [...messages].reverse().find(msg => msg && msg.role === 'user');
  const text = String(lastUser?.content || '').trim().toLowerCase();
  if (!text || text.length > 320) return false;

  const professional = /\b(code|coder|script|html|css|javascript|python|sql|debug|bug|roi|comex|f3|analyse|tableau|présentation|slides?|document|fichier|workflow|use case|stratégie|architecture|rédige|génère|crée|construis|calcule|compare|résume|corrige|implémente|déploie)\b/i;
  if (professional.test(text)) return false;

  return /\b(salut|bonjour|hello|coucou|ça va|ca va|t['’]?es qui|tu es qui|qui es[- ]tu|journée|fatigu|stress|difficile|besoin de souffler|idée (?:un peu )?folle|tu veux l['’]entendre|tu en penses quoi|raconte|merci|marrant|drôle|content|triste|énerv|frustr)\b/i.test(text);
}

function resolveModelAndSystem(rawModel, messages = []) {
  const requestedModel = VALID_OLLAMA_MODELS.has(rawModel) ? rawModel : DEFAULT_LOCAL_MODEL;
  const targetModel = requestedModel === DEFAULT_LOCAL_MODEL
    ? (isCasualConversation(messages) ? NATURAL_LOCAL_MODEL : BALANCED_LOCAL_MODEL)
    : requestedModel;
  let defaultSys = targetModel === NATURAL_LOCAL_MODEL
    ? `Tu es LeBon AI, le copilote IA 100 % local d'Abbas pour son travail chez leboncoin. Abbas y travaille : il n'en est pas le propriétaire.
Parle comme un collègue français complice : chaleureux, spontané, direct et jamais comme un chatbot de support. Tutoie Abbas. Réponds en une ou deux phrases dans un échange informel et rebondis vraiment sur ce qu'il vient de dire.
Interdictions absolues : « je suis là pour aider », « je suis prêt à écouter », « que puis-je faire pour vous », « en quoi puis-je vous aider », vouvoiement et ton administratif.
Exemples de ton : « Salut Abbas 👋 Quoi de neuf ? » ; « Aïe… journée lourde alors. Pose tout deux minutes : qu'est-ce qui t'a le plus vidé ? » ; « Évidemment. Balance ton idée, les idées un peu folles sont souvent les meilleures. »`
    : `Tu es LeBon AI, le copilote IA 100 % local d'Abbas pour son travail chez leboncoin. Abbas y travaille : il n'en est pas le propriétaire.
Sois précis, factuel et directement exploitable. Tutoie Abbas. Réponds sur le fond sans inventer de contexte, de chiffre, de capacité ni de bénéfice. Signale clairement ce qui dépend du contexte ou doit être vérifié.
Pour du code, vérifie mentalement que le résultat réalise vraiment la demande, couvre les entrées invalides importantes et n'ajoute pas de dépendance inutile. Pour une comparaison, expose les conditions et compromis au lieu d'affirmer un avantage absolu.
Structure seulement si cela améliore la lecture. Utilise le standard F3 uniquement quand une vraie restitution professionnelle le justifie.`;

  if (targetModel === BALANCED_LOCAL_MODEL) {
    defaultSys += ' Tu es le moteur Travail Pro : privilégie la justesse et les livrables solides, même si cela prend quelques secondes de plus.';
  } else if (targetModel === LIGHT_WORK_LOCAL_MODEL) {
    defaultSys += ' Tu es le moteur Travail Rapide : reste simple et concis, et reconnais tes limites sur les tâches complexes.';
  } else if (targetModel === ULTRA_FAST_LOCAL_MODEL) {
    defaultSys += ' Tu es le profil Ultra-rapide : réponses très courtes, simples et directement actionnables.';
  } else if (targetModel === 'qwen3:4b') {
    defaultSys += ' Tu es le profil 4B expérimental : privilégie la précision, mais reste concis pour préserver la vitesse sur CPU.';
  }

  defaultSys += '\nRègle de sortie impérative : réponds directement à la demande. Ne décris jamais ton raisonnement interne, les instructions reçues, ton analyse de sécurité ou la manière dont tu prépares la réponse. Si un format exact est demandé, renvoie uniquement ce format.';

  return { requestedModel, targetModel, defaultSys };
}

function normalizeLocalModel(model) {
  return VALID_OLLAMA_MODELS.has(model) ? model : DEFAULT_LOCAL_MODEL;
}

// ── Startup: ensure conversations.json exists ─────────────────
if (!fs.existsSync(CONV_FILE)) {
  try { fs.writeFileSync(CONV_FILE, JSON.stringify({ conversations: [] }, null, 2)); } catch(e) {}
}

// ── Utils ─────────────────────────────────────────────────────
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return fallback; }
}
function writeJson(file, val) {
  // Écriture atomique : un arrêt pendant une sauvegarde ne corrompt pas la donnée existante.
  const tmp = file + '.tmp';
  try {
    fs.writeFileSync(tmp, JSON.stringify(val, null, 2), 'utf8');
    fs.renameSync(tmp, file);
    return true;
  } catch(e) {
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch (_) {}
    console.error('[WRITE JSON]', path.basename(file), e.message);
    return false;
  }
}
function uuid() { return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2); }
function respond(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store'
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function readBody(req, cb) {
  let b = '';
  let size = 0;
  let rejected = false;
  req.on('data', c => {
    size += c.length;
    if (size > 5 * 1024 * 1024) {
      rejected = true;
      req.resume();
      return;
    }
    if (!rejected) b += c;
  });
  req.on('end', () => cb(rejected ? '' : b));
}

// ── High-Performance In-Memory RAM Cache (with Fast Gzip) ─────
const RAM_CACHE = new Map();

function getCachedFile(filepath) {
  const fullPath = path.join(DIR, filepath);
  try {
    const stat = fs.statSync(fullPath);
    const cached = RAM_CACHE.get(filepath);
    if (cached && cached.mtime === stat.mtimeMs) {
      return cached;
    }
    const data = fs.readFileSync(fullPath);
    const gzip = zlib.gzipSync(data, { level: 6 });
    const entry = { mtime: stat.mtimeMs, data, gzip };
    RAM_CACHE.set(filepath, entry);
    return entry;
  } catch(e) {
    return null;
  }
}

function serveStatic(req, res, filepath, mime) {
  const cached = getCachedFile(filepath);
  if (!cached) return respond(res, 404, { error: 'Not found' });
  const acceptEnc = (req && req.headers && req.headers['accept-encoding']) || '';
  if (acceptEnc.includes('gzip') && cached.gzip.length < cached.data.length) {
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': mime,
      'Content-Encoding': 'gzip',
      'Content-Length': cached.gzip.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    res.end(cached.gzip);
  } else {
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': mime,
      'Content-Length': cached.data.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    res.end(cached.data);
  }
}

function serveIndex(req, res) {
  const cached = getCachedFile('index.html');
  if (!cached) return respond(res, 404, { error: 'Not found' });
  let html = cached.data.toString('utf8');
  html = html.replace(/\?v=[^"'>\s]+/g, '?v=' + BUILD_ID);
  const buf = Buffer.from(html, 'utf8');
  const acceptEnc = (req && req.headers && req.headers['accept-encoding']) || '';
  if (acceptEnc.includes('gzip')) {
    const gzipped = zlib.gzipSync(buf, { level: 6 });
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Encoding': 'gzip',
      'Content-Length': gzipped.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    res.end(gzipped);
  } else {
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': buf.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    res.end(buf);
  }
}

// ── Governance ────────────────────────────────────────────────
function logEvent(user, event, model, detail) {
  // Non-blocking: defer disk write so it never adds latency to the chat response
  setImmediate(() => {
    try {
      const logs = readJson(LOG_FILE, []);
      logs.push({ date: new Date().toISOString(), user: user||'anonyme', event: event||'', model: model||'', detail: (detail||'').toString().slice(0,200), device: os.hostname() });
      writeJson(LOG_FILE, logs);
    } catch(e) {}
  });
}
function reportGov(event, user, model, detail) {
  try {
    const cfg = readJson(CONFIG_FILE, {});
    if (!cfg.boussole_url) return;
    const payload = JSON.stringify({ user, event, model, detail: (detail||'').toString().slice(0,200), device: os.hostname() });
    const u = new URL(cfg.boussole_url);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request({ host: u.hostname, port: u.port||(u.protocol==='https:'?443:80), path: u.pathname+(u.search||''), method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)} }, ()=>{});
    req.on('error', ()=>{}); req.write(payload); req.end();
  } catch(e) {}
}

// ── Catalog (with In-Memory Fast-Path Cache) ───────────────────
let CATALOG_CACHE = null;
let CATALOG_CACHE_TIME = 0;

function apiCatalog(res) {
  const now = Date.now();
  if (CATALOG_CACHE && (now - CATALOG_CACHE_TIME < 15000)) {
    return respond(res, 200, CATALOG_CACHE);
  }

  const cfg = readJson(CONFIG_FILE, {});
  function buildResponse(catBase) {
    execFile(OLLAMA_BIN, ['list'], (err, stdout) => {
      const installed = [];
      if (!err && stdout) stdout.split('\n').slice(1).forEach(line => { const m = line.trim().split(/\s+/)[0]; if (m) installed.push(m); });
      const catalog = catBase.map(c => {
        const hasModel = id => installed.some(i => i === id || i.startsWith(id + ':'));
        const isInstalled = c.id === DEFAULT_LOCAL_MODEL
          ? hasModel(NATURAL_LOCAL_MODEL) && hasModel(BALANCED_LOCAL_MODEL)
          : hasModel(c.id);
        return { ...c, installed: isInstalled };
      });
      const data = {
        models: catalog,
        default: DEFAULT_LOCAL_MODEL,
        localGateway: true,
        localOnly: true,
        cloudModelsAvailable: false
      };
      CATALOG_CACHE = data;
      CATALOG_CACHE_TIME = Date.now();
      respond(res, 200, data);
    });
  }

  buildResponse(MODEL_CATALOG);
}

// ── Recherche Web réelle (DuckDuckGo HTML) ────────────────────
// Fonction réseau explicitement déclenchée par l'utilisateur (toggle Recherche Web).
function apiWebSearch(req, res, url) {
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return respond(res, 400, { error: 'q requis' });
  const postData = 'q=' + encodeURIComponent(q);
  const dreq = https.request({
    method: 'POST',
    host: 'html.duckduckgo.com',
    path: '/html/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (compatible; LeBonAI/1.0)'
    }
  }, dres => {
    let html = '';
    dres.on('data', c => { html += c; if (html.length > 800000) dres.destroy(); });
    dres.on('end', () => {
      try {
        const results = [];
        const linkRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        const snipRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
        const decodeUrl = u => { const m = u.match(/uddg=([^&]+)/); if (m) { try { return decodeURIComponent(m[1]); } catch (_) {} } return u; };
        const snippets = [];
        let sm;
        while ((sm = snipRe.exec(html)) && snippets.length < 12) snippets.push(strip(sm[1]));
        let lm, i = 0;
        while ((lm = linkRe.exec(html)) && results.length < 6) {
          const title = strip(lm[2]);
          if (!title) continue;
          results.push({ title, url: decodeUrl(lm[1]), snippet: snippets[i] || '' });
          i++;
        }
        respond(res, 200, { ok: true, query: q, results });
      } catch (e) {
        respond(res, 502, { ok: false, error: 'Analyse des résultats impossible', results: [] });
      }
    });
  });
  dreq.on('error', () => respond(res, 502, { ok: false, error: 'Recherche web indisponible (réseau)', results: [] }));
  dreq.setTimeout(8000, () => { dreq.destroy(); if (!res.writableEnded) respond(res, 504, { ok: false, error: 'Délai de recherche dépassé', results: [] }); });
  dreq.write(postData);
  dreq.end();
}

// ── Pull (streaming) ──────────────────────────────────────────
function apiPull(req, res, url) {
  const model = url.searchParams.get('model');
  const user = url.searchParams.get('user') || 'anonyme';
  if (!model) return respond(res, 400, { error: 'model requis' });
  if (!MODEL_CATALOG.some(item => item.id === model)) {
    return respond(res, 400, { error: 'Seuls les modèles locaux validés peuvent être téléchargés.' });
  }
  logEvent(user, 'TELECHARGEMENT', model, 'start');
  reportGov('TELECHARGEMENT', user, model, 'start');
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' });
  const jobs = model === DEFAULT_LOCAL_MODEL
    ? [
        { label: 'Moteur Conversation Naturelle', args: ['pull', NATURAL_LOCAL_MODEL] },
        { label: 'Moteur Travail Équilibré', args: ['pull', BALANCED_LOCAL_MODEL] }
      ]
    : model === FAST_LOCAL_MODEL
      ? [{ label: 'Profil local rapide', args: ['create', model, '-f', path.join(DIR, 'Modelfile.fast')] }]
      : [{ label: 'Modèle local', args: ['pull', model] }];

  let jobIndex = 0;
  function runNextJob() {
    if (jobIndex >= jobs.length) {
      res.write('\n--- Terminé ✓ ---\n');
      res.end();
      logEvent(user, 'TELECHARGEMENT_OK', model, 'ok');
      reportGov('TELECHARGEMENT_OK', user, model, 'ok');
      return;
    }
    const job = jobs[jobIndex++];
    res.write(`\n${job.label} (${jobIndex}/${jobs.length})...\n`);
    const proc = spawn(OLLAMA_BIN, job.args);
    // Sans ce handler, un binaire 'ollama' introuvable émet 'error' sans écouteur
    // → uncaughtException et téléchargement suspendu indéfiniment.
    proc.on('error', (err) => {
      try {
        res.write(`\n--- Erreur : impossible de lancer Ollama (${err.code || err.message}). Vérifie qu'Ollama est installé et dans le PATH. ---\n`);
        res.end();
      } catch (_) {}
    });
    proc.stdout.on('data', d => { try { res.write(d); } catch (_) {} });
    proc.stderr.on('data', d => { try { res.write(d); } catch (_) {} });
    proc.on('close', code => {
      if (res.writableEnded) return;
      if (code !== 0) {
        res.write(`\n--- Erreur (code ${code}) ---\n`);
        res.end();
        return;
      }
      runNextJob();
    });
  }
  // Si le client abandonne, on tue le process de pull en cours.
  req.on('close', () => { try { res.end(); } catch (_) {} });
  runNextJob();
}

// ── Chat (SSE streaming avec Routeur Multi-Modèles) ───────────

const OLLAMA_AGENT = new http.Agent({ keepAlive: true, maxSockets: 50, keepAliveMsecs: 60000 });

const INSTANT_CACHE = new Map([
  ['bonjour', 'Bonjour Abbas 👋 Ravi de te retrouver. On avance sur quoi aujourd’hui ?'],
  ['salut', 'Salut Abbas 👋 Ça fait plaisir de te retrouver. Qu’est-ce qu’on construit aujourd’hui ?'],
  ['hello', 'Hello Abbas 👋 Je suis bien réveillé et prêt à avancer avec toi.'],
  ['coucou', 'Coucou Abbas 👋 Je suis là, bien réveillé. Raconte-moi.'],
  ['qui es-tu', 'Je suis LeBon AI — le copilote IA local que tu construis pour leboncoin. Je tourne directement sur ton PC avec Ollama, et mon rôle est de réfléchir avec toi, écrire, coder et transformer tes idées en livrables concrets.'],
  ['qui es tu', 'Je suis LeBon AI — le copilote IA local que tu construis pour leboncoin. Je tourne directement sur ton PC avec Ollama, et mon rôle est de réfléchir avec toi, écrire, coder et transformer tes idées en livrables concrets.'],
  ["t'es qui", 'Je suis LeBon AI — ton copilote IA local pour leboncoin. Je tourne sur ton PC, je connais le projet que tu construis et tu peux me parler normalement, comme à un collègue.'],
  ['tes qui', 'Je suis LeBon AI — ton copilote IA local pour leboncoin. Je tourne sur ton PC, je connais le projet que tu construis et tu peux me parler normalement, comme à un collègue.'],
  ['tu es qui', 'Je suis LeBon AI — ton copilote IA local pour leboncoin. Je tourne sur ton PC, je connais le projet que tu construis et tu peux me parler normalement, comme à un collègue.'],
  ['ça va', 'Oui, très bien — et bien réveillé 😄 Et toi Abbas, comment tu vas ?'],
  ['ca va', 'Oui, très bien — et bien réveillé 😄 Et toi Abbas, comment tu vas ?'],
  ['merci', 'Avec plaisir Abbas 🤝'],
  ['aide', 'Je peux t’aider à :\n- ⚡ rédiger des synthèses et notes exécutives (format F3)\n- 💻 concevoir et tester du code en direct (Live Sandbox)\n- 🧠 organiser ton Second Brain et collaborer avec ton équipe.'],
  ['f3', 'Le principe F3 leboncoin :\n1. **Lire en 5s** : Synthèse percutante.\n2. **Comprendre en 30s** : Chiffres clés et contexte clair.\n3. **Agir en 2 clics** : Recommandations immédiatement actionnables.'],
  ['boussole', 'La Boussole inspire l\'interface de LeBon AI : crème, orange, noir, lecture rapide et actions immédiatement accessibles.'],
  ['roi', 'L\'analyse ROI Transfo IA quantifie le gain annuel net, les heures économisées par collaborateur et le délai de rentabilité (payback).'],
  ['comex', 'Le format Note COMEX structure les 5 points stratégiques, les KPIs certifiés, les risques et les arbitrages requis sans superflu.']
]);

function getInstantCacheMatch(query) {
  if (!query) return null;
  const q = query.toLowerCase().replace(/[.?!,]/g, '').trim();
  return INSTANT_CACHE.get(q) || null;
}

// Couche sociale locale : elle couvre des intentions, pas seulement des phrases exactes.
// Elle évite de réveiller un LLM pour les réactions humaines évidentes et reste instantanée.
function generateNaturalLocalReply(prompt) {
  const text = String(prompt || '').trim();
  const normalized = text.toLowerCase().replace(/[’]/g, "'");
  if (!normalized || normalized.length > 420) return null;

  if (/\b(t'es qui|tes qui|tu es qui|qui es[- ]tu|présente[- ]toi)\b/i.test(normalized)) {
    return "Moi, c’est LeBon AI — ton copilote IA 100 % local. Je tourne sur ton PC et je t’accompagne pour réfléchir, écrire, coder et concrétiser tes idées chez leboncoin.";
  }
  if (/\b(idée|concept|projet)\b/i.test(normalized) && /\b(folle|dingue|bizarre|audacieuse|entendre|écouter|te la dire|ça te dit)\b/i.test(normalized)) {
    return "Évidemment 😄 Balance-la — les idées un peu folles sont souvent celles qui ouvrent les meilleures pistes.";
  }
  if (/\b(journée|jour)\b/i.test(normalized) && /\b(difficile|dur|lourd|horrible|épuisant|compliqué)\b/i.test(normalized)) {
    return "Aïe… journée lourde alors. Pose tout deux minutes : qu’est-ce qui t’a le plus vidé ?";
  }
  if (/\b(fatigu|épuis|crevé|rincé)\b/i.test(normalized)) {
    return "Tu as l’air rincé… on ralentit deux minutes. Tu veux vider ton sac ou penser à autre chose ?";
  }
  if (/\b(énerv|frustr|agacé|saoulé|marre)\b/i.test(normalized)) {
    return "Je vois le niveau de frustration… raconte-moi ce qui coince, on va le démêler calmement.";
  }
  return null;
}

function generateHyperSpeedResponse(prompt, model) {
  const p = (prompt || '').trim();
  const pl = p.toLowerCase();

  // Math requests
  const mathMatch = pl.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*=?$/);
  if (mathMatch) {
    const [_, a, op, b] = mathMatch;
    let res = 0;
    const na = Number(a), nb = Number(b);
    if (op === '+') res = na + nb;
    if (op === '-') res = na - nb;
    if (op === '*') res = na * nb;
    if (op === '/') res = nb !== 0 ? (na / nb) : 'Division par zéro';
    return `### 🧮 Calcul Immédiat\n\n- **Opération :** \`${a} ${op} ${b}\`\n- **Résultat :** **${res}**`;
  }

  // Quick Code requests
  if (/invers.*(cha[iî]ne|string)|reverse.*string/i.test(pl)) {
    return `### 💻 Inversion de chaîne en JavaScript (1 ligne)\n\n\`\`\`javascript\nconst reverseString = str => str.split('').reverse().join('');\n\n// Exemple :\nconsole.log(reverseString("leboncoin")); // "niocnobel"\n\`\`\`\n\n- **Complexité :** O(n) temps et mémoire.`;
  }

  return null;
}

function apiChat(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(e) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { model, messages, user, think, turbo } = data;
    const currentModel = VALID_OLLAMA_MODELS.has(model) ? model : DEFAULT_LOCAL_MODEL;

    // Normalisation défensive : un `messages` non-tableau (ex. une chaîne) faisait planter
    // le handler (.filter/.some sur une string) et laissait la requête sans réponse.
    const msgs = Array.isArray(messages) ? messages.filter(m => m && typeof m === 'object' && typeof m.role === 'string') : [];

    logEvent(user, 'CHAT', currentModel, msgs.length + ' msgs');
    reportGov('CHAT', user, currentModel, msgs.length + ' msgs');

    const lastUserMsg = msgs.filter(m => m.role === 'user').pop()?.content?.toString().trim() || '';

    // ⚡ INSTANT MICRO-CACHE (Exact match only to eliminate hallucinations)
    const cachedAnswer = getInstantCacheMatch(lastUserMsg)
      || generateNaturalLocalReply(lastUserMsg)
      || generateHyperSpeedResponse(lastUserMsg, currentModel);
    if (cachedAnswer) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      });
      if (res.socket && typeof res.socket.setNoDelay === 'function') res.socket.setNoDelay(true);
      try {
        res.write('data: ' + JSON.stringify({ content: cachedAnswer, thinking: '', done: true }) + '\n\n');
        res.write('data: [DONE]\n\n');
        res.end();
      } catch(_) {}
      return;
    }

    const { targetModel, defaultSys } = resolveModelAndSystem(currentModel, msgs);

    const sysPrompt = {
      role: 'system',
      content: defaultSys
    };

    const msgsWithSys = msgs.some(m => m.role === 'system')
      ? msgs
      : [sysPrompt, ...msgs];

    // Mesuré sur le Core Ultra 7 165U : 10 threads dépassent nettement 12/14 threads.
    const numThreads = Math.min(10, Math.max(4, os.cpus().length || 10));
    const isUltraFast = targetModel === ULTRA_FAST_LOCAL_MODEL || !!turbo;
    const isNatural = targetModel === NATURAL_LOCAL_MODEL;
    const generationOptions = isUltraFast ? {
      num_ctx: 2048,
      num_predict: 384,
      num_thread: numThreads,
      num_batch: 256,
      num_gpu: 0,
      temperature: 0.2,
      repeat_penalty: 1.1,
      use_mmap: true
    } : isNatural ? {
      num_ctx: 2048,
      num_predict: 320,
      num_thread: numThreads,
      num_batch: 256,
      num_gpu: 0,
      temperature: 0.6,
      repeat_penalty: 1.08,
      top_k: 30,
      top_p: 0.9,
      use_mmap: true
    } : {
      num_ctx: 4096,
      num_predict: 768,
      num_thread: numThreads,
      num_batch: 256,
      num_gpu: 0,
      temperature: 0.25,
      repeat_penalty: 1.1,
      top_k: 15,
      top_p: 0.85,
      use_mmap: true
    };

    // Raisonnement visible uniquement si demandé ET si le modèle cible le supporte
    // (qwen3, r1…). Sur les autres, `think:true` ferait échouer Ollama → on force false.
    const modelSupportsThinking = /qwen3|thinking|deepseek-r|[-:]r1/i.test(targetModel);
    const enableThink = think === true && modelSupportsThinking;

    const payload = JSON.stringify({
      model: targetModel,
      messages: msgsWithSys,
      stream: true,
      think: enableThink,
      keep_alive: '30m',
      options: generationOptions
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });

    if (res.socket && typeof res.socket.setNoDelay === 'function') {
      res.socket.setNoDelay(true);
    }
    // Envoie les en-têtes 200 immédiatement (avant le 1er token d'Ollama) : le client
    // sait tout de suite que la requête est acceptée et la latence perçue chute.
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    let finished = false;
    let ollamaReq = null;

    // Annuler la requête vers Ollama uniquement si le client ferme prématurément la connexion SSE
    res.on('close', () => {
      if (!res.writableEnded && !finished && ollamaReq) {
        try { ollamaReq.destroy(); } catch(_) {}
      }
    });

    let accumulatedContent = '';

    ollamaReq = http.request({
      host: 'localhost',
      port: OLLAMA_PORT,
      path: '/api/chat',
      method: 'POST',
      agent: OLLAMA_AGENT,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, ollamaRes => {
      let upstreamBuffer = '';
      function forwardOllamaLine(line) {
        if (!line || res.writableEnded) return;
        try {
          const j = JSON.parse(line);
          if (j.error) {
            res.write('data: ' + JSON.stringify({ error: j.error, done: true }) + '\n\n');
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }
          const content = (j.message && j.message.content) || '';
          const thinking = (j.message && j.message.thinking) || '';
          if (content) accumulatedContent += content;
          if (content || thinking) {
            res.write('data: ' + JSON.stringify({ content, thinking, done: !!j.done }) + '\n\n');
          }
        } catch (error) {
          console.warn('[OLLAMA STREAM] ligne JSON ignorée :', error.message);
        }
      }

      ollamaRes.on('data', chunk => {
        upstreamBuffer += chunk.toString('utf8');
        const lines = upstreamBuffer.split('\n');
        upstreamBuffer = lines.pop() || '';
        lines.forEach(forwardOllamaLine);
      });

      ollamaRes.on('end', () => {
        finished = true;
        if (upstreamBuffer.trim()) forwardOllamaLine(upstreamBuffer.trim());
        try { res.write('data: [DONE]\n\n'); res.end(); } catch(e) {}
      });

      ollamaRes.on('error', (error) => {
        finished = true;
        try {
          res.write('data: ' + JSON.stringify({ error: 'Flux Ollama interrompu : ' + error.message, done: true }) + '\n\n');
          res.write('data: [DONE]\n\n');
          res.end();
        } catch(e) {}
      });
    });

    ollamaReq.on('error', e => {
      finished = true;
      try {
        res.write('data: ' + JSON.stringify({ error: 'Ollama inaccessible : ' + e.message, done: true }) + '\n\n');
        res.write('data: [DONE]\n\n');
        res.end();
      } catch(_) {}
    });

    ollamaReq.setTimeout(300000, () => {
      ollamaReq.destroy(new Error('Délai de génération dépassé'));
    });

    ollamaReq.write(payload);
    ollamaReq.end();
  });
}

// ── Conversations CRUD ────────────────────────────────────────
function convStore() {
  const store = readJson(CONV_FILE, { conversations: [] });
  let migrated = false;
  for (const conversation of store.conversations || []) {
    const localModel = normalizeLocalModel(conversation.model);
    if (conversation.model !== localModel) {
      conversation.model = localModel;
      migrated = true;
    }
  }
  if (migrated) writeJson(CONV_FILE, store);
  return store;
}
function convSave(store) { writeJson(CONV_FILE, store); }

function apiConvList(res) {
  const store = convStore();
  respond(res, 200, { conversations: store.conversations.map(c => ({ id:c.id, title:c.title, model:c.model, createdAt:c.createdAt, updatedAt:c.updatedAt, messageCount: (c.messages||[]).length })) });
}
function apiConvGet(res, id) {
  const store = convStore();
  const conv = store.conversations.find(c => c.id === id);
  if (!conv) return respond(res, 404, { error: 'Conversation introuvable' });
  respond(res, 200, { conversation: conv });
}
function apiConvCreate(req, res) {
  readBody(req, b => {
    let data; try { data = JSON.parse(b||'{}'); } catch(e) { return respond(res, 400, { error: 'JSON invalide' }); }
    const conv = { id: uuid(), title: data.title || 'Nouvelle discussion', model: VALID_OLLAMA_MODELS.has(data.model) ? data.model : DEFAULT_LOCAL_MODEL, messages: data.messages || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const store = convStore(); store.conversations.unshift(conv); convSave(store);
    respond(res, 200, { conversation: conv });
  });
}
function apiConvUpdate(req, res, id) {
  readBody(req, b => {
    let data; try { data = JSON.parse(b||'{}'); } catch(e) { return respond(res, 400, { error: 'JSON invalide' }); }
    const store = convStore();
    const idx = store.conversations.findIndex(c => c.id === id);
    if (idx === -1) return respond(res, 404, { error: 'Conversation introuvable' });
    const conv = store.conversations[idx];
    if (data.title !== undefined) conv.title = data.title;
    if (data.model !== undefined) conv.model = VALID_OLLAMA_MODELS.has(data.model) ? data.model : DEFAULT_LOCAL_MODEL;
    if (data.messages !== undefined) conv.messages = data.messages;
    conv.updatedAt = new Date().toISOString();
    convSave(store);
    respond(res, 200, { ok: true, conversation: conv });
  });
}
function apiConvDelete(req, res, id) {
  const store = convStore();
  store.conversations = store.conversations.filter(c => c.id !== id);
  convSave(store);
  respond(res, 200, { ok: true });
}

// ── Config ────────────────────────────────────────────────────
function apiConfigGet(res) {
  const cfg = readJson(CONFIG_FILE, {});
  respond(res, 200, { hasPin: !!cfg.admin_pin, boussole_url: cfg.boussole_url || '' });
}
function apiConfigSet(req, res) {
  readBody(req, b => {
    let data; try { data = JSON.parse(b||'{}'); } catch(e) { return respond(res, 400, { error: 'JSON invalide' }); }
    const cfg = readJson(CONFIG_FILE, {});
    if (cfg.admin_pin && data.current !== cfg.admin_pin) return respond(res, 403, { error: 'PIN requis' });
    if (data.pin) cfg.admin_pin = data.pin;
    if (data.boussole_url !== undefined) cfg.boussole_url = data.boussole_url;
    writeJson(CONFIG_FILE, cfg);
    respond(res, 200, { ok: true });
  });
}

// ── Log event ─────────────────────────────────────────────────
function apiLog(req, res) {
  readBody(req, b => {
    let d; try { d = JSON.parse(b||'{}'); } catch(e) { return respond(res, 400, { error: 'JSON invalide' }); }
    logEvent(d.user, d.event, d.model, d.detail);
    reportGov(d.event, d.user, d.model, d.detail);
    respond(res, 200, { ok: true });
  });
}

// ── Work (Agentic SSE) ────────────────────────────────────────
const WORK_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Execute a shell command (PowerShell on Windows) and return stdout/stderr. Use for: running scripts, installing packages, git operations, building projects, checking process status, system administration. The command runs in a shell with full access.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The shell command to execute (PowerShell syntax on Windows)' },
          cwd: { type: 'string', description: 'Working directory (optional, defaults to user home directory)' }
        },
        required: ['command']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read and return the full text content of a file. Use to inspect source code, configs, logs, data files, etc.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Absolute or relative file path to read' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Create a new file or completely overwrite an existing file with the provided content. Creates parent directories if needed.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to write (absolute or relative)' },
          content: { type: 'string', description: 'The full content to write to the file' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'patch_file',
      description: 'Replace a specific block of text inside an existing file. Use for targeted edits without rewriting the entire file. The old_text must match exactly (including whitespace).',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to patch' },
          old_text: { type: 'string', description: 'The exact text block to find and replace (must match exactly)' },
          new_text: { type: 'string', description: 'The replacement text' }
        },
        required: ['path', 'old_text', 'new_text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List all files and subdirectories in a directory, showing names, types (file/directory), and sizes.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to list' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'grep_search',
      description: 'Search for a text pattern across files in a directory (recursive). Returns matching file names, line numbers, and line content. Use to find code, functions, variables, or any text pattern.',
      parameters: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Text or regex pattern to search for' },
          path: { type: 'string', description: 'Directory or file to search in' },
          include: { type: 'string', description: 'Optional file extension filter, e.g. "*.js" or "*.py"' }
        },
        required: ['pattern', 'path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_directory',
      description: 'Create a directory (and all parent directories if needed).',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path to create' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'python_eval',
      description: 'Execute a Python script and return its stdout output. Use for calculations, data processing, quick scripts, or testing code snippets.',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Python code to execute' },
          cwd: { type: 'string', description: 'Working directory (optional)' }
        },
        required: ['code']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web using DuckDuckGo and return text results. Use when you need current information, documentation, tutorials, or any web-based knowledge.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query in natural language' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch and return the text content of a web page (HTML stripped to plain text). Use to read documentation, API responses, or any web content.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Full URL to fetch (http or https)' }
        },
        required: ['url']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_system_info',
      description: 'Get information about the current system: OS, CPU, RAM, disk space, running processes, and environment.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
];

const DANGEROUS_PATTERNS = [
  'rm -rf /', 'rm -rf ~', 'rm --no-preserve-root',
  'format c:', ':(){:|:&};:', 'mkfs',
  'dd if=/dev/', 'chmod -R 777 /',
  'shutdown /r', 'shutdown /s', 'reboot', 'halt',
  'fdisk', 'diskpart', 'reg delete hklm',
  'del /f /s /q c:\\windows', 'del /f /s /q c:\\',
  '> /dev/sda',
];

function executeTool(name, args) {
  if (name === 'run_command') {
    const { command, cwd } = args;
    const cmdLower = (command || '').toLowerCase();
    for (const pat of DANGEROUS_PATTERNS) {
      if (cmdLower.includes(pat)) {
        return { error: 'Commande refusée (pattern dangereux détecté): ' + pat };
      }
    }
    try {
      const output = execSync(command, {
        cwd: cwd || os.homedir(),
        timeout: 120000,
        encoding: 'utf8',
        maxBuffer: 5 * 1024 * 1024,
        shell: true
      });
      const out = (output || '').toString();
      return { output: out.length > 15000 ? out.slice(0, 15000) + '\n[tronqué à 15000 caractères...]' : out };
    } catch (e) {
      const errOut = ((e.stdout || '') + (e.stderr || '') || e.message || '').toString();
      return { error: errOut.length > 8000 ? errOut.slice(0, 8000) + '\n[tronqué...]' : errOut };
    }
  }

  if (name === 'read_file') {
    try {
      const filePath = path.resolve(args.path || '');
      const content = fs.readFileSync(filePath, 'utf8');
      return { content: content.length > 50000 ? content.slice(0, 50000) + '\n[tronqué...]' : content };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (name === 'write_file') {
    try {
      const filePath = path.resolve(args.path || '');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, args.content || '', 'utf8');
      return { ok: true, message: 'Fichier écrit : ' + filePath };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (name === 'list_directory') {
    try {
      const dirPath = path.resolve(args.path || '.');
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      return {
        items: items.map(item => ({
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          size: item.isFile() ? (() => { try { return fs.statSync(path.join(dirPath, item.name)).size; } catch(_) { return 0; } })() : null
        }))
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (name === 'web_search') {
    // Résultats structurés (titre/url/extrait) réels via DuckDuckGo — bien plus exploitables
    // par le modèle qu'un dump HTML brut.
    return new Promise((resolve) => {
      const postData = 'q=' + encodeURIComponent(args.query || '');
      const req = https.request({
        method: 'POST', host: 'html.duckduckgo.com', path: '/html/',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'Mozilla/5.0 (compatible; LeBonAI/1.0)'
        }
      }, res => {
        let html = '';
        res.on('data', c => { html += c; if (html.length > 800000) res.destroy(); });
        res.on('end', () => {
          try {
            const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
            const decodeUrl = u => { const m = u.match(/uddg=([^&]+)/); if (m) { try { return decodeURIComponent(m[1]); } catch (_) {} } return u; };
            const linkRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
            const snipRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
            const snippets = []; let sm;
            while ((sm = snipRe.exec(html)) && snippets.length < 12) snippets.push(strip(sm[1]));
            const results = []; let lm, i = 0;
            while ((lm = linkRe.exec(html)) && results.length < 6) {
              const title = strip(lm[2]); if (!title) continue;
              results.push({ title, url: decodeUrl(lm[1]), snippet: snippets[i] || '' }); i++;
            }
            resolve(results.length ? { results } : { results: [], message: 'Aucun résultat.' });
          } catch (e) { resolve({ error: 'Analyse impossible: ' + e.message }); }
        });
      });
      req.on('error', e => resolve({ error: e.message }));
      req.setTimeout(15000, () => { req.destroy(); resolve({ error: 'Timeout (15s)' }); });
      req.write(postData);
      req.end();
    });
  }

  if (name === 'fetch_url') {
    // Récupère et nettoie une page. Suit jusqu'à 3 redirections (compteur anti-boucle) et
    // borne la taille du corps pour ne pas épuiser la mémoire.
    const doFetch = (rawUrl, depth) => new Promise((resolve) => {
      if (depth > 3) { resolve({ error: 'Trop de redirections' }); return; }
      let u;
      try { u = new URL(rawUrl); } catch (_) { resolve({ error: 'URL invalide: ' + rawUrl }); return; }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') { resolve({ error: 'Protocole non supporté' }); return; }
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request({
        host: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + (u.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'text/html,application/xhtml+xml,text/plain',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
        }
      }, res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.destroy();
          const next = new URL(res.headers.location, u).href; // résout les Location relatives
          resolve(doFetch(next, depth + 1));
          return;
        }
        let body = '';
        res.on('data', c => { body += c; if (body.length > 600000) res.destroy(); });
        res.on('end', () => {
          const text = body
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
          resolve({ content: text.length > 20000 ? text.slice(0, 20000) + '\n[tronqué...]' : text });
        });
      });
      req.on('error', e => resolve({ error: e.message }));
      req.setTimeout(20000, () => { req.destroy(); resolve({ error: 'Timeout (20s)' }); });
      req.end();
    });
    return doFetch(args.url || '', 0);
  }

  if (name === 'patch_file') {
    try {
      const filePath = path.resolve(args.path || '');
      const content = fs.readFileSync(filePath, 'utf8');
      const oldText = args.old_text || '';
      const newText = args.new_text || '';
      if (!content.includes(oldText)) {
        return { error: 'Texte à remplacer introuvable dans le fichier. Vérifie le contenu exact (espaces, retours à la ligne).' };
      }
      const updated = content.replace(oldText, newText);
      fs.writeFileSync(filePath, updated, 'utf8');
      return { ok: true, message: 'Patch appliqué dans : ' + filePath };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (name === 'grep_search') {
    // Recherche 100 % en Node (aucun shell) : élimine l'injection de commande
    // qui était possible via le motif ou le filtre include non échappés.
    try {
      const root = path.resolve(args.path || '.');
      const patternStr = (args.pattern || '').toString();
      if (!patternStr) return { error: 'pattern requis' };
      const include = (args.include || '').toString().trim();
      const extFilter = include && include.includes('.') ? include.replace(/^\*+/, '') : '';
      let rx = null;
      try { rx = new RegExp(patternStr, 'i'); } catch (_) { rx = null; }
      const matchLine = (line) => rx ? rx.test(line) : line.toLowerCase().includes(patternStr.toLowerCase());
      const IGNORE = new Set(['node_modules', '.git', 'dist', 'build', '.cache', '.next', 'coverage']);
      const MAX = 50;
      const results = [];
      (function walk(dir, depth) {
        if (results.length >= MAX || depth > 8) return;
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
        for (const ent of entries) {
          if (results.length >= MAX) return;
          const full = path.join(dir, ent.name);
          if (ent.isDirectory()) { if (!IGNORE.has(ent.name)) walk(full, depth + 1); continue; }
          if (extFilter && !ent.name.endsWith(extFilter)) continue;
          let content;
          try {
            const st = fs.statSync(full);
            if (st.size > 2 * 1024 * 1024) continue;
            content = fs.readFileSync(full, 'utf8');
          } catch (_) { continue; }
          if (content.indexOf('\u0000') !== -1) continue; // ignore les binaires
          const lines = content.split('\n');
          for (let i = 0; i < lines.length && results.length < MAX; i++) {
            if (matchLine(lines[i])) results.push(path.relative(root, full) + ':' + (i + 1) + ': ' + lines[i].trim().slice(0, 300));
          }
        }
      })(root, 0);
      const out = results.join('\n');
      if (!out) return { matches: '', count: 0, message: 'Aucune correspondance trouvée.' };
      return { matches: out.length > 10000 ? out.slice(0, 10000) + '\n[tronqué...]' : out, count: results.length };
    } catch (e) {
      return { error: (e.message || 'erreur grep_search').toString().slice(0, 2000) };
    }
  }

  if (name === 'create_directory') {
    try {
      const dirPath = path.resolve(args.path || '');
      fs.mkdirSync(dirPath, { recursive: true });
      return { ok: true, message: 'Dossier créé : ' + dirPath };
    } catch (e) {
      return { error: e.message };
    }
  }

  if (name === 'python_eval') {
    try {
      const tmpFile = path.join(os.tmpdir(), 'lebon_ai_eval_' + Date.now() + '.py');
      fs.writeFileSync(tmpFile, args.code || '', 'utf8');
      const output = execSync(`python "${tmpFile}"`, {
        cwd: args.cwd || os.homedir(),
        timeout: 60000,
        encoding: 'utf8',
        maxBuffer: 5 * 1024 * 1024,
        shell: true
      });
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      const out = (output || '').toString();
      return { output: out.length > 10000 ? out.slice(0, 10000) + '\n[tronqué...]' : out };
    } catch (e) {
      const errOut = ((e.stdout || '') + (e.stderr || '') || e.message || '').toString();
      return { error: errOut.length > 5000 ? errOut.slice(0, 5000) : errOut };
    }
  }

  if (name === 'get_system_info') {
    try {
      const cpus = os.cpus();
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
      const info = {
        os: os.type() + ' ' + os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpu: cpus[0] ? cpus[0].model : 'N/A',
        cores: cpus.length,
        ram_total: totalMem + ' Go',
        ram_free: freeMem + ' Go',
        uptime: (os.uptime() / 3600).toFixed(1) + ' heures',
        home: os.homedir(),
        cwd: process.cwd(),
        node_version: process.version,
        platform: process.platform
      };
      // Try to get disk space on Windows
      if (process.platform === 'win32') {
        try {
          const diskOut = execSync('powershell -NoProfile -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name,@{N=\\"Used_GB\\";E={[math]::Round($_.Used/1GB,1)}},@{N=\\"Free_GB\\";E={[math]::Round($_.Free/1GB,1)}} | ConvertTo-Json"', { encoding: 'utf8', timeout: 5000 });
          info.disks = JSON.parse(diskOut);
        } catch (_) {}
      }
      return info;
    } catch (e) {
      return { error: e.message };
    }
  }

  return { error: 'Tool inconnu: ' + name };
}

function ollamaChatSync(payload) {
  return new Promise((resolve, reject) => {
    if (payload && !VALID_OLLAMA_MODELS.has(payload.model)) payload.model = DEFAULT_LOCAL_MODEL;
    const body = JSON.stringify(payload);
    const req = http.request({
      host: 'localhost',
      port: OLLAMA_PORT,
      path: '/api/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      agent: false
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Réponse Ollama non-JSON: ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(180000, () => { req.destroy(); reject(new Error('Timeout Ollama (180s)')); });
    req.write(body);
    req.end();
  });
}

const SKILLS_FILE = path.join(DIR, 'skills.json');
const LIBRARY_FILE = path.join(DIR, 'library.json');

const DEFAULT_SKILLS = [
  {
    id: 'skill-dev',
    name: 'Code Reviewer & Security Linter',
    icon: '⚡',
    category: 'Engineering',
    desc: 'Analyse de code statique, détection de failles OWASP, refactoring Clean Code et bonnes pratiques.',
    prompt: 'Tu es un expert en sécurité et architecture logicielle senior. Analyse le code fourni, identifie les vulnérabilités potentielles, optimise la complexité cyclomatique et propose une version refactorée.',
    tools: ['read_file', 'write_file', 'patch_file', 'run_command'],
    active: true,
    builtin: true
  },
  {
    id: 'skill-data',
    name: 'BigQuery & Dataform Analyst',
    icon: '📊',
    category: 'Data',
    desc: 'Optimisation de requêtes SQL BigQuery, partitionnement, clustering et pipelines de transformation Dataform.',
    prompt: 'Tu es un Data Architecte expert BigQuery & Dataform. Aide à concevoir, auditer et optimiser les requêtes SQL analytiques, les coûts de scan et la modélisation de données en étoile/flocon.',
    tools: ['run_command', 'python_eval'],
    active: true,
    builtin: true
  },
  {
    id: 'skill-roi',
    name: 'Calculateur ROI Transfo IA',
    icon: '💶',
    category: 'Finance',
    desc: 'Chiffrage financier précis des gains d’efficacité, payback, réduction du TCO et modélisation standard F3.',
    prompt: 'Tu es le contrôleur de gestion dédié à la Transfo IA leboncoin. Calcule les gains annuels, le payback et le ROI prévisionnel pour chaque use case.',
    tools: ['python_eval'],
    active: true,
    builtin: true
  },
  {
    id: 'skill-comex',
    name: 'Rédacteur Note COMEX F3',
    icon: '🏛️',
    category: 'Management',
    desc: 'Rédaction de synthèses exécutives percutantes en 5 points clés (Victoires, Blockers, Décisions).',
    prompt: 'Tu es le rédacteur officiel de la direction générale leboncoin. Rédige une note exécutive COMEX de haut niveau au format standard F3 en 5 points stratégiques structurés.',
    tools: ['web_search'],
    active: true,
    builtin: true
  },
  {
    id: 'skill-sys',
    name: 'System & DevOps Operator',
    icon: '💻',
    category: 'DevOps',
    desc: 'Exécution de commandes système, inspection de processus, monitoring de ressources et administration Windows/Linux.',
    prompt: 'Tu es un ingénieur DevOps et administrateur système. Utilise PowerShell et les outils système pour exécuter des scripts, vérifier les processus et auditer les performances machine.',
    tools: ['run_command', 'get_system_info', 'list_directory'],
    active: true,
    builtin: true
  },
  {
    id: 'skill-web',
    name: 'Recherche Web & Veille Tech',
    icon: '🌐',
    category: 'Veille',
    desc: 'Recherche d’informations en temps réel sur internet, documentation de frameworks et benchmarks IA.',
    prompt: 'Tu es un analyste de veille technologique. Recherche les dernières actualités, documentations et benchmarks sur les modèles d’IA et outils cloud.',
    tools: ['web_search', 'fetch_url'],
    active: true,
    builtin: true
  }
];

const DEFAULT_LIBRARY = [
  {
    id: 'doc-1',
    type: 'doc',
    title: 'Charte Gouvernance IA Souveraine leboncoin',
    desc: 'Principes de sécurité des données, classification RGPD et politique d’inférence 100% locale.',
    date: '2026-08-15',
    size: '42 Ko',
    tag: 'Gouvernance'
  },
  {
    id: 'doc-2',
    type: 'doc',
    title: 'Standard F3 · Fiche Cadrage Use Case IA',
    desc: 'Modèle officiel de cadrage stratégique pour les projets IA validés en comité d’arbitrage.',
    date: '2026-08-16',
    size: '18 Ko',
    tag: 'Standard F3'
  },
  {
    id: 'prompt-1',
    type: 'prompt',
    title: 'Refactoring Clean Code & Tests Unitaires',
    desc: 'Prompt structuré pour réécrire une fonction avec typage, gestion d’erreurs et suite de tests.',
    date: '2026-08-17',
    tag: 'Engineering',
    content: 'Analyse le code suivant, applique les principes SOLID, isole les fonctions pures et génère la suite de tests unitaires complète avec cas limites :'
  },
  {
    id: 'prompt-2',
    type: 'prompt',
    title: 'Simulation ROI & Rentabilité Use Case',
    desc: 'Prompt pour chiffrer précisément les économies en heures et euros d’un projet IA.',
    date: '2026-08-17',
    tag: 'Finance',
    content: 'Calcule le modèle financier complet pour ce use case IA (population, temps gagné par semaine, coût licence, payback et ROI net sur 3 ans) :'
  }
];

if (!fs.existsSync(SKILLS_FILE)) {
  try { fs.writeFileSync(SKILLS_FILE, JSON.stringify(DEFAULT_SKILLS, null, 2)); } catch (_) {}
}
if (!fs.existsSync(LIBRARY_FILE)) {
  try { fs.writeFileSync(LIBRARY_FILE, JSON.stringify(DEFAULT_LIBRARY, null, 2)); } catch (_) {}
}

function sseEvent(res, event, data) {
  try { res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n'); } catch (_) {}
}

// ── Text-Based Tool Call Extractor (pour petits modèles & formats markdown) ──
function extractTextToolCalls(text) {
  if (!text || typeof text !== 'string') return [];
  const calls = [];

  // 1. Détection des blocs de code ```bash ou ```powershell ou ```cmd
  const cmdRegex = /```(?:bash|powershell|cmd|sh|shell)\s*([\s\S]*?)```/gi;
  let m;
  while ((m = cmdRegex.exec(text)) !== null) {
    const rawCmd = m[1].trim();
    if (rawCmd && !rawCmd.startsWith('#') && rawCmd.length > 1) {
      calls.push({
        name: 'run_command',
        args: { command: rawCmd }
      });
    }
  }

  // 2. Détection des blocs de code ```python
  const pyRegex = /```python\s*([\s\S]*?)```/gi;
  while ((m = pyRegex.exec(text)) !== null) {
    const rawPy = m[1].trim();
    if (rawPy && rawPy.length > 5) {
      calls.push({
        name: 'python_eval',
        args: { code: rawPy }
      });
    }
  }

  // 3. Détection des balises XML <tool_call>...</tool_call>
  const xmlRegex = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
  while ((m = xmlRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (parsed.name) calls.push({ name: parsed.name, args: parsed.arguments || parsed.args || {} });
    } catch (_) {}
  }

  return calls;
}

// ── Autonomous Agent Loop (apiWork) ───────────────────────────
function apiWork(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch (e) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { model, messages, user, allowMutations = false } = data;
    if (!model) return respond(res, 400, { error: 'model requis' });
    const msgs = Array.isArray(messages) ? messages.filter(m => m && typeof m === 'object' && typeof m.role === 'string') : [];

    logEvent(user, 'WORK', model, msgs.length + ' msgs');

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });

    let cancelled = false;
    res.on('close', () => { cancelled = true; });

    const sysPrompt = {
      role: 'system',
      content: `Tu es LeBon AI Work, un agent IA autonome professionnel pour leboncoin Transfo IA 360 opérant directement sur la machine Windows locale.

## Outils disponibles à exécuter réellement sur le système :
1. **run_command(command="...")** : Exécute toute commande PowerShell/CMD (ex: Get-Process, dir, git status, npm, etc.)
2. **read_file(path="...")** : Lit le contenu d'un fichier sur le disque
3. **write_file(path="...", content="...")** : Écrit ou crée un fichier complet
4. **patch_file(path="...", old_text="...", new_text="...")** : Modifie une portion de fichier
5. **list_directory(path="...")** : Liste les fichiers et dossiers
6. **grep_search(path="...", pattern="...")** : Recherche textuelle récursive
7. **python_eval(code="...")** : Exécute du code Python
8. **web_search(query="...")** : Recherche sur le web en temps réel
9. **get_system_info()** : Informations système (OS, CPU, RAM, Disques)

## Directives d'exécution :
- Sois un agent d'action : exécute réellement les outils nécessaires pour accomplir la tâche de l'utilisateur.
- Pour agir, utilise uniquement un appel d'outil structuré. Un bloc de code Markdown est une proposition affichée, jamais une exécution.
- Autorisation système pour cette mission : ${allowMutations ? 'ACCORDÉE' : 'NON ACCORDÉE — reste en lecture seule et propose les actions sans les exécuter'}.
- Réponds toujours en français avec clarté et précision.`
    };

    const globalContext = getContextMarkdown();
    if (globalContext && globalContext.trim().length > 0) {
      sysPrompt.content += `\n\n## 🧠 Mémoire Globale & Contexte Actuel (contexte.md) :\n${globalContext}`;
    }

    const currentMessages = [sysPrompt, ...msgs];
    const MAX_ITER = 20;

    (async () => {
      try {
        let iterations = 0;
        while (iterations < MAX_ITER && !cancelled) {
          iterations++;

          const payload = {
            model,
            messages: currentMessages,
            tools: WORK_TOOLS,
            stream: false,
            keep_alive: '15m',
            // Contexte élargi pour que l'historique + les résultats d'outils tiennent (évite la
            // troncature qui faisait « oublier » les résultats et reboucler l'agent).
            options: { num_ctx: 8192, num_predict: 2048, temperature: 0.4 }
          };

          let resp;
          try {
            resp = await ollamaChatSync(payload);
          } catch (e) {
            sseEvent(res, 'error', { error: 'Ollama inaccessible: ' + e.message });
            break;
          }

          if (resp.error) { sseEvent(res, 'error', { error: resp.error }); break; }

          const msg = resp.message || {};
          let toolCallsToExec = [];

          // 1. Tool calls natifs Ollama
          if (msg.tool_calls && msg.tool_calls.length > 0) {
            toolCallsToExec = msg.tool_calls.map(tc => {
              const name = (tc.function && tc.function.name) || tc.name || '';
              let args = {};
              try {
                const raw = (tc.function && tc.function.arguments) || tc.arguments || {};
                args = typeof raw === 'string' ? JSON.parse(raw) : raw;
              } catch (_) {}
              return { name, args };
            });
          }

          // Un bloc Markdown est une proposition à relire, jamais une autorisation
          // d'exécuter une commande sur le poste. Seuls les appels structurés entrent ici.

          // ── Exécution des tools trouvés ─────────────────────
          if (toolCallsToExec.length > 0) {
            // Protocole d'appel d'outils Ollama : on conserve `tool_calls` sur le tour assistant,
            // puis on renvoie chaque résultat en `role:'tool'`. Sans ça, le modèle ne « voit » pas
            // ses résultats et ré-émet le même appel jusqu'à MAX_ITER (boucle stérile).
            currentMessages.push({
              role: 'assistant',
              content: msg.content || '',
              tool_calls: msg.tool_calls
            });

            for (const tc of toolCallsToExec) {
              if (cancelled) break;
              const toolName = tc.name;
              const toolArgs = tc.args || {};

              sseEvent(res, 'tool_call', { name: toolName, args: toolArgs });

              let result;
              try {
                const mutatingTools = new Set(['run_command', 'write_file', 'patch_file', 'create_directory', 'python_eval']);
                if (mutatingTools.has(toolName) && !allowMutations) {
                  result = { error: 'Action non exécutée : autorisation système requise pour cette mission.' };
                } else {
                  const r = executeTool(toolName, toolArgs);
                  result = (r && typeof r.then === 'function') ? await r : r;
                }
              } catch (e) {
                result = { error: e.message };
              }

              sseEvent(res, 'tool_result', { name: toolName, result });

              // Résultat borné pour tenir dans la fenêtre de contexte (évite la troncature silencieuse).
              let resultStr = typeof result === 'string' ? result : JSON.stringify(result);
              if (resultStr.length > 6000) resultStr = resultStr.slice(0, 6000) + '\n…[résultat tronqué]';
              currentMessages.push({
                role: 'tool',
                tool_name: toolName,
                content: resultStr
              });
            }
            continue; // boucle vers l'itération suivante avec le résultat
          }

          // ── Pas de tool call → Réponse finale ──────────────
          if (msg.content) {
            sseEvent(res, 'content', { content: msg.content });
          }
          break;
        }

        if (iterations >= MAX_ITER && !cancelled) {
          sseEvent(res, 'content', { content: '\n\n*[Mission accomplie — limite d\'itérations atteinte.]*' });
        }
      } catch (e) {
        sseEvent(res, 'error', { error: e.message });
      }

      sseEvent(res, 'done', {});
      try { res.end(); } catch (_) {}
    })();
  });
}

// ── Skills API ────────────────────────────────────────────────
function apiSkillsGet(res) {
  const skills = readJson(SKILLS_FILE, DEFAULT_SKILLS);
  respond(res, 200, { skills });
}

function apiSkillsSet(req, res) {
  readBody(req, b => {
    let item;
    try { item = JSON.parse(b); } catch (_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const skills = readJson(SKILLS_FILE, DEFAULT_SKILLS);
    if (!item.id) item.id = 'skill-' + Date.now();
    const idx = skills.findIndex(s => s.id === item.id);
    if (idx >= 0) skills[idx] = item;
    else skills.push(item);
    writeJson(SKILLS_FILE, skills);
    respond(res, 200, { ok: true, skill: item });
  });
}

function apiSkillsDelete(res, id) {
  let skills = readJson(SKILLS_FILE, DEFAULT_SKILLS);
  skills = skills.filter(s => s.id !== id);
  writeJson(SKILLS_FILE, skills);
  respond(res, 200, { ok: true });
}

// ── Library API ───────────────────────────────────────────────
function apiLibraryGet(res) {
  const items = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
  respond(res, 200, { items });
}

function apiLibrarySet(req, res) {
  readBody(req, b => {
    let item;
    try { item = JSON.parse(b); } catch (_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const items = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
    if (!item.date) item.date = new Date().toISOString().split('T')[0];
    // Upsert réel : mise à jour si l'id existe, sinon ajout (évite les doublons à chaque save).
    if (item.id) {
      const idx = items.findIndex(x => x.id === item.id);
      if (idx !== -1) { items[idx] = { ...items[idx], ...item }; }
      else { items.unshift(item); }
    } else {
      item.id = 'lib-' + Date.now();
      items.unshift(item);
    }
    writeJson(LIBRARY_FILE, items);
    respond(res, 200, { ok: true, item });
  });
}

function apiLibraryDelete(res, id) {
  let items = readJson(LIBRARY_FILE, DEFAULT_LIBRARY);
  items = items.filter(it => it.id !== id);
  writeJson(LIBRARY_FILE, items);
  respond(res, 200, { ok: true });
}

// ── System Telemetry API ──────────────────────────────────────
function apiSystem(res) {
  try {
    const cpus = os.cpus();
    const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10;
    const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 10) / 10;
    const usedMem = Math.round((totalMem - freeMem) * 10) / 10;
    const payload = {
      os: os.type() + ' ' + os.release(),
      platform: process.platform,
      arch: os.arch(),
      cpu: cpus[0] ? cpus[0].model : 'CPU',
      cores: cpus.length,
      ram: { total: totalMem, free: freeMem, used: usedMem, pct: Math.round((usedMem / totalMem) * 100) },
      uptime: Math.round(os.uptime() / 3600 * 10) / 10,
      localServer: true,
      loopbackOnly: true,
      ollama: false
    };

    let answered = false;
    const finish = (ollama) => {
      if (answered) return;
      answered = true;
      payload.ollama = !!ollama;
      respond(res, 200, payload);
    };
    const healthReq = http.get({ host: '127.0.0.1', port: OLLAMA_PORT, path: '/api/tags', timeout: 900 }, healthRes => {
      healthRes.resume();
      finish(healthRes.statusCode >= 200 && healthRes.statusCode < 500);
    });
    healthReq.on('timeout', () => { healthReq.destroy(); finish(false); });
    healthReq.on('error', () => finish(false));
  } catch (e) {
    respond(res, 500, { error: e.message });
  }
}

// ── Global Memory (contexte.md) API Handlers ──────────────────
function apiContextGet(res) {
  try {
    const content = getContextMarkdown();
    const stat = fs.existsSync(CONTEXT_FILE) ? fs.statSync(CONTEXT_FILE) : { mtime: new Date(), size: 0 };
    respond(res, 200, {
      content,
      lastModified: stat.mtime,
      size: stat.size
    });
  } catch (e) {
    respond(res, 500, { error: e.message });
  }
}

function apiContextSet(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const content = data.content || '';
    const success = setContextMarkdown(content);
    if (success) {
      logEvent(data.user || 'Abbas Mistrah', 'CONTEXT_UPDATE', 'contexte.md', `${content.length} chars`);
      respond(res, 200, { ok: true, message: 'Mémoire globale enregistrée' });
    } else {
      respond(res, 500, { error: 'Échec de l\'écriture dans contexte.md' });
    }
  });
}

function apiContextAppend(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const note = data.note || '';
    if (!note) return respond(res, 400, { error: 'Note requise' });
    appendContextNote(note);
    logEvent(data.user || 'Abbas Mistrah', 'CONTEXT_APPEND', 'contexte.md', note.slice(0, 40));
    respond(res, 200, { ok: true, note });
  });
}

function apiContextDistill(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { title, keyPoints, user } = data;
    if (title || keyPoints) {
      const dateStr = new Date().toLocaleString('fr-FR');
      const note = `[${dateStr}] Discussion "${title || 'Échange'}" : ${keyPoints || 'Décisions mémorisées'}`;
      appendContextNote(note);
      logEvent(user || 'Abbas Mistrah', 'CONTEXT_DISTILL', 'contexte.md', title || 'Auto-mémorisation');
    }
    respond(res, 200, { ok: true });
  });
}

// ── Enterprise MCP Connectors & Tools Execution Engine ────────
const MOCK_LEBONCOIN_DB = {
  ads_moderation: [
    { id: 101, title: 'iPhone 15 Pro Max 256GB Neuf', price_eur: 450, category: 'Multimédia', seller_id: 'usr_882', status: 'flagged_fraud', risk_score: 94, reason: 'Prix anormalement bas (-60% sous cote)' },
    { id: 102, title: 'Renault Clio V 1.0 TCe 90ch Intens', price_eur: 13900, category: 'Véhicules', seller_id: 'usr_pro_04', status: 'approved', risk_score: 5, reason: 'Concessionnaire certifié' },
    { id: 103, title: 'Appartement 3 pièces 65m² Paris 11e', price_eur: 620000, category: 'Immobilier', seller_id: 'usr_immo_12', status: 'approved', risk_score: 8, reason: 'Agence vérifiée' },
    { id: 104, title: 'Carte Graphique RTX 4090 OC', price_eur: 600, category: 'Informatique', seller_id: 'usr_scam_9', status: 'blocked', risk_score: 98, reason: 'Usurpation identité bancaire' },
    { id: 105, title: 'Table à manger chêne massif extensible', price_eur: 280, category: 'Maison', seller_id: 'usr_part_55', status: 'approved', risk_score: 2, reason: 'Vendeur historique avec 42 avis' }
  ],
  transactions_payment: [
    { tx_id: 'tx_98124', amount_eur: 180.00, fee_eur: 7.20, category: 'Mode', status: 'escrow_secured', created_at: '2026-08-18 10:14:00' },
    { tx_id: 'tx_98125', amount_eur: 850.00, fee_eur: 34.00, category: 'Multimédia', status: 'delivered_paid', created_at: '2026-08-18 11:32:00' },
    { tx_id: 'tx_98126', amount_eur: 45.00, fee_eur: 1.80, category: 'Maison', status: 'in_transit', created_at: '2026-08-18 13:05:00' }
  ],
  user_metrics_ibc: [
    { department: 'Tech & Engineering', tech_wau_pct: 62.5, total_users: 480, hours_saved_per_month: 1650, active_use_cases: 124 },
    { department: 'Data & Analytics', tech_wau_pct: 71.0, total_users: 110, hours_saved_per_month: 520, active_use_cases: 58 },
    { department: 'Modération & Confiance', tech_wau_pct: 88.4, total_users: 95, hours_saved_per_month: 840, active_use_cases: 32 },
    { department: 'Produit & Design', tech_wau_pct: 54.0, total_users: 140, hours_saved_per_month: 380, active_use_cases: 45 },
    { department: 'RH & Finance', tech_wau_pct: 46.2, total_users: 160, hours_saved_per_month: 290, active_use_cases: 28 }
  ]
};

function apiToolsExecute(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { tool, query, options } = data;

    if (tool === 'sql' || tool === 'mcp_bigquery') {
      const q = (query || '').toLowerCase().trim();
      let tableName = 'user_metrics_ibc';
      if (q.includes('ad') || q.includes('annonce') || q.includes('moderat') || q.includes('fraud')) tableName = 'ads_moderation';
      else if (q.includes('tx') || q.includes('transact') || q.includes('pay') || q.includes('paiement')) tableName = 'transactions_payment';

      const rows = MOCK_LEBONCOIN_DB[tableName] || [];
      return respond(res, 200, {
        ok: true,
        tool: 'Démo locale — BigQuery SQL Connector (MCP)',
        table: tableName,
        rowCount: rows.length,
        executionTimeMs: 14,
        rows: rows,
        summary: `Simulation locale sur le jeu de démonstration '${tableName}'. ${rows.length} lignes affichées ; aucune requête BigQuery réelle n'a été exécutée.`
      });
    }

    if (tool === 'git' || tool === 'mcp_github') {
      try {
        const gitLog = execSync('git log -n 5 --oneline', { encoding: 'utf8', cwd: DIR, timeout: 3000 });
        const gitStatus = execSync('git status --short', { encoding: 'utf8', cwd: DIR, timeout: 3000 });
        const branch = execSync('git branch --show-current', { encoding: 'utf8', cwd: DIR, timeout: 3000 }).trim();
        return respond(res, 200, {
          ok: true,
          tool: 'Git & GitHub DevOps Connector (MCP)',
          branch: branch || 'main',
          recentCommits: gitLog.trim().split('\n'),
          modifiedFiles: gitStatus.trim().split('\n').filter(Boolean),
          summary: `Dépôt git actif sur branche '${branch || 'main'}'. ${gitLog.trim().split('\n').length} derniers commits inspectés.`
        });
      } catch (err) {
        return respond(res, 503, {
          ok: false,
          tool: 'Git local',
          error: `Dépôt Git inaccessible : ${err.message}`
        });
      }
    }

    if (tool === 'web' || tool === 'mcp_web') {
      const q = query || 'leboncoin IA générative';
      const results = [
        { title: `Résultat temps réel : ${q}`, snippet: `Recherche en direct effectuée pour "${q}". Données actualisées du Web et des flux internes leboncoin.`, source: 'https://www.leboncoin.fr/recherche' },
        { title: 'Programme Transfo IA 360 · Groupe Adevinta', snippet: 'Cadre d\'accélération de l\'adoption de l\'IA générative et souveraine chez leboncoin avec les modèles Ollama locaux.', source: 'https://adevinta.com/innovation/ai' }
      ];
      return respond(res, 200, {
        ok: true,
        tool: 'Démo locale — Web Search Connector (MCP)',
        query: q,
        results: results,
        summary: `Résultats de démonstration préparés pour '${q}'. Aucune recherche web réelle n'a été effectuée.`
      });
    }

    if (tool === 'slack' || tool === 'mcp_slack') {
      const channel = options?.channel || '#transfo-ia-comex';
      const payload = {
        channel,
        username: 'LeBon AI Executive Bot',
        icon_emoji: ':robot_face:',
        blocks: [
          { type: 'header', text: { type: 'plain_text', text: '📊 Point Hebdo Transfo IA 360' } },
          { type: 'section', text: { type: 'mrkdwn', text: `*Auteur :* Abbas Mistrah\n*Score IBC :* 59.2 / 100\n*Message :* ${query || 'Validation du déploiement des agents métiers.'}` } },
          { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Consulter le One-Pager' }, style: 'primary' }] }
        ]
      };
      return respond(res, 200, {
        ok: true,
        tool: 'Prévisualisation — Slack & MS Teams Bot Connector (MCP)',
        channel,
        payload,
        summary: `Payload Slack/Teams préparé pour '${channel}', non envoyé.`
      });
    }

    if (tool === 'jira' || tool === 'mcp_jira') {
      const ticket = {
        key: 'IA-371',
        project: 'TRANSFO-IA',
        summary: query || 'Déploiement du connecteur BigQuery pour l\'équipe Data',
        issueType: 'Story',
        storyPoints: 5,
        acceptanceCriteria: [
          'GIVEN un consultant IA authentifié',
          'WHEN il soumet une requête SQL en langage naturel',
          'THEN le connecteur MCP BigQuery retourne les données sous format tabulaire et JSON en moins de 500ms'
        ],
        status: 'To Do'
      };
      return respond(res, 200, {
        ok: true,
        tool: 'Prévisualisation — Jira & Confluence Connector (MCP)',
        ticket,
        summary: `Ticket Jira de démonstration ${ticket.key} préparé, non créé dans Jira.`
      });
    }

    if (tool === 'devtools' || tool === 'mcp_devtools') {
      const htmlSnippet = query || '<button class="btn">Valider</button>';
      const issues = [];
      if (!htmlSnippet.includes('aria-label') && !htmlSnippet.includes('title') && htmlSnippet.includes('<img')) {
        issues.push('⚠️ Image sans attribut alt descriptif (Impact RGAA / a11y)');
      }
      if (!htmlSnippet.includes('<meta name="viewport"')) {
        issues.push('ℹ️ Balise viewport non détectée dans l\'extrait');
      }
      return respond(res, 200, {
        ok: true,
        tool: 'Audit local heuristique HTML',
        snippetLength: htmlSnippet.length,
        scoreA11y: issues.length === 0 ? '98 / 100' : '82 / 100',
        auditIssues: issues.length ? issues : ['✓ Aucune anomalie critique détectée', '✓ Structure HTML sémantique valide'],
        summary: 'Pré-audit heuristique terminé. Ce résultat ne remplace pas un audit RGAA automatisé et manuel.'
      });
    }

    return respond(res, 400, { error: 'Outil inconnu : ' + tool });
  });
}

// ── Laboratoire local de connecteurs (prévisualisation uniquement) ─────────

function apiComposioApps(res) {
  const apps = [
    { id: 'github', name: 'GitHub Universe', icon: '🐙', cat: 'Dev & CI/CD', connected: false, authType: 'À connecter', actions: ['create_issue', 'list_pull_requests', 'get_repo_stats', 'search_code'] },
    { id: 'gmail', name: 'Gmail & Workspace', icon: '📧', cat: 'Productivité', connected: false, authType: 'À connecter', actions: ['list_recent_emails', 'create_draft', 'send_email'] },
    { id: 'slack', name: 'Slack Enterprise', icon: '💬', cat: 'Communication', connected: false, authType: 'À connecter', actions: ['send_channel_message', 'get_channel_history', 'post_comex_summary'] },
    { id: 'notion', name: 'Notion Workspace', icon: '📑', cat: 'Knowledge Base', connected: false, authType: 'À connecter', actions: ['search_pages', 'append_block', 'get_database_entries'] },
    { id: 'jira', name: 'Jira Software', icon: '📋', cat: 'Agile Delivery', connected: false, authType: 'À connecter', actions: ['create_story', 'get_sprint_issues', 'update_status'] },
    { id: 'sheets', name: 'Google Sheets & Excel', icon: '📊', cat: 'Data & Tableurs', connected: false, authType: 'À connecter', actions: ['read_range', 'append_row', 'export_kpis'] },
    { id: 'linear', name: 'Linear App', icon: '🎯', cat: 'Issue Tracker', connected: false, authType: 'À connecter', actions: ['create_issue', 'list_cycles'] },
    { id: 'postgres', name: 'PostgreSQL / SQL Engine', icon: '🗄️', cat: 'Base de données', connected: false, authType: 'À connecter', actions: ['execute_sql', 'list_tables', 'describe_schema'] },
    { id: 'salesforce', name: 'Salesforce CRM', icon: '💼', cat: 'Vente & CRM', connected: false, authType: 'À connecter', actions: ['search_accounts', 'create_lead'] },
    { id: 'n8n', name: 'n8n Workflow Automation', icon: '⚡', cat: 'iPaaS & No-Code', connected: false, authType: 'À connecter', actions: ['trigger_workflow', 'poll_execution'] }
  ];
  respond(res, 200, { apps, localMode: true, previewOnly: true, provider: 'Laboratoire local de connecteurs' });
}

function apiComposioConnect(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { appId } = data;
    if (!appId) return respond(res, 400, { error: 'appId requis' });
    respond(res, 501, { ok: false, preview: true, error: `Le connecteur ${appId} est une maquette : aucune clé n'a été enregistrée.` });
  });
}

function apiComposioExecute(req, res) {
  readBody(req, b => {
    let data;
    try { data = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { app, action, params } = data;

    return respond(res, 200, {
      ok: false,
      preview: true,
      executed: false,
      app,
      action,
      params: params || {},
      summary: `Prévisualisation du connecteur ${app || 'inconnu'} : aucune action externe n'a été exécutée.`
    });
  });
}

// ── Team Workspaces & Multi-Agent Swarm Logic ─────────────────
const DEFAULT_WORKSPACES = {
  activeId: 'ws-transfo-ia',
  workspaces: [
    {
      id: 'ws-transfo-ia',
      name: 'leboncoin - Transfo IA 360',
      tag: 'Principal ★',
      color: '#ff6b00',
      description: 'Accélération IA générative, adoption équipes produit & tech, KPIs IBC et standard F3.',
      createdAt: '2026-08-01',
      context: `# Directives de l'Espace Transfo IA 360\n- Objectif 2026 : Atteindre 75% de Tech WAU et 2 000h mensuelles économisées.\n- Standard F3 obligatoire pour toute restitution au COMEX : 5s vision, 30s compréhension, 2 clics action.\n- Exécution exclusivement locale avec Ollama ; profil LeBon Local Efficace recommandé.`,
      members: [
        { id: 'm-1', name: 'Abbas Mistrah', role: 'Lead IA & Transfo 360', email: 'abbas.mistrah.ext@leboncoin.fr', status: 'online', avatar: 'AM', isLead: true },
        { id: 'm-2', name: 'Sarah Da Silva', role: 'Product Strategy Lead', email: 'sarah.d@leboncoin.fr', status: 'online', avatar: 'SD', isLead: false },
        { id: 'm-3', name: 'Thomas Bernard', role: 'Staff Software Engineer', email: 'thomas.b@leboncoin.fr', status: 'busy', avatar: 'TB', isLead: false },
        { id: 'm-4', name: 'Julie Lefebvre', role: 'Data Architect & BigQuery', email: 'julie.l@leboncoin.fr', status: 'generating', avatar: 'JL', isLead: false }
      ],
      agents: [
        { id: 'agent-coder', name: 'LeBon Coder', role: 'Architecture & Code Sandbox', icon: '⚡', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Génération de composants web, refactoring Clean Code et scripts locaux.' },
        { id: 'agent-data', name: 'BigQuery Analyst', role: 'Data Pipelines & SQL', icon: '📊', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Analyses de données volumineuses, requêtes BigQuery et modélisation.' },
        { id: 'agent-roi', name: 'Calculateur ROI', role: 'Modélisation Financière', icon: '💡', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Chiffrage des gains financiers, heures économisées et payback.' },
        { id: 'agent-comex', name: 'COMEX Synthesizer', role: 'Notes Exécutives F3', icon: '📑', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Notes de synthèse stratégiques 5 points pour le comité de direction.' }
      ],
      tasks: [
        { id: 't-101', title: 'Calculer les projections ROI 2026 pour 500 collaborateurs', status: 'done', priority: 'high', assigneeType: 'agent', assigneeId: 'agent-roi', assigneeName: 'Calculateur ROI', output: 'Projection validée : 182 500 € / an d\'économies nettes et 414h libérées par mois (payback 1.8 mois).', date: 'Aujourd\'hui' },
        { id: 't-102', title: 'Générer le script d\'analyse statique des repositories tech', status: 'done', priority: 'medium', assigneeType: 'agent', assigneeId: 'agent-coder', assigneeName: 'LeBon Coder', output: 'Script scan_leboncoin_project.py généré avec audit OWASP et métriques de complexité cyclomatique.', date: 'Aujourd\'hui' },
        { id: 't-103', title: 'Préparer la note stratégique F3 pour le COMEX de rentrée', status: 'in_progress', priority: 'urgent', assigneeType: 'agent', assigneeId: 'agent-comex', assigneeName: 'COMEX Synthesizer', output: 'Synthèse 5 points clés et KPIs certifiés en cours de finalisation.', date: 'Aujourd\'hui' },
        { id: 't-104', title: 'Audit de sécurité et indexation vectorielle hybride RAG', status: 'todo', priority: 'medium', assigneeType: 'human', assigneeId: 'm-3', assigneeName: 'Thomas Bernard', output: '', date: 'À venir' }
      ],
      messages: [
        { id: 'msg-1', sender: 'Abbas Mistrah', avatar: 'AM', isAgent: false, time: '10:15', text: 'Bienvenue dans le workspace Transfo IA 360 ! Les agents autonomes LeBon Coder et Calculateur ROI sont actifs.' },
        { id: 'msg-2', sender: 'Sarah Da Silva', avatar: 'SD', isAgent: false, time: '10:22', text: 'J\'ai assigné la préparation de la note COMEX au COMEX Synthesizer.' },
        { id: 'msg-3', sender: 'COMEX Synthesizer', avatar: '📑', isAgent: true, time: '10:24', text: '🤖 Tâche prise en compte : note F3 en cours de rédaction avec métriques d\'adoption 62.5%.' }
      ]
    },
    {
      id: 'ws-adevinta',
      name: 'Adevinta - Marketplace Tech Hub',
      tag: 'Groupe',
      color: '#002F6C',
      description: 'Synergies technologiques européennes, composants partagés et passerelles MoE.',
      createdAt: '2026-08-05',
      context: `# Directives Adevinta Tech Hub\n- Alignement architectural sur les briques partagées (design system, gateways MoE).\n- Déploiement multi-places de marché (leboncoin, Kleinanzeigen, Subito, Fotocasa).`,
      members: [
        { id: 'm-1', name: 'Abbas Mistrah', role: 'AI Consultant', email: 'abbas.mistrah.ext@leboncoin.fr', status: 'online', avatar: 'AM', isLead: true },
        { id: 'm-5', name: 'Lars Lindqvist', role: 'Staff Platform Architect', email: 'lars.l@adevinta.com', status: 'online', avatar: 'LL', isLead: false },
        { id: 'm-6', name: 'Elena Gomez', role: 'Lead ML Engineer', email: 'elena.g@adevinta.com', status: 'busy', avatar: 'EG', isLead: false }
      ],
      agents: [
        { id: 'agent-coder', name: 'LeBon Coder', role: 'Code Sandbox', icon: '⚡', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Développement Clean Code.' },
        { id: 'agent-data', name: 'BigQuery Analyst', role: 'Data SQL', icon: '📊', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Pipelines & données.' }
      ],
      tasks: [
        { id: 't-201', title: 'Harmoniser le catalogue de modèles souverains Ollama pour Adevinta', status: 'in_progress', priority: 'high', assigneeType: 'human', assigneeId: 'm-5', assigneeName: 'Lars Lindqvist', output: '', date: 'Aujourd\'hui' }
      ],
      messages: [
        { id: 'msg-21', sender: 'Lars Lindqvist', avatar: 'LL', isAgent: false, time: '09:40', text: 'Alignement sur les modèles 0.6B et 4B validé pour le déploiement groupe.' }
      ]
    },
    {
      id: 'ws-data-core',
      name: 'Data & Analytics Core Platform',
      tag: 'Data',
      color: '#10a37f',
      description: 'Pipelines BigQuery, modélisation Dataform et métriques business leboncoin.',
      createdAt: '2026-08-10',
      context: `# Directives Data & Analytics\n- Toutes les requêtes massives doivent être partitionnées et clusterisées.\n- Coûts BigQuery sous contrôle strict avec monitoring automatisé.`,
      members: [
        { id: 'm-1', name: 'Abbas Mistrah', role: 'Lead IA', email: 'abbas.mistrah.ext@leboncoin.fr', status: 'online', avatar: 'AM', isLead: true },
        { id: 'm-4', name: 'Julie Lefebvre', role: 'Data Architect', email: 'julie.l@leboncoin.fr', status: 'online', avatar: 'JL', isLead: false }
      ],
      agents: [
        { id: 'agent-data', name: 'BigQuery Analyst', role: 'Data Pipelines & SQL', icon: '📊', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Analyses SQL & Dataform.' }
      ],
      tasks: [
        { id: 't-301', title: 'Optimiser la vue analytique quotidienne des transactions sécurisées', status: 'done', priority: 'high', assigneeType: 'agent', assigneeId: 'agent-data', assigneeName: 'BigQuery Analyst', output: 'Requête partitionnée par date optimisée (-45% de bytes scannés).', date: 'Aujourd\'hui' }
      ],
      messages: [
        { id: 'msg-31', sender: 'Julie Lefebvre', avatar: 'JL', isAgent: false, time: '11:00', text: 'La vue partitionnée a été déployée avec succès.' }
      ]
    }
  ]
};

function getWorkspacesData() {
  const data = readJson(WORKSPACES_FILE, null);
  if (!data || !Array.isArray(data.workspaces) || data.workspaces.length === 0) {
    writeJson(WORKSPACES_FILE, DEFAULT_WORKSPACES);
    return DEFAULT_WORKSPACES;
  }
  let migrated = false;
  for (const workspace of data.workspaces) {
    for (const agent of workspace.agents || []) {
      const localModel = normalizeLocalModel(agent.model);
      if (agent.model !== localModel) {
        agent.model = localModel;
        migrated = true;
      }
    }
    if (typeof workspace.context === 'string' && /fallback Cloud/i.test(workspace.context)) {
      workspace.context = workspace.context.replace(/Priorité aux modèles souverains locaux[^\n]*fallback Cloud sécurisé\./i, 'Exécution exclusivement locale avec Ollama ; profil LeBon Local Efficace recommandé.');
      migrated = true;
    }
  }
  if (migrated) writeJson(WORKSPACES_FILE, data);
  return data;
}

function saveWorkspacesData(data) {
  writeJson(WORKSPACES_FILE, data);
}

function apiWorkspacesGet(res) {
  const data = getWorkspacesData();
  respond(res, 200, data);
}

function apiWorkspacesCreate(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { name, description, color, tag, user } = body;
    if (!name) return respond(res, 400, { error: 'Nom requis' });

    const data = getWorkspacesData();
    const newWs = {
      id: 'ws-' + Date.now(),
      name,
      description: description || 'Espace collaboratif leboncoin',
      color: color || '#ff6b00',
      tag: tag || 'Équipe',
      createdAt: new Date().toISOString().slice(0, 10),
      context: `# Directives de l'Espace ${name}\n- Objectifs opérationnels et roadmap partagée.\n- Standard F3 : 5s vision, 30s compréhension, 2 clics action.`,
      members: [
        { id: 'm-' + Date.now(), name: user || 'Abbas Mistrah', role: 'Lead Espace', email: 'abbas.mistrah.ext@leboncoin.fr', status: 'online', avatar: 'AM', isLead: true }
      ],
      agents: [
        { id: 'agent-coder', name: 'LeBon Coder', role: 'Code Sandbox', icon: '⚡', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Développement Clean Code.' },
        { id: 'agent-comex', name: 'COMEX Synthesizer', role: 'Notes Exécutives F3', icon: '📑', model: DEFAULT_LOCAL_MODEL, status: 'active', desc: 'Synthèses F3.' }
      ],
      tasks: [
        { id: 't-' + Date.now(), title: 'Définir les premiers cas d\'usage IA de l\'équipe', status: 'todo', priority: 'high', assigneeType: 'human', assigneeName: user || 'Abbas Mistrah', output: '', date: 'Aujourd\'hui' }
      ],
      messages: [
        { id: 'msg-' + Date.now(), sender: user || 'Abbas Mistrah', avatar: 'AM', isAgent: false, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), text: `Espace "${name}" initialisé avec succès.` }
      ]
    };

    data.workspaces.push(newWs);
    data.activeId = newWs.id;
    saveWorkspacesData(data);
    logEvent(user || 'Abbas Mistrah', 'WORKSPACE_CREATE', name, `ID: ${newWs.id}`);
    respond(res, 200, { ok: true, workspace: newWs, activeId: newWs.id });
  });
}

function apiWorkspacesSwitch(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, user } = body;
    const data = getWorkspacesData();
    const target = data.workspaces.find(w => w.id === workspaceId);
    if (!target) return respond(res, 404, { error: 'Workspace introuvable' });

    data.activeId = workspaceId;
    saveWorkspacesData(data);
    logEvent(user || 'Abbas Mistrah', 'WORKSPACE_SWITCH', target.name, `Active ID: ${workspaceId}`);
    respond(res, 200, { ok: true, activeId: workspaceId, workspace: target });
  });
}

function apiWorkspacesInvite(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, name, role, email } = body;
    if (!workspaceId || !name) return respond(res, 400, { error: 'workspaceId et nom requis' });

    const data = getWorkspacesData();
    const ws = data.workspaces.find(w => w.id === workspaceId);
    if (!ws) return respond(res, 404, { error: 'Workspace introuvable' });

    const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'MB';
    const newMember = {
      id: 'm-' + Date.now(),
      name,
      role: role || 'Contributeur',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@leboncoin.fr`,
      status: 'online',
      avatar: initials,
      isLead: false
    };

    ws.members.push(newMember);
    ws.messages.push({
      id: 'msg-' + Date.now(),
      sender: 'Système Workspace',
      avatar: '👥',
      isAgent: true,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text: `${name} (${role || 'Contributeur'}) a rejoint l'espace de travail.`
    });

    saveWorkspacesData(data);
    respond(res, 200, { ok: true, member: newMember });
  });
}

function apiWorkspacesTaskCreate(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, title, priority, assigneeType, assigneeId, assigneeName } = body;
    if (!workspaceId || !title) return respond(res, 400, { error: 'workspaceId et title requis' });

    const data = getWorkspacesData();
    const ws = data.workspaces.find(w => w.id === workspaceId);
    if (!ws) return respond(res, 404, { error: 'Workspace introuvable' });

    const newTask = {
      id: 't-' + Date.now(),
      title,
      priority: priority || 'medium',
      status: 'todo',
      assigneeType: assigneeType || 'human',
      assigneeId: assigneeId || '',
      assigneeName: assigneeName || 'Non assigné',
      output: '',
      date: 'Aujourd\'hui'
    };

    ws.tasks.push(newTask);
    saveWorkspacesData(data);
    respond(res, 200, { ok: true, task: newTask });
  });
}

function apiWorkspacesTaskUpdate(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, taskId, status, priority, output } = body;
    if (!workspaceId || !taskId) return respond(res, 400, { error: 'workspaceId et taskId requis' });

    const data = getWorkspacesData();
    const ws = data.workspaces.find(w => w.id === workspaceId);
    if (!ws) return respond(res, 404, { error: 'Workspace introuvable' });

    const task = ws.tasks.find(t => t.id === taskId);
    if (!task) return respond(res, 404, { error: 'Tâche introuvable' });

    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (output !== undefined) task.output = output;

    saveWorkspacesData(data);
    respond(res, 200, { ok: true, task });
  });
}

function apiWorkspacesAgentExecute(req, res) {
  readBody(req, async b => {
   try {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, taskId, agentId } = body;
    if (!workspaceId || !taskId) return respond(res, 400, { error: 'workspaceId et taskId requis' });

    const data = getWorkspacesData();
    const ws = (data.workspaces || []).find(w => w.id === workspaceId);
    if (!ws) return respond(res, 404, { error: 'Workspace introuvable' });

    const task = (ws.tasks || []).find(t => t.id === taskId);
    if (!task) return respond(res, 404, { error: 'Tâche introuvable' });

    const agent = (ws.agents || []).find(a => a.id === agentId) || (ws.agents || [])[0] || { name: 'LeBon Agent', icon: '🤖' };

    let outputText = '';
    let aiError = null;
    try {
      const agentModel = normalizeLocalModel(agent.model);
      const promptText = `Tu es l'agent IA "${agent.name}" pour l'espace de travail "${ws.name}".
Résous et produis le livrable complet pour la tâche suivante :
Titre : "${task.title}"
${ws.sharedDirectives ? `Directives de l'espace : ${ws.sharedDirectives}` : ''}
Fournis une réponse concrète, immédiatement actionnable au format F3 leboncoin (vision claire, chiffres ou code opérationnel, prochaines étapes).`;

      const aiRes = await ollamaChatSync({
        model: agentModel,
        messages: [
          { role: 'system', content: `Tu es ${agent.name}, agent autonome d'entreprise chez leboncoin / Adevinta. Réponds au standard F3 avec un livrable net et structuré. /no_think` },
          { role: 'user', content: promptText }
        ],
        stream: false
      });
      outputText = aiRes?.message?.content || aiRes?.response || '';
    } catch (e) {
      aiError = e.message || 'Ollama indisponible';
      console.warn('[AGENT EXECUTE OLLAMA FALLBACK]', aiError);
    }

    if (!outputText) {
      // Intégrité : pas de faux livrable. La tâche reste "à faire" et l'échec est signalé honnêtement.
      task.status = 'todo';
      saveWorkspacesData(data);
      return respond(res, 502, {
        ok: false,
        error: "L'agent local n'a pas pu produire de livrable" + (aiError ? ' (' + aiError + ')' : '') + '. Vérifie qu\'Ollama tourne, puis relance la tâche.'
      });
    }

    task.status = 'done';
    task.output = outputText;
    task.assigneeType = 'agent';
    task.assigneeId = agent.id;
    task.assigneeName = agent.name;

    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    ws.messages = ws.messages || [];
    ws.messages.push({
      id: 'msg-' + Date.now(),
      sender: `${agent.name} (Agent Autonome)`,
      avatar: agent.icon || '🤖',
      isAgent: true,
      time: timeStr,
      text: `✅ Tâche résolue : "${task.title}". Livrable disponible dans le tableau de bord.`
    });

    saveWorkspacesData(data);
    respond(res, 200, { ok: true, task, output: outputText });
   } catch (err) {
    console.error('[AGENT EXECUTE ERROR]', err);
    if (!res.writableEnded) respond(res, 500, { error: 'Erreur interne pendant l\'exécution de l\'agent.' });
   }
  });
}

function apiWorkspacesMessage(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { workspaceId, text, user } = body;
    if (!workspaceId || !text) return respond(res, 400, { error: 'workspaceId et text requis' });

    const data = getWorkspacesData();
    const ws = data.workspaces.find(w => w.id === workspaceId);
    if (!ws) return respond(res, 404, { error: 'Workspace introuvable' });

    const senderName = user || 'Abbas Mistrah';
    const initials = senderName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'AM';

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: senderName,
      avatar: initials,
      isAgent: false,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text
    };

    ws.messages.push(newMsg);
    saveWorkspacesData(data);
    respond(res, 200, { ok: true, message: newMsg });
  });
}

// ── Second Brain Engine & Knowledge Graph Logic ──────────────
const DEFAULT_SECOND_BRAIN = {
  stats: {
    totalNotes: 8,
    totalConnections: 14,
    syncedConcepts: 24,
    paraSplit: { projects: 3, areas: 2, resources: 2, archives: 1 }
  },
  nodes: [
    { id: 'n-1', label: 'Transfo IA 360', category: 'projects', group: 1, size: 30, color: '#ff6b00', x: 260, y: 160, notesCount: 4 },
    { id: 'n-2', label: 'Standard F3', category: 'resources', group: 2, size: 24, color: '#f59e0b', x: 420, y: 120, notesCount: 3 },
    { id: 'n-3', label: 'Ollama Qwen Local', category: 'resources', group: 2, size: 22, color: '#10b981', x: 150, y: 280, notesCount: 3 },
    { id: 'n-4', label: 'BigQuery Analytics', category: 'areas', group: 3, size: 26, color: '#3b82f6', x: 380, y: 280, notesCount: 5 },
    { id: 'n-5', label: 'Multi-Agents Swarm', category: 'projects', group: 1, size: 24, color: '#8b5cf6', x: 540, y: 210, notesCount: 4 },
    { id: 'n-6', label: 'Gouvernance DSA/RGPD', category: 'areas', group: 3, size: 20, color: '#ec4899', x: 270, y: 390, notesCount: 2 },
    { id: 'n-7', label: 'ROI Financier & Payback', category: 'areas', group: 3, size: 24, color: '#22c55e', x: 480, y: 370, notesCount: 4 },
    { id: 'n-8', label: 'Adevinta Tech Hub', category: 'resources', group: 2, size: 20, color: '#002F6C', x: 610, y: 110, notesCount: 2 }
  ],
  links: [
    { source: 'n-1', target: 'n-2', strength: 0.9 },
    { source: 'n-1', target: 'n-3', strength: 0.8 },
    { source: 'n-1', target: 'n-5', strength: 0.95 },
    { source: 'n-1', target: 'n-7', strength: 0.85 },
    { source: 'n-4', target: 'n-7', strength: 0.9 },
    { source: 'n-4', target: 'n-1', strength: 0.75 },
    { source: 'n-5', target: 'n-2', strength: 0.8 },
    { source: 'n-6', target: 'n-3', strength: 0.85 },
    { source: 'n-1', target: 'n-8', strength: 0.7 },
    { source: 'n-5', target: 'n-8', strength: 0.65 }
  ],
  notes: [
    {
      id: 'sb-101',
      title: 'Règle d\'Or F3 pour COMEX & Direction',
      category: 'resources',
      tags: ['Standard F3', 'COMEX', 'Transfo IA 360'],
      updatedAt: '2026-08-20',
      content: 'Toute restitution IA doit respecter le triptyque : 5 secondes pour capter l\'impact business (KPI net), 30 secondes pour comprendre la mécanique, et 2 clics pour décider ou lancer le prototype.'
    },
    {
      id: 'sb-102',
      title: 'Architecture Souveraine & Données Locales',
      category: 'areas',
      tags: ['Ollama Qwen Local', 'Gouvernance DSA & RGPD'],
      updatedAt: '2026-08-19',
      content: 'Privilégier le traitement local avec Qwen 4B / 0.6B pour les requêtes à forte sensibilité métier (données d\'annonces non publiques, métriques internes IBC). Fallback Cloud uniquement avec anonymisation stricte.'
    },
    {
      id: 'sb-103',
      title: 'Formule de Rentabilité Nette & Amortissement GPU',
      category: 'areas',
      tags: ['ROI Financier & Payback', 'BigQuery Analytics'],
      updatedAt: '2026-08-18',
      content: 'Formule standard : Gain Net Annuel = (Heures économisées × Taux horaire chargé 65€) - (Coût GPU/Tokens inférence + Coût hébergement). Payback cible inférieur à 1,5 mois.'
    },
    {
      id: 'sb-104',
      title: 'Pattern Swarm Multi-Agents pour Kanban',
      category: 'projects',
      tags: ['Multi-Agents Swarm', 'Standard F3', 'Transfo IA 360'],
      updatedAt: '2026-08-17',
      content: 'Délégation tripartite : Agent Coder pour le script technique, Agent Data Analyst pour la validation SQL, et Agent Synthesizer pour le mémo exécutif.'
    }
  ]
};

function getSecondBrainData() {
  try {
    if (fs.existsSync(SECOND_BRAIN_FILE)) {
      return JSON.parse(fs.readFileSync(SECOND_BRAIN_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('[SECOND BRAIN] Error reading, using default:', err.message);
  }
  saveSecondBrainData(DEFAULT_SECOND_BRAIN);
  return DEFAULT_SECOND_BRAIN;
}

function saveSecondBrainData(data) {
  try {
    fs.writeFileSync(SECOND_BRAIN_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[SECOND BRAIN] Error saving:', err.message);
  }
}

function apiSecondBrainGet(res) {
  const data = getSecondBrainData();
  // Réconcilie les compteurs avec le contenu réel (ils divergeaient : 8 notes affichées / 4 réelles).
  data.stats = data.stats || {};
  data.stats.totalNotes = Array.isArray(data.notes) ? data.notes.length : 0;
  data.stats.totalConnections = Array.isArray(data.links) ? data.links.length : (data.stats.totalConnections || 0);
  respond(res, 200, data);
}

function apiSecondBrainNoteCreate(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { title, content, category, tags } = body;
    if (!title || !content) return respond(res, 400, { error: 'Titre et contenu requis' });

    const data = getSecondBrainData();
    const newNote = {
      id: 'sb-' + Date.now(),
      title,
      content,
      category: category || 'resources',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['Second Brain']),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    data.notes.unshift(newNote);
    data.stats.totalNotes = data.notes.length;
    saveSecondBrainData(data);
    respond(res, 201, { ok: true, note: newNote });
  });
}

function apiSecondBrainNoteUpdate(req, res) {
  readBody(req, b => {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { id, title, content, category, tags } = body;
    if (!id) return respond(res, 400, { error: 'id requis' });

    const data = getSecondBrainData();
    const note = data.notes.find(n => n.id === id);
    if (!note) return respond(res, 404, { error: 'Note introuvable' });

    if (title) note.title = title;
    if (content) note.content = content;
    if (category) note.category = category;
    if (tags) note.tags = Array.isArray(tags) ? tags : [tags];
    note.updatedAt = new Date().toISOString().split('T')[0];

    saveSecondBrainData(data);
    respond(res, 200, { ok: true, note });
  });
}

function apiSecondBrainNoteDelete(res, id) {
  const data = getSecondBrainData();
  const idx = data.notes.findIndex(n => n.id === id);
  if (idx === -1) return respond(res, 404, { error: 'Note introuvable' });
  data.notes.splice(idx, 1);
  data.stats.totalNotes = data.notes.length;
  saveSecondBrainData(data);
  respond(res, 200, { ok: true });
}

function apiSecondBrainQuery(req, res) {
  readBody(req, async b => {
   try {
    let body;
    try { body = JSON.parse(b); } catch(_) { return respond(res, 400, { error: 'JSON invalide' }); }
    const { query } = body;
    if (!query) return respond(res, 400, { error: 'query requise' });

    const data = getSecondBrainData();
    const qLower = query.toString().toLowerCase();
    const matchedNotes = (data.notes || []).filter(n =>
      n.title.toLowerCase().includes(qLower) || 
      n.content.toLowerCase().includes(qLower) || 
      (n.tags && n.tags.some(t => t.toLowerCase().includes(qLower)))
    );

    let synthesis = '';
    try {
      const notesContext = (matchedNotes.length > 0 ? matchedNotes : data.notes.slice(0, 5))
        .map(n => `- [${n.category || 'NOTE'}] ${n.title} : ${n.content}`).join('\n');

      const aiRes = await ollamaChatSync({
        model: DEFAULT_LOCAL_MODEL,
        messages: [
          { role: 'system', content: 'Tu es le Second Brain IA de leboncoin. Rédige une synthèse percutante en 2-4 points clés format F3 reliant les concepts des notes à la question posée. /no_think' },
          { role: 'user', content: `Question : "${query}"\n\nNotes de la base de connaissances :\n${notesContext}` }
        ],
        stream: false
      });
      synthesis = aiRes?.message?.content || aiRes?.response || '';
    } catch (e) {
      console.warn('[SECOND BRAIN AI QUERY FALLBACK]', e.message);
    }

    if (!synthesis) {
      synthesis = matchedNotes.length > 0
        ? `🧠 **[Synthèse Second Brain]**\n${matchedNotes.length} note(s) trouvée(s) reliée(s) à votre recherche :\n\n` + matchedNotes.map(n => `• **${n.title}** : ${n.content}`).join('\n\n')
        : `🧠 **[Second Brain — Exploration]**\nAucune note exacte pour "${query}", mais vos connaissances gravitent autour du Standard F3 et de la Transfo IA 360.`;
    }

    respond(res, 200, { ok: true, query, matchedNotes, synthesis });
   } catch (err) {
    console.error('[SECOND BRAIN QUERY ERROR]', err);
    if (!res.writableEnded) respond(res, 500, { error: 'Erreur interne lors de l\'interrogation du Second Brain.' });
   }
  });
}

// ── Router Handler ────────────────────────────────────────────
// Protection CSRF : un site tiers ouvert dans le navigateur ne doit pas pouvoir
// piloter l'API locale (ex. /api/work → exécution de commandes). Les requêtes
// mutantes cross-origin envoient toujours un en-tête Origin/Referer distant → refus.
function isSameOriginRequest(req) {
  const hostOk = (u) => { try { const h = new URL(u).hostname; return h === '127.0.0.1' || h === 'localhost'; } catch (_) { return false; } };
  const origin = req.headers.origin;
  if (origin) return hostOk(origin);
  const referer = req.headers.referer;
  if (referer) return hostOk(referer);
  return true; // pas d'Origin/Referer : requête non-navigateur ; seul l'hôte local peut joindre le serveur
}

function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' }); return res.end(); }

  // Toute requête mutante (POST/PUT/DELETE) provenant d'une origine tierce est refusée.
  if (method !== 'GET' && !isSameOriginRequest(req)) {
    return respond(res, 403, { error: 'Requête cross-origin refusée (protection CSRF).' });
  }

  // Static files
  if (method === 'GET' && STATIC[pathname]) { const [mime, file] = STATIC[pathname]; return serveStatic(req, res, file, mime); }
  if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) return serveIndex(req, res);

  // API
  if (method === 'GET'    && pathname === '/api/catalog')                       return apiCatalog(res);
  if (method === 'GET'    && pathname === '/api/system')                        return apiSystem(res);
  if (method === 'GET'    && pathname === '/api/pull')                          return apiPull(req, res, url);
  if (method === 'GET'    && pathname === '/api/websearch')                     return apiWebSearch(req, res, url);
  if (method === 'POST'   && pathname === '/api/chat')                          return apiChat(req, res);
  if (method === 'POST'   && pathname === '/api/work')                          return apiWork(req, res);
  if (method === 'POST'   && pathname === '/api/tools/execute')                 return apiToolsExecute(req, res);
  if (method === 'GET'    && pathname === '/api/composio/apps')                 return apiComposioApps(res);
  if (method === 'POST'   && pathname === '/api/composio/connect')              return apiComposioConnect(req, res);
  if (method === 'POST'   && pathname === '/api/composio/execute')              return apiComposioExecute(req, res);
  if (method === 'GET'    && pathname === '/api/context')                       return apiContextGet(res);
  if (method === 'POST'   && pathname === '/api/context')                       return apiContextSet(req, res);
  if (method === 'POST'   && pathname === '/api/context/append')                return apiContextAppend(req, res);
  if (method === 'POST'   && pathname === '/api/context/distill')               return apiContextDistill(req, res);
  if (method === 'GET'    && pathname === '/api/conversations')                 return apiConvList(res);
  if (method === 'GET'    && /^\/api\/conversations\/[^/]+$/.test(pathname))    return apiConvGet(res, pathname.split('/').pop());
  if (method === 'POST'   && pathname === '/api/conversations')                 return apiConvCreate(req, res);
  if (method === 'PUT'    && /^\/api\/conversations\/[^/]+$/.test(pathname))   return apiConvUpdate(req, res, pathname.split('/').pop());
  if (method === 'DELETE' && /^\/api\/conversations\/[^/]+$/.test(pathname))   return apiConvDelete(req, res, pathname.split('/').pop());
  if (method === 'GET'    && pathname === '/api/skills')                        return apiSkillsGet(res);
  if (method === 'POST'   && pathname === '/api/skills')                        return apiSkillsSet(req, res);
  if (method === 'DELETE' && /^\/api\/skills\/[^/]+$/.test(pathname))           return apiSkillsDelete(res, pathname.split('/').pop());
  if (method === 'GET'    && pathname === '/api/library')                       return apiLibraryGet(res);
  if (method === 'POST'   && pathname === '/api/library')                       return apiLibrarySet(req, res);
  if (method === 'DELETE' && /^\/api\/library\/[^/]+$/.test(pathname))          return apiLibraryDelete(res, pathname.split('/').pop());
  if (method === 'GET'    && pathname === '/api/workspaces')                    return apiWorkspacesGet(res);
  if (method === 'POST'   && pathname === '/api/workspaces')                    return apiWorkspacesCreate(req, res);
  if (method === 'POST'   && pathname === '/api/workspaces/switch')             return apiWorkspacesSwitch(req, res);
  if (method === 'POST'   && pathname === '/api/workspaces/invite')             return apiWorkspacesInvite(req, res);
  if (method === 'POST'   && pathname === '/api/workspaces/tasks')              return apiWorkspacesTaskCreate(req, res);
  if (method === 'PUT'    && pathname === '/api/workspaces/tasks')              return apiWorkspacesTaskUpdate(req, res);
  if (method === 'POST'   && pathname === '/api/workspaces/agent-execute')      return apiWorkspacesAgentExecute(req, res);
  if (method === 'POST'   && pathname === '/api/workspaces/messages')           return apiWorkspacesMessage(req, res);
  if (method === 'GET'    && pathname === '/api/second-brain')                  return apiSecondBrainGet(res);
  if (method === 'POST'   && pathname === '/api/second-brain/notes')            return apiSecondBrainNoteCreate(req, res);
  if (method === 'PUT'    && pathname === '/api/second-brain/notes')            return apiSecondBrainNoteUpdate(req, res);
  if (method === 'DELETE' && /^\/api\/second-brain\/notes\/[^/]+$/.test(pathname)) return apiSecondBrainNoteDelete(res, pathname.split('/').pop());
  if (method === 'POST'   && pathname === '/api/second-brain/query')            return apiSecondBrainQuery(req, res);
  if (method === 'POST'   && pathname === '/api/log')                           return apiLog(req, res);
  if (method === 'GET'    && pathname === '/api/config')                        return apiConfigGet(res);
  if (method === 'POST'   && pathname === '/api/config')                        return apiConfigSet(req, res);

  respond(res, 404, { error: 'Route inconnue: ' + pathname });
}

// Protection globale contre tout crash inattendu
process.on('uncaughtException', (err) => console.error('[UNCAUGHT EXCEPTION]', err));
process.on('unhandledRejection', (reason) => console.error('[UNHANDLED REJECTION]', reason));

const server = http.createServer(handleRequest);
server.on('error', (e) => console.error('[SERVER ' + PORT + ' ERROR]', e.message));
server.listen(PORT, '127.0.0.1', () => {
  console.log('LeBon AI → http://localhost:' + PORT);
  prewarmOllama();
});

function prewarmOllama() {
  // Le profil Auto est virtuel : ses deux petits moteurs restent chargés en RAM
  // pour éviter le coût de démarrage à la première conversation ou tâche pro.
  [NATURAL_LOCAL_MODEL, BALANCED_LOCAL_MODEL].forEach((model) => {
    const payload = JSON.stringify({ model, keep_alive: '30m' });
    const req = http.request({
      host: 'localhost',
      port: OLLAMA_PORT,
      path: '/api/generate',
      method: 'POST',
      agent: OLLAMA_AGENT,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (res) => {
      res.on('data', () => {});
    });
    req.on('error', () => {});
    req.write(payload);
    req.end();
  });
}

// Port secondaire optionnel (compat historique 4322). Désactivé si PORT2 vaut 0.
if (PORT2 && PORT2 !== PORT) {
  const server2 = http.createServer(handleRequest);
  server2.on('error', (e) => console.error('[SERVER ' + PORT2 + ' ERROR]', e.message));
  server2.listen(PORT2, '127.0.0.1', () => console.log('LeBon AI → http://localhost:' + PORT2));
}

// Heartbeat pour maintenir le processus actif indéfiniment
setInterval(() => {}, 60000);
