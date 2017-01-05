(function ($, window, document, undefined) {

  'use strict';

  $(function () {
    var image = new Image();
    var originImageContainer = $('#originImage')[0];
    var $canvas = $('#resultCanvas')[0];
    var ctx = $canvas.getContext('2d');

    function setCanvas() {
      //console.log(rContext);
      ctx.fillStyle = 'rgb(200,0,0)';
      ctx.fillRect (20, 100, 100, 50);

      ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
      ctx.fillRect (30, 80, 50, 100);


    }

    function checkFile(){
      var $imageInput = $('#imageInput')[0];
      var file    = $imageInput.files[0]; //sames as here
      var reader  = new FileReader();

      image.onload = function () {
        console.log(image);
        image.width = 200;
        ctx.drawImage(image,0,0);
        var imageData = ctx.getImageData(0, 0, 500, 500);

      };

      reader.onloadend = function () {
        //console.log(reader.result);
        image.src = reader.result;
        originImageContainer.src = reader.result;
      };

      if (file) {
        console.log(file);
        reader.readAsDataURL(file); //reads the data as a URL
      }
    }

    window.setCanvas = setCanvas;
    window.checkFile = checkFile;
  });

})(jQuery, window, document);
