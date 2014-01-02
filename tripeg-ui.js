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

    });

}(jQuery));
