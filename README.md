Triangle Peg Puzzle
===================

This is a little program that I wrote just for fun to solve the triangle peg puzzle:

<p align="center">
  <img src="./puzzle.jpg?raw=true"/>
</p>

The goal of the puzzle is to remove pegs, one at a time, by jumping
one peg over another, ending with just one peg remaining.  This
program uses a depth first search of all possible moves to find a
sequence of moves that solves the puzzle.  It's written in JavaScript
and uses the HTML5 canvas element to animate the solution.  You can
see a working version of the program
[here](http://www.geomtech.com/tripeg).

Files
-----

The code files are:

tripeg-logic.js

tripeg-graphics.js

tripeg-ui.js
index.html
tripeg.css

animator.js
jasmine
jquery.min.js
puzzle.jpg
requestanimationframe.js
test.html
test.js
