// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");
var Tween = [];
var Bezier = [];

(function()
{
	/**
	 * https://github.com/gre/bezier-easing
	 * BezierEasing - use bezier curve for transition easing function
	 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
	 * https://github.com/gre/bezier-easing/blob/master/src/index.js
	 */

	// These values are established by empiricism with tests (tradeoff: performance VS precision)
	var NEWTON_ITERATIONS = 4;
	var NEWTON_MIN_SLOPE = 0.001;
	var SUBDIVISION_PRECISION = 0.0000001;
	var SUBDIVISION_MAX_ITERATIONS = 10;

	var kSplineTableSize = 11;
	var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

	var float32ArraySupported = typeof Float32Array === 'function';

	Bezier.A = function(aA1, aA2)
	{
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}
	Bezier.B = function(aA1, aA2)
	{
		return 3.0 * aA2 - 6.0 * aA1;
	}
	Bezier.C = function(aA1)
	{
		return 3.0 * aA1;
	}

	// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
	Bezier.calcBezier = function(aT, aA1, aA2)
	{
		return ((Bezier.A(aA1, aA2) * aT + Bezier.B(aA1, aA2)) * aT + Bezier.C(aA1)) * aT;
	}

	// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
	Bezier.getSlope = function(aT, aA1, aA2)
	{
		return 3.0 * Bezier.A(aA1, aA2) * aT * aT + 2.0 * Bezier.B(aA1, aA2) * aT + Bezier.C(aA1);
	}

	Bezier.binarySubdivide = function(aX, aA, aB, mX1, mX2)
	{
		var currentX, currentT, i = 0;
		do {
			currentT = aA + (aB - aA) / 2.0;
			currentX = Bezier.calcBezier(currentT, mX1, mX2) - aX;
			if (currentX > 0.0)
			{
				aB = currentT;
			}
			else
			{
				aA = currentT;
			}
		} while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
		return currentT;
	}

	Bezier.newtonRaphsonIterate = function(aX, aGuessT, mX1, mX2)
	{
		for (var i = 0; i < NEWTON_ITERATIONS; ++i)
		{
			var currentSlope = Bezier.getSlope(aGuessT, mX1, mX2);
			if (currentSlope === 0.0)
			{
				return aGuessT;
			}
			var currentX = Bezier.calcBezier(aGuessT, mX1, mX2) - aX;
			aGuessT -= currentX / currentSlope;
		}
		return aGuessT;
	}

	Bezier.bezier = function(mX1, mY1, mX2, mY2)
	{
		if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) // values between 0 and 1 inclusive
		{
			return 
		}

		// Precompute samples table
		var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
		if (mX1 !== mY1 || mX2 !== mY2)
		{
			for (var i = 0; i < kSplineTableSize; ++i)
			{
				sampleValues[i] = Bezier.calcBezier(i * kSampleStepSize, mX1, mX2);
			}
		}

		function getTForX(aX)
		{
			var intervalStart = 0.0;
			var currentSample = 1;
			var lastSample = kSplineTableSize - 1;

			for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample)
			{
				intervalStart += kSampleStepSize;
			}
			--currentSample;

			// Interpolate to provide an initial guess for t
			var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
			var guessForT = intervalStart + dist * kSampleStepSize;

			var initialSlope = Bezier.getSlope(guessForT, mX1, mX2);
			if (initialSlope >= NEWTON_MIN_SLOPE)
			{
				return Bezier.newtonRaphsonIterate(aX, guessForT, mX1, mX2);
			}
			else if (initialSlope === 0.0)
			{
				return guessForT;
			}
			else
			{
				return Bezier.binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
			}
		}

		return function BezierEasing(x)
		{
			if (mX1 === mY1 && mX2 === mY2)
			{
				return x; // linear
			}
			// Because JavaScript number are imprecise, we should guarantee the extremes are right.
			if (x === 0)
			{
				return 0;
			}
			if (x === 1)
			{
				return 1;
			}
			return Bezier.calcBezier(getTForX(x), mY1, mY2);
		};
	};
}());

