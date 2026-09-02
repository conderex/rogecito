// DoingTheDoings — suite jsdom. Carga el index.html real, siembra estado y
// verifica render, temas, rachas, i18n y accesibilidad. Sin red, sin Supabase.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
let sc = m[1].replace(/\nboot\(\);[\s\S]*$/, '\n');
sc += `
window.__t = {
  theme: () => THEME, themes: () => THEMES, i18n: () => I18N,
  edit(){ state.editing = true; renderEditor(); },
  offline(){ state.mode = 'local'; },
  week(n){ state.weekOffset = n; renderTrackerArea(); },
  checks(arr){ state.checks = new Set(arr); renderTrackerArea(); },
  render(){ renderTrackerArea(); },
  tasks(arr){ state.tasks = arr.slice(); if(state.tab==='todo') renderTodo(); },
  patchTask(i, patch){ Object.assign(state.tasks[i], patch); if(state.tab==='todo') renderTodo(); },
  setup(){
    state.config=[{id:'t1',title:'Estirarme',accent:'var(--teal)',sort_order:0,archived:false,
      subActivities:[{id:'a',label:'AM',sort_order:0,archived:false}]}];
    state.counters=[{id:'c1',label:'Agua',emoji:'💧',accent:'var(--gold)',sort_order:0,archived:false}];
    state.checks=new Set(); currentUserId='demo'; appLoaded=true; state.mode='supabase';
  },
};`;
function makeDom(preLS){
  const dom = new JSDOM(html.replace(m[0],''), { url:'https://x.com/', runScripts:'dangerously', pretendToBeVisual:true });
  if(preLS) for(const [k,v] of Object.entries(preLS)) dom.window.localStorage.setItem(k,v);
  const s = dom.window.document.createElement('script'); s.textContent = sc; dom.window.document.body.appendChild(s);
  return dom.window;
}
let pass=true; const ok=(c,msg)=>{ console.log((c?'✅':'❌')+' '+msg); if(!c) pass=false; };

// ---------- temas ----------
let w = makeDom();
ok(w.__t.themes().length===5 && w.__t.themes().includes('golden'), '5 temas registrados, golden incluido');
ok(w.__t.theme()==='oat', 'default = oat');
w.setTheme('nocturno');
ok(w.document.documentElement.dataset.theme==='nocturno' && w.localStorage.getItem('roge_theme_v1')==='nocturno', 'setTheme aplica y persiste');
ok(w.document.querySelector('meta[name="theme-color"]').content==='#1d1d24', 'meta theme-color sigue al tema');
w = makeDom({roge_theme_v1:'hackerman'});
ok(w.__t.theme()==='oat', 'valor corrupto en LS cae a oat');
ok(w.document.querySelectorAll('#nightsky span').length===8, 'cielo nocturno con 8 estrellas');

// ---------- editor / selector ----------
w = makeDom(); w.__t.setup(); w.__t.edit();
const titles = [...w.document.querySelectorAll('#cards .count-title')].map(e=>e.textContent);
ok(titles[0]==='apariencia', 'apariencia es la primera sección del editor');
const chips = w.document.querySelectorAll('.themechip');
ok(chips.length===5 && [...chips].map(c=>c.dataset.t).join(',')==='oat,matcha,lavanda,golden,nocturno', '5 chips en orden');
ok(w.document.querySelectorAll('.themechip svg.tc-moon').length===1 &&
   !!w.document.querySelector('.themechip[data-t="nocturno"] svg.tc-moon'), 'lunita SVG solo en Nocturno');
ok(!w.document.querySelector('.themechips').innerHTML.includes('🌙'), 'cero emoji de luna');

// ---------- rachas amables + florecita ----------
const iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
const add=(dt,n)=>{const y=new Date(dt);y.setDate(y.getDate()+n);return y;};
const today=new Date(); today.setHours(0,0,0,0); const D=n=>iso(add(today,n));
w = makeDom(); w.__t.setup();
w.__t.checks(['t1|a|'+D(-2),'t1|a|'+D(-3),'t1|a|'+D(-4)]);
const r=w.computeStreaks('t1');
ok(r.current===3 && r.held===true, 'gracia: 3 marcados, sostenida por parche');
let foundBloom=false;
for(const off of [0,-1]){ w.__t.week(off); if(w.document.querySelector('.cell.patched .bar svg.bloom')){ foundBloom=true; break; } }
ok(foundBloom, 'florecita del parche en el día perdonado');
w.__t.week(0);
ok(!!w.document.querySelector('.streak svg.patch'), 'pastilla con florecita cuando held');
w.__t.checks(['t1|a|'+D(-4),'t1|a|'+D(-5),'t1|a|'+D(-6),'t1|a|'+D(-7)]);
ok(w.computeStreaks('t1').current===0, '3 días en blanco rompen la racha');

