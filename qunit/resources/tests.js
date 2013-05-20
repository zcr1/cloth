/****************************************************************************
	Unit tests implemented with Qunit            
*****************************************************************************/

module("Vector");

//Thank you Wolfram for the answers

test("Length", function() {
	var v1 = new Vector(2, 2, 2),
		answer = 3.4641016151377544;
	equal(v1.length(), answer, "Addition is good.")
});

test("Addition", function() {
	var v1 = new Vector(2, 2, 2),
		v2 = new Vector(2, 2, 2),
		answer = new Vector(4, 4, 4);

	deepEqual(v1.add(v2), answer, "Addition is good.")
});

test("Subtraction", function() {
	var v1 = new Vector(2, 2, 2),
		v2 = new Vector(2, 2, 2),
		answer = new Vector(0, 0, 0);

	deepEqual(v1.subtract(v2), answer, "Subtraction is good.")
});

test("Multiplication", function() {
	var v1 = new Vector(-2, -2, -2),
		v2 = new Vector(3, 3, 3),
		answer = new Vector(-6, -6, -6);

	deepEqual(v1.multiply(v2), answer, "Multiplication is good.")
});

test("Division", function() {
	var v1 = new Vector(2, 2, 2),
		v2 = new Vector(2, 2, 2),
		answer = new Vector(1, 1, 1);

	deepEqual(v1.divide(v2), answer, "Division is good.")
});

test("Dot Product", function() {
	var v1 = new Vector(2, 2, 2),
		v2 = new Vector(2, 2, 2),
		answer = 12;

	equal(v1.dot(v2), answer, "Dot product is good.")
});

test("Cross Product", function() {
	var v1 = new Vector(1, 2, 3),
		v2 = new Vector(3, 4, 5),
		answer = new Vector(-2, 4, -2);

	deepEqual(v1.cross(v2), answer, "Cross product is good.")
});

test("Normalized", function() {
	var v1 = new Vector(1, 2, 3),
		len = v1.length(),
		answer = new Vector(1 / len, 2 / len, 3 / len);

	deepEqual(v1.normalized(), answer, "Normalization is good.")
});


