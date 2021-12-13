use context essentials2021
include reactors
include image
include image-structs
include math
include string-dict
include gdrive-js("js-helpers.js", "<insert drive id here>")

#| CONTROLS:
   w moves forwards
   s moves backwards
   a moves left
   d moves right
   space moves up
   shift moves down
   arrow keys rotate camera
   f3 displays player info
   e places a block on the block the player is looking at
   r removes the block the player is looking at
|#

#============= CONSTANTS =============#
fun image-to-array(an-image :: Image) -> RawArray<RawArray<Color>> block:
  doc: ```Converts an image to a 2d RawArray```
  w = image-width(an-image)
  h = image-height(an-image)
  arr = raw-array-of(nothing, h)
  for each(y from range(0, h)) block:
    row = raw-array-of(color(0, 0, 0, 0), w)
    for each(x from range(0, w)):
      cur-color = color-at-position(an-image, x, y)
      raw-array-set(row, x, cur-color)
    end
    raw-array-set(arr, y, row)
  end
  arr
end
BG-COLOR = "dark-slate-blue"
SCREEN-DIMS = {w : 1422, h : 800}
CHUNK-SIZE = {x : 16, y : 50, z : 16}
CHUNK-ARR-SIZE = CHUNK-SIZE.x * CHUNK-SIZE.y * CHUNK-SIZE.z
DIRT-IMAGE = image-url("https://i.imgur.com/uoJhNzd.png")
TEX = image-to-array(image-url("https://i.imgur.com/uoJhNzd.png"))
type ArrImage = RawArray<RawArray<Color>>


#============= DATA TYPES =============#
data Pos:
  | pos(x :: Number, y :: Number, z :: Number) with:
    method _plus(self :: Pos, other :: Pos) -> Pos:
      pos(self.x + other.x, self.y + other.y, self.z + other.z)
    end
end

data Rect:
  | rect(point1 :: Pos, point2 :: Pos, point3 :: Pos, point4 :: Pos, color :: String)
end

data FaceDir:
  | px
  | nx
  | py
  | ny
  | pz
  | nz
sharing:
  method get-color(self :: FaceDir) -> String:
    doc: "Temp method to make the faces different color"
    cases (FaceDir) self:
      | px => "light-coral"
      | nx => "maroon"
      | py => "light-sea-green"
      | ny => "cornflower-blue"
      | pz => "medium-purple"
      | nz => "dark-magenta"
    end
  end,
  method get-id(self :: FaceDir) -> Number:
    doc: "Gets a unique ID for each face (for purposes of indexing)"
    cases (FaceDir) self:
      | nx => 0
      | ny => 1
      | nz => 2
      | px => 3
      | py => 4
      | pz => 5
    end
  end
end

data Face:
  | face(position :: Pos, dir :: FaceDir, color :: Option<String>) with:
    method get-points(self :: Face) -> List<Pos>:
      cases (Face) self:
        | face(position, dir, _) =>
          cases (Pos) position:
            | pos(x, y, z) =>
              cases (FaceDir) dir:
                | px => [list: 
                    pos(x + 1, y, z),
                    pos(x + 1, y, z + 1),
                    pos(x + 1, y + 1, z + 1),
                    pos(x + 1, y + 1, z)]
                | nx => [list:
                    pos(x, y, z), 
                    pos(x, y, z + 1), 
                    pos(x, y + 1, z + 1), 
                    pos(x, y + 1, z)]
                | py => [list: 
                    pos(x + 1, y + 1, z + 1), 
                    pos(x, y + 1, z + 1),
                    pos(x, y + 1, z),
                    pos(x + 1, y + 1, z)]
                | ny => [list:
                    pos(x, y, z), 
                    pos(x + 1, y, z), 
                    pos(x + 1, y, z + 1), 
                    pos(x, y, z + 1)]
                | pz => [list:
                    pos(x + 1, y + 1, z + 1), 
                    pos(x, y + 1, z + 1),
                    pos(x, y, z + 1),
                    pos(x + 1, y, z + 1)]
                | nz => [list: 
                    pos(x, y, z), 
                    pos(x + 1, y, z), 
                    pos(x + 1, y + 1, z), 
                    pos(x, y + 1, z)]
              end
          end
      end
    end,
    # this should be a temp method
    method get-rect(self :: Face) -> Rect:
      points = self.get-points()
      cur-color = 
        cases (Option) self.color:
          | none => self.dir.get-color()
          | some(a-color) => a-color
        end
      rect(points.get(0), points.get(1), points.get(2), points.get(3), cur-color)
    end
