// Live WebGL2 preview of the generated shader pack (a miniature shader-pack pipeline)
const Preview = (function(){
const M={
 id(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];},
 mul(a,b){const r=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[i*4+k]*b[k*4+j];r[i*4+j]=s;}return r;},
 persp(fovy,asp,n,f){const t=1/Math.tan(fovy*Math.PI/360);return [t/asp,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),2*f*n/(n-f),0,0,-1,0];},
 ortho(S,n,f){return [1/S,0,0,0,0,1/S,0,0,0,0,-2/(f-n),-(f+n)/(f-n),0,0,0,1];},
 inv(m){const a=m.map((v,i)=>[v]);const A=[];for(let i=0;i<4;i++){A.push([m[i*4],m[i*4+1],m[i*4+2],m[i*4+3],i==0?1:0,i==1?1:0,i==2?1:0,i==3?1:0]);}
  for(let c=0;c<4;c++){let p=c;for(let r=c+1;r<4;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];const d=A[c][c];for(let j=0;j<8;j++)A[c][j]/=d;for(let r=0;r<4;r++)if(r!=c){const f=A[r][c];for(let j=0;j<8;j++)A[r][j]-=f*A[c][j];}}
  const o=[];for(let i=0;i<4;i++)for(let j=0;j<4;j++)o.push(A[i][4+j]);return o;},
 col(m){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++)o[c*4+r]=m[r*4+c];return o;},
 col3(m){const o=new Float32Array(9);for(let r=0;r<3;r++)for(let c=0;c<3;c++)o[c*3+r]=m[r*4+c];return o;},
 norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},
 cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];},
 lookAt(eye,t){const f=M.norm([t[0]-eye[0],t[1]-eye[1],t[2]-eye[2]]);const r=M.norm(M.cross(f,[0,1,0]));const u=M.cross(r,f);
  const R=[r[0],r[1],r[2],0,u[0],u[1],u[2],0,-f[0],-f[1],-f[2],0,0,0,0,1];const T=[1,0,0,-eye[0],0,1,0,-eye[1],0,0,1,-eye[2],0,0,0,1];return {R,MV:M.mul(R,T)};},
 vec(R,v){return [R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[4]*v[0]+R[5]*v[1]+R[6]*v[2],R[8]*v[0]+R[9]*v[1]+R[10]*v[2]];}
};
function create(canvas){
  const gl=canvas.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,alpha:false});
  if(!gl) throw new Error('This browser does not support WebGL2, so the live preview is unavailable.');
  if(!gl.getExtension('EXT_color_buffer_float')) throw new Error('This browser cannot render the preview (float buffers missing).');
  gl.getExtension('OES_texture_float_linear');
  const P={sunEl:35,sunAz:-40,time:10,rain:0,moonPhase:0,yaw:18,pitch:-9,dist:13,anim:false,held:0};
  let W=canvas.width,H=canvas.height, progs={}, stageNames=[], lastError='';
  // ---------- helpers ----------
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const l=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(l);}return s;}
  function program(name,vs,fs){
    let v,f;
    try{v=shader(gl.VERTEX_SHADER,vs);}catch(e){throw new Error(name+' (vertex): '+e.message);}
    try{f=shader(gl.FRAGMENT_SHADER,fs);}catch(e){throw new Error(name+' (fragment): '+e.message);}
    const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(name+' (link): '+gl.getProgramInfoLog(p));
    const info={p,u:{},samplers:[]};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
    for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);const loc=gl.getUniformLocation(p,a.name);info.u[a.name]={loc,type:a.type};if(a.type===gl.SAMPLER_2D)info.samplers.push(a.name);}
    return info;
  }
  function setU(pr,name,val){
    const u=pr.u[name];if(!u||val===undefined)return;const T=u.type,l=u.loc;
    if(T===gl.FLOAT)gl.uniform1f(l,val);else if(T===gl.INT)gl.uniform1i(l,val);
    else if(T===gl.FLOAT_VEC2)gl.uniform2fv(l,val);else if(T===gl.FLOAT_VEC3)gl.uniform3fv(l,val);else if(T===gl.FLOAT_VEC4)gl.uniform4fv(l,val);
    else if(T===gl.INT_VEC2)gl.uniform2iv(l,val);else if(T===gl.FLOAT_MAT4)gl.uniformMatrix4fv(l,false,M.col(val));else if(T===gl.FLOAT_MAT3)gl.uniformMatrix3fv(l,false,val);
  }
  let track=false,liveT=[],liveF=[];
  function tex(w,h,ifmt,fmt,type,filter,data){const t=gl.createTexture();if(track)liveT.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,ifmt,w,h,0,fmt,type,data||null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
  const f16=(w,h)=>tex(w,h,gl.RGBA16F,gl.RGBA,gl.HALF_FLOAT,gl.LINEAR), u8=(w,h)=>tex(w,h,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,gl.LINEAR), dep=(w,h)=>tex(w,h,gl.DEPTH_COMPONENT24,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.NEAREST);
  // ---------- geometry ----------
  const STRIDE=25*4;
  function boxFaces(x0,y0,z0,x1,y1,z1){return [[[0,1,0],[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]],[[0,-1,0],[[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0]]],[[1,0,0],[[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]]],[[-1,0,0],[[x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1]]],[[0,0,1],[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]]],[[0,0,-1],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]]]];}
  function addBox(out,b,col,mc,blk,sky){const uvs=[[0,0],[1,0],[1,1],[0,1]];
    for(const [n,q] of boxFaces(...b))for(const k of [0,1,2,0,2,3]){const v=q[k];out.push(v[0],v[1],v[2],1,n[0],n[1],n[2],col[0],col[1],col[2],1,uvs[k][0],uvs[k][1],0,0,blk,sky,0,0,mc,0,0,0,0.5,0.5);}}
  function scene(){
    const O=[],Wt=[];const g=[0.33,0.43,0.19],sand=[0.86,0.8,0.55];
    addBox(O,[-40,-1,-40,40,0,3],g,0,0,0.97);addBox(O,[-40,-1,9,40,0,40],g,0,0,0.97);addBox(O,[-40,-1,3,-6,0,9],g,0,0,0.97);addBox(O,[2,-1,3,40,0,9],g,0,0,0.97);
    addBox(O,[-6,-2.4,3,2,-1.4,9],sand,0,0,0.9);
    const blocks=[['stone',[0.5,0.5,0.5],0,0],['sand',sand,0,0],['snow',[0.95,0.95,0.97],0,0],['wood',[0.55,0.4,0.25],0,0],['wool',[0.75,0.15,0.15],0,0],['gold',[0.95,0.8,0.3],10020,0],['glow',[0.9,0.75,0.4],10010,1],['lava',[0.95,0.4,0.1],10011,1],['soul',[0.3,0.7,0.9],10012,1]];
    blocks.forEach((b,i)=>{const x=-8+i*1.9,h=b[0]==='wood'?2.6:1.2;addBox(O,[x,0,-1,x+1.6,h,0.6],b[1],b[2],b[3],0.97);});
    [[-11,-6],[11,-7]].forEach(t=>{addBox(O,[t[0],0,t[1],t[0]+1,4,t[1]+1],[0.4,0.28,0.17],0,0,0.97);
      [[-1.5,3,-1.5,2.5,6,2.5],[-0.5,6,-0.5,1.5,7.2,1.5]].forEach(l=>addBox(O,[t[0]+l[0],l[1],t[1]+l[2],t[0]+l[3],l[4],t[1]+l[5]],[0.3,0.5,0.15],10003,0,0.97));});
    // stone arch & lantern post for richer shadows, AO, and emissive glow
    addBox(O,[-10,0,4,-8.8,3.6,5.2],[0.48,0.48,0.5],0,0,0.97);
    addBox(O,[-10,0,8,-8.8,3.6,9.2],[0.48,0.48,0.5],0,0,0.97);
    addBox(O,[-10,3.6,4,-8.8,4.6,9.2],[0.55,0.55,0.57],0,0,0.97);
    addBox(O,[4.5,0,4.5,4.9,2.8,4.9],[0.38,0.26,0.16],0,0,0.97);
    addBox(O,[4.35,2.8,4.35,5.05,3.5,5.05],[1.0,0.78,0.35],10010,1,0.97);
    // swaying grass tufts
    [[-3,1.5],[3.5,2.2],[6,1.2],[-7,1.8]].forEach(p=>{
      addBox(O,[p[0],0,p[1],p[0]+0.15,0.75,p[1]+0.6],[0.26,0.55,0.2],10002,0,0.97);
      addBox(O,[p[0]-0.2,0,p[1]+0.22,p[0]+0.4,0.75,p[1]+0.37],[0.28,0.58,0.22],10002,0,0.97);
    });
    addBox(Wt,[-6,-0.2,3,2,-0.2001,9],[0.25,0.45,0.9],10001,0,0.97);
    // water: single up-facing quad
    const w=[];const y=-0.2,x0=-6,x1=2,z0=3,z1=9,uvs=[[0,0],[1,0],[1,1],[0,1]],pts=[[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]];
    for(const k of [0,1,2,0,2,3]){const v=pts[k];w.push(v[0],v[1],v[2],1,0,1,0,0.25,0.45,0.9,1,uvs[k][0],uvs[k][1],0,0,0,0.97,0,0,10001,0,0,0,0.5,0.5);}
    return {opaque:new Float32Array(O),water:new Float32Array(w)};
  }
  function vao(data){const v=gl.createVertexArray();gl.bindVertexArray(v);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    const L=[[0,4,0],[1,3,4],[2,4,7],[3,4,11],[4,4,15],[5,4,19],[6,2,23]];L.forEach(a=>{gl.enableVertexAttribArray(a[0]);gl.vertexAttribPointer(a[0],a[1],gl.FLOAT,false,STRIDE,a[2]*4);});
    return {v,n:data.length/25};}
  const S=scene();const opaque=vao(S.opaque),water=vao(S.water);
  function spriteVao(){const v=gl.createVertexArray();gl.bindVertexArray(v);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(6*25),gl.DYNAMIC_DRAW);
    const L=[[0,4,0],[1,3,4],[2,4,7],[3,4,11],[4,4,15],[5,4,19],[6,2,23]];L.forEach(a=>{gl.enableVertexAttribArray(a[0]);gl.vertexAttribPointer(a[0],a[1],gl.FLOAT,false,STRIDE,a[2]*4);});return {v,b};}
  const sprite=spriteVao();
  const quad=(function(){const v=gl.createVertexArray();gl.bindVertexArray(v);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);return v;})();
  // textures
  const noise=(function(){const d=new Uint8Array(16*16*4);let s=7;for(let i=0;i<256;i++){s=(s*1103515245+12345)&0x7fffffff;const v=218+((s>>8)&31);d[i*4]=d[i*4+1]=d[i*4+2]=v;d[i*4+3]=255;}
    const t=tex(16,16,gl.RGBA8,gl.RGBA,gl.UNSIGNED_BYTE,gl.NEAREST,d);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return t;})();
  function canvasTex(draw){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');draw(x);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
  const sunTex=canvasTex(x=>{x.fillStyle='rgb(255,236,180)';x.fillRect(0,0,64,64);x.fillStyle='#fff';x.fillRect(12,12,40,40);});
  const moonTex=canvasTex(x=>{x.fillStyle='rgb(40,44,60)';x.fillRect(0,0,64,64);x.fillStyle='rgb(215,220,235)';x.fillRect(10,10,44,44);x.fillStyle='rgb(160,165,185)';x.fillRect(20,18,10,10);x.fillRect(36,34,12,12);});
  // targets
  let T={};
  function disposeTargets(){liveT.forEach(t=>gl.deleteTexture(t));liveF.forEach(f=>gl.deleteFramebuffer(f));liveT=[];liveF=[];}
  function targets(){
    disposeTargets();track=true;
    T={A:f16(W,H),B:f16(W,H),t1:u8(W,H),t2:u8(W,H),t3:u8(W,H),t4:u8(W,H),d0:dep(W,H),d1:dep(W,H)};
    const SR=currentShadowRes||2048;T.sd=dep(SR,SR);T.sc=u8(SR,SR);
    T.main=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,T.main);
    [T.A,T.t1,T.t2,T.t3,T.t4].forEach((t,i)=>gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0+i,gl.TEXTURE_2D,t,0));gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,T.d0,0);
    T.d1fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,T.d1fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,T.d1,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
    T.stage=[T.A,T.B].map(t=>{const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return f;});
    T.shadow=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,T.shadow);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,T.sc,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,T.sd,0);
    liveF.push(T.main,T.d1fb,T.shadow,...T.stage);track=false;
  }
  let currentShadowRes=2048;
  // ---------- pack ----------
  function setPack(files){
    lastError='';
    for(const k in progs){const p=progs[k];if(p&&p.p)gl.deleteProgram(p.p);if(Array.isArray(p))p.forEach(q=>q&&q.p&&gl.deleteProgram(q.p));}
    progs={};
    const F=files,pre='shaders/';const get=n=>F[pre+n];
    try{
      const shRes=/shadowMapResolution = (\d+)/.exec(get('gbuffers_terrain.fsh'));currentShadowRes=shRes?parseInt(shRes[1]):2048;
      targets();
      progs.terrain=program('terrain',SOL.esVertGeo(get('gbuffers_terrain.vsh')),SOL.esFrag(get('gbuffers_terrain.fsh')));progs.terrainDB=SOL.dbOf(get('gbuffers_terrain.fsh'));
      progs.water=program('water',SOL.esVertGeo(get('gbuffers_water.vsh')),SOL.esFrag(get('gbuffers_water.fsh')));progs.waterDB=SOL.dbOf(get('gbuffers_water.fsh'));
      progs.sky=program('sky',SOL.esVertSky(get('gbuffers_skybasic.vsh')),SOL.esFrag(get('gbuffers_skybasic.fsh')));
      progs.skytex=program('sun and moon',SOL.esVertGeo(get('gbuffers_skytextured.vsh')),SOL.esFrag(get('gbuffers_skytextured.fsh')));
      progs.hasShadow=!!get('shadow.fsh');if(progs.hasShadow)progs.shadow=program('shadow',SOL.esVertGeo(get('shadow.vsh')),SOL.esFrag(get('shadow.fsh')));
      stageNames=[];for(let i=0;i<20;i++){const nm=i?'composite'+i:'composite';if(!get(nm+'.fsh'))break;stageNames.push(nm);}
      progs.stages=stageNames.map(nm=>program(nm,SOL.esVertPost(get(nm+'.vsh')),SOL.esFrag(get(nm+'.fsh'))));
      progs.final=program('final',SOL.esVertPost(get('final.vsh')),SOL.esFrag(get('final.fsh')));
    }catch(e){lastError=e.message;progs={};throw e;}
  }
  // ---------- frame ----------
  function frame(){
    if(!progs.final)return;
    const t=P.time,asp=W/H,fov=62;
    const yaw=P.yaw*Math.PI/180,pit=P.pitch*Math.PI/180,tg=[0,1.0,1.0];
    const eye=[tg[0]+Math.sin(yaw)*Math.cos(pit)*P.dist*-1*-1,tg[1]-Math.sin(pit)*P.dist,tg[2]+Math.cos(yaw)*Math.cos(pit)*P.dist];
    const {R,MV}=M.lookAt(eye,tg);const Pm=M.persp(fov,asp,0.05,256),Pi=M.inv(Pm),Ri=[R[0],R[4],R[8],0,R[1],R[5],R[9],0,R[2],R[6],R[10],0,0,0,0,1];
    const el=P.sunEl*Math.PI/180,az=P.sunAz*Math.PI/180;
    const sd=[Math.cos(el)*Math.sin(az),Math.sin(el),-Math.cos(el)*Math.cos(az)];
    const sunV=M.vec(R,sd).map(v=>v*100),upV=M.vec(R,[0,1,0]).map(v=>v*100);
    const Ldir=P.sunEl>=0?sd:sd.map(v=>-v);const lightV=P.sunEl>=0?sunV:sunV.map(v=>-v);
    const cen=[0,0.5,0];const Cl=[cen[0]+Ldir[0]*120,cen[1]+Ldir[1]*120,cen[2]+Ldir[2]*120];
    const lk=Math.abs(Ldir[1])>0.999?{R:M.id(),MV:M.id()}:M.lookAt(Cl,cen);const SP=M.ortho(26,1,300);
    const SMV=M.mul(lk.MV,[1,0,0,eye[0],0,1,0,eye[1],0,0,1,eye[2],0,0,0,1]);
    const dz=Math.hypot(eye[0]-tg[0],eye[1]-tg[1],eye[2]-tg[2]);const ndc=((256+0.05)/(256-0.05))-(2*256*0.05)/((256-0.05)*dz);
    const U={viewWidth:W,viewHeight:H,gbufferProjectionInverse:Pi,gbufferModelViewInverse:Ri,gbufferProjection:Pm,gbufferModelView:R,gbufferPreviousModelView:R,gbufferPreviousProjection:Pm,
      sunPosition:sunV,upPosition:upV,shadowLightPosition:lightV,rainStrength:P.rain,frameTimeCounter:t,sunAngle:0.12,moonPhase:P.moonPhase|0,worldDay:3,eyeBrightnessSmooth:[240,240],isEyeInWater:0,
      far:256,near:0.05,cameraPosition:eye,previousCameraPosition:eye,centerDepthSmooth:ndc*0.5+0.5,heldBlockLightValue:P.held|0,heldItemId:0,shadowModelView:SMV,shadowProjection:SP,
      u_mv:MV,u_proj:Pm,u_nm:M.col3(R),u_tex0:M.id(),u_tex1:M.id(),fogColor:[0.7,0.8,0.9],skyColor:[0.4,0.6,1]};
    function use(pr,units,extra){gl.useProgram(pr.p);for(const k in U)setU(pr,k,U[k]);if(extra)for(const k in extra)setU(pr,k,extra[k]);
      let i=0;pr.samplers.forEach(n=>{const tx=units[n];if(!tx)return;gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tx);gl.uniform1i(pr.u[n].loc,i);i++;});}
    gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
    // shadow
    if(progs.hasShadow){gl.bindFramebuffer(gl.FRAMEBUFFER,T.shadow);gl.viewport(0,0,currentShadowRes,currentShadowRes);gl.drawBuffers([gl.COLOR_ATTACHMENT0]);gl.clearColor(1,1,1,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const SU=Object.assign({},U,{u_mv:lk.MV,u_proj:SP,u_nm:M.col3(lk.R)});gl.useProgram(progs.shadow.p);for(const k in SU)setU(progs.shadow,k,SU[k]);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,noise);if(progs.shadow.u.u_texture)gl.uniform1i(progs.shadow.u.u_texture.loc,0);
      gl.bindVertexArray(opaque.v);gl.drawArrays(gl.TRIANGLES,0,opaque.n);}
    // main targets
    gl.bindFramebuffer(gl.FRAMEBUFFER,T.main);gl.viewport(0,0,W,H);
    gl.drawBuffers([0,1,2,3,4].map(i=>gl.COLOR_ATTACHMENT0+i));gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    // sky (color 0 only)
    gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.NONE,gl.NONE,gl.NONE,gl.NONE]);gl.disable(gl.DEPTH_TEST);use(progs.sky,{});gl.bindVertexArray(quad);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    // sun and moon sprites
    const upS=M.norm(Math.abs(sd[1])>0.99?[1,0,0]:M.cross([0,1,0],sd)),rS=M.norm(M.cross(sd,upS));
    function spriteQuad(dir,half,tx){const r=M.norm(M.cross([0,1,0],dir));const u=M.cross(dir,r);const c=dir.map(v=>v*100);const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(p=>[c[0]+r[0]*p[0]*half+u[0]*p[1]*half,c[1]+r[1]*p[0]*half+u[1]*p[1]*half,c[2]+r[2]*p[0]*half+u[2]*p[1]*half]);
      const uv=[[0,0],[1,0],[1,1],[0,1]];const d=[];for(const k of [0,1,2,0,2,3]){const p=pts[k];d.push(p[0],p[1],p[2],1,0,0,1,1,1,1,1,uv[k][0],uv[k][1],0,0,0,0,0,0,0,0,0,0,0.5,0.5);}
      gl.bindVertexArray(sprite.v);gl.bindBuffer(gl.ARRAY_BUFFER,sprite.b);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(d));gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tx);gl.drawArrays(gl.TRIANGLES,0,6);}
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);use(progs.skytex,{u_texture:sunTex},{u_mv:R});spriteQuad(sd,15,sunTex);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,moonTex);spriteQuad(sd.map(v=>-v),12,moonTex);gl.disable(gl.BLEND);
    // terrain
    gl.enable(gl.DEPTH_TEST);gl.clear(gl.DEPTH_BUFFER_BIT);
    const dbT=progs.terrainDB;gl.drawBuffers([0,1,2,3,4].map(i=>dbT.indexOf(i)>=0?gl.COLOR_ATTACHMENT0+i:gl.NONE));
    const units={u_texture:noise,shadowtex0:T.sd,shadowtex1:T.sd,shadowcolor0:T.sc};
    use(progs.terrain,units);gl.bindVertexArray(opaque.v);gl.drawArrays(gl.TRIANGLES,0,opaque.n);
    // copy depth (no water) then water
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER,T.main);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,T.d1fb);gl.blitFramebuffer(0,0,W,H,0,0,W,H,gl.DEPTH_BUFFER_BIT,gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER,T.main);const dbW=progs.waterDB;gl.drawBuffers([0,1,2,3,4].map(i=>dbW.indexOf(i)>=0?gl.COLOR_ATTACHMENT0+i:gl.NONE));
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);use(progs.water,{u_texture:noise,shadowtex0:T.sd,shadowtex1:T.sd,shadowcolor0:T.sc});gl.bindVertexArray(water.v);gl.drawArrays(gl.TRIANGLES,0,water.n);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);
    // composite chain
    let src=T.A,si=0;
    progs.stages.forEach(pr=>{const dstIdx=src===T.A?1:0;gl.bindFramebuffer(gl.FRAMEBUFFER,T.stage[dstIdx]);gl.drawBuffers([gl.COLOR_ATTACHMENT0]);gl.viewport(0,0,W,H);
      use(pr,{colortex0:src,colortex1:T.t1,colortex2:T.t2,colortex3:T.t3,colortex4:T.t4,depthtex0:T.d0,depthtex1:T.d1,shadowtex0:T.sd,shadowtex1:T.sd,shadowcolor0:T.sc});gl.bindVertexArray(quad);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);src=dstIdx?T.B:T.A;});
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);use(progs.final,{colortex0:src});gl.bindVertexArray(quad);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  let raf=0,lastMs=0;
  function frameTimed(){const t0=performance.now();frame();lastMs=performance.now()-t0;}
  function loop(){frameTimed();if(P.anim){P.time+=0.03;raf=requestAnimationFrame(loop);}else raf=0;}
  function render(){ if(!raf) frameTimed(); }
  function animate(on){P.anim=on;if(on&&!raf){raf=requestAnimationFrame(loop);}}
  function resize(w,h){W=w;H=h;canvas.width=w;canvas.height=h;if(progs.final)targets();}
  function snapshot(){render();return canvas.toDataURL('image/png');}
  targets();
  return {P,setPack,render,animate,resize,snapshot,get lastMs(){return lastMs;},get error(){return lastError;}};
}
return {create};
})();
