(function () {
  var phones = {};

  function setupPhone(id) {
    setTimeout(function() {
      var phone = phones[id];

      phone.addDispatchListener('play', function() {
        for (var phoneId in phones) {
          if (phoneId == id) { continue; }
          // Tell the model to pause
          var phone = phones[phoneId];
          phone.post({'type': 'stop'});
        }
      }, []);
    }, 10);
  }

  function createPhone(id) {
    return new Lab.IFramePhone($(id)[0], function() {
      setupPhone(id);
    });
  }

  for (var i = 1; i <= 3; i++) {
    var id = '#interactive-iframe'+i;
    phones[id] = createPhone(id);
  }
})();