end

data Blok:
  | blok(pos :: Pos, id :: String, ref mesh :: Option<List<Face>>)
end

fun pos-to-key(chunk-pos :: Pos) -> String:
  doc: ```Gets the SD key associated with the position```
  num-to-string(chunk-pos.x) + "," + num-to-string(chunk-pos.y) + "," + num-to-string(chunk-pos.z)
where:
  pos-to-key(pos(0, 0, 0)) is "0,0,0"
  pos-to-key(pos(15, 12, 15)) is "15,12,15"
end

fun key-to-pos(key :: String) -> Pos:
  doc: ```Gets the position associated with the SD key```
  coords = string-split-all(key, ",").map({(a-str): string-to-number(a-str).value})
  pos(coords.get(0), coords.get(1), coords.get(2))
where:
  key-to-pos("0,0,0") is pos(0, 0, 0)
  key-to-pos("15,12,15") is pos(15, 12, 15)
end

# TODO optimize rect data type and use squares instead, etc
# TODO switch to using array or normal string dict? (efficiency considerations)
data Chunk:
  | chunk(x :: Number, z :: Number, bloks :: MutableStringDict<Blok>) with:
    method get-blok(self :: Chunk, chunk-pos :: Pos) -> Option<Blok>:
      self.bloks.get-now(pos-to-key(chunk-pos))
    end,
    method set-blok(self :: Chunk, chunk-pos :: Pos, blok-id :: String) -> Blok:
      cases (Pos) chunk-pos:
        | pos(x, y, z) =>
          if (x < 0) or (x >= CHUNK-SIZE.x) or 
            (y < 0) or (y >= CHUNK-SIZE.y) or
            (z < 0) or (z >= CHUNK-SIZE.z) block:
            raise("Invalid chunk coordinates!")
          else:
            a-blok = blok(
              pos((self.x * CHUNK-SIZE.x) + x, y, (self.z * CHUNK-SIZE.z) + z), blok-id, none)
            self.bloks.set-now(pos-to-key(pos(x, y, z)), a-blok)
            a-blok
          end
      end
    end,
    method remove-blok(self :: Chunk, chunk-pos :: Pos) -> Nothing:
      cases (Pos) chunk-pos:
        | pos(x, y, z) =>
          if (x < 0) or (x >= CHUNK-SIZE.x) or 
            (y < 0) or (y >= CHUNK-SIZE.y) or
            (z < 0) or (z >= CHUNK-SIZE.z) block:
            raise("Invalid chunk coordinates!")
          else:
            self.bloks.remove-now(pos-to-key(pos(x, y, z)))
          end
      end
    end
end
  
# hrot is from (-180 to 180]
# vrot is from -90 to 90
# hrot, vrot 0,0 is on positive x-axis
# up is negative, down is positive for vrot
# clockwise is positive for hrot
data Player:
  | player(point :: Pos, hrot :: Number, vrot :: Number)
end

data State:
  | game(player :: Player, chunks :: List<Chunk>, is-debug :: Boolean)
end

#============= HELPER METHODS =============#
fun array-to-image(an-arr :: ArrImage) -> Image:
  doc: ```Takes in a 2D RawArray of colors and returns an image; expects nonempty array```
  h = raw-array-length(an-arr)
  w = raw-array-length(raw-array-get(an-arr, 0))
  lst =
    for fold(base from empty, y from range-by(h - 1, -1, -1)):
      for fold(base2 from base, x from range-by(w - 1, -1, -1)):
        link(raw-array-get(raw-array-get(an-arr, y), x), base2)
      end
    end
  color-list-to-bitmap(lst, w, h)
where:
  array-to-image(image-to-array(DIRT-IMAGE)) is DIRT-IMAGE
end

# TODO fix this: it breaks on some cases
fun draw-rectangle(img :: ArrImage, x1 :: Number, y1 :: Number, x2 :: Number, y2 :: Number, a-color :: Color) -> Nothing:
  doc: "Draws a rectangle on an ArrImage by mutation"
  for each(y from range(y1, y2 + 1)):
  row = raw-array-get(img, y)
    for each(x from range(x1, x2 + 1)):
      raw-array-set(row, x, a-color)
    end
  end
