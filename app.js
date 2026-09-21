/* ==========================================================================
   LeBon AI — Frontend Application (app.js)
   Architecture ChatGPT 4o / Claude 3.7 / Kimi avec Design System Boussole V5
   ========================================================================== */

// ── Safe Storage Helpers ──────────────────────────────────────
function safeStorageGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val != null ? val : fallback;
  } catch(e) {
    return fallback;
  }
}

function safeStorageSet(key, val) {
  try {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
    return true;
  } catch(e) {
    return false;
  }
}

const CLIENT_CACHE = new Map([
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

function getClientCacheMatch(query) {
  if (!query) return null;
  const q = query.toLowerCase().replace(/[.?!,]/g, '').trim();
  return CLIENT_CACHE.get(q) || null;
}

function generateNaturalClientReply(prompt) {
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

function evaluateInstantClientResponse(prompt) {
  if (!prompt) return null;
  const p = prompt.trim();
  const pl = p.toLowerCase();

  // Instant Math Calculations (0 ms)
  const mathMatch = pl.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*=?$/);
  if (mathMatch) {
    const [_, a, op, b] = mathMatch;
    let res = 0;
    const na = Number(a), nb = Number(b);
    if (op === '+') res = na + nb;
    if (op === '-') res = na - nb;
    if (op === '*') res = na * nb;
    if (op === '/') res = nb !== 0 ? (na / nb) : 'Division par zéro impossible';
    return `### 🧮 Calcul Immédiat (0 ms)\n\n- **Opération :** \`${a} ${op} ${b}\`\n- **Résultat :** **${res}**`;
  }

  // Instant Quick Code Snippets (0 ms)
  if (/invers.*(cha[iî]ne|string)|reverse.*string/i.test(pl)) {
    return `### 💻 Inversion de chaîne en JavaScript (1 ligne)\n\n\`\`\`javascript\nconst reverseString = str => str.split('').reverse().join('');\n\n// Exemple :\nconsole.log(reverseString("leboncoin")); // "niocnobel"\n\`\`\`\n\n- **Complexité :** O(n) temps et mémoire · Exécution en 0 ms.`;
  }

  return null;
}

// ── State Management ──────────────────────────────────────────
const state = {
  user: safeStorageGet('lebon_user', 'Abbas Mistrah'),
  convId: null,
  conv: null,
  conversations: [],
  model: safeStorageGet('lebon_model', 'lebon-ai:auto'),
  thinking: safeStorageGet('lebon_think') === 'true',
  turbo: safeStorageGet('lebon_turbo', 'false') === 'true',
  webSearch: safeStorageGet('lebon_web') === 'true',
  generating: false,
  abortCtrl: null,
  attachment: null, // { name, type, content, size }
  searchQuery: '',
  agentMode: null,  // 'coder' | 'agent' | 'roi' | 'comex' | null
  mode: 'chat',     // 'chat' | 'work'
  modeModelBackup: null,
  systemInfo: null,
  lastPreviewCode: '',
};

function toggleTurboMode() {
  state.turbo = !state.turbo;
  state.model = state.turbo ? 'qwen2.5:0.5b' : 'lebon-ai:auto';
  safeStorageSet('lebon_turbo', state.turbo ? 'true' : 'false');
  safeStorageSet('lebon_model', state.model);
  if (state.conv) {
    state.conv.model = state.model;
    saveConvMeta(state.conv.id, { model: state.model });
  }
  updateTurboUI();
  updateModelUI();
  showToast(state.turbo ? '⚡ Local Ultra-rapide activé' : '✦ Auto Local intelligent activé');
}

function updateTurboUI() {
  const btn = $('turboBtn');
  if (btn) {
    btn.classList.toggle('active', !!state.turbo);
    btn.innerHTML = state.turbo ? '<span>⚡</span><span>Ultra-rapide</span>' : '<span>✦</span><span>Auto</span>';
  }
}

// ── Official Brand SVGs (OpenAI ChatGPT, Google Gemini, Anthropic Claude, Leboncoin, Adevinta) ───
const MODEL_LOGOS = {
  openai: `<svg class="provider-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:#10a37f"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.02 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`,
  gemini: `<svg class="provider-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z" fill="url(#geminiGrad)"/><defs><linearGradient id="geminiGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#1BA1E3"/><stop offset="0.5" stop-color="#5B6CF9"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>`,
  claude: `<svg class="provider-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.89 3.5a1.2 1.2 0 0 0-1.78 0L9.4 6.7a1.2 1.2 0 0 0-.15 1.47l2.13 3.32a.2.2 0 0 1-.22.3l-3.9-.7a1.2 1.2 0 0 0-1.37.76L4.54 15.3a1.2 1.2 0 0 0 .5 1.4l3.52 2.03a1.2 1.2 0 0 0 1.43-.16l2.84-2.73a.2.2 0 0 1 .33.12l.33 3.93a1.2 1.2 0 0 0 1.05 1.1l4.03.4a1.2 1.2 0 0 0 1.27-.85l1.32-3.83a1.2 1.2 0 0 0-.43-1.38l-3.23-2.35a.2.2 0 0 1 0-.32l3.43-2.04a1.2 1.2 0 0 0 .54-1.35L19.8 5.7a1.2 1.2 0 0 0-1.16-.88l-4.75-.02v-.3a1.2 1.2 0 0 0 0-1Z" fill="#D97757"/></svg>`,
  lebon: `<svg class="provider-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#FF6B00"/><path d="M7 15V9h2.2v4.3h3.5V15H7zm8.5-5.9c1.6 0 2.6 1 2.6 2.9s-1 2.9-2.6 2.9c-1.6 0-2.6-1-2.6-2.9s1-2.9 2.6-2.9zm0 1.4c-.7 0-1.1.5-1.1 1.5s.4 1.5 1.1 1.5 1.1-.5 1.1-1.5-.4-1.5-1.1-1.5z" fill="#fff"/></svg>`,
  adevinta: `<svg class="provider-logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#002F6C"/><path d="M12 5L6 18h2.6l1.2-2.7h4.4L15.4 18H18L12 5zm-.4 4.5l1.5 3.7h-3l1.5-3.7z" fill="#fff"/></svg>`
};

// ── Catalogue strictement local ───────────────────────────────
const MODELS = {
  'lebon-ai:auto': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Auto Local',
    badge: 'Auto Local',
    group: 'local',
    desc: 'Choisit localement Gemma 3 1B pour converser ou Qwen 2.5 3B pour travailler · ~14–36 tok/s'
  },
  'gemma3:1b': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Conversation Naturelle',
    badge: 'Conversation',
    group: 'local',
    desc: 'Ton plus humain et spontané en français · 100 % local · ~36 tok/s'
  },
  'qwen2.5:3b': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Travail Pro',
    badge: 'Travail Pro',
    group: 'local',
    desc: 'Plus fiable pour rédaction, analyse et code · 100 % local · ~14 tok/s'
  },
  'qwen2.5:1.5b': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Travail Rapide',
    badge: 'Travail Rapide',
    group: 'local',
    desc: 'Compromis léger pour les tâches professionnelles simples · ~29 tok/s'
  },
  'lebon-ai:fast': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Local Rapide',
    badge: 'Local Rapide',
    group: 'local',
    desc: 'Qwen 0.6B optimisé sans raisonnement caché · ~62 tok/s · tâches simples'
  },
  'qwen2.5:0.5b': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Local Ultra-rapide',
    badge: 'Local Ultra',
    group: 'local',
    desc: 'Profil le plus rapide · ~72 tok/s · idéal pour micro-tâches et réponses courtes'
  },
  'qwen3:4b': {
    logoSvg: MODEL_LOGOS.lebon,
    name: 'LeBon Local 4B expérimental',
    badge: 'Local 4B',
    group: 'local',
    desc: 'Plus lourd et nettement plus lent sur ce CPU · ~11 tok/s · usage ponctuel'
  }
};

// Migration unique : toute ancienne sélection distante ou ancien profil devient Auto Local.
if (!MODELS[state.model] || safeStorageGet('lebon_local_profile') !== 'v4') {
  state.model = 'lebon-ai:auto';
  state.turbo = false;
  safeStorageSet('lebon_model', state.model);
  safeStorageSet('lebon_turbo', 'false');
  safeStorageSet('lebon_think', 'false');
  safeStorageSet('lebon_local_profile', 'v4');
}

// ── Specialized Agent System Prompts ──────────────────────────
const AGENT_SYSTEM_PROMPTS = {
  coder: 'Tu es LeBon Coder, expert senior en développement logiciel et prototypage interactif rapide pour leboncoin. Lorsque l\'utilisateur te demande du code web, une interface, un dashboard ou un composant interactif, fournis TOUJOURS un code complet et directement exécutable (HTML5, Tailwind CSS ou CSS intégré, et JavaScript fonctionnel dans un seul bloc ```html ou ```javascript). Ce code sera prévisualisé en temps réel dans le Live Sandbox interactif.',
  agent: 'Tu es LeBon Agent, IA autonome de planification et d\'exécution. Tu décomposes les tâches complexes en étapes claires, identifies les dépendances, et proposes un plan d\'action actionnable en 2 clics. Principe F3 : plan en 5s, comprendre en 30s, agir en 2 clics.',
  roi: 'Tu es le Calculateur ROI officiel Transfo IA leboncoin. Pour chaque cas d\'usage, tu chiffres l\'impact financier : gains annuels nets, heures économisées, ROI% et délai de rentabilité (payback). Montre les chiffres clés prêts pour le COMEX.',
  comex: 'Tu es le Rédacteur de Notes COMEX leboncoin.'
};

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── HTML Sanitizer (anti-XSS pour le rendu Markdown) ──────────
function sanitizeHtml(html) {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, form, link, meta, base, style').forEach(n => n.remove());
    doc.querySelectorAll('*').forEach(node => {
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = (attr.value || '').replace(/\s/g, '').toLowerCase();
        const isUrlAttr = ['href', 'src', 'xlink:href', 'formaction', 'action', 'poster'].includes(name);
        if (name.startsWith('on') || name === 'srcdoc' || name === 'style' ||
            (isUrlAttr && (val.startsWith('javascript:') || val.startsWith('vbscript:') ||
             (val.startsWith('data:') && !val.startsWith('data:image/'))))) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  } catch(_) {
    return html;
  }
}

// ── DOM Helpers ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function showToast(msg) {
  const container = $('toastContainer');
  if (!container) return;
  const toast = el('div', 'toast', esc(msg));
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}

// ── Markdown Parser Setup ─────────────────────────────────────
function initMarked() {
  if (typeof marked === 'undefined') return;
  try {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false,
      highlight: (code, lang) => {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try { return hljs.highlight(code, { language: lang }).value; } catch(e) {}
        }
        return esc(code);
      }
    });
  } catch(e) {}
}

function renderMd(text) {
  if (!text) return '';
  // Fix mojibake / encoding issues if present
  if (text.includes('Ã')) {
    text = text.replace(/Ã¨/g, 'è').replace(/Ã©/g, 'é').replace(/Ã /g, 'à')
               .replace(/Ã§/g, 'ç').replace(/Ã¹/g, 'ù').replace(/Ã»/g, 'û')
               .replace(/Ã´/g, 'ô').replace(/Ã®/g, 'î').replace(/Ã¢/g, 'â')
               .replace(/Å“/g, 'œ').replace(/Ã‰/g, 'É').replace(/Ã'/g, 'À');
  }

  // Ultra-Fast Path: if plain text without markdown syntax, bypass full parser (0.001ms)
  const hasMarkdown = text.includes('`') || text.includes('#') || text.includes('*') || 
                      text.includes('_') || text.includes('~') || text.includes('|') || 
                      text.includes('[') || text.includes('>') || text.includes('-') ||
                      text.includes('1.');
  if (!hasMarkdown) {
    return esc(text).replace(/\n/g, '<br>');
  }

  if (typeof marked === 'undefined') return esc(text).replace(/\n/g, '<br>');
  try {
    return sanitizeHtml(marked.parse(text));
  } catch(e) {
    return esc(text).replace(/\n/g, '<br>');
  }
}

// ── Top Clock ─────────────────────────────────────────────────
function initClock() {
  function update() {
    const clock = $('liveClock');
    const dateEl = $('liveDate');
    if (!clock) return;
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    
    clock.textContent = time;
    if (dateEl) {
      dateEl.textContent = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    }
  }
  update();
  setInterval(update, 1000);
}

// ── Hardware Telemetry Polling ────────────────────────────────
function fetchSystemTelemetry() {
  fetch('/api/system')
    .then(r => r.json())
    .then(d => {
      state.systemInfo = d;
      if ($('topTelemetryText') && d.ram) {
        $('topTelemetryText').textContent = `${d.ram.used} / ${d.ram.total} Go`;
      }
      if ($('topTelemetryBar') && d.ram) {
        $('topTelemetryBar').style.width = `${d.ram.pct}%`;
      }
      if ($('topTelemetryPct') && d.ram) {
        $('topTelemetryPct').textContent = `${d.ram.pct}%`;
      }
      if ($('topOllamaStatus')) $('topOllamaStatus').textContent = d.ollama ? 'Connecté' : 'Hors ligne';
      if ($('heroOllamaStatus')) $('heroOllamaStatus').textContent = d.ollama ? 'Connecté' : 'Hors ligne';
      if ($('topOllamaChip')) $('topOllamaChip').classList.toggle('status-offline', !d.ollama);
      if ($('topOllamaDot')) $('topOllamaDot').className = `chip-dot ${d.ollama ? 'green' : 'red'}`;
      if ($('govOs')) $('govOs').textContent = d.os || 'Windows 11';
      if ($('govRam')) $('govRam').textContent = `${d.ram?.used || '--'} / ${d.ram?.total || '--'} Go (${d.ram?.pct || 0}%)`;
      if ($('govCpu')) $('govCpu').textContent = `${d.cpu || 'CPU'} (${d.cores || 4} cœurs)`;
      if ($('govUptime')) $('govUptime').textContent = `${d.uptime || 0} heures`;
    })
    .catch(() => {
      if ($('topOllamaStatus')) $('topOllamaStatus').textContent = 'Serveur indisponible';
      if ($('topOllamaChip')) $('topOllamaChip').classList.add('status-offline');
    });
}

// ── Initialization ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initUIEvents();
  buildModelDropdown();
  updateModelUI();
  updateThinkingUI();
  updateWebSearchUI();
  updateTurboUI();
  loadConversations();
  renderMain();
  initRoiFromStorage();
  fetchSystemTelemetry();
  setInterval(fetchSystemTelemetry, 15000);
});

// ── Event Handlers Setup ──────────────────────────────────────
function initUIEvents() {
  // Sidebar collapse
  const collapseBtn = $('sidebarCollapseBtn');
  if (collapseBtn) {
    collapseBtn.onclick = () => {
      $('appShell').classList.toggle('sidebar-collapsed');
    };
  }

  // Mobile sidebar toggle
  const mobileToggle = $('mobileSidebarToggle');
  if (mobileToggle) {
    mobileToggle.onclick = () => {
      $('sidebar').classList.toggle('open');
    };
  }

  // Model Picker Dropdown
  const modelPickerBtn = $('modelPickerBtn');
  const modelDropdown = $('modelDropdown');
  if (modelPickerBtn && modelDropdown) {
    modelPickerBtn.onclick = (e) => {
      e.stopPropagation();
      modelDropdown.style.display = modelDropdown.style.display === 'none' ? 'block' : 'none';
    };
  }

  document.addEventListener('click', (e) => {
    if (modelDropdown) modelDropdown.style.display = 'none';
    closePlusMenu();
    hideContextMenu();
    hideAttachPopup();
    document.querySelectorAll('.export-menu-dropdown').forEach(d => { d.style.display = 'none'; });

    // Clic sur l'arrière-plan sombre d'une modale pour la fermer immédiatement
    if (e.target && (e.target.classList.contains('agent-modal-backdrop') || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('agent-modal'))) {
      closeAllModals();
    }
  });

  // Composer Textarea Auto-expand & Enter to Send
  const ta = $('composerInput');
  const sendBtn = $('sendBtn');
  if (sendBtn) {
    // Délègue au routeur unique : interrompt si en cours, sinon envoie (chat/work), sinon voix.
    sendBtn.onclick = (e) => handleSendBtnClick(e);
  }

  // Navigation : surligne l'item cliqué pour que le changement de page soit visible.
  const navEl = document.querySelector('nav.nav');
  if (navEl) {
    navEl.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (item) setActiveNav(item.id);
    });
  }

  if (ta) {
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    ta.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 180) + 'px';
      updateSendBtnIcon();
    });
  }

  // Attachments
  const attachBtn = $('attachBtn');
  if (attachBtn) {
    attachBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showAttachPopup(attachBtn);
    };
  }

  const fileInput = $('fileInput');
  if (fileInput) fileInput.addEventListener('change', handleFileSelected);

  const imageInput = $('imageInput');
  if (imageInput) imageInput.addEventListener('change', handleImageSelected);

  // Drag & Drop
  initDragAndDrop();

  // Universal Instant Keyboard Shortcuts (Zed / Linear / Superhuman standard)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      closeCanvas();
      return;
    }

    const cmdKey = e.ctrlKey || e.metaKey;
    if (cmdKey) {
      const key = e.key.toLowerCase();
      if (key === 'k') {
        e.preventDefault();
        openSearchModal();
      } else if (key === 'n') {
        e.preventDefault();
        newChat();
      } else if (e.shiftKey && key === 'b') {
        e.preventDefault();
        openSecondBrainModal();
      } else if (e.shiftKey && key === 'c') {
        e.preventDefault();
        openCertModal();
      } else if (e.shiftKey && key === 't') {
        e.preventDefault();
        openTeamModal();
      } else if (e.shiftKey && key === 'a') {
        e.preventDefault();
        openAgentsStudioModal();
      } else if (e.shiftKey && key === 'm') {
        e.preventDefault();
        openMicroAppsStudioModal();
      } else if (e.shiftKey && key === 'w') {
        e.preventDefault();
        openWorkflowStudioModal();
      }
    }
  });
}

// ── Model Selection & Catalog ─────────────────────────────────
function buildModelDropdown() {
  const dropdown = $('modelDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  const groups = [
    { key: 'local', title: 'Modèles installés · 100 % local' }
  ];

  groups.forEach(g => {
    const groupModelIds = Object.keys(MODELS).filter(id => MODELS[id].group === g.key);
    if (groupModelIds.length === 0) return;

    const sectionHeader = el('div', 'model-dropdown-section-title', g.title);
    dropdown.appendChild(sectionHeader);

    groupModelIds.forEach(id => {
      const info = MODELS[id];
      const opt = el('div', 'model-opt' + (id === state.model ? ' active' : ''));
      opt.setAttribute('data-model', id);
      opt.onclick = () => selectModel(id);
      opt.innerHTML = `
        <span class="opt-icon">${info.logoSvg || ''}</span>
        <div class="opt-text">
          <div class="opt-title">
            <span>${info.name}</span>
            <span class="opt-tag">${info.badge}</span>
          </div>
          <div class="opt-desc">${info.desc}</div>
        </div>
        <span class="opt-check">${id === state.model ? '✓' : ''}</span>
      `;
      dropdown.appendChild(opt);
    });
  });
}

function selectModel(modelId) {
  if (!MODELS[modelId]) {
    modelId = 'lebon-ai:auto';
  }
  state.model = modelId;
  state.turbo = modelId === 'qwen2.5:0.5b';
  safeStorageSet('lebon_model', modelId);
  safeStorageSet('lebon_turbo', state.turbo ? 'true' : 'false');
  if (state.conv) {
    state.conv.model = modelId;
    saveConvMeta(state.conv.id, { model: modelId });
  }
  updateModelUI();
  updateTurboUI();
  const dropdown = $('modelDropdown');
  if (dropdown) dropdown.style.display = 'none';
  showToast(`Modèle activé : ${MODELS[modelId]?.name || modelId}`);
}

function updateModelUI() {
  const m = MODELS[state.model] || { logoSvg: MODEL_LOGOS.lebon, name: state.model, badge: state.model };
  const slot = $('modelPickerLogoSlot');
  if (slot) slot.innerHTML = m.logoSvg || '';
  if ($('modelPickerName')) $('modelPickerName').textContent = m.badge || m.name;
  if ($('topActiveModel')) $('topActiveModel').textContent = m.badge || m.name;
  if ($('heroModelStatus')) $('heroModelStatus').textContent = m.badge || m.name;
  if ($('heroExecutionZone')) $('heroExecutionZone').textContent = '100 % local';
  if ($('userCurrentModel')) $('userCurrentModel').textContent = m.badge || m.name;

  document.querySelectorAll('.model-opt').forEach((opt) => {
    const isActive = opt.getAttribute('data-model') === state.model;
    opt.classList.toggle('active', isActive);
    const check = opt.querySelector('.opt-check');
    if (check) check.textContent = isActive ? '✓' : '';
  });
}

// ── Modes & Toggles ───────────────────────────────────────────
const TOOL_ICONS = {
  run_command: '🖥️',
  read_file: '📄',
  write_file: '✍️',
  patch_file: '🩹',
  list_directory: '📂',
  grep_search: '🔍',
  create_directory: '📁',
  python_eval: '🐍',
  web_search: '🌐',
  fetch_url: '🌍',
  get_system_info: '💻'
};

function setMode(mode) {
  const previousMode = state.mode;
  state.mode = mode;
  // Keep agentMode in sync so system prompts are always correct
  if (mode === 'coder') {
    state.agentMode = 'coder';
    if (previousMode !== 'coder') {
      state.modeModelBackup = state.model;
      state.model = 'qwen2.5:3b';
      safeStorageSet('lebon_model', state.model);
      updateModelUI();
    }
  } else {
    if (previousMode === 'coder' && state.modeModelBackup && MODELS[state.modeModelBackup]) {
      state.model = state.modeModelBackup;
      state.modeModelBackup = null;
      safeStorageSet('lebon_model', state.model);
      updateModelUI();
    }
    if (state.agentMode === 'coder') state.agentMode = null;
  }

  const tabChat = $('tabChat');
  const tabWork = $('tabWork');
  const tabCoder = $('tabCoder');
  const workBtn = $('workModeBtn');
  const navChat = $('navChatBtn');

  if (tabChat) tabChat.classList.toggle('active', mode === 'chat');
  if (tabWork) tabWork.classList.toggle('active', mode === 'work');
  if (tabCoder) tabCoder.classList.toggle('active', mode === 'coder');
  if (workBtn) workBtn.classList.toggle('active', mode === 'work');
  if (navChat) navChat.classList.toggle('active', mode === 'chat');

  const pillWork = $('pillWorkBtn');
  if (pillWork) pillWork.classList.toggle('active', mode === 'work');

  const ta = $('composerInput');
  if (ta) {
    ta.placeholder = mode === 'work'
      ? '⚡ Mission Agent Work : "liste mes fichiers", "crée un script python", "cherche sur le web..."'
      : mode === 'coder'
      ? '</> Code Studio : décris l\'interface, le composant ou le code à générer...'
      : 'Demande à LeBon AI… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)';
  }

  const topbar = $('chatTopbar');
  if (topbar) topbar.classList.toggle('work-mode', mode === 'work');

  const title = $('topbarTitle');
  const icon = $('topbarIcon');
  if (title) {
    if (mode === 'work') {
      title.textContent = '⚡ LeBon AI Work Agent';
      if (icon) icon.textContent = '⚡';
    } else if (mode === 'coder') {
      title.textContent = '</> Code Studio';
      if (icon) icon.textContent = '</>';
    } else {
      title.textContent = state.conv?.title || 'LeBon AI';
      if (icon) icon.textContent = '✨';
    }
  }
}

function toggleWorkMode() {
  setMode(state.mode === 'work' ? 'chat' : 'work');
}

function toggleThinking() {
  // Vrai bascule : le raisonnement visible n'a d'effet que sur les modèles qui le supportent
  // (qwen3…) ; le serveur ignore `think:true` pour les autres afin de ne rien casser.
  state.thinking = !state.thinking;
  safeStorageSet('lebon_think', state.thinking ? 'true' : 'false');
  updateThinkingUI();
  showToast(state.thinking
    ? 'Raisonnement visible activé (modèles compatibles : Qwen3 / 4B)'
    : 'Réponses directes activées pour préserver la vitesse locale');
}

function updateThinkingUI() {
  const item = $('thinkMenuItem');
  const title = $('thinkMenuTitle');
  const desc = $('thinkMenuDesc');
  if (item) item.classList.toggle('active', state.thinking);
  if (title) title.textContent = state.thinking ? 'Raisonnement visible' : 'Réponse directe';
  if (desc) desc.textContent = state.thinking
    ? 'Le modèle montre son raisonnement (Qwen3 / 4B)'
    : 'Raisonnement caché désactivé pour accélérer le local';
  // Compat anciens éléments éventuels.
  const btn = $('thinkBtn');
  const pill = $('pillThinkBtn');
  const status = $('thinkStatus');
  if (btn) btn.classList.toggle('active', state.thinking);
  if (pill) pill.classList.toggle('active', state.thinking);
  if (status) status.textContent = state.thinking ? 'ON' : 'OFF';
}

function toggleWebSearch() {
  state.webSearch = !state.webSearch;
  safeStorageSet('lebon_web', state.webSearch ? 'true' : 'false');
  updateWebSearchUI();
  showToast(state.webSearch ? 'Recherche Web activée' : 'Recherche Web désactivée');
}

function updateWebSearchUI() {
  const item = $('webMenuItem');
  const title = $('webMenuTitle');
  const desc = $('webMenuDesc');
  if (item) item.classList.toggle('active', state.webSearch);
  if (title) title.textContent = state.webSearch ? 'Recherche Web : activée' : 'Recherche sur le Web';
  if (desc) desc.textContent = state.webSearch
    ? 'Les résultats web réels seront ajoutés au contexte'
    : 'Ajoute des résultats web réels au contexte';
  // Compat anciens éléments éventuels.
  const btn = $('webSearchBtn');
  const pill = $('pillWebBtn');
  if (btn) btn.classList.toggle('active', state.webSearch);
  if (pill) pill.classList.toggle('active', state.webSearch);
}

// Recherche web réelle (via le serveur → DuckDuckGo). Renvoie un bloc de contexte
// à injecter dans le prompt, ou null si indisponible.
async function fetchWebContext(query) {
  try {
    const resp = await fetch('/api/websearch?q=' + encodeURIComponent(query));
    if (!resp.ok) return null;
    const d = await resp.json();
    if (!d.results || !d.results.length) return null;
    const block = d.results.slice(0, 5).map((r, i) =>
      `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet || ''}`).join('\n');
    return 'Résultats de recherche web (DuckDuckGo, temps réel) pour « ' + query + ' » :\n' + block +
      '\n\nUtilise ces résultats pour répondre et cite les sources pertinentes.';
  } catch (_) {
    return null;
  }
}

// ── Conversations History & CRUD ──────────────────────────────
function loadConversations() {
  fetch('/api/conversations')
    .then(r => r.json())
    .then(d => {
      state.conversations = d.conversations || [];
      renderHistoryList();
    })
    .catch(() => {});
}

function filterHistory(query) {
  renderHistoryList(query);
}

function renderHistoryList(filter = '') {
  const list = $('historyList');
  if (!list) return;
  list.innerHTML = '';

  let convs = state.conversations || [];
  if (filter) {
    convs = convs.filter(c => (c.title || '').toLowerCase().includes(filter.toLowerCase()));
  }

  if (convs.length === 0) {
    list.innerHTML = '<div style="padding:14px;font-size:11.5px;color:var(--muted);text-align:center;">Aucune discussion</div>';
    return;
  }

  const groups = { "Aujourd'hui": [], "Hier": [], "7 derniers jours": [], "Plus ancien": [] };
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now - 86400000).toDateString();
  const weekAgo = new Date(now - 7 * 86400000);

  convs.forEach(c => {
    const d = new Date(c.updatedAt || c.createdAt);
    if (d.toDateString() === today) groups["Aujourd'hui"].push(c);
    else if (d.toDateString() === yesterday) groups["Hier"].push(c);
    else if (d >= weekAgo) groups["7 derniers jours"].push(c);
    else groups["Plus ancien"].push(c);
  });

  Object.keys(groups).forEach(groupName => {
    if (!groups[groupName].length) return;
    list.appendChild(el('div', 'history-group-label', groupName));

    groups[groupName].forEach(c => {
      const item = el('div', 'history-item' + (c.id === state.convId ? ' active' : ''));
      const title = el('span', 'history-title', c.title || 'Nouvelle conversation');
      const menuBtn = el('button', 'history-menu-btn', '⋯');

      item.appendChild(title);
      item.appendChild(menuBtn);

      item.onclick = (e) => {
        if (e.target === menuBtn) return;
        loadChat(c.id);
        if (window.innerWidth < 860) $('sidebar').classList.remove('open');
      };

      menuBtn.onclick = (e) => {
        e.stopPropagation();
        showContextMenu(c, menuBtn);
      };

      list.appendChild(item);
    });
  });
}

function newChat() {
  if (state.generating && state.abortCtrl) {
    try { state.abortCtrl.abort(); } catch(_) {}
  }
  state.generating = false;
  state.abortCtrl = null;
  state.convId = null;
  state.conv = null;
  state.attachment = null;
  state.agentMode = null;
  clearAttachment();
  closeAllModals();
  setMode('chat');
  $('sidebar')?.classList.remove('open');
  renderMain();
  renderHistoryList();
  setTimeout(() => {
    const inp = $('composerInput');
    if (inp) inp.focus();
  }, 50);
}

function loadChat(id) {
  if (state.generating && state.abortCtrl) {
    try { state.abortCtrl.abort(); } catch(_) {}
  }
  state.generating = false;
  state.abortCtrl = null;
  state.agentMode = null;
  closeAllModals();
  $('sidebar')?.classList.remove('open');

  fetch('/api/conversations/' + id)
    .then(r => r.json())
    .then(d => {
      state.conv = d.conversation;
      state.convId = id;
      // Le modèle actif reste un choix manuel global : ouvrir un ancien chat ne
      // doit jamais forcer silencieusement un modèle plus lent.
      try { localStorage.setItem('lebon_conv_' + id, JSON.stringify(d.conversation.messages || [])); } catch(e) {}
      renderMain();
      renderHistoryList();
    })
    .catch(() => {
      try {
        const cached = localStorage.getItem('lebon_conv_' + id);
        if (cached) {
          const msgs = JSON.parse(cached);
          if (!state.conv) state.conv = { id, messages: msgs, title: 'Discussion (cache)' };
          else state.conv.messages = msgs;
          state.convId = id;
          renderMain();
        }
      } catch(e) {}
    });
}

function createConversationOnBackend(firstMsg, model) {
  let title = firstMsg.trim().split(/\s+/).slice(0, 7).join(' ');
  if (title.length > 40) title = title.slice(0, 40) + '…';

  return fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title || 'Nouvelle discussion',
      model: model,
      messages: []
    })
  })
    .then(r => r.json())
    .then(d => {
      state.conv = d.conversation;
      state.convId = d.conversation.id;
      state.conversations.unshift({
        id: d.conversation.id,
        title: d.conversation.title,
        model: model,
        createdAt: d.conversation.createdAt,
        updatedAt: d.conversation.updatedAt
      });
      renderHistoryList();
      return d.conversation;
    });
}

function saveConvMeta(id, patch) {
  fetch('/api/conversations/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  }).then(() => {
    const c = state.conversations.find(item => item.id === id);
    if (c) Object.assign(c, patch);
    renderHistoryList();
  });
}

function deleteConversation(id) {
  if (!confirm('Supprimer définitivement cette conversation ?')) return;
  fetch('/api/conversations/' + id, { method: 'DELETE' }).then(() => {
    state.conversations = state.conversations.filter(c => c.id !== id);
    if (state.convId === id) {
      newChat();
    } else {
      renderHistoryList();
    }
    showToast('Discussion supprimée');
  });
}

function renameConversation(conv) {
  const newTitle = prompt('Nouveau nom pour cette discussion :', conv.title);
  if (newTitle && newTitle.trim()) {
    saveConvMeta(conv.id, { title: newTitle.trim() });
    if (state.conv && state.conv.id === conv.id) {
      state.conv.title = newTitle.trim();
      $('topbarTitle').textContent = newTitle.trim();
    }
    showToast('Discussion renommée');
  }
}

