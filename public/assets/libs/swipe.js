/*!
 * Swipe 2.2.3
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
 */
/**
 * Modified by yw_sun
 * Add a new direction for slide : vertical
 * Some comments may not suitable for vertical condition cause I didn't sync them
 */

// if the module has no dependencies, the above pattern can be simplified to
// eslint-disable-next-line no-extra-semi
;(function (root, factory) {
    // eslint-disable-next-line no-undef
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // eslint-disable-next-line no-undef
        define([], function(){
            root.Swipe = factory();
            return root.Swipe;
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals
        root.Swipe = factory();
    }
}(this, function () {
    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;

    var _document = root.document;

    function Swipe(container, options) {

        'use strict';

        options = options || {};

        // setup initial vars
        var start = {};
        var delta = {};
        var isPullingLateral;

        // setup auto slideshow
        var delay = options.auto || 0;
        var interval;

        // utilities
        // simple no operation function
        var noop = function() {};
        // offload a functions execution
        var offloadFn = function(fn) { setTimeout(fn || noop, 0); };
        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered.
        var throttle = function (fn, threshhold) {
            threshhold = threshhold || 100;
            var timeout = null;

            function cancel() {
                if (timeout) clearTimeout(timeout);
            }

            function throttledFn() {
                var context = this;
                var args = arguments;
                cancel();
                timeout = setTimeout(function() {
                    timeout = null;
                    fn.apply(context, args);
                }, threshhold);
            }

            // allow remove throttled timeout
            throttledFn.cancel = cancel;

            return throttledFn;
        };

        // check browser capabilities
        var browser = {
            addEventListener: !!root.addEventListener,
            // eslint-disable-next-line no-undef
            touch: ('ontouchstart' in root) || root.DocumentTouch && _document instanceof DocumentTouch,
            transitions: (function(temp) {
                var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
                for ( var i in props ) {
                    if (temp.style[ props[i] ] !== undefined){
                        return true;
                    }
                }
                return false;
            })(_document.createElement('swipe'))
        };

        // quit if no root element
        if (!container) return;

        // Orientation option: The orientation of the slider; horizontal for default
        options.orientation = (options.orientation !== 'horizontal' && options.orientation !== 'vertical') ? 'horizontal' : options.orientation;

        var orientationId = options.orientation === 'horizontal' ? 1:2;

        var element = container.children[0];
        var slides, slidePosX, slidePosY, width, height, length;
        function getSlidePos() {
            if(orientationId === 1) {
                return slidePosX;
            } else {
                return slidePosY;
            }
        }
        function getBoundAmount() {
            if(orientationId === 1) {
                return width;
            } else {
                return height;
            }
        }
        function setElementStartPos(element, value) {
            if(orientationId === 1) {
                element.style.left = value;
            } else {
                element.style.top = value;
            }
        }
        function setElementAmount(element, value) {
            if(orientationId === 1) {
                element.style.width = value;
            } else {
                element.style.height = value;
            }
        }
        function initSlidePos() {
            slidePosX = new Array(slides.length);
            slidePosY = new Array(slides.length);
        }
        function initBoundAmount() {
            width = options.slideWidth || container.getBoundingClientRect().width || container.offsetWidth;
            height = options.slideHeight || container.getBoundingClientRect().height || container.offsetHeight;
        }
        function getPrincipalAxis(delta) {
            if(orientationId === 1) {
                return delta.x;
            } else {
                return delta.y;
            }
        }
        function setPrincipleAxis(delta, value) {
            if(orientationId === 1) {
                delta.x = value;
            } else {
                delta.y = value;
            }
        }
        function getLateralAxis(delta) {
            if(orientationId === 1) {
                return delta.y;
            } else {
                return delta.x;
            }
        }
        function setLateralAxis(delta, value) {
            if(orientationId === 1) {
                delta.y = value;
            } else {
                delta.x = value;
            }
        }


        var index = parseInt(options.startSlide, 10) || 0;
        var speed = options.speed || 300;
        options.continuous = options.continuous !== undefined ? options.continuous : true;

        // AutoRestart option: auto restart slideshow after user's touch event
        options.autoRestart = options.autoRestart !== undefined ? options.autoRestart : false;

        // throttled setup
        var throttledSetup = throttle(setup);

        // setup event capturing
        var events = {

            handleEvent: function(event) {
                switch (event.type) {
                    case 'mousedown':
                    case 'touchstart': this.start(event); break;
                    case 'mousemove':
                    case 'touchmove': this.move(event); break;
                    case 'mouseup':
                    case 'mouseleave':
                    case 'touchend': this.end(event); break;
                    case 'webkitTransitionEnd':
                    case 'msTransitionEnd':
                    case 'oTransitionEnd':
                    case 'otransitionend':
                    case 'transitionend': this.transitionEnd(event); break;
                    case 'resize': throttledSetup(); break;
                }

                if (options.stopPropagation) {
                    event.stopPropagation();
                }
            },
            start: function(event) {
                var touches;

                if (isMouseEvent(event)) {
                    touches = event;
                    event.preventDefault(); // For desktop Safari drag
                } else {
                    touches = event.touches[0];
                }

                // measure start values
                start = {

                    // get initial touch coords
                    x: touches.pageX,
                    y: touches.pageY,

                    // store time to determine touch duration
                    time: +new Date()

                };

                // used for testing first move event
                isPullingLateral = undefined;

                // reset delta and end measurements
                delta = {};

                // attach touchmove and touchend listeners
                if (isMouseEvent(event)) {
                    element.addEventListener('mousemove', this, false);
                    element.addEventListener('mouseup', this, false);
                    element.addEventListener('mouseleave', this, false);
                } else {
                    element.addEventListener('touchmove', this, false);
                    element.addEventListener('touchend', this, false);
                }

            },

            move: function(event) {
                var touches;

                if (isMouseEvent(event)) {
                    touches = event;
                } else {
                    // ensure swiping with one touch and not pinching
                    if ( event.touches.length > 1 || event.scale && event.scale !== 1) {
                        return;
                    }

                    if (options.disableScroll) {
                        event.preventDefault();
                    }

                    touches = event.touches[0];
                }

                // measure change in x and y
                delta = {
                    x: touches.pageX - start.x,
                    y: touches.pageY - start.y
                };

                // determine if scrolling test has run - one time test
                if ( typeof isPullingLateral === 'undefined') {
                    isPullingLateral = !!( isPullingLateral || Math.abs(getPrincipalAxis(delta)) < Math.abs(getLateralAxis(delta)) );
                }

                // if user is not trying to scroll vertically
                if (!isPullingLateral) {

                    // prevent native scrolling
                    event.preventDefault();

                    // stop slideshow
                    stop();

                    // increase resistance if first or last slide
                    if (options.continuous) { // we don't add resistance at the end

                        translate(circle(index-1), getPrincipalAxis(delta) + getSlidePos()[circle(index-1)], 0);
                        translate(index, getPrincipalAxis(delta) + getSlidePos()[index], 0);
                        translate(circle(index+1), getPrincipalAxis(delta) + getSlidePos()[circle(index+1)], 0);

                    } else {

                        var principalDelta =
                            getPrincipalAxis(delta) /
                            ( (!index && getPrincipalAxis(delta) > 0 ||             // if first slide and sliding left
                            index === slides.length - 1 &&        // or if last slide and sliding right
                            getPrincipalAxis(delta) < 0                           // and if sliding at all
                            ) ?
                                ( Math.abs(getPrincipalAxis(delta)) / getBoundAmount() + 1 )      // determine resistance level
                                : 1 );                                 // no resistance if false
                        setPrincipleAxis(delta, principalDelta);

                        // translate 1:1
                        translate(index-1, getPrincipalAxis(delta) + getSlidePos()[index-1], 0);
                        translate(index, getPrincipalAxis(delta) + getSlidePos()[index], 0);
                        translate(index+1, getPrincipalAxis(delta) + getSlidePos()[index+1], 0);
                    }
                }
            },

            end: function(event) {

                // measure duration
                var duration = +new Date() - start.time;

                // determine if slide attempt triggers next/prev slide
                var isValidSlide =
                    Number(duration) < 250 &&         // if slide duration is less than 250ms
                    Math.abs(getPrincipalAxis(delta)) > 20 ||         // and if slide amt is greater than 20px
                    Math.abs(getPrincipalAxis(delta)) > getBoundAmount()/2;      // or if slide amt is greater than half the width

                // determine if slide attempt is past start and end
                var isPastBounds =
                    !index && getPrincipalAxis(delta) > 0 ||                      // if first slide and slide amt is greater than 0
                    index === slides.length - 1 &&getPrincipalAxis(delta) < 0;   // or if last slide and slide amt is less than 0

                if (options.continuous) {
                    isPastBounds = false;
                }

                // OLD determine direction of swipe (true:right, false:left)
                // determine direction of swipe (1: backward, -1: forward)
                var direction = Math.abs(getPrincipalAxis(delta)) / getPrincipalAxis(delta);

                // if not scrolling vertically
                if (!isPullingLateral) {

                    if (isValidSlide && !isPastBounds) {

                        // if we're moving right
                        if (direction < 0) {

                            if (options.continuous) { // we need to get the next in this direction in place

                                move(circle(index-1), -getBoundAmount(), 0);
                                move(circle(index+2), getBoundAmount(), 0);

                            } else {
                                move(index-1, -getBoundAmount(), 0);
                            }

                            move(index, getSlidePos()[index]-getBoundAmount(), speed);
                            move(circle(index+1), getSlidePos()[circle(index+1)]-getBoundAmount(), speed);
                            index = circle(index+1);

                        } else {
                            if (options.continuous) { // we need to get the next in this direction in place

                                move(circle(index+1), getBoundAmount(), 0);
                                move(circle(index-2), -getBoundAmount(), 0);

                            } else {
                                move(index+1, getBoundAmount(), 0);
                            }

                            move(index, getSlidePos()[index]+getBoundAmount(), speed);
                            move(circle(index-1), getSlidePos()[circle(index-1)]+getBoundAmount(), speed);
                            index = circle(index-1);
                        }

                        runCallback(getPos(), slides[index], direction);

                    } else {

                        if (options.continuous) {

                            move(circle(index-1), -getBoundAmount(), speed);
                            move(index, 0, speed);
                            move(circle(index+1), getBoundAmount(), speed);

                        } else {

                            move(index-1, -getBoundAmount(), speed);
                            move(index, 0, speed);
                            move(index+1, getBoundAmount(), speed);
                        }
                    }
                }

                // kill touchmove and touchend event listeners until touchstart called again
                if (isMouseEvent(event)) {
                    element.removeEventListener('mousemove', events, false);
                    element.removeEventListener('mouseup', events, false);
                    element.removeEventListener('mouseleave', events, false);
                } else {
                    element.removeEventListener('touchmove', events, false);
                    element.removeEventListener('touchend', events, false);
                }

            },

            transitionEnd: function(event) {
                var currentIndex = parseInt(event.target.getAttribute('data-index'), 10);
                if (currentIndex === index) {
                    if (delay || options.autoRestart) restart();

                    runTransitionEnd(getPos(), slides[index]);
                }
            }
        };

        // trigger setup
        setup();

        // start auto slideshow if applicable
        if (delay) begin();

        // Expose the Swipe API
        return {
            // initialize
            setup: setup,

            // go to slide
            slide: function(to, speed) {
                stop();
                slide(to, speed);
            },

            // move to previous
            prev: function() {
                stop();
                prev();
            },

            // move to next
            next: function() {
                stop();
                next();
            },

            // Restart slideshow
            restart: restart,

            // cancel slideshow
            stop: stop,

            // return current index position
            getPos: getPos,

            // return total number of slides
            getNumSlides: function() { return length; },

            // completely remove swipe
            kill: kill
        };

        // remove all event listeners
        function detachEvents() {
            if (browser.addEventListener) {
                // remove current event listeners
                element.removeEventListener('touchstart', events, false);
                element.removeEventListener('mousedown', events, false);
                element.removeEventListener('webkitTransitionEnd', events, false);
                element.removeEventListener('msTransitionEnd', events, false);
                element.removeEventListener('oTransitionEnd', events, false);
                element.removeEventListener('otransitionend', events, false);
                element.removeEventListener('transitionend', events, false);
                root.removeEventListener('resize', events, false);
            } else {
                root.onresize = null;
            }
        }

        // add event listeners
        function attachEvents() {
            if (browser.addEventListener) {

                // set touchstart event on element
                if (browser.touch) {
                    element.addEventListener('touchstart', events, false);
                }

                if (options.draggable) {
                    element.addEventListener('mousedown', events, false);
                }

                if (browser.transitions) {
                    element.addEventListener('webkitTransitionEnd', events, false);
                    element.addEventListener('msTransitionEnd', events, false);
                    element.addEventListener('oTransitionEnd', events, false);
                    element.addEventListener('otransitionend', events, false);
                    element.addEventListener('transitionend', events, false);
                }

                // set resize event on window
                root.addEventListener('resize', events, false);

            } else {
                root.onresize = throttledSetup; // to play nice with old IE
            }
        }

        function setup() {
            // cache slides
            slides = element.children;
            length = slides.length;

            // set continuous to false if only one slide
            if (slides.length < 2) {
                options.continuous = false;
            }

            // special case if two slides
            if (browser.transitions && options.continuous && slides.length < 3) {
                var clone0 = slides[0].cloneNode(true);
                var clone1 = element.children[1].cloneNode(true);
                element.appendChild(clone0);
                element.appendChild(clone1);

                // tag these slides as clones (to remove them on kill)
                clone0.setAttribute('data-cloned', true);
                clone1.setAttribute('data-cloned', true);

                slides = element.children;
            }

            // create an array to store current x positions of each slide
            initSlidePos();

            // determine width of each slide
            initBoundAmount();


            setElementAmount(element, (slides.length * getBoundAmount() * 2) + 'px') ;

            // stack elements
            var pos = slides.length;
            while(pos--) {
                var slide = slides[pos];

                setElementAmount(slide, getBoundAmount()+'px');
                slide.setAttribute('data-index', pos);

                if (browser.transitions) {
                    setElementStartPos(slide,  (pos * -getBoundAmount()) + 'px');
                    move(pos, index > pos ? -getBoundAmount() : (index < pos ? getBoundAmount() : 0), 0);
                }
            }

            // reposition elements before and after index
            if (options.continuous && browser.transitions) {
                move(circle(index-1), -getBoundAmount(), 0);
                move(circle(index+1), getBoundAmount(), 0);
            }

            if (!browser.transitions) {
                setElementStartPos(element, (index * -getBoundAmount()) + 'px');
            }

            container.style.visibility = 'visible';

            // reinitialize events
            detachEvents();
            attachEvents();
        }

        function prev() {
            if (options.continuous) {
                slide(index-1);
            }
            else if (index) {
                slide(index-1);
            }
        }

        function next() {

            if (options.continuous) {
                slide(index+1);
            } else if (index < slides.length - 1) {
                slide(index+1);
            }
        }

        function runCallback(pos, index, dir) {
            if (options.callback) {
                options.callback(pos, index, dir);
            }
        }

        function runTransitionEnd(pos, index) {
            if (options.transitionEnd) {
                options.transitionEnd(pos, index);
            }
        }

        function circle(index) {

            // a simple positive modulo using slides.length
            return (slides.length + (index % slides.length)) % slides.length;
        }

        function getPos() {
            // Fix for the clone issue in the event of 2 slides
            var currentIndex = index;

            if (currentIndex >= length) {
                currentIndex = currentIndex - length;
            }

            return currentIndex;
        }

        function slide(to, slideSpeed) {

            // ensure to is of type 'number'
            to = typeof to !== 'number' ? parseInt(to, 10) : to;

            // do nothing if already on requested slide
            if (index === to) return;

            if (browser.transitions) {

                var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

                // get the actual position of the slide
                if (options.continuous) {
                    var natural_direction = direction;
                    direction = -getSlidePos()[circle(to)] / getBoundAmount();

                    // if going forward but to < index, use to = slides.length + to
                    // if going backward but to > index, use to = -slides.length + to
                    if (direction !== natural_direction) {
                        to = -direction * slides.length + to;
                    }

                }

                var diff = Math.abs(index-to) - 1;

                // move all the slides between index and to in the right direction
                while (diff--) {
                    move( circle((to > index ? to : index) - diff - 1), getBoundAmount() * direction, 0);
                }

                to = circle(to);

                move(index, getBoundAmount() * direction, slideSpeed || speed);
                move(to, 0, slideSpeed || speed);

                if (options.continuous) { // we need to get the next in place
                    move(circle(to - direction), -(getBoundAmount() * direction), 0);
                }

            } else {

                to = circle(to);
                animate(index * -getBoundAmount(), to * -getBoundAmount(), slideSpeed || speed);
                // no fallback for a circular continuous if the browser does not accept transitions
            }

            index = to;
            offloadFn(function() {
                runCallback(getPos(), slides[index], direction);
            });
        }

        function move(index, dist, speed) {
            translate(index, dist, speed);
            getSlidePos()[index] = dist;
        }

        function translate(index, dist, speed) {
            if(orientationId === 1) {
                return translateX(index, dist, speed);
            } else {
                return translateY(index, dist, speed);
            }
        }

        function translateX(index, dist, speed) {
            var slide = slides[index];
            var style = slide && slide.style;

            if (!style) return;

            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                    style.msTransitionDuration =
                        style.OTransitionDuration =
                            style.transitionDuration = speed + 'ms';

            style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'translateX(' + dist + 'px)';
        }

        function translateY(index, dist, speed) {
            var slide = slides[index];
            var style = slide && slide.style;

            if (!style) return;

            style.webkitTransitionDuration =
                style.MozTransitionDuration =
                    style.msTransitionDuration =
                        style.OTransitionDuration =
                            style.transitionDuration = speed + 'ms';

            style.webkitTransform = 'translate(0, ' + dist + 'px)' + 'translateZ(0)';
            style.msTransform =
                style.MozTransform =
                    style.OTransform = 'translateY(' + dist + 'px)';
        }

        function animate(from, to, speed) {

            // if not an animation, just reposition
            if (!speed) {
                setElementStartPos(element, to + 'px')
                return;
            }

            var start = +new Date();

            var timer = setInterval(function() {
                var timeElap = +new Date() - start;

                if (timeElap > speed) {

                    setElementStartPos(element, to + 'px'); ;

                    if (delay || options.autoRestart) restart();

                    runTransitionEnd(getPos(), slides[index]);

                    clearInterval(timer);

                    return;
                }

                var startPos = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';
                setElementStartPos(element, startPos);
            }, 4);

        }

        function begin() {
            interval = setTimeout(next, delay);
        }

        function stop() {
            delay = 0;
            clearTimeout(interval);
        }

        function restart() {
            stop();
            delay = options.auto || 0;
            begin();
        }

        function isMouseEvent(e) {
            return /^mouse/.test(e.type);
        }

        function kill() {
            // cancel slideshow
            stop();

            // remove inline styles
            container.style.visibility = '';

            // reset element
            setElementAmount(element, "");
            setElementStartPos(element, "");

            // reset slides
            var pos = slides.length;
            while (pos--) {

                if (browser.transitions) {
                    translate(pos, 0, 0);
                }

                var slide = slides[pos];

                // if the slide is tagged as clone, remove it
                if (slide.getAttribute('data-cloned')) {
                    var _parent = slide.parentElement;
                    _parent.removeChild(slide);
                }

                // remove styles
                setElementAmount(slide, '');
                setElementStartPos(slide, '');

                slide.style.webkitTransitionDuration =
                    slide.style.MozTransitionDuration =
                        slide.style.msTransitionDuration =
                            slide.style.OTransitionDuration =
                                slide.style.transitionDuration = '';

                slide.style.webkitTransform =
                    slide.style.msTransform =
                        slide.style.MozTransform =
                            slide.style.OTransform = '';

                // remove custom attributes (?)
                // slide.removeAttribute('data-index');
            }

            // remove all events
            detachEvents();

            // remove throttled function timeout
            throttledSetup.cancel();
        }
    }

    if ( root.jQuery || root.Zepto ) {
        (function($) {
            $.fn.Swipe = function(params) {
                return this.each(function() {
                    $(this).data('Swipe', new Swipe($(this)[0], params));
                });
            };
        })( root.jQuery || root.Zepto );
    }

    return Swipe;
}));
