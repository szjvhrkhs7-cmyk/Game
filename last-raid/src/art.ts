import Phaser from 'phaser';
export function createArt(s:Phaser.Scene){
 const tex=s.textures.createCanvas('enemies',640,128)!;const c=tex.context;
 const colors=['#91b775','#ced06b','#8abd9f','#b9a080','#ba80bc','#8da7b5','#dd754f','#b57be4','#d9b456','#70cfbc'];
 for(let i=0;i<10;i++){c.save();c.translate(i*64+32,90);const boss=i>=6,wide=i===3||i===6,w=wide?21:15;c.strokeStyle='#233e40';c.lineWidth=3;c.lineJoin='round';
 c.fillStyle='#284742';c.beginPath();c.ellipse(0,4,w,7,0,0,7);c.fill();c.fillStyle='#34484d';c.beginPath();c.roundRect(-w+2,-9,11,14,3);c.roundRect(w-13,-9,11,14,3);c.fill();c.stroke();
 c.fillStyle=i===5?'#52748a':boss?['#b54b45','#714a8b','#a1833b','#376f6b'][i-6]:['#54776a','#a26651','#487d79','#706575','#83516b','#60788a'][i];c.beginPath();c.roundRect(-w,-37,w*2,31,8);c.fill();c.stroke();c.fillStyle=colors[i];c.beginPath();c.ellipse(-w-2,-24,6,11,-.5,0,7);c.ellipse(w+2,-24,6,11,.5,0,7);c.fill();c.stroke();
 c.fillStyle=colors[i];c.beginPath();c.roundRect(-21,-70,42,39,14);c.fill();c.stroke();c.fillStyle='#dce4ae';c.beginPath();c.ellipse(-8,-52,7,7,0,0,7);c.ellipse(9,-52,7,7,0,0,7);c.fill();c.fillStyle=i>=6?'#c93e55':'#283e39';c.beginPath();c.arc(-7,-51,3,0,7);c.arc(8,-51,3,0,7);c.fill();c.strokeStyle='#3e5849';c.beginPath();c.moveTo(-9,-38);c.lineTo(9,-39);c.stroke();c.fillStyle='#e9deaa';c.fillRect(-6,-41,4,5);
 if(i===5){c.fillStyle='#496677';c.beginPath();c.roundRect(-24,-78,48,18,7);c.fill();c.stroke();}if(i===6){c.fillStyle='#efcda1';for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*15,-68);c.lineTo(sign*28,-83);c.lineTo(sign*27,-59);c.closePath();c.fill();c.stroke();}}if(i===7){c.fillStyle='#623876';c.beginPath();c.moveTo(-26,-67);c.lineTo(0,-95);c.lineTo(25,-67);c.closePath();c.fill();c.stroke();}if(i===8){c.fillStyle='#78614b';c.fillRect(-25,-74,50,10);c.fillStyle='#e6c666';c.fillRect(-18,-83,36,10);}if(i===9){c.strokeStyle='#e3f8c3';c.lineWidth=5;c.beginPath();c.arc(0,-50,26,Math.PI,Math.PI*2);c.stroke();}c.restore();tex.add(i,0,i*64,0,64,128);}
 tex.refresh();
 const a=s.textures.get('heroes');for(let row=0;row<2;row++)for(let col=0;col<3;col++)a.add(row*3+col,0,col*256,row*256,256,256);
 const dot=s.textures.createCanvas('dot',16,16)!;dot.context.fillStyle='#ffffff';dot.context.beginPath();dot.context.arc(8,8,7,0,7);dot.context.fill();dot.refresh();
}
