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

	this.setFreeze = function(bool){
		this.frozen = bool;
	}

	this.getFreeze = function(){
		return this.frozen;
	}

	this.updatePos = function(pos){
		this.position = pos;
		this.sphere.position = pos;
		//var newVect = new THREE.Vector3(0, 0, 0);
		//newVect.subVectors(pos, this.position);
		//newVect.multiplyScalar(20);
		//this.mouseForce = newVect;
		//this.addForce(newVect);
	}
	
	this.timeStep = function()
	{
		if (this.movable && !this.getFreeze())
		{
			var temp = this.position;
			this.position.y += this.acceleration.y * this.stepSize;
			//this.position.z += -10
			//this.position.x += 20
			/*this.position.x = this.position.x + (this.position.x - this.oldPos.x) * (1.0 - this.damping) +
						(this.acceleration.x * this.stepSize);
			this.position.y = this.position.y + (this.position.y - this.oldPos.y) * (1.0 - this.damping) +
						(this.acceleration.y * this.stepSize);
			this.position.y -= 1;
			this.position.z = this.position.z + (this.position.z - this.oldPos.z) * (1.0 - this.damping) +
						(this.acceleration.z * this.stepSize);
			this.oldPos = temp;*/
			this.acceleration = new THREE.Vector3(0, 0, 0); //acceleration is reset since it has been translated into a change in position
			this.sphere.position = this.position;

			this.sphere.geometry.verticesNeedUpdate = true;
			this.sphere.geometry.normalsNeedUpdate = true;
		}

		this.setFreeze(false);
	}
}