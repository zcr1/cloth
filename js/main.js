

//http://threejs.org/examples/canvas_geometry_cube.html


"use strict";

$(function(){
	var clothSim = new ClothSim("#container",500, 500);
	clothSim.cameraInit(45, 0.1, 10000);
	clothSim.renderInit();
	
	var damping = 0.5,
		stepSize = 1;

	var cloth = new Cloth([10, 10], damping, stepSize);
	clothSim.addCloth(cloth);

	var radius = 10,
    	segments = 16,
    	rings = 5;
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );

	var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), material);

	/*
	var geometry = new THREE.CubeGeometry( 200, 200, 200 );
	for ( var i = 0; i < geometry.faces.length; i ++ ) {
		geometry.faces[ i ].color.setHex( Math.random() * 0xffffff );

	}
	var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.y = 150;

	cloth.addToScene(cube);

	var geometry = new THREE.PlaneGeometry( 200, 200 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var material = new THREE.MeshBasicMaterial( { color: 0xe0e0e0 } );

	var plane = new THREE.Mesh( geometry, material );
	cloth.addToScene( plane );

	cloth.renderer.render(cloth.scene, cloth.camera); */


});


function ClothSim(container, width, height){
	this.container = $(container);
	this.width = width;
	this.height = height;
	this.aspect = this.width / this.height;	
	this.scene = new THREE.Scene();

	this.renderInit = function(){
		this.renderer = new THREE.CanvasRenderer();
		this.renderer.setSize(this.width, this.height);
		this.container.append(this.renderer.domElement);
	}

	this.cameraInit = function(viewAngle, near, far){
		this.viewAngle = viewAngle;
		this.near = near;
		this.far = far;
		this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
		this.setCameraPos(this.camera.position.x, 150, 500);
		this.scene.add(this.camera);
	}

	this.setCameraPos = function (x, y, z){
		this.camera.position.x = x;
		this.camera.position.y = y;
		this.camera.position.z = z;
	}

	this.addToScene = function(obj){
		this.scene.add(obj);
	}

	this.addCloth = function(cloth){
		this.cloth = cloth;
		//do stuff
	}
	this.animate = function(){
		requestAnimationFrame(this.animate);
		this.render();
	}

	this.render = function(){
		this.renderer.render(this.scene, this.camera);
	}

}

function Cloth(numParticles, damping, stepSize){
	this.numParts = numParticles //[width, height]
	this.buffer = 20; //how many pixels between particle centers
	this.constraints = [];
	this.particles = [];
	this.partMass = 1;
	this.partSize = 10;
	this.damping = damping;
	this.stepSize = stepSize;


	this.createParticles = function(){
		for(var i = 0; i < this.numParts[0]; i++){
			var row = [];
			for(var j = 0; j < this.numParts[1]; j++){			
				var pos = new Vector(i * this.buffer, j * this.buffer, 0);
				var particle = new Particle(pos, this.partMass, false, this.damping, this.stepSize)
				row.push(particle);
			}
			this.particles.push(row);
		}

	}
	this.createParticles();

}

function Particle(pos, mass, movable, damping, stepSize){
	this.pos = pos;
	this.oldPos = pos;
	this.mass = mass;
	this.movable = movable;
	this.acceleration = 0;
	this.damping = damping;
	this.stepSize = stepSize;


	this.addForce = function(f){
		this.acceleration.add(f.divide(this.mass));
	}
	
	this.timeStep = function()
	{
		if(this.movable)
		{
			var temp = this.pos;
			this.pos.x = this.pos.x + (this.pos.x - this.oldPos.x) * (1.0 - this.damping) +
						(this.acceleration.x * this.stepSize);
			this.pos.y = this.pos.y + (this.pos.y - this.oldPos.y) * (1.0 - this.damping) +
						(this.acceleration.y * this.stepSize);
			this.pos.z = this.pos.z + (this.pos.z - this.oldPos.z) * (1.0 - this.damping) +
						(this.acceleration.z * this.stepSize);
			this.oldPos = temp;
			this.acceleration = new Vector(0, 0, 0); //acceleration is reset since it has been translated into a change in position
		}
	}


}