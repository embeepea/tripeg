/* This file defines a single function, tripeg_graphics.Tripeg, which
 * returns an object that can draw and animate the triangle peg puzzle
 * in an HTML5 canvas element:
 *
 *    var tripeg_graphics = tripeg_graphics.Tripeg(canvasContext)
 *
 * canvasContext should be the 2d context object associated with a
 * canvas element.  This file does not depend on jQuery or do any DOM
 * manipulation; the returned tripeg_graphics object simply contains
 * methods for doing the drawing and animation.
 *
 * This file uses tripeg-logic.js, which must be loaded before this
 * one.
 */
(function() {

    var tripeg_graphics = window.tripeg_graphics = {};
    var tripeg_logic = window.tripeg_logic;
    var Position = tripeg_logic.Position;

    function divvy(n,k) {
        // Utility function to return an array of k integers which sum
        // to n.  The array will consist of r copies of q+1, followed
        // by k-r copies of q, where q=n/k (integer division), and
        // r = n % k.
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

    function makeColors(n) {
        var colors = [];
        var clens = divvy(n, 3);
        var i, k;
        for (i=0; i<clens[0]; ++i) { colors.push('#FF0000'); } // red
        for (i=0; i<clens[1]; ++i) { colors.push('#0000FF'); } // blue
        for (i=0; i<clens[2]; ++i) { colors.push('#FFFF00'); } // yellow
        var random_colors = [];
        for (i=0; i<n; ++i) {
            k = Math.floor(colors.length * Math.random())
            random_colors.push(colors[k]);
            colors.splice(k,1);
        }
        return random_colors;
    }

    function l2dist2(a,b) {
        var dx = a[0] - b[0];
        var dy = a[1] - b[1];
        return dx*dx + dy*dy;
    }

    function linear_interpolate(f, a, b) {
        return a + f*(b - a);
    }

    var Peg = function (color) {
        obj = {};
        obj.moving      = false;
        obj.dest        = undefined;
        obj.interpf     = undefined;
        obj.color       = color;
        obj.highlighted = false;
        obj.highlight   = function (do_highlight, dest) {
            if (do_highlight) {
                this.highlighted = true;
                this.dest = dest;
            } else {
                this.highlighted = false;
            }
        };
        return obj;
    };

    tripeg_graphics.Tripeg = function(canvasContext, N) {

        var numRows,
            board,
            hole,
            triangle_side_length,
            peg_base,
            triangle_vertices,
            colors,
            animator,
            ctx                    = canvasContext,
            pad                    = 0, // (pixels, padding around triangle in canvas)
            sqrt3halves            = Math.sqrt(3)/2,
            scaleFactor            = 2.0, // changes relative size of everything
            distance_between_holes = scaleFactor*50, // pixels
            peg_radius             = scaleFactor*18, // pixels
            peg_radius_squared     = peg_radius*peg_radius,
            hole_radius            = scaleFactor*8,  // pixels
            gap_between_pegs       = distance_between_holes - 2*peg_radius,
            cornerPad              = (distance_between_holes - peg_radius) / Math.tan(Math.PI/6),
            frameDelayMS           = 10, // ms delay between frames
            stepsPerMove           = 10, // number of animation steps per move
            delayBetweenMovesMS    = 1.5 * frameDelayMS * stepsPerMove;

        function peg_center(p) {
            return [ peg_base[0] + p.j * distance_between_holes - p.i * distance_between_holes / 2,
                     peg_base[1] + p.i * sqrt3halves * distance_between_holes ];
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
            var highlight_fraction = 0.1,
            i, j, peg, moving_peg_pos;

            //
            // draw the background
            //
            ctx.fillStyle="#FBA16C";
            draw_polygon(triangle_vertices);

            //
            // draw the holes
            //
            board.each_position(function(p) {
                c = peg_center(p);
                draw_disc(c, hole_radius, {
                    'fillStyle' : '#000000'
                });
            });

            //
            // draw the pegs
            //
            moving_peg_pos = undefined;
            board.each_position(function(p) {
                peg = board.pegs[p.i][p.j];
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
                var peg = board.pegs[moving_peg_pos.i][moving_peg_pos.j];
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


        }

        obj = {};

        obj.set_rows = function(N) {
            numRows = N;
            hole = Position(0,0);
            triangle_side_length = 2*cornerPad + (numRows-1)*distance_between_holes;
            this.canvas_height = 2 * pad + sqrt3halves * triangle_side_length;
            this.canvas_width = 2 * pad + triangle_side_length;
            peg_base = [pad + triangle_side_length/2,
                        pad + cornerPad + gap_between_pegs - 6];
            triangle_vertices = [
                [pad + triangle_side_length/2, pad],								        // top
                [pad + triangle_side_length,   pad + sqrt3halves * triangle_side_length],   // lower right
                [pad,                          pad + sqrt3halves * triangle_side_length]    // lower left
            ];
            colors = makeColors(tripeg_logic.BoardContext(numRows).num_slots()-1);
        };

        obj.get_rows = function() {
            return numRows;
        };

        obj.reset = function() {
            board = tripeg_logic.Board(numRows);
            var k=0;
            board.each_position(function(p) {
                if (p.i !== hole.i || p.j !== hole.j) {
                    board.insert_peg(p,Peg(colors[k++]));
                }
            });
            draw();
        };

        obj.Move = function(jumper, jumpee, dest) {
            var move = tripeg_logic.Move(jumper, jumpee, dest);
            move.begin = function() {
                this.moving_peg = board.pegs[jumper.i][jumper.j];
                this.moving_peg.moving = true;
                this.moving_peg.interpf = 0;
                this.moving_peg.dest  = dest;
            };
            var n = 0;
            move.step = function() {
                if (n < stepsPerMove) {
                    n += 1;
                    move.moving_peg.interpf = n / stepsPerMove;
                    return false;
                }
                return true;
            };
            move.end = function() {
                this.moving_peg.moving = false;
                board = board.move(this);
            };
            return move;
        };

        obj.point_in_triangle = function(x, y) {
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
        
        obj.peg_position_under_point = function(x,y) {
            // return the Position of the peg under the cursor, if any
            // return undefined if the cursor is not over a peg (including over an empty hole)
            var i,j, c, p;
            for (i=0; i<numRows; ++i) {
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

        obj.moveToEmpty = function(p) {
            hole = p;
            animator.add_action(this.Move(p, undefined, board.get_empty_position()));
            animator.play();
        };

        obj.request_draw = function() {
            animator.request_draw();
        };

        obj.get_peg = function(p) {
            return board.get_peg(p);
        };

        obj.get_empty_position = function(p) {
            return board.get_empty_position(p);
        };

        obj.play = function (donefunc, nosolutionfunc, timelogfunc) {
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
            for (i=0; i<tmoves.length; ++i) {
                var tm = tmoves[i];
                animator.add_action(this.Move(tm.jumper, tm.jumpee, tm.dest));
            }
            if (donefunc !== undefined) {
                animator.add_action({
                    'begin' : donefunc
                });
            }
            animator.play();
        };

        obj.set_rows(N);
        animator = window.animator.Animator({
            'frameDelayMS'       : frameDelayMS,
            'interActionDelayMS' : delayBetweenMovesMS,
            'draw' : draw
        });
        return obj;
    };

}());
