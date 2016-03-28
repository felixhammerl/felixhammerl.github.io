(function() {
  "use strict";

  var icon = document.getElementById("avatar");
  var infos = document.getElementsByClassName("home__about-info");
  
  var hasTouchStartEvent = 'ontouchstart' in document.createElement( 'div' );
  icon.addEventListener( hasTouchStartEvent ? 'touchstart' : 'mousedown', reveal, false );

  Array.prototype.forEach.call(infos, function(info) {
    info.addEventListener( hasTouchStartEvent ? 'touchstart' : 'mousedown', function(e) {
        e.stopPropagation();
    }, false );
  });

  function reveal(e) {
    Array.prototype.forEach.call(infos, function(info) {
      info.classList.toggle("home__about-info--show");
    });
    icon.classList.remove("home__about-photo--shake");
  }
})()
