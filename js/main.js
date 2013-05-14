/*jslint browser: true, bitwise: true, plusplus: true, sloppy: true, todo: true, white: true, maxerr: 100*/ /*global  $*/

$(function(){
	"use strict";

	if ($("#tutorial")[0].getContext){
		var ctx = $("#tutorial")[0].getContext("2d");
  ctx.beginPath();
  ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
  ctx.moveTo(110,75);
  ctx.arc(75,75,35,0,Math.PI,false);  // Mouth (clockwise)
  ctx.moveTo(65,65);
  ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
  ctx.moveTo(95,65);
  ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
  ctx.stroke();

	} else {
		console.log("canvas not supported");
	}
});

