window.initTextures=function(root){
const $=(s,r=root)=>r.querySelector(s);
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;}
const toast=m=>window.SOL_TOAST&&window.SOL_TOAST(m);
const store={};      // path -> {w,h,data:Uint8ClampedArray}
const sources={};    // path -> HTMLImageElement (original uploaded image for lossless re-conversion)
let cur=null,curBaseW=16,curBaseH=16,tool='pencil',color='#c0392b',brush=1,alpha=1;
let packRes=32,mirrorX=false,mirrorY=false,showGrid=true,cat='all',undo=[],redo=[],iconImg=null;
let recentColors=['#c0392b','#2980b9','#27ae60','#f1c40f'];
const upCfg={fit:'auto',scale:'smooth',rmBg:false,bgTol:32,colors:0,dither:false};

root.innerHTML=`<p class="note">Upload any image to automatically shrink it to your pack resolution (16x16, 32x32, 64x64, 128x128, or 256x256), then use the <b>Eraser</b> or <b>Magic Erase</b> to clean up pixels and export a ready-to-use Minecraft resource pack.</p>
<div class="bar panel">
  <label>Pack name <input id="tpname" value="My Texture Pack"></label>
  <label>Pack resolution <select id="tpres"><option value="16">16×16 (Vanilla)</option><option value="32" selected>32×32 (Faithful)</option><option value="64">64×64 (HD)</option><option value="128">128×128 (Ultra)</option><option value="256">256×256 (Extreme)</option></select></label>
  <button class="btn alt sm" id="tpresizeall" title="Resample every texture in your pack to match the selected Pack resolution">Resize all to pack</button>
  <label>Minecraft version <select id="tpver"></select></label>
  <button class="btn alt sm" id="tpbatch">Batch upload images</button>
  <button class="btn alt sm" id="tpimport">Import .zip pack</button>
  <input type="file" id="tpbatchIn" accept="image/*" multiple hidden>
  <input type="file" id="tpimportIn" accept=".zip" hidden>
</div>
<div class="bar panel" id="tpquick" style="padding:8px 12px">
  <span class="small"><b>Quick custom textures:</b></span>
  <button class="btn alt sm" data-q="item/totem_of_undying">Totem of Undying</button>
  <button class="btn alt sm" data-q="item/diamond_sword">Diamond Sword</button>
  <button class="btn alt sm" data-q="item/netherite_sword">Netherite Sword</button>
  <button class="btn alt sm" data-q="item/golden_apple">Golden Apple</button>
  <button class="btn alt sm" data-q="item/ender_pearl">Ender Pearl</button>
  <button class="btn alt sm" data-q="item/shield">Shield</button>
  <button class="btn alt sm" data-q="block/grass_block_side">Grass Block</button>
  <button class="btn alt sm" data-q="block/diamond_ore">Diamond Ore</button>
  <button class="btn alt sm" data-q="environment/sun">Sun</button>
  <button class="btn alt sm" data-q="gui/sprites/hud/crosshair">Crosshair</button>
</div>
<div class="tex">
  <div>
    <input id="tsearch" type="search" placeholder="Search textures (sword, totem, grass, stone...)" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);font:inherit;margin-bottom:8px">
    <div class="cat-tabs" id="tcats">
      <button data-cat="all" class="on">All</button>
      <button data-cat="block">Blocks</button>
      <button data-cat="item">Items</button>
      <button data-cat="misc">GUI &amp; Misc</button>
      <button data-cat="edited">Edited (0)</button>
    </div>
    <div class="tlist" id="tlist"></div>
    <div class="small" style="margin-top:10px">Not in the list? Add any path (e.g. <code>item/totem_of_undying</code> or <code>entity/creeper/creeper</code>):</div>
    <div class="bar" style="margin-top:6px"><input id="cpath" type="text" placeholder="block/my_texture" style="flex:1;min-width:120px"><select id="csize"><option value="0">Pack size</option><option value="16">16×16</option><option value="32">32×32</option><option value="64">64×64</option><option value="128">128×128</option><option value="256">256×256</option></select><button class="btn alt sm" id="cadd">Add</button></div>
  </div>
  <div>
    <div id="ed" class="panel"><div class="small" id="edname">Choose a texture from the list on the left: or click <b>Custom totem</b> / <b>Batch upload images</b> above to start.</div></div>
    <div class="panel" style="margin-top:14px">
      <div class="bar" style="margin-bottom:6px"><b>Your pack</b><span class="small" id="count"></span><button class="btn alt sm" id="tpclear" style="margin-left:auto">Clear pack</button></div>
      <div class="chips" id="chips"></div>
      <div class="bar"><label>Description <input id="tpdesc" value="Made with Solstice" style="min-width:220px"></label><label>Pack icon <input type="file" id="tpicon" accept="image/*"></label></div>
      <div class="bar" style="margin-bottom:4px"><button class="btn brand" id="tpdl">Download texture pack (.zip)</button></div>
      <div class="small">Drop the .zip into <code>.minecraft/resourcepacks</code> (do not unzip) and enable it in Options &gt; Resource Packs.</div>
    </div>
  </div>
</div>`;

const sel=$('#tpver');
TEX_VERSIONS.forEach(v=>{const o=el('option',null,v[0]);o.value=v[1];sel.append(o);});
sel.value=84;

function targetSize(baseW,baseH){
  const scale=packRes/16;
  return [Math.max(1,Math.round(baseW*scale)),Math.max(1,Math.round(baseH*scale))];
}
function texMeta(path){
  const t=TEX_LIST.find(x=>x[0]===path);
  return t?{baseW:t[2],baseH:t[3],label:t[1]}:{baseW:16,baseH:16,label:path};
}
function isBlockPath(p){return p.startsWith('block/');}

