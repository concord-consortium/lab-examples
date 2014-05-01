(function () {
  var interactive,
      $interactiveIframe = $('#interactive-iframe'),
      graph;
      graphData = [],
      dataIndex = 0,
      graphSamplePeriod = 0.05,
      graphOptions = {
        title:  "Area versus Applied Pressure",
        xlabel:  "Time",
        ylabel: "Pressure Times Area (pN⋅nm)",
        xmax:   1000,
        xmin:   0,
        ymax:   2500,
        ymin:   0,
        xTickCount: 4,
        yTickCount: 5,
        xFormatter: ".3r",
        yFormatter: ".3r",
        sample: graphSamplePeriod,
        realTime: true,
        fontScaleRelativeToParent: true
      };

  function setupGrapher() {
    graphSamplePeriod = 1;
    // this might be called a second time if the interactive has multiple
    // models
    // the old code also did: graphOptions.dataset = graphData;
    if (graph) {
      graph.reset('#graph', graphOptions);
      dataIndex = 0;
    } else {
      interactive.addListener('propertyValue', function(result){
        if(result.name == 'pressureTimesArea') {
          // update graph with result.value
          graph.addPoint([dataIndex++, result.value]);
        }
      });
      graph = LabGrapher('#graph', graphOptions);
    }

    // tell the interactive we want to observe the pressureTimesArea property
    interactive.post('observe', 'pressureTimesArea');
  }

  // Intitialization
  interactive = new iframePhone.ParentEndpoint($interactiveIframe[0]);
  interactive.addListener('modelLoaded', function(){
    setupGrapher();
  });
})();
