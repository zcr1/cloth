//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//disable context menu
	$(document).bind("contextmenu",function(e){  
		return false;  
	});  

	var sim = new ClothSim("#container",700, 700);
	sim.cameraInit(45, 0.2, 10000);
	sim.renderInit();
	sim.eventListeners();
	
	var damping = .4,
		stepSize = .05;

	var cloth = new Cloth([15, 15], damping, stepSize);
	cloth.createPoints();
	cloth.createTriangles();

	sim.addCloth(cloth);

	sim.animate();
});
