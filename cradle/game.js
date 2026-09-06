import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas = document.querySelector('#game');
const startButton = document.querySelector('#startButton');
const objectiveEl = document.querySelector('#objective');
const hpText = document.querySelector('#hpText');
const hpBar = document.querySelector('#hpBar');
const abilityText = document.querySelector('#abilityText');
const bossHud = document.querySelector('#bossHud');
const bossBar = document.querySelector('#bossBar');
const bossState = document.querySelector('#bossState');
const messageEl = document.querySelector('#message');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x061014);
scene.fog = new THREE.FogExp2(0x071216, 0.018);
const camera = new THREE.PerspectiveCamera(64, 1, 0.08, 420);

const hemi = new THREE.HemisphereLight(0xa8d8e1, 0x0d1719, 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xd6f2ff, 2.5);
sun.position.set(-18, 34, -24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -60; sun.shadow.camera.right = 60; sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -20;
scene.add(sun);

const C = {
  metal: 0x26373b, dark: 0x111d20, rust: 0x7a3519, stone: 0x374347,
  energy: 0x23d8c4, foliage: 0x28583e, orange: 0xf1652a, black: 0x081012
};
const mats = new Map();
function mat(color, emissive=0, intensity=0){
  const key = `${color}-${emissive}-${intensity}`;
  if(!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.22,emissive,emissiveIntensity:intensity}));
  return mats.get(key);
}

const colliders = [];
const platforms = [];
function box(name, pos, size, color=C.stone, collidable=true){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x,size.y,size.z), mat(color));
  mesh.name = name; mesh.position.copy(pos); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  if(collidable){ const b={mesh,min:new THREE.Vector3(),max:new THREE.Vector3(),top:0}; refreshBox(b,size); colliders.push(b); platforms.push(b); }
  return mesh;
}
function refreshBox(b,size){
  b.min.set(b.mesh.position.x-size.x/2,b.mesh.position.y-size.y/2,b.mesh.position.z-size.z/2);
  b.max.set(b.mesh.position.x+size.x/2,b.mesh.position.y+size.y/2,b.mesh.position.z+size.z/2); b.top=b.max.y;
}
function cylinder(pos, radius, height, color){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,16),mat(color));m.position.copy(pos);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function glowSphere(pos,r=.3,color=C.energy){
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),mat(color,color,1.5));m.position.copy(pos);scene.add(m);return m;
}
function pointLight(pos,color,intensity=18,distance=16){ const l=new THREE.PointLight(color,intensity,distance,2);l.position.copy(pos);scene.add(l);return l; }
function beam(a,b,r,color){ const mid=a.clone().add(b).multiplyScalar(.5);const d=a.distanceTo(b);const m=cylinder(mid,r,d,color);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m; }

