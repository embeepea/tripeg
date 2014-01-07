Triangle Peg Puzzle
===================

This is a little program that I wrote just for fun to solve this triangle peg puzzle:

<p align="center">
  <img src="./puzzle.jpg?raw=true"/>
</p>

The goal of the puzzle is to remove pegs, one at a time, by jumping
one peg over another, ending with just one peg remaining.  This
program uses a depth first search of all possible moves to find a
sequence of moves that solves the puzzle.  It's written in JavaScript
and uses the HTML5 canvas element to animate the solution.  You can
see a working version of the program at http://www.geomtech.com/tripeg.

Files
-----

The code files are:

* [**tripeg-logic.js**](https://github.com/embeepea/tripeg/blob/master/tripeg-logic.js)

  Contains the structures and logic to solve the puzzle.  This file is self-contained,
  in the sense that it has no external dependencies and it does no graphics or DOM manipulation;
  it could be used verbatim to create a command-line program to print the solution; see
  the comments in the file for details.
  
* **tripeg-graphics.js**

  Contains code that uses the HTML5 canvas element to draw and animate the puzzle.
  
* **tripeg-ui.js**, **index.html**, and **tripeg.css**

  These files use [jQuery](http://jquery.com), [Twitter Bootstrap](http://getbootstrap.com),
  and *tripeg-graphics.js* to create a user
  interface for the puzzle in a browser window.  The button icons are from
  [Font Awesome](http://fontawesome.io/).

* **animator.js**

  A little utility that I wrote to help manage sequences of animations in the browser.
  
* **requestanimationframe.js**

  This is Paul Irish's [requestAnimationFrame polyfill](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating).
  The code in *animator.js* uses requestAnimationFrame to cause the
  browser to call custom drawing code on the next screen update.

* **spec/**

  This subdirectory contains a suite of [Jasmine](http://pivotal.github.io/jasmine/)
  unit tests for *tripeg-logic.js*; to run them, simply view *spec/index.html* file
  in a browser.
