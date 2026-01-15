const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1100;
canvas.height = 620;

/* ================= INPUT ================= */
const keys = {};
document.querySelectorAll("button").forEach(btn=>{
  const key = btn.dataset.key;
  btn.addEventListener("pointerdown",e=>{
    e.preventDefault(); keys[key]=true;
  });
  btn.addEventListener("pointerup",()=>keys[key]=false);
  btn.addEventListener("pointerleave",()=>keys[key]=false);
});
addEventListener("keydown",e=>keys[e.key]=true);
addEventListener("keyup",e=>keys[e.key]=false);

/* ================= ENGINE ================= */
const GROUND = 480;
const GRAVITY = 1800;
const FIXED_DT = 1/60;

let last=performance.now(), acc=0;
let score=[0,0];

/* ================= CLASSES ================= */
class Player{
  constructor(x,dir,color,l,r,s){
    this.x=x; this.y=GROUND;
    this.dir=dir;
    this.color=color;
    this.l=l; this.r=r; this.s=s;
    this.vx=0;
    this.power=0;
    this.anim=0;
  }

  update(dt,ball){
    this.anim+=dt*10;
    this.vx=0;

    if(keys[this.l]){this.vx=-260; this.dir=-1;}
    if(keys[this.r]){this.vx=260; this.dir=1;}

    if(ball.owner===this){
      if(keys[this.s]){
        this.power=Math.min(this.power+dt*20,15);
      }
      if(!keys[this.s] && this.power>0){
        ball.shoot(this);
        this.power=0;
      }
    }
    this.x+=this.vx*dt;
  }

  draw(){
    // PLAYER (pixel body)
    ctx.fillStyle=this.color;
    for(let i=0;i<42;i+=4){
      ctx.fillRect(
        this.x-12+Math.sin(this.anim+i)*2,
        this.y-42+i,
        24,4
      );
    }

    // 🔋 ŞUT GÜCÜ BARI
    if(this.power>0){
      ctx.fillStyle="black";
      ctx.fillRect(this.x-22,this.y-60,44,6);
      ctx.fillStyle="#00ff55";
      ctx.fillRect(this.x-22,this.y-60,(this.power/15)*44,6);
    }
  }
}

class Ball{
  constructor(){this.reset();}
  reset(){
    this.x=canvas.width/2;
    this.y=GROUND-40;
    this.vx=this.vy=0;
    this.owner=null;
  }
  shoot(p){
    this.owner=null;
    this.vx=p.dir*p.power*90;
    this.vy=-p.power*140;
  }
  update(dt){
    if(this.owner){
      this.x=this.owner.x+this.owner.dir*14;
      this.y=this.owner.y-36;
      return;
    }
    this.vy+=GRAVITY*dt;
    this.x+=this.vx*dt;
    this.y+=this.vy*dt;
    if(this.y>GROUND-8){
      this.y=GROUND-8;
      this.vy*=-0.45;
    }
    if(this.x<-100||this.x>canvas.width+100) this.reset();
  }
  draw(){
    ctx.fillStyle="#fcbf49";
    ctx.beginPath();
    ctx.arc(this.x,this.y,8,0,Math.PI*2);
    ctx.fill();
  }
}

/* ================= OBJECTS ================= */
const players=[
  new Player(260,1,"#e10600","a","d","w"),
  new Player(840,-1,"#17408b","ArrowLeft","ArrowRight","ArrowUp")
];
const ball=new Ball();
const hoops=[{x:140,y:260},{x:960,y:260}];

/* ================= DRAW HELPERS ================= */
function drawCourt(){
  // Tribün
  for(let y=0;y<180;y+=6){
    for(let x=0;x<canvas.width;x+=10){
      ctx.fillStyle=`rgb(${30+y/2},${20+y/3},${20})`;
      ctx.fillRect(x,y,8,4);
    }
  }
  // Saha
  ctx.fillStyle="#8d5524";
  ctx.fillRect(0,GROUND,canvas.width,200);

  // Orta çizgi
  ctx.strokeStyle="#fff";
  ctx.beginPath();
  ctx.moveTo(canvas.width/2,GROUND);
  ctx.lineTo(canvas.width/2,canvas.height);
  ctx.stroke();
}

function drawHoop(h){
  ctx.strokeStyle="red";
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.arc(h.x,h.y,18,0,Math.PI*2);
  ctx.stroke();
  ctx.strokeStyle="white";
  for(let i=0;i<10;i++){
    ctx.beginPath();
    ctx.moveTo(h.x-12+i*3,h.y);
    ctx.lineTo(h.x-12+i*3,h.y+32);
    ctx.stroke();
  }
}

/* ================= LOOP ================= */
function loop(t){
  acc+=(t-last)/1000;
  last=t;

  while(acc>=FIXED_DT){
    players.forEach(p=>{
      if(ball.owner===null &&
        Math.hypot(ball.x-p.x,ball.y-(p.y-30))<28){
        ball.owner=p;
      }
      p.update(FIXED_DT,ball);
    });
    ball.update(FIXED_DT);
    acc-=FIXED_DT;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawCourt();
  hoops.forEach(drawHoop);
  players.forEach(p=>p.draw());
  ball.draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
