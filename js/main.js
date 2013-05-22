//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//disable context menu
	$(document).bind("contextmenu",function(e){  
		return false;  
	});  

	var clothSim = new ClothSim("#container",700, 700);
	clothSim.cameraInit(45, 0.2, 10000);
	clothSim.renderInit();
	clothSim.eventListeners();
	
	var damping = 1.5,
		stepSize = .1;

	var cloth = new Cloth([12, 12], damping, stepSize);
	cloth.createPoints()
	clothSim.addCloth(cloth);

	clothSim.animate();
});


function ClothSim(container, width, height){
	this.container = $(container);
	this.width = width;
	this.height = height;
	this.aspect = this.width / this.height;	
	this.scene = new THREE.Scene();
	this.drag = false;
	this.dragPoint = null;
	this.mousePos = null;
	this.mouseValid = false;
	this.shift = false;

	this.renderInit = function(){
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.width, this.height);
		this.container.append(this.renderer.domElement);
	}

	this.cameraInit = function(viewAngle, near, far){
		this.viewAngle = viewAngle;
		this.near = near;
		this.far = far;
		this.camera = new THREE.PerspectiveCamera(this.viewAngle, this.aspect, this.near, this.far);
		this.setCameraPos(this.camera.position.x, 150, 900);
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
		this.cloth.addPointsToScene(this.scene);
	}

	this.animate = function(){
		this.cloth.timeStep();
		this.cloth.satisfyConstraints();
		if(!this.drag) this.cloth.applyGravity();
		requestAnimationFrame(this.animate.bind(this));
		this.render();
	}

	this.render = function(){
		this.renderer.render(this.scene, this.camera);
	}

	this.eventListeners = function(){
		var self = this;

		$(document).mousemove(function(event){
			self.mouseValid = self.validMousePos(event.pageX, event.pageY);

			if (self.mouseValid){
				var pos = new THREE.Vector3(event.pageX, event.pageY, self.camera.z);
				
				self.mousePos = self.getMousePos(pos);

				if (self.drag && self.mouseValid){
					self.dragPoint.updatePos(self.mousePos);
				}
			}
		});

		$(document).mouseup(function(event){
			if(event.button == 0){
				if (self.drag){
					if (self.shift){
						if (self.dragPoint) self.dragPoint.movable = false;
					}
					else{
						if (self.dragPoint) self.dragPoint.movable = true;
					}
					self.dragPoint = null;
					self.drag = false;
				}
			}
		});

		$(document).mousedown(function(event){
			if (self.mouseValid){
				if (event.button == 0){ 
					//left click
					var pos = new THREE.Vector3(event.pageX, event.pageY, self.camera.z);

					self.mousePos = self.getMousePos(pos);
					self.drag = true;
						
					self.dragPoint = self.cloth.getClosestPoint(self.mousePos);
					self.dragPoint.mouse = true;
					self.dragPoint.movable = false;
				}
			}
		});

		$(document).keydown(function(event){
			if(event.keyCode == 16){
				self.shift = true;
			}	
		});
		$(document).keyup(function(event){
			if(event.keyCode == 16){
				self.shift = false;
			}	
		});

		//Mousewheel zoom
		$(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
			if (self.mouseValid){
    			self.cameraZoom(delta);
    			return false;
    		}
		});
	}

	this.cameraZoom = function(delta){
		if (delta > 0) this.camera.position.z -= 30;
		else if (delta < 0) this.camera.position.z += 30;
	}

	//Is the position within the canvas element?
	this.validMousePos = function(x, y){
		if ((x < 0) || (x > this.width) ||
			(y < 0) || (y > this.height)) return false;
		return true;
	}

	//Extends a ray from camera position until the z-coordinate of ray is 0
	//Thanks stackoverflow!
	this.getMousePos = function(mousePos){
		var vector = new THREE.Vector3((mousePos.x / this.width ) * 2 - 1,
										-(mousePos.y / this.height ) * 2 + 1, 
										0.5 );

		var projector = new THREE.Projector();		
		projector.unprojectVector(vector, this.camera);

		var dir = vector.sub(this.camera.position ).normalize();

		var ray = new THREE.Raycaster(this.camera.position, dir);
		var distance = - this.camera.position.z / dir.z;

		var pos = this.camera.position.clone().add(dir.multiplyScalar(distance));
		return pos;
	}

}
