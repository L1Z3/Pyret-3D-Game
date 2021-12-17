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
      "image-test": ["arrow", ["Image"], "Image"],
      "transform-img": ["arrow", ["Number", "Number", "Number", "Number", "Number", "Number", "Image"], "Image"],
      "get-texture-matrix": ["arrow", ["Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number", "Number"], ["RawArray", "Number"]]
    },

  },

  theModule: function(runtime, _, uri, imageLib, jsnums) {
    var image = runtime.getField(imageLib, "internal");
    var F = runtime.makeFunction;
    function general2DProjection(
      p1x, p1y, c1x, c1y,
      p2x, p2y, c2x, c2y,
      p3x, p3y, c3x, c3y,
      p4x, p4y, c4x, c4y
    ) {
      C11=(c1x*(-(c3y*c4x) + c2y*(-c3x + c4x) + c2x*(c3y - c4y) + c3x*c4y)*(p2y - p3y)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y) + c2x*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(-p1y + p3y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y)) + c3x*(c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(-p1y + p2y)*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C12=(c3x*(c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1x - p2x)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y) + c1x*(c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2x - p3x)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y)) + c2x*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1x - p3x)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C13=((c2x*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1y*p3x - p1x*p3y))/(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y) + (c3x*(c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1y*p2x - p1x*p2y))/(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y)) + (c1x*(c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2y*p3x - p2x*p3y))/(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/(c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y));

      C21=(c1y*(-(c3y*c4x) + c2y*(-c3x + c4x) + c2x*(c3y - c4y) + c3x*c4y)*(p2y - p3y)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y) + c2y*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(-p1y + p3y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y)) + c3y*(-(c2y*c4x) + c1y*(-c2x + c4x) + c1x*(c2y - c4y) + c2x*c4y)*(p1y - p2y)*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C22=(c3y*(c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1x - p2x)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y) + c1y*(c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2x - p3x)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y)) + c2y*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1x - p3x)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C23=(c3y*(c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1y*p2x - p1x*p2y)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y) + c1y*(c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2y*p3x - p2x*p3y)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y)) + c2y*(c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1y*p3x - p1x*p3y)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C31=((-(c3y*c4x) + c2y*(-c3x + c4x) + c2x*(c3y - c4y) + c3x*c4y)*(p2y - p3y)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y) + (c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(-p1y + p3y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y)) + (c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(-p1y + p2y)*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C32=((c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1x - p2x)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y) + (c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2x - p3x)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y)) + (c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1x - p3x)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));

      C33=((c1y*(c2x - c4x) + c2y*c4x - c2x*c4y + c1x*(-c2y + c4y))*(p1y*p2x - p1x*p2y)*(-(p3y*p4x) + p1y*(-p3x + p4x) + p1x*(p3y - p4y) + p3x*p4y)*(-(p3y*p4x) + p2y*(-p3x + p4x) + p2x*(p3y - p4y) + p3x*p4y) + (c2y*(c3x - c4x) + c3y*c4x - c3x*c4y + c2x*(-c3y + c4y))*(p2y*p3x - p2x*p3y)*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y)) + (c1y*(c3x - c4x) + c3y*c4x - c3x*c4y + c1x*(-c3y + c4y))*(p1y*p3x - p1x*p3y)*(-(p2y*p4x) + p1y*(-p2x + p4x) + p1x*(p2y - p4y) + p2x*p4y)*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)))/((c1y*(c2x - c3x) + c2y*c3x - c2x*c3y + c1x*(-c2y + c3y))*(p1y*(p2x - p4x) + p2y*p4x - p2x*p4y + p1x*(-p2y + p4y))*(p1y*(p3x - p4x) + p3y*p4x - p3x*p4y + p1x*(-p3y + p4y))*(p2y*(p3x - p4x) + p3y*p4x - p3x*p4y + p2x*(-p3y + p4y)));
      t3 = [C11, C12, C13, C21, C22, C23, C31, C32, C33]
      return t3;
    }


    // temp function
    function imageStuff(img) {
      console.dir(image);
      console.dir(img);
      return img;
    }

    // given an array of (x, y) pairs, unzip them into separate arrays
    var unzipVertices = function(vertices){
        return {xs: vertices.map(function(v) { return v.x }),
                ys: vertices.map(function(v) { return v.y })};
    };
    // given an array of vertices, find the width of the shape
    var findWidth = function(vertices){
        var xs = unzipVertices(vertices).xs;
        return Math.max.apply(Math, xs) - Math.min.apply(Math, xs);
    }
    // given an array of vertices, find the height of the shape
    var findHeight = function(vertices){
        var ys = unzipVertices(vertices).ys;
        return Math.max.apply(Math, ys) - Math.min.apply(Math, ys);
    }

    // given a list of vertices and optionally a translationX/Y, shift them
    var translateVertices = function(vertices, translation) {
      var vs = unzipVertices(vertices);
      var translateX = -Math.min.apply( Math, vs.xs );
      var translateY = -Math.min.apply( Math, vs.ys );
      if (translation) {
        translation.x = translateX;
        translation.y = translateY;
      }
      return vertices.map(function(v) {
        return {x: v.x + translateX, y: v.y + translateY };
      })
    }

    var TransformImage = function(a, b, c, d, e, f, img) {
      image.BaseImage.call(this);
      // grab the img vertices, scale them, and save the result to this_vertices
      var vertices = img.getVertices().map(function(v) {
          return {x: a * v.x + b * v.y/* + c*/, y: d * v.x + e * v.y /*+ f*/ };
      });

      // extract the xs and ys separately
      // var vs = unzipVertices(vertices);

      var translate = {};
      this._vertices  = translateVertices(vertices, translate);
      this.translateX = translate.x;
      this.translateY = translate.y;

      this.img      = img;
      this.width    = findWidth(this._vertices);
      this.height   = findHeight(this._vertices);
      /* my matrix vs the browser's matrix:
         | a b c |    | a c e |
         | d e f | vs | b d f |
         | 0 0 1 |    | 0 0 1 | 
         therefore, we have to change the order here: */
      this.matrixVals = [a, d, b, e, c, f];
      //this.pinholeX = this._vertices[0].x;
      this.pinholeX = a * img.pinholeX + b * img.pinholeY/* + c*/;
      //this.pinholeY = this._vertices[0].y;
      this.pinholeY = d * img.pinholeX + e * img.pinholeY /*+ f*/;
      /*if (a < 0) { // translate pinhole into image region
        this.pinholeX += this.width;
        this._vertices.forEach((v) => v.x += this.width);
      }
      if (e < 0) { // translate pinhole into image region
        this.pinholeY += this.height;
        this._vertices.forEach((v) => v.y += this.height);
      }*/
    };

    var heir = Object.create;

    TransformImage.prototype = heir(image.BaseImage.prototype);

    TransformImage.prototype.getVertices = function() { return this._vertices; };

    // scale the context, and pass it to the image's render function
    TransformImage.prototype.render = function(ctx) {
      console.dir(ctx);
      ctx.save();
      console.log(this.matrixVals[0]);
      console.log(this.matrixVals);
      ctx.imageSmoothingEnabled = false;
      ctx.transform(this.matrixVals[0], this.matrixVals[1], this.matrixVals[2], this.matrixVals[3], this.matrixVals[4], this.matrixVals[5]);
      ctx.translate(this.translateX, this.translateY);
      //ctx.transform(1, 0, 0, 0, 1, 0);
      //ctx.scale(2, 1);
      console.log(ctx.getTransform());
      this.img.render(ctx);
      ctx.restore();
    };

    TransformImage.prototype.equals = function(other) {
      return (other instanceof TransformImage      &&
              this.width      === other.width      &&
              this.height     === other.height     &&
              this.matrixVals === other.matrixVals &&
              this.equals(this.img, other.img) )
            || image.BaseImage.prototype.equals.call(this, other);
    };


    var isTransformImage = function(x) { return x instanceof TransformImage; };
    
    var makeTransformImage = function(a, b, c, d, e, f, img) {
      return new TransformImage(a, b, c, d, e, f, img);
    };

    return runtime.makeModuleReturn({

      "image-test": F(imageStuff, "image-test"),
      "transform-img": F(function(maybeA, maybeB, maybeC, maybeD, maybeE, maybeF, maybeImg) {
        runtime.checkArity(7, arguments, "transform-img", false);
        // c2("rotate", maybeAngle, annReal, maybeImg, annImage);
        var a = jsnums.toFixnum(maybeA);
        var b = jsnums.toFixnum(maybeB);
        var c = jsnums.toFixnum(maybeC);
        var d = jsnums.toFixnum(maybeD);
        var e = jsnums.toFixnum(maybeE);
        var f = jsnums.toFixnum(maybeF);
        var img = maybeImg.val;
        var newImgUnwrapped = makeTransformImage(a, b, c, d, e, f, img);
        return runtime.makeOpaque(newImgUnwrapped, newImgUnwrapped.equals);
      }, "transform-img"),
      // TODO make option and such
      "get-texture-matrix": F(function(
        x1s, y1s, x1d, y1d,
        x2s, y2s, x2d, y2d,
        x3s, y3s, x3d, y3d,
        x4s, y4s, x4d, y4d) {
        return general2DProjection(
          jsnums.toFixnum(x1s), jsnums.toFixnum(y1s), jsnums.toFixnum(x1d), jsnums.toFixnum(y1d),
          jsnums.toFixnum(x2s), jsnums.toFixnum(y2s), jsnums.toFixnum(x2d), jsnums.toFixnum(y2d),
          jsnums.toFixnum(x3s), jsnums.toFixnum(y3s), jsnums.toFixnum(x3d), jsnums.toFixnum(y3d),
          jsnums.toFixnum(x4s), jsnums.toFixnum(y4s), jsnums.toFixnum(x4d), jsnums.toFixnum(y4d));
      }, "get-texture-matrix")

    }, {});

  }

})