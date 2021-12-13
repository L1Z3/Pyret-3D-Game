({

  requires: [
    { "import-type": "builtin", "name": "image-lib" }
  ],

  nativeRequires: [
    'pyret-base/js/js-numbers'
  ],

  provides: {
    shorthands: {
      "Image": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://image" },
                 name: "Image" },
      "Color": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://color" },
                 name: "Color" }
    },
    values: { 
      "multiply-test": ["arrow", ["Number", "Number"], "Number"],
      "image-test": ["arrow", ["Image"], "Image"],
      "array-to-image-internal": ["arrow", ["Number", "Number", ["RawArray", "Color"]], "Image"]
    }

  },

  theModule: function(runtime, _, uri, imageLib, jsnums) {
    var image = runtime.getField(imageLib, "internal");
    var F = runtime.makeFunction;
    function mult(n1, n2) {
      return n1 * n2;
    }

    // temp function
    function imageStuff(img) {
      console.dir(img);
      return img;
    }

    // this function is largely copied from Pyret's image library, but modified to use an array instead of a list for speed
    function colorArrayToImage(arrayOfColors, width, height, pinholeX, pinholeY) {
      var canvas = image.makeCanvas(jsnums.toFixnum(width),
                              jsnums.toFixnum(height)),
      ctx = canvas.getContext("2d"),
      imageData = ctx.createImageData(jsnums.toFixnum(width),
                                      jsnums.toFixnum(height)),
      aColor,
      data = imageData.data;
      for(var i = 0; i < arrayOfColors.length * 4; i += 4) {
        aColor = arrayOfColors[i / 4];
        data[i] = Math.floor(image.colorRed(aColor));
        data[i+1] = Math.floor(image.colorGreen(aColor));
        data[i+2] = Math.floor(image.colorBlue(aColor));
        data[i+3] = image.colorAlpha(aColor) * 255;
      }
      var ans = image.makeImageDataImage(imageData);
      ans.pinholeX = pinholeX;
      ans.pinholeY = pinholeY;
      return ans;
    }

    function arrayToImg(width, height, arr) {
      var pinholeX = width / 2;
      var pinholeY = height / 2;
      //console.dir(runtime);
      //console.dir(image);
      var imageDataImage = colorArrayToImage(arr, width, height, pinholeX, pinholeY);
      return runtime.makeOpaque(imageDataImage, image.imageEquals)
    }


    return runtime.makeModuleReturn({

      "multiply-test": F(mult, "multiply-test"),
      "image-test": F(imageStuff, "image-test"),
      "array-to-image-internal": F(arrayToImg, "array-to-image-internal")

    }, {});

  }

})