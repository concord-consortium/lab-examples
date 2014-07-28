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
    var predictionPhone = phones[pred_dom],
        sensorPhone     = phones[sensor_dom],
        haveSeenEvents  = false;

    var _registerRelay = function(eventName) {
        predictionPhone.addListener("prediction-dataset-"+eventName, function(evt) {
          haveSeenEvents = true;
          console.log("relaying: ", eventName, evt);
          sensorPhone.post('sendDatasetEvent', {eventName: eventName, datasetName: 'sensor-dataset', data: evt.data });
        });
        predictionPhone.post('listenForDatasetEvent', {eventName: eventName, datasetName: 'prediction-dataset'});
    };

    var setupCoordination = function() {
      var events = ['sampleAdded', 'sampleRemoved', 'dataReset'],
          i;
      for (i = 0; i < events.length; i++) {
        _registerRelay(events[i]);
      }
    };

    var setupPeriodicSync = function() {
      // periodically send the complete prediction dataset over
        predictionPhone.addListener("dataset", function(evt) {
          sensorPhone.post('sendDatasetEvent', {eventName: 'dataReset', datasetName: 'sensor-dataset', data: evt.value.initialData });
        });
        setInterval(function() {
          if (haveSeenEvents) {
            predictionPhone.post('getDataset', 'prediction-dataset');
            haveSeenEvents = false;
          }
        }, 10000);

      // Also send the complete prediction dataset if the sensor interactive is loaded/reset
      sensorPhone.addListener("modelLoaded", function(evt) {
        predictionPhone.post('getDataset', 'prediction-dataset');
      });
    };

    setupCoordination();
    setupPeriodicSync();
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

$(document).ready(function() {
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36521", "#model_image_embeddable__diy__sensor_36521", "#click_to_play_embeddable__diy__sensor_36521");
  setupClickToPlay("#model_interactive_embeddable__diy__sensor_36522", "#model_image_embeddable__diy__sensor_36522", "#click_to_play_embeddable__diy__sensor_36522");
  connectPredictionToSensor("#model_interactive_embeddable__diy__sensor_36521 iframe", "#model_interactive_embeddable__diy__sensor_36522 iframe");
});

