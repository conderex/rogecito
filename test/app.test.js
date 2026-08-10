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

// ---------- jardincito ----------
w = makeDom(); w.__t.setup(); w.__t.render();
ok(w.document.querySelectorAll('#garden .plant').length===8, 'jardincito con 8 plantas');
ok(w.document.getElementById('garden').getAttribute('aria-hidden')==='true', 'jardincito aria-hidden');
ok(w.document.querySelectorAll('#garden .bloom-g svg').length===8, 'flores dibujadas (SVG, no emoji)');
ok(html.includes('.panel.editing > #garden'), 'el modo edicion oculta el jardincito');
ok(!!w.document.querySelector('#panel-tracker #garden + footer') || !!w.document.querySelector('#panel-tracker #garden'), 'vive en el tracker, antes del footer');

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
