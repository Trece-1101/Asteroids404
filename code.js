let { canvas, context } = kontra.init();

let sprites = [];

let level = 0;

function createAsteroid(x, y, radius) {
  let asteroid = kontra.Sprite({
    type: "asteroid",
    x,
    y,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    radius,
    render() {
      this.context.strokeStyle = "red";
      this.context.beginPath();
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.stroke();
    },
  });
  sprites.push(asteroid);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < 6; i++) {
  createAsteroid(
    getRandomArbitrary(50, 800),
    getRandomArbitrary(50, 500),
    getRandomArbitrary(8, 30),
  );
}

kontra.initKeys();

let ship = kontra.Sprite({
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 6,
  dt: 0,
  render() {
    this.context.strokeStyle = "yellow";
    this.context.beginPath();
    this.context.moveTo(-3, -5);
    this.context.lineTo(12, 0);
    this.context.lineTo(-3, 5);
    this.context.closePath();
    this.context.stroke();
  },
  update() {
    if (kontra.keyPressed("left") || kontra.keyPressed("a")) {
      this.rotation += kontra.degToRad(-4);
    } else if (kontra.keyPressed("right") || kontra.keyPressed("d")) {
      this.rotation += kontra.degToRad(4);
    }

    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    if (kontra.keyPressed("up")) {
      this.ddx = cos * 0.05;
      this.ddy = sin * 0.05;
    } else {
      this.ddx = this.ddy = 0;
    }
    this.advance();

    if (this.velocity.length() > 3) {
      this.dx *= 0.95;
      this.dy *= 0.95;
    }

    this.dt += 1 / 60;
    if (kontra.keyPressed("space") && this.dt > 0.10) {
      this.dt = 0;
      let bullet = kontra.Sprite({
        color: "white",

        x: this.x + cos * 20,
        y: this.y + sin * 20,

        dx: this.dx + cos * 5,
        dy: this.dy + sin * 5,

        ttl: 80,

        radius: 5,
        width: 5,
        height: 5,
      });
      let bullet2 = kontra.Sprite({
        color: "white",

        x: this.x + cos * 20,
        y: this.y + sin * 20,

        dx: this.dx - cos * 5,
        dy: this.dy - sin * 5,

        ttl: 80,

        radius: 5,
        width: 5,
        height: 5,
      });

      sprites.push(bullet);
      sprites.push(bullet2);
    }
  },
});
sprites.push(ship);

function checkBorder(sprite) {
  if (sprite.x < -sprite.radius) {
    sprite.x = canvas.width + sprite.radius;
  } else if (sprite.x > canvas.width + sprite.radius) {
    sprite.x = 0 - sprite.radius;
  }

  if (sprite.y < -sprite.radius) {
    sprite.y = canvas.height + sprite.radius;
  } else if (sprite.y > canvas.height + sprite.radius) {
    sprite.y = -sprite.radius;
  }
}

function checkCollision(sprites) {
  for (let i = 0; i < sprites.length; i++) {
    if (sprites[i].type === "asteroid") {
      for (let j = 0; j < sprites.length; j++) {
        if (sprites[j].type !== "asteroid") {
          let asteroid = sprites[i];
          let sprite = sprites[j];

          let dx = asteroid.x - sprite.x;
          let dy = asteroid.y - sprite.y;
          if (Math.hypot(dx, dy) < asteroid.radius + sprite.radius) {
            asteroid.ttl = 0;
            sprite.ttl = 0;

            if (asteroid.radius > 15) {
              for (let i = 0; i < 2; i++) {
                createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2.5);
              }
            }
            break;
          }
        }
      }
    }
  }
}

function checkLevel(sprites) {
  let remaining_asteroids = 0;
  for (let i = 0; i < sprites.length; i++) {
    if (sprites[i].type === "asteroid") {
      remaining_asteroids++;
    }
  }

  if (remaining_asteroids < 3) {
    level++;
    for (let i = 0; i < (2 * level); i++) {
      createAsteroid(
        getRandomArbitrary(50, 800),
        getRandomArbitrary(50, 500),
        getRandomArbitrary(8, 30),
      );
    }
  }
}

let loop = kontra.GameLoop({
  update() {
    sprites.map((sprite) => {
      sprite.update();

      checkBorder(sprite);
    });

    checkCollision(sprites);

    sprites = sprites.filter((sprite) => sprite.isAlive());

    checkLevel(sprites);
  },
  render() {
    sprites.map((sprite) => sprite.render());
  },
});

loop.start();
//# sourceURL=userscript.js
