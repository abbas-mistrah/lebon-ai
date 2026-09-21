const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf8');

// 1. Update renderMd
code = code.replace(/function renderMd\(text\) \{[\s\S]*?return marked\.parse\(text\);\s*\}/, 
`function renderMd(text) {
  if (typeof marked === 'undefined') return esc(text).replace(/\\n/g, '<br>');
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(c, lang) {
      if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
        return hljs.highlight(c, { language: lang }).value;
      }
      return esc(c);
    }
  });
  return marked.parse(text);
}`);

// 2. Update addCodeCopyButtons
code = code.replace(/function addCodeCopyButtons\(container\) \{[\s\S]*?if \(c\) c\.scrollTop = c\.scrollHeight;\s*\}/, 
`function addCodeCopyButtons(container) {
  container.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-header')) return;
    const codeEl = pre.querySelector('code');
    const codeText = codeEl ? codeEl.textContent : pre.textContent;
    let lang = 'code';
    if (codeEl && codeEl.className) {
      const match = codeEl.className.match(/language-(\\w+)/);
      if (match) lang = match[1];
    }
    const header = el('div', 'code-header');
    header.innerHTML = '<span>' + lang + '</span>';
    const btn = el('button', 'copy-btn', 'Copier');
    btn.onclick = () => {
      navigator.clipboard.writeText(codeText).then(() => {
        if (typeof showToast === 'function') showToast('Code copié dans le presse-papiers');
        else { btn.textContent = 'Copié ✓'; setTimeout(() => { btn.textContent = 'Copier'; }, 2000); }
      });
    };
    header.appendChild(btn);
    pre.insertBefore(header, pre.firstChild);
  });
}

let isUserScrolling = false;
document.addEventListener('DOMContentLoaded', () => {
  const c = $('messagesContainer');
  const scrollBtn = $('smartScrollBtn');
  if (c && scrollBtn) {
    c.addEventListener('scroll', () => {
      const isAtBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 40;
      isUserScrolling = !isAtBottom;
      scrollBtn.style.display = isUserScrolling ? 'grid' : 'none';
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
}`);

fs.writeFileSync('app.js', code, 'utf8');
console.log('Patch complete.');
