var iframePhone,
    $interactiveIframe = $('#interactive-iframe'),
    graph;
    graphData = [],
    dataIndex = 0,
    graphSamplePeriod = 0.05;

function setupGrapher(callback) {
  var graphOptions = {
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
  function addEventHook(name, func, props) {
    var privateName = name + '.graph';
    if (iframePhone) {
      iframePhone.addDispatchListener(privateName,func, props);
    }
  }

  function removeEventHook(name) {
    var privateName = name + '.graph';
    if (iframePhone) {
      iframePhone.removeDispatchListener(privateName);
    }
  }

  function addIframeEventListeners() {
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
      graph = Lab.grapher.Graph('#graph', graphOptions);
    }
    addIframeEventListeners();
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

  // Intitialization
  graphSamplePeriod = 1;
  if (iframePhone) {
    iframePhone.addListener('propertyValue', function(displayTimePerTick) {
      graphSamplePeriod = displayTimePerTick;
      graphOptions.sample = graphSamplePeriod;
      renderGraph();
    });
    iframePhone.post({
      'type': 'get',
      'propertyName': 'displayTimePerTick'
    });
  }
}

iframePhone = new Lab.IFramePhone($interactiveIframe[0], function() {
  setupGrapher();
});
