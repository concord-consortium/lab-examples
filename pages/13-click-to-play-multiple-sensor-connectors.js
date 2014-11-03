(function() {

  window.phones = {};

  window.setupPhone = function(id) {
    setTimeout(function() {
      var phone = phones[id];

      phone.addListener('play', function() {
        for (var phoneId in phones) {
          if (phoneId == id) { continue; }
          // Tell the model to pause
          var phone = phones[phoneId];
          phone.post({type: 'stop'});
        }
      }, []);
    }, 10);
  };

  window.createPhone = function(id) {
    return new iframePhone.ParentEndpoint($(id)[0], function() {
      setupPhone(id);
    });
  };

})();



function setupClickToPlay(interactive_id, image_id, click_id) {
  var interactive_url = $(interactive_id).attr("data-interactive-url");
  var id = interactive_id + " iframe";
  // set up click-to-play
  $(click_id).removeClass('unavailable');
  $(image_id + " .error").addClass('unavailable');

  $(click_id).click(function() {
    // If a model has already been loaded, just leave it be. It will be stopped when another model's play is clicked.

    // Load this model.
    console.log("clicked on it");
    $(interactive_id).removeClass('unavailable');
    $(image_id).addClass('unavailable');
    $(click_id).addClass('unavailable');
    setTimeout(function() {
      // FIXME! Use the correct url.
      $(id).attr('src', interactive_url);
      // Create the phone for this model.
      phones[id] = window.createPhone(id);
    }, 10);
  });

  phones[id] = window.createPhone(id);
}

function setupModelName(interactive_id, sensor_name) {
  var id = interactive_id + " iframe";
  phones[id].addListener('modelLoaded', function(){
    phones[id].post('set', {name: 'clientName', value: sensor_name});
  });
  phones[id].post('set', {name: 'clientName', value: sensor_name});
}

$(document).ready(function() {
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36521", "#model_image_embeddable__diy__sensor_36521", "#click_to_play_embeddable__diy__sensor_36521");
  setupModelName("#model_interactive_embeddable__diy__sensor_36521", "Sensor 1");
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36522", "#model_image_embeddable__diy__sensor_36522", "#click_to_play_embeddable__diy__sensor_36522");
  setupModelName("#model_interactive_embeddable__diy__sensor_36522", "Sensor 2");
});

