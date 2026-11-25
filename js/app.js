(function(){
const $=(s,r=document)=>r.querySelector(s);
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;}
// ---------- toast & status bar ----------
let toastTimer=0;
window.SOL_TOAST=function(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);};
function setStatus(mode,info){
  const m=$('#sb-mode'),i=$('#sb-info');
  if(m&&mode) m.textContent=mode;
  if(i&&info) i.textContent=info;
}
let activeTab='packs';
const hdrBtn=$('#hdr-action');
if(hdrBtn){
  hdrBtn.onclick=()=>{
    if(activeTab==='build'){ const b=$('#dl'); if(b) b.click(); }
    else if(activeTab==='tex'){ const b=$('#tpdl'); if(b) b.click(); }
    else if(activeTab==='music'){ const b=$('#mdExport'); if(b) b.click(); }
    else if(activeTab==='tools'){ show('tex'); }
    else { show('build'); window.SOL_TOAST('Customize your shader pack or pick any preset to download.'); }
  };
}

const LBL={shadows:{0:'Off',1:'Simple',2:'Soft (sharper near objects)'},skyQuality:{1:'Low',2:'Medium',3:'High',4:'Ultra'},stars:{0:'None',1:'Stars',2:'Stars and nebula'},cloudDetail:{3:'Simple',4:'Detailed',5:'Very detailed'},
 letterboxRatio:{1.85:'1.85:1',2:'2.0:1',2.2:'2.2:1',2.39:'2.39:1'},grade:{none:'None','teal-orange':'Teal and orange',warm:'Warm',cool:'Cool',dream:'Dreamy',ember:'Ember'},torchColor:{warm:'Warm orange',amber:'Amber',neutral:'Soft white',cool:'Cool blue',pink:'Pink'},shadowRes:{512:'512',1024:'1024',2048:'2048',4096:'4096'}};
const HINT={letterbox:'Cinema bars crop the picture to a wider ratio, so it will not fill a normal 16:9 screen.',pixelate:'Makes the whole picture chunky and low resolution.',outline:'Needs a little extra GPU work.',ssr:'Shows real objects in the water instead of only the sky.',gi:'Light bounces between nearby surfaces.',ssl:'Glowing blocks tint the blocks around them.',shadowRes:'Higher is sharper but heavier.'};
const SHOTS=Object.assign({},window.SOL_SHOTS||{});
const DEFS=SOL.defaults();

// ---------- cost & feature tags ----------
function cost(o){let s=1;const n=Number;if(n(o.shadows)>0)s+=(n(o.shadows)==1?1:2)+(n(o.shadowRes)>=4096?2:n(o.shadowRes)>=2048?1:0);if(n(o.ssr)>0)s+=1;if(n(o.gi)>0)s+=1.5;if(n(o.ssl)>0)s+=.5;if(n(o.ao)>0)s+=.5;
 if(n(o.volSteps)>0&&n(o.shadows)>0)s+=n(o.volSteps)>=12?1.5:.8;if(n(o.dof)>0)s+=1.5;if(o.mb)s+=.8;if(n(o.bloom)>0)s+=.3+(n(o.bloom)>=32?.4:0);if(n(o.godrays)>0)s+=.3;if(n(o.skyQuality)>=4)s+=.6;else if(n(o.skyQuality)>=3)s+=.3;if(n(o.outline)>0)s+=.3;
 return s<=2?1:s<=4?2:s<=6.5?3:s<=9?4:5;}
function dots(n){const c=el('span','cost');for(let i=1;i<=5;i++){const d=el('i',i<=n?'on':'');c.append(d);}return c;}
function featureTags(o){
  if(!o) return ['Ultra-fast','No shadows','Vanilla-friendly'];
  const f=Object.assign({},DEFS,o),tags=[];
  if(+f.shadows>0) tags.push(+f.shadows>1?'Soft Shadows':'Shadows');
  if(+f.volSteps>0&&+f.shadows>0) tags.push('Volumetric Light');
  if(+f.ssr>0) tags.push('SSR Water');
  if(+f.gi>0) tags.push('SSGI');
  if(+f.bloom>0) tags.push('Bloom');
  if(+f.dof>0) tags.push('DOF');
  if(+f.outline>0) tags.push('Outlines');
  if(+f.aurora>0) tags.push('Aurora');
  if(+f.pixelate>0) tags.push('Pixel Art');
  if(+f.mono>0) tags.push('Noir');
  return tags.slice(0,4);
}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);}

