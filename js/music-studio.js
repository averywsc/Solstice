// Solstice Music Disc Studio: Upload MP3/WAV/M4A/OGG, customize disc art & title, encode real Ogg Vorbis, export Minecraft Resource Pack
window.initMusicDiscs=function(root){
  const $=(s,r=root)=>r.querySelector(s);
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;};
  const toast=m=>window.SOL_TOAST&&window.SOL_TOAST(m);

  const DISCS=[
    ['cat','Cat','#4ade80'],['blocks','Blocks','#fb923c'],['chirp','Chirp','#ef4444'],
    ['far','Far','#a3e635'],['mall','Mall','#c084fc'],['mellohi','Mellohi','#e879f9'],
    ['stal','Stal','#94a3b8'],['strad','Strad','#f8fafc'],['ward','Ward','#10b981'],
    ['wait','Wait','#38bdf8'],['13','13','#facc15'],['11','11','#64748b'],
    ['pigstep','Pigstep','#f59e0b'],['otherside','Otherside','#2dd4bf'],['5','5','#22d3ee'],
    ['relic','Relic','#f97316'],['creator','Creator','#fbbf24'],['creator_music_box','Creator (Music Box)','#d97706'],
    ['precipice','Precipice','#60a5fa']
  ];

  // State: discId -> { file, name, artist, audioBuffer, duration, trimStart, trimEnd, gain, mono, labelColor, rimStyle, coverImg, discCanvas }
  const tracks={};
  let curDisc='cat',playingSrc=null,audioCtx=null,playStartT=0,playOffset=0;
  let oggEncoderPromise=null;

  function getAudioCtx(){
    if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    return audioCtx;
  }
  async function getOggEncoder(){
    if(!window.WasmMediaEncoder) throw new Error('WasmMediaEncoder script failed to load.');
    if(!oggEncoderPromise){
      oggEncoderPromise=(async()=>{
        try{
          return await window.WasmMediaEncoder.createEncoder('audio/ogg','js/vendor/ogg.wasm');
        }catch(_){
          return await window.WasmMediaEncoder.createEncoder('audio/ogg','https://cdn.jsdelivr.net/npm/wasm-media-encoders@0.7.0/wasm/ogg.wasm');
        }
      })();
    }
    return oggEncoderPromise;
  }
  function stopPlayback(){
    if(playingSrc){try{playingSrc.stop();}catch(_){} playingSrc=null;}
    const btn=$('#mdPlay'); if(btn) btn.textContent='Play Preview';
  }

  root.innerHTML=`
    <p class="note">Upload any MP3, WAV, M4A, or OGG song to replace Minecraft music discs. Solstice converts your audio into real Ogg Vorbis (<code>.ogg</code>), sets the in-game song title, generates custom disc art, and exports a ready-to-use resource pack.</p>
    <div class="bar panel">
      <label>Pack name <input id="mdPackName" value="My Music Discs"></label>
      <label>Minecraft version <select id="mdVer"></select></label>
      <label>Audio quality <select id="mdQual"><option value="2">Compact (smaller zip)</option><option value="4" selected>Standard (recommended)</option><option value="6">High quality</option></select></label>
      <label>Disc icon size <select id="mdArtSz"><option value="16">16x16 (Vanilla)</option><option value="32" selected>32x32 (HD)</option><option value="64">64x64</option></select></label>
    </div>
    <div class="tex">
      <div>
        <div class="small" style="margin-bottom:6px"><b>Choose a disc slot to replace (19 discs)</b></div>
        <div class="tlist" id="mdList"></div>
      </div>
      <div>
        <div class="panel" id="mdEd"></div>
        <div class="panel" style="margin-top:14px">
          <div class="bar" style="margin-bottom:6px">
            <b>Your Music Pack</b>
            <span class="small" id="mdCount">no discs added yet</span>
            <button class="btn alt sm" id="mdClearAll" style="margin-left:auto">Clear all</button>
          </div>
          <div class="chips" id="mdChips"></div>
          <div class="bar">
            <label>Description <input id="mdDesc" value="Custom music discs made with Solstice" style="min-width:240px"></label>
          </div>
          <div id="mdProgWrap" hidden style="margin:8px 0">
            <div class="small" id="mdProgText">Encoding Ogg Vorbis...</div>
            <div class="md-prog"><div id="mdProgBar"></div></div>
          </div>
          <div class="bar" style="margin-bottom:4px">
            <button class="btn brand" id="mdExport">Download Music Pack (.zip)</button>
          </div>
          <div class="small">Drop the <code>.zip</code> into <code>.minecraft/resourcepacks</code> (do not unzip), enable it in Options &gt; Resource Packs, and play your disc in a Jukebox!</div>
        </div>
      </div>
    </div>`;

  const verSel=$('#mdVer');
  TEX_VERSIONS.forEach(v=>{const o=el('option',null,v[0]);o.value=v[1];verSel.append(o);});
  verSel.value=84;

  // ---------- Pixel-art Music Disc Icon Generator ----------
  function renderDiscCanvas(tr,sz){
    const c=document.createElement('canvas');c.width=sz;c.height=sz;
    const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    const cx=sz/2,cy=sz/2,rOut=sz*0.44,rIn=sz*0.18;
    const rimPal={
      black:['#1a1b24','#2c2f3f','#0d0e14'],
      gold:['#b45309','#f59e0b','#78350f'],
      teal:['#0f766e','#2dd4bf','#134e4a'],
      copper:['#9a3412','#fb923c','#431407'],
      neon:['#581c87','#c084fc','#1e1b4b']
    }[tr.rimStyle||'black'];

    if(tr.coverImg){
      // Draw user album cover masked into disc shape with center hole
      const tmp=document.createElement('canvas');tmp.width=sz;tmp.height=sz;
      const tx=tmp.getContext('2d');tx.imageSmoothingEnabled=true;
      const k=Math.max(sz/tr.coverImg.width,sz/tr.coverImg.height);
      const dw=tr.coverImg.width*k,dh=tr.coverImg.height*k;
      tx.drawImage(tr.coverImg,(sz-dw)/2,(sz-dh)/2,dw,dh);
      const id=tx.getImageData(0,0,sz,sz),d=id.data;
      for(let py=0;py<sz;py++)for(let px=0;px<sz;px++){
        const dist=Math.hypot(px+0.5-cx,py+0.5-cy);
        const i=(py*sz+px)*4;
        if(dist>rOut || dist<sz*0.08){d[i+3]=0;}
        else if(dist>rOut-Math.max(1,sz/16)){d[i]=18;d[i+1]=20;d[i+2]=28;d[i+3]=255;}
      }
      x.putImageData(id,0,0);
      return c;
    }

    // Classic Minecraft vinyl pixel disc
    for(let py=0;py<sz;py++)for(let px=0;px<sz;px++){
      const dx=px+0.5-cx,dy=py+0.5-cy,dist=Math.hypot(dx,dy);
      if(dist>rOut || dist<sz*0.07) continue;
      if(dist<=rIn){
        x.fillStyle=tr.labelColor||'#38bdf8';
      }else if(dist>rOut-Math.max(1,sz/16)){
        x.fillStyle=rimPal[2];
      }else{
        const sheen=(dx+dy)<0 && dist>rIn+1 && Math.abs(dist-rOut*0.7)<sz*0.1;
        x.fillStyle=sheen?rimPal[1]:rimPal[0];
      }
      x.fillRect(px,py,1,1);
    }
    return c;
  }

  function fmtTime(sec){
    const m=Math.floor(sec/60),s=Math.floor(sec%60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function drawList(){
    const box=$('#mdList');box.innerHTML='';
    DISCS.forEach(([id,label,col])=>{
      const tr=tracks[id];
      const b=el('button',id===curDisc?'on':'');
      const im=new Image();im.width=24;im.height=24;
      im.src=renderDiscCanvas(tr||{labelColor:col,rimStyle:'black'},16).toDataURL();
      const status=tr?fmtTime(tr.trimEnd-tr.trimStart):'vanilla';
      b.append(im,el('span',null,tr?`${label} -> ${tr.name}`:label),el('span','tsize',status));
      b.onclick=()=>{stopPlayback();curDisc=id;drawEditor();drawList();};
      box.append(b);
    });
  }

  function drawChips(){
    const box=$('#mdChips');box.innerHTML='';
    const keys=Object.keys(tracks);
    $('#mdCount').textContent=keys.length?`${keys.length} custom disc${keys.length>1?'s':''} ready`:'no discs added yet';
    keys.forEach(id=>{
      const tr=tracks[id];
      const c=el('span','chip');
      const im=new Image();im.width=18;im.height=18;im.style.imageRendering='pixelated';
      im.src=renderDiscCanvas(tr,16).toDataURL();
      const nm=el('span',null,`${id}: ${tr.name}`);nm.style.cursor='pointer';
      nm.onclick=()=>{stopPlayback();curDisc=id;drawEditor();drawList();};
      const rm=el('b',null,'x');rm.title='Remove track';
      rm.onclick=()=>{stopPlayback();delete tracks[id];drawChips();drawList();drawEditor();};
      c.append(im,nm,rm);box.append(c);
    });
  }

  function drawWaveform(cv,tr){
    const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
    ctx.fillStyle='#050c1f';ctx.fillRect(0,0,W,H);
    if(!tr||!tr.audioBuffer){
      ctx.fillStyle='#8d9cc4';ctx.font='13px Archivo,sans-serif';ctx.textAlign='center';
      ctx.fillText('Upload an MP3, WAV, M4A, or OGG file to see waveform',W/2,H/2+4);
      return;
    }
    const ch=tr.audioBuffer.getChannelData(0),step=Math.max(1,Math.floor(ch.length/W));
    const sFrac=tr.trimStart/tr.duration,eFrac=tr.trimEnd/tr.duration;
    for(let x=0;x<W;x++){
      let peak=0;
      for(let j=0;j<step;j++){const v=Math.abs(ch[x*step+j]||0);if(v>peak)peak=v;}
      const bh=Math.max(2,peak*H*0.88);
      const frac=x/W;
      ctx.fillStyle=(frac>=sFrac&&frac<=eFrac)?'#7dd3fc':'rgba(141,156,196,0.22)';
      ctx.fillRect(x,(H-bh)/2,1,bh);
    }
    // Trim markers
    ctx.fillStyle='#ffffff';
    ctx.fillRect(Math.round(sFrac*W),0,2,H);
    ctx.fillRect(Math.round(eFrac*W)-2,0,2,H);
  }

  async function handleAudioFile(file){
    if(!file) return;
    toast('Decoding audio...');
    try{
      const buf=await file.arrayBuffer();
      const ctx=getAudioCtx();
      const decoded=await ctx.decodeAudioData(buf.slice(0));
      const discDef=DISCS.find(d=>d[0]===curDisc)||DISCS[0];
      const cleanName=file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'Custom Track';
      const prev=tracks[curDisc];
      tracks[curDisc]={
        file,
        name:prev?prev.name:cleanName,
        artist:prev?prev.artist:'Custom',
        audioBuffer:decoded,
        duration:decoded.duration,
        trimStart:0,
        trimEnd:decoded.duration,
        gain:1,
        mono:true,
        labelColor:prev?prev.labelColor:discDef[2],
        rimStyle:prev?prev.rimStyle:'black',
        coverImg:prev?prev.coverImg:null
      };
      drawEditor();drawChips();drawList();
      toast(`Loaded "${cleanName}" (${fmtTime(decoded.duration)}) onto ${discDef[1]} disc!`);
    }catch(err){
      toast('Could not decode audio file: '+err.message);
    }
  }

  function drawEditor(){
    const ed=$('#mdEd');ed.innerHTML='';
    const discDef=DISCS.find(d=>d[0]===curDisc)||DISCS[0];
    const tr=tracks[curDisc];
    const artSz=+$('#mdArtSz').value||32;

    const head=el('div','bar');head.style.justifyContent='space-between';
    head.innerHTML=`<div><b>Editing Disc: ${discDef[1]}</b> <code>music_disc_${curDisc}</code></div>`;
    const giveBtn=el('button','btn alt sm','Copy /give Disc');
    giveBtn.onclick=()=>{
      const cmd=`/give @p minecraft:music_disc_${curDisc} 1`;
      if(navigator.clipboard) navigator.clipboard.writeText(cmd).then(()=>toast('Copied '+cmd));
      else prompt('Copy:',cmd);
    };
    head.append(giveBtn);
    ed.append(head);

    // Dropzone for MP3 / WAV / OGG / M4A
    const dz=el('div','dropzone');dz.style.marginTop='0';dz.style.marginBottom='12px';
    dz.innerHTML=`<strong>${tr?'Replace Audio File (MP3, WAV, M4A, OGG)':'Drop an MP3, WAV, M4A, or OGG file here (or click to browse)'}</strong>
      <span class="small">${tr?`Loaded: ${tr.file.name} (${fmtTime(tr.duration)}, ${tr.audioBuffer.sampleRate} Hz)`:'Automatically converted to Minecraft Ogg Vorbis (.ogg) in your browser'}</span>`;
    const fin=el('input');fin.type='file';fin.accept='audio/*,.mp3,.wav,.ogg,.m4a,.flac';fin.hidden=true;
    dz.onclick=()=>fin.click();
    dz.ondragover=e=>{e.preventDefault();dz.classList.add('drag');};
    dz.ondragleave=()=>dz.classList.remove('drag');
    dz.ondrop=e=>{e.preventDefault();dz.classList.remove('drag');if(e.dataTransfer.files[0])handleAudioFile(e.dataTransfer.files[0]);};
    fin.onchange=()=>{if(fin.files[0])handleAudioFile(fin.files[0]);fin.value='';};
    ed.append(dz,fin);

    // Waveform + Playback
    const wf=el('canvas');wf.width=640;wf.height=84;
    wf.style.cssText='width:100%;height:84px;border:1px solid var(--edge);border-radius:4px;display:block;margin-bottom:10px';
    ed.append(wf);
    drawWaveform(wf,tr);

    if(!tr){
      ed.append(el('div','small','Upload a song above to trim it, preview it, customize its disc icon, and include it in your pack.'));
      return;
    }

    // Playback + Trim + Audio controls
    const pb=el('div','bar');
    const playBtn=el('button','btn brand sm','Play Preview');playBtn.id='mdPlay';
    playBtn.onclick=()=>{
      if(playingSrc){stopPlayback();return;}
      const ctx=getAudioCtx();
      const src=ctx.createBufferSource();
      src.buffer=tr.audioBuffer;
      const g=ctx.createGain();g.gain.value=tr.gain;
      src.connect(g);g.connect(ctx.destination);
      const dur=Math.max(0.2,tr.trimEnd-tr.trimStart);
      src.start(0,tr.trimStart,dur);
      playingSrc=src;playBtn.textContent='Stop Preview';
      src.onended=()=>{if(playingSrc===src){playingSrc=null;playBtn.textContent='Play Preview';}};
    };
    const rmBtn=el('button','btn alt sm','Remove Track');
    rmBtn.onclick=()=>{stopPlayback();delete tracks[curDisc];drawEditor();drawChips();drawList();};
    pb.append(playBtn,el('span','small',`Clip length: ${fmtTime(tr.trimEnd-tr.trimStart)}`),rmBtn);
    ed.append(pb);

    const trimBar=el('div','up-opts');trimBar.style.marginBottom='12px';
    trimBar.innerHTML=`
      <label>Song Title (in-game) <input id="mdTitle" type="text" value="${tr.name.replace(/"/g,'&quot;')}"></label>
      <label>Artist <input id="mdArtist" type="text" value="${tr.artist.replace(/"/g,'&quot;')}"></label>
      <label>Start: <b id="mdStV">${fmtTime(tr.trimStart)}</b> <input id="mdSt" type="range" min="0" max="${tr.duration}" step="0.5" value="${tr.trimStart}"></label>
      <label>End: <b id="mdEnV">${fmtTime(tr.trimEnd)}</b> <input id="mdEn" type="range" min="0.5" max="${tr.duration}" step="0.5" value="${tr.trimEnd}"></label>
      <label>Volume: <b id="mdVolV">${Math.round(tr.gain*100)}%</b> <input id="mdVol" type="range" min="0.2" max="2" step="0.05" value="${tr.gain}"></label>
      <label class="chk"><input type="checkbox" id="mdMono" ${tr.mono?'checked':''}> Mono (3D Jukebox distance fade)</label>
    `;
    ed.append(trimBar);

    $('#mdTitle',trimBar).oninput=e=>{tr.name=e.target.value;drawChips();drawList();};
    $('#mdArtist',trimBar).oninput=e=>{tr.artist=e.target.value;};
    $('#mdSt',trimBar).oninput=e=>{tr.trimStart=Math.min(+e.target.value,tr.trimEnd-0.5);$('#mdStV',trimBar).textContent=fmtTime(tr.trimStart);drawWaveform(wf,tr);};
    $('#mdEn',trimBar).oninput=e=>{tr.trimEnd=Math.max(+e.target.value,tr.trimStart+0.5);$('#mdEnV',trimBar).textContent=fmtTime(tr.trimEnd);drawWaveform(wf,tr);};
    $('#mdVol',trimBar).oninput=e=>{tr.gain=+e.target.value;$('#mdVolV',trimBar).textContent=Math.round(tr.gain*100)+'%';};
    $('#mdMono',trimBar).onchange=e=>{tr.mono=e.target.checked;};

    // Custom Disc Icon Art section
    const artBox=el('div','bar');artBox.style.cssText='padding:10px 12px;background:var(--bg);border:1px solid var(--line);border-radius:4px;margin:0';
    const artPrev=el('canvas');artPrev.width=artSz;artPrev.height=artSz;
    artPrev.style.cssText='width:64px;height:64px;image-rendering:pixelated;border:1px solid var(--edge);border-radius:4px;background:repeating-conic-gradient(#121d38 0% 25%,#0b142a 0% 50%) 0 0/8px 8px;flex:none';
    const redrawArt=()=>{const c=renderDiscCanvas(tr,artSz);artPrev.width=artSz;artPrev.height=artSz;artPrev.getContext('2d').drawImage(c,0,0);drawList();drawChips();};
    redrawArt();

    const colIn=el('input');colIn.type='color';colIn.value=tr.labelColor;colIn.oninput=()=>{tr.labelColor=colIn.value;tr.coverImg=null;redrawArt();};
    const rimSel=el('select');[['black','Classic Vinyl'],['gold','Gold Rim'],['teal','Teal Rim'],['copper','Copper Rim'],['neon','Neon Rim']].forEach(([v,l])=>{const o=el('option',null,l);o.value=v;rimSel.append(o);});
    rimSel.value=tr.rimStyle;rimSel.onchange=()=>{tr.rimStyle=rimSel.value;tr.coverImg=null;redrawArt();};
    const covBtn=el('button','btn alt sm','Upload Album Cover');
    const covIn=el('input');covIn.type='file';covIn.accept='image/*';covIn.hidden=true;
    covBtn.onclick=()=>covIn.click();
    covIn.onchange=()=>{
      const f=covIn.files[0];if(!f)return;
      const u=URL.createObjectURL(f),im=new Image();
      im.onload=()=>{URL.revokeObjectURL(u);tr.coverImg=im;redrawArt();toast('Applied custom album cover to disc icon!');};
      im.src=u;covIn.value='';
    };
    const rstArt=el('button','btn alt sm','Reset Icon');rstArt.onclick=()=>{tr.coverImg=null;redrawArt();};

    const l1=el('label',null,'Label ');l1.append(colIn);
    const l2=el('label',null,'Rim ');l2.append(rimSel);
    artBox.append(artPrev,l1,l2,covBtn,covIn,rstArt);
    ed.append(artBox);
  }

  // ---------- Encode AudioBuffer slice to real Ogg Vorbis Uint8Array ----------
  async function encodeTrackToOgg(tr,quality,onProgress){
    const enc=await getOggEncoder();
    const buf=tr.audioBuffer;
    const sr=buf.sampleRate;
    const startSample=Math.max(0,Math.floor(tr.trimStart*sr));
    const endSample=Math.min(buf.length,Math.floor(tr.trimEnd*sr));
    const total=Math.max(1,endSample-startSample);
    const channels=tr.mono?1:Math.min(2,buf.numberOfChannels);
    enc.configure({sampleRate:sr,channels,vbrQuality:quality});

    const inL=buf.getChannelData(0);
    const inR=buf.numberOfChannels>1?buf.getChannelData(1):inL;
    const chunkSz=16384;
    const parts=[];
    const gain=tr.gain;

    for(let off=0;off<total;off+=chunkSz){
      const n=Math.min(chunkSz,total-off);
      if(channels===1){
        const mono=new Float32Array(n);
        for(let i=0;i<n;i++){
          const s=(inL[startSample+off+i]+inR[startSample+off+i])*0.5*gain;
          mono[i]=Math.max(-1,Math.min(1,s));
        }
        const out=enc.encode([mono]);
        if(out.length) parts.push(out.slice());
      }else{
        const l=new Float32Array(n),r=new Float32Array(n);
        for(let i=0;i<n;i++){
          l[i]=Math.max(-1,Math.min(1,inL[startSample+off+i]*gain));
          r[i]=Math.max(-1,Math.min(1,inR[startSample+off+i]*gain));
        }
        const out=enc.encode([l,r]);
        if(out.length) parts.push(out.slice());
      }
      if(onProgress) onProgress((off+n)/total);
      await new Promise(r=>setTimeout(r,0));
    }
    const fin=enc.finalize();
    if(fin.length) parts.push(fin.slice());
    let len=0;parts.forEach(p=>len+=p.length);
    const merged=new Uint8Array(len);let pOff=0;
    parts.forEach(p=>{merged.set(p,pOff);pOff+=p.length;});
    return merged;
  }

  function blobOf(c){return new Promise(r=>c.toBlob(b=>b.arrayBuffer().then(a=>r(new Uint8Array(a))),'image/png'));}

  $('#mdClearAll').onclick=()=>{
    stopPlayback();
    for(const k in tracks) delete tracks[k];
    drawEditor();drawChips();drawList();toast('Cleared all custom discs.');
  };
  $('#mdArtSz').onchange=()=>drawEditor();

  $('#mdExport').onclick=async()=>{
    const keys=Object.keys(tracks);
    if(!keys.length){toast('Upload at least one MP3/WAV/OGG track first!');return;}
    const btn=$('#mdExport'),pWrap=$('#mdProgWrap'),pTxt=$('#mdProgText'),pBar=$('#mdProgBar');
    btn.disabled=true;pWrap.hidden=false;pBar.style.width='2%';
    try{
      const files={};
      const lang={};
      const quality=+$('#mdQual').value||4;
      const artSz=+$('#mdArtSz').value||32;
      const fmt=+verSel.value;

      for(let i=0;i<keys.length;i++){
        const id=keys[i],tr=tracks[id];
        pTxt.textContent=`Encoding ${i+1}/${keys.length}: ${tr.name} -> ${id}.ogg...`;
        const oggBytes=await encodeTrackToOgg(tr,quality,frac=>{
          const pct=((i+frac)/keys.length)*94;
          pBar.style.width=pct.toFixed(1)+'%';
        });
        files[`assets/minecraft/sounds/records/${id}.ogg`]=oggBytes;
        const discCv=renderDiscCanvas(tr,artSz);
        files[`assets/minecraft/textures/item/music_disc_${id}.png`]=await blobOf(discCv);
        const labelStr=tr.artist&&tr.artist.trim()?`${tr.artist.trim()} - ${tr.name.trim()}`:tr.name.trim();
        lang[`jukebox_song.minecraft.${id}`]=labelStr;
        lang[`item.minecraft.music_disc_${id}.desc`]=labelStr;
      }

      files['assets/minecraft/lang/en_us.json']=JSON.stringify(lang,null,2);
      const pack=fmt>=65?{description:$('#mdDesc').value,min_format:fmt,max_format:Math.max(fmt,97)}:{description:$('#mdDesc').value,pack_format:fmt};
      files['pack.mcmeta']=JSON.stringify({pack},null,2);

      // Generate 64x64 pack.png from the first custom disc icon
      const ic=document.createElement('canvas');ic.width=ic.height=64;
      const ix=ic.getContext('2d');ix.imageSmoothingEnabled=false;
      ix.fillStyle='#091534';ix.fillRect(0,0,64,64);
      ix.drawImage(renderDiscCanvas(tracks[keys[0]],artSz),4,4,56,56);
      files['pack.png']=await blobOf(ic);

      pTxt.textContent='Zipping resource pack...';pBar.style.width='100%';
      const name=($('#mdPackName').value.trim()||'My_Music_Discs').replace(/[^\w\- ]+/g,'').replace(/\s+/g,'_')+'.zip';
      const a=document.createElement('a');a.href=URL.createObjectURL(SOL.zip(files));a.download=name;
      document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);
      toast(`Downloaded ${name} (${keys.length} custom disc${keys.length>1?'s':''})!`);
    }catch(err){
      toast('Export failed: '+err.message);
    }finally{
      btn.disabled=false;setTimeout(()=>{pWrap.hidden=true;},1200);
    }
  };

  drawList();drawChips();drawEditor();
};
