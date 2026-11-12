// Prüf-Hilfen (nur im Browser-Tab des Agenten, nichts davon liegt im Theme). Warenkorb-Aufrufe werden abgefangen: kein echter Warenkorb-Zugriff.
(()=>{
 if(!window.__h){const of=window.fetch;window.__cart=[];window.fetch=function(u,o){const url=String(u&&u.url||u);if(/\/cart\/(add|change|update|clear)/.test(url)){window.__cart.push({url,body:o&&o.body});return Promise.resolve(new Response(JSON.stringify({status:422,message:'TEST',description:'TEST abgefangen'}),{status:422,headers:{'Content-Type':'application/json'}}))}return of.apply(this,arguments)};
  const xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){if(/\/cart\/(add|change|update|clear)/.test(String(u))){window.__cart.push({url:String(u),xhr:1});u='/__blocked__'}return xo.call(this,m,u,...[].slice.call(arguments,2))};
  document.addEventListener('submit',e=>{if(/\/cart/.test(e.target.action||'')){e.preventDefault();window.__cart.push({form:e.target.action})}},true);
  window.__errs=[];addEventListener('error',e=>window.__errs.push(String(e.message)+' @'+(e.filename||'').slice(-40)+':'+e.lineno));addEventListener('unhandledrejection',e=>window.__errs.push('rej '+String(e.reason)));window.__h=1}
 const W=ms=>new Promise(r=>setTimeout(r,ms));
 const chs=()=>[...document.querySelectorAll('[data-fls-ch]')];
 window.__at=async(i,f)=>{const ch=chs()[i];scrollTo({top:ch.getBoundingClientRect().top+scrollY+innerHeight*f,behavior:'instant'});await W(1200);return Math.round(scrollY)};
 window.__go=async(i,part)=>{const ch=chs()[i];const el=part==='prod'?ch.querySelector('.fls-prod'):ch;scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'});await W(1200);return Math.round(scrollY)};
 // Flakon ganz ins Bild: Bühne unter eine evtl. sichtbare Kopfleiste legen
 window.__stage=async i=>{const st=chs()[i].querySelector('.fls-stage');scrollTo({top:st.getBoundingClientRect().top+scrollY-Math.max(0,(innerHeight-st.offsetHeight)/2),behavior:'instant'});await W(1200)};
 const R=e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom].map(Math.round)};
 const hit=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
 window.__fixed=()=>[...document.querySelectorAll('body *')].filter(e=>{if(e.closest('.fls,.fl-land'))return false;const c=getComputedStyle(e);if(c.position!=='fixed'&&c.position!=='sticky')return false;if(c.visibility==='hidden'||c.display==='none'||+c.opacity===0||c.pointerEvents==='none')return false;const r=e.getBoundingClientRect();return r.width>20&&r.height>20&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}).map(e=>({c:(e.id||e.className+'').toString().trim().slice(0,40),r:R(e)}));
 // Kapitel i (1..4) prüfen: Produktfläche
 window.__chk=i=>{const ch=chs()[i],p=ch.querySelector('.fls-prod'),mv=ch.querySelector('model-viewer'),st=ch.querySelector('.fls-stage'),b=ch.querySelector('[data-fls-add]'),a=ch.querySelector('.fls-btns>a'),info=ch.querySelector('.fls-info');
  const texts=[...info.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim());const minfs=Math.min(...texts.map(e=>parseFloat(getComputedStyle(e).fontSize)));
  const fx=__fixed();const els=[['stage',st],['info',info],['add',b],['zum',a]];const ov=[];els.forEach(([n,e])=>fx.forEach(f=>{if(hit(R(e),f.r))ov.push(n+'×'+f.c)}));
  const sb=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fl-sbw'))||0;
  const clip=els.filter(([n,e])=>{const r=R(e);return r[0]<sb-1||r[2]>p.getBoundingClientRect().right+1}).map(x=>x[0]);
  return {name:ch.querySelector('.fls-name').textContent,sub:ch.querySelector('.fls-sub').textContent,glb:(mv.src||'').split('/').pop(),ld:!!mv.loaded,set:st.className.replace('fls-stage','').trim(),vid:b.getAttribute('data-fls-add'),href:a.getAttribute('href'),price:ch.querySelector('.fls-price').firstChild.textContent.trim(),notes:ch.querySelectorAll('.fls-notes dd').length,bg:getComputedStyle(p).backgroundColor,ink:getComputedStyle(ch.querySelector('.fls-name')).color,stage:R(st),info:R(info),btn:[b.offsetWidth,b.offsetHeight,a.offsetWidth,a.offsetHeight],minfs,ov,clip,sw:[document.documentElement.scrollWidth,document.documentElement.clientWidth],lit:document.documentElement.className.match(/fls-light|fl-dark/g)}};
 window.__vid=i=>{const v=chs()[i].querySelector('video');return {src:(v.currentSrc||'').split('/').pop().slice(-34),paused:v.paused,t:+v.currentTime.toFixed(2),on:v.classList.contains('on'),pre:v.preload,poster:!!v.poster,rs:v.readyState}};
 window.__add=async i=>{window.__cart.length=0;const b=chs()[i].querySelector('[data-fls-add]');b.click();await W(700);const e=chs()[i].querySelector('.fls-err');const out={req:window.__cart.map(c=>c.url.replace(location.origin,'')+' '+(c.body||'')),err:e.textContent,btn:b.textContent,dis:b.disabled};e.textContent='';return out};
 return 'ok';
})()
