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
        // Return an array of n red, blue, and yellow colors, with the distribution
        // as equal as possible among the three colors.
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
        // Return the square of the euclidean distance between two 2D points `a` and `b`;
        // `a` and `b` should be JS arrays of length 2.
        var dx = a[0] - b[0];
        var dy = a[1] - b[1];
        return dx*dx + dy*dy;
    }

    function linear_interpolate(f, a, b) {
        // return the number which is `f` of the way from `a` to `b`.
        // `a` and `b` can be any numbers.
        // Returns `a` if `f` is 0.
        // Returns `b` if `f` is 1.
        return a + f*(b - a);
    }

    // a Peg object holds information about a single peg in the puzzle
    var Peg = function (color) {
        obj = {};
        obj.color       = color;      // color to use when drawing this peg
        obj.moving      = false;      // whether this peg is currently moving
        obj.dest        = undefined;  // the Position a moving peg is moving towards
        obj.interpf     = undefined;  // the interpolation fraction of a moving peg
                                      // (0.0 = peg is in original Position,
                                      // (1.0 = peg is in dest Position)
        obj.highlighted = false;      // whether this peg is curently `highlighted`
        // Note: a `highlighted` peg is drawn partially displaced toward its dest Position
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

    //
    // Create a new Tripeg object for animating a puzzle board with N rows:
    //
    tripeg_graphics.Tripeg = function(canvasContext, N) {

        // Note: throughout this object, the phrase "2D point" means a JS
        // array of length 2, containing the pixel coordinates of a point
        // in the canvas.  The phrase "Position" refers to a tripeg_logic.Position
        // object containing an i,j pair giving the position of a peg (or
        // slot on the board).

        // Note: many of these variables are given values in the `set_rows` method below:
        var numRows,
            board,                  // a tripeg_logic.Board object for solving the puzzle
            hole,                   // the Position of the initial empty slot
            triangle_side_length,   // pixel length of a side of the triangle board
            peg_base,               // 2D point giving the pixel location of Position(0,0) on the board
            triangle_vertices,      // array of 3 2D points giving the vertices of the triangle
            colors,                 // array of colors to use for pegs
            animator,               // an animator object for controlling the animations (see animator.js)
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
            // Return the 2D point coords of the center of a peg (or slot) at Position p
            return [ peg_base[0] + p.j * distance_between_holes - p.i * distance_between_holes / 2,
                     peg_base[1] + p.i * sqrt3halves * distance_between_holes ];
        }

        function draw_disc(center, radius, options) {
            // Draw a filled circular disc with a given center (2D point) and radius
            // (pixels). `options` is an object with properties `fillStyle`, `lineWidth`
            // and/or`strokeStyle`, which determine the color and outline width of the
            // disc.  Each of these properties, as well as options itself, is optional.
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

        function draw_displaced_disc(center, radius, dest, fraction, options) {
            // Like draw_disc, but draws the disc at a location that is `fraction` (0.0-1.0) of
            // the way between center (2D point) and dest (another 2D point)
            var c = [ linear_interpolate(fraction, center[0], dest[0]),
                      linear_interpolate(fraction, center[1], dest[1]) ]
            draw_disc(c, radius, options);
        }

        function draw_polygon(vertices, options) {
            // Draw a filled polygon.  `vertices` is an array of 2D points.
            // `options` is as in draw_disc above.
            var i;
            ctx.beginPath();
            ctx.moveTo(vertices[0][0], vertices[0][1]);
            for (i=1; i<vertices.length; ++i) {
                ctx.lineTo(vertices[i][0], vertices[i][1]);
            }
            if (options && options.fillStyle !== undefined) {
                ctx.fillStyle = options.fillStyle;
            } else {
                ctx.fillStyle = '#000000'; // defaults to black
            }
            ctx.fill();
            ctx.closePath();
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

        function draw() {
            // Draw the board and all its pegs in their current location

            var highlight_fraction = 0.1,
                i, j, peg, moving_peg_pos;

            //
            // draw the triangle background
            //
            draw_polygon(triangle_vertices, {
                'fillStyle' : '#FBA16C'
            });

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
            // first draw all the non-moving pegs
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
            // now draw the moving peg, if any; we draw it last so that it
            // shows on top of any pegs that it overlaps
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

        // create the animator object for handling animations (see animator.js)
        animator = window.animator.Animator({
            'frameDelayMS'       : frameDelayMS,
            'interActionDelayMS' : delayBetweenMovesMS,
            'draw'               : draw
        });

        obj = {};

        obj.get_rows = function() {
            return numRows;
        };

        obj.reset = function() {
            // reset and redraw after puzzle is solved
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
            // Create an animator 'Action' object which represents a single "move"
            // in the puzzle. Start with a tripeg_logic.Move object.
            var move = tripeg_logic.Move(jumper, jumpee, dest);
            // And extend it by adding the `begin`, `step`, and `end` methods
            // required by the animator.
            move.begin = function() {
                this.moving_peg         = board.pegs[jumper.i][jumper.j];
                this.moving_peg.moving  = true;
                this.moving_peg.interpf = 0;
                this.moving_peg.dest    = dest;
            };
            var n = 0;
            move.step = function() {
                if (n < stepsPerMove) {
                    n += 1;
                    move.moving_peg.interpf = n / stepsPerMove;
                    return false;
                }
                // when n reaches stepsPerMove, animation of this move is done
                return true;
            };
            move.end = function() {
                this.moving_peg.moving = false;
                board = board.move(this);
            };
            return move;
        };

        obj.point_in_triangle = function(x, y) {
            // return true if (x,y) is inside the puzzle triangle, false otherwise
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
        
        obj.peg_position_under_point = function(a) {
            // Return the Position of the peg under a 2D point `a`.
            // Return undefined if the `a` is not over a peg (including over an empty hole).
            var i,j, c, p;
            for (i=0; i<numRows; ++i) {
                c = peg_center(Position(i,0));
                if (a[1] >= c[1] - peg_radius && a[1] <= c[1] + peg_radius) {
                    for (j=0; j<=i; ++j) {
                        p = Position(i,j);
                        if (board.contains_peg(p)) {
                            c = peg_center(p);
                            if (a[0] >= c[0] - peg_radius && a[0] <= c[0] + peg_radius) {
                                if (l2dist2(a,c) < peg_radius_squared) {
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
            // Animate the motion of the peg currently in position `p` to the current empty slot,
            // and reset the hole to be at position `p`
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

        obj.solve = function (options) {
            // Animate the solution to the current board.
            // options is an object with 3 (optional) properties:
            //   `done` : a function to be called when the animation is finished
            //   `nosolution` : a function to be called if the puzzle has no solution
            //   `timelog` : a function to be called once the solution has been computed
            //               (but before the animation starts); this function will be passed
            //               a number which is the number of milliseconds it took to compute
            //               the solution.
            var i,
                tmoves,
                t0;
            if (options === undefined) { options = {}; }
            t0 = (new Date()).getTime();
            tmoves = board.solve();
            if (options.timelog !== undefined) {
                options.timelog((new Date()).getTime() - t0);
            }
            if (tmoves === undefined && options.nosolution !== undefined) {
                options.nosolution();
                return;
            }
            for (i=0; i<tmoves.length; ++i) {
                var tm = tmoves[i];
                animator.add_action(this.Move(tm.jumper, tm.jumpee, tm.dest));
            }
            if (options.done !== undefined) {
                animator.add_action({
                    'begin' : options.done
                    // this action simply calls options.done on `begin`; it has
                    // no `step` or `end` methods, so the animator skips them.
                });
            }
            animator.play();
        };

        obj.set_rows = function(N) {
            // set the number of rows in the puzzle, and compute everything that depends on it
            numRows = N;
            hole = Position(0,0); // reset hole in case user changed to hole pos not valid for new numRows
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

        // call set_rows with the N value passed in to the constructor (way above)
        obj.set_rows(N);

        return obj;
    };

}());