function buildLevel(){
  box('Start Ledge',new THREE.Vector3(0,0,-8),new THREE.Vector3(12,1,12));
  box('Walkway A',new THREE.Vector3(0,1.6,2),new THREE.Vector3(6,0.8,5),C.metal);
  box('Walkway B',new THREE.Vector3(4.2,3.5,8),new THREE.Vector3(5,0.8,4.5),C.rust);
  box('Walkway C',new THREE.Vector3(-2.4,5.5,14),new THREE.Vector3(5.5,0.8,4.5),C.metal);
  box('Echo Shrine',new THREE.Vector3(2.4,7.5,20),new THREE.Vector3(7,0.8,6),C.stone);
  box('Shaft Left',new THREE.Vector3(-2.7,10.8,28),new THREE.Vector3(1,9,5),C.dark);
  box('Shaft Right',new THREE.Vector3(2.7,12.0,28),new THREE.Vector3(1,9,5),C.dark);
  box('Gate Landing',new THREE.Vector3(0,11.7,34),new THREE.Vector3(9,0.8,7),C.stone);
  box('Upper Bridge',new THREE.Vector3(0,14.1,44),new THREE.Vector3(5,0.8,10),C.metal);
  box('Boss Arena',new THREE.Vector3(0,17,58),new THREE.Vector3(19,1,19),C.stone);
  box('Boss West',new THREE.Vector3(-6,19.0,58),new THREE.Vector3(4.4,.7,4.4),C.foliage);
  box('Boss East',new THREE.Vector3(6,21.0,59),new THREE.Vector3(4.4,.7,4.4),C.foliage);
  box('Boss North',new THREE.Vector3(0,23.0,64),new THREE.Vector3(4.4,.7,4.4),C.foliage);

  for(let i=0;i<6;i++){
    box(`shaft-rib-${i}`,new THREE.Vector3(0,7.5+i*1.6,30.4),new THREE.Vector3(6.4,.18,.28),i%2?C.rust:C.dark,false);
  }
  beam(new THREE.Vector3(-5.5,1,-1),new THREE.Vector3(-10,11,7),.22,C.rust);
  beam(new THREE.Vector3(5.8,4,2),new THREE.Vector3(9,13,12),.20,C.dark);
  beam(new THREE.Vector3(-8,10,49),new THREE.Vector3(-13,24,62),.24,C.rust);
  for(const [x,y,z] of [[-4.3,2,-3],[2.6,4.3,8.4],[-2.7,6.2,15.3],[2.4,8.5,20],[0,13.1,34]]){
    glowSphere(new THREE.Vector3(x,y,z),.18);pointLight(new THREE.Vector3(x,y+.3,z),C.energy,7,7);
  }
  for(let i=0;i<18;i++){
    const a=i*.73,r=24+(i%4)*5;
    const x=Math.cos(a)*r,z=36+Math.sin(a)*r,y=5+(i%6)*5;
    const h=7+(i%5)*4;box(`distant-${i}`,new THREE.Vector3(x,y,z),new THREE.Vector3(2.5,h,2.5),i%3===0?C.rust:C.dark,false);
    if(i%4===0) glowSphere(new THREE.Vector3(x,y+h*.52,z),.16,C.energy);
  }
  for(const x of [-1.5,6.2]) cylinder(new THREE.Vector3(x,10,20),.42,5.2,C.dark);
  box('shrine-crown',new THREE.Vector3(2.4,12.4,20),new THREE.Vector3(8.4,.45,1.1),C.rust,false);
  cylinder(new THREE.Vector3(2.4,8.45,20),1.0,.8,C.dark);
  pointLight(new THREE.Vector3(2.4,10.5,20),C.energy,28,18);
  for(const x of [-4.1,4.1]) cylinder(new THREE.Vector3(x,14.2,38.7),.55,6.3,C.dark);
  box('gate-crown',new THREE.Vector3(0,17.4,38.7),new THREE.Vector3(9.4,.55,1.3),C.rust,false);
  pointLight(new THREE.Vector3(0,15,38),C.energy,18,14);
  for(let i=0;i<8;i++){
    const x=-5+i*1.45;beam(new THREE.Vector3(x,14.8,50),new THREE.Vector3(x*.65,18.2,57),.16+(i%3)*.05,C.foliage);
  }
  pointLight(new THREE.Vector3(0,21,59),C.orange,26,24);
  for(const p of [[-5,23,52],[5,26,58],[0,29,65]]) glowSphere(new THREE.Vector3(...p),.35,C.energy);
}
buildLevel();

const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(.38,1.0,6,12),mat(0x9ab6b0));body.position.y=.9;body.castShadow=true;player.add(body);
const core = new THREE.Mesh(new THREE.SphereGeometry(.15,16,10),mat(C.energy,C.energy,2));core.position.set(0,1.1,.34);player.add(core);
scene.add(player);player.position.set(0,1,-8);

const state={hp:100,maxHp:100,velocity:new THREE.Vector3(),grounded:false,jumps:0,checkpoint:new THREE.Vector3(0,1,-8),echo:false,double:false,grapple:false,dead:false,gateOpen:false,victory:false};
const keys=new Set();let yaw=0,pitch=.25;let locked=null;let lastTime=performance.now();let meleeCooldown=0;let shootCooldown=0;let damageCooldown=0;let checkpointStage=0;

const enemies=[];const projectiles=[];const anchors=[new THREE.Vector3(-5,23,52),new THREE.Vector3(5,26,58),new THREE.Vector3(0,29,65)];
function enemy(name,pos,hp=50){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(.55,18,12),mat(C.rust));mesh.position.copy(pos);mesh.scale.y=.7;mesh.castShadow=true;scene.add(mesh);
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),mat(C.orange,C.orange,1.7));eye.position.set(0,.08,.48);mesh.add(eye);
  const e={name,mesh,hp,maxHp:hp,dead:false};enemies.push(e);return e;
}
enemy('Scrap Drone',new THREE.Vector3(2,2.6,3),45);enemy('Scrap Drone',new THREE.Vector3(-1.5,6.6,14),55);enemy('Scrap Drone',new THREE.Vector3(4,8.8,21),60);enemy('Scrap Drone',new THREE.Vector3(0,15.2,43),70);

const shrineCore=glowSphere(new THREE.Vector3(2.4,8.5,20),.48,C.energy);
let gate=box('Resonance Gate',new THREE.Vector3(0,14.4,39.1),new THREE.Vector3(7.4,5.2,.8),0x17646a,true);
const gateCollider=colliders[colliders.length-1];

