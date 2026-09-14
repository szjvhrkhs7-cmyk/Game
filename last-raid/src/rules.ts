export const BOSSES = ['Баранов','Замараева','Курилюк','Тётя Гри'] as const;
export const WEAPONS = ['Дубинки','Усиленная бита','Пистолет','Дробовик','Гранаты','Коктейль'] as const;
export type Weapon = typeof WEAPONS[number];
export interface Run { kills:number; level:number; pending:number; bossesQueued:number; bossesSpawned:number; bossesDefeated:number; seconds:number; grenades:number; weapons:Weapon[]; damage:number; speed:number; radius:number; armor:number; cooldown:number; companion:number; }
export function newRun():Run {return {kills:0,level:1,pending:0,bossesQueued:0,bossesSpawned:0,bossesDefeated:0,seconds:0,grenades:0,weapons:['Дубинки'],damage:1,speed:1,radius:1,armor:0,cooldown:1,companion:1};}
export function addKill(r:Run){r.kills++;if(r.kills%10===0){r.level++;r.pending++;}if(r.kills%50===0)r.bossesQueued++;}
export function nextBoss(r:Run){if(!r.bossesQueued)return null;const n=r.bossesSpawned++;r.bossesQueued--;return {name:BOSSES[n%4],kind:n%4,cycle:Math.floor(n/4)};}
export function nextWeapon(r:Run){return WEAPONS.find(w=>!r.weapons.includes(w));}
export function unlock(r:Run,w:Weapon){if(r.weapons.includes(w))return false;r.weapons.push(w);if(w==='Гранаты')r.grenades+=5;return true;}
export function useGrenade(r:Run){if(!r.weapons.includes('Гранаты')||r.grenades<=0)return false;r.grenades--;return true;}
export type Score = {kills:number;seconds:number;level:number;bosses:number;date:string};
export type Settings = {sound:boolean;vibration:boolean};
export interface StorageLike {getItem(key:string):string|null;setItem(key:string,value:string):void;}
export function readScores(s:StorageLike):Score[]{try{const a=JSON.parse(s.getItem('last-raid-scores-v1')||'[]');return Array.isArray(a)?a.filter(x=>x&&[x.kills,x.seconds,x.level,x.bosses].every(Number.isFinite)&&typeof x.date==='string').slice(0,10):[];}catch{return [];}}
export function saveScore(s:StorageLike,r:Run){const score={kills:r.kills,seconds:Math.floor(r.seconds),level:r.level,bosses:r.bossesDefeated,date:new Date().toISOString()};const list=[...readScores(s),score].sort((a,b)=>b.kills-a.kills||b.seconds-a.seconds).slice(0,10);try{s.setItem('last-raid-scores-v1',JSON.stringify(list));return true;}catch{return false;}}
export function readSettings(s:StorageLike):Settings{try{const v=JSON.parse(s.getItem('last-raid-settings-v1')||'{}');return {sound:v.sound!==false,vibration:v.vibration!==false};}catch{return {sound:true,vibration:true};}}
export function clock(n:number){return `${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;}
export class Pool<T extends {alive:boolean}> {items:T[];constructor(size:number,factory:()=>T){this.items=Array.from({length:size},factory);}take(){const item=this.items.find(x=>!x.alive);if(item)item.alive=true;return item;}clear(){for(const i of this.items)i.alive=false;}}
export interface Point {x:number;y:number;}
export class Spatial<T extends Point> {cells=new Map<number,T[]>();constructor(public size=100){}key(x:number,y:number){return Math.floor(x/this.size)+Math.floor(y/this.size)*10000;}clear(){for(const a of this.cells.values())a.length=0;}add(t:T){const k=this.key(t.x,t.y);let a=this.cells.get(k);if(!a)this.cells.set(k,a=[]);a.push(t);}near(x:number,y:number,r:number){const out:T[]=[];for(let gy=Math.floor((y-r)/this.size);gy<=Math.floor((y+r)/this.size);gy++)for(let gx=Math.floor((x-r)/this.size);gx<=Math.floor((x+r)/this.size);gx++){const a=this.cells.get(gx+gy*10000);if(a)for(const t of a)if((x-t.x)**2+(y-t.y)**2<=r*r)out.push(t);}return out;}}
