(function($) {

  var N = 6;
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

  var colors = makeColors(N);

  var d = 2.5*50;
  var r = 2.5*18;
  var hole_radius = 2.5*8;
  var g = d - 2*r;
  var q = (d - r) / Math.tan(Math.PI/6);


  var frameno = 0;

  var triangle_side_length = 2*q + (N-1)*d;

  var canvas_height = 2 * pad + f * triangle_side_length;
  var canvas_width = 2 * pad + triangle_side_length;

  var peg_base = [pad + triangle_side_length/2, pad + q + g - 3];

  var triangle_vertices = [ [pad + triangle_side_length/2, pad],
                            [pad + triangle_side_length, pad + f * triangle_side_length],
                            [pad,  pad + f * triangle_side_length] ];

  var board;


  function linear_interpolate(f, a, b) {
    return a + f*(b - a);
  }


  var Position = tripeg_logic.Position;

  function Peg(color) {
    return {
      'moving' : false,
      'dest_i' : undefined,
      'dest_j' : undefined,
      'interpf' : undefined,
      'color' : color
    };
  }

  function Board(N) {

      var board = tripeg_logic.Board(N);

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
                  draw_peg(peg_center(i, j), r, peg.color);
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
            draw_peg(c, r, peg.color);
        }

      };

      return board;
  }

  function peg_center(i,j) {
    return [ peg_base[0] + j * d - i * d / 2,
             peg_base[1] + i * f * d ];
  }

  function draw_peg(center, radius, color) {
    ctx.beginPath();
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
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
    ctx.fillStyle="#DDDDDD";
    ctx.fillRect(0,0,canvas_width,canvas_height);
    ctx.fillStyle="#FBA16C";
    draw_polygon(triangle_vertices);

    // draw the holes
    for (i=0; i<N; ++i) {
      for (j=0; j<=i; ++j) {
          c = peg_center(i,j);
          draw_peg(c, hole_radius, "#000000");
      }
    }

    board.draw();

    $counter = $('#counter');
    ++frameno;

    $counter.text(frameno);
  }

  function Move(jumper, jumpee, dest) {
    var move = tripeg_logic.Move(jumper, jumpee, dest);
    move.pre = function() {
        var peg = board.pegs[jumper.i][jumper.j];
        peg.moving = true;
        peg.interpf = 0;
        peg.dest_i  = dest.i;
        peg.dest_j  = dest.j;
    };
    move.step = function(n) {
        var move = this;
        if (n === undefined) { n = 0; }
        if (n < stepsPerMove) {
          setTimeout(function() {
            n += 1;
            board.pegs[jumper.i][jumper.j].interpf = n / stepsPerMove;
            requestAnimationFrame(function() {
              draw();
              move.step(n);
            });
          }, frameDelayMS);
        } else {
          finishMove();
        }
    };
    move.post = function() {
        var peg = board.pegs[jumper.i][jumper.j];
        peg.moving = false;
        board.move(this);
        requestAnimationFrame(function() { draw(); });
      };
      return move;
  }

  var moves = [];
  var move;

  function startMove() {
    if (moves.length > 0) {
        console.log('starting move with moves.length = ' + moves.length);
        move = moves.shift();
        move.pre();
        move.step();
    }
  }
  function finishMove() {
      move.post();
      setTimeout(function() { startMove() }, interMoveDelay);
  }

  $(document).ready(function() {

    $('#thecanvas').attr('width', canvas_width);
    $('#thecanvas').attr('height', canvas_height);
    ctx = $('#thecanvas')[0].getContext("2d");


    board = Board(N);

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

    var tmoves = board.solve().reverse();
    var i;

    for (i=0; i<tmoves.length; ++i) {
        var tm = tmoves[i];
        moves.push(Move(tm.jumper, tm.jumpee, tm.dest));
    }

    startMove();
  });

}(jQuery));
