(function($) {

  var N = 5;
  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 25; // ms delay between frames
  var stepsPerMove = 20; // number of steps per move

  var ctx;

  var interpf = 0.0;

  var colorNames = {
    'red' : '#FF0000',
    'blue' : '#0000FF',
    'yellow' : '#FFFF00'
  };

  colors = ['yellow', 'yellow', 'yellow', 'yellow',
            'red', 'red', 'red', 'red', 'red',
            'blue', 'blue', 'blue', 'blue', 'blue'];

  var d = 50;
  var r = 18;
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

  var hole = [0,0];

  function linear_interpolate(f, a, b) {
    return a + f*(b - a);
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

  function Board() {
    var pegs = []
    var row;
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
          draw_peg(c, 8, "#000000");
      }
    }

    board.draw();

    $counter = $('#counter');
    ++frameno;

    $counter.text(frameno);
  }

  function Move(i,j, dest_i, dest_j) {
    return {
      'pre' : function() {
        board.pegs[i][j].moving  = 1;
        board.pegs[i][j].interpf = 0;
        board.pegs[i][j].dest_i  = dest_i;
        board.pegs[i][j].dest_j  = dest_j;
      },
      'step' : function(n) {
        var move = this;
        if (n === undefined) { n = 0; }
        if (n < stepsPerMove) {
          setTimeout(function() {
            n += 1;
            board.pegs[i][j].interpf = n / stepsPerMove
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
        board.pegs[i][j].moving = false;
        board.pegs[i][j].i = board.pegs[i][j].dest_i;
        board.pegs[i][j].j = board.pegs[i][j].dest_j;
      }
    }
  }

  var moves = [];
  var move;

  function startMove() {
    if (moves.length > 0) {
      move = moves.shift();
      move.pre();
      move.step();
    }
  }
  function finishMove() {
    move.post();
    startMove();
  }

  function domove(n) {
    if (n === undefined) { n = 0; }
    if (n < stepsPerMove) {
      setTimeout(function() {
        n += 1;
        board.pegs[2][0].interpf = n / stepsPerMove
        requestAnimationFrame(function() {
          draw();
          domove(n);
        });
      }, frameDelayMS);
    } else {
      board.pegs[2][0].moving = false;
    }
  }

  $(document).ready(function() {

    board = Board();

    $('#thecanvas').attr('width', canvas_width);
    $('#thecanvas').attr('height', canvas_height);
    ctx = $('#thecanvas')[0].getContext("2d");

    moves.push(Move(2,0, 0,0));
    moves.push(Move(4,0, 2,0));
    moves.push(Move(4,2, 4,0));
    draw();
    startMove();
  });

}(jQuery));
