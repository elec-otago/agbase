var goToContact = false;

function scrollToAnchor(aid){
    var aTag = $("a[name='"+ aid +"']");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}


$(document).ready(function(){

    $('#aboutMoogle').on('hidden.bs.modal', function () {
        console.log('Modal Closed');
        if(goToContact){
            scrollToAnchor('contact');
            goToContact = false;
        }
    });

    $("#login-button").click(function() {
        console.log('click');
    });

    $('#contactButton').click(function(){
        console.log('Contact Clicked');
        goToContact = true;
        $('#aboutMoogle').modal('hide');
    });

});


$.getJSON("https://" +  window.location.host + "/api/version",function(response){
  $("em.version").text(" v"+ response.version);
});


