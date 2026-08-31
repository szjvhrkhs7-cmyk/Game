import { Renderer, cameraFor } from "./renderer.js?v=2";
import { MISSIONS, WORLD_SIZE, checkCollision, createWorld, missionDistance, nearestMission, surfaceAt } from "./world.js";
import { SURFACES, collisionDamage, createVehicleState, refuelVehicle, repairVehicle, stepVehicle, applyUpgrade, clamp } from "./physics.js";

export class ProsyolokGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.world = createWorld();
    this.vehicle = createVehicleState(options.vehicle);
    this.completedMissions = options.completedMissions ?? [];
    this.activeMissionId = options.activeMissionId ?? null;
    this.weather = options.weather ?? "clear";
    this.time = options.time ?? 15.5;
    this.quality = options.quality ?? .85;
    this.cameraMode = options.cameraMode ?? 0;
    this.orbit = 0;
    this.input = { throttle:0, brake:0, handbrake:0, steer:0 };
    this.running = false;
    this.paused = false;
    this.accumulator = 0;
    this.lastTime = 0;
    this.fps = 0;
    this.frames = 0;
    this.fpsTime = 0;
    this.particles = [];
    this.onUpdate = () => {};
    this.onMessage = () => {};
    this.onMissionComplete = () => {};
  }

  get activeMission(){return MISSIONS.find((item)=>item.id===this.activeMissionId)??null;}
  get snapshot(){return{vehicle:this.vehicle,completedMissions:this.completedMissions,activeMissionId:this.activeMissionId,weather:this.weather,time:this.time,quality:this.quality,cameraMode:this.cameraMode};}
  start(){if(this.running)return;this.running=true;this.lastTime=performance.now();requestAnimationFrame((time)=>this.#loop(time));}
  stop(){this.running=false;}
  toggleEngine(){if(this.vehicle.fuel<=0){this.onMessage("Бак пуст");return;}this.vehicle={...this.vehicle,engineOn:!this.vehicle.engineOn};this.onMessage(this.vehicle.engineOn?"Двигатель запущен":"Двигатель остановлен");navigator.vibrate?.(25);}
  toggleGear(){if(Math.abs(this.vehicle.speed)>.8){this.onMessage("Сначала остановитесь");return;}this.vehicle={...this.vehicle,gear:this.vehicle.gear==="D"?"R":"D"};navigator.vibrate?.(18);}
  cycleCamera(){this.cameraMode=(this.cameraMode+1)%3;this.onMessage(["Камера снаружи","Вид из салона","Камера сверху"][this.cameraMode]);}
  toggleLights(){this.vehicle={...this.vehicle,headlights:!this.vehicle.headlights};}
  acceptNearbyMission(){const mission=nearestMission(this.snapshot,this.vehicle.x,this.vehicle.z);if(!mission){this.onMessage("Подъедьте к отметке задания");return false;}this.activeMissionId=mission.id;if(mission.weather)this.weather=mission.weather;this.onMessage(`Принято: ${mission.title}`);return true;}
  service(action){let result;if(action==="fuel")result=refuelVehicle(this.vehicle,15);else if(action==="repair")result=repairVehicle(this.vehicle,true);else result=applyUpgrade(this.vehicle,action);if(result.ok)this.vehicle=result.state;this.onMessage(result.message);return result;}
  recover(){this.vehicle={...this.vehicle,x:0,z:-210,heading:0,speed:0,damage:Math.min(100,this.vehicle.damage+4)};this.onMessage("Автомобиль возвращён к гаражу");}

  #loop(time){if(!this.running)return;const elapsed=Math.min(.1,(time-this.lastTime)/1000);this.lastTime=time;if(!this.paused){this.accumulator+=elapsed;while(this.accumulator>=1/60){this.#update(1/60);this.accumulator-=1/60;}this.time=(this.time+elapsed*.012)%24;}this.#render();this.frames+=1;this.fpsTime+=elapsed;if(this.fpsTime>=1){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0;}this.onUpdate(this);requestAnimationFrame((next)=>this.#loop(next));}

  #update(dt){
    const previous=this.vehicle;
    const surface=surfaceAt(previous.x,previous.z,this.weather);
    let next=stepVehicle(previous,this.input,dt,surface);
    const obstacle=checkCollision(this.world.obstacles,next.x,next.z);
    const outside=Math.abs(next.x)>WORLD_SIZE/2||Math.abs(next.z)>WORLD_SIZE/2;
    if(obstacle||outside){const damage=collisionDamage(previous.speed,obstacle?.type==="tree"?1.1:.7);next={...next,x:previous.x,z:previous.z,speed:-previous.speed*.18,damage:clamp(previous.damage+damage,0,100)};if(damage>0){this.onMessage(`Столкновение: повреждение +${damage}%`);navigator.vibrate?.([35,25,45]);}}
    this.vehicle=next;
    if(Math.abs(next.speed)>3&&SURFACES[surface].dust>0&&this.particles.length<28&&Math.random()<.18){this.particles.push({x:next.x,y:.2,z:next.z,life:1,size:.5+Math.random()*.6,color:surface==="mud"?"#574b38":"#a78f69"});}
    for(const particle of this.particles){particle.y+=dt*.8;particle.life-=dt*.9;particle.size+=dt*.7;}this.particles=this.particles.filter((item)=>item.life>0);
    const mission=this.activeMission;if(mission&&missionDistance(mission,next.x,next.z,true)<12&&Math.abs(next.speed)<3){this.completedMissions=[...new Set([...this.completedMissions,mission.id])];this.activeMissionId=null;this.vehicle={...next,money:next.money+mission.reward};this.weather="clear";this.onMissionComplete(mission);}
  }

  #render(){
    const r=this.renderer,v=this.vehicle;
    r.begin(cameraFor(v,this.cameraMode,this.orbit),this.weather,this.time,this.quality);
    r.draw("cube",0,-.45,0,WORLD_SIZE,.6,WORLD_SIZE,"#536b43");
    r.draw("cube",0,.015,8,14,.12,520,"#46484a");
    r.draw("cube",0,.02,30,440,.13,14,"#494b4d");
    r.draw("cube",-92,.025,-182,255,.14,12,"#7a6d58");
    r.draw("cube",170,.03,16,13,.15,340,"#796447");
    r.draw("cube",-126,.03,155,15,.15,132,"#705c43");
    r.draw("cube",0,.08,261,520,.18,19,"#446f7d");
    r.draw("cube",0,.22,261,25,.5,14,"#756c5c");
    r.draw("cube",120,.05,261,30,.2,20,"#655e53");
    r.draw("cube",100,.04,115,90,.12,60,"#4c3f2f");
    r.draw("cube",-190,.04,-168,72,.12,55,"#a58d64");
    for(const item of this.world.objects){
      if(Math.hypot(item.x-v.x,item.z-v.z)>150/this.quality)continue;
      if(item.type==="tree"){r.draw("cylinder",item.x,item.y-item.sy*.28,item.z,item.sx*.32,item.sy*.5,item.sz*.32,"#5b4634");r.draw("cylinder",item.x,item.y+item.sy*.15,item.z,item.sx*1.8,item.sy*.7,item.sz*1.8,item.color);continue;}
      if(item.type==="roof"){r.draw("cube",item.x,item.y,item.z,item.sx,item.sy,item.sz,item.color,{z:.16});continue;}
      r.draw("cube",item.x,item.y,item.z,item.sx,item.sy,item.sz,item.color);
      if(["house","shop","farm","station"].includes(item.type)){
        r.draw("cube",item.x-item.sx*.27,item.y,item.z+item.sz*.505,item.sx*.18,item.sy*.28,.12,"#b8d1cc");
        r.draw("cube",item.x+item.sx*.2,item.y,item.z+item.sz*.505,item.sx*.18,item.sy*.28,.12,"#b8d1cc");
      }
    }
    const pending=MISSIONS.filter((m)=>!this.completedMissions.includes(m.id));
    for(const mission of pending){const target=mission.id===this.activeMissionId?mission.finish:mission.start;const pulse=2.2+Math.sin(performance.now()*.004)*.35;r.draw("cylinder",target[0],pulse/2,target[1],pulse*.65,pulse,pulse*.65,mission.id===this.activeMissionId?"#e3a94d":"#d8d0ad");}
    for(const particle of this.particles)r.draw("cube",particle.x,particle.y,particle.z,particle.size,particle.size,particle.size,particle.color);
    this.#drawCar();
  }

  #drawCar(){
    const r=this.renderer,v=this.vehicle,h=v.heading,fx=Math.sin(h),fz=Math.cos(h),rx=Math.cos(h),rz=-Math.sin(h);
    const local=(side,forward)=>[v.x+rx*side+fx*forward,v.z+rz*side+fz*forward];
    if(this.cameraMode!==1){r.draw("cube",v.x,1.05,v.z,3.3,.9,6.3,"#6f7d72",{y:h});r.draw("cube",v.x-fx*.25,1.85,v.z-fz*.25,2.75,1.15,3.2,"#3d5558",{y:h});r.draw("cube",v.x+fx*3.17,.96,v.z+fz*3.17,2.55,.28,.15,"#d8c995",{y:h});}
    for(const [side,forward] of [[-1.65,2],[1.65,2],[-1.65,-2],[1.65,-2]]){const [x,z]=local(side,forward);r.draw("cylinder",x,.7,z,1.05,.48,1.05,"#181b1d",{x:Math.PI/2,y:h,z:Math.PI/2});}
    if(v.headlights){const [lx,lz]=local(-.85,3.22),[rxp,rzp]=local(.85,3.22);r.draw("cube",lx,.98,lz,.55,.3,.12,"#f6dfa2",{y:h});r.draw("cube",rxp,.98,rzp,.55,.3,.12,"#f6dfa2",{y:h});}
  }
}
