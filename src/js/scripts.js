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
    var $colorInput = $('#colorInput');

    var pluginOprions = {
      customBG: '#222',
      margin: '4px -2px 0',
      doRender: 'div div',

      buildCallback: function($elm) {
        var colorInstance = this.color,
          colorPicker = this;

        $elm.prepend('<div class="cp-panel">' +
          'R <input type="text" class="cp-r" /><br>' +
          'G <input type="text" class="cp-g" /><br>' +
          'B <input type="text" class="cp-b" /><hr>' +
          'H <input type="text" class="cp-h" /><br>' +
          'S <input type="text" class="cp-s" /><br>' +
          'B <input type="text" class="cp-v" /><hr>' +
          '<input type="text" class="cp-HEX" />' +
          '</div>').on('change', 'input', function() {
          var value = this.value,
            className = this.className,
            type = className.split('-')[1],
            color = {};

          color[type] = value;
          colorInstance.setColor(type === 'HEX' ? value : color,
            type === 'HEX' ? 'HEX' : /(?:r|g|b)/.test(type) ? 'rgb' : 'hsv');
          colorPicker.render();
          this.blur();
        });
      },

      cssAddon: // could also be in a css file instead
      '.cp-color-picker{box-sizing:border-box; width:226px;}' +
      '.cp-color-picker .cp-panel {line-height: 21px; float:right;' +
      'padding:0 1px 0 8px; margin-top:-1px; overflow:visible}' +
      '.cp-xy-slider:active {cursor:none;}' +
      '.cp-panel, .cp-panel input {color:#bbb; font-family:monospace,' +
      '"Courier New",Courier,mono; font-size:12px; font-weight:bold;}' +
      '.cp-panel input {width:28px; height:12px; padding:2px 3px 1px;' +
      'text-align:right; line-height:12px; background:transparent;' +
      'border:1px solid; border-color:#222 #666 #666 #222;}' +
      '.cp-panel hr {margin:0 -2px 2px; height:1px; border:0;' +
      'background:#666; border-top:1px solid #222;}' +
      '.cp-panel .cp-HEX {width:44px; position:absolute; margin:1px -3px 0 -2px;}' +
      '.cp-alpha {width:155px;}',

      renderCallback: function($elm) {
        var colors = this.color.colors.RND;
        var  modes = {
          r: colors.rgb.r,
          g: colors.rgb.g,
          b: colors.rgb.b,
          h: colors.hsv.h,
          s: colors.hsv.s,
          v: colors.hsv.v,
          HEX: this.color.colors.HEX
        };

        $('input', '.cp-panel').each(function() {
          this.value = modes[this.className.substr(3)];
        });

        $elm[0]._setText('');
      }
    };
    $colorInput.colorPicker(pluginOprions);

    $stripesOption.addEventListener('click', function () {
      $stripesParameters.removeClass('disabled');
    });

    $imageOption.addEventListener( 'click', function () {
      $stripesParameters.addClass('disabled');
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
      if (!color2) {
        return;
      }
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
      //var avg = parseInt((pixel.red + pixel.green + pixel.blue) / 3, 0);

      for (var index in pixel) {
        //var diff = 255 - pixel[index];
        //var toAdd = parseInt(( color[index] - pixel[index]) / (avg/40), 0);
        var toAdd = parseInt(( color[index] - pixel[index]) / 4, 0);
        pixel[index] += toAdd;

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
    function addBlurEffect(bRadius) {
      var radius = bRadius || 13;
      var pxData = imageData.data;
      var tmpPx = new Uint8ClampedArray(pxData.length);
      //
      for (var p = 0, len = pxData.length; p < len; p++) {
        tmpPx[p] = pxData[p];
      }

      var r,c, index, nPixelIndex;
      var start = Date.now();
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;
      //var margin = Math.floor(radius/2);
      var imageWidthFour = imageWidth * 4;

      var kernel = [];
      var base = 1 / (radius * radius);
      for ( var kk = 0; kk<radius; kk++) {
        kernel[kk] = new Array(kk);
        for ( var oo = 0; oo<radius; oo++) {
          kernel[kk][oo] = base;
        }
      }

      var cornerBase = base / 3;
      kernel[0][0] = cornerBase;
      kernel[0][radius-1] = cornerBase;
      kernel[radius-1][0] = cornerBase;
      kernel[radius-1][radius-1] =  cornerBase;

      var centerBase = base + (base - cornerBase) * 4;

      kernel[Math.floor(radius/2)][Math.floor((radius/2))] = centerBase;

      console.log(kernel);

      // iterate image height
      for (var h = 0; h < imageHeight; h++ ){
        // iterate image width
        for (var w = 0; w < imageWidth; w++) {
          // index of first color of pixel in the center of the matrix
          var centerPixelIndex = (h *(imageWidth*4)) + (w*4);
          // column and row of pixel in top left corner from center pixel
          c = w - ((radius-1) / 2) + 3;
          r = h - ((radius-1) / 2) + 3;
          // values for each channel (rgb) from neighbours
          var channels = {
            0: [],
            1: [],
            2:[]
          };

          //iterate sample matrix rows
          for ( var i = 0; i < radius; i++) {
            r = h-1;
            // iterate sample matrix columns
            for (var j = 0; j < radius; j++) {
              //index of neighbour pixel
              index = (r * imageWidthFour) + (c*4);
              nPixelIndex = ( pxData[index] && (c < imageWidth ) && c > 2 && r > 2 ) ? index : centerPixelIndex;
              var weight = kernel[i][j];

              channels[0].push(pxData[nPixelIndex] * weight);
              channels[1].push(pxData[nPixelIndex+1] * weight);
              channels[2].push(pxData[nPixelIndex+2] * weight);

              r++;
            }
            c++;
          }

          for (var aa = 0; aa < 3; aa++){
            tmpPx[centerPixelIndex+aa] = getSum(channels[aa]);
          }
        }
      }

      var stop = Date.now();
      var result = stop - start;

      console.log(result, result/1000);
      for (var pp = 0; pp < pxData.length; pp++) {
        pxData[pp] = tmpPx[pp];
      }
      ctx.putImageData(imageData, 0, 0);
      console.log('finished');
    }
    function addGlowEffect(bRadius) {
      var radius = bRadius || 21;
      var pxData = imageData.data;
      var tmpPx = new Uint8ClampedArray(pxData.length);
      //
      for (var p = 0, len = pxData.length; p < len; p++) {
        tmpPx[p] = pxData[p];
      }

      var r,c, index, nPixelIndex;
      var start = Date.now();
      var imageWidth = imageData.width;
      var imageHeight = imageData.height;
      //var margin = Math.floor(radius/2);
      var imageWidthFour = imageWidth * 4;

      // iterate image height
      for (var h = 0; h < imageHeight; h++ ){
        // iterate image width
        for (var w = 0; w < imageWidth; w++) {
          // index of first color of pixel in the center of the matrix
          var centerPixelIndex = (h *(imageWidth*4)) + (w*4);
          // column and row of pixel in top left corner from center pixel
          c = w - ((radius-1) / 2) + 3;
          r = h - ((radius-1) / 2) + 3;
          // values for each channel (rgb) from neighbours
          var channels = {
            0: [],
            1: [],
            2:[]
          };

          //iterate sample matrix rows
          for ( var i = 0; i < radius; i++) {
            r = h-1;
            // iterate sample matrix columns
            for (var j = 0; j < radius; j++) {
              //index of neighbour pixel
              index = (r * imageWidthFour) + (c*4);
              nPixelIndex = ( pxData[index] && (c < imageWidth ) && c > 2 && r > 2 ) ? index : centerPixelIndex;
              var t = ((radius - 1) / 2);
              var distance = Math.abs(t - j);
              distance = distance !== 0 ? distance : Math.abs(t-i);
              var g = (distance * 2 ) + 1;
              var weight = distance === 0 ? 0.5 : ((0.5 / t)  / ((g * g) - ((g-2) * (g-2))));
              //weight = Math.round(weight).toFixed(4);
              channels[0].push(pxData[nPixelIndex] * weight);
              channels[1].push(pxData[nPixelIndex+1] * weight);
              channels[2].push(pxData[nPixelIndex+2] * weight);

              r++;
            }
            c++;
          }

          for (var aa = 0; aa < 3; aa++){
            tmpPx[centerPixelIndex+aa] = getSum(channels[aa]);
          }
        }
      }

      var stop = Date.now();
      var result = stop - start;

      console.log(result, result/1000);
      for (var pp = 0; pp < pxData.length; pp++) {
        pxData[pp] = tmpPx[pp];
      }
      ctx.putImageData(imageData, 0, 0);
      console.log('finished');
    }

    function getSum(array) {
      var sum = array.reduce(function(a, b) { return a + b; });
      return sum;
    }
    // function getAverage(array) {
    //   var sum = array.reduce(function(a, b) { return a + b; });
    //   var avg = sum / array.length;
    //   return avg;
    // }
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
    window.addBlurEffect = addBlurEffect;
    window.addGlowEffect = addGlowEffect;

  });

})(jQuery, window, document);
