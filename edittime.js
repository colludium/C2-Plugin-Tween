function GetBehaviorSettings()
{
	return {
		"name":			"Tween",			
		"id":			"Tween",			
		"version":		"1.0",					
		"description":	"Tween a value for use in event system",
		"author":		"Colludium",
		"help url":		"https://www.scirra.com/forum/viewtopic.php?t=187854",
		"category":		"General",				
		"flags":		0						
					//	| bf_onlyone			
	};
};


////////////////////////////////////////
// Conditions

AddCondition(0,
	cf_trigger,
	"End of tween",
	"Tween",
	"{my} on end.",
	"Triggers at the end of the tween.",
	"onEnd");
	
AddCondition(1,
	0,
	"Is tweening",
	"Tween",
	"Is {my} active",
	"True if tween is in progress.",
	"isTweening");
////////////////////////////////////////
// Actions

AddAction(0,
	af_none,
	"Start",
	"",
	"Start or continue {my}.",
	"Start or continue a tween.",
	"unpause");
	
AddAction(1,
	af_none,
	"Restart",
	"",
	"Restart {my}.",
	"Reset and restart a tween from the beginning.",
	"restart");
	
AddAction(2,
	af_none,
	"Stop",
	"",
	"Stop / pause {my}.",
	"Stop / pause a tween.",
	"stop");
	
AddComboParamOption("easeInQuad");
AddComboParamOption("easeOutQuad");
AddComboParamOption("easeInOutQuad");
AddComboParamOption("easeInCubic");
AddComboParamOption("easeOutCubic");
AddComboParamOption("easeInOutCubic");
AddComboParamOption("easeInQuart");
AddComboParamOption("easeOutQuart");
AddComboParamOption("easeInOutQuart");
AddComboParamOption("easeInQuint");
AddComboParamOption("easeOutQuint");
AddComboParamOption("easeInOutQuint");
AddComboParamOption("easeInSine");
AddComboParamOption("easeOutSine");
AddComboParamOption("easeInOutSine");
AddComboParamOption("easeInExpo");
AddComboParamOption("easeOutExpo");
AddComboParamOption("easeInOutExpo");
AddComboParamOption("easeInCirc");
AddComboParamOption("easeOutCirc");
AddComboParamOption("easeInOutCirc");
AddComboParamOption("easeInElastic");
AddComboParamOption("easeOutElastic");
AddComboParamOption("easeInOutElastic");
AddComboParamOption("easeInBack");
AddComboParamOption("easeOutBack");
AddComboParamOption("easeInOutBack");
AddComboParamOption("easeInBounce");
AddComboParamOption("easeOutBounce");
AddComboParamOption("easeInOutBounce");
AddComboParamOption("linearTween");
AddComboParam("Tween type.",
	"The type of tween profile.");
AddNumberParam("Start value",
	"The value at the start of the tween.");
AddNumberParam("End value",
	"The target value at the end of the tween.");
AddNumberParam("Duration",
	"The duration of the tween, in seconds.");
AddComboParamOption("Run once");
AddComboParamOption("Ping-pong, then stop");
AddComboParamOption("Ping-pong, then repeat");
AddComboParam("Mode",
	"The mode of tween.");
AddComboParamOption("Do not start");
AddComboParamOption("Start tween now");
AddComboParam("Set running",
	"Set whether the tween runs immediately.", 1);
AddAction(3,
	af_none,
	"Tween setup",
	"",
	"{my} tween {0}, from {1} to {2}, time {3}.",
	"Set all of the tween parameters.",
	"setupTween");
	
AddNumberParam("Start Value",
	"The starting value.");
AddNumberParam("End Value",
	"The target end value.");
AddNumberParam("Start control value",
	"The value of the start control point, from 0 (typically 0 to 1).");
AddNumberParam("End control value",
	"The value of the end control point, from 0 (typically 0 to 1).");
AddNumberParam("Duration",
	"The duration of the bezier tween, in seconds.");
AddComboParamOption("Run once");
AddComboParamOption("Ping-pong, then stop");
AddComboParamOption("Ping-pong, then repeat");
AddComboParam("Mode",
	"The mode of bezier tween.");
AddComboParamOption("Do not start");
AddComboParamOption("Start tween now");
AddComboParam("Set running",
	"Set whether the bezier tween runs immediately.", 1);
AddAction(4,
	af_none,
	"Bezier setup",
	"",
	"{my} bezier from {0} to {1}, control points {2}, {3}; time {4}.",
	"Set all of the bezier parameters.",
	"setupBezier");
	
AddNumberParam("Start control value",
	"The value of the start control point, from 0 (typically 0 to 1).");
AddNumberParam("End control value",
	"The value of the end control point, from 0 (typically 0 to 1).");
AddNumberParam("Duration",
	"The duration of the bezier tween, in seconds.");
AddComboParamOption("Run once");
AddComboParamOption("Ping-pong, then stop");
AddComboParamOption("Ping-pong, then repeat");
AddComboParam("Mode",
	"The mode of bezier tween.");
AddComboParamOption("Do not start");
AddComboParamOption("Start tween now");
AddComboParam("Set running",
	"Set whether the bezier tween runs immediately.", 1);
AddAction(5,
	af_none,
	"Bezier 'light' setup",
	"",
	"{my} bezier light, control points {0}, {1}; time {2}.",
	"Set params for a unit bezier tween, with result values from 0 to 1, control points relative to origin point.",
	"setupBezierUnit");
	
AddAction(6,
	af_none,
	"Reverse",
	"",
	"Reverse a tween from its current direction.",
	"Reverse a tween from its current direction.",
	"reverse");
	
AddNumberParam("Start control value",
	"The value of the start control point, from 0 (typically 0 to 1).");
AddAction(7,
	af_none,
	"Control point: start",
	"",
	"{my} bezier start control {0}.",
	"Set the start control value.",
	"setupBezierCtrlStart");
	
AddNumberParam("End control value",
	"The value of the end control point, from 0 (typically 0 to 1).");
AddAction(8,
	af_none,
	"Control point: end",
	"",
	"{my} bezier end control {0}.",
	"Set the end control value.",
	"setupBezierCtrlEnd");
	

////////////////////////////////////////
// Expressions

AddExpression(0,
	ef_return_number,
	"Progress",
	"",
	"progress",
	"Get the tween progress, 0 to 1.");
	
AddExpression(1,
	ef_return_number,
	"Value",
	"",
	"currentValue",
	"Get the current value of the tween.");
	
AddNumberParam("Time",
	"The time in the tween, fraction from 0 to 1.",
	0);
AddExpression(41,
	ef_return_number,
	ef_variadic_parameters,
	"",
	"getValueAtTime",
	"Return the value of the tween at a specified time value (time from 0 to 1).");
	

////////////////////////////////////////
ACESDone();

var property_list = [
	
	];
	
// Called by IDE when a new behavior type is to be created
function CreateIDEBehaviorType()
{
	return new IDEBehaviorType();
}

// Class representing a behavior type in the IDE
function IDEBehaviorType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new behavior instance of this type is to be created
IDEBehaviorType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of the behavior in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// any other properties here, e.g...
	// this.myValue = 0;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