// ---------- tabs ----------
const tabs={};document.querySelectorAll('nav button').forEach(b=>{b.onclick=()=>show(b.dataset.tab);});
function show(id){
  activeTab=id;
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===id));
  document.querySelectorAll('section.tab').forEach(s=>s.classList.toggle('on',s.id==='tab-'+id));
  if(id==='packs'){
    if(hdrBtn) hdrBtn.textContent='Open Builder';
    setStatus('Shader Packs','15 Minecraft Java shader packs (Iris & OptiFine)');
  }else if(id==='build'){
    initBuilder();
    if(hdrBtn) hdrBtn.textContent='Export Shader .zip';
    setStatus('Shader Builder','Live WebGL2 preview · 81 GLSL options');
  }else if(id==='tex'){
    if(window.initTextures&&!tabs.tex){tabs.tex=1;window.initTextures($('#tab-tex'));}
    if(hdrBtn) hdrBtn.textContent='Export Texture .zip';
    setStatus('Texture Studio','Resolution-aware pixel editor & image converter');
  }else if(id==='music'){
    if(window.initMusicDiscs&&!tabs.music){tabs.music=1;window.initMusicDiscs($('#tab-music'));}
    if(hdrBtn) hdrBtn.textContent='Export Music Pack .zip';
    setStatus('Music Discs','Upload MP3/WAV/OGG to build custom Minecraft music disc packs');
  }else if(id==='tools'){
    if(window.initMcTools&&!tabs.tools){tabs.tools=1;window.initMcTools($('#tab-tools'));}
    if(hdrBtn) hdrBtn.textContent='Open Texture Studio';
    setStatus('Minecraft Tools','Circle/Sphere blueprints · Banner designer · RGB text · Nether calc · Gear planner');
  }
}

// ---------- Lightbox for full-size Minecraft screenshots ----------
function openLightbox(pack){
  const ov=el('div','lightbox');
  const img=new Image();img.src='img/packs/'+pack.name+'.jpg';img.alt='Solstice '+pack.name;
  const cap=el('div','lightbox-cap');
  cap.append(el('strong',null,'Solstice '+pack.name),el('span','small',pack.blurb));
  const dl=el('button','btn brand sm','Download .zip');
  dl.onclick=()=>download(SOL.zip(SOL.makePreset(pack.name)),'Solstice_'+pack.name+'.zip');
  cap.append(dl);
  if(pack.opts){
    const cu=el('button','btn alt sm','Customize in Builder');
    cu.onclick=()=>{ov.remove();opts=Object.assign(SOL.defaults(),pack.opts);show('build');title.value='Solstice '+pack.name+' (custom)';const ss=$('#startsel');if(ss)ss.value='p:'+pack.name;buildOptions();applyNow();};
    cap.append(cu);
  }
  const cl=el('button','btn alt sm','Close (Esc)');cl.onclick=()=>ov.remove();
  cap.append(cl);
  ov.append(img,cap);
  ov.onclick=e=>{if(e.target===ov)ov.remove();};
  const onKey=e=>{if(e.key==='Escape'){ov.remove();window.removeEventListener('keydown',onKey);}};
  window.addEventListener('keydown',onKey);
  document.body.append(ov);
}

