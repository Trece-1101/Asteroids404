let { canvas, context, text } = kontra.init();

let sprites = [];

let level = 1;
let points = 0;

class ArcadeAudio {
  constructor() {
    this.sounds = {};
  }
  add(key, count, settings) {
    this.sounds[key] = [];
    settings.forEach(function (elem, index) {
      this.sounds[key].push({
        tick: 0,
        count: count,
        pool: []
      });
      for (var i = 0; i < count; i++) {
        var audio = new Audio();
        audio.src = jsfxr(elem);
        this.sounds[key][index].pool.push(audio);
      }
    }, this);
  }
  play(key) {
    var sound = this.sounds[key];
    var soundData = sound.length > 1 ? sound[Math.floor(Math.random() * sound.length)] : sound[0];
    console.debug(sound.length);
    soundData.pool[soundData.tick].play();
    soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
  }
}

var aa = new ArcadeAudio();

aa.add( 'powerup', 10,
  [
    [2,,0.087,,0.1125,0.532,0.3555,-0.219,,,,,,0.4403,0.0734,,,,1,,,,,0.5] 
  ]
);

aa.add( 'death', 10,
  [
    [3,,0.373,0.546,0.425,0.0901,,,,,,0.4014,0.6329,,,,-0.1483,-0.0334,1,0.595,,,,0.5]
  ]
);

function getRandomLetter() {
  let ran = Math.random() * (4 - 0) + 0;

  if (ran > 0 && ran < 2) {
    return "4";
  } else {
    return "0";
  }
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createAsteroid(x, y, radius, text) {
  let asteroid = kontra.Sprite({
    type: "asteroid",
    x,
    y,
    dx: Math.random() * 5 - 2,
    dy: Math.random() * 5 - 2,
    radius,
    text,
    render() {
      this.context.strokeStyle = "rgba(13, 13, 13, 1)";
      this.context.beginPath();
      this.context.arc(0, 0, this.radius, 0, Math.PI * 2);
      this.context.stroke();
      this.context.textAlign = "center";
      this.context.strokeStyle = getRandomColor();
      this.context.font = radius + "px Arial";
      this.context.strokeText(this.text, 0, 5);
    },
  });
  sprites.push(asteroid);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function asteroidCreator(top) {
  for (let i = 0; i < top; i++) {
    let addPoints = 0;
    let ran = getRandomArbitrary(0, 2);
    if (ran > 1) {
      addPoints = 600;
    }
    createAsteroid(
      getRandomArbitrary(20, 900),
      getRandomArbitrary(50, 100) + addPoints,
      getRandomArbitrary(30, 50),
      "404",
    );
  }
}

asteroidCreator(6);

kontra.initKeys();

function createShip() {
  let ship = kontra.Sprite({
    type: "ship",
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
      if (kontra.keyPressed("up") || kontra.keyPressed("w")) {
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
          aa.play('powerup');
        let bullet = kontra.Sprite({
          color: "cyan ",

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
          color: "red",

          x: this.x + cos * 20,
          y: this.y + sin * 20,

          dx: this.dx - cos * 5,
          dy: this.dy - sin * 5,

          ttl: 40,

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
   
}

createShip();

let top_ribbon = 300;

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

            if (asteroid.radius > 30) {
              points += 20;
              for (let i = 0; i < 2; i++) {
                createAsteroid(
                  asteroid.x,
                  asteroid.y,
                  asteroid.radius / 1.5,
                  "404",
                );
              }
            } else if (asteroid.radius > 20 && asteroid.radius <= 30) {
              points += 50;
              for (let i = 0; i < 2; i++) {
                createAsteroid(
                  asteroid.x,
                  asteroid.y,
                  asteroid.radius / 1.5,
                  getRandomLetter(),
                );
              }
             }
            aa.play("death")
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

    asteroidCreator(2 * level);
    console.log(points);
    console.log(level);
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
