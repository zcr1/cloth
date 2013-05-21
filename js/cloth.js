function Cloth(numPoints, damping, stepSize){
	this.numParts = numPoints //[width, height]
	this.restLength = 30; 
	this.constraints = [];
	this.points = [];
	this.partMass = 1;
	this.partSize = 10;
	this.damping = damping;
	this.stepSize = stepSize;
	this.numConstraints = 10; //how many times to run each constrain loop


	this.createPoints = function(){
		//THREE.js Canvas starts with position 0 in middle, put half of cloth on each side of x
		for (var i = -(this.numParts[0] / 2); i < this.numParts[0] / 2; i++){
			var row = [];

			for (var j = 0; j < this.numParts[1]; j++){
				var pos = new THREE.Vector3(i * this.restLength, j * this.restLength, 0),
					point = new Point(pos, this.partMass, true, this.damping, this.stepSize);

				row.push(point);
			}
			this.points.push(row);
		}

	}
	this.createPoints();

	//Get closest point to mouse position
	this.getClosestPoint = function(mousePos){
		var minDist = this.points[0][0].position.distanceTo(mousePos),
			minPoint = [0,0],
			rows = this.points.length, //slightly faster to cache the length
			cols = this.points[0].length;

		for (var i = 0; i < rows; i++){
			for (var j = 0; j < cols; j++){
				var dist = this.points[i][j].position.distanceTo(mousePos);
				if (dist < minDist){
					minDist = dist;
					minPoint = [i,j];
				}
			}
		}

		return this.points[minPoint[0]][minPoint[1]];
	}

	this.addPointsToScene = function(scene){
		var rows = this.points.length, //slightly faster to cache the length
			cols = this.points[0].length;

		for (var i = 0; i < rows; i++){
			for (var j = 0; j < cols; j++){
				scene.add(this.points[i][j].sphere);
			}
		}
	}

	this.satisfyConstraints = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;	

		for (var a = 0; a < this.numConstraints; a ++){
			for (var i = 0; i < rows; i++){
				for (var j = 0; j < cols; j++){
					this.structConstraints();

				}
			}
		}
	}

	//Structural constraints are between neighbors in same row or column
	this.structConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length;

		if (j < cols - 1){
			var p1 = this.points[i][j],
				p2 = this.points[i][j + 1];
			this.constrainPoints(p1, p2);
		}

		if (i < rows - 1){
			var p1 = this.points[i][j],
				p2 = this.points[i + 1][j];
			this.constrainPoints(p1, p2);
		}
	}

	//Shear constraints are between diagonal neighbors
	this.shearConstraints = function(i, j){

	}

	//Bend constraints are any point you could reach by "jumping" a neighbor point
	//analagous to jumping a piece in checkers
	this.bendConstraints = function(i, j){

	}

	this.constrainPoints = function(p1, p2){
		var dist = p1.position.distanceTo(p2.position),
			newVect = new THREE.Vector3(0, 0, 0);

		newVect.subVectors(p2.position, p1.position);
		newVect.multiplyScalar(1 - this.restLength / dist);
		newVect.multiplyScalar(this.damping);
		newVect.multiplyScalar(0.5);

		if (p1.movable){
			p1.position.add(newVect);
		}
		if (p2.movable){
			newVect.negate();
			p2.position.add(newVect);
		}
	}
}

function Point(pos, mass, movable, damping, stepSize){
	this.position = pos;
	this.oldPos = pos;
	this.mass = mass;
	this.movable = movable;
	this.acceleration = 0;
	this.damping = damping;
	this.stepSize = stepSize;
	this.radius = 5;


	this.createSphere = function(){
		var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
		this.sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 10, 10), new THREE.MeshNormalMaterial());
		this.sphere.position = this.position;
		this.sphere.geometry.dynamic = true;

	}
	this.createSphere();

	this.addForce = function(f){
		this.acceleration.add(f.divide(this.mass));
	}

	this.updatePos = function(pos){
		this.position = pos;
		this.sphere.position = pos;

		this.sphere.geometry.verticesNeedUpdate = true;
		this.sphere.geometry.normalsNeedUpdate = true;
	}
	
	this.timeStep = function()
	{
		if (this.movable)
		{
			var temp = this.position;
			this.position.x = this.position.x + (this.position.x - this.oldPos.x) * (1.0 - this.damping) +
						(this.acceleration.x * this.stepSize);
			this.position.y = this.position.y + (this.position.y - this.oldPos.y) * (1.0 - this.damping) +
						(this.acceleration.y * this.stepSize);
			this.position.z = this.position.z + (this.position.z - this.oldPos.z) * (1.0 - this.damping) +
						(this.acceleration.z * this.stepSize);
			this.oldPos = temp;
			this.acceleration = new THREE.Vector3(0, 0, 0); //acceleration is reset since it has been translated into a change in position
		}
	}
}