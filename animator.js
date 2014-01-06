(function() {

    var animator = window.animator = {};

    function getopt(options, opt, defaultValue) {
        return (options && options[opt]!==undefined) ? options[opt] : defaultValue;
    }

    animator.Animator = function(options) {
        var frameDelayMS = getopt(options, 'frameDelayMS', 10); // ms delay between frames
        var interMoveDelay = getopt(options, 'interMoveDelay', 150); // ms delay between frames
        var draw = getopt(options, 'draw', function() {}); // 'draw' function

        var moves = [];

        var obj = {};

        obj.play = function() {
            if (moves.length > 0) {
                move = moves.shift();
                move.begin();
            }
        };

        obj.add_move = function(move) {
            var amove = {};
            amove.begin = function() {
                move.begin();
                amove.step();
            };
            amove.step = function() {
                var done = (move.step === undefined) || move.step();
                if (done) {
                    amove.end();
                } else {
                    setTimeout(function() {
                        requestAnimationFrame(function() {
                            draw();
                            amove.step();
                        });
                    }, frameDelayMS);
                }
            };
            amove.end = function() {
                if (move.end !== undefined) {
                    move.end();
                }
                requestAnimationFrame(function() {
                    draw();
                    setTimeout(function() { obj.play() }, interMoveDelay);
                });
            };
            moves.push(amove);
        };

        obj.request_draw = function() {
            requestAnimationFrame(function() { draw(); });
        };

        return obj;

    };

}());
