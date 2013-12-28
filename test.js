/*global describe, it, beforeEach, expect, xit, jasmine */
/*jshint laxbreak:true */

describe("Tripeg Logic", function () {
    "use strict";

//   console.log(window.tripeg_logic);

    var tripeg_logic = window.tripeg_logic,
        Direction = tripeg_logic.Direction,
        Position = tripeg_logic.Position,
        Move = tripeg_logic.Move,
        Board = tripeg_logic.Board;

    function map(arr, func) {
      var ans = [], i;
      for (i=0; i<arr.length; ++i) {
          ans.push(func(arr[i]));
      }
      return ans;
    }

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

    describe("Direction", function() {

      it("should be able to create a Direction", function () {
          var d = Direction(0,1)
          expect(d).not.toBeUndefined();
      });
      it("should be able to access the i,j fields of a Direction", function () {
          var d = Direction(2,1)
          expect(d.i).toEqual(2);
          expect(d.j).toEqual(1);
      });
      it("six_directions should have six elements", function () {
          expect(tripeg_logic.six_directions.length).toEqual(6);
      });

      describe("times method", function() {
          it("should return the correct result", function () {
              var d = Direction(1,2);
              var d2 = d.times(2);
              expect(d2.i).toEqual(2);
              expect(d2.j).toEqual(4);
          });
          it("should leave the original Direction unmodified", function () {
              var d = Direction(1,2);
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
                var d = Direction(3,4);
                var q = p.add(d);
                expect(q.i).toEqual(4);
                expect(q.j).toEqual(6);
            });
            it("should leave the original position unmodified", function () {
                var p = Position(1,2);
                var d = Direction(3,4);
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


    describe("Board", function() {
        it("should be able to create a Board", function () {
            expect(typeof(Board)).toBe("function");
            var b = Board(8);
            expect(b).not.toBeUndefined();
            expect(b.getN()).toEqual(8);
        });
        describe("N", function() {
            it("getN method should exist", function () {
                expect(typeof(b.getN)).toBe("function");
            });
            it("setN method should exist", function () {
                expect(typeof(b.setN)).toBe("function");
            });
            it("N should default to 5", function () {
                expect(b.getN()).toEqual(5);
            });
            it("should be able to setN, then get the same value with getN", function () {
                b.setN(17);
                expect(b.getN()).toEqual(17);
            });
        });


        describe("position_is_valid method", function() {

            it("method should exist", function () {
                expect(typeof(b.position_is_valid)).toBe("function");
            });

            it("should return true for valid positions (N=5)", function () {
                var b = Board(5);
                expect(b.position_is_valid(Position(0,0))).toBe(true);
                expect(b.position_is_valid(Position(1,0))).toBe(true);
                expect(b.position_is_valid(Position(1,1))).toBe(true);
                expect(b.position_is_valid(Position(2,0))).toBe(true);
                expect(b.position_is_valid(Position(2,1))).toBe(true);
                expect(b.position_is_valid(Position(2,2))).toBe(true);
                expect(b.position_is_valid(Position(3,0))).toBe(true);
                expect(b.position_is_valid(Position(3,1))).toBe(true);
                expect(b.position_is_valid(Position(3,2))).toBe(true);
                expect(b.position_is_valid(Position(3,3))).toBe(true);
                expect(b.position_is_valid(Position(4,0))).toBe(true);
                expect(b.position_is_valid(Position(4,1))).toBe(true);
                expect(b.position_is_valid(Position(4,2))).toBe(true);
                expect(b.position_is_valid(Position(4,3))).toBe(true);
                expect(b.position_is_valid(Position(4,4))).toBe(true);
            });
            it("should return false for invalid positions (N=5)", function () {
                var b = Board(5);
                expect(b.position_is_valid(Position(0,1))).toBe(false);
                expect(b.position_is_valid(Position(1,-1))).toBe(false);
                expect(b.position_is_valid(Position(1,2))).toBe(false);
                expect(b.position_is_valid(Position(2,-1))).toBe(false);
                expect(b.position_is_valid(Position(2,3))).toBe(false);
                expect(b.position_is_valid(Position(3,-1))).toBe(false);
                expect(b.position_is_valid(Position(3,4))).toBe(false);
                expect(b.position_is_valid(Position(3,12))).toBe(false);
                expect(b.position_is_valid(Position(4,-2))).toBe(false);
                expect(b.position_is_valid(Position(4,5))).toBe(false);
                expect(b.position_is_valid(Position(4,6))).toBe(false);
                expect(b.position_is_valid(Position(5,0))).toBe(false);
                expect(b.position_is_valid(Position(5,-1))).toBe(false);
                expect(b.position_is_valid(Position(5,6))).toBe(false);
                expect(b.position_is_valid(Position(5,3))).toBe(false);
            });
            it("should return true for valid positions (N=3)", function () {
                var b = Board(3);
                expect(b.position_is_valid(Position(0,0))).toBe(true);
                expect(b.position_is_valid(Position(1,0))).toBe(true);
                expect(b.position_is_valid(Position(1,1))).toBe(true);
                expect(b.position_is_valid(Position(2,0))).toBe(true);
                expect(b.position_is_valid(Position(2,1))).toBe(true);
                expect(b.position_is_valid(Position(2,2))).toBe(true);
            });
            it("should return false for invalid positions (N=3)", function () {
                var b = Board(3);
                expect(b.position_is_valid(Position(0,1))).toBe(false);
                expect(b.position_is_valid(Position(1,-1))).toBe(false);
                expect(b.position_is_valid(Position(1,2))).toBe(false);
                expect(b.position_is_valid(Position(2,-1))).toBe(false);
                expect(b.position_is_valid(Position(2,3))).toBe(false);
                expect(b.position_is_valid(Position(3,-1))).toBe(false);
                expect(b.position_is_valid(Position(3,0))).toBe(false);
                expect(b.position_is_valid(Position(3,1))).toBe(false);
                expect(b.position_is_valid(Position(3,2))).toBe(false);
                expect(b.position_is_valid(Position(3,3))).toBe(false);
                expect(b.position_is_valid(Position(3,4))).toBe(false);
            });
        });


        describe("position_possible_moves method", function() {
            describe("with N=5", function() {
                it("Position(0,0) should have 2 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(0,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(0,0) -> (1,0) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(0,0) -> (1,1) -> (2,2)")).toBe(true);
                });
                it("Position(1,0) should have 2 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(1,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(1,0) -> (2,0) -> (3,0)")).toBe(true);
                    expect(array_contains(moves, "(1,0) -> (2,1) -> (3,2)")).toBe(true);
                });
                it("Position(2,0) should have 4 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(2,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(4);
                    expect(array_contains(moves, "(2,0) -> (1,0) -> (0,0)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (2,1) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (3,1) -> (4,2)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (3,0) -> (4,0)")).toBe(true);
                });
                it("Position(2,1) should have 2 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(2,1)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(2,1) -> (3,1) -> (4,1)")).toBe(true);
                    expect(array_contains(moves, "(2,1) -> (3,2) -> (4,3)")).toBe(true);
                });
                it("Position(4,4) should have 2 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(4,4)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(4,4) -> (3,3) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(4,4) -> (4,3) -> (4,2)")).toBe(true);
                });
                it("Position(4,2) should have 4 possible moves", function() {
                    var b = Board(5);
                    var moves = map(b.position_possible_moves(Position(4,2)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(4);
                    expect(array_contains(moves, "(4,2) -> (3,1) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (3,2) -> (2,2)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (4,3) -> (4,4)")).toBe(true);
                    expect(array_contains(moves, "(4,2) -> (4,1) -> (4,0)")).toBe(true);
                });
            });

            describe("with N=4", function() {
                it("Position(0,0) should have 2 possible moves", function() {
                    var b = Board(4);
                    var moves = map(b.position_possible_moves(Position(0,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(0,0) -> (1,0) -> (2,0)")).toBe(true);
                    expect(array_contains(moves, "(0,0) -> (1,1) -> (2,2)")).toBe(true);
                });
                it("Position(1,0) should have 2 possible moves", function() {
                    var b = Board(4);
                    var moves = map(b.position_possible_moves(Position(1,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(1,0) -> (2,0) -> (3,0)")).toBe(true);
                    expect(array_contains(moves, "(1,0) -> (2,1) -> (3,2)")).toBe(true);
                });
                it("Position(2,0) should have 2 possible moves", function() {
                    var b = Board(4);
                    var moves = map(b.position_possible_moves(Position(2,0)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(2);
                    expect(array_contains(moves, "(2,0) -> (1,0) -> (0,0)")).toBe(true);
                    expect(array_contains(moves, "(2,0) -> (2,1) -> (2,2)")).toBe(true);
                });
                it("Position(2,1) should have 0 possible moves", function() {
                    var b = Board(4);
                    var moves = map(b.position_possible_moves(Position(2,1)),
                                    function(x) { return x.toString(); });
                    expect(moves.length).toBe(0);
                });
            });


            describe("with N=7", function() {
                it("Position(4,2) should have 6 possible moves", function() {

                    var b = Board(7);
                    var moves = map(b.position_possible_moves(Position(4,2)),
                                    function(x) { return x.toString(); });
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



});
