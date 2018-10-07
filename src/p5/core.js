/**
 * @module Structure
 * @submodule Structure
 * @for p5
 * @requires constants
 */

'use strict';

require('./shim');

// Core needs the PVariables object
var constants = require('./constants');

/**
 * This is the p5 instance constructor.
 *
 * A p5 instance holds all the properties and methods related to
 * a p5 sketch.  It expects an incoming sketch closure and it can also
 * take an optional node parameter for attaching the generated p5 canvas
 * to a node.  The sketch closure takes the newly created p5 instance as
 * its sole argument and may optionally set preload(), setup(), and/or
 * draw() properties on it for running a sketch.
 *
 * A p5 sketch can run in "global" or "instance" mode:
 * "global"   - all properties and methods are attached to the window
 * "instance" - all properties and methods are bound to this p5 object
 *
 * @class p5
 * @constructor
 * @param  {function}    sketch a closure that can set optional preload(),
 *                              setup(), and/or draw() properties on the
 *                              given p5 instance
 * @param  {HTMLElement|Boolean} [node] element to attach canvas to, if a
 *                                      boolean is passed in use it as sync
 * @param  {Boolean}     [sync] start synchronously (optional)
 * @return {p5}                 a p5 instance
 */
var p5 = function(sketch, node, sync) {
    if (typeof node === 'boolean' && typeof sync === 'undefined') {
        sync = node;
        node = undefined;
    }

    //////////////////////////////////////////////
    // PUBLIC p5 PROPERTIES AND METHODS
    //////////////////////////////////////////////

    /**
     * Called directly before setup(), the preload() function is used to handle
     * asynchronous loading of external files in a blocking way. If a preload
     * function is defined, setup() will wait until any load calls within have
     * finished. Nothing besides load calls (loadImage, loadJSON, loadFont,
     * loadStrings, etc.) should be inside preload function. If asynchronous
     * loading is preferred, the load methods can instead be called in setup()
     * or anywhere else with the use of a callback parameter.
     * <br><br>
     * By default the text "loading..." will be displayed. To make your own
     * loading page, include an HTML element with id "p5_loading" in your
     * page. More information <a href="http://bit.ly/2kQ6Nio">here</a>.
     *
     * @method preload
     * @example
     * <div><code>
     * var img;
     * var c;
     * function preload() {
  // preload() runs once
   *   img = loadImage('assets/laDefense.jpg');
   * }
     *
     * function setup() {
  // setup() waits until preload() is done
   *   img.loadPixels();
   *   // get color of middle pixel
   *   c = img.get(img.width / 2, img.height / 2);
   * }
     *
     * function draw() {
   *   background(c);
   *   image(img, 25, 25, 50, 50);
   * }
     * </code></div>
     *
     * @alt
     * nothing displayed
     *
     */

    /**
     * The setup() function is called once when the program starts. It's used to
     * define initial environment properties such as screen size and background
     * color and to load media such as images and fonts as the program starts.
     * There can only be one setup() function for each program and it shouldn't
     * be called again after its initial execution.
     * <br><br>
     * Note: Variables declared within setup() are not accessible within other
     * functions, including draw().
     *
     * @method setup
     * @example
     * <div><code>
     * var a = 0;
     *
     * function setup() {
   *   background(0);
   *   noStroke();
   *   fill(102);
   * }
     *
     * function draw() {
   *   rect(a++ % width, 10, 2, 80);
   * }
     * </code></div>
     *
     * @alt
     * nothing displayed
     *
     */

    /**
     * Called directly after setup(), the draw() function continuously executes
     * the lines of code contained inside its block until the program is stopped
     * or noLoop() is called. Note if noLoop() is called in setup(), draw() will
     * still be executed once before stopping. draw() is called automatically and
     * should never be called explicitly.
     * <br><br>
     * It should always be controlled with noLoop(), redraw() and loop(). After
     * noLoop() stops the code in draw() from executing, redraw() causes the
     * code inside draw() to execute once, and loop() will cause the code
     * inside draw() to resume executing continuously.
     * <br><br>
     * The number of times draw() executes in each second may be controlled with
     * the frameRate() function.
     * <br><br>
     * There can only be one draw() function for each sketch, and draw() must
     * exist if you want the code to run continuously, or to process events such
     * as mousePressed(). Sometimes, you might have an empty call to draw() in
     * your program, as shown in the above example.
     * <br><br>
     * It is important to note that the drawing coordinate system will be reset
     * at the beginning of each draw() call. If any transformations are performed
     * within draw() (ex: scale, rotate, translate), their effects will be
     * undone at the beginning of draw(), so transformations will not accumulate
     * over time. On the other hand, styling applied (ex: fill, stroke, etc) will
     * remain in effect.
     *
     * @method draw
     * @example
     * <div><code>
     * var yPos = 0;
     * function setup() {
  // setup() runs once
   *   frameRate(30);
   * }
     * function draw() {
  // draw() loops forever, until stopped
   *   background(204);
   *   yPos = yPos - 1;
   *   if (yPos < 0) {
   *     yPos = height;
   *   }
   *   line(0, yPos, width, yPos);
   * }
     * </code></div>
     *
     * @alt
     * nothing displayed
     *
     */

    //////////////////////////////////////////////
    // PRIVATE p5 PROPERTIES AND METHODS
    //////////////////////////////////////////////

    this._setupDone = false;
    // for handling hidpi
    this._pixelDensity = Math.ceil(window.devicePixelRatio) || 1;
    this._userNode = node;
    this._curElement = null;
    this._elements = [];
    this._requestAnimId = 0;
    this._preloadCount = 0;
    this._isGlobal = false;
    this._loop = true;
    this._initializeInstanceVariables();
    this._defaultCanvasSize = {
        width: 100,
        height: 100
    };
    this._events = {
        // keep track of user-events for unregistering later
        mousemove: null,
        mousedown: null,
        mouseup: null,
        dragend: null,
        dragover: null,
        click: null,
        dblclick: null,
        mouseover: null,
        mouseout: null,
        keydown: null,
        keyup: null,
        keypress: null,
        touchstart: null,
        touchmove: null,
        touchend: null,
        resize: null,
        blur: null
    };

    this._events.wheel = null;
    this._loadingScreenId = 'p5_loading';

    // Allows methods to be registered on an instance that
    // are instance-specific.
    this._registeredMethods = {};
    var methods = Object.getOwnPropertyNames(p5.prototype._registeredMethods);
    for (var i = 0; i < methods.length; i++) {
        var prop = methods[i];
        this._registeredMethods[prop] = p5.prototype._registeredMethods[
            prop
            ].slice();
    }

    if (window.DeviceOrientationEvent) {
        this._events.deviceorientation = null;
    }
    if (window.DeviceMotionEvent && !window._isNodeWebkit) {
        this._events.devicemotion = null;
    }

    this._start = function() {
        // Find node if id given
        if (this._userNode) {
            if (typeof this._userNode === 'string') {
                this._userNode = document.getElementById(this._userNode);
            }
        }

        var userPreload = this.preload || window.preload; // look for "preload"
        if (userPreload) {
            // Setup loading screen
            // Set loading screen into dom if not present
            // Otherwise displays and removes user provided loading screen
            var loadingScreen = document.getElementById(this._loadingScreenId);
            if (!loadingScreen) {
                loadingScreen = document.createElement('div');
                loadingScreen.innerHTML = 'Loading...';
                loadingScreen.style.position = 'absolute';
                loadingScreen.id = this._loadingScreenId;
                var node = this._userNode || document.body;
                node.appendChild(loadingScreen);
            }
            // var methods = this._preloadMethods;
            for (var method in this._preloadMethods) {
                // default to p5 if no object defined
                this._preloadMethods[method] = this._preloadMethods[method] || p5;
                var obj = this._preloadMethods[method];
                //it's p5, check if it's global or instance
                if (obj === p5.prototype || obj === p5) {
                    if (this._isGlobal) {
                        window[method] = this._wrapPreload(this, method);
                    }
                    obj = this;
                }
                this._registeredPreloadMethods[method] = obj[method];
                obj[method] = this._wrapPreload(obj, method);
            }

            userPreload();
            this._runIfPreloadsAreDone();
        } else {
            this._setup();
            this._runFrames();
            this._draw();
        }
    }.bind(this);

    this._runIfPreloadsAreDone = function() {
        var context = this._isGlobal ? window : this;
        if (context._preloadCount === 0) {
            var loadingScreen = document.getElementById(context._loadingScreenId);
            if (loadingScreen) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
            context._setup();
            context._runFrames();
            context._draw();
        }
    };

    this._decrementPreload = function() {
        var context = this._isGlobal ? window : this;
        if (typeof context.preload === 'function') {
            context._setProperty('_preloadCount', context._preloadCount - 1);
            context._runIfPreloadsAreDone();
        }
    };

    this._wrapPreload = function(obj, fnName) {
        return function() {
            //increment counter
            this._incrementPreload();
            //call original function
            return this._registeredPreloadMethods[fnName].apply(obj, arguments);
        }.bind(this);
    };

    this._incrementPreload = function() {
        var context = this._isGlobal ? window : this;
        context._setProperty('_preloadCount', context._preloadCount + 1);
    };

    this._setup = function() {
        // Always create a default canvas.
        // Later on if the user calls createCanvas, this default one
        // will be replaced
        this.createCanvas(
            this._defaultCanvasSize.width,
            this._defaultCanvasSize.height,
            'p2d'
        );

        // return preload functions to their normal vals if switched by preload
        var context = this._isGlobal ? window : this;
        if (typeof context.preload === 'function') {
            for (var f in this._preloadMethods) {
                context[f] = this._preloadMethods[f][f];
                if (context[f] && this) {
                    context[f] = context[f].bind(this);
                }
            }
        }

        // Short-circuit on this, in case someone used the library in "global"
        // mode earlier
        if (typeof context.setup === 'function') {
            context.setup();
        }

        // unhide any hidden canvases that were created
        var canvases = document.getElementsByTagName('canvas');
        for (var i = 0; i < canvases.length; i++) {
            var k = canvases[i];
            if (k.dataset.hidden === 'true') {
                k.style.visibility = '';
                delete k.dataset.hidden;
            }
        }
        this._setupDone = true;
    }.bind(this);

    this._draw = function() {
        var now = window.performance.now();
        var time_since_last = now - this._lastFrameTime;
        var target_time_between_frames = 1000 / this._targetFrameRate;

        // only draw if we really need to; don't overextend the browser.
        // draw if we're within 5ms of when our next frame should paint
        // (this will prevent us from giving up opportunities to draw
        // again when it's really about time for us to do so). fixes an
        // issue where the frameRate is too low if our refresh loop isn't
        // in sync with the browser. note that we have to draw once even
        // if looping is off, so we bypass the time delay if that
        // is the case.
        var epsilon = 5;
        if (
            !this._loop ||
            time_since_last >= target_time_between_frames - epsilon
        ) {
            //mandatory update values(matrixs and stack)

            this.redraw();
            this._frameRate = 1000.0 / (now - this._lastFrameTime);
            this._lastFrameTime = now;

            // If the user is actually using mouse module, then update
            // coordinates, otherwise skip. We can test this by simply
            // checking if any of the mouse functions are available or not.
            // NOTE : This reflects only in complete build or modular build.
            if (typeof this._updateMouseCoords !== 'undefined') {
                this._updateMouseCoords();
            }
        }

        // get notified the next time the browser gives us
        // an opportunity to draw.
        if (this._loop) {
            this._requestAnimId = window.requestAnimationFrame(this._draw);
        }
    }.bind(this);

    this._runFrames = function() {
        if (this._updateInterval) {
            clearInterval(this._updateInterval);
        }
    }.bind(this);

    this._setProperty = function(prop, value) {
        this[prop] = value;
        if (this._isGlobal) {
            window[prop] = value;
        }
    }.bind(this);

    /**
     * Removes the entire p5 sketch. This will remove the canvas and any
     * elements created by p5.js. It will also stop the draw loop and unbind
     * any properties or methods from the window global scope. It will
     * leave a variable p5 in case you wanted to create a new p5 sketch.
     * If you like, you can set p5 = null to erase it. While all functions and
     * variables and objects created by the p5 library will be removed, any
     * other global variables created by your code will remain.
     *
     * @method remove
     * @example
     * <div class='norender'><code>
     * function draw() {
   *   ellipse(50, 50, 10, 10);
   * }
     *
     * function mousePressed() {
   *   remove(); // remove whole sketch on mouse press
   * }
     * </code></div>
     *
     * @alt
     * nothing displayed
     *
     */
    this.remove = function() {
        var loadingScreen = document.getElementById(this._loadingScreenId);
        if (loadingScreen) {
            loadingScreen.parentNode.removeChild(loadingScreen);
            // Add 1 to preload counter to prevent the sketch ever executing setup()
            this._incrementPreload();
        }
        if (this._curElement) {
            // stop draw
            this._loop = false;
            if (this._requestAnimId) {
                window.cancelAnimationFrame(this._requestAnimId);
            }

            // unregister events sketch-wide
            for (var ev in this._events) {
                window.removeEventListener(ev, this._events[ev]);
            }

            // remove DOM elements created by p5, and listeners
            for (var i = 0; i < this._elements.length; i++) {
                var e = this._elements[i];
                if (e.elt.parentNode) {
                    e.elt.parentNode.removeChild(e.elt);
                }
                for (var elt_ev in e._events) {
                    e.elt.removeEventListener(elt_ev, e._events[elt_ev]);
                }
            }

            // call any registered remove functions
            var self = this;
            this._registeredMethods.remove.forEach(function(f) {
                if (typeof f !== 'undefined') {
                    f.call(self);
                }
            });
        }
        // remove window bound properties and methods
        if (this._isGlobal) {
            for (var p in p5.prototype) {
                try {
                    delete window[p];
                } catch (x) {
                    window[p] = undefined;
                }
            }
            for (var p2 in this) {
                if (this.hasOwnProperty(p2)) {
                    try {
                        delete window[p2];
                    } catch (x) {
                        window[p2] = undefined;
                    }
                }
            }
            p5.instance = null;
        }
    }.bind(this);

    // call any registered init functions
    this._registeredMethods.init.forEach(function(f) {
        if (typeof f !== 'undefined') {
            f.call(this);
        }
    }, this);

    var friendlyBindGlobal = this._createFriendlyGlobalFunctionBinder();

    // If the user has created a global setup or draw function,
    // assume "global" mode and make everything global (i.e. on the window)
    if (!sketch) {
        this._isGlobal = true;
        p5.instance = this;
        // Loop through methods on the prototype and attach them to the window
        for (var p in p5.prototype) {
            if (typeof p5.prototype[p] === 'function') {
                var ev = p.substring(2);
                if (!this._events.hasOwnProperty(ev)) {
                    if (Math.hasOwnProperty(p) && Math[p] === p5.prototype[p]) {
                        // Multiple p5 methods are just native Math functions. These can be
                        // called without any binding.
                        friendlyBindGlobal(p, p5.prototype[p]);
                    } else {
                        friendlyBindGlobal(p, p5.prototype[p].bind(this));
                    }
                }
            } else {
                friendlyBindGlobal(p, p5.prototype[p]);
            }
        }
        // Attach its properties to the window
        for (var p2 in this) {
            if (this.hasOwnProperty(p2)) {
                friendlyBindGlobal(p2, this[p2]);
            }
        }
    } else {
        // Else, the user has passed in a sketch closure that may set
        // user-provided 'setup', 'draw', etc. properties on this instance of p5
        sketch(this);
    }

    // Bind events to window (not using container div bc key events don't work)

    for (var e in this._events) {
        var f = this['_on' + e];
        if (f) {
            var m = f.bind(this);
            window.addEventListener(e, m, { passive: false });
            this._events[e] = m;
        }
    }

    var focusHandler = function() {
        this._setProperty('focused', true);
    }.bind(this);
    var blurHandler = function() {
        this._setProperty('focused', false);
    }.bind(this);
    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
    this.registerMethod('remove', function() {
        window.removeEventListener('focus', focusHandler);
        window.removeEventListener('blur', blurHandler);
    });

    if (sync) {
        this._start();
    } else {
        if (document.readyState === 'complete') {
            this._start();
        } else {
            window.addEventListener('load', this._start.bind(this), false);
        }
    }
};

