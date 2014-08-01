$(function(){
    var canvas = $('<canvas>');
    $('body').append(canvas);

    // Create a PlayCanvas application
    var app = new pc.fw.Application(canvas.get()[0], {});
    app.start();

// Fill the available space at full resolution
    app.setCanvasFillMode(pc.fw.FillMode.FILL_WINDOW);
    app.setCanvasResolution(pc.fw.ResolutionMode.AUTO);

    app.context.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

// Utility function to create a material
    function createMaterial(r, g, b) {
        var material = new pc.scene.PhongMaterial();
        material.ambient.set(r, g, b);
        material.diffuse.set(r, g, b);
        material.specular.set(1, 1, 1);
        material.shininess = 2;
        material.update();
        return material;
    }

// Create camera entity
    function Camera() {
        var cam = new pc.fw.Entity();
        app.context.systems.camera.addComponent(cam, {
            clearColor: new pc.Color(0.1, 0.1, 0.1),
            farClip: 20
        });
        app.context.root.addChild(cam);
        this.entity = cam;
        this.timer = 0;
    }

    Camera.prototype.update = function (dt) {
        this.timer += dt;
        // Spin the camera around a center point
        var x = Math.sin(this.timer * 0.25) * 6;
        var z = Math.cos(this.timer * 0.25) * 4;
        var e = this.entity;
        e.setPosition(x, 5, z);
        e.lookAt(0, 3, 0);
    }

// Create spot light entity
    function Light() {
        var light = new pc.fw.Entity();
        light.setPosition(10, 10, 10);
        light.setEulerAngles(45, 45, 0);
        app.context.systems.light.addComponent(light, {
            type: "spot",
            intensity: 1.2,
            castShadows: true,
            range: 60
        });
        light.light.model.lights[0].setShadowBias(-0.00003);
        app.context.root.addChild(light);
        this.entity = light;
    }

// Create ground
    function Ground() {
        var ground = new pc.fw.Entity();
        ground.setPosition(0, -0.5, 0);
        ground.setLocalScale(10, 1, 10);
        app.context.systems.model.addComponent(ground, {
            type: "box"
        });
        app.context.systems.rigidbody.addComponent(ground, {
            type: "static"
        });
        app.context.systems.collision.addComponent(ground, {
            type: "box",
            halfExtents: [5, 0.5, 5]
        });
        var blue = createMaterial(0.28, 0.46, 1);
        ground.model.model.meshInstances[0].material = blue;
        app.context.root.addChild(ground);
        this.entity = ground;
    }

// Create wall
    function Wall() {
        var black = createMaterial(0, 0, 0);
        var white = createMaterial(1, 1, 1);

        this.bricks = [];

        for (var i = 0; i < 25; i++) {
            var body = new pc.fw.Entity();
            app.context.systems.model.addComponent(body, {
                type: "box",
                castShadows: true
            });
            app.context.systems.rigidbody.addComponent(body, {
                type: "dynamic"
            });
            app.context.systems.collision.addComponent(body, {
                type: "box",
                halfExtents: [0.5, 0.5, 0.5]
            });
            app.context.root.addChild(body);
            body.model.model.meshInstances[0].material = i % 2 ? black : white;

            this.bricks.push(body);
        }
        this.reset();
    }

    Wall.prototype.reset = function () {
        for (var i = 0; i < this.bricks.length; i++) {
            var e = this.bricks[i];
            e.setPosition(i % 5 - 2, i / 5, 0);
            e.setEulerAngles(0, 0, 0);
            e.rigidbody.linearVelocity = pc.Vec3.ZERO;
            e.rigidbody.angularVelocity = pc.Vec3.ZERO;
            e.rigidbody.syncEntityToBody();
        }
    };

    function Ball() {
        var e = new pc.fw.Entity();
        e.setPosition(0, -10, 0);
        app.context.systems.model.addComponent(e, {
            type: "sphere",
            castShadows: true
        });
        app.context.systems.rigidbody.addComponent(e, {
            type: "dynamic"
        });
        app.context.systems.collision.addComponent(e, {
            type: "sphere",
            radius: 0.5
        });
        var red = createMaterial(1, 0.28, 0.28);
        e.model.model.meshInstances[0].material = red;
        app.context.root.addChild(e);
        this.entity = e;
    }

    Ball.prototype.fire = function () {
        var e = this.entity;
        e.setPosition(0, 2, 5);
        e.rigidbody.syncEntityToBody();
        e.rigidbody.linearVelocity = new pc.Vec3((Math.random() - 0.5) * 10, 7, -30);
        e.rigidbody.angularVelocity = pc.Vec3.ZERO;
    };

// Create the scene
    var camera = new Camera();
    var light = new Light();
    var ground = new Ground();
    var wall = new Wall();
    var ball = new Ball();

// Reset the wall and fire the ball every 4 seconds
    var n = 0;
    setInterval(function () {
        n++;
        if (n % 4 === 0)
            wall.reset();
        if (n % 4 === 1)
            ball.fire();
    }, 1000);

// Register an update event to rotate the camera
    app.on("update", function (dt) {
        camera.update(dt);
    });
});