import { lookAt, modelMatrix, perspective, radians } from "./math.js";

const COLORS = new Map();
function color(value) {
  if (COLORS.has(value)) return COLORS.get(value);
  const hex = value.replace("#", "");
  const rgb = [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255, 1];
  COLORS.set(value, rgb);
  return rgb;
}

const cubeData = new Float32Array([
  -1,-1,1,0,0,1, 1,-1,1,0,0,1, 1,1,1,0,0,1, -1,-1,1,0,0,1, 1,1,1,0,0,1, -1,1,1,0,0,1,
  1,-1,-1,0,0,-1, -1,-1,-1,0,0,-1, -1,1,-1,0,0,-1, 1,-1,-1,0,0,-1, -1,1,-1,0,0,-1, 1,1,-1,0,0,-1,
  -1,-1,-1,-1,0,0, -1,-1,1,-1,0,0, -1,1,1,-1,0,0, -1,-1,-1,-1,0,0, -1,1,1,-1,0,0, -1,1,-1,-1,0,0,
  1,-1,1,1,0,0, 1,-1,-1,1,0,0, 1,1,-1,1,0,0, 1,-1,1,1,0,0, 1,1,-1,1,0,0, 1,1,1,1,0,0,
  -1,1,1,0,1,0, 1,1,1,0,1,0, 1,1,-1,0,1,0, -1,1,1,0,1,0, 1,1,-1,0,1,0, -1,1,-1,0,1,0,
  -1,-1,-1,0,-1,0, 1,-1,-1,0,-1,0, 1,-1,1,0,-1,0, -1,-1,-1,0,-1,0, 1,-1,1,0,-1,0, -1,-1,1,0,-1,0,
]);

function cylinderData(sides=12) {
  const values=[];
  for(let i=0;i<sides;i+=1){
    const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides, ax=Math.cos(a),az=Math.sin(a),bx=Math.cos(b),bz=Math.sin(b);
    values.push(ax,-1,az,ax,0,az, bx,-1,bz,bx,0,bz, bx,1,bz,bx,0,bz, ax,-1,az,ax,0,az, bx,1,bz,bx,0,bz, ax,1,az,ax,0,az);
    values.push(0,1,0,0,1,0, ax,1,az,0,1,0, bx,1,bz,0,1,0, 0,-1,0,0,-1,0, bx,-1,bz,0,-1,0, ax,-1,az,0,-1,0);
  }
  return new Float32Array(values);
}

