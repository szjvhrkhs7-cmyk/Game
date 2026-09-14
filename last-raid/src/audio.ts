import type {Settings} from './rules';
export class Sound {
 ctx:AudioContext|null=null;last=0;
 constructor(public settings:Settings){}
 unlock(){this.ctx??=new AudioContext();if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});}
 play(kind='hit'){if(!this.ctx||!this.settings.sound)return;const t=this.ctx.currentTime;if(kind==='hit'&&t-this.last<.055)return;this.last=t;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.connect(gain);gain.connect(this.ctx.destination);const config:Record<string,[number,number,number,OscillatorType]>={hit:[150,55,.11,'triangle'],shot:[430,70,.09,'sawtooth'],boom:[100,24,.5,'sawtooth'],pickup:[650,1100,.12,'sine'],level:[420,1000,.4,'triangle'],boss:[90,190,.7,'sawtooth'],dash:[700,90,.16,'sine']};const [a,b,d,type]=config[kind]||config.hit;osc.type=type;osc.frequency.setValueAtTime(a,t);osc.frequency.exponentialRampToValueAtTime(b,t+d);gain.gain.setValueAtTime(kind==='boss'?.065:.045,t);gain.gain.exponentialRampToValueAtTime(.001,t+d);osc.start(t);osc.stop(t+d);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
 buzz(ms=12){if(this.settings.vibration&&navigator.vibrate)navigator.vibrate(ms);}
}
