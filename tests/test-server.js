// Run: node --test tests/test-server.js (serveur lancé sur 4321, ou TEST_PORT=xxxx)
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const TEST_PORT = Number(process.env.TEST_PORT) || 4321;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const raw = body === undefined ? '' : (typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request({
      host: '127.0.0.1', port: TEST_PORT, path, method,
      headers: raw ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(raw) } : {}
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: data }));
    });
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

function json(response) { return JSON.parse(response.text); }

function sseContent(response) {
  return response.text
    .split(/\r?\n/)
    .filter(line => line.startsWith('data: ') && line !== 'data: [DONE]')
    .map(line => JSON.parse(line.slice(6)).content || '')
    .join('');
}

test('page d’accueil servie avec en-têtes de sécurité', async () => {
  const res = await request('GET', '/');
  assert.equal(res.status, 200);
  assert.match(res.text, /<!DOCTYPE html>/i);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'DENY');
  assert.equal(res.headers['access-control-allow-origin'], undefined);
  assert.match(res.text, /id="topVoiceChip"/);
  assert.match(res.text, /id="topRoiChip"/);
  assert.match(res.text, /id="topCertChip"/);
});

test('salutations et identité ont un ton naturel et personnel', async () => {
  const salut = await request('POST', '/api/chat', {
    model: 'lebon-ai:auto',
    messages: [{ role: 'user', content: 'salut' }],
    user: 'Abbas Mistrah'
  });
  assert.equal(salut.status, 200);
  assert.match(sseContent(salut), /Salut Abbas/);
  assert.doesNotMatch(sseContent(salut), /standard F3|je suis là pour aider/i);

  const identity = await request('POST', '/api/chat', {
    model: 'lebon-ai:auto',
    messages: [{ role: 'user', content: "t'es qui ?" }],
    user: 'Abbas Mistrah'
  });
  assert.equal(identity.status, 200);
  assert.match(sseContent(identity), /LeBon AI/);
  assert.match(sseContent(identity), /copilote IA local/);

  const difficultDay = await request('POST', '/api/chat', {
    model: 'lebon-ai:auto',
    messages: [{ role: 'user', content: "Salut, j'ai eu une journée vraiment difficile et j'ai besoin de souffler." }],
    user: 'Abbas Mistrah'
  });
  assert.equal(difficultDay.status, 200);
  assert.match(sseContent(difficultDay), /journée lourde|le plus vidé/i);
  assert.doesNotMatch(sseContent(difficultDay), /je suis là pour aider|comment puis-je/i);

  const boldIdea = await request('POST', '/api/chat', {
    model: 'lebon-ai:auto',
    messages: [{ role: 'user', content: "J'ai une idée complètement folle, ça te dit de l'entendre ?" }],
    user: 'Abbas Mistrah'
  });
  assert.equal(boldIdea.status, 200);
  assert.match(sseContent(boldIdea), /Balance-la/);
});

test('télémétrie système fondée sur un état réel', async () => {
  const res = await request('GET', '/api/system');
  const body = json(res);
  assert.equal(res.status, 200);
  assert.equal(typeof body.ollama, 'boolean');
  assert.equal(typeof body.ram.pct, 'number');
  assert.ok(body.ram.total > 0);
});

test('catalogue expose uniquement des modèles locaux', async () => {
  const res = await request('GET', '/api/catalog');
  const body = json(res);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.models));
  assert.ok(body.models.some(model => model.id === 'lebon-ai:auto' && model.installed === true));
  assert.ok(body.models.some(model => model.id === 'gemma3:1b'));
  assert.ok(body.models.some(model => model.id === 'qwen2.5:3b'));
  assert.ok(body.models.some(model => model.id === 'qwen2.5:1.5b'));
  assert.ok(body.models.some(model => model.id === 'lebon-ai:fast'));
  assert.ok(body.models.some(model => model.id === 'qwen2.5:0.5b'));
  assert.ok(body.models.some(model => model.id === 'qwen3:4b'));
  assert.equal(body.models.some(model => model.id.endsWith(':cloud')), false);
  assert.equal(body.default, 'lebon-ai:auto');
  assert.equal(body.localOnly, true);
  assert.equal(body.cloudModelsAvailable, false);
});