p5.prototype._initializeInstanceVariables = function() {
    this._styles = [];

    this._bezierDetail = 20;
    this._curveDetail = 20;

    this._colorMode = constants.RGB;
    this._colorMaxes = {
        rgb: [255, 255, 255, 255],
        hsb: [360, 100, 100, 1],
        hsl: [360, 100, 100, 1]
    };
};

// This is a pointer to our global mode p5 instance, if we're in
// global mode.
p5.instance = null;

// Allows for the friendly error system to be turned off when creating a sketch,
// which can give a significant boost to performance when needed.
p5.disableFriendlyErrors = false;

// attach constants to p5 prototype
for (var k in constants) {
    p5.prototype[k] = constants[k];
}

// functions that cause preload to wait
// more can be added by using registerPreloadMethod(func)
p5.prototype._preloadMethods = {
    loadJSON: p5.prototype,
    loadImage: p5.prototype,
    loadStrings: p5.prototype,
    loadXML: p5.prototype,
    loadBytes: p5.prototype,
    loadShape: p5.prototype,
    loadTable: p5.prototype,
    loadFont: p5.prototype,
    loadModel: p5.prototype,
    loadShader: p5.prototype
};

p5.prototype._registeredMethods = { init: [], pre: [], post: [], remove: [] };

p5.prototype._registeredPreloadMethods = {};

