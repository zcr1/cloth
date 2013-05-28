//http://threejs.org/examples/canvas_geometry_cube.html

"use strict";

$(function(){

	//Disable context menu
	$(document).bind("contextmenu",function(e){  
		return false;  
	});  

	//Initialize tabs
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
	
	sim.cameraInit(45, 0.2, 6500);
	sim.renderInit(); 
	sim.eventListeners();
	
	var damping = .02,
		stepSize = .1,
		cloth = new Cloth(20, damping, stepSize);

	cloth.createPoints(left, bottom);
	cloth.createTriangles();

	sliderInit(cloth);
	checkBoxInit(cloth);


	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 300;
	pointLight.position.y = 400;
	pointLight.position.z = 130;
	sim.scene.add(pointLight);

	sim.addCloth(cloth);
	sim.animate();


	$(window).resize(function() {
		position = $container.position();
		left = position.left;
		bottom = position.top + height;

		sim.updateSize(left, bottom, $container.width(), $container.height());

	});

});

function checkBoxInit(cloth){
	$("#shear").change( function(){
		cloth.updateShear($(this).is(':checked'));
	});
	$("#struct").change( function(){
		cloth.updateStruct($(this).is(':checked'));
	});
	$("#bend").change( function(){
		cloth.updateBend($(this).is(':checked'));
	});
}

function reset(){

}

//Set up all the lovely sliders
function sliderInit(cloth){
	var $gravSlider = $("#gravSlider"),
		$iterSlider = $("#iterSlider"),
		$pointSlider = $("#pointSlider"),
		$xSlider = $("#xSlider"),
		$ySlider = $("#ySlider"),
		$zSlider = $("#zSlider");

	$gravSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -60,
		max: 60,
		value: -10,
		slide: function(event, ui){
			cloth.updateGravity(ui.value);
		}
	});

	$iterSlider.slider({
		orientation: "vertical",
		range:"min",
		min: 1,
		max: 30,
		value: 15,
		slide: function(event, ui){
			cloth.updateIter(ui.value);
		}
	});

	$pointSlider.slider({
		orientation: "vertical",
		range:"min",
		min: 1,
		max: 30,
		value: 15,
		slide: function(event, ui){
			cloth.updateNumPoints(ui.value);
		}
	});

	$xSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 5,
		slide: function(event, ui){
			cloth.updateWind(ui.value, null, null);
		}
	});

	$ySlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 0,
		slide: function(event, ui){
			cloth.updateWind(null, ui.value, null);
		}
	});

	$zSlider.slider({
		orientation: "vertical",
		range:"min",
		min: -20,
		max: 20,
		value: 1,
		slide: function(event, ui){
			cloth.updateWind(null, null, ui.value);
		}
	});

}