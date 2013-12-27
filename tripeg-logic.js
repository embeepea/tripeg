(function() {
  var N = 5;

  var setN = function(newN) {
    N = newN;
  }
  var getN = function() {
    return N;
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
      },
      'is_valid' : function() {
        return (this.i>=0 && this.i<N && this.j>=0 && this.j<=this.i);
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

  var Board = function() {
  }

  window.tripeg_logic = {
      'Direction'      : Direction,
      'Position'       : Position,
      'Move'           : Move,
      'six_directions' : six_directions,
      'getN'           : getN,
      'setN'           : setN
      };

}());
