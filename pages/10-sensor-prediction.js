// Call this function when jQuery thinks the page is ready.
var predictionPhone, sensorPhone;

$(function () {
  // Intitialization.
  predictionPhone = new iframePhone.ParentEndpoint($('#prediction-iframe')[0], function () {
    console.log("Connection with prediction Lab iframe established.");
  });

  sensorPhone = new iframePhone.ParentEndpoint($('#sensor-iframe')[0], function () {
    console.log("Connection with sensor Lab iframe established.");
  });

  var predictionModelLoaded = false,
      sensorModelLoaded = false;

  var _registerRelay = function(eventName) {
      predictionPhone.addListener("prediction-dataset-"+eventName, function(evt) {
        sensorPhone.post('sendDatasetEvent', {eventName: eventName, datasetName: 'sensor-dataset', data: evt.data });
      });
      predictionPhone.post('listenForDatasetEvent', {eventName: eventName, datasetName: 'prediction-dataset'});

      // For debugging...
      predictionPhone.addListener('dataset', function(evt) {
        console.log("dataset", evt);
      });
      sensorPhone.addListener('dataset', function(evt) {
        console.log("dataset", evt);
      });
  };

  var setupCoordination = function() {
    var events = ['sampleAdded', 'sampleRemoved', 'dataReset'],
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
});
