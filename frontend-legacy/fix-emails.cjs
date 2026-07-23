const fs = require('fs');
const path = require('path');
const dir = 'd:/ANTIGRAVITY/VirtualNest/frontend-legacy/src/pages';
const files = fs.readdirSync(dir);
files.forEach(f => {
  const p = path.join(dir, f);
  if (p.endsWith('.jsx')) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/e\.email === user\.email/g, "e.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim()");
    fs.writeFileSync(p, content);
  }
});
console.log('Done replacing email matching');