// ---------- Image processing: stepped downscale, bg removal, quantization, dithering ----------
const BAYER4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function stepDownscale(srcCanvas,tw,th,smooth){
  if(!smooth){
    const out=document.createElement('canvas');out.width=tw;out.height=th;
    const ox=out.getContext('2d');ox.imageSmoothingEnabled=false;
    ox.drawImage(srcCanvas,0,0,tw,th);return out;
  }
  let c=srcCanvas;
  while(c.width*0.5>tw && c.height*0.5>th){
    const n=document.createElement('canvas');
    n.width=Math.max(tw,Math.round(c.width*0.5));
    n.height=Math.max(th,Math.round(c.height*0.5));
    const nx=n.getContext('2d');nx.imageSmoothingEnabled=true;nx.imageSmoothingQuality='high';
    nx.drawImage(c,0,0,n.width,n.height);
    c=n;
  }
  const out=document.createElement('canvas');out.width=tw;out.height=th;
  const ox=out.getContext('2d');ox.imageSmoothingEnabled=true;ox.imageSmoothingQuality='high';
  ox.drawImage(c,0,0,tw,th);
  return out;
}
function removeCornerBg(imgData,tol){
  const {width:w,height:h,data:d}=imgData;
  const corners=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]];
  const vis=new Uint8Array(w*h);
  const tolSq=tol*tol*3;
  for(const [sx,sy] of corners){
    const si=(sy*w+sx)*4;
    if(d[si+3]<16) continue;
    const br=d[si],bg=d[si+1],bb=d[si+2];
    const st=[[sx,sy]];
    while(st.length){
      const [x,y]=st.pop();
      if(x<0||y<0||x>=w||y>=h) continue;
      const idx=y*w+x; if(vis[idx]) continue;
      const i=idx*4; if(d[i+3]<16){vis[idx]=1;continue;}
      const dr=d[i]-br,dg=d[i+1]-bg,db=d[i+2]-bb;
      if(dr*dr+dg*dg+db*db<=tolSq){
        vis[idx]=1; d[i+3]=0;
        st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      }
    }
  }
}
function quantizeImage(imgData,maxColors,dither){
  if(!maxColors||maxColors<=0) return;
  const {width:w,height:h,data:d}=imgData;
  // Build palette via median-cut on opaque pixels
  const pix=[];
  for(let i=0;i<d.length;i+=4){ if(d[i+3]>=128) pix.push([d[i],d[i+1],d[i+2]]); }
  if(!pix.length) return;
  let buckets=[pix];
  while(buckets.length<maxColors){
    let bi=-1,bestRange=-1,bestCh=0;
    for(let i=0;i<buckets.length;i++){
      const b=buckets[i]; if(b.length<2) continue;
      for(let ch=0;ch<3;ch++){
        let mn=255,mx=0; for(let k=0;k<b.length;k++){const v=b[k][ch];if(v<mn)mn=v;if(v>mx)mx=v;}
        if(mx-mn>bestRange){bestRange=mx-mn;bi=i;bestCh=ch;}
      }
    }
    if(bi<0||bestRange===0) break;
    const b=buckets.splice(bi,1)[0];
    b.sort((a,c)=>a[bestCh]-c[bestCh]);
    const mid=b.length>>1;
    buckets.push(b.slice(0,mid),b.slice(mid));
  }
  const pal=buckets.map(b=>{
    let r=0,g=0,bl=0; for(const p of b){r+=p[0];g+=p[1];bl+=p[2];}
    const n=b.length||1; return [Math.round(r/n),Math.round(g/n),Math.round(bl/n)];
  });
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      if(d[i+3]<128){d[i+3]=0;continue;}
      let r=d[i],g=d[i+1],b=d[i+2];
      if(dither){
        const bias=((BAYER4[y&3][x&3]/16)-0.5)*36;
        r=Math.max(0,Math.min(255,r+bias));
        g=Math.max(0,Math.min(255,g+bias));
        b=Math.max(0,Math.min(255,b+bias));
      }
      let best=pal[0],bd=1e9;
      for(let k=0;k<pal.length;k++){
        const p=pal[k],dr=r-p[0],dg=g-p[1],db=b-p[2],dist=dr*dr+dg*dg+db*db;
        if(dist<bd){bd=dist;best=p;}
      }
      d[i]=best[0];d[i+1]=best[1];d[i+2]=best[2];d[i+3]=255;
    }
  }
}
function convertImageToCanvas(im,w,h,path,cfg){
  const fitMode=cfg.fit==='auto'?(isBlockPath(path)?'cover':'contain'):cfg.fit;
  const smooth=cfg.scale==='smooth';
  // First draw cropped/fitted source onto an intermediate canvas at native or capped size
  const src=document.createElement('canvas');
  let sx=0,sy=0,sw=im.width,sh=im.height;
  if(fitMode==='cover'){
    const srcAsp=im.width/im.height, dstAsp=w/h;
    if(srcAsp>dstAsp){ sw=im.height*dstAsp; sx=(im.width-sw)/2; }
    else{ sh=im.width/dstAsp; sy=(im.height-sh)/2; }
    src.width=Math.max(w,Math.round(sw)); src.height=Math.max(h,Math.round(sh));
    const sctx=src.getContext('2d'); sctx.imageSmoothingEnabled=smooth;
    sctx.drawImage(im,sx,sy,sw,sh,0,0,src.width,src.height);
    const out=stepDownscale(src,w,h,smooth);
    const octx=out.getContext('2d',{willReadFrequently:true});
    const id=octx.getImageData(0,0,w,h);
    if(cfg.rmBg) removeCornerBg(id,cfg.bgTol);
    if(cfg.colors>0) quantizeImage(id,cfg.colors,cfg.dither);
    octx.putImageData(id,0,0);
    return out;
  } else {
    // Contain or Stretch
    const workScale=smooth?Math.max(1,Math.min(4,Math.floor(Math.min(im.width/w,im.height/h)))):1;
    const ww=w*workScale, wh=h*workScale;
    src.width=ww; src.height=wh;
    const sctx=src.getContext('2d'); sctx.imageSmoothingEnabled=smooth; sctx.imageSmoothingQuality='high';
    if(fitMode==='stretch'){
      sctx.drawImage(im,0,0,ww,wh);
    } else {
      const k=Math.min(ww/im.width,wh/im.height);
      const dw=im.width*k, dh=im.height*k;
      sctx.drawImage(im,(ww-dw)/2,(wh-dh)/2,dw,dh);
    }
    const out=workScale>1?stepDownscale(src,w,h,smooth):src;
    const octx=out.getContext('2d',{willReadFrequently:true});
    const id=octx.getImageData(0,0,w,h);
    if(cfg.rmBg) removeCornerBg(id,cfg.bgTol);
    if(cfg.colors>0) quantizeImage(id,cfg.colors,cfg.dither);
    octx.putImageData(id,0,0);
    return out;
  }
}

