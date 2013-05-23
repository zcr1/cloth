function ClothSim(container, width, height, left, bottom){
	this.container = $(container);
	this.width = width;
	this.height = height;
	this.left = left;
	this.bottom = bottom;
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
		this.aspect = this.width / this.height;	
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
		//this.cloth.addTrianglesToScene(this.scene);
	}

	this.animate = function(){
		this.cloth.satisfyConstraints();
		this.cloth.timeStep();
		requestAnimationFrame(this.animate.bind(this));
		this.render();
	}

	this.render = function(){
		this.renderer.render(this.scene, this.camera);
	}

	this.eventListeners = function(){

		this.mouseEvents();
		this.keyEvents();
	}

	this.keyEvents = function(){
		var self = this;
		
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
	}

	this.mouseEvents = function(){
		var self = this;

		$(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
			if (self.mouseValid){
    			self.cameraZoom(delta);
    			return false;
    		}
		});

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
	}

	this.cameraZoom = function(delta){
		if (delta > 0) this.camera.position.z -= 30;
		else if (delta < 0) this.camera.position.z += 30;

		console.log(this.camera.position.z);
	}

	//Is the position within the canvas element?
	this.validMousePos = function(x, y){
		if ((x < this.left) || (x > (this.width + this.left)) ||
			(y > this.bottom) || (y < (this.bottom - this.height))) {
			return false;
	}
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