const boss={group:new THREE.Group(),hp:180,maxHp:180,dead:false,nextShot:0,weak:[]};scene.add(boss.group);boss.group.position.set(0,19.4,59);
const trunk=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.6,4.8,16),mat(0x4e3725));trunk.position.y=0;trunk.castShadow=true;boss.group.add(trunk);
for(const p of [[-1.55,.3,-1.45],[1.55,1.5,-.7],[0,3,1.1]]){
  const m=new THREE.Mesh(new THREE.SphereGeometry(.46,16,10),mat(C.orange,C.orange,1.8));m.position.set(...p);boss.group.add(m);boss.weak.push({mesh:m,hp:22,dead:false});
}

function updateHud(){
  hpText.textContent=`${Math.ceil(state.hp)} / ${state.maxHp}`;hpBar.style.width=`${Math.max(0,state.hp/state.maxHp)*100}%`;
  const abilities=['Mantle','Wall Jump'];if(state.echo)abilities.push('Echo Bow');if(state.double)abilities.push('Double Jump');if(state.grapple)abilities.push('Grapple');abilityText.textContent=abilities.join(' · ');
  const weakLeft=boss.weak.filter(w=>!w.dead).length;
  const inBoss=player.position.z>49 || boss.dead || weakLeft<3;
  bossHud.classList.toggle('hidden',!inBoss);
  bossBar.style.width=`${Math.max(0,boss.hp/boss.maxHp)*100}%`;
  bossState.textContent=weakLeft>0?`Резонансные узлы: ${weakLeft}`:(boss.dead?'ПОВЕРЖЕН':'СТРАЖ УЯЗВИМ');
  if(state.victory)objectiveEl.textContent='Шпиль пройден. Двойной прыжок и крюк-кошка разблокированы.';
  else if(inBoss)objectiveEl.textContent=weakLeft>0?'Разбей Эхо-стрелами три резонансных узла Стража.':'Страж уязвим. Добей его.';
  else if(state.echo)objectiveEl.textContent='Пройди резонансные врата и поднимись к вершине.';
  else objectiveEl.textContent='Доберись до святилища Эхо-Лука.';
}
function flash(msg){messageEl.textContent=msg;messageEl.classList.remove('hidden');clearTimeout(flash.t);flash.t=setTimeout(()=>messageEl.classList.add('hidden'),1800);}
function hurt(amount){if(damageCooldown>0||state.dead)return;state.hp-=amount;damageCooldown=.8;if(state.hp<=0)respawn();}
function respawn(){state.dead=true;state.hp=state.maxHp;state.velocity.set(0,0,0);player.position.copy(state.checkpoint);setTimeout(()=>state.dead=false,100);flash('Система корпуса перезапущена');}

function platformTopAt(x,z,feetY,vy){
  let best=-Infinity;
  for(const b of platforms){if(b===gateCollider && state.gateOpen)continue;if(x>b.min.x-.3&&x<b.max.x+.3&&z>b.min.z-.3&&z<b.max.z+.3){if(feetY>=b.top-.25&&feetY<=b.top+1.1&&vy<=0&&b.top>best)best=b.top;}}
  return best;
}
function nearWall(){
  const p=player.position;for(const b of platforms){if(b===gateCollider)continue;const insideY=p.y>b.min.y-.2&&p.y<b.max.y+2; if(!insideY)continue;const dx=Math.min(Math.abs(p.x-b.min.x),Math.abs(p.x-b.max.x));const dz=Math.min(Math.abs(p.z-b.min.z),Math.abs(p.z-b.max.z));if((dx<.65&&p.z>b.min.z-.4&&p.z<b.max.z+.4)||(dz<.65&&p.x>b.min.x-.4&&p.x<b.max.x+.4)) return true;}return false;
}