// ---------- Persistence ----------
const STORAGE_KEY='solstice_texpack_v2';
function saveLocal(){
  try{
    const packed={res:packRes,name:$('#tpname').value,desc:$('#tpdesc').value,ver:sel.value,items:{}};
    const keys=Object.keys(store);
    if(keys.length>40) return; // avoid exceeding localStorage quota
    for(const p of keys){
      const s=store[p];
      if(s.w*s.h>128*128) continue;
      packed.items[p]={w:s.w,h:s.h,png:thumb(p)};
    }
    localStorage.setItem(STORAGE_KEY,JSON.stringify(packed));
  }catch(_){}
}
function loadLocal(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return;
    const p=JSON.parse(raw);
    if(p.res){packRes=+p.res;$('#tpres').value=String(packRes);}
    if(p.name) $('#tpname').value=p.name;
    if(p.desc) $('#tpdesc').value=p.desc;
    if(p.ver) sel.value=p.ver;
    const entries=Object.entries(p.items||{});
    let rem=entries.length; if(!rem) return;
    entries.forEach(([path,obj])=>{
      const im=new Image();
      im.onload=()=>{
        const c=document.createElement('canvas');c.width=obj.w;c.height=obj.h;
        const x=c.getContext('2d');x.drawImage(im,0,0,obj.w,obj.h);
        store[path]={w:obj.w,h:obj.h,data:new Uint8ClampedArray(x.getImageData(0,0,obj.w,obj.h).data)};
        if(--rem===0){drawChips();drawList();}
      };
      im.onerror=()=>{if(--rem===0){drawChips();drawList();}};
      im.src=obj.png;
    });
  }catch(_){}
}

// ---------- list ----------
function updateCatCounts(){
  const eb=$('#tcats [data-cat="edited"]');
  if(eb) eb.textContent='Edited ('+Object.keys(store).length+')';
}
function drawList(){
  updateCatCounts();
  const q=$('#tsearch').value.trim().toLowerCase();
  const box=$('#tlist');box.innerHTML='';let n=0;
  const items=TEX_LIST.concat(Object.keys(store).filter(p=>!TEX_LIST.some(t=>t[0]===p)).map(p=>[p,p,store[p].w,store[p].h]));
  for(const t of items){
    const p=t[0],kind=p.split('/')[0];
    if(cat==='block'&&kind!=='block') continue;
    if(cat==='item'&&kind!=='item') continue;
    if(cat==='misc'&&(kind==='block'||kind==='item')) continue;
    if(cat==='edited'&&!store[p]) continue;
    if(q&&!(p.toLowerCase().includes(q)||t[1].toLowerCase().includes(q))) continue;
    if(++n>400) break;
    const [tw,th]=store[p]?[store[p].w,store[p].h]:targetSize(t[2],t[3]);
    const b=el('button',p===cur?'on':'');
    const im=new Image();im.width=24;im.height=24;if(store[p])im.src=thumb(p);
    b.append(im,el('span',null,t[1]),el('span','tsize',tw+'×'+th));
    b.onclick=()=>select(p,t[2],t[3],store[p]?store[p].w:tw,store[p]?store[p].h:th);
    box.append(b);
  }
  if(!n) box.append(el('div','small','No textures match that filter.'));
}
function thumb(p){const s=store[p];const c=document.createElement('canvas');c.width=s.w;c.height=s.h;c.getContext('2d').putImageData(new ImageData(s.data,s.w,s.h),0,0);return c.toDataURL();}
$('#tsearch').oninput=drawList;
$('#tcats').querySelectorAll('button').forEach(b=>{b.onclick=()=>{cat=b.dataset.cat;$('#tcats').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));drawList();};});

// ---------- Pack resolution change ----------
$('#tpres').onchange=()=>{
  packRes=+$('#tpres').value;
  if(cur){
    const [nw,nh]=targetSize(curBaseW,curBaseH);
    resizeCurrentCanvas(nw,nh,true);
  }
  drawList();
  toast('Pack resolution set to '+packRes+'×'+packRes);
  saveLocal();
};
$('#tpresizeall').onclick=()=>{
  saveCur();
  const keys=Object.keys(store);
  if(!keys.length){toast('No textures in your pack yet.');return;}
  keys.forEach(p=>{
    const m=texMeta(p),[nw,nh]=targetSize(m.baseW,m.baseH);
    if(sources[p]){
      const out=convertImageToCanvas(sources[p],nw,nh,p,upCfg);
      store[p]={w:nw,h:nh,data:new Uint8ClampedArray(out.getContext('2d').getImageData(0,0,nw,nh).data)};
    }else{
      const s=store[p],src=document.createElement('canvas');src.width=s.w;src.height=s.h;
      src.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(s.data),s.w,s.h),0,0);
      const out=stepDownscale(src,nw,nh,upCfg.scale==='smooth');
      store[p]={w:nw,h:nh,data:new Uint8ClampedArray(out.getContext('2d').getImageData(0,0,nw,nh).data)};
    }
  });
  if(cur&&store[cur]){
    const m=texMeta(cur);
    select(cur,m.baseW,m.baseH,store[cur].w,store[cur].h);
  }
  drawChips();drawList();saveLocal();
  toast(`Resized all ${keys.length} texture${keys.length>1?'s':''} to ${packRes}×${packRes} scale!`);
};

// ---------- editor ----------
let cv,ctx,gridCv,gridCtx;
function drawGridOverlay(){
  if(!gridCv||!cv) return;
  const w=cv.width,h=cv.height;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const rect=cv.getBoundingClientRect();
  const rw=Math.max(64,Math.round(rect.width*dpr)),rh=Math.max(64,Math.round(rect.height*dpr));
  gridCv.width=rw;gridCv.height=rh;
  gridCtx.clearRect(0,0,rw,rh);
  if(!showGrid||w>64||h>64) return;
  gridCtx.strokeStyle='rgba(128,128,128,0.28)';gridCtx.lineWidth=1;
  for(let i=1;i<w;i++){const x=Math.round(i*rw/w)+0.5;gridCtx.beginPath();gridCtx.moveTo(x,0);gridCtx.lineTo(x,rh);gridCtx.stroke();}
  for(let j=1;j<h;j++){const y=Math.round(j*rh/h)+0.5;gridCtx.beginPath();gridCtx.moveTo(0,y);gridCtx.lineTo(rw,y);gridCtx.stroke();}
}
function resizeCurrentCanvas(nw,nh,useSourceIfAvail){
  if(!cur||!cv) return;
  pushUndo();
  if(useSourceIfAvail && sources[cur]){
    cv.width=nw;cv.height=nh;cv.style.aspectRatio=nw+'/'+nh;
    ctx.imageSmoothingEnabled=false;
    const out=convertImageToCanvas(sources[cur],nw,nh,cur,upCfg);
    ctx.clearRect(0,0,nw,nh);ctx.drawImage(out,0,0);
  } else {
    const tmp=document.createElement('canvas');tmp.width=cv.width;tmp.height=cv.height;
    tmp.getContext('2d').drawImage(cv,0,0);
    cv.width=nw;cv.height=nh;cv.style.aspectRatio=nw+'/'+nh;
    ctx.imageSmoothingEnabled=upCfg.scale==='smooth';
    ctx.clearRect(0,0,nw,nh);ctx.drawImage(tmp,0,0,nw,nh);
    ctx.imageSmoothingEnabled=false;
  }
  const szLbl=$('#edsz'); if(szLbl) szLbl.textContent=nw+'×'+nh;
  const resSel=$('#texres'); if(resSel) resSel.value=String(nw);
  drawGridOverlay();commit();
}
function applyUploadedImage(im,recordUndo=true){
  if(!cur||!cv) return;
  sources[cur]=im;
  if(recordUndo) pushUndo();
  const out=convertImageToCanvas(im,cv.width,cv.height,cur,upCfg);
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(out,0,0);
  commit();
  const info=$('#upinfo');
  if(info) info.textContent=`Converted ${im.width}×${im.height} → ${cv.width}×${cv.height}`;
}
function handleImageFile(file){
  if(!file||!file.type.startsWith('image/')) return;
  const url=URL.createObjectURL(file);
  const im=new Image();
  im.onload=()=>{URL.revokeObjectURL(url);applyUploadedImage(im,true);toast(`Converted image to ${cv.width}×${cv.height}`);};
  im.onerror=()=>{URL.revokeObjectURL(url);toast('Could not read that image file.');};
  im.src=url;
}