test('téléchargement d’un modèle non local refusé', async () => {
  const res = await request('GET', '/api/pull?model=glm-5.3%3Acloud');
  assert.equal(res.status, 400);
  assert.match(json(res).error, /modèles locaux validés/);
});

test('JSON invalide refusé proprement', async () => {
  const res = await request('POST', '/api/conversations', '{not-json');
  assert.equal(res.status, 400);
  assert.match(json(res).error, /JSON invalide/);
});

test('route inconnue renvoie une erreur explicite', async () => {
  const res = await request('GET', '/api/route-inexistante');
  assert.equal(res.status, 404);
  assert.match(json(res).error, /Route inconnue/);
});

test('connecteur Git inspecte réellement le dépôt local', async () => {
  const res = await request('POST', '/api/tools/execute', { tool: 'git' });
  const body = json(res);
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(typeof body.branch, 'string');
  assert.ok(Array.isArray(body.recentCommits));
});

test('connecteurs externes restent explicitement en prévisualisation', async () => {
  const res = await request('POST', '/api/composio/execute', {
    app: 'slack', action: 'send_message', params: { text: 'test' }
  });
  const body = json(res);
  assert.equal(res.status, 200);
  assert.equal(body.preview, true);
  assert.equal(body.executed, false);
  assert.equal(body.ok, false);
});

test('cycle de vie complet d’une conversation', async () => {
  const created = await request('POST', '/api/conversations', {
    title: 'Test automatique', model: 'glm-5.3:cloud', messages: []
  });
  assert.equal(created.status, 200);
  const conversation = json(created).conversation;
  assert.ok(conversation.id);
  assert.equal(conversation.model, 'lebon-ai:auto');

  try {
    const fetched = await request('GET', `/api/conversations/${conversation.id}`);
    assert.equal(fetched.status, 200);
    assert.equal(json(fetched).conversation.title, 'Test automatique');

    const updated = await request('PUT', `/api/conversations/${conversation.id}`, {
      title: 'Test renommé', messages: [{ role: 'user', content: 'Bonjour' }]
    });
    assert.equal(updated.status, 200);
    assert.equal(json(updated).conversation.messages.length, 1);
  } finally {
    const removed = await request('DELETE', `/api/conversations/${conversation.id}`);
    assert.equal(removed.status, 200);
  }

  const missing = await request('GET', `/api/conversations/${conversation.id}`);
  assert.equal(missing.status, 404);
});

// ── Requête bas niveau avec en-têtes personnalisés + garde-fou anti-blocage ──
function rawRequest(method, path, body, headers, resolveOnHeaders) {
  return new Promise((resolve, reject) => {
    const raw = body === undefined ? '' : (typeof body === 'string' ? body : JSON.stringify(body));
    const base = raw ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(raw) } : {};
    const req = http.request({ host: '127.0.0.1', port: TEST_PORT, path, method, headers: Object.assign(base, headers || {}) }, res => {
      if (resolveOnHeaders) { resolve({ status: res.statusCode }); res.destroy(); return; }
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, text: data }));
    });
    req.setTimeout(9000, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (raw) req.write(raw);
    req.end();
  });
}

test('protection CSRF : requête mutante cross-origin refusée', async () => {
  const r = await rawRequest('POST', '/api/conversations', { title: 'x', messages: [] }, { Origin: 'http://evil.example.com' });
  assert.equal(r.status, 403);
  assert.match(json(r).error || '', /cross-origin|CSRF/i);
});

test('requête same-origin autorisée', async () => {
  const r = await rawRequest('POST', '/api/conversations', { title: 'Origin OK', messages: [] }, { Origin: 'http://127.0.0.1:4321' });
  assert.equal(r.status, 200);
  const id = json(r).conversation && json(r).conversation.id;
  if (id) await request('DELETE', '/api/conversations/' + id);
});

test('messages malformé ne bloque pas /api/chat (en-têtes renvoyés)', async () => {
  // Avant correctif : un messages non-tableau plantait le handler et la requête restait sans réponse.
  const r = await rawRequest('POST', '/api/chat', { model: 'lebon-ai:auto', messages: 'pas-un-tableau', user: 'Test' }, null, true);
  assert.equal(r.status, 200);
});