// ---------- shader packs ----------
const GROUPS=[['Standard','From near-vanilla speed to maximum detail.'],['Cinematic','Film looks. These fill the whole screen. Their optional cinema bars (in Shader Options) crop to a wider ratio.'],['Unique','Different moods and art styles.']];
let packFilter={q:'',group:'All',maxCost:5};
function packs(){
  const root=$('#tab-packs');root.innerHTML='';
  const allNames=['Potato'].concat(SOL_DATA.presets.map(p=>p.name));

  // Hero with instant Before / After Minecraft screenshot slider (zero WebGL lag!)
  const hero=el('div','panel hero-bar');
  hero.innerHTML=`
    <div class="hero-copy">
      <h2>Minecraft Java Shaders, Built for Every PC</h2>
      <p>Compare real in-game Minecraft screenshots side-by-side. Drag the slider to see how each Solstice pack transforms the exact same world: from near-vanilla <b>Potato</b> to <b>Ultra</b>, <b>Neon</b>, and <b>Toon</b>.</p>
      <div class="bar" style="margin:0">
        <label>Left <select id="cmpL">${allNames.map(n=>`<option ${n==='Potato'?'selected':''}>${n}</option>`).join('')}</select></label>
        <label>Right <select id="cmpR">${allNames.map(n=>`<option ${n==='Ultra'?'selected':''}>${n}</option>`).join('')}</select></label>
      </div>
    </div>
    <div class="cmp-wrap" id="cmpWrap" title="Drag left or right to compare shader packs">
      <img id="cmpImgR" src="img/packs/Ultra.jpg" alt="Right shader preview">
      <div class="cmp-top" id="cmpTop" style="clip-path:inset(0 50% 0 0)">
        <img id="cmpImgL" src="img/packs/Potato.jpg" alt="Left shader preview">
      </div>
      <div class="cmp-line" id="cmpLine" style="left:50%"></div>
      <div class="cmp-knob" id="cmpKnob" style="left:50%">⇄</div>
      <span class="cmp-tag left" id="cmpTagL">Solstice Potato</span>
      <span class="cmp-tag right" id="cmpTagR">Solstice Ultra</span>
    </div>`;
  root.append(hero);

  const cmpWrap=$('#cmpWrap',hero),cmpTop=$('#cmpTop',hero),cmpLine=$('#cmpLine',hero),cmpKnob=$('#cmpKnob',hero);
  const setPct=p=>{
    const pct=Math.max(2,Math.min(98,p));
    cmpTop.style.clipPath=`inset(0 ${100-pct}% 0 0)`;
    cmpLine.style.left=pct+'%';cmpKnob.style.left=pct+'%';
  };
  let sliding=false;
  const moveAt=e=>{const r=cmpWrap.getBoundingClientRect();setPct((e.clientX-r.left)/r.width*100);};
  cmpWrap.onpointerdown=e=>{sliding=true;cmpWrap.setPointerCapture(e.pointerId);moveAt(e);};
  cmpWrap.onpointermove=e=>{if(sliding)moveAt(e);};
  cmpWrap.onpointerup=()=>sliding=false;
  $('#cmpL',hero).onchange=e=>{$('#cmpImgL',hero).src='img/packs/'+e.target.value+'.jpg';$('#cmpTagL',hero).textContent='Solstice '+e.target.value;};
  $('#cmpR',hero).onchange=e=>{$('#cmpImgR',hero).src='img/packs/'+e.target.value+'.jpg';$('#cmpTagR',hero).textContent='Solstice '+e.target.value;};

  const ctrl=el('div','bar panel');
  ctrl.innerHTML=`
    <input id="psearch" type="search" placeholder="Filter shader packs..." value="${packFilter.q}" style="min-width:210px">
    <label>Category <select id="pgroup"><option>All</option><option>Standard</option><option>Cinematic</option><option>Unique</option></select></label>
    <label>Performance <select id="pcost"><option value="5">Any GPU</option><option value="2">Low-end friendly (1–2)</option><option value="3">Mid-range (1–3)</option></select></label>
    <details style="margin:0 0 0 auto;border:0;background:none"><summary style="padding:4px 8px;font-size:12.5px;color:var(--mute)">How to install</summary>
      <div class="small" style="padding:8px 10px;border:1px solid var(--line);border-radius:4px;background:var(--bg);margin-top:6px">
        1. Install <b>Iris</b> (Fabric/NeoForge) or <b>OptiFine</b> for Minecraft Java Edition.<br>
        2. Put the downloaded <code>.zip</code> into <code>.minecraft/shaderpacks</code> (do not unzip).<br>
        3. Select it in <b>Options &gt; Video Settings &gt; Shader Packs</b>.
      </div>
    </details>`;
  root.append(ctrl);
  $('#pgroup',ctrl).value=packFilter.group;
  $('#pcost',ctrl).value=String(packFilter.maxCost);
  $('#psearch',ctrl).oninput=e=>{packFilter.q=e.target.value;renderPackGrid();};
  $('#pgroup',ctrl).onchange=e=>{packFilter.group=e.target.value;renderPackGrid();};
  $('#pcost',ctrl).onchange=e=>{packFilter.maxCost=+e.target.value;renderPackGrid();};
  root.append(el('div'));root.lastChild.id='pack-groups';
  renderPackGrid();
}
function renderPackGrid(){
  const host=$('#pack-groups');if(!host)return;host.innerHTML='';
  const q=packFilter.q.trim().toLowerCase();
  const list=[{name:'Potato',group:'Standard',blurb:'Fastest. Almost vanilla speed.',desc:'Built for speed: simple lighting, fog and a cheap sunset sky. For weak graphics cards.',opts:null}].concat(SOL_DATA.presets);
  let total=0;
  GROUPS.forEach(g=>{
    if(packFilter.group!=='All'&&packFilter.group!==g[0]) return;
    const matches=list.filter(p=>{
      if(p.group!==g[0]) return false;
      const c=p.opts?cost(Object.assign(SOL.defaults(),p.opts)):1;
      if(c>packFilter.maxCost) return false;
      if(q&&!(p.name.toLowerCase().includes(q)||p.blurb.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q))) return false;
      return true;
    });
    if(!matches.length) return;
    total+=matches.length;
    host.append(el('h2',null,g[0]),el('p','note',g[1]));
    const grid=el('div','grid');
    matches.forEach(p=>{
      const card=el('div','card');
      const shot=el('div','shot');
      const img=new Image();img.loading='lazy';img.decoding='async';img.src='img/packs/'+p.name+'.jpg';img.alt='Solstice '+p.name+' in Minecraft';
      shot.append(img,el('span','shot-pill','Click to zoom'));
      shot.onclick=()=>openLightbox(p);
      const c=p.opts?cost(Object.assign(SOL.defaults(),p.opts)):1;
      const body=el('div','body');
      body.append(el('h3',null,'Solstice '+p.name),el('p',null,p.blurb),el('p','meta',p.desc));
      const tags=el('div','badges');featureTags(p.opts).forEach(t=>tags.append(el('span','badge',t)));body.append(tags);
      const m=el('div','meta');m.append('Performance cost ',dots(c));body.append(m);
      const row=el('div','row');
      const d=el('button','btn brand','Download');
      d.onclick=()=>{d.textContent='Preparing...';setTimeout(()=>{download(SOL.zip(SOL.makePreset(p.name)),'Solstice_'+p.name+'.zip');d.textContent='Download';window.SOL_TOAST('Downloaded Solstice_'+p.name+'.zip');},30);};
      row.append(d);
      if(p.opts){
        const b=el('button','btn alt','Customize');
        b.onclick=()=>{opts=Object.assign(SOL.defaults(),p.opts);show('build');title.value='Solstice '+p.name+' (custom)';const ss=$('#startsel');if(ss)ss.value='p:'+p.name;buildOptions();applyNow();};
        row.append(b);
      }
      body.append(row);card.append(shot,body);grid.append(card);
    });
    host.append(grid);
  });
  if(!total) host.append(el('p','note','No shader packs match your current filter.'));
}