function select(path,baseW,baseH,w,h){
  saveCur();cur=path;curBaseW=baseW||16;curBaseH=baseH||baseW||16;
  const [tw,th]=w&&h?[w,h]:targetSize(curBaseW,curBaseH);
  const ed=$('#ed');ed.innerHTML='';

  // Header row with per-texture resolution override
  const hdr=el('div','bar');hdr.style.marginBottom='8px';
  const title=el('div');title.innerHTML=`<b>${path}.png</b> <span class="badge hi" id="edsz">${tw}×${th}</span>`;
  const resSel=el('select');resSel.id='texres';resSel.title='Change resolution of this texture';
  [...new Set([16,32,64,128,256,tw])].sort((a,b)=>a-b).forEach(sz=>{
    const o=el('option',null,sz+'×'+Math.max(1,Math.round(sz*(curBaseH/curBaseW))));o.value=sz;resSel.append(o);
  });
  resSel.value=String(tw);
  resSel.onchange=()=>{const sz=+resSel.value;resizeCurrentCanvas(sz,Math.max(1,Math.round(sz*(curBaseH/curBaseW))),true);toast(`Resized ${path} to ${cv.width}×${cv.height}`);};
  const dlOne=el('button','btn alt sm','Save PNG');
  dlOne.onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=path.split('/').pop()+'.png';a.click();};
  hdr.append(title,el('label',null,'Size '),resSel,dlOne);
  hdr.querySelector('label').append(resSel);
  ed.append(hdr);

  // Tools bar
  const tools=el('div','bar');tools.style.marginBottom='6px';
  [['pencil','Pencil'],['eraser','Eraser'],['magicerase','Magic Erase'],['line','Line'],['rect','Rect'],['circle','Circle'],['fill','Fill'],['pick','Pick']].forEach(t=>{
    const b=el('button','btn alt sm',t[1]);b.dataset.tool=t[0];b.onclick=()=>{tool=t[0];mark();};tools.append(b);
  });
  const ci=el('input');ci.type='color';ci.value=color;ci.id='tcolor';ci.oninput=()=>{color=ci.value;addRecentColor(color);renderRecent();};
  const bsz=el('select');bsz.title='Brush / Eraser size';[1,2,3,4,6,8].forEach(n=>{const o=el('option',null,n+'px');o.value=n;bsz.append(o);});bsz.value=String(brush);bsz.onchange=()=>brush=+bsz.value;
  const alLab=el('label',null,'Opacity ');const alIn=el('input');alIn.type='range';alIn.min='0.1';alIn.max='1';alIn.step='0.05';alIn.value=String(alpha);alIn.style.width='68px';alIn.oninput=()=>alpha=+alIn.value;alLab.append(alIn);
  const un=el('button','btn alt sm','Undo');un.title='Ctrl+Z';un.onclick=doUndo;
  const rd=el('button','btn alt sm','Redo');rd.title='Ctrl+Y';rd.onclick=doRedo;
  const cl=el('button','btn alt sm','Clear');cl.onclick=()=>{pushUndo();ctx.clearRect(0,0,cv.width,cv.height);delete sources[cur];commit();};
  tools.append(ci,bsz,alLab,un,rd,cl);ed.append(tools);

  // Secondary options bar (Mirror, Grid, Transforms)
  const optsBar=el('div','bar');optsBar.style.marginBottom='8px';
  const mkChk=(txt,val,fn)=>{const l=el('label');const c=el('input');c.type='checkbox';c.checked=val;c.onchange=()=>fn(c.checked);l.append(c,' '+txt);return l;};
  optsBar.append(
    mkChk('Mirror X',mirrorX,v=>mirrorX=v),
    mkChk('Mirror Y',mirrorY,v=>mirrorY=v),
    mkChk('Grid',showGrid,v=>{showGrid=v;drawGridOverlay();})
  );
  const fh=el('button','btn alt sm','Flip H');fh.onclick=()=>transformCanvas('fh');
  const fv=el('button','btn alt sm','Flip V');fv.onclick=()=>transformCanvas('fv');
  const rot=el('button','btn alt sm','Rot 90°');rot.onclick=()=>transformCanvas('rot');
  optsBar.append(fh,fv,rot);
  ed.append(optsBar);

  // Palette + Recent colors
  const pal=el('div','pal');
  const basePal=['#000000','#ffffff','#8b8b8b','#3f3f3f','#c0392b','#e67e22','#f1c40f','#27ae60','#16a085','#2980b9','#8e44ad','#e84393','#8b5a2b','#c29b61','#00e5ff','#ffd700','#5c9e31','#3b5998'];
  basePal.forEach(c=>{const b=el('button');b.style.background=c;b.onclick=()=>{color=c;$('#tcolor').value=c;addRecentColor(c);renderRecent();};pal.append(b);});
  const recWrap=el('span');recWrap.id='trecent';recWrap.style.cssText='display:inline-flex;gap:4px;margin-left:8px;padding-left:8px;border-left:1px solid var(--line)';
  pal.append(recWrap);
  ed.append(pal);
  function renderRecent(){
    const rw=$('#trecent');if(!rw)return;rw.innerHTML='';
    recentColors.forEach(c=>{const b=el('button');b.style.background=c;b.title='Recent: '+c;b.onclick=()=>{color=c;$('#tcolor').value=c;};rw.append(b);});
  }
  renderRecent();

  // Seamless Tiling & Quick Effects bar
  const fxDet=el('details');fxDet.style.marginBottom='10px';
  fxDet.innerHTML=`<summary style="padding:7px 12px;font-size:.82rem">Seamless tiling &amp; texture effects</summary><div class="bar" style="padding:8px 12px;margin:0">
    <span class="small">Wrap nudge:</span>
    <button class="btn alt sm" data-nudge="-1,0">←</button>
    <button class="btn alt sm" data-nudge="1,0">→</button>
    <button class="btn alt sm" data-nudge="0,-1">↑</button>
    <button class="btn alt sm" data-nudge="0,1">↓</button>
    <button class="btn alt sm" data-nudge="half" title="Shift by half width & height to check & paint over tiling seams">½ Shift</button>
    <span class="small" style="margin-left:6px">Effects:</span>
    <button class="btn alt sm" data-fx="bright">Brighter</button>
    <button class="btn alt sm" data-fx="dark">Darker</button>
    <button class="btn alt sm" data-fx="contrast">Contrast+</button>
    <button class="btn alt sm" data-fx="noise" title="Add subtle Minecraft-style pixel grain">Pixel noise</button>
    <button class="btn alt sm" data-fx="gray">Grayscale</button>
    <button class="btn alt sm" data-fx="invert">Invert</button>
  </div>`;
  fxDet.querySelectorAll('[data-nudge]').forEach(b=>{
    b.onclick=()=>{
      if(!cv)return;pushUndo();
      const w=cv.width,h=cv.height;
      const [dx,dy]=b.dataset.nudge==='half'?[Math.floor(w/2),Math.floor(h/2)]:b.dataset.nudge.split(',').map(Number);
      const src=ctx.getImageData(0,0,w,h),dst=ctx.createImageData(w,h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const nx=((x+dx)%w+w)%w,ny=((y+dy)%h+h)%h,si=(y*w+x)*4,di=(ny*w+nx)*4;
        dst.data[di]=src.data[si];dst.data[di+1]=src.data[si+1];dst.data[di+2]=src.data[si+2];dst.data[di+3]=src.data[si+3];
      }
      ctx.putImageData(dst,0,0);commit();
    };
  });
  fxDet.querySelectorAll('[data-fx]').forEach(b=>{
    b.onclick=()=>{
      if(!cv)return;pushUndo();
      const w=cv.width,h=cv.height,img=ctx.getImageData(0,0,w,h),d=img.data,fx=b.dataset.fx;
      const cl=v=>Math.max(0,Math.min(255,Math.round(v)));
      for(let i=0;i<d.length;i+=4){
        if(d[i+3]===0) continue;
        let r=d[i],g=d[i+1],bl=d[i+2];
        if(fx==='bright'){r=cl(r*1.12+8);g=cl(g*1.12+8);bl=cl(bl*1.12+8);}
        else if(fx==='dark'){r=cl(r*0.86);g=cl(g*0.86);bl=cl(bl*0.86);}
        else if(fx==='contrast'){r=cl((r-128)*1.2+128);g=cl((g-128)*1.2+128);bl=cl((bl-128)*1.2+128);}
        else if(fx==='noise'){const n=(Math.random()-0.5)*22;r=cl(r+n);g=cl(g+n);bl=cl(bl+n);}
        else if(fx==='gray'){const l=cl(r*0.299+g*0.587+bl*0.114);r=g=bl=l;}
        else if(fx==='invert'){r=255-r;g=255-g;bl=255-bl;}
        d[i]=r;d[i+1]=g;d[i+2]=bl;
      }
      ctx.putImageData(img,0,0);commit();
    };
  });
  ed.append(fxDet);

  // Editor grid: Canvas + Live Preview sidebar
  const grid=el('div','ed-grid');
  const left=el('div');
  const stage=el('div','canvas-stage');
  cv=el('canvas');cv.id='draw';cv.width=tw;cv.height=th;cv.style.aspectRatio=tw+'/'+th;
  ctx=cv.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
  gridCv=el('canvas');gridCv.id='gridov';gridCtx=gridCv.getContext('2d');
  stage.append(cv,gridCv);
  left.append(stage);

  // Image Uploader Dropzone + Converter Options (placed prominently right above the canvas!)
  const dz=el('div','dropzone');
  dz.style.marginTop='0';dz.style.marginBottom='10px';
  dz.innerHTML=`<strong>Upload Image &amp; Auto-Convert to ${tw}×${th} (Drop, Click, or Ctrl+V)</strong><span class="small" id="upinfo">Shrinks any photo or PNG to ${tw}×${th}. Use <b>Eraser</b> or <b>Magic Erase</b> below to delete pixels you don't want.</span>`;
  const upIn=el('input');upIn.type='file';upIn.accept='image/*';upIn.hidden=true;
  dz.onclick=()=>upIn.click();
  dz.ondragover=e=>{e.preventDefault();dz.classList.add('drag');};
  dz.ondragleave=()=>dz.classList.remove('drag');
  dz.ondrop=e=>{e.preventDefault();dz.classList.remove('drag');if(e.dataTransfer.files[0])handleImageFile(e.dataTransfer.files[0]);};
  upIn.onchange=()=>{if(upIn.files[0])handleImageFile(upIn.files[0]);upIn.value='';};
  left.prepend(dz,upIn);

  const uo=el('div','up-opts');
  uo.innerHTML=`
    <label>Fit mode
      <select id="upFit">
        <option value="auto">Auto (${isBlockPath(path)?'Cover':'Contain'})</option>
        <option value="cover">Cover (fill &amp; crop)</option>
        <option value="contain">Contain (fit whole)</option>
        <option value="stretch">Stretch</option>
      </select>
    </label>
    <label>Downscale quality
      <select id="upScale">
        <option value="smooth">Smooth (crisp stepped)</option>
        <option value="nearest">Pixelated (nearest)</option>
      </select>
    </label>
    <label>Color palette
      <select id="upCol">
        <option value="0">Full color</option>
        <option value="64">64 colors</option>
        <option value="32">32 colors</option>
        <option value="16">16 colors (retro)</option>
        <option value="8">8 colors</option>
      </select>
    </label>
    <label class="chk"><input type="checkbox" id="upDith"> Pixel dithering</label>
    <label class="chk"><input type="checkbox" id="upRmBg"> Remove background</label>
    <label>BG tolerance <input type="range" id="upTol" min="8" max="110" value="${upCfg.bgTol}"></label>
  `;
  left.append(uo);
  $('#upFit',uo).value=upCfg.fit;
  $('#upScale',uo).value=upCfg.scale;
  $('#upCol',uo).value=String(upCfg.colors);
  $('#upDith',uo).checked=upCfg.dither;
  $('#upRmBg',uo).checked=upCfg.rmBg;
  const reprocess=()=>{
    upCfg.fit=$('#upFit',uo).value;
    upCfg.scale=$('#upScale',uo).value;
    upCfg.colors=+$('#upCol',uo).value;
    upCfg.dither=$('#upDith',uo).checked;
    upCfg.rmBg=$('#upRmBg',uo).checked;
    upCfg.bgTol=+$('#upTol',uo).value;
    if(sources[cur]) applyUploadedImage(sources[cur],false);
  };
  uo.querySelectorAll('select,input').forEach(inp=>{inp.oninput=reprocess;inp.onchange=reprocess;});

  // Right sidebar: 3D Block Preview + 3x3 Tiled + BG toggle
  const right=el('div','prev-box');
  right.innerHTML=`<div class="bar" style="margin:0;width:100%;justify-content:space-between"><span class="small"><b>Live preview</b></span><select id="pbg" style="font-size:.74rem;padding:2px 5px"><option value="check">Check</option><option value="dark">Dark</option><option value="light">Light</option></select></div>
    <canvas id="t3d" width="160" height="160" title="Isometric 3D preview"></canvas>
    <div class="small">3×3 Tiled</div>
    <canvas id="tprev"></canvas>
    <div class="small" style="text-align:center">Shortcuts: <b>Alt+Click</b> pick · <b>Ctrl+Z/Y</b> undo/redo · <b>Ctrl+V</b> paste image</div>`;
  $('#pbg',right).onchange=e=>{
    const v=e.target.value,bg=v==='dark'?'#18181d':v==='light'?'#f3f3f5':'repeating-conic-gradient(#8883 0 25%,transparent 0 50%) 0 0/8px 8px';
    $('#t3d',right).style.background=bg;$('#tprev',right).style.background=bg;
  };
  grid.append(left,right);
  ed.append(grid);

  if(store[path]){
    const s=store[path];
    if(s.w===tw&&s.h===th) ctx.putImageData(new ImageData(new Uint8ClampedArray(s.data),tw,th),0,0);
    else{
      const tmp=document.createElement('canvas');tmp.width=s.w;tmp.height=s.h;
      tmp.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(s.data),s.w,s.h),0,0);
      ctx.drawImage(tmp,0,0,tw,th);
    }
  }
  undo=[];redo=[];

  // Drawing interaction (with Line / Rect / Circle live preview!)
  let drawing=false,startPt=null,snapBefore=null,lastPt=null;
  const pos=e=>{
    const r=cv.getBoundingClientRect();
    return [Math.max(0,Math.min(cv.width-1,Math.floor((e.clientX-r.left)/r.width*cv.width))),
            Math.max(0,Math.min(cv.height-1,Math.floor((e.clientY-r.top)/r.height*cv.height)))];
  };
  function plotPx(x,y){
    const w=cv.width,h=cv.height,off=Math.floor(brush/2);
    const put=(px,py)=>{
      if(tool==='eraser') ctx.clearRect(px-off,py-off,brush,brush);
      else{ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.fillRect(px-off,py-off,brush,brush);ctx.restore();}
    };
    put(x,y);
    if(mirrorX) put(w-1-x,y);
    if(mirrorY) put(x,h-1-y);
    if(mirrorX&&mirrorY) put(w-1-x,h-1-y);
  }
  function drawLine(x0,y0,x1,y1){
    let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;
    while(true){plotPx(x0,y0);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}
  }
  function drawShape(x0,y0,x1,y1){
    ctx.putImageData(snapBefore,0,0);
    if(tool==='line'){drawLine(x0,y0,x1,y1);}
    else if(tool==='rect'){
      const rx=Math.min(x0,x1),ry=Math.min(y0,y1),rw=Math.abs(x1-x0)+1,rh=Math.abs(y1-y0)+1;
      for(let x=rx;x<rx+rw;x++){plotPx(x,ry);plotPx(x,ry+rh-1);}
      for(let y=ry;y<ry+rh;y++){plotPx(rx,y);plotPx(rx+rw-1,y);}
    } else if(tool==='circle'){
      const cx=(x0+x1)/2,cy=(y0+y1)/2,rx=Math.abs(x1-x0)/2,ry=Math.abs(y1-y0)/2;
      const steps=Math.max(16,Math.ceil(Math.max(rx,ry)*8));
      for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2;plotPx(Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry));}
    }
  }
  cv.onpointerdown=e=>{
    cv.setPointerCapture(e.pointerId);
    const [x,y]=pos(e);
    if(tool==='pick'||e.altKey){
      const d=ctx.getImageData(x,y,1,1).data;
      if(d[3]){color='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');$('#tcolor').value=color;}
      return;
    }
    pushUndo();
    if(tool==='fill'){flood(x,y);commit();return;}
    if(tool==='magicerase'){magicErase(x,y,upCfg.bgTol);commit();return;}
    drawing=true;startPt=[x,y];lastPt=[x,y];
    if(tool==='line'||tool==='rect'||tool==='circle'){snapBefore=ctx.getImageData(0,0,cv.width,cv.height);drawShape(x,y,x,y);}
    else{plotPx(x,y);}
    preview();
  };
  cv.onpointermove=e=>{
    if(!drawing) return;
    const [x,y]=pos(e);
    if(tool==='line'||tool==='rect'||tool==='circle'){drawShape(startPt[0],startPt[1],x,y);}
    else{drawLine(lastPt[0],lastPt[1],x,y);lastPt=[x,y];}
    preview();
  };
  cv.onpointerup=()=>{if(drawing){drawing=false;snapBefore=null;commit();}};

  mark();requestAnimationFrame(drawGridOverlay);preview();drawList();
}

