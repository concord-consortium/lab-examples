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


  var verbose = true;
  var log     = function(msg) { if(console && verbose) { console.log(msg); }};

  window.connectPredictionToSensor = function (pred_dom, sensor_dom) {

    var predictionPhone = new iframePhone.ParentEndpoint(pred_dom, function () {
      log("Connection with prediction Lab iframe established.");
    });

    var sensorPhone = new iframePhone.ParentEndpoint(sensor_dom, function () {
      log("Connection with sensor Lab iframe established.");
    });

    var predictionModelLoaded = false,
        sensorModelLoaded = false;

    var _registerRelay = function(eventName) {
        predictionPhone.addListener("prediction-dataset-"+eventName, function(evt) {
          sensorPhone.post('sendDatasetEvent', {eventName: eventName, datasetName: 'sensor-dataset', data: evt.data });
        });
        predictionPhone.post('listenForDatasetEvent', {eventName: eventName, datasetName: 'prediction-dataset'});
    };

    var setupCoordination = function() {
      var events = ['sampleAdded', 'sampleRemoved'],
          i;
      for (i = 0; i < events.length; i++) {
        _registerRelay(events[i]);
      }
    };

    var initializeInteractives = function() {
      predictionPhone.addListener('modelLoaded', function(){
        predictionModelLoaded = true;
        if (sensorModelLoaded) {
          setupCoordination();
        }
      });
      sensorPhone.addListener('modelLoaded', function(){
        sensorModelLoaded = true;
        if (predictionModelLoaded) {
          setupCoordination();
        }
      });
    };

    initializeInteractives();
  };
})();



function setupClickToPlay(interactive_id, image_id, click_id) {
  var interactive_url = $(interactive_id).attr("data-interactive-url");
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
      var id = interactive_id + " iframe";
      // FIXME! Use the correct url.
      $(id).attr('src', interactive_url);
      // Create the phone for this model.
      phones[id] = window.createPhone(id);
    }, 10);
  });
}

$(document).ready(function() {
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36521", "#model_image_embeddable__diy__sensor_36521", "#click_to_play_embeddable__diy__sensor_36521");
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36522", "#model_image_embeddable__diy__sensor_36522", "#click_to_play_embeddable__diy__sensor_36522");
});

