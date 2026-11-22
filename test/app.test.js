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

// ---------- editor ----------
w = makeDom(); w.__t.setup(); w.__t.edit();
ok(!w.document.querySelector('#cards .themechips'), 'el tema ya no vive en el editor');
const titles = [...w.document.querySelectorAll('#cards .count-title')].map(e=>e.textContent);
ok(titles[0]===w.__t.i18n().es.edit_tables, 'el editor arranca en "editar tablas"');

// ---------- settings hub ----------
w.openSettings();
const chips = w.document.querySelectorAll('#settings .themechip');
ok(chips.length===5 && [...chips].map(c=>c.dataset.t).join(',')==='oat,matcha,lavanda,golden,nocturno', '5 chips de tema en Ajustes, en orden');
ok(w.document.querySelectorAll('#settings .themechip svg.tc-moon').length===1 &&
   !!w.document.querySelector('#settings .themechip[data-t="nocturno"] svg.tc-moon'), 'lunita SVG solo en Nocturno');
ok(!w.document.querySelector('#settings .themechips').innerHTML.includes('🌙'), 'cero emoji de luna');
ok(w.document.querySelectorAll('#settings .wk-chip').length===7, 'selector de inicio de semana: 7 días');
ok(/Cerrar sesión|Log out/.test((w.document.querySelector('#settings .set-cuenta')||{}).textContent||''), 'cuenta (cerrar sesión + borrar) en Ajustes');

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