function transformCanvas(mode){
  if(!cv) return;
  pushUndo();
  const w=cv.width,h=cv.height,tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;
  tmp.getContext('2d').drawImage(cv,0,0);
  ctx.save();ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=false;
  if(mode==='fh'){ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(tmp,0,0);}
  else if(mode==='fv'){ctx.translate(0,h);ctx.scale(1,-1);ctx.drawImage(tmp,0,0);}
  else if(mode==='rot'){ctx.translate(w/2,h/2);ctx.rotate(Math.PI/2);ctx.drawImage(tmp,-w/2,-h/2,w,h);}
  ctx.restore();commit();
}
function addRecentColor(c){if(!recentColors.includes(c)){recentColors.unshift(c);if(recentColors.length>8)recentColors.pop();}}
function mark(){root.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.dataset.tool===tool));}
function pushUndo(){if(!cv)return;undo.push({w:cv.width,h:cv.height,img:ctx.getImageData(0,0,cv.width,cv.height)});if(undo.length>60)undo.shift();redo=[];}
function doUndo(){const u=undo.pop();if(!u||!cv)return;redo.push({w:cv.width,h:cv.height,img:ctx.getImageData(0,0,cv.width,cv.height)});cv.width=u.w;cv.height=u.h;ctx.putImageData(u.img,0,0);drawGridOverlay();commit();}
function doRedo(){const r=redo.pop();if(!r||!cv)return;undo.push({w:cv.width,h:cv.height,img:ctx.getImageData(0,0,cv.width,cv.height)});cv.width=r.w;cv.height=r.h;ctx.putImageData(r.img,0,0);drawGridOverlay();commit();}
function flood(x,y){
  const w=cv.width,h=cv.height,img=ctx.getImageData(0,0,w,h),d=img.data;
  const i0=(y*w+x)*4;const tgt=[d[i0],d[i0+1],d[i0+2],d[i0+3]];
  const c=parseInt(color.slice(1),16);const nc=[c>>16&255,c>>8&255,c&255,255];
  if(tgt.every((v,i)=>v===nc[i])) return;
  const st=[[x,y]];const m=i=>d[i]===tgt[0]&&d[i+1]===tgt[1]&&d[i+2]===tgt[2]&&d[i+3]===tgt[3];
  while(st.length){const [px,py]=st.pop();if(px<0||py<0||px>=w||py>=h)continue;const i=(py*w+px)*4;if(!m(i))continue;d[i]=nc[0];d[i+1]=nc[1];d[i+2]=nc[2];d[i+3]=255;st.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);}
  ctx.putImageData(img,0,0);
}
function magicErase(x,y,tol){
  const w=cv.width,h=cv.height,img=ctx.getImageData(0,0,w,h),d=img.data;
  const i0=(y*w+x)*4; if(d[i0+3]===0) return;
  const br=d[i0],bg=d[i0+1],bb=d[i0+2],tolSq=(tol||32)*(tol||32)*3;
  const vis=new Uint8Array(w*h),st=[[x,y]];
  while(st.length){
    const [px,py]=st.pop();
    if(px<0||py<0||px>=w||py>=h) continue;
    const idx=py*w+px; if(vis[idx]) continue;
    const i=idx*4; if(d[i+3]===0){vis[idx]=1;continue;}
    const dr=d[i]-br,dg=d[i+1]-bg,db=d[i+2]-bb;
    if(dr*dr+dg*dg+db*db<=tolSq){vis[idx]=1;d[i+3]=0;st.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);}
  }
  ctx.putImageData(img,0,0);
}
function preview(){
  const pc=$('#tprev'),c3=$('#t3d');if(!cv)return;
  const w=cv.width,h=cv.height;
  if(pc){
    const tileSz=Math.min(54,Math.max(24,Math.floor(162/3)));
    pc.width=tileSz*3;pc.height=tileSz*3;
    const c=pc.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,pc.width,pc.height);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)c.drawImage(cv,i*tileSz,j*tileSz,tileSz,tileSz);
  }
  if(c3){
    const x=c3.getContext('2d');x.clearRect(0,0,160,160);x.imageSmoothingEnabled=false;
    if(cur&&isBlockPath(cur)){
      // Isometric 3D cube projection of the block texture
      const s=56,cx=80,cy=44,dx=s*0.866,dy=s*0.5;
      // Top face
      x.save();x.setTransform(dx/w,dy/w,-dx/h,dy/h,cx,cy-dy);x.drawImage(cv,0,0);x.fillStyle='rgba(255,255,255,0.08)';x.fillRect(0,0,w,h);x.restore();
      // Left face
      x.save();x.setTransform(dx/w,dy/w,0,s/h,cx-dx,cy);x.drawImage(cv,0,0);x.fillStyle='rgba(0,0,0,0.18)';x.fillRect(0,0,w,h);x.restore();
      // Right face
      x.save();x.setTransform(dx/w,-dy/w,0,s/h,cx,cy+dy);x.drawImage(cv,0,0);x.fillStyle='rgba(0,0,0,0.34)';x.fillRect(0,0,w,h);x.restore();
    } else {
      // Crisp large item preview with subtle drop shadow
      x.save();x.shadowColor='rgba(0,0,0,0.35)';x.shadowBlur=10;x.shadowOffsetY=6;
      const k=Math.min(128/w,128/h);
      x.drawImage(cv,(160-w*k)/2,(160-h*k)/2,w*k,h*k);
      x.restore();
    }
  }
}
function empty(d){for(let i=3;i<d.length;i+=4)if(d[i])return false;return true;}
function saveCur(){if(!cur||!cv)return;const w=cv.width,h=cv.height,d=ctx.getImageData(0,0,w,h).data;if(empty(d)){delete store[cur];}else store[cur]={w,h,data:new Uint8ClampedArray(d)};}
function commit(){saveCur();preview();drawChips();drawList();saveLocal();}
function drawChips(){
  const box=$('#chips');box.innerHTML='';const keys=Object.keys(store);
  $('#count').textContent=keys.length?`${keys.length} texture${keys.length>1?'s':''} in pack`:'nothing changed yet';
  keys.forEach(p=>{
    const c=el('span','chip');const im=new Image();im.width=18;im.height=18;im.style.imageRendering='pixelated';im.src=thumb(p);
    const x=el('b',null,'×');x.title='Remove';
    x.onclick=()=>{delete store[p];delete sources[p];if(cur===p&&cv){ctx.clearRect(0,0,cv.width,cv.height);preview();}drawChips();drawList();saveLocal();};
    const nm=el('span',null,`${p.split('/').pop()} (${store[p].w}×${store[p].h})`);nm.style.cursor='pointer';
    nm.onclick=()=>{const m=texMeta(p);select(p,m.baseW,m.baseH,store[p].w,store[p].h);};
    c.append(im,nm,x);box.append(c);
  });
}