where:
  arr = image-to-array(DIRT-IMAGE)
  draw-rectangle(arr, 0, 0, 15, 15, white)
  array-to-image(arr) is rectangle(16, 16, "solid", white)
end

# general
# TODO implement general matrix multiplication, etc
fun move-player(dx :: Number, dy :: Number, dz :: Number, state :: State) -> State:
  doc: ```Move player in 3-space```
  cases (Player) state.player:
    | player(cur-pos, cur-h, cur-v) => 
      cases (Pos) cur-pos:
        | pos(x, y, z) =>
          game(player(pos(x + dx, y + dy, z + dz), cur-h, cur-v), state.chunks, state.is-debug)
      end
  end
end

fun move-player-forward(d :: Number, state :: State) -> State:
  doc: ```Move the player forward```
  move-player(d * num-sin(deg-to-rad(90 - state.player.hrot)), 
    0, 
    d * num-cos(deg-to-rad(90 - state.player.hrot)), state)
end

fun rotate-player(dh :: Number, dv :: Number, state :: State) -> State:
  doc: ```Rotate player in 3-space```
  cases (Player) state.player:
    | player(cur-pos, cur-h, cur-v) => 
      cases (Pos) cur-pos:
        | pos(x, y, z) =>
          new-v = 
            if (cur-v + dv) > 90:
              90
            else if (cur-v + dv) < -90:
              -90
            else:
              cur-v + dv
            end
          new-h = 
            if (cur-h + dh) > 180:
              (cur-h + dh) - 360
            else if (cur-h + dh) <= -180:
              (cur-h + dh) + 360
            else:
              cur-h + dh
            end
          game(player(pos(x, y, z), new-h, new-v), state.chunks, state.is-debug)
      end
  end
end

fun move-player-left(d :: Number, state :: State) -> State:
  doc: ```Move the player left```
  rotate-player(-90, 0, state)
    ^ move-player-forward(d, _)
    ^ rotate-player(90, 0, _)
end

fun get-chunk(block-pos :: Pos, state :: State) -> Option<Chunk>:
  doc: ```Gets the chunk that a position is in```
  if (block-pos.y < 0) or (block-pos.y >= CHUNK-SIZE.y):
    none
  else:
    chunk-x = num-floor(block-pos.x / CHUNK-SIZE.x)
    chunk-z = num-floor(block-pos.z / CHUNK-SIZE.z)
    find({(c): (c.x == chunk-x) and (c.z == chunk-z)}, state.chunks)
  end
end

fun set-blok(state :: State, blok-pos :: Pos, id :: String) -> State:
  doc: ```Put the given blok type at the given coordinates```
  cases (Pos) blok-pos:
    | pos(x, y, z) =>
      chunk-x = num-floor(x / CHUNK-SIZE.x)
      chunk-z = num-floor(z / CHUNK-SIZE.z)
      blok-chunk-x = x - (CHUNK-SIZE.x * chunk-x)
      blok-chunk-z = z - (CHUNK-SIZE.z * chunk-z)
      blok-chunk-pos = pos(blok-chunk-x, y, blok-chunk-z)
      if (y < 0) or (y >= CHUNK-SIZE.y):
        state
      else:
        a-chunk-opt = find({(c): (c.x == chunk-x) and (c.z == chunk-z)}, state.chunks)
        cases (Option) a-chunk-opt block:
          | none => 
            new-chunk = chunk(chunk-x, chunk-z, [mutable-string-dict: ])
            new-chunk.set-blok(blok-chunk-pos, id)
            game(state.player, link(new-chunk, state.chunks), state.is-debug)
          | some(a-chunk) =>
            a-chunk.set-blok(blok-chunk-pos, id)
            state
        end
      end
  end
end

# this is probably bad since it mutates the old state then creates a new one anyway
fun set-blok-and-update(state :: State, blok-pos :: Pos, id :: String) -> State block:
  doc: ```Set a blok and update the meshes```
  new-state = set-blok(state, blok-pos, id)
  # TODO just update mesh, and only update mesh for chunk blok was placed in
  new-state.chunks.each({(c): generate-mesh(c)})
  new-state
end