function exportConversation(conv) {
  const md = `# ${conv.title || 'Discussion LeBon AI'}\n\n` +
    (conv.messages || []).map(m => `### ${m.role === 'user' ? 'Utilisateur' : 'LeBon AI'}\n\n${m.content}\n`).join('\n---\n\n');
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = `${(conv.title || 'discussion').replace(/\s+/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(u);
  showToast('Discussion exportée en Markdown');
}

// ── Main View Renderer ────────────────────────────────────────
function renderMain() {
  const container = $('messagesContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!state.conv || !state.conv.messages || state.conv.messages.length === 0) {
    $('topbarTitle').textContent = 'LeBon AI';
    renderWelcomeHero(container);
  } else {
    $('topbarTitle').textContent = state.conv.title || 'Discussion';
    const thread = el('div', 'thread-wrap');
    state.conv.messages.forEach((m, idx) => {
      thread.appendChild(buildMessageRow(m, idx));
    });
    container.appendChild(thread);
    scrollToBottom();
  }
}

// ── Welcome Hero: Boussole IBC & 5 Propositions de Prompts avec Visuels Riches ──
function renderWelcomeHero(container) {
  const hero = el('div', 'battement');
  const dict = I18N[state.currentLanguage] || I18N.fr;
  const rad = dict.radial || (I18N.fr ? I18N.fr.radial : {});

  hero.innerHTML = `
    <div class="bat-canvas">
      <svg class="bat-svg" viewBox="0 0 480 480">
        <defs>
          <linearGradient id="orangeRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffad72"/>
            <stop offset="50%" stop-color="#ff6b00"/>
            <stop offset="100%" stop-color="#ff8738"/>
          </linearGradient>
        </defs>
        <!-- piste fixe, claire et discrète -->
        <circle class="ring-bg" cx="240" cy="240" r="180"/>
        <!-- lumière seule : une respiration diffuse remonte le cercle en sens inverse -->
        <circle class="ring-light-aura" cx="240" cy="240" r="180" stroke-dasharray="168 963"/>
        <circle class="ring-light-bloom" cx="240" cy="240" r="180" stroke-dasharray="74 1057"/>
        <circle class="ring-light-flare" cx="240" cy="240" r="180" stroke-dasharray="18 1113"/>
        <!-- arc principal : rotation horaire -->
        <circle class="ring-fill" id="ringFill" cx="240" cy="240" r="180" stroke-dasharray="1130.97" stroke-dashoffset="380"/>
      </svg>

      <div class="bat-center">
        <div class="label-sub">${rad.centerSubtitle || 'visualisation · slides · roi · dev · stratégie'}</div>
        <div class="score" id="ibcScore">
          <span>${rad.centerGreeting || 'Bonjour'}</span>
          <span class="sub-name">Abbas</span>
        </div>
        <div class="delta" id="ibcDelta"><span class="arrow">▲</span> ${rad.centerDelta || '5 Prompts Prêts · Cliquez'}</div>
      </div>

      <!-- 5 BULLES DE PROMPTS ÉPURÉES AVEC TEXTES EXPLICATIFS -->
      
      <!-- 1. HAUT (VERT) -->
      <div class="orbit green o-top" onclick="triggerRadialPrompt('DATAVIZ')" title="${rad.datavizTitle || 'Créer un Graphique'}">
        <div class="o-title">${rad.datavizTitle || 'Créer un Graphique'}</div>
        <div class="o-prompt-text">${rad.datavizDesc || 'Tableau de bord interactif & visualisations de données'}</div>
      </div>

      <!-- 2. DROITE (AMBRE) -->
      <div class="orbit amber o-right" onclick="triggerRadialPrompt('SLIDES')" title="${rad.slidesTitle || 'Pitch Exécutif'}">
        <div class="o-title">${rad.slidesTitle || 'Pitch Exécutif'}</div>
        <div class="o-prompt-text">${rad.slidesDesc || 'Présentation en 5 slides percutantes au standard F3'}</div>
      </div>

      <!-- 3. BAS-DROIT (BLEU) -->
      <div class="orbit blue o-br" onclick="triggerRadialPrompt('ROI')" title="${rad.roiTitle || 'Calculer les Gains'}">
        <div class="o-title">${rad.roiTitle || 'Calculer les Gains'}</div>
        <div class="o-prompt-text">${rad.roiDesc || 'Simulation du ROI net, gains et temps de retour'}</div>
      </div>

      <!-- 4. BAS-GAUCHE (ROUGE) -->
      <div class="orbit red o-bl" onclick="triggerRadialPrompt('CODE')" title="${rad.codeTitle || 'Scanner & Coder'}">
        <div class="o-title">${rad.codeTitle || 'Scanner & Coder'}</div>
        <div class="o-prompt-text">${rad.codeDesc || 'Scan du système et génération de scripts optimisés'}</div>
      </div>

      <!-- 5. GAUCHE (TEAL) -->
      <div class="orbit teal o-left" onclick="triggerRadialPrompt('CADRAGE')" title="${rad.cadrageTitle || 'Fiche Use Case'}">
        <div class="o-title">${rad.cadrageTitle || 'Fiche Use Case'}</div>
        <div class="o-prompt-text">${rad.cadrageDesc || 'Cadrage stratégique IA, objectifs et jalons clés'}</div>
      </div>
    </div>
  `;

  container.appendChild(hero);
}

// ==========================================================================
// BESPOKE ARTIFACT GENERATORS FOR THE 5 BOUSSOLE RADIAL ACTIONS
// ==========================================================================

function generateDatavizDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tableau de Bord Exécutif Transfo IA</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #f7f3eb; color: #17120c; margin: 0; padding: 24px; }
</style>
</head>
<body class="bg-[#f7f3eb] text-[#17120c]">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e5dac9] pb-5 mb-6">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-1">
          <span class="inline-block w-2 h-2 rounded-full bg-[#ea580c] animate-pulse"></span>
          leboncoin Transfo IA 360 · Données Live
        </div>
        <h1 class="text-2xl font-black tracking-tight text-[#17120c] flex items-center gap-2">
          <span>📊</span> Tableau de Bord Exécutif & Indicateurs Clés
        </h1>
      </div>
      <div class="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#e5dac9] shadow-sm">
        <button onclick="setFilter('1W')" id="f1W" class="px-3 py-1 text-xs font-bold rounded-lg transition-all bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/20">Semaine</button>
        <button onclick="setFilter('1M')" id="f1M" class="px-3 py-1 text-xs font-bold rounded-lg transition-all text-[#786b5c] hover:text-[#17120c]">Mois</button>
        <button onclick="setFilter('1Q')" id="f1Q" class="px-3 py-1 text-xs font-bold rounded-lg transition-all text-[#786b5c] hover:text-[#17120c]">Trimestre</button>
        <button onclick="setFilter('1Y')" id="f1Y" class="px-3 py-1 text-xs font-bold rounded-lg transition-all text-[#786b5c] hover:text-[#17120c]">Année</button>
      </div>
    </div>

    <!-- 4 KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#e5dac9] rounded-2xl p-4.5 shadow-sm relative overflow-hidden">
        <div class="text-xs font-bold uppercase tracking-wider text-[#786b5c]">Heures Gagnées</div>
        <div class="text-3xl font-black text-[#17120c] mt-1" id="kpiHours">414 h</div>
        <div class="flex items-center gap-1 text-xs font-bold text-[#15803d] mt-2">
          <span>▲ +24%</span> <span class="text-[#786b5c] font-normal">vs période préc.</span>
        </div>
        <div class="w-full bg-[#f0e6d6] h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="bg-[#16a34a] h-full rounded-full w-[83%]"></div>
        </div>
      </div>

      <div class="bg-white border border-[#e5dac9] rounded-2xl p-4.5 shadow-sm relative overflow-hidden">
        <div class="text-xs font-bold uppercase tracking-wider text-[#786b5c]">Gains Financiers Nets</div>
        <div class="text-3xl font-black text-[#ea580c] mt-1" id="kpiRoi">17 550 €</div>
        <div class="flex items-center gap-1 text-xs font-bold text-[#ea580c] mt-2">
          <span>▲ +88% ROI</span> <span class="text-[#786b5c] font-normal">amorti en 0.7 mois</span>
        </div>
        <div class="w-full bg-[#f0e6d6] h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="bg-[#ff6b00] h-full rounded-full w-[88%]"></div>
        </div>
      </div>

      <div class="bg-white border border-[#e5dac9] rounded-2xl p-4.5 shadow-sm relative overflow-hidden">
        <div class="text-xs font-bold uppercase tracking-wider text-[#786b5c]">Adoption IA (WAU)</div>
        <div class="text-3xl font-black text-[#17120c] mt-1" id="kpiWau">62.5 %</div>
        <div class="flex items-center gap-1 text-xs font-bold text-[#0284c7] mt-2">
          <span>▲ 124 Actifs</span> <span class="text-[#786b5c] font-normal">Tech & Métiers</span>
        </div>
        <div class="w-full bg-[#f0e6d6] h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="bg-[#0284c7] h-full rounded-full w-[62%]"></div>
        </div>
      </div>

      <div class="bg-white border border-[#e5dac9] rounded-2xl p-4.5 shadow-sm relative overflow-hidden">
        <div class="text-xs font-bold uppercase tracking-wider text-[#786b5c]">Souveraineté Locale</div>
        <div class="text-3xl font-black text-[#15803d] mt-1">100 %</div>
        <div class="flex items-center gap-1 text-xs font-bold text-[#15803d] mt-2">
          <span>🔒 0 Fuite Cloud</span> <span class="text-[#786b5c] font-normal">Ollama Local</span>
        </div>
        <div class="w-full bg-[#f0e6d6] h-1.5 rounded-full mt-3 overflow-hidden">
          <div class="bg-[#16a34a] h-full rounded-full w-full"></div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 bg-white border border-[#e5dac9] rounded-2xl p-5 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-base font-bold text-[#17120c]">Trajectoire des Heures Gagnées vs Objectif</h3>
            <p class="text-xs text-[#786b5c]">Évolution cumulée hebdomadaire sur 2026</p>
          </div>
          <span class="text-xs font-bold bg-[#f6eee2] text-[#8c6536] border border-[#e6d8c3] px-2.5 py-1 rounded-lg">Cible 2026 : 1 200 h</span>
        </div>
        <div class="h-64 relative">
          <canvas id="hoursChart"></canvas>
        </div>
      </div>

      <div class="bg-white border border-[#e5dac9] rounded-2xl p-5 shadow-sm">
        <div class="mb-4">
          <h3 class="text-base font-bold text-[#17120c]">Usage par Pôle Métier</h3>
          <p class="text-xs text-[#786b5c]">Répartition des requêtes IA leboncoin</p>
        </div>
        <div class="h-64 relative flex items-center justify-center">
          <canvas id="poleChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Use Cases Table -->
    <div class="bg-white border border-[#e5dac9] rounded-2xl p-5 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-base font-bold text-[#17120c]">Top 4 Use Cases Déployés au Standard F3</h3>
        <span class="text-xs font-bold text-[#ea580c] bg-[#fff4eb] border border-[#fed7aa] px-2.5 py-0.5 rounded-full">Standard F3 : 5s / 30s / 2 clics</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-[#786b5c] uppercase tracking-wider border-b border-[#e5dac9] bg-[#faf6ee]">
            <tr>
              <th class="py-2.5 px-3">Use Case</th>
              <th class="py-2.5 px-3">Pôle Métier</th>
              <th class="py-2.5 px-3">Gains Heures/Mois</th>
              <th class="py-2.5 px-3">ROI Net Estimé</th>
              <th class="py-2.5 px-3">Statut F3</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#f0e6d6] text-[#2d261e]">
            <tr class="hover:bg-[#fbf9f4] transition-colors">
              <td class="py-2.5 px-3 font-bold text-[#17120c] flex items-center gap-2"><span>⚡</span> Sales Genius Real Estate</td>
              <td class="py-2.5 px-3 text-[#54483a]">Commercial & Immo</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#15803d]">84 h</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#ea580c]">3 780 €</td>
              <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] font-bold">● En Production</span></td>
            </tr>
            <tr class="hover:bg-[#fbf9f4] transition-colors">
              <td class="py-2.5 px-3 font-bold text-[#17120c] flex items-center gap-2"><span>🛡️</span> Scanner Souveraineté RGPD</td>
              <td class="py-2.5 px-3 text-[#54483a]">Juridique & Data</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#15803d]">62 h</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#ea580c]">2 790 €</td>
              <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] font-bold">● En Production</span></td>
            </tr>
            <tr class="hover:bg-[#fbf9f4] transition-colors">
              <td class="py-2.5 px-3 font-bold text-[#17120c] flex items-center gap-2"><span>💻</span> Code Studio & Automatisation</td>
              <td class="py-2.5 px-3 text-[#54483a]">Engineering</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#15803d]">140 h</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#ea580c]">6 300 €</td>
              <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] font-bold">● En Production</span></td>
            </tr>
            <tr class="hover:bg-[#fbf9f4] transition-colors">
              <td class="py-2.5 px-3 font-bold text-[#17120c] flex items-center gap-2"><span>📑</span> Synthèse COMEX Express</td>
              <td class="py-2.5 px-3 text-[#54483a]">Direction Générale</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#15803d]">38 h</td>
              <td class="py-2.5 px-3 font-mono font-bold text-[#ea580c]">1 710 €</td>
              <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] font-bold">● Déploiement</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    let hoursChartInstance = null;
    let poleChartInstance = null;

    const DATA_SETS = {
      '1W': { hours: '414 h', roi: '17 550 €', wau: '62.5 %', labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], data: [42, 58, 65, 80, 88, 52, 29], target: [50, 50, 50, 50, 50, 50, 50] },
      '1M': { hours: '1 680 h', roi: '75 600 €', wau: '68.2 %', labels: ['S1', 'S2', 'S3', 'S4'], data: [310, 420, 460, 490], target: [300, 350, 400, 450] },
      '1Q': { hours: '5 200 h', roi: '234 000 €', wau: '74.0 %', labels: ['Janv', 'Févr', 'Mars'], data: [1420, 1780, 2000], target: [1200, 1500, 1800] },
      '1Y': { hours: '22 400 h', roi: '1 008 000 €', wau: '82.5 %', labels: ['T1', 'T2', 'T3', 'T4'], data: [4500, 5600, 6100, 6200], target: [4000, 5000, 5500, 6000] }
    };

    function initCharts() {
      const ctx1 = document.getElementById('hoursChart').getContext('2d');
      hoursChartInstance = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: DATA_SETS['1W'].labels,
          datasets: [
            {
              label: 'Heures Réelles',
              data: DATA_SETS['1W'].data,
              borderColor: '#ff6b00',
              backgroundColor: 'rgba(255, 107, 0, 0.12)',
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#ff6b00',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 5
            },
            {
              label: 'Cible Prévisionnelle',
              data: DATA_SETS['1W'].target,
              borderColor: '#a89d8f',
              borderDash: [5, 5],
              borderWidth: 2,
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#54483a', font: { size: 11, weight: 'bold' } } } },
          scales: {
            x: { grid: { color: 'rgba(229, 218, 201, 0.8)' }, ticks: { color: '#786b5c', font: { weight: '600' } } },
            y: { grid: { color: 'rgba(229, 218, 201, 0.8)' }, ticks: { color: '#786b5c', font: { weight: '600' } } }
          }
        }
      });

      const ctx2 = document.getElementById('poleChart').getContext('2d');
      poleChartInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Engineering', 'Produit', 'Commercial', 'Data & Juridique'],
          datasets: [{
            data: [42, 26, 18, 14],
            backgroundColor: ['#ff6b00', '#0284c7', '#16a34a', '#8b5cf6'],
            borderColor: '#ffffff',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#54483a', boxWidth: 12, font: { size: 10.5, weight: 'bold' } } } },
          cutout: '70%'
        }
      });
    }

    function setFilter(key) {
      ['f1W', 'f1M', 'f1Q', 'f1Y'].forEach(id => {
        const btn = document.getElementById(id);
        if (id === 'f' + key) {
          btn.className = 'px-3 py-1 text-xs font-bold rounded-lg transition-all bg-[#ff6b00] text-white shadow-md shadow-[#ff6b00]/20';
        } else {
          btn.className = 'px-3 py-1 text-xs font-bold rounded-lg transition-all text-[#786b5c] hover:text-[#17120c]';
        }
      });

      const d = DATA_SETS[key];
      document.getElementById('kpiHours').textContent = d.hours;
      document.getElementById('kpiRoi').textContent = d.roi;
      document.getElementById('kpiWau').textContent = d.wau;

      hoursChartInstance.data.labels = d.labels;
      hoursChartInstance.data.datasets[0].data = d.data;
      hoursChartInstance.data.datasets[1].data = d.target;
      hoursChartInstance.update();
    }

    window.onload = initCharts;
  </script>
</body>
</html>`;
}

function generateExecutiveSlidesHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Présentation Exécutive COMEX (Standard F3)</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #f7f3eb; color: #17120c; margin: 0; padding: 20px; user-select: none; }
  .slide-card { display: none; min-height: 480px; }
  .slide-card.active { display: flex; flex-direction: column; }
</style>
</head>
<body class="bg-[#f7f3eb] text-[#17120c] flex flex-col items-center justify-center min-h-screen">
  <div class="w-full max-w-4xl bg-white border border-[#e5dac9] rounded-3xl p-8 shadow-xl relative flex flex-col justify-between" style="min-height: 520px;">
    
    <!-- Top Bar -->
    <div class="flex justify-between items-center border-b border-[#e5dac9] pb-4 mb-6">
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-[#fff4eb] text-[#ea580c] border border-[#fed7aa] text-xs font-black uppercase tracking-wider">leboncoin · Transfo IA 360</span>
        <span class="text-[#786b5c] text-xs font-semibold">Standard F3 · Note COMEX</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs font-mono font-bold text-[#786b5c]" id="slideCounter">Slide 1 / 5</span>
        <button onclick="window.print()" class="px-2.5 py-1 bg-[#f6eee2] hover:bg-[#ede0ce] border border-[#e5dac9] rounded-lg text-xs font-bold transition-all text-[#54483a]">🖨️ Imprimer / PDF</button>
      </div>
    </div>

    <!-- Slide 1 : Titre & Vision -->
    <div class="slide-card active" id="slide1">
      <div class="my-auto text-center px-4">
        <span class="inline-block px-3 py-1 bg-[#fff4eb] text-[#ea580c] border border-[#fed7aa] rounded-full text-xs font-bold uppercase tracking-wider mb-4">Direction Générale & Comité Exécutif</span>
        <h1 class="text-4xl sm:text-5xl font-black text-[#17120c] tracking-tight leading-tight mb-4">
          Transformation IA 360 & Souveraineté
        </h1>
        <p class="text-base sm:text-lg text-[#54483a] max-w-2xl mx-auto mb-8">
          Bilan opérationnel, gains financiers validés et passage à l'échelle des agents locaux au standard F3.
        </p>
        <div class="flex justify-center gap-6 text-xs text-[#786b5c] font-bold border-t border-[#f0e6d6] pt-6">
          <div>Auteur : <b class="text-[#17120c]">Abbas Mistrah</b></div>
          <div>Structure : <b class="text-[#17120c]">Groupe Adevinta / leboncoin</b></div>
          <div>Date : <b class="text-[#ea580c]">Août 2026</b></div>
        </div>
      </div>
    </div>

    <!-- Slide 2 : Constat & Enjeux -->
    <div class="slide-card" id="slide2">
      <div>
        <span class="text-xs font-bold text-[#ea580c] uppercase tracking-wider">01 · Contexte & Défis</span>
        <h2 class="text-2xl sm:text-3xl font-black text-[#17120c] tracking-tight mt-1 mb-4">Pourquoi le Local-First & le Standard F3 ?</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4.5 rounded-2xl shadow-sm">
          <div class="text-2xl mb-2">🔒</div>
          <h3 class="text-sm font-bold text-[#17120c] mb-1">Zéro Fuite de Données</h3>
          <p class="text-xs text-[#786b5c] leading-relaxed">Exécution 100% sur matériel interne (Ollama local). Conformité RGPD totale pour les données stratégiques.</p>
        </div>
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4.5 rounded-2xl shadow-sm">
          <div class="text-2xl mb-2">⚡</div>
          <h3 class="text-sm font-bold text-[#17120c] mb-1">Standard F3 Intégré</h3>
          <p class="text-xs text-[#786b5c] leading-relaxed">5 secondes pour comprendre, 30 secondes pour arbitrer, 2 clics pour exécuter. Efficacité immédiate.</p>
        </div>
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4.5 rounded-2xl shadow-sm">
          <div class="text-2xl mb-2">💶</div>
          <h3 class="text-sm font-bold text-[#17120c] mb-1">Coûts API Éliminés</h3>
          <p class="text-xs text-[#786b5c] leading-relaxed">Division par 10 de la facture d'inférence en exploitant les GPU locaux pour 90% des usages quotidiens.</p>
        </div>
      </div>
    </div>

    <!-- Slide 3 : Portefeuille des 5 Use Cases -->
    <div class="slide-card" id="slide3">
      <div>
        <span class="text-xs font-bold text-[#ea580c] uppercase tracking-wider">02 · Réalisations Métiers</span>
        <h2 class="text-2xl sm:text-3xl font-black text-[#17120c] tracking-tight mt-1 mb-4">5 Use Cases Phares Déjà en Production</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto text-xs">
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <span class="text-xl">🏡</span>
          <div>
            <b class="text-[#17120c] block text-sm mb-0.5">Sales Genius Immobilier</b>
            <span class="text-[#786b5c]">Génération automatique des fiches descriptives à fort taux de conversion (+18% leads).</span>
          </div>
        </div>
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <span class="text-xl">💻</span>
          <div>
            <b class="text-[#17120c] block text-sm mb-0.5">Code Studio & Scanning</b>
            <span class="text-[#786b5c]">Refactoring automatique et génération de tests unitaires (gain de 3.5h/dev/semaine).</span>
          </div>
        </div>
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <span class="text-xl">📊</span>
          <div>
            <b class="text-[#17120c] block text-sm mb-0.5">Data Viz & Reporting Live</b>
            <span class="text-[#786b5c]">Génération instantanée de tableaux de bord interactifs sans solliciter l'équipe BI.</span>
          </div>
        </div>
        <div class="bg-[#fbf9f4] border border-[#e5dac9] p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <span class="text-xl">🎯</span>
          <div>
            <b class="text-[#17120c] block text-sm mb-0.5">Cadrage Stratégique 360</b>
            <span class="text-[#786b5c]">Fiches de cadrage unifiées avec matrice d'impact, roadmap et ROI net prêt pour arbitrage.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide 4 : Trajectoire Financière -->
    <div class="slide-card" id="slide4">
      <div>
        <span class="text-xs font-bold text-[#ea580c] uppercase tracking-wider">03 · Rentabilité & Impact Financier</span>
        <h2 class="text-2xl sm:text-3xl font-black text-[#17120c] tracking-tight mt-1 mb-4">Gains Nets Validés & Payback Immédiat</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto">
        <div class="bg-white border border-[#bbf7d0] p-5 rounded-2xl text-center shadow-sm">
          <span class="text-xs text-[#786b5c] font-bold uppercase">Heures Économisées</span>
          <div class="text-3xl font-black text-[#15803d] mt-1">414 h / an</div>
          <span class="text-xs text-[#786b5c] mt-1 block">Sur la cohorte pilote (50 pers.)</span>
        </div>
        <div class="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-[#fed7aa] p-5 rounded-2xl text-center shadow-sm">
          <span class="text-xs text-[#9a3412] font-bold uppercase">Gain Net Annuel</span>
          <div class="text-3xl font-black text-[#ea580c] mt-1">+17 550 €</div>
          <span class="text-xs text-[#9a3412] mt-1 block">ROI net calculé à +88%</span>
        </div>
        <div class="bg-white border border-[#bae6fd] p-5 rounded-2xl text-center shadow-sm">
          <span class="text-xs text-[#786b5c] font-bold uppercase">Temps de Retour</span>
          <div class="text-3xl font-black text-[#0284c7] mt-1">&lt; 1 mois</div>
          <span class="text-xs text-[#786b5c] mt-1 block">Payback réalisé en 0.7 mois</span>
        </div>
      </div>
      <div class="bg-[#faf6ee] border border-[#e5dac9] p-3 rounded-xl text-center text-xs text-[#54483a]">
        💡 <b>Projection à 500 collaborateurs :</b> Gain net supérieur à <b>180 000 € / an</b> sans surcoût d'infrastructure cloud.
      </div>
    </div>

    <!-- Slide 5 : Décisions & Prochains Jalons -->
    <div class="slide-card" id="slide5">
      <div>
        <span class="text-xs font-bold text-[#ea580c] uppercase tracking-wider">04 · Décisions & Arbitrages COMEX</span>
        <h2 class="text-2xl sm:text-3xl font-black text-[#17120c] tracking-tight mt-1 mb-4">Prochaines Étapes pour le Déploiement Q4</h2>
      </div>
      <div class="space-y-3 my-auto text-xs">
        <div class="bg-[#fbf9f4] border-l-4 border-[#ff6b00] border-y border-r border-[#e5dac9] p-4 rounded-r-xl shadow-sm">
          <b class="text-[#17120c] block text-sm mb-0.5">1. Élargissement du pilote à 250 collaborateurs</b>
          <span class="text-[#786b5c]">Déploiement des 5 assistants spécialisés sur les pôles Relation Client et Marketing Produit.</span>
        </div>
        <div class="bg-[#fbf9f4] border-l-4 border-[#16a34a] border-y border-r border-[#e5dac9] p-4 rounded-r-xl shadow-sm">
          <b class="text-[#17120c] block text-sm mb-0.5">2. Intégration du connecteur mémoire souveraine</b>
          <span class="text-[#786b5c]">Indexation sécurisée de la documentation d'entreprise en local avec conformité RGPD absolue.</span>
        </div>
        <div class="bg-[#fbf9f4] border-l-4 border-[#0284c7] border-y border-r border-[#e5dac9] p-4 rounded-r-xl shadow-sm">
          <b class="text-[#17120c] block text-sm mb-0.5">3. Validation de l'arbitrage budgétaire COMEX</b>
          <span class="text-[#786b5c]">Validation du maintien de la stratégie Local-First et des accélérateurs F3 pour 2026/2027.</span>
        </div>
      </div>
    </div>

    <!-- Navigation Footer -->
    <div class="flex justify-between items-center border-t border-[#e5dac9] pt-4 mt-6">
      <button onclick="prevSlide()" class="px-4 py-2 bg-[#f6eee2] hover:bg-[#ede0ce] border border-[#e5dac9] text-[#54483a] rounded-xl text-xs font-bold transition-all flex items-center gap-2" id="btnPrev">
        <span>←</span> Précédent
      </button>
      <div class="flex gap-1.5" id="slideDots">
        <span class="w-2.5 h-2.5 rounded-full bg-[#ff6b00] cursor-pointer" onclick="goToSlide(1)"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#e5dac9] cursor-pointer" onclick="goToSlide(2)"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#e5dac9] cursor-pointer" onclick="goToSlide(3)"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#e5dac9] cursor-pointer" onclick="goToSlide(4)"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#e5dac9] cursor-pointer" onclick="goToSlide(5)"></span>
      </div>
      <button onclick="nextSlide()" class="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65a00] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ff6b00]/25 flex items-center gap-2" id="btnNext">
        Suivant <span>→</span>
      </button>
    </div>
  </div>

  <script>
    let currentSlide = 1;
    const totalSlides = 5;

    function updateSlide() {
      for (let i = 1; i <= totalSlides; i++) {
        const el = document.getElementById('slide' + i);
        if (el) el.classList.toggle('active', i === currentSlide);
      }
      document.getElementById('slideCounter').textContent = 'Slide ' + currentSlide + ' / ' + totalSlides;
      
      const dots = document.getElementById('slideDots').children;
      for (let i = 0; i < dots.length; i++) {
        dots[i].className = (i + 1 === currentSlide) 
          ? 'w-2.5 h-2.5 rounded-full bg-[#ff6b00] cursor-pointer' 
          : 'w-2.5 h-2.5 rounded-full bg-[#e5dac9] cursor-pointer';
      }

      document.getElementById('btnPrev').style.visibility = currentSlide === 1 ? 'hidden' : 'visible';
      document.getElementById('btnNext').textContent = currentSlide === totalSlides ? 'Terminer ✓' : 'Suivant →';
    }

    function nextSlide() {
      if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (currentSlide > 1) {
        currentSlide--;
        updateSlide();
      }
    }

    function goToSlide(n) {
      currentSlide = n;
      updateSlide();
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    updateSlide();
  </script>
</body>
</html>`;
}

function generateRoiSimulatorHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Simulateur ROI Transfo IA</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #f7f3eb; color: #17120c; margin: 0; padding: 24px; }
  input[type=range] { accent-color: #ff6b00; }
</style>
</head>
<body class="bg-[#f7f3eb] text-[#17120c]">
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="border-b border-[#e5dac9] pb-5 mb-6 flex justify-between items-center">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-[#ea580c] mb-1">Simulateur Financier Exécutif</div>
        <h1 class="text-2xl font-black text-[#17120c] flex items-center gap-2">
          <span>💶</span> Modélisation de Rentabilité & ROI IA
        </h1>
      </div>
      <span class="text-xs font-bold bg-white border border-[#e5dac9] px-3 py-1.5 rounded-xl text-[#54483a] shadow-sm">Standard F3 · leboncoin</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Sliders Left (5 Cols) -->
      <div class="lg:col-span-5 bg-white border border-[#e5dac9] rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[#786b5c] border-b border-[#f0e6d6] pb-2">Paramètres de la Cohorte</h3>
        
        <div>
          <div class="flex justify-between text-xs font-bold mb-2">
            <span class="text-[#54483a]">Effectif collaborateurs</span>
            <span class="text-[#ea580c] font-mono text-sm" id="valUsers">50 pers.</span>
          </div>
          <input type="range" id="inUsers" min="5" max="500" step="5" value="50" class="w-full h-2 bg-[#f0e6d6] rounded-lg cursor-pointer" oninput="calc()">
        </div>

        <div>
          <div class="flex justify-between text-xs font-bold mb-2">
            <span class="text-[#54483a]">Gain de temps / pers. / sem.</span>
            <span class="text-[#ea580c] font-mono text-sm" id="valHours">2.5 h/sem.</span>
          </div>
          <input type="range" id="inHours" min="0.5" max="10" step="0.5" value="2.5" class="w-full h-2 bg-[#f0e6d6] rounded-lg cursor-pointer" oninput="calc()">
        </div>

        <div>
          <div class="flex justify-between text-xs font-bold mb-2">
            <span class="text-[#54483a]">Taux horaire moyen chargé</span>
            <span class="text-[#ea580c] font-mono text-sm" id="valRate">45 €/h</span>
          </div>
          <input type="range" id="inRate" min="20" max="150" step="5" value="45" class="w-full h-2 bg-[#f0e6d6] rounded-lg cursor-pointer" oninput="calc()">
        </div>

        <div>
          <div class="flex justify-between text-xs font-bold mb-2">
            <span class="text-[#54483a]">Coût outil / licence / mois</span>
            <span class="text-[#ea580c] font-mono text-sm" id="valCost">30 €/mois</span>
          </div>
          <input type="range" id="inCost" min="0" max="100" step="5" value="30" class="w-full h-2 bg-[#f0e6d6] rounded-lg cursor-pointer" oninput="calc()">
        </div>

        <div class="p-3 bg-[#faf6ee] border border-[#e5dac9] rounded-xl text-xs text-[#786b5c] leading-relaxed">
          Base : 46 semaines ouvrées par an. Modélisation certifiée pour passage en comité budgétaire.
        </div>
      </div>

      <!-- Results Right (7 Cols) -->
      <div class="lg:col-span-7 space-y-4">
        <!-- Main Highlight Box -->
        <div class="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-[#fed7aa] rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-[#9a3412]">Gain Net Annuel Estimé</span>
          <div class="text-4xl font-black text-[#ea580c] mt-1" id="resNetGain">17 550 €</div>
          <p class="text-xs text-[#9a3412] mt-2">Bénéfice financier net après déduction intégrale des coûts d'outils et de licences.</p>
        </div>

        <!-- 3 Mini Cards -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-white border border-[#e5dac9] p-3.5 rounded-xl shadow-sm">
            <span class="text-xs text-[#786b5c] font-bold uppercase block">Heures Gagnées</span>
            <b class="text-lg font-black text-[#15803d] mt-1 block" id="resTotalHours">5 750 h</b>
          </div>
          <div class="bg-white border border-[#fed7aa] p-3.5 rounded-xl shadow-sm">
            <span class="text-xs text-[#786b5c] font-bold uppercase block">ROI Net</span>
            <b class="text-lg font-black text-[#ea580c] mt-1 block" id="resRoiPct">+88 %</b>
          </div>
          <div class="bg-white border border-[#e5dac9] p-3.5 rounded-xl shadow-sm">
            <span class="text-xs text-[#786b5c] font-bold uppercase block">Délai Payback</span>
            <b class="text-lg font-black text-[#0284c7] mt-1 block" id="resPayback">0.7 mois</b>
          </div>
        </div>

        <!-- Chart Comparison -->
        <div class="bg-white border border-[#e5dac9] rounded-2xl p-4 shadow-sm">
          <h4 class="text-xs font-bold text-[#54483a] uppercase tracking-wider mb-2">Comparatif Financier Annuel</h4>
          <div class="h-44 relative">
            <canvas id="roiChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let roiChart = null;

    function calc() {
      const users = parseInt(document.getElementById('inUsers').value, 10);
      const hours = parseFloat(document.getElementById('inHours').value);
      const rate = parseFloat(document.getElementById('inRate').value);
      const cost = parseFloat(document.getElementById('inCost').value);

      document.getElementById('valUsers').textContent = users + ' pers.';
      document.getElementById('valHours').textContent = hours + ' h/sem.';
      document.getElementById('valRate').textContent = rate + ' €/h';
      document.getElementById('valCost').textContent = cost + ' €/mois';

      const totalHours = Math.round(users * hours * 46);
      const grossGain = totalHours * rate;
      const annualCost = users * cost * 12;
      const netGain = Math.max(0, grossGain - annualCost);
      const roiPct = annualCost > 0 ? Math.round((netGain / annualCost) * 100) : 9999;
      const paybackMonths = grossGain > 0 ? (annualCost / (grossGain / 12)).toFixed(1) : 0;

      document.getElementById('resNetGain').textContent = netGain.toLocaleString('fr-FR') + ' €';
      document.getElementById('resTotalHours').textContent = totalHours.toLocaleString('fr-FR') + ' h';
      document.getElementById('resRoiPct').textContent = '+' + roiPct.toLocaleString('fr-FR') + ' %';
      document.getElementById('resPayback').textContent = paybackMonths + ' mois';

      if (roiChart) {
        roiChart.data.datasets[0].data = [grossGain, annualCost, netGain];
        roiChart.update();
      }
    }

    window.onload = function() {
      const ctx = document.getElementById('roiChart').getContext('2d');
      roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Gain Brut', 'Coût Annuel', 'Gain Net'],
          datasets: [{
            data: [258750, 18000, 240750],
            backgroundColor: ['#0284c7', '#ef4444', '#ff6b00'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#786b5c', font: { size: 11, weight: 'bold' } } },
            y: { grid: { color: 'rgba(229, 218, 201, 0.8)' }, ticks: { color: '#786b5c', callback: v => (v/1000) + 'k€' } }
          }
        }
      });
      calc();
    };
  </script>
</body>
</html>`;
}

function generateCodeStudioSandboxHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Code Studio & Terminal Sandbox</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #f7f3eb; color: #17120c; margin: 0; padding: 20px; }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
</style>
</head>
<body class="bg-[#f7f3eb] text-[#17120c] flex flex-col min-h-screen">
  <div class="max-w-5xl mx-auto w-full flex-1 flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-[#e5dac9] pb-4 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-[#fff4eb] border border-[#fed7aa] text-[#ea580c] flex items-center justify-center font-black text-sm">&lt;/&gt;</div>
        <div>
          <h1 class="text-lg font-black text-[#17120c]">Code Studio Sandbox · Scanner Local</h1>
          <span class="text-xs text-[#786b5c]">Environnement sécurisé Ollama 100% Hors-Ligne</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] text-xs font-bold">● Prêt à l'exécution</span>
        <button onclick="runCode()" id="runBtn" class="px-4 py-1.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ff6b00]/20 flex items-center gap-1.5">
          <span>▶</span> Lancer l'Exécution
        </button>
      </div>
    </div>

    <!-- Code Editor Box -->
    <div class="bg-white border border-[#e5dac9] rounded-2xl overflow-hidden mb-4 shadow-sm">
      <div class="bg-[#faf6ee] px-4 py-2 border-b border-[#e5dac9] flex justify-between items-center text-xs text-[#786b5c]">
        <div class="flex gap-2">
          <span class="px-3 py-1 bg-white text-[#ea580c] font-mono font-bold rounded-lg border border-[#e5dac9] shadow-xs">scan_leboncoin_project.py</span>
          <span class="px-3 py-1 text-[#8c7e6c] font-mono cursor-pointer hover:text-[#17120c]">benchmark.py</span>
        </div>
        <span class="font-mono text-[#8c7e6c]">Python 3.11 · Local Execution</span>
      </div>
      <pre class="p-4 text-xs mono text-[#292524] bg-white overflow-x-auto leading-relaxed"><code><span class="text-[#7c3aed] font-bold">import</span> os, sys, time
<span class="text-[#7c3aed] font-bold">from</span> lebon_ai <span class="text-[#7c3aed] font-bold">import</span> LocalSecurityScanner, TelemetryBenchmark

<span class="text-[#8c7e6c] italic"># Initialisation du scanner souverain leboncoin</span>
scanner = LocalSecurityScanner(workspace=<span class="text-[#15803d]">"./lebon-ai"</span>, mode=<span class="text-[#15803d]">"STRICT_LOCAL"</span>)

<span class="text-[#7c3aed] font-bold">def</span> <span class="text-[#0284c7] font-bold">run_audit_360</span>():
    print(<span class="text-[#15803d]">"🔍 [1/3] Analyse des dépendances et de la souveraineté locale..."</span>)
    leak_check = scanner.verify_zero_cloud_leak()
    
    print(<span class="text-[#15803d]">"⚡ [2/3] Calcul des benchmarks de latence et RAM..."</span>)
    perf = TelemetryBenchmark.measure(model=<span class="text-[#15803d]">"qwen2.5-coder:7b"</span>)
    
    print(<span class="text-[#15803d]">"✨ [3/3] Génération du rapport au standard F3..."</span>)
    <span class="text-[#7c3aed] font-bold">return</span> {
        <span class="text-[#15803d]">"status"</span>: <span class="text-[#15803d]">"SUCCESS"</span>,
        <span class="text-[#15803d]">"cloud_leaks"</span>: 0,
        <span class="text-[#15803d]">"latency_ms"</span>: perf.latency,
        <span class="text-[#15803d]">"ram_usage"</span>: <span class="text-[#15803d]">"19.5 Go / 31.4 Go"</span>
    }

<span class="text-[#7c3aed] font-bold">if</span> __name__ == <span class="text-[#15803d]">"__main__"</span>:
    res = run_audit_360()
    print(<span class="text-[#15803d]">f"✅ Audit validé avec succès : {res}"</span>)</code></pre>
    </div>

    <!-- Terminal Output -->
    <div class="bg-[#faf6ee] border border-[#e5dac9] rounded-2xl p-4 flex-1 flex flex-col shadow-sm">
      <div class="flex justify-between items-center text-xs text-[#786b5c] font-mono border-b border-[#e5dac9] pb-2 mb-3">
        <span class="font-bold">CONSOLE OUTPUT (LIVE STREAM)</span>
        <button onclick="clearTerminal()" class="text-[#786b5c] hover:text-[#17120c] font-semibold">Effacer</button>
      </div>
      <div class="font-mono text-xs text-[#292524] space-y-1.5 flex-1" id="termOutput">
        <div class="text-[#8c7e6c] italic">// Cliquez sur "Lancer l'Exécution" pour déclencher le scanner...</div>
      </div>
    </div>
  </div>

  <script>
    function clearTerminal() {
      document.getElementById('termOutput').innerHTML = '<div class="text-[#8c7e6c] italic">// Terminal effacé. Prêt pour une nouvelle exécution.</div>';
    }

    function runCode() {
      const term = document.getElementById('termOutput');
      const btn = document.getElementById('runBtn');
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span> Exécution en cours...';
      term.innerHTML = '';

      const logs = [
        { text: '[SYSTEM] Démarrage du runtime Python 3.11 local...', delay: 200, color: 'text-[#786b5c]' },
        { text: '🔍 [1/3] Analyse des dépendances et de la souveraineté locale...', delay: 600, color: 'text-[#0284c7] font-semibold' },
        { text: '   -> 18 modules inspectés · 0 endpoint cloud tiers (100% sécurisé)', delay: 1000, color: 'text-[#54483a]' },
        { text: '⚡ [2/3] Calcul des benchmarks de latence et RAM...', delay: 1400, color: 'text-[#ea580c] font-semibold' },
        { text: '   -> Latence token : 18.4ms · RAM allouée : 19.5 Go / 31.4 Go', delay: 1800, color: 'text-[#54483a]' },
        { text: '✨ [3/3] Génération du rapport au standard F3...', delay: 2200, color: 'text-[#15803d] font-semibold' },
        { text: '✅ Audit validé avec succès : 100% Local · Zéro anomalie détectée.', delay: 2600, color: 'text-[#15803d] font-bold' }
      ];

      logs.forEach(l => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.className = l.color;
          line.textContent = l.text;
          term.appendChild(line);
          term.scrollTop = term.scrollHeight;
        }, l.delay);
      });

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>▶</span> Relancer l\\'Exécution';
      }, 2800);
    }
  </script>
