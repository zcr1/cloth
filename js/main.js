//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//disable context menu
	//$(document).bind("contextmenu",function(e){  
	//	return false;  
	//});  


	//Get the height / width of the canvas
	var $container = $("#container"),
		width = $container.width(),
		height = $container.height();


	//Get position of the canvas
	var position = $container.position(),
		left = position.left,
		bottom = position.top + height;

	var sim = new ClothSim("#container", width, height, left, bottom);
	sim.cameraInit(45, 0.2, 10000);
	sim.renderInit();
	sim.eventListeners();
	
	var damping = .02,
		stepSize = .1,
		cloth = new Cloth([15, 15], damping, stepSize);

	cloth.createPoints(left, bottom);
	cloth.createTriangles();

	var $gravitySlider = $("#gravitySlider");
	var $gravityVal = $("#gravityVal")

	$gravitySlider.slider({
		orientation: "vertical",
		range:"min",
		min: -60,
		max: 60,
		value: -30,
		slide: function(event, ui){
			$gravityVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	$gravityVal.val($gravityVal.slider("value"));


	sim.addCloth(cloth);
	sim.animate();
});
