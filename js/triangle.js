//THREE.js doesn't have triangle implemented yet so I have to hand-roll my own
function Triangle(p1, p2, p3){
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;

	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push(p1.position);
	this.geometry.vertices.push(p2.position);
	this.geometry.vertices.push(p3.position);

	this.geometry.dynamic = true;

	this.geometry.faces.push(new THREE.Face3(0, 2, 1));

	this.material = new THREE.MeshNormalMaterial();

	this.triMesh = new THREE.Mesh(this.geometry, this.material);

	this.timeStep = function(){
		this.triMesh.geometry.verticesNeedUpdate = true;
		this.triMesh.geometry.normalsNeedUpdate = true;
	}
}