// Keyboard shortcuts when Texture tab is active
window.addEventListener('keydown',e=>{
  if(!root.classList.contains('on')||!cv) return;
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')) return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();doRedo();}
});
window.addEventListener('paste',e=>{
  if(!root.classList.contains('on')||!cv) return;
  const items=e.clipboardData&&e.clipboardData.items;if(!items) return;
  for(const it of items){if(it.type&&it.type.startsWith('image/')){e.preventDefault();handleImageFile(it.getAsFile());break;}}
});

// Batch upload multiple images & auto-convert to pack resolution
$('#tpbatch').onclick=()=>$('#tpbatchIn').click();
$('#tpbatchIn').onchange=async e=>{
  const files=[...e.target.files]; e.target.value='';
  if(!files.length) return;
  let added=0,lastPath=null;
  for(const f of files){
    const base=f.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9_\/-]+/g,'_');
    const match=TEX_LIST.find(t=>t[0]===base||t[0].split('/').pop()===base);
    const path=match?match[0]:'block/'+base;
    const m=texMeta(path);
    const [tw,th]=targetSize(m.baseW,m.baseH);
    const url=URL.createObjectURL(f);
    await new Promise(res=>{
      const im=new Image();
      im.onload=()=>{
        URL.revokeObjectURL(url);
        sources[path]=im;
        const out=convertImageToCanvas(im,tw,th,path,upCfg);
        const d=out.getContext('2d').getImageData(0,0,tw,th).data;
        store[path]={w:tw,h:th,data:new Uint8ClampedArray(d)};
        added++;lastPath=path;res();
      };
      im.onerror=()=>{URL.revokeObjectURL(url);res();};
      im.src=url;
    });
  }
  drawChips();drawList();saveLocal();
  if(lastPath){const m=texMeta(lastPath);select(lastPath,m.baseW,m.baseH,store[lastPath].w,store[lastPath].h);}
  toast(`Converted ${added} image${added===1?'':'s'} to ${packRes}×${packRes} pack size!`);
};

