export class Controls {
 x=0;y=0;keys=new Set<string>();pointer:number|null=null;origin={x:0,y:0}; actions:string[]=[]; controller=new AbortController();
 constructor(public joystick:HTMLElement,public knob:HTMLElement,public action:(s:string)=>void){
  const o={signal:this.controller.signal};
  joystick.addEventListener('pointerdown',e=>{if(this.pointer!==null||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();this.pointer=e.pointerId;joystick.setPointerCapture(e.pointerId);const r=joystick.getBoundingClientRect();this.origin={x:r.left+r.width/2,y:r.top+r.height/2};this.move(e);},o);
  joystick.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer){e.preventDefault();this.move(e);}},o);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,e=>{if((e as PointerEvent).pointerId===this.pointer)this.resetStick();},o);
  document.querySelectorAll<HTMLElement>('[data-action]').forEach(b=>{
   let activePointer:number|null=null;
   const release=(e:PointerEvent)=>{if(e.pointerId!==activePointer)return;b.classList.remove('pressed');activePointer=null;try{if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId);}catch{}}
   b.addEventListener('pointerdown',e=>{if(activePointer!==null||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();e.stopPropagation();activePointer=e.pointerId;b.classList.add('pressed');try{b.setPointerCapture(e.pointerId);}catch{}this.action(b.dataset.action!);},o);
   b.addEventListener('pointerup',release,o);b.addEventListener('pointercancel',release,o);b.addEventListener('lostpointercapture',release,o);
  });
  window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();this.keys.add(e.code);if(!e.repeat){const a:Record<string,string>={Space:'heavy',ShiftLeft:'dash',ShiftRight:'dash',KeyG:'grenade',Tab:'switch',KeyQ:'switch',Escape:'pause'};if(a[e.code])this.action(a[e.code]);}},o);window.addEventListener('keyup',e=>this.keys.delete(e.code),o);window.addEventListener('blur',()=>this.clear(),o);
 }
 move(e:PointerEvent){const dx=e.clientX-this.origin.x,dy=e.clientY-this.origin.y,d=Math.hypot(dx,dy),max=43,scale=d>max?max/d:1;this.x=dx*scale/max;this.y=dy*scale/max;this.knob.style.transform=`translate3d(${dx*scale}px,${dy*scale}px,0)`;}
 resetStick(){if(this.pointer!==null){try{if(this.joystick.hasPointerCapture(this.pointer))this.joystick.releasePointerCapture(this.pointer);}catch{}}this.pointer=null;this.x=this.y=0;this.knob.style.transform='';}
 clear(){this.keys.clear();this.resetStick();document.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed'));}
 vector(){let x=this.x+(Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))),y=this.y+(Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp')));const d=Math.hypot(x,y);if(d>1){x/=d;y/=d;}return {x,y};}
 destroy(){this.controller.abort();this.clear();}
}