function jump(){
  if(state.grounded){state.velocity.y=8.2;state.grounded=false;state.jumps=1;}
  else if(nearWall()){state.velocity.y=8.5;state.jumps=1;flash('Wall Jump');}
  else if(state.double&&state.jumps<2){state.velocity.y=8.0;state.jumps=2;flash('Double Jump');}
}
function cameraForward(){return new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)).normalize();}
function cameraRight(){const f=cameraForward();return new THREE.Vector3(f.z,0,-f.x);}
function tryMelee(){if(meleeCooldown>0)return;meleeCooldown=.42;let best=null,dist=2.4;for(const e of enemies){if(e.dead)continue;const d=e.mesh.position.distanceTo(player.position);if(d<dist){best=e;dist=d;}}if(!boss.dead&&boss.weak.every(w=>w.dead)){const d=boss.group.position.distanceTo(player.position);if(d<3.8){boss.hp-=22;flash('Кинетический удар');if(boss.hp<=0)killBoss();return;}}if(best){best.hp-=30;if(best.hp<=0){best.dead=true;best.mesh.visible=false;}flash('Кинетический удар');}}
function shoot(){if(!state.echo||shootCooldown>0){if(!state.echo)flash('Сначала найди Ядро Эхо-Лука');return;}shootCooldown=.28;const origin=player.position.clone().add(new THREE.Vector3(0,1.1,0));let targetDir;if(locked&&isTargetAlive(locked)){targetDir=targetPosition(locked).sub(origin).normalize();}else{targetDir=camera.getWorldDirection(new THREE.Vector3()).normalize();}const mesh=glowSphere(origin.clone().addScaledVector(targetDir,.7),.13,C.energy);projectiles.push({mesh,vel:targetDir.multiplyScalar(22),life:3,kind:'echo'});}
function isTargetAlive(t){return t && ((t.type==='enemy'&&!t.ref.dead)||(t.type==='weak'&&!t.ref.dead)||(t.type==='boss'&&!boss.dead));}
function targetPosition(t){if(t.type==='enemy')return t.ref.mesh.position.clone();if(t.type==='weak')return t.ref.mesh.getWorldPosition(new THREE.Vector3());return boss.group.position.clone().add(new THREE.Vector3(0,1,0));}
function cycleLock(){const candidates=[];for(const e of enemies)if(!e.dead)candidates.push({type:'enemy',ref:e});for(const w of boss.weak)if(!w.dead)candidates.push({type:'weak',ref:w});if(boss.weak.every(w=>w.dead)&&!boss.dead)candidates.push({type:'boss',ref:boss});let best=null,score=999;const f=camera.getWorldDirection(new THREE.Vector3());for(const t of candidates){const p=targetPosition(t);const d=p.distanceTo(player.position);if(d>25)continue;const dir=p.clone().sub(camera.position).normalize();const a=1-f.dot(dir);const s=a*4+d/25;if(s<score){score=s;best=t;}}locked=locked?null:best;flash(locked?'Цель захвачена':'Захват снят');}
function grapple(){if(!state.grapple){flash('Крюк-кошка ещё не активирован');return;}let best=null,d=16;for(const a of anchors){const x=a.distanceTo(player.position);if(x<d){d=x;best=a;}}if(best){const dir=best.clone().sub(player.position).normalize();state.velocity.copy(dir.multiplyScalar(15));state.velocity.y+=3;flash('Grapple');}}
function killBoss(){if(boss.dead)return;boss.dead=true;boss.group.visible=false;state.double=true;state.grapple=true;state.victory=true;flash('Страж Корней повержен');}

function updateEnemies(dt){
  for(const e of enemies){if(e.dead)continue;const to=player.position.clone().sub(e.mesh.position);const d=to.length();e.mesh.position.y+=Math.sin(performance.now()*.002+e.mesh.position.x)*.002;if(d<10&&d>1.5)e.mesh.position.addScaledVector(to.normalize(),dt*1.5);if(d<1.5&&damageCooldown<=0)hurt(10);}
  if(!boss.dead&&player.position.z>48){const to=player.position.clone().sub(boss.group.position);boss.group.rotation.y=Math.atan2(to.x,to.z);if(performance.now()/1000>boss.nextShot&&to.length()<24){boss.nextShot=performance.now()/1000+1.8;const dir=to.normalize();const origin=boss.group.position.clone().add(new THREE.Vector3(0,1.4,0));const mesh=glowSphere(origin,.18,C.orange);projectiles.push({mesh,vel:dir.multiplyScalar(11),life:5,kind:'hazard'});}}
}
function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.mesh.position.addScaledVector(p.vel,dt);p.life-=dt;let remove=p.life<=0;
    if(p.kind==='hazard'&&p.mesh.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,.9,0)))<.7){hurt(18);remove=true;}
    if(p.kind==='echo'){
      for(const e of enemies){if(!e.dead&&p.mesh.position.distanceTo(e.mesh.position)<.7){e.hp-=20;if(e.hp<=0){e.dead=true;e.mesh.visible=false;}remove=true;break;}}
      if(!remove&&!boss.dead){for(const w of boss.weak){if(!w.dead&&p.mesh.position.distanceTo(w.mesh.getWorldPosition(new THREE.Vector3()))<.7){w.hp-=22;remove=true;if(w.hp<=0){w.dead=true;w.mesh.visible=false;flash('Резонансный узел разрушен');}break;}}}
      if(!remove&&!boss.dead&&boss.weak.every(w=>w.dead)&&p.mesh.position.distanceTo(boss.group.position)<3){boss.hp-=18;remove=true;if(boss.hp<=0)killBoss();}
    }
    if(remove){scene.remove(p.mesh);projectiles.splice(i,1);}
  }
}