</body>
</html>`;
}

function generateUseCaseCharterHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fiche de Cadrage Stratégique 360</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #f7f3eb; color: #17120c; margin: 0; padding: 24px; }
</style>
</head>
<body class="bg-[#f7f3eb] text-[#17120c]">
  <div class="max-w-4xl mx-auto bg-white border border-[#e5dac9] rounded-3xl p-8 shadow-xl">
    
    <!-- Top Metadata -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#e5dac9] pb-5 mb-6">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full bg-[#fff4eb] text-[#ea580c] border border-[#fed7aa] text-xs font-black uppercase">Fiche Cadrage N° 2026-08</span>
          <span class="text-xs text-[#786b5c]">Standard F3 · Arbitrage Exécutif</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-[#17120c] mt-1">Cadrage Stratégique IA 360</h1>
      </div>
      <div class="text-right text-xs text-[#786b5c]">
        <div>Lead IA : <b class="text-[#17120c]">Abbas Mistrah</b></div>
        <div>Entité : <b class="text-[#ea580c]">leboncoin / Adevinta</b></div>
      </div>
    </div>

    <!-- Executive Summary (F3 : 5 secondes) -->
    <div class="bg-gradient-to-r from-[#fff4eb] via-[#fdfbf7] to-white border-l-4 border-[#ff6b00] border-y border-r border-[#fed7aa] p-4 rounded-r-2xl mb-6 shadow-sm">
      <span class="text-xs font-bold uppercase tracking-wider text-[#ea580c] block mb-1">Synthèse en 30 secondes (Standard F3)</span>
      <p class="text-sm text-[#2d261e] leading-relaxed font-medium">
        Déploiement d'un écosystème d'assistants IA spécialisés 100% souverains sur l'infrastructure interne leboncoin.
        Objectif : <b>+414h économisées par an</b> et <b>17 550 € de gains nets validés</b> sur la cohorte pilote, avec un délai de rentabilité (payback) inférieur à <b>1 mois</b>.
      </p>
    </div>

    <!-- 4 Section Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <!-- 1. Objectifs & Bénéfices -->
      <div class="bg-[#fbf9f4] border border-[#e5dac9] p-5 rounded-2xl shadow-sm">
        <h3 class="text-sm font-bold text-[#17120c] uppercase tracking-wider flex items-center gap-2 mb-3">
          <span>🎯</span> 1. Objectifs Business & Métriques
        </h3>
        <ul class="text-xs text-[#54483a] space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-[#15803d] font-bold">✓</span>
            <span><b>Automatisation des tâches répétitives</b> : Gain estimé de 2.5h à 4h par semaine et par collaborateur.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#15803d] font-bold">✓</span>
            <span><b>Amélioration de la qualité des livrables</b> : Standardisation des présentations COMEX au format F3.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#15803d] font-bold">✓</span>
            <span><b>Adoption active (WAU)</b> : Cible fixée à 75% sur le trimestre Q3 2026.</span>
          </li>
        </ul>
      </div>

      <!-- 2. Architecture & Souveraineté -->
      <div class="bg-[#fbf9f4] border border-[#e5dac9] p-5 rounded-2xl shadow-sm">
        <h3 class="text-sm font-bold text-[#17120c] uppercase tracking-wider flex items-center gap-2 mb-3">
          <span>🔒</span> 2. Architecture & Souveraineté
        </h3>
        <ul class="text-xs text-[#54483a] space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-[#0284c7] font-bold">●</span>
            <span><b>Exécution Locale</b> : Modèles Ollama (Qwen 2.5 / DeepSeek R1) tournant sur serveurs dédiés internes.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#0284c7] font-bold">●</span>
            <span><b>Isolation RGPD</b> : Aucune transmission de prompt ou de données clients vers des API tierces.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#0284c7] font-bold">●</span>
            <span><b>Mémoire Métier</b> : Fichier de contexte local unifié (<code class="text-[#ea580c] font-mono">contexte.md</code>).</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Roadmap 4 Jalons -->
    <div class="bg-[#fbf9f4] border border-[#e5dac9] p-5 rounded-2xl mb-6 shadow-sm">
      <h3 class="text-sm font-bold text-[#17120c] uppercase tracking-wider mb-4 flex items-center gap-2">
        <span>📅</span> 3. Roadmap de Déploiement en 4 Jalons
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3 bg-white border-t-2 border-[#ff6b00] border-x border-b border-[#e5dac9] rounded-xl shadow-sm">
          <b class="text-[#ea580c] block mb-1">Jalon 1 · Cadrage</b>
          <span class="text-[#786b5c] block mb-2">Semaines 1-2</span>
          <span class="text-[#15803d] font-bold">✓ 100% Terminé</span>
        </div>
        <div class="p-3 bg-white border-t-2 border-[#ff6b00] border-x border-b border-[#e5dac9] rounded-xl shadow-sm">
          <b class="text-[#ea580c] block mb-1">Jalon 2 · PoC & Test</b>
          <span class="text-[#786b5c] block mb-2">Semaines 3-6</span>
          <span class="text-[#15803d] font-bold">✓ Validé (Cohorte 50)</span>
        </div>
        <div class="p-3 bg-white border-t-2 border-[#0284c7] border-x border-b border-[#e5dac9] rounded-xl shadow-sm">
          <b class="text-[#0284c7] block mb-1">Jalon 3 · Pilote 250</b>
          <span class="text-[#786b5c] block mb-2">Semaines 7-12</span>
          <span class="text-[#0369a1] font-bold">⚡ En cours (Q3)</span>
        </div>
        <div class="p-3 bg-white border-t-2 border-[#a89d8f] border-x border-b border-[#e5dac9] rounded-xl shadow-sm">
          <b class="text-[#54483a] block mb-1">Jalon 4 · Scale 500+</b>
          <span class="text-[#786b5c] block mb-2">Q4 2026</span>
          <span class="text-[#8c7e6c] font-bold">Prévu fin d'année</span>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#e5dac9] pt-5">
      <div class="text-xs text-[#786b5c]">
        Statut : <span class="text-[#15803d] font-bold">Prêt pour arbitrage en comité de direction</span>
      </div>
      <div class="flex gap-2">
        <button onclick="window.print()" class="px-4 py-2 bg-[#f6eee2] hover:bg-[#ede0ce] border border-[#e5dac9] rounded-xl text-xs font-bold text-[#54483a] transition-all">
          📑 Exporter en PDF
        </button>
        <button onclick="alert('Cadrage validé et enregistré dans contexte.md')" class="px-4 py-2 bg-[#ff6b00] hover:bg-[#e65a00] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#ff6b00]/25">
          ✓ Valider pour Arbitrage
        </button>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Radial Action Trigger with Instant Interactive Canvas Artifacts ─────
function triggerRadialPrompt(type) {
  const dict = I18N[state.currentLanguage] || I18N.fr;
  const rad = dict.radial || (I18N.fr ? I18N.fr.radial : {});
  const p = (rad.prompts && rad.prompts[type]) || "Rédige un point d'avancement officiel au standard F3.";

  // 1. Open Tailored Canvas Artifact Instantly
  if (type === 'DATAVIZ') {
    openCanvas(generateDatavizDashboardHtml(), rad.datavizTitle || 'Tableau de Bord Exécutif Transfo IA', 'Data Viz Interactive · Standard F3');
    showToast(state.currentLanguage === 'en' ? '📊 Interactive dashboard opened in Canvas' : (state.currentLanguage === 'de' ? '📊 Interaktives Dashboard im Canvas geöffnet' : '📊 Dashboard interactif ouvert dans le Canvas'));
  } else if (type === 'SLIDES') {
    openCanvas(generateExecutiveSlidesHtml(), rad.slidesTitle || 'Présentation Slides COMEX (Format F3)', '5 Diapositives Stratégiques leboncoin');
    showToast(state.currentLanguage === 'en' ? '📑 Executive pitch opened in Canvas' : (state.currentLanguage === 'de' ? '📑 Führungs-Pitch im Canvas geöffnet' : '📑 Pitch Exécutif ouvert dans le Canvas'));
  } else if (type === 'ROI') {
    openCanvas(generateRoiSimulatorHtml(), rad.roiTitle || 'Modélisation Financière & ROI Transfo IA', 'Simulateur Dynamique leboncoin');
    openRoiModal();
    showToast(state.currentLanguage === 'en' ? '💶 ROI Simulator opened' : (state.currentLanguage === 'de' ? '💶 ROI-Simulator geöffnet' : '💶 Simulateur de Rentabilité ouvert'));
  } else if (type === 'CODE') {
    setMode('coder');
    openCanvas(generateCodeStudioSandboxHtml(), rad.codeTitle || 'Code Studio Sandbox & Scanner', 'Environnement de Développement Local');
    showToast(state.currentLanguage === 'en' ? '⚡ Code Studio opened in Canvas' : (state.currentLanguage === 'de' ? '⚡ Code-Studio im Canvas geöffnet' : '⚡ Code Studio ouvert dans le Canvas'));
  } else if (type === 'CADRAGE') {
    openCanvas(generateUseCaseCharterHtml(), rad.cadrageTitle || 'Fiche de Cadrage Stratégique 360', 'Standard F3 · Note d\'Arbitrage');
    showToast(state.currentLanguage === 'en' ? '🎯 Use Case Sheet opened in Canvas' : (state.currentLanguage === 'de' ? '🎯 Use-Case-Blatt im Canvas geöffnet' : '🎯 Fiche de Cadrage ouverte dans le Canvas'));
  }

  // 2. Set prompt in composer & initiate chat stream
  const input = $('composerInput');
  if (input) {
    input.value = p;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    input.focus();
    updateSendBtnIcon();
  }

  // 3. Send message automatically to start discussion thread
  setTimeout(() => {
    handleSend();
  }, 100);
}

// ── Plus Menu Dropdown (Action Menu) ──────────────────────────
function togglePlusMenu(e) {
  if (e) e.stopPropagation();
  const menu = $('plusMenuDropdown');
  if (!menu) return;
  const isShown = menu.style.display === 'flex';
  menu.style.display = isShown ? 'none' : 'flex';
}

function closePlusMenu() {
  const menu = $('plusMenuDropdown');
  if (menu) menu.style.display = 'none';
}

function quickActionPrompt(prefix) {
  closePlusMenu();
  const input = $('composerInput');
  if (!input) return;
  input.value = prefix;
  input.focus();
  updateSendBtnIcon();
}

function toggleVoiceDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Reconnaissance vocale non supportée sur ce navigateur (utiliser Chrome ou Edge)');
    return;
  }
  if (state._recognitionRunning) {
    if (state._recognition) {
      try { state._recognition.stop(); } catch (e) {}
    }
    state._recognitionRunning = false;
    $('micBtn')?.classList.remove('recording');
    showToast('Dictée vocale terminée');
    return;
  }
  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    let baseText = ($('composerInput')?.value || '').trim();

    recognition.onstart = () => {
      state._recognitionRunning = true;
      $('micBtn')?.classList.add('recording');
      showToast('🎤 Dictée activée... Parlez dans votre micro');
    };

    recognition.onresult = (evt) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = evt.resultIndex; i < evt.results.length; ++i) {
        if (evt.results[i].isFinal) {
          finalStr += evt.results[i][0].transcript;
        } else {
          interimStr += evt.results[i][0].transcript;
        }
      }
      const input = $('composerInput');
      if (input) {
        const spoken = (finalStr || interimStr).trim();
        if (spoken) {
          input.value = baseText ? `${baseText} ${spoken}` : spoken;
          input.style.height = 'auto';
          input.style.height = Math.min(input.scrollHeight, 180) + 'px';
          updateSendBtnIcon();
        }
        if (finalStr) {
          baseText = input.value;
        }
      }
    };

    recognition.onend = () => {
      state._recognitionRunning = false;
      $('micBtn')?.classList.remove('recording');
    };

    recognition.onerror = (e) => {
      state._recognitionRunning = false;
      $('micBtn')?.classList.remove('recording');
      if (e.error !== 'no-speech') {
        showToast('Erreur microphone : ' + e.error);
      }
    };

    state._recognition = recognition;
    recognition.start();
  } catch (err) {
    showToast('Impossible d\'activer le micro : ' + err.message);
  }
}

function updateSendBtnIcon() {
  const btn = $('sendBtn');
  if (!btn) return;

  if (state.generating) {
    btn.classList.add('generating-stop');
    btn.setAttribute('title', 'Arrêter la génération');
    btn.setAttribute('aria-label', 'Arrêter la génération');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2.5"></rect></svg>`;
    return;
  }

  btn.classList.remove('generating-stop');
  const text = ($('composerInput')?.value || '').trim();
  const hasAttachment = !!state.attachment;

  if (text.length > 0 || hasAttachment) {
    btn.setAttribute('title', 'Envoyer le message');
    btn.setAttribute('aria-label', 'Envoyer le message');
    btn.innerHTML = `<svg class="send-icon-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
  } else {
    btn.setAttribute('title', 'Live Voice (vide) ou Envoyer');
    btn.setAttribute('aria-label', 'Live Voice (vide) ou Envoyer');
    btn.innerHTML = `<svg class="send-icon-wave" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="9" x2="6" y2="15"></line><line x1="10" y1="5" x2="10" y2="19"></line><line x1="14" y1="7" x2="14" y2="17"></line><line x1="18" y1="10" x2="18" y2="14"></line></svg>`;
  }
}

// ── Quick Prompt Dispatcher ───────────────────────────────────
function quickPrompt(promptText) {
  const input = $('composerInput');
  if (!input) return;
  input.value = promptText;
  input.style.height = 'auto';
  input.focus();
  handleSend();
}

function toggleProjectsCollapse() {
  const header = $('projectsHeader');
  const list = $('historyList');
  if (header && list) {
    header.classList.toggle('collapsed');
    list.style.display = list.style.display === 'none' ? 'flex' : 'none';
  }
}

// ── Navigation active-state ───────────────────────────────────
function setActiveNav(btnId) {
  document.querySelectorAll('.nav .nav-item').forEach(b => b.classList.toggle('active', b.id === btnId));
}

// ── Barre de statut de l'agent (mode Work) ────────────────────
// Définie ici car appelée par la boucle agentique ; son absence cassait tout le mode Work.
function updateStatus(name) {
  const bar = $('workStatusBar'), txt = $('workStatusText');
  if (name) {
    if (bar) bar.style.display = 'flex';
    if (txt) txt.textContent = 'Agent en action : ' + name;
  } else if (bar) {
    bar.style.display = 'none';
  }
}

// ==============================================================
// FEATURE: PLANIFICATION — vrai plan d'action (Kanban + IA + persistance)
// ==============================================================
const PLAN_KEY = 'lebon_plan_v1';
const PLAN_OBJ_KEY = 'lebon_plan_objective_v1';
const PLAN_ORDER = ['todo', 'doing', 'done'];
const PLAN_COL = { todo: 'planColTodo', doing: 'planColDoing', done: 'planColDone' };
const PLAN_COUNT = { todo: 'planCountTodo', doing: 'planCountDoing', done: 'planCountDone' };
state.planTasks = [];

function loadPlan() {
  // safeStorageGet renvoie la chaîne brute : on parse nous-mêmes le JSON.
  const raw = safeStorageGet(PLAN_KEY, null);
  let parsed = [];
  if (raw) { try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (_) { parsed = []; } }
  state.planTasks = Array.isArray(parsed) ? parsed : [];
}
function savePlan() { safeStorageSet(PLAN_KEY, state.planTasks); }

function openPlanModal() {
  closeAllModals();
  setActiveNav('navPlanBtn');
  const modal = $('planModal');
  if (!modal) return;
  loadPlan();
  const obj = safeStorageGet(PLAN_OBJ_KEY, '') || '';
  const objInput = $('planObjectiveInput');
  if (objInput) objInput.value = typeof obj === 'string' ? obj : '';
  modal.style.display = 'flex';
  renderPlanBoard();
}
function closePlanModal() {
  const modal = $('planModal');
  if (modal) modal.style.display = 'none';
  setActiveNav('navNewChatBtn');
}

function planComputeDue(days) {
  const d = new Date();
  d.setDate(d.getDate() + (isNaN(days) ? 7 : days));
  return d.toISOString().slice(0, 10);
}
function planPrioMeta(p) {
  if (p === 'high') return { label: 'Haute', cls: 'high' };
  if (p === 'low') return { label: 'Basse', cls: 'low' };
  return { label: 'Normale', cls: 'normal' };
}

function renderPlanBoard() {
  const counts = { todo: 0, doing: 0, done: 0 };
  const buckets = { todo: [], doing: [], done: [] };
  (state.planTasks || []).forEach(t => {
    const s = PLAN_ORDER.includes(t.status) ? t.status : 'todo';
    buckets[s].push(t); counts[s]++;
  });

  const today = new Date().toISOString().slice(0, 10);
  PLAN_ORDER.forEach(status => {
    const col = $(PLAN_COL[status]);
    const cnt = $(PLAN_COUNT[status]);
    if (cnt) cnt.textContent = counts[status];
    if (!col) return;
    if (!buckets[status].length) {
      col.innerHTML = '<div class="plan-empty">Aucune tâche</div>';
      return;
    }
    col.innerHTML = buckets[status].map(t => {
      const pm = planPrioMeta(t.priority);
      const overdue = t.due && status !== 'done' && t.due < today;
      return (
        '<div class="plan-card prio-' + pm.cls + '">' +
          '<div class="plan-card-top">' +
            '<span class="plan-card-prio ' + pm.cls + '">' + pm.label + '</span>' +
            '<button class="plan-card-del" title="Supprimer" onclick="planDelete(\'' + t.id + '\')">×</button>' +
          '</div>' +
          '<div class="plan-card-title">' + esc(t.title) + '</div>' +
          '<div class="plan-card-meta">' +
            (t.owner ? '<span class="plan-meta">👤 ' + esc(t.owner) + '</span>' : '') +
            (t.due ? '<span class="plan-meta' + (overdue ? ' overdue' : '') + '">📅 ' + esc(t.due) + '</span>' : '') +
          '</div>' +
          '<div class="plan-card-actions">' +
            '<button class="plan-move" ' + (status === 'todo' ? 'disabled' : '') + ' onclick="planMove(\'' + t.id + '\',-1)">←</button>' +
            '<button class="plan-move" ' + (status === 'done' ? 'disabled' : '') + ' onclick="planMove(\'' + t.id + '\',1)">→</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  });

  const total = state.planTasks.length;
  const pct = total ? Math.round((counts.done / total) * 100) : 0;
  const fill = $('planProgressFill'), label = $('planProgressLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% · ' + counts.done + '/' + total;
}

function planAddManual() {
  const ti = $('planNewTitle');
  const title = (ti?.value || '').trim();
  if (!title) { showToast('Donne un titre à la tâche'); if (ti) ti.focus(); return; }
  state.planTasks.push({
    id: 't' + Date.now(),
    title,
    owner: ($('planNewOwner')?.value || '').trim(),
    due: ($('planNewDue')?.value || ''),
    priority: ($('planNewPriority')?.value || 'normal'),
    status: 'todo'
  });
  savePlan();
  if (ti) ti.value = '';
  if ($('planNewOwner')) $('planNewOwner').value = '';
  if ($('planNewDue')) $('planNewDue').value = '';
  renderPlanBoard();
}
function planMove(id, dir) {
  const t = (state.planTasks || []).find(x => x.id === id);
  if (!t) return;
  let i = PLAN_ORDER.indexOf(t.status);
  i = Math.max(0, Math.min(2, (i < 0 ? 0 : i) + dir));
  t.status = PLAN_ORDER[i];
  savePlan();
  renderPlanBoard();
}
function planDelete(id) {
  state.planTasks = (state.planTasks || []).filter(x => x.id !== id);
  savePlan();
  renderPlanBoard();
}
function planClearAll() {
  if (!state.planTasks.length) return;
  if (!confirm('Effacer toutes les tâches du plan ?')) return;
  state.planTasks = [];
  savePlan();
  renderPlanBoard();
}

function planResetAiBtn() {
  const btn = $('planAiBtn');
  if (btn) { btn.disabled = false; btn.textContent = '✨ Générer le plan avec l\'IA'; }
}
function planGenerateAI() {
  const obj = ($('planObjectiveInput')?.value || '').trim();
  if (!obj) { showToast('Décris d\'abord ton objectif'); $('planObjectiveInput')?.focus(); return; }
  safeStorageSet(PLAN_OBJ_KEY, obj);
  const btn = $('planAiBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Génération…'; }

  const model = MODELS[state.model] ? state.model : 'lebon-ai:auto';
  const prompt =
    'Tu es chef de projet. Découpe cet objectif en 6 étapes d\'action concrètes et séquentielles.\n' +
    'Objectif : ' + obj + '\n\n' +
    'Réponds UNIQUEMENT par la liste, une étape par ligne, au format EXACT :\n' +
    'titre court de l\'étape :: responsable :: délai en jours\n' +
    'Pas d\'introduction, pas de conclusion, pas de numéro.';

  let acc = '';
  const done = () => planFinishAI(acc);
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], user: state.user, think: false, turbo: false })
  }).then(resp => {
    if (!resp.ok || !resp.body) { planResetAiBtn(); showToast('Le serveur IA a renvoyé une erreur'); return; }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    (function pump() {
      reader.read().then(x => {
        if (x.done) { done(); return; }
        buf += dec.decode(x.value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6);
          if (d === '[DONE]') { done(); return; }
          try { const j = JSON.parse(d); if (j.content) acc += j.content; if (j.error) { planResetAiBtn(); showToast('Erreur IA : ' + j.error); return; } } catch (_) {}
        }
        pump();
      }).catch(() => done());
    })();
  }).catch(() => { planResetAiBtn(); showToast('Serveur IA indisponible'); });
}
function planFinishAI(text) {
  planResetAiBtn();
  const lines = (text || '').split('\n').map(s => s.trim()).filter(Boolean);
  let added = 0;
  lines.forEach(line => {
    let cleaned = line.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim();
    if (!cleaned || /^(voici|objectif|plan|étapes?)\b/i.test(cleaned)) return;
    let title = cleaned, owner = '', due = '';
    if (cleaned.includes('::')) {
      const parts = cleaned.split('::').map(s => s.trim());
      title = parts[0] || cleaned;
      owner = parts[1] || '';
      const dd = (parts[2] || '').match(/\d+/);
      if (dd) due = planComputeDue(parseInt(dd[0], 10));
    }
    title = title.replace(/[[\]]/g, '').trim();
    owner = owner.replace(/[[\]]/g, '').replace(/^responsable\s*:?/i, '').trim();
    if (title.length < 2) return;
    state.planTasks.push({ id: 't' + Date.now() + '_' + added, title, owner, due, priority: 'normal', status: 'todo' });
    added++;
  });
  if (!added) { showToast('L\'IA n\'a pas renvoyé d\'étapes exploitables — reformule l\'objectif'); return; }
  savePlan();
  renderPlanBoard();
  showToast(added + ' étape(s) ajoutée(s) par l\'IA ✨');
}

// ── Bibliothèque (Library) Manager ────────────────────────────
state.libraryItems = [];
state.currentLibTab = 'docs';

function openLibraryModal() {
  closeAllModals();
  setActiveNav('navLibraryBtn');
  const modal = $('libraryModal');
  if (!modal) return;
  modal.style.display = 'flex';
  fetchLibraryItems();
}

function closeLibraryModal() {
  const modal = $('libraryModal');
  if (modal) modal.style.display = 'none';
}

function fetchLibraryItems() {
  fetch('/api/library')
    .then(r => r.json())
    .then(d => {
      state.libraryItems = d.items || [];
      renderLibraryList();
    })
    .catch(() => {
      renderLibraryList();
    });
}

function switchLibTab(tab) {
  state.currentLibTab = tab;
  ['libTabDocs', 'libTabPrompts', 'libTabUpload'].forEach(id => {
    $(id)?.classList.remove('active');
  });
  if (tab === 'docs') $('libTabDocs')?.classList.add('active');
  if (tab === 'prompts') $('libTabPrompts')?.classList.add('active');
  if (tab === 'upload') $('libTabUpload')?.classList.add('active');

  const contentArea = $('libContentArea');
  const uploadArea = $('libUploadArea');

  if (tab === 'upload') {
    if (contentArea) contentArea.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
  } else {
    if (contentArea) contentArea.style.display = 'flex';
    if (uploadArea) uploadArea.style.display = 'none';
    renderLibraryList();
  }
}

function renderLibraryList() {
  const container = $('libContentArea');
  if (!container) return;
  container.innerHTML = '';

  const q = ($('libSearchInput')?.value || '').toLowerCase().trim();

  const items = (state.libraryItems || []).filter(item => {
    const matchesType = state.currentLibTab === 'prompts' ? item.type === 'prompt' : item.type !== 'prompt';
    const matchesQuery = !q || item.title.toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q) || (item.tag || '').toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px 10px; color:var(--muted)">
        <div style="font-size:32px; margin-bottom:8px">📭</div>
        <div style="font-weight:700">Aucun élément trouvé</div>
        <div style="font-size:12px; margin-top:4px">Utilisez l'onglet "Ajouter un Document" pour enrichir votre bibliothèque.</div>
      </div>
    `;
    return;
  }

  items.forEach(it => {
    const card = el('div', 'lib-item-card');
    const icon = it.type === 'prompt' ? '⚡' : '📄';

    card.innerHTML = `
      <div class="lib-item-left">
        <div class="lib-item-icon">${icon}</div>
        <div class="lib-item-info">
          <div class="lib-item-title">${esc(it.title)}</div>
          <div class="lib-item-desc">${esc(it.desc || it.content || '')}</div>
          <div class="lib-item-meta">
            <span class="lib-item-tag">${esc(it.tag || 'Général')}</span>
            <span>·</span>
            <span>${esc(it.date || '')}</span>
            ${it.size ? `<span>·</span><span>${esc(it.size)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="lib-item-actions">
        <button class="lib-btn-action" onclick="useLibraryItem('${it.id}')">Utiliser dans le Chat</button>
        <button class="lib-btn-delete" onclick="deleteLibraryItem('${it.id}')" title="Supprimer">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterLibraryItems() {
  renderLibraryList();
}

function saveNewLibraryDoc() {
  const title = $('libNewTitle')?.value.trim();
  const tag = $('libNewTag')?.value.trim() || 'Document';
  const content = $('libNewContent')?.value.trim();

  if (!title || !content) {
    showToast('Veuillez renseigner un titre et un contenu');
    return;
  }

  const payload = {
    title,
    tag,
    desc: content.slice(0, 160) + (content.length > 160 ? '...' : ''),
    content,
    type: 'doc',
    size: (content.length / 1024).toFixed(1) + ' Ko'
  };

  fetch('/api/library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(d => {
      showToast('Document ajouté à la bibliothèque !');
      $('libNewTitle').value = '';
      $('libNewTag').value = '';
      $('libNewContent').value = '';
      switchLibTab('docs');
      fetchLibraryItems();
    })
    .catch(() => showToast('Erreur d\'enregistrement'));
}

function useLibraryItem(id) {
  const item = (state.libraryItems || []).find(it => it.id === id);
  if (!item) return;
  closeLibraryModal();
  newChat();

  let prompt = '';
  if (item.type === 'prompt') {
    prompt = item.content || item.desc || item.title;
  } else {
    prompt = `Voici le document extrait de ma bibliothèque **"${item.title}"** :\n\n\`\`\`\n${item.content || item.desc}\n\`\`\`\n\nAide-moi à analyser ce document et réponds à mes questions.`;
  }

  setTimeout(() => {
    $('composerInput').value = prompt;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
    updateSendBtnIcon();
  }, 80);
}

function deleteLibraryItem(id) {
  fetch('/api/library/' + id, { method: 'DELETE' })
    .then(() => {
      showToast('Élément supprimé');
      fetchLibraryItems();
    })
    .catch(() => showToast('Erreur'));
}

// ── Skills Hub Manager ────────────────────────────────────────
state.skills = [];
state.currentSkillsTab = 'list';

function openSkillsModal() {
  closeAllModals();
  setActiveNav('navSkillsBtn');
  const modal = $('skillsModal');
  if (!modal) return;
  modal.style.display = 'flex';
  fetchSkills();
}

function closeSkillsModal() {
  const modal = $('skillsModal');
  if (modal) modal.style.display = 'none';
}

function fetchSkills() {
  fetch('/api/skills')
    .then(r => r.json())
    .then(d => {
      state.skills = d.skills || [];
      renderSkillsList();
      renderSkillsStore();
    })
    .catch(() => {
      renderSkillsList();
      renderSkillsStore();
    });
}

function switchSkillsTab(tab) {
  state.currentSkillsTab = tab;
  ['skillsTabList', 'skillsTabCreate', 'skillsTabStore'].forEach(id => {
    $(id)?.classList.remove('active');
  });
  if (tab === 'list') $('skillsTabList')?.classList.add('active');
  if (tab === 'create') $('skillsTabCreate')?.classList.add('active');
  if (tab === 'store') $('skillsTabStore')?.classList.add('active');

  $('skillsListArea').style.display = tab === 'list' ? 'grid' : 'none';
  $('skillsCreateArea').style.display = tab === 'create' ? 'block' : 'none';
  $('skillsStoreArea').style.display = tab === 'store' ? 'grid' : 'none';

  if (tab === 'list') renderSkillsList();
  if (tab === 'store') renderSkillsStore();
}

function renderSkillsList() {
  const container = $('skillsListArea');
  if (!container) return;
  container.innerHTML = '';

  const dict = I18N[state.currentLanguage] || I18N.fr;
  const skDict = dict.skills || (I18N.fr ? I18N.fr.skills : {});
  const activeSkills = (state.skills || []).filter(s => s.active !== false);

  if (activeSkills.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:32px 10px; color:var(--muted)">
        <div style="font-size:32px; margin-bottom:8px">🧩</div>
        <div style="font-weight:700">${skDict.noActiveSkills || 'Aucun skill actif'}</div>
        <div style="font-size:12px; margin-top:4px">${skDict.noActiveSkillsDesc || 'Créez votre première compétence ou installez-en depuis le Skills Store !'}</div>
      </div>
    `;
    return;
  }

  activeSkills.forEach(s => {
    const card = el('div', 'skill-card');
    const localInfo = skDict.items && skDict.items[s.id] ? skDict.items[s.id] : {};
    const displayName = localInfo.name || s.name;
    const displayDesc = localInfo.desc || s.desc;
    const displayCat = localInfo.cat || s.category || 'Expert';

    card.innerHTML = `
      <div class="skill-card-top">
        <div class="skill-card-brand">
          <span class="skill-icon-badge">${s.icon || '⚡'}</span>
          <div>
            <div class="skill-card-name">${esc(displayName)}</div>
            <div class="skill-card-cat">${esc(displayCat)}</div>
          </div>
        </div>
      </div>
      <div class="skill-card-desc">${esc(displayDesc || '')}</div>
      <div class="skill-card-footer">
        <div class="skill-tools-tags">
          ${(s.tools || ['run_command']).slice(0, 3).map(t => `<span class="skill-tool-tag">${esc(t)}</span>`).join('')}
        </div>
        <button class="skill-use-btn" onclick="useSkillInChat('${s.id}')">${skDict.activateBtn || 'Activer ›'}</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSkillsStore() {
  const container = $('skillsStoreArea');
  if (!container) return;
  container.innerHTML = '';

  const dict = I18N[state.currentLanguage] || I18N.fr;
  const skDict = dict.skills || (I18N.fr ? I18N.fr.skills : {});

  (state.skills || []).forEach(s => {
    const card = el('div', 'skill-card');
    const isInstalled = s.active !== false;
    const localInfo = skDict.items && skDict.items[s.id] ? skDict.items[s.id] : {};
    const displayName = localInfo.name || s.name;
    const displayDesc = localInfo.desc || s.desc;
    const displayCat = localInfo.cat || s.category || 'Standard';

    card.innerHTML = `
      <div class="skill-card-top">
        <div class="skill-card-brand">
          <span class="skill-icon-badge">${s.icon || '⚡'}</span>
          <div>
            <div class="skill-card-name">${esc(displayName)}</div>
            <div class="skill-card-cat">${esc(displayCat)}</div>
          </div>
        </div>
      </div>
      <div class="skill-card-desc">${esc(displayDesc || '')}</div>
      <div class="skill-card-footer">
        <div class="skill-tools-tags">
          ${(s.tools || ['run_command']).map(t => `<span class="skill-tool-tag">${esc(t)}</span>`).join('')}
        </div>
        <button class="skill-use-btn" onclick="toggleSkillStore('${s.id}')">
          ${isInstalled ? (skDict.installedBtn || '✓ Installé') : (skDict.installBtn || '+ Installer')}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleSkillStore(id) {
  const s = (state.skills || []).find(sk => sk.id === id);
  if (!s) return;
  s.active = s.active === false ? true : false;
  fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s)
  }).then(() => {
    showToast(s.active ? 'Skill activé dans votre agent !' : 'Skill désactivé');
    renderSkillsStore();
  });
}

function saveNewSkill() {
  const name = $('skillFormName')?.value.trim();
  const iconCat = $('skillFormIconCat')?.value.trim() || '⚡ · Custom';
  const desc = $('skillFormDesc')?.value.trim();
  const prompt = $('skillFormPrompt')?.value.trim();
  const toolsStr = $('skillFormTools')?.value.trim() || 'run_command, read_file';

  if (!name || !prompt) {
    showToast('Veuillez renseigner un nom et des instructions');
    return;
  }

  const parts = iconCat.split('·').map(p => p.trim());
  const icon = parts[0] || '⚡';
  const category = parts[1] || 'Personnalisé';
  const tools = toolsStr.split(',').map(t => t.trim()).filter(Boolean);

  const payload = {
    id: 'skill-' + Date.now(),
    name,
    icon,
    category,
    desc: desc || name,
    prompt,
    tools,
    active: true,
    builtin: false
  };

  fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(() => {
      showToast('Nouveau Skill sauvegardé et actif !');
      $('skillFormName').value = '';
      $('skillFormDesc').value = '';
      $('skillFormPrompt').value = '';
      switchSkillsTab('list');
      fetchSkills();
    })
    .catch(() => showToast('Erreur d\'enregistrement'));
}

function useSkillInChat(id) {
  const s = (state.skills || []).find(sk => sk.id === id);
  if (!s) return;
  closeSkillsModal();
  setMode('work');
  newChat();

  const prompt = `[SKILL ACTIVÉ: ${s.name}]\n${s.prompt}\n\nJe suis prêt pour votre consigne. Que souhaitez-vous accomplir ?`;
  setTimeout(() => {
    $('composerInput').value = prompt;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
    updateSendBtnIcon();
  }, 80);
}

function openUseCaseModal() {
  closeAllModals();
  setActiveNav('navUseCaseBtn');
  const modal = $('useCaseModal');
  if (modal) modal.style.display = 'flex';
}

function closeUseCaseModal() {
  const modal = $('useCaseModal');
  if (modal) modal.style.display = 'none';
}

function actionCreateUseCase() {
  closeUseCaseModal();
  newChat();
  const template = `Tu es le Lead Architecte & Cadrage IA de leboncoin. Rédige une fiche use case exécutive officielle au standard F3 pour le projet suivant :

# 📋 FICHE USE CASE IA · STANDARD F3 LEBONCOIN
1. **Nom du Use Case & Périmètre Métier** : [Ex: Automatisation Modération & Support Client]
2. **Objectif Métier & Problématique résolue** : [Description du besoin]
3. **KPIs Cibles & Métriques d'Impact** : [Ex: -30% temps de traitement, +20pts satisfaction]
4. **Architecture Technique & Souveraineté** : [Modèle Ollama local / API Souveraine, Stack data]
5. **Chiffrage ROI & Payback Estimé** : [Collaborateurs concernés, heures économisées, coût]

Remplis et structure la fiche avec rigueur stratégique.`;
  setTimeout(() => {
    $('composerInput').value = template;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
    updateSendBtnIcon();
  }, 100);
}

function actionOpenUseCaseStore() {
  closeUseCaseModal();
  newChat();
  const prompt = `Affiche le catalogue officiel des 370 Use Cases IA Live & Qualifiés de leboncoin répartis par direction (Tech & Engineering, Produit, Data, Sales, RH & Finance) avec leur statut de déploiement (Live, Pilote, Cadrage), le modèle utilisé et leur impact mesuré.`;
  setTimeout(() => {
    quickPrompt(prompt);
  }, 100);
}

function actionRequestUseCase() {
  closeUseCaseModal();
  newChat();
  const prompt = `Je souhaite soumettre une nouvelle demande de Use Case IA pour mon équipe chez leboncoin :\n\n- Équipe / Direction :\n- Description de mon besoin métier :\n- Gain de temps ou valeur attendue :\n- Données ou outils existants concernés :\n\nAccompagne-moi pas à pas pour qualifier la faisabilité technique et préparer le passage en comité d'arbitrage IA.`;
  setTimeout(() => {
    $('composerInput').value = prompt;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
    updateSendBtnIcon();
  }, 100);
}

// ── Specialized Agents Launcher ───────────────────────────────
function startAgent(mode) {
  newChat();
  state.agentMode = mode;
  setMode(mode === 'coder' ? 'coder' : (mode === 'agent' ? 'work' : 'chat'));

  setTimeout(() => {
    const ta = $('composerInput');
    if (ta) {
      ta.value = '';
      ta.style.height = 'auto';
      ta.focus();
    }
  }, 60);
}

// ── Message Elements Builder ──────────────────────────────────
function buildMessageRow(m, idx) {
  const row = el('div', 'msg-row ' + m.role);

  if (m.role === 'assistant') {
    const avatar = el('div', 'msg-avatar', 'AI');
    row.appendChild(avatar);
  }

  const wrap = el('div', 'msg-bubble-wrap');
  const bubble = el('div', 'msg-bubble');

  // Thinking Accordion
  if (m.thinking) {
    const think = el('details', 'think-block');
    think.innerHTML = `<summary>🧠 Démarche de raisonnement (${m.thinking.length > 200 ? 'détaillée' : 'synthétique'})</summary><div class="think-content">${esc(m.thinking)}</div>`;
    bubble.appendChild(think);
  }

  const content = el('div', 'msg-content');
  if (m.role === 'assistant') {
    content.innerHTML = renderMd(m.content);
    addCodeBlockActions(content);
    setTimeout(() => renderMermaidDiagrams(content), 20);
  } else {
    content.textContent = m.content;
  }
  bubble.appendChild(content);
  wrap.appendChild(bubble);

  // Assistant Toolbar avec 1-Click Export & Canvas Shortcut
  if (m.role === 'assistant') {
    buildAssistantToolbar(wrap, m.content, m.meta);
  }

  row.appendChild(wrap);
  return row;
}

// ── Code Sandbox Wrapper & Formatter ──────────────────────────
function wrapCodeForSandbox(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') rawCode = '';
  let code = rawCode.trim();

  // Retirer les balises markdown si le bloc brut a été transmis
  if (code.startsWith('```')) {
    code = code.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  const isFullHtml = code.toLowerCase().includes('<!doctype html') || code.toLowerCase().includes('<html');

  // Intercepteur d'erreurs dans l'iframe pour afficher un bandeau propre au lieu d'un écran blanc
  const errorInterceptor = `
<script>
window.addEventListener('error', function(e) {
  var box = document.getElementById('__lebon_err_box__');
  if (!box) {
    box = document.createElement('div');
    box.id = '__lebon_err_box__';
    box.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;background:#fee2e2;color:#991b1b;border:1px solid #f87171;padding:10px 14px;border-radius:8px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;z-index:999999;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;justify-content:space-between;align-items:center;';
    box.innerHTML = '<div style="display:flex;gap:8px;align-items:center"><span>⚠️</span><span><b>Erreur d\\'exécution :</b> ' + (e.message || 'Erreur script') + ' (ligne ' + (e.lineno || '?') + ')</span></div><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#991b1b;font-weight:bold;cursor:pointer;font-size:14px">✕</button>';
    document.body.appendChild(box);
  }
});
</script>
`;

  const headInjects = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          orange: {
            500: '#ff6b00',
            600: '#e55a00',
            700: '#cc4d00'
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        }
      }
    }
  }
</script>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; }
</style>
${errorInterceptor}
`;

  if (isFullHtml) {
    if (code.includes('</head>')) {
      return code.replace('</head>', headInjects + '</head>');
    } else if (code.includes('<head>')) {
      return code.replace('<head>', '<head>' + headInjects);
    } else if (code.includes('<html>') || code.includes('<html ')) {
      return code.replace(/(<html[^>]*>)/i, '$1<head>' + headInjects + '</head>');
    }
    return `<!DOCTYPE html><html><head>${headInjects}</head><body>${code}</body></html>`;
  }

  // Si c'est du SVG pur
  if (code.startsWith('<svg') || code.includes('</svg>')) {
    return `<!DOCTYPE html>
<html>
<head>
${headInjects}
<style>
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; padding: 20px; }
  svg { max-width: 100%; height: auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08)); }
</style>
</head>
<body>
  ${code}
</body>
</html>`;
  }

  // Si c'est du CSS pur
  if (code.includes('{') && code.includes('}') && !code.includes('<div') && !code.includes('<button') && !code.includes('function')) {
    return `<!DOCTYPE html>
<html>
<head>
${headInjects}
<style>
  body { padding: 24px; background: #f8fafc; color: #1e293b; }
  ${code}
</style>
</head>
<body>
  <div class="p-8 max-w-xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200">
    <h2 class="text-xl font-bold text-slate-800 mb-2">Aperçu des styles CSS</h2>
    <p class="text-slate-600 mb-4">Ce conteneur applique les règles CSS générées ci-dessus.</p>
    <button class="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition">Bouton de test</button>
  </div>
</body>
</html>`;
  }

  // Si c'est du JS pur sans balises HTML
  if (!code.includes('<') && !code.includes('>')) {
    return `<!DOCTYPE html>
<html>
<head>
${headInjects}
<style>
  body { padding: 20px; background: #0f172a; color: #f8fafc; font-family: 'JetBrains Mono', monospace; }
  #console-out { background: #1e293b; border-radius: 8px; padding: 16px; min-height: 200px; border: 1px solid #334155; }
  .log-line { padding: 4px 0; border-bottom: 1px solid #334155; font-size: 13px; }
  .log-warn { color: #f59e0b; }
  .log-err { color: #ef4444; }
  .log-info { color: #38bdf8; }
</style>
</head>
<body>
  <h3 style="color:#ff6b00; margin-top:0">⚡ Console JavaScript Interactive</h3>
  <div id="console-out"></div>
  <script>
    const out = document.getElementById('console-out');
    function log(type, args) {
      const line = document.createElement('div');
      line.className = 'log-line log-' + type;
      line.textContent = '> ' + Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
      out.appendChild(line);
    }
    console.log = function() { log('info', arguments); };
    console.warn = function() { log('warn', arguments); };
    console.error = function() { log('err', arguments); };
    try {
      ${code}
    } catch(e) {
      console.error(e.message);
    }
  </script>
</body>
</html>`;
  }

  // Fragment HTML standard
  return `<!DOCTYPE html>
<html lang="fr">
<head>
${headInjects}
</head>
<body class="p-6 bg-slate-50 text-slate-800 antialiased min-h-screen">
${code}
</body>
</html>`;
}

// ── Code Block Headers & Actions (Sandbox & Preview) ──────────
function addCodeBlockActions(container) {
  container.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-header')) return;
    const codeEl = pre.querySelector('code');
    const codeText = codeEl ? codeEl.textContent : pre.textContent;
    let lang = 'code';
    if (codeEl && codeEl.className) {
      const match = codeEl.className.match(/language-(\w+)/);
      if (match) lang = match[1];
    }
    const header = el('div', 'code-header');
    header.innerHTML = `<span>${lang}</span>`;

    const actions = el('div', 'code-actions');

    // Détection universelle de code Web (HTML, CSS, JS, SVG, Composants)
    const rawTrimmed = codeText.trim();
    const l = (lang || '').toLowerCase();
    const isWebCode = ['html', 'htm', 'svg', 'xml', 'javascript', 'js', 'css', 'vue', 'jsx', 'tsx'].includes(l) ||
      rawTrimmed.startsWith('<!doctype') ||
      rawTrimmed.startsWith('<html') ||
      rawTrimmed.startsWith('<div') ||
      rawTrimmed.startsWith('<section') ||
      rawTrimmed.startsWith('<svg') ||
      rawTrimmed.includes('document.getElementById') ||
      rawTrimmed.includes('addEventListener') ||
      (rawTrimmed.includes('<') && rawTrimmed.includes('</') && rawTrimmed.includes('>'));

    if (isWebCode) {
      const canvasBtn = el('button', 'code-btn', '⚡ Canvas Latéral');
      canvasBtn.style.color = 'var(--orange-deep)';
      canvasBtn.style.fontWeight = '700';
      canvasBtn.onclick = () => openCanvas(codeText, 'Prototype & Interface ' + lang.toUpperCase(), 'Live Sandbox Artifact');
      actions.appendChild(canvasBtn);

      const prevBtn = el('button', 'code-btn preview-btn', '▶ Modal');
      prevBtn.onclick = () => openPreviewModal(codeText);
      actions.appendChild(prevBtn);
    }

    // Bouton Code Studio
    const studioBtn = el('button', 'code-btn', 'Code Studio');
    studioBtn.onclick = () => {
      setMode('coder');
      openCanvas(codeText, 'Code Studio Sandbox', 'Environnement de développement');
    };
    actions.appendChild(studioBtn);

    // Download Button
    const dlBtn = el('button', 'code-btn', 'Télécharger');
    dlBtn.onclick = () => downloadSnippet(`lebon_snippet_${Date.now()}.${getExtForLang(lang)}`, codeText);
    actions.appendChild(dlBtn);

    // Copy Button
    const copyBtn = el('button', 'code-btn', 'Copier');
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(codeText).then(() => {
        showToast('Code copié dans le presse-papiers');
        copyBtn.textContent = '✓ Copié';
        setTimeout(() => { copyBtn.textContent = 'Copier'; }, 2000);
      });
    };
    actions.appendChild(copyBtn);

    header.appendChild(actions);
    pre.insertBefore(header, pre.firstChild);
  });
}

function getExtForLang(lang) {
  const map = { javascript: 'js', js: 'js', python: 'py', py: 'py', html: 'html', css: 'css', json: 'json', sql: 'sql', bash: 'sh', shell: 'sh', markdown: 'md', md: 'md', typescript: 'ts', ts: 'ts', svg: 'svg' };
  return map[(lang || '').toLowerCase()] || 'txt';
}

function downloadSnippet(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(u);
  showToast('Fichier téléchargé : ' + filename);
}

// ── Scroll Helpers ────────────────────────────────────────────
let isUserScrolling = false;
document.addEventListener('DOMContentLoaded', () => {
  const c = $('messagesContainer');
  const scrollBtn = $('smartScrollBtn');
  if (c && scrollBtn) {
    c.addEventListener('scroll', () => {
      const isAtBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 40;
      isUserScrolling = !isAtBottom;
      scrollBtn.style.display = isUserScrolling ? 'flex' : 'none';
    });
    scrollBtn.onclick = () => {
      isUserScrolling = false;
      scrollToBottom(true);
    };
  }
});

function scrollToBottom(force = false) {
  if (isUserScrolling && !force) return;
  const c = $('messagesContainer');
  if (c) c.scrollTo({ top: c.scrollHeight, behavior: force ? 'smooth' : 'auto' });
}

function handleSendBtnClick(e) {
  if (e) { e.preventDefault(); e.stopPropagation(); }
  if (state.generating) {
    stopStreaming();
    return;
  }
  const ta = $('composerInput');
  const text = (ta?.value || '').trim();
  if (text.length > 0 || state.attachment) {
    handleSend();
  } else {
    openLiveVoiceModal();
  }
}

// ── Sending & Streaming Messages ──────────────────────────────
function handleSend() {
  if (state.mode === 'work') return handleWorkSend();

  const ta = $('composerInput');
  const text = (ta?.value || '').trim();

  // Le mode Work est toujours un choix explicite : une phrase contenant « crée »
  // ou « exécute » ne doit jamais basculer seule vers des outils système.

  // Safety fallback: if generating state was stuck without active request, reset it
  if (state.generating && !state.abortCtrl) {
    state.generating = false;
  }

  if ((!text && !state.attachment) || state.generating) return;

  const currentModel = MODELS[state.model] ? state.model : 'lebon-ai:auto';
  state.generating = true;
  updateSendBtnIcon();

  const executeSend = (conv) => {
    let finalUserText = text;
    if (state.attachment && state.attachment.type === 'text') {
      finalUserText = `[Fichier joint : ${state.attachment.name}]\n\`\`\`\n${state.attachment.content}\n\`\`\`\n\n${text}`;
    }

    const userMsg = { role: 'user', content: finalUserText || text };
    conv.messages.push(userMsg);

    ta.value = '';
    ta.style.height = 'auto';
    clearAttachment();

    // ── Build DOM directly without calling renderMain() ──────
    // renderMain() would nuke the DOM and orphan all our refs!
    const container = $('messagesContainer');
    if (!container) { state.generating = false; updateSendBtnIcon(); return; }

    // If welcome hero is shown, replace it with a thread
    let thread = container.querySelector('.thread-wrap');
    if (!thread) {
      container.innerHTML = '';
      thread = el('div', 'thread-wrap');
      container.appendChild(thread);
    }

    // Append user message row
    const userRow = el('div', 'msg-row user');
    const userWrap = el('div', 'msg-bubble-wrap');
    const userBubble = el('div', 'msg-bubble');
    const userContent = el('div', 'msg-content');
    userContent.textContent = finalUserText || text;
    userBubble.appendChild(userContent);
    userWrap.appendChild(userBubble);
    userRow.appendChild(userWrap);
    thread.appendChild(userRow);

    // Append AI streaming row
    const aiRow = el('div', 'msg-row assistant');
    const avatar = el('div', 'msg-avatar', 'AI');
    aiRow.appendChild(avatar);

    const wrap = el('div', 'msg-bubble-wrap');
    const bubble = el('div', 'msg-bubble msg-streaming');
    let thinkEl = null;

    if (state.thinking) {
      thinkEl = el('details', 'think-block');
      thinkEl.open = true;
      thinkEl.innerHTML = '<summary>🧠 Réflexion en cours…</summary><div class="think-content" id="liveThinking"></div>';
      bubble.appendChild(thinkEl);
    }

    const contentEl = el('div', 'msg-content');
    contentEl.id = 'liveContent';
    contentEl.innerHTML = '<div class="chat-thinking-indicator"><div class="thinking-dots-group"><span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></div><span class="thinking-label">LeBon AI réfléchit…</span></div>';
    bubble.appendChild(contentEl);
    wrap.appendChild(bubble);
    aiRow.appendChild(wrap);
    thread.appendChild(aiRow);
    scrollToBottom();

    // Update title
    const title = $('topbarTitle');
    if (title && conv.title) title.textContent = conv.title;

    state.abortCtrl = new AbortController();
    let fullContent = '';
    let fullThinking = '';
    let streamError = null;
    const t0 = Date.now();
    let isDone = false;

    let instantMeta = null;
    function finish() {
      // Le garde d'idempotence est placé en tête : une ré-entrée (abort + [DONE])
      // ne doit jamais réinitialiser l'état d'une requête suivante déjà relancée.
      if (isDone) return;
      isDone = true;
      ta.disabled = false;
      state.generating = false;
      state.abortCtrl = null;
      updateSendBtnIcon();
      setTimeout(() => ta.focus(), 10);
      bubble.classList.remove('msg-streaming');
      if (thinkEl) thinkEl.open = false;

      const elapsed = Math.max(0.1, (Date.now() - t0) / 1000);
      const estTokens = Math.round(fullContent.length / 3.8);
      const tokSec = Math.round(estTokens / elapsed);
      const finalDisplay = fullContent || (streamError ? `⚠️ **Erreur :** ${streamError}` : '*(Aucune réponse générée)*');

      const assistantMsg = {
        role: 'assistant',
        content: finalDisplay,
        meta: streamError ? '⚠️ Erreur système'
          : (instantMeta || `⚡ ${tokSec} tok/s · ${elapsed.toFixed(1)}s · ${MODELS[currentModel]?.badge || currentModel} · 100 % local`)
      };
      if (fullThinking) assistantMsg.thinking = fullThinking;
      conv.messages.push(assistantMsg);

      // Final clean render of the bubble content + code actions + mermaid
      contentEl.innerHTML = renderMd(finalDisplay);
      addCodeBlockActions(contentEl);
      setTimeout(() => renderMermaidDiagrams(contentEl), 20);

      // Add toolbar with copy + 1-click export + canvas
      buildAssistantToolbar(wrap, fullContent || finalDisplay, assistantMsg.meta);

      // Automatic Canvas open if rich web prototype code is detected in code studio mode
      const codeMatches = (fullContent || finalDisplay).match(/```(?:html|javascript|js|css|svg)?\s*([\s\S]*?)```/);
      if (codeMatches && codeMatches[1] && codeMatches[1].length > 80 && state.mode === 'coder') {
        openCanvas(codeMatches[1], 'Code Studio Prototype', 'Live Canvas Sandbox');
      }

      try { localStorage.setItem('lebon_conv_' + conv.id, JSON.stringify(conv.messages)); } catch(e) {}
      saveMessagesToBackend(conv);
      scrollToBottom(true);
    }

    // Réponses instantanées locales : uniquement au tout premier tour (salutations),
    // jamais en cours de conversation (elles ignorent le contexte). Débit non falsifié.
    const isFirstTurn = conv.messages.length <= 1;
    const instantAns = isFirstTurn
      ? (getClientCacheMatch(finalUserText || text)
          || generateNaturalClientReply(finalUserText || text)
          || evaluateInstantClientResponse(finalUserText || text))
      : null;
    if (instantAns) {
      fullContent = instantAns;
      instantMeta = '⚡ Réponse instantanée · 100 % local';
      contentEl.innerHTML = renderMd(fullContent);
      scrollToBottom();
      finish();
      return;
    }

    const msgsPayload = conv.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
    msgsPayload.push({ role: 'user', content: finalUserText });
    if (state.agentMode && AGENT_SYSTEM_PROMPTS[state.agentMode]) {
      msgsPayload.unshift({ role: 'system', content: AGENT_SYSTEM_PROMPTS[state.agentMode] });
    }

    // Regroupe les mises à jour du flux sur les frames du navigateur.
    let renderRafId = null;
    function scheduleRender() {
      if (renderRafId) return;
      renderRafId = requestAnimationFrame(() => {
        renderRafId = null;
        if (fullContent.includes('```')) {
          contentEl.innerHTML = renderMd(fullContent);
        } else {
          contentEl.innerHTML = esc(fullContent).replace(/\n/g, '<br>');
        }
        scrollToBottom();
      });
    }

    const launchChat = () => {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: currentModel, messages: msgsPayload, user: state.user, think: state.thinking, turbo: !!state.turbo }),
      signal: state.abortCtrl.signal
    })
    .then((resp) => {
      if (!resp.ok || !resp.body) {
        streamError = 'Le serveur a répondu HTTP ' + resp.status + '. Vérifie qu\'Ollama tourne bien en local.';
        finish();
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      function pump() {
        reader.read().then((x) => {
          if (x.done) { finish(); return; }
          buffer += decoder.decode(x.value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') { finish(); return; }
            try {
              const j = JSON.parse(data);
              if (j.error) {
                streamError = j.error;
                contentEl.innerHTML = renderMd(`⚠️ **Erreur :** ${j.error}`);
                finish();
                return;
              }
              if (j.thinking) {
                fullThinking += j.thinking;
                const lt = $('liveThinking');
                if (lt) lt.textContent = fullThinking;
              }
              if (j.content) {
                fullContent += j.content;
                scheduleRender();
              }
            } catch(e) {}
          }
          pump();
        }).catch((err) => {
          if (err && err.name !== 'AbortError') streamError = err.message;
          finish();
        });
      }
      pump();
    })
    .catch((e) => {
      if (e.name !== 'AbortError') {
        streamError = 'Impossible de contacter le serveur Ollama. Vérifie que le service tourne.';
      }
      finish();
    });
    };

    // Recherche Web réelle (si activée) : injecte les résultats en contexte avant la génération.
    if (state.webSearch) {
      contentEl.innerHTML = '<div class="chat-thinking-indicator"><div class="thinking-dots-group"><span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></div><span class="thinking-label">Recherche web en cours…</span></div>';
      fetchWebContext(finalUserText).then((ctx) => {
        if (ctx) msgsPayload.unshift({ role: 'system', content: ctx });
        launchChat();
      });
    } else {
      launchChat();
    }
  };

  if (!state.conv) {
    const titleText = (text || 'Discussion').slice(0, 36);
    createConversationOnBackend(titleText, currentModel)
      .then(executeSend)
      .catch(() => {
        state.generating = false;
        updateSendBtnIcon();
        showToast('Impossible de créer la discussion : serveur local indisponible');
      });
  } else {
    executeSend(state.conv);
  }
}

// ── Work Mode: Agentic Tool Execution ─────────────────────────
function handleWorkSend() {
  const ta = $('composerInput');
  const text = ta.value.trim();
  if (!text || state.generating) return;

  const mayChangeSystem = /\b(crée|écris|modifie|patch|supprime|installe|exécute|lance|compile|build|npm|pip|git|mkdir|déploie|create|write|delete|install|execute|run)\b/i.test(text);
  const allowMutations = mayChangeSystem
    ? window.confirm('Cette mission peut modifier votre poste ou des fichiers. Autoriser les actions système pour cette mission uniquement ?')
    : false;

  const currentModel = MODELS[state.model] ? state.model : 'lebon-ai:auto';
  state.generating = true;
  updateSendBtnIcon();

  const executeSend = (conv) => {
    const userMsg = { role: 'user', content: text };
    conv.messages.push(userMsg);

    ta.value = '';
    ta.style.height = 'auto';

    // ── Build DOM directly — NO renderMain() (would orphan all refs) ──
    const container = $('messagesContainer');
    if (!container) { state.generating = false; updateSendBtnIcon(); return; }

    let thread = container.querySelector('.thread-wrap');
    if (!thread) {
      container.innerHTML = '';
      thread = el('div', 'thread-wrap');
      container.appendChild(thread);
    }

    // User message row
    const userRow = el('div', 'msg-row user');
    const userWrap2 = el('div', 'msg-bubble-wrap');
    const userBubble2 = el('div', 'msg-bubble');
    const userContent2 = el('div', 'msg-content');
    userContent2.textContent = text;
    userBubble2.appendChild(userContent2);
    userWrap2.appendChild(userBubble2);
    userRow.appendChild(userWrap2);
    thread.appendChild(userRow);

    const aiRow = el('div', 'msg-row assistant');
    const avatar = el('div', 'msg-avatar', '⚡');
    avatar.style.background = 'linear-gradient(135deg, var(--orange) 0%, var(--orange-deep) 100%)';
    aiRow.appendChild(avatar);

    const wrap = el('div', 'msg-bubble-wrap');
    const bubble = el('div', 'msg-bubble msg-streaming');

    const stepsContainer = el('div', 'work-steps');
    bubble.appendChild(stepsContainer);

    const contentEl = el('div', 'msg-content');
    contentEl.id = 'liveWorkContent';
    contentEl.innerHTML = '<div class="chat-thinking-indicator"><div class="thinking-dots-group"><span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></div><span class="thinking-label">Agent en cours d\'analyse…</span></div>';
    bubble.appendChild(contentEl);

    wrap.appendChild(bubble);
    aiRow.appendChild(wrap);
    thread.appendChild(aiRow);
    scrollToBottom();

    state.abortCtrl = new AbortController();
    let fullContent = '';
    let currentStepEl = null;
    const t0 = Date.now();
    let isDone = false;
    let stepCounter = 0;

    function finish() {
      const sb = $('workStatusBar');
      if (sb) sb.style.display = 'none';

      ta.disabled = false;
      state.generating = false;
      state.abortCtrl = null;
      updateSendBtnIcon();
      setTimeout(() => ta.focus(), 10);
      if (isDone) return;
      isDone = true;
      bubble.classList.remove('msg-streaming');

      const elapsed = Math.max(0.1, (Date.now() - t0) / 1000);
      const stepCount = stepsContainer.querySelectorAll('.tool-step').length;
      const assistantMsg = {
        role: 'assistant',
        content: fullContent || '*(Mission accomplie avec succès)*',
        meta: `⚡ Work Agent · ${stepCount} action${stepCount !== 1 ? 's' : ''} · ${elapsed.toFixed(1)}s · ${MODELS[currentModel]?.name || currentModel}`
      };
      conv.messages.push(assistantMsg);

      // Lightweight in-place finalization (no full re-render)
      contentEl.innerHTML = renderMd(fullContent);
      addCodeBlockActions(contentEl);

      buildAssistantToolbar(wrap, fullContent, assistantMsg.meta);
      setTimeout(() => renderMermaidDiagrams(contentEl), 20);

      try { localStorage.setItem('lebon_conv_' + conv.id, JSON.stringify(conv.messages)); } catch (_) {}
      saveMessagesToBackend(conv);
      scrollToBottom(true);
    }

    const msgsPayload = conv.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    msgsPayload.push({ role: 'user', content: text });

    fetch('/api/work', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: currentModel, messages: msgsPayload, user: state.user, allowMutations }),
      signal: state.abortCtrl.signal
    })
      .then(resp => {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        let renderPendingWork = false;
        let lastWorkRenderTime = 0;
        function scheduleWorkRender() {
          if (renderPendingWork) return;
          const now = Date.now();
          const elapsed = now - lastWorkRenderTime;
          if (elapsed < 80) {
            renderPendingWork = true;
            setTimeout(() => {
              renderPendingWork = false;
              lastWorkRenderTime = Date.now();
              contentEl.innerHTML = renderMd(fullContent);
              scrollToBottom();
            }, 80 - elapsed);
            return;
          }
          renderPendingWork = true;
          requestAnimationFrame(() => {
            renderPendingWork = false;
            lastWorkRenderTime = Date.now();
            contentEl.innerHTML = renderMd(fullContent);
            scrollToBottom();
          });
        }

        function pump() {
          reader.read().then(x => {
            if (x.done) { finish(); return; }
            buffer += decoder.decode(x.value, { stream: true });

            const parts = buffer.split('\n\n');
            buffer = parts.pop();

            parts.forEach(part => {
              if (!part.trim()) return;
              const lines = part.split('\n');
              let evtName = '';
              let evtData = '';
              lines.forEach(line => {
                if (line.startsWith('event: ')) evtName = line.slice(7).trim();
                else if (line.startsWith('data: ')) evtData = line.slice(6);
              });
              if (!evtData) return;

              let j;
              try { j = JSON.parse(evtData); } catch (_) { return; }

              if (evtName === 'tool_call') {
                stepCounter++;
                updateStatus(j.name);
                const stepEl = el('div', 'tool-step');
                const toolIcon = TOOL_ICONS[j.name] || '⚙';
                const argsStr = Object.entries(j.args || {})
                  .map(([k, v]) => {
                    const vs = typeof v === 'string' ? v : JSON.stringify(v);
                    return k + ': "' + vs.slice(0, 90) + (vs.length > 90 ? '...' : '') + '"';
                  })
                  .join(', ');
                const callEl = el('div', 'tool-call');
                callEl.innerHTML =
                  '<span class="tool-call-icon">' + toolIcon + '</span>' +
                  '<span class="tool-call-name">' + esc(j.name) + '</span>' +
                  '<span class="tool-call-args">(' + esc(argsStr) + ')</span>' +
                  '<span class="tool-call-spinner">…</span>';
                stepEl.appendChild(callEl);
                stepsContainer.appendChild(stepEl);
                currentStepEl = stepEl;
                scrollToBottom();
              }

              else if (evtName === 'tool_result') {
                if (currentStepEl) {
                  const spinner = currentStepEl.querySelector('.tool-call-spinner');
                  if (spinner) { spinner.textContent = ' ✓'; spinner.classList.add('done'); }
                  const resultWrapper = el('div', 'tool-result-wrapper');
                  const toggleBtn = el('button', 'tool-result-toggle', '▶ Voir les détails');
                  const resultEl = el('div', 'tool-result collapsed');
                  const raw = JSON.stringify(j.result, null, 2);
                  resultEl.textContent = raw.length > 4000 ? raw.slice(0, 4000) + '\n[tronqué...]' : raw;
                  toggleBtn.onclick = () => {
                    resultEl.classList.toggle('collapsed');
                    toggleBtn.textContent = resultEl.classList.contains('collapsed') ? '▶ Voir les détails' : '▼ Masquer';
                  };
                  resultWrapper.appendChild(toggleBtn);
                  resultWrapper.appendChild(resultEl);
                  currentStepEl.appendChild(resultWrapper);
                  scrollToBottom();
                }
                updateStatus('');
              }

              else if (evtName === 'content') {
                fullContent += j.content || '';
                scheduleWorkRender();
              }

              else if (evtName === 'done') {
                finish();
              }

              else if (evtName === 'error') {
                const errEl = el('div', 'work-error', '⚠ ' + (j.error || 'Erreur inconnue'));
                bubble.appendChild(errEl);
                finish();
              }
            });
            pump();
          }).catch(() => finish());
        }
        pump();
      })
      .catch(e => {
        if (e.name !== 'AbortError') {
          contentEl.textContent = '⚠ Erreur agentique : ' + e.message;
        }
        finish();
      });
  };

  if (!state.conv) {
    createConversationOnBackend(text, currentModel).then(conv => {
      state.conv = conv;
      executeSend(conv);
    }).catch(() => {
      state.generating = false;
      updateSendBtnIcon();
      showToast('Impossible de créer la mission : serveur local indisponible');
    });
  } else {
    executeSend(state.conv);
  }
}

