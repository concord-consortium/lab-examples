var interactive;
(function () {
  var $interactiveIframe = $('#interactive-iframe'),
      graph;
      graphData = [],
      dataIndex = 0,
      graphSamplePeriod = 0.05,
      graphOptions = {
        title:  "Area versus Applied Pressure",
        xlabel:  "Model Time (ps)",
        ylabel: "Pressure Times Area (pN⋅nm)",
        xmax:   1000,
        xmin:   0,
        ymax:   2500,
        ymin:   0,
        xTickCount: 4,
        yTickCount: 5,
        xFormatter: ".3r",
        yFormatter: ".2r",
        sample: graphSamplePeriod,
        realTime: true,
        fontScaleRelativeToParent: true
      };

  // private functions
  // this shouldn't be called until the model has loaded
  function addEventHook(name, func, props) {
    var privateName = name + '.graph';
    interactive.post('listenForDispatchEvent', {eventName: privateName, properties: props});
    interactive.addListener(privateName, func);
  }

  function removeEventHook(name) {
    var privateName = name + '.graph';
    interactive.post('removeListenerForDispatchEvent', privateName);
  }

  function addInteractiveEventListeners() {
    addEventHook("tick", function(props) {
      updateGraph(props);
    }, ['pressure', 'pressureTimesArea', 'area']);

    addEventHook('play', function(props) {
      if (graph.numberOfPoints() && props.tickCounter < graph.numberOfPoints()) {
        resetGraphData(props.tickCounter);
        graph.reset('#graph', graphOptions);
      }
    }, ['tickCounter']);

    addEventHook('reset', function(props) {
      renderGraph();
    }, ['displayTimePerTick']);

    addEventHook('stepForward', function(props) {
      if (props.newStep) {
        updateGraph();
      } else {
        graph.updateOrRescale(props.tickCounter);
      }
    }, ['tickCounter', 'newStep']);

    addEventHook('stepBack', function(props) {
      graph.updateOrRescale(props.tickCounter);
    }, ['tickCounter']);
  }

  function removeEventListeners() {
    // remove listeners
    removeEventHook("tick");
    removeEventHook('play');
    removeEventHook('reset');
    removeEventHook('stepForward');
    removeEventHook('stepBack');
  }

  function updateGraph(props) {
    graph.addPoint(updateGraphData(props));
  }

  function renderGraph() {
    resetGraphData();
    graphOptions.dataset = graphData;
    removeEventListeners();
    if (graph) {
      graph.reset('#graph', graphOptions);
    } else {
      graph = LabGrapher('#graph', graphOptions);
    }
    addInteractiveEventListeners();
  }

  // Add another sample of data to the graphData array of arrays.
  function updateGraphData(props) {
    var p = props.pressure;
        f = props.pressureTimesArea,
        a = props.area,
        point = [dataIndex++, f];
    graphData[0].push(point);
    return point;
  }

  // Reset the graphData arrays to a specific length by passing in an index value,
  // or empty the graphData arrays and initialize the first sample.
  function resetGraphData(index) {
    var i,
        len;
    if (index && graphData[0].length > index) {
      for (i = 0, len = graphData.length; i < len; i++) {
        graphData[i].length = index;
      }
      dataIndex = index;
      return index;
    } else {
      graphData = [[0]];
      dataIndex = 0;
      return 0;
    }
  }

  function setupGrapher() {
    graphSamplePeriod = 1;
    interactive.addListener('propertyValue', function(response) {
      if(response.name == 'displayTimePerTick') {
        graphSamplePeriod = response.value;
        graphOptions.sample = graphSamplePeriod;
        renderGraph();
      }
    });
    interactive.post('get', 'displayTimePerTick');
  }

  // Intitialization
  interactive = new iframePhone.ParentEndpoint($interactiveIframe[0]);
  interactive.addListener('modelLoaded', function(){
    setupGrapher();
  });
})();
