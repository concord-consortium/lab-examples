// Call this function when jQuery thinks the page is ready.
$(function () {
  // Intitialization.
  var predictionPhone = new iframePhone.ParentEndpoint($('#prediction-iframe')[0], function () {
    console.log("Connection with prediction Lab iframe established.");
  });

  var sensorPhone = new iframePhone.ParentEndpoint($('#sensor-iframe')[0], function () {
    console.log("Connection with sensor Lab iframe established.");
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

    predictionPhone.post("loadInteractive", {
      "title": "Prediction",
      "publicationStatus": "draft",
      "subtitle": "Draw a prediction of temperature.",
      "about": "",
      "aspectRatio": "1.75",
      "fontscale": 0.9,
      "models": [
        {
          "type": "iframe-model",
          "id": "empty",
          "model": {
            "url": ""
          },
          "viewOptions": {
            "viewPortWidth": 0,
            "viewPortHeight": 0,
            "controlButtons": "",
            "showClock": false
          }
        }
      ],
      "dataSets": [
        {
          "name": "prediction-dataset",
          "properties": [
            "time",
            "prediction"
          ],
          "streamDataFromModel": false,
          "clearOnModelReset": false,
          "initialData": {
            "time": [],
            "prediction": []
          }
        }
      ],
      "components": [
        {
          "type": "graph",
          "id": "predictionGraph",
          "dataSet": "prediction-dataset",
          "title": "",
          "xlabel": "Time (s)",
          "ylabel": "Temperature (degC)",
          "ymin":  0,
          "ymax": 40,
          "xmin":  0,
          "xmax": 30,
          "xTickCount": 5,
          "xFormatter": ".2s",
          "yFormatter": ".2s",
          "properties": [
            "prediction"
          ],
          "xProperty": [
            "time"
          ],
          "enableSelectionButton": false,
          "enableDrawButton": true,
          "resetAxesOnReset": false,
          "dataColors": [
            "#a00000",
            "#2ca000",
            "#2c00a0"
          ]
        },
        {
          "type": "button",
          "id": "clear-button",
          "text": "Clear",
          "tooltip": "Clear the prediction.",
          "action": [
            "clearDataSet('prediction-dataset');"
          ]
        }
      ],
      "template": [
        {
          "id": "above",
          "top": "model.top",
          "padding-top": "0em",
          "bottom": "below.top",
          "padding-bottom": "2.5em",
          "width": "interactive.width",
          "padding-right": "1em"
        },
        {
          "id": "below",
          "width": "interactive.width",
          "height": "2em",
          "align": "center",
          "bottom": "interactive.bottom"
        }
      ],
      "layout": {
        "above": ["predictionGraph"],
        "below": ["clear-button"]
      }
    });

    sensorPhone.post("loadInteractive", {
      "title": "Sensor",
      "publicationStatus": "draft",
      "subtitle": "Collect temperature data from a sensor.",
      "about": "",
      "aspectRatio": "1.75",
      "fontscale": 0.9,
      "models": [
        {
          "type": "iframe-model",
          "id": "empty",
          "model": {
            "url": ""
          },
          "viewOptions": {
            "viewPortWidth": 0,
            "viewPortHeight": 0,
            "controlButtons": "",
            "showClock": false
          }
        }
      ],
      "dataSets": [
        {
          "name": "sensor-dataset",
          "properties": [
            "time",
            "prediction",
            "sensor"
          ],
          "streamDataFromModel": false,
          "clearOnModelReset": false,
          "initialData": {
            "time": [],
            "prediction": [],
            "sensor": []
          }
        }
      ],
      "components": [
        {
          "type": "graph",
          "id": "sensorGraph",
          "dataSet": "sensor-dataset",
          "title": "",
          "xlabel": "Time (s)",
          "ylabel": "Temperature (degC)",
          "ymin":  0,
          "ymax": 40,
          "xmin":  0,
          "xmax": 30,
          "xTickCount": 5,
          "xFormatter": ".2s",
          "yFormatter": ".2s",
          "properties": [
            "prediction",
            "sensor"
          ],
          "xProperty": [
            "time"
          ],
          "enableSelectionButton": false,
          "enableDrawButton": true,
          "drawProperty": "sensor",
          "resetAxesOnReset": false,
          "dataColors": [
            "#a00000",
            "#2ca000",
            "#2c00a0"
          ]
        },
        {
          "type": "button",
          "id": "clear-button",
          "text": "Clear",
          "tooltip": "Clear the sensor data.",
          "action": [
            "clearDataSet('sensor-dataset');"
          ]
        }
      ],
      "template": [
        {
          "id": "above",
          "top": "model.top",
          "padding-top": "0em",
          "bottom": "below.top",
          "padding-bottom": "2.5em",
          "width": "interactive.width",
          "padding-right": "1em"
        },
        {
          "id": "below",
          "width": "interactive.width",
          "height": "2em",
          "align": "center",
          "bottom": "interactive.bottom"
        }
      ],
      "layout": {
        "above": ["sensorGraph"],
        "below": ["clear-button"]
      }
    });
    console.log("Interactive JSON sent.");
  }

  initializeInteractives();

});
