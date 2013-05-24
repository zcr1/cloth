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

	sliderInit(cloth)

	sim.addCloth(cloth);
	sim.animate();
});


function sliderInit(cloth){
	var $gravitySlider = $("#gravitySlider"),
		$gravityVal = $("#gravityVal"),
		$xSlider = $("#xSlider"),
		$xVal = $("#xVal"),
		$ySlider = $("#ySlider"),
		$yVal = $("#yVal"),
		$zSlider = $("#zSlider"),
		$zVal = $("#zVal");

	$gravitySlider.slider({
		orientation: "vertical",
		range:"min",
		min: -100,
		max: 100,
		value: -30,
		slide: function(event, ui){
			$gravityVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	$gravityVal.val($gravitySlider.slider("value"));

	$xSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -100,
		max: 100,
		value: 0,
		slide: function(event, ui){
			$xVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	$xVal.val($xSlider.slider("value"));


	$ySlider.slider({
		orientation: "vertical",
		range:"min",
		min: -100,
		max: 100,
		value: 0,
		slide: function(event, ui){
			$yVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	$yVal.val($ySlider.slider("value"));

	$zSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -100,
		max: 100,
		value: 0,
		slide: function(event, ui){
			$zVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	$zVal.val($zSlider.slider("value"));

}