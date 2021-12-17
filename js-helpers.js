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
      "Point": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://internal-image-shared" },
                 name: "Point" },
      "Color": { tag: "name",
                 origin: { "import-type": "uri", uri: "builtin://color" },
                 name: "Color" }
    },
    values: { 
      "image-test": ["arrow", ["Image"], "Image"],
      "transform-img": ["arrow", ["Point", "Point", "Point", "Point", "Image"], "Image"]
    },

  },

  theModule: function(runtime, _, uri, imageLib, jsnums) {
    var image = runtime.getField(imageLib, "internal");
    var F = runtime.makeFunction;

    // point class
    var Point = function(x,y) {
      this.x = x?x:0;
      this.y = y?y:0;
    }

    var p = Point.prototype;

    var TextCoord = function(u,v) {
      this.u = u?u:0;
      this.v = v?v:0;
    }

    var Triangle = function(p0, p1, p2, t0, t1, t2) {
      this.p0 = p0;
      this.p1 = p1;
      this.p2 = p2;

      this.t0 = t0;
      this.t1 = t1;
      this.t2 = t2;
    }

    // from https://stackoverflow.com/questions/4097688/draw-distorted-image-on-html5s-canvas
    var draw = function(p1, p2, p3, p4, img, context) {
      //context.clearRect(0,0,1422,800);
      p1New = new Point(p1.x, p1.y);
      p2New = new Point(p2.x, p2.y);
      p3New = new Point(p3.x, p3.y);
      p4New = new Point(p4.x, p4.y);

      var render = function(anImage, tri) {
          if (anImage) {
            drawTriangle(context, anImage,
                 tri.p0.x, tri.p0.y,
                 tri.p1.x, tri.p1.y,
                 tri.p2.x, tri.p2.y,
                 tri.t0.u, tri.t0.v,
                 tri.t1.u, tri.t1.v,
                 tri.t2.u, tri.t2.v);
        }
      }
      // TODO, make it so it only recalculates when moved?
      //var triangles = calculateGeometry(new Point(0, 0), new Point(100, 0), new Point(150, 150), new Point(0, 100));
      var triangles = calculateGeometry(img, p1New, p2New, p3New, p4New);

      for (triangle of triangles) {
        render(img, triangle);
      }
    }

    // from https://stackoverflow.com/questions/4097688/draw-distorted-image-on-html5s-canvas
    var calculateGeometry = function(img, p1, p2, p3, p4) {
      // clear triangles out
      var triangles = [];

      // generate subdivision
      var subs = 7; // vertical subdivisions
      var divs = 7; // horizontal subdivisions

      var dx1 = p4.x - p1.x;
      var dy1 = p4.y - p1.y;
      var dx2 = p3.x - p2.x;
      var dy2 = p3.y - p2.y;

      var imgW = img.naturalWidth;
      var imgH = img.naturalHeight;

      for (var sub = 0; sub < subs; ++sub) {
        var curRow = sub / subs;
        var nextRow = (sub + 1) / subs;

        var curRowX1 = p1.x + dx1 * curRow;
        var curRowY1 = p1.y + dy1 * curRow;
        
        var curRowX2 = p2.x + dx2 * curRow;
        var curRowY2 = p2.y + dy2 * curRow;

        var nextRowX1 = p1.x + dx1 * nextRow;
        var nextRowY1 = p1.y + dy1 * nextRow;
        
        var nextRowX2 = p2.x + dx2 * nextRow;
        var nextRowY2 = p2.y + dy2 * nextRow;

        for (var div = 0; div < divs; ++div) {
          var curCol = div / divs;
          var nextCol = (div + 1) / divs;

          var dCurX = curRowX2 - curRowX1;
          var dCurY = curRowY2 - curRowY1;
          var dNextX = nextRowX2 - nextRowX1;
          var dNextY = nextRowY2 - nextRowY1;

          var p1x = curRowX1 + dCurX * curCol;
          var p1y = curRowY1 + dCurY * curCol;

          var p2x = curRowX1 + (curRowX2 - curRowX1) * nextCol;
          var p2y = curRowY1 + (curRowY2 - curRowY1) * nextCol;

          var p3x = nextRowX1 + dNextX * nextCol;
          var p3y = nextRowY1 + dNextY * nextCol;

          var p4x = nextRowX1 + dNextX * curCol;
          var p4y = nextRowY1 + dNextY * curCol;

          var u1 = curCol * imgW;
          var u2 = nextCol * imgW;
          var v1 = curRow * imgH;
          var v2 = nextRow * imgH;

          /*var triangle1 = new Triangle(
            new Point(p1x-1, p1y),
            new Point(p3x+2, p3y+1),
            new Point(p4x-1, p4y+1),
            new TextCoord(u1, v1),
            new TextCoord(u2, v2),
            new TextCoord(u1, v2)
          );

          var triangle2 = new Triangle(
            new Point(p1x-2, p1y),
            new Point(p2x+1, p2y),
            new Point(p3x+1, p3y+1),
            new TextCoord(u1, v1),
            new TextCoord(u2, v1),
            new TextCoord(u2, v2)
          );*/

          var triangle1 = new Triangle(
            new Point(p1x, p1y),
            new Point(p3x, p3y),
            new Point(p4x, p4y),
            new TextCoord(u1, v1),
            new TextCoord(u2, v2),
            new TextCoord(u1, v2)
          );

          var triangle2 = new Triangle(
            new Point(p1x, p1y),
            new Point(p2x, p2y),
            new Point(p3x, p3y),
            new TextCoord(u1, v1),
            new TextCoord(u2, v1),
            new TextCoord(u2, v2)
          );

          triangles.push(triangle1);
          triangles.push(triangle2);
        }
      }
      return triangles;
    }

    // from http://tulrich.com/geekstuff/canvas/jsgl.js
    var drawTriangle = function(ctx, im, x0, y0, x1, y1, x2, y2,
        sx0, sy0, sx1, sy1, sx2, sy2) {
        ctx.save();

        // Clip the output to the on-screen triangle boundaries.
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        //ctx.stroke();//xxxxxxx for wireframe
        ctx.clip();

        var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
        if (denom == 0) {
            return;
        }
        var m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
        var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
        var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
        var m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
        var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
        var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;

        ctx.transform(m11, m12, m21, m22, dx, dy);
        ctx.imageSmoothingEnabled = false;
        // ctx.filter = 'brightness(50%)';

        // Draw the whole image.  Transform and clip will map it onto the
        // correct output triangle.
        ctx.drawImage(im, 0, 0);
        ctx.restore();
    };


    // temp function
    function imageStuff(img) {
      console.dir(image);
      console.dir(img);
      return img;
    }

    var unwrapPoint2D = function(val) {
      var gf = runtime.getField;
      var hf = runtime.hasField;
      if (hf(val, "r") && hf(val, "theta")) {
        var r = jsnums.toFixnum(gf(val, "r"));
        var theta = jsnums.toFixnum(gf(val, "theta"));
        return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
      }
      return { x: jsnums.toFixnum(gf(val, "x")), y: jsnums.toFixnum(gf(val, "y")) };
    };

    var TransformImage = function(p1, p2, p3, p4, img) {
      image.BaseImage.call(this);
      // extract the xs and ys separately
      var xs = [p1.x, p2.x, p3.x, p4.x];
      var ys = [p1.y, p2.y, p3.y, p4.y];

      this.img      = img;
      // TODO fix this--it assumes subimage is a fileimage
      this.rawImage = img.img;
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;
      this.p4 = p4;
      this.width    = Math.max.apply(Math, xs) - Math.min.apply(Math, xs);
      this.height   = Math.max.apply(Math, ys) - Math.min.apply(Math, ys);

      this.pinholeX = this.width / 2;
      this.pinholeY = this.height / 2;

    };

    var heir = Object.create;

    TransformImage.prototype = heir(image.BaseImage.prototype);

    TransformImage.prototype.render = function(ctx) {
      //ctx.save();
      draw(this.p1, this.p2, this.p3, this.p4, this.rawImage, ctx)
      //ctx.restore();
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
      "transform-img": F(function(maybeP1, maybeP2, maybeP3, maybeP4, maybeImg) {
        runtime.checkArity(5, arguments, "transform-img", false);
        // c2("rotate", maybeAngle, annReal, maybeImg, annImage);
        var p1 = unwrapPoint2D(maybeP1);
        var p2 = unwrapPoint2D(maybeP2);
        var p3 = unwrapPoint2D(maybeP3);
        var p4 = unwrapPoint2D(maybeP4);
        var img = maybeImg.val;
        var newImgUnwrapped = makeTransformImage(p1, p2, p3, p4, img);
        return runtime.makeOpaque(newImgUnwrapped, newImgUnwrapped.equals);
      }, "transform-img")
    }, {});

  }

})