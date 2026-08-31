import test from "node:test";
import assert from "node:assert/strict";
import { SURFACES, applyUpgrade, collisionDamage, createVehicleState, refuelVehicle, repairVehicle, stepVehicle } from "../src/physics.js";
import { MISSIONS, checkCollision, createWorld, missionDistance, surfaceAt } from "../src/world.js";
import { SAVE_VERSION, validateSave } from "../src/storage.js";

const run = (state,input,seconds,surface="asphalt") => { let next=state; for(let i=0;i<seconds*60;i+=1) next=stepVehicle(next,input,1/60,surface); return next; };

test("двигатель не разгоняет выключенный автомобиль",()=>{const state=run(createVehicleState({engineOn:false}),{throttle:1},2);assert.equal(state.speed,0);});
test("работающий двигатель разгоняет автомобиль",()=>{const state=run(createVehicleState({engineOn:true}),{throttle:1},3);assert.ok(state.speed>5);assert.ok(state.rpm>1000);});
test("тормоз снижает скорость",()=>{const moving=createVehicleState({engineOn:true,speed:15});const stopped=run(moving,{brake:1},2);assert.ok(Math.abs(stopped.speed)<Math.abs(moving.speed));});
test("задняя передача меняет направление",()=>{const state=run(createVehicleState({engineOn:true,gear:"R"}),{throttle:1},2);assert.ok(state.speed<0);});
test("скорость имеет физический предел",()=>{const state=run(createVehicleState({engineOn:true}),{throttle:1},60);assert.ok(state.speed<=31.01);});
test("грязь замедляет сильнее асфальта",()=>{const base=createVehicleState({engineOn:true});const asphalt=run(base,{throttle:1},5,"asphalt");const mud=run(base,{throttle:1},5,"mud");assert.ok(asphalt.speed>mud.speed);});
test("руль меняет курс при движении",()=>{const state=run(createVehicleState({engineOn:true,speed:10}),{steer:.8,throttle:.2},1);assert.notEqual(state.heading,0);});
test("расход топлива связан с движением",()=>{const base=createVehicleState({engineOn:true,fuel:30});const state=run(base,{throttle:1},10);assert.ok(state.fuel<30);});
test("урон зависит от скорости столкновения",()=>{assert.equal(collisionDamage(2),0);assert.ok(collisionDamage(20)>collisionDamage(10));});
test("ремонт списывает деньги и устраняет повреждение",()=>{const result=repairVehicle(createVehicleState({money:5000,damage:20}),true);assert.equal(result.ok,true);assert.equal(result.state.damage,0);assert.ok(result.state.money<5000);});
test("заправка не превышает вместимость бака",()=>{const result=refuelVehicle(createVehicleState({money:5000,fuel:44}),15);assert.equal(result.ok,true);assert.equal(result.state.fuel,45);});
test("улучшение шин покупается последовательно",()=>{const result=applyUpgrade(createVehicleState({money:5000}),"tires");assert.equal(result.ok,true);assert.equal(result.state.upgrades.tires,1);});
test("мир содержит ориентиры и препятствия",()=>{const world=createWorld();assert.ok(world.objects.length>50);assert.ok(world.obstacles.length>40);assert.ok(checkCollision(world.obstacles,-25,-220));});
test("карта различает восемь покрытий",()=>{const samples=[surfaceAt(0,0),surfaceAt(0,0,"rain"),surfaceAt(170,0),surfaceAt(100,115),surfaceAt(-190,-168),surfaceAt(80,100),surfaceAt(50,50),surfaceAt(60,261)];assert.ok(new Set(samples).size>=6);assert.equal(Object.keys(SURFACES).length,8);});
test("в первой версии есть пять разных заданий",()=>{assert.equal(MISSIONS.length,5);assert.equal(new Set(MISSIONS.map((m)=>m.id)).size,5);assert.ok(MISSIONS.every((m)=>missionDistance(m,...m.finish,true)===0));});
test("формат сохранения проверяет обязательные данные",()=>{const valid={version:SAVE_VERSION,vehicle:createVehicleState(),completedMissions:[]};assert.equal(validateSave(valid),true);assert.equal(validateSave({...valid,vehicle:{x:NaN,z:0}}),false);assert.equal(validateSave({...valid,version:99}),false);});
