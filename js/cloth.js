//TODO
//gravity - have it modifiable
//wind - have it modifable
//texture - modifiable

function Cloth(numPoints, damping, stepSize){
	this.numParts = numPoints //[width, height]
	this.restLength = 15; //rest length of structural constraint
	this.constraints = [];
	this.points = [];
	this.partMass = 1;
	this.partSize = 10;
	this.damping = damping;
	this.stepSize = stepSize;
	this.numConstraints = 10; //how many times to run each constrain loop
	this.gravity = new THREE.Vector3(0, -15, 0);
	this.maxStretchLen = 60;

	this.createPoints = function(){
		//THREE.js Canvas starts with position 0 in middle, put half of cloth on each side of x
		for (var i = -(this.numParts[0] / 2); i < this.numParts[0] / 2; i++){
			var row = [];

			for (var j = 0; j < this.numParts[1]; j++){
				var pos = new THREE.Vector3(i * this.restLength, j * this.restLength + 200, 0),
					point = new Point(pos, this.partMass, true, this.damping, this.stepSize);

				if (this.cornerCheck(i, j)){
					point.movable = false;
				}

				row.push(point);
			}
			this.points.push(row);
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


	//Is the point at these coordinates top left or right
	this.cornerCheck = function(i, j){
		if ((i == -(this.numParts[0] / 2)) && (j == (this.numParts[1] - 1))){
			return true;
		}

		if ((i == (this.numParts[0] / 2 - 1)) && (j == (this.numParts[1] - 1))){
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

	this.timeStep = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;
		
		for (var i = 0; i < rows; i++){	
			for (var j = 0; j < cols; j++){
				this.points[i][j].timeStep();
			}
		}			
	}

	this.satisfyConstraints = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;	

		for (var a = 0; a < this.numConstraints; a ++){
			for (var i = 0; i < rows; i++){
				for (var j = 0; j < cols; j++){
					//this.shearConstraints(i, j);
					//this.bendConstraints(i, j);
					this.structConstraints(i, j);
				}
			}
		}
	}

	//Check distance between neighbors and limit it 
	this.checkDistance = function(p1, p2){
/*
		var dist = p1.position.distanceTo(p2.position);

		if (dist > this.maxStretchLen){
			var newVect = new THREE.Vector3(0, 0, 0);

			newVect.subVectors(p2.position, p1.position);
			newVect.setLength(this.maxStretchLen);
			newVect.multiplyScalar(0.5);
			
			if (p1.movable && p2.movable){
				p1.setFreeze(true);
				p2.setFreeze(true);
				p1.position.add(newVect);
				newVect.negate();
				p2.position.add(newVect);
				
			}
			else{
				if (p1.movable) {
					p1.setFreeze(true);
					p1.position.add(newVect);
				}
				if (p2.movable){
					p2.setFreeze(true);
					newVect.negate();
					p2.position.add(newVect);
				}
			}
		}*/	
	}

	//Structural constraints are between neighbors in same row or column
	this.structConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length;

		if (j < cols - 1){
			var p1 = this.points[i][j],
				p2 = this.points[i][j + 1];

			this.constrainPoints(p1, p2, this.restLength);
			this.checkDistance(p1, p2);

		}

		if (j > 0){
			var p1 = this.points[i][j],
				p2 = this.points[i][j - 1];

			this.constrainPoints(p1, p2, this.restLength);
			this.checkDistance(p1, p2);
		}

		if (i < rows - 1){
			var p1 = this.points[i][j],
				p2 = this.points[i + 1][j];
			this.constrainPoints(p1, p2, this.restLength);
			this.checkDistance(p1, p2);
		}

		if (i > 0){
			var p1 = this.points[i][j],
				p2 = this.points[i - 1][j];
			this.constrainPoints(p1, p2, this.restLength);
			this.checkDistance(p1, p2);

		}
	}

	//Shear constraints are between diagonal neighbors
	this.shearConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length;

		if (j > 0){
			if (i > 0){
				//NorthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 1][j - 1];
				this.constrainPoints(p1, p2, this.shearLength);
				this.checkDistance(p1, p2);		
			}
			if (i < rows - 1){
				//NorthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 1][j - 1];
				this.constrainPoints(p1, p2, this.shearLength);
				this.checkDistance(p1, p2);
			}
		}

		if (j < cols - 1){
			if (i > 0){
				//SouthWest
				p1 = this.points[i][j];
				p2 = this.points[i - 1][j + 1];
				this.constrainPoints(p1, p2, this.shearLength);
				this.checkDistance(p1, p2);		
			}
			if (i < rows - 1){
				//SouthEast
				p1 = this.points[i][j];
				p2 = this.points[i + 1][j + 1];
				this.constrainPoints(p1, p2, this.shearLength);
				this.checkDistance(p1, p2);
			}			
		}
	}

	//Bend constraints are any point you could reach by "jumping" a neighbor point
	//analagous to jumping a piece in checkers
	this.bendConstraints = function(i, j){
		var rows = this.points.length, 
			cols = this.points[0].length.
			p1 = null,
			p2 = null;

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
		
		newVect.multiplyScalar(this.damping);
		newVect.multiplyScalar(0.5);
		newVect.multiplyScalar(1 - restLength / dist);

		if ((p1.movable && p2.movable) && !(p1.getFreeze() || p2.getFreeze())){
			//var old = p1.position.clone();
			//p1.addForce(newVect);
			//p1.updatePos(newVect);
			newVect.multiplyScalar(0.5);
			p1.position.add(newVect);
			newVect.negate();
			p2.position.add(newVect);
		}
		else{
			if (p1.movable && !p1.getFreeze()){
				p1.position.add(newVect);
			}
			if (p2.movable && !p2.getFreeze()){
				//var old = p2.position.clone();
				newVect.negate();
				p2.position.add(newVect);
				//p2.updatePos(newVect);
				//p2.addForce(newVect);
			}
		}
	}

	this.applyGravity = function(){
		var rows = this.points.length, 
			cols = this.points[0].length;	

		for (var a = 0; a < this.numConstraints; a ++){
			for (var i = 0; i < rows; i++){
				for (var j = 0; j < cols; j++){
					if(this.points[i][j].movable)	{
						this.points[i][j].addForce(this.gravity);
					}
				}	
			}
		}
	}
}