# TODO reduce code duplication between this and set-blok
fun remove-blok(state :: State, blok-pos :: Pos) -> State:
  doc: ```Put the given blok type at the given coordinates```
  cases (Pos) blok-pos:
    | pos(x, y, z) =>
      chunk-x = num-floor(x / CHUNK-SIZE.x)
      chunk-z = num-floor(z / CHUNK-SIZE.z)
      blok-chunk-x = x - (CHUNK-SIZE.x * chunk-x)
      blok-chunk-z = z - (CHUNK-SIZE.z * chunk-z)
      blok-chunk-pos = pos(blok-chunk-x, y, blok-chunk-z)
      if (y < 0) or (y >= CHUNK-SIZE.y):
        state
      else:
        a-chunk-opt = find({(c): (c.x == chunk-x) and (c.z == chunk-z)}, state.chunks)
        cases (Option) a-chunk-opt block:
          | none => state
          | some(a-chunk) =>
            a-chunk.remove-blok(blok-chunk-pos)
            state
        end
      end
  end
end

fun remove-blok-and-update(state :: State, blok-pos :: Pos) -> State block:
  doc: ```Set a blok and update the meshes```
  new-state = remove-blok(state, blok-pos)
  # TODO just update mesh, and only update mesh for chunk blok was placed in
  new-state.chunks.each({(c): generate-mesh(c)})
  new-state
end

# TODO allow for click on screen function? get angle of raycast by pos of mouse on screen?
fun place-blok-looking(state :: State, id :: String) -> State:
  doc: "Places a blok where the player is looking"
  looking-face-opt = get-looking-face(state)
  cases (Option) looking-face-opt:
    | none => state
    | some(looking-face) =>
      cases (Face) looking-face:
        | face(a-pos, a-dir, _) =>
          offset = 
            cases (FaceDir) a-dir:
              | px => pos(1, 0, 0)
              | nx => pos(-1, 0, 0)
              | py => pos(0, 1, 0)
              | ny => pos(0, -1, 0)
              | pz => pos(0, 0, 1)
              | nz => pos(0, 0, -1)
            end
          set-blok-and-update(state, a-pos + offset, id)
      end
  end
end

fun remove-blok-looking(state :: State) -> State:
  doc: "Removes the blok the player is looking at"
  looking-face-opt = get-looking-face(state)
  cases (Option) looking-face-opt:
    | none => state
    | some(looking-face) =>
      remove-blok-and-update(state, looking-face.position)
  end
end

fun scalar-mult(scalar :: Number, vector :: Pos) -> Pos:
  doc: "Multiply a vector by a scalar"
  cases (Pos) vector:
    | pos(x, y, z) => pos(scalar * x, scalar * y, scalar * z)
  end
end

fun normalize(vector :: Pos) -> Pos:
  doc: "Normalize a vector"
  cases (Pos) vector:
    | pos(x, y, z) =>
      len = num-sqrt((x * x) + (y * y) + (z * z))
      inv-len = 1 / len
      scalar-mult(inv-len, vector)
  end
end

fun get-iter-vector(iter-size :: Number, state :: State) -> Pos:
  doc: ```Get a vector in the direction the player is looking of size iter-size```
  #|unit-dir-vector = normalize(pos(
      num-sin(deg-to-rad(90 - state.player.hrot)), 
      0 - num-sin(deg-to-rad(state.player.vrot)), 
      num-cos(deg-to-rad(90 - state.player.hrot))))|#
  z-rot = deg-to-rad(0 - state.player.vrot)
  y-rot = deg-to-rad(0 - state.player.hrot)
  # start vector
  x = 1
  # I assume y = 0, z = 0
  unit-dir-vector = pos(
    ((x * num-cos(z-rot)) * num-cos(y-rot)), 
    x * num-sin(z-rot), 
    (((0 - x) * num-cos(z-rot)) * num-sin(y-rot)))

  scalar-mult(iter-size, unit-dir-vector)
end

