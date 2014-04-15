(function () {

  var interactives = [],
      interactiveIframes = document.querySelectorAll(".interactive");

  for (var i=0; i < interactiveIframes.length; i++ ) {
    interactives.push(new iframePhone.ParentEndpoint(interactiveIframes[i]));
  }

  interactives.forEach(function(interactive){
    interactive.addListener('modelLoaded', function(){
      interactive.post('listenForDispatchEvent', {eventName: 'play.coordination'});
      interactive.addListener('play.coordination', playListener.bind(interactive));
    });
  })

  function playListener () {
    var interactive = this;
    interactives.forEach(function (otherInteractive){
      if (otherInteractive != interactive) {
        otherInteractive.post('stop');
      }
    });
  }

})();
