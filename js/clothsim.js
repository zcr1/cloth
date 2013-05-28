function ClothSim(container, width, height, left, bottom){
	this.container = $(container);
	this.width = width;
	this.height = height;
	this.left = left;
	this.bottom = bottom;
	this.scene = new THREE.Scene();
	this.drag = false;
	this.mouseValid = false;
	this.shift = false;
	this.leftClick = this.rightClick = false;

	this.renderInit = function(webGL){
		//Use webGL if available
		this.renderer = webGL ? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();

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

	this.updateSize = function(left, bottom, width, height){
		this.left = left, 	this.bottom = bottom;
		this.width = width, this.height = height;

		this.renderer.setSize(width, height);
		this.camera.aspect = this.aspect =  width / height;
		this.camera.updateProjectionMatrix();
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

				if (self.leftClick && self.mouseValid){	
					self.mousePos = self.getMousePos(pos);

					if (self.drag){
						self.dragPoint.updatePos(self.mousePos);
					}
				}
				else if(self.rightClick && self.mouseValid){
					var vector = new THREE.Vector3(0, 0, 0);
					
					self.screenMousePos = pos;
					vector.subVectors(self.screenMousePos, self.lastMousePos);
					self.lastMousePos = self.screenMousePos;
					
					vector.normalize();
					vector.setY(-vector.y);
					vector.multiplyScalar(20);

					self.panCamera(vector);
				}
			}
		});

		$(document).mouseup(function(event){
			if (event.button == 0){ //left button
				self.leftClick = false;

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
			else if(event.button == 2){
				self.rightClick = false;
			}
		});

		$(document).mousedown(function(event){
			if (self.mouseValid){
				var pos = new THREE.Vector3(event.pageX, event.pageY, self.camera.z);

				if (event.button == 0){ //left click
					self.leftClick = true;
					self.mousePos = self.getMousePos(pos);
					self.drag = true;
						
					self.dragPoint = self.cloth.getClosestPoint(self.mousePos);
					self.dragPoint.mouse = true;
					self.dragPoint.movable = false;
				}
				else if (event.button == 2){ //right click
					self.rightClick = true;
					self.lastMousePos = pos;
				}
			}
		});
	}

	this.cameraZoom = function(delta){
		if (delta > 0) this.camera.position.z -= 30;
		else if (delta < 0) this.camera.position.z += 30;
	}

	//Is the mouse position within the canvas element?
	this.validMousePos = function(x, y){
		if ((x < this.left) || (x > (this.width + this.left)) ||
			(y > this.bottom) || (y < (this.bottom - this.height))) {
			return false;
		}
		return true;
	}

	//Extends a ray from camera position until the z-coordinate of ray is 0
	this.getMousePos = function(mousePos){
		//translate the mousePos given the current canvas position
		mousePos.x -= this.left;
		mousePos.y -= (this.bottom - this.height);

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

	this.panCamera = function(vector){
		this.camera.position.add(vector);
	}
}