// ---------- builder ----------
let opts=SOL.defaults(),pv=null,timer=0,title=document.createElement('input');title.value='Solstice Custom';
let optSearch='',onlyModified=false;
function sunElToClock(elDeg){
  // Map -35..85 sun elevation roughly to a readable clock
  if(elDeg<=-18) return '00:00 (Midnight)';
  if(elDeg<0) return '05:15 (Twilight)';
  if(elDeg<14) return '06:30 (Golden hr)';
  if(elDeg<35) return '09:30 (Morning)';
  if(elDeg<65) return '12:00 (Midday)';
  return '13:30 (High noon)';
}
function updateHud(){
  const t=$('#pvhud-time'),ms=$('#pvhud-ms');
  if(t&&pv) t.textContent=sunElToClock(pv.P.sunEl)+(pv.P.rain>0.1?' · Rain':'');
  if(ms&&pv) ms.textContent=pv.lastMs?pv.lastMs.toFixed(1)+' ms':'WebGL2';
}
function changed(){clearTimeout(timer);timer=setTimeout(applyNow,240);updateCost();}
function applyNow(){if(!pv)return;const err=$('#pverr');try{pv.setPack(SOL.makePack(opts));pv.render();updateHud();err.textContent='';}catch(e){err.textContent='Preview problem: '+e.message;}}
function updateCost(){const c=$('#costline');if(!c)return;c.innerHTML='';c.append('Estimated GPU cost ',dots(cost(opts)));}
function isMod(k){return String(opts[k])!==String(DEFS[k]);}
function buildOptions(){
  const root=$('#opts');if(!root)return;root.innerHTML='';
  const groups={};SOL_DATA.opts.forEach(o=>{(groups[o.group]=groups[o.group]||[]).push(o);});
  const q=optSearch.trim().toLowerCase();
  Object.keys(groups).forEach((g,i)=>{
    const list=groups[g].filter(o=>{
      if(onlyModified&&!isMod(o.key)) return false;
      if(q&&!(o.label.toLowerCase().includes(q)||o.key.toLowerCase().includes(q)||g.toLowerCase().includes(q))) return false;
      return true;
    });
    if(!list.length) return;
    const modCount=list.filter(o=>isMod(o.key)).length;
    const d=el('details');if(i<2||q||onlyModified)d.open=true;
    const sum=el('summary');
    const sumLeft=el('span',null,g+(modCount?` (${modCount} modified)`:''));
    const rst=el('button','btn alt sm','Reset');
    rst.onclick=e=>{e.preventDefault();e.stopPropagation();groups[g].forEach(o=>opts[o.key]=DEFS[o.key]);buildOptions();applyNow();};
    sum.append(sumLeft,rst);
    d.append(sum);
    const box=el('div');
    list.forEach(o=>{
      const row=el('div','opt'+(o.type==='toggle'?' t':'')+(isMod(o.key)?' mod':''));
      const lab=el('label',null,o.label);
      if(o.type==='toggle'){const c=el('input');c.type='checkbox';c.checked=!!+opts[o.key];c.onchange=()=>{opts[o.key]=c.checked?1:0;row.classList.toggle('mod',isMod(o.key));changed();};row.append(lab,c);}
      else if(o.type==='range'){const [mn,mx,st]=o.extra;const r=el('input');r.type='range';r.min=mn;r.max=mx;r.step=st;r.value=opts[o.key];const v=el('span','v');const sh=()=>{v.textContent=+(+r.value).toFixed(4);};sh();r.oninput=()=>{opts[o.key]=+r.value;sh();row.classList.toggle('mod',isMod(o.key));changed();};row.append(lab,r,v);}
      else if(o.type==='select'){const s=el('select');o.extra.forEach(x=>{const op=el('option',null,(LBL[o.key]&&LBL[o.key][x])||String(x));op.value=x;s.append(op);});s.value=opts[o.key];s.onchange=()=>{opts[o.key]=isNaN(+s.value)?s.value:+s.value;row.classList.toggle('mod',isMod(o.key));changed();};row.append(lab,s);}
      else if(o.type==='color'){const c=el('input');c.type='color';c.value=opts[o.key];c.oninput=()=>{opts[o.key]=c.value;row.classList.toggle('mod',isMod(o.key));changed();};row.append(lab,c);}
      if(HINT[o.key])row.append(el('div','hint',HINT[o.key]));
      box.append(row);
    });
    d.append(box);root.append(d);
  });
  if(!root.children.length) root.append(el('p','note','No shader options match that filter.'));
  updateCost();
}
function initBuilder(){
  if($('#build-ui'))return;const root=$('#tab-build');
  root.innerHTML=`
  <div class="bar panel">
    <label>Start from <select id="startsel"></select></label>
    <label>Pack name <input id="pname" value="Solstice Custom"></label>
    <button class="btn alt sm" id="savepreset">Save preset</button>
    <button class="btn alt sm" id="resetb">Reset all</button>
    <button class="btn alt sm" id="copyjson">Copy JSON</button>
    <button class="btn alt sm" id="loadjson">Import JSON</button>
  </div>
  <div class="builder" id="build-ui">
    <div class="stick">
      <div class="pv-wrap">
        <canvas id="pv" width="720" height="450"></canvas>
        <div class="pv-hud"><span class="pv-pill" id="pvhud-time">Morning</span><span class="pv-pill" id="pvhud-ms">WebGL2</span></div>
      </div>
      <div class="err" id="pverr"></div>
      <div class="ctrls">
        <label>Time of day (sun angle) <input type="range" id="sunel" min="-35" max="85" value="35"></label>
        <label>Sun direction <input type="range" id="sunaz" min="-180" max="180" value="-40"></label>
        <label>Rain <input type="range" id="rain" min="0" max="1" step="0.05" value="0"></label>
        <label>Moon phase <input type="range" id="moonph" min="0" max="7" step="1" value="0"></label>
        <label>Preview resolution <select id="psize"><option value="480x300">Fast (480×300)</option><option value="720x450" selected>Normal (720×450)</option><option value="960x600">Sharp (960×600)</option></select></label>
        <label class="inline"><input type="checkbox" id="anim"> Animate water, clouds &amp; leaves</label>
        <label class="inline"><input type="checkbox" id="held"> Hold a torch</label>
      </div>
      <div class="bar">
        <button class="btn alt sm" data-t="5">Sunrise</button>
        <button class="btn alt sm" data-t="60">Noon</button>
        <button class="btn alt sm" data-t="12">Sunset</button>
        <button class="btn alt sm" data-t="-30">Night</button>
        <button class="btn alt sm" id="camWater">Water view</button>
        <button class="btn alt sm" id="camReset">Reset camera</button>
        <button class="btn alt sm" id="cmpBtn" title="Press and hold to compare against default shader">Hold: Default</button>
        <button class="btn alt sm" id="snapBtn">Save PNG</button>
      </div>
      <div class="small">Drag the preview to orbit and scroll to zoom. The preview is a live WebGL2 shader pipeline running the exact GLSL code that goes into your .zip.</div>
    </div>
    <div>
      <div class="bar">
        <span id="costline"></span>
        <input type="search" id="optsearch" placeholder="Search 81 options..." style="margin-left:auto;min-width:150px">
        <label><input type="checkbox" id="onlymod"> Modified only</label>
        <button class="btn alt sm" id="expall">Expand all</button>
      </div>
      <div id="opts"></div>
      <div class="bar"><button class="btn brand" id="dl">Download my shader pack (.zip)</button></div>
      <div class="small">Put the .zip in <code>.minecraft/shaderpacks</code> without unzipping it. Works with Iris or OptiFine for Java Edition.</div>
    </div>
  </div>`;
  const SAVED_KEY='solstice_saved_presets_v1';
  function getSavedPresets(){try{return JSON.parse(localStorage.getItem(SAVED_KEY)||'{}');}catch(_){return {};}}
  function populateStartSel(){
    const ss=$('#startsel'),saved=getSavedPresets(),sKeys=Object.keys(saved);
    ss.innerHTML='<option value="">Default</option><optgroup label="Solstice Presets">'+SOL_DATA.presets.map(p=>`<option value="p:${p.name}">${p.name}</option>`).join('')+'</optgroup>'+(sKeys.length?'<optgroup label="Saved by you">'+sKeys.map(k=>`<option value="u:${k}">${k}</option>`).join('')+'</optgroup>':'');
  }
  const ss=$('#startsel');populateStartSel();
  ss.onchange=()=>{
    const v=ss.value;
    if(!v) opts=SOL.defaults();
    else if(v.startsWith('u:')){const sv=getSavedPresets()[v.slice(2)];opts=Object.assign(SOL.defaults(),sv||{});}
    else opts=Object.assign(SOL.defaults(),SOL.presetOpts(v.replace(/^p:/,'')));
    buildOptions();applyNow();
  };
  $('#savepreset').onclick=()=>{
    const name=($('#pname').value.trim()||'My Shader').replace(/[<>]/g,'');
    const saved=getSavedPresets();
    const diff={};for(const k in opts)if(isMod(k))diff[k]=opts[k];
    saved[name]=diff;
    try{localStorage.setItem(SAVED_KEY,JSON.stringify(saved));populateStartSel();ss.value='u:'+name;window.SOL_TOAST('Saved preset "'+name+'"');}
    catch(e){window.SOL_TOAST('Could not save preset.');}
  };
  let allOpen=false;
  $('#expall').onclick=()=>{allOpen=!allOpen;$('#opts').querySelectorAll('details').forEach(d=>d.open=allOpen);$('#expall').textContent=allOpen?'Collapse all':'Expand all';};
  $('#resetb').onclick=()=>{ss.value='';ss.onchange();window.SOL_TOAST('Reset all shader options to defaults.');};
  $('#copyjson').onclick=()=>{
    const diff={};for(const k in opts)if(isMod(k))diff[k]=opts[k];
    const txt=JSON.stringify(diff,null,2);
    navigator.clipboard&&navigator.clipboard.writeText(txt).then(()=>window.SOL_TOAST('Copied shader config JSON to clipboard!')).catch(()=>prompt('Copy your shader config JSON:',txt));
  };
  $('#loadjson').onclick=()=>{
    const raw=prompt('Paste a Solstice shader config JSON:');if(!raw)return;
    try{const parsed=JSON.parse(raw);opts=Object.assign(SOL.defaults(),parsed);buildOptions();applyNow();window.SOL_TOAST('Loaded shader config!');}
    catch(e){window.SOL_TOAST('Invalid JSON: '+e.message);}
  };
  $('#optsearch').oninput=e=>{optSearch=e.target.value;buildOptions();};
  $('#onlymod').onchange=e=>{onlyModified=e.target.checked;buildOptions();};
  title=$('#pname');
  try{pv=Preview.create($('#pv'));}catch(e){$('#pverr').textContent=e.message;}
  if(pv){
    const c=$('#pv');let drag=null;
    c.onpointerdown=e=>{drag=[e.clientX,e.clientY];c.setPointerCapture(e.pointerId);c.style.cursor='grabbing';};
    c.onpointerup=()=>{drag=null;c.style.cursor='grab';};
    c.onpointermove=e=>{if(!drag)return;pv.P.yaw-=(e.clientX-drag[0])*0.3;pv.P.pitch=Math.max(-45,Math.min(18,pv.P.pitch-(e.clientY-drag[1])*0.15));drag=[e.clientX,e.clientY];pv.render();updateHud();};
    c.onwheel=e=>{e.preventDefault();pv.P.dist=Math.max(4,Math.min(32,pv.P.dist*(e.deltaY>0?1.08:0.93)));pv.render();updateHud();};
    const bind=(id,k)=>{$(id).oninput=()=>{pv.P[k]=+$(id).value;pv.render();updateHud();};};
    bind('#sunel','sunEl');bind('#sunaz','sunAz');bind('#rain','rain');bind('#moonph','moonPhase');
    $('#psize').onchange=()=>{const [w,h]=$('#psize').value.split('x').map(Number);pv.resize(w,h);pv.render();updateHud();};
    $('#anim').onchange=()=>pv.animate($('#anim').checked);
    $('#held').onchange=()=>{pv.P.held=$('#held').checked?14:0;pv.render();};
    document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{$('#sunel').value=b.dataset.t;pv.P.sunEl=+b.dataset.t;pv.render();updateHud();});
    $('#camWater').onclick=()=>{pv.P.yaw=-22;pv.P.pitch=-14;pv.P.dist=8.5;pv.render();updateHud();};
    $('#camReset').onclick=()=>{pv.P.yaw=18;pv.P.pitch=-9;pv.P.dist=13;pv.render();updateHud();};
    const cmp=$('#cmpBtn');
    const showDef=()=>{if(!pv)return;try{pv.setPack(SOL.makePack(DEFS));pv.render();cmp.classList.add('active');}catch(_){}};
    const showCur=()=>{cmp.classList.remove('active');applyNow();};
    cmp.onpointerdown=showDef;cmp.onpointerup=showCur;cmp.onpointerleave=()=>{if(cmp.classList.contains('active'))showCur();};
    $('#snapBtn').onclick=()=>{const a=document.createElement('a');a.href=pv.snapshot();a.download=(title.value.trim()||'solstice_preview').replace(/[^\w\-]+/g,'_')+'.png';a.click();window.SOL_TOAST('Saved preview screenshot!');};
  }
  $('#dl').onclick=()=>{const t=$('#pname').value.trim()||'Solstice Custom';download(SOL.zip(SOL.makePack(opts,t,'Built with the Solstice shader builder.')),t.replace(/[^\w\- ]+/g,'').replace(/\s+/g,'_')+'.zip');window.SOL_TOAST('Downloaded '+t+'.zip');};
  buildOptions();applyNow();
}
window.SOLSITE={show,get opts(){return opts;},set opts(v){opts=v;}};
packs();
})();
