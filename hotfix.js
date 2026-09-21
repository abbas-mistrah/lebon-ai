const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Fix 1: Make scrollbars elegant globally (especially for history-list)
if (!css.includes('::-webkit-scrollbar')) {
  css += '\n::-webkit-scrollbar { width: 6px; height: 6px; }\n::-webkit-scrollbar-track { background: transparent; }\n::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }\n::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }\n';
}

// Fix 2: Refine the composer gradient to not block the grid so aggressively
css = css.replace(/background: linear-gradient\(180deg, transparent 0%, rgba\(246, 240, 230, 0\.96\) 24%, var\(--bg\) 100%\);/, 
  'background: linear-gradient(180deg, transparent 0%, rgba(246, 240, 230, 0.98) 40%, var(--bg) 100%);\n  pointer-events: none;');
// Also make the actual composer box pointer-events: auto so it's clickable
css = css.replace(/\.composer-box \{/, '.composer-box {\n  pointer-events: auto;');

// Fix 3: Increase padding bottom on messages-container to allow scrolling past the gradient
css = css.replace(/padding: 30px 40px;/, 'padding: 30px 40px 180px;');

// Fix 4: Nouvelle discussion button is too chunky
css = css.replace(/\.new-chat-btn \{[\s\S]*?\}/, `.new-chat-btn {
  background: var(--orange);
  color: #fff;
  border: none;
  border-radius: var(--r-md);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(255,107,0,0.25);
}`);

// Fix 5: Ensure ⌘K is placed nicely inside the input box
css = css.replace(/\.composer-kbd \{[\s\S]*?\}/, `.composer-kbd {
  position: absolute;
  right: 56px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  background: var(--line-1);
  color: var(--ink-light);
  padding: 3px 6px;
  border-radius: 4px;
  pointer-events: none;
}`);
// Ensure textarea has padding-right so text doesn't overlap ⌘K
css = css.replace(/\.composer-box textarea \{[\s\S]*?\}/, (match) => {
  return match.replace(/padding:[^;]+;/, 'padding: 14px 90px 14px 44px;');
});

fs.writeFileSync('style.css', css, 'utf8');

let html = fs.readFileSync('index.html', 'utf8');

// Fix Ticker Text
html = html.replace(/<span class=\"tick\"><b>LeBon AI<\/b> : Assistant IA local, privǸ & souverain<\/span>/g, '<span class=\"tick\"><strong style=\"color:var(--orange)\">LeBon AI</strong> : Assistant IA local, privé & souverain</span>');
// Sometimes characters are scrambled in the source because of bad encoding, let's use a regex that matches the string loosely
html = html.replace(/<span class=\"tick\"><b>LeBon AI<\/b>[^<]+<\/span>/g, '<span class=\"tick\"><strong style=\"color:var(--orange)\">LeBon AI</strong> : Assistant IA local, privé & souverain</span>');
html = html.replace(/Qwen 3 Pro[^<]+/g, 'LeBon AI Pro ★ (4B)');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Hotfixes applied.');
