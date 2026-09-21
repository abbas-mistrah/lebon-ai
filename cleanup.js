const fs = require('fs');

// INDEX.HTML cleanup
let html = fs.readFileSync('index.html', 'utf8');

// Supprimer le bouton Thinking (s'il existe encore)
html = html.replace(/<button class="think-btn"[^>]*>[\s\S]*?<\/button>/, '');

// Supprimer le bouton + Nouvelle discussion (topbar-icon-btn)
html = html.replace(/<button class="topbar-icon-btn"[^>]*>[\s\S]*?<\/button>/, '');

// Supprimer les cartes 5 et 6
html = html.replace(/<div class="sugg-card"[^>]*>\s*<h3>✍️ Communication style F3<\/h3>[\s\S]*?<\/div>/, '');
html = html.replace(/<div class="sugg-card"[^>]*>\s*<h3>🤖 Planification Agentique<\/h3>[\s\S]*?<\/div>/, '');

fs.writeFileSync('index.html', html, 'utf8');

// APP.JS cleanup
let js = fs.readFileSync('app.js', 'utf8');

// Supprimer le tag eyebrow et Mistrah, et la phrase de sous-titre
js = js.replace(/<div class="welcome-eyebrow">[^<]*<\/div>/, '');
js = js.replace(/Bonjour <span>\$\{esc\(state\.user\)\}<\/span>/, 'Bonjour <span style="color:var(--orange)">${esc(state.user).split(" ")[0]}</span>');
js = js.replace(/<p class="welcome-sub">[^<]*Propuls[^<]*Ollama.<\/p>/, '');

fs.writeFileSync('app.js', js, 'utf8');
console.log('Cleaned up elements.');
