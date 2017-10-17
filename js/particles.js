var scene, camera, renderer, controls;

var width, height;


var NUMPARTICLES = 10000;
var pointCloud;
var targetPos;
var modelLoaded = false;
var modelURLBase = "models/";
var modelNames = ["owl.obj", "hand.obj", "human.obj"];
var lastModelID;

init();

function init() {
    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);
    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    // scene.background = new THREE.Color( 0xFFFFFF );

    width = window.innerWidth;
    height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);


    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;


    setupParticles();
    loadModels();
    camera.position.z = 300;
    camera.position.y = 100;
    setInterval(loadModels, 3000);
}

function setupParticles() {
    var pMaterial = new THREE.PointsMaterial({
        color: 0x00FF00
    });
    var pGeometry = new THREE.Geometry();
    var targetGeometry = new THREE.Geometry();
    var x, y, z;
    var pCounter = NUMPARTICLES;


    while (pCounter--) {
        var distance = 400;
        var theta = THREE.Math.randFloatSpread(360);
        var phi = THREE.Math.randFloatSpread(360);

        x = distance * Math.sin(theta) * Math.cos(phi);
        y = distance * Math.sin(theta) * Math.sin(phi) + 100;
        z = distance * Math.cos(theta);
        pGeometry.vertices.push(new THREE.Vector3(x, y, z));
        targetGeometry.vertices.push(new THREE.Vector3(x, y, z));

    };


    targetPos = new THREE.Points(targetGeometry);
    pointCloud = new THREE.Points(pGeometry, pMaterial);
    // pointCloud.translateZ(-300);
    pointCloud.translateY(-100);
    scene.add(pointCloud);
}

function animateParticles() {
    var pCounter = targetPos.geometry.vertices.length;
    while (pCounter--) {
        var particle = pointCloud.geometry.vertices[pCounter];
        var target = targetPos.geometry.vertices[pCounter];
        particle.lerp(target, Math.random() / 10);
    }
    pointCloud.geometry.verticesNeedUpdate = true;

}

function loadModels() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    // instantiate a loader
    var loader = new THREE.OBJLoader(manager);

    // make sure we don't get the same model twice
    var nextModelID = Math.floor(Math.random() * modelNames.length);
    while (nextModelID == lastModelID & modelNames.length > 1) {
        nextModelID = Math.floor(Math.random() * modelNames.length);
    }
    var nextModel = modelURLBase + modelNames[nextModelID]
    lastModelID = nextModelID;

    // load a resource
    loader.load(
        // resource URL
        nextModel,
        // Function when resource is loaded
        function(object) {
            var tempGeometry = new THREE.Geometry();
            object.traverse(function(child) {
                if (child.geometry != undefined) {
                    var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                    geometry.computeFaceNormals();
                    geometry.mergeVertices();
                    geometry.computeVertexNormals();
                    tempGeometry.merge(geometry);
                }
            });
            tempGeometry.computeBoundingSphere();
            console.log(tempGeometry.boundingSphere.radius);
            var scaleFactor = 70 / tempGeometry.boundingSphere.radius;
            tempGeometry.scale(scaleFactor, scaleFactor, scaleFactor)

            var pCounter = NUMPARTICLES - tempGeometry.vertices.length;
            while (pCounter--) {

                var distance = (Math.random() * 60) - 100;
                var theta = THREE.Math.randFloatSpread(360);
                var phi = THREE.Math.randFloatSpread(360);

                x = distance * Math.sin(theta) * Math.cos(phi);
                y = distance * Math.sin(theta) * Math.sin(phi) + 100;
                z = distance * Math.cos(theta);

                tempGeometry.vertices.push(new THREE.Vector3(x, y, z));
            }
            targetPos = new THREE.Points(tempGeometry);
        }
    );
}

function render() {
    requestAnimationFrame(render);
    animateParticles();
    // camera.position.z += 1;
    controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

    renderer.render(scene, camera);
}
render();
