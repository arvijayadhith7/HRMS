const fs = require('fs');
const path = require('path');
const dir = 'd:/ANTIGRAVITY/VirtualNest/frontend-legacy/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
for(const file of files) {
  if (['Employees.jsx', 'Dashboard.jsx', 'AdminDashboardView.jsx', 'EmployeeDashboardView.jsx'].includes(file)) continue;
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  content = content.replace(/import Sidebar from ['"].*?Sidebar['"];?\r?\n?/g, '');
  content = content.replace(/import Topbar from ['"].*?Topbar['"];?\r?\n?/g, '');
  
  content = content.replace(/<div className="min-h-screen[^"]*">\s*<Sidebar \/>\s*<main className="[^"]*">\s*<Topbar \/>\s*<div className="p-container-[^"]*">/g, '<div className="max-w-[1400px] mx-auto space-y-8">');
  content = content.replace(/<div className="min-h-screen[^"]*">\s*<Sidebar \/>\s*<main className="[^"]*">\s*<Topbar \/>/g, '<div className="max-w-[1400px] mx-auto space-y-8">');
  
  content = content.replace(/<\/div>\s*<\/main>\s*<\/div>\s*\);\s*}\s*$/g, '</div>\n  );\n}');
  content = content.replace(/<\/main>\s*<\/div>\s*\);\s*}\s*$/g, '</div>\n  );\n}');
  
  fs.writeFileSync(path.join(dir, file), content);
}
console.log('Done refactoring');
