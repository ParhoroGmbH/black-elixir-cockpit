/* Lattafa – Was der Name verrät. Erwartet: T, LANGS (i18n), toAr (names), CFG {lang, base, img(key,mobile), lurl|null, prd:[[handle,name,group,price,thumb]]} */
(function(){
var CH=[["qahwa","قهوة","Qahwa","Khamrah Qahwa","lattafa-khamrah-qahwa-eau-de"],["yara","يارا","Yara","Yara Tous","lattafa-yara-tous-eau-de-parfum"],["abiyedh","أنا الأبيض","Ana al-Abyaḍ","Ana Abiyedh Scarlet","lattafa-ana-abiyedh-scarlet"],["areeq","العريق","al-ʿArīq","Pride Al Areeq Gold","lattafa-pride-al-areeq-gold-eau-de-parfum"],["stone","حجر","Ḥajar","Niche Emarati Classic Stone","lattafa-niche-emirati-classic-stone-eau-de-parfum"],["khamrah","خمرة","Khamra","Khamrah","lattafa-khamrah-eau-de-parfum"],["petra","البتراء","al-Batrāʾ","Petra","lattafa-petra-eau-de-parfum"],["hayaam","هيام","Hayām","Niche Hayaam","lattafa-niche-hayaam-eau-de-parfum"]];
var PRICE={};CFG.prd.forEach(function(p){PRICE[p[0]]=p});
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,mq=matchMedia('(max-width:760px),(orientation:portrait)');
var lang=T[CFG.lang]?CFG.lang:'de',t;
function eur(v){var s=v.toFixed(2);return lang==='en'?'€'+s:s.replace('.',',')+' €'}
function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}

function render(){
  t=T[lang];
  var root=document.documentElement;root.lang=lang;root.dir=(lang==='ar'||lang==='he')?'rtl':'ltr';
  if(!CFG.lurl)document.title=t.title;
  $('h1').textContent=t.h1;$('intro').textContent=t.intro;$('cue').textContent=t.cue;
  $('nameH').textContent=t.nameH;$('nameP').textContent=t.nameP;$('nmL').textContent=t.lbl;
  $('nm').placeholder=t.ph;$('wbtn').textContent=t.write;$('save').textContent=t.save;$('shopH').textContent=t.shopH;
  /* Sprachen */
  $('langs').innerHTML=LANGS.map(function(l){
    if(CFG.lurl&&!CFG.lurl[l[0]])return '';
    var href=CFG.lurl?CFG.lurl[l[0]]:'#';
    return '<a href="'+href+'" lang="'+l[0]+'" hreflang="'+l[0]+'" data-l="'+l[0]+'"'+(l[0]===lang?' aria-current="true"':'')+'>'+l[1]+'</a>';
  }).join('');
  /* Kapitel */
  $('chapters').innerHTML=CH.map(function(c,i){
    var p=PRICE[c[4]],buy=p?'<div class="prod fade"><b>Lattafa '+c[3]+'</b><span class="pr">'+eur(p[3])+'</span></div><a class="btn fade" href="'+CFG.base+c[4]+'">'+t.btn+'</a>':'<div class="prod fade"><b>Lattafa '+c[3]+'</b></div>';
    var fs=c[1].length>6?92:118;
    return '<section class="ch"><div class="stage"><picture><source media="(max-width:760px)" srcset="'+CFG.img(c[0],1)+'"><img src="'+CFG.img(c[0],0)+'" alt="Lattafa '+esc(c[3])+' – '+esc(t.t[i])+'" width="1800" height="1195"'+(i?' fetchpriority="low"':'')+'></picture><div class="veil"></div>'+
      '<div class="txt"><div class="time">'+t.t[i]+'</div>'+
      '<svg class="word" viewBox="0 0 430 220" role="img" aria-label="'+c[1]+'"><text class="ink" x="'+(root.dir==='rtl'?426:426)+'" y="140" text-anchor="start" direction="rtl" font-size="'+fs+'">'+c[1]+'</text></svg>'+
      '<div class="trans fade">'+c[2]+'</div><p class="mean fade">'+t.m[i]+'</p>'+buy+'</div></div></section>';
  }).join('');
  /* Produkte */
  $('groups').innerHTML=['e','s','d'].map(function(g,gi){
    var it=CFG.prd.filter(function(p){return p[2]===g});if(!it.length)return '';
    return '<h3>'+t.g[gi]+'</h3><div class="grid">'+it.map(function(p){
      return '<a class="card" href="'+CFG.base+p[0]+'"><img src="'+p[4]+'" alt="Lattafa '+esc(p[1])+'" loading="lazy" decoding="async" width="300" height="300"><span class="n">'+esc(p[1])+'</span><span class="p">'+eur(p[3])+'</span></a>';
    }).join('')+'</div>';
  }).join('');
  secs=[].slice.call(document.querySelectorAll('.ch'));
  if(!$('nm').dataset.touched)$('nm').value=t.sample;
  writeName();tick();
}

/* Schreiben beim Scrollen */
var secs=[];
function tick(){
  var vh=innerHeight;
  secs.forEach(function(s){
    var r=s.getBoundingClientRect(),w=s.querySelector('.word text'),p;
    if(r.bottom<-vh||r.top>vh*2)return;
    if(mq.matches){var ih=s.querySelector('img').offsetHeight;p=(vh*.9-r.top-ih*.45)/(vh*.4);}
    else p=-r.top/((r.height-vh)*.55);
    p=rm?1:Math.min(1,Math.max(0,p));
    w.style.strokeDashoffset=2600*(1-p);
    w.style.fillOpacity=p>.8?(p-.8)*5:0;
    s.classList.toggle('on',p>.7);
  });
}
addEventListener('scroll',function(){requestAnimationFrame(tick)},{passive:true});
addEventListener('resize',tick);

/* Name */
function writeName(){
  var v=$('nm').value.trim()||t.sample,a=toAr(v),n=$('nameSvg').querySelector('text');
  n.textContent=a;n.setAttribute('font-size',a.length>7?Math.max(64,130-(a.length-7)*10):130);
  $('nameLatin').textContent=(v===a?'':v+' · ')+a;
  n.classList.remove('go');n.getBoundingClientRect();if(!rm)n.classList.add('go');
}
$('nameForm').addEventListener('submit',function(e){e.preventDefault();$('nm').dataset.touched=1;writeName();});
$('save').addEventListener('click',function(){
  var a=$('nameSvg').querySelector('text').textContent,c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
  x.fillStyle='#15130f';x.fillRect(0,0,1080,1350);
  var g=x.createLinearGradient(0,420,0,820);g.addColorStop(0,'#f1d38c');g.addColorStop(.55,'#c98a3c');g.addColorStop(1,'#8f5a22');
  x.fillStyle=g;x.textAlign='center';x.direction='rtl';
  var fs=a.length>7?Math.max(110,250-(a.length-7)*20):250;x.font='700 '+fs+'px "Noto Nastaliq Urdu"';x.fillText(a,540,700);
  x.direction='ltr';x.fillStyle='#b9ab92';x.font='300 40px Spectral, serif';var v=$('nm').value.trim();if(v&&v!==a)x.fillText(v,540,930);
  x.fillStyle='#efe4cf';x.font='600 26px Spectral, serif';x.fillText('B L A C K   E L I X I R',540,1250);
  c.toBlob(function(b){var l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='name-arabisch.png';document.body.appendChild(l);l.click();setTimeout(function(){l.remove()},500);});
});

/* Sprache im Entwurf ohne Seitenwechsel */
if(!CFG.lurl)$('langs').addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();lang=a.dataset.l;render();});

render();
document.fonts&&document.fonts.ready.then(function(){writeName();tick();});
})();
