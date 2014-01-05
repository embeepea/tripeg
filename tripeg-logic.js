(function() {

    var tripeg_logic = window.tripeg_logic = {};

    var Direction = tripeg_logic.Direction = function(i,j) {
        if (!(this instanceof Direction)) { return new Direction(i,j); }
        this.i = i;
        this.j = j;
    };
    Direction.prototype.times = function(f) {
        return Direction(this.i * f, this.j * f);
    };
    Direction.prototype.toString = function() {
        return 'Dir(' + this.i + ',' + this.j + ')';
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
        if (!(this instanceof Position)) { return new Position(i,j); }
        this.i = i;
        this.j = j;
    };
    Position.prototype.toString = function() {
        return 'Pos(' + this.i + ',' + this.j + ')';
    };
    Position.prototype.add = function(direction) {
        return Position(this.i + direction.i, this.j + direction.j);
    };

    var Move = tripeg_logic.Move = function(jumper, jumpee, dest) {
        if (!(this instanceof Move)) { return new Move(jumper, jumpee, dest); }
        this.jumper = jumper;
        this.jumpee = jumpee;
        this.dest   = dest;
    };
    Move.prototype.toString = function() {
        return (
            '(' + this.jumper.i + ',' + this.jumper.j + ') -> (' +
                this.jumpee.i + ',' + this.jumpee.j + ') -> (' + this.dest.i + ',' + this.dest.j +  ')'
        );
    };

    var BoardContext = tripeg_logic.BoardContext = function(N) {
        if (!(this instanceof BoardContext)) { return new BoardContext(N); }
        var i,j;
        this.N = N;
        this.moves_for_position = [];
        for (i=0; i<N; ++i) {
            this.moves_for_position[i] = [];
            for (j=0; j<=i; ++j) {
                this.moves_for_position[i].push(this.position_possible_moves(Position(i,j),N));
            }
        }
    };
    BoardContext.prototype.create_board = function() {
        return Board(this);
    };
    BoardContext.prototype.position_is_valid = function(p) {
        return (p.i>=0 && p.i<this.N && p.j>=0 && p.j<=p.i);
    };
    BoardContext.prototype.position_possible_moves = function(p) {
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

    var Board = tripeg_logic.Board = function(boardContext) {
        if (!(this instanceof Board)) { return new Board(boardContext); }
        var i,j;
        this.boardContext = boardContext;
        this.N = boardContext.N;
        this.pegs = [];
        for (i=0; i<boardContext.N; ++i) {
            this.pegs[i] = [];
            for (j=0; j<=i; ++j) {
                this.pegs[i][j] = undefined;
            }
        }
        this.numPegs = 0;
    };
    Board.prototype.insert_peg = function(p,peg) {
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
    Board.prototype.remove_peg = function(p) {
        if (this.boardContext.position_is_valid(p)) {
            if (this.pegs[p.i][p.j] !== undefined) {
                // only decrement peg count if the position was occupied
                this.numPegs = this.numPegs - 1;
            }
            this.pegs[p.i][p.j] = undefined;
        }
    };
    Board.prototype.get_peg = function(p) {
        if (this.boardContext.position_is_valid(p)) {
            if (this.pegs[p.i] !== undefined) {
                return this.pegs[p.i][p.j];
            }
        }
        return undefined;
    };
    Board.prototype.contains_peg = function(p) {
        if (this.boardContext.position_is_valid(p)) {
            if (this.pegs[p.i] !== undefined) {
                return (this.pegs[p.i][p.j] !== undefined);
            }
        }
        return false;
    };
    Board.prototype.toString = function() {
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
    Board.prototype.insert_peg_everywhere_except = function(p,peg) {
        for (i=0; i<this.N; ++i) {
            for (j=0; j<=i; ++j) {
                if (!(i===p.i && j===p.j)) {
                    this.insert_peg(Position(i,j),peg);
                }
            }
        }
    };
    Board.prototype.move_allowed = function(move) {
        var ans = (
            this.contains_peg(move.jumper)
                && this.contains_peg(move.jumpee)
                && !this.contains_peg(move.dest)
                && this.boardContext.position_is_valid(move.dest)
        );
        return (ans);
    };
    Board.prototype.move = function(move) {
        this.pegs[move.dest.i][move.dest.j] = this.pegs[move.jumper.i][move.jumper.j];
        this.pegs[move.jumper.i][move.jumper.j] = undefined;
        // checking for undefined jumpee allows for moves that don't remove a peg, as in what happens
        // when choosing a different initial empty hole -- i.e. just move a peg from one hole to another
        if (move.jumpee !== undefined) {
            this.pegs[move.jumpee.i][move.jumpee.j] = undefined;
        }
        this.numPegs = this.numPegs - 1;
    };
    Board.prototype.clone = function() {
        var b = Board(this.boardContext), i, j, p;
        for (i=0; i<this.N; ++i) {
            for (j=0; j<=i; ++j) {
                p = Position(i,j);
                if (this.contains_peg(p)) {
                    b.insert_peg(p,this.get_peg(p));
                }
            }
        }
        return b;
    };
    Board.prototype.board_possible_moves = function() {
        var moves = [], i, j, k;
        for (i=0; i<this.N; ++i) {
            for (j=0; j<=i; ++j) {
                //var moves_this_pos = this.position_possible_moves(Position(i,j));
                var moves_this_pos = this.boardContext.moves_for_position[i][j];
                for (k=0; k<moves_this_pos.length; ++k) {
                    var move = moves_this_pos[k];
                    if (this.move_allowed(move)) {
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    };

    // return a list of moves to solve this board, if possible
    // return the empty list [] if the board is already solved
    // return `undefined` if the board cannot be solved
    Board.prototype.solve = function(level) {
        if (level === undefined) { level = 1; }
        if (this.numPegs === 1) {
            return [];
        }
        var i;
        var possible_moves = this.board_possible_moves();
        var move;
        for (i=0; i<possible_moves.length; ++i) {
            move = possible_moves[i];
            var b = this.clone();
            b.move(move);
            var moves = b.solve(level+1);
            if (moves !== undefined) {
                var answer = moves.slice(0);
                answer.push(move);
                return answer;
            }
        }
        return undefined;
    };

}());
