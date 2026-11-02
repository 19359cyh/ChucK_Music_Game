export class Ball {
  constructor(p, R) {
    this.p = p;
    this.px = p.random(0, p.width);
    this.py = p.random(0, p.height);
    this.r = R;
    this.vx = p.random(-50, 50);
    this.vy = p.random(-50, 50);
    
  }
  
  
  updateBall(x, y, r){
    this.px = x;
    this.py = y;
    this.r = r;
  }
  updaterandomBall(){
    if(this.px < 0 || this.px > this.p.width){
      this.vx = -this.vx;
    }
    if(this.py < 0 || this.py > this.p.height){
      this.vy = -this.vy;
    }
    this.px += this.vx;
    this.py += this.vy;
  }

  drawBall() {
    // stroke(0, 0, 255);
    // noFill();
    this.p.noStroke();
    this.p.fill(255, 255, 255);
    this.p.ellipse(this.px, this.py, this.r/3);
    
    
  }
}
