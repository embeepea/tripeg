(function($) {

    $(document).ready(function() {

        $('#play').click(function() {
            console.log('play button clicked');
            $('#rotate-left').prop('disabled', true);
            tripeg.play();
        });
        $('#step-forward').click(function() {
            console.log('step-forward button clicked');
            $('#rotate-left').prop('disabled', false);
        });
        $('#step-backward').click(function() {
            console.log('step-backward button clicked');
        });
        $('#fast-backward').click(function() {
            console.log('fast-backward button clicked');
        });
        $('#rotate-right').click(function() {
            console.log('rotate-right button clicked');
        });
        $('#rotate-left').click(function() {
            console.log('rotate-left button clicked');
            tripeg.reset();
        });

    });

}(jQuery));
