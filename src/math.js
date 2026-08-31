export const radians = (degrees) => degrees * Math.PI / 180;

export function perspective(fieldOfView, aspect, near, far) {
  const f = 1 / Math.tan(fieldOfView / 2);
  const range = 1 / (near - far);
  return new Float32Array([f / aspect,0,0,0, 0,f,0,0, 0,0,(near + far) * range,-1, 0,0,near * far * range * 2,0]);
}

const normalize = ([x,y,z]) => { const length = Math.hypot(x,y,z) || 1; return [x/length,y/length,z/length]; };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

export function lookAt(eye, target, up = [0,1,0]) {
  const z = normalize([eye[0]-target[0], eye[1]-target[1], eye[2]-target[2]]);
  const x = normalize(cross(up,z));
  const y = cross(z,x);
  return new Float32Array([
    x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0,
    -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]), -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]), -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]), 1,
  ]);
}

export function modelMatrix(x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) {
  const cx=Math.cos(rx), sxr=Math.sin(rx), cy=Math.cos(ry), syr=Math.sin(ry), cz=Math.cos(rz), szr=Math.sin(rz);
  return new Float32Array([
    sx*(cy*cz), sx*(cx*szr+sxr*syr*cz), sx*(sxr*szr-cx*syr*cz),0,
    sy*(-cy*szr), sy*(cx*cz-sxr*syr*szr), sy*(sxr*cz+cx*syr*szr),0,
    sz*syr, sz*(-sxr*cy), sz*(cx*cy),0,
    x,y,z,1,
  ]);
}
