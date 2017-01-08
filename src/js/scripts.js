(function ($, window, document, undefined) {

  'use strict';

  $(function () {
    var image = new Image();
    var originImageContainer = $('#originImage')[0];
    var $canvas = $('#resultCanvas')[0];
    var ctx = $canvas.getContext('2d');
    var imageData;
    var originalImageData;
    var imageSize = {
      height: 0,
      width: 0
    };

    var $widthSlider = $('#stripeWidthSlider');
    var $spaceSlider = $('#stripeSpaceSlider');
    var $stripesParameters = $('#stripesParameters');
    var $stripesOption = $('#stripesOption')[0];
    var $imageOption = $('#imageOption')[0];

    $stripesOption.addEventListener('click', function () {
      $stripesParameters.show();
    });

    $imageOption.addEventListener( 'click', function () {
      $stripesParameters.hide();
    });

    $widthSlider.slider({
      min : 1,
      max: 100,
      step: 5,
      value: 100
    });

    $spaceSlider.slider({
      min : 1,
      max: 100,
      step: 5,
      value: 100
    });
//     var options = [1,2,3,4,5];
//     for (var option in $slider.options)
//     {
//       options.push(option.label);
//     }
//
// //how far apart each option label should appear
//     console.log($slider.width());
//     var width = $slider.width() / (options.length - 1);
//
// //after the slider create a containing div with p tags of a set width.
//     $slider.after('<div class="ui-slider-legend"><p style="width:' + width + 'px;">' + options.join('</p><p style="width:' + width + 'px;">') +'</p></div>');

    function setCanvas() {
      image.src = 'assets/img/girl-03.jpg';


      image.onload = function () {
        onImageLoad();
      };
    }

    function checkFile(){
      var $imageInput = $('#imageInput')[0];
      var file    = $imageInput.files[0]; //sames as here
      var reader  = new FileReader();

      image.onload = function () {
        onImageLoad();
      };

      reader.onloadend = function () {
        image.src = reader.result;
        originImageContainer.src = reader.result;
      };

      if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
      }
    }


    function onImageLoad() {
      imageSize.width = image.width;
      imageSize.height = image.height;
      ctx.canvas.width = imageSize.width;
      ctx.canvas.height = imageSize.height;

      ctx.drawImage(image,0,0);
      imageData = ctx.getImageData(0, 0, imageSize.width, imageSize.height);
      originalImageData = ctx.getImageData(0, 0, imageSize.width, imageSize.height);
    }

    function addGrayStripes() {
      _addStripes(_convertToGrayscale, _getFilterParameters());
    }

    function addColorInvertedStripes() {
      _addStripes(_invertColor, _getFilterParameters());
    }

    function addColorTint() {
      _addStripes(_colorTint, _getFilterParameters());
    }

    function _getFilterParameters() {
      var mode = $('input[name="filterMode"]:checked').val();

      var parameters = {
        stripeWidth : mode === 'image' ? 1 : $widthSlider.slider( 'option', 'value' ),
        spaceWidth : mode === 'image' ? 0: $spaceSlider.slider( 'option', 'value' ),
        direction : $('input[name="stripesDirection"]:checked').val(),
        color: _getRGBcolorFromInput()
      };

      return parameters;
    }

    function _getRGBcolorFromInput() {
      var color2 = $('#colorInput').val();
      var value = color2.match(/[A-Za-z0-9]{2}/g);
      value = value.map(function(v) { return parseInt(v, 16); });
      return {
        red: value[0],
        green: value[1],
        blue: value[2]
      };
    }

    function _convertToGrayscale(pixel) {
      var avg = (pixel.red + pixel.green + pixel.blue) / 3;
      var t = Math.abs(255-avg);
      var toAdd =  parseInt(t / 3,0);

      for (var index in pixel) {
        pixel[index] -= toAdd;
      }

      return pixel;
    }

    function _invertColor(pixel) {
      for (var index in pixel) {
        pixel[index] = 255 - pixel[index];
      }
      return pixel;
    }

    function _colorTint(pixel, color) {
      var avg = (pixel.red + pixel.green + pixel.blue) / 3;

      for (var index in pixel) {
        var diff = 255 - pixel[index];
        var toAdd = parseInt(( color[index] - pixel[index]) / (avg/40), 0);
        pixel[index] += parseInt(toAdd / 2, 0);

      }
      return pixel;
    }

    function _addStripes(filter, parameters) {
      var stripeWidthPx = parameters.stripeWidth ? parameters.stripeWidth : 1;
      var stripeSpacePx = parameters.spaceWidth;

      var data = imageData.data;
      var length = 0;
      var isDirectionHorizontal = parameters.direction === 'horizontal';

      var firstIterator = isDirectionHorizontal ? imageSize.width : imageSize.height;
      var secondIterator = isDirectionHorizontal ? imageSize.height : imageSize.width;

      for ( var f = 0; f < firstIterator; f++) {
        length = 0;
        for ( var s = 0; s < secondIterator; s++ ) {
          var pixelColumn = isDirectionHorizontal ? f : s;
          var pixelRow = isDirectionHorizontal ? s : f;
          var indexR = ( (pixelRow *(imageData.width*4)) + (pixelColumn*4));
          var indexG = ( (pixelRow *(imageData.width*4)) + (pixelColumn*4)) + 1;
          var indexB = ( (pixelRow *(imageData.width*4)) + (pixelColumn*4)) + 2;

          var pixel = {
            red : data[indexR],
            green : data[indexG],
            blue : data[indexB]
          };

          var convertedPixel = filter(pixel, parameters.color);

          data[indexR] = convertedPixel.red; // red
          data[indexG] = convertedPixel.green; // green
          data[indexB] = convertedPixel.blue; // blue
          length++;

          if(length === stripeWidthPx) {
            length = 0;
            s += stripeSpacePx;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    function resetFilter() {
      ctx.putImageData(originalImageData, 0, 0);
      imageData = ctx.getImageData(0, 0, imageSize.width, imageSize.height);
    }

    function addFilter () {

    }

    window.setCanvas = setCanvas;
    window.checkFile = checkFile;
    window.addFilter = addFilter;
    window.resetFilter = resetFilter;
    window.addGrayStripes = addGrayStripes;
    window.addColorInvertedStripes = addColorInvertedStripes;
    window.addColorTint = addColorTint;

  });

})(jQuery, window, document);
