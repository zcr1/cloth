//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//disable context menu
	//$(document).bind("contextmenu",function(e){  
	//	return false;  
	//});  

	var width = 500,
		height = 500;

	var position = $("#container").position(),
		left = position.left,
		bottom = position.top + height;

	var sim = new ClothSim("#container", width, height, left, bottom);
	sim.cameraInit(45, 0.2, 10000);
	sim.renderInit();
	sim.eventListeners();


	var damping = .4,
		stepSize = .05;

	var cloth = new Cloth([10, 10], damping, stepSize);
	cloth.createPoints(left, bottom);
	cloth.createTriangles();

	sim.addCloth(cloth);

	//sim.animate();
});
