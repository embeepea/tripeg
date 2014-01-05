(function($) {

  window.tripeg = {};
  var tripeg = window.tripeg;

  var N,
      numPegs,
      triangle_side_length,
      canvas_height,
      canvas_width,
      peg_base,
      triangle_vertices;

  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 10; // ms delay between frames
  var stepsPerMove = 10; // number of steps per move
  var interMoveDelay = 1.5 * frameDelayMS * stepsPerMove;

  var hole;

  var ctx;

  var scaleFactor = 2.0;
  var d = scaleFactor*50;
  var peg_radius = scaleFactor*18;
  var peg_radius_squared = peg_radius*peg_radius;
  var hole_radius = scaleFactor*8;
  var g = d - 2*peg_radius;
  var q = (d - peg_radius) / Math.tan(Math.PI/6);

  var board;
  var Position = tripeg_logic.Position;

  var moves = [];
  var move;
  var colors;

  function set_N(n) {
      N = n;
      hole = Position(0,0);
      numPegs = ( N * (N + 1) / 2 ) - 1;
      triangle_side_length = 2*q + (N-1)*d;
      canvas_height = 2 * pad + f * triangle_side_length;
      canvas_width = 2 * pad + triangle_side_length;
      peg_base = [pad + triangle_side_length/2, pad + q + g - 3];
      triangle_vertices = [ [pad + triangle_side_length/2, pad],								// top vertex
                            [pad + triangle_side_length,   pad + f * triangle_side_length],     // lower right vertex
                            [pad,                          pad + f * triangle_side_length] ];   // lower left vertex
      $('#thecanvas').attr('width', canvas_width);
      $('#thecanvas').attr('height', canvas_height);
      ctx = $('#thecanvas')[0].getContext("2d");
      $('#container').css('width', (triangle_side_length + 2*pad) + 'px');
      colors = makeColors(N);
      tripeg.reset();
  }
  tripeg.set_N = set_N;

  tripeg.get_N = function() {
    return N;
  }

  function divvy(n,k) {
      // Return an array of k integers which sum to n.  The array will consist of
      // r copies of q+1, followed by k-r copies of q, where q=n/k (integer division),
      // and r = n % k.
      var q = Math.floor(n/k),
          r = n % k,
          i,
          arr = [];
      for (i=0; i<k; ++i) {
          if (i<r) { arr.push(q+1); }
          else { arr.push(q); }
      }
      return arr;
  }


  function makeColors(N) {
    var colors = [];
    var numPegs = ( N * (N + 1) / 2 ) - 1;
    var clens = divvy(numPegs, 3);
    var i, k;
    for (i=0; i<clens[0]; ++i) { colors.push('#FF0000'); } // red
    for (i=0; i<clens[1]; ++i) { colors.push('#0000FF'); } // blue
    for (i=0; i<clens[2]; ++i) { colors.push('#FFFF00'); } // yellow
    var random_colors = [];
    for (i=0; i<numPegs; ++i) {
        k = Math.floor(colors.length * Math.random())
        random_colors.push(colors[k]);
        colors.splice(k,1);
    }
    return random_colors;
  }

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

    tripeg.peg_position_under_point = function(x,y) {
        // return the Position of the peg under the cursor, if any
        // return undefined if the cursor is not over a peg (including over an empty hole)
        var i,j, c, p;
        for (i=0; i<N; ++i) {
            c = peg_center(Position(i,0));
            if (y >= c[1] - peg_radius && y <= c[1] + peg_radius) {
                for (j=0; j<=i; ++j) {
                    p = Position(i,j);
                    if (board.contains_peg(p)) {
                        c = peg_center(p);
                        if (x >= c[0] - peg_radius && x <= c[0] + peg_radius) {
                            if (l2dist2([x,y],c) < peg_radius_squared) {
                                return p;
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

  function linear_interpolate(f, a, b) {
    return a + f*(b - a);
  }


    var Peg = function (color) {
        obj = {}
        obj.moving      = false;
        obj.dest        = undefined;
        obj.interpf     = undefined;
        obj.color       = color;
        obj.highlighted = false;
        obj.highlight   = function (do_highlight) {
            if (do_highlight) {
                this.highlighted = true;
                this.dest = board.get_empty_position();
            } else {
                this.highlighted = false;
            }
        };
        return obj;
    };

    var Board = function(N) {

      var obj = tripeg_logic.BoardContext(N).create_board();

      obj.get_empty_position = function() {
         var i, j, p;
         for (i=0; i<N; ++i) {
             for (j=0; j<=i; ++j) {
                 var p = Position(i,j);
                 if (!this.contains_peg(p)) { return p; }
             }
         }
         return undefined;
     };

     var highlight_fraction = 0.1;

      obj.draw = function() {
          var i, j, peg,
          moving_peg_pos = undefined;
          this.each_position(function(p) {
              peg = obj.pegs[p.i][p.j];
              if (peg !== undefined) {
                  if (peg.moving) {
                      moving_peg_pos = p;
                  } else {
                      var color = peg.color;
                      if (peg.highlighted) {
                          draw_displaced_disc(peg_center(p),
                                              peg_radius,
                                              peg_center(peg.dest),
                                              highlight_fraction,
                                              {
                                                  'fillStyle'   : peg.color,
                                                  'strokeStyle' : '#000000',
                                                  'lineWidth'   : 3,
                                              });
                      } else {
                          draw_disc(peg_center(p), peg_radius, {
                              'fillStyle'   : color,
                              'strokeStyle' : '#000000',
                              'lineWidth'   : 3,
                          });
                      }
                  }
              }
          });
          if (moving_peg_pos !== undefined) {
              var peg = obj.pegs[moving_peg_pos.i][moving_peg_pos.j];
              draw_displaced_disc(peg_center(moving_peg_pos),
                                  peg_radius,
                                  peg_center(peg.dest),
                                  peg.interpf,
                                  {
                                      'fillStyle'   : peg.color,
                                      'strokeStyle' : '#000000',
                                      'lineWidth'   : 3,
                                  });
          }

      };

      return obj;
  }

  function peg_center(p) {
    return [ peg_base[0] + p.j * d - p.i * d / 2,
             peg_base[1] + p.i * f * d ];
  }

  function draw_displaced_disc(center, radius, dest, fraction, options) {
      var c = [ linear_interpolate(fraction, center[0], dest[0]),
                linear_interpolate(fraction, center[1], dest[1]) ]
      draw_disc(c, radius, options);
  }

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
    ctx.fillStyle="#FBA16C";
    draw_polygon(triangle_vertices);

    // draw the holes
      board.each_position(function(p) {
          c = peg_center(p);
          draw_disc(c, hole_radius, {
              'fillStyle' : '#000000'
          });
      });

    board.draw();
  }

  tripeg.moveToEmpty = function(p) {
      hole = p;
      moves.push(AnimationMove(Move(p, undefined, board.get_empty_position())));
      nextMove();
  };

    var Move = tripeg.Move = function(jumper, jumpee, dest) {
        var obj = tripeg_logic.Move(jumper, jumpee, dest);
        obj.begin = function() {
            this.moving_peg = board.pegs[jumper.i][jumper.j];
            this.moving_peg.moving = true;
            this.moving_peg.interpf = 0;
            this.moving_peg.dest  = dest;
        };
        var n = 0;
        obj.step = function() {
            if (n < stepsPerMove) {
                n += 1;
                obj.moving_peg.interpf = n / stepsPerMove;
                return false;
            }
            return true;
        };
        obj.end = function() {
            this.moving_peg.moving = false;
            board.move(this);
        };
        return obj;
    };

    var AnimationMove = tripeg.AnimationMove = function(move) {
        var obj = {};
        obj.begin = function() {
            move.begin();
            obj.step();
        };
        obj.step = function() {
            var done = (move.step === undefined) || move.step();
            if (done) {
                obj.end();
            } else {
                setTimeout(function() {
                    requestAnimationFrame(function() {
                        draw();
                        obj.step();
                    });
                }, frameDelayMS);
            }
        };
        obj.end = function() {
            if (move.end !== undefined) {
                move.end();
            }
            requestAnimationFrame(function() {
                draw();
                setTimeout(function() { nextMove() }, interMoveDelay);
            });
        };
        return obj;
    };

  function nextMove() {
    if (moves.length > 0) {
        //console.log('starting move with moves.length = ' + moves.length);
        move = moves.shift();
        move.begin();
    }
  }

  tripeg.moves = moves;
  tripeg.nextMove = nextMove();

  tripeg.request_draw = function() {
      requestAnimationFrame(function() { draw(); });
  };

  tripeg.reset = function() {
    board = Board(N);
    tripeg.board = board;

    var k=0;
      board.each_position(function(p) {
          if (p.i !== hole.i || p.j !== hole.j) {
              board.insert_peg(p,Peg(colors[k++]));
          }
        });

    draw();
  };

  tripeg.play = function (donefunc, nosolutionfunc, timelogfunc) {

    var i,
        tmoves,
        t0;

    t0 = (new Date()).getTime();
    tmoves = board.solve();
    if (timelogfunc !== undefined) {
        timelogfunc((new Date()).getTime() - t0);
    }

    if (tmoves === undefined) {
        nosolutionfunc();
        return;
    }
    tmoves = tmoves.reverse();

    for (i=0; i<tmoves.length; ++i) {
        var tm = tmoves[i];
        moves.push(AnimationMove(Move(tm.jumper, tm.jumpee, tm.dest)));
    }

    if (donefunc !== undefined) {
      moves.push({
          'begin' : donefunc
      });
    }

    nextMove();

  };

  $(document).ready(function() {
    set_N(5);
  });

}(jQuery));
