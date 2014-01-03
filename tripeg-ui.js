(function($) {

    $(document).ready(function() {

        $('#play').click(function() {
            var $icon = $(this).find('i');
            $icon.removeClass('fa-play');
            $icon.addClass('fa-pause');
            tripeg.play(function() {
                $icon.removeClass('fa-pause');
                $icon.addClass('fa-play');
                $('#play').prop('disabled', true);
                $('#fast-backward').prop('disabled', false);
            });
        });
        $('#fast-backward').click(function() {
            tripeg.reset();
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

        $('#thecanvas').mousemove(function(event) {
            //console.log(event.clientX + ', ' + event.clientY);
            var peg_is_highlighted = false;
            if (tripeg.point_in_triangle(event.offsetX, event.offsetY)) {
                var p = tripeg.point_in_peg(event.offsetX, event.offsetY);
                if (p) {
                    peg_is_highlighted = true;
                    highlighted_peg = tripeg.board.get_peg(p[0], p[1]);
                    if (!highlighted_peg.highlighted) {
                        highlighted_peg.highlight(true);
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
                tripeg.request_draw();
            }
            //console.log(event);
        });

    });

}(jQuery));
