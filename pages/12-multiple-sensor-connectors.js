// Call this function when jQuery thinks the page is ready.
var sensor1Phone, sensor2Phone, sensor3Phone;

$(function () {
  // Intitialization.
  sensor1Phone = new iframePhone.ParentEndpoint($('#sensor1-iframe')[0], function () {
    console.log("Connection with sensor1 Lab iframe established.");
  });

  sensor2Phone = new iframePhone.ParentEndpoint($('#sensor2-iframe')[0], function () {
    console.log("Connection with sensor2 Lab iframe established.");
  });

  sensor3Phone = new iframePhone.ParentEndpoint($('#sensor3-iframe')[0], function () {
    console.log("Connection with sensor3 Lab iframe established.");
  });

  var initializeInteractives = function() {
    sensor1Phone.addListener('modelLoaded', function(){
      sensor1Phone.post('set', {name: 'clientName', value: "Sensor1"});
    });
    sensor2Phone.addListener('modelLoaded', function(){
      sensor2Phone.post('set', {name: 'clientName', value: "Sensor2"});
    });
    sensor3Phone.addListener('modelLoaded', function(){
      sensor3Phone.post('set', {name: 'clientName', value: "Sensor3"});
    });
  };

  initializeInteractives();
});