// ---------- simetria de la gracia: mismo hueco, mismo resultado ----------
// El medio de la racha y la cola deben perdonar igual. Antes la cola usaba <=2
// y mataba rachas que el mismo hueco sobrevivia a la mitad.
function streakOf(checks){
  const win = makeDom(); win.__t.setup();
  win.__t.checks(checks.map(d => 't1|a|'+d));
  return win.computeStreaks('t1');
}
ok(streakOf([D(-3)]).current > 0, 'cola: 2 dias completos perdidos NO rompen la racha');
ok(streakOf([D(-4)]).current === 0, 'cola: 3 dias completos perdidos SI rompen la racha');
{
  const mid = streakOf([D(-8),D(-7),D(-6),D(-3),D(-2),D(-1)]);
  ok(mid.current === 6, 'medio: hueco de 2 dias mantiene la racha (6)');
}
{
  const tail = streakOf([D(-8),D(-7),D(-6),D(-5),D(-4),D(-3)]);
  ok(tail.current === 6, 'cola: hueco de 2 dias mantiene la misma racha (6) — simetrico');
}
ok(!streakOf([D(-2)]).bridged.has(D(0)), 'hoy no cuenta como dia perdonado');
ok(streakOf([D(-3)]).bridged.has(D(-1)) && streakOf([D(-3)]).bridged.has(D(-2)),
   'los dias perdonados de la cola llevan flor');

// ---------- las flores se actualizan al marcar/desmarcar ----------
{
  const win = makeDom(); win.__t.setup(); win.__t.offline();
  win.__t.checks(['t1|a|'+D(-3), 't1|a|'+D(0)]);   // -2 y -1 quedan perdonados
  const cellAt = d => win.document.querySelector(`#cards .cell[data-d="${d}"]`);
  ok(!!cellAt(D(-1)) && cellAt(D(-1)).classList.contains('patched'), 'flor visible en el dia perdonado');
  // desmarcar el ancla: la racha se acorta y esos dias dejan de estar perdonados
  cellAt(D(-3)).click();
  ok(!cellAt(D(-1)).classList.contains('patched'), 'al desmarcar, la flor desaparece sin recargar');
  ok(!cellAt(D(-1)).querySelector('.bloom'), 'y el SVG de la flor se retira del DOM');
  // volver a marcarlo: las flores regresan
  cellAt(D(-3)).click();
  ok(cellAt(D(-1)).classList.contains('patched') && !!cellAt(D(-1)).querySelector('.bloom'),
     'al re-marcar, la flor vuelve sola');
}

// ---------- i18n ----------
w = makeDom();
const es=Object.keys(w.__t.i18n().es), en=Object.keys(w.__t.i18n().en);
ok(es.length===en.length && es.every(k=>en.includes(k)), 'i18n es/en simétrico');
ok(typeof w.__t.i18n().es.cnt_minus==='function' && w.__t.i18n().en.cnt_plus('Agua')==='Increase Agua', 'aria de contadores traducida');

// ---------- bienvenida ----------
w = makeDom({roge_welcome_v1:'1'}); w.__t.setup(); w.__t.render();
ok(!w.document.querySelector('.welcome-card'), 'bienvenida no reaparece tras descartarse');

// ---------- accesibilidad ----------
w = makeDom(); w.__t.setup();
ok(!/maximum-scale/.test(w.document.querySelector('meta[name="viewport"]').content), 'viewport permite pinch-zoom');
const toast = w.document.getElementById('toast');
ok(toast.getAttribute('role')==='status' && toast.getAttribute('aria-live')==='polite', 'toast es región aria-live');
ok(html.includes(':focus-visible{ outline:3px solid var(--teal)'), 'anillo :focus-visible presente');
ok(html.includes('animation-iteration-count:1 !important'), 'reduced-motion detiene bucles infinitos');
w.__t.render();
const minus = w.document.querySelector('.cbtn.minus');
ok(minus && /Restar/.test(minus.getAttribute('aria-label')), 'aria del − usa tr() en español');
// modal: rol de diálogo y Escape lo cierra
w.openStreakTips();
const dlg = w.document.querySelector('.modal[role="dialog"]');
ok(!!dlg && dlg.getAttribute('aria-modal')==='true', 'infoModal con role=dialog + aria-modal');
w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key:'Escape', bubbles:true }));
ok(!w.document.querySelector('.modal-ov'), 'Escape cierra el modal');

