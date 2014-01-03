(function($) {

    function click_peg_to_emtpy_message() {
        $('#message').html("Click a peg to change the location of the initial empty position");
    }
    function clear_message() {
        $('#message').html(" ");
    }

    $(document).ready(function() {

        click_peg_to_emtpy_message();

        $('#play').click(function() {
            var $icon = $(this).find('i');
            //$icon.removeClass('fa-play');
            //$icon.addClass('fa-pause');
            clear_message();
            $('#play').prop('disabled', true);
            tripeg.play(function() {
                //$icon.removeClass('fa-pause');
                //$icon.addClass('fa-play');
                $('#rotate-left').prop('disabled', false);
            });
        });
        $('#rotate-left').click(function() {
            tripeg.reset();
            click_peg_to_emtpy_message();
            $('#play').prop('disabled', false);
        }).prop('disabled', true);
        $('#step-forward').click(function() {
            console.log('step-forward button clicked');
        });
        $('#step-backward').click(function() {
            console.log('step-backward button clicked');
        });
        $('#rotate-right').click(function() {
            console.log('rotate-right button clicked');
        });
        $('#rotate-left').click(function() {
            console.log('rotate-left button clicked');
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
