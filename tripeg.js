(function($) {

  window.tripeg = {};
  var tripeg = window.tripeg;

  var N = 4;
  var numPegs = ( N * (N + 1) / 2 ) - 1;
  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 10; // ms delay between frames
  var stepsPerMove = 10; // number of steps per move
  var interMoveDelay = 1.5 * frameDelayMS * stepsPerMove;

  var hole = [3,1];

  var ctx;

  var interpf = 0.0;

  var colorNames = {
    'red' : '#FF0000',
    'blue' : '#0000FF',
    'yellow' : '#FFFF00'
  };

  function divvy(n,k) {
      // Return an array of k integers which sum to n.  Each integer in the list will be
      // equal to either n/k (integer division), or n/k + 1.
      var d = Math.floor(n/k),
          r = n % k,
          i,
          arr = [];
      for (i=0; i<k; ++i) {
          if (i<r) { arr.push(d+1); }
          else { arr.push(d); }
      }
      return arr;
  }


  function makeColors(N) {
    var colors = [];
    var numPegs = ( N * (N + 1) / 2 ) - 1;
    var clens = divvy(numPegs, 3);
    var i;
    for (i=0; i<clens[0]; ++i) { colors.push('red'); }
    for (i=0; i<clens[1]; ++i) { colors.push('blue'); }
    for (i=0; i<clens[2]; ++i) { colors.push('yellow'); }
    return colors;
  }

  var d = 2.5*50;
  var peg_radius = 2.5*18;
  var peg_radius_squared = peg_radius*peg_radius;
  var hole_radius = 2.5*8;
  var g = d - 2*peg_radius;
  var q = (d - peg_radius) / Math.tan(Math.PI/6);


  var frameno = 0;

  var triangle_side_length = 2*q + (N-1)*d;

  var canvas_height = 2 * pad + f * triangle_side_length;
  var canvas_width = 2 * pad + triangle_side_length;

  var peg_base = [pad + triangle_side_length/2, pad + q + g - 3];

  var triangle_vertices = [ [pad + triangle_side_length/2, pad],								// top vertex
                            [pad + triangle_side_length,   pad + f * triangle_side_length],     // lower right vertex
                            [pad,                          pad + f * triangle_side_length] ];   // lower left vertex

  tripeg.point_in_triangle = function(x, y) {
      // return true iff (x,y) is inside the game triangle, false otherwise
      // This function depends on the fact that the topmost vertex of the triangle
      // is the first point in the `triangle_vertices` array.
      if (y < triangle_vertices[0][1]) { return false; } // point is above triangle
      if (y > triangle_vertices[1][1]) { return false; } // point is below
      var f = (y - triangle_vertices[0][1]) / (triangle_vertices[1][1] - triangle_vertices[0][1]);
      var xcenter = pad + triangle_side_length/2;
      var xmin = xcenter - f * triangle_side_length/2;
      var xmax = xcenter + f * triangle_side_length/2;
      if (x < xmin || x > xmax) { return false; }
      return true;
  };

  function l2dist2(a,b) {
      var dx = a[0] - b[0];
      var dy = a[1] - b[1];
      return dx*dx + dy*dy;
  }

    tripeg.point_in_peg = function(x,y) {
        // return the position (as an array [x,y]) of the peg under the cursor, if any
        // return undefined if the cursor is not over a peg (including over an empty hole)
        var i,j, p;
        for (i=0; i<N; ++i) {
            p = peg_center(i,0);
            if (y >= p[1] - peg_radius && y <= p[1] + peg_radius) {
                for (j=0; j<=i; ++j) {
                    if (board.contains_peg(i,j)) {
                        p = peg_center(i,j);
                        if (x >= p[0] - peg_radius && x <= p[0] + peg_radius) {
                            if (l2dist2([x,y],p) < peg_radius_squared) {
                                return [i,j];
                            } else {
                                return undefined;
                            }
                        }
                    }
                }
                return undefined;
            }
        }
        return undefined;
    };

  var board;


  function linear_interpolate(f, a, b) {
    return a + f*(b - a);
  }


  var Position = tripeg_logic.Position;

  function Peg(color) {
    return {
      'moving'      : false,
      'dest_i'      : undefined,
      'dest_j'      : undefined,
      'interpf'     : undefined,
      'color'       : color,
      'highlighted' : false,
      'highlight'   : function (what) {
          if (what) {
              this.highlighted = true;
              var p = board.get_empty_position();
              this.dest_i = p[0];
              this.dest_j = p[1];
              //this.interpf = 1.0;
              //this.moving = true;
          } else {
              this.highlighted = false;
              //this.moving = false;
          }
      }
    };
  }

  function Board(N) {

      var board = tripeg_logic.Board(N);

     board.get_empty_position = function() {
         var i, j;
         for (i=0; i<N; ++i) {
             for (j=0; j<=i; ++j) {
                 if (!this.contains_peg(i,j)) { return [i,j]; }
             }
         }
         return undefined;
     };

     var highlight_opacity = 0.4;

      board.draw = function() {
        var i, j, peg,
            moving_peg_i = undefined, moving_peg_j = undefined;
        for (i=0; i<N; ++i) {
          for (j=0; j<=i; ++j) {
            peg = board.pegs[i][j];
            if (peg !== undefined) {
              if (peg.moving) {
                  moving_peg_i = i;
                  moving_peg_j = j;
              } else {
                  var color = peg.color;
                  if (peg.highlighted) {
                      color = toRGBA(color, 1.0 - highlight_opacity);
                      draw_disc(peg_center(peg.dest_i, peg.dest_j), peg_radius, {
                          'fillStyle'   : toRGBA(peg.color, highlight_opacity),
                          'strokeStyle' : '#000000',
                          'lineWidth'   : 3,
                      });
                  }
                  draw_disc(peg_center(i, j), peg_radius, {
                      'fillStyle'   : color,
                      'strokeStyle' : '#000000',
                      'lineWidth'   : 3,
                  });
              }
            }
          }
        }

        if (moving_peg_i !== undefined) {
            var peg = board.pegs[moving_peg_i][moving_peg_j];
            var c = peg_center(moving_peg_i, moving_peg_j);
            var dest_c = peg_center(peg.dest_i, peg.dest_j);
            c[0] = linear_interpolate(peg.interpf, c[0], dest_c[0]);
            c[1] = linear_interpolate(peg.interpf, c[1], dest_c[1]);
            draw_disc(c, peg_radius, {
                'fillStyle'   : peg.color,
                'strokeStyle' : '#000000',
                'lineWidth'   : 3,
            });
        }

      };

      return board;
  }

  function peg_center(i,j) {
    return [ peg_base[0] + j * d - i * d / 2,
             peg_base[1] + i * f * d ];
  }

  var toRGBA = function(hexString, alpha) {
     var i = 0,
         r, rHexString,
         g, gHexString,
         b, bHexString;
     if (alpha === undefined) {
         alpha = 1.0;
     }
     if (hexString.length == 7) { i = 1; }
     else if (hexString.length == 8) { i = 2; }
     rHexString = hexString.substring(i,i+2);
     gHexString = hexString.substring(i+2,i+4);
     bHexString = hexString.substring(i+4,i+6);
     r = parseInt(rHexString, 16);
     g = parseInt(gHexString, 16);
     b = parseInt(bHexString, 16);
     return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  function draw_disc(center, radius, options) {
    ctx.beginPath();
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    if (options && options.fillStyle !== undefined) {
        ctx.fillStyle = options.fillStyle;
    } else {
        ctx.fillStyle = '#000000'; // defaults to black
    }
    ctx.fill();
    if (options && options.lineWidth) {
        ctx.lineWidth = options.lineWidth;
        if (options && options.strokeStyle) {
            ctx.strokeStyle = options.strokeStyle;
        } else {
            ctx.strokeStyle = '#000000';
        }
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
  }

  function draw_polygon(vertices) {
    var i;
    ctx.beginPath();
    ctx.moveTo(vertices[0][0], vertices[0][1]);
    for (i=1; i<vertices.length; ++i) {
      ctx.lineTo(vertices[i][0], vertices[i][1]);
    }
    ctx.fill();
    ctx.closePath();
  }

  function draw() {
    var i, j;
/*
    ctx.fillStyle="#DDDDDD";
    ctx.fillRect(0,0,canvas_width,canvas_height);
*/
    ctx.fillStyle="#FBA16C";
    draw_polygon(triangle_vertices);

    // draw the holes
    for (i=0; i<N; ++i) {
      for (j=0; j<=i; ++j) {
          c = peg_center(i,j);
          draw_disc(c, hole_radius, {
              'fillStyle' : '#000000'
          });
      }
    }

    board.draw();

    $counter = $('#counter');
    ++frameno;

    $counter.text(frameno);
  }

    function Move(jumper, jumpee, dest) {
        var move = tripeg_logic.Move(jumper, jumpee, dest);
        move.begin = function() {
            this.moving_peg = board.pegs[jumper.i][jumper.j];
            this.moving_peg.moving = true;
            this.moving_peg.interpf = 0;
            this.moving_peg.dest_i  = dest.i;
            this.moving_peg.dest_j  = dest.j;
            this.step();
        };
        move.step = function(n) {
            var move = this;
            if (n === undefined) { n = 0; }
            if (n < stepsPerMove) {
                setTimeout(function() {
                    n += 1;
                    move.moving_peg.interpf = n / stepsPerMove;
                    requestAnimationFrame(function() {
                        draw();
                        move.step(n);
                    });
                }, frameDelayMS);
            } else {
                this.end();
            }
        };
        move.end = function() {
            this.moving_peg.moving = false;
            board.move(this);
            requestAnimationFrame(function() {
                draw();
                setTimeout(function() { nextMove() }, interMoveDelay);
            });
        };
        return move;
    }

  var moves = [];
  var move;

  function nextMove() {
    if (moves.length > 0) {
        //console.log('starting move with moves.length = ' + moves.length);
        move = moves.shift();
        move.begin();
    }
  }

  tripeg.request_draw = function() {
      requestAnimationFrame(function() { draw(); });
  };

  tripeg.reset = function() {
    board = Board(N);
    tripeg.board = board;

    var colors = makeColors(N);

      for (i=0; i<N; ++i) {
        for (j=0; j<=i; ++j) {
          if (i !== hole[0] || j !== hole[1]) {
              k = Math.floor(colors.length * Math.random())
              color = colorNames[ colors[k] ];
              colors.splice(k,1);
              board.insert_peg(i,j,Peg(color));
          }
        }
      }

    draw();
  };

  tripeg.play = function (donefunc) {


    var tmoves = board.solve().reverse();
    var i;

    for (i=0; i<tmoves.length; ++i) {
        var tm = tmoves[i];
        moves.push(Move(tm.jumper, tm.jumpee, tm.dest));
    }

    if (donefunc !== undefined) {
      moves.push({
          'begin' : donefunc
      });
    }

    nextMove();

  };

  $(document).ready(function() {

    $('#thecanvas').attr('width', canvas_width);
    $('#thecanvas').attr('height', canvas_height);
    ctx = $('#thecanvas')[0].getContext("2d");

    tripeg.reset();

  });

}(jQuery));