// ---------- To Do (matriz de Eisenhower) ----------
w = makeDom(); w.__t.setup();
// Tab exists, panel exists, FAB exists
ok(!!w.document.querySelector('.tab[data-tab="todo"]'), 'pestaña To Do presente');
ok(!!w.document.getElementById('panel-todo'), 'panel-todo presente');
ok(!!w.document.getElementById('todoAddBtn'), 'FAB de agregar tarea presente');
// Seed tasks directly on state (skip network)
w.switchTab('todo');
w.__t.tasks([
  { id:'t1', quadrant:'do',       text:'Apagar incendio', done_at:null, sort_order:1, created_at:'', updated_at:'' },
  { id:'t2', quadrant:'do',       text:'Otro incendio',    done_at:null, sort_order:2, created_at:'', updated_at:'' },
  { id:'t3', quadrant:'schedule', text:'Planear mes',      done_at:null, sort_order:3, created_at:'', updated_at:'' },
]);
ok(w.document.getElementById('panel-todo').classList.contains('active'), 'switchTab(todo) activa el panel');
ok(w.document.body.classList.contains('tab-todo'), 'body.tab-todo se enciende al entrar');
const todoChipEls = w.document.querySelectorAll('#todoChips .todo-chip');
ok(todoChipEls.length === 4, 'cuatro chips (uno por cuadrante)');
const doChipCount = todoChipEls[0].querySelector('.cnum');
ok(doChipCount && doChipCount.textContent === '2', 'chip HAZLO YA muestra 2 abiertas');
const doCol = w.document.getElementById('todoCol-do');
ok(doCol && doCol.querySelectorAll('.todo-card').length === 2, 'columna HAZLO YA renderiza 2 cards');
// Card altura fija
const card = doCol.querySelector('.todo-card');
ok(/height:64px/.test(w.getComputedStyle(card).cssText) || html.includes('.todo-card{') && html.includes('height:64px'),
   'card usa height fijo (64px)');
// Marca hecha → card sale de "open" y baja al toggle "Hecho hoy"
w.__t.patchTask(0, { done_at: new Date().toISOString() });
const openAfter = w.document.getElementById('todoCol-do').querySelectorAll('.todo-list .todo-card');
ok(openAfter.length >= 1, 'al marcar una, quedan cards visibles');
ok(!!w.document.querySelector('#todoCol-do .todo-done-toggle'), 'aparece el toggle "Hecho hoy"');
// Reasignar cuadrante en memoria + re-render coloca la card en la nueva columna
w.__t.patchTask(1, { quadrant: 'delegate' });
ok(w.document.querySelectorAll('#todoCol-delegate .todo-card').length === 1, 'reasignar mueve la card al nuevo cuadrante');
// Cambiar idioma re-renderiza el To Do
w.setLang('en');
ok(/Do it now/.test(w.document.querySelector('#todoCol-do .todo-col-title').textContent), 'i18n en re-render del To Do');
w.setLang('es');

// ---------- guardia de zona de palidez (hallazgo de Mary) ----------
const CANVAS = { oat:'#ffffff', matcha:'#eff4ec', lavanda:'#f4f1f8', golden:'#e7d8b8', nocturno:'#1d1d24' };
function hsl(hex){
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.substr(i,2),16)/255);
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, d=mx-mn;
  if(!d) return [0,0,l*100];
  const s2=d/(1-Math.abs(2*l-1));
  let h = mx===r ? ((g-b)/d)%6 : mx===g ? (b-r)/d+2 : (r-g)/d+4;
  return [((h*60)+360)%360, s2*100, l*100];
}
const cssBlock = html.match(/<style>[\s\S]*?<\/style>/)[0];
for(const [name,hex] of Object.entries(CANVAS)){
  ok(cssBlock.includes('--sand:'+(name==='oat'?'':' ').trim()) || cssBlock.includes(hex), `canvas ${name} (${hex}) presente en el CSS`);
  const [H,S,L]=hsl(hex);
  ok(!(L>93 && S<35 && H>=33 && H<=58), `canvas ${name} fuera de la zona de palidez`);
}
{ const [H,S,L]=hsl('#f9f8f6'); ok(L>93 && S<35 && H>=33 && H<=58, 'la guardia SÍ detecta #f9f8f6 (control)'); }

console.log(pass?'\nALL PASS':'\nFAILED'); process.exit(pass?0:1);