p5.prototype.registerPreloadMethod = function(fnString, obj) {
    // obj = obj || p5.prototype;
    if (!p5.prototype._preloadMethods.hasOwnProperty(fnString)) {
        p5.prototype._preloadMethods[fnString] = obj;
    }
};

p5.prototype.registerMethod = function(name, m) {
    var target = this || p5.prototype;
    if (!target._registeredMethods.hasOwnProperty(name)) {
        target._registeredMethods[name] = [];
    }
    target._registeredMethods[name].push(m);
};

p5.prototype._createFriendlyGlobalFunctionBinder = function(options) {
    options = options || {};

    var globalObject = options.globalObject || window;
    var log = options.log || console.log.bind(console);
    var propsToForciblyOverwrite = {
        // p5.print actually always overwrites an existing global function,
        // albeit one that is very unlikely to be used:
        //
        //   https://developer.mozilla.org/en-US/docs/Web/API/Window/print
        print: true
    };

    return function(prop, value) {
        if (
            !p5.disableFriendlyErrors &&
            typeof IS_MINIFIED === 'undefined' &&
            typeof value === 'function' &&
            !(prop in p5.prototype._preloadMethods)
        ) {
            try {
                // Because p5 has so many common function names, it's likely
                // that users may accidentally overwrite global p5 functions with
                // their own variables. Let's allow this but log a warning to
                // help users who may be doing this unintentionally.
                //
                // For more information, see:
                //
                //   https://github.com/processing/p5.js/issues/1317

                if (prop in globalObject && !(prop in propsToForciblyOverwrite)) {
                    throw new Error('global "' + prop + '" already exists');
                }

                // It's possible that this might throw an error because there
                // are a lot of edge-cases in which `Object.defineProperty` might
                // not succeed; since this functionality is only intended to
                // help beginners anyways, we'll just catch such an exception
                // if it occurs, and fall back to legacy behavior.
                Object.defineProperty(globalObject, prop, {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return value;
                    },
                    set: function(newValue) {
                        Object.defineProperty(globalObject, prop, {
                            configurable: true,
                            enumerable: true,
                            value: newValue,
                            writable: true
                        });
                        log(
                            'You just changed the value of "' +
                            prop +
                            '", which was ' +
                            "a p5 function. This could cause problems later if you're " +
                            'not careful.'
                        );
                    }
                });
            } catch (e) {
                log(
                    'p5 had problems creating the global function "' +
                    prop +
                    '", ' +
                    'possibly because your code is already using that name as ' +
                    'a variable. You may want to rename your variable to something ' +
                    'else.'
                );
                globalObject[prop] = value;
            }
        } else {
            globalObject[prop] = value;
        }
    };
};

module.exports = p5;