# this is an unbelievably gross function, I need to split it
fun get-looking-face(state :: State) -> Option<Face>:
  doc: ```Gets the face the player is looking at```
  max-reach = 8
  iter-size = 0.05
  # TODO test iter vector
  iter-vector = get-iter-vector(iter-size, state)
  
  # TODO investigate edge cases: negative coords, etc
  start-pos = state.player.point
  #spy: start-pos end
  fun raycast(position :: Pos, total-dist :: Number, cur-chunk-opt :: Option<Chunk>) -> Option<Face>:
    #spy: position end
    cases (Pos) position:
      | pos(x, y, z) =>
        chunk-x = num-floor(x / CHUNK-SIZE.x)
        chunk-z = num-floor(z / CHUNK-SIZE.z)
        blok-opt = 
          cases (Option) cur-chunk-opt:
            | none => none
            | some(cur-chunk) =>
              blok-pos-in-chunk = 
                pos(
                  num-floor(x) - (cur-chunk.x * CHUNK-SIZE.x),
                  num-floor(y),
                  num-floor(z) - (cur-chunk.z * CHUNK-SIZE.z))
              #spy: blok-pos-in-chunk end
              cur-chunk.get-blok(blok-pos-in-chunk)
          end
        cases (Option) blok-opt:
          | none => 
            new-dist = total-dist + iter-size
            if new-dist > max-reach:
              none
            else:
              next-pos = position + iter-vector
              new-chunk-x = num-floor(next-pos.x / CHUNK-SIZE.x)
              new-chunk-z = num-floor(next-pos.z / CHUNK-SIZE.z)
              if (new-chunk-x == chunk-x) and (new-chunk-z == chunk-z):
                raycast(next-pos, new-dist, cur-chunk-opt)
              else:
                raycast(next-pos, new-dist, get-chunk(next-pos, state))
              end
            end
          | some(cur-blok) => 
            temp = cur-blok.pos
            #spy: temp end
            cases (List) cur-blok!mesh.value:
              | empty => none
              | link(_, _) =>
                #spy: x, y, z end
                dist-to-ny = {num-abs(y - cur-blok.pos.y); ny}
                dist-to-nz = {num-abs(z - cur-blok.pos.z); nz}
                dist-to-nx = {num-abs(x - cur-blok.pos.x); nx}
                dist-to-py = {num-abs(y - (cur-blok.pos.y + 1)); py}
                dist-to-pz = {num-abs(z - (cur-blok.pos.z + 1)); pz}
                dist-to-px = {num-abs(x - (cur-blok.pos.x + 1)); px}
                dists = [list: dist-to-ny, dist-to-nz, dist-to-nx, dist-to-py, dist-to-pz, dist-to-px]
                  .filter({(t): find({(f): f.dir == t.{1}}, cur-blok!mesh.value)})
                #spy: dists end
                # TODO optimize?
                sorted-faces = cur-blok!mesh.value.sort-by(
                  {(f1, f2): 
                    find({(t): t.{1} == f1.dir}, dists).value.{0} < 
                    find({(t): t.{1} == f2.dir}, dists).value.{0}},
                  {(f1, f2): 
                    within(0.0001)(find({(t): t.{1} == f1.dir}, dists).value.{0}, 
                      find({(t): t.{1} == f2.dir}, dists).value.{0})})
                some(sorted-faces.first)
            end
        end
    end
  end
  start-chunk = get-chunk(state.player.point, state)
  raycast(state.player.point, 0, start-chunk)
end

fun toggle-debug-info(state :: State) -> State:
  doc: ```Toggles showing debug info```
  game(state.player, state.chunks, not(state.is-debug))
end


# new-game-state
fun new-player() -> Player:
  doc: ```Produces a new player.```
  player(pos(2, 3, 4), -105, 21)
end

fun get-faces-to-add(bloks :: MutableStringDict<Blok>, chunk-pos :: Pos) -> List<FaceDir>:
  doc: ```Get which faces of a blok to render```
  var out-list = empty
  cases (Pos) chunk-pos block:
    | pos(x, y, z) =>
      when is-none(bloks.get-now(pos-to-key(pos(x - 1, y, z)))): out-list := link(nx, out-list) end
      when is-none(bloks.get-now(pos-to-key(pos(x + 1, y, z)))): out-list := link(px, out-list) end
      when is-none(bloks.get-now(pos-to-key(pos(x, y, z - 1)))): out-list := link(nz, out-list) end
      when is-none(bloks.get-now(pos-to-key(pos(x, y, z + 1)))): out-list := link(pz, out-list) end
      when is-none(bloks.get-now(pos-to-key(pos(x, y - 1, z)))): out-list := link(ny, out-list) end
      when is-none(bloks.get-now(pos-to-key(pos(x, y + 1, z)))): out-list := link(py, out-list) end
      out-list
  end
