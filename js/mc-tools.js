// Solstice Minecraft Tools: 1.21.5+ Chat-Ready OP Commands, Chaos Summons, God Armor/Shulkers, Banners, Fancy RGB Text & Builders
window.initMcTools=function(root){
  const $=(s,r=root)=>r.querySelector(s);
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;};
  const toast=m=>window.SOL_TOAST&&window.SOL_TOAST(m);
  const copy=txt=>{
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast('Copied command to clipboard!')).catch(()=>prompt('Copy:',txt));
    else prompt('Copy:',txt);
  };
  const fmtStacks=n=>{const st=Math.floor(n/64),rem=n%64;return st?`${st} stack${st>1?'s':''}${rem?' + '+rem:''}`:`${n} blocks`;};

  // Global Minecraft command syntax version: '1215' (1.21.5 - 1.21.11 / 26.x) or '1210' (1.20.5 - 1.21.4)
  let mcVer='1215';
  const fmtEnch=map=>{
    const inner=Object.entries(map).map(([k,v])=>`${k}:${v}`).join(',');
    return mcVer==='1215'?`enchantments={${inner}}`:`enchantments={levels:{${inner}}}`;
  };
  const fmtName=(text,color)=>{
    const clean=String(text).replace(/"/g,'\\"').replace(/'/g,"\\'");
    if(mcVer==='1215') return `item_name={text:"${clean}",color:"${color}"}`;
    return `item_name='{"text":"${clean}","color":"${color}"}'`;
  };
  const fmtEntityName=(text,color='#f43f5e')=>{
    const clean=String(text).replace(/"/g,'\\"').replace(/'/g,"\\'");
    if(mcVer==='1215') return `CustomName:{text:"${clean}",color:"${color}",bold:true}`;
    return `CustomName:'{"text":"${clean}","color":"${color}","bold":true}'`;
  };
  function lenBadge(cmd){
    const n=cmd.length;
    if(n<=256) return `<span class="badge" style="color:var(--ok);border-color:rgba(74,222,128,.35)">${n}/256 Chat Ready</span>`;
    return `<span class="badge hi" title="Over 256 chars: paste inside a Command Block">${n} chars · Needs Command Block</span>`;
  }

  root.innerHTML=`
    <div class="bar panel" style="justify-content:space-between;margin-bottom:14px">
      <div><b>Minecraft Java Command &amp; Build Tools</b> <span class="small">Chat-safe commands (&le;256 chars) plus Command Block kits.</span></div>
      <div class="bar" style="margin:0">
        <label>Version <select id="mcVerSel">
          <option value="1215" selected>Java 1.21.5+ / 26.x (Latest)</option>
          <option value="1210">Java 1.20.5 - 1.21.4</option>
        </select></label>
        <button class="btn alt sm" id="cpCmdBlk" title="Copy command to get a Command Block">Copy /give Command Block</button>
      </div>
    </div>
    <div class="mc-subnav" id="mcnav">
      <button data-sub="op" class="on">OP Weapons &amp; Chaos</button>
      <button data-sub="kits">God Armor &amp; Shulkers</button>
      <button data-sub="banner">Banner Designer (28)</button>
      <button data-sub="text">Fancy RGB Text</button>
      <button data-sub="craft">Potion &amp; Firework</button>
      <button data-sub="circle">Circle &amp; Sphere</button>
      <button data-sub="nether">Nether &amp; Chunk Calc</button>
      <button data-sub="gear">Max Gear Planner</button>
    </div>
    <div id="mcstage"></div>`;

  $('#mcVerSel').onchange=e=>{mcVer=e.target.value;renderSub();toast('Switched command syntax to '+(mcVer==='1215'?'1.21.5+ / 26.x':'1.20.5 - 1.21.4'));};
  $('#cpCmdBlk').onclick=()=>copy('/give @p command_block');

  const stage=$('#mcstage');
  let active='op';
  $('#mcnav').querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{
      active=b.dataset.sub;
      $('#mcnav').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
      renderSub();
    };
  });

  function renderSub(){
    stage.innerHTML='';
    if(active==='op') renderOpCommands();
    else if(active==='kits') renderSmpKits();
    else if(active==='banner') renderBanner();
    else if(active==='text') renderTextGen();
    else if(active==='craft') renderPotionFirework();
    else if(active==='circle') renderCircle();
    else if(active==='nether') renderNether();
    else if(active==='gear') renderGear();
  }

  // ==================== 1. OP WEAPONS & CHAOS SUMMONS (ALL CHAT-READY <= 256 CHARS!) ====================
  function renderOpCommands(){
    const OP_WEAPONS=[
      {
        name:'Knockback 100000 Yeet Stick',tag:'Chat Ready',
        desc:'Launches mobs and players into orbit with Knockback 255 + 100000 knockback attribute.',
        cmd:()=>`/give @p stick[${fmtName('Yeet Stick','#38bdf8')},${fmtEnch({knockback:255})},attribute_modifiers=[{type:attack_knockback,id:"s:k",amount:100000,operation:add_value,slot:mainhand}]]`
      },
      {
        name:'One-Tap God Sword',tag:'1-Shot',
        desc:'999,999 damage per swing, Sharpness 255, Looting 255, Unbreakable.',
        cmd:()=>`/give @p netherite_sword[${fmtName('One-Tap Blade','#f43f5e')},${fmtEnch({sharpness:255,looting:255})},attribute_modifiers=[{type:attack_damage,id:"s:d",amount:999999,operation:add_value,slot:mainhand}],unbreakable={}]`
      },
      {
        name:'Nuclear Mace',tag:'1-Shot',
        desc:'Density 255, Breach 255, Wind Burst 10, 99,999 damage, Unbreakable.',
        cmd:()=>`/give @p mace[${fmtName('Nuclear Mace','#f59e0b')},${fmtEnch({density:255,breach:255,wind_burst:10})},attribute_modifiers=[{type:attack_damage,id:"s:m",amount:99999,operation:add_value,slot:mainhand}],unbreakable={}]`
      },
      {
        name:'Instant-Mine Pickaxe',tag:'Mining',
        desc:'Deletes stone, deepslate, and obsidian instantly with Efficiency 255 + Fortune 50 + huge break speed.',
        cmd:()=>`/give @p netherite_pickaxe[${fmtName('World Eater','#a78bfa')},${fmtEnch({efficiency:255,fortune:50})},attribute_modifiers=[{type:block_break_speed,id:"s:p",amount:200,operation:add_value,slot:mainhand}],unbreakable={}]`
      },
      {
        name:'One-Shot Railgun Bow',tag:'Ranged',
        desc:'Power 255, Punch 255, Flame, Infinity, Unbreakable.',
        cmd:()=>`/give @p bow[${fmtName('Railgun Bow','#22d3ee')},${fmtEnch({power:255,punch:255,flame:1,infinity:1})},unbreakable={}]`
      },
      {
        name:'Machine-Gun Crossbow',tag:'Ranged',
        desc:'Instant reload Quick Charge 5, Multishot, Piercing 255, Unbreakable.',
        cmd:()=>`/give @p crossbow[${fmtName('Minigun','#fb923c')},${fmtEnch({quick_charge:5,multishot:1,piercing:255})},unbreakable={}]`
      },
      {
        name:'Thor Lightning Trident',tag:'Weapon',
        desc:'Impaling 255, Channeling, Loyalty 10, Unbreakable.',
        cmd:()=>`/give @p trident[${fmtName('Stormbreaker','#7dd3fc')},${fmtEnch({impaling:255,channeling:1,loyalty:10})},unbreakable={}]`
      },
      {
        name:'Flash Speed Boots',tag:'Mobility',
        desc:'Super speed, Feather Falling 255, Depth Strider 10, zero fall damage.',
        cmd:()=>`/give @p netherite_boots[${fmtName('Flash Boots','#facc15')},${fmtEnch({feather_falling:255,depth_strider:10})},attribute_modifiers=[{type:movement_speed,id:"s:s",amount:0.5,operation:add_value,slot:feet}],unbreakable={}]`
      },
      {
        name:'God Mode Potion',tag:'Potion',
        desc:'Strength 50, Speed 5, Resistance 5, Regen 10 for 10 minutes.',
        cmd:()=>`/give @p potion[potion_contents={custom_color:4906624,custom_effects:[{id:strength,amplifier:49,duration:12000},{id:speed,amplifier:4,duration:12000},{id:resistance,amplifier:4,duration:12000}]}]`
      }
    ];

    const CHAOS_SUMMONS=[
      {name:'100x Mega Fireball',tag:'Explosive',desc:'Spawns a huge Ghast fireball right in front of you. Punch it to launch!',cmd:'/summon fireball ~ ~2 ~ {ExplosionPower:100b}'},
      {name:'Meteor Strike (Sky Drop)',tag:'Explosive',desc:'Drops a massive ExplosionPower 50 fireball straight down from the sky!',cmd:'/summon fireball ~ ~35 ~ {ExplosionPower:50b,Motion:[0.0,-2.8,0.0]}'},
      {name:'Lightning Storm (All Mobs)',tag:'Chaos',desc:'Strikes every mob within 30 blocks of you with lightning at once!',cmd:'/execute at @e[type=!player,distance=..30] run summon lightning_bolt'},
      {name:'TNT Rain (On Mobs)',tag:'Explosive',desc:'Drops lit TNT from the sky onto every mob within 25 blocks!',cmd:'/execute at @e[type=!player,distance=..25] run summon tnt ~ ~12 ~ {fuse:35}'},
      {name:'Instant TNT Nuke',tag:'Explosive',desc:'Spawns a 1-second fuse TNT right at your spot.',cmd:'/summon tnt ~ ~1 ~ {fuse:20}'},
      {name:'Nuclear Charged Creeper',tag:'Explosive',desc:'Charged Creeper with a 40-block blast radius.',cmd:'/summon creeper ~ ~1 ~ {powered:1b,ExplosionRadius:40b,Fuse:30}'},
      {name:'Blue Wither Skull Cannon',tag:'Explosive',desc:'Spawns a dangerous blue Wither Skull you can punch.',cmd:'/summon wither_skull ~ ~2 ~ {dangerous:1b}'},
      {name:'Mega Wind Charge',tag:'Fun',desc:'Spawns a floating Breeze Wind Charge to punch and launch yourself.',cmd:'/summon wind_charge ~ ~2 ~'},
      {name:'Giant Slime (Size 20)',tag:'Boss',desc:'Spawns an enormous bouncy slime the size of a house.',cmd:'/summon slime ~ ~1 ~ {Size:20}'},
      {name:'Giant 10x Murder Chicken',tag:'Cursed',desc:'A 10x scaled giant chicken roaming your world.',cmd:'/summon chicken ~ ~1 ~ {attributes:[{id:scale,base:10}]}'},
      {name:'Super Fast Horse',tag:'Mount',desc:'Already tamed turbo horse with super speed and mega jump.',cmd:'/summon horse ~ ~1 ~ {Tame:1b,attributes:[{id:movement_speed,base:0.65},{id:jump_strength,base:1.4}]}'},
      {name:'Rainbow Sheep (jeb_)',tag:'Fun',desc:'Color-cycling rainbow disco sheep.',cmd:'/summon sheep ~ ~1 ~ {CustomName:"jeb_"}'},
      {name:'Giant Player (5x Size)',tag:'Player',desc:'Makes you 5x taller with huge reach and stride.',cmd:'/attribute @p scale base set 5'},
      {name:'Ant Player (0.2x Size)',tag:'Player',desc:'Shrinks you tiny so you walk under slabs and 1-block gaps.',cmd:'/attribute @p scale base set 0.2'},
      {name:'Moon Gravity',tag:'Player',desc:'Lowers gravity to 20% for giant moon leaps.',cmd:'/attribute @p gravity base set 0.016'},
      {name:'Reset Scale & Gravity',tag:'Reset',desc:'Resets your player scale back to normal 1.0.',cmd:'/attribute @p scale base set 1'}
    ];

    stage.innerHTML=`
      <h3 style="margin-bottom:8px">OP Weapons &amp; Items (Every command works directly in Chat!)</h3>
      <div class="grid" id="opGrid" style="margin-bottom:22px"></div>

      <h3 style="margin-bottom:8px">Chaos, Fireballs, Lightning, Nukes &amp; Fun Commands</h3>
      <div class="grid" id="chaosGrid" style="margin-bottom:22px"></div>

      <div class="mc-grid">
        <div class="panel">
          <h3>Custom OP Weapon Builder</h3>
          <div class="bar">
            <label>Item <select id="cwItem">
              <option value="stick">Stick</option>
              <option value="netherite_sword" selected>Netherite Sword</option>
              <option value="mace">Mace</option>
              <option value="netherite_pickaxe">Netherite Pickaxe</option>
              <option value="netherite_axe">Netherite Axe</option>
              <option value="wooden_hoe">Wooden Hoe</option>
              <option value="blaze_rod">Blaze Rod</option>
              <option value="cod">Raw Cod</option>
              <option value="cookie">Cookie</option>
              <option value="trident">Trident</option>
            </select></label>
            <label>Name <input id="cwName" type="text" value="Destroyer" style="width:140px"></label>
            <label>Color <input id="cwCol" type="color" value="#38bdf8"></label>
          </div>
          <div class="bar">
            <label>Damage <input id="cwDmg" type="number" value="10000" min="0" max="9999999" style="width:96px"></label>
            <label>Knockback <input id="cwKb" type="number" value="255" min="0" max="100000" style="width:88px"></label>
            <label>Sharpness <input id="cwSharp" type="number" value="255" min="0" max="255" style="width:68px"></label>
            <label>Looting <input id="cwLoot" type="number" value="0" min="0" max="255" style="width:68px"></label>
          </div>
          <div class="bar">
            <label><input type="checkbox" id="cwUnb" checked> Unbreakable</label>
            <label><input type="checkbox" id="cwFast"> Fast Swing</label>
            <span id="cwBadge"></span>
          </div>
          <pre class="codebox" id="cwCmd"></pre>
          <button class="btn brand sm" id="cwCopy">Copy Weapon Command</button>
        </div>

        <div class="panel">
          <h3>Custom Boss &amp; Fireball Spawner</h3>
          <div class="bar">
            <label>Mob <select id="mbType">
              <option value="zombie">Zombie Boss</option>
              <option value="skeleton">Skeleton Sniper</option>
              <option value="creeper">Nuclear Creeper</option>
              <option value="warden">Mega Warden</option>
              <option value="iron_golem">Titan Iron Golem</option>
              <option value="chicken">Giant Chicken</option>
              <option value="slime">Mega Slime</option>
              <option value="giant">Giant Zombie</option>
              <option value="ender_dragon">Ender Dragon</option>
            </select></label>
            <label>Name <input id="mbName" type="text" value="Overlord" style="width:130px"></label>
          </div>
          <div class="bar">
            <label>Max HP <input id="mbHp" type="number" value="500" min="1" max="100000" style="width:86px"></label>
            <label>Scale <input id="mbScale" type="number" value="2.5" step="0.1" min="0.1" max="16" style="width:72px"></label>
            <label>Speed <input id="mbSpd" type="number" value="0.4" step="0.05" min="0.1" max="2" style="width:72px"></label>
          </div>
          <div class="bar">
            <label><input type="checkbox" id="mbGlow" checked> Glowing</label>
            <label><input type="checkbox" id="mbInv"> Invulnerable</label>
            <label><input type="checkbox" id="mbNoAi"> Frozen</label>
            <span id="mbBadge"></span>
          </div>
          <pre class="codebox" id="mbCmd"></pre>
          <button class="btn brand sm" id="mbCopy">Copy /summon Command</button>
        </div>
      </div>`;

    function fillCards(host,items){
      items.forEach(item=>{
        const cStr=typeof item.cmd==='function'?item.cmd():item.cmd;
        const card=el('div','card');
        const body=el('div','body');
        body.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap"><h3>${item.name}</h3>${lenBadge(cStr)}</div><p class="small">${item.desc}</p>`;
        const pre=el('pre','codebox',cStr);pre.style.maxHeight='72px';pre.style.fontSize='11.5px';
        const btn=el('button','btn brand sm','Copy Command');btn.onclick=()=>copy(cStr);
        body.append(pre,btn);card.append(body);host.append(card);
      });
    }
    fillCards($('#opGrid'),OP_WEAPONS);
    fillCards($('#chaosGrid'),CHAOS_SUMMONS);

    function updWeapon(){
      const item=$('#cwItem').value,nm=$('#cwName').value.trim(),col=$('#cwCol').value;
      const dmg=+$('#cwDmg').value||0,kb=+$('#cwKb').value||0;
      const sharp=Math.min(255,+$('#cwSharp').value||0),loot=Math.min(255,+$('#cwLoot').value||0);
      const comps=[];
      if(nm) comps.push(fmtName(nm,col));
      const emap={};
      if(sharp>0) emap.sharpness=sharp;
      if(loot>0) emap.looting=loot;
      if(kb>0) emap.knockback=Math.min(255,kb);
      if(Object.keys(emap).length) comps.push(fmtEnch(emap));
      const attrs=[];
      if(dmg>0) attrs.push(`{type:attack_damage,id:"s:d",amount:${dmg},operation:add_value,slot:mainhand}`);
      if(kb>0) attrs.push(`{type:attack_knockback,id:"s:k",amount:${kb},operation:add_value,slot:mainhand}`);
      if($('#cwFast').checked) attrs.push(`{type:attack_speed,id:"s:s",amount:100,operation:add_value,slot:mainhand}`);
      if(attrs.length) comps.push(`attribute_modifiers=[${attrs.join(',')}]`);
      if($('#cwUnb').checked) comps.push('unbreakable={}');
      const cmd=`/give @p ${item}[${comps.join(',')}]`;
      $('#cwCmd').textContent=cmd;$('#cwBadge').innerHTML=lenBadge(cmd);
    }
    ['#cwItem','#cwName','#cwCol','#cwDmg','#cwKb','#cwSharp','#cwLoot','#cwUnb','#cwFast'].forEach(s=>{$(s).oninput=updWeapon;$(s).onchange=updWeapon;});
    $('#cwCopy').onclick=()=>copy($('#cwCmd').textContent);
    updWeapon();

    function updMob(){
      const mob=$('#mbType').value,nm=$('#mbName').value.trim();
      const hp=+$('#mbHp').value||100,sc=+$('#mbScale').value||1,spd=+$('#mbSpd').value||0.3;
      const tags=[`Health:${hp}f`,`attributes:[{id:max_health,base:${hp}},{id:scale,base:${sc}},{id:movement_speed,base:${spd}}]`];
      if(nm) tags.unshift(fmtEntityName(nm,'#f43f5e'),`CustomNameVisible:1b`);
      if(mob==='creeper') tags.push('powered:1b','ExplosionRadius:20b');
      if(mob==='slime') tags.push('Size:12');
      if($('#mbGlow').checked) tags.push('Glowing:1b');
      if($('#mbInv').checked) tags.push('Invulnerable:1b');
      if($('#mbNoAi').checked) tags.push('NoAI:1b');
      const cmd=`/summon ${mob} ~ ~1 ~ {${tags.join(',')}}`;
      $('#mbCmd').textContent=cmd;$('#mbBadge').innerHTML=lenBadge(cmd);
    }
    ['#mbType','#mbName','#mbHp','#mbScale','#mbSpd','#mbGlow','#mbInv','#mbNoAi'].forEach(s=>{$(s).oninput=updMob;$(s).onchange=updMob;});
    $('#mbCopy').onclick=()=>copy($('#mbCmd').textContent);
    updMob();
  }

  // ==================== 2. GOD ARMOR (CHAT-READY!) & SMP GOD SHULKERS (COMMAND BLOCK) ====================
  function renderSmpKits(){
    const eKey=map=>mcVer==='1215'?`"minecraft:enchantments":{${Object.entries(map).map(([k,v])=>`${k}:${v}`).join(',')}}`:`"minecraft:enchantments":{levels:{${Object.entries(map).map(([k,v])=>`${k}:${v}`).join(',')}}}`;
    const nKey=(t,c)=>mcVer==='1215'?`"minecraft:custom_name":{text:"${t}",color:"${c}",bold:true,italic:false}`:`"minecraft:custom_name":'{"text":"${t}","color":"${c}","bold":true,"italic":false}'`;

    // Chat-ready individual God Armor pieces (EACH <= 256 chars so you don't even need a Command Block!)
    const CHAT_ARMOR=[
      {name:'God Helmet (Chat Ready)',cmd:`/give @p netherite_helmet[${fmtName('God Helmet','#facc15')},${fmtEnch({protection:255,respiration:255,thorns:255})},attribute_modifiers=[{type:max_health,id:"s:h",amount:20,operation:add_value,slot:head}],unbreakable={}]`},
      {name:'God Chestplate (Chat Ready)',cmd:`/give @p netherite_chestplate[${fmtName('God Chest','#facc15')},${fmtEnch({protection:255,thorns:255})},attribute_modifiers=[{type:max_health,id:"s:c",amount:40,operation:add_value,slot:chest}],unbreakable={}]`},
      {name:'God Leggings (Chat Ready)',cmd:`/give @p netherite_leggings[${fmtName('God Legs','#facc15')},${fmtEnch({protection:255,swift_sneak:5,thorns:255})},attribute_modifiers=[{type:max_health,id:"s:l",amount:20,operation:add_value,slot:legs}],unbreakable={}]`},
      {name:'God Boots (Chat Ready)',cmd:`/give @p netherite_boots[${fmtName('God Boots','#facc15')},${fmtEnch({protection:255,feather_falling:255,depth_strider:10})},attribute_modifiers=[{type:movement_speed,id:"s:b",amount:0.15,operation:add_value,slot:feet}],unbreakable={}]`}
    ];

    const G_HELM=`{id:netherite_helmet,count:1,components:{${nKey('God Helmet','#facc15')},${eKey({protection:255,respiration:255,aqua_affinity:1,thorns:255})},"minecraft:attribute_modifiers":[{type:max_health,id:"s:h",amount:20,operation:add_value,slot:head}],"minecraft:unbreakable":{}}}`;
    const G_CHEST=`{id:netherite_chestplate,count:1,components:{${nKey('God Chestplate','#facc15')},${eKey({protection:255,thorns:255})},"minecraft:attribute_modifiers":[{type:max_health,id:"s:c",amount:40,operation:add_value,slot:chest},{type:knockback_resistance,id:"s:ck",amount:1,operation:add_value,slot:chest}],"minecraft:unbreakable":{}}}`;
    const G_LEGS=`{id:netherite_leggings,count:1,components:{${nKey('God Leggings','#facc15')},${eKey({protection:255,swift_sneak:5,thorns:255})},"minecraft:attribute_modifiers":[{type:max_health,id:"s:l",amount:20,operation:add_value,slot:legs}],"minecraft:unbreakable":{}}}`;
    const G_BOOTS=`{id:netherite_boots,count:1,components:{${nKey('God Boots','#facc15')},${eKey({protection:255,feather_falling:255,depth_strider:10,soul_speed:10})},"minecraft:attribute_modifiers":[{type:movement_speed,id:"s:b",amount:0.15,operation:add_value,slot:feet},{type:safe_fall_distance,id:"s:bf",amount:500,operation:add_value,slot:feet}],"minecraft:unbreakable":{}}}`;
    const G_SWORD=`{id:netherite_sword,count:1,components:{${nKey('SMP Slayer','#f43f5e')},${eKey({sharpness:255,looting:255,sweeping_edge:255,fire_aspect:255})},"minecraft:attribute_modifiers":[{type:attack_damage,id:"s:sw",amount:99999,operation:add_value,slot:mainhand}],"minecraft:unbreakable":{}}}`;
    const G_MACE=`{id:mace,count:1,components:{${nKey('Nuclear Mace','#f59e0b')},${eKey({density:255,breach:255,wind_burst:10})},"minecraft:attribute_modifiers":[{type:attack_damage,id:"s:mc",amount:50000,operation:add_value,slot:mainhand}],"minecraft:unbreakable":{}}}`;
    const G_PICK=`{id:netherite_pickaxe,count:1,components:{${nKey('World Eater','#a78bfa')},${eKey({efficiency:255,fortune:50})},"minecraft:attribute_modifiers":[{type:block_break_speed,id:"s:pk",amount:200,operation:add_value,slot:mainhand}],"minecraft:unbreakable":{}}}`;
    const G_BOW=`{id:bow,count:1,components:{${nKey('Railgun Bow','#38bdf8')},${eKey({power:255,punch:255,flame:1,infinity:1})},"minecraft:unbreakable":{}}}`;
    const G_STICK=`{id:stick,count:1,components:{${nKey('Yeet Stick 100000','#22d3ee')},${eKey({knockback:255})},"minecraft:attribute_modifiers":[{type:attack_knockback,id:"s:st",amount:100000,operation:add_value,slot:mainhand}]}}`;
    const G_ELYTRA=`{id:elytra,count:1,components:{${nKey('God Wings','#7dd3fc')},"minecraft:attribute_modifiers":[{type:armor,id:"s:el",amount:20,operation:add_value,slot:chest}],"minecraft:unbreakable":{}}}`;

    const FULL_ARMOR_CMD=`/give @p purple_shulker_box[${fmtName('Full God Armor','#facc15')},container=[{slot:0,item:${G_HELM}},{slot:1,item:${G_CHEST}},{slot:2,item:${G_LEGS}},{slot:3,item:${G_BOOTS}},{slot:4,item:${G_ELYTRA}},{slot:5,item:{id:enchanted_golden_apple,count:64}},{slot:6,item:{id:totem_of_undying,count:1}},{slot:7,item:{id:firework_rocket,count:64}}]]`;
    const SMP_GOD_CMD=`/give @p black_shulker_box[${fmtName('SMP Domination Kit','#f43f5e')},container=[{slot:0,item:${G_HELM}},{slot:1,item:${G_CHEST}},{slot:2,item:${G_LEGS}},{slot:3,item:${G_BOOTS}},{slot:4,item:${G_SWORD}},{slot:5,item:${G_MACE}},{slot:6,item:${G_PICK}},{slot:7,item:${G_BOW}},{slot:8,item:${G_STICK}},{slot:9,item:${G_ELYTRA}},{slot:10,item:{id:firework_rocket,count:64}},{slot:11,item:{id:enchanted_golden_apple,count:64}},{slot:12,item:{id:totem_of_undying,count:1}},{slot:13,item:{id:totem_of_undying,count:1}},{slot:14,item:{id:ender_pearl,count:16}},{slot:15,item:{id:arrow,count:64}},{slot:16,item:{id:end_crystal,count:64}},{slot:17,item:{id:obsidian,count:64}},{slot:18,item:{id:respawn_anchor,count:64}},{slot:19,item:{id:glowstone,count:64}},{slot:20,item:{id:wind_charge,count:64}},{slot:21,item:{id:netherite_block,count:64}}]]`;
    const ADMIN_KIT_CMD=`/give @p cyan_shulker_box[${fmtName('Hidden Admin Blocks','#38bdf8')},container=[{slot:0,item:{id:command_block,count:64}},{slot:1,item:{id:repeating_command_block,count:64}},{slot:2,item:{id:barrier,count:64}},{slot:3,item:{id:light,count:64}},{slot:4,item:{id:debug_stick,count:1}},{slot:5,item:{id:structure_block,count:64}}]]`;

    stage.innerHTML=`
      <h3 style="margin-bottom:8px">Chat-Ready Individual God Armor (No Command Block Needed!)</h3>
      <div class="grid" id="chatArmorGrid" style="margin-bottom:22px"></div>

      <h3 style="margin-bottom:8px">All-in-One Shulker Boxes (Paste into a Command Block)</h3>
      <div class="grid">
        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><h3>Ultimate SMP Domination Shulker</h3>${lenBadge(SMP_GOD_CMD)}</div>
          <p class="small">Full God Armor (+40 hearts), SMP Slayer Sword, Nuclear Mace, World Eater Pickaxe, Railgun Bow, Yeet Stick 100000, Armored Elytra, Rockets, God Apples, Totems, End Crystals, Obsidian, Respawn Anchors, Wind Charges, and 64 Netherite Blocks.</p>
          <pre class="codebox" style="max-height:86px;font-size:11px">${SMP_GOD_CMD}</pre>
          <button class="btn brand sm" id="cpSmp">Copy SMP Domination Shulker</button>
        </div></div>

        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><h3>Full God Armor Set Shulker</h3>${lenBadge(FULL_ARMOR_CMD)}</div>
          <p class="small">All 4 Protection 255 + Thorns 255 God Netherite Armor pieces + Armored Elytra + 64 God Apples + Totem + 64 Rockets in one Purple Shulker Box.</p>
          <pre class="codebox" style="max-height:86px;font-size:11px">${FULL_ARMOR_CMD}</pre>
          <button class="btn brand sm" id="cpArmor">Copy God Armor Shulker</button>
        </div></div>

        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><h3>Hidden Admin Blocks Shulker</h3>${lenBadge(ADMIN_KIT_CMD)}</div>
          <p class="small">Command Blocks, Repeating Command Blocks, Barriers, Light Blocks, Debug Stick, and Structure Blocks.</p>
          <pre class="codebox" style="max-height:86px;font-size:11px">${ADMIN_KIT_CMD}</pre>
          <button class="btn brand sm" id="cpAdm">Copy Admin Blocks Shulker</button>
        </div></div>
      </div>`;

    const cag=$('#chatArmorGrid');
    CHAT_ARMOR.forEach(a=>{
      const card=el('div','card'),body=el('div','body');
      body.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap"><h3>${a.name}</h3>${lenBadge(a.cmd)}</div>`;
      const pre=el('pre','codebox',a.cmd);pre.style.maxHeight='68px';pre.style.fontSize='11.5px';
      const b=el('button','btn brand sm','Copy Command');b.onclick=()=>copy(a.cmd);
      body.append(pre,b);card.append(body);cag.append(card);
    });
    $('#cpSmp').onclick=()=>copy(SMP_GOD_CMD);
    $('#cpArmor').onclick=()=>copy(FULL_ARMOR_CMD);
    $('#cpAdm').onclick=()=>copy(ADMIN_KIT_CMD);
  }

  // ==================== 3. BANNER DESIGNER (28 PRESETS + 35 PATTERNS) ====================
  const DYES=[
    ['white','White','#f9fffe'],['light_gray','Light Gray','#9d9d97'],['gray','Gray','#474f52'],['black','Black','#1d1d21'],
    ['brown','Brown','#835432'],['red','Red','#b02e26'],['orange','Orange','#f9801d'],['yellow','Yellow','#fed83d'],
    ['lime','Lime','#80c71f'],['green','Green','#5e7c16'],['cyan','Cyan','#169c9c'],['light_blue','Light Blue','#3ab3da'],
    ['blue','Blue','#3c44aa'],['purple','Purple','#8932b8'],['magenta','Magenta','#c74ebd'],['pink','Pink','#f38baa']
  ];
  const PATTERNS=[
    ['stripe_bottom','Bottom Stripe'],['stripe_top','Top Stripe'],['stripe_left','Left Stripe'],['stripe_right','Right Stripe'],
    ['stripe_center','Center Pillar'],['stripe_middle','Middle Band'],['small_stripes','Pinstripes'],
    ['stripe_downright','Diagonal Down-Right'],['stripe_downleft','Diagonal Down-Left'],
    ['diagonal_left','Top-Left Triangle'],['diagonal_right','Top-Right Triangle'],['diagonal_up_left','Bottom-Left Triangle'],['diagonal_up_right','Bottom-Right Triangle'],
    ['cross','Saltire Cross X'],['straight_cross','Straight Cross +'],
    ['triangle_bottom','Bottom Chevron'],['triangle_top','Top Chevron'],['triangles_bottom','Bottom Sawtooth'],['triangles_top','Top Sawtooth'],
    ['square_bottom_left','Bottom-Left Corner'],['square_bottom_right','Bottom-Right Corner'],['square_top_left','Top-Left Corner'],['square_top_right','Top-Right Corner'],
    ['rhombus','Diamond'],['circle','Sun / Circle'],['border','Border'],['curly_border','Curly Border'],
    ['gradient','Top Gradient'],['gradient_up','Bottom Gradient'],['half_horizontal','Top Half'],['half_vertical','Left Half'],
    ['bricks','Brick Wall'],['creeper','Creeper Face'],['skull','Skull & Bones'],['flower','Flower Star']
  ];
  const BANNER_PRESETS=[
    {name:'Solstice Sun',base:'blue',layers:[{pattern:'gradient',color:'black'},{pattern:'gradient_up',color:'orange'},{pattern:'circle',color:'yellow'},{pattern:'triangles_bottom',color:'black'},{pattern:'border',color:'black'}]},
    {name:'Cyber Neon',base:'black',layers:[{pattern:'gradient',color:'purple'},{pattern:'gradient_up',color:'magenta'},{pattern:'rhombus',color:'cyan'},{pattern:'cross',color:'black'},{pattern:'curly_border',color:'cyan'}]},
    {name:'Creeper King',base:'lime',layers:[{pattern:'gradient',color:'green'},{pattern:'creeper',color:'black'},{pattern:'triangles_top',color:'yellow'},{pattern:'border',color:'black'}]},
    {name:'Pirate Skull',base:'black',layers:[{pattern:'cross',color:'gray'},{pattern:'skull',color:'white'},{pattern:'curly_border',color:'red'}]},
    {name:'Sakura Moon',base:'pink',layers:[{pattern:'gradient',color:'purple'},{pattern:'circle',color:'white'},{pattern:'flower',color:'pink'},{pattern:'triangles_bottom',color:'magenta'},{pattern:'border',color:'black'}]},
    {name:'Enderman Eyes',base:'black',layers:[{pattern:'stripe_middle',color:'magenta'},{pattern:'stripe_center',color:'black'},{pattern:'stripe_top',color:'black'},{pattern:'stripe_bottom',color:'black'},{pattern:'border',color:'purple'}]},
    {name:'Golden Knight',base:'red',layers:[{pattern:'straight_cross',color:'yellow'},{pattern:'rhombus',color:'white'},{pattern:'curly_border',color:'black'},{pattern:'triangles_top',color:'yellow'}]},
    {name:'Crimson Dragon',base:'black',layers:[{pattern:'gradient_up',color:'red'},{pattern:'triangle_top',color:'orange'},{pattern:'rhombus',color:'black'},{pattern:'flower',color:'red'},{pattern:'curly_border',color:'black'}]},
    {name:'Ocean Wave',base:'blue',layers:[{pattern:'gradient',color:'light_blue'},{pattern:'triangles_bottom',color:'cyan'},{pattern:'stripe_bottom',color:'white'},{pattern:'circle',color:'light_blue'},{pattern:'border',color:'blue'}]},
    {name:'Void Portal',base:'purple',layers:[{pattern:'bricks',color:'magenta'},{pattern:'rhombus',color:'black'},{pattern:'circle',color:'purple'},{pattern:'curly_border',color:'black'}]},
    {name:'Arctic Aurora',base:'black',layers:[{pattern:'gradient',color:'blue'},{pattern:'stripe_downleft',color:'lime'},{pattern:'stripe_downright',color:'cyan'},{pattern:'triangles_bottom',color:'white'},{pattern:'border',color:'black'}]},
    {name:'Fox Face',base:'orange',layers:[{pattern:'triangle_bottom',color:'white'},{pattern:'triangles_top',color:'black'},{pattern:'circle',color:'orange'},{pattern:'stripe_bottom',color:'black'}]},
    {name:'Sunset Mountain',base:'orange',layers:[{pattern:'gradient',color:'purple'},{pattern:'circle',color:'yellow'},{pattern:'triangle_bottom',color:'gray'},{pattern:'triangles_bottom',color:'black'}]},
    {name:'Royal Crown',base:'purple',layers:[{pattern:'triangles_top',color:'yellow'},{pattern:'stripe_top',color:'purple'},{pattern:'rhombus',color:'yellow'},{pattern:'border',color:'yellow'}]},
    {name:'Toxic Hazard',base:'black',layers:[{pattern:'small_stripes',color:'lime'},{pattern:'rhombus',color:'black'},{pattern:'circle',color:'lime'},{pattern:'cross',color:'black'},{pattern:'border',color:'lime'}]},
    {name:'Nordic Frost',base:'light_blue',layers:[{pattern:'straight_cross',color:'white'},{pattern:'cross',color:'blue'},{pattern:'border',color:'white'}]},
    {name:'Warden Depths',base:'black',layers:[{pattern:'gradient_up',color:'cyan'},{pattern:'small_stripes',color:'black'},{pattern:'circle',color:'light_blue'},{pattern:'curly_border',color:'cyan'}]},
    {name:'Axolotl Cute',base:'pink',layers:[{pattern:'stripe_top',color:'magenta'},{pattern:'stripe_bottom',color:'pink'},{pattern:'small_stripes',color:'magenta'},{pattern:'circle',color:'pink'},{pattern:'stripe_middle',color:'black'},{pattern:'stripe_center',color:'pink'}]},
    {name:'Wither Boss',base:'black',layers:[{pattern:'gradient',color:'gray'},{pattern:'skull',color:'black'},{pattern:'triangles_bottom',color:'white'},{pattern:'border',color:'black'}]},
    {name:'Nether Star',base:'black',layers:[{pattern:'gradient',color:'blue'},{pattern:'rhombus',color:'light_blue'},{pattern:'flower',color:'white'},{pattern:'circle',color:'cyan'},{pattern:'border',color:'black'}]},
    {name:'Emerald Crest',base:'green',layers:[{pattern:'gradient',color:'lime'},{pattern:'rhombus',color:'white'},{pattern:'circle',color:'lime'},{pattern:'curly_border',color:'black'}]},
    {name:'Blood Moon',base:'black',layers:[{pattern:'gradient_up',color:'red'},{pattern:'circle',color:'red'},{pattern:'triangles_bottom',color:'black'},{pattern:'border',color:'black'}]},
    {name:'Rising Sun',base:'white',layers:[{pattern:'circle',color:'red'},{pattern:'border',color:'white'}]},
    {name:'Yin Yang',base:'white',layers:[{pattern:'half_vertical',color:'black'},{pattern:'circle',color:'white'},{pattern:'diagonal_up_right',color:'black'},{pattern:'border',color:'gray'}]},
    {name:'Blaze Core',base:'yellow',layers:[{pattern:'gradient_up',color:'red'},{pattern:'triangles_top',color:'orange'},{pattern:'rhombus',color:'yellow'},{pattern:'curly_border',color:'red'}]},
    {name:'Honeybee',base:'yellow',layers:[{pattern:'stripe_middle',color:'black'},{pattern:'stripe_bottom',color:'black'},{pattern:'stripe_top',color:'orange'},{pattern:'border',color:'black'}]},
    {name:'Phantom Night',base:'blue',layers:[{pattern:'gradient',color:'black'},{pattern:'triangle_top',color:'light_blue'},{pattern:'stripe_middle',color:'lime'},{pattern:'stripe_center',color:'blue'},{pattern:'curly_border',color:'black'}]},
    {name:'Diamond Shield',base:'cyan',layers:[{pattern:'gradient',color:'light_blue'},{pattern:'rhombus',color:'white'},{pattern:'straight_cross',color:'cyan'},{pattern:'curly_border',color:'blue'}]}
  ];
  let bBase='blue',bLayers=BANNER_PRESETS[0].layers.map(x=>({...x})),bPickCol='white',bPickPat='creeper';

  function renderBanner(){
    stage.innerHTML=`
      <div class="panel" style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
          <b>28 Ready-to-Use Banner Presets</b>
          <span class="small">Click any design to load and customize it</span>
        </div>
        <div class="bar" id="bPresRow" style="margin:0"></div>
      </div>
      <div class="mc-grid">
        <div class="panel">
          <h3>Banner Pattern Builder</h3>
          <div class="small">Base banner color</div>
          <div class="dye-row" id="bBaseRow"></div>
          <div class="bar" style="margin-top:10px">
            <label>Pattern <select id="bPatSel">${PATTERNS.map(p=>`<option value="${p[0]}">${p[1]}</option>`).join('')}</select></label>
            <button class="btn brand sm" id="bAdd">+ Add layer</button>
            <button class="btn alt sm" id="bRand">Randomize</button>
            <button class="btn alt sm" id="bClr">Clear</button>
          </div>
          <div class="small">Pattern dye color</div>
          <div class="dye-row" id="bColRow"></div>
          <div style="margin-top:12px"><b>Layers (bottom to top)</b></div>
          <div id="bList" style="margin-top:6px"></div>
          <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center"><b>/give Command</b><span id="bBadge"></span></div>
          <pre class="codebox" id="bCmd"></pre>
          <div class="bar" style="margin:0">
            <button class="btn brand sm" id="bCopy">Copy Banner /give</button>
            <button class="btn alt sm" id="bShield">Copy Matching Shield /give</button>
          </div>
        </div>
        <div class="panel" style="display:flex;flex-direction:column;align-items:center;gap:12px">
          <h3>Live Banner Preview</h3>
          <canvas id="bCv" width="240" height="480" style="border:1px solid var(--edge);border-radius:4px;background:#050c1f;image-rendering:pixelated"></canvas>
          <div class="small">Works on both Banners and Shields! Compact syntax keeps most banners under 256 chars for direct chat paste.</div>
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
    const prRow=$('#bPresRow');
    BANNER_PRESETS.forEach(p=>{
      const b=el('button','btn alt sm',p.name);
      b.onclick=()=>{bBase=p.base;bLayers=p.layers.map(x=>({...x}));mkDyes($('#bBaseRow'),bBase,v=>{bBase=v;drawBanner();});drawBanner();};
      prRow.append(b);
    });
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
      else if(pat==='small_stripes'){for(let i=0;i<5;i++)ctx.fillRect(i*W*0.22,0,W*0.11,H);}
      else if(pat==='half_horizontal') ctx.fillRect(0,0,W,H*0.5);
      else if(pat==='half_vertical') ctx.fillRect(0,0,W*0.5,H);
      else if(pat==='square_bottom_left') ctx.fillRect(0,H*0.72,W*0.45,H*0.28);
      else if(pat==='square_bottom_right') ctx.fillRect(W*0.55,H*0.72,W*0.45,H*0.28);
      else if(pat==='square_top_left') ctx.fillRect(0,0,W*0.45,H*0.28);
      else if(pat==='square_top_right') ctx.fillRect(W*0.55,0,W*0.45,H*0.28);
      else if(pat==='diagonal_left'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.lineTo(0,H);ctx.closePath();ctx.fill();}
      else if(pat==='diagonal_right'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W,0);ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
      else if(pat==='diagonal_up_left'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,H);ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
      else if(pat==='diagonal_up_right'){ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();}
      else if(pat==='stripe_downright'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.26,0);ctx.lineTo(W,H);ctx.lineTo(W*0.74,H);ctx.closePath();ctx.fill();}
      else if(pat==='stripe_downleft'){ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W*0.74,0);ctx.lineTo(0,H);ctx.lineTo(W*0.26,H);ctx.closePath();ctx.fill();}
      else if(pat==='cross'){
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W*0.24,0);ctx.lineTo(W,H);ctx.lineTo(W*0.76,H);ctx.closePath();ctx.fill();
        ctx.beginPath();ctx.moveTo(W,0);ctx.lineTo(W*0.76,0);ctx.lineTo(0,H);ctx.lineTo(W*0.24,H);ctx.closePath();ctx.fill();
      }else if(pat==='straight_cross'){ctx.fillRect(W*0.38,0,W*0.24,H);ctx.fillRect(0,H*0.42,W,H*0.16);}
      else if(pat==='triangle_bottom'){ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(W/2,H*0.55);ctx.lineTo(W,H);ctx.closePath();ctx.fill();}
      else if(pat==='triangle_top'){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W/2,H*0.45);ctx.lineTo(W,0);ctx.closePath();ctx.fill();}
      else if(pat==='triangles_bottom'){for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(i*W/4,H);ctx.lineTo((i+0.5)*W/4,H*0.86);ctx.lineTo((i+1)*W/4,H);ctx.closePath();ctx.fill();}}
      else if(pat==='triangles_top'){for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(i*W/4,0);ctx.lineTo((i+0.5)*W/4,H*0.14);ctx.lineTo((i+1)*W/4,0);ctx.closePath();ctx.fill();}}
      else if(pat==='rhombus'){ctx.beginPath();ctx.moveTo(W/2,H*0.22);ctx.lineTo(W*0.86,H/2);ctx.lineTo(W/2,H*0.78);ctx.lineTo(W*0.14,H/2);ctx.closePath();ctx.fill();}
      else if(pat==='circle'){ctx.beginPath();ctx.arc(W/2,H/2,W*0.28,0,Math.PI*2);ctx.fill();}
      else if(pat==='border'){const t=W*0.11;ctx.fillRect(0,0,W,t);ctx.fillRect(0,H-t,W,t);ctx.fillRect(0,0,t,H);ctx.fillRect(W-t,0,t,H);}
      else if(pat==='curly_border'){
        const t=W*0.11;ctx.fillRect(0,0,W,t);ctx.fillRect(0,H-t,W,t);ctx.fillRect(0,0,t,H);ctx.fillRect(W-t,0,t,H);
        for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(t,i*H/6);ctx.lineTo(t*2.1,(i+0.5)*H/6);ctx.lineTo(t,(i+1)*H/6);ctx.fill();ctx.beginPath();ctx.moveTo(W-t,i*H/6);ctx.lineTo(W-t*2.1,(i+0.5)*H/6);ctx.lineTo(W-t,(i+1)*H/6);ctx.fill();}
      }
      else if(pat==='gradient'){const g=ctx.createLinearGradient(0,0,0,H*0.75);g.addColorStop(0,hex);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      else if(pat==='gradient_up'){const g=ctx.createLinearGradient(0,H,0,H*0.25);g.addColorStop(0,hex);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      else if(pat==='bricks'){
        ctx.strokeStyle=hex;ctx.lineWidth=4;
        for(let r=0;r<12;r++){const y=r*(H/12);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
          for(let c=0;c<4;c++){const x=(c+(r%2?0.5:0))*(W/4);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+H/12);ctx.stroke();}}
      }
      else if(pat==='creeper'){
        const s=W/8;
        ctx.fillRect(s*1.5,H*0.32,s*2,s*2);ctx.fillRect(s*4.5,H*0.32,s*2,s*2);
        ctx.fillRect(s*3,H*0.32+s*2,s*2,s*2.5);
        ctx.fillRect(s*2,H*0.32+s*3,s*1.2,s*3);ctx.fillRect(s*4.8,H*0.32+s*3,s*1.2,s*3);
      }
      else if(pat==='skull'){
        ctx.beginPath();ctx.arc(W/2,H*0.42,W*0.26,0,Math.PI*2);ctx.fill();
        ctx.fillRect(W*0.35,H*0.50,W*0.30,H*0.10);
        ctx.lineWidth=W*0.09;ctx.strokeStyle=hex;
        ctx.beginPath();ctx.moveTo(W*0.2,H*0.66);ctx.lineTo(W*0.8,H*0.78);ctx.moveTo(W*0.8,H*0.66);ctx.lineTo(W*0.2,H*0.78);ctx.stroke();
        ctx.globalCompositeOperation='destination-out';
        ctx.beginPath();ctx.arc(W*0.40,H*0.42,W*0.06,0,Math.PI*2);ctx.arc(W*0.60,H*0.42,W*0.06,0,Math.PI*2);ctx.fill();
      }
      else if(pat==='flower'){
        ctx.translate(W/2,H/2);
        for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.ellipse(0,-W*0.20,W*0.09,W*0.16,0,0,Math.PI*2);ctx.fill();}
        ctx.beginPath();ctx.arc(0,0,W*0.12,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    function drawBanner(){
      const cv=$('#bCv'),ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
      ctx.fillStyle=dyeHex(bBase);ctx.fillRect(0,0,W,H);
      bLayers.forEach(l=>drawPat(ctx,l.pattern,dyeHex(l.color),W,H));
      ctx.fillStyle='rgba(0,0,0,0.05)';
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

      const pats=bLayers.map(l=>`{pattern:${l.pattern},color:${l.color}}`).join(',');
      const cmd=`/give @p ${bBase}_banner${bLayers.length?`[banner_patterns=[${pats}]]`:''}`;
      $('#bCmd').textContent=cmd;$('#bBadge').innerHTML=lenBadge(cmd);
    }

    $('#bAdd').onclick=()=>{bLayers.push({pattern:bPickPat,color:bPickCol});drawBanner();};
    $('#bClr').onclick=()=>{bLayers=[];drawBanner();};
    $('#bRand').onclick=()=>{
      bBase=DYES[Math.floor(Math.random()*DYES.length)][0];
      bLayers=[];
      const n=3+Math.floor(Math.random()*3);
      for(let i=0;i<n;i++) bLayers.push({pattern:PATTERNS[Math.floor(Math.random()*PATTERNS.length)][0],color:DYES[Math.floor(Math.random()*DYES.length)][0]});
      mkDyes($('#bBaseRow'),bBase,v=>{bBase=v;drawBanner();});
      drawBanner();
    };
    $('#bCopy').onclick=()=>copy($('#bCmd').textContent);
    $('#bShield').onclick=()=>{
      const pats=bLayers.map(l=>`{pattern:${l.pattern},color:${l.color}}`).join(',');
      copy(`/give @p shield[base_color=${bBase}${bLayers.length?`,banner_patterns=[${pats}]`:''}]`);
    };
    drawBanner();
  }

  // ==================== 4. FANCY RGB TEXT STUDIO ====================
  const TEXT_PRESETS=[
    ['Rainbow',['#ff3b30','#ffcc00','#34c759','#38bdf8','#a855f7']],
    ['Cyberpunk',['#00f5ff','#a855f7','#ff2a85']],
    ['Fire',['#fef08a','#f97316','#dc2626']],
    ['Ocean',['#bae6fd','#38bdf8','#1d4ed8']],
    ['Sakura',['#fdf2f8','#f472b6','#c084fc']],
    ['Toxic',['#d9f99d','#22c55e','#0d9488']],
    ['Gold',['#fef9c3','#facc15','#b45309']],
    ['Void',['#e0e7ff','#818cf8','#312e81']]
  ];
  const SMALL_CAPS={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
  const toSmallCaps=s=>[...s].map(c=>SMALL_CAPS[c.toLowerCase()]||c).join('');
  const toWide=s=>[...s].map(c=>{const k=c.charCodeAt(0);return k>=33&&k<=126?String.fromCharCode(k+65248):c;}).join('');

  function renderTextGen(){
    let stops=['#38bdf8','#a855f7','#f472b6'];
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Fancy RGB Text &amp; Font Studio</h3>
        <div class="bar"><input id="txIn" type="text" value="Solstice" style="flex:1;min-width:200px"></div>
        <div class="small" style="margin-bottom:4px">1-Click Gradient Presets</div>
        <div class="bar" id="txPres"></div>
        <div class="bar">
          <label>Color 1 <input id="txC1" type="color" value="#38bdf8"></label>
          <label>Color 2 <input id="txC2" type="color" value="#a855f7"></label>
          <label>Color 3 <input id="txC3" type="color" value="#f472b6"></label>
        </div>
        <div class="bar">
          <label>Text Transform <select id="txStyle">
            <option value="normal">Normal</option>
            <option value="smallcaps">Small Caps (ꜱᴏʟꜱᴛɪᴄᴇ)</option>
            <option value="wide">Vaporwave Wide</option>
            <option value="stars">✦ Sparkle Frame ✦</option>
            <option value="swords">⚔ Battle Frame ⚔</option>
            <option value="glitch">Glitch Edges (§k)</option>
          </select></label>
        </div>
        <div class="bar">
          <label><input type="checkbox" id="txBold" checked> Bold</label>
          <label><input type="checkbox" id="txItal"> Italic</label>
          <label><input type="checkbox" id="txUnd"> Underline</label>
          <label><input type="checkbox" id="txStr"> Strike</label>
        </div>
        <div class="small" style="margin-bottom:6px">Live Minecraft Chat Preview</div>
        <div class="mc-preview-chat" id="txPrev"></div>
      </div>
      <div class="panel">
        <h3>Generated Commands</h3>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/tellraw (Chat broadcast)</b><span id="bgTell"></span><button class="btn alt sm" id="cpTell">Copy</button></div>
        <pre class="codebox" id="outTell"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/title (Big screen title)</b><button class="btn alt sm" id="cpTitle">Copy</button></div>
        <pre class="codebox" id="outTitle"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/title actionbar</b><button class="btn alt sm" id="cpAct">Copy</button></div>
        <pre class="codebox" id="outAct"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/give Renamed Netherite Sword</b><button class="btn alt sm" id="cpGive">Copy</button></div>
        <pre class="codebox" id="outGive"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>Spigot / Paper Hex (§x format)</b><button class="btn alt sm" id="cpHex">Copy</button></div>
        <pre class="codebox" id="outHex"></pre>
      </div>
    </div>`;

    const hexToRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
    function sampleStops(arr,t){
      const pos=t*(arr.length-1),i=Math.min(arr.length-2,Math.floor(pos)),f=pos-i;
      const a=hexToRgb(arr[i]),b=hexToRgb(arr[i+1]);
      return toHex(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f);
    }

    const prBox=$('#txPres');
    TEXT_PRESETS.forEach(([nm,cols])=>{
      const b=el('button','btn alt sm',nm);
      b.onclick=()=>{stops=cols.slice();$('#txC1').value=cols[0];$('#txC2').value=cols[Math.floor(cols.length/2)];$('#txC3').value=cols[cols.length-1];update();};
      prBox.append(b);
    });

    function update(){
      let txt=$('#txIn').value||'Solstice';
      const st=$('#txStyle').value;
      if(st==='smallcaps') txt=toSmallCaps(txt);
      else if(st==='wide') txt=toWide(txt);
      else if(st==='stars') txt=`✦ ${txt} ✦`;
      else if(st==='swords') txt=`⚔ ${txt} ⚔`;

      const bold=$('#txBold').checked,ital=$('#txItal').checked,und=$('#txUnd').checked,str=$('#txStr').checked;
      const chars=[...txt],n=Math.max(1,chars.length-1);
      const prev=$('#txPrev');prev.innerHTML='';
      const comps=[];
      let hexStr='';

      if(st==='glitch'){comps.push({text:'|',color:stops[0],obfuscated:true,bold});const g1=el('span',null,'▓ ');g1.style.color=stops[0];prev.append(g1);}
      chars.forEach((ch,i)=>{
        const col=sampleStops(stops,i/n);
        const sp=el('span',null,ch);sp.style.color=col;
        if(bold) sp.style.fontWeight='700';if(ital) sp.style.fontStyle='italic';
        if(und||str) sp.style.textDecoration=(und?'underline ':'')+(str?'line-through':'');
        prev.append(sp);
        const o={text:ch,color:col};
        if(bold) o.bold=true;if(ital) o.italic=true;if(und) o.underlined=true;if(str) o.strikethrough=true;
        comps.push(o);
        const h6=col.slice(1);
        hexStr+=`§x§${h6[0]}§${h6[1]}§${h6[2]}§${h6[3]}§${h6[4]}§${h6[5]}${bold?'§l':''}${ital?'§o':''}${und?'§n':''}${str?'§m':''}${ch}`;
      });
      if(st==='glitch'){comps.push({text:'|',color:stops[stops.length-1],obfuscated:true,bold});const g2=el('span',null,' ▓');g2.style.color=stops[stops.length-1];prev.append(g2);}

      const json=JSON.stringify(comps);
      const tell=`/tellraw @a ${json}`;
      $('#outTell').textContent=tell;$('#bgTell').innerHTML=lenBadge(tell);
      $('#outTitle').textContent=`/title @a title ${json}`;
      $('#outAct').textContent=`/title @a actionbar ${json}`;
      $('#outGive').textContent=mcVer==='1215'
        ?`/give @p netherite_sword[custom_name=${json}]`
        :`/give @p netherite_sword[custom_name='${json.replace(/'/g,"\\'")}']`;
      $('#outHex').textContent=hexStr;
    }
    ['#txC1','#txC2','#txC3'].forEach(s=>$(s).oninput=()=>{stops=[$('#txC1').value,$('#txC2').value,$('#txC3').value];update();});
    ['#txIn','#txStyle','#txBold','#txItal','#txUnd','#txStr'].forEach(s=>{$(s).oninput=update;$(s).onchange=update;});
    $('#cpTell').onclick=()=>copy($('#outTell').textContent);
    $('#cpTitle').onclick=()=>copy($('#outTitle').textContent);
    $('#cpAct').onclick=()=>copy($('#outAct').textContent);
    $('#cpGive').onclick=()=>copy($('#outGive').textContent);
    $('#cpHex').onclick=()=>copy($('#outHex').textContent);
    update();
  }

  // ==================== 5. CUSTOM POTION & FIREWORK ROCKET BUILDER ====================
  function renderPotionFirework(){
    const FX_LIST=[['strength','Strength'],['speed','Speed'],['resistance','Resistance'],['regeneration','Regeneration'],['jump_boost','Jump Boost'],['haste','Haste'],['night_vision','Night Vision'],['fire_resistance','Fire Resistance'],['invisibility','Invisibility'],['health_boost','Health Boost'],['absorption','Absorption'],['slow_falling','Slow Falling'],['levitation','Levitation'],['hero_of_the_village','Hero of the Village']];
    let potFx=[{id:'strength',amp:10,dur:600},{id:'speed',amp:4,dur:600}];

    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Custom Super Potion Builder</h3>
        <div class="bar">
          <label>Name <input id="ptName" type="text" value="Hyper Brew" style="width:130px"></label>
          <label>Bottle <select id="ptType"><option value="potion">Drinkable</option><option value="splash_potion">Splash</option><option value="lingering_potion">Lingering</option></select></label>
          <label>Color <input id="ptCol" type="color" value="#38bdf8"></label>
        </div>
        <div class="bar">
          <select id="ptAddSel">${FX_LIST.map(f=>`<option value="${f[0]}">${f[1]}</option>`).join('')}</select>
          <label>Lv <input id="ptAmp" type="number" value="10" min="1" max="255" style="width:62px"></label>
          <label>Sec <input id="ptDur" type="number" value="600" min="1" max="99999" style="width:72px"></label>
          <button class="btn brand sm" id="ptAdd">+ Add</button>
        </div>
        <div id="ptList" style="margin:8px 0"></div>
        <div style="margin-bottom:4px" id="ptBadge"></div>
        <pre class="codebox" id="ptCmd"></pre>
        <button class="btn brand sm" id="ptCopy">Copy Potion /give</button>
      </div>

      <div class="panel">
        <h3>Custom Firework Rocket Designer</h3>
        <div class="bar">
          <label>Shape <select id="fwShape"><option value="large_ball">Large Ball</option><option value="star">Star</option><option value="creeper">Creeper Face</option><option value="burst">Burst</option><option value="small_ball">Small Ball</option></select></label>
          <label>Flight <select id="fwFlight"><option value="1">1 (Short)</option><option value="2" selected>2 (Medium)</option><option value="3">3 (High)</option></select></label>
          <label>Count <input id="fwCnt" type="number" value="64" min="1" max="64" style="width:66px"></label>
        </div>
        <div class="bar">
          <label>Color 1 <input id="fwC1" type="color" value="#38bdf8"></label>
          <label>Color 2 <input id="fwC2" type="color" value="#f43f5e"></label>
          <label>Fade <input id="fwFade" type="color" value="#facc15"></label>
        </div>
        <div class="bar">
          <label><input type="checkbox" id="fwTrail" checked> Sparkle Trail</label>
          <label><input type="checkbox" id="fwTwink" checked> Twinkle</label>
          <span id="fwBadge"></span>
        </div>
        <pre class="codebox" id="fwCmd"></pre>
        <button class="btn brand sm" id="fwCopy">Copy Firework /give</button>
      </div>
    </div>`;

    const hexInt=h=>parseInt(h.slice(1),16);
    function updPot(){
      const list=$('#ptList');list.innerHTML='';
      potFx.forEach((f,i)=>{
        const row=el('div','layer-item');
        row.innerHTML=`<span><b>${f.id.replace(/_/g,' ')}</b> Lv ${f.amp} (${f.dur}s)</span>`;
        const del=el('button','btn alt sm','Remove');del.onclick=()=>{potFx.splice(i,1);updPot();};
        row.append(del);list.append(row);
      });
      if(!potFx.length) list.append(el('div','small','No effects added yet.'));
      const nm=$('#ptName').value.trim(),type=$('#ptType').value,col=$('#ptCol').value;
      const fxStr=potFx.map(f=>`{id:${f.id},amplifier:${Math.max(0,f.amp-1)},duration:${f.dur*20}}`).join(',');
      const comps=[];
      if(nm) comps.push(fmtName(nm,col));
      comps.push(`potion_contents={custom_color:${hexInt(col)},custom_effects:[${fxStr}]}`);
      const cmd=`/give @p ${type}[${comps.join(',')}]`;
      $('#ptCmd').textContent=cmd;$('#ptBadge').innerHTML=lenBadge(cmd);
    }
    $('#ptAdd').onclick=()=>{potFx.push({id:$('#ptAddSel').value,amp:Math.min(255,+$('#ptAmp').value||1),dur:+$('#ptDur').value||60});updPot();};
    ['#ptName','#ptType','#ptCol'].forEach(s=>{$(s).oninput=updPot;$(s).onchange=updPot;});
    $('#ptCopy').onclick=()=>copy($('#ptCmd').textContent);
    updPot();

    function updFw(){
      const sh=$('#fwShape').value,fl=+$('#fwFlight').value,cnt=+$('#fwCnt').value||64;
      const c1=hexInt($('#fwC1').value),c2=hexInt($('#fwC2').value),fade=hexInt($('#fwFade').value);
      const tr=$('#fwTrail').checked?'true':'false',tw=$('#fwTwink').checked?'true':'false';
      const cmd=`/give @p firework_rocket[fireworks={flight_duration:${fl},explosions:[{shape:${sh},colors:[I;${c1},${c2}],fade_colors:[I;${fade}],has_trail:${tr},has_twinkle:${tw}}]}] ${cnt}`;
      $('#fwCmd').textContent=cmd;$('#fwBadge').innerHTML=lenBadge(cmd);
    }
    ['#fwShape','#fwFlight','#fwCnt','#fwC1','#fwC2','#fwFade','#fwTrail','#fwTwink'].forEach(s=>{$(s).oninput=updFw;$(s).onchange=updFw;});
    $('#fwCopy').onclick=()=>copy($('#fwCmd').textContent);
    updFw();
  }

  // ==================== 6. CIRCLE, DOME & SPHERE BUILDER ====================
  function renderCircle(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Blueprint Controls</h3>
        <div class="bar"><label>Shape <select id="bpShape"><option value="circle">Hollow Circle</option><option value="disc">Filled Disc</option><option value="dome">3D Dome (Layer Slice)</option><option value="sphere">3D Sphere (Layer Slice)</option></select></label></div>
        <div class="bar"><label style="flex:1">Diameter: <b id="bpDiaV">19</b> blocks <input id="bpDia" type="range" min="5" max="63" value="19" style="flex:1"></label></div>
        <div class="bar" id="bpLayerRow" hidden><label style="flex:1">Y Layer: <b id="bpLayV">1</b> <input id="bpLay" type="range" min="1" max="19" value="1" style="flex:1"></label></div>
        <div class="bar"><label><input type="checkbox" id="bpCenter" checked> Show center crosshair</label><button class="btn alt sm" id="bpPng">Download Blueprint PNG</button></div>
        <div class="stat-grid">
          <div class="stat-card"><small>Layer blocks</small><strong id="bpLayerCnt">0</strong></div>
          <div class="stat-card"><small>Layer stacks</small><strong id="bpLayerSt">0</strong></div>
          <div class="stat-card"><small>Total build blocks</small><strong id="bpTotCnt">0</strong></div>
          <div class="stat-card"><small>Total stacks</small><strong id="bpTotSt">0</strong></div>
        </div>
      </div>
      <div class="panel" style="text-align:center"><canvas class="bp-canvas" id="bpCv" width="520" height="520"></canvas></div>
    </div>`;

    const cv=$('#bpCv'),ctx=cv.getContext('2d'),shapeSel=$('#bpShape'),diaIn=$('#bpDia'),layIn=$('#bpLay'),layRow=$('#bpLayerRow'),chkC=$('#bpCenter');
    function voxelOn(shape,d,x,y,z){
      const r=d/2,cx=x+0.5-r,cz=z+0.5-r;
      if(shape==='circle'||shape==='disc'){const dist=Math.hypot(cx,cz);return shape==='disc'?dist<=r:(dist<=r&&dist>=r-1.08);}
      const cy=shape==='dome'?(y+0.5):(y+0.5-r),dist=Math.hypot(cx,cy,cz);
      return dist<=r&&dist>=r-1.08;
    }
    function draw(){
      const sh=shapeSel.value,d=+diaIn.value;$('#bpDiaV').textContent=d;
      const is3d=sh==='dome'||sh==='sphere';layRow.hidden=!is3d;
      const maxY=sh==='dome'?Math.ceil(d/2):d;layIn.max=maxY;if(+layIn.value>maxY)layIn.value=maxY;
      const curY=+layIn.value-1;$('#bpLayV').textContent=`${curY+1} / ${maxY}`;
      const W=cv.width,pad=16,cell=(W-pad*2)/d;
      ctx.fillStyle='#050c1f';ctx.fillRect(0,0,W,W);
      let layerCnt=0,totalCnt=0;
      for(let z=0;z<d;z++)for(let x=0;x<d;x++){
        const on=voxelOn(sh,d,x,curY,z),prevOn=is3d&&curY>0&&voxelOn(sh,d,x,curY-1,z),px=pad+x*cell,py=pad+z*cell;
        if(on){layerCnt++;ctx.fillStyle='#7dd3fc';ctx.fillRect(px+0.8,py+0.8,Math.max(1,cell-1.6),Math.max(1,cell-1.6));}
        else if(prevOn){ctx.fillStyle='rgba(141,156,196,0.22)';ctx.fillRect(px+1,py+1,Math.max(1,cell-2),Math.max(1,cell-2));}
        if(d<=45){ctx.strokeStyle='#16254d';ctx.lineWidth=1;ctx.strokeRect(px,py,cell,cell);}
      }
      if(chkC.checked){ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,pad);ctx.lineTo(W/2,W-pad);ctx.moveTo(pad,W/2);ctx.lineTo(W-pad,W/2);ctx.stroke();}
      if(is3d){for(let y=0;y<maxY;y++)for(let z=0;z<d;z++)for(let x=0;x<d;x++)if(voxelOn(sh,d,x,y,z))totalCnt++;}else totalCnt=layerCnt;
      $('#bpLayerCnt').textContent=layerCnt;$('#bpLayerSt').textContent=fmtStacks(layerCnt);
      $('#bpTotCnt').textContent=totalCnt;$('#bpTotSt').textContent=fmtStacks(totalCnt);
    }
    [shapeSel,diaIn,layIn,chkC].forEach(x=>{x.oninput=draw;x.onchange=draw;});
    $('#bpPng').onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=`solstice_${shapeSel.value}_${diaIn.value}.png`;a.click();toast('Saved blueprint PNG!');};
    draw();
  }

  // ==================== 7. NETHER PORTAL, CHUNK & DISTANCE CALC ====================
  function renderNether(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Overworld &amp; Nether Portal Linker</h3>
        <div class="bar"><b>Overworld</b><label>X <input id="owX" type="number" value="800" style="width:90px"></label><label>Y <input id="owY" type="number" value="64" style="width:76px"></label><label>Z <input id="owZ" type="number" value="-400" style="width:90px"></label></div>
        <div class="bar"><b>Nether&nbsp;&nbsp;&nbsp;&nbsp;</b><label>X <input id="ntX" type="number" value="100" style="width:90px"></label><label>Y <input id="ntY" type="number" value="64" style="width:76px"></label><label>Z <input id="ntZ" type="number" value="-50" style="width:90px"></label></div>
        <div class="stat-grid">
          <div class="stat-card"><small>Overworld Chunk</small><strong id="ckOw">50, -25</strong></div>
          <div class="stat-card"><small>Region File</small><strong id="rgOw">r.1.-1.mca</strong></div>
          <div class="stat-card"><small>Chunk Offset</small><strong id="offOw">0, 0</strong></div>
        </div>
      </div>
      <div class="panel">
        <h3>Waypoint Distance &amp; Travel Time</h3>
        <div class="bar"><b>From</b><label>X <input id="dX1" type="number" value="0" style="width:86px"></label><label>Z <input id="dZ1" type="number" value="0" style="width:86px"></label></div>
        <div class="bar"><b>To&nbsp;&nbsp;&nbsp;&nbsp;</b><label>X <input id="dX2" type="number" value="1200" style="width:86px"></label><label>Z <input id="dZ2" type="number" value="-900" style="width:86px"></label></div>
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
    function updChunk(){const x=+$('#owX').value||0,z=+$('#owZ').value||0,cx=Math.floor(x/16),cz=Math.floor(z/16);$('#ckOw').textContent=`${cx}, ${cz}`;$('#rgOw').textContent=`r.${Math.floor(cx/32)}.${Math.floor(cz/32)}.mca`;$('#offOw').textContent=`${((x%16)+16)%16}, ${((z%16)+16)%16}`;}
    ['#owX','#owY','#owZ'].forEach(s=>$(s).oninput=()=>{$('#ntX').value=Math.round((+$('#owX').value||0)/8);$('#ntY').value=+$('#owY').value||64;$('#ntZ').value=Math.round((+$('#owZ').value||0)/8);updChunk();});
    ['#ntX','#ntY','#ntZ'].forEach(s=>$(s).oninput=()=>{$('#owX').value=Math.round((+$('#ntX').value||0)*8);$('#owY').value=+$('#ntY').value||64;$('#owZ').value=Math.round((+$('#ntZ').value||0)*8);updChunk();});
    function updDist(){const d=Math.hypot((+$('#dX2').value||0)-(+$('#dX1').value||0),(+$('#dZ2').value||0)-(+$('#dZ1').value||0));$('#dDist').textContent=`${Math.round(d)} blocks`;$('#dNeth').textContent=`${Math.round(d/8)} blocks`;$('#dWalk').textContent=fmtT(d/7.1);$('#dEly').textContent=fmtT(d/33.5);$('#dIce').textContent=fmtT(d/72.7);}
    ['#dX1','#dZ1','#dX2','#dZ2'].forEach(s=>$(s).oninput=updDist);
    updChunk();updDist();
  }

  // ==================== 8. MAX GEAR & ENCHANTMENT /GIVE PLANNER ====================
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
        <span id="gBadge"></span>
      </div>
      <div class="ench-grid" id="gEnch"></div>
      <pre class="codebox" id="gCmd"></pre>
      <button class="btn brand sm" id="gCopy">Copy /give Command</button>
    </div>`;

    const cap=s=>s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    function draw(){
      const spec=GEAR_ITEMS[curItem],box=$('#gEnch');box.innerHTML='';
      const usedGroups={};spec.ench.forEach(([id,max,grp])=>{if(picked[id]&&grp)usedGroups[grp]=id;});
      spec.ench.forEach(([id,max,grp])=>{
        const on=!!picked[id],conflict=grp&&usedGroups[grp]&&usedGroups[grp]!==id;
        const row=el('div','ench-item'+(on?' on':'')+(conflict?' conflict':''));
        const lab=el('label');lab.style.cssText='display:flex;align-items:center;gap:7px;cursor:pointer;flex:1';
        const chk=el('input');chk.type='checkbox';chk.checked=on;chk.disabled=conflict;
        chk.onchange=()=>{if(chk.checked)picked[id]=max;else delete picked[id];draw();};
        lab.append(chk,cap(id));
        const lvl=el('select');lvl.style.padding='2px 5px';lvl.disabled=!on;
        for(let i=1;i<=max;i++){const o=el('option',null,'Lv '+i);o.value=i;lvl.append(o);}
        lvl.value=picked[id]||max;lvl.onchange=()=>{picked[id]=+lvl.value;updateCmd();};
        row.append(lab,lvl);box.append(row);
      });
      updateCmd();
    }
    function updateCmd(){
      const comps=[];
      if(Object.keys(picked).length) comps.push(fmtEnch(picked));
      const nm=$('#gName').value.trim();
      if(nm) comps.push(fmtName(nm,'#7dd3fc',false));
      if($('#gUnb').checked) comps.push('unbreakable={}');
      const cmd=`/give @p ${curItem}${comps.length?'['+comps.join(',')+']':''}`;
      $('#gCmd').textContent=cmd;$('#gBadge').innerHTML=lenBadge(cmd);
    }
    $('#gItem').onchange=e=>{curItem=e.target.value;picked={};draw();};
    $('#gMax').onclick=()=>{picked={};const used={};GEAR_ITEMS[curItem].ench.forEach(([id,max,grp])=>{if(grp&&used[grp])return;if(grp)used[grp]=1;picked[id]=max;});draw();};
    $('#gClr').onclick=()=>{picked={};draw();};
    $('#gName').oninput=updateCmd;$('#gUnb').onchange=updateCmd;
    $('#gCopy').onclick=()=>copy($('#gCmd').textContent);
    draw();
  }

  renderSub();
};
