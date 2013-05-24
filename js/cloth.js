//TODO
//gravity - have it modifiable
//wind - have it modifable
//texture - modifiable

function Cloth(numPoints, damping, stepSize){
	this.numParts = numPoints //[width, height]
	this.restLength = 15; //rest length of structural constraint
	this.constraints = [];
	this.points = [];
	this.triangles = [];
	this.partMass = 1;
	this.partSize = 10;
	this.damping = damping;
	this.stepSize = stepSize;
	this.numConstraints = 5; //how many times to run each constrain loop
	this.gravity = new THREE.Vector3(0, -10, 0);
	this.wind = new THREE.Vector3(10, 0, 5);

	this.createPoints = function(left, bottom){
		//THREE.js Canvas starts with x=0 in middle and y=0 at bottom
		for (var i = -(this.numParts[0] / 2); i < this.numParts[0] / 2; i++){
			var row = [];

			for (var j = 0; j < this.numParts[1]; j++){
				var pos = new THREE.Vector3(i * this.restLength  , j * this.restLength + 100, 0),
					point = new Point(pos, this.partMass, true, this.damping, this.stepSize);

				if (this.cornerCheck(i, j)){
					point.movable = false;
				}

				row.push(point);
			}
			this.points.push(row);
		}
	}

	//Create triangles in the cloth
	this.createTriangles = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;
		
		for (var i = 0; i < rows; i ++){
			for (var j = 0; j < cols; j ++){
				if ((i < rows - 1) && (j < cols - 1)){

					//Triangle 1
					var p1 = this.points[i][j],
						p2 = this.points[i][j + 1],
						p3 = this.points[i+1][j];

					var triangle = new Triangle(p1, p2, p3);
					this.triangles.push(triangle);

					//Triangle 2
					p1 = p2;
					p2 = this.points[i + 1][j + 1];

					triangle = new Triangle(p1, p2, p3);
					this.triangles.push(triangle);
				}
			}
		}		
	}

	//Calculate the shear and bending rest lengths
	this.calculateRestLengths = function(){
		this.shearLength = Math.sqrt(this.restLength * this.restLength + 
									this.restLength * this.restLength);

		this.bendDiagLength = 2 * this.shearLength; //diagonal bend
		this.hvLength = 2 * this.restLength; //horizontal / vertical bend
	}
	this.calculateRestLengths();


	//Is the point top left, top left + 1, or right, right + 1
	this.cornerCheck = function(i, j){
		if ((i == -(this.numParts[0] / 2)) && (j == (this.numParts[1] - 1))){
			return true;
		}

		if ((i == (this.numParts[0] / 2 - 1)) && (j == (this.numParts[1] - 1))){
			return true;
		}

		if ((i == -(this.numParts[0] / 2) + 1) && (j == (this.numParts[1] - 1))){
			return true;
		}
		if ((i == (this.numParts[0] / 2) - 2) && (j == (this.numParts[1] - 1))){
			return true;
		}
		
		return false;		
	}

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

	this.addTrianglesToScene = function(scene){
		for (var i = 0; i < this.triangles.length; i++){
			scene.add(this.triangles[i].triMesh);
		}
	}

	this.timeStep = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;
		
		for (var i = 0; i < rows; i++){	
			for (var j = 0; j < cols; j++){
				if (this.points[i][j].movable){
						this.points[i][j].addForce(this.gravity);
				}
				this.points[i][j].timeStep();
			}
		}

		for (var i = 0; i < this.triangles.length; i++){
			this.triangles[i].timeStep();
			this.addWind(this.triangles[i]);
		}	
	}

	this.addWind = function(triangle){
		//Get normal of triangle
		var side1 = new THREE.Vector3(0, 0, 0);
		side1.subVectors(triangle.p2.position, triangle.p1.position);

		var side2 = new THREE.Vector3(0, 0, 0);
		side2.subVectors(triangle.p3.position, triangle.p1.position);

		side1.cross(side2);

		//Normalize
		var normal = side1;
		normal.normalize();

		var d = normal.dot(this.wind);	

		normal.multiplyScalar(d);
		normal.multiplyScalar(5);

		//Add force to each triangle
		triangle.p1.addForce(normal);
		triangle.p2.addForce(normal);
		triangle.p3.addForce(normal);
	}

	//Apply shear, bend, and struct constraints for each point
	this.satisfyConstraints = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;	

		for (var a = 0; a < this.numConstraints; a++){
			for (var i = 0; i < rows; i++){
				for (var j = 0; j < cols; j++){
					this.shearConstraints(i, j);
					this.bendConstraints(i, j);
					this.structConstraints(i, j);
				}
			}
		}
	}

	//Structural constraints are between neighbors in same row or column
	this.structConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length,
			p1, p2;

		if (j < cols - 1){
			p1 = this.points[i][j];
			p2 = this.points[i][j + 1];

			this.constrainPoints(p1, p2, this.restLength);

		}

		if (j > 0){
			p1 = this.points[i][j];
			p2 = this.points[i][j - 1];

			this.constrainPoints(p1, p2, this.restLength);
		}

		if (i < rows - 1){
			p1 = this.points[i][j];
			p2 = this.points[i + 1][j];

			this.constrainPoints(p1, p2, this.restLength);
		}

		if (i > 0){
			p1 = this.points[i][j];
			p2 = this.points[i - 1][j];

			this.constrainPoints(p1, p2, this.restLength);
		}
	}

	//Shear constraints are between diagonal neighbors
	this.shearConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length,
			p1, p2;

		if (j > 0){
			if (i > 0){
				//NorthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 1][j - 1];

				this.constrainPoints(p1, p2, this.shearLength);	
			}
			if (i < rows - 1){
				//NorthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 1][j - 1];

				this.constrainPoints(p1, p2, this.shearLength);
			}
		}

		if (j < cols - 1){
			if (i > 0){
				//SouthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 1][j + 1];

				this.constrainPoints(p1, p2, this.shearLength);
			}
			if (i < rows - 1){
				//SouthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 1][j + 1];

				this.constrainPoints(p1, p2, this.shearLength);
			}			
		}
	}

	//Bend constraints are any point you could reach by "jumping" a neighbor point
	//analagous to jumping a piece in checkers
	this.bendConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length,
			p1, p2;

		if (j > 1){
			//North
			p1 = this.points[i][j];
			p2 = this.points[i][j - 2];

			this.constrainPoints(p1, p2, this.hvLength);

			if (i > 1){
				//NorthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 2][j - 2];

				this.constrainPoints(p1, p2, this.bendDiagLength);
			}

			if (i < rows - 2){
				//NorthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 2][j - 2];

				this.constrainPoints(p1, p2, this.bendDiagLength);
			}
		}

		if (j < cols - 2){
			//South
			p1 = this.points[i][j];
			p2 = this.points[i][j + 2];

			this.constrainPoints(p1, p2, this.hvLength);

			if (i > 1){
				//SouthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 2][j + 2];

				this.constrainPoints(p1, p2, this.bendDiagLength);
			}

			if (i < rows - 2){
				//SouthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 2][j + 2];

				this.constrainPoints(p1, p2, this.bendDiagLength);
			}
		}

		if (i > 1){
			//West
			p1 = this.points[i][j];
			p2 = this.points[i - 2][j];

			this.constrainPoints(p1, p2, this.hvLength);			
		}

		if (i < cols - 2){
			//East
			p1 = this.points[i][j];
			p2 = this.points[i + 2][j];

			this.constrainPoints(p1, p2, this.hvLength);			
		}
	}

	this.constrainPoints = function(p1, p2, restLength){
		var dist = p1.position.distanceTo(p2.position),
			newVect = new THREE.Vector3(0, 0, 0);

		newVect.subVectors(p2.position, p1.position);
		newVect.multiplyScalar(1 - restLength / dist);

		if (p1.movable && p2.movable){
			newVect.multiplyScalar(0.5);
			//p1.addForce(newVect);
			p1.position.add(newVect);

			newVect.negate();
			p2.position.add(newVect);
			//p2.addForce(newVect);
		}
		else{
			if (p1.movable){
				p1.position.add(newVect);
				//p1.addForce(newVect);
			}

			if (p2.movable){
				newVect.negate();
				p2.position.add(newVect);
				//p2.addForce(newVect);
			}
		}
	}

	this.updateGravity = function(val){
		this.gravity.setY(val);
	}

	this.updateWind = function(x, y, z){
		if (x != null) this.wind.setX(x);
		if (y != null) this.wind.setY(y);
		if (z != null) this.wind.setZ(z);
		console.log(this.wind);
	}

}

