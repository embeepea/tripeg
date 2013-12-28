(function() {

    function map(arr, func) {
        var ans = [], i;
        for (i=0; i<arr.length; ++i) {
            ans.push(func(arr[i]));
        }
        return ans;
    }

  var Direction = function(i,j) {
    return {
      'i' : i,
      'j' : j,
      'times' : function(f) {
        return Direction(this.i * f, this.j * f);
      },
      'toString' : function() { return 'Dir(' + this.i + ',' + this.j + ')'; }
    };
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

  var Position = function(i,j) {
    return {
      'i' : i,
      'j' : j,
      'toString' : function() { return 'Pos(' + this.i + ',' + this.j + ')'; },
      'add' : function(direction) {
        return Position(this.i + direction.i, this.j + direction.j);
      }
    };
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

  var Board = function(N) {
      var pegs = [], i, j;
      for (i=0; i<N; ++i) {
          pegs[i] = [];
          for (j=0; j<=i; ++j) {
              pegs[i][j] = undefined;
          }
      }
      
      return {
          'N' : N,
          'pegs' : pegs,
          'setN' : function (N) {
              this.N = N;
          },
          'getN' : function (N) {
              return this.N;
          },
          'position_is_valid' : function(p) {
              return (p.i>=0 && p.i<this.N && p.j>=0 && p.j<=p.i);
          },
          'position_possible_moves' : function(p) {
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
          },
          'insert_peg' : function(i,j,peg) {
              if (this.position_is_valid(Position(i,j))) {
                  if (peg === undefined) { peg = true; }
                  if (this.pegs[i] == undefined) {
                      this.pegs[i] = [];
                  } else {
                      // excption
                  }
                  this.pegs[i][j] = peg;
              }
          },
          'get_peg' : function(i,j) {
              if (this.position_is_valid(Position(i,j))) {
                  if (this.pegs[i] !== undefined) {
                      return this.pegs[i][j];
                  }
              }
              return undefined;
          },
          'contains_peg' : function(i,j) {
              if (this.position_is_valid(Position(i,j))) {
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

      };
  }

  window.tripeg_logic = {
      'Direction'      : Direction,
      'Position'       : Position,
      'Move'           : Move,
      'Board'          : Board,
      'six_directions' : six_directions
      };

}());