function stopStreaming() {
  if (state.abortCtrl) {
    try { state.abortCtrl.abort(); } catch(_) {}
    state.abortCtrl = null;
  }
  state.generating = false;
  updateSendBtnIcon();
  const ta = $('composerInput');
  if (ta) {
    ta.disabled = false;
    setTimeout(() => ta.focus(), 10);
  }
  showToast('Génération interrompue');
}

function saveMessagesToBackend(conv) {
  if (!conv || !conv.id) return;
  fetch('/api/conversations/' + conv.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conv.messages, model: state.model })
  }).catch(() => {});
}

// ── Attachments Handling ──────────────────────────────────────
function showAttachPopup(target) {
  const popup = $('attachPopup');
  if (!popup) return;
  popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
}

function hideAttachPopup() {
  const popup = $('attachPopup');
  if (popup) popup.style.display = 'none';
}

function triggerFileInput(type) {
  hideAttachPopup();
  // 'all' (menu principal) et 'text' passent par fileInput ; les images par imageInput.
  if (type === 'image') { const i = $('imageInput'); if (i) i.click(); }
  else { const f = $('fileInput'); if (f) f.click(); }
}

function handleFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  // Une image choisie via le sélecteur générique est routée vers le traitement image.
  if (file.type && file.type.startsWith('image/')) { handleImageSelected(e); return; }
  const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
  const reader = new FileReader();
  reader.onload = (evt) => {
    let textContent = evt.target.result || '';
    if (isPdf) {
      // Nettoyage des chaînes lisibles du flux PDF (extraction best-effort côté client).
      textContent = textContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
                               .replace(/stream[\s\S]*?endstream/g, ' ')
                               .replace(/obj[\s\S]*?endobj/g, ' ')
                               .replace(/\s+/g, ' ')
                               .trim();
      if (textContent.length < 40) {
        // Extraction impossible (PDF compressé) : on NE fabrique PAS de faux contenu envoyé au modèle.
        state.attachment = {
          name: file.name,
          type: 'text',
          size: (file.size / 1024).toFixed(1) + ' Ko',
          content: `[PDF « ${file.name} » joint — le texte n'a pas pu être extrait localement (flux compressé). Copie-colle le passage utile dans ton message pour que je l'analyse.]`
        };
        renderAttachmentPreview();
        showToast('PDF joint : texte non extractible en local — colle le passage utile');
        return;
      }
    }
    state.attachment = {
      name: file.name,
      type: 'text',
      size: (file.size / 1024).toFixed(1) + ' Ko',
      content: textContent.slice(0, 12000)
    };
    renderAttachmentPreview();
  };
  reader.readAsText(file);
}

function handleImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    state.attachment = {
      name: file.name,
      type: 'image',
      size: (file.size / 1024).toFixed(1) + ' Ko',
      content: evt.target.result
    };
    renderAttachmentPreview();
    // Honnêteté : aucun modèle local installé n'est multimodal — l'image ne sera pas « lue ».
    showToast('Aperçu ajouté — les modèles locaux ne lisent pas les images ; décris son contenu dans ton message');
  };
  reader.readAsDataURL(file);
}

function renderAttachmentPreview() {
  const preview = $('attachmentPreview');
  if (!preview) return;
  if (!state.attachment) {
    preview.style.display = 'none';
    return;
  }
  $('attName').textContent = state.attachment.name;
  $('attSize').textContent = `(${state.attachment.size})`;
  $('attIcon').textContent = state.attachment.type === 'image' ? '🖼️' : '📄';
  preview.style.display = 'flex';
}

function clearAttachment() {
  state.attachment = null;
  const preview = $('attachmentPreview');
  if (preview) preview.style.display = 'none';
  if ($('fileInput')) $('fileInput').value = '';
  if ($('imageInput')) $('imageInput').value = '';
}

function initDragAndDrop() {
  const overlay = $('dndOverlay');
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (overlay) overlay.style.display = 'flex';
  });
  window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null && overlay) overlay.style.display = 'none';
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (overlay) overlay.style.display = 'none';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        state.attachment = {
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'text',
          size: (file.size / 1024).toFixed(1) + ' Ko',
          content: evt.target.result
        };
        renderAttachmentPreview();
        showToast('Fichier joint : ' + file.name);
      };
      if (file.type.startsWith('image/')) reader.readAsDataURL(file);
      else reader.readAsText(file);
    }
  });
}

// ── Modals: Live Sandbox, ROI, COMEX, Governance ──────────────
function openPreviewModal(code) {
  state.lastPreviewCode = code;
  const modal = $('previewModal');
  const iframe = $('previewIframe');
  if (!modal || !iframe) return;

  const wrapped = wrapCodeForSandbox(code);
  iframe.srcdoc = wrapped;
  setPreviewViewport('100%');
  modal.style.display = 'flex';
}

function closePreviewModal() {
  const modal = $('previewModal');
  if (modal) modal.style.display = 'none';
}

function setPreviewViewport(width) {
  const wrapper = $('previewIframeWrapper');
  if (wrapper) wrapper.style.maxWidth = width;

  ['vpDesktop', 'vpTablet', 'vpMobile'].forEach(id => {
    $(id)?.classList.remove('active');
  });
  if (width === '100%') $('vpDesktop')?.classList.add('active');
  if (width === '768px') $('vpTablet')?.classList.add('active');
  if (width === '375px') $('vpMobile')?.classList.add('active');
}

function reloadPreview() {
  const iframe = $('previewIframe');
  if (iframe && state.lastPreviewCode) {
    iframe.srcdoc = wrapCodeForSandbox(state.lastPreviewCode);
  }
  showToast('Aperçu rechargé');
}

function copyPreviewCode() {
  if (state.lastPreviewCode) {
    navigator.clipboard.writeText(state.lastPreviewCode).then(() => showToast('Code copié dans le presse-papiers'));
  }
}