end

fun generate-mesh(a-chunk :: Chunk) -> Nothing:
  doc: ```Generate the mesh of the bloks in a chunk```
  a-chunk.bloks.each-key-now(
    lam(a-key):
      a-pos = key-to-pos(a-key)
      face-dirs = get-faces-to-add(a-chunk.bloks, a-pos)
      cur-blok = a-chunk.bloks.get-value-now(a-key)
      blok-faces = face-dirs.map({(fd): face(cur-blok.pos, fd, none)})
      cur-blok!{mesh : some(blok-faces)}
    end)
end

fun init-chunks(state :: State) -> State block:
  doc: ```Produces the bloks```
  # makes more bloks
  new-state = 
    for fold(state1 from state, x from range(0, 1)):
      for fold(state2 from state1, z from range(0, 1)):
        set-blok(state2, pos(x, 1, z), "dirt")
      end 
    end
  new-state.chunks.each(generate-mesh)
  new-state
end

# draw-screen
fun invert-color(a-color :: Color) -> Color:
  color(255 - a-color.red, 255 - a-color.green, 255 - a-color.blue, a-color.alpha)
end
  
# TODO test
fun get-pixel(x :: Number, y :: Number, disp :: Image) -> Color:
  doc: ```Get the color at the location on the screen```
  color-at-position(disp, x, y)
end

# TODO error when off screen
fun set-pixel(x :: Number, y :: Number, a-color :: Color, disp :: Image) -> Image:
  doc: ```Set the color at a location on the screen```
  underlay-xy(disp, x, y, rectangle(1, 1, "solid", a-color))
end

fun make-background() -> ArrImage:
  doc: ```Produces the background of the game.```
  raw-array-of(raw-array-of(BG-COLOR, SCREEN-DIMS.w), SCREEN-DIMS.h)
end

fun get-xy(a-pos :: Pos) -> Point:
  doc: ```Takes the x and y position of a point in 3-space and puts it in an actual 2d point```
  point(a-pos.x, a-pos.y)
end

fun deg-to-rad(theta :: Number) -> Number:
  doc: ```Converts from degrees to radians```
  (theta * PI) / 180
end

fun transform-point(a-point :: Pos, cur-player :: Player) -> Pos:
  doc: ```Takes in a point and a player; transforms the point so that the viewing frustrum
       effectively points in the direction the player is facing and where the player is at```
  # TODO use cases or something
  horiz-rot = 90 + cur-player.hrot
  vert-rot = cur-player.vrot
  y-axis-theta = deg-to-rad(horiz-rot)
  x-axis-theta = deg-to-rad(vert-rot)
  # move point
  moved-point = 
    pos(
      a-point.x - cur-player.point.x, 
      a-point.y - cur-player.point.y, 
      a-point.z - cur-player.point.z)
  y-rot-point = 
    pos(
      (moved-point.x * num-cos(y-axis-theta)) + (moved-point.z * num-sin(y-axis-theta)),
      moved-point.y,
      (moved-point.z * num-cos(y-axis-theta)) - (moved-point.x * num-sin(y-axis-theta)))
  x-rot-point = 
    pos(
      y-rot-point.x,
      (y-rot-point.y * num-cos(x-axis-theta)) - (y-rot-point.z * num-sin(x-axis-theta)),
      (y-rot-point.z * num-cos(x-axis-theta)) + (y-rot-point.y * num-sin(x-axis-theta)))
  x-rot-point
end

fun project-pos(a-point :: Pos, cur-player :: Player) -> Pos:
  doc: ```Takes a point in 3-space and projects it onto the canonical view volume```
  # initialize some variables needed for the transformation
  n = -0.1
  fov-x-deg = 100
  fov-x = deg-to-rad(fov-x-deg)
  abs-n = num-abs(n)
  r = num-tan((fov-x / 2) * abs-n)
  l = 0 - r
  t = (SCREEN-DIMS.h / SCREEN-DIMS.w) * r
  b = 0 - t
  f = 50
  transformed-point = transform-point(a-point, cur-player)
  cases (Pos) transformed-point:
    | pos(x, y, z) =>
      new-x = (((2 * n * x) / (r - l)) + ((z * (0 - l - r)) / (r - l))) / z
      new-y = (((2 * n * y) / (t - b)) + ((z * (0 - b - t)) / (t - b))) / z
      new-z = ((z * ((f + n) / (f - n))) - ((2 * f * n) / (f - n))) / z
      pos(new-x, new-y, new-z)
  end
