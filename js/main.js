//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//disable context menu
	//$(document).bind("contextmenu",function(e){  
	//	return false;  
	//});  

	$(function() {
		$( "#tabs" ).tabs();
	});

	//Get the height / width of the canvas
	var $container = $("#container"),
		width = $container.width(),
		height = $container.height();


	//Get position of the canvas
	var position = $container.position(),
		left = position.left,
		bottom = position.top + height;

	var sim = new ClothSim("#container", width, height, left, bottom);
	
	sim.cameraInit(45, 0.2, 6000);
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


	$(window).resize(function() {
		position = $container.position();
		left = position.left;
		bottom = position.top + height;

		sim.updateSize(left, bottom, $container.width(), $container.height());

	});

});

function reset(){

}

//Set up the sliders
function sliderInit(cloth){
	var $gravSlider = $("#gravSlider"),
		//$gravVal = $("#gravVal"),
		$xSlider = $("#xSlider"),
		//$xVal = $("#xVal"),
		$ySlider = $("#ySlider"),
		//$yVal = $("#yVal"),
		$zSlider = $("#zSlider");
		//$zVal = $("#zVal");

	$gravSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -60,
		max: 60,
		value: -10,
		slide: function(event, ui){
			//$gravVal.val(ui.value);
			cloth.updateGravity(ui.value);
		}
	});
	//$gravVal.val($gravSlider.slider("value"));

	$xSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 10,
		slide: function(event, ui){
			//$xVal.val(ui.value);
			cloth.updateWind(ui.value, null, null);
		}
	});
	//$xVal.val($xSlider.slider("value"));

	$ySlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 0,
		slide: function(event, ui){
			//$yVal.val(ui.value);
			cloth.updateWind(null, ui.value, null);
		}
	});
	//$yVal.val($ySlider.slider("value"));

	$zSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 5,
		slide: function(event, ui){
			//$zVal.val(ui.value);
			cloth.updateWind(null, null, ui.value);
		}
	});
	//$zVal.val($zSlider.slider("value"));

}