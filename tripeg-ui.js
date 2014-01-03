(function($) {

    function click_peg_to_emtpy_message() {
        $('#message').html("Click to change the initial empty position");
    }
    function clear_message() {
        $('#message').html(" ");
    }

    function splash(txt) {
        $('#splash-message').html(txt);
        $('#splash-message-container').show();
        setTimeout(function() {
            $('#splash-message-container').fadeOut(400);
        }, 500);
    }

    function incr_N(d) {
        var N = tripeg.get_N();
        N = N + d;
        if (N >= 4 && N <= 6) {
            tripeg.set_N(N);
            tripeg.request_draw();
        }
        if (N <= 4) {
            $('#minus').prop('disabled', true);
        } else {
            $('#minus').prop('disabled', false);
        }
        if (N >= 6) {
            $('#plus').prop('disabled', true);
        } else {
            $('#plus').prop('disabled', false);
        }
        $('#play').prop('disabled', false);
    }

    $(document).ready(function() {

        $('#splash-message-container').hide();

        click_peg_to_emtpy_message();

        $('#play').click(function() {
            var $icon = $(this).find('i');
            //$icon.removeClass('fa-play');
            //$icon.addClass('fa-pause');
            clear_message();
            $('#play').prop('disabled', true);
            tripeg.play(
                function() {
                    //$icon.removeClass('fa-pause');
                    //$icon.addClass('fa-play');
                    $('#rotate-left').prop('disabled', false);
                },
                function() {
                    splash("No solution");
                    $('#rotate-left').prop('disabled', false);
                    $('#play').prop('disabled', false);
                }
            );
        });
        $('#rotate-left').click(function() {
            tripeg.reset();
            click_peg_to_emtpy_message();
            $('#play').prop('disabled', false);
        }).prop('disabled', true);

        $('#plus').click(function() {
            incr_N(1);
        });
        $('#minus').click(function() {
            incr_N(-1);
        });

        var highlighted_peg = undefined;
        var highlighted_pos = undefined;

        $('#thecanvas').click(function() {
            if (highlighted_peg !== undefined) {
                tripeg.moveToEmpty(highlighted_pos);
            }
        });

        $('#thecanvas').mousemove(function(event) {
            //console.log(event.clientX + ', ' + event.clientY);
            var peg_is_highlighted = false;
            if (tripeg.point_in_triangle(event.offsetX, event.offsetY)) {
                var p = tripeg.point_in_peg(event.offsetX, event.offsetY);
                if (p) {
                    peg_is_highlighted = true;
                    highlighted_pos = p;
                    highlighted_peg = tripeg.board.get_peg(p[0], p[1]);
                    if (!highlighted_peg.highlighted) {
                        highlighted_peg.highlight(true);
                        $('#thecanvas').css('cursor', 'pointer');
                        tripeg.request_draw();
                        return;
                    }
                    //console.log(p);
                }
                //console.log(event.offsetX + ', ' + event.offsetY);
            }
            if (!peg_is_highlighted && highlighted_peg !== undefined) {
                highlighted_peg.highlight(false);
                highlighted_peg = undefined;
                $('#thecanvas').css('cursor', 'default');
                tripeg.request_draw();
            }
            //console.log(event);
        });

    });

}(jQuery));