end

# TODO make this function actually sane
fun project-rect(a-rect :: Rect, cur-player :: Player) 
  -> Option<{Point; List<Point>; Number; String}>:
  doc: ```Takes in a rectangle in 3-space; outputs a tuple containing the x-y offset, the points
       of the projected rectangle, the average z-depth of the projected rectangle, 
       and the color of the projected rectangle```
  cases (Rect) a-rect:
    | rect(pos1, pos2, pos3, pos4, a-color) =>
      new-pos1 = project-pos(pos1, cur-player)
      new-pos2 = project-pos(pos2, cur-player)
      new-pos3 = project-pos(pos3, cur-player)
      new-pos4 = project-pos(pos4, cur-player)
      l1 = [list: new-pos1, new-pos2, new-pos3, new-pos4]
      # culling
      if l1.all({(a-pos): (num-abs(a-pos.x) > 1) or (num-abs(a-pos.y) > 1) or (num-abs(a-pos.z) > 1)}):
        none
      else:
        #| only the x and y from the canonical view volume matters for where to place 
         the polygon on the screen |#
        l2 = l1.map(get-xy)
        # Scale the canonical view square to be the actual size and position of the screen
        l3 = l2.map({(a-point): 
            point(
              (a-point.x * (SCREEN-DIMS.w / 2)) + (SCREEN-DIMS.w / 2), 
              (-1 * (a-point.y * (SCREEN-DIMS.h / 2))) + (SCREEN-DIMS.h / 2))})
        # TODO make this min calculation sane
        # get the min x/y so that the polygon can be drawn with (min-x, min-y) as offset
        min-x = l3.foldl({(a-point, base): num-min(a-point.x, base)}, 1000000000)
        min-y = l3.foldl({(a-point, base): num-min(a-point.y, base)}, 1000000000)
        # make the coords of the points relative to (min-x, min-y)
        l4 = l3.map({(a-point): point(a-point.x - min-x, a-point.y - min-y)})
        # FLIP THE Y BECAUSE *APPARENTLY* FOR `point-polygon` ONLY, +Y IS UP, NOT DOWN!!
        l5 = l4.map({(a-point): point(a-point.x, -1 * a-point.y)})
        # get the z-depth of all the points for, uh, reasons, idk
        zs = l1.map({(a-pos): a-pos.z})
        avg-z = sum(zs) / zs.length()
        min-z = min(zs)
        some({point(min-x, min-y); l5; avg-z; a-color})
      end
  end
end

fun draw-bloks(disp :: Image, state :: State) -> Image:
  doc: ```Produces the background rectangles of the game.```
  # go through the blocks
  all-tuples = 
    for fold(base from empty, a-chunk from state.chunks):
      faces = a-chunk.bloks.fold-keys-now(
        lam(a-key, base2): 
          # TODO do lots of cases or something, you know
          a-chunk.bloks.get-value-now(a-key)!mesh.value + base2
        end, empty)
      rects = faces.map({(f): f.get-rect()})
      tuple-opts = rects.map({(a-rect): project-rect(a-rect, state.player)})
      tuples = tuple-opts.filter(is-some).map({(opt): opt.value})
      # welcome to the most hacky z-buffer in the world
      tuples + base
    end.sort-by({(t1, t2): t1.{2} > t2.{2}}, {(t1, t2): within(0.00001)(t1.{2}, t2.{2})})
  for fold(disp2 from disp, {offset; points; _; a-color} from all-tuples):
    uncropped-image = 
      underlay-xy(disp2, offset.x, offset.y, point-polygon(points, "solid", a-color))
    crop(num-max(0, 0 - offset.x), num-max(0, 0 - offset.y), SCREEN-DIMS.w, SCREEN-DIMS.h, 
      uncropped-image)
  end
end

