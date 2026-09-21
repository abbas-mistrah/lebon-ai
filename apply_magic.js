const fs = require('fs');

// --- 1. Fix STYLE.CSS ---
let css = fs.readFileSync('style.css', 'utf8');

// Replace standard background with Boussole magic "battement" background
css = css.replace(/\.messages-container \{[\s\S]*?overflow-y: auto;/m, 
`.messages-container {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at 50% 40%, rgba(255,107,0,.08) 0, rgba(255,107,0,.015) 38%, transparent 70%), linear-gradient(180deg,#ffffff 0,var(--bg-2) 100%);
  border-radius: var(--r-xl);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-1);
  margin: 10px 10px 10px 0;
  padding: 30px 40px 180px;
  overflow-y: auto;`);

// Add the inner circle glow to the background container just like Boussole
css += `
.messages-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 12% 14%, rgba(255,138,61,.06) 0, transparent 40%);
  pointer-events: none;
}
`;

// Sidebar navigation buttons exact match with Boussole
css = css.replace(/\.nav button \{[\s\S]*?\.nav button\.active i \{[\s\S]*?\}/, 
`.nav button {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 11px;
  border-radius: 13px;
  color: var(--ink-2);
  font-weight: 600;
  font-size: 13.5px;
  letter-spacing: -.01em;
  transition: .12s background, .12s color;
  width: 100%;
  text-align: left;
  border: 1px solid transparent;
}
.nav button i {
  font-style: normal;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  border: 1px solid var(--line);
}
.nav button:hover {
  background: var(--surface-2);
  color: var(--ink);
}
.nav button:hover i {
  color: var(--orange-2);
  border-color: var(--orange-ring);
}
.nav button.active {
  background: linear-gradient(180deg, rgba(255,107,0,.13) 0, rgba(255,107,0,.04) 100%);
  color: var(--orange-deep);
  font-weight: 700;
  border: 1px solid var(--orange-ring);
  margin: -1px;
}
.nav button.active i {
  background: var(--orange);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(255,107,0,.4);
}`);

// F3 principle exact styling
css = css.replace(/\.sidebar-f3 \{[\s\S]*?\.sidebar-f3 p \{[\s\S]*?\}/, 
`.sidebar-f3 {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: linear-gradient(180deg, #ffffff 0, #fffbf4 100%);
  box-shadow: var(--shadow-1);
}
.sidebar-f3 .f3-tag {
  display: inline-block;
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--orange-deep);
  background: var(--orange-soft);
  border: 1px solid var(--orange-ring);
  padding: 3px 7px;
  border-radius: 5px;
}
.sidebar-f3 b {
  display: block;
  font-size: 13px;
  margin-top: 9px;
  color: var(--ink);
  line-height: 1.35;
  font-weight: 700;
}
.sidebar-f3 p {
  margin: 6px 0 0;
  font-size: 11.5px;
  color: var(--muted);
  line-height: 1.45;
}`);

// Update user card styling
css = css.replace(/\.sidebar-user \{[\s\S]*?\.sidebar-user span \{[\s\S]*?\}/, 
`.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
}
.sidebar-user .avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ff8a3d, #cc4f00);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: -.5px;
  box-shadow: 0 4px 10px rgba(255,107,0,.28);
}
.sidebar-user b {
  font-size: 12.5px;
  color: var(--ink);
  font-weight: 700;
}
.sidebar-user span {
  display: block;
  color: var(--muted);
  font-size: 10.5px;
  margin-top: 2px;
}`);

// Update suggestion cards hover glow
css += `
.sugg-card:hover {
  border-color: var(--orange-ring);
  background: linear-gradient(180deg, #ffffff 0, rgba(255,107,0,.03) 100%);
  box-shadow: 0 8px 24px rgba(255,107,0,.15);
  transform: translateY(-2px);
}
.composer-box:focus-within {
  border-color: var(--orange);
  box-shadow: 0 8px 30px rgba(255,107,0,.2);
}
`;

fs.writeFileSync('style.css', css, 'utf8');

// --- 2. Fix INDEX.HTML (6 cards, HTML structure) ---
let html = fs.readFileSync('index.html', 'utf8');

// The F3 block
html = html.replace(/<div class="sidebar-f3">[\s\S]*?<\/div>/, 
`<div class="sidebar-f3">
  <span class="f3-tag">F3</span>
  <b>Lire 5s · Comprendre 30s · Agir 2 clics</b>
  <p>L'assistant droit au but. Zéro blabla, solutions concrètes.</p>
</div>`);

// Avatar user
html = html.replace(/<div class="avatar">AM<\/div>/, `<div class="avatar" style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#ff8a3d,#cc4f00);color:#fff;display:grid;place-items:center;font-weight:800;font-size:13px;letter-spacing:-.5px;box-shadow:0 4px 10px rgba(255,107,0,.28)">AM</div>`);

// Update the grid to have 6 cards instead of 4
html = html.replace(/<div class="suggestions-grid" id="suggGrid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="composer-wrap">/, 
`<div class="suggestions-grid" id="suggGrid">
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>💡 Structurer un Use Case IA</h3>
            <p>Transformer un besoin métier en fiche action (problème, solution, ROI, KPI)</p>
          </div>
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>📊 Préparer une note COMEX</h3>
            <p>Synthétiser l'avancement de la transfo en 5 points stratégiques</p>
          </div>
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>💰 Modéliser un ROI Transfo</h3>
            <p>Calculer les gains nets mensuels, heures économisées et payback</p>
          </div>
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>⚡ Revue de code & Refactoring</h3>
            <p>Détecter les bugs, optimiser la performance et la sécurité</p>
          </div>
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>✍️ Communication style F3</h3>
            <p>Rédiger un message percutant (5s lecture, 30s compréhension)</p>
          </div>
          <div class="sugg-card" onclick="document.getElementById('composerInput').value=this.querySelector('p').innerText; document.getElementById('composerInput').focus();">
            <h3>🤖 Planification Agentique</h3>
            <p>Décomposer un défi complexe en plan d'action pour agents autonomes</p>
          </div>
        </div>
      </div>
    </div>
    <div class="composer-wrap">`);

// Replace standard cache buster to ensure refresh
html = html.replace(/v=9999/g, 'v=magic-1');

fs.writeFileSync('index.html', html, 'utf8');

// --- 3. Fix APP.JS (Input lock to prevent queue jams) ---
let js = fs.readFileSync('app.js', 'utf8');

// Lock input during generation
js = js.replace(/function executeSend\(conv\) \{/, 
`function executeSend(conv) {
    const ta = $('composerInput');
    const sendBtn = $('sendBtn');
    ta.disabled = true;
    sendBtn.innerHTML = '<span style="font-size:16px;">⏳</span>';
    sendBtn.style.opacity = '0.5';
    sendBtn.style.pointerEvents = 'none';`);

js = js.replace(/function finish\(\) \{/, 
`function finish() {
    const ta = $('composerInput');
    const sendBtn = $('sendBtn');
    ta.disabled = false;
    sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
    sendBtn.style.opacity = '1';
    sendBtn.style.pointerEvents = 'auto';
    setTimeout(() => ta.focus(), 10);`);

fs.writeFileSync('app.js', js, 'utf8');
console.log('Magic injected successfully.');
