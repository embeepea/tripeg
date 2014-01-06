/* This file contains code that solves the triangle puzzle, including
 * various objects that represent the puzzle and moves that change its
 * state.  This file has no external dependencies and does not do any
 * graphics or DOM manipulation.  The basic usage is as follows:
 *
 *    1. call `Board(N)` to create a "Board" object having N rows
 *    2. populate the board with "pegs"; the easiest way to do this is
 *       by calling its `insert_peg_everywhere_except(pos,peg)`
 *       method, where `pos` is a `Position` object giving one
 *       location to be left empty, and `peg` is a value to be
 *       inserted into every other position on the board (the value of
 *       the peg doesn't matter; any value other than `undefined` will
 *       do).
 *    3. call the Board's `solve` method to find a solution; `solve`
 *       returns an array of `Move` objects in reverse order --- the
 *       first element in the array is the final move of the solution,
 *       and the last array element is the first move of the solution.
 *
 * For example, here's a little program that you can run with node.js
 * to print out the solution to a 5-row board (save this to a file
 * called solve.js and type `node solve.js`):
 *
 *    window = {};
 *    require('./tripeg-logic');
 *    tl = window.tripeg_logic;
 *    board = tl.Board(5);
 *    board.insert_peg_everywhere_except(tl.Position(0,0),true);
 *    moves = board.solve().reverse();
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

    var Direction = tripeg_logic.Direction = function(i,j) {
        var obj = {};
        obj.i = i;
        obj.j = j;
        obj.times = function(f) {
            return Direction(this.i * f, this.j * f);
        };
        obj.toString = function() {
            return 'Dir(' + this.i + ',' + this.j + ')';
        };
        return obj;
    };

    var six_directions = tripeg_logic.six_directions = [
        Direction(0,1),        // straight right
        Direction(-1,0),       // up & right      
        Direction(-1,-1),      // up & left       
        Direction(0,-1),       // straight left 
        Direction(1,0),        // down & left     
        Direction(1,1)         // down & right    
    ];

    var Position = tripeg_logic.Position = function(i,j) {
        var obj = {};
        obj.i = i;
        obj.j = j;
        obj.toString = function() {
            return 'Pos(' + this.i + ',' + this.j + ')';
        };
        obj.add = function(direction) {
            return Position(this.i + direction.i, this.j + direction.j);
        };
        return obj;
    };

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

    var BoardContext = tripeg_logic.BoardContext = function(N) {
        var obj = {};
        var i,j;
        obj.N = N;
        obj.positions = [];
        for (i=0; i<N; ++i) {
            for (j=0; j<=i; ++j) {
                obj.positions.push(Position(i,j));
            }
        }
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
        obj.position_is_valid = function(p) {
            return (p.i>=0 && p.i<this.N && p.j>=0 && p.j<=p.i);
        };
        obj.all_moves = function(p) {
            var moves = [],
            i, dir, dest;
            for (i=0; i<six_directions.length; ++i) {
                dir = six_directions[i];
                dest = p.add(dir.times(2));
                if (this.position_is_valid(dest)) {
                    moves.push(Move(p, p.add(dir), dest));
                }
            }
            return moves;
        };
        obj.create_board = function() {
            return Board(this);
        };
        obj.all_moves_for_position = [];
        for (i=0; i<N; ++i) {
            obj.all_moves_for_position[i] = [];
            for (j=0; j<=i; ++j) {
                obj.all_moves_for_position[i].push(obj.all_moves(Position(i,j),N));
            }
        }
        return obj;
    };

    var Board = tripeg_logic.Board = function(arg) {
        var boardContext;
        if (typeof(arg)==="number") {
            boardContext = BoardContext(arg);
        } else {
            boardContext = arg;
        }
        var obj = {};
        var i,j;
        obj.boardContext = boardContext;
        obj.N = boardContext.N;
        obj.pegs = [];
        boardContext.each_position(function(p) {
            obj.pegs[p.i][p.j] = undefined;
        }, function(i) {
            obj.pegs[i] = [];
        });
        obj.numPegs = 0;
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
                    this.numPegs = this.numPegs + 1;
                }
                this.pegs[p.i][p.j] = peg;
            }
        };
        obj.remove_peg = function(p) {
            if (this.boardContext.position_is_valid(p)) {
                if (this.pegs[p.i][p.j] !== undefined) {
                    // only decrement peg count if the position was occupied
                    this.numPegs = this.numPegs - 1;
                }
                this.pegs[p.i][p.j] = undefined;
            }
        };
        obj.get_peg = function(p) {
            if (this.boardContext.position_is_valid(p)) {
                if (this.pegs[p.i] !== undefined) {
                    return this.pegs[p.i][p.j];
                }
            }
            return undefined;
        };
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
            for (i=0; i<this.N; ++i) {
                arr.push("[");
                for (j=0; j<=i; ++j) {
                    arr.push(this.get_peg(Position(i,j)));
                    if (j<i) { arr.push(","); }
                }
                arr.push("]");
                if (i<this.N-1) { arr.push(","); }
            }
            arr.push("]");
            return arr.join("");
        };
        obj.insert_peg_everywhere_except = function(pos,peg) {
            var board = this;
            this.each_position(function(p) {
                if (!(pos.i===p.i && pos.j===p.j)) {
                    board.insert_peg(p,peg);
                }
            });
        };
        obj.move_allowed = function(move) {
            var ans = (
                this.contains_peg(move.jumper)
                    && this.contains_peg(move.jumpee)
                    && !this.contains_peg(move.dest)
                    && this.boardContext.position_is_valid(move.dest)
            );
            return (ans);
        };
        obj.move = function(move) {
            this.pegs[move.dest.i][move.dest.j] = this.pegs[move.jumper.i][move.jumper.j];
            this.pegs[move.jumper.i][move.jumper.j] = undefined;
            // checking for undefined jumpee allows for moves that don't remove a peg, as in what happens
            // when choosing a different initial empty hole -- i.e. just move a peg from one hole to another
            if (move.jumpee !== undefined) {
                this.pegs[move.jumpee.i][move.jumpee.j] = undefined;
            }
            this.numPegs = this.numPegs - 1;
        };
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
        obj.each_position = function(f,g) {
            this.boardContext.each_position(f,g);
        };


        obj.get_empty_position = function() {
            var i, j, p;
            for (i=0; i<this.N; ++i) {
                for (j=0; j<=i; ++j) {
                    var p = Position(i,j);
                    if (!this.contains_peg(p)) { return p; }
                }
            }
            return undefined;
        };


        
        // return a list of moves to solve this board, if possible
        // return the empty list [] if the board is already solved
        // return `undefined` if the board cannot be solved
        obj.solve = function() {
            if (this.numPegs === 1) {
                return [];
            }
            var i;
            var possible_moves = this.possible_moves();
            var move;
            for (i=0; i<possible_moves.length; ++i) {
                move = possible_moves[i];
                var b = this.clone();
                b.move(move);
                var moves = b.solve();
                if (moves !== undefined) {
                    var answer = moves.slice(0);
                    answer.push(move);
                    return answer;
                }
            }
            return undefined;
        };

        return obj;
    };

}());
