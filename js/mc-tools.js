// Solstice Minecraft Tools — Circle/Sphere Builder, Banner Designer, RGB Text/MOTD, Nether Calc & Max Gear Planner
window.initMcTools=function(root){
  const $=(s,r=root)=>r.querySelector(s);
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;};
  const toast=m=>window.SOL_TOAST&&window.SOL_TOAST(m);
  const copy=txt=>{
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast('Copied to clipboard!')).catch(()=>prompt('Copy:',txt));
    else prompt('Copy:',txt);
  };
  const fmtStacks=n=>{const st=Math.floor(n/64),rem=n%64;return st?`${st} stack${st>1?'s':''}${rem?' + '+rem:''}`:`${n} blocks`;};

  root.innerHTML=`
    <p class="note">Handy Minecraft Java Edition utilities — build blueprints, custom banners, RGB gradient commands, Nether portal coordinates, and maxed-out gear.</p>
    <div class="mc-subnav" id="mcnav">
      <button data-sub="circle" class="on">Circle &amp; Sphere Builder</button>
      <button data-sub="banner">Banner Designer</button>
      <button data-sub="text">RGB Text &amp; MOTD</button>
      <button data-sub="nether">Nether &amp; Chunk Calc</button>
      <button data-sub="gear">Max Gear Planner</button>
    </div>
    <div id="mcstage"></div>`;

  const stage=$('#mcstage');
  let active='circle';
  $('#mcnav').querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{
      active=b.dataset.sub;
      $('#mcnav').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      renderSub();
    };
  });

  function renderSub(){
    stage.innerHTML='';
    if(active==='circle') renderCircle();
    else if(active==='banner') renderBanner();
    else if(active==='text') renderTextGen();
    else if(active==='nether') renderNether();
    else if(active==='gear') renderGear();
  }

  // ==================== 1. CIRCLE, DOME & SPHERE BUILDER ====================
  function renderCircle(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Blueprint Controls</h3>
        <div class="bar">
          <label>Shape <select id="bpShape"><option value="circle">Hollow Circle</option><option value="disc">Filled Disc</option><option value="dome">3D Dome (Layer Slice)</option><option value="sphere">3D Sphere (Layer Slice)</option></select></label>
        </div>
        <div class="bar">
          <label style="flex:1">Diameter: <b id="bpDiaV">19</b> blocks <input id="bpDia" type="range" min="5" max="63" value="19" style="flex:1"></label>
        </div>
        <div class="bar" id="bpLayerRow" hidden>
          <label style="flex:1">Y Layer: <b id="bpLayV">1</b> <input id="bpLay" type="range" min="1" max="19" value="1" style="flex:1"></label>
        </div>
        <div class="bar">
          <label><input type="checkbox" id="bpCenter" checked> Show center crosshair</label>
          <button class="btn alt sm" id="bpPng">Download Blueprint PNG</button>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><small>Layer blocks</small><strong id="bpLayerCnt">0</strong></div>
          <div class="stat-card"><small>Layer stacks</small><strong id="bpLayerSt">0</strong></div>
          <div class="stat-card"><small>Total build blocks</small><strong id="bpTotCnt">0</strong></div>
          <div class="stat-card"><small>Total stacks</small><strong id="bpTotSt">0</strong></div>
        </div>
        <div class="small">Tip: Odd diameters (15, 19, 25) have a single center block; even diameters have a 2×2 center.</div>
      </div>
      <div class="panel" style="text-align:center">
        <canvas class="bp-canvas" id="bpCv" width="520" height="520"></canvas>
      </div>
    </div>`;

    const cv=$('#bpCv'),ctx=cv.getContext('2d');
    const shapeSel=$('#bpShape'),diaIn=$('#bpDia'),layIn=$('#bpLay'),layRow=$('#bpLayerRow'),chkC=$('#bpCenter');

    function voxelOn(shape,d,x,y,z){
      const r=d/2,cx=x+0.5-r,cz=z+0.5-r;
      if(shape==='circle'||shape==='disc'){
        const dist=Math.hypot(cx,cz);
        if(shape==='disc') return dist<=r;
        return dist<=r && dist>=r-1.08;
      }
      const cy=shape==='dome'?(y+0.5):(y+0.5-r);
      const dist=Math.hypot(cx,cy,cz);
      return dist<=r && dist>=r-1.08;
    }

    function draw(){
      const sh=shapeSel.value,d=+diaIn.value;
      $('#bpDiaV').textContent=d;
      const is3d=sh==='dome'||sh==='sphere';
      layRow.hidden=!is3d;
      const maxY=sh==='dome'?Math.ceil(d/2):d;
      layIn.max=maxY;
      if(+layIn.value>maxY) layIn.value=maxY;
      const curY=+layIn.value-1;
      $('#bpLayV').textContent=`${curY+1} / ${maxY}`;

      const W=cv.width,pad=16,cell=(W-pad*2)/d;
      ctx.fillStyle='#050c1f';ctx.fillRect(0,0,W,W);

      let layerCnt=0,totalCnt=0;
      // Ghost previous layer for 3D shapes
      for(let z=0;z<d;z++)for(let x=0;x<d;x++){
        const on=voxelOn(sh,d,x,curY,z);
        const prevOn=is3d&&curY>0&&voxelOn(sh,d,x,curY-1,z);
        const px=pad+x*cell,py=pad+z*cell;
        if(on){
          layerCnt++;
          ctx.fillStyle='#7dd3fc';
          ctx.fillRect(px+0.8,py+0.8,Math.max(1,cell-1.6),Math.max(1,cell-1.6));
        }else if(prevOn){
          ctx.fillStyle='rgba(141,156,196,0.22)';
          ctx.fillRect(px+1,py+1,Math.max(1,cell-2),Math.max(1,cell-2));
        }
        if(d<=45){
          ctx.strokeStyle='#16254d';ctx.lineWidth=1;
          ctx.strokeRect(px,py,cell,cell);
        }
      }
      if(chkC.checked){
        ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(W/2,pad);ctx.lineTo(W/2,W-pad);ctx.moveTo(pad,W/2);ctx.lineTo(W-pad,W/2);ctx.stroke();
      }
      if(is3d){
        for(let y=0;y<maxY;y++)for(let z=0;z<d;z++)for(let x=0;x<d;x++)if(voxelOn(sh,d,x,y,z))totalCnt++;
      }else totalCnt=layerCnt;

      $('#bpLayerCnt').textContent=layerCnt;
      $('#bpLayerSt').textContent=fmtStacks(layerCnt);
      $('#bpTotCnt').textContent=totalCnt;
      $('#bpTotSt').textContent=fmtStacks(totalCnt);
    }
    [shapeSel,diaIn,layIn,chkC].forEach(x=>{x.oninput=draw;x.onchange=draw;});
    $('#bpPng').onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=`solstice_${shapeSel.value}_${diaIn.value}.png`;a.click();toast('Saved blueprint PNG!');};
    draw();
  }

  // ==================== 2. BANNER DESIGNER ====================
  const DYES=[
    ['white','White','#f9fffe'],['light_gray','Light Gray','#9d9d97'],['gray','Gray','#474f52'],['black','Black','#1d1d21'],
    ['brown','Brown','#835432'],['red','Red','#b02e26'],['orange','Orange','#f9801d'],['yellow','Yellow','#fed83d'],
    ['lime','Lime','#80c71f'],['green','Green','#5e7c16'],['cyan','Cyan','#169c9c'],['light_blue','Light Blue','#3ab3da'],
    ['blue','Blue','#3c44aa'],['purple','Purple','#8932b8'],['magenta','Magenta','#c74ebd'],['pink','Pink','#f38baa']
  ];
  const PATTERNS=[
    ['stripe_bottom','Bottom Stripe'],['stripe_top','Top Stripe'],['stripe_left','Left Stripe'],['stripe_right','Right Stripe'],
    ['stripe_center','Center Pillar'],['stripe_middle','Middle Band'],['stripe_downright','Diagonal ↘'],['stripe_downleft','Diagonal ↙'],
    ['cross','Cross +'],['straight_cross','Straight Cross'],['triangle_bottom','Bottom Triangle'],['triangle_top','Top Triangle'],
    ['rhombus','Diamond'],['circle','Circle'],['border','Border'],['gradient','Top Gradient'],['gradient_up','Bottom Gradient'],
    ['half_horizontal','Top Half'],['half_vertical','Left Half'],['bricks','Bricks']
  ];
  let bBase='blue',bLayers=[{pattern:'gradient',color:'cyan'},{pattern:'rhombus',color:'white'},{pattern:'border',color:'black'}],bPickCol='white',bPickPat='stripe_center';

  function renderBanner(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Banner Pattern Builder</h3>
        <div class="small">Base banner color</div>
        <div class="dye-row" id="bBaseRow"></div>
        <div class="bar" style="margin-top:10px">
          <label>Pattern <select id="bPatSel">${PATTERNS.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
          <button class="btn brand sm" id="bAdd">+ Add layer</button>
          <button class="btn alt sm" id="bRand">Randomize</button>
          <button class="btn alt sm" id="bClr">Clear layers</button>
        </div>
        <div class="small">Pattern dye color</div>
        <div class="dye-row" id="bColRow"></div>
        <div style="margin-top:12px"><b>Layers (bottom → top)</b></div>
        <div id="bList" style="margin-top:6px"></div>
        <div style="margin-top:12px"><b>Java 1.21+ /give Command</b></div>
        <pre class="codebox" id="bCmd"></pre>
        <button class="btn brand sm" id="bCopy">Copy /give Command</button>
      </div>
      <div class="panel" style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <h3>Live Banner Preview</h3>
        <canvas id="bCv" width="220" height="440" style="border:1px solid var(--edge);border-radius:4px;background:#050c1f;image-rendering:pixelated"></canvas>
        <div class="small">Survival crafting supports up to 6 loom layers; <code>/give</code> supports unlimited layers.</div>
      </div>
    </div>`;

    const dyeHex=id=>(DYES.find(d=>d[0]===id)||DYES[0])[2];
    function mkDyes(host,curVal,cb){
      host.innerHTML='';
      DYES.forEach(d=>{
        const b=el('button','dye-btn'+(d[0]===curVal?' on':''));
        b.style.background=d[2];b.title=d[1];
        b.onclick=()=>{cb(d[0]);mkDyes(host,d[0],cb);};
        host.append(b);
      });
    }
    mkDyes($('#bBaseRow'),bBase,v=>{bBase=v;drawBanner();});
    mkDyes($('#bColRow'),bPickCol,v=>{bPickCol=v;});
    $('#bPatSel').value=bPickPat;
    $('#bPatSel').onchange=e=>bPickPat=e.target.value;

    function drawPat(ctx,pat,hex,W,H){
      ctx.save();ctx.fillStyle=hex;
      if(pat==='stripe_bottom') ctx.fillRect(0,H*0.75,W,H*0.25);
      else if(pat==='stripe_top') ctx.fillRect(0,0,W,H*0.25);
      else if(pat==='stripe_left') ctx.fillRect(0,0,W*0.33,H);
      else if(pat==='stripe_right') ctx.fillRect(W*0.67,0,W*0.33,H);
      else if(pat==='stripe_center') ctx.fillRect(W*0.35,0,W*0.30,H);
      else if(pat==='stripe_middle') ctx.fillRect(0,H*0.40,W,H*0.20);
      else if(pat==='half_horizontal') ctx.fillRect(0,0,W,H*0.5);
      else if(pat==='half_vertical') ctx.fillRect(0,0,W*0.5,H);
      else if(pat==='stripe_downright'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.26,0);ctx.lineTo(W,H);ctx.lineTo(W*0.74,H);ctx.closePath();ctx.fill();}
      else if(pat==='stripe_downleft'){ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W*0.74,0);ctx.lineTo(0,H);ctx.lineTo(W*0.26,H);ctx.closePath();ctx.fill();}
      else if(pat==='cross'){
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.24,0);ctx.lineTo(W,H);ctx.lineTo(W*0.76,H);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W*0.76,0);ctx.lineTo(0,H);ctx.lineTo(W*0.24,H);ctx.closePath();ctx.fill();
      }else if(pat==='straight_cross'){ctx.fillRect(W*0.38,0,W*0.24,H);ctx.fillRect(0,H*0.42,W,H*0.16);}
      else if(pat==='triangle_bottom'){ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W/2,H*0.55);ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
      else if(pat==='triangle_top'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W/2,H*0.45);ctx.lineTo(W,0);ctx.closePath();ctx.fill();}
      else if(pat==='rhombus'){ctx.beginPath();ctx.moveTo(W/2,H*0.22);ctx.lineTo(W*0.86,H/2);ctx.lineTo(W/2,H*0.78);ctx.lineTo(W*0.14,H/2);ctx.closePath();ctx.fill();}
      else if(pat==='circle'){ctx.beginPath();ctx.arc(W/2,H/2,W*0.28,0,Math.PI*2);ctx.fill();}
      else if(pat==='border'){const t=W*0.12;ctx.fillRect(0,0,W,t);ctx.fillRect(0,H-t,W,t);ctx.fillRect(0,0,t,H);ctx.fillRect(W-t,0,t,H);}
      else if(pat==='gradient'){const g=ctx.createLinearGradient(0,0,0,H*0.75);g.addColorStop(0,hex);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      else if(pat==='gradient_up'){const g=ctx.createLinearGradient(0,H,0,H*0.25);g.addColorStop(0,hex);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      else if(pat==='bricks'){
        ctx.strokeStyle=hex;ctx.lineWidth=4;
        for(let r=0;r<12;r++){const y=r*(H/12);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
          for(let c=0;c<4;c++){const x=(c+(r%2?0.5:0))*(W/4);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+H/12);ctx.stroke();}}
      }
      ctx.restore();
    }

    function drawBanner(){
      const cv=$('#bCv'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
      ctx.fillStyle=dyeHex(bBase);ctx.fillRect(0,0,W,H);
      bLayers.forEach(l=>drawPat(ctx,l.pattern,dyeHex(l.color),W,H));
      // Subtle cloth weave shading
      ctx.fillStyle='rgba(0,0,0,0.06)';
      for(let y=0;y<H;y+=6) ctx.fillRect(0,y,W,2);

      const list=$('#bList');list.innerHTML='';
      bLayers.forEach((l,idx)=>{
        const row=el('div','layer-item');
        const pName=(PATTERNS.find(p=>p[0]===l.pattern)||[l.pattern,l.pattern])[1];
        row.innerHTML=`<span><i style="display:inline-block;width:12px;height:12px;border-radius:2px;background:${dyeHex(l.color)};margin-right:6px;vertical-align:middle"></i>${pName} (${l.color})</span>`;
        const del=el('button','btn alt sm','Remove');
        del.onclick=()=>{bLayers.splice(idx,1);drawBanner();};
        row.append(del);list.append(row);
      });
      if(!bLayers.length) list.append(el('div','small','No pattern layers yet.'));

      const pats=bLayers.map(l=>`{pattern:"minecraft:${l.pattern}",color:"${l.color}"}`).join(',');
      const cmd=`/give @p minecraft:${bBase}_banner${bLayers.length?`[banner_patterns=[${pats}]]`:''} 1`;
      $('#bCmd').textContent=cmd;
    }

    $('#bAdd').onclick=()=>{bLayers.push({pattern:bPickPat,color:bPickCol});drawBanner();};
    $('#bClr').onclick=()=>{bLayers=[];drawBanner();};
    $('#bRand').onclick=()=>{
      bBase=DYES[Math.floor(Math.random()*DYES.length)][0];
      bLayers=[];
      const n=2+Math.floor(Math.random()*4);
      for(let i=0;i<n;i++) bLayers.push({pattern:PATTERNS[Math.floor(Math.random()*PATTERNS.length)][0],color:DYES[Math.floor(Math.random()*DYES.length)][0]});
      mkDyes($('#bBaseRow'),bBase,v=>{bBase=v;drawBanner();});
      drawBanner();
    };
    $('#bCopy').onclick=()=>copy($('#bCmd').textContent);
    drawBanner();
  }

  // ==================== 3. RGB GRADIENT TEXT, MOTD & CUSTOM ITEM NAME ====================
  function renderTextGen(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>RGB Gradient &amp; Styled Text</h3>
        <div class="bar"><input id="txIn" type="text" value="Solstice SMP" style="flex:1;min-width:200px"></div>
        <div class="bar">
          <label>Start <input id="txC1" type="color" value="#38bdf8"></label>
          <label>End <input id="txC2" type="color" value="#f472b6"></label>
          <label><input type="checkbox" id="txBold" checked> Bold</label>
          <label><input type="checkbox" id="txItal"> Italic</label>
          <label><input type="checkbox" id="txUnd"> Underline</label>
        </div>
        <div class="small" style="margin-bottom:6px">Live Minecraft Preview</div>
        <div class="mc-preview-chat" id="txPrev"></div>
      </div>
      <div class="panel">
        <h3>Generated Commands</h3>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/tellraw (Chat broadcast)</b><button class="btn alt sm" id="cpTell">Copy</button></div>
        <pre class="codebox" id="outTell"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/title (Big screen title)</b><button class="btn alt sm" id="cpTitle">Copy</button></div>
        <pre class="codebox" id="outTitle"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/give Renamed Netherite Sword (1.21+)</b><button class="btn alt sm" id="cpGive">Copy</button></div>
        <pre class="codebox" id="outGive"></pre>
      </div>
    </div>`;

    const hexToRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');

    function update(){
      const txt=$('#txIn').value||'Solstice';
      const c1=hexToRgb($('#txC1').value),c2=hexToRgb($('#txC2').value);
      const bold=$('#txBold').checked,ital=$('#txItal').checked,und=$('#txUnd').checked;
      const chars=[...txt],n=Math.max(1,chars.length-1);
      const prev=$('#txPrev');prev.innerHTML='';
      const comps=chars.map((ch,i)=>{
        const t=i/n;
        const col=toHex(c1[0]+(c2[0]-c1[0])*t,c1[1]+(c2[1]-c1[1])*t,c1[2]+(c2[2]-c1[2])*t);
        const sp=el('span',null,ch);
        sp.style.color=col;
        if(bold) sp.style.fontWeight='700';
        if(ital) sp.style.fontStyle='italic';
        if(und) sp.style.textDecoration='underline';
        prev.append(sp);
        const o={text:ch,color:col};
        if(bold) o.bold=true;
        if(ital) o.italic=true; else o.italic=false;
        if(und) o.underlined=true;
        return o;
      });
      const json=JSON.stringify(comps);
      $('#outTell').textContent=`/tellraw @a ${json}`;
      $('#outTitle').textContent=`/title @a title ${json}`;
      $('#outGive').textContent=`/give @p minecraft:netherite_sword[custom_name='${json.replace(/'/g,"\\'")}'] 1`;
    }
    ['#txIn','#txC1','#txC2','#txBold','#txItal','#txUnd'].forEach(s=>{$(s).oninput=update;$(s).onchange=update;});
    $('#cpTell').onclick=()=>copy($('#outTell').textContent);
    $('#cpTitle').onclick=()=>copy($('#outTitle').textContent);
    $('#cpGive').onclick=()=>copy($('#outGive').textContent);
    update();
  }

  // ==================== 4. NETHER PORTAL, CHUNK & DISTANCE CALC ====================
  function renderNether(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Overworld ↔ Nether Portal Linker</h3>
        <div class="small" style="margin-bottom:8px">Edit either side — coordinates sync automatically (8:1 ratio).</div>
        <div class="bar"><b>Overworld</b>
          <label>X <input id="owX" type="number" value="800" style="width:90px"></label>
          <label>Y <input id="owY" type="number" value="64" style="width:76px"></label>
          <label>Z <input id="owZ" type="number" value="-400" style="width:90px"></label>
        </div>
        <div class="bar"><b>Nether&nbsp;&nbsp;&nbsp;&nbsp;</b>
          <label>X <input id="ntX" type="number" value="100" style="width:90px"></label>
          <label>Y <input id="ntY" type="number" value="64" style="width:76px"></label>
          <label>Z <input id="ntZ" type="number" value="-50" style="width:90px"></label>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><small>Overworld Chunk</small><strong id="ckOw">50, -25</strong></div>
          <div class="stat-card"><small>Region File</small><strong id="rgOw">r.1.-1.mca</strong></div>
          <div class="stat-card"><small>Chunk Block Offset</small><strong id="offOw">0, 0</strong></div>
        </div>
      </div>
      <div class="panel">
        <h3>Waypoint Distance &amp; Travel Time</h3>
        <div class="bar"><b>From</b>
          <label>X <input id="dX1" type="number" value="0" style="width:86px"></label>
          <label>Z <input id="dZ1" type="number" value="0" style="width:86px"></label>
        </div>
        <div class="bar"><b>To&nbsp;&nbsp;&nbsp;&nbsp;</b>
          <label>X <input id="dX2" type="number" value="1200" style="width:86px"></label>
          <label>Z <input id="dZ2" type="number" value="-900" style="width:86px"></label>
        </div>
        <div class="stat-grid">
          <div class="stat-card"><small>Distance</small><strong id="dDist">1500 blocks</strong></div>
          <div class="stat-card"><small>Nether Highway</small><strong id="dNeth">188 blocks</strong></div>
          <div class="stat-card"><small>Sprint-Jump</small><strong id="dWalk">3m 30s</strong></div>
          <div class="stat-card"><small>Elytra Rocket</small><strong id="dEly">45s</strong></div>
          <div class="stat-card"><small>Blue Ice Boat</small><strong id="dIce">21s</strong></div>
        </div>
      </div>
    </div>`;

    const fmtT=sec=>sec>=60?`${Math.floor(sec/60)}m ${Math.round(sec%60)}s`:`${Math.round(sec)}s`;
    function updChunk(){
      const x=+$('#owX').value||0,z=+$('#owZ').value||0;
      const cx=Math.floor(x/16),cz=Math.floor(z/16);
      $('#ckOw').textContent=`${cx}, ${cz}`;
      $('#rgOw').textContent=`r.${Math.floor(cx/32)}.${Math.floor(cz/32)}.mca`;
      $('#offOw').textContent=`${((x%16)+16)%16}, ${((z%16)+16)%16}`;
    }
    ['#owX','#owY','#owZ'].forEach(s=>$(s).oninput=()=>{
      $('#ntX').value=Math.round((+$('#owX').value||0)/8);
      $('#ntY').value=+$('#owY').value||64;
      $('#ntZ').value=Math.round((+$('#owZ').value||0)/8);
      updChunk();
    });
    ['#ntX','#ntY','#ntZ'].forEach(s=>$(s).oninput=()=>{
      $('#owX').value=Math.round((+$('#ntX').value||0)*8);
      $('#owY').value=+$('#ntY').value||64;
      $('#owZ').value=Math.round((+$('#ntZ').value||0)*8);
      updChunk();
    });
    function updDist(){
      const d=Math.hypot((+$('#dX2').value||0)-(+$('#dX1').value||0),(+$('#dZ2').value||0)-(+$('#dZ1').value||0));
      $('#dDist').textContent=`${Math.round(d)} blocks`;
      $('#dNeth').textContent=`${Math.round(d/8)} blocks`;
      $('#dWalk').textContent=fmtT(d/7.1);
      $('#dEly').textContent=fmtT(d/33.5);
      $('#dIce').textContent=fmtT(d/72.7);
    }
    ['#dX1','#dZ1','#dX2','#dZ2'].forEach(s=>$(s).oninput=updDist);
    updChunk();updDist();
  }

  // ==================== 5. MAX GEAR & ENCHANTMENT /GIVE PLANNER ====================
  const GEAR_ITEMS={
    netherite_sword:{label:'Netherite Sword',ench:[['sharpness',5,'dmg'],['smite',5,'dmg'],['bane_of_arthropods',5,'dmg'],['looting',3],['fire_aspect',2],['sweeping_edge',3],['knockback',2],['unbreaking',3],['mending',1]]},
    netherite_pickaxe:{label:'Netherite Pickaxe',ench:[['efficiency',5],['fortune',3,'mine'],['silk_touch',1,'mine'],['unbreaking',3],['mending',1]]},
    netherite_axe:{label:'Netherite Axe',ench:[['efficiency',5],['sharpness',5,'dmg'],['smite',5,'dmg'],['fortune',3,'mine'],['silk_touch',1,'mine'],['unbreaking',3],['mending',1]]},
    netherite_helmet:{label:'Netherite Helmet',ench:[['protection',4,'prot'],['fire_protection',4,'prot'],['blast_protection',4,'prot'],['projectile_protection',4,'prot'],['respiration',3],['aqua_affinity',1],['thorns',3],['unbreaking',3],['mending',1]]},
    netherite_chestplate:{label:'Netherite Chestplate',ench:[['protection',4,'prot'],['fire_protection',4,'prot'],['blast_protection',4,'prot'],['projectile_protection',4,'prot'],['thorns',3],['unbreaking',3],['mending',1]]},
    netherite_leggings:{label:'Netherite Leggings',ench:[['protection',4,'prot'],['fire_protection',4,'prot'],['blast_protection',4,'prot'],['projectile_protection',4,'prot'],['swift_sneak',3],['thorns',3],['unbreaking',3],['mending',1]]},
    netherite_boots:{label:'Netherite Boots',ench:[['protection',4,'prot'],['fire_protection',4,'prot'],['blast_protection',4,'prot'],['projectile_protection',4,'prot'],['feather_falling',4],['depth_strider',3,'boot'],['frost_walker',2,'boot'],['soul_speed',3],['thorns',3],['unbreaking',3],['mending',1]]},
    bow:{label:'Bow',ench:[['power',5],['punch',2],['flame',1],['infinity',1,'bow'],['mending',1,'bow'],['unbreaking',3]]},
    mace:{label:'Mace',ench:[['density',5,'mace'],['breach',4,'mace'],['wind_burst',3],['fire_aspect',2],['unbreaking',3],['mending',1]]},
    elytra:{label:'Elytra',ench:[['unbreaking',3],['mending',1]]}
  };
  function renderGear(){
    let curItem='netherite_sword',picked={sharpness:5,looting:3,sweeping_edge:3,unbreaking:3,mending:1};
    stage.innerHTML=`<div class="panel">
      <h3>Max Gear &amp; Enchantment Planner</h3>
      <div class="bar">
        <label>Item <select id="gItem">${Object.entries(GEAR_ITEMS).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <label>Custom name <input id="gName" type="text" placeholder="Optional name..."></label>
        <label><input type="checkbox" id="gUnb"> Unbreakable</label>
        <button class="btn alt sm" id="gMax">Select God Roll</button>
        <button class="btn alt sm" id="gClr">Clear</button>
      </div>
      <div class="ench-grid" id="gEnch"></div>
      <div style="margin-top:10px"><b>Java 1.21+ /give Command</b></div>
      <pre class="codebox" id="gCmd"></pre>
      <button class="btn brand sm" id="gCopy">Copy /give Command</button>
    </div>`;

    const cap=s=>s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    function draw(){
      const spec=GEAR_ITEMS[curItem];
      const box=$('#gEnch');box.innerHTML='';
      const usedGroups={};
      spec.ench.forEach(([id,max,grp])=>{if(picked[id]&&grp)usedGroups[grp]=id;});

      spec.ench.forEach(([id,max,grp])=>{
        const on=!!picked[id];
        const conflict=grp&&usedGroups[grp]&&usedGroups[grp]!==id;
        const row=el('div','ench-item'+(on?' on':'')+(conflict?' conflict':''));
        const lab=el('label');lab.style.cssText='display:flex;align-items:center;gap:7px;cursor:pointer;flex:1';
        const chk=el('input');chk.type='checkbox';chk.checked=on;chk.disabled=conflict;
        chk.onchange=()=>{if(chk.checked)picked[id]=max;else delete picked[id];draw();};
        lab.append(chk,cap(id));
        const lvl=el('select');lvl.style.padding='2px 5px';lvl.disabled=!on;
        for(let i=1;i<=max;i++){const o=el('option',null,'Lv '+i);o.value=i;lvl.append(o);}
        lvl.value=picked[id]||max;
        lvl.onchange=()=>{picked[id]=+lvl.value;updateCmd();};
        row.append(lab,lvl);box.append(row);
      });
      updateCmd();
    }
    function updateCmd(){
      const comps=[];
      const eEntries=Object.entries(picked).map(([k,v])=>`"minecraft:${k}":${v}`);
      if(eEntries.length) comps.push(`enchantments={levels:{${eEntries.join(',')}}}`);
      const nm=$('#gName').value.trim();
      if(nm) comps.push(`custom_name='${JSON.stringify({text:nm,italic:false}).replace(/'/g,"\\'")}'`);
      if($('#gUnb').checked) comps.push('unbreakable={}');
      $('#gCmd').textContent=`/give @p minecraft:${curItem}${comps.length?'['+comps.join(',')+']':''} 1`;
    }
    $('#gItem').onchange=e=>{curItem=e.target.value;picked={};draw();};
    $('#gMax').onclick=()=>{
      picked={};const used={};
      GEAR_ITEMS[curItem].ench.forEach(([id,max,grp])=>{if(grp&&used[grp])return;if(grp)used[grp]=1;picked[id]=max;});
      draw();
    };
    $('#gClr').onclick=()=>{picked={};draw();};
    $('#gName').oninput=updateCmd;$('#gUnb').onchange=updateCmd;
    $('#gCopy').onclick=()=>copy($('#gCmd').textContent);
    draw();
  }

  renderSub();
};