// standard tween functions
(function()
{
	/**
	* https://github.com/colludium/easing-js/blob/master/easing.js
	* easing.js v0.5.4
	* Generic set of easing functions with AMD support
	* https://github.com/danro/easing-js
	* This code may be freely distributed under the MIT license
	* http://danro.mit-license.org/
	* --------------------------------------------------
	* All functions adapted from Thomas Fuchs & Jeremy Kahn
	* Easing Equations (c) 2003 Robert Penner, BSD license
	* https://raw.github.com/danro/easing-js/master/LICENSE
	* --------------------------------------------------
	*/
	
	
	Tween.easeInQuad = function(t, b, c, d)
	{
		return c * (t /= d) * t + b;
	};
	Tween.easeOutQuad = function(t, b, c, d)
	{
		return -c * (t /= d) * (t - 2) + b;
	};
	Tween.easeInOutQuad = function(t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	};
	Tween.easeInCubic = function(t, b, c, d)
	{
		return c * (t /= d) * t * t + b;
	};
	Tween.easeOutCubic = function(t, b, c, d)
	{
		return c * ((t = t / d - 1) * t * t + 1) + b;
	};
	Tween.easeInOutCubic = function(t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t + 2) + b;
	};
	Tween.easeInQuart = function(t, b, c, d)
	{
		return c * (t /= d) * t * t * t + b;
	};
	Tween.easeOutQuart = function(t, b, c, d)
	{
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	};
	Tween.easeInOutQuart = function(t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	};
	Tween.easeInQuint = function(t, b, c, d)
	{
		return c * (t /= d) * t * t * t * t + b;
	};
	Tween.easeOutQuint = function(t, b, c, d)
	{
		return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	};
	Tween.easeInOutQuint = function(t, b, c, d)
	{
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	};
	Tween.easeInSine = function(t, b, c, d)
	{
		return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	};
	Tween.easeOutSine = function(t, b, c, d)
	{
		return c * Math.sin(t / d * (Math.PI / 2)) + b;
	};
	Tween.easeInOutSine = function(t, b, c, d)
	{
		return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	};
	Tween.easeInExpo = function(t, b, c, d)
	{
		return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
	};
	Tween.easeOutExpo = function(t, b, c, d)
	{
		return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	};
	Tween.easeInOutExpo = function(t, b, c, d)
	{
		if (t == 0) return b;
		if (t == d) return b + c;
		if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	};
	Tween.easeInCirc = function(t, b, c, d)
	{
		return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	};
	Tween.easeOutCirc = function(t, b, c, d)
	{
		return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	};
	Tween.easeInOutCirc = function(t, b, c, d)
	{
		if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
		return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	};
	Tween.easeInElastic = function(t, b, c, d)
	{
		var s = 1.70158;
		var p = 0;
		var a = c;
		if (t == 0) return b;
		if ((t /= d) == 1) return b + c;
		if (!p) p = d * .3;
		if (a < Math.abs(c))
		{
			a = c;
			var s = p / 4;
		}
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	};
	Tween.easeOutElastic = function(t, b, c, d)
	{
		var s = 1.70158;
		var p = 0;
		var a = c;
		if (t == 0) return b;
		if ((t /= d) == 1) return b + c;
		if (!p) p = d * .3;
		if (a < Math.abs(c))
		{
			a = c;
			var s = p / 4;
		}
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	};
	Tween.easeInOutElastic = function(t, b, c, d)
	{
		var s = 1.70158;
		var p = 0;
		var a = c;
		if (t == 0) return b;
		if ((t /= d / 2) == 2) return b + c;
		if (!p) p = d * (.3 * 1.5);
		if (a < Math.abs(c))
		{
			a = c;
			var s = p / 4;
		}
		else var s = p / (2 * Math.PI) * Math.asin(c / a);
		if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	};
	Tween.easeInBack = function(t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	};
	Tween.easeOutBack = function(t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	};
	Tween.easeInOutBack = function(t, b, c, d, s)
	{
		if (s == undefined) s = 1.70158;
		if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	};
	Tween.easeInBounce = function(t, b, c, d)
	{
		return c - Tween.easeOutBounce(d - t, 0, c, d) + b;
	};
	Tween.easeOutBounce = function(t, b, c, d)
	{
		if ((t /= d) < (1 / 2.75))
		{
			return c * (7.5625 * t * t) + b;
		}
		else if (t < (2 / 2.75))
		{
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		}
		else if (t < (2.5 / 2.75))
		{
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		}
		else
		{
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	};
	Tween.easeInOutBounce = function(t, b, c, d)
	{
		if (t < d / 2) return Tween.easeInBounce(t * 2, 0, c, d) * .5 + b;
		return Tween.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	};
}());


