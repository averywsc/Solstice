// Solstice pack generator (shared logic with the Python builder)
const SOL = (function(){
const D = SOL_DATA;
function fl(x){ let s=String(Math.round(Number(x)*1e5)/1e5); return /[.e]/.test(s)?s:s+'.0'; }
function hexvec(h){ h=String(h).replace('#',''); const c=[0,2,4].map(i=>Math.round(parseInt(h.substr(i,2),16)/255*1000)/1000); return 'vec3('+fl(c[0])+', '+fl(c[1])+', '+fl(c[2])+')'; }
function defaults(){ const o={}; D.opts.forEach(p=>o[p.key]=p.def_); return o; }
function buildDefs(o,dim,postDim){
  const d=[]; const V=(k,v)=>d.push('#define '+k+' '+v); const F=k=>d.push('#define '+k);
  const b=x=>x?1:0, n=Number;
  V('SKY_CLOUDS',b(o.skyClouds)); V('CLOUD_OCT',n(o.cloudDetail)); V('SKY_CIRRUS',b(o.cirrus)); V('SKY_STARS',n(o.stars)); V('SKY_AURORA',b(o.aurora));
  V('SKY_TINT',hexvec(o.skyTint)); V('SKY_VIVID',b(o.skyVivid)); V('MOON_DETAIL',1);
  V('SUN_STRENGTH',fl(o.sunStrength)); V('SUN_COLOR',hexvec(o.sunColor)); V('MOON_STRENGTH',fl(o.moonStrength));
  V('AMB_STRENGTH',fl(o.ambient)); V('AMB_SAT',fl(o.ambientSat)); V('BOUNCE_STRENGTH',fl(o.bounce)); V('TORCH_STRENGTH',fl(o.torch));
  const tc=D.torch[o.torchColor]; V('TORCH_NEAR',tc[0]); V('TORCH_FAR',tc[1]);
  V('EMISSIVE_STRENGTH',fl(o.emissive)); V('RIM_STRENGTH',fl(o.rim)); V('FOLIAGE_GLOW',fl(o.foliageGlow)); V('BLOCK_VARIATION',fl(o.blockVariation));
  V('HELD_LIGHT',fl(o.heldLight)); V('SHINY_STRENGTH',fl(o.shiny)); V('WET_STRENGTH',fl(o.wet));
  V('SHADOWS',n(o.shadows)); V('SHADOW_TAPS',n(o.shadowTaps)); V('SHADOW_RAD',fl(o.shadowSoft)); V('CLOUD_SHADOWS',b(o.cloudShadows));
  V('FOG_DENSITY',fl(o.fog));
  if(n(o.volSteps)>0 && n(o.shadows)>0){ F('VOL_LIGHT'); V('VOL_STEPS',n(o.volSteps)); V('VOL_RANGE',n(o.volSteps)<12?80:96); V('VOL_DENSITY',fl(o.volDensity)); V('VOL_STRENGTH',fl(o.volStrength)); }
  V('WAVES_EXTRA',b(o.waves)); V('WATER_NORMALS',b(o.waterNormals)); V('WATER_COL',hexvec(o.waterColor)); V('WATER_SPEC',fl(o.waterSpec));
  if(n(o.ssr)>0){ F('SSR'); V('SSR_STEPS',n(o.ssr)); }
  V('SWAY_PLANT',fl(o.swayPlant)); V('SWAY_LEAF',fl(o.swayLeaf));
  V('AO_TAPS',Math.max(n(o.ao),2)); V('AO_STRENGTH',fl(o.aoStrength));
  V('SSL_TAPS',Math.max(n(o.ssl),2)); V('SSL_STRENGTH',fl(o.sslStrength)); V('SSL_RADIUS','8.0');
  V('GI_TAPS',Math.max(n(o.gi),2)); V('GI_STRENGTH',fl(o.giStrength)); V('GI_RADIUS','5.0');
  V('DOF_TAPS',Math.max(n(o.dof),2)); V('DOF_STRENGTH',fl(o.dofStrength)); V('DOF_RADIUS','0.01');
  V('MB_STRENGTH',fl(o.mbStrength)); V('MB_MAX','0.03');
  V('BLOOM_TAPS',n(o.bloom)); V('BLOOM_STRENGTH',fl(o.bloomStrength)); V('BLOOM_RADIUS',fl(o.bloomRadius)); V('BLOOM_THRESH',fl(o.bloomThresh));
  if(n(o.bloomWide)>0 && n(o.bloom)>0){ F('BLOOM_WIDE'); V('BLOOM_WIDE_STRENGTH',fl(o.bloomWide)); }
  if(n(o.godrays)>0 && !postDim){ F('GODRAYS'); V('GODRAY_STEPS',n(o.godrays)); V('GODRAY_STRENGTH',fl(o.godrayStrength)); }
  if(n(o.flare)>0 && !postDim){ F('FLARE'); V('FLARE_STRENGTH',fl(o.flare)); }
  if(n(o.anamorphic)>0){ F('ANAMORPHIC'); V('ANAMORPHIC_STRENGTH',fl(o.anamorphic)); }
  if(n(o.lensDirt)>0){ F('LENSDIRT'); V('DIRT_AMT',fl(o.lensDirt)); }
  if(n(o.halation)>0 && n(o.bloom)>0){ F('HALATION'); V('HALATION_AMT',fl(o.halation)); }
  V('EXPOSURE',fl(o.exposure)); if(o.autoExposure && !dim) F('AUTO_EXPOSURE');
  V('SAT',fl(o.saturation)); V('VIBRANCE',fl(o.vibrance)); V('CONTRAST',fl(o.contrast)); V('VIGN',fl(o.vignette));
  const g=D.grades[o.grade]; V('SHADOW_TINT',g[0]); V('HIGH_TINT',g[1]); V('GRADE_AMT',fl(g[2])); V('LIFT',fl(o.lift)); V('LIFT_COL',o.grade==='dream'?'vec3(0.4, 0.25, 0.55)':'vec3(0.2, 0.18, 0.2)');
  if(n(o.grain)>0){ F('GRAIN'); V('GRAIN_AMT',fl(o.grain)); }
  if(n(o.chroma)>0){ F('CHROMA'); V('CHROMA_AMT',fl(o.chroma)); }
  if(n(o.sharpen)>0){ F('SHARPEN_ON'); V('SHARPEN',fl(o.sharpen)); }
  if(o.fxaa) F('FXAA_ON');
  if(o.letterbox){ F('LETTERBOX'); V('LETTERBOX_RATIO',fl(o.letterboxRatio)); }
  if(n(o.pixelate)>0){ F('PIXELATE'); V('PIXEL_SIZE',fl(o.pixelate)); }
  if(n(o.scanlines)>0){ F('SCANLINES'); V('SCAN_SIZE',fl(o.scanlines)); }
  if(n(o.posterize)>0){ F('POSTERIZE'); V('POSTERIZE_LEVELS',fl(o.posterize)); }
  if(n(o.mono)>0){ F('MONO'); V('MONO_AMT',fl(o.mono)); }
  if(o.monoAccent) F('MONO_ACCENT');
  if(n(o.outline)>0){ F('OUTLINE_ON'); V('OUTLINE_STRENGTH',fl(o.outline)); }
  const gbuf = n(o.ssl)>0 || n(o.gi)>0 || n(o.outline)>0;
  if(gbuf) F('GBUF_ON');
  return {defs:d.join('\n')+'\n', gbuf};
}
function put(files,path,text,defs,tok,extra){
  let t=text; for(const k in tok) t=t.split('@'+k+'@').join(String(tok[k]));
  t=t.replace('#version 120\n','#version 120\n'+defs+(extra||'')); files[path]=t;
}
function makePack(opts,title,blurb){
  const o=Object.assign(defaults(),opts||{});
  const A=buildDefs(o,false,false), B=buildDefs(o,true,false), C=buildDefs(o,true,true);
  const sq=D.skyq[o.skyQuality], fq=D.fogq[o.skyQuality];
  const tok={RES:parseInt(o.shadowRes),DIST:fl(o.shadowDist),DB:A.gbuf?'0234':'0',DBW:A.gbuf?'01234':'01',SKY_NV:sq[0],SKY_NL:sq[1],FOG_NV:fq[0],FOG_NL:fq[1]};
  const T=D.templates, S={}, s='shaders/', defs=A.defs;
  put(S,s+'gbuffers_terrain.fsh',T['lit.fsh'],defs,tok,'#define TERRAIN_PROGRAM\n'); put(S,s+'gbuffers_terrain.vsh',T['terrain.vsh'],defs,tok);
  put(S,s+'gbuffers_textured.fsh',T['lit.fsh'],defs,tok); put(S,s+'gbuffers_textured.vsh',T['textured.vsh'],defs,tok);
  put(S,s+'gbuffers_water.fsh',T['water.fsh'],defs,tok); put(S,s+'gbuffers_water.vsh',T['water.vsh'],defs,tok);
  put(S,s+'gbuffers_skybasic.fsh',T['sky.fsh'],defs,tok); put(S,s+'gbuffers_skybasic.vsh',T['sky.vsh'],defs,tok);
  put(S,s+'gbuffers_skytextured.fsh',T['skytex.fsh'],defs,tok); put(S,s+'gbuffers_skytextured.vsh',T['skytex.vsh'],defs,tok);
  ['gbuffers_clouds','gbuffers_weather','gbuffers_spidereyes','gbuffers_beaconbeam'].forEach(n=>{S[s+n+'.fsh']=T[n+'.fsh']; S[s+n+'.vsh']=T[n+'.vsh'];});
  if(n0(o.shadows)>0){ put(S,s+'shadow.fsh',T['shadow.fsh'],defs,tok); put(S,s+'shadow.vsh',T['shadow.vsh'],defs,tok); }
  const stages=[['composite.fsh',T['composite.fsh']]];
  if(n0(o.ao)>0) stages.push(['ao',T['ao.fsh']]);
  if(n0(o.ssl)>0) stages.push(['ssl',T['ssl.fsh']]);
  if(n0(o.gi)>0) stages.push(['gi',T['ssgi.fsh']]);
  if(n0(o.outline)>0) stages.push(['outline',T['outline.fsh']]);
  if(n0(o.dof)>0) stages.push(['dof',T['dof.fsh']]);
  if(o.mb) stages.push(['mb',T['mb.fsh']]);
  let postIdx=-1;
  if(n0(o.bloom)>0||n0(o.godrays)>0||n0(o.flare)>0||n0(o.anamorphic)>0){ stages.push(['post',T['post.fsh']]); postIdx=stages.length-1; }
  stages.forEach((st,i)=>{ const nm=i===0?'composite':'composite'+i; put(S,s+nm+'.fsh',st[1],defs,tok); S[s+nm+'.vsh']=T['post.vsh']; });
  put(S,s+'final.fsh',T['final.fsh'],defs,tok); S[s+'final.vsh']=T['post.vsh'];
  let props='oldLighting=false\nunderwaterOverlay=false\nvignette=false\n'; if(o.skyClouds) props='clouds=off\n'+props;
  S[s+'shaders.properties']=props; S[s+'block.properties']=T['block.properties']; S[s+'item.properties']=T['item.properties'];
  [['world-1','vec3(0.52, 0.27, 0.2)','0.01'],['world1','vec3(0.28, 0.26, 0.42)','0.004']].forEach(w=>{
    S[s+w[0]+'/gbuffers_textured.fsh']=T['lit_dim.fsh'].split('AMBIENT').join(w[1]); S[s+w[0]+'/gbuffers_terrain.fsh']=S[s+w[0]+'/gbuffers_textured.fsh'];
    S[s+w[0]+'/composite.fsh']=T['dim_composite.fsh'].split('FOGD').join(w[2]);
    put(S,s+w[0]+'/final.fsh',T['final.fsh'],B.defs,tok);
    if(postIdx>=0) put(S,s+w[0]+'/composite'+postIdx+'.fsh',T['post.fsh'],C.defs,tok);
  });
  S[s+'world1/gbuffers_skytextured.vsh']=T['end_sky.vsh']; S[s+'world1/gbuffers_skytextured.fsh']=T['end_sky.fsh'];
  S['README.txt']=(title||'Solstice Custom')+'\n\n'+(blurb||'')+'\n\nInstall: put the .zip (do not unzip) in .minecraft/shaderpacks, then pick it in Video Settings > Shaders. Needs Iris or OptiFine.\nMost options can also be changed in-game under Shader Options.\n';
  return S;
}
function n0(x){ return Number(x); }
// ---- zip (stored) ----
const CRC=(function(){const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){ // files: {path: string|Uint8Array}
  const enc=new TextEncoder(), parts=[], cd=[]; let off=0;
  const u16=v=>[v&255,(v>>8)&255], u32=v=>[v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255];
  for(const path in files){
    const nb=enc.encode(path), data=typeof files[path]==='string'?enc.encode(files[path]):files[path], crc=crc32(data);
    const lh=new Uint8Array([0x50,0x4b,3,4, ...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21), ...u32(crc),...u32(data.length),...u32(data.length),...u16(nb.length),...u16(0)]);
    parts.push(lh,nb,data);
    cd.push(new Uint8Array([0x50,0x4b,1,2, ...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21), ...u32(crc),...u32(data.length),...u32(data.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nb);
    off+=lh.length+nb.length+data.length;
  }
  let cdLen=0; cd.forEach(p=>cdLen+=p.length);
  const end=new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u16(Object.keys(files).length),...u16(Object.keys(files).length),...u32(cdLen),...u32(off),0,0]);
  return new Blob([...parts,...cd,end],{type:'application/zip'});
}
async function unzip(buf){
  const u8=new Uint8Array(buf), dv=new DataView(buf), dec=new TextDecoder(), out={};
  let eocd=-1; for(let i=u8.length-22;i>=Math.max(0,u8.length-65558);i--){ if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;} }
  if(eocd<0) throw new Error('Invalid ZIP file');
  let off=dv.getUint32(eocd+16,true), count=dv.getUint16(eocd+10,true);
  for(let n=0;n<count;n++){
    if(dv.getUint32(off,true)!==0x02014b50) break;
    const method=dv.getUint16(off+10,true), csz=dv.getUint32(off+20,true), nlen=dv.getUint16(off+28,true), elen=dv.getUint16(off+30,true), clen=dv.getUint16(off+32,true), lhOff=dv.getUint32(off+42,true);
    const name=dec.decode(u8.subarray(off+46,off+46+nlen));
    off+=46+nlen+elen+clen;
    if(name.endsWith('/')) continue;
    const lhNlen=dv.getUint16(lhOff+26,true), lhElen=dv.getUint16(lhOff+28,true);
    const start=lhOff+30+lhNlen+lhElen;
    const raw=u8.subarray(start,start+csz);
    if(method===0){ out[name]=raw.slice(); }
    else if(method===8 && typeof DecompressionStream!=='undefined'){
      const ds=new DecompressionStream('deflate-raw');
      const w=ds.writable.getWriter(); w.write(raw); w.close();
      out[name]=new Uint8Array(await new Response(ds.readable).arrayBuffer());
    }
  }
  return out;
}

// ---- WebGL2 (GLSL ES 3.00) conversion for the live preview ----
const ES_HEAD='#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n';
function dbOf(src){ const m=/DRAWBUFFERS:(\d+)/.exec(src); return m?m[1].split('').map(Number):[0]; }
function esCommon(s){
  s=s.replace('uniform sampler2D texture;','uniform sampler2D u_texture;').replace(/texture2D\(texture,/g,'texture(u_texture,').replace(/texture2D\(/g,'texture(');
  return s;
}
function esFrag(src){
  const db=dbOf(src);
  let s=esCommon(src).replace('#version 120\n',ES_HEAD).replace(/\bvarying\b/g,'in');
  const used=new Set(); s.replace(/gl_FragData\[(\d)\]/g,(m,i)=>{used.add(+i);return m;});
  if(s.indexOf('gl_FragColor')>=0){ used.add(0); s=s.replace(/gl_FragColor/g,'gl_FragData[0]'); }
  used.forEach(i=>{ s=s.split('gl_FragData['+i+']').join('fragData_'+i); });
  const decl=[...used].map(i=>'layout(location='+(db[i]===undefined?i:db[i])+') out vec4 fragData_'+i+';').join('\n')+'\n';
  return s.replace(ES_HEAD,ES_HEAD+decl);
}
function esVertPost(src){
  let s=esCommon(src).replace('#version 120\n',ES_HEAD+'layout(location=0) in vec2 in_pos;\nlayout(location=1) in vec2 in_uv;\n').replace(/\bvarying\b/g,'out');
  return s.replace('gl_Position = ftransform();','gl_Position = vec4(in_pos, 0.0, 1.0);').replace(/gl_MultiTexCoord0\.xy/g,'in_uv');
}
function esVertSky(src){
  let s=esVertPost(src); return s.replace(/gl_Color/g,'vec4(0.0)');
}
function esVertGeo(src){
  let s=esCommon(src).replace(/\bvarying\b/g,'out');
  const map={'gl_ModelViewMatrix':'u_mv','gl_ProjectionMatrix':'u_proj','gl_NormalMatrix':'u_nm','gl_TextureMatrix[0]':'u_tex0','gl_TextureMatrix[1]':'u_tex1','gl_Vertex':'a_vertex','gl_Normal':'a_normal','gl_Color':'a_color','gl_MultiTexCoord0':'a_uv0','gl_MultiTexCoord1':'a_uv1'};
  s=s.split('ftransform()').join('(u_proj * u_mv * a_vertex)');
  for(const k in map) s=s.split(k).join(map[k]);
  let pre='uniform mat4 u_mv;\nuniform mat4 u_proj;\nuniform mat3 u_nm;\nuniform mat4 u_tex0;\nuniform mat4 u_tex1;\nlayout(location=0) in vec4 a_vertex;\nlayout(location=1) in vec3 a_normal;\nlayout(location=2) in vec4 a_color;\nlayout(location=3) in vec4 a_uv0;\nlayout(location=4) in vec4 a_uv1;\n';
  if(/attribute vec4 mc_Entity;/.test(s)) s=s.replace('attribute vec4 mc_Entity;','layout(location=5) in vec4 mc_Entity;'); 
  if(/attribute vec2 mc_midTexCoord;/.test(s)) s=s.replace('attribute vec2 mc_midTexCoord;','layout(location=6) in vec2 mc_midTexCoord;');
  return s.replace('#version 120\n',ES_HEAD+pre);
}
function presetOpts(name){ const p=D.presets.find(x=>x.name===name); return p?p.opts:{}; }
function makePreset(name){ if(name==='Potato') return Object.assign({},D.potato,{'README.txt':'Solstice Potato\n\nBuilt for speed: no shadows, no post-processing. Install: put the .zip (do not unzip) in .minecraft/shaderpacks.\n'}); const p=D.presets.find(x=>x.name===name); return makePack(p.opts,'Solstice '+name,p.desc); }
return {makePack,makePreset,presetOpts,defaults,zip,unzip,crc32,buildDefs,fl,esFrag,esVertPost,esVertSky,esVertGeo,dbOf};
})();
if(typeof module!=='undefined') module.exports=SOL;
