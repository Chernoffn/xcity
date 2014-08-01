$(function(){
    var canvas = $('<canvas>');
    $('body').append(canvas);

    var app = new pc.fw.Application(canvas.get()[0], {});
    app.start();

    app.setCanvasFillMode(pc.fw.FillMode.FILL_WINDOW);
    app.setCanvasResolution(pc.fw.ResolutionMode.AUTO);

    // AMBIENT

    app.context.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

    // DIRECTIONAL

    var light = new pc.fw.Entity();
    light.setPosition(100, 100, 100);
    light.setEulerAngles(45, 45, 0);
    app.context.systems.light.addComponent(light, {
        type: 'directional',
        intensity: 1,
        castShadows: true,
        shadowResolution: 8192,
        range: 60
    });
    light.light.model.lights[0].setShadowBias(-0.00003);
    app.context.root.addChild(light);

    // CAMERA

    var cam = new pc.fw.Entity();
    app.context.systems.camera.addComponent(cam, {
        clearColor: new pc.Color(1, 1, 1),
        nearClip: 1,
        farClip: 500
    });
    cam.setPosition(0, 100, 0);
    cam.setEulerAngles(-90, 0, 0);
    app.context.root.addChild(cam);

    // GROUND

    var ground = new pc.fw.Entity();
    ground.setPosition(0, 0, 0);
    ground.setLocalScale(100, 1, 100);
    app.context.systems.model.addComponent(ground, {
        type: 'box',
        receiveShadow: true
    });
    app.context.systems.rigidbody.addComponent(ground, {
        type: 'static'
    });
    app.context.systems.collision.addComponent(ground, {
        type: 'box',
        halfExtents: [50, 0.5, 50]
    });
    app.context.root.addChild(ground);
    var blue = createMaterial(0.28, 0.46, 1);
    ground.model.model.meshInstances[0].material = blue;

    // BOX

    var box = new pc.fw.Entity();
    app.context.systems.model.addComponent(box, {
        type: 'box',
        castShadows: true,
        receiveShadow: true
    });
    app.context.systems.rigidbody.addComponent(box, {
        type: 'static'
    });
    app.context.systems.collision.addComponent(box, {
        type: 'box',
        halfExtents: [0.5, 0.5, 0.5]
    });
    box.setPosition(0, 3, 0);
    app.context.root.addChild(box);
    var green = createMaterial(0, 1, 0);
    box.model.model.meshInstances[0].material = green;

    // UPDATE

    app.on('update', function () {
        var pos = cam.getPosition();
        cam.setPosition(0, pos.y - 0.1, 0);
    });
});

function createMaterial(r, g, b) {
    var material = new pc.scene.PhongMaterial();
    material.ambient.set(r, g, b);
    material.diffuse.set(r, g, b);
    material.specular.set(1, 1, 1);
    material.shininess = 2;
    material.update();
    return material;
}
