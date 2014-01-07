(function($) {

    var tg = window.tripeg_graphics;

    var trGraphics;

    var peg_click_allowed = true;

    var maxrows = 6;
    var minrows = 4;

    var click_a_peg_message = "Click a peg to change the initial empty position";

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

    function ui_reset() {
        $('#thecanvas').attr('width', trGraphics.canvas_width);
        $('#thecanvas').attr('height', trGraphics.canvas_height);
        $('#container').css('width', (trGraphics.canvas_width) + 'px');
        trGraphics.reset();
    }

    function change_rows(incr) {
        var N = trGraphics.get_rows();
        N = N + incr;
        if (N >= minrows && N <= maxrows) {
            trGraphics.set_rows(N);
            ui_reset();
            trGraphics.request_draw();
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

        trGraphics = tg.TripegGraphics($('#thecanvas')[0].getContext("2d"), 5);
        ui_reset();

        display_message(click_a_peg_message);

        $('#play').click(function() {
            var $icon = $(this).find('i');
            clear_message();
            $('#play').prop('disabled', true);
            peg_click_allowed = false;
            $('#message').html("Thinking...");
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
                        $('#message').html('Solution computed in ' + ms + ' ms');
                    }
                });
            }, 10);
        });
        $('#rotate-left').click(function() {
            trGraphics.reset();
            display_message(click_a_peg_message);
            $('#play').prop('disabled', false);
            peg_click_allowed = true;
        }).prop('disabled', true);

        $('#plus').click(function() {
            change_rows(1);
        });
        $('#minus').click(function() {
            change_rows(-1);
        });

        var highlighted_peg = undefined;
        var highlighted_pos = undefined;

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
                    //var p = tripeg.point_in_peg(event.offsetX, event.offsetY);
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

}(jQuery));