fun draw-debug(disp :: Image, state :: State) -> Image:
  doc: ```Draw debug menu```
  if state.is-debug:
    x-str = num-to-string-digits(state.player.point.x, 3)
    y-str = num-to-string-digits(state.player.point.y, 3)
    z-str = num-to-string-digits(state.player.point.z, 3)
    draw-str = "x: " + x-str + ", y: " + y-str + ", z: " + z-str
    disp2 = underlay-align("left", "top", disp, 
      text(draw-str, SCREEN-DIMS.h / 50, "gray"))
    hrot = state.player.hrot
    hrot-str = num-to-string-digits(hrot, 1)
    vrot-str = num-to-string-digits(state.player.vrot, 1)
    facing-str =
      ask:
        | (hrot >= -45) and (hrot <= 45) then: "+x"
        | (hrot >= 135) or (hrot <= -135) then: "-x"
        | (hrot < 135) and (hrot > 45) then: "+z"
        | (hrot > -135) and (hrot < -45) then: "-z"
        | otherwise: "toward god"
      end
    draw-str2 = "H: " + hrot-str + ", V: " + vrot-str + ", facing: " + facing-str
    underlay-xy(disp2, 0, SCREEN-DIMS.h / 50,
      text(draw-str2, SCREEN-DIMS.h / 50, "gray"))
  else:
    disp
  end
end

fun draw-crosshair(disp :: ArrImage) -> Nothing block:
  doc: ```Draws a crosshair on the screen```
  size = num-ceiling((SCREEN-DIMS.h / 30) / 2) 
  width = num-ceiling((SCREEN-DIMS.h / 400) / 2) 
  center-x = num-floor(SCREEN-DIMS.w / 2)
  center-y = num-floor(SCREEN-DIMS.h / 2)
  # TODO try doing weird inverted color crosshair again
  draw-rectangle(disp, center-x - width, center-y - size, center-x + width, center-y + size, white)
  draw-rectangle(disp, center-x - size, center-y - width, center-x + size, center-y + width, white)
end

#============= METHODS =============#
fun new-game-state() -> State:
  doc: ```Produces a new game state```
  a-player = new-player()
  old-state = game(a-player, empty, false)
  init-chunks(old-state)
end

fun key-press(state :: State, key :: String) -> State block:
  doc: ```Handles key presses```
  ask:
    | key == "a" then: move-player-left(0.1, state)
    | key == "d" then: move-player-left(-0.1, state)
    | key == "s" then: move-player-forward(-0.1, state)
    | key == "w" then: move-player-forward(0.1, state)
      #| | key == "s" then: 
      vec = scalar-mult(-1, get-iter-vector(0.1, state))
      move-player(vec.x, vec.y, vec.z, state)
    | key == "w" then: 
      vec = get-iter-vector(0.1, state)
      move-player(vec.x, vec.y, vec.z, state) |#
    | key == " " then: move-player(0, 0.1, 0, state)
    | key == "shift" then: move-player(0, -0.1, 0, state)
    | key == "up" then: rotate-player(0, -3, state)
    | key == "down" then: rotate-player(0, 3, state)
    | key == "right" then: rotate-player(5, 0, state)
    | key == "left" then: rotate-player(-5, 0, state)
      #  | key == "e" then: place-blok-temp(state) 
    | key == "e" then: place-blok-looking(state, "dirt")
    | key == "r" then: remove-blok-looking(state)
    | key == "f3" then: toggle-debug-info(state)
      # | key == "f" then: place-blok-looking(state, "dirt")
  # | key == "escape" then: game-over
    | otherwise: state
  end
end

#|fun mouse-handle(state :: State, x :: Number, y :: Number, event-type :: String) -> State block:
  when event-type <> "move":
    spy: x, y, event-type end
  end
  state
   end|#

fun draw-screen(state :: State) -> Image:
  doc: ```Draws current game state.```
  cases (State) state block:
    | game(a-player, cur-bloks, _) =>
      # TODO figure out relative efficiency of array drawing vs actually using image library
      arr-img = make-background()
      # draw-bloks(arr-img, state)
      draw-crosshair(arr-img)
      # text is annoying to draw pixel-wise so I'll just use the builtins for that lol
      array-to-image(arr-img)
      #  ^ draw-debug(_, state)
  end
end

#============= GAME INITIALIZATION =============#

r = reactor:
  init: new-game-state(),
    
  #on-tick: tock,
  seconds-per-tick: 0.03,
  
  on-key: key-press,
  #on-mouse: mouse-handle,
  
  to-draw: draw-screen,
  
  #stop-when: is-game-over,
  close-when-stop: false,
  
  title: "3D yay"
end

interact(r)