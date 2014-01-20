/* This file defines a single function, window.animator.Animator, which
 * returns an object that can be used to manage asynchronous animations
 * in a browser.  Invoke it like this to create an animator object:
 * 
 *     var animator = window.animator.Animator({
 *         'frameDelayMS' : NUMBER
 *         'interActionDelay' : NUMBER
 *         'draw' : FUNCTION
 *     });
 * 
 * `frameDelayMS` and `interActionDelay` should be numbers that give
 * the desired delay (in milliseconds) between animation frames, and
 * between animation "actions" (see below), respectively.  `draw`
 * should be a function which takes no arguments and which draws a
 * single frame of the animation (for example, it can be a function
 * which draws in a canvas element).
 * 
 * The animator object maintains a queue of "actions" to be animated; the
 * `add_action(action)` method adds an action to this queue.  An action
 * is an object which has properties named `begin`, `step`, and `end`,
 * whose values are functions.  When the animator "plays" an
 * action, it calls the action's `begin` method, then calls the action's
 * `step` method repeatedly until it returns a truthy value, and finally
 * calls the action's `done` method.
 * 
 * After each call to an action's `step` function, and also after calling
 * the action's `end` method, the animator calls the provided `draw`
 * function, and then waits for `frameDelayMS` milliseconds before the
 * next call to `step`, or the final call to `end`.
 * 
 * The animator starts playing the actions in its queue when its `play`
 * method is called.  `play` causes the animator to play each of the actions
 * in the queue, in order, removing each action from the queue once it has
 * been played.  This continues until the queue is empty.  At that point,
 * you can call `add_action` again to add more actions, then then `play`
 * again to start playing them.
 * 
 * The animator also has a `request_draw` method which can be use at
 * any time to request that the provided `draw` method be calle at the
 * next possible time.
 * 
 * This file uses Paul Irish's requestAnimationFrame polyfill, which
 * is available from:
 *   http://www.paulirish.com/2011/requestanimationframe-for-smart-animating
 * Any JS code using this file should load requestanimationframe.js first.
 */

var animator = module.exports = {};
require('./requestanimationframe');

function getopt(options, opt, defaultValue) {
    return (options && options[opt]!==undefined) ? options[opt] : defaultValue;
}

animator.Animator = function(options) {
    var frameDelayMS = getopt(options, 'frameDelayMS', 10);
    var interActionDelayMS = getopt(options, 'interActionDelayMS', 150);
    var draw = getopt(options, 'draw', function() {});

    var actions = [];

    var obj = {};

    obj.add_action = function(action) {
        var animator_action = {};
        animator_action.begin = function() {
            action.begin();
            animator_action.step();
        };
        animator_action.step = function() {
            var done = (action.step === undefined) || action.step();
            if (done) {
                animator_action.end();
            } else {
                setTimeout(function() {
                    requestAnimationFrame(function() {
                        draw();
                        animator_action.step();
                    });
                }, frameDelayMS);
            }
        };
        animator_action.end = function() {
            if (action.end !== undefined) {
                action.end();
            }
            requestAnimationFrame(function() {
                draw();
                setTimeout(function() { obj.play() }, interActionDelayMS);
            });
        };
        actions.push(animator_action);
    };

    obj.play = function() {
        if (actions.length > 0) {
            actions.shift().begin();
        }
    };

    obj.request_draw = function() {
        requestAnimationFrame(function() { draw(); });
    };

    return obj;

};