/////////////////////////////////////
// Behavior class

cr.behaviors.Tween = function(runtime)
{
	this.runtime = runtime;
};

(function()
{

	var behaviorProto = cr.behaviors.Tween.prototype;

	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};

	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function() {};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst; // associated object instance to modify
		this.runtime = type.runtime;
	};

	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.mode = 0; // 0 = tween, 1 = bezier
		this.isTweening = false;
		this.tweenType = 3;
		this.tweenStart = 0;
		this.tweenEnd = 0;
		this.tweenNow = 0;
		this.timeNow = 0;
		this.progress = 0;
		this.duration = 0;
		this.initialProfile = 0; // take initial setup, for restart, 0 = run once, 1 = ping pong, 2 = ping pong indef
		this.currentProfile = 0; // 0 = run once, 1 = ping pong stop, 2 = ping pong repeat
		this.runDirection = 1; // 1 = forwards, -1 = reverse
		this.ctrlA = 0;
		this.ctrlB = 0;

	};

	behinstProto.onDestroy = function()
	{
	};

	// called when saving the full state of the game
	behinstProto.saveToJSON = function()
	{
		return {
			"me": this.mode,
			"iT": this.isTweening,
			"tT": this.tweenType,
			"ts": this.tweenStart,
			"te": this.tweenEnd,
			"tn": this.tweenNow,
			"tv": this.timeNow,
			"ps": this.progress,
			"du": this.duration,
			"ip": this.initialProfile,
			"cp": this.currentProfile,
			"rd": this.runDirection,
			"cA": this.ctrlA,
			"cB": this.ctrlB
			
		};
	};

	// called when loading the full state of the game
	behinstProto.loadFromJSON = function(o)
	{
		this.mode = o["me"];
		this.isTweening = o["iT"];
		this.tweenType = o["tT"];
		this.tweenStart = o["ts"];
		this.tweenEnd = o["te"];
		this.tweenNow = o["tn"];
		this.timeNow = o["tv"];
		this.progress = o["ps"];
		this.duration = o["du"];
		this.initialProfile = o["ip"];
		this.currentProfile = o["cp"];
		this.runDirection = o["rd"];
		this.ctrlA = o["cA"];
		this.ctrlB = o["cB"];
	};

	behinstProto.tick = function()
	{
		if (this.isTweening)
		{
			var dt = this.runtime.getDt(this.inst);
			this.timeNow += dt * this.runDirection;
			this.progress = 1 - (this.duration - this.timeNow) / this.duration;

			if (this.mode === 1) // bezier tween
			{
				this.tweenNow = Bezier.calcBezier(this.progress, this.ctrlA, this.ctrlB) * (this.tweenEnd - this.tweenStart) + this.tweenStart;
			}
				
			else if (this.mode === 0)// normal
			{
				this.tweenNow = this.doTween(this.tweenType, this.timeNow, this.tweenStart, this.tweenEnd - this.tweenStart, this.duration, 0, 0, 0);
			}

			if (this.currentProfile == 0) // run once
			{
				if (this.progress > 0.99999)
				{
					this.tweenNow = this.tweenEnd;
					this.progress = 1;
					this.timeNow = 0;
					this.isTweening = false;
					this.runtime.trigger(cr.behaviors.Tween.prototype.cnds.onEnd, this.inst);
				}
				
			}
			else if (this.currentProfile > 0) // ping pong
			{
				if (this.runDirection == 1 && this.progress > 0.999999) // end of run in normal direction
				{
					this.tweenNow = this.tweenEnd;
					this.progress = 1;
					this.runDirection = -1;
					this.timeNow = this.duration;
					this.currentProfile = this.initialProfile;
					this.runtime.trigger(cr.behaviors.Tween.prototype.cnds.onEnd, this.inst);
				}
				else if (this.runDirection == -1 && this.progress < 0.000001) // end of run in reverse direction
				{
					this.progress = 0;
					this.runDirection = 1;
					this.tweenNow = this.tweenStart;
					this.timeNow = 0;
		
					if (this.currentProfile ==  1)
					{
						this.currentProfile = this.initialProfile;
						this.isTweening = false;
						this.runtime.trigger(cr.behaviors.Tween.prototype.cnds.onEnd, this.inst);
					}
					else if (this.currentProfile ==  2)
					{
						this.isTweening = true;
						this.runtime.trigger(cr.behaviors.Tween.prototype.cnds.onEnd, this.inst);
					}
				}
			}
		}
	};

	/**BEGIN-PREVIEWONLY**/
	behinstProto.getDebuggerValues = function(propsections)
	{
		propsections.push({
			"title": this.type.name,
			"properties": [
				{"name": "Tweening", "value": this.isTweening},
				{"name": "Progress", "value": this.progress},
				{"name": "Value", "value": this.tweenNow}
			]
		});
	};

	behinstProto.onDebugValueEdited = function(header, name, value)
	{
		
	};
	/**END-PREVIEWONLY**/

	behinstProto.doTween = function(mode, t, b, c, d)
	{
		var tweenNow = 0;
		switch (mode)
		{
			case 0:
				tweenNow = Tween.easeInQuad(t, b, c, d);
				break;
			case 1:
				tweenNow = Tween.easeOutQuad(t, b, c, d);
				break;
			case 2:
				tweenNow = Tween.easeInOutQuad(t, b, c, d);
				break;
			case 3:
				tweenNow = Tween.easeInCubic(t, b, c, d);
				break;
			case 4:
				tweenNow = Tween.easeOutCubic(t, b, c, d);
				break;
			case 5:
				tweenNow = Tween.easeInOutCubic(t, b, c, d);
				break;
			case 6:
				tweenNow = Tween.easeInQuart(t, b, c, d);
				break;
			case 7:
				tweenNow = Tween.easeOutQuart(t, b, c, d);
				break;
			case 8:
				tweenNow = Tween.easeInOutQuart(t, b, c, d);
				break;
			case 9:
				tweenNow = Tween.easeInQuint(t, b, c, d);
				break;
			case 10:
				tweenNow = Tween.easeOutQuint(t, b, c, d);
				break;
			case 11:
				tweenNow = Tween.easeInOutQuint(t, b, c, d);
				break;
			case 12:
				tweenNow = Tween.easeInSine(t, b, c, d);
				break;
			case 13:
				tweenNow = Tween.easeOutSine(t, b, c, d);
				break;
			case 14:
				tweenNow = Tween.easeInOutSine(t, b, c, d);
				break;
			case 15:
				tweenNow = Tween.easeInExpo(t, b, c, d);
				break;
			case 16:
				tweenNow = Tween.easeOutExpo(t, b, c, d);
				break;
			case 17:
				tweenNow = Tween.easeInOutExpo(t, b, c, d);
				break;
			case 18:
				tweenNow = Tween.easeInCirc(t, b, c, d);
				break;
			case 19:
				tweenNow = Tween.easeOutCirc(t, b, c, d);
				break;
			case 20:
				tweenNow = Tween.easeInOutCirc(t, b, c, d);
				break;
			case 21:
				tweenNow = Tween.easeInElastic(t, b, c, d);
				break;
			case 22:
				tweenNow = Tween.easeOutElastic(t, b, c, d);
				break;
			case 23:
				tweenNow = Tween.easeInOutElastic(t, b, c, d);
				break;
			case 24:
				tweenNow = Tween.easeInBack(t, b, c, d);
				break;
			case 25:
				tweenNow = Tween.easeOutBack(t, b, c, d);
				break;
			case 26:
				tweenNow = Tween.easeInOutBack(t, b, c, d);
				break;
			case 27:
				tweenNow = Tween.easeInBounce(t, b, c, d);
				break;
			case 28:
				tweenNow = Tween.easeOutBounce(t, b, c, d);
				break;
			case 29:
				tweenNow = Tween.easeInOutBounce(t, b, c, d);
				break;
			default: break;
		}
		return tweenNow;
	
	};
	
	//////////////////////////////////////
	// Conditions
	function Cnds()
	{};

	// the example condition
	Cnds.prototype.isTweening = function()
	{
		return this.isTweening;
	};

	Cnds.prototype.onEnd = function()
	{
		return true;
	};

	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts()
	{};

	Acts.prototype.setupTween = function(type, start, finish, duration, mode, runNow)
	{
		this.mode = 0;
		this.tweenType = type;
		this.tweenStart = start;
		this.tweenEnd = finish;
		this.tweenNow = start;
		this.duration = duration;
		this.initialProfile = mode;
		this.currentProfile = mode;
		this.isTweening = (runNow != 0);
		this.timeNow = 0;
		this.progress = 0;
		
	};
	
	Acts.prototype.setupBezier = function(start, finish, ctrlA, ctrlB, duration, mode, runNow) // setup bezier easing
	{
		this.mode = 1;
		this.runDirection = 1;
		this.tweenStart = start;
		this.tweenEnd = finish;
		this.ctrlA = ctrlA;
		this.ctrlB = ctrlB;
		this.tweenNow = start;
		this.duration = duration;
		this.initialProfile = mode;
		this.currentProfile = mode;
		this.isTweening = (runNow != 0);
		this.timeNow = 0;
		this.progress = 0;
		
	};
	
	Acts.prototype.setupBezierUnit = function(ctrlA, ctrlB, duration, mode, runNow) // setup bezier easing
	{
		this.mode = 1;
		this.runDirection = 1;
		this.tweenStart = 0;
		this.tweenEnd = 1;
		this.ctrlA = ctrlA;
		this.ctrlB = ctrlB;
		this.tweenNow = 0;
		this.duration = duration;
		this.initialProfile = mode;
		this.currentProfile = mode;
		this.isTweening = (runNow != 0);
		this.timeNow = 0;
		this.progress = 0;
	};
	
	Acts.prototype.unpause = function() //run or unpause the tween
	{
		this.isTweening = true;
	};
	
	Acts.prototype.reverse = function() 
	{
		
		if (this.currentProfile == 0)
		{
			this.currentProfile = 1;
			this.runDirection = -1;
		}
		else if (this.initialProfile > 0)
		{
			this.runDirection *= -1;
		}
		
		this.isTweening = true;
	};

	Acts.prototype.restart = function() // reset and restart the tween
	{
		this.timeNow = 0;
		this.tweenNow = this.tweenStart;
		this.currentProfile = this.initialProfile;
		this.progress = 0;
		this.runDirection = 1;
		this.isTweening = true;
	};

	Acts.prototype.stop = function() // stop or pause the tween
	{
		this.isTweening = false;
	};
	
	Acts.prototype.setupBezierCtrlStart = function(a) 
	{
		this.ctrlA = a;
	};
	
	Acts.prototype.setupBezierCtrlEnd = function(a) 
	{
		this.ctrlB = a;
	};
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps()
	{};


	Exps.prototype.progress = function(ret)
	{
		ret.set_float(this.progress);
	};
	
	Exps.prototype.currentValue = function(ret)
	{
		ret.set_float(this.tweenNow);
	};
	
	Exps.prototype.getValueAtTime = function(ret, time)
	{
		var retValue;
		if (this.mode === 0)
		{
			retValue = this.doTween(this.tweenType, time*this.duration, this.tweenStart, this.tweenEnd - this.tweenStart, this.duration, 0, 0, 0);
		}
		else if (this.mode === 1)
		{
			retValue = Bezier.calcBezier(time, this.ctrlA, this.ctrlB) * (this.tweenEnd - this.tweenStart) + this.tweenStart;
		}
		
		ret.set_float(retValue);
	};
	
	behaviorProto.exps = new Exps();

}());