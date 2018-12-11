// Adapted from "A Noob's Guide to Three.js"
// https://codepen.io/tutsplus/pen/oWzBvL
// I used this 'noobs' guide to take care of the set-up and controls, 
// and I did the bulk of the project work (simplex noise related work)
// by creating and manipulating three.js meshes
/////////////////////////////////////////
// Scene Setup
/////////////////////////////////////////
const tilesize = 100;
const segments = 32;
const dirtpeak = 2;
const mountainpeak = 18;

var scene,
    camera,
    renderer,
    controls;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 8000 );
camera.position.set(400, 400, 400);
camera.lookAt( scene.position );

renderer = new THREE.WebGLRenderer({
  alpha: true,
    antialias: true
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );


/////////////////////////////////////////
// Trackball Controller
/////////////////////////////////////////

controls = new THREE.TrackballControls( camera );
controls.rotateSpeed = 5.0;
controls.zoomSpeed = 3.2;
controls.panSpeed = 0.8;
controls.noZoom = false;
controls.noPan = true;
controls.staticMoving = false;
controls.dynamicDampingFactor = 0.2;


/////////////////////////////////////////
// Lighting
/////////////////////////////////////////

var whitish = 0xf1f1f1/2

var light = new THREE.DirectionalLight( whitish, 1 );
light.position.set( tilesize, tilesize, tilesize );
scene.add( light );
var lightLocator = new THREE.AxesHelper( 1.25 );
lightLocator.position.set(tilesize, tilesize, tilesize);
scene.add( lightLocator );

var ambientLight  = new THREE.AmbientLight( '#444444' );
scene.add( ambientLight );


/////////////////////////////////////////
// Utilities
/////////////////////////////////////////

var axisHelper = new THREE.AxesHelper( 1.25 );
scene.add( axisHelper );


/////////////////////////////////////////
// Render Loop
/////////////////////////////////////////

function render() {
  //genVertices();
  renderer.render( scene, camera );
}

// Render the scene when the controls have changed.
// If you don’t have other animations or changes in your scene,
// you won’t be draining system resources every frame to render a scene.
controls.addEventListener( 'change', render );

// Avoid constantly rendering the scene by only 
// updating the controls every requestAnimationFrame
function animationLoop() {
  requestAnimationFrame(animationLoop);
  controls.update();
}

var tgeometry = new THREE.PlaneBufferGeometry( tilesize, tilesize, segments, segments );
var tmaterial = new THREE.MeshPhongMaterial({color: 0x17c11d});
var terrain = new THREE.Mesh( tgeometry, tmaterial );
terrain.rotation.x = -Math.PI / 2;
scene.add( terrain );

var wgeometry = new THREE.PlaneBufferGeometry( tilesize, tilesize, segments, segments );
var wmaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
var water = new THREE.Mesh( wgeometry, wmaterial );
water.rotation.x = -Math.PI / 2;
scene.add( water );

var mgeometry = new THREE.PlaneBufferGeometry( tilesize, tilesize, segments, segments );
var mmaterial = new THREE.MeshPhongMaterial({color: 0x444444});
var mountains = new THREE.Mesh( mgeometry, mmaterial );
mountains.rotation.x = -Math.PI / 2;
scene.add( mountains );

function genVertices() {
    var vertices = terrain.geometry.attributes.position.array;
    var noise = [];
    for (var i = 0; i <= vertices.length; i += 3) {
        x = vertices[i];
        y = vertices[i+1];
        if(!(noise[x])){
          noise[x] = [];
        } 
          noise[x][y] = simplex.noise2D(x,y)+1/2*simplex.noise2D(x/10, y/10);
        //vertices[i+2] = dirtpeak * (Math.sin(10*x)*Math.sin(10*y));
        //vertices[i+2] = dirtpeak * (Math.random()-1/3);
        vertices[i+2] = dirtpeak * (noise[x][y]+1/2);
    }
    //gaussian blur
    
    for (var i = 3; i < vertices.length; i += 3) {
        //vertices[i+2] = 0.25*vertices[i-1] + 0.5*vertices[i+2] + 0.25*vertices[i+5];
    } 
    
    terrain.geometry.attributes.position.needsUpdate = true;
    terrain.geometry.computeVertexNormals();
    vertices = mountains.geometry.attributes.position.array;
    for (var i = 0; i <= vertices.length-3; i += 3) {
        x = vertices[i];
        y = vertices[i+1];
        vertices[i+2] = mountainpeak*(Math.pow(Math.max(noise[x][y], 0), 2)-1/4);//Math.pow(Math.min((noise[x][y]-0.5), 0), 2)-10;
    }
      //gaussian blur
      for (var i = 3; i < vertices.length-3; i += 3) {
        vertices[i+2] = 0.25*vertices[i-1] + 0.5*vertices[i+2] + 0.25*vertices[i+5];
    } 
      mountains.geometry.attributes.position.needsUpdate = true;
    mountains.geometry.computeVertexNormals();

}
function init() {
  simplex = new SimplexNoise(Math.random());
  genVertices();
  render();
  animationLoop();
}
init();

/////////////////////////////////////////
// Window Resizing
/////////////////////////////////////////

window.addEventListener( 'resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    render();
}, false );


