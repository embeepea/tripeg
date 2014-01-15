/* This file contains code that solves the triangle puzzle, including
 * various objects that represent the puzzle and moves that change its
 * state.  This file has no external dependencies and does not do any
 * graphics or DOM manipulation.  The basic usage is as follows:
 *
 *    1. call `Board(N)` to create a Board object representing a puzzle
 *       having N rows (the normal puzzle has 5 rows)
 *    2. populate the board with "pegs"; the easiest way to do this is
 *       by calling its `insert_peg_everywhere_except(pos,peg)`
 *       method, where `pos` is a `Position` object giving one
 *       slot to be left empty, and `peg` is a value to be
 *       inserted into every other slot on the board (the value of
 *       the peg doesn't matter; any value other than `undefined` will
 *       do).
 *    3. call the Board's `solve` method to find a solution; `solve`
 *       returns an array of `Move` objects, each of which represents
 *       a single peg jump/removal step.
 *
 * For example, here's a little program that you can run from the
 * command line (e.g. with node.js) to print out the solution to a
 * 5-row board:
 *
 *    window = {};
 *    require('./tripeg-logic');
 *    tl = window.tripeg_logic;
 *    board = tl.Board(5);
 *    board.insert_peg_everywhere_except(tl.Position(0,0),true);
 *    moves = board.solve();
 *    for (i=0; i<moves.length; ++i) {
 *      console.log(moves[i].toString());
 *    }
 *
 * Note that this code works well for boards with 4, 5, or 6 rows.
 * With 7 or more rows, the search for the solution takes long enough
 * that I have never had the patience to wait for it to finish.
 */ 
