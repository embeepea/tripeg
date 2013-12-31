(function($) {

  var N = 5;
  var numPegs = ( N * (N + 1) / 2 ) - 1;
  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 10; // ms delay between frames
  var stepsPerMove = 20; // number of steps per move
  var interMoveDelay = 1.5 * frameDelayMS * stepsPerMove;

  var hole = [1,0];

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

  function Position(i,j) {
    return {
      'i' : i,
      'j' : j
    }
  }

  function Peg(i,j, color) {
    return {
      'i' : i,
      'j' : j,
      'moving' : false,
      'dest_i' : undefined,
      'dest_j' : undefined,
      'interpf' : undefined,
      'color' : color,
      'draw' : function() {
        var c = peg_center(this.i, this.j);
        if (this.moving) {
          var dest_c = peg_center(this.dest_i, this.dest_j);
          c[0] = linear_interpolate(this.interpf, c[0], dest_c[0]);
          c[1] = linear_interpolate(this.interpf, c[1], dest_c[1]);
        }
        draw_peg(c, r, this.color);
      }
    };
  }

  function Board(pegs) {

    var row;
    if (pegs === undefined) {
      pegs = [];
      for (i=0; i<N; ++i) {
        row = [];
        for (j=0; j<=i; ++j) {
          if (i !== hole[0] || j !== hole[1]) {
            k = Math.floor(colors.length * Math.random())
            color = colorNames[ colors[k] ];
            colors.splice(k,1);
            row.push( Peg(i,j,color) );
          }
        }
        pegs.push(row);
      }
    }

    return {
      'pegs' : pegs,

      'draw' : function() {
        var i, j, peg,
            moving_peg = undefined;
        for (i=0; i<N; ++i) {
          for (j=0; j<=i; ++j) {
            peg = pegs[i][j];
            if (peg !== undefined) {
              if (peg.moving) {
                moving_peg = peg;
              } else {
                peg.draw();
              }
            }
          }
        }
        if (moving_peg !== undefined) {
          moving_peg.draw(moving_peg.dest_i, moving_peg.dest_j, moving_peg.interpf);
        }
      }

    };

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
    ctx.lineWidth = 2;
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
    return {
      'toString' : function() {
          return '(' + jumper.i + ',' + jumper.j + ') -> (' + jumpee.i + ',' + jumpee.j + ') -> (' + dest.i + ',' + dest.j +  ')';
      },
      'jumper' : jumper,
      'jumpee' : jumpee,
      'dest' : dest,
      'pre' : function() {
        board.pegs[jumper.i][jumper.j].moving  = 1;
        board.pegs[jumper.i][jumper.j].interpf = 0;
        board.pegs[jumper.i][jumper.j].dest_i  = dest.i;
        board.pegs[jumper.i][jumper.j].dest_j  = dest.j;
      },
      'step' : function(n) {
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
      },
      'post' : function() {
        var peg = board.pegs[jumper.i][jumper.j];
        peg.moving = false;
        peg.i = peg.dest_i;
        peg.j = peg.dest_j;
        board.pegs[dest.i][dest.j] = peg;
        board.pegs[jumper.i][jumper.j] = undefined;
        board.pegs[jumpee.i][jumpee.j] = undefined;
        requestAnimationFrame(function() { draw(); });
      }
    }
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

    board = Board();

    $('#thecanvas').attr('width', canvas_width);
    $('#thecanvas').attr('height', canvas_height);
    ctx = $('#thecanvas')[0].getContext("2d");

    draw();

    var b = tripeg_logic.Board(N);
    b.insert_peg_everywhere_except(hole[0],hole[1],1);
    var tmoves = b.solve().reverse();
    var i;

    for (i=0; i<tmoves.length; ++i) {
        var tm = tmoves[i];
        var m = Move(Position(tm.jumper.i,tm.jumper.j),
                     Position(tm.jumpee.i,tm.jumpee.j),
                     Position(tm.dest.i,tm.dest.j));
        moves.push(m);
    }

    startMove();
  });

}(jQuery));