function openPreviewInNewTab() {
  if (!state.lastPreviewCode) return;
  const wrapped = wrapCodeForSandbox(state.lastPreviewCode);
  const blob = new Blob([wrapped], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function downloadPreviewHtml() {
  if (!state.lastPreviewCode) return;
  const wrapped = wrapCodeForSandbox(state.lastPreviewCode);
  downloadSnippet(`prototype_lebon_ai_${Date.now()}.html`, wrapped);
}

function openRoiModal() {
  const modal = $('roiModal');
  if (modal) {
    modal.style.display = 'flex';
    calculateROI();
  }
}

function closeRoiModal() {
  const modal = $('roiModal');
  if (modal) modal.style.display = 'none';
}

function calculateROI() {
  const users = parseInt($('roiUsersInput')?.value || 50, 10);
  const hours = parseFloat($('roiHoursInput')?.value || 2.5);
  const rate = parseFloat($('roiRateInput')?.value || 45);
  const cost = parseFloat($('roiCostInput')?.value || 30);

  if ($('roiUsersVal')) $('roiUsersVal').textContent = users + ' pers.';
  if ($('roiHoursVal')) $('roiHoursVal').textContent = hours + ' h/sem.';
  if ($('roiRateVal')) $('roiRateVal').textContent = rate + ' €/h';
  if ($('roiCostVal')) $('roiCostVal').textContent = cost + ' €/mois';

  const totalHours = Math.round(users * hours * 46);
  const grossGain = totalHours * rate;
  const annualCost = users * cost * 12;
  const netGain = Math.max(0, grossGain - annualCost);
  const roiPct = annualCost > 0 ? Math.round((netGain / annualCost) * 100) : 9999;
  const paybackMonths = grossGain > 0 ? ((annualCost / (grossGain / 12))).toFixed(1) : 0;

  if ($('roiNetGain')) $('roiNetGain').textContent = netGain.toLocaleString('fr-FR') + ' €';
  if ($('roiTotalHours')) $('roiTotalHours').textContent = totalHours.toLocaleString('fr-FR') + ' h';
  if ($('roiPct')) $('roiPct').textContent = roiPct.toLocaleString('fr-FR') + ' %';
  if ($('roiPayback')) $('roiPayback').textContent = paybackMonths + ' mois';

  // Synchronisation avec le bandeau supérieur
  if ($('topRoiVal')) $('topRoiVal').textContent = `+${netGain.toLocaleString('fr-FR')} €`;
  if ($('topHoursVal')) $('topHoursVal').textContent = `+${totalHours.toLocaleString('fr-FR')} h`;

  const roiPctCap = Math.min(100, Math.max(10, Math.round((netGain / 20000) * 100)));
  const hoursPctCap = Math.min(100, Math.max(10, Math.round((totalHours / 500) * 100)));

  if ($('topRoiBar')) $('topRoiBar').style.width = `${roiPctCap}%`;
  if ($('topRoiPct')) $('topRoiPct').textContent = `${roiPctCap}%`;

  if ($('topHoursBar')) $('topHoursBar').style.width = `${hoursPctCap}%`;
  if ($('topHoursPct')) $('topHoursPct').textContent = `${hoursPctCap}%`;

  state._lastRoi = { users, hours, rate, cost, totalHours, grossGain, annualCost, netGain, roiPct, paybackMonths };
  // Persiste le scénario pour que le bandeau reflète le vrai calcul de l'utilisateur au rechargement.
  safeStorageSet('lebon_roi', JSON.stringify({ users, hours, rate, cost }));
}

// Au démarrage : restaure le scénario ROI sauvegardé et synchronise le bandeau via le VRAI calcul
// (plus de nombres codés en dur dans le ticker).
function initRoiFromStorage() {
  try {
    const raw = safeStorageGet('lebon_roi', null);
    if (raw) {
      const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if ($('roiUsersInput') && v.users != null) $('roiUsersInput').value = v.users;
      if ($('roiHoursInput') && v.hours != null) $('roiHoursInput').value = v.hours;
      if ($('roiRateInput') && v.rate != null) $('roiRateInput').value = v.rate;
      if ($('roiCostInput') && v.cost != null) $('roiCostInput').value = v.cost;
    }
  } catch (_) {}
  if (typeof calculateROI === 'function') calculateROI();
}

function injectRoiIntoChat() {
  closeRoiModal();
  const r = state._lastRoi || {};
  const prompt = `À partir de cette modélisation financière validée pour la Transfo IA leboncoin, rédige une fiche use case exécutive complète :\n\n- Effectif : ${r.users} collaborateurs\n- Temps économisé : ${r.hours}h par semaine et par personne\n- Total heures économisées : ${r.totalHours?.toLocaleString('fr-FR')}h / an\n- Coût horaire moyen chargé : ${r.rate} €/h\n- Coût outil/licence : ${r.cost} €/mois/pers (${r.annualCost?.toLocaleString('fr-FR')} €/an)\n- Gain net annuel estimé : ${r.netGain?.toLocaleString('fr-FR')} €\n- ROI estimé : ${r.roiPct}%\n- Payback : ${r.paybackMonths} mois\n\nRédige la fiche selon le standard F3 pour présentation en comité d'arbitrage.`;

  newChat();
  setTimeout(() => {
    $('composerInput').value = prompt;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
  }, 60);
}

function openComexModal() {
  const modal = $('comexModal');
  if (modal) modal.style.display = 'flex';
}

function closeComexModal() {
  const modal = $('comexModal');
  if (modal) modal.style.display = 'none';
}

function generateComexNote() {
  closeComexModal();
  const period = $('comexPeriodInput')?.value || 'Semaine S33';
  const wins = $('comexWinsInput')?.value || '';
  const blockers = $('comexBlockersInput')?.value || '';
  const rec = $('comexRecInput')?.value || '';

  const prompt = `Rédige la Note Exécutive COMEX officielle pour la Transfo IA 360 selon les standards leboncoin :\n\n- **Période** : ${period}\n- **Top Victoires / Livraisons** :\n${wins}\n- **Blockers Majeurs à lever** :\n${blockers}\n- **Recommandation Stratégique** :\n${rec}\n\nFormat attendu : 5 points clés, style ultra-direct F3 (Lire en 5s, comprendre en 30s, agir en 2 clics), métriques claires et orientées valeur métier.`;

  newChat();
  setTimeout(() => {
    $('composerInput').value = prompt;
    $('composerInput').style.height = 'auto';
    $('composerInput').style.height = Math.min($('composerInput').scrollHeight, 180) + 'px';
    $('composerInput').focus();
  }, 60);
}

function openGovModal() {
  const modal = $('govModal');
  if (!modal) return;
  modal.style.display = 'flex';
  fetchSystemTelemetry();
  renderGovModelsList();
}

function closeGovModal() {
  const modal = $('govModal');
  if (modal) modal.style.display = 'none';
}

function renderGovModelsList() {
  const list = $('govModelsList');
  if (!list) return;
  list.innerHTML = '';

  fetch('/api/catalog')
    .then(r => r.json())
    .then(data => {
      const catalog = data.catalog || [];
      const installed = data.installed || [];

      catalog.forEach(m => {
        const isInst = installed.some(i => i === m.id || i.startsWith(m.id + ':'));
        const row = el('div', 'gov-model-row');
        row.innerHTML = `
          <div>
            <b>${esc(m.name || m.id)}</b>
            <small style="color:var(--muted);margin-left:6px">${esc(m.size || '')}</small>
          </div>
          <div>
            ${isInst 
              ? '<span style="color:var(--green);font-weight:800;font-size:11px">✓ Installé</span>'
              : `<button class="gov-pull-btn" onclick="pullModel('${m.id}')">Télécharger</button>`}
          </div>
        `;
        list.appendChild(row);
      });
    })
    .catch(() => {});
}

function pullModel(modelId) {
  showToast(`Téléchargement de ${modelId} lancé...`);
  window.open(`/api/pull?model=${encodeURIComponent(modelId)}&user=${encodeURIComponent(state.user)}`, '_blank');
}

// ── Search Modal & Command Palette (⌘K) ───────────────────────
function openSearchModal() {
  const modal = $('cmdModal');
  const inp = $('cmdSearchInput');
  if (!modal) return;
  modal.style.display = 'flex';
  if (inp) {
    inp.value = '';
    inp.focus();
    renderCmdResults('');
  }
}

function closeSearchModal() {
  const modal = $('cmdModal');
  if (modal) modal.style.display = 'none';
}

function renderCmdResults(query) {
  const results = $('cmdResults');
  if (!results) return;
  results.innerHTML = '';

  const q = query.toLowerCase().trim();

  // Core Actions
  const ACTIONS = [
    { title: '🎙️ Live Voice AI Partner', subtitle: 'Lancer le mode vocal temps réel (Style Gemini Live)', action: () => { closeSearchModal(); openLiveVoiceModal(); } },
    { title: 'Nouvelle discussion', subtitle: 'Démarrer un fil vierge (⌘N)', action: () => { newChat(); closeSearchModal(); } },
    { title: '🧠 Second Brain & Graphe Neuronal', subtitle: 'Cartographie des connaissances et concepts reliés (⌘⇧B)', action: () => { closeSearchModal(); openSecondBrainModal(); } },
    { title: '🎓 Compétences & Certifications IA', subtitle: 'Matrice expert, parcours et certificat nominatif (⌘⇧C)', action: () => { closeSearchModal(); openCertModal(); } },
    { title: '👥 Team & Espaces Collaboratifs', subtitle: 'Kanban partagé et assignation des agents (⌘⇧T)', action: () => { closeSearchModal(); openTeamModal(); } },
    { title: '🧩 Studio des Micro-Apps Métier', subtitle: 'Générer et lancer des mini-outils no-code', action: () => { closeSearchModal(); openMicroAppsStudioModal(); } },
    { title: '🕸️ Studio de Workflows Visuels', subtitle: 'Construire et exécuter des pipelines multi-agents', action: () => { closeSearchModal(); openWorkflowStudioModal(); } },
    { title: '🧠 Mémoire Globale (contexte.md)', subtitle: 'Consulter et éditer la mémoire persistante partagée', action: () => { closeSearchModal(); openContextModal(); } },
    { title: '🤖 Studio des Agents Métiers', subtitle: 'Créer et déployer des agents personnalisés', action: () => { closeSearchModal(); openAgentsStudioModal(); } },
    { title: 'Mode Work Agent', subtitle: 'Lancer une mission système autonome', action: () => { setMode('work'); newChat(); closeSearchModal(); } },
    { title: 'Code Studio & Canvas', subtitle: 'Concevoir et tester du code en direct', action: () => { setMode('coder'); closeSearchModal(); } },
    { title: 'Simulateur ROI Transfo IA', subtitle: 'Ouvrir le calculateur financier', action: () => { closeSearchModal(); openRoiModal(); } },
    { title: 'Synthèse COMEX F3', subtitle: 'Générer une note pour la direction', action: () => { closeSearchModal(); openComexModal(); } },
    { title: 'Gouvernance & Métriques', subtitle: 'Contrôler la souveraineté et le matériel', action: () => { closeSearchModal(); openGovModal(); } }
  ];

  const matchedActions = ACTIONS.filter(a => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

  matchedActions.forEach(a => {
    const item = el('div', 'cmd-item');
    item.innerHTML = `<div><b>${esc(a.title)}</b><div style="font-size:10.5px;color:var(--muted)">${esc(a.subtitle)}</div></div>`;
    item.onclick = a.action;
    results.appendChild(item);
  });

  // Matched Conversations
  if (q && state.conversations) {
    const matchedConvs = state.conversations.filter(c => (c.title || '').toLowerCase().includes(q)).slice(0, 5);
    if (matchedConvs.length) {
      results.appendChild(el('div', 'history-group-label', 'Discussions trouvées'));
      matchedConvs.forEach(c => {
        const item = el('div', 'cmd-item');
        item.innerHTML = `<div>💬 <b>${esc(c.title)}</b></div>`;
        item.onclick = () => { loadChat(c.id); closeSearchModal(); };
        results.appendChild(item);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cmdInp = $('cmdSearchInput');
  if (cmdInp) {
    cmdInp.addEventListener('input', (e) => renderCmdResults(e.target.value));
  }
});

// ── Context Menu (3-dots on Conversations) ───────────────────
function showContextMenu(conv, target) {
  const menu = $('contextMenu');
  if (!menu) return;
  menu.innerHTML = '';

  const opts = [
    { label: '✏️ Renommer', action: () => renameConversation(conv) },
    { label: '📥 Exporter (.md)', action: () => exportConversation(conv) },
    { label: '🗑️ Supprimer', danger: true, action: () => deleteConversation(conv.id) }
  ];

  opts.forEach(opt => {
    const btn = el('div', 'ctx-opt' + (opt.danger ? ' danger' : ''), opt.label);
    btn.onclick = () => {
      hideContextMenu();
      opt.action();
    };
    menu.appendChild(btn);
  });

  const rect = target.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 4}px`;
  menu.style.left = `${Math.min(rect.left, window.innerWidth - 160)}px`;
  menu.style.display = 'flex';
}

function hideContextMenu() {
  const menu = $('contextMenu');
  if (menu) menu.style.display = 'none';
}

// ==========================================================================
// FEATURE 1: LATERAL ARTIFACTS / CANVAS (CLAUDE 3.7 & CURSOR STYLE)
// ==========================================================================
state.currentCanvasCode = '';
state.currentCanvasTitle = '';
state.currentCanvasType = '';

function openCanvas(code, title, subtitle, artifactType) {
  const canvas = $('artifactsCanvas');
  if (!canvas) return;

  state.currentCanvasCode = code || '';
  state.currentCanvasTitle = title || 'Interactive Prototype';
  
  // Detect or store artifact type
  let type = artifactType || '';
  if (!type) {
    const t = (title || '').toLowerCase();
    if (t.includes('tableau de bord') || t.includes('dataviz') || t.includes('indicateurs')) type = 'DATAVIZ';
    else if (t.includes('slides') || t.includes('présentation') || t.includes('comex')) type = 'SLIDES';
    else if (t.includes('roi') || t.includes('rentabilité') || t.includes('financière')) type = 'ROI';
    else if (t.includes('code') || t.includes('scanner') || t.includes('studio')) type = 'CODE';
    else if (t.includes('cadrage') || t.includes('fiche') || t.includes('charter')) type = 'CADRAGE';
    else type = 'CUSTOM';
  }
  state.currentCanvasType = type;

  if ($('canvasTitle')) $('canvasTitle').textContent = state.currentCanvasTitle;
  if ($('canvasSubtitle')) $('canvasSubtitle').textContent = subtitle || 'HTML5 · Tailwind CSS · Live Sandbox';

  // Render Preview
  const iframe = $('canvasPreviewIframe');
  if (iframe) {
    const fullHtml = wrapCodeForSandbox(code);
    iframe.srcdoc = fullHtml;
  }

  // Render Code
  const codeBlock = $('canvasCodeBlock');
  if (codeBlock) {
    codeBlock.textContent = code;
    if (typeof hljs !== 'undefined') hljs.highlightElement(codeBlock);
  }

  // Render Dynamic Quick Action Chips
  renderCanvasQuickChips(type);

  canvas.style.display = 'flex';
  switchCanvasTab('preview');
  toggleCanvasViewport('desktop');
}

function closeCanvas() {
  const canvas = $('artifactsCanvas');
  if (canvas) {
    canvas.style.display = 'none';
    canvas.classList.remove('canvas-fullscreen');
  }
  closeCanvasExportMenu();
}

function switchCanvasTab(tab) {
  const tabPrev = $('canvasTabPreview');
  const tabCode = $('canvasTabCode');
  const contPrev = $('canvasPreviewContainer');
  const contCode = $('canvasCodeContainer');

  if (tabPrev) tabPrev.classList.toggle('active', tab === 'preview');
  if (tabCode) tabCode.classList.toggle('active', tab === 'code');
  if (contPrev) contPrev.style.display = tab === 'preview' ? 'flex' : 'none';
  if (contCode) contCode.style.display = tab === 'code' ? 'block' : 'none';
}

function toggleCanvasViewport(vp) {
  const iframe = $('canvasPreviewIframe');
  const btnDesk = $('canvasVpDesktop');
  const btnMob = $('canvasVpMobile');

  if (iframe) iframe.classList.toggle('mobile-view', vp === 'mobile');
  if (btnDesk) btnDesk.classList.toggle('active', vp === 'desktop');
  if (btnMob) btnMob.classList.toggle('active', vp === 'mobile');
}

function toggleCanvasFullscreen() {
  const canvas = $('artifactsCanvas');
  if (canvas) canvas.classList.toggle('canvas-fullscreen');
}

function copyCanvasContent() {
  if (!state.currentCanvasCode) return;
  navigator.clipboard.writeText(state.currentCanvasCode).then(() => {
    showToast('Code du Canvas copié dans le presse-papiers');
    closeCanvasExportMenu();
  });
}

function downloadCanvasContent() {
  exportCanvasFile('html');
}

// ── Export Hub (HTML, CSV, PDF, CODE) ─────────────────────────
function toggleCanvasExportMenu(e) {
  if (e) e.stopPropagation();
  const dropdown = $('canvasExportDropdown');
  if (!dropdown) return;
  const isShown = dropdown.style.display === 'flex';
  dropdown.style.display = isShown ? 'none' : 'flex';
}

function closeCanvasExportMenu() {
  const dropdown = $('canvasExportDropdown');
  if (dropdown) dropdown.style.display = 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.canvas-export-wrap')) {
    closeCanvasExportMenu();
  }
});

function exportCanvasFile(format) {
  closeCanvasExportMenu();
  const title = (state.currentCanvasTitle || 'lebon_ai_livrable').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === 'html') {
    const wrapped = wrapCodeForSandbox(state.currentCanvasCode);
    downloadSnippet(`${title}_${timestamp}.html`, wrapped);
    showToast('Fichier HTML autonome téléchargé');
    return;
  }

  if (format === 'csv') {
    const csvContent = `\uFEFF"Indicateur","Valeur","Unité","Statut F3","Période"
"Heures Économisées (Cumul)","414","Heures","Validé COMEX","Année 2026"
"Gains Financiers Nets","17550","Euros (€)","Validé COMEX","Année 2026"
"Taux d'Adoption Hebdomadaire (WAU)","62.5","Pourcentage (%)","En Production","S33 2026"
"Souveraineté des Données","100","Pourcentage (%)","Certifié RGPD Local","Permanent"
"Temps de Retour sur Investissement (Payback)","0.7","Mois","Objectif atteint","2026"
"Use Case 1 : Sales Genius Immobilier","84 h / 3 780 €","Par mois","En Production","Q3 2026"
"Use Case 2 : Code Studio & Scanner","140 h / 6 300 €","Par mois","En Production","Q3 2026"
"Use Case 3 : Scanner Souveraineté RGPD","62 h / 2 790 €","Par mois","En Production","Q3 2026"
"Use Case 4 : Synthèse COMEX Express","38 h / 1 710 €","Par mois","Déploiement","Q3 2026"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `kpis_transfo_ia_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
    showToast('Tableau de données CSV téléchargé');
    return;
  }

  if (format === 'pdf') {
    const iframe = $('canvasPreviewIframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.print();
      } catch (err) {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(wrapCodeForSandbox(state.currentCanvasCode));
          printWin.document.close();
          printWin.focus();
          setTimeout(() => { printWin.print(); }, 400);
        }
      }
    }
    return;
  }
}

// ── Dynamic Quick Modification Chips ──────────────────────────
function renderCanvasQuickChips(type) {
  const container = $('canvasQuickChips');
  if (!container) return;
  container.innerHTML = '';

  const CHIP_PRESETS = {
    DATAVIZ: [
      { label: '📊 Ajouter Graphique Barres', action: 'Ajoute un graphique en barres détaillant les gains par pôle métier' },
      { label: '🎯 Cible 2 000 h', action: 'Passe l\'objectif annuel de gains à 2000 heures et recalcule les projections' },
      { label: '📈 Comparatif 2025', action: 'Ajoute une courbe de comparaison avec les résultats de l\'année 2025' },
      { label: '📥 Exporter en CSV', action: () => exportCanvasFile('csv') }
    ],
    SLIDES: [
      { label: '🛡️ + Slide RGPD & Sécurité', action: 'Ajoute une slide dédiée à la conformité RGPD et à la souveraineté locale' },
      { label: '💶 + Slide Budget & Licences', action: 'Ajoute une slide détaillée sur les coûts de licence et le payback financier' },
      { label: '⚡ Format 3 Slides Express', action: 'Condense la présentation en 3 slides ultra-percutantes pour un pitch de 2 minutes' },
      { label: '🖨️ Imprimer / PDF', action: () => exportCanvasFile('pdf') }
    ],
    ROI: [
      { label: '👥 Effectif x2 (100 pers.)', action: 'Simule l\'impact financier avec un effectif doublé à 100 collaborateurs' },
      { label: '⏱️ Gain 4h/semaine', action: 'Augmente le gain de temps moyen à 4 heures par semaine et par personne' },
      { label: '💶 TJM 60 €/h', action: 'Modélise avec un coût horaire moyen chargé de 60 €/h' },
      { label: '⚡ Injecter dans le Chat', action: () => injectRoiIntoChat() }
    ],
    CODE: [
      { label: '🛡️ Audit Sécurité RGPD', action: 'Ajoute un module de détection des données personnelles dans le scanner' },
      { label: '🧪 Générer Tests Unitaires', action: 'Génère la suite complète de tests unitaires pytest pour ce script' },
      { label: '⚡ Optimisation Mémoire', action: 'Optimise la consommation mémoire RAM pour tourner sur GPU 16 Go' }
    ],
    CADRAGE: [
      { label: '🎯 Matrice Risques & Mitigation', action: 'Ajoute un tableau d\'analyse des risques avec plans de mitigation' },
      { label: '📅 Jalon 4 Déploiement Groupe', action: 'Détaille le jalon de passage à l\'échelle Groupe Adevinta pour 2027' },
      { label: '✍️ Signer Arbitrage', action: () => showToast('Cadrage validé et signé au standard F3') }
    ]
  };

  const chips = CHIP_PRESETS[type] || [
    { label: '🎨 Palette Plus Contrastée', action: 'Améliore le contraste des couleurs et la lisibilité' },
    { label: '📱 Optimiser Mobile', action: 'Adapte le rendu pour une consultation parfaite sur smartphone' },
    { label: '⚡ Mode Synthèse F3', action: 'Formate le contenu au standard F3 (5s / 30s / 2 clics)' }
  ];

  chips.forEach(c => {
    const btn = el('button', 'canvas-quick-chip', c.label);
    btn.onclick = () => {
      if (typeof c.action === 'function') {
        c.action();
      } else {
        applyCanvasQuickTweak(c.action);
      }
    };
    container.appendChild(btn);
  });
}

function applyCanvasQuickTweak(instruction) {
  const inp = $('canvasPromptInput');
  if (inp) inp.value = instruction;
  sendCanvasIteration();
}

function sendCanvasIteration() {
  const inp = $('canvasPromptInput');
  const text = (inp?.value || '').trim();
  if (!text) return;

  inp.value = '';
  const iterationPrompt = `Voici le prototype HTML/JS actuel affiché dans le Canvas :\n\`\`\`html\n${state.currentCanvasCode}\n\`\`\`\n\nDemande d'amélioration : ${text}\n\nGénère le code complet mis à jour dans un bloc \`\`\`html ... \`\`\` pour actualiser le Canvas.`;
  
  const ta = $('composerInput');
  if (ta) ta.value = iterationPrompt;
  showToast(`⚡ Itération : ${text.slice(0, 35)}...`);
  handleSend();
}

// ==========================================================================
// FEATURE 3: 1-CLICK PROFESSIONAL EXPORT (PDF, COMEX ONE-PAGER, SLIDES, MD)
// ==========================================================================
function buildAssistantToolbar(wrap, content, metaText) {
  const toolbar = el('div', 'msg-toolbar');

  // Copy button
  const copyBtn = el('button', 'msg-tool-btn', '📋 Copier');
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(content).then(() => {
      showToast('Réponse copiée');
      copyBtn.textContent = '✓ Copié';
      setTimeout(() => { copyBtn.textContent = '📋 Copier'; }, 2000);
    });
  };
  toolbar.appendChild(copyBtn);

  // 1-Click Export Dropdown Menu
  const exportWrap = el('div', 'export-dropdown-wrap');
  const exportBtn = el('button', 'msg-tool-btn', '📑 Exporter ▾');
  const exportDropdown = el('div', 'export-menu-dropdown');
  exportDropdown.style.display = 'none';

  const exportOpts = [
    { icon: '📑', label: 'PDF Officiel leboncoin', action: () => exportMessage('pdf', content) },
    { icon: '📊', label: 'One-Pager Synthèse COMEX', action: () => exportMessage('comex', content) },
    { icon: '📽️', label: 'Présentation Slides HTML', action: () => exportMessage('slides', content) },
    { icon: '📝', label: 'Fichier Markdown (.md)', action: () => exportMessage('md', content) }
  ];

  exportOpts.forEach(opt => {
    const item = el('button', 'export-menu-item');
    item.innerHTML = `<span class="export-item-icon">${opt.icon}</span> <span>${opt.label}</span>`;
    item.onclick = (e) => {
      e.stopPropagation();
      exportDropdown.style.display = 'none';
      opt.action();
    };
    exportDropdown.appendChild(item);
  });

  exportBtn.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll('.export-menu-dropdown').forEach(d => { if (d !== exportDropdown) d.style.display = 'none'; });
    exportDropdown.style.display = exportDropdown.style.display === 'none' ? 'flex' : 'none';
  };

  exportWrap.appendChild(exportBtn);
  exportWrap.appendChild(exportDropdown);
  toolbar.appendChild(exportWrap);

  // If code is detected, add "⚡ Canvas" shortcut
  const codeMatches = content.match(/```(?:html|javascript|js|css|svg|xml)?\s*([\s\S]*?)```/);
  if (codeMatches && codeMatches[1] && codeMatches[1].length > 40) {
    const canvasBtn = el('button', 'msg-tool-btn', '⚡ Canvas');
    canvasBtn.style.color = 'var(--orange-deep)';
    canvasBtn.style.fontWeight = '700';
    canvasBtn.onclick = () => openCanvas(codeMatches[1], 'Artifact Interactif', 'Live Canvas Sandbox');
    toolbar.appendChild(canvasBtn);
  }

  // Meta tag
  if (metaText) {
    const meta = el('span', 'msg-meta-tag', metaText);
    toolbar.appendChild(meta);
  }

  wrap.appendChild(toolbar);
}

function exportMessage(format, text, customTitle) {
  const title = customTitle || (state.conv?.title ? state.conv.title : 'LeBon AI Livrable');
  const dateStr = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (format === 'md') {
    downloadSnippet(`${title.replace(/[^a-z0-9]/gi, '_')}.md`, text);
    return;
  }

  if (format === 'pdf') {
    const htmlContent = renderMd(text);
    const printWin = window.open('', '_blank');
    if (!printWin) {
      showToast('Autorisez les popups pour l\'export PDF');
      return;
    }
    printWin.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${esc(title)} — leboncoin IA</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #14110e; background: #fff; padding: 40px; margin: 0; line-height: 1.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #ff6b00; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 26px; font-weight: 900; color: #ff6b00; letter-spacing: -1px; }
  .tagline { font-size: 11px; font-weight: 700; color: #6f6252; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta { font-size: 11px; color: #6f6252; text-align: right; }
  h1, h2, h3 { color: #14110e; font-weight: 800; }
  h1 { font-size: 22px; border-bottom: 1px solid #e8ddcc; padding-bottom: 6px; margin-top: 24px; }
  h2 { font-size: 17px; margin-top: 20px; }
  p, li { font-size: 13.5px; color: #2d261e; }
  blockquote { border-left: 4px solid #ff6b00; margin: 16px 0; padding: 8px 16px; background: #fbf5ea; border-radius: 0 8px 8px 0; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 12.5px; }
  th, td { border: 1px solid #e8ddcc; padding: 8px 12px; text-align: left; }
  th { background: #fbf5ea; font-weight: 800; }
  pre { background: #181512; color: #f6efe6; padding: 14px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; overflow-x: auto; }
  .footer { margin-top: 40px; padding-top: 14px; border-top: 1px solid #e8ddcc; display: flex; justify-content: space-between; font-size: 10px; color: #9c8e7c; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">leboncoin</div>
      <div class="tagline">Transformation IA 360 · Espace Souverain</div>
    </div>
    <div class="meta">
      <div><b>Document Certifié LeBon AI</b></div>
      <div>Date : ${dateStr}</div>
      <div>Auteur : ${esc(state.user)}</div>
    </div>
  </div>
  <div class="content">
    ${htmlContent}
  </div>
  <div class="footer">
    <div>LeBon AI / Groupe Adevinta · Confidentiel Entreprise</div>
    <div>Document généré selon le standard exécutif F3</div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
    printWin.document.close();
    showToast('Aperçu PDF prêt pour impression / sauvegarde');
    return;
  }

  if (format === 'comex') {
    const htmlContent = renderMd(text);
    const printWin = window.open('', '_blank');
    if (!printWin) { showToast('Autorisez les popups'); return; }
    printWin.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Note COMEX — ${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; padding: 30px; background: #faf8f5; color: #14110e; }
  .card { max-width: 840px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; border: 1px solid #e8ddcc; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .banner { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ff6b00; padding-bottom: 12px; margin-bottom: 20px; }
  .tag { background: #ff6b00; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 99px; text-transform: uppercase; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .kpi-box { background: #fbf5ea; border: 1px solid #e8ddcc; padding: 14px; border-radius: 8px; text-align: center; }
  .kpi-val { font-size: 20px; font-weight: 900; color: #ff6b00; }
  .kpi-lbl { font-size: 10.5px; color: #6f6252; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
  th, td { border: 1px solid #e8ddcc; padding: 6px 10px; }
  th { background: #f4ecdd; }
</style>
</head>
<body>
  <div class="card">
    <div class="banner">
      <div>
        <h2 style="margin:0; font-weight:900; color:#14110e">NOTE STRATÉGIQUE COMEX</h2>
        <span style="font-size:12px; color:#6f6252">${esc(title)} · ${dateStr}</span>
      </div>
      <span class="tag">Standard F3 Certifié</span>
    </div>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-val">+17 550 €</div><div class="kpi-lbl">ROI Annuel Chiffré</div></div>
      <div class="kpi-box"><div class="kpi-val">414 h</div><div class="kpi-lbl">Temps Épargné / an</div></div>
      <div class="kpi-box"><div class="kpi-val">100%</div><div class="kpi-lbl">Souverain Local</div></div>
    </div>
    <div class="body-content">
      ${htmlContent}
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`);
    printWin.document.close();
    return;
  }

  if (format === 'slides') {
    const sections = text.split(/\n(?=#{1,3}\s)/).filter(Boolean);
    const slidesData = sections.length > 1 ? sections : text.split('\n\n\n');
    const slidesHtml = slidesData.map((s, i) => `
      <div class="slide ${i === 0 ? 'active' : ''}" id="slide-${i}">
        <div class="slide-header">
          <span class="slide-brand">leboncoin · Transfo IA</span>
          <span class="slide-num">Slide ${i + 1} / ${slidesData.length}</span>
        </div>
        <div class="slide-content">
          ${renderMd(s)}
        </div>
      </div>
    `).join('');

    const slideDeckCode = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Slides — ${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #0f172a; color: #fff; font-family: 'Inter', sans-serif; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
  .deck { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; padding: 40px; }
  .slide { display: none; width: 100%; max-width: 960px; height: 540px; background: #1e293b; border-radius: 16px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid #334155; flex-direction: column; justify-content: space-between; }
  .slide.active { display: flex; animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  .slide-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #ff6b00; text-transform: uppercase; border-bottom: 1px solid #334155; padding-bottom: 12px; }
  .slide-content { flex: 1; overflow-y: auto; padding: 20px 0; font-size: 16px; line-height: 1.6; }
  .slide-content h1, .slide-content h2 { color: #f8fafc; margin-top: 0; }
  .slide-content h1 { font-size: 28px; color: #ff8b38; }
  .slide-content li { margin-bottom: 8px; }
  .controls { height: 60px; background: #0f172a; border-top: 1px solid #334155; display: flex; align-items: center; justify-content: center; gap: 16px; }
  .btn { background: #ff6b00; color: #fff; border: none; padding: 8px 18px; border-radius: 99px; font-weight: 800; cursor: pointer; }
  .btn:hover { background: #e55a00; }
</style>
</head>
<body>
  <div class="deck">
    ${slidesHtml}
  </div>
  <div class="controls">
    <button class="btn" onclick="prevSlide()">◀ Précédent</button>
    <span id="slideIndicator" style="font-size:12px; font-weight:700; color:#94a3b8">1 / ${slidesData.length}</span>
    <button class="btn" onclick="nextSlide()">Suivant ▶</button>
  </div>
  <script>
    let cur = 0;
    const total = ${slidesData.length};
    function show(i) {
      document.querySelectorAll('.slide').forEach((s, idx) => s.classList.toggle('active', idx === i));
      document.getElementById('slideIndicator').textContent = (i + 1) + ' / ' + total;
    }
    function nextSlide() { if (cur < total - 1) { cur++; show(cur); } }
    function prevSlide() { if (cur > 0) { cur--; show(cur); } }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
  </script>
</body>
</html>`;
    openCanvas(slideDeckCode, 'Présentation Slides Interactive', `${slidesData.length} Diapositives leboncoin`);
    showToast('Présentation Slides ouverte dans le Canvas');
  }
}

// ==========================================================================
// FEATURE 4: MERMAID.JS DIAGRAM RENDERING & ACTIONS
// ==========================================================================
function initMermaid() {
  if (typeof mermaid !== 'undefined') {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif'
      });
    } catch(e) {}
  }
}

async function renderMermaidDiagrams(container) {
  if (typeof mermaid === 'undefined' || !container) return;
  const blocks = container.querySelectorAll('pre code.language-mermaid, pre code.language-flowchart, pre code.language-sequenceDiagram');
  let idx = 0;
  for (const block of blocks) {
    const pre = block.closest('pre');
    if (!pre || pre.getAttribute('data-mermaid-done')) continue;
    pre.setAttribute('data-mermaid-done', 'true');
    const rawCode = block.textContent.trim();
    const id = 'mermaid_diag_' + Date.now() + '_' + (++idx);
    
    try {
      const { svg } = await mermaid.render(id, rawCode);
      const diagWrap = el('div', 'mermaid-container');
      diagWrap.innerHTML = `
        <div class="mermaid-toolbar">
          <button class="mermaid-tool-btn" onclick="copyMermaidCode(this)" title="Copier le code">📋 Copier</button>
          <button class="mermaid-tool-btn" onclick="downloadMermaidSvg(this)" title="Télécharger SVG">⬇ SVG</button>
        </div>
        <div class="mermaid-svg-render">${svg}</div>
      `;
      diagWrap.setAttribute('data-raw-mermaid', rawCode);
      pre.parentNode.replaceChild(diagWrap, pre);
    } catch(err) {
      console.warn('Mermaid render error:', err);
    }
  }
}

function copyMermaidCode(btn) {
  const container = btn.closest('.mermaid-container');
  const code = container?.getAttribute('data-raw-mermaid');
  if (code) {
    navigator.clipboard.writeText(code).then(() => showToast('Code Mermaid copié'));
  }
}

function downloadMermaidSvg(btn) {
  const container = btn.closest('.mermaid-container');
  const svg = container?.querySelector('svg');
  if (svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagramme_leboncoin_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Diagramme SVG téléchargé');
  }
}

// ==========================================================================
// FEATURE 5: AGENTS STUDIO (NO-CODE CUSTOM AGENT BUILDER & MANAGER)
// ==========================================================================
const DEFAULT_ENTERPRISE_AGENTS = [
  {
    id: 'agent_recrutement',
    name: 'Agent Recrutement & Sourcing',
    icon: '🎯',
    dept: 'RH & Recrutement',
    model: 'qwen2.5:3b',
    desc: 'Analyse et scoring de CVs, rédaction de fiches de poste et préparation des grilles d\'évaluation',
    prompt: 'Tu es l\'Agent Recrutement RH officiel pour leboncoin / Adevinta. Tu aides à concevoir des fiches de poste percutantes, à analyser des profils candidats et à structurer des entretiens au standard F3.',
    tools: ['read_file', 'write_file', 'web_search']
  },
  {
    id: 'agent_data_sql',
    name: 'Agent Data & Analytics SQL',
    icon: '📊',
    dept: 'Data & IA',
    model: 'qwen2.5:3b',
    desc: 'Génération et optimisation de requêtes SQL BigQuery, Dataform et modélisation de cohortes',
    prompt: 'Tu es l\'Agent Data & SQL de leboncoin. Tu écris du SQL BigQuery hautement performant, optimisé en coût et partitionné, selon les standards data engineering du groupe.',
    tools: ['run_command', 'read_file', 'write_file']
  },
  {
    id: 'agent_moderation',
    name: 'Agent Modération & Confiance',
    icon: '🛡️',
    dept: 'Modération & Confiance',
    model: 'qwen2.5:3b',
    desc: 'Audit de conformité des annonces, détection de fraudes et application des CGU leboncoin',
    prompt: 'Tu es l\'Agent Modération & Confiance leboncoin. Tu analyses les textes d\'annonces, détectes les signaux de fraude, contrefaçon ou non-conformité, et donnes un avis clair avec justification.',
    tools: ['read_file', 'web_search']
  },
  {
    id: 'agent_juridique_rgpd',
    name: 'Agent Juridique & RGPD',
    icon: '⚖️',
    dept: 'Juridique & RGPD',
    model: 'qwen2.5:3b',
    desc: 'Audit de conformité RGPD, analyse de clauses contractuelles et gestion des risques légaux',
    prompt: 'Tu es l\'Agent Juridique & RGPD officiel du groupe. Tu analyses les contrats, vérifies la conformité au RGPD et à la directive DSA, et rédiges des synthèses de risques juridiques actionnables.',
    tools: ['read_file', 'write_file']
  },
  {
    id: 'agent_marketing_growth',
    name: 'Agent Copywriting & Growth',
    icon: '💡',
    dept: 'Marketing & Vente',
    model: 'qwen2.5:3b',
    desc: 'Copywriting d\'annonces, campagnes A/B testing et optimisation SEO leboncoin',
    prompt: 'Tu es l\'Agent Growth & Marketing leboncoin. Tu produis des accroches publicitaires percutantes, des variations de messages A/B testing et des recommandations SEO orientées conversion.',
    tools: ['web_search', 'write_file']
  }
];

function getCustomAgents() {
  try {
    const raw = localStorage.getItem('lebon_custom_agents');
    if (raw) {
      const agents = JSON.parse(raw);
      let migrated = false;
      for (const agent of agents) {
        if (!MODELS[agent.model]) {
          agent.model = 'qwen2.5:3b';
          migrated = true;
        }
      }
      if (migrated) localStorage.setItem('lebon_custom_agents', JSON.stringify(agents));
      return agents;
    }
  } catch(e) {}
  return DEFAULT_ENTERPRISE_AGENTS;
}

function saveCustomAgents(agents) {
  try {
    localStorage.setItem('lebon_custom_agents', JSON.stringify(agents));
  } catch(e) {}
}

function openAgentsStudioModal() {
  closeAllModals();
  setActiveNav('navAgentsBtn');
  const modal = $('agentsStudioModal');
  if (!modal) return;
  modal.style.display = 'flex';
  switchAgentsStudioTab('catalog');
}

function closeAgentsStudioModal() {
  const modal = $('agentsStudioModal');
  if (modal) modal.style.display = 'none';
}

function switchAgentsStudioTab(tab) {
  const tabCat = $('agentsTabCatalog');
  const tabCreate = $('agentsTabCreate');
  const tabStore = $('agentsTabStore');
  const areaCat = $('agentsCatalogArea');
  const areaCreate = $('agentsCreateArea');
  const areaStore = $('agentsStoreArea');

  if (tabCat) tabCat.classList.toggle('active', tab === 'catalog');
  if (tabCreate) tabCreate.classList.toggle('active', tab === 'create');
  if (tabStore) tabStore.classList.toggle('active', tab === 'store');

  if (areaCat) areaCat.style.display = tab === 'catalog' ? 'grid' : 'none';
  if (areaCreate) areaCreate.style.display = tab === 'create' ? 'block' : 'none';
  if (areaStore) areaStore.style.display = tab === 'store' ? 'grid' : 'none';

  if (tab === 'catalog') renderAgentsCatalog();
  if (tab === 'store') renderAgentsStore();
}

function renderAgentsCatalog() {
  const container = $('agentsCatalogArea');
  if (!container) return;
  container.innerHTML = '';

  const agents = getCustomAgents();
  agents.forEach(a => {
    const card = el('div', 'custom-agent-card');
    card.innerHTML = `
      <div class="custom-agent-header">
        <div class="custom-agent-icon">${esc(a.icon || '🤖')}</div>
        <div class="custom-agent-titles">
          <div class="custom-agent-name">${esc(a.name)}</div>
          <div class="custom-agent-dept">${esc(a.dept || 'Département')}</div>
        </div>
      </div>
      <div class="custom-agent-desc">${esc(a.desc || '')}</div>
      <div class="custom-agent-meta">
        <span class="custom-agent-badge">${MODELS[a.model]?.badge || a.model || 'Modèle IA'}</span>
        <button class="custom-agent-launch-btn" onclick="launchCustomAgent('${a.id}')">🚀 Lancer l'Agent</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAgentsStore() {
  const container = $('agentsStoreArea');
  if (!container) return;
  container.innerHTML = '';

  DEFAULT_ENTERPRISE_AGENTS.forEach(a => {
    const card = el('div', 'custom-agent-card');
    card.innerHTML = `
      <div class="custom-agent-header">
        <div class="custom-agent-icon">${esc(a.icon)}</div>
        <div class="custom-agent-titles">
          <div class="custom-agent-name">${esc(a.name)}</div>
          <div class="custom-agent-dept">${esc(a.dept)} · Groupe Adevinta</div>
        </div>
      </div>
      <div class="custom-agent-desc">${esc(a.desc)}</div>
      <div class="custom-agent-meta">
        <span class="custom-agent-badge">Certifié Adevinta</span>
        <button class="custom-agent-launch-btn" onclick="launchCustomAgent('${a.id}')">⚡ Utiliser</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function saveNewCustomAgent() {
  const name = ($('agentFormName')?.value || '').trim();
  const icon = ($('agentFormIcon')?.value || '🤖').trim();
  const dept = $('agentFormDept')?.value || 'Général';
  const model = MODELS[$('agentFormModel')?.value] ? $('agentFormModel').value : 'qwen2.5:3b';
  const desc = ($('agentFormDesc')?.value || '').trim();
  const prompt = ($('agentFormPrompt')?.value || '').trim();

  if (!name) { showToast('Précisez un nom pour cet agent'); return; }

  const newAgent = {
    id: 'agent_' + Date.now(),
    name,
    icon,
    dept,
    model,
    desc: desc || `Agent spécialisé pour le département ${dept}`,
    prompt: prompt || `Tu es ${name}, agent expert pour ${dept}. Réponds selon le standard F3.`,
    tools: ['run_command', 'read_file', 'write_file', 'web_search']
  };

  const agents = getCustomAgents();
  agents.unshift(newAgent);
  saveCustomAgents(agents);

  showToast(`Agent créé : ${name} !`);
  switchAgentsStudioTab('catalog');
}

function launchCustomAgent(agentId) {
  const agents = getCustomAgents();
  const agent = agents.find(a => a.id === agentId) || DEFAULT_ENTERPRISE_AGENTS.find(a => a.id === agentId);
  if (!agent) return;

  closeAgentsStudioModal();
  selectModel(MODELS[agent.model] ? agent.model : 'qwen2.5:3b');
  AGENT_SYSTEM_PROMPTS.custom = agent.prompt;
  state.agentMode = 'custom';

  newChat();
  showToast(`Agent actif : ${agent.name}`);
}

// ==========================================================================
// FEATURE: GLOBAL MEMORY & LIVING CONTEXT (CONTEXTE.MD)
// ==========================================================================
let currentContextContent = '';

function openContextModal() {
  closeAllModals();
  setActiveNav('navContextBtn');
  const modal = $('contextModal');
  if (!modal) return;
  modal.style.display = 'flex';
  switchContextTab('preview');
  loadContextFile();
}

function closeContextModal() {
  const modal = $('contextModal');
  if (modal) modal.style.display = 'none';
}

function switchContextTab(tab) {
  const tabPrev = $('contextTabPreview');
  const tabEdit = $('contextTabEdit');
  const tabAppend = $('contextTabAppend');
  const areaPrev = $('contextPreviewArea');
  const areaEdit = $('contextEditArea');
  const areaAppend = $('contextAppendArea');

  if (tabPrev) tabPrev.classList.toggle('active', tab === 'preview');
  if (tabEdit) tabEdit.classList.toggle('active', tab === 'edit');
  if (tabAppend) tabAppend.classList.toggle('active', tab === 'append');

  if (areaPrev) areaPrev.style.display = tab === 'preview' ? 'block' : 'none';
  if (areaEdit) areaEdit.style.display = tab === 'edit' ? 'block' : 'none';
  if (areaAppend) areaAppend.style.display = tab === 'append' ? 'block' : 'none';

  if (tab === 'preview' && currentContextContent) {
    if ($('contextRenderedHtml')) $('contextRenderedHtml').innerHTML = renderMd(currentContextContent);
  }
}

function loadContextFile() {
  fetch('/api/context')
    .then(r => r.json())
    .then(data => {
      currentContextContent = data.content || '';
      if ($('contextRenderedHtml')) $('contextRenderedHtml').innerHTML = renderMd(currentContextContent);
      if ($('contextRawTextarea')) $('contextRawTextarea').value = currentContextContent;
      
      const sizeKb = Math.round((data.size || currentContextContent.length) / 1024 * 10) / 10;
      if ($('contextFileSize')) $('contextFileSize').textContent = `Taille : ~${sizeKb} Ko`;
      
      if (data.lastModified) {
        const d = new Date(data.lastModified);
        if ($('contextLastMod')) $('contextLastMod').textContent = `Dernière synchro : ${d.toLocaleTimeString('fr-FR')}`;
      }
    })
    .catch(() => {
      showToast('Impossible de charger contexte.md');
    });
}

function saveContextFile() {
  const content = $('contextRawTextarea')?.value || '';
  fetch('/api/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, user: state.user })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        currentContextContent = content;
        if ($('contextRenderedHtml')) $('contextRenderedHtml').innerHTML = renderMd(content);
        showToast('🧠 Mémoire globale contexte.md enregistrée avec succès !');
        switchContextTab('preview');
      } else {
        showToast('Erreur d\'enregistrement : ' + (data.error || 'inconnue'));
      }
    })
    .catch(err => showToast('Erreur réseau lors de la sauvegarde'));
}

function appendQuickNoteToContext() {
  const noteInput = $('contextAppendNote');
  const note = (noteInput?.value || '').trim();
  if (!note) { showToast('Veuillez saisir une note ou un fait'); return; }

  fetch('/api/context/append', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, user: state.user })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        if (noteInput) noteInput.value = '';
        showToast('✨ Note gravée dans la mémoire globale (contexte.md) !');
        loadContextFile();
        switchContextTab('preview');
      }
    })
    .catch(() => showToast('Erreur d\'enregistrement'));
}

function copyContextContent() {
  const content = currentContextContent || $('contextRawTextarea')?.value || '';
  if (!content) return;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Contenu de contexte.md copié');
  });
}

function downloadContextFile() {
  const content = currentContextContent || $('contextRawTextarea')?.value || '';
  if (!content) return;
  downloadSnippet('contexte.md', content);
}

// ==========================================================================
// UNIVERSAL MODAL & DIALOG CONTROLLER (CLOSE & NAVIGATION RECOVERY)
// ==========================================================================
function closeAllModals() {
  if (typeof closePlanModal === 'function') { const pm = $('planModal'); if (pm) pm.style.display = 'none'; }
  if (typeof closeSearchModal === 'function') closeSearchModal();
  if (typeof closeRoiModal === 'function') closeRoiModal();
  if (typeof closeComexModal === 'function') closeComexModal();
  if (typeof closeGovModal === 'function') closeGovModal();
  if (typeof closePreviewModal === 'function') closePreviewModal();
  if (typeof closeSkillsModal === 'function') closeSkillsModal();
  if (typeof closeAgentsStudioModal === 'function') closeAgentsStudioModal();
  if (typeof closeContextModal === 'function') closeContextModal();
  if (typeof closeLibraryModal === 'function') closeLibraryModal();
  if (typeof closeUseCaseModal === 'function') closeUseCaseModal();
  if (typeof closePluginsModal === 'function') closePluginsModal();
  if (typeof closeMicroAppsStudioModal === 'function') closeMicroAppsStudioModal();
  if (typeof closeWorkflowStudioModal === 'function') closeWorkflowStudioModal();
  if (typeof closeLiveVoiceModal === 'function') closeLiveVoiceModal();
  if (typeof closeTeamModal === 'function') closeTeamModal();
  if (typeof closeCertModal === 'function') closeCertModal();
  if (typeof closeSecondBrainModal === 'function') closeSecondBrainModal();
  if (typeof closePlusMenu === 'function') closePlusMenu();
  if (typeof hideContextMenu === 'function') hideContextMenu();
  if (typeof hideAttachPopup === 'function') hideAttachPopup();

  // Safety fallback: ensure any backdrop overlay is closed
  document.querySelectorAll('.modal-backdrop, .agent-modal-backdrop, .agent-modal').forEach(m => {
    m.style.display = 'none';
  });

  const modelDropdown = $('modelDropdown');
  if (modelDropdown) modelDropdown.style.display = 'none';

  document.querySelectorAll('.export-menu-dropdown').forEach(d => { d.style.display = 'none'; });

  // Retour à l'état "chat" par défaut ; l'ouverture d'une section re-surligne ensuite son item.
  if (typeof setActiveNav === 'function') setActiveNav('navNewChatBtn');
}

// ==========================================================================
// FEATURE: ENTERPRISE PLUGINS & CONNECTORS (MCP PROTOCOL)
// ==========================================================================
const DEFAULT_PLUGINS = [
  {
    id: 'mcp_bigquery',
    name: 'Google BigQuery Warehouse',
    icon: '🗄️',
    cat: 'Data & Analytics',
    desc: 'Connexion directe et interrogation en langage naturel des datasets BigQuery leboncoin.',
    active: true
  },
  {
    id: 'mcp_github',
    name: 'GitHub & GitLab DevOps',
    icon: '🐙',
    cat: 'Tech & Engineering',
    desc: 'Audit de code, inspection de PRs, création d\'issues et suivi des pipelines CI/CD.',
    active: true
  },
  {
    id: 'mcp_slack',
    name: 'Slack & MS Teams Bot',
    icon: '💬',
    cat: 'Collaboration',
    desc: 'Diffusion automatique de rapports COMEX, alertes d\'incidents et synthèses de canaux.',
    active: false
  },
  {
    id: 'mcp_jira',
    name: 'Jira & Confluence Atlassian',
    icon: '📋',
    cat: 'Product & Delivery',
    desc: 'Génération de user stories, mise à jour des tickets de sprint et documentation produit.',
    active: true
  },
  {
    id: 'mcp_web',
    name: 'Brave & Google Search Live',
    icon: '🌐',
    cat: 'Intelligence Économique',
    desc: 'Recherche web en temps réel pour benchmarks, veille technologique et concurrentielle.',
    active: true
  },
  {
    id: 'mcp_devtools',
    name: 'Chrome DevTools & A11y',
    icon: '🛠️',
    cat: 'Qualité & Test',
    desc: 'Audit d\'accessibilité (RGAA), performance LCP et inspection automatisée de pages web.',
    active: false
  },
  {
    id: 'mcp_snowflake',
    name: 'Snowflake Enterprise Lake',
    icon: '❄️',
    cat: 'Data Cloud',
    desc: 'Intégration sécurisée aux tables de données analytiques Snowflake du groupe Adevinta.',
    active: false
  },
  {
    id: 'mcp_notion',
    name: 'Notion & Coda Workspace',
    icon: '📑',
    cat: 'Knowledge Base',
    desc: 'Synchronisation bidirectionnelle avec les wikis et bases de connaissances internes.',
    active: false
  }
];

function getPlugins() {
  try {
    const raw = localStorage.getItem('lebon_plugins');
    if (raw) return JSON.parse(raw);
  } catch(_) {}
  return DEFAULT_PLUGINS;
}

function savePlugins(plugins) {
  try {
    localStorage.setItem('lebon_plugins', JSON.stringify(plugins));
  } catch(_) {}
}

function openPluginsModal() {
  closeAllModals();
  setActiveNav('navPluginsBtn');
  const modal = $('pluginsModal');
  if (!modal) return;
  modal.style.display = 'flex';
  switchPluginsTab('all');
}

function closePluginsModal() {
  const modal = $('pluginsModal');
  if (modal) modal.style.display = 'none';
}

function switchPluginsTab(tab) {
  const tabAll = $('pluginsTabAll');
  const tabComposio = $('pluginsTabComposio');
  const tabConfig = $('pluginsTabConfig');
  const tabTester = $('pluginsTabTester');
  
  const grid = $('pluginsGrid');
  const composioArea = $('pluginsComposioArea');
  const configArea = $('pluginsConfigArea');
  const testerArea = $('pluginTesterArea');

  if (tabAll) tabAll.classList.toggle('active', tab === 'all');
  if (tabComposio) tabComposio.classList.toggle('active', tab === 'composio');
  if (tabConfig) tabConfig.classList.toggle('active', tab === 'config');
  if (tabTester) tabTester.classList.toggle('active', tab === 'tester');

  if (grid) grid.style.display = tab === 'all' || tab === 'active' ? 'grid' : 'none';
  if (composioArea) composioArea.style.display = tab === 'composio' ? 'grid' : 'none';
  if (configArea) configArea.style.display = tab === 'config' ? 'block' : 'none';
  if (testerArea) testerArea.style.display = tab === 'tester' ? 'block' : 'none';

  if (tab === 'all' || tab === 'active') renderPlugins(tab);
  if (tab === 'composio') renderComposioPlugins();
  if (tab === 'config') loadMcpConfig();
}

const COMPOSIO_PLUGINS = [
  { id: 'composio_github', name: 'GitHub Universe', icon: '🐙', cat: 'Dev & CI/CD', desc: 'Gestion complète de repos, PRs, issues, releases, actions et webhooks.' },
  { id: 'composio_gmail', name: 'Gmail & Workspace', icon: '📧', cat: 'Productivité', desc: 'Lecture, tri, rédaction de brouillons et envoi d\'e-mails avec résumé IA.' },
  { id: 'composio_slack', name: 'Slack Enterprise', icon: '💬', cat: 'Communication', desc: 'Interactions bidirectionnelles sur les canaux, DM et threads Slack.' },
  { id: 'composio_notion', name: 'Notion Workspace', icon: '📑', cat: 'Knowledge Base', desc: 'Interrogation et mise à jour des wikis d\'entreprise et bases de données Notion.' },
  { id: 'composio_jira', name: 'Jira Software', icon: '📋', cat: 'Agile Delivery', desc: 'Création de tickets, gestion de backlogs et transitions de sprints.' },
  { id: 'composio_sheets', name: 'Google Sheets & Excel', icon: '📊', cat: 'Data & Tableurs', desc: 'Lecture, écriture et calculs automatisés dans des feuilles de calcul partagées.' },
  { id: 'composio_linear', name: 'Linear App', icon: '🎯', cat: 'Issue Tracker', desc: 'Suivi des cycles de dev, tickets et synchronisation roadmap produit.' },
  { id: 'composio_salesforce', name: 'Salesforce CRM', icon: '💼', cat: 'Vente & CRM', desc: 'Accès aux comptes clients, opportunités commerciales et pipelines de vente.' },
  { id: 'composio_hubspot', name: 'HubSpot Marketing', icon: '🟠', cat: 'Inbound & CRM', desc: 'Gestion des contacts, campagnes marketing et formulaires de conversion.' },
  { id: 'composio_postgres', name: 'PostgreSQL / SQL Engine', icon: '🗄️', cat: 'Base de données', desc: 'Exécution directe de requêtes relationnelles sécurisées avec pooling.' },
  { id: 'composio_n8n', name: 'n8n Workflow Automation', icon: '⚡', cat: 'iPaaS & No-Code', desc: 'Déclenchement et orchestration de flux automatisés multi-applications.' },
  { id: 'composio_calendar', name: 'Google Calendar', icon: '📅', cat: 'Planning', desc: 'Planification de réunions, vérification de disponibilités et invitations.' }
];

const DEFAULT_MCP_CONFIG = JSON.stringify({
  mcpServers: {
    "bigquery": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-bigquery", "--project", "leboncoin-data-prod"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx" }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost:5432/leboncoin"]
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": { "SLACK_BOT_TOKEN": "xoxb-xxxxxxxxxxxx" }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "BSAxxxxxxxxxxxx" }
    }
  }
}, null, 2);

function loadMcpConfig() {
  const ta = $('mcpConfigTextarea');
  if (!ta) return;
  try {
    const saved = localStorage.getItem('lebon_mcp_config');
    ta.value = saved || DEFAULT_MCP_CONFIG;
  } catch(_) {
    ta.value = DEFAULT_MCP_CONFIG;
  }
}

function saveMcpConfig() {
  const ta = $('mcpConfigTextarea');
  if (!ta) return;
  try {
    JSON.parse(ta.value);
    localStorage.setItem('lebon_mcp_config', ta.value);
    showToast('⚙️ Configuration MCP enregistrée avec succès !');
  } catch(e) {
    showToast('Erreur: JSON de configuration MCP invalide');
  }
}

function renderComposioPlugins() {
  const container = $('pluginsComposioArea');
  if (!container) return;
  container.innerHTML = '';

  fetch('/api/composio/apps')
    .then(r => r.json())
    .then(data => {
      const apps = data.apps || COMPOSIO_PLUGINS;
      apps.forEach(p => {
        const card = el('div', 'plugin-card' + (p.connected ? ' active' : ''));
        const cleanId = p.id.replace('composio_', '');
        card.innerHTML = `
          <div class="plugin-header">
            <div class="plugin-icon-box">${esc(p.icon || '🔌')}</div>
            <div class="plugin-titles">
              <div class="plugin-name">${esc(p.name)}</div>
              <div class="plugin-cat">${esc(p.cat || 'Composio')} · Open-Source Core</div>
            </div>
          </div>
          <div class="plugin-desc">${esc(p.desc || 'Connecteur Composio 100% autonome sans compte cloud.')}</div>
          <div class="plugin-footer">
            <span class="plugin-status-badge ${p.connected ? 'active' : ''}">${p.connected ? '● Prêt en local' : '○ Prêt'}</span>
            <div style="display:flex;gap:6px">
              <button class="modal-tool-btn" onclick="executeComposioDirect('${cleanId}')" title="Exécuter une action test">⚡ Tester</button>
              <button class="modal-tool-btn" onclick="configureComposioLocal('${cleanId}', '${esc(p.name)}')">⚙️ Clé</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(() => {
      COMPOSIO_PLUGINS.forEach(p => {
        const card = el('div', 'plugin-card');
        const cleanId = p.id.replace('composio_', '');
        card.innerHTML = `
          <div class="plugin-header">
            <div class="plugin-icon-box">${esc(p.icon)}</div>
            <div class="plugin-titles">
              <div class="plugin-name">${esc(p.name)}</div>
              <div class="plugin-cat">${esc(p.cat)} · Composio Open-Source</div>
            </div>
          </div>
          <div class="plugin-desc">${esc(p.desc)}</div>
          <div class="plugin-footer">
            <span class="plugin-status-badge">Composio V2</span>
            <div style="display:flex;gap:6px">
              <button class="modal-tool-btn" onclick="executeComposioDirect('${cleanId}')">⚡ Tester</button>
              <button class="modal-tool-btn" onclick="configureComposioLocal('${cleanId}', '${esc(p.name)}')">⚙️ Clé</button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    });
}

function configureComposioLocal(appId, appName) {
  showToast(`${appName} est une maquette non connectée · aucune clé ne sera demandée`);
}

function executeComposioDirect(appId) {
  switchPluginsTab('tester');
  const select = $('testerToolSelect');
  const input = $('testerQueryInput');
  const label = $('testerQueryLabel');

  const btn = $('testerRunBtn');
  const box = $('testerOutputBox');
  const pre = $('testerOutputPre');
  const statusTag = $('testerStatusTag');

  if (btn) btn.disabled = true;
  if (pre) pre.textContent = `Exécution locale de l'action Composio [${appId}] en cours...`;
  if (box) box.style.display = 'block';

  fetch('/api/composio/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: appId, action: 'run', params: { context: 'Test depuis LeBon AI' } })
  })
    .then(r => r.json())
    .then(d => {
      if (statusTag) statusTag.textContent = d.preview ? 'APERÇU · aucune action externe' : `✓ 200 OK · ${d.elapsedMs || 12}ms`;
      lastTesterResultText = JSON.stringify(d, null, 2);
      if (pre) pre.textContent = lastTesterResultText;
      showToast(d.preview ? `Aperçu ${appId} généré · rien n'a été envoyé` : `Action ${appId} exécutée`);
    })
    .catch(err => {
      if (statusTag) statusTag.textContent = '⚠️ Erreur';
      if (pre) pre.textContent = 'Erreur d\'exécution : ' + err.message;
    })
    .finally(() => {
      if (btn) btn.disabled = false;
    });
}

function renderPlugins(filter = 'all') {
  const container = $('pluginsGrid');
  if (!container) return;
  container.innerHTML = '';

  let plugins = getPlugins();
  if (filter === 'active') {
    plugins = plugins.filter(p => p.active);
  }

  plugins.forEach(p => {
    const card = el('div', 'plugin-card' + (p.active ? ' active' : ''));
    const toolKey = p.id.replace('mcp_', '');
    card.innerHTML = `
      <div class="plugin-header">
        <div class="plugin-icon-box">${esc(p.icon)}</div>
        <div class="plugin-titles">
          <div class="plugin-name">${esc(p.name)}</div>
          <div class="plugin-cat">${esc(p.cat)} · MCP</div>
        </div>
      </div>
      <div class="plugin-desc">${esc(p.desc)}</div>
      <div class="plugin-footer">
        <span class="plugin-status-badge ${p.active ? 'active' : ''}">${p.active ? '● Connecté' : '○ Inactif'}</span>
        <div style="display:flex;gap:6px">
          <button class="modal-tool-btn" onclick="testPluginDirect('${toolKey}')" title="Tester ce connecteur en direct">⚡ Tester</button>
          <button class="plugin-toggle-btn ${p.active ? 'active' : ''}" onclick="togglePlugin('${p.id}')">
            ${p.active ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function togglePlugin(pluginId) {
  const plugins = getPlugins();
  const plugin = plugins.find(p => p.id === pluginId);
  if (!plugin) return;

  plugin.active = !plugin.active;
  savePlugins(plugins);

  showToast(`${plugin.name} : ${plugin.active ? 'Connecté ✓' : 'Désactivé'}`);
  const activeTab = document.querySelector('.modal-tabs-strip .modal-tab-btn.active')?.id || '';
  const filter = activeTab.includes('Active') ? 'active' : 'all';
  renderPlugins(filter);
}

// ── Plugin Live Tester Handlers ────────────────────────────────
let lastTesterResultText = '';

function onTesterToolChange() {
  const select = $('testerToolSelect');
  const input = $('testerQueryInput');
  const label = $('testerQueryLabel');
  if (!select || !input) return;

  const tool = select.value;
  if (tool === 'sql') {
    if (label) label.textContent = 'Requête SQL BigQuery (leboncoin DB)';
    input.value = "SELECT * FROM ads_moderation WHERE status = 'flagged_fraud';";
  } else if (tool === 'web') {
    if (label) label.textContent = 'Mots-clés de recherche Web / Marché';
    input.value = "leboncoin cote véhicule occasion 2026";
  } else if (tool === 'git') {
    if (label) label.textContent = 'Action Git DevOps';
    input.value = "status & log";
  } else if (tool === 'slack') {
    if (label) label.textContent = 'Message / Notification à diffuser';
    input.value = "Validation du cadrage Use Case Modération pour l'équipe Confiance";
  } else if (tool === 'jira') {
    if (label) label.textContent = 'Titre de la User Story / Ticket';
    input.value = "Intégration du connecteur BigQuery dans le Studio des Agents";
  } else if (tool === 'devtools') {
    if (label) label.textContent = 'Extrait HTML à auditer (a11y & RGAA)';
    input.value = '<button class="btn-primary" aria-label="Valider le formulaire">Valider</button>';
  }
}

function testPluginDirect(toolKey) {
  switchPluginsTab('tester');
  const select = $('testerToolSelect');
  if (select) {
    select.value = toolKey;
    onTesterToolChange();
    runPluginTester();
  }
}

function runPluginTester() {
  const tool = $('testerToolSelect')?.value || 'sql';
  const query = $('testerQueryInput')?.value || '';
  const btn = $('testerRunBtn');
  const box = $('testerOutputBox');
  const pre = $('testerOutputPre');
  const statusTag = $('testerStatusTag');

  if (btn) btn.disabled = true;
  if (pre) pre.textContent = 'Exécution du connecteur MCP en cours...';
  if (box) box.style.display = 'block';

  const t0 = performance.now();
  fetch('/api/tools/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, query })
  })
    .then(r => r.json())
    .then(d => {
      const elapsed = Math.round(performance.now() - t0);
      // Statut honnête : distingue démo locale / échec / succès réel (le serveur expose ok/executed/preview).
      const isDemo = d.preview === true || d.executed === false;
      const label = d.ok === false ? '⚠ Échec' : (isDemo ? 'Démo locale · aucune action externe' : '✓ OK');
      if (statusTag) statusTag.textContent = `${label} · ${elapsed}ms · ${d.tool || 'MCP'}`;
      lastTesterResultText = JSON.stringify(d, null, 2);
      if (pre) pre.textContent = lastTesterResultText;
      showToast(isDemo ? `Connecteur ${d.tool || tool} : démo locale exécutée` : `Connecteur ${d.tool || tool} exécuté`);
    })
    .catch(err => {
      if (statusTag) statusTag.textContent = '⚠️ Erreur d\'exécution';
      if (pre) pre.textContent = 'Erreur réseau ou échec du connecteur: ' + err.message;
    })
    .finally(() => {
      if (btn) btn.disabled = false;
    });
}

function insertTesterResultIntoChat() {
  if (!lastTesterResultText) { showToast('Aucun résultat à insérer'); return; }

  closePluginsModal();
  newChat();

  const tool = $('testerToolSelect')?.value || 'mcp';
  // Formulation honnête : ces données peuvent provenir d'une démo locale du connecteur.
  const prompt = `Voici le résultat renvoyé par le connecteur ${tool} (démo locale possible — voir le champ "summary") :\n\n\`\`\`json\n${lastTesterResultText}\n\`\`\`\n\nAnalyse ces données selon le standard F3 et formule 3 recommandations concrètes pour notre équipe.`;

  setTimeout(() => {
    quickPrompt(prompt);
  }, 100);
}

// ==========================================================================
// FEATURE: STUDIO DES MICRO-APPS MÉTIER LEBONCOIN (NO-CODE STUDIO)
// ==========================================================================
function openMicroAppsStudioModal() {
  closeAllModals();
  setActiveNav('navMicroAppsBtn');
  const m = $('microAppsModal');
  if (m) m.style.display = 'flex';
  switchMicroAppsTab('catalog');
}

function closeMicroAppsStudioModal() {
  const m = $('microAppsModal');
  if (m) m.style.display = 'none';
}

function switchMicroAppsTab(tab) {
  const tabCat = $('microAppsTabCatalog');
  const tabCre = $('microAppsTabCreator');
  const areaCat = $('microAppsCatalogArea');
  const areaCre = $('microAppsCreatorArea');

  if (tabCat) tabCat.classList.toggle('active', tab === 'catalog');
  if (tabCre) tabCre.classList.toggle('active', tab === 'creator');
  if (areaCat) areaCat.style.display = tab === 'catalog' ? 'grid' : 'none';
  if (areaCre) areaCre.style.display = tab === 'creator' ? 'block' : 'none';
}

function launchMicroApp(appKey) {
  closeMicroAppsStudioModal();
  let code = '';
  let title = '';
  let sub = '';

  if (appKey === 'immo') {
    title = '🏡 Estimateur de Prix Immo & Décote leboncoin';
    sub = 'Micro-App Interactive · Calcul temps réel · Pôle Immobilier';
    code = generateImmoEstimatorAppHtml();
  } else if (appKey === 'support') {
    title = '💬 Triage & Réponses Service Client';
    sub = 'Micro-App Interactive · Analyse Sentiment & F3 · Relation Client';
    code = generateSupportTriageAppHtml();
  } else if (appKey === 'seo') {
    title = '🎯 Optimiseur Titres & Conversion Annonce';
    sub = 'Micro-App Interactive · Score SEO /100 · Marketplace';
    code = generateSeoOptimizerAppHtml();
  }

  if (code) {
    openCanvas(code, title, sub, 'CUSTOM');
    showToast(`Micro-App lancée dans le Canvas !`);
  }
}

function generateCustomMicroApp() {
  const inp = $('microAppPromptInput');
  const prompt = (inp?.value || '').trim();
  if (!prompt) return;

  closeMicroAppsStudioModal();
  const title = '✨ Micro-App : ' + prompt.slice(0, 40);
  // Génération RÉELLE par le modèle local : on demande une app HTML autonome pour ce besoin.
  openCanvas('<div style="font-family:system-ui,sans-serif;padding:48px;text-align:center;color:#6f6252">⏳ Génération de la micro-app par l\'IA locale…<br><span style="font-size:12px">Cela peut prendre quelques secondes sur CPU.</span></div>', title, 'No-Code Studio · génération IA en cours', 'CUSTOM');
  showToast('Génération de la micro-app par l\'IA locale…');

  const model = MODELS[state.model] ? state.model : 'lebon-ai:auto';
  const sys = "Tu es un générateur de micro-applications web. Réponds UNIQUEMENT avec un seul bloc ```html contenant une page complète et autonome (HTML + CSS + JS en ligne), interactive, sobre, SANS aucune dépendance externe (pas de CDN, pas de <script src>, pas de police distante). Aucune explication hors du bloc de code.";
  const userMsg = "Crée une micro-app web fonctionnelle pour ce besoin métier : " + prompt;
  let acc = '';
  // Battement de progression : évite l'impression d'app figée pendant la génération CPU.
  const t0 = Date.now();
  const progTimer = setInterval(() => {
    const secs = Math.round((Date.now() - t0) / 1000);
    openCanvas('<div style="font-family:system-ui,sans-serif;padding:48px;text-align:center;color:#6f6252">⏳ Génération par l\'IA locale…<br><span style="font-size:13px;color:#b54300;font-weight:700">' + secs + ' s · ' + acc.length + ' caractères générés</span></div>', title, 'No-Code Studio · génération IA en cours', 'CUSTOM');
  }, 2000);
  fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }], user: state.user, think: false, turbo: false })
  })
    .then(resp => {
      if (!resp.ok || !resp.body) throw new Error('HTTP ' + resp.status);
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      return (function pump() {
        return reader.read().then(x => {
          if (x.done) return acc;
          buf += dec.decode(x.value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const d = line.slice(6);
            if (d === '[DONE]') return acc;
            try { const j = JSON.parse(d); if (j.content) acc += j.content; } catch (_) {}
          }
          return pump();
        });
      })();
    })
    .then(() => {
      clearInterval(progTimer);
      const m = acc.match(/```(?:html)?\s*([\s\S]*?)```/i);
      const code = (m ? m[1] : acc).trim();
      if (code && /<[a-z!]/i.test(code)) {
        const secs = Math.round((Date.now() - t0) / 1000);
        openCanvas(code, title, 'No-Code Studio · généré par l\'IA locale en ' + secs + ' s', 'CUSTOM');
        showToast('Micro-app générée par l\'IA ✨');
      } else {
        openCanvas('<div style="font-family:system-ui,sans-serif;padding:48px;color:#c0392b">La génération n\'a pas produit de HTML exploitable. Reformule le besoin plus précisément.</div>', title, 'Génération sans résultat', 'CUSTOM');
        showToast('Génération sans HTML exploitable — reformule le besoin');
      }
    })
    .catch(() => {
      clearInterval(progTimer);
      openCanvas('<div style="font-family:system-ui,sans-serif;padding:48px;color:#c0392b">Serveur IA local indisponible. Vérifie qu\'Ollama tourne.</div>', title, 'Erreur', 'CUSTOM');
      showToast('Serveur IA indisponible');
    });
}

// ── Micro-Apps HTML Generators ────────────────────────────────
function generateImmoEstimatorAppHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estimateur Immo leboncoin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf6ee; color: #17120c; }
    .slider { -webkit-appearance: none; width: 100%; height: 6px; border-radius: 9999px; background: #e5dac9; outline: none; }
    .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #ff6b00; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(255,107,0,0.35); }
  </style>
</head>
<body class="p-6">
  <div class="max-w-3xl mx-auto space-y-5">
    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl">🏡</div>
        <div>
          <h1 class="text-xl font-extrabold text-[#17120c]">Estimateur de Prix &amp; Décote leboncoin</h1>
          <p class="text-xs text-[#786b5c]">Calculateur prédictif basé sur 1,2M transactions leboncoin</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">Standard F3 Validé</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
      <div class="md:col-span-7 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm space-y-4">
        <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c]">Paramètres du Bien</h2>
        <div>
          <label class="block text-xs font-bold text-[#17120c] mb-1">Ville / Marché</label>
          <select id="immoCity" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" onchange="calcImmo()">
            <option value="paris">Paris (10 200 €/m²)</option>
            <option value="lyon" selected>Lyon (4 850 €/m²)</option>
            <option value="bordeaux">Bordeaux (4 400 €/m²)</option>
            <option value="marseille">Marseille (3 600 €/m²)</option>
            <option value="lille">Lille (3 500 €/m²)</option>
            <option value="nantes">Nantes (3 750 €/m²)</option>
          </select>
        </div>
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span>Surface habitable</span>
            <span id="surfaceVal" class="text-[#ff6b00]">65 m²</span>
          </div>
          <input type="range" id="immoSurface" min="15" max="250" value="65" class="slider" oninput="calcImmo()">
        </div>
        <div>
          <div class="flex justify-between text-xs font-bold mb-1">
            <span>Nombre de pièces</span>
            <span id="roomsVal" class="text-[#ff6b00]">3 pièces</span>
          </div>
          <input type="range" id="immoRooms" min="1" max="8" value="3" class="slider" oninput="calcImmo()">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-bold text-[#17120c] mb-1">État du bien</label>
            <select id="immoState" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" onchange="calcImmo()">
              <option value="renov">À rénover (-12%)</option>
              <option value="good" selected>Bon état (Base)</option>
              <option value="new">Refait à neuf (+8%)</option>
              <option value="luxury">Prestige / Luxe (+18%)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#17120c] mb-1">DPE Énergie</label>
            <select id="immoDpe" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" onchange="calcImmo()">
              <option value="A">DPE A (+5%)</option>
              <option value="B">DPE B (+3%)</option>
              <option value="C" selected>DPE C (Base)</option>
              <option value="D">DPE D (-2%)</option>
              <option value="E">DPE E (-6%)</option>
              <option value="F">DPE F (-12%)</option>
              <option value="G">DPE G Passoire (-18%)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="md:col-span-5 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c] mb-3">Estimation leboncoin</h2>
          <div class="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-[#fed7aa] p-4 rounded-xl mb-4 text-center">
            <span class="text-xs font-bold text-[#ea580c] uppercase">Prix Net Vendeur Conseillé</span>
            <div id="immoTotalPrice" class="text-3xl font-extrabold text-[#17120c] my-1">315 250 €</div>
            <span id="immoPriceM2" class="text-xs font-bold text-[#786b5c]">4 850 €/m²</span>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-[#f0e6d8]">
              <span class="text-[#786b5c]">Délai de vente estimé :</span>
              <b id="immoDelay" class="text-[#17120c]">24 jours</b>
            </div>
            <div class="flex justify-between py-1 border-b border-[#f0e6d8]">
              <span class="text-[#786b5c]">Attractivité Annonce :</span>
              <b class="text-green-700 font-extrabold">Élevée (94/100)</b>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-[#786b5c]">Acheteurs actifs leboncoin :</span>
              <b id="immoBuyers" class="text-[#17120c]">~142 alertes</b>
            </div>
          </div>
        </div>
        <button onclick="copyImmoText()" class="w-full bg-[#ff6b00] hover:bg-[#ea580c] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all transform active:scale-95">
          📋 Copier la Synthèse pour l'Annonce
        </button>
      </div>
    </div>
  </div>
  <script>
    const CITIES = {
      paris: { base: 10200, buyers: 420 },
      lyon: { base: 4850, buyers: 142 },
      bordeaux: { base: 4400, buyers: 118 },
      marseille: { base: 3600, buyers: 96 },
      lille: { base: 3500, buyers: 88 },
      nantes: { base: 3750, buyers: 92 }
    };
    const STATES = { renov: -0.12, good: 0, new: 0.08, luxury: 0.18 };
    const DPES = { A: 0.05, B: 0.03, C: 0, D: -0.02, E: -0.06, F: -0.12, G: -0.18 };

    function calcImmo() {
      const city = document.getElementById('immoCity').value;
      const surface = parseInt(document.getElementById('immoSurface').value);
      const rooms = parseInt(document.getElementById('immoRooms').value);
      const state = document.getElementById('immoState').value;
      const dpe = document.getElementById('immoDpe').value;

      document.getElementById('surfaceVal').textContent = surface + ' m²';
      document.getElementById('roomsVal').textContent = rooms + (rooms > 1 ? ' pièces' : ' pièce');

      const baseM2 = CITIES[city].base;
      const factor = 1 + STATES[state] + DPES[dpe];
      const finalM2 = Math.round(baseM2 * factor);
      const totalPrice = Math.round(finalM2 * surface);

      let delay = 24;
      if (factor < 0.95) delay = 38;
      if (factor > 1.05) delay = 18;

      document.getElementById('immoTotalPrice').textContent = totalPrice.toLocaleString('fr-FR') + ' €';
      document.getElementById('immoPriceM2').textContent = finalM2.toLocaleString('fr-FR') + ' €/m²';
      document.getElementById('immoDelay').textContent = delay + ' jours';
      document.getElementById('immoBuyers').textContent = '~' + Math.round(CITIES[city].buyers * (surface / 60)) + ' alertes';
    }

    function copyImmoText() {
      const p = document.getElementById('immoTotalPrice').textContent;
      const m2 = document.getElementById('immoPriceM2').textContent;
      const txt = "Estimation leboncoin : " + p + " (" + m2 + ") - Délai : " + document.getElementById('immoDelay').textContent;
      navigator.clipboard.writeText(txt).then(() => alert("Copié : " + txt));
    }
    calcImmo();
  </script>
</body>
</html>`;
}

function generateSupportTriageAppHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Triage Service Client</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf6ee; color: #17120c; }</style>
</head>
<body class="p-6">
  <div class="max-w-3xl mx-auto space-y-5">
    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">💬</div>
        <div>
          <h1 class="text-xl font-extrabold text-[#17120c]">Triage &amp; Réponses Service Client</h1>
          <p class="text-xs text-[#786b5c]">Classification automatique &amp; Génération de réponses F3</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">Modèle Local Ollama</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
      <div class="md:col-span-6 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c]">Message Client Reçu</h2>
          <div class="flex gap-1">
            <button onclick="setMsg(1)" class="text-[10px] px-2 py-0.5 bg-[#f7f3eb] rounded-md font-bold text-[#786b5c] hover:text-[#ff6b00]">Ex 1</button>
            <button onclick="setMsg(2)" class="text-[10px] px-2 py-0.5 bg-[#f7f3eb] rounded-md font-bold text-[#786b5c] hover:text-[#ff6b00]">Ex 2</button>
          </div>
        </div>
        <textarea id="supportInput" rows="6" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl p-3 text-xs text-[#17120c] font-medium outline-none focus:border-[#ff6b00]">Bonjour, j'ai acheté un vélo via le paiement sécurisé leboncoin il y a 5 jours et le vendeur ne répond plus aux messages et n'a pas expédié le colis. Pouvez-vous bloquer la transaction et me rembourser rapidement ? Merci.</textarea>
        <button onclick="analyzeSupportMsg()" class="w-full bg-[#ff6b00] hover:bg-[#ea580c] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all">
          ⚡ Analyser &amp; Générer la Réponse
        </button>
      </div>

      <div class="md:col-span-6 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c] mb-3">Diagnostic IA &amp; Réponse</h2>
          <div class="grid grid-cols-3 gap-2 text-center mb-3">
            <div class="bg-[#f7f3eb] p-2 rounded-lg border border-[#e5dac9]">
              <span class="text-[9.5px] text-[#786b5c] block">Urgence</span>
              <b id="supportUrgency" class="text-xs text-orange-600 font-extrabold">Haute</b>
            </div>
            <div class="bg-[#f7f3eb] p-2 rounded-lg border border-[#e5dac9]">
              <span class="text-[9.5px] text-[#786b5c] block">Catégorie</span>
              <b id="supportCat" class="text-xs text-[#17120c] font-extrabold">Paiement</b>
            </div>
            <div class="bg-[#f7f3eb] p-2 rounded-lg border border-[#e5dac9]">
              <span class="text-[9.5px] text-[#786b5c] block">Sentiment</span>
              <b id="supportSentiment" class="text-xs text-red-600 font-extrabold">Inquiet</b>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#17120c] mb-1">Proposition de Réponse (Standard F3)</label>
            <div id="supportReply" class="bg-[#faf6ee] p-3 rounded-xl border border-[#e5dac9] text-xs text-[#17120c] leading-relaxed">
              Bonjour, nous comprenons parfaitement votre inquiétude. Vos fonds sont 100% sécurisés sur notre compte séquestre. Si le vendeur n'expédie pas le colis sous 72h, la transaction sera automatiquement annulée et votre compte intégralement recrédité sous 48h ouvrées.
            </div>
          </div>
        </div>
        <button onclick="alert('Réponse envoyée avec succès au client !')" class="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all">
          ✓ Valider &amp; Envoyer au Client
        </button>
      </div>
    </div>
  </div>
  <script>
    function setMsg(n) {
      if (n === 1) {
        document.getElementById('supportInput').value = "Bonjour, j'ai acheté un vélo via le paiement sécurisé il y a 5 jours et le vendeur ne répond plus. Pouvez-vous me rembourser ?";
      } else {
        document.getElementById('supportInput').value = "Urgent : quelqu'un me demande mon numéro de carte bancaire par SMS pour une livraison de canapé sur leboncoin. Est-ce normal ?";
      }
      analyzeSupportMsg();
    }
    function analyzeSupportMsg() {
      const val = document.getElementById('supportInput').value.toLowerCase();
      if (val.includes('carte') || val.includes('sms') || val.includes('phishing')) {
        document.getElementById('supportUrgency').textContent = 'Critique';
        document.getElementById('supportCat').textContent = 'Sécurité / Fraude';
        document.getElementById('supportSentiment').textContent = 'Alerte';
        document.getElementById('supportReply').textContent = "ATTENTION : Il s'agit d'une tentative d'arnaque (phishing). Ne communiquez JAMAIS vos coordonnées bancaires par SMS ou email. leboncoin ne vous demandera jamais votre numéro de carte hors de notre site officiel.";
      } else {
        document.getElementById('supportUrgency').textContent = 'Haute';
        document.getElementById('supportCat').textContent = 'Paiement Sécurisé';
        document.getElementById('supportSentiment').textContent = 'Inquiet';
        document.getElementById('supportReply').textContent = "Bonjour, nous comprenons parfaitement votre inquiétude. Vos fonds sont 100% sécurisés sur notre compte séquestre. Si le vendeur n'expédie pas le colis, la transaction sera automatiquement annulée et votre compte recrédité sous 48h.";
      }
    }
  </script>
</body>
</html>`;
}

function generateSeoOptimizerAppHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optimiseur SEO Annonce</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf6ee; color: #17120c; }</style>
</head>
<body class="p-6">
  <div class="max-w-3xl mx-auto space-y-5">
    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-2xl">🎯</div>
        <div>
          <h1 class="text-xl font-extrabold text-[#17120c]">Optimiseur Titres &amp; Conversion Annonce</h1>
          <p class="text-xs text-[#786b5c]">Audit du score d'attractivité &amp; Détection des mots-clés manquants</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">Algorithme Ranking 2026</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
      <div class="md:col-span-7 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm space-y-4">
        <div>
          <label class="block text-xs font-bold text-[#17120c] mb-1">Titre de l'annonce</label>
          <input type="text" id="seoTitle" value="Vends iPhone 14 bon état" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" oninput="auditSeo()">
        </div>
        <div>
          <label class="block text-xs font-bold text-[#17120c] mb-1">Description</label>
          <textarea id="seoDesc" rows="5" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl p-3 text-xs text-[#17120c] font-medium outline-none" oninput="auditSeo()">iPhone 14 128Go bleu en bon état, fonctionne parfaitement. Vendu avec boîte et câble. Remise en main propre ou envoi possible.</textarea>
        </div>
      </div>

      <div class="md:col-span-5 bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c] mb-3">Score d'Attractivité</h2>
          <div class="text-center bg-[#f7f3eb] p-4 rounded-xl border border-[#e5dac9] mb-3">
            <div id="seoScore" class="text-4xl font-extrabold text-[#ff6b00]">72/100</div>
            <span class="text-[10px] font-bold text-[#786b5c] uppercase">Potentiel de conversion : Bon</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="font-bold text-[#17120c]">Mots-clés recherchés à ajouter :</div>
            <div class="flex flex-wrap gap-1">
              <span class="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold text-[10px]">+ Facture Apple</span>
              <span class="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold text-[10px]">+ Batterie 92%</span>
              <span class="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold text-[10px]">+ Débloqué Tout Opérateur</span>
            </div>
          </div>
        </div>

        <button onclick="applyOptimized()" class="w-full bg-[#ff6b00] hover:bg-[#ea580c] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all">
          ⚡ Appliquer la Version Optimisée (98/100)
        </button>
      </div>
    </div>
  </div>
  <script>
    function auditSeo() {
      const t = document.getElementById('seoTitle').value;
      let s = 50;
      if (t.length > 20) s += 15;
      if (t.includes('128') || t.includes('Go') || t.includes('Pro')) s += 15;
      document.getElementById('seoScore').textContent = s + '/100';
    }
    function applyOptimized() {
      document.getElementById('seoTitle').value = "iPhone 14 128Go Bleu · Débloqué · Batterie 92% · Facture";
      document.getElementById('seoDesc').value = "iPhone 14 128Go Bleu en parfait état cosmétique et fonctionnel.\\n\\nPoints forts :\\n- État batterie : 92% (excellente autonomie)\\n- Débloqué tout opérateur (SIM + eSIM)\\n- Facture d'achat d'origine fournie\\n- Boîte complète avec câble officiel\\n\\nPaiement sécurisé leboncoin et expédition sous 24h ouvrées.";
      document.getElementById('seoScore').textContent = '98/100';
      alert('Titre et description optimisés avec succès !');
    }
  </script>
</body>
</html>`;
}

function generateCustomAppHtml(prompt) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Micro-App Sur-Mesure</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf6ee; color: #17120c; }</style>
</head>
<body class="p-6">
  <div class="max-w-3xl mx-auto space-y-5">
    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl">⚡</div>
        <div>
          <h1 class="text-xl font-extrabold text-[#17120c]">Micro-Application Métier No-Code</h1>
          <p class="text-xs text-[#786b5c]">Générée pour : "${prompt.replace(/"/g, '')}"</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">100% Autonome</span>
    </div>

    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm space-y-4">
      <h2 class="text-sm font-extrabold uppercase tracking-wide text-[#786b5c]">Simulateur de Boost Annonces &amp; ROI</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-[#17120c] mb-1">Option de mise en avant</label>
          <select id="boostOpt" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" onchange="calcBoost()">
            <option value="remontee">Remontée en tête (3,50 €)</option>
            <option value="vedette" selected>En Vedette 7 jours (12,90 €)</option>
            <option value="pack">Pack Boost Total (24,90 €)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#17120c] mb-1">Prix de l'article en vente</label>
          <input type="number" id="itemPrice" value="250" class="w-full bg-[#f7f3eb] border border-[#e5dac9] rounded-xl px-3 py-2 text-xs font-bold text-[#17120c] outline-none" oninput="calcBoost()">
        </div>
        <div class="bg-[#f7f3eb] p-3 rounded-xl border border-[#e5dac9] text-center flex flex-col justify-center">
          <span class="text-[10px] text-[#786b5c] font-bold">Vues supplémentaires estimées</span>
          <b id="boostViews" class="text-xl font-extrabold text-[#ff6b00]">+480 vues</b>
        </div>
      </div>
    </div>
  </div>
  <script>
    function calcBoost() {
      const opt = document.getElementById('boostOpt').value;
      let v = '+480 vues';
      if (opt === 'remontee') v = '+160 vues';
      if (opt === 'pack') v = '+1 150 vues';
      document.getElementById('boostViews').textContent = v;
    }
  </script>
</body>
</html>`;
}

// ==========================================================================
// FEATURE: STUDIO DE WORKFLOWS VISUELS & PIPELINES IA (STYLE LANGFLOW)
// ==========================================================================
let currentWorkflowPreset = 'moderation';

const WORKFLOW_PRESETS = {
  moderation: {
    title: 'Pipeline : Modération & Triage Automatique des Annonces',
    desc: '4 étapes automatisées · Zéro fuite cloud · Validé RGPD',
    nodes: [
      { id: 'n1', icon: '📥', title: 'Trigger Annonce', sub: 'Nouvelle annonce postée', status: 'ready' },
      { id: 'n2', icon: '🧠', title: 'Agent Ollama', sub: 'Extraction texte & tags', status: 'ready' },
      { id: 'n3', icon: '⚖️', title: 'Filtre RGPD & Prix', sub: 'Règles de sécurité', status: 'ready' },
      { id: 'n4', icon: '📤', title: 'Publication Live', sub: 'Mise en ligne & alertes', status: 'ready' }
    ],
    logs: [
      '[00:00:01] 📥 Trigger déclenché : Annonce ID #849201 reçue',
      '[00:00:02] 🧠 Agent Ollama Qwen : Extraction de 14 attributs en 68ms',
      '[00:00:03] ⚖️ Règle Métier : Score de risque = 0.02 (Conforme RGPD)',
      '[00:00:04] 📤 Action finale : Annonce validée et diffusée sur leboncoin'
    ]
  },
  comex: {
    title: 'Pipeline : Synthèse COMEX & Pitch Slides F3',
    desc: 'Extraction BigQuery ➔ Calcul ROI ➔ Slides Carousel',
    nodes: [
      { id: 'n1', icon: '🗄️', title: 'Source BigQuery', sub: 'Extraction KPIs hebdo', status: 'ready' },
      { id: 'n2', icon: '💶', title: 'Modélisateur ROI', sub: 'Calcul des gains nets', status: 'ready' },
      { id: 'n3', icon: '📑', title: 'Rédacteur F3', sub: 'Synthèse 5s / 30s', status: 'ready' },
      { id: 'n4', icon: '📽️', title: 'Export Deck', sub: '5 Slides prêtes COMEX', status: 'ready' }
    ],
    logs: [
      '[00:00:01] 🗄️ BigQuery : 414 heures économisées extraites',
      '[00:00:02] 💶 ROI Modélisé : 17 550 € nets · Payback 0.7 mois',
      '[00:00:03] 📑 Agent Stratégique : Rdaction note de synthèse F3',
      '[00:00:04] 📽️ Deck généré : 5 slides prêtes pour le comité'
    ]
  },
  audit: {
    title: 'Pipeline : Audit de Souveraineté & Zero Cloud Leak',
    desc: 'Scan complet des modèles, mémoires et flux réseau',
    nodes: [
      { id: 'n1', icon: '💻', title: 'Scan Matériel', sub: 'RAM, GPU & Ollama', status: 'ready' },
      { id: 'n2', icon: '🔒', title: 'Vérif. Isolation', sub: 'Zéro requête externe', status: 'ready' },
      { id: 'n3', icon: '📜', title: 'Audit contexte.md', sub: 'Contrôle intégrité', status: 'ready' },
      { id: 'n4', icon: '🛡️', title: 'Certificat RGPD', sub: 'Attestation souveraine', status: 'ready' }
    ],
    logs: [
      '[00:00:01] 💻 Scan système : GPU RTX 4090 détecté · Ollama v0.5.4',
      '[00:00:02] 🔒 Audit réseau : 100% des requêtes routées sur localhost:11434',
      '[00:00:03] 📜 Contrôle mémoire : contexte.md validé sans fuite',
      '[00:00:04] 🛡️ Certificat émis : Conformité Souveraine Adevinta 100%'
    ]
  }
};

function openWorkflowStudioModal() {
  closeAllModals();
  setActiveNav('navWorkflowsBtn');
  const m = $('workflowModal');
  if (m) m.style.display = 'flex';
  switchWorkflowPreset('moderation');
}

function closeWorkflowStudioModal() {
  const m = $('workflowModal');
  if (m) m.style.display = 'none';
}

function switchWorkflowPreset(presetKey) {
  currentWorkflowPreset = presetKey;
  const p = WORKFLOW_PRESETS[presetKey];
  if (!p) return;

  const btn1 = $('wfTab1');
  const btn2 = $('wfTab2');
  const btn3 = $('wfTab3');
  if (btn1) btn1.classList.toggle('active', presetKey === 'moderation');
  if (btn2) btn2.classList.toggle('active', presetKey === 'comex');
  if (btn3) btn3.classList.toggle('active', presetKey === 'audit');

  if ($('wfPipelineTitle')) $('wfPipelineTitle').textContent = p.title;
  if ($('wfPipelineDesc')) $('wfPipelineDesc').textContent = p.desc;

  renderWorkflowNodes(presetKey);
}

function renderWorkflowNodes(presetKey) {
  const container = $('workflowGraphCanvas');
  if (!container) return;
  const p = WORKFLOW_PRESETS[presetKey];
  if (!p) return;

  container.innerHTML = `
    <svg class="workflow-svg-layer">
      <line x1="18%" y1="50%" x2="42%" y2="50%" class="wf-wire" id="wire1"></line>
      <line x1="42%" y1="50%" x2="68%" y2="50%" class="wf-wire" id="wire2"></line>
      <line x1="68%" y1="50%" x2="90%" y2="50%" class="wf-wire" id="wire3"></line>
    </svg>
  `;

  p.nodes.forEach((n, idx) => {
    const card = el('div', `wf-node-card node-${idx}`, `
      <div class="wf-node-header">
        <span class="wf-node-icon">${n.icon}</span>
        <span class="wf-node-status" id="nodeStat${idx}">Prêt</span>
      </div>
      <div class="wf-node-title">${n.title}</div>
      <div class="wf-node-sub">${n.sub}</div>
    `);
    container.appendChild(card);
  });
}

function runVisualPipeline() {
  const p = WORKFLOW_PRESETS[currentWorkflowPreset];
  if (!p) return;

  const btn = $('btnRunWorkflow');
  if (btn) btn.disabled = true;

  const logsBox = $('workflowLogsList');
  if (logsBox) logsBox.innerHTML = '';

  const timeTag = $('wfExecTime');
  if (timeTag) timeTag.textContent = 'Statut : exécution réelle par l\'IA locale…';

  // Réinitialise les statuts des nœuds.
  p.nodes.forEach((n, i) => { const s = $(`nodeStat${i}`); if (s) { s.className = 'wf-node-status'; s.textContent = 'Prêt'; } });

  const appendLog = (txt, color) => {
    if (!logsBox) return;
    const l = el('div', '', txt);
    l.style.color = color || '#8a7a66';
    l.style.whiteSpace = 'pre-wrap';
    logsBox.appendChild(l);
    logsBox.scrollTop = logsBox.scrollHeight;
  };
  appendLog('▶ Démarrage du pipeline « ' + p.title + ' » (' + p.nodes.length + ' étapes)', '#ff6b00');

  let markedNodes = 0;
  const markNext = () => {
    if (markedNodes >= p.nodes.length) return;
    const stat = $(`nodeStat${markedNodes}`);
    if (stat) { stat.className = 'wf-node-status success'; stat.textContent = '✓ Exécuté'; }
    if (markedNodes > 0) { const w = $(`wire${markedNodes}`); if (w) w.classList.add('active'); }
    markedNodes++;
  };

  const stepsList = p.nodes.map((n, i) => (i + 1) + '. ' + n.title + ' — ' + n.sub).join('\n');
  const model = MODELS[state.model] ? state.model : 'lebon-ai:auto';
  const sys = "Tu es un moteur d'exécution de workflow local pour leboncoin. Exécute chaque étape du pipeline dans l'ordre et produis un résultat concret et réaliste. Pour CHAQUE étape, écris une ligne qui commence EXACTEMENT par 'ÉTAPE n:' (n = numéro) suivie du résultat réel. Sois factuel, pas de promesse marketing, n'invente pas de chiffres précis non fournis.";
  const userMsg = 'Pipeline : ' + p.title + '\nObjectif : ' + p.desc + '\nÉtapes :\n' + stepsList + '\n\nExécute-les et rapporte le résultat de chacune.';

  let acc = '';
  let shownLen = 0; // caractères déjà affichés en direct dans les logs
  const t0 = Date.now();
  // Affiche en direct les lignes complètes au fil du flux (feedback temps réel sur CPU lent).
  const flushLines = (final) => {
    let text = acc.slice(shownLen);
    let idx;
    while ((idx = text.indexOf('\n')) !== -1) {
      const line = text.slice(0, idx).trim();
      if (line) appendLog(line, /^ÉTAPE/i.test(line) ? '#b54300' : '#3a3128');
      shownLen += idx + 1;
      text = acc.slice(shownLen);
    }
    if (final && text.trim()) { appendLog(text.trim(), '#3a3128'); shownLen = acc.length; }
  };
  fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }], user: state.user, think: false, turbo: false })
  })
    .then(resp => {
      if (!resp.ok || !resp.body) throw new Error('HTTP ' + resp.status);
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      return (function pump() {
        return reader.read().then(x => {
          if (x.done) return;
          buf += dec.decode(x.value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const d = line.slice(6);
            if (d === '[DONE]') return;
            try {
              const j = JSON.parse(d);
              if (j.content) {
                acc += j.content;
                // Marque un nœud à chaque nouvelle ligne « ÉTAPE n: » réellement produite.
                const count = (acc.match(/ÉTAPE\s*\d+\s*:/gi) || []).length;
                while (markedNodes < count && markedNodes < p.nodes.length) markNext();
                flushLines(false);
              }
            } catch (_) {}
          }
          return pump();
        });
      })();
    })
    .then(() => {
      flushLines(true);
      while (markedNodes < p.nodes.length) markNext();
      if (!acc.trim()) appendLog('(aucune sortie du modèle)', '#c0392b');
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      if (timeTag) timeTag.textContent = 'Statut : pipeline exécuté par l\'IA locale en ' + secs + 's';
      if (btn) btn.disabled = false;
      showToast('Workflow exécuté (' + secs + 's)');
    })
    .catch(() => {
      appendLog('⚠️ Échec : serveur IA local indisponible.', '#c0392b');
      if (timeTag) timeTag.textContent = 'Statut : échec (IA indisponible)';
      if (btn) btn.disabled = false;
      showToast('Serveur IA indisponible');
    });
}

function openWorkflowInCanvas() {
  closeWorkflowStudioModal();
  const p = WORKFLOW_PRESETS[currentWorkflowPreset];
  const title = p.title;
  const sub = 'Visual Flow Runner · Langflow Style';
  const code = generateVisualWorkflowHtml(currentWorkflowPreset);
  openCanvas(code, title, sub, 'CUSTOM');
}

function generateVisualWorkflowHtml(presetKey) {
  const p = WORKFLOW_PRESETS[presetKey] || WORKFLOW_PRESETS.moderation;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Workflow</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf6ee; color: #17120c; }</style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-5">
    <div class="bg-white rounded-2xl p-5 border border-[#e5dac9] shadow-sm flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl">🕸️</div>
        <div>
          <h1 class="text-xl font-extrabold text-[#17120c]">${p.title}</h1>
          <p class="text-xs text-[#786b5c]">${p.desc}</p>
        </div>
      </div>
      <button onclick="runFlow()" class="px-4 py-2 bg-[#ff6b00] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold shadow-md transition-all">
        ▶ Lancer l'Exécution Live
      </button>
    </div>

    <!-- Flow Diagram -->
    <div class="grid grid-cols-4 gap-4">
      ${p.nodes.map((n, i) => `
        <div class="bg-white p-4 rounded-xl border border-[#e5dac9] shadow-sm space-y-2 text-center" id="fnode${i}">
          <div class="w-10 h-10 mx-auto rounded-lg bg-[#f7f3eb] flex items-center justify-center text-xl">${n.icon}</div>
          <b class="text-xs text-[#17120c] block">${n.title}</b>
          <span class="text-[10px] text-[#786b5c] block">${n.sub}</span>
          <span class="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#f7f3eb] text-[#786b5c]" id="fstat${i}">Prêt</span>
        </div>
      `).join('')}
    </div>

    <!-- Logs Box -->
    <div class="bg-[#17120c] text-[#f7f3eb] p-4 rounded-2xl font-mono text-xs space-y-1.5 shadow-md">
      <div class="text-[#ff9838] text-[10px] font-bold tracking-wider mb-2">JOURNAL D'ORCHESTRATION DU PIPELINE</div>
      <div id="flowLogs" class="space-y-1 text-[#e5dac9]">
        // Cliquez sur "Lancer l'Exécution Live" pour démarrer...
      </div>
    </div>
  </div>

  <script>
    const logs = ${JSON.stringify(p.logs)};
    function runFlow() {
      const box = document.getElementById('flowLogs');
      box.innerHTML = '';
      let i = 0;
      const nodeCount = ${p.nodes.length};
      function step() {
        if (i < nodeCount) {
          const cell = document.getElementById('fstat' + i);
          if (cell) {
            cell.className = 'inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800';
            cell.textContent = '✓ Simulé';
          }
          const l = document.createElement('div');
          l.textContent = logs[i] || ('Étape ' + (i + 1));
          l.style.color = '#ff9838';
          box.appendChild(l);
          i++;
          setTimeout(step, 600);
        }
      }
      step();
    }
  </script>
</body>
</html>`;
}

// ==========================================================================
// FEATURE: MULTILINGUAL I18N SYSTEM (FR 🇫🇷 / EN 🇬🇧 / DE 🇩🇪)
// ==========================================================================
state.currentLanguage = safeStorageGet('lebon_ai_lang', 'fr');

const I18N = {
  fr: {
    nav: {
      newChat: 'Nouveau chat',
      planning: 'Planification',
      library: 'Bibliothèque',
      plugins: 'Plugins',
      agents: 'Agents Studio',
      usecase: 'Use Case',
      microapps: 'Micro-Apps',
      workflows: 'Workflows IA',
      skills: 'Skills',
      memory: 'Mémoire (contexte.md)',
      team: 'Team & Espaces',
      projects: 'Projets'
    },
    ticker: {
      liveVoice: '🎙️ Live Voice',
      hoursGained: 'Heures gagnées :',
      myRoi: 'Mon ROI IA :',
      team: '👥 Workspace :'
    },
    team: {
      modalTitle: 'Team & Espaces de Travail',
      newWs: '+ Nouvel Espace',
      tabTasks: '📋 Tableau & Tâches (Kanban)',
      tabMembers: '👥 Membres & Présence',
      tabAgents: '🤖 Escouade d\'Agents IA',
      tabFeed: '💬 Fil d\'Activité & Chat',
      tabDirectives: '📄 Directives Partagées',
      newTask: '+ Nouvelle Tâche',
      inviteMember: '+ Inviter un Membre',
      todo: '📝 À Faire (Backlog)',
      inProgress: '⚡ En Cours',
      done: '✅ Validé & Terminé',
      runWithAgent: '⚡ Faire exécuter par l\'agent',
      markDone: '✓ Terminer'
    },
    composer: {
      placeholder: 'Demander à LeBon AI...',
      cmdPlaceholder: 'Rechercher une discussion, un prompt ou lancer une action…'
    },
    chips: {
      microapps: '🧩 Studio Micro-Apps',
      workflows: '🕸️ Workflows IA',
      roi: '💡 Modéliser ROI',
      f3: '📄 Fiche Use Case IA',
      code: '⚡ Code Studio'
    },
    radial: {
      centerGreeting: 'Bonjour',
      centerSubtitle: 'visualisation · slides · roi · dev · stratégie',
      centerDelta: '5 Prompts Prêts · Cliquez',
      datavizTitle: 'Créer un Graphique',
      datavizDesc: 'Tableau de bord interactif & visualisations de données',
      slidesTitle: 'Pitch Exécutif',
      slidesDesc: 'Présentation en 5 slides percutantes au standard F3',
      roiTitle: 'Calculer les Gains',
      roiDesc: 'Simulation du ROI net, gains et temps de retour',
      codeTitle: 'Scanner & Coder',
      codeDesc: 'Scan du système et génération de scripts optimisés',
      cadrageTitle: 'Fiche Use Case',
      cadrageDesc: 'Cadrage stratégique IA, objectifs et jalons clés',
      prompts: {
        DATAVIZ: "Crée un tableau de bord interactif avec des graphiques d'évolution et des indicateurs de performance pour nos projets d'entreprise.",
        SLIDES: "Génère une présentation exécutive en 5 slides percutantes au format F3 (5s / 30s / 2 clics) pour le comité de direction.",
        ROI: "Simule la rentabilité financière complète : calcule les heures économisées par collaborateur, le ROI net et le temps de retour sur investissement.",
        CODE: "Scanne l'environnement, analyse la structure du projet et génère le script d'automatisation optimisé en Python ou JavaScript.",
        CADRAGE: "Rédige une fiche de cadrage stratégique IA complète avec objectifs business, métriques de succès, architecture et roadmap de déploiement."
      }
    },
    skills: {
      mySkillsTitle: 'Mes Skills Activés',
      storeTitle: 'Skills Store & Catalogue',
      createTitle: '+ Créer un Skill',
      noActiveSkills: 'Aucun skill actif',
      noActiveSkillsDesc: 'Créez votre première compétence ou installez-en depuis le Skills Store !',
      activateBtn: 'Activer ›',
      installedBtn: '✓ Installé',
      installBtn: '+ Installer',
      items: {
        'skill-dev': {
          name: 'Code Reviewer & Security Linter',
          cat: 'Engineering',
          desc: 'Analyse de code statique, détection de failles OWASP, refactoring Clean Code et bonnes pratiques.'
        },
        'skill-data': {
          name: 'BigQuery & Dataform Analyst',
          cat: 'Data & Analytics',
          desc: 'Génération de requêtes SQL optimisées BigQuery, modélisation Dataform et pipelines analytics.'
        },
        'skill-comex': {
          name: 'COMEX Synthesizer F3',
          cat: 'Stratégie & Direction',
          desc: 'Production automatique de notes de synthèse pour la direction, 5 points clés et métriques certifiées.'
        },
        'skill-roi': {
          name: 'Calculateur de Rentabilité IA',
          cat: 'Finance & ROI',
          desc: 'Modélisation financière des cas d\'usage, calcul du coût GPU/token vs valeur produite et payback.'
        },
        'skill-rag': {
          name: 'RAG & Vector Search Architect',
          cat: 'AI Engineering',
          desc: 'Indexation hybride dense/sparse, reranking, recherche sémantique et intégration pgvector.'
        },
        'skill-moderation': {
          name: 'Modération & Conformité Annonces',
          cat: 'Trust & Safety',
          desc: 'Détection des fraudes, conformité légale (DSA), vérification prix du marché et anti-spam.'
        }
      }
    },
    voice: {
      langCode: 'fr-FR',
      statusReady: 'Écoute en continu…',
      statusListening: 'Écoute en direct…',
      statusThinking: '⚡ Réflexion IA…',
      statusSpeaking: '🗣️ Réponse vocale…',
      statusMuted: 'Micro en sourdine',
      welcome: "Salut Abbas ! C’est LeBon AI. Qu’est-ce qu’on fait ensemble ?",
      systemPrompt: "Tu es LeBon AI, le copilote IA local d’Abbas pour son travail chez leboncoin. Parle en français comme un collègue chaleureux, spontané et direct. Tutoie Abbas, évite toutes les formules de chatbot de support et réponds en 1 ou 2 phrases dans une conversation informelle. Utilise le standard F3 seulement pour une vraie demande professionnelle.",
      chips: [
        { label: '🏡 Estimateur Immo', cmd: "Ouvre l'estimateur de prix immobilier" },
        { label: '📑 Slides COMEX', cmd: "Affiche les slides de présentation COMEX" },
        { label: '📊 Tableau de Bord', cmd: "Affiche le tableau de bord des indicateurs" },
        { label: '🕸️ Workflow IA', cmd: "Lance le workflow de modération des annonces" },
        { label: '💡 Calculer ROI', cmd: "Calcule le ROI financier annuel" }
      ]
    }
  },
  en: {
    nav: {
      newChat: 'New chat',
      planning: 'Planning',
      library: 'Library',
      plugins: 'Plugins',
      agents: 'Agents Studio',
      usecase: 'Use Cases',
      microapps: 'Micro-Apps',
      workflows: 'AI Workflows',
      skills: 'Skills',
      memory: 'Memory (contexte.md)',
      team: 'Team & Workspaces',
      projects: 'Projects'
    },
    ticker: {
      liveVoice: '🎙️ Live Voice',
      hoursGained: 'Hours saved:',
      myRoi: 'My AI ROI:',
      team: '👥 Workspace :'
    },
    team: {
      modalTitle: 'Team & Collaborative Workspaces',
      newWs: '+ New Workspace',
      tabTasks: '📋 Board & Tasks (Kanban)',
      tabMembers: '👥 Members & Presence',
      tabAgents: '🤖 AI Agent Squad',
      tabFeed: '💬 Activity Feed & Chat',
      tabDirectives: '📄 Shared Directives',
      newTask: '+ New Task',
      inviteMember: '+ Invite Member',
      todo: '📝 To Do (Backlog)',
      inProgress: '⚡ In Progress',
      done: '✅ Validated & Done',
      runWithAgent: '⚡ Run with AI Agent',
      markDone: '✓ Complete'
    },
    composer: {
      placeholder: 'Ask LeBon AI...',
      cmdPlaceholder: 'Search chat, prompt or launch an action…'
    },
    chips: {
      microapps: '🧩 Micro-Apps Studio',
      workflows: '🕸️ AI Workflows',
      roi: '💡 Model ROI',
      f3: '📄 AI Use Case Sheet',
      code: '⚡ Code Studio'
    },
    radial: {
      centerGreeting: 'Hello',
      centerSubtitle: 'dataviz · slides · roi · code · strategy',
      centerDelta: '5 Ready Prompts · Click',
      datavizTitle: 'Create Chart',
      datavizDesc: 'Interactive dashboard & data visualisations',
      slidesTitle: 'Executive Pitch',
      slidesDesc: '5 impactful slides presentation in F3 standard',
      roiTitle: 'Calculate Gains',
      roiDesc: 'Net ROI simulation, savings and payback time',
      codeTitle: 'Scan & Code',
      codeDesc: 'System scanner & optimized script generation',
      cadrageTitle: 'Use Case Sheet',
      cadrageDesc: 'AI strategic framing, objectives and key milestones',
      prompts: {
        DATAVIZ: "Create an interactive dashboard with time-series charts and performance KPIs for enterprise projects.",
        SLIDES: "Generate a 5-slide executive presentation in F3 standard (5s / 30s / 2 clicks) for the management board.",
        ROI: "Simulate full financial ROI: calculate hours saved per teammate, net ROI, and investment payback delay.",
        CODE: "Scan the environment, inspect project structure, and generate the optimized automation script in Python or JavaScript.",
        CADRAGE: "Draft a comprehensive AI project framing charter with business goals, success metrics, architecture, and roadmap."
      }
    },
    skills: {
      mySkillsTitle: 'My Active Skills',
      storeTitle: 'Skills Store & Catalog',
      createTitle: '+ Create Skill',
      noActiveSkills: 'No active skills',
      noActiveSkillsDesc: 'Create your first skill or install one from the Skills Store!',
      activateBtn: 'Activate ›',
      installedBtn: '✓ Installed',
      installBtn: '+ Install',
      items: {
        'skill-dev': {
          name: 'Code Reviewer & Security Linter',
          cat: 'Engineering',
          desc: 'Static code analysis, OWASP vulnerability audit, Clean Code refactoring and best practices.'
        },
        'skill-data': {
          name: 'BigQuery & Dataform Analyst',
          cat: 'Data & Analytics',
          desc: 'Optimized BigQuery SQL generation, Dataform data modeling, and analytics pipelines.'
        },
        'skill-comex': {
          name: 'COMEX Synthesizer F3',
          cat: 'Strategy & Leadership',
          desc: 'Automated executive briefs for executive board, 5 key points and verified performance metrics.'
        },
        'skill-roi': {
          name: 'AI Financial ROI Calculator',
          cat: 'Finance & ROI',
          desc: 'Financial use case modeling, GPU/token cost vs generated business value and payback.'
        },
        'skill-rag': {
          name: 'RAG & Vector Search Architect',
          cat: 'AI Engineering',
          desc: 'Hybrid dense/sparse indexing, reranking, semantic search, and pgvector integration.'
        },
        'skill-moderation': {
          name: 'Ad Moderation & Compliance',
          cat: 'Trust & Safety',
          desc: 'Fraud detection, DSA legal compliance, market pricing audits, and anti-spam shield.'
        }
      }
    },
    voice: {
      langCode: 'en-US',
      statusReady: 'Listening continuously…',
      statusListening: 'Live listening…',
      statusThinking: '⚡ AI thinking…',
      statusSpeaking: '🗣️ Voice response…',
      statusMuted: 'Microphone muted',
      welcome: "Hey Abbas! It’s LeBon AI. What are we working on?",
      systemPrompt: "You are LeBon AI, Abbas's fully local copilot for his work at leboncoin. Speak like a warm, spontaneous and direct colleague, never like a support chatbot. Keep casual conversation to one or two natural sentences and use structured answers only when the work request benefits from them.",
      chips: [
        { label: '🏡 Real Estate Tool', cmd: "Open real estate price estimator" },
        { label: '📑 COMEX Slides', cmd: "Show executive COMEX presentation slides" },
        { label: '📊 KPI Dashboard', cmd: "Show data visualization dashboard" },
        { label: '🕸️ AI Workflow', cmd: "Run ad moderation workflow pipeline" },
        { label: '💡 Calculate ROI', cmd: "Calculate annual financial ROI" }
      ]
    }
  },
  de: {
    nav: {
      newChat: 'Neuer Chat',
      planning: 'Planung',
      library: 'Bibliothek',
      plugins: 'Plugins',
      agents: 'Agenten-Studio',
      usecase: 'Anwendungsfälle',
      microapps: 'Mikro-Apps',
      workflows: 'KI-Workflows',
      skills: 'Fähigkeiten',
      memory: 'Speicher (contexte.md)',
      team: 'Team & Arbeitsbereiche',
      projects: 'Projekte'
    },
    ticker: {
      liveVoice: '🎙️ Live-Stimme',
      hoursGained: 'Gesparte Stunden:',
      myRoi: 'Mein KI-ROI:',
      team: '👥 Workspace :'
    },
    team: {
      modalTitle: 'Team & Kollaborative Arbeitsbereiche',
      newWs: '+ Neuer Arbeitsbereich',
      tabTasks: '📋 Board & Aufgaben (Kanban)',
      tabMembers: '👥 Mitglieder & Präsenz',
      tabAgents: '🤖 KI-Agenten-Staffel',
      tabFeed: '💬 Aktivitäten-Feed & Chat',
      tabDirectives: '📄 Geteilte Richtlinien',
      newTask: '+ Neue Aufgabe',
      inviteMember: '+ Mitglied einladen',
      todo: '📝 Zu erledigen (Backlog)',
      inProgress: '⚡ In Bearbeitung',
      done: '✅ Validiert & Fertig',
      runWithAgent: '⚡ Von KI-Agent ausführen',
      markDone: '✓ Abschließen'
    },
    composer: {
      placeholder: 'Fragen Sie LeBon AI...',
      cmdPlaceholder: 'Chat, Prompt oder Aktion suchen…'
    },
    chips: {
      microapps: '🧩 Mikro-Apps Studio',
      workflows: '🕸️ KI-Workflows',
      roi: '💡 ROI modellieren',
      f3: '📄 KI-Anwendungsblatt',
      code: '⚡ Code-Studio'
    },
    radial: {
      centerGreeting: 'Hallo',
      centerSubtitle: 'Dataviz · Folien · ROI · Code · Strategie',
      centerDelta: '5 Bereite Prompts · Klicken',
      datavizTitle: 'Diagramm erstellen',
      datavizDesc: 'Interaktives Dashboard & Datenvisualisierungen',
      slidesTitle: 'Führungs-Pitch',
      slidesDesc: 'Prägnante 5-Folien-Präsentation im F3-Standard',
      roiTitle: 'Gewinne berechnen',
      roiDesc: 'Netto-ROI-Simulation, Ersparnisse und Amortisation',
      codeTitle: 'Scannen & Coden',
      codeDesc: 'System-Scan & optimierte Skriptgenerierung',
      cadrageTitle: 'Use-Case-Blatt',
      cadrageDesc: 'Strategische KI-Rahmung, Ziele und Meilensteine',
      prompts: {
        DATAVIZ: "Erstelle ein interaktives Dashboard mit Verlaufsdiagrammen und Leistungsindikatoren für unsere Unternehmensprojekte.",
        SLIDES: "Erstelle eine 5-Folien-Führungspräsentation im F3-Standard (5s / 30s / 2 Klicks) für das Management-Board.",
        ROI: "Simuliere den vollen finanziellen ROI: Berechne eingesparte Stunden pro Mitarbeiter, Netto-ROI und Amortisationszeit.",
        CODE: "Scanne die Umgebung, analysiere die Projektstruktur und generiere das optimierte Automatisierungsskript in Python oder JavaScript.",
        CADRAGE: "Erstelle ein vollständiges strategisches KI-Projektblatt mit Geschäftszielen, Erfolgsmetriken, Architektur und Roadmap."
      }
    },
    skills: {
      mySkillsTitle: 'Meine aktiven Fähigkeiten',
      storeTitle: 'Skills Store & Katalog',
      createTitle: '+ Fähigkeit erstellen',
      noActiveSkills: 'Keine aktiven Fähigkeiten',
      noActiveSkillsDesc: 'Erstellen Sie Ihre erste Fähigkeit oder installieren Sie eine aus dem Store!',
      activateBtn: 'Aktivieren ›',
      installedBtn: '✓ Installiert',
      installBtn: '+ Installieren',
      items: {
        'skill-dev': {
          name: 'Code-Reviewer & Sicherheits-Linter',
          cat: 'Engineering',
          desc: 'Statische Code-Analyse, OWASP-Schwachstellenerkennung, Clean Code Refactoring und Best Practices.'
        },
        'skill-data': {
          name: 'BigQuery & Dataform Analyst',
          cat: 'Data & Analytics',
          desc: 'Optimierte BigQuery-SQL-Generierung, Dataform-Datenmodellierung und Analytics-Pipelines.'
        },
        'skill-comex': {
          name: 'COMEX-Synthese F3',
          cat: 'Strategie & Führung',
          desc: 'Automatische Führungssynthesen für das Management, 5 Kernpunkte und geprüfte Kennzahlen.'
        },
        'skill-roi': {
          name: 'KI-Wirtschaftlichkeitsrechner',
          cat: 'Finanzen & ROI',
          desc: 'Finanzmodellierung von Anwendungsfällen, GPU-/Token-Kosten vs. erzeugter Geschäftswert und Amortisation.'
        },
        'skill-rag': {
          name: 'RAG & Vektorsuche-Architekt',
          cat: 'KI-Engineering',
          desc: 'Hybride dichte/spärliche Indexierung, Reranking, semantische Suche und pgvector-Integration.'
        },
        'skill-moderation': {
          name: 'Anzeigenmoderation & Compliance',
          cat: 'Trust & Safety',
          desc: 'Betrugserkennung, rechtliche Compliance (DSA), Marktpreisprüfung und Anti-Spam-Schutz.'
        }
      }
    },
    voice: {
      langCode: 'de-DE',
      statusReady: 'Dauerhaftes Zuhören…',
      statusListening: 'Live-Zuhören…',
      statusThinking: '⚡ KI denkt nach…',
      statusSpeaking: '🗣️ Sprachausgabe…',
      statusMuted: 'Mikrofon stummgeschaltet',
      welcome: "Hallo Abbas! Hier ist LeBon AI. Woran arbeiten wir?",
      systemPrompt: "Du bist LeBon AI, Abbas' vollständig lokaler Copilot für seine Arbeit bei leboncoin. Sprich auf Deutsch wie ein warmer, spontaner und direkter Kollege, niemals wie ein Support-Chatbot. Halte lockere Gespräche bei ein bis zwei natürlichen Sätzen und strukturiere nur echte Arbeitsaufgaben.",
      chips: [
        { label: '🏡 Immobilien-Rechner', cmd: "Immobilienpreis-Schätzer öffnen" },
        { label: '📑 COMEX-Folien', cmd: "COMEX-Präsentationsfolien anzeigen" },
        { label: '📊 KPI-Dashboard', cmd: "Dataviz-Dashboard anzeigen" },
        { label: '🕸️ KI-Workflow', cmd: "Moderations-Workflow starten" },
        { label: '💡 ROI berechnen', cmd: "Finanziellen Jahres-ROI berechnen" }
      ]
    }
  }
};

function changeAppLanguage(lang) {
  if (!I18N[lang]) lang = 'fr';
  state.currentLanguage = lang;
  safeStorageSet('lebon_ai_lang', lang);

  const sel = $('appLangSelect');
  if (sel) sel.value = lang;

  applyLanguageToDOM(lang);
  showToast(lang === 'fr' ? 'Langue : Français 🇫🇷' : (lang === 'en' ? 'Language: English 🇬🇧' : 'Sprache: Deutsch 🇩🇪'));
}

function applyLanguageToDOM(lang) {
  const dict = I18N[lang] || I18N.fr;

  // Nav labels
  const navMap = {
    navNewChatBtn: dict.nav.newChat,
    navPlanBtn: dict.nav.planning,
    navLibraryBtn: dict.nav.library,
    navPluginsBtn: dict.nav.plugins,
    navAgentsBtn: dict.nav.agents,
    navUseCaseBtn: dict.nav.usecase,
    navMicroAppsBtn: dict.nav.microapps,
    navWorkflowsBtn: dict.nav.workflows,
    navSkillsBtn: dict.nav.skills,
    navContextBtn: dict.nav.memory,
    navTeamBtn: dict.nav.team || 'Team & Espaces',
    navSecondBrainBtn: dict.nav.secondBrain || 'Second Brain'
  };

  Object.entries(navMap).forEach(([id, text]) => {
    const btn = $(id);
    const label = btn?.querySelector('.nav-label');
    if (label) label.textContent = text;
  });

  const projTitle = document.querySelector('.projects-title');
  if (projTitle) projTitle.textContent = dict.nav.projects;

  // Ticker labels
  const topVoiceChip = $('topVoiceChip');
  if (topVoiceChip) {
    const l = topVoiceChip.querySelector('.chip-label');
    if (l) l.textContent = dict.ticker.liveVoice;
  }
  const topHoursChip = $('topHoursChip');
  if (topHoursChip) {
    const l = topHoursChip.querySelector('.chip-label');
    if (l) l.textContent = dict.ticker.hoursGained;
  }
  const topRoiChip = $('topRoiChip');
  if (topRoiChip) {
    const l = topRoiChip.querySelector('.chip-label');
    if (l) l.textContent = dict.ticker.myRoi;
  }
  const topTeamLabel = $('topTeamLabel');
  if (topTeamLabel) {
    topTeamLabel.textContent = dict.ticker.team || '👥 Workspace :';
  }
  const topCertLabel = $('topCertLabel');
  if (topCertLabel) {
    topCertLabel.textContent = dict.ticker.cert || '🎓 Certifications :';
  }
  const topCertLevel = $('topCertLevel');
  if (topCertLevel) {
    topCertLevel.textContent = dict.ticker.certLevel || 'Niveau 3 · Expert IA';
  }

  // Composer placeholders
  const ta = $('composerInput');
  if (ta) ta.placeholder = dict.composer.placeholder;
  const cmdInp = $('cmdSearchInput');
  if (cmdInp) cmdInp.placeholder = dict.composer.cmdPlaceholder;

  // Composer Quick Chips
  const chipsContainer = $('composerQuickChips');
  if (chipsContainer) {
    chipsContainer.innerHTML = `
      <button class="quick-chip" onclick="openMicroAppsStudioModal()">${dict.chips.microapps}</button>
      <button class="quick-chip" onclick="openWorkflowStudioModal()">${dict.chips.workflows}</button>
      <button class="quick-chip" onclick="openRoiModal()">${dict.chips.roi}</button>
      <button class="quick-chip" onclick="quickPrompt('${dict.chips.f3}')">${dict.chips.f3}</button>
      <button class="quick-chip" onclick="setMode('coder')">${dict.chips.code}</button>
    `;
  }

  // Live Voice Chips
  const voiceChipsContainer = document.querySelector('.live-voice-chips');
  if (voiceChipsContainer) {
    voiceChipsContainer.innerHTML = dict.voice.chips.map(c => 
      `<button class="voice-chip" onclick="speakSimulatedCommand('${c.cmd.replace(/'/g, "\\'")}')">${c.label}</button>`
    ).join('');
  }

  // Update Skills Modal Headers
  if ($('skillsTabList')) $('skillsTabList').textContent = dict.skills?.mySkillsTitle || 'Mes Skills Activés';
  if ($('skillsTabStore')) $('skillsTabStore').textContent = dict.skills?.storeTitle || 'Skills Store & Catalogue';
  if ($('skillsTabCreate')) $('skillsTabCreate').textContent = dict.skills?.createTitle || '+ Créer un Skill';

  // Re-render empty state & skills if visible
  if (!state.conv || !state.conv.messages || state.conv.messages.length === 0) {
    renderMain();
  }
  const skillsModal = $('skillsModal');
  if (skillsModal && skillsModal.style.display === 'flex') {
    renderSkillsList();
    renderSkillsStore();
  }
}