// Import existing .zip resource pack
$('#tpimport').onclick=()=>$('#tpimportIn').click();
$('#tpimportIn').onchange=async e=>{
  const f=e.target.files[0]; e.target.value=''; if(!f) return;
  try{
    const files=await SOL.unzip(await f.arrayBuffer());
    let imported=0,lastPath=null;
    if(files['pack.mcmeta']){
      try{const meta=JSON.parse(new TextDecoder().decode(files['pack.mcmeta']));if(meta.pack&&meta.pack.description)$('#tpdesc').value=String(meta.pack.description);}catch(_){}
    }
    for(const name in files){
      const m=/^assets\/minecraft\/textures\/(.+)\.png$/i.exec(name);
      if(!m) continue;
      const path=m[1];
      const blob=new Blob([files[name]],{type:'image/png'});
      const url=URL.createObjectURL(blob);
      await new Promise(res=>{
        const im=new Image();
        im.onload=()=>{
          URL.revokeObjectURL(url);
          const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
          const x=c.getContext('2d');x.drawImage(im,0,0);
          store[path]={w:im.width,h:im.height,data:new Uint8ClampedArray(x.getImageData(0,0,im.width,im.height).data)};
          imported++;lastPath=path;res();
        };
        im.onerror=()=>{URL.revokeObjectURL(url);res();};
        im.src=url;
      });
    }
    if(imported){
      $('#tpname').value=f.name.replace(/\.zip$/i,'');
      drawChips();drawList();saveLocal();
      const m=texMeta(lastPath);select(lastPath,m.baseW,m.baseH,store[lastPath].w,store[lastPath].h);
      toast(`Imported ${imported} texture${imported===1?'':'s'} from ${f.name}`);
    } else toast('No Minecraft PNG textures found in that ZIP.');
  }catch(err){toast('Import failed: '+err.message);}
};