function updateGate(dt){if(state.echo&&!state.gateOpen&&player.position.z>32){state.gateOpen=true;flash('Резонансные врата разблокированы');}
  if(state.gateOpen&&gate.position.y<20){gate.position.y+=dt*5;gateCollider.min.y+=dt*5;gateCollider.max.y+=dt*5;gateCollider.top+=dt*5;}
}
function updateProgression(){
  if(!state.echo&&player.position.distanceTo(shrineCore.position)<1.4){state.echo=true;shrineCore.visible=false;flash('Получен Эхо-Лук');}
  if(checkpointStage<1&&player.position.z>23){checkpointStage=1;state.checkpoint.set(2.4,8.45,20);flash('Чекпоинт: Святилище Эха');}
  if(checkpointStage<2&&player.position.z>48){checkpointStage=2;state.checkpoint.set(0,15.1,44);flash('Чекпоинт: Верхний мост');}
}

function updatePlayer(dt){
  const forward=cameraForward(),right=cameraRight();const move=new THREE.Vector3();if(keys.has('KeyW'))move.add(forward);if(keys.has('KeyS'))move.sub(forward);if(keys.has('KeyD'))move.add(right);if(keys.has('KeyA'))move.sub(right);if(move.lengthSq()>0)move.normalize();const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?7.6:4.8;
  const target=move.multiplyScalar(speed);state.velocity.x=THREE.MathUtils.damp(state.velocity.x,target.x,10,dt);state.velocity.z=THREE.MathUtils.damp(state.velocity.z,target.z,10,dt);state.velocity.y-=22*dt;
  const before=player.position.clone();player.position.addScaledVector(state.velocity,dt);
  const top=platformTopAt(player.position.x,player.position.z,before.y,state.velocity.y);if(top>-Infinity&&player.position.y<=top+.03){player.position.y=top+.03;state.velocity.y=-.1;state.grounded=true;state.jumps=0;}else state.grounded=false;
  if(player.position.y<-16)respawn();
  if(state.grounded&&move.lengthSq()>0){const targetYaw=Math.atan2(state.velocity.x,state.velocity.z);player.rotation.y=THREE.MathUtils.damp(player.rotation.y,targetYaw,12,dt);}
}
function updateCamera(dt){
  let focus=player.position.clone().add(new THREE.Vector3(0,1.5,0));if(locked&&isTargetAlive(locked)){const tp=targetPosition(locked);const dir=tp.clone().sub(player.position);yaw=THREE.MathUtils.damp(yaw,Math.atan2(dir.x,dir.z),6,dt);focus.lerp(tp,.34);}const dist=6.6;const cp=Math.cos(pitch),sp=Math.sin(pitch);const desired=focus.clone().add(new THREE.Vector3(-Math.sin(yaw)*cp*dist,sp*dist+1.4,-Math.cos(yaw)*cp*dist));camera.position.lerp(desired,1-Math.exp(-12*dt));camera.lookAt(focus);}

function frame(now){const dt=Math.min(.033,(now-lastTime)/1000||.016);lastTime=now;meleeCooldown=Math.max(0,meleeCooldown-dt);shootCooldown=Math.max(0,shootCooldown-dt);damageCooldown=Math.max(0,damageCooldown-dt);if(document.pointerLockElement===canvas&&!state.dead){updatePlayer(dt);updateProgression();updateGate(dt);updateEnemies(dt);updateProjectiles(dt);}updateCamera(dt);updateHud();renderer.render(scene,camera);requestAnimationFrame(frame);}
requestAnimationFrame(frame);

function resize(){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();

startButton.addEventListener('click',()=>{canvas.requestPointerLock();startButton.classList.add('hidden');flash('Исследование начато');});
canvas.addEventListener('click',()=>{if(document.pointerLockElement!==canvas){canvas.requestPointerLock();startButton.classList.add('hidden');}});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='Space'){e.preventDefault();jump();}if(e.code==='KeyQ')cycleLock();if(e.code==='KeyE')grapple();});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('mousedown',e=>{if(document.pointerLockElement!==canvas)return;if(e.button===0)tryMelee();if(e.button===2)shoot();});
addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||locked)return;yaw-=e.movementX*.0024;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0019,-.18,.92);});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas&&!state.victory)startButton.classList.remove('hidden');});