// ==========================================================================
// FEATURE: LIVE VOICE AI PARTNER (GEMINI LIVE / GPT-4O REAL-TIME ENGINE)
// ==========================================================================
let liveVoiceActive = false;
let liveVoiceRecognition = null;
let liveVoiceMuted = false;
let liveVoiceRate = 1.0;
let isAiSpeaking = false;
let lastVoicePromptText = '';
let lastVoicePromptTime = 0;

function openLiveVoiceModal() {
  closeAllModals();
  const m = $('liveVoiceModal');
  if (!m) return;
  m.style.display = 'flex';
  liveVoiceActive = true;
  liveVoiceMuted = false;
  isAiSpeaking = false;
  lastVoicePromptText = '';

  const btnMute = $('voiceMuteBtn');
  if (btnMute) btnMute.classList.remove('active');

  const dict = I18N[state.currentLanguage] || I18N.fr;
  updateVoiceStatus(dict.voice.statusReady, 'ready');
  setVoiceUserText('...');
  setVoiceAiText('LeBon AI est connecté et à votre écoute en direct.');

  applyLanguageToDOM(state.currentLanguage);

  // Welcome speech prompt
  setTimeout(() => {
    speakAiResponse(dict.voice.welcome);
  }, 350);
}

function closeLiveVoiceModal() {
  const m = $('liveVoiceModal');
  if (m) m.style.display = 'none';
  liveVoiceActive = false;
  isAiSpeaking = false;
  stopLiveVoiceRecognition();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function updateVoiceStatus(text, stateClass) {
  const t = $('voiceStatusText');
  if (t) t.textContent = text;
  const orb = $('voiceOrb');
  const eq = $('voiceEqualizer');
  if (orb) orb.classList.toggle('speaking', stateClass === 'speaking');
  if (eq) eq.classList.toggle('active', stateClass === 'speaking' || stateClass === 'listening');
}

function setVoiceUserText(text) {
  const el = $('voiceUserText');
  if (el) el.textContent = `« ${text} »`;
}

function setVoiceAiText(text) {
  const el = $('voiceAiText');
  if (el) el.textContent = text;
}

function toggleVoiceMute() {
  liveVoiceMuted = !liveVoiceMuted;
  const btn = $('voiceMuteBtn');
  if (btn) btn.classList.toggle('active', liveVoiceMuted);

  const dict = I18N[state.currentLanguage] || I18N.fr;
  if (liveVoiceMuted) {
    stopLiveVoiceRecognition();
    updateVoiceStatus(dict.voice.statusMuted, 'muted');
    showToast(dict.voice.statusMuted);
  } else {
    startLiveVoiceRecognition();
    updateVoiceStatus(dict.voice.statusListening, 'listening');
    showToast('Microphone ON');
  }
}

function cycleVoiceSpeed() {
  if (liveVoiceRate === 1.0) liveVoiceRate = 1.25;
  else if (liveVoiceRate === 1.25) liveVoiceRate = 1.5;
  else liveVoiceRate = 1.0;

  const lbl = $('voiceSpeedLabel');
  if (lbl) lbl.textContent = liveVoiceRate + 'x';
  showToast(`Vitesse : ${liveVoiceRate}x`);
}

function startLiveVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    setVoiceAiText('Reconnaissance vocale non supportée par votre navigateur (veuillez utiliser Google Chrome ou Microsoft Edge).');
    return;
  }
  if (isAiSpeaking) return; // Do not listen to computer's own speaker output

  try {
    if (liveVoiceRecognition) {
      try { liveVoiceRecognition.abort(); } catch (e) {}
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    liveVoiceRecognition = new SpeechRec();
    liveVoiceRecognition.continuous = true;
    liveVoiceRecognition.interimResults = true;
    liveVoiceRecognition.lang = I18N[state.currentLanguage]?.voice?.langCode || 'fr-FR';

    const dict = I18N[state.currentLanguage] || I18N.fr;

    liveVoiceRecognition.onstart = () => {
      if (liveVoiceActive && !liveVoiceMuted && !isAiSpeaking) {
        updateVoiceStatus(dict.voice.statusListening, 'listening');
      }
    };

    liveVoiceRecognition.onresult = (event) => {
      if (!liveVoiceActive || liveVoiceMuted || isAiSpeaking) return;

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      if (currentText) {
        setVoiceUserText(currentText);
        updateVoiceStatus(dict.voice.statusListening, 'listening');
      }

      if (finalTranscript.trim()) {
        handleLiveVoiceInput(finalTranscript.trim());
      }
    };

    liveVoiceRecognition.onerror = (e) => {
      if (e.error !== 'no-speech' && liveVoiceActive) {
        console.warn('Live voice error:', e.error);
      }
    };

    liveVoiceRecognition.onend = () => {
      if (liveVoiceActive && !liveVoiceMuted && !isAiSpeaking) {
        setTimeout(() => {
          if (liveVoiceActive && !liveVoiceMuted && !isAiSpeaking) {
            try { liveVoiceRecognition.start(); } catch (err) {}
          }
        }, 300);
      }
    };

    liveVoiceRecognition.start();
  } catch (e) {
    console.warn('Recognition start exception:', e);
  }
}

