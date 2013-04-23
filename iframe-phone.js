/**
*/

function isStructuredCloneSupported() {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Safari 5.1 will sometimes throw an exception and sometimes won't, lolwut?
      // When it doesn't we capture the message event and check the
      // internal [[Class]] property of the message being passed through.
      // Safari will pass through DOM nodes as Null iOS safari on the other hand
      // passes it through as DOMWindow, gotcha.
      window.onmessage = function(e){
        var type = Object.prototype.toString.call(e.data);
        result = (type.indexOf("Null") != -1 || type.indexOf("DOMWindow") != -1) ? 1 : 0;
        featureSupported = {
          'structuredClones': result
        };
      };
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implimentations that support cloned data will throw.
      window.postMessage(document.createElement("a"),"*");
    } catch(e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      result = (e.DATA_CLONE_ERR || e.message == "Cannot post cyclic structures.") ? 1 : 0;
      featureSupported = {
        'structuredClones': result
      };
    }
  }
}

function setupIframeListenerFor(iframe, callback) {
  var iframeOrigin = iframe.src.match(/(.*?\/\/.*?)\//)[1],
      selfOrigin   = window.location.href.match(/(.*?\/\/.*?)\//)[1],
      iframePhone  = {},
      postMessageQueue = [],
      post = function(message) {
        if (iframePhone.connected) {
          // if we are laready connected ... send the message
          message.origin = selfOrigin;
          // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
          //     https://github.com/Modernizr/Modernizr/issues/388
          //     http://jsfiddle.net/ryanseddon/uZTgD/2/
          if (isStructuredCloneSupported()) {
            iframe.contentWindow.postMessage(message, iframeOrigin);
          } else {
            iframe.contentWindow.postMessage(JSON.stringify(message), iframeOrigin);
          }
        } else {
          // else queue up the messages to send after connection complete.
          postMessageQueue.push(message);
        }
      };

  iframePhone.connected = false;
  iframePhone.handlers = {};

  iframePhone.addListener = function(messageName,func) {
    iframePhone.handlers[messageName] = func;
  };

  iframePhone.removeListener = function(messageName) {
    iframePhone.handlers[messageName] = null;
  };

  iframePhone.addDispatchListener = function(eventName,func,properties) {
    iframePhone.addListener(eventName,func);
    iframePhone.post({
      'type': 'listenForDispatchEvent',
      'eventName': eventName,
      'properties': properties
    });
  };

  iframePhone.removeDispatchListener = function(messageName) {
    iframePhone.post({
      'type': 'removeListenerForDispatchEvent',
      'eventName': messageName
    });
    iframePhone.removeListener(messageName);
  };

  // when we receive 'hello':
  iframePhone.addListener('hello', function() {
    // This will be the first message sent in response to the 'hello'
    // from the embedded application.
    postMessageQueue.unshift({
      type: 'hello'
    });
    iframePhone.connected = true;
    // Now send any messages that have been queued up ...
    while (message = postMessageQueue.shift()) {
      iframePhone.post(message);
    }
    if (callback && typeof callback === "function") {
      callback();
    }
  });

  var receiveMessage = function (message) {
    var messageData;

    if (message.source === iframe.contentWindow && message.origin === iframeOrigin) {
      messageData = message.data;
      if (typeof messageData === 'string') {
        messageData = JSON.parse(messageData);
      }
      if (iframePhone.handlers[messageData.type]){
        iframePhone.handlers[messageData.type](messageData.values);
      }
      else {
        console.log("cant handle type: " + messageData.type);
      }
    }
  };

  window.addEventListener('message', receiveMessage, false);
  iframePhone.post = post;
  return iframePhone;
}
