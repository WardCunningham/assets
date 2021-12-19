h3(n,0,0,0,1,0,0,0,1,0,0,0,1)
function h3(s,x,y,z,dx,dy,dz,x2,y2,z2,x3,y3,z3){
  if(s==1){
    box([x,y,z])
  } else {
    s/=2;
    if(dx<0) x-=s*dx;
    if(dy<0) y-=s*dy;
    if(dz<0) z-=s*dz;
    if(x2<0) x-=s*x2;
    if(y2<0) y-=s*y2;
    if(z2<0) z-=s*z2;
    if(x3<0) x-=s*x3;
    if(y3<0) y-=s*y3;
    if(z3<0) z-=s*z3;
    h3(s,x,y,z,x2,y2,z2,x3,y3,z3,dx,dy,dz);
    h3(s,x+s*dx,y+s*dy,z+s*dz,x3,y3,z3,
      dx,dy,dz,x2,y2,z2);
    h3(s,x+s*dx+s*x2,y+s*dy+s*y2,z+s*dz+s*z2,
      x3,y3,z3,dx,dy,dz,x2,y2,z2);
    h3(s,x+s*x2,y+s*y2,z+s*z2,-dx,-dy,-dz,
      -x2,-y2,-z2,x3,y3,z3);
    h3(s,x+s*x2+s*x3,y+s*y2+s*y3,z+s*z2+s*z3,
      -dx,-dy,-dz,-x2,-y2,-z2,x3,y3,z3);
    h3(s,x+s*dx+s*x2+s*x3,y+s*dy+s*y2+s*y3,
      z+s*dz+s*z2+s*z3,
      -x3,-y3,-z3,dx,dy,dz,-x2,-y2,-z2);
    h3(s,x+s*dx+s*x3,y+s*dy+s*y3,z+s*dz+s*z3,
      -x3,-y3,-z3,dx,dy,dz,-x2,-y2,-z2);
    h3(s,x+s*x3,y+s*y3,z+s*z3,x2,y2,z2,
      -x3,-y3,-z3,-dx,-dy,-dz);
  }
}