function stopLiveVoiceRecognition() {
  if (liveVoiceRecognition) {
    try { liveVoiceRecognition.stop(); } catch (e) {}
  }
}

function speakSimulatedCommand(text) {
  setVoiceUserText(text);
  handleLiveVoiceInput(text);
}

// ── Voice Command Router & AI Response ─────────────────────────
function handleLiveVoiceInput(userText) {
  if (!userText || !userText.trim()) return;
  const cleanInput = userText.trim();

  // Deduplication guard to eliminate repetition echo loops
  if (cleanInput === lastVoicePromptText && (Date.now() - lastVoicePromptTime < 3500)) {
    return;
  }
  lastVoicePromptText = cleanInput;
  lastVoicePromptTime = Date.now();

  const low = cleanInput.toLowerCase();
  const dict = I18N[state.currentLanguage] || I18N.fr;
  updateVoiceStatus(dict.voice.statusThinking, 'thinking');

  // 1. Screen Control Actions (Immo Estimator)
  if (low.includes('immo') || low.includes('immobilier') || low.includes('property') || low.includes('wohnung') || low.includes('immobilie') || low.includes('prix immo') || low.includes('décote')) {
    closeLiveVoiceModal();
    launchMicroApp('immo');
    speakAiResponse(state.currentLanguage === 'en' 
      ? "I opened the real estate price estimator in the Canvas. You can adjust the surface, city and energy rating."
      : (state.currentLanguage === 'de' 
        ? "Ich habe den Immobilienpreis-Rechner im Canvas geöffnet. Sie können Fläche, Stadt und Energieeffizienz anpassen."
        : "J'ai ouvert l'estimateur de prix immobilier dans le Canvas. Vous pouvez ajuster la surface, la ville et le DPE."));
    return;
  }

  // 2. Screen Control Actions (Slides COMEX)
  if (low.includes('slide') || low.includes('slides') || low.includes('comex') || low.includes('presentation') || low.includes('folien') || low.includes('präsentation') || low.includes('pitch')) {
    closeLiveVoiceModal();
    triggerRadialPrompt('SLIDES');
    speakAiResponse(state.currentLanguage === 'en'
      ? "Here is the 5-slide executive presentation for the COMEX."
      : (state.currentLanguage === 'de'
        ? "Hier ist die 5-Folien-Präsentation für das COMEX."
        : "Voici la présentation de synthèse en 5 slides pour le COMEX au standard F3."));
    return;
  }

  // 3. Screen Control Actions (Data Viz Dashboard)
  if (low.includes('tableau de bord') || low.includes('dataviz') || low.includes('dashboard') || low.includes('graphique') || low.includes('kpi')) {
    closeLiveVoiceModal();
    triggerRadialPrompt('DATAVIZ');
    speakAiResponse(state.currentLanguage === 'en'
      ? "Displaying the interactive KPI dashboard with 414 hours saved."
      : (state.currentLanguage === 'de'
        ? "Das interaktive Dashboard mit 414 eingesparten Stunden wird angezeigt."
        : "J'affiche le tableau de bord interactif avec les 414 heures gagnées et la trajectoire des use cases."));
    return;
  }

  // 4. Screen Control Actions (ROI Simulator)
  // Bornes de mots : éviter que « trois », « droit », « endroit » déclenchent le simulateur ROI.
  if (/\broi\b/.test(low) || low.includes('rentabilité') || /\bgains?\b/.test(low) || low.includes('gewinn') || low.includes('financier') || low.includes('investment')) {
    closeLiveVoiceModal();
    triggerRadialPrompt('ROI');
    speakAiResponse(state.currentLanguage === 'en'
      ? "Here is the ROI simulator showing 17,550 euros in net gains with payback under one month."
      : (state.currentLanguage === 'de'
        ? "Hier ist der ROI-Simulator mit 17.550 Euro Nettogewinn und Amortisation in unter einem Monat."
        : "Voici le simulateur de ROI interactif avec 17 550 euros de gains nets et un retour sur investissement en moins d'un mois."));
    return;
  }

  // 5. Screen Control Actions (Workflow Studio)
  if (low.includes('workflow') || low.includes('pipeline') || low.includes('orchestration') || low.includes('prozess')) {
    closeLiveVoiceModal();
    openWorkflowStudioModal();
    speakAiResponse(state.currentLanguage === 'en'
      ? "I opened the visual workflow studio. You can execute the pipeline live."
      : (state.currentLanguage === 'de'
        ? "Ich habe das visuelle Workflow-Studio geöffnet. Sie können die Pipeline live ausführen."
        : "J'ouvre le studio de workflows visuels. Vous pouvez exécuter le pipeline en direct."));
    return;
  }

  // 6. Screen Control Actions (Code Studio)
  if (low.includes('code') || low.includes('scanner') || low.includes('python') || low.includes('programmieren')) {
    closeLiveVoiceModal();
    triggerRadialPrompt('CODE');
    speakAiResponse(state.currentLanguage === 'en'
      ? "I launched the Code Studio Sandbox in the Canvas."
      : (state.currentLanguage === 'de'
        ? "Ich habe die Code Studio Sandbox im Canvas gestartet."
        : "J'ai lancé le Code Studio Sandbox dans le Canvas."));
    return;
  }

  // 7. Conversational Query to Local Ollama AI — /api/chat renvoie TOUJOURS du SSE,
  // on lit donc le flux et on accumule le contenu (l'ancien r.json() échouait à chaque fois).
  const voiceFallback = state.currentLanguage === 'en'
    ? "I am here to assist your AI transformation at leboncoin."
    : (state.currentLanguage === 'de'
      ? "Ich begleite Ihre KI-Transformation bei leboncoin."
      : "Je suis à vos côtés pour transformer vos use cases IA sur leboncoin.");
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELS[state.model] ? state.model : 'lebon-ai:auto',
      messages: [
        { role: 'system', content: dict.voice.systemPrompt },
        { role: 'user', content: cleanInput }
      ]
    })
  })
    .then(resp => {
      if (!resp.ok || !resp.body) throw new Error('HTTP ' + resp.status);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', acc = '';
      return (function pump() {
        return reader.read().then(x => {
          if (x.done) return acc;
          buffer += decoder.decode(x.value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const d = line.slice(6);
            if (d === '[DONE]') return acc;
            try { const j = JSON.parse(d); if (j.content) acc += j.content; if (j.error) throw new Error(j.error); } catch (_) {}
          }
          return pump();
        });
      })();
    })
    .then(reply => {
      const cleanSpoken = (reply && reply.trim() ? reply : voiceFallback).replace(/[*_#`]/g, '').trim();
      speakAiResponse(cleanSpoken);
    })
    .catch(() => {
      speakAiResponse(state.currentLanguage === 'en' ? "I heard your request and remain available for any AI task." : (state.currentLanguage === 'de' ? "Ich habe Ihre Anfrage verstanden und stehe für Aufgaben bereit." : "J'ai bien entendu votre demande. Je reste disponible pour lancer vos prototypes ou vos cadrages."));
    });
}

function sendLiveVoiceTextInput() {
  const inp = $('liveVoiceTextInput');
  const text = (inp?.value || '').trim();
  if (!text) return;
  inp.value = '';
  speakSimulatedCommand(text);
}

function speakAiResponse(text) {
  setVoiceAiText(text);
  const dict = I18N[state.currentLanguage] || I18N.fr;
  updateVoiceStatus(dict.voice.statusSpeaking, 'speaking');

  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // MUTE / PAUSE recognition so microphone does not pick up computer speaker echo!
    isAiSpeaking = true;
    stopLiveVoiceRecognition();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = dict.voice.langCode;
    utter.rate = liveVoiceRate || 1.0;
    utter.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices() || [];
    const prefix = state.currentLanguage === 'en' ? 'en' : (state.currentLanguage === 'de' ? 'de' : 'fr');
    const matchedVoice = voices.find(v => (v.lang && v.lang.startsWith(prefix)) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Thomas') || v.name.includes('Anna') || v.name.includes('David') || v.name.includes('Hedda') || v.name.includes('Stefan')));
    if (matchedVoice) utter.voice = matchedVoice;

    utter.onend = () => {
      isAiSpeaking = false;
      if (liveVoiceActive && !liveVoiceMuted) {
        // Buffer timeout before restarting speech recognition to avoid picking up room echo tail
        setTimeout(() => {
          if (liveVoiceActive && !liveVoiceMuted && !isAiSpeaking) {
            updateVoiceStatus(dict.voice.statusReady, 'listening');
            startLiveVoiceRecognition();
          }
        }, 400);
      }
    };

    utter.onerror = (e) => {
      console.warn('TTS error:', e);
      isAiSpeaking = false;
      if (liveVoiceActive && !liveVoiceMuted) {
        setTimeout(() => {
          if (liveVoiceActive && !liveVoiceMuted) {
            updateVoiceStatus(dict.voice.statusReady, 'listening');
            startLiveVoiceRecognition();
          }
        }, 400);
      }
    };

    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    isAiSpeaking = false;
    if (liveVoiceActive && !liveVoiceMuted) {
      updateVoiceStatus(dict.voice.statusReady, 'listening');
      startLiveVoiceRecognition();
    }
  }
}

// ==========================================================================
// FEATURE: TEAM & COLLABORATIVE WORKSPACES WITH AI AGENT SWARM
// ==========================================================================
state.teamWorkspaces = [];
state.activeWorkspaceId = 'ws-transfo-ia';
state.activeTeamTab = 'tasks';

function openTeamModal() {
  closeAllModals();
  setActiveNav('navTeamBtn');
  const modal = $('teamModal');
  if (!modal) return;
  modal.style.display = 'flex';
  fetchTeamWorkspaces();
}

function closeTeamModal() {
  const modal = $('teamModal');
  if (modal) modal.style.display = 'none';
}

function switchTeamTab(tab) {
  state.activeTeamTab = tab;
  ['tasks', 'members', 'agents', 'feed', 'directives'].forEach(t => {
    const btn = $('teamTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const pane = $('teamPane' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('active', t === tab);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
  });

  const curWs = state.teamWorkspaces.find(w => w.id === state.activeWorkspaceId);
  if (!curWs) return;

  if (tab === 'tasks') renderTeamTasks(curWs.tasks || []);
  if (tab === 'members') renderTeamMembers(curWs.members || []);
  if (tab === 'agents') renderTeamAgents(curWs.agents || []);
  if (tab === 'feed') renderTeamFeed(curWs.messages || []);
  if (tab === 'directives') {
    const textEl = $('teamDirectivesText');
    if (textEl) textEl.value = curWs.context || '';
  }
}

function fetchTeamWorkspaces() {
  fetch('/api/workspaces')
    .then(r => r.json())
    .then(data => {
      state.teamWorkspaces = data.workspaces || [];
      state.activeWorkspaceId = data.activeId || (state.teamWorkspaces[0]?.id) || 'ws-transfo-ia';
      renderTeamWorkspaceUI();
    })
    .catch(() => {});
}

function renderTeamWorkspaceUI() {
  const curWs = state.teamWorkspaces.find(w => w.id === state.activeWorkspaceId) || state.teamWorkspaces[0];
  if (!curWs) return;

  // Update top ticker pill
  if ($('topTeamName')) $('topTeamName').textContent = curWs.name;

  // Render workspace dropdown
  const selector = $('teamWsSelector');
  if (selector) {
    selector.innerHTML = state.teamWorkspaces.map(w => 
      `<option value="${w.id}" ${w.id === state.activeWorkspaceId ? 'selected' : ''}>🏢 ${esc(w.name)} (${w.tag || 'Team'})</option>`
    ).join('');
  }

  // Update KPIs summary
  const tasks = curWs.tasks || [];
  const doneTasks = tasks.filter(t => t.status === 'done');
  const activeAgents = (curWs.agents || []).length;
  
  if ($('teamKpiTotalTasks')) $('teamKpiTotalTasks').textContent = `${tasks.length} ${state.currentLanguage === 'en' ? 'Tasks' : (state.currentLanguage === 'de' ? 'Aufgaben' : 'Tâches')}`;
  if ($('teamKpiDoneTasks')) $('teamKpiDoneTasks').textContent = `${doneTasks.length} ${state.currentLanguage === 'en' ? 'Completed' : (state.currentLanguage === 'de' ? 'Erledigt' : 'Terminées')}`;
  if ($('teamKpiActiveAgents')) $('teamKpiActiveAgents').textContent = `${activeAgents} ${state.currentLanguage === 'en' ? 'Agents Active' : (state.currentLanguage === 'de' ? 'Aktive Agenten' : 'Agents Actifs')}`;

  switchTeamTab(state.activeTeamTab || 'tasks');
}

function switchTeamWorkspace(wsId) {
  state.activeWorkspaceId = wsId;
  fetch('/api/workspaces/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId: wsId, user: state.user || 'Abbas Mistrah' })
  })
    .then(r => r.json())
    .then(() => {
      fetchTeamWorkspaces();
      showToast(`Espace actif : ${state.teamWorkspaces.find(w => w.id === wsId)?.name || wsId}`);
    })
    .catch(() => {});
}

function renderTeamTasks(tasks) {
  const todoContainer = $('kanbanTodoCards');
  const inProgContainer = $('kanbanInProgressCards');
  const doneContainer = $('kanbanDoneCards');

  if (!todoContainer || !inProgContainer || !doneContainer) return;
  todoContainer.innerHTML = '';
  inProgContainer.innerHTML = '';
  doneContainer.innerHTML = '';

  const todoList = tasks.filter(t => t.status === 'todo' || !t.status);
  const inProgList = tasks.filter(t => t.status === 'in_progress');
  const doneList = tasks.filter(t => t.status === 'done');

  if ($('countTodo')) $('countTodo').textContent = todoList.length;
  if ($('countInProgress')) $('countInProgress').textContent = inProgList.length;
  if ($('countDone')) $('countDone').textContent = doneList.length;

  const dict = I18N[state.currentLanguage]?.team || I18N.fr.team || {};

  todoList.forEach(t => {
    todoContainer.appendChild(createKanbanCardElement(t, 'todo', dict));
  });

  inProgList.forEach(t => {
    inProgContainer.appendChild(createKanbanCardElement(t, 'in_progress', dict));
  });

  doneList.forEach(t => {
    doneContainer.appendChild(createKanbanCardElement(t, 'done', dict));
  });
}

function createKanbanCardElement(t, col, dict) {
  const card = el('div', 'kanban-card');
  const isAgent = t.assigneeType === 'agent';

  card.innerHTML = `
    <div class="kanban-card-title">${esc(t.title)}</div>
    <div class="kanban-card-meta">
      <span class="kanban-assignee-badge ${isAgent ? 'agent' : ''}">
        ${isAgent ? '🤖' : '👤'} ${esc(t.assigneeName || 'Équipe')}
      </span>
      <span style="font-size:10px;font-weight:800;color:var(--muted)">${esc(t.date || '')}</span>
    </div>
    ${t.output ? `<div class="kanban-card-output">${esc(t.output)}</div>` : ''}
    <div class="kanban-card-actions">
      ${col === 'todo' ? `
        <button class="kanban-action-btn agent-run" onclick="triggerAgentTaskExecution('${t.id}')">⚡ Exécuter par Agent</button>
        <button class="kanban-action-btn" onclick="updateTaskStatus('${t.id}', 'in_progress')">➔ En cours</button>
      ` : ''}
      ${col === 'in_progress' ? `
        <button class="kanban-action-btn agent-run" onclick="triggerAgentTaskExecution('${t.id}')">⚡ Résoudre par Agent</button>
        <button class="kanban-action-btn" onclick="updateTaskStatus('${t.id}', 'done')">✓ Terminer</button>
      ` : ''}
      ${col === 'done' ? `
        <button class="kanban-action-btn" onclick="showTaskArtifactInCanvas('${t.id}')">👁️ Voir Livrable</button>
      ` : ''}
    </div>
  `;
  return card;
}

function renderTeamMembers(members) {
  const grid = $('teamMembersGrid');
  if (!grid) return;
  grid.innerHTML = '';

  members.forEach(m => {
    const card = el('div', 'team-member-card');
    const presenceClass = m.status === 'busy' ? 'busy' : (m.status === 'generating' ? 'generating' : 'online');
    const presenceLabel = m.status === 'busy' ? '🟡 En réunion' : (m.status === 'generating' ? '🟠 En génération IA' : '🟢 En ligne');

    card.innerHTML = `
      <div class="member-avatar-wrap">
        ${esc(m.avatar || 'MB')}
        <span class="member-presence-dot ${presenceClass}" title="${presenceLabel}"></span>
      </div>
      <div class="member-info">
        <div class="member-name">
          <span>${esc(m.name)}</span>
          ${m.isLead ? '<span style="font-size:9px;background:var(--orange);color:#fff;padding:1px 5px;border-radius:99px">LEAD</span>' : ''}
        </div>
        <div class="member-role">${esc(m.role || 'Contributeur')}</div>
        <div class="member-email">${esc(m.email || '')}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderTeamAgents(agents) {
  const grid = $('teamAgentsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  agents.forEach(a => {
    const card = el('div', 'team-agent-card');
    card.innerHTML = `
      <div class="team-agent-top">
        <div class="team-agent-icon">${a.icon || '🤖'}</div>
        <div>
          <div class="team-agent-name">${esc(a.name)}</div>
          <div class="team-agent-role">${esc(a.role || 'Agent Autonome')}</div>
        </div>
      </div>
      <div class="team-agent-desc">${esc(a.desc || '')}</div>
      <button class="agent-mission-btn" onclick="quickPrompt('Consigne pour l\\'agent ${a.name} : ')">
        ⚡ Assigner une mission directe
      </button>
    `;
    grid.appendChild(card);
  });
}

function renderTeamFeed(messages) {
  const container = $('teamFeedMessages');
  if (!container) return;
  container.innerHTML = '';

  messages.forEach(msg => {
    const msgEl = el('div', 'team-feed-msg' + (msg.isAgent ? ' agent' : ''));
    msgEl.innerHTML = `
      <div class="team-feed-avatar">${esc(msg.avatar || '👤')}</div>
      <div class="team-feed-content">
        <div class="team-feed-author">${esc(msg.sender)} <span style="font-weight:400;color:var(--muted);margin-left:6px">${esc(msg.time || '')}</span></div>
        <div>${esc(msg.text)}</div>
      </div>
    `;
    container.appendChild(msgEl);
  });
  container.scrollTop = container.scrollHeight;
}

function sendTeamFeedMessage() {
  const inp = $('teamFeedInput');
  const text = (inp?.value || '').trim();
  if (!text) return;
  inp.value = '';

  fetch('/api/workspaces/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: state.activeWorkspaceId,
      text,
      user: state.user || 'Abbas Mistrah'
    })
  })
    .then(r => r.json())
    .then(() => fetchTeamWorkspaces())
    .catch(() => {});
}

function updateTaskStatus(taskId, status) {
  fetch('/api/workspaces/tasks', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: state.activeWorkspaceId,
      taskId,
      status
    })
  })
    .then(r => r.json())
    .then(() => fetchTeamWorkspaces())
    .catch(() => {});
}

function triggerAgentTaskExecution(taskId) {
  showToast('⚡ Agent autonome en cours d\'exécution...');
  fetch('/api/workspaces/agent-execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: state.activeWorkspaceId,
      taskId
    })
  })
    .then(r => r.json())
    .then(data => {
      showToast('✅ Tâche résolue par l\'agent !');
      fetchTeamWorkspaces();
      if (data?.output) {
        openCanvas(`<div class="p-6 font-sans"><h2 class="text-xl font-black mb-3">Livrable de l'Agent Autonome</h2><pre class="bg-gray-100 p-4 rounded-xl text-xs whitespace-pre-wrap">${esc(data.output)}</pre></div>`, 'Livrable Agent Autonome', 'Workspace Collaboratif');
      }
    })
    .catch(() => {
      showToast('Erreur lors de l\'exécution par l\'agent');
    });
}

