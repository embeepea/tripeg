(function($) {

  var N = 5;
  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 10; // ms delay between frames
  var stepsPerMove = 10; // number of steps per move

  var ctx;

  var interpf = 0.0;

  var colorNames = {
    'red' : '#FF0000',
    'blue' : '#0000FF',
    'yellow' : '#FFFF00'
  };

  function makeColors(N) {
    var colors = [];
    var numPegs = ( N * (N + 1) / 2 ) - 1;
    var n = Math.floor(numPegs / 3);
    var i;
  
    for (i=0; i<n; ++i) { colors.push('yellow'); }
  
    numPegs = numPegs - n;
    n = Math.floor(numPegs / 2);
    for (i=0; i<n; ++i) { colors.push('blue'); }
  
    numPegs = numPegs - n;
    for (i=0; i<numPegs; ++i) { colors.push('red'); }
    return colors;
  }

  var colors = makeColors(N);

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

  function Direction(i,j) {
    return {
      'i' : i,
      'j' : j,
      'times' : function(f) {
        return Direction(this.i * f, this.j * f);
      }
    };
  }

  function Position(i,j) {
    return {
      'i' : i,
      'j' : j,
      'add' : function(direction) {
        return Position(this.i + direction.i, this.j + direction.j);
      },
      'is_valid' : function() {
        return (this.i < N && this.j <= this.i);
      },
      'possible_moves' : function() {
         var moves = [],
             i, dir, dest;
         for (i=0; i<six_directions.length; ++i) {
           dir = six_directions[i];
           dest = this.add(dir.times(2));
           if (dest.is_valid()) {
             moves.push(Move(this, this.add(dir), dest));
           }
         }
         return moves;
      }
    }
  }

  var six_directions = [
    Direction(0,1),
    Direction(-1,0),
    Direction(-1,-1),
    Direction(0.-1),
    Direction(1,0),
    Direction(1,1)
  ];

  function Peg(i,j, color) {
    return {
      'i' : i,
      'j' : j,
      'moving' : false,
      'dest_i' : undefined,
      'dest_j' : undefined,
      'interpf' : undefined,
      'color' : color,
      'clone' : function() {
        return Peg(this.i, this.j, this.color);
      },
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

      'move' : function(move) {
        this.pegs[move.dest.i][move.dest.j] = this.pegs[move.jumper.i][move.jumper.j]
        this.pegs[move.jumper.i][move.jumper.j] = undefined;
        this.pegs[move.jumpee.i][move.jumpee.j] = undefined;
      },

      'clone' : function(board) {
        var pegs = [], i, j;
        for (i=0; i<N; ++i) {
          pegs[i] = [];
          for (j=0; j<=i; ++j) {
            if (board.pegs[i][j] !== undefined) {
              pegs[i].push( board.pegs[i][j].clone() );
            } else {
              pegs[i].push( undefined );
            }
          }
        }
        return Board(pegs);
      },

      'containsPegInPosition' : function(position) {
        reutrn (this.pegs[position.i][position.j] !== undefined);
      },

      'move_allowed' : function(move) {
        return (this.containsPegInPosition(move.jumper) &&
                this.containsPegInPosition(move.jumpee) &&
                !this.containsPegInPosition(move.destination));
      },

      'possible_moves' : function() {
        var moves = [],
            i, j;
        for (i=0; i<N; ++i) {
          for (j=0; j<=i; ++j) {
            var moves_this_pos = Position(i,j).possible_moves();
            for (k=0; k<moves_this_pos.length; ++k) {
              if (this.move_allowed(moves_this_pos[k])) {
                moves.push(moves_this_pos[k]);
              }
            }
          }
        }
        
      },

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

  function Move(jumper, jumpee, dest) {
    return {
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
        peg.i = board.pegs[jumper.i][jumper.j].dest_i;
        peg.j = board.pegs[jumper.i][jumper.j].dest_j;
        board.pegs[dest.i][dest.j] = peg;
        board.pegs[jumpee.i][jumpee.j] = undefined;
        requestAnimationFrame(function() { draw(); });
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

  $(document).ready(function() {

    board = Board();

    $('#thecanvas').attr('width', canvas_width);
    $('#thecanvas').attr('height', canvas_height);
    ctx = $('#thecanvas')[0].getContext("2d");

    moves.push(Move(Position(2,0), Position(1,0), Position(0,0)));
    moves.push(Move(Position(4,0), Position(3,0), Position(2,0)));
    moves.push(Move(Position(4,2), Position(4,1), Position(4,0)));
    moves.push(Move(Position(4,4), Position(4,3), Position(4,2)));
    moves.push(Move(Position(2,2), Position(3,3), Position(4,4)));
    moves.push(Move(Position(0,0), Position(1,1), Position(2,2)));
    moves.push(Move(Position(2,1), Position(3,2), Position(4,3)));
    moves.push(Move(Position(4,3), Position(4,2), Position(4,1)));
    moves.push(Move(Position(2,0), Position(3,1), Position(4,2)));
    draw();
    startMove();
  });

}(jQuery));
