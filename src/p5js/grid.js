export class Grid {
  constructor(p, gridsize) {
    this.p = p;
    //randomSeed(random(100));
    p.randomSeed(10);
    p.colorMode(p.RGB);
    this.size = gridsize;
    this.cols = p.width / gridsize;
    this.rows = p.height / gridsize;
    
    this.grid = [];
    for (let i = 0; i < this.cols + 1; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.rows + 1; j++) {
        this.grid[i][j] = 0;
      }
    }
  }

  updateGrid(B, n, gridsize) {
    this.size = gridsize;
    for (let i = 0; i < this.cols + 1; i++) {
      for (let j = 0; j < this.rows + 1; j++) {
        let val = 0;
        for (let k = 0; k < B.length; k++) {
          const distanceSquared =
            this.p.sq(i * this.size - B[k].px) +
            this.p.sq(j * this.size - B[k].py);
          val += distanceSquared === 0
            ? 2
            : 0.5 * this.p.sq(B[k].r) / distanceSquared;
        }

        this.grid[i][j] = val;
        this.p.noStroke();
        if (this.grid[i][j] >= 1) {
          this.p.fill(0, 255, 0);
        } else {
          this.p.fill(0);
        }
        if (n == 1) {
          this.p.ellipse(i * this.size, j * this.size, 5);
          this.p.text(this.p.round(this.grid[i][j], 2), i * this.size, j * this.size - 10);
        }
      }
    }
  }

  drawShape(cr, cg, cb, n) {
    //二進位
    const interpolate = (start, end, valueStart, valueEnd) => {
      const difference = valueEnd - valueStart;
      if (!Number.isFinite(valueStart) || !Number.isFinite(valueEnd) || difference === 0) {
        return (start + end) / 2;
      }
      return this.p.ceil(this.p.lerp(start, end, (1 - valueStart) / difference));
    };

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let a = 0,
          b = 0,
          c = 0,
          d = 0;
        let f_a = this.grid[i][j];
        let f_b = this.grid[i + 1][j];
        let f_c = this.grid[i + 1][j + 1];
        let f_d = this.grid[i][j + 1];

        if (f_a >= 1) {
          a = 1;
        } else {
          a = 0;
        }
        if (f_b >= 1) {
          b = 1;
        } else {
          b = 0;
        }
        if (f_c >= 1) {
          c = 1;
        } else {
          c = 0;
        }
        if (f_d >= 1) {
          d = 1;
        } else {
          d = 0;
        }

        let config = 8 * a + 4 * b + 2 * c + d;

        // let p1 = createVector(i*this.size+this.size/2, j*this.size);
        // let p2 = createVector(i*this.size+this.size, j*this.size+this.size/2);
        // let p3 = createVector(i*this.size+this.size/2, j*this.size+this.size);
        // let p4 = createVector(i*this.size, j*this.size+this.size/2);

        let p1 = this.p.createVector(0, 0);
        p1.x = interpolate(i * this.size, i * this.size + this.size, f_a, f_b);
        p1.y = j * this.size;

        let p2 = this.p.createVector(0, 0);
        p2.x = (i + 1) * this.size;
        p2.y = interpolate(j * this.size, j * this.size + this.size, f_b, f_c);

        let p3 = this.p.createVector(0, 0);
        p3.x = interpolate(i * this.size + this.size, i * this.size, f_c, f_d);
        p3.y = (j + 1) * this.size;

        let p4 = this.p.createVector(0, 0);
        p4.x = i * this.size;
        p4.y = interpolate(j * this.size, j * this.size + this.size, f_a, f_d);

        this.p.stroke(cr, cg, cb);
        switch (config) {
          case 1:
            //D
            this.p.line(p3.x, p3.y, p4.x, p4.y);
            break;

          case 2:
            //C
            this.p.line(p2.x, p2.y, p3.x, p3.y);
            break;

          case 3:
            //CD
            this.p.line(p2.x, p2.y, p4.x, p4.y);
            break;

          case 4:
            //B
            this.p.line(p1.x, p1.y, p2.x, p2.y);
            break;

          case 5:
            //BD
            this.p.line(p1.x, p1.y, p2.x, p2.y);
            this.p.line(p3.x, p3.y, p4.x, p4.y);
            break;

          case 6:
            //BC
            this.p.line(p1.x, p1.y, p3.x, p3.y);
            break;

          case 7:
            //BCD
            this.p.line(p1.x, p1.y, p4.x, p4.y);
            break;

          case 8:
            //A
            this.p.line(p1.x, p1.y, p4.x, p4.y);
            break;

          case 9:
            //AD
            this.p.line(p1.x, p1.y, p3.x, p3.y);
            break;

          case 10:
            //AC
            this.p.line(p1.x, p1.y, p4.x, p4.y);
            this.p.line(p2.x, p2.y, p3.x, p3.y);
            break;

          case 11:
            //ACD
            this.p.line(p1.x, p1.y, p2.x, p2.y);
            break;

          case 12:
            //AB
            this.p.line(p2.x, p2.y, p4.x, p4.y);
            break;

          case 13:
            //ABD
            this.p.line(p2.x, p2.y, p3.x, p3.y);
            break;

          case 14:
            //ABC
            this.p.line(p3.x, p3.y, p4.x, p4.y);
            
            break;

        }
      }
    }
  }
}
