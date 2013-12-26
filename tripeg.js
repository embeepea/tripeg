(function($) {

  var N = 5;
  var f = 0.8660254037844386;
  var pad = 15;
  var frameDelayMS = 25; // ms delay between frames
  var stepsPerMove = 20; // number of steps per move

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

  var pegs = [];

  var hole = [0,0];

  function linear_interpolate(f, a, b) {
    return a + f*(b - a);
  }

  function Peg(i,j, color) {
    return {
      'i' : i,
      'j' : j,
      'color' : color,
      'draw' : function(ctx, dest_i, dest_j, factor) {
        var c = peg_center(this.i, this.j);
        if (factor !== undefined) {
          var dest_c = peg_center(dest_i, dest_j);
          c[0] = linear_interpolate(factor, c[0], dest_c[0]);
          c[1] = linear_interpolate(factor, c[1], dest_c[1]);
        }
        draw_peg(ctx, c, r, this.color);
      }
    };
  }

  function peg_center(i,j) {
    return [ peg_base[0] + j * d - i * d / 2,
             peg_base[1] + i * f * d ];
  }

  function draw_peg(ctx, center, radius, color) {
    ctx.beginPath();
    ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }

  function draw_polygon(ctx, vertices) {
    var i;
    ctx.beginPath();
    ctx.moveTo(vertices[0][0], vertices[0][1]);
    for (i=1; i<vertices.length; ++i) {
      ctx.lineTo(vertices[i][0], vertices[i][1]);
    }
    ctx.fill();
    ctx.closePath();
  }

  function draw(ctx) {
    var i, j;
    ctx.fillStyle="#DDDDDD";
    ctx.fillRect(0,0,canvas_width,canvas_height);
    ctx.fillStyle="#FBA16C";
    draw_polygon(ctx, triangle_vertices);

    // draw the holes
    for (i=0; i<N; ++i) {
      for (j=0; j<=i; ++j) {
          c = peg_center(i,j);
          draw_peg(ctx, c, 8, "#000000");
      }
    }

    // draw the pegs
    k = undefined
    for (i=0; i<pegs.length; ++i) {
      if (pegs[i].i == 2 && pegs[i].j == 0) {
        k = i;
      } else {
        pegs[i].draw(ctx);
      }
    } 
   pegs[k].draw(ctx, 0, 0, interpf);

    $counter = $('#counter');
    ++frameno;

    $counter.text(frameno);
  }

  function domove(ctx, n) {
    if (n === undefined) { n = 0; }
    if (n < stepsPerMove) {
      setTimeout(function() {
        n += 1;
        interpf = n / stepsPerMove
        requestAnimationFrame(function() {
          draw(ctx);
          domove(ctx, n);
        })
      }, frameDelayMS);
    }
  }

  $(document).ready(function() {

    // create the pegs
    for (i=0; i<N; ++i) {
      for (j=0; j<=i; ++j) {
        if (i !== hole[0] || j !== hole[1]) {
          k = Math.floor(colors.length * Math.random())
          color = colorNames[ colors[k] ];
          colors.splice(k,1);
          pegs.push( Peg(i,j,color) );
        }
      }
    }

    var ctx = $('#thecanvas').attr('width', canvas_width);
    var ctx = $('#thecanvas').attr('height', canvas_height);
    var ctx = $('#thecanvas')[0].getContext("2d");

    draw(ctx);
    domove(ctx);
  });

}(jQuery));
