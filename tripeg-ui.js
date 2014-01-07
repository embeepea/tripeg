/*
 * This file works along with the accompanying index.html file to create a graphics
 * display and user interface for the triangle puzzle.  This files uses jQuery and
 * tripeg-graphics.js.
 */
(function($,tripeg_graphics) {

    var peg_click_allowed = true,
        maxrows = 6,
        minrows = 4,
        click_a_peg_message = "Click a peg to change the initial empty position",
        highlighted_peg = undefined,
        highlighted_pos = undefined,
        trGraphics;

    function display_message(msg) {
        $('#message').html(msg);
    }
    function clear_message() {
        $('#message').html(" ");
    }

    function splash_message(txt) {
        $('#splash-message').html(txt);
        $('#splash-message-container').show();
        setTimeout(function() {
            $('#splash-message-container').fadeOut(400);
        }, 500);
    }

    function reset() {
        // Reset the canvas size, and the size of its container, based on the computed
        // size in the trGraphics object.  And then reset the trGraphics object, which
        // causes it to draw a fresh board.
        $('#thecanvas').attr('width', trGraphics.canvas_width);
        $('#thecanvas').attr('height', trGraphics.canvas_height);
        $('#container').css('width', (trGraphics.canvas_width) + 'px');
        trGraphics.reset();
    }

    function change_rows(incr) {
        // change the number of rows in the board
        var N = trGraphics.get_rows();
        N = N + incr;
        if (N >= minrows && N <= maxrows) {
            trGraphics.set_rows(N);
            reset();
        }
        if (N <= minrows) {
            $('#minus').prop('disabled', true);
        } else {
            $('#minus').prop('disabled', false);
        }
        if (N >= maxrows) {
            $('#plus').prop('disabled', true);
        } else {
            $('#plus').prop('disabled', false);
        }
        display_message(click_a_peg_message);
        $('#play').prop('disabled', false);
        peg_click_allowed = true;
    }

    $(document).ready(function() {

        $('#splash-message-container').hide();

        trGraphics = tripeg_graphics.TripegGraphics($('#thecanvas')[0].getContext("2d"), 5);
        reset();

        display_message(click_a_peg_message);

        $('#play').click(function() {
            var $icon = $(this).find('i');
            clear_message();
            $('#play').prop('disabled', true);
            peg_click_allowed = false;
            display_message("Thinking...");
            setTimeout(function() {
                trGraphics.solve({
                    'done' : function() {
                        $('#rotate-left').prop('disabled', false);
                    },
                    'nosolution' : function() {
                        splash_message("No solution");
                        $('#rotate-left').prop('disabled', false);
                        $('#play').prop('disabled', false);
                        peg_click_allowed = true;
                    },
                    'timelog' : function (ms) {
                        display_message("Solution computed in " + ms + " ms");
                    }
                });
            }, 10);
        });
        $('#rotate-left').click(function() {
            trGraphics.reset();
            display_message(click_a_peg_message);
            $('#play').prop('disabled', false);
            $('#rotate-left').prop('disabled', true);
            peg_click_allowed = true;
        }).prop('disabled', true);

        $('#plus').click(function() {
            change_rows(1);
        });
        $('#minus').click(function() {
            change_rows(-1);
        });

        $('#thecanvas').click(function() {
            if (highlighted_peg !== undefined) {
                highlighted_peg.highlight(false);
                highlighted_peg = undefined;
                trGraphics.moveToEmpty(highlighted_pos);
            }
        });

        $('#thecanvas').mousemove(function(event) {
            if (peg_click_allowed) {
                var peg_is_highlighted = false;
                if (trGraphics.point_in_triangle(event.offsetX, event.offsetY)) {
                    var p = trGraphics.peg_position_under_point([event.offsetX, event.offsetY]);
                    if (p) {
                        peg_is_highlighted = true;
                        highlighted_pos = p;
                        highlighted_peg = trGraphics.get_peg(p);
                        if (!highlighted_peg.highlighted) {
                            highlighted_peg.highlight(true, trGraphics.get_empty_position());
                            $('#thecanvas').css('cursor', 'pointer');
                            trGraphics.request_draw();
                            return;
                        }
                    }
                }
                if (!peg_is_highlighted && highlighted_peg !== undefined) {
                    highlighted_peg.highlight(false);
                    highlighted_peg = undefined;
                    $('#thecanvas').css('cursor', 'default');
                    trGraphics.request_draw();
                }
            }
        });

    });

}(jQuery,window.tripeg_graphics));