export class Renderer {
  constructor(canvas) {
    this.canvas=canvas;
    this.gl=canvas.getContext("webgl2",{antialias:true,alpha:false,powerPreference:"high-performance"}) || canvas.getContext("webgl",{antialias:false,alpha:false});
    if(!this.gl){this.ctx=canvas.getContext("2d");this.fallback=true;return;}
    const gl=this.gl;
    const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uProjection;uniform mat4 uView;uniform mat4 uModel;varying float vLight;void main(){vec3 n=normalize(mat3(uModel)*aNormal);vLight=.38+max(dot(n,normalize(vec3(.35,.9,.25))),0.)*.62;gl_Position=uProjection*uView*uModel*vec4(aPosition,1.);}`;
    const fragment=`precision mediump float;uniform vec4 uColor;uniform float uFog;varying float vLight;void main(){vec3 lit=uColor.rgb*vLight;gl_FragColor=vec4(mix(lit,vec3(.45,.55,.55),uFog),uColor.a);}`;
    this.program=this.#program(vertex,fragment);
    gl.useProgram(this.program);
    this.locations={
      position:gl.getAttribLocation(this.program,"aPosition"), normal:gl.getAttribLocation(this.program,"aNormal"),
      projection:gl.getUniformLocation(this.program,"uProjection"), view:gl.getUniformLocation(this.program,"uView"),
      model:gl.getUniformLocation(this.program,"uModel"), color:gl.getUniformLocation(this.program,"uColor"), fog:gl.getUniformLocation(this.program,"uFog"),
    };
    this.meshes={cube:this.#mesh(cubeData),cylinder:this.#mesh(cylinderData())};
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
  }
  #shader(type,source){const gl=this.gl,s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  #program(v,f){const gl=this.gl,p=gl.createProgram();gl.attachShader(p,this.#shader(gl.VERTEX_SHADER,v));gl.attachShader(p,this.#shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
  #mesh(data){const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return{buffer:b,count:data.length/6};}
  resize(quality=.85){const ratio=Math.min(devicePixelRatio||1,quality===1?1.6:quality===.65?1:.75);const width=Math.max(1,Math.floor(this.canvas.clientWidth*ratio)),height=Math.max(1,Math.floor(this.canvas.clientHeight*ratio));if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}if(this.gl)this.gl.viewport(0,0,width,height);return width/height;}
  begin(camera,weather,time,quality){
    const aspect=this.resize(quality),night=time>19||time<6;
    if(this.fallback){const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height;this.camera=camera;const gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,night?"#101b28":weather==="rain"?"#596868":"#77aabd");gradient.addColorStop(.52,night?"#213227":"#82947a");gradient.addColorStop(1,"#44583d");ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);this.#prepareCamera();return;}
    const gl=this.gl,sky=night?[.045,.07,.1,1]:weather==="rain"?[.35,.42,.43,1]:[.46,.68,.78,1];gl.clearColor(...sky);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.locations.projection,false,perspective(radians(camera.fov||62),aspect,.1,650));gl.uniformMatrix4fv(this.locations.view,false,lookAt(camera.eye,camera.target));gl.uniform1f(this.locations.fog,weather==="rain"?.18:night?.12:.035);
  }
  #prepareCamera(){const e=this.camera.eye,t=this.camera.target,fl=Math.hypot(t[0]-e[0],t[1]-e[1],t[2]-e[2])||1;this.forward=[(t[0]-e[0])/fl,(t[1]-e[1])/fl,(t[2]-e[2])/fl];const rl=Math.hypot(this.forward[2],this.forward[0])||1;this.right=[this.forward[2]/rl,0,-this.forward[0]/rl];this.up=[-this.right[2]*this.forward[1],this.right[2]*this.forward[0]-this.right[0]*this.forward[2],this.right[0]*this.forward[1]];}
  #project(x,y,z){const e=this.camera.eye,rel=[x-e[0],y-e[1],z-e[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],depth=dot(rel,this.forward);if(depth<.25)return null;const f=this.canvas.height/(2*Math.tan(radians(this.camera.fov||62)/2));return{x:this.canvas.width/2+dot(rel,this.right)*f/depth,y:this.canvas.height/2-dot(rel,this.up)*f/depth,depth,f};}
  #drawFallback(type,x,y,z,sx,sy,sz,shade){const point=this.#project(x,y,z);if(!point||point.depth>620)return;const ctx=this.ctx,scale=point.f/point.depth,w=Math.max(1,sx*scale),h=Math.max(1,sy*scale);ctx.globalAlpha=Math.max(.22,1-point.depth/700);ctx.fillStyle=shade;if(type==="cylinder"){ctx.beginPath();ctx.ellipse(point.x,point.y,w/2,Math.max(1,h/2),0,0,Math.PI*2);ctx.fill();}else{ctx.fillRect(point.x-w/2,point.y-h/2,w,h);}ctx.globalAlpha=1;}
  draw(type,x,y,z,sx,sy,sz,shade,rotation={}){if(this.fallback){this.#drawFallback(type,x,y,z,sx,sy,sz,shade);return;}const gl=this.gl,mesh=this.meshes[type]||this.meshes.cube;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.enableVertexAttribArray(this.locations.position);gl.enableVertexAttribArray(this.locations.normal);gl.vertexAttribPointer(this.locations.position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(this.locations.normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(this.locations.model,false,modelMatrix(x,y,z,sx/2,sy/2,sz/2,rotation.x||0,rotation.y||0,rotation.z||0));gl.uniform4fv(this.locations.color,color(shade));gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
}

export function cameraFor(vehicle,mode,orbit=0){const h=vehicle.heading+orbit,forward=[Math.sin(vehicle.heading),0,Math.cos(vehicle.heading)];if(mode===1)return{eye:[vehicle.x+forward[0]*.3,2.05,vehicle.z+forward[2]*.3],target:[vehicle.x+forward[0]*18,1.7,vehicle.z+forward[2]*18],fov:72};if(mode===2)return{eye:[vehicle.x-Math.sin(h)*.1,25,vehicle.z-Math.cos(h)*.1],target:[vehicle.x,0,vehicle.z],fov:58};return{eye:[vehicle.x-Math.sin(h)*10,5.4,vehicle.z-Math.cos(h)*10],target:[vehicle.x+forward[0]*4,1.2,vehicle.z+forward[2]*4],fov:63};}