// ---------- las flores se actualizan al marcar/desmarcar (sin recargar) ----------
// La racha viva (y sus flores) está cerca de HOY, y ese tramo cruza el límite de
// semana (lunes) según el día. Cuando el hueco cabe en la semana visible probamos
// el DOM en vivo; a principio de semana verificamos la misma lógica a nivel de estado.
{
  const win = makeDom(); win.__t.setup(); win.__t.offline();
  const mon = win.weekStart(win.startOfToday());
  const todayN = Math.round((win.startOfToday() - mon) / 86400000); // 0=lunes … 6=domingo
  if(todayN >= 2){
    win.__t.checks(['t1|a|'+D(-2), 't1|a|'+D(0)]);   // -1 queda perdonado, mismo (esta) semana
    win.__t.week(0);
    const cellAt = d => win.document.querySelector(`#cards .cell[data-d="${d}"]`);
    ok(!!cellAt(D(-1)) && cellAt(D(-1)).classList.contains('patched'), 'flor visible en el día perdonado');
    cellAt(D(-2)).click();
    ok(!cellAt(D(-1)).classList.contains('patched'), 'al desmarcar, la flor desaparece sin recargar');
    ok(!cellAt(D(-1)).querySelector('.bloom'), 'y el SVG de la flor se retira del DOM');
    cellAt(D(-2)).click();
    ok(cellAt(D(-1)).classList.contains('patched') && !!cellAt(D(-1)).querySelector('.bloom'),
       'al re-marcar, la flor vuelve sola');
  } else {
    win.__t.checks(['t1|a|'+D(-2), 't1|a|'+D(0)]);
    ok(win.computeStreaks('t1').bridged.has(D(-1)), 'estado: el día perdonado lleva flor');
    win.__t.checks(['t1|a|'+D(0)]);
    ok(win.computeStreaks('t1').bridged.size === 0, 'estado: al quitar el ancla, se van las flores');
    win.__t.checks(['t1|a|'+D(-2), 't1|a|'+D(0)]);
    ok(win.computeStreaks('t1').bridged.has(D(-1)), 'estado: al re-marcar, la flor vuelve');
  }
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

// ---------- landing pre-auth ----------
{
  const win = makeDom();
  win.bindAuthUI();          // wire the landing CTAs (boot() is stripped in tests)
  win.renderDemo();          // populate the demo grid (normally done via applyLang on boot)
  const L = () => win.document.getElementById('landing');
  const G = () => win.document.getElementById('gate');
  const A = () => win.document.querySelector('.app');
  // logged-out view
  win.showLanding();
  ok(!L().hidden && G().hidden && A().style.display === 'none', 'logout → landing visible, gate y app ocultos');
  // the demo moved into the landing and still renders (in-memory only)
  ok(!!win.document.querySelector('#landing #demoGrid .demo-cell'), 'demo tocable vive dentro de la landing');
  ok(!win.document.querySelector('#gate #demoGrid'), 'el demo ya no está en el gate');
  // primary CTA → gate in signup mode
  win.document.getElementById('landCta').click();
  ok(!G().hidden && L().hidden, 'CTA "crear mi primera tablita" abre el gate');
  ok(win.document.getElementById('authSubmit').textContent === win.__t.i18n().es.signup_submit, 'gate abre en modo registro');
  // "already have an account" → gate in login mode
  win.showLanding();
  win.document.getElementById('landLogin').click();
  ok(win.document.getElementById('authSubmit').textContent === win.__t.i18n().es.login_submit, 'link "inicia sesión" → modo login');
  // back link → landing
  win.document.getElementById('gateBack').click();
  ok(!L().hidden && G().hidden, '"volver" regresa a la landing');
  // the landing demo persists nothing
  ok(!win.localStorage.getItem('roge_checks_v1'), 'el demo de la landing no persiste nada');
}

// ---------- fechas: semana lunes→domingo + invariantes ----------
{
  const isoL = x => x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  ok(w.computeDayHeaders()[0]==='L' && w.computeDayHeaders()[6]==='D', 'ES por defecto: la semana corre L…D (lunes)');
  // configurable first day of week
  const wfd = makeDom();
  wfd.setFirstDay(6); // sábado
  ok(wfd.weekStart(new Date(2026,10,18)).getDay()===6, 'firstDay=sábado → weekStart cae en sábado');
  ok(wfd.computeDayHeaders()[0]==='S' && wfd.computeDayHeaders()[6]==='V', 'firstDay=sábado → encabezados S…V');
  wfd.setFirstDay(0); // domingo
  ok(wfd.weekStart(new Date(2026,10,18)).getDay()===0, 'firstDay=domingo → weekStart cae en domingo');
  wfd.setFirstDay(1); // de vuelta a lunes
  ok(wfd.weekStart(new Date(2026,10,18)).getDay()===1, 'firstDay=lunes → weekStart cae en lunes');
  // weekStart siempre cae en lunes, 800 días seguidos (cruza meses, años y DST)
  let allMon=true, allWithin=true;
  const base=new Date(2025,0,1);
  for(let i=0;i<800;i++){
    const d=new Date(base); d.setDate(d.getDate()+i);
    const ws=w.weekStart(d);
    if(ws.getDay()!==1) allMon=false;
    const diff=Math.round((d - ws)/86400000);
    if(diff<0 || diff>6) allWithin=false;
  }
  ok(allMon, 'weekStart siempre cae en lunes (800 días: cruza meses, años y DST)');
  ok(allWithin, 'weekStart nunca queda a más de 6 días del día dado');
  // weekDates(0): 7 días consecutivos, lunes primero, domingo último
  const wd=w.weekDates(0);
  ok(wd.length===7 && wd[0].getDay()===1 && wd[6].getDay()===0, 'weekDates(0): lunes→domingo, 7 días');
  let consec=true; for(let i=1;i<7;i++){ if(Math.round((wd[i]-wd[i-1])/86400000)!==1) consec=false; }
  ok(consec, 'weekDates(0): días consecutivos');
  // candado: esta semana y la pasada editables; dos semanas atrás, bloqueada
  const mondayThis = w.weekStart(w.startOfToday());
  ok(!w.isLocked(isoL(mondayThis)), 'lunes de esta semana: editable');
  ok(!w.isLocked(isoL(w.addDays(mondayThis,-7))), 'semana pasada: editable');
  ok(w.isLocked(isoL(w.addDays(mondayThis,-8))), 'hace 8 días (semana -2): bloqueado');
}

console.log(pass?'\nALL PASS':'\nFAILED'); process.exit(pass?0:1);
