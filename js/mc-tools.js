// Solstice Minecraft Tools: OP Commands, Banner Designer, Fancy RGB Text, Circle/Sphere Builder, Nether Calc & Max Gear
window.initMcTools=function(root){
  const $=(s,r=root)=>r.querySelector(s);
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!==undefined)e.textContent=h;return e;};
  const toast=m=>window.SOL_TOAST&&window.SOL_TOAST(m);
  const copy=txt=>{
    if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast('Copied command to clipboard!')).catch(()=>prompt('Copy:',txt));
    else prompt('Copy:',txt);
  };
  const fmtStacks=n=>{const st=Math.floor(n/64),rem=n%64;return st?`${st} stack${st>1?'s':''}${rem?' + '+rem:''}`:`${n} blocks`;};

  root.innerHTML=`
    <p class="note">OP weapons, cursed items, custom boss mobs, banner art, fancy RGB text, build blueprints, and Nether coordinates for Minecraft Java Edition.</p>
    <div class="mc-subnav" id="mcnav">
      <button data-sub="op" class="on">OP &amp; Fun Commands</button>
      <button data-sub="kits">SMP God Shulkers</button>
      <button data-sub="banner">Banner Designer (28)</button>
      <button data-sub="text">Fancy RGB Text</button>
      <button data-sub="craft">Potion &amp; Firework Builder</button>
      <button data-sub="circle">Circle &amp; Sphere Builder</button>
      <button data-sub="nether">Nether &amp; Chunk Calc</button>
      <button data-sub="gear">Max Gear Planner</button>
    </div>
    <div id="mcstage"></div>`;

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

  // ==================== 1. OP & FUN COMMANDS + CUSTOM OP WEAPON + BOSS SPAWNER ====================
  const OP_VAULT=[
    {
      name:'Knockback 100000 Yeet Stick',
      tag:'Knockback',
      desc:'Launches any mob or player into orbit with 255 Knockback + 100000 attack knockback attribute.',
      cmd121:`/give @p minecraft:stick[custom_name='{"text":"Yeet Stick","color":"#38bdf8","bold":true,"italic":false}',enchantments={levels:{"minecraft:knockback":255}},attribute_modifiers=[{type:"minecraft:attack_knockback",id:"solstice:kb",amount:100000,operation:"add_value",slot:"mainhand"}],enchantment_glint_override=true] 1`,
      cmd120:`/give @p minecraft:stick{display:{Name:'{"text":"Yeet Stick","color":"#38bdf8","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:knockback",lvl:32767s}]} 1`
    },
    {
      name:'One-Tap God Sword',
      tag:'1-Shot',
      desc:'Deals 999,999 damage per swing with max Sharpness, Looting, Sweeping Edge, and Unbreakable.',
      cmd121:`/give @p minecraft:netherite_sword[custom_name='{"text":"One-Tap Blade","color":"#f43f5e","bold":true,"italic":false}',enchantments={levels:{"minecraft:sharpness":255,"minecraft:looting":255,"minecraft:sweeping_edge":255,"minecraft:fire_aspect":255}},attribute_modifiers=[{type:"minecraft:attack_damage",id:"solstice:dmg",amount:999999,operation:"add_value",slot:"mainhand"},{type:"minecraft:attack_speed",id:"solstice:spd",amount:100,operation:"add_value",slot:"mainhand"}],unbreakable={}] 1`,
      cmd120:`/give @p minecraft:netherite_sword{Unbreakable:1b,display:{Name:'{"text":"One-Tap Blade","color":"#f43f5e","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:sharpness",lvl:32767s},{id:"minecraft:looting",lvl:100s}]} 1`
    },
    {
      name:'Nuclear Mace',
      tag:'1-Shot',
      desc:'Obliterates bosses in one hit with Density 255, Breach 255, Wind Burst 255, and 99,999 base damage.',
      cmd121:`/give @p minecraft:mace[custom_name='{"text":"Nuclear Mace","color":"#f59e0b","bold":true,"italic":false}',enchantments={levels:{"minecraft:density":255,"minecraft:breach":255,"minecraft:wind_burst":255,"minecraft:fire_aspect":255}},attribute_modifiers=[{type:"minecraft:attack_damage",id:"solstice:mace",amount:99999,operation:"add_value",slot:"mainhand"}],unbreakable={}] 1`,
      cmd120:`/give @p minecraft:netherite_axe{Unbreakable:1b,display:{Name:'{"text":"Nuclear Axe","color":"#f59e0b","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:sharpness",lvl:32767s}]} 1`
    },
    {
      name:'Instant-Mine Pickaxe',
      tag:'Mining',
      desc:'Instantly deletes stone, deepslate, and obsidian with Efficiency 255 + Fortune 50 + massive mining speed.',
      cmd121:`/give @p minecraft:netherite_pickaxe[custom_name='{"text":"World Eater Pickaxe","color":"#a78bfa","bold":true,"italic":false}',enchantments={levels:{"minecraft:efficiency":255,"minecraft:fortune":50}},attribute_modifiers=[{type:"minecraft:block_break_speed",id:"solstice:mine",amount:500,operation:"add_value",slot:"mainhand"},{type:"minecraft:block_interaction_range",id:"solstice:reach",amount:12,operation:"add_value",slot:"mainhand"}],unbreakable={}] 1`,
      cmd120:`/give @p minecraft:netherite_pickaxe{Unbreakable:1b,display:{Name:'{"text":"World Eater Pickaxe","color":"#a78bfa","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:efficiency",lvl:255s},{id:"minecraft:fortune",lvl:50s}]} 1`
    },
    {
      name:'One-Shot Railgun Bow',
      tag:'Ranged',
      desc:'Power 255, Punch 255, Flame, Infinity, Unbreakable. Deletes Ender Dragons from across the map.',
      cmd121:`/give @p minecraft:bow[custom_name='{"text":"Railgun Bow","color":"#22d3ee","bold":true,"italic":false}',enchantments={levels:{"minecraft:power":255,"minecraft:punch":255,"minecraft:flame":1,"minecraft:infinity":1}},unbreakable={}] 1`,
      cmd120:`/give @p minecraft:bow{Unbreakable:1b,display:{Name:'{"text":"Railgun Bow","color":"#22d3ee","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:power",lvl:32767s},{id:"minecraft:punch",lvl:255s},{id:"minecraft:flame",lvl:1s},{id:"minecraft:infinity",lvl:1s}]} 1`
    },
    {
      name:'Flash Speed Boots',
      tag:'Mobility',
      desc:'Insane sprint speed, 3-block step height, super jump, and zero fall damage.',
      cmd121:`/give @p minecraft:netherite_boots[custom_name='{"text":"Flash Boots","color":"#facc15","bold":true,"italic":false}',enchantments={levels:{"minecraft:feather_falling":255,"minecraft:depth_strider":10,"minecraft:soul_speed":10}},attribute_modifiers=[{type:"minecraft:movement_speed",id:"solstice:spd",amount:0.6,operation:"add_value",slot:"feet"},{type:"minecraft:jump_strength",id:"solstice:jmp",amount:0.5,operation:"add_value",slot:"feet"},{type:"minecraft:step_height",id:"solstice:stp",amount:3,operation:"add_value",slot:"feet"},{type:"minecraft:safe_fall_distance",id:"solstice:fall",amount:500,operation:"add_value",slot:"feet"}],unbreakable={}] 1`,
      cmd120:`/give @p minecraft:netherite_boots{Unbreakable:1b,display:{Name:'{"text":"Flash Boots","color":"#facc15","bold":true,"italic":false}'},AttributeModifiers:[{AttributeName:"generic.movement_speed",Name:"spd",Amount:0.6,Operation:0,UUID:[I;1,2,3,4],Slot:"feet"}]} 1`
    },
    {
      name:'God Mode Potion',
      tag:'Potion',
      desc:'Grants Strength 50, Speed 5, Resistance 5, Regeneration 10, Jump 4, Night Vision, and Fire Res for 10 mins.',
      cmd121:`/give @p minecraft:potion[custom_name='{"text":"Elixir of the Gods","color":"#4ade80","bold":true,"italic":false}',potion_contents={custom_color:4906624,custom_effects:[{id:"minecraft:strength",amplifier:49,duration:12000},{id:"minecraft:speed",amplifier:4,duration:12000},{id:"minecraft:resistance",amplifier:4,duration:12000},{id:"minecraft:regeneration",amplifier:9,duration:12000},{id:"minecraft:jump_boost",amplifier:3,duration:12000},{id:"minecraft:fire_resistance",amplifier:0,duration:12000},{id:"minecraft:night_vision",amplifier:0,duration:12000}]}] 1`,
      cmd120:`/give @p minecraft:potion{display:{Name:'{"text":"Elixir of the Gods","color":"#4ade80","bold":true,"italic":false}'},CustomPotionColor:4906624,custom_potion_effects:[{id:"minecraft:strength",amplifier:49b,duration:12000},{id:"minecraft:resistance",amplifier:4b,duration:12000},{id:"minecraft:speed",amplifier:4b,duration:12000}]} 1`
    },
    {
      name:'Giant Player (5x Size)',
      tag:'Fun',
      desc:'Makes you 5x taller with huge reach and stride. Run the Reset command to go back to normal.',
      cmd121:`/attribute @p minecraft:scale base set 5`,
      cmd120:`/effect give @p minecraft:jump_boost 600 4`
    },
    {
      name:'Ant-Sized Player (0.2x Size)',
      tag:'Fun',
      desc:'Shrinks you to 20% size so you can walk through 1-block gaps and hide under slabs.',
      cmd121:`/attribute @p minecraft:scale base set 0.2`,
      cmd120:`/effect give @p minecraft:invisibility 600 0 true`
    },
    {
      name:'Reset Player Size (1x)',
      tag:'Utility',
      desc:'Resets your player scale back to normal 1.0 size.',
      cmd121:`/attribute @p minecraft:scale base set 1`,
      cmd120:`/effect clear @p`
    },
    {
      name:'Moon Gravity',
      tag:'Fun',
      desc:'Lowers your gravity to 20% for giant moon jumps. Set back to 0.08 to reset.',
      cmd121:`/attribute @p minecraft:gravity base set 0.016`,
      cmd120:`/effect give @p minecraft:slow_falling 600 0`
    },
    {
      name:'Thor Lightning Trident',
      tag:'Weapon',
      desc:'Impaling 255, Channeling, Loyalty 10, and massive melee reach.',
      cmd121:`/give @p minecraft:trident[custom_name='{"text":"Stormbreaker","color":"#7dd3fc","bold":true,"italic":false}',enchantments={levels:{"minecraft:impaling":255,"minecraft:channeling":1,"minecraft:loyalty":10}},attribute_modifiers=[{type:"minecraft:attack_damage",id:"solstice:thor",amount:5000,operation:"add_value",slot:"mainhand"}],unbreakable={}] 1`,
      cmd120:`/give @p minecraft:trident{Unbreakable:1b,display:{Name:'{"text":"Stormbreaker","color":"#7dd3fc","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:impaling",lvl:255s},{id:"minecraft:channeling",lvl:1s},{id:"minecraft:loyalty",lvl:10s}]} 1`
    },
    {
      name:'Machine-Gun Crossbow',
      tag:'Ranged',
      desc:'Instant reload Quick Charge 5, Multishot, Piercing 255, and Unbreakable.',
      cmd121:`/give @p minecraft:crossbow[custom_name='{"text":"Minigun Crossbow","color":"#fb923c","bold":true,"italic":false}',enchantments={levels:{"minecraft:quick_charge":5,"minecraft:multishot":1,"minecraft:piercing":255}},unbreakable={}] 1`,
      cmd120:`/give @p minecraft:crossbow{Unbreakable:1b,display:{Name:'{"text":"Minigun Crossbow","color":"#fb923c","bold":true,"italic":false}'},Enchantments:[{id:"minecraft:quick_charge",lvl:5s},{id:"minecraft:multishot",lvl:1s},{id:"minecraft:piercing",lvl:127s}]} 1`
    },
    {
      name:'100x Mega Fireball',
      tag:'Explosive',
      desc:'Summons a massive Ghast fireball right in front of you with 100 ExplosionPower. Punch it to launch!',
      cmd121:`/summon minecraft:fireball ~ ~2 ~ {ExplosionPower:100b}`,
      cmd120:`/summon minecraft:fireball ~ ~2 ~ {ExplosionPower:100b}`
    },
    {
      name:'Hidden Admin Blocks Shulker',
      tag:'Admin',
      desc:'One shulker with Command Block, Repeating Command Block, Barrier, Light Block, Debug Stick, and Structure Void.',
      cmd121:`/give @p minecraft:cyan_shulker_box[custom_name='{"text":"Admin Secret Kit","color":"#38bdf8","bold":true,"italic":false}',container=[{slot:0,item:{id:"minecraft:command_block",count:64}},{slot:1,item:{id:"minecraft:repeating_command_block",count:64}},{slot:2,item:{id:"minecraft:chain_command_block",count:64}},{slot:3,item:{id:"minecraft:barrier",count:64}},{slot:4,item:{id:"minecraft:light",count:64}},{slot:5,item:{id:"minecraft:debug_stick",count:1}},{slot:6,item:{id:"minecraft:structure_block",count:64}},{slot:7,item:{id:"minecraft:structure_void",count:64}},{slot:8,item:{id:"minecraft:jigsaw",count:64}}]] 1`,
      cmd120:`/give @p minecraft:debug_stick 1`
    }
  ];

  function renderOpCommands(){
    let ver='121';
    stage.innerHTML=`
      <div class="bar panel" style="justify-content:space-between">
        <div><b>OP Command Vault</b> <span class="small">1-click overpowered weapons, sticks, potions, and scale commands.</span></div>
        <label>Syntax <select id="opVer"><option value="121" selected>Java 1.21+ (Components)</option><option value="120">Java 1.20.4 &amp; older (Legacy NBT)</option></select></label>
      </div>
      <div class="grid" id="opGrid" style="margin-bottom:20px"></div>

      <div class="mc-grid">
        <div class="panel">
          <h3>Custom OP Weapon &amp; Item Builder</h3>
          <div class="bar">
            <label>Base Item <select id="cwItem">
              <option value="stick">Stick</option>
              <option value="netherite_sword" selected>Netherite Sword</option>
              <option value="mace">Mace</option>
              <option value="netherite_pickaxe">Netherite Pickaxe</option>
              <option value="netherite_axe">Netherite Axe</option>
              <option value="wooden_hoe">Wooden Hoe (Cursed)</option>
              <option value="blaze_rod">Blaze Rod</option>
              <option value="cod">Raw Cod (Slap Fish)</option>
              <option value="cookie">Cookie</option>
              <option value="trident">Trident</option>
            </select></label>
            <label>Name <input id="cwName" type="text" value="Solstice Destroyer" style="width:160px"></label>
            <label>Color <input id="cwCol" type="color" value="#38bdf8"></label>
          </div>
          <div class="bar">
            <label>Damage <input id="cwDmg" type="number" value="10000" min="0" max="9999999" style="width:105px"></label>
            <label>Knockback <input id="cwKb" type="number" value="255" min="0" max="100000" style="width:95px"></label>
            <label>Reach +<input id="cwReach" type="number" value="8" min="0" max="64" style="width:72px"></label>
          </div>
          <div class="bar">
            <label>Sharpness <input id="cwSharp" type="number" value="255" min="0" max="255" style="width:74px"></label>
            <label>Looting <input id="cwLoot" type="number" value="50" min="0" max="255" style="width:74px"></label>
            <label>Fire Aspect <input id="cwFire" type="number" value="10" min="0" max="255" style="width:74px"></label>
          </div>
          <div class="bar">
            <label><input type="checkbox" id="cwUnb" checked> Unbreakable</label>
            <label><input type="checkbox" id="cwGlint" checked> Force Glint</label>
            <label><input type="checkbox" id="cwFast" checked> Zero Attack Cooldown</label>
          </div>
          <pre class="codebox" id="cwCmd"></pre>
          <button class="btn brand sm" id="cwCopy">Copy Custom Weapon Command</button>
        </div>

        <div class="panel">
          <h3>Custom Boss &amp; Cursed Mob Spawner</h3>
          <div class="bar">
            <label>Mob <select id="mbType">
              <option value="zombie">Zombie Boss</option>
              <option value="skeleton">Skeleton Sniper</option>
              <option value="creeper">Charged Creeper</option>
              <option value="warden">Mega Warden</option>
              <option value="iron_golem">Titan Iron Golem</option>
              <option value="chicken">Giant Murder Chicken</option>
              <option value="sheep">Rainbow Sheep (jeb_)</option>
              <option value="giant">Unused Giant Zombie</option>
              <option value="ender_dragon">Ender Dragon</option>
            </select></label>
            <label>Boss Name <input id="mbName" type="text" value="Overlord" style="width:140px"></label>
          </div>
          <div class="bar">
            <label>Max HP <input id="mbHp" type="number" value="500" min="1" max="100000" style="width:90px"></label>
            <label>Scale (Size) <input id="mbScale" type="number" value="2.5" step="0.1" min="0.1" max="16" style="width:76px"></label>
            <label>Speed <input id="mbSpd" type="number" value="0.45" step="0.05" min="0.1" max="2" style="width:76px"></label>
          </div>
          <div class="bar">
            <label><input type="checkbox" id="mbGlow" checked> Glowing outline</label>
            <label><input type="checkbox" id="mbInv"> Invulnerable</label>
            <label><input type="checkbox" id="mbNoAi"> Frozen (NoAI)</label>
            <label><input type="checkbox" id="mbFlip"> Upside Down (Dinnerbone)</label>
          </div>
          <pre class="codebox" id="mbCmd"></pre>
          <button class="btn brand sm" id="mbCopy">Copy /summon Command</button>
        </div>
      </div>`;

    function drawVault(){
      const grid=$('#opGrid');grid.innerHTML='';
      OP_VAULT.forEach(item=>{
        const card=el('div','card');
        const body=el('div','body');
        body.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h3>${item.name}</h3><span class="badge hi">${item.tag}</span></div><p class="small">${item.desc}</p>`;
        const cmd=ver==='121'?item.cmd121:item.cmd120;
        const pre=el('pre','codebox',cmd);pre.style.maxHeight='78px';pre.style.fontSize='11.5px';
        const btn=el('button','btn brand sm','Copy Command');
        btn.onclick=()=>copy(cmd);
        body.append(pre,btn);card.append(body);grid.append(card);
      });
    }
    $('#opVer').onchange=e=>{ver=e.target.value;drawVault();};
    drawVault();

    // Custom OP Weapon builder
    function updWeapon(){
      const item=$('#cwItem').value,nm=$('#cwName').value.trim()||'OP Item',col=$('#cwCol').value;
      const dmg=+$('#cwDmg').value||0,kb=+$('#cwKb').value||0,reach=+$('#cwReach').value||0;
      const sharp=Math.min(255,+$('#cwSharp').value||0),loot=Math.min(255,+$('#cwLoot').value||0),fire=Math.min(255,+$('#cwFire').value||0);
      const comps=[`custom_name='${JSON.stringify({text:nm,color:col,bold:true,italic:false}).replace(/'/g,"\\'")}'`];
      const enchs=[];
      if(sharp>0) enchs.push(`"minecraft:sharpness":${sharp}`);
      if(loot>0) enchs.push(`"minecraft:looting":${loot}`);
      if(fire>0) enchs.push(`"minecraft:fire_aspect":${fire}`);
      if(kb>0) enchs.push(`"minecraft:knockback":${Math.min(255,kb)}`);
      if(enchs.length) comps.push(`enchantments={levels:{${enchs.join(',')}}}`);
      const attrs=[];
      if(dmg>0) attrs.push(`{type:"minecraft:attack_damage",id:"solstice:dmg",amount:${dmg},operation:"add_value",slot:"mainhand"}`);
      if(kb>0) attrs.push(`{type:"minecraft:attack_knockback",id:"solstice:kb",amount:${kb},operation:"add_value",slot:"mainhand"}`);
      if(reach>0) attrs.push(`{type:"minecraft:entity_interaction_range",id:"solstice:reach",amount:${reach},operation:"add_value",slot:"mainhand"}`);
      if($('#cwFast').checked) attrs.push(`{type:"minecraft:attack_speed",id:"solstice:spd",amount:100,operation:"add_value",slot:"mainhand"}`);
      if(attrs.length) comps.push(`attribute_modifiers=[${attrs.join(',')}]`);
      if($('#cwUnb').checked) comps.push('unbreakable={}');
      if($('#cwGlint').checked) comps.push('enchantment_glint_override=true');
      $('#cwCmd').textContent=`/give @p minecraft:${item}[${comps.join(',')}] 1`;
    }
    ['#cwItem','#cwName','#cwCol','#cwDmg','#cwKb','#cwReach','#cwSharp','#cwLoot','#cwFire','#cwUnb','#cwGlint','#cwFast'].forEach(s=>{$(s).oninput=updWeapon;$(s).onchange=updWeapon;});
    $('#cwCopy').onclick=()=>copy($('#cwCmd').textContent);
    updWeapon();

    // Custom Mob Spawner
    function updMob(){
      const mob=$('#mbType').value;
      const flip=$('#mbFlip').checked;
      const nm=flip?'Dinnerbone':(mob==='sheep'?'jeb_':($('#mbName').value.trim()||'Boss'));
      const hp=+$('#mbHp').value||100,sc=+$('#mbScale').value||1,spd=+$('#mbSpd').value||0.3;
      const tags=[`CustomName:'{"text":"${nm.replace(/'/g,"\\'")}","color":"#f43f5e","bold":true}'`,`CustomNameVisible:1b`,`Health:${hp}f`,`PersistenceRequired:1b`];
      const attrs=[`{id:"minecraft:max_health",base:${hp}}`,`{id:"minecraft:scale",base:${sc}}`,`{id:"minecraft:movement_speed",base:${spd}}`];
      tags.push(`attributes:[${attrs.join(',')}]`);
      if(mob==='creeper') tags.push('powered:1b','ExplosionRadius:12b');
      if($('#mbGlow').checked) tags.push('Glowing:1b');
      if($('#mbInv').checked) tags.push('Invulnerable:1b');
      if($('#mbNoAi').checked) tags.push('NoAI:1b');
      $('#mbCmd').textContent=`/summon minecraft:${mob} ~ ~1 ~ {${tags.join(',')}}`;
    }
    ['#mbType','#mbName','#mbHp','#mbScale','#mbSpd','#mbGlow','#mbInv','#mbNoAi','#mbFlip'].forEach(s=>{$(s).oninput=updMob;$(s).onchange=updMob;});
    $('#mbCopy').onclick=()=>copy($('#mbCmd').textContent);
    updMob();
  }

  // ==================== 1B. SMP GOD SHULKERS & FULL GOD ARMOR BUILDER ====================
  function renderSmpKits(){
    const GOD_HELM=`{id:"minecraft:netherite_helmet",count:1,components:{"minecraft:custom_name":'{"text":"God Helmet","color":"#facc15","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:protection":255,"minecraft:respiration":255,"minecraft:aqua_affinity":1,"minecraft:thorns":255,"minecraft:mending":1}},"minecraft:attribute_modifiers":[{type:"minecraft:max_health",id:"solstice:hhp",amount:20,operation:"add_value",slot:"head"},{type:"minecraft:armor",id:"solstice:harm",amount:20,operation:"add_value",slot:"head"}],"minecraft:unbreakable":{}}}`;
    const GOD_CHEST=`{id:"minecraft:netherite_chestplate",count:1,components:{"minecraft:custom_name":'{"text":"God Chestplate","color":"#facc15","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:protection":255,"minecraft:thorns":255,"minecraft:mending":1}},"minecraft:attribute_modifiers":[{type:"minecraft:max_health",id:"solstice:chp",amount:40,operation:"add_value",slot:"chest"},{type:"minecraft:armor_toughness",id:"solstice:ctgh",amount:20,operation:"add_value",slot:"chest"},{type:"minecraft:knockback_resistance",id:"solstice:ckb",amount:1,operation:"add_value",slot:"chest"}],"minecraft:unbreakable":{}}}`;
    const GOD_LEGS=`{id:"minecraft:netherite_leggings",count:1,components:{"minecraft:custom_name":'{"text":"God Leggings","color":"#facc15","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:protection":255,"minecraft:swift_sneak":5,"minecraft:thorns":255,"minecraft:mending":1}},"minecraft:attribute_modifiers":[{type:"minecraft:max_health",id:"solstice:lhp",amount:20,operation:"add_value",slot:"legs"},{type:"minecraft:movement_speed",id:"solstice:lspd",amount:0.08,operation:"add_value",slot:"legs"}],"minecraft:unbreakable":{}}}`;
    const GOD_BOOTS=`{id:"minecraft:netherite_boots",count:1,components:{"minecraft:custom_name":'{"text":"God Boots","color":"#facc15","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:protection":255,"minecraft:feather_falling":255,"minecraft:depth_strider":10,"minecraft:soul_speed":10,"minecraft:thorns":255,"minecraft:mending":1}},"minecraft:attribute_modifiers":[{type:"minecraft:max_health",id:"solstice:bhp",amount:20,operation:"add_value",slot:"feet"},{type:"minecraft:step_height",id:"solstice:bstp",amount:1.5,operation:"add_value",slot:"feet"},{type:"minecraft:safe_fall_distance",id:"solstice:bfall",amount:500,operation:"add_value",slot:"feet"}],"minecraft:unbreakable":{}}}`;
    const GOD_SWORD=`{id:"minecraft:netherite_sword",count:1,components:{"minecraft:custom_name":'{"text":"SMP Slayer","color":"#f43f5e","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:sharpness":255,"minecraft:looting":255,"minecraft:sweeping_edge":255,"minecraft:fire_aspect":255}},"minecraft:attribute_modifiers":[{type:"minecraft:attack_damage",id:"solstice:sdmg",amount:99999,operation:"add_value",slot:"mainhand"},{type:"minecraft:attack_speed",id:"solstice:sspd",amount:100,operation:"add_value",slot:"mainhand"}],"minecraft:unbreakable":{}}}`;
    const GOD_PICK=`{id:"minecraft:netherite_pickaxe",count:1,components:{"minecraft:custom_name":'{"text":"World Eater","color":"#a78bfa","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:efficiency":255,"minecraft:fortune":50}},"minecraft:attribute_modifiers":[{type:"minecraft:block_break_speed",id:"solstice:pmine",amount:200,operation:"add_value",slot:"mainhand"}],"minecraft:unbreakable":{}}}`;
    const GOD_MACE=`{id:"minecraft:mace",count:1,components:{"minecraft:custom_name":'{"text":"Nuclear Mace","color":"#f59e0b","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:density":255,"minecraft:breach":255,"minecraft:wind_burst":10}},"minecraft:attribute_modifiers":[{type:"minecraft:attack_damage",id:"solstice:mdmg",amount:50000,operation:"add_value",slot:"mainhand"}],"minecraft:unbreakable":{}}}`;
    const GOD_BOW=`{id:"minecraft:bow",count:1,components:{"minecraft:custom_name":'{"text":"Railgun Bow","color":"#38bdf8","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:power":255,"minecraft:punch":255,"minecraft:flame":1,"minecraft:infinity":1}},"minecraft:unbreakable":{}}}`;
    const GOD_ELYTRA=`{id:"minecraft:elytra",count:1,components:{"minecraft:custom_name":'{"text":"God Wings","color":"#7dd3fc","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:unbreaking":255,"minecraft:mending":1}},"minecraft:attribute_modifiers":[{type:"minecraft:armor",id:"solstice:earm",amount:20,operation:"add_value",slot:"chest"}],"minecraft:unbreakable":{}}}`;
    const YEET_STICK=`{id:"minecraft:stick",count:1,components:{"minecraft:custom_name":'{"text":"Yeet Stick 100000","color":"#22d3ee","bold":true,"italic":false}',"minecraft:enchantments":{levels:{"minecraft:knockback":255}},"minecraft:attribute_modifiers":[{type:"minecraft:attack_knockback",id:"solstice:ykb",amount:100000,operation:"add_value",slot:"mainhand"}],"minecraft:enchantment_glint_override":true}}`;
    const GOD_POT=`{id:"minecraft:potion",count:1,components:{"minecraft:custom_name":'{"text":"God Mode Elixir","color":"#4ade80","bold":true,"italic":false}',"minecraft:potion_contents":{custom_color:4906624,custom_effects:[{id:"minecraft:strength",amplifier:49,duration:12000},{id:"minecraft:speed",amplifier:4,duration:12000},{id:"minecraft:resistance",amplifier:4,duration:12000},{id:"minecraft:regeneration",amplifier:9,duration:12000},{id:"minecraft:fire_resistance",amplifier:0,duration:12000},{id:"minecraft:night_vision",amplifier:0,duration:12000}]}}}`;

    const FULL_ARMOR_CMD=`/give @p minecraft:purple_shulker_box[custom_name='{"text":"Full God Armor Set","color":"#facc15","bold":true,"italic":false}',container=[{slot:0,item:${GOD_HELM}},{slot:1,item:${GOD_CHEST}},{slot:2,item:${GOD_LEGS}},{slot:3,item:${GOD_BOOTS}},{slot:4,item:${GOD_ELYTRA}},{slot:5,item:{id:"minecraft:totem_of_undying",count:1}},{slot:6,item:{id:"minecraft:enchanted_golden_apple",count:64}},{slot:7,item:${GOD_POT}},{slot:8,item:{id:"minecraft:firework_rocket",count:64,components:{"minecraft:fireworks":{flight_duration:3}}}}]] 1`;

    const SMP_GOD_CMD=`/give @p minecraft:black_shulker_box[custom_name='{"text":"SMP Domination Kit","color":"#f43f5e","bold":true,"italic":false}',container=[{slot:0,item:${GOD_HELM}},{slot:1,item:${GOD_CHEST}},{slot:2,item:${GOD_LEGS}},{slot:3,item:${GOD_BOOTS}},{slot:4,item:${GOD_SWORD}},{slot:5,item:${GOD_MACE}},{slot:6,item:${GOD_PICK}},{slot:7,item:${GOD_BOW}},{slot:8,item:${YEET_STICK}},{slot:9,item:${GOD_ELYTRA}},{slot:10,item:{id:"minecraft:firework_rocket",count:64,components:{"minecraft:fireworks":{flight_duration:3}}}},{slot:11,item:{id:"minecraft:enchanted_golden_apple",count:64}},{slot:12,item:{id:"minecraft:enchanted_golden_apple",count:64}},{slot:13,item:{id:"minecraft:totem_of_undying",count:1}},{slot:14,item:{id:"minecraft:totem_of_undying",count:1}},{slot:15,item:{id:"minecraft:totem_of_undying",count:1}},{slot:16,item:{id:"minecraft:ender_pearl",count:16}},{slot:17,item:{id:"minecraft:arrow",count:64}},{slot:18,item:{id:"minecraft:end_crystal",count:64}},{slot:19,item:{id:"minecraft:obsidian",count:64}},{slot:20,item:{id:"minecraft:respawn_anchor",count:64}},{slot:21,item:{id:"minecraft:glowstone",count:64}},{slot:22,item:{id:"minecraft:wind_charge",count:64}},{slot:23,item:{id:"minecraft:golden_carrot",count:64}},{slot:24,item:${GOD_POT}},{slot:25,item:${GOD_POT}},{slot:26,item:{id:"minecraft:netherite_block",count:64}}]] 1`;

    const CRYSTAL_PVP_CMD=`/give @p minecraft:magenta_shulker_box[custom_name='{"text":"Crystal PvP Kit","color":"#e879f9","bold":true,"italic":false}',container=[{slot:0,item:${GOD_HELM}},{slot:1,item:${GOD_CHEST}},{slot:2,item:${GOD_LEGS}},{slot:3,item:${GOD_BOOTS}},{slot:4,item:${GOD_SWORD}},{slot:5,item:${GOD_PICK}},{slot:6,item:{id:"minecraft:obsidian",count:64}},{slot:7,item:{id:"minecraft:end_crystal",count:64}},{slot:8,item:{id:"minecraft:end_crystal",count:64}},{slot:9,item:{id:"minecraft:respawn_anchor",count:64}},{slot:10,item:{id:"minecraft:glowstone",count:64}},{slot:11,item:{id:"minecraft:ender_pearl",count:16}},{slot:12,item:{id:"minecraft:ender_pearl",count:16}},{slot:13,item:{id:"minecraft:enchanted_golden_apple",count:64}},{slot:14,item:{id:"minecraft:experience_bottle",count:64}},{slot:15,item:{id:"minecraft:experience_bottle",count:64}},{slot:16,item:{id:"minecraft:totem_of_undying",count:1}},{slot:17,item:{id:"minecraft:totem_of_undying",count:1}},{slot:18,item:{id:"minecraft:totem_of_undying",count:1}},{slot:19,item:{id:"minecraft:totem_of_undying",count:1}},{slot:20,item:{id:"minecraft:totem_of_undying",count:1}}]] 1`;

    stage.innerHTML=`
      <p class="note">One-command Shulker Boxes for Java 1.21+ (paste into a Command Block if chat length limit is reached).</p>
      <div class="grid" style="margin-bottom:20px">
        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center"><h3>Ultimate SMP Domination Shulker</h3><span class="badge hi">27 Slots</span></div>
          <p class="small">Everything to rule an SMP in 1 Shulker: Full God Netherite Armor (+50 extra hearts), One-Tap Sword, Nuclear Mace, World Eater Pickaxe, Railgun Bow, Yeet Stick 100000, Armored Elytra, 128 God Apples, Totems, End Crystals, Obsidian, Respawn Anchors, Wind Charges, God Potions, and 64 Netherite Blocks.</p>
          <pre class="codebox" style="max-height:90px;font-size:11px">${SMP_GOD_CMD}</pre>
          <button class="btn brand sm" id="cpSmp">Copy SMP Domination Shulker</button>
        </div></div>

        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center"><h3>Full God Armor Set Shulker</h3><span class="badge hi">+50 Hearts</span></div>
          <p class="small">Complete Unbreakable Protection 255 + Thorns 255 Netherite Armor set (Helmet, Chestplate, Leggings, Boots) with +100 Max HP, Knockback Resistance, Speed, Step Height, Zero Fall Damage, Armored Elytra, 64 Flight-3 Rockets, 64 God Apples, Totem, and God Elixir.</p>
          <pre class="codebox" style="max-height:90px;font-size:11px">${FULL_ARMOR_CMD}</pre>
          <button class="btn brand sm" id="cpArmor">Copy God Armor Shulker</button>
        </div></div>

        <div class="card"><div class="body">
          <div style="display:flex;justify-content:space-between;align-items:center"><h3>Crystal PvP Shulker Kit</h3><span class="badge hi">PvP</span></div>
          <p class="small">Loaded for Crystal PvP: God Netherite Armor, Sword, Pickaxe, 128 End Crystals, 64 Obsidian, 64 Respawn Anchors, 64 Glowstone, 32 Ender Pearls, 64 God Apples, 128 XP Bottles, and 5 Totems of Undying.</p>
          <pre class="codebox" style="max-height:90px;font-size:11px">${CRYSTAL_PVP_CMD}</pre>
          <button class="btn brand sm" id="cpCpvp">Copy Crystal PvP Shulker</button>
        </div></div>
      </div>

      <div class="panel">
        <h3>Custom Full Armor Set Shulker Builder</h3>
        <div class="bar">
          <label>Material <select id="arMat"><option value="netherite">Netherite</option><option value="diamond">Diamond</option><option value="golden">Gold</option><option value="iron">Iron</option><option value="leather">Leather</option></select></label>
          <label>Set Name <input id="arName" type="text" value="Solstice God" style="width:150px"></label>
          <label>Color <input id="arCol" type="color" value="#38bdf8"></label>
          <label>Shulker Color <select id="arBox">${DYES.map(d=>`<option value="${d[0]}">${d[1]}</option>`).join('')}</select></label>
        </div>
        <div class="bar">
          <label>Protection Lv <input id="arProt" type="number" value="255" min="0" max="255" style="width:78px"></label>
          <label>Thorns Lv <input id="arThorn" type="number" value="50" min="0" max="255" style="width:74px"></label>
          <label>Extra Hearts per piece <input id="arHp" type="number" value="10" min="0" max="500" style="width:74px"></label>
          <label>Speed Boost <input id="arSpd" type="number" value="0.1" step="0.02" min="0" max="1" style="width:74px"></label>
          <label><input type="checkbox" id="arUnb" checked> Unbreakable</label>
        </div>
        <pre class="codebox" id="arCmd"></pre>
        <button class="btn brand sm" id="arCopy">Copy Custom Armor Shulker Command</button>
      </div>`;

    $('#cpSmp').onclick=()=>copy(SMP_GOD_CMD);
    $('#cpArmor').onclick=()=>copy(FULL_ARMOR_CMD);
    $('#cpCpvp').onclick=()=>copy(CRYSTAL_PVP_CMD);
    $('#arBox').value='blue';

    function updArmor(){
      const mat=$('#arMat').value,nm=$('#arName').value.trim()||'God',col=$('#arCol').value,box=$('#arBox').value;
      const prot=Math.min(255,+$('#arProt').value||0),thorn=Math.min(255,+$('#arThorn').value||0);
      const hp=(+$('#arHp').value||0)*2,spd=+$('#arSpd').value||0,unb=$('#arUnb').checked;
      const pieces=[['helmet','Helmet','head'],['chestplate','Chestplate','chest'],['leggings','Leggings','legs'],['boots','Boots','feet']];
      const slots=pieces.map(([p,lbl,slot],idx)=>{
        const enchs=[];
        if(prot>0) enchs.push(`"minecraft:protection":${prot}`);
        if(thorn>0) enchs.push(`"minecraft:thorns":${thorn}`);
        if(p==='helmet') enchs.push(`"minecraft:respiration":10,"minecraft:aqua_affinity":1`);
        if(p==='boots') enchs.push(`"minecraft:feather_falling":255,"minecraft:depth_strider":10`);
        const attrs=[];
        if(hp>0) attrs.push(`{type:"minecraft:max_health",id:"solstice:hp${idx}",amount:${hp},operation:"add_value",slot:"${slot}"}`);
        if(p==='boots'&&spd>0) attrs.push(`{type:"minecraft:movement_speed",id:"solstice:spd",amount:${spd},operation:"add_value",slot:"feet"}`);
        const comps=[`"minecraft:custom_name":'${JSON.stringify({text:`${nm} ${lbl}`,color:col,bold:true,italic:false}).replace(/'/g,"\\'")}'`];
        if(enchs.length) comps.push(`"minecraft:enchantments":{levels:{${enchs.join(',')}}}`);
        if(attrs.length) comps.push(`"minecraft:attribute_modifiers":[${attrs.join(',')}]`);
        if(unb) comps.push(`"minecraft:unbreakable":{}`);
        return `{slot:${idx},item:{id:"minecraft:${mat}_${p}",count:1,components:{${comps.join(',')}}}}`;
      });
      $('#arCmd').textContent=`/give @p minecraft:${box}_shulker_box[custom_name='${JSON.stringify({text:`${nm} Armor Set`,color:col,bold:true,italic:false}).replace(/'/g,"\\'")}',container=[${slots.join(',')}]] 1`;
    }
    ['#arMat','#arName','#arCol','#arBox','#arProt','#arThorn','#arHp','#arSpd','#arUnb'].forEach(s=>{$(s).oninput=updArmor;$(s).onchange=updArmor;});
    $('#arCopy').onclick=()=>copy($('#arCmd').textContent);
    updArmor();
  }

  // ==================== 1C. CUSTOM POTION & FIREWORK ROCKET BUILDER ====================
  function renderPotionFirework(){
    const FX_LIST=[['strength','Strength'],['speed','Speed'],['resistance','Resistance'],['regeneration','Regeneration'],['jump_boost','Jump Boost'],['haste','Haste'],['night_vision','Night Vision'],['fire_resistance','Fire Resistance'],['invisibility','Invisibility'],['health_boost','Health Boost'],['absorption','Absorption'],['slow_falling','Slow Falling'],['levitation','Levitation'],['hero_of_the_village','Hero of the Village']];
    let potFx=[{id:'strength',amp:10,dur:600},{id:'speed',amp:4,dur:600},{id:'resistance',amp:4,dur:600}];

    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Custom Super Potion Builder</h3>
        <div class="bar">
          <label>Potion Name <input id="ptName" type="text" value="Hyper Brew" style="width:150px"></label>
          <label>Bottle <select id="ptType"><option value="potion">Drinkable</option><option value="splash_potion">Splash</option><option value="lingering_potion">Lingering</option></select></label>
          <label>Color <input id="ptCol" type="color" value="#38bdf8"></label>
        </div>
        <div class="bar">
          <select id="ptAddSel">${FX_LIST.map(f=>`<option value="${f[0]}">${f[1]}</option>`).join('')}</select>
          <label>Lv <input id="ptAmp" type="number" value="10" min="1" max="255" style="width:66px"></label>
          <label>Sec <input id="ptDur" type="number" value="600" min="1" max="99999" style="width:76px"></label>
          <button class="btn brand sm" id="ptAdd">+ Add Effect</button>
        </div>
        <div id="ptList" style="margin:8px 0"></div>
        <pre class="codebox" id="ptCmd"></pre>
        <button class="btn brand sm" id="ptCopy">Copy Potion /give Command</button>
      </div>

      <div class="panel">
        <h3>Custom Firework Rocket Designer</h3>
        <div class="bar">
          <label>Shape <select id="fwShape"><option value="large_ball">Large Ball</option><option value="star">Star</option><option value="creeper">Creeper Face</option><option value="burst">Burst</option><option value="small_ball">Small Ball</option></select></label>
          <label>Flight <select id="fwFlight"><option value="1">1 (Short)</option><option value="2" selected>2 (Medium)</option><option value="3">3 (High)</option></select></label>
          <label>Count <input id="fwCnt" type="number" value="64" min="1" max="64" style="width:68px"></label>
        </div>
        <div class="bar">
          <label>Color 1 <input id="fwC1" type="color" value="#38bdf8"></label>
          <label>Color 2 <input id="fwC2" type="color" value="#f43f5e"></label>
          <label>Fade <input id="fwFade" type="color" value="#facc15"></label>
        </div>
        <div class="bar">
          <label><input type="checkbox" id="fwTrail" checked> Sparkle Trail</label>
          <label><input type="checkbox" id="fwTwink" checked> Twinkle Flicker</label>
        </div>
        <pre class="codebox" id="fwCmd"></pre>
        <button class="btn brand sm" id="fwCopy">Copy Firework /give Command</button>
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
      const nm=$('#ptName').value.trim()||'Custom Potion',type=$('#ptType').value,col=$('#ptCol').value;
      const fxStr=potFx.map(f=>`{id:"minecraft:${f.id}",amplifier:${Math.max(0,f.amp-1)},duration:${f.dur*20}}`).join(',');
      $('#ptCmd').textContent=`/give @p minecraft:${type}[custom_name='${JSON.stringify({text:nm,color:col,bold:true,italic:false}).replace(/'/g,"\\'")}',potion_contents={custom_color:${hexInt(col)},custom_effects:[${fxStr}]}] 1`;
    }
    $('#ptAdd').onclick=()=>{potFx.push({id:$('#ptAddSel').value,amp:Math.min(255,+$('#ptAmp').value||1),dur:+$('#ptDur').value||60});updPot();};
    ['#ptName','#ptType','#ptCol'].forEach(s=>{$(s).oninput=updPot;$(s).onchange=updPot;});
    $('#ptCopy').onclick=()=>copy($('#ptCmd').textContent);
    updPot();

    function updFw(){
      const sh=$('#fwShape').value,fl=+$('#fwFlight').value,cnt=+$('#fwCnt').value||64;
      const c1=hexInt($('#fwC1').value),c2=hexInt($('#fwC2').value),fade=hexInt($('#fwFade').value);
      const tr=$('#fwTrail').checked?'true':'false',tw=$('#fwTwink').checked?'true':'false';
      $('#fwCmd').textContent=`/give @p minecraft:firework_rocket[fireworks={flight_duration:${fl},explosions:[{shape:"${sh}",colors:[I;${c1},${c2}],fade_colors:[I;${fade}],has_trail:${tr},has_twinkle:${tw}}]}] ${cnt}`;
    }
    ['#fwShape','#fwFlight','#fwCnt','#fwC1','#fwC2','#fwFade','#fwTrail','#fwTwink'].forEach(s=>{$(s).oninput=updFw;$(s).onchange=updFw;});
    $('#fwCopy').onclick=()=>copy($('#fwCmd').textContent);
    updFw();
  }

  // ==================== 2. BANNER DESIGNER (WITH 16 COOL PRESETS + 34 PATTERNS) ====================
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
          <div style="margin-top:12px"><b>Java 1.21+ /give Command</b></div>
          <pre class="codebox" id="bCmd"></pre>
          <div class="bar" style="margin:0">
            <button class="btn brand sm" id="bCopy">Copy /give Command</button>
            <button class="btn alt sm" id="bShield">Copy Matching Shield /give</button>
          </div>
        </div>
        <div class="panel" style="display:flex;flex-direction:column;align-items:center;gap:12px">
          <h3>Live Banner Preview</h3>
          <canvas id="bCv" width="240" height="480" style="border:1px solid var(--edge);border-radius:4px;background:#050c1f;image-rendering:pixelated"></canvas>
          <div class="small">Works on both Banners and Shields! Survival loom supports up to 6 layers; <code>/give</code> supports unlimited.</div>
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

      const pats=bLayers.map(l=>`{pattern:"minecraft:${l.pattern}",color:"${l.color}"}`).join(',');
      $('#bCmd').textContent=`/give @p minecraft:${bBase}_banner${bLayers.length?`[banner_patterns=[${pats}]]`:''} 1`;
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
      const pats=bLayers.map(l=>`{pattern:"minecraft:${l.pattern}",color:"${l.color}"}`).join(',');
      copy(`/give @p minecraft:shield[base_color="${bBase}"${bLayers.length?`,banner_patterns=[${pats}]`:''}] 1`);
    };
    drawBanner();
  }

  // ==================== 3. FANCY RGB TEXT, SMALL CAPS, GLITCH, RAINBOW & MOTD ====================
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
        <div class="bar"><input id="txIn" type="text" value="Solstice SMP" style="flex:1;min-width:200px"></div>
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
            <option value="wide">Vaporwave Wide (ＳＯＬＳＴＩＣＥ)</option>
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
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/tellraw (Chat broadcast)</b><button class="btn alt sm" id="cpTell">Copy</button></div>
        <pre class="codebox" id="outTell"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/title (Big screen title)</b><button class="btn alt sm" id="cpTitle">Copy</button></div>
        <pre class="codebox" id="outTitle"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/title actionbar (Above hotbar)</b><button class="btn alt sm" id="cpAct">Copy</button></div>
        <pre class="codebox" id="outAct"></pre>
        <div class="bar" style="justify-content:space-between;margin-bottom:2px"><b>/give Renamed Netherite Sword (1.21+)</b><button class="btn alt sm" id="cpGive">Copy</button></div>
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
      b.onclick=()=>{
        stops=cols.slice();
        $('#txC1').value=cols[0];
        $('#txC2').value=cols[Math.floor(cols.length/2)];
        $('#txC3').value=cols[cols.length-1];
        update();
      };
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

      if(st==='glitch'){
        comps.push({text:'|',color:stops[0],obfuscated:true,bold});
        const g1=el('span',null,'▓ ');g1.style.color=stops[0];prev.append(g1);
      }
      chars.forEach((ch,i)=>{
        const col=sampleStops(stops,i/n);
        const sp=el('span',null,ch);
        sp.style.color=col;
        if(bold) sp.style.fontWeight='700';
        if(ital) sp.style.fontStyle='italic';
        if(und||str) sp.style.textDecoration=(und?'underline ':'')+(str?'line-through':'');
        prev.append(sp);
        const o={text:ch,color:col};
        if(bold) o.bold=true;
        o.italic=ital;
        if(und) o.underlined=true;
        if(str) o.strikethrough=true;
        comps.push(o);
        const h6=col.slice(1);
        hexStr+=`§x§${h6[0]}§${h6[1]}§${h6[2]}§${h6[3]}§${h6[4]}§${h6[5]}${bold?'§l':''}${ital?'§o':''}${und?'§n':''}${str?'§m':''}${ch}`;
      });
      if(st==='glitch'){
        comps.push({text:'|',color:stops[stops.length-1],obfuscated:true,bold});
        const g2=el('span',null,' ▓');g2.style.color=stops[stops.length-1];prev.append(g2);
      }

      const json=JSON.stringify(comps);
      $('#outTell').textContent=`/tellraw @a ${json}`;
      $('#outTitle').textContent=`/title @a title ${json}`;
      $('#outAct').textContent=`/title @a actionbar ${json}`;
      $('#outGive').textContent=`/give @p minecraft:netherite_sword[custom_name='${json.replace(/'/g,"\\'")}'] 1`;
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

  // ==================== 4. CIRCLE, DOME & SPHERE BUILDER ====================
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
        <div class="small">Tip: Odd diameters (15, 19, 25) have a single center block; even diameters have a 2x2 center.</div>
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
        return shape==='disc'?dist<=r:(dist<=r&&dist>=r-1.08);
      }
      const cy=shape==='dome'?(y+0.5):(y+0.5-r);
      const dist=Math.hypot(cx,cy,cz);
      return dist<=r&&dist>=r-1.08;
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
      for(let z=0;z<d;z++)for(let x=0;x<d;x++){
        const on=voxelOn(sh,d,x,curY,z);
        const prevOn=is3d&&curY>0&&voxelOn(sh,d,x,curY-1,z);
        const px=pad+x*cell,py=pad+z*cell;
        if(on){layerCnt++;ctx.fillStyle='#7dd3fc';ctx.fillRect(px+0.8,py+0.8,Math.max(1,cell-1.6),Math.max(1,cell-1.6));}
        else if(prevOn){ctx.fillStyle='rgba(141,156,196,0.22)';ctx.fillRect(px+1,py+1,Math.max(1,cell-2),Math.max(1,cell-2));}
        if(d<=45){ctx.strokeStyle='#16254d';ctx.lineWidth=1;ctx.strokeRect(px,py,cell,cell);}
      }
      if(chkC.checked){
        ctx.strokeStyle='rgba(255,255,255,0.45)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(W/2,pad);ctx.lineTo(W/2,W-pad);ctx.moveTo(pad,W/2);ctx.lineTo(W-pad,W/2);ctx.stroke();
      }
      if(is3d){for(let y=0;y<maxY;y++)for(let z=0;z<d;z++)for(let x=0;x<d;x++)if(voxelOn(sh,d,x,y,z))totalCnt++;}
      else totalCnt=layerCnt;

      $('#bpLayerCnt').textContent=layerCnt;$('#bpLayerSt').textContent=fmtStacks(layerCnt);
      $('#bpTotCnt').textContent=totalCnt;$('#bpTotSt').textContent=fmtStacks(totalCnt);
    }
    [shapeSel,diaIn,layIn,chkC].forEach(x=>{x.oninput=draw;x.onchange=draw;});
    $('#bpPng').onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=`solstice_${shapeSel.value}_${diaIn.value}.png`;a.click();toast('Saved blueprint PNG!');};
    draw();
  }

  // ==================== 5. NETHER PORTAL, CHUNK & DISTANCE CALC ====================
  function renderNether(){
    stage.innerHTML=`<div class="mc-grid">
      <div class="panel">
        <h3>Overworld &amp; Nether Portal Linker</h3>
        <div class="small" style="margin-bottom:8px">Edit either side and coordinates sync automatically (8:1 ratio).</div>
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
      const x=+$('#owX').value||0,z=+$('#owZ').value||0,cx=Math.floor(x/16),cz=Math.floor(z/16);
      $('#ckOw').textContent=`${cx}, ${cz}`;
      $('#rgOw').textContent=`r.${Math.floor(cx/32)}.${Math.floor(cz/32)}.mca`;
      $('#offOw').textContent=`${((x%16)+16)%16}, ${((z%16)+16)%16}`;
    }
    ['#owX','#owY','#owZ'].forEach(s=>$(s).oninput=()=>{$('#ntX').value=Math.round((+$('#owX').value||0)/8);$('#ntY').value=+$('#owY').value||64;$('#ntZ').value=Math.round((+$('#owZ').value||0)/8);updChunk();});
    ['#ntX','#ntY','#ntZ'].forEach(s=>$(s).oninput=()=>{$('#owX').value=Math.round((+$('#ntX').value||0)*8);$('#owY').value=+$('#ntY').value||64;$('#owZ').value=Math.round((+$('#ntZ').value||0)*8);updChunk();});
    function updDist(){
      const d=Math.hypot((+$('#dX2').value||0)-(+$('#dX1').value||0),(+$('#dZ2').value||0)-(+$('#dZ1').value||0));
      $('#dDist').textContent=`${Math.round(d)} blocks`;$('#dNeth').textContent=`${Math.round(d/8)} blocks`;
      $('#dWalk').textContent=fmtT(d/7.1);$('#dEly').textContent=fmtT(d/33.5);$('#dIce').textContent=fmtT(d/72.7);
    }
    ['#dX1','#dZ1','#dX2','#dZ2'].forEach(s=>$(s).oninput=updDist);
    updChunk();updDist();
  }

  // ==================== 6. MAX GEAR & ENCHANTMENT /GIVE PLANNER ====================
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
        lvl.value=picked[id]||max;
        lvl.onchange=()=>{picked[id]=+lvl.value;updateCmd();};
        row.append(lab,lvl);box.append(row);
      });
      updateCmd();
    }
    function updateCmd(){
      const comps=[],eEntries=Object.entries(picked).map(([k,v])=>`"minecraft:${k}":${v}`);
      if(eEntries.length) comps.push(`enchantments={levels:{${eEntries.join(',')}}}`);
      const nm=$('#gName').value.trim();
      if(nm) comps.push(`custom_name='${JSON.stringify({text:nm,italic:false}).replace(/'/g,"\\'")}'`);
      if($('#gUnb').checked) comps.push('unbreakable={}');
      $('#gCmd').textContent=`/give @p minecraft:${curItem}${comps.length?'['+comps.join(',')+']':''} 1`;
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
