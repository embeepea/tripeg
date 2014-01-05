(function() {

  var tripeg_logic = {};
  window.tripeg_logic = {};

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


//    
//    
//           *
//         *   *
//       *   *   *
//     *   *   *    *
//    
//                     0,0
//                 1,0     1,1
//             2,0     2,1     2,2
//         3,0     3,1     3,2     3,3
//     4,0     4,1     4,2     4,3     4,5
//    
//    0,1   straight right
//    -1,0  up right
//    -1,-1 up left
//    0,-1  straight left
//    1,0   down left
//    1,1   down right
//    
//    

  var six_directions = [
    Direction(0,1),
    Direction(-1,0),
    Direction(-1,-1),
    Direction(0,-1),
    Direction(1,0),
    Direction(1,1)
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



  var Move = function(jumper, jumpee, dest) {
    return {
      'jumper' : jumper,
      'jumpee' : jumpee,
      'dest'   : dest,
      'toString' : function() {
          return '(' + jumper.i + ',' + jumper.j + ') -> (' + jumpee.i + ',' + jumpee.j + ') -> (' + dest.i + ',' + dest.j +  ')';
      }
    };
  };

  var BoardContext = tripeg_logic.BoardContext = function(N) {
      var i,j;
      if (!(this instanceof BoardContext)) { return new BoardContext(N); }
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


  var Board = function(boardContext) {
      var pegs = [], i, j;
      for (i=0; i<boardContext.N; ++i) {
          pegs[i] = [];
          for (j=0; j<=i; ++j) {
              pegs[i][j] = undefined;
          }
      }

      return {
          'boardContext' : boardContext,
          'N' : boardContext.N,
          'pegs' : pegs,
          'numPegs' : 0,
          'insert_peg' : function(i,j,peg) {
              if (this.boardContext.position_is_valid(Position(i,j))) {
                  if (peg === undefined) { peg = true; }
                  if (this.pegs[i] == undefined) {
                      this.pegs[i] = [];
                  } else {
                      // excption
                  }
                  if (this.pegs[i][j] === undefined) {
                      // only increment peg count if the position was unoccupied
                      this.numPegs = this.numPegs + 1;
                  }
                  this.pegs[i][j] = peg;
              }
          },
          'remove_peg' : function(i,j) {
              if (this.boardContext.position_is_valid(Position(i,j))) {
                  if (this.pegs[i][j] !== undefined) {
                      // only decrement peg count if the position was occupied
                      this.numPegs = this.numPegs - 1;
                  }
                  this.pegs[i][j] = undefined;
              }
          },
          'get_peg' : function(i,j) {
              if (this.boardContext.position_is_valid(Position(i,j))) {
                  if (this.pegs[i] !== undefined) {
                      return this.pegs[i][j];
                  }
              }
              return undefined;
          },
          'contains_peg' : function(i,j) {
              if (this.boardContext.position_is_valid(Position(i,j))) {
                  if (this.pegs[i] !== undefined) {
                      return (this.pegs[i][j] !== undefined);
                  }
              }
              return false;
          },
          'toString' : function() {
              var arr = [ "[" ];
              for (i=0; i<this.N; ++i) {
                  arr.push("[");
                  for (j=0; j<=i; ++j) {
                      arr.push(this.get_peg(i,j));
                      if (j<i) { arr.push(","); }
                  }
                  arr.push("]");
                  if (i<this.N-1) { arr.push(","); }
              }
              arr.push("]");
              return arr.join("");
          },
          'insert_peg_everywhere_except' : function(r,c,peg) {
              for (i=0; i<this.N; ++i) {
                  for (j=0; j<=i; ++j) {
                      if (!(i===r && j===c)) {
                          this.insert_peg(i,j,peg);
                      }
                  }
              }
          },
          'move_allowed' : function(move) {
              var ans = (
                  this.contains_peg(move.jumper.i, move.jumper.j)
                      && this.contains_peg(move.jumpee.i, move.jumpee.j)
                      && !this.contains_peg(move.dest.i, move.dest.j)
                      && this.boardContext.position_is_valid(move.dest)
              );
              return (ans);
          },
          'move' : function(move) {
              this.pegs[move.dest.i][move.dest.j] = this.pegs[move.jumper.i][move.jumper.j];
              this.pegs[move.jumper.i][move.jumper.j] = undefined;
              // checking for undefined jumpee allows for moves that don't remove a peg, as in what happens
              // when choosing a different initial empty hole -- i.e. just move a peg from one hole to another
              if (move.jumpee !== undefined) {
                  this.pegs[move.jumpee.i][move.jumpee.j] = undefined;
              }
              this.numPegs = this.numPegs - 1;
          },
          'clone' : function() {
              var b = Board(this.boardContext), i, j;
              for (i=0; i<this.N; ++i) {
                  for (j=0; j<=i; ++j) {
                      if (this.contains_peg(i,j)) {
                          b.insert_peg(i,j,this.get_peg(i,j));
                      }
                  }
              }
              return b;
          },
          'board_possible_moves' : function() {
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
          },

          // return a list of moves to solve this board, if possible
          // return the empty list [] if the board is already solved
          // return `undefined` if the board cannot be solved
          'solve' : function(level) {
              if (level === undefined) { level = 1; }
              if (this.numPegs === 1) {
                  return [];
              }
              var i;
              var possible_moves = this.board_possible_moves();
              var move;
              for (i=0; i<possible_moves.length; ++i) {
//console.log('solve level ' + level + ': checking move ' + i + ' of ' + possible_moves.length + ' possible moves');
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
          },


      };
  };

  window.tripeg_logic = {
      'Direction'      : Direction,
      'Position'       : Position,
      'Move'           : Move,
      'BoardContext'   : BoardContext,
      'Board'          : Board,
      'six_directions' : six_directions
      };

}());