$('#cadd').onclick=()=>{
  let p=$('#cpath').value.trim().replace(/\.png$/,'').replace(/^\/+/,'').replace(/^assets\/minecraft\/textures\//,'');
  if(!p) return;
  const s=+$('#csize').value||packRes;
  select(p,16,16,s,s);
};
$('#tpquick').querySelectorAll('[data-q]').forEach(b=>{
  b.onclick=()=>{
    const p=b.dataset.q,m=texMeta(p),[tw,th]=store[p]?[store[p].w,store[p].h]:targetSize(m.baseW,m.baseH);
    select(p,m.baseW,m.baseH,tw,th);
  };
});
$('#tpclear').onclick=()=>{
  if(!Object.keys(store).length) return;
  for(const k in store) delete store[k];
  for(const k in sources) delete sources[k];
  if(cv){ctx.clearRect(0,0,cv.width,cv.height);preview();}
  try{localStorage.removeItem(STORAGE_KEY);}catch(_){}
  drawChips();drawList();toast('Cleared all textures from pack.');
};
$('#tpicon').onchange=e=>{const f=e.target.files[0];if(!f){iconImg=null;return;}const im=new Image();im.onload=()=>{iconImg=im;};im.src=URL.createObjectURL(f);};
function blobOf(c){return new Promise(r=>c.toBlob(b=>b.arrayBuffer().then(a=>r(new Uint8Array(a))),'image/png'));}
$('#tpdl').onclick=async()=>{
  saveCur();const keys=Object.keys(store);
  if(!keys.length){toast('Draw or upload at least one texture first.');return;}
  const files={};const fmt=+sel.value;const name=$('#tpname').value.trim()||'My Texture Pack';
  for(const p of keys){
    const s=store[p];const c=document.createElement('canvas');c.width=s.w;c.height=s.h;
    c.getContext('2d').putImageData(new ImageData(s.data,s.w,s.h),0,0);
    files['assets/minecraft/textures/'+p+'.png']=await blobOf(c);
  }
  const pack=fmt>=65?{description:$('#tpdesc').value,min_format:fmt,max_format:Math.max(fmt,97)}:{description:$('#tpdesc').value,pack_format:fmt};
  files['pack.mcmeta']=JSON.stringify({pack},null,2);
  const ic=document.createElement('canvas');ic.width=ic.height=64;const x=ic.getContext('2d');x.imageSmoothingEnabled=false;
  if(iconImg) x.drawImage(iconImg,0,0,64,64);
  else{
    const s=store[keys[0]];const t=document.createElement('canvas');t.width=s.w;t.height=s.h;
    t.getContext('2d').putImageData(new ImageData(s.data,s.w,s.h),0,0);
    x.fillStyle='#2b2b31';x.fillRect(0,0,64,64);
    const k=Math.min(56/s.w,56/s.h);x.drawImage(t,32-s.w*k/2,32-s.h*k/2,s.w*k,s.h*k);
  }
  files['pack.png']=await blobOf(ic);
  const a=document.createElement('a');a.href=URL.createObjectURL(SOL.zip(files));
  a.download=name.replace(/[^\w\- ]+/g,'').replace(/\s+/g,'_')+'.zip';
  document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
  toast(`Downloaded ${a.download} (${keys.length} texture${keys.length>1?'s':''})`);
};

loadLocal();
drawList();drawChips();
// Auto-open Totem of Undying so the image uploader, resolution selector & eraser are immediately ready!
const initM=texMeta('item/totem_of_undying'),[initW,initH]=targetSize(initM.baseW,initM.baseH);
select('item/totem_of_undying',initM.baseW,initM.baseH,initW,initH);
};