(function() {

    var tripeg_logic = window.tripeg_logic = {};

    // a Position object stores a location of a slot
    // on the board.  It has two properties: `i` is the
    // row number, and `j` is the position of the slot
    // within that row.  Both `i` and `j` start with 0, so
    // the top corner position corresponds to Position(0,0).
    var Position = tripeg_logic.Position = function(i,j) {
        var obj = {};
        obj.i = i;
        obj.j = j;
        obj.toString = function() {
            return 'Pos(' + this.i + ',' + this.j + ')';
        };
        // return a new Position obtained by adding an offset
        obj.add = function(offset) {
            return Position(this.i + offset.i, this.j + offset.j);
        };
        return obj;
    };

    // an Offset object stores a relative offset from a position
    var Offset = tripeg_logic.Offset = function(i,j) {
        var obj = {};
        obj.i = i;
        obj.j = j;
        // return a new offset obtained by multiplying the row
        // and column values of this offset by a common factor:
        obj.times = function(f) {
            return Offset(this.i * f, this.j * f);
        };
        obj.toString = function() {
            return 'Offset(' + this.i + ',' + this.j + ')';
        };
        return obj;
    };

    // the Offsets of the six "potential" positions which are
    // "adjacent" to a given position:
    var six_neighbors = tripeg_logic.six_neighbors = [
        Offset(0,1),        // straight right
        Offset(-1,0),       // up & right      
        Offset(-1,-1),      // up & left       
        Offset(0,-1),       // straight left 
        Offset(1,0),        // down & left     
        Offset(1,1)         // down & right    
    ];

    // a Move represents one move in the solution to the puzzle.
    //   jumper: the position of the peg being moved
    //   jumpee: the position of the peg being jumped over
    //   dest: the position that the jumper is moving into
    var Move = tripeg_logic.Move = function(jumper, jumpee, dest) {
        var obj = {};
        obj.jumper = jumper;
        obj.jumpee = jumpee;
        obj.dest   = dest;
        obj.toString = function() {
            return (
                '(' + this.jumper.i + ',' + this.jumper.j + ') -> (' +
                    this.jumpee.i + ',' + this.jumpee.j + ') -> (' + this.dest.i + ',' + this.dest.j +  ')'
            );
        };
        return obj;
    };

    // the BoardContext object caches a few computations related to
    // solving any board with N rows
    var BoardContext = tripeg_logic.BoardContext = function(N) {
        var obj = {};
        var i,j;
        obj.numRows = N;
        // `positions` is an array of the positions of all the slots on
        // a board with N rows:
        obj.positions = [];
        for (i=0; i<obj.numRows; ++i) {
            for (j=0; j<=i; ++j) {
                obj.positions.push(Position(i,j));
            }
        }
        // return the total number of peg slots on a board with numRows rows
        obj.num_slots = function() {
            return this.numRows * (this.numRows + 1) / 2;
        };
        // convenience method for looping over all positions on
        // a board.  `posfunc(p)` is called for each Position,
        // and `rowfunc(i)` (optional) is called for each row.
        obj.each_position = function(posfunc,rowfunc) {
            var k,
            n = 0,
            i = 0;
            for (k=0; k<this.positions.length; ++k) {
                if (rowfunc !== undefined) {
                    if (n === 0) {
                        rowfunc(i);
                        ++i;
                        n = i;
                    }
                    --n;
                }
                posfunc(this.positions[k]);
            }
        };
        // return true if a position is valid for a board with numRows rows; false if not:
        obj.position_is_valid = function(p) {
            return (p.i>=0 && p.i<this.numRows && p.j>=0 && p.j<=p.i);
        };
        // return an array of all moves that might conceivably be possible for
        // a peg in Position p on a board with numRows rows:
        obj.all_moves = function(p) {
            var moves = [],
            i, offset, dest;
            for (i=0; i<six_neighbors.length; ++i) {
                offset = six_neighbors[i];
                dest = p.add(offset.times(2));
                if (this.position_is_valid(dest)) {
                    moves.push(Move(p, p.add(offset), dest));
                }
            }
            return moves;
        };
        // pre-compute a nested array giving all possible moves for each position
        // on the board:
        obj.all_moves_for_position = [];
        for (i=0; i<obj.numRows; ++i) {
            obj.all_moves_for_position[i] = [];
            for (j=0; j<=i; ++j) {
                obj.all_moves_for_position[i].push(obj.all_moves(Position(i,j)));
            }
        }
        return obj;
    };

    // The Board object represents a puzzle board with numRows rows.  Create a new board
    // either by calling `Board(N)`, where N is the number of rows, or
    // `Board(boardContext)`, where boardContext is a BoardContext object.
    var Board = tripeg_logic.Board = function(arg) {
        var i, j, boardContext, obj = {};

        // set the boardContext object and number of rows numRows
        if (typeof(arg)==="number") {
            boardContext = BoardContext(arg);
        } else {
            boardContext = arg;
        }
        obj.boardContext = boardContext;
        obj.numRows = boardContext.numRows;

        // the board stores pegs in a nested array called `pegs`; the
        // peg in Position(i,j) is stored at pegs[i][j].  The actual
        // values stored in the pegs array don't matter --- they can
        // be anything. A value of `undefined` means that a position
        // has no peg in it.  Initialize the array here to all
        // `undefined` values:
        obj.pegs = [];
        boardContext.each_position(function(p) {
            obj.pegs[p.i][p.j] = undefined;
        }, function(i) {
            obj.pegs[i] = [];
        });
        // currentPegCount always stored the total number of pegs on the board
        obj.currentPegCount = 0;
        // insert a peg in a position
        obj.insert_peg = function(p,peg) {
            if (this.boardContext.position_is_valid(p)) {
                if (peg === undefined) { peg = true; }
                if (this.pegs[p.i] == undefined) {
                    this.pegs[p.i] = [];
                } else {
                    // excption
                }
                if (this.pegs[p.i][p.j] === undefined) {
                    // only increment peg count if the position was unoccupied
                    this.currentPegCount = this.currentPegCount + 1;
                }
                this.pegs[p.i][p.j] = peg;
            }
        };
        // remove a peg from a position
        obj.remove_peg = function(p) {
            if (this.boardContext.position_is_valid(p)) {
                if (this.pegs[p.i][p.j] !== undefined) {
                    // only decrement peg count if the position was occupied
                    this.currentPegCount = this.currentPegCount - 1;
                }
                this.pegs[p.i][p.j] = undefined;
            }
        };
        // return the peg at a given position
        obj.get_peg = function(p) {
            if (this.boardContext.position_is_valid(p)) {
                if (this.pegs[p.i] !== undefined) {
                    return this.pegs[p.i][p.j];
                }
            }
            return undefined;
        };
        // return true if a position has a peg in it, false otherwise
        obj.contains_peg = function(p) {
            if (this.boardContext.position_is_valid(p)) {
                if (this.pegs[p.i] !== undefined) {
                    return (this.pegs[p.i][p.j] !== undefined);
                }
            }
            return false;
        };
        obj.toString = function() {
            var arr = [ "[" ];
            for (i=0; i<this.numRows; ++i) {
                arr.push("[");
                for (j=0; j<=i; ++j) {
                    arr.push(this.get_peg(Position(i,j)));
                    if (j<i) { arr.push(","); }
                }
                arr.push("]");
                if (i<this.numRows-1) { arr.push(","); }
            }
            arr.push("]");
            return arr.join("");
        };
        // insert a peg (the same peg) into every position on the board except one:
        obj.insert_peg_everywhere_except = function(pos,peg) {
            var board = this;
            this.each_position(function(p) {
                if (!(pos.i===p.i && pos.j===p.j)) {
                    board.insert_peg(p,peg);
                }
            });
        };
        // return true if a given move is allowed given the current peg positions
        // on the board:
        obj.move_allowed = function(move) {
            var ans = (
                this.contains_peg(move.jumper)
                    && this.contains_peg(move.jumpee)
                    && !this.contains_peg(move.dest)
                    && this.boardContext.position_is_valid(move.dest)
            );
            return (ans);
        };
        // return an exact copy of this board, using the same BoardContext
        obj.clone = function() {
            var b = Board(this.boardContext), i, j, p;
            var board = this;
            this.each_position(function(p) {
                if (board.contains_peg(p)) {
                    b.insert_peg(p,board.get_peg(p));
                }
            });
            return b;
        };
        // Create a new board which is obtained by cloning this board and then applying
        // a given move to it, i.e. move the peg that is currently in the
        // jumper position to the dest position, and remove the peg from the jumpee position.
        // The original board (this) is left unchanged.
        obj.move = function(move) {
            var board = this.clone();
            board.insert_peg(move.dest, board.get_peg(move.jumper));
            board.remove_peg(move.jumper);
            if (move.jumpee !== undefined) {
                // only remove the jumpee peg if the move actually has a jumpee that
                // is not `undefined`.  In general, real moves in the puzzle always
                // have a jumpee, but allowing an undefined jumpee allows the graphics
                // code in tripeg-graphics.js to use the same animation code for moving a peg
                // to the empty slot before the puzzle animation begins that it uses
                // to animate the moves of the solution.
                board.remove_peg(move.jumpee);
            }
            return board;
        };
        // return an array of all possible moves that can be made on the board, considering
        // the current peg locations
        obj.possible_moves = function() {
            var moves = [], i, j, k;
            var board = this;
            this.each_position(function(p) {
                //var moves_this_pos = this.all_moves(Position(i,j));
                var moves_this_pos = board.boardContext.all_moves_for_position[p.i][p.j];
                for (k=0; k<moves_this_pos.length; ++k) {
                    var move = moves_this_pos[k];
                    if (board.move_allowed(move)) {
                        moves.push(move);
                    }
                }
            });
            return moves;
        };
        // convenience method to iterate over all board positions; this simply calls
        // the BoardContext's each_position method:
        obj.each_position = function(f,g) {
            this.boardContext.each_position(f,g);
        };

        // return the Position of the first unoccupied peg slot on this board:
        obj.get_empty_position = function() {
            var i, j, p;
            for (i=0; i<this.numRows; ++i) {
                for (j=0; j<=i; ++j) {
                    var p = Position(i,j);
                    if (!this.contains_peg(p)) { return p; }
                }
            }
            return undefined;
        };

        // Return a list of moves to solve this board, if possible.
        // Return the empty list [] if the board is already solved.
        // Return `undefined` if the board cannot be solved.
        obj.solve = function() {
            var i,
                possible_moves,
                solution;

            if (this.currentPegCount === 1) {
                // if only 1 peg remains, board is solved
                return [];
            }
            // find all moves currently possible on the board
            possible_moves = this.possible_moves();
            for (i=0; i<possible_moves.length; ++i) {
                // look for a solution to the board obtained by applying the i-th move
                solution = this.move(possible_moves[i]).solve();
                if (solution !== undefined) {
                    // if we found a solution, then the solution to the original board
                    // is that solution, with the i-th move inserted at the beginning
                    // of the list.
                    solution.splice(0,0,possible_moves[i]);
                    return solution;
                }
            }
            // if no moves are possible, the board can't be solved
            return undefined;
        };

        return obj;
    };

}());