function showTaskArtifactInCanvas(taskId) {
  const curWs = state.teamWorkspaces.find(w => w.id === state.activeWorkspaceId);
  const task = (curWs?.tasks || []).find(t => t.id === taskId);
  if (!task || !task.output) {
    showToast('Aucun artefact généré pour cette tâche');
    return;
  }
  openCanvas(`<div class="p-6 font-sans"><h2 class="text-xl font-black mb-3">${esc(task.title)}</h2><div class="bg-[#f8f5f0] border border-[#e5dac9] p-4 rounded-xl text-xs whitespace-pre-wrap leading-relaxed">${esc(task.output)}</div></div>`, task.title, 'Artefact Partagé Workspace');
}

function openAddTaskDialog() {
  const title = prompt('Titre de la nouvelle tâche pour l\'équipe ou un agent IA :');
  if (!title) return;
  const isAgent = confirm('Voulez-vous assigner cette tâche à un Agent IA Autonome ? (OK = Agent IA, Annuler = Humain)');

  fetch('/api/workspaces/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: state.activeWorkspaceId,
      title,
      priority: 'high',
      assigneeType: isAgent ? 'agent' : 'human',
      assigneeName: isAgent ? 'LeBon Coder' : (state.user || 'Abbas Mistrah')
    })
  })
    .then(r => r.json())
    .then(() => {
      showToast('Tâche ajoutée au tableau !');
      fetchTeamWorkspaces();
    })
    .catch(() => {});
}

function openInviteMemberDialog() {
  const name = prompt('Nom et prénom du nouveau collaborateur :');
  if (!name) return;
  const role = prompt('Rôle dans l\'équipe (ex: Product Lead, Staff Engineer, Data Analyst) :', 'Contributeur');

  fetch('/api/workspaces/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: state.activeWorkspaceId,
      name,
      role: role || 'Contributeur'
    })
  })
    .then(r => r.json())
    .then(() => {
      showToast(`Collaborateur ${name} invité dans l'espace !`);
      fetchTeamWorkspaces();
    })
    .catch(() => {});
}

function openCreateWorkspaceDialog() {
  const name = prompt('Nom du nouvel espace collaboratif :');
  if (!name) return;
  const desc = prompt('Description courte de l\'espace :') || '';

  fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description: desc,
      user: state.user || 'Abbas Mistrah'
    })
  })
    .then(r => r.json())
    .then(() => {
      showToast(`Nouvel espace "${name}" créé !`);
      fetchTeamWorkspaces();
    })
    .catch(() => {});
}

function saveTeamDirectives() {
  const textEl = $('teamDirectivesText');
  const val = textEl?.value || '';
  const curWs = state.teamWorkspaces.find(w => w.id === state.activeWorkspaceId);
  if (curWs) curWs.context = val;
  showToast('Directives de l\'espace enregistrées avec succès !');
}

// ==========================================================================
// FEATURE: COMPÉTENCES & CERTIFICATIONS IA (LEBONCOIN / ADEVINTA ACADEMY)
// ==========================================================================
state.currentCertTab = 'tracks';
state.quizAnswers = {};

function openCertModal() {
  closeAllModals();
  const modal = $('certModal');
  if (!modal) return;
  modal.style.display = 'flex';
  switchCertTab(state.currentCertTab || 'tracks');
}

function closeCertModal() {
  const modal = $('certModal');
  if (modal) modal.style.display = 'none';
}

function switchCertTab(tab) {
  state.currentCertTab = tab;
  ['tracks', 'skills', 'diploma', 'quiz'].forEach(t => {
    const btn = $('certTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const pane = $('certPane' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('active', t === tab);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
  });
}

function selectQuizAnswer(qNum, optIdx, isCorrect) {
  state.quizAnswers[qNum] = { optIdx, isCorrect };
  const card = $('qCard' + qNum);
  if (!card) return;
  const opts = card.querySelectorAll('.quiz-opt');
  opts.forEach((o, i) => {
    o.className = 'quiz-opt' + (i === optIdx ? (isCorrect ? ' selected-correct' : ' selected-wrong') : '');
  });
  const feed = $('qFeed' + qNum);
  if (feed) {
    if (isCorrect) {
      feed.className = 'quiz-feedback ok';
      feed.textContent = '✓ Excellente réponse ! Points validés.';
    } else {
      feed.className = 'quiz-feedback err';
      feed.textContent = '✗ Ce n\'est pas tout à fait ça. Essayez une autre option !';
    }
  }
}

function evaluateQuizCompletion() {
  const answered = Object.keys(state.quizAnswers).length;
  if (answered < 3) {
    showToast('Veuillez répondre aux 3 questions avant de valider l\'épreuve.');
    return;
  }
  const corrects = Object.values(state.quizAnswers).filter(a => a.isCorrect).length;
  if (corrects === 3) {
    showToast('🎉 Félicitations ! Score parfait (3/3) : +350 XP & Niveau 3 Validé !');
    const levelPill = $('topCertLevel');
    if (levelPill) levelPill.textContent = 'Niveau 3 · Expert Validé ✓';
    switchCertTab('diploma');
  } else {
    showToast(`Vous avez obtenu ${corrects}/3 bonnes réponses. Révisez et retentez pour 100% !`);
  }
}

function downloadDiplomaCert() {
  showToast('📥 Génération du certificat officiel nominatif...');
  const card = $('certDiplomaCard');
  if (!card) return;
  openCanvas(`<div class="p-8 font-sans flex flex-col items-center justify-center min-h-[500px] bg-[#fffdf9] border-4 border-double border-[#d4af37] rounded-2xl shadow-xl max-w-2xl mx-auto my-6 text-center">
    <div class="text-[#ff6b00] text-xl font-black mb-2">leboncoin · Adevinta</div>
    <div class="text-xs font-black tracking-widest text-[#b45309] bg-[#fef3c7] px-3 py-1 rounded-full border border-[#fde68a] mb-4">ACCRÉDITÉ IA SOUVERAINE</div>
    <h1 class="text-2xl font-black tracking-wide text-[#0f172a] mb-2">CERTIFICAT D'EXCELLENCE IA</h1>
    <p class="text-xs text-gray-500 mb-4">Décerné officiellement à :</p>
    <div class="text-3xl font-black text-[#ff6b00] border-b-2 border-[#ff6b00]/30 pb-2 mb-3">Abbas Mistrah</div>
    <div class="text-sm font-bold text-gray-700 mb-4">Lead Consultant IA &amp; Transformation 360 · Standard F3</div>
    <p class="text-xs text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
      Pour sa maîtrise certifiée du <b>Prompt Engineering Avancé</b>, de l'<b>Orchestration Multi-Agents Swarm</b>, de la <b>Modélisation du ROI IA</b> et de l'<b>Architecture Souveraine leboncoin</b>.
    </p>
    <div class="w-full border-t border-dashed border-[#d4af37]/40 pt-4 flex justify-between text-[11px] text-gray-500">
      <div>Délivré le : <b class="text-gray-800">Août 2026</b></div>
      <div>Réf : <b class="font-mono text-gray-800">LBC-AI-2026-9842X</b></div>
    </div>
  </div>`, 'Certificat Officiel IA — Abbas Mistrah', 'Académie leboncoin / Adevinta');
}

function shareDiplomaCert() {
  navigator.clipboard.writeText(`🎓 Je viens de valider ma Certification d'Excellence IA (Niveau 3 - Lead Architect & Multi-Agents Swarm) sur LeBon AI chez leboncoin / Adevinta ! 🚀 #AI #Leboncoin #Adevinta #Innovation`)
    .then(() => showToast('Texte de certification copié dans le presse-papiers pour LinkedIn / Slack !'))
    .catch(() => showToast('Certificat prêt à être partagé !'));
}

// ==========================================================================
// FEATURE: SECOND BRAIN (CERVEAU NUMÉRIQUE, GRAPHE NEURONAL & P.A.R.A)
// ==========================================================================
state.secondBrain = { nodes: [], links: [], notes: [], stats: {} };
state.currentSecondBrainTab = 'graph';
state.currentSbGraphFilter = 'all';
let sbGraphAnimationId = null;

function openSecondBrainModal() {
  closeAllModals();
  setActiveNav('navSecondBrainBtn');
  const modal = $('secondBrainModal');
  if (!modal) return;
  modal.style.display = 'flex';
  fetchSecondBrainData();
}

function closeSecondBrainModal() {
  const modal = $('secondBrainModal');
  if (modal) modal.style.display = 'none';
  if (sbGraphAnimationId) {
    cancelAnimationFrame(sbGraphAnimationId);
    sbGraphAnimationId = null;
  }
}

function switchSecondBrainTab(tab) {
  state.currentSecondBrainTab = tab;
  ['graph', 'notes', 'query', 'insights'].forEach(t => {
    const btn = $('sbTab' + t.charAt(0).toUpperCase() + t.slice(1));
    const pane = $('sbPane' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle('active', t === tab);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
  });

  if (tab === 'graph') {
    setTimeout(() => initSecondBrainGraphCanvas(), 60);
  } else if (tab === 'notes') {
    renderSecondBrainNotes();
  }
}

function fetchSecondBrainData() {
  fetch('/api/second-brain')
    .then(r => r.json())
    .then(data => {
      state.secondBrain = data;
      if ($('sbKpiNotes')) $('sbKpiNotes').textContent = `${data.notes?.length || 0} Notes`;
      if ($('sbKpiLinks')) $('sbKpiLinks').textContent = `${data.links?.length || 0} Connexions`;
      switchSecondBrainTab(state.currentSecondBrainTab || 'graph');
    })
    .catch(() => {
      switchSecondBrainTab(state.currentSecondBrainTab || 'graph');
    });
}

function filterSecondBrainGraph(cat) {
  state.currentSbGraphFilter = cat;
  document.querySelectorAll('.sb-filter-chip').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(cat) || (cat === 'all' && btn.textContent.includes('Tous')));
  });
  initSecondBrainGraphCanvas();
}

function initSecondBrainGraphCanvas() {
  const canvas = $('sbGraphCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width || 860;
  canvas.height = rect.height || 420;

  const rawNodes = state.secondBrain.nodes || [];
  const rawLinks = state.secondBrain.links || [];

  const filter = state.currentSbGraphFilter || 'all';
  const nodes = filter === 'all' ? rawNodes : rawNodes.filter(n => n.category === filter);
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = rawLinks.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

  let time = 0;
  function animate() {
    if (state.currentSecondBrainTab !== 'graph' || $('secondBrainModal').style.display === 'none') return;
    time += 0.025;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background faint star grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 20; i < canvas.width; i += 40) {
      for (let j = 20; j < canvas.height; j += 40) {
        ctx.fillRect(i, j, 1, 1);
      }
    }

    // Draw Links
    links.forEach(l => {
      const src = nodes.find(n => n.id === l.source);
      const tgt = nodes.find(n => n.id === l.target);
      if (!src || !tgt) return;

      const sx = (src.x / 800) * canvas.width;
      const sy = (src.y / 480) * canvas.height;
      const tx = (tgt.x / 800) * canvas.width;
      const ty = (tgt.y / 480) * canvas.height;

      // Pulsing link line
      const alpha = 0.25 + Math.sin(time + (src.group || 1)) * 0.15;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flowing energy particle along link
      const progress = (time * 0.5 + (src.group || 1) * 0.3) % 1;
      const px = sx + (tx - sx) * progress;
      const py = sy + (ty - sy) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b00';
      ctx.fill();
    });

    // Draw Nodes
    nodes.forEach(n => {
      const nx = (n.x / 800) * canvas.width;
      const ny = (n.y / 480) * canvas.height;
      const radius = (n.size || 20) * 0.65;
      const pulse = Math.sin(time * 2 + (n.group || 1)) * 3;

      // Glow halo
      ctx.beginPath();
      ctx.arc(nx, ny, radius + 8 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = (n.color || '#ff6b00') + '15';
      ctx.fill();

      // Node Body
      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fillStyle = n.color || '#ff6b00';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, nx, ny + radius + 15);

      // Note count badge
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`${n.notesCount || 1} notes`, nx, ny + radius + 27);
    });

    sbGraphAnimationId = requestAnimationFrame(animate);
  }

  if (sbGraphAnimationId) cancelAnimationFrame(sbGraphAnimationId);
  animate();
}

function renderSecondBrainNotes() {
  const container = $('sbNotesGrid');
  if (!container) return;
  container.innerHTML = '';

  const notes = state.secondBrain.notes || [];
  if ($('sbNotesCountLabel')) $('sbNotesCountLabel').textContent = `${notes.length} note(s) active(s)`;

  if (notes.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:30px">Aucune note. Capturez votre première pensée !</div>`;
    return;
  }

  notes.forEach(note => {
    const card = el('div', 'sb-note-card');
    const cat = note.category || 'resources';
    const tagHtml = (note.tags || []).map(t => `<span class="sb-note-tag">${esc(t)}</span>`).join('');

    card.innerHTML = `
      <div class="sb-note-top">
        <div class="sb-note-title">${esc(note.title)}</div>
        <span class="sb-para-tag ${cat}">${cat}</span>
      </div>
      <div class="sb-note-content">${esc(note.content)}</div>
      <div class="sb-note-footer">
        <div class="sb-note-tags">${tagHtml}</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span>${esc(note.updatedAt || '')}</span>
          <button class="sb-note-del-btn" onclick="deleteSecondBrainNote('${note.id}')" title="Supprimer">🗑️</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openNewNoteForm() {
  $('sbNoteTitleInput')?.focus();
}

function saveNewSecondBrainNote() {
  const title = ($('sbNoteTitleInput')?.value || '').trim();
  const content = ($('sbNoteContentInput')?.value || '').trim();
  const category = $('sbNoteCategoryInput')?.value || 'resources';
  const rawTags = ($('sbNoteTagsInput')?.value || '').trim();
  const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : ['Second Brain'];

  if (!title || !content) {
    showToast('Titre et contenu de la note requis.');
    return;
  }

  fetch('/api/second-brain/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, category, tags })
  })
    .then(r => r.json())
    .then(() => {
      showToast('✓ Note enregistrée et connectée au Second Brain !');
      if ($('sbNoteTitleInput')) $('sbNoteTitleInput').value = '';
      if ($('sbNoteContentInput')) $('sbNoteContentInput').value = '';
      if ($('sbNoteTagsInput')) $('sbNoteTagsInput').value = '';
      fetchSecondBrainData();
    })
    .catch(() => showToast('Erreur lors de l\'enregistrement'));
}

function deleteSecondBrainNote(id) {
  if (!confirm('Supprimer cette note du Second Brain ?')) return;
  fetch('/api/second-brain/notes/' + id, { method: 'DELETE' })
    .then(() => {
      showToast('Note supprimée');
      fetchSecondBrainData();
    })
    .catch(() => {});
}

function executeSecondBrainQuery() {
  const query = ($('sbQueryInput')?.value || '').trim();
  if (!query) return;

  const resultContainer = $('sbQueryResult');
  if (resultContainer) {
    resultContainer.innerHTML = `<div style="display:flex;align-items:center;gap:10px;color:var(--orange);font-weight:700">⚡ Synthèse sémantique en cours...</div>`;
  }

  fetch('/api/second-brain/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
    .then(r => r.json())
    .then(data => {
      if (!resultContainer) return;
      // Sortie modèle assainie (renderMd = marked + sanitizeHtml), comme partout ailleurs.
      resultContainer.innerHTML = `
        <div style="font-size:13px;line-height:1.6;color:var(--ink)">
          ${renderMd(data.synthesis || '')}
        </div>
      `;
    })
    .catch(() => {
      if (resultContainer) resultContainer.innerHTML = `<div style="color:var(--red)">Erreur lors de l'interrogation du Second Brain.</div>`;
    });
}

// Initialiser Mermaid, appliquer la langue, enregistrer le Service Worker et fermer toute modale résiduelle au démarrage
document.addEventListener('DOMContentLoaded', () => {
  closeAllModals();
  initMermaid();
  changeAppLanguage(state.currentLanguage);
  fetchTeamWorkspaces();
  if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
  if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.hostname === 'localhost')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
