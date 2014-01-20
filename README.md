Triangle Peg Solitaire
======================

This is a program that I wrote just for kicks to solve triangle peg solitaire:

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

* [**src/tripeg-logic.js**](https://github.com/embeepea/tripeg/blob/master/src/tripeg-logic.js)

  Contains the structures and logic to solve the puzzle.  This file is self-contained,
  in the sense that it has no external dependencies and it does no graphics or DOM manipulation;
  it could be used verbatim to create a command-line program to print the solution; see
  the comments in the file for details.
  
* [**src/tripeg-graphics.js**](https://github.com/embeepea/tripeg/blob/master/src/tripeg-graphics.js)

  Contains code that uses the HTML5 canvas element to draw and animate the puzzle.
  
* [**src/tripeg-ui.js**](https://github.com/embeepea/tripeg/blob/master/src/tripeg-ui.js),
  [**index.html**](https://github.com/embeepea/tripeg/blob/master/index.html), and
  [**tripeg.css**](https://github.com/embeepea/tripeg/blob/master/tripeg.css)

  These files use [jQuery](http://jquery.com), [Twitter Bootstrap](http://getbootstrap.com),
  and *tripeg-graphics.js* to create a user
  interface for the puzzle in a browser window.  The button icons are from
  [Font Awesome](http://fontawesome.io/).

* [**src/animator.js**](https://github.com/embeepea/tripeg/blob/master/src/animator.js)

  A little utility that I wrote to help manage sequences of animations in the browser.
  
* [**src/requestanimationframe.js**](https://github.com/embeepea/tripeg/blob/master/requestanimationframe.js)

  This is Paul Irish's [requestAnimationFrame polyfill](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating).
  The code in *animator.js* uses requestAnimationFrame to cause the
  browser to call custom drawing code on the next screen update.

* [**spec/**](https://github.com/embeepea/tripeg/blob/master/spec)

  This subdirectory contains a suite of [Jasmine](http://pivotal.github.io/jasmine/)
  unit tests for *tripeg-logic.js*; to run them:
  
    ```
    install nodejs (and npm, if it wasn't automatically installed with nodejs)
    npm install
    npm install -g grunt-cli
    grunt test
    ```

* [**tripeg.js**](https://github.com/embeepea/tripeg/blob/master/tripeg.js)

  This is the final minified JS file for use in a browser.  This file is not
  human-readable, at least not by normal humans.  Read the above files instead.

