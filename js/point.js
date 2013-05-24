function Point(pos, mass, movable, damping, stepSize){
	this.position = pos;
	this.oldPos = pos;
	this.mass = mass;
	this.movable = movable;
	this.acceleration = new THREE.Vector3(0, 0, 0);
	this.damping = damping;
	this.stepSize = stepSize;
	this.radius = 2.5;
	this.freeze = false;

	this.createSphere = function(){
		var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );

		this.sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 2, 2), new THREE.MeshNormalMaterial());
		this.sphere.position = this.position;
		this.sphere.geometry.dynamic = true;
	}
	this.createSphere();

	this.addForce = function(f){
		this.acceleration.add(f);
	}

	this.updatePos = function(pos){
		this.position.setX(pos.x);
		this.position.setY(pos.y);
		this.position.setZ(pos.z);

		this.sphere.position = pos;
	}
	
	this.timeStep = function()
	{
		if (this.movable)
		{		
			var previous = this.position;

			this.position.setX(this.position.x + ((this.position.x - this.oldPos.x) * 1.1) * (1.0 - this.damping) +
								(this.acceleration.x * this.stepSize));

			this.position.setY(this.position.y + ((this.position.y - this.oldPos.y) * 1.1) * (1.0 - this.damping) +
								(this.acceleration.y * this.stepSize));

			this.position.setZ(this.position.z + ((this.position.z - this.oldPos.z) * 1.1) * (1.0 - this.damping) +
								(this.acceleration.z * this.stepSize)); 

			this.oldPos = previous;
			//this.acceleration = new THREE.Vector3(0, 0, 0); //acceleration is reset since it has been translated into a change in position
			this.acceleration.multiplyScalar(0.75);
			this.sphere.position = this.position;
		
			this.sphere.geometry.verticesNeedUpdate = true;
			this.sphere.geometry.normalsNeedUpdate = true;
		}
	}
}