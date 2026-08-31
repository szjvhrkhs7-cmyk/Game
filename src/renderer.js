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
    if(!this.gl) throw new Error("WebGL недоступен");
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
  resize(quality=.85){const ratio=Math.min(devicePixelRatio||1,quality===1?1.6:quality===.65?1:.75);const width=Math.max(1,Math.floor(this.canvas.clientWidth*ratio)),height=Math.max(1,Math.floor(this.canvas.clientHeight*ratio));if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}this.gl.viewport(0,0,width,height);return width/height;}
  begin(camera,weather,time,quality){const gl=this.gl,aspect=this.resize(quality);const night=time>19||time<6;const sky=night?[.045,.07,.1,1]:weather==="rain"?[.35,.42,.43,1]:[.46,.68,.78,1];gl.clearColor(...sky);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniformMatrix4fv(this.locations.projection,false,perspective(radians(camera.fov||62),aspect,.1,650));gl.uniformMatrix4fv(this.locations.view,false,lookAt(camera.eye,camera.target));gl.uniform1f(this.locations.fog,weather==="rain"?.18:night?.12:.035);}
  draw(type,x,y,z,sx,sy,sz,shade,rotation={}){const gl=this.gl,mesh=this.meshes[type]||this.meshes.cube;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.enableVertexAttribArray(this.locations.position);gl.enableVertexAttribArray(this.locations.normal);gl.vertexAttribPointer(this.locations.position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(this.locations.normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(this.locations.model,false,modelMatrix(x,y,z,sx/2,sy/2,sz/2,rotation.x||0,rotation.y||0,rotation.z||0));gl.uniform4fv(this.locations.color,color(shade));gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
}

export function cameraFor(vehicle,mode,orbit=0){const h=vehicle.heading+orbit,forward=[Math.sin(vehicle.heading),0,Math.cos(vehicle.heading)];if(mode===1)return{eye:[vehicle.x+forward[0]*.3,2.05,vehicle.z+forward[2]*.3],target:[vehicle.x+forward[0]*18,1.7,vehicle.z+forward[2]*18],fov:72};if(mode===2)return{eye:[vehicle.x-Math.sin(h)*.1,25,vehicle.z-Math.cos(h)*.1],target:[vehicle.x,0,vehicle.z],fov:58};return{eye:[vehicle.x-Math.sin(h)*10,5.4,vehicle.z-Math.cos(h)*10],target:[vehicle.x+forward[0]*4,1.2,vehicle.z+forward[2]*4],fov:63};}
