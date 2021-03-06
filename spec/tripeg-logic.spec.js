/*global describe, it, beforeEach, expect, xit, jasmine */
/*jshint laxbreak:true */

var tripeg_logic = require('../src/tripeg-logic');

describe("Tripeg Logic", function () {
    "use strict";

    var Offset = tripeg_logic.Offset,
        Position = tripeg_logic.Position,
        Move = tripeg_logic.Move,
        BoardContext = tripeg_logic.BoardContext,
        Board = tripeg_logic.Board;

    function array_contains(arr, elem) {
        var i;
        for (i=0; i<arr.length; ++i) {
            if (arr[i] === elem) { return true; }
        }
        return false
    }

    var b;

    beforeEach(function () {
        b = Board(5);
    });

    describe("Offset", function() {

      it("should be able to create an Offset", function () {
          var d = Offset(0,1)
          expect(d).not.toBeUndefined();
      });
        it("should be able to access the i,j fields of an Offset", function () {
          var d = Offset(2,1)
          expect(d.i).toEqual(2);
          expect(d.j).toEqual(1);
      });
      it("six_neighbors should have six elements", function () {
          expect(tripeg_logic.six_neighbors.length).toEqual(6);
      });

      describe("times method", function() {
          it("should return the correct result", function () {
              var d = Offset(1,2);
              var d2 = d.times(2);
              expect(d2.i).toEqual(2);
              expect(d2.j).toEqual(4);
          });
          it("should leave the original Offset unmodified", function () {
              var d = Offset(1,2);
              var d2 = d.times(2);
              expect(d.i).toEqual(1);
              expect(d.j).toEqual(2);
          });
      });

    });

    describe("Position", function() {
        it("should be able to create a Position", function () {
            var p = Position(0,1);
            expect(p).not.toBeUndefined();
        });
        it("should be able to access the i,j fields of a Position", function () {
            var p = Position(2,1);
            expect(p.i).toEqual(2);
            expect(p.j).toEqual(1);
        });

        describe("add method", function() {
            it("should give the correct result", function () {
                var p = Position(1,2);
                var d = Offset(3,4);
                var q = p.add(d);
                expect(q.i).toEqual(4);
                expect(q.j).toEqual(6);
            });
            it("should leave the original position unmodified", function () {
                var p = Position(1,2);
                var d = Offset(3,4);
                var q = p.add(d);
                expect(p.i).toEqual(1);
                expect(p.j).toEqual(2);
            });
        });
        
    });

    describe("Move", function() {
        it("Move function should exist", function() {
            expect(typeof(Move)).toBe("function");
        });
        it("should be able to create a Move", function() {
            var m = Move(Position(1,2),Position(3,4),Position(5,6));
        });
        it("should be able to access the fields of a Move", function() {
            var m = Move(Position(1,2),Position(3,4),Position(5,6));
            expect(m.jumper.i).toEqual(1);
            expect(m.jumper.j).toEqual(2);
            expect(m.jumpee.i).toEqual(3);
            expect(m.jumpee.j).toEqual(4);
            expect(m.dest.i).toEqual(5);
            expect(m.dest.j).toEqual(6);
        });
    });


    describe("BoardContext", function() {
        it("should be able to create a BoardContext", function () {
            expect(typeof(BoardContext)).toBe("function");
            var bc = BoardContext(8);
            expect(bc).not.toBeUndefined();
            expect(bc.numRows).toEqual(8);
        });

        describe("num_slots method", function() {
            it("should return the correct number of slots for a 4-row board", function() {
                expect(BoardContext(4).num_slots()).toEqual(10);
            });
            it("should return the correct number of slots for a 5-row board", function() {
                expect(BoardContext(5).num_slots()).toEqual(15);
            });
            it("should return the correct number of slots for a 6-row board", function() {
                expect(BoardContext(6).num_slots()).toEqual(21);
            });
        });

        describe("position_is_valid method", function() {

            it("method should exist", function () {
                var bc = BoardContext(3);
                expect(typeof(bc.position_is_valid)).toBe("function");
            });

            it("should return true for valid positions (N=5)", function () {
                var bc = BoardContext(5);
                expect(bc.position_is_valid(Position(0,0))).toBe(true);
                expect(bc.position_is_valid(Position(1,0))).toBe(true);
                expect(bc.position_is_valid(Position(1,1))).toBe(true);
                expect(bc.position_is_valid(Position(2,0))).toBe(true);
                expect(bc.position_is_valid(Position(2,1))).toBe(true);
                expect(bc.position_is_valid(Position(2,2))).toBe(true);
                expect(bc.position_is_valid(Position(3,0))).toBe(true);
                expect(bc.position_is_valid(Position(3,1))).toBe(true);
                expect(bc.position_is_valid(Position(3,2))).toBe(true);
                expect(bc.position_is_valid(Position(3,3))).toBe(true);
                expect(bc.position_is_valid(Position(4,0))).toBe(true);
                expect(bc.position_is_valid(Position(4,1))).toBe(true);
                expect(bc.position_is_valid(Position(4,2))).toBe(true);
                expect(bc.position_is_valid(Position(4,3))).toBe(true);
                expect(bc.position_is_valid(Position(4,4))).toBe(true);
            });
            it("should return false for invalid positions (N=5)", function () {
                var bc = BoardContext(5);
                expect(bc.position_is_valid(Position(0,1))).toBe(false);
                expect(bc.position_is_valid(Position(1,-1))).toBe(false);
                expect(bc.position_is_valid(Position(1,2))).toBe(false);
                expect(bc.position_is_valid(Position(2,-1))).toBe(false);
                expect(bc.position_is_valid(Position(2,3))).toBe(false);
                expect(bc.position_is_valid(Position(3,-1))).toBe(false);
                expect(bc.position_is_valid(Position(3,4))).toBe(false);
                expect(bc.position_is_valid(Position(3,12))).toBe(false);
                expect(bc.position_is_valid(Position(4,-2))).toBe(false);
                expect(bc.position_is_valid(Position(4,5))).toBe(false);
                expect(bc.position_is_valid(Position(4,6))).toBe(false);
                expect(bc.position_is_valid(Position(5,0))).toBe(false);
                expect(bc.position_is_valid(Position(5,-1))).toBe(false);
                expect(bc.position_is_valid(Position(5,6))).toBe(false);
                expect(bc.position_is_valid(Position(5,3))).toBe(false);
            });
            it("should return true for valid positions (N=3)", function () {
                var bc = BoardContext(3);
                expect(bc.position_is_valid(Position(0,0))).toBe(true);
                expect(bc.position_is_valid(Position(1,0))).toBe(true);
                expect(bc.position_is_valid(Position(1,1))).toBe(true);
                expect(bc.position_is_valid(Position(2,0))).toBe(true);
                expect(bc.position_is_valid(Position(2,1))).toBe(true);
                expect(bc.position_is_valid(Position(2,2))).toBe(true);
            });
            it("should return false for invalid positions (N=3)", function () {
                var bc = BoardContext(3);
                expect(bc.position_is_valid(Position(0,1))).toBe(false);
                expect(bc.position_is_valid(Position(1,-1))).toBe(false);
                expect(bc.position_is_valid(Position(1,2))).toBe(false);
                expect(bc.position_is_valid(Position(2,-1))).toBe(false);
                expect(bc.position_is_valid(Position(2,3))).toBe(false);
                expect(bc.position_is_valid(Position(3,-1))).toBe(false);
                expect(bc.position_is_valid(Position(3,0))).toBe(false);
                expect(bc.position_is_valid(Position(3,1))).toBe(false);
                expect(bc.position_is_valid(Position(3,2))).toBe(false);
                expect(bc.position_is_valid(Position(3,3))).toBe(false);
                expect(bc.position_is_valid(Position(3,4))).toBe(false);
            });
        });


        describe("all_moves method", function() {
            describe("with N=5", function() {
                it("Position(0,0) should have 2 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(0,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(0,0) -> (1,0) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(0,0) -> (1,1) -> (2,2)")).toBe(true);
                });
                it("Position(1,0) should have 2 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(1,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(1,0) -> (2,0) -> (3,0)")).toBe(true);
                    expect(array_contains(moves, "(1,0) -> (2,1) -> (3,2)")).toBe(true);
                });
                it("Position(2,0) should have 4 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(2,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(4);
                    expect(array_contains(moves, "(2,0) -> (1,0) -> (0,0)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (2,1) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (3,1) -> (4,2)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (3,0) -> (4,0)")).toBe(true);
                });
                it("Position(2,1) should have 2 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(2,1)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(2,1) -> (3,1) -> (4,1)")).toBe(true);
                    expect(array_contains(moves, "(2,1) -> (3,2) -> (4,3)")).toBe(true);
                });
                it("Position(4,4) should have 2 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(4,4)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(4,4) -> (3,3) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(4,4) -> (4,3) -> (4,2)")).toBe(true);
                });
                it("Position(4,2) should have 4 possible moves", function() {
                    var bc = BoardContext(5);
                    var moves = bc.all_moves(Position(4,2)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(4);
                    expect(array_contains(moves, "(4,2) -> (3,1) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (3,2) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (4,3) -> (4,4)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (4,1) -> (4,0)")).toBe(true);
                });
            });

            describe("with N=4", function() {
                it("Position(0,0) should have 2 possible moves", function() {
                    var bc = BoardContext(4);
                    var moves = bc.all_moves(Position(0,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(0,0) -> (1,0) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(0,0) -> (1,1) -> (2,2)")).toBe(true);
                });
                it("Position(1,0) should have 2 possible moves", function() {
                    var bc = BoardContext(4);
                    var moves = bc.all_moves(Position(1,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(1,0) -> (2,0) -> (3,0)")).toBe(true);
                    expect(array_contains(moves, "(1,0) -> (2,1) -> (3,2)")).toBe(true);
                });
                it("Position(2,0) should have 2 possible moves", function() {
                    var bc = BoardContext(4);
                    var moves = bc.all_moves(Position(2,0)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(2,0) -> (1,0) -> (0,0)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (2,1) -> (2,2)")).toBe(true);
                });
                it("Position(2,1) should have 0 possible moves", function() {
                    var bc = BoardContext(4);
                    var moves = bc.all_moves(Position(2,1)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(0);
                });
            });


            describe("with N=7", function() {
                it("Position(4,2) should have 6 possible moves", function() {

                    var bc = BoardContext(7);
                    var moves = bc.all_moves(Position(4,2)).map(function(x) { return x.toString(); });
                    expect(moves.length).toBe(6);
                    expect(array_contains(moves, "(4,2) -> (3,1) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (3,2) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (4,3) -> (4,4)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (5,3) -> (6,4)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (5,2) -> (6,2)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (3,2) -> (2,2)")).toBe(true);
                });
            });

        });

    });


    describe("Board", function() {
        it("should be able to create a Board", function () {
            expect(typeof(Board)).toBe("function");
            var b = Board(8);
            expect(b).not.toBeUndefined();
        });
        it("board should receive the N value from its context", function () {
            expect(typeof(Board)).toBe("function");
            var b = Board(8);
            expect(b).not.toBeUndefined();
            expect(b.numRows).toEqual(8);
        });
        describe("insert_peg / contain_peg / get_peg / currentPegCount", function() {
            it("insert_peg method should exist", function() {
                var b = Board(5);
                expect(typeof(b.insert_peg)).toBe("function");
            });
            it("get_peg method should exist", function() {
                var b = Board(5);
                expect(typeof(b.get_peg)).toBe("function");
            });
            it("contains_peg method should exist", function() {
                var b = Board(5);
                expect(typeof(b.contains_peg)).toBe("function");
            });
            it("currentPegCount property should exist", function() {
                var b = Board(5);
                expect(typeof(b.currentPegCount)).toBe("number");
            });
            it("currentPegCount should initially be 0", function() {
                var b = Board(5);
                expect(b.currentPegCount).toBe(0);
            });
            it("get_peg/contains_peg should always return undefined/false if no pegs have been inserted", function() {
                var b = Board(5), i, j;
                for (i=-2; i<10; ++i) {
                    for (j=-2; j<10; ++j) {
                        expect(b.get_peg(Position(i,j))).toBeUndefined();
                        expect(b.contains_peg(Position(i,j))).toBe(false);
                    }
                }
            });
            it("should be able to insert a peg and get it back", function() {
                var b = Board(5);
                b.insert_peg(Position(2,2),13);
                expect(b.get_peg(Position(2,2))).toEqual(13);
                expect(b.contains_peg(Position(2,2))).toEqual(true);
            });
            it("currentPegCount should change from 0 to 1 when first peg is inserted", function() {
                var b = Board(5);
                expect(b.currentPegCount).toBe(0);
                b.insert_peg(Position(2,2),13);
                expect(b.currentPegCount).toBe(1);
            });
            it("after inserting just 1 peg, get_peg/contains/peg should still return undefined/false everywhere else", function() {
                var b = Board(5);
                var b = Board(5), i, j;
                b.insert_peg(Position(2,2),13);
                expect(b.get_peg(Position(2,2))).toEqual(13);
                expect(b.contains_peg(Position(2,2))).toEqual(true);
                for (i=-2; i<10; ++i) {
                    for (j=-2; j<10; ++j) {
                        if (! (i===2 && j===2)) {
                            expect(b.get_peg(Position(i,j))).toBeUndefined();
                            expect(b.contains_peg(Position(i,j))).toBe(false);
                        }
                    }
                }
            });

            it("currentPegCount should always reflect the correct number of pegs", function() {
                var b = Board(5);
                expect(b.currentPegCount).toBe(0);
                b.insert_peg(Position(2,2));
                expect(b.currentPegCount).toBe(1);
                b.insert_peg(Position(3,2));
                expect(b.currentPegCount).toBe(2);
                b.remove_peg(Position(3,2));
                expect(b.currentPegCount).toBe(1);
                b.insert_peg(Position(3,2));
                expect(b.currentPegCount).toBe(2);
                b.insert_peg(Position(4,1));
                expect(b.currentPegCount).toBe(3);
                b.insert_peg(Position(4,1));
                expect(b.currentPegCount).toBe(3);
                b.remove_peg(Position(4,1));
                expect(b.currentPegCount).toBe(2);
                b.remove_peg(Position(3,2));
                expect(b.currentPegCount).toBe(1);
                b.remove_peg(Position(2,2));
                expect(b.currentPegCount).toBe(0);
                b.remove_peg(Position(2,2));
                expect(b.currentPegCount).toBe(0);
            });


        });

        describe("remove_peg", function() {
            it("should remove a peg", function() {
                b = Board(5);
                b.insert_peg(Position(2,2));
                expect(b.contains_peg(Position(2,2))).toBe(true);
                b.remove_peg(Position(2,2));
                expect(b.contains_peg(Position(2,2))).toBe(false);
            });
        });


        describe("insert_peg_everywhere_except", function() {
            it("should insert a peg everywhere except in the designated position", function() {
                var b = Board(5), i, j;
                b.insert_peg_everywhere_except(Position(2,2),42);
                expect(b.contains_peg(Position(2,2))).toBe(false);
                for (i=0; i<5; ++i) {
                    for (j=0; j<=i; ++j) {
                        if (! (i===2 && j===2)) {
                            expect(b.get_peg(Position(i,j))).toEqual(42);
                            expect(b.contains_peg(Position(i,j))).toBe(true);
                        }
                    }
                }

            });
        });

        describe("move_allowed method", function() {
            it("exists", function() {
                var b = Board(5);
                expect(typeof(b.move_allowed)).toBe("function");
            });
            it("should not allow a move on an empty board", function() {
                var b = Board(5);
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                expect(b.move_allowed(m)).toBe(false);
            });
            it("should allow a valid move", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                b.insert_peg(Position(1,0));
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                expect(b.move_allowed(m)).toBe(true);
            });
            it("should not allow a move to an occupied destination", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                b.insert_peg(Position(1,0));
                b.insert_peg(Position(2,0));
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                expect(b.move_allowed(m)).toBe(false);
            });
            it("should not allow an emtpy spot to be jumped", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                expect(b.move_allowed(m)).toBe(false);
            });
            it("should not allow a move from an unoccupied position", function() {
                var b = Board(5);
                b.insert_peg(Position(1,0));
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                expect(b.move_allowed(m)).toBe(false);
            });

        });


        describe("move method", function() {
            it("exists", function() {
                var b = Board(5);
                expect(typeof(b.move)).toBe("function");
            });
            it("should correctly remove the jumper position", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                b.insert_peg(Position(1,0));
                expect(b.currentPegCount).toBe(2);
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                b = b.move(m);
                expect(b.contains_peg(Position(0,0))).toBe(false);
                expect(b.currentPegCount).toBe(1);
            });
            it("should correctly remove the jumpee position", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                b.insert_peg(Position(1,0));
                expect(b.currentPegCount).toBe(2);
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                b = b.move(m);
                expect(b.currentPegCount).toBe(1);
                expect(b.contains_peg(Position(1,0))).toBe(false);
            });
            it("should correctly insert the destination position", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0));
                b.insert_peg(Position(1,0));
                expect(b.currentPegCount).toBe(2);
                var m = Move(Position(0,0),Position(1,0),Position(2,0));
                b = b.move(m);
                expect(b.contains_peg(Position(2,0))).toBe(true);
                expect(b.currentPegCount).toBe(1);
            });

        });

        function check_board_clones(b,c) {
                var i,j;
                expect(b.N===c.N).toBe(true);
                for (i=0; i<5; ++i) {
                    for (j=0; j<=i; ++j) {
                        expect(b.get_peg(Position(i,j)) === c.get_peg(Position(i,j))).toBe(true);
                    }
                }
        }

        // still need: tests for 'clone' method
        describe("clone method", function() {
            it("empty board should clone properly (N=5)", function() {
                var b = Board(5);
                var c = b.clone();
                check_board_clones(b,c);
            });
            it("board with one peg should clone properly (N=5)", function() {
                var b = Board(5);
                b.insert_peg(Position(0,0),1);
                var c = b.clone();
                check_board_clones(b,c);
            });
        });


        // still need: tests for 'possible_moves' method
        describe("possible_moves method", function() {
            it("should return two moves for a new board with just one peg missing in slot 0,0", function() {
                var b = Board(5);
                b.insert_peg_everywhere_except(Position(0,0));
                var moves = b.possible_moves();
                expect(moves.length).toBe(2);
            });
        });

        describe("possible_moves method", function() {
            it("should solve a board", function() {
                var b = Board(5);
                b.insert_peg_everywhere_except(Position(0,0),1);
                var moves = b.solve();
                expect(moves.length).toBe(13);
                //console.log(map(moves, function(m) { return m.toString(); }).join("\n"));
            });
            it("should solve another board", function() {
                var b = Board(5);
                b.insert_peg_everywhere_except(Position(1,0),1);
                var moves = b.solve();
                expect(moves.length).toBe(13);
                //console.log(map(moves, function(m) { return m.toString(); }).join("\n"));
            });
        });

    });



});
