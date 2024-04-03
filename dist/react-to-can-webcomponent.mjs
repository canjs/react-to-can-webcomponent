(function(global, env) {
	// jshint ignore:line
	if (typeof process === "undefined") {
		global.process = {
			argv: [],
			cwd: function() {
				return "";
			},
			browser: true,
			env: {
				NODE_ENV: env || "development"
			},
			version: "",
			platform:
				global.navigator &&
				global.navigator.userAgent &&
				/Windows/.test(global.navigator.userAgent)
					? "win"
					: ""
		};
	}
})(
	typeof self == "object" && self.Object == Object
		? self
		: typeof process === "object" &&
		  Object.prototype.toString.call(process) === "[object process]"
			? global
			: window,
	"development"
);

var canNamespace_1_0_0_canNamespace = {};

var supportsNativeSymbols = (function() {
	var symbolExists = typeof Symbol !== "undefined" && typeof Symbol.for === "function";

	if (!symbolExists) {
		return false;
	}

	var symbol = Symbol("a symbol for testing symbols");
	return typeof symbol === "symbol";
}());

var CanSymbol;
if(supportsNativeSymbols) {
	CanSymbol = Symbol;
} else {

	var symbolNum = 0;
	CanSymbol = function CanSymbolPolyfill(description){
		var symbolValue = "@@symbol"+(symbolNum++)+(description);

		var symbol = {}; // make it object type

		Object.defineProperties(symbol, {
			toString: {
				value: function(){
					return symbolValue;
				}
			}
		});

		return symbol;
	};

	var descriptionToSymbol = {};
	var symbolToDescription = {};

	/**
	 * @function can-symbol.for for
	 * @parent  can-symbol/methods
	 * @description  Get a symbol based on a known string identifier, or create it if it doesn't exist.
	 *
	 * @signature `canSymbol.for(String)`
	 *
	 * @param { String } description  The string value of the symbol
	 * @return { CanSymbol } The globally unique and consistent symbol with the given string value.
	 */
	CanSymbol.for = function(description){
		var symbol = descriptionToSymbol[description];
		if(!symbol) {
			symbol = descriptionToSymbol[description] = CanSymbol(description);
			symbolToDescription[symbol] = description;
		}
		return symbol;
	};
	/**
	 * @function can-symbol.keyFor keyFor
	 * @parent  can-symbol
	 * @description  Get the description for a symbol.
	 *
	 * @signature `canSymbol.keyFor(CanSymbol)`
	 *
	 * @param { String } description  The string value of the symbol
	 * @return { CanSymbol } The globally unique and consistent symbol with the given string value.
	 */
	CanSymbol.keyFor = function(symbol) {
		return symbolToDescription[symbol];
	};
	["hasInstance","isConcatSpreadable",
		"iterator","match","prototype","replace","search","species","split",
	"toPrimitive","toStringTag","unscopables"].forEach(function(name){
		CanSymbol[name] = CanSymbol("Symbol."+name);
	});
}

// Generate can. symbols.
[
	// ======= Type detection ==========
	"isMapLike",
	"isListLike",
	"isValueLike",
	"isFunctionLike",
	// ======= Shape detection =========
	"getOwnKeys",
	"getOwnKeyDescriptor",
	"proto",
	// optional
	"getOwnEnumerableKeys",
	"hasOwnKey",
	"hasKey",
	"size",
	"getName",
	"getIdentity",

	// shape manipulation
	"assignDeep",
	"updateDeep",

	// ======= GET / SET
	"getValue",
	"setValue",
	"getKeyValue",
	"setKeyValue",
	"updateValues",
	"addValue",
	"removeValues",
	// ======= Call =========
	"apply",
	"new",
	// ======= Observe =========
	"onValue",
	"offValue",
	"onKeyValue",
	"offKeyValue",
	"getKeyDependencies",
	"getValueDependencies",
	"keyHasDependencies",
	"valueHasDependencies",
	"onKeys",
	"onKeysAdded",
	"onKeysRemoved",
	"onPatches"
	].forEach(function(name){
	CanSymbol.for("can."+name);
});

var canSymbol_1_6_5_canSymbol = canNamespace_1_0_0_canNamespace.Symbol = CanSymbol;

var helpers = {
	makeGetFirstSymbolValue: function(symbolNames){
		var symbols = symbolNames.map(function(name){
			return canSymbol_1_6_5_canSymbol.for(name);
		});
		var length = symbols.length;

		return function getFirstSymbol(obj){
			var index = -1;

			while (++index < length) {
				if(obj[symbols[index]] !== undefined) {
					return obj[symbols[index]];
				}
			}
		};
	},
	// The `in` check is from jQuery’s fix for an iOS 8 64-bit JIT object length bug:
	// https://github.com/jquery/jquery/pull/2185
	hasLength: function(list){
		var type = typeof list;
		if(type === "string" || Array.isArray(list)) {
			return true;
		}
		var length = list && (type !== 'boolean' && type !== 'number' && "length" in list) && list.length;

		// var length = "length" in obj && obj.length;
		return typeof list !== "function" &&
			( length === 0 || typeof length === "number" && length > 0 && ( length - 1 ) in list );
	}
};

var plainFunctionPrototypePropertyNames = Object.getOwnPropertyNames((function(){}).prototype);
var plainFunctionPrototypeProto = Object.getPrototypeOf( (function(){}).prototype );
/**
 * @function can-reflect.isConstructorLike isConstructorLike
 * @parent can-reflect/type
 *
 * @description Test if a value looks like a constructor function.
 *
 * @signature `isConstructorLike(func)`
 *
 * Return `true` if `func` is a function and has a non-empty prototype, or implements
 *  [can-symbol/symbols/new `@@@@can.new`]; `false` otherwise.
 *
 * ```js
 * canReflect.isConstructorLike(function() {}); // -> false
 *
 * function Construct() {}
 * Construct.prototype = { foo: "bar" };
 * canReflect.isConstructorLike(Construct); // -> true
 *
 * canReflect.isConstructorLike({}); // -> false
 * !!canReflect.isConstructorLike({ [canSymbol.for("can.new")]: function() {} }); // -> true
 * ```
 *
 * @param  {*}  func maybe a function
 * @return {Boolean} `true` if a constructor; `false` if otherwise.
 */
function isConstructorLike(func){
	/* jshint unused: false */
	// if you can new it ... it's a constructor
	var value = func[canSymbol_1_6_5_canSymbol.for("can.new")];
	if(value !== undefined) {
		return value;
	}

	if(typeof func !== "function") {
		return false;
	}
	// If there are any properties on the prototype that don't match
	// what is normally there, assume it's a constructor
	var prototype = func.prototype;
	if(!prototype) {
		return false;
	}
	// Check if the prototype's proto doesn't point to what it normally would.
	// If it does, it means someone is messing with proto chains
	if( plainFunctionPrototypeProto !== Object.getPrototypeOf( prototype ) ) {
		return true;
	}

	var propertyNames = Object.getOwnPropertyNames(prototype);
	if(propertyNames.length === plainFunctionPrototypePropertyNames.length) {
		for(var i = 0, len = propertyNames.length; i < len; i++) {
			if(propertyNames[i] !== plainFunctionPrototypePropertyNames[i]) {
				return true;
			}
		}
		return false;
	} else {
		return true;
	}
}

/**
 * @function can-reflect.isFunctionLike isFunctionLike
 * @parent can-reflect/type
 * @description Test if a value looks like a function.
 * @signature `isFunctionLike(obj)`
 *
 *  Return `true` if `func` is a function, or implements
 *  [can-symbol/symbols/new `@@@@can.new`] or [can-symbol/symbols/apply `@@@@can.apply`]; `false` otherwise.
 *
 * ```js
 * canReflect.isFunctionLike(function() {}); // -> true
 * canReflect.isFunctionLike({}); // -> false
 * canReflect.isFunctionLike({ [canSymbol.for("can.apply")]: function() {} }); // -> true
 * ```
 *
 * @param  {*}  obj maybe a function
 * @return {Boolean}
 */
var getNewOrApply = helpers.makeGetFirstSymbolValue(["can.new","can.apply"]);
function isFunctionLike(obj){
	var result,
		symbolValue = !!obj && obj[canSymbol_1_6_5_canSymbol.for("can.isFunctionLike")];

	if (symbolValue !== undefined) {
		return symbolValue;
	}

	result = getNewOrApply(obj);
	if(result !== undefined) {
		return !!result;
	}

	return typeof obj === "function";
}

/**
 * @function can-reflect.isPrimitive isPrimitive
 * @parent can-reflect/type
 * @description Test if a value is a JavaScript primitive.
 * @signature `isPrimitive(obj)`
 *
 * Return `true` if `obj` is not a function nor an object via `typeof`, or is null; `false` otherwise.
 *
 * ```js
 * canReflect.isPrimitive(null); // -> true
 * canReflect.isPrimitive({}); // -> false
 * canReflect.isPrimitive(undefined); // -> true
 * canReflect.isPrimitive(1); // -> true
 * canReflect.isPrimitive([]); // -> false
 * canReflect.isPrimitive(function() {}); // -> false
 * canReflect.isPrimitive("foo"); // -> true
 *
 * ```
 *
 * @param  {*}  obj maybe a primitive value
 * @return {Boolean}
 */
function isPrimitive(obj){
	var type = typeof obj;
	if(obj == null || (type !== "function" && type !== "object") ) {
		return true;
	}
	else {
		return false;
	}
}

var coreHasOwn = Object.prototype.hasOwnProperty;
var funcToString = Function.prototype.toString;
var objectCtorString = funcToString.call(Object);

function isPlainObject(obj) {
	// Must be an Object.
	// Because of IE, we also have to check the presence of the constructor property.
	// Make sure that DOM nodes and window objects don't pass through, as well
	if (!obj || typeof obj !== 'object' ) {
		return false;
	}
	var proto = Object.getPrototypeOf(obj);
	if(proto === Object.prototype || proto === null) {
		return true;
	}
	// partially inspired by lodash: https://github.com/lodash/lodash
	var Constructor = coreHasOwn.call(proto, 'constructor') && proto.constructor;
	return typeof Constructor === 'function' && Constructor instanceof Constructor &&
    	funcToString.call(Constructor) === objectCtorString;
}

/**
 * @function can-reflect.isBuiltIn isBuiltIn
 * @parent can-reflect/type
 * @description Test if a value is a JavaScript built-in type.
 * @signature `isBuiltIn(obj)`
 *
 * Return `true` if `obj` is some type of JavaScript native built-in; `false` otherwise.
 *
 * ```js
 * canReflect.isBuiltIn(null); // -> true
 * canReflect.isBuiltIn({}); // -> true
 * canReflect.isBuiltIn(1); // -> true
 * canReflect.isBuiltIn([]); // -> true
 * canReflect.isBuiltIn(function() {}); // -> true
 * canReflect.isBuiltIn("foo"); // -> true
 * canReflect.isBuiltIn(new Date()); // -> true
 * canReflect.isBuiltIn(/[foo].[bar]/); // -> true
 * canReflect.isBuiltIn(new DefineMap); // -> false
 *
 * ```
 *
 * Not supported in browsers that have implementations of Map/Set where
 * `toString` is not properly implemented to return `[object Map]`/`[object Set]`.
 *
 * @param  {*}  obj maybe a built-in value
 * @return {Boolean}
 */
function isBuiltIn(obj) {

	// If primitive, array, or POJO return true. Also check if
	// it is not a POJO but is some type like [object Date] or
	// [object Regex] and return true.
	if (isPrimitive(obj) ||
		Array.isArray(obj) ||
		isPlainObject(obj) ||
		(Object.prototype.toString.call(obj) !== '[object Object]' &&
			Object.prototype.toString.call(obj).indexOf('[object ') !== -1)) {
		return true;
	}
	else {
		return false;
	}
}

/**
 * @function can-reflect.isValueLike isValueLike
 * @parent can-reflect/type
 * @description Test if a value represents a single value (as opposed to several values).
 *
 * @signature `isValueLike(obj)`
 *
 * Return `true` if `obj` is a primitive or implements [can-symbol/symbols/getValue `@@can.getValue`],
 * `false` otherwise.
 *
 * ```js
 * canReflect.isValueLike(null); // -> true
 * canReflect.isValueLike({}); // -> false
 * canReflect.isValueLike(function() {}); // -> false
 * canReflect.isValueLike({ [canSymbol.for("can.isValueLike")]: true}); // -> true
 * canReflect.isValueLike({ [canSymbol.for("can.getValue")]: function() {} }); // -> true
 * canReflect.isValueLike(canCompute()); // -> true
 * canReflect.isValueLike(new DefineMap()); // -> false
 *
 * ```
 *
 * @param  {*}  obj maybe a primitive or an object that yields a value
 * @return {Boolean}
 */
function isValueLike(obj) {
	var symbolValue;
	if(isPrimitive(obj)) {
		return true;
	}
	symbolValue = obj[canSymbol_1_6_5_canSymbol.for("can.isValueLike")];
	if( typeof symbolValue !== "undefined") {
		return symbolValue;
	}
	var value = obj[canSymbol_1_6_5_canSymbol.for("can.getValue")];
	if(value !== undefined) {
		return !!value;
	}
}

/**
 * @function can-reflect.isMapLike isMapLike
 * @parent can-reflect/type
 *
 * @description Test if a value represents multiple values.
 *
 * @signature `isMapLike(obj)`
 *
 * Return `true` if `obj` is _not_ a primitive, does _not_ have a falsy value for
 * [can-symbol/symbols/isMapLike `@@@@can.isMapLike`], or alternately implements
 * [can-symbol/symbols/getKeyValue `@@@@can.getKeyValue`]; `false` otherwise.
 *
 * ```js
 * canReflect.isMapLike(null); // -> false
 * canReflect.isMapLike(1); // -> false
 * canReflect.isMapLike("foo"); // -> false
 * canReflect.isMapLike({}); // -> true
 * canReflect.isMapLike(function() {}); // -> true
 * canReflect.isMapLike([]); // -> false
 * canReflect.isMapLike({ [canSymbol.for("can.isMapLike")]: false }); // -> false
 * canReflect.isMapLike({ [canSymbol.for("can.getKeyValue")]: null }); // -> false
 * canReflect.isMapLike(canCompute()); // -> false
 * canReflect.isMapLike(new DefineMap()); // -> true
 *
 * ```
 *
 * @param  {*}  obj maybe a Map-like
 * @return {Boolean}
 */
function isMapLike(obj) {
	if(isPrimitive(obj)) {
		return false;
	}
	var isMapLike = obj[canSymbol_1_6_5_canSymbol.for("can.isMapLike")];
	if(typeof isMapLike !== "undefined") {
		return !!isMapLike;
	}
	var value = obj[canSymbol_1_6_5_canSymbol.for("can.getKeyValue")];
	if(value !== undefined) {
		return !!value;
	}
	// everything else in JS is MapLike
	return true;
}

/**
 * @function can-reflect.isObservableLike isObservableLike
 * @parent can-reflect/type
 * @description Test if a value (or its keys) can be observed for changes.
 *
 * @signature `isObservableLike(obj)`
 *
 * Return  `true` if `obj` is _not_ a primitive and implements any of
 * [can-symbol/symbols/onValue `@@@@can.onValue`], [can-symbol/symbols/onKeyValue `@@@@can.onKeyValue`], or
 * [can-symbol/symbols/onPatches `@@@@can.onKeys`]; `false` otherwise.
 *
 * ```js
 * canReflect.isObservableLike(null); // -> false
 * canReflect.isObservableLike({}); // -> false
 * canReflect.isObservableLike([]); // -> false
 * canReflect.isObservableLike(function() {}); // -> false
 * canReflect.isObservableLike({ [canSymbol.for("can.onValue")]: function() {} }); // -> true
 * canReflect.isObservableLike({ [canSymbol.for("can.onKeyValue")]: function() {} }); // -> true
 * canReflect.isObservableLike(canCompute())); // -> true
 * canReflect.isObservableLike(new DefineMap())); // -> true
 * ```
 *
 * @param  {*}  obj maybe an observable
 * @return {Boolean}
 */

// Specially optimized
var onValueSymbol = canSymbol_1_6_5_canSymbol.for("can.onValue"),
	onKeyValueSymbol = canSymbol_1_6_5_canSymbol.for("can.onKeyValue"),
	onPatchesSymbol = canSymbol_1_6_5_canSymbol.for("can.onPatches");
function isObservableLike( obj ) {
	if(isPrimitive(obj)) {
		return false;
	}
	return Boolean(obj[onValueSymbol] || obj[onKeyValueSymbol] || obj[onPatchesSymbol]);
}

/**
 * @function can-reflect.isListLike isListLike
 * @parent can-reflect/type
 *
 * @description Test if a value looks like a constructor function.
 *
 * @signature `isListLike(list)`
 *
 * Return `true` if `list` is a `String`, <br>OR `list` is _not_ a primitive and implements `@@@@iterator`,
 * <br>OR `list` is _not_ a primitive and returns `true` for `Array.isArray()`, <br>OR `list` is _not_ a primitive and has a
 * numerical length and is either empty (`length === 0`) or has a last element at index `length - 1`; <br>`false` otherwise
 *
 * ```js
 * canReflect.isListLike(null); // -> false
 * canReflect.isListLike({}); // -> false
 * canReflect.isListLike([]); // -> true
 * canReflect.isListLike("foo"); // -> true
 * canReflect.isListLike(1); // -> false
 * canReflect.isListLike({ [canSymbol.for("can.isListLike")]: true }); // -> true
 * canReflect.isListLike({ [canSymbol.iterator]: function() {} }); // -> true
 * canReflect.isListLike({ length: 0 }); // -> true
 * canReflect.isListLike({ length: 3 }); // -> false
 * canReflect.isListLike({ length: 3, "2": true }); // -> true
 * canReflect.isListLike(new DefineMap()); // -> false
 * canReflect.isListLike(new DefineList()); // -> true
 * ```
 *
 * @param  {*}  list maybe a List-like
 * @return {Boolean}
 */
function isListLike( list ) {
	var symbolValue,
		type = typeof list;
	if(type === "string") {
		return true;
	}
	if( isPrimitive(list) ) {
		return false;
	}
	symbolValue = list[canSymbol_1_6_5_canSymbol.for("can.isListLike")];
	if( typeof symbolValue !== "undefined") {
		return symbolValue;
	}
	var value = list[canSymbol_1_6_5_canSymbol.iterator];
	if(value !== undefined) {
		return !!value;
	}
	if(Array.isArray(list)) {
		return true;
	}
	return helpers.hasLength(list);
}

/**
 * @function can-reflect.isSymbolLike isSymbolLike
 * @parent can-reflect/type
 *
 * @description Test if a value is a symbol or a [can-symbol].
 *
 * @signature `isSymbolLike(symbol)`
 *
 * Return `true` if `symbol` is a native Symbol, or evaluates to a String with a prefix
 * equal to that of CanJS's symbol polyfill; `false` otherwise.
 *
 * ```js
 * /* ES6 *\/ canReflect.isSymbolLike(Symbol.iterator); // -> true
 * canReflect.isSymbolLike(canSymbol.for("foo")); // -> true
 * canReflect.isSymbolLike("@@symbol.can.isSymbol"); // -> true (due to polyfill for non-ES6)
 * canReflect.isSymbolLike("foo"); // -> false
 * canReflect.isSymbolLike(null); // -> false
 * canReflect.isSymbolLike(1); // -> false
 * canReflect.isSymbolLike({}); // -> false
 * canReflect.isSymbolLike({ toString: function() { return "@@symbol.can.isSymbol"; } }); // -> true
 * ```
 *
 * @param  {*}  symbol maybe a symbol
 * @return {Boolean}
 */

var supportsNativeSymbols$1 = (function() {
	var symbolExists = typeof Symbol !== "undefined" && typeof Symbol.for === "function";

	if (!symbolExists) {
		return false;
	}

	var symbol = Symbol("a symbol for testing symbols");
	return typeof symbol === "symbol";
}());

var isSymbolLike;
if(supportsNativeSymbols$1) {
	isSymbolLike = function(symbol) {
		return typeof symbol === "symbol";
	};
} else {
	var symbolStart = "@@symbol";
	isSymbolLike = function(symbol) {
		if(typeof symbol === "object" && !Array.isArray(symbol)){
			return symbol.toString().substr(0, symbolStart.length) === symbolStart;
		} else {
			return false;
		}
	};
}

var type = {
	isConstructorLike: isConstructorLike,
	isFunctionLike: isFunctionLike,
	isListLike: isListLike,
	isMapLike: isMapLike,
	isObservableLike: isObservableLike,
	isPrimitive: isPrimitive,
	isBuiltIn: isBuiltIn,
	isValueLike: isValueLike,
	isSymbolLike: isSymbolLike,
	/**
	 * @function can-reflect.isMoreListLikeThanMapLike isMoreListLikeThanMapLike
	 * @parent can-reflect/type
	 *
	 * @description Test if a value should be treated as a list instead of a map.
	 *
	 * @signature `isMoreListLikeThanMapLike(obj)`
	 *
	 * Return  `true` if `obj` is an Array, declares itself to be more ListLike with
	 * `@@@@can.isMoreListLikeThanMapLike`, or self-reports as ListLike but not as MapLike; `false` otherwise.
	 *
	 * ```js
	 * canReflect.isMoreListLikeThanMapLike([]); // -> true
	 * canReflect.isMoreListLikeThanMapLike(null); // -> false
	 * canReflect.isMoreListLikeThanMapLike({}); // -> false
	 * canReflect.isMoreListLikeThanMapLike(new DefineList()); // -> true
	 * canReflect.isMoreListLikeThanMapLike(new DefineMap()); // -> false
	 * canReflect.isMoreListLikeThanMapLike(function() {}); // -> false
	 * ```
	 *
	 * @param  {Object}  obj the object to test for ListLike against MapLike traits.
	 * @return {Boolean}
	 */
	isMoreListLikeThanMapLike: function(obj){
		if(Array.isArray(obj)) {
			return true;
		}
		if(obj instanceof Array) {
			return true;
		}
		if( obj == null ) {
			return false;
		}
		var value = obj[canSymbol_1_6_5_canSymbol.for("can.isMoreListLikeThanMapLike")];
		if(value !== undefined) {
			return value;
		}
		var isListLike = this.isListLike(obj),
			isMapLike = this.isMapLike(obj);
		if(isListLike && !isMapLike) {
			return true;
		} else if(!isListLike && isMapLike) {
			return false;
		}
	},
	/**
	 * @function can-reflect.isIteratorLike isIteratorLike
	 * @parent can-reflect/type
	 * @description Test if a value looks like an iterator.
	 * @signature `isIteratorLike(obj)`
	 *
	 * Return `true` if `obj` has a key `"next"` pointing to a zero-argument function; `false` otherwise
	 *
	 * ```js
	 * canReflect.isIteratorLike([][Symbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(new DefineList()[canSymbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(new DefineMap()[canSymbol.iterator]()); // -> true
	 * canReflect.isIteratorLike(null); // -> false
	 * canReflect.isIteratorLike({ next: function() {} }); // -> true
	 * canReflect.isIteratorLike({ next: function(foo) {} }); // -> false (iterator nexts do not take arguments)
	 * ```
	 *
	 * @param  {Object}  obj the object to test for Iterator traits
	 * @return {Boolean}
	 */
	isIteratorLike: function(obj){
		return obj &&
			typeof obj === "object" &&
			typeof obj.next === "function" &&
			obj.next.length === 0;
	},
	/**
	 * @function can-reflect.isPromise isPromise
	 * @parent can-reflect/type
	 * @description Test if a value is a promise.
	 *
	 * @signature `isPromise(obj)`
	 *
	 * Return `true` if `obj` is an instance of promise or `.toString` returns `"[object Promise]"`.
	 *
	 * ```js
	 * canReflect.isPromise(Promise.resolve()); // -> true
	 * ```
	 *
	 * @param  {*}  obj the object to test for Promise traits.
	 * @return {Boolean}
	 */
	isPromise: function(obj){
		return (obj instanceof Promise || (Object.prototype.toString.call(obj) === '[object Promise]'));
	},
	/**
	 * @function can-reflect.isPlainObject isPlainObject
	 * @parent can-reflect/type
	 * @description Test if a value is an object created with `{}` or `new Object()`.
	 *
	 * @signature `isPlainObject(obj)`
	 *
	 * Attempts to determine if an object is a plain object like those you would create using the curly braces syntax: `{}`. The following are not plain objects:
	 *
	 * 1. Objects with prototypes (created using the `new` keyword).
	 * 2. Booleans.
	 * 3. Numbers.
	 * 4. NaN.
	 *
	 * ```js
	 * var isPlainObject = require("can-reflect").isPlainObject;
	 *
	 * // Created with {}
	 * console.log(isPlainObject({})); // -> true
	 *
	 * // new Object
	 * console.log(isPlainObject(new Object())); // -> true
	 *
	 * // Custom object
	 * var Ctr = function(){};
	 * var obj = new Ctr();
	 *
	 * console.log(isPlainObject(obj)); // -> false
	 * ```
	 *
	 * @param  {Object}  obj the object to test.
	 * @return {Boolean}
	 */
	isPlainObject: isPlainObject
};

var call = {
	/**
	 * @function {function(...), Object, ...} can-reflect/call.call call
	 * @parent can-reflect/call
	 * @description  Call a callable, with a context object and parameters
	 *
	 * @signature `call(func, context, ...rest)`
	 *
	 * Call the callable `func` as if it were a function, bound to `context` and with any additional parameters
	 * occurring after `context` set to the positional parameters.
	 *
	 * Note that `func` *must* either be natively callable, implement [can-symbol/symbols/apply @@@@can.apply],
	 * or have a callable `apply` property to work with `canReflect.call`
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 *
	 * canReflect.call(compute, null, "bar");
	 * canReflect.call(compute, null); // -> "bar"
	 * ```
	 *
	 * @param  {function(...)} func the function to call with the supplied arguments
	 * @param  {Object} context the context object to set as `this` on the function call
	 * @param  {*} rest any arguments after `context` will be passed to the function call
	 * @return {*}  return types and values are determined by the call to `func`
	 */
	call: function(func, context){
		var args = [].slice.call(arguments, 2);
		var apply = func[canSymbol_1_6_5_canSymbol.for("can.apply")];
		if(apply) {
			return apply.call(func, context, args);
		} else {
			return func.apply(context, args);
		}
	},
	/**
	 * @function {function(...), Object, ...} can-reflect/call.apply apply
	 * @parent can-reflect/call
	 * @description  Call a callable, with a context object and a list of parameters
	 *
	 * @signature `apply(func, context, args)`
	 *
	 * Call the callable `func` as if it were a function, bound to `context` and with any additional parameters
	 * contained in the Array-like `args`
	 *
	 * Note that `func` *must* either be natively callable, implement [can-symbol/symbols/apply @@@@can.apply],
	 * or have a callable `apply` property to work with `canReflect.apply`
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 *
	 * canReflect.apply(compute, null, ["bar"]);
	 * canReflect.apply(compute, null, []); // -> "bar"
	 * ```
	 *
	 * @param  {function(...)} func the function to call
	 * @param  {Object} context the context object to set as `this` on the function call
	 * @param  {*} args arguments to be passed to the function call
	 * @return {*}  return types and values are determined by the call to `func`
	 */
	apply: function(func, context, args){
		var apply = func[canSymbol_1_6_5_canSymbol.for("can.apply")];
		if(apply) {
			return apply.call(func, context, args);
		} else {
			return func.apply(context, args);
		}
	},
	/**
	 * @function {function(...), ...} can-reflect/call.new new
	 * @parent can-reflect/call
	 * @description  Construct a new instance of a callable constructor
	 *
	 * @signature `new(func, ...rest)`
	 *
	 * Call the callable `func` as if it were a function, bound to a new instance of `func`, and with any additional
	 * parameters occurring after `func` set to the positional parameters.
	 *
	 * Note that `func` *must* either implement [can-symbol/symbols/new @@@@can.new],
	 * or have a callable `apply` property *and* a prototype to work with `canReflect.new`
	 *
	 * ```js
	 * canReflect.new(DefineList, ["foo"]); // -> ["foo"]<DefineList>
	 * ```
	 *
	 * @param  {function(...)} func a constructor
	 * @param  {*} rest arguments to be passed to the constructor
	 * @return {Object}  if `func` returns an Object, that returned Object; otherwise a new instance of `func`
	 */
	"new": function(func){
		var args = [].slice.call(arguments, 1);
		var makeNew = func[canSymbol_1_6_5_canSymbol.for("can.new")];
		if(makeNew) {
			return makeNew.apply(func, args);
		} else {
			var context = Object.create(func.prototype);
			var ret = func.apply(context, args);
			if(type.isPrimitive(ret)) {
				return context;
			} else {
				return ret;
			}
		}
	}
};

var setKeyValueSymbol = canSymbol_1_6_5_canSymbol.for("can.setKeyValue"),
	getKeyValueSymbol = canSymbol_1_6_5_canSymbol.for("can.getKeyValue"),
	getValueSymbol = canSymbol_1_6_5_canSymbol.for("can.getValue"),
	setValueSymbol = canSymbol_1_6_5_canSymbol.for("can.setValue");

var reflections = {
	/**
	 * @function {Object, String, *} can-reflect.setKeyValue setKeyValue
	 * @parent can-reflect/get-set
	 * @description Set the value of a named property on a MapLike object.
	 *
	 * @signature `setKeyValue(obj, key, value)`
	 *
	 * Set the property on Map-like `obj`, identified by the String, Symbol or Object value `key`, to the value `value`.
	 * The default behavior can be overridden on `obj` by implementing [can-symbol/symbols/setKeyValue @@@@can.setKeyValue],
	 * otherwise native named property access is used for string keys, and `Object.defineProperty` is used to set symbols.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.setKeyValue(foo, "bar", "quux");
	 * foo[bar]; // -> "quux"
	 * ```
	 * @param  {Object} obj   the object to set on
	 * @param  {String} key   the key for the property to set
	 * @param  {*} value      the value to set on the object
	 */
	setKeyValue: function(obj, key, value){
		if( type.isSymbolLike(key) ) {
			if(typeof key === "symbol") {
				obj[key] = value;
			} else {
				Object.defineProperty(obj, key, {
					enumerable: false,
					configurable: true,
					value: value,
					writable: true
				});
			}
			return;
		}
		var setKeyValue = obj[setKeyValueSymbol];
		if(setKeyValue !== undefined) {
			return setKeyValue.call(obj, key, value);
		} else {
			obj[key] = value;
		}
	},
	/**
	 * @function {Object, String} can-reflect.getKeyValue getKeyValue
	 * @parent can-reflect/get-set
	 * @description Get the value of a named property on a MapLike object.
	 *
	 * @signature `getKeyValue(obj, key)`
	 *
	 * Retrieve the property on Map-like `obj` identified by the String or Symbol value `key`.  The default behavior
	 * can be overridden on `obj` by implementing [can-symbol/symbols/getKeyValue @@@@can.getKeyValue],
	 * otherwise native named property access is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.getKeyValue(foo, "bar"); // -> "baz"
	 * ```
	 *
	 * @param  {Object} obj   the object to get from
	 * @param  {String} key   the key of the property to get
	 */
	getKeyValue: function(obj, key) {
		var getKeyValue = obj[getKeyValueSymbol];
		if(getKeyValue) {
			return getKeyValue.call(obj, key);
		}
		return obj[key];
	},
	/**
	 * @function {Object, String} can-reflect.deleteKeyValue deleteKeyValue
	 * @parent can-reflect/get-set
	 * @description Delete a named property from a MapLike object.
	 *
	 * @signature `deleteKeyValue(obj, key)`
	 *
	 * Remove the property identified by the String or Symbol `key` from the Map-like object `obj`, if possible.
	 * Property definitions may interfere with deleting key values; the behavior on `obj` if `obj[key]` cannot
	 * be deleted is undefined.  The default use of the native `delete` keyword can be overridden by `obj` if it
	 * implements [can-symbol/symbols/deleteKeyValue @@@@can.deleteKeyValue].
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 * var quux = new CanMap({ thud: "jeek" });
	 *
	 * canReflect.deleteKeyValue(foo, "bar");
	 * canReflect.deleteKeyValue(quux, "thud");
	 *
	 * "bar" in foo; // ->  true  -- DefineMaps use property defs which cannot be un-defined
	 * foo.bar // -> undefined    --  but set values to undefined when deleting
	 *
	 * "thud" in quux; // -> false
	 * quux.thud; // -> undefined
	 * ```
	 *
	 * @param  {Object} obj   the object to delete on
	 * @param  {String} key   the key for the property to delete
	 */
	deleteKeyValue: function(obj, key) {
		var deleteKeyValue = obj[canSymbol_1_6_5_canSymbol.for("can.deleteKeyValue")];
		if(deleteKeyValue) {
			return deleteKeyValue.call(obj, key);
		}
		delete obj[key];
	},
	/**
	 * @function {Object} can-reflect.getValue getValue
	 * @parent can-reflect/get-set
	 * @description Get the value of an object with a gettable value
	 *
	 * @signature `getValue(obj)`
	 *
	 * Return the value of the Value-like object `obj`.  Unless `obj` implements
	 * [can-symbol/symbols/getValue @@@@can.getValue], the result of `getValue` on
	 * `obj` will always be `obj`.  Observable Map-like objects may want to implement
	 * `@@@@can.getValue` to return non-observable or plain representations of themselves.
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 * var primitive = "bar";
	 *
	 * canReflect.getValue(compute); // -> "foo"
	 * canReflect.getValue(primitive); // -> "bar"
	 * ```
	 *
	 * @param  {Object} obj   the object to get from
	 * @return {*} the value of the object via `@@can.getValue`, or the value itself.
	 */
	getValue: function(value){
		if(type.isPrimitive(value)) {
			return value;
		}
		var getValue = value[getValueSymbol];
		if(getValue) {
			return getValue.call(value);
		}
		return value;
	},
	/**
	 * @function {Object, *} can-reflect.setValue setValue
	 * @parent can-reflect/get-set
	 * @description Set the value of a mutable object.
	 *
	 * @signature `setValue(obj, value)`
	 *
	 * Set the value of a Value-like object `obj` to the value `value`.  `obj` *must* implement
	 * [can-symbol/symbols/setValue @@@@can.setValue] to be used with `canReflect.setValue`.
	 * Map-like objects may want to implement `@@@@can.setValue` to merge objects of properties
	 * into themselves.
	 *
	 * ```js
	 * var compute = canCompute("foo");
	 * var plain = {};
	 *
	 * canReflect.setValue(compute, "bar");
	 * compute(); // -> bar
	 *
	 * canReflect.setValue(plain, { quux: "thud" }); // throws "can-reflect.setValue - Can not set value."
	 * ```
	 *
	 * @param  {Object} obj   the object to set on
	 * @param  {*} value      the value to set for the object
	 */
	setValue: function(item, value){
		var setValue = item && item[setValueSymbol];
		if(setValue) {
			return setValue.call(item, value);
		} else {
			throw new Error("can-reflect.setValue - Can not set value.");
		}
	},

	splice: function(obj, index, removing, adding){
		var howMany;
		if(typeof removing !== "number") {
			var updateValues = obj[canSymbol_1_6_5_canSymbol.for("can.updateValues")];
			if(updateValues) {
				return updateValues.call(obj, index, removing, adding);
			}
			howMany = removing.length;
		} else {
			howMany = removing;
		}

		if(arguments.length <= 3){
			adding = [];
		}

		var splice = obj[canSymbol_1_6_5_canSymbol.for("can.splice")];
		if(splice) {
			return splice.call(obj, index, howMany, adding);
		}
		return [].splice.apply(obj, [index, howMany].concat(adding) );
	},
	addValues: function(obj, adding, index) {
		var add = obj[canSymbol_1_6_5_canSymbol.for("can.addValues")];
		if(add) {
			return add.call(obj, adding, index);
		}
		if(Array.isArray(obj) && index === undefined) {
			return obj.push.apply(obj, adding);
		}
		return reflections.splice(obj, index, [], adding);
	},
	removeValues: function(obj, removing, index) {
		var removeValues = obj[canSymbol_1_6_5_canSymbol.for("can.removeValues")];
		if(removeValues) {
			return removeValues.call(obj, removing, index);
		}
		if(Array.isArray(obj) && index === undefined) {
			removing.forEach(function(item){
				var index = obj.indexOf(item);
				if(index >=0) {
					obj.splice(index, 1);
				}
			});
			return;
		}
		return reflections.splice(obj, index, removing, []);
	}
};
/**
 * @function {Object, String} can-reflect.get get
 * @hide
 * @description an alias for [can-reflect.getKeyValue getKeyValue]
 */
reflections.get = reflections.getKeyValue;
/**
 * @function {Object, String} can-reflect.set set
 * @hide
 * @description an alias for [can-reflect.setKeyValue setKeyValue]
 */
reflections.set = reflections.setKeyValue;
/**
 * @function {Object, String} can-reflect.delete delete
 * @hide
 * @description an alias for [can-reflect.deleteKeyValue deleteKeyValue]
 */
reflections["delete"] = reflections.deleteKeyValue;

var getSet = reflections;

var slice = [].slice;

function makeFallback(symbolName, fallbackName) {
	return function(obj, event, handler, queueName){
		var method = obj[canSymbol_1_6_5_canSymbol.for(symbolName)];
		if(method !== undefined) {
			return method.call(obj, event, handler, queueName);
		}
		return this[fallbackName].apply(this, arguments);
	};
}

function makeErrorIfMissing(symbolName, errorMessage){
	return function(obj){
		var method = obj[canSymbol_1_6_5_canSymbol.for(symbolName)];
		if(method !== undefined) {
			var args = slice.call(arguments, 1);
			return method.apply(obj, args);
		}
		throw new Error(errorMessage);
	};
}

var observe = {
	// KEY
	/**
	 * @function {Object, String, function(*, *), String} can-reflect/observe.onKeyValue onKeyValue
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, based on a key change
	 *
	 * @signature `onKeyValue(obj, key, handler, [queueName])`
	 *
	 * Register a handler on the Map-like object `obj` to trigger when the property key `key` changes.
	 * `obj` *must* implement [can-symbol/symbols/onKeyValue @@@@can.onKeyValue] to be compatible with
	 * can-reflect.onKeyValue.  The function passed as `handler` will receive the new value of the property
	 * as the first argument, and the previous value of the property as the second argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeyValue(obj, "foo", function(newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * });
	 *
	 * obj.foo = "baz";  // -> logs "foo is now baz , was bar"
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {String} key  the key to listen to
	 * @param {function(*, *)} handler a callback function that recieves the new value
	 * @param {String} [queueName]  the queue to dispatch events to
	 */
	onKeyValue: makeFallback("can.onKeyValue", "onEvent"),
	/**
	 * @function {Object, String, function(*), String} can-reflect/observe.offKeyValue offKeyValue
	 * @parent can-reflect/observe
	 * @description  Unregister an event handler on a MapLike object, based on a key change
	 *
	 * @signature `offKeyValue(obj, key, handler, [queueName])`
	 *
	 * Unregister a handler from the Map-like object `obj` that had previously been registered with
	 * [can-reflect/observe.onKeyValue onKeyValue]. The function passed as `handler` will no longer be called
	 * when the value of `key` on `obj` changes.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * var handler = function(newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onKeyValue(obj, "foo", handler);
	 * canReflect.offKeyValue(obj, "foo", handler);
	 *
	 * obj.foo = "baz";  // -> nothing is logged
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {String} key  the key to stop listening to
	 * @param {function(*)} handler the callback function that should be removed from the event handlers for `key`
	 * @param {String} [queueName]  the queue that the handler was set to receive events from
	 */
	offKeyValue: makeFallback("can.offKeyValue","offEvent"),

	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeys onKeys
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on the key set changing
	 *
	 * @signature `onKeys(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when `obj`'s keyset changes.
	 * `obj` *must* implement [can-symbol/symbols/onKeys @@@@can.onKeys] to be compatible with
	 * can-reflect.onKeys.  The function passed as `handler` will receive an Array of object diffs (see
	 * [can-util/js/diff-object/diff-object diffObject] for the format) as its one argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeys(obj, function(diffs) {
	 * 	console.log(diffs);
	 * });
	 *
	 * obj.set("baz", "quux");  // -> logs '[{"property": "baz", "type": "add", "value": "quux"}]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the diffs in the key set
	 */
	// any key change (diff would normally happen)
	onKeys: makeErrorIfMissing("can.onKeys","can-reflect: can not observe an onKeys event"),
	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeysAdded onKeysAdded
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on new keys being added.
	 *
	 * @signature `onKeysAdded(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when a new key or keys are set on
	 * `obj`. `obj` *must* implement [can-symbol/symbols/onKeysAdded @@@@can.onKeysAdded] to be compatible with
	 * can-reflect.onKeysAdded.  The function passed as `handler` will receive an Array of Strings as its one
	 * argument.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onKeysAded(obj, function(newKeys) {
	 * 	console.log(newKeys);
	 * });
	 *
	 * foo.set("baz", "quux");  // -> logs '["baz"]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the array of added keys
	 */
	// keys added at a certain point {key: 1}, index
	onKeysAdded: makeErrorIfMissing("can.onKeysAdded","can-reflect: can not observe an onKeysAdded event"),
	/**
	 * @function {Object, function(Array)} can-reflect/observe.onKeysRemoved onKeysRemoved
	 * @parent can-reflect/observe
	 * @description  Register an event handler on a MapLike object, triggered on keys being deleted.
	 *
	 * @signature `onKeysRemoved(obj, handler)`
	 *
	 * Register an event handler on the Map-like object `obj` to trigger when a key or keys are removed from
	 * `obj`'s keyset. `obj` *must* implement [can-symbol/symbols/onKeysRemoved @@@@can.onKeysRemoved] to be
	 * compatible with can-reflect.onKeysAdded.  The function passed as `handler` will receive an Array of
	 * Strings as its one argument.
	 *
	 * ```js
	 * var obj = new CanMap({ foo: "bar" });
	 * canReflect.onKeys(obj, function(diffs) {
	 * 	console.log(JSON.stringify(diffs));
	 * });
	 *
	 * foo.removeAttr("foo");  // -> logs '["foo"]'
	 * ```
	 *
	 * @param {Object} obj an observable MapLike that can listen to changes in named properties.
	 * @param {function(Array)} handler the callback function to receive the array of removed keys
	 */
	onKeysRemoved: makeErrorIfMissing("can.onKeysRemoved","can-reflect: can not unobserve an onKeysRemoved event"),

	/**
	 * @function {Object, String} can-reflect/observe.getKeyDependencies getKeyDependencies
	 * @parent can-reflect/observe
	 * @description  Return the observable objects that compute to the value of a named property on an object
	 *
	 * @signature `getKeyDependencies(obj, key)`
	 *
	 * Return the observable objects that provide input values to generate the computed value of the
	 * property `key` on Map-like object `obj`.  If `key` does not have dependencies on `obj`, returns `undefined`.
	 * Otherwise returns an object with up to two keys: `keyDependencies` is a [can-util/js/cid-map/cid-map CIDMap] that
	 * maps each Map-like object providing keyed values to an Array of the relevant keys; `valueDependencies` is a
	 * [can-util/js/cid-set/cid-set CIDSet] that contains all Value-like dependencies providing their own values.
	 *
	 * `obj` *must* implement [can-symbol/symbols/getKeyDependencies @@@@can.getKeyDependencies] to work with
	 * `canReflect.getKeyDependencies`.
	 *
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = new (DefineMap.extend({
	 * 	 baz: {
	 * 	   get: function() {
	 * 	     return foo.bar;
	 * 	   }
	 * 	 }
	 * }))();
	 *
	 * canReflect.getKeyDependencies(obj, "baz");  // -> { valueDependencies: CIDSet }
	 * ```
	 *
	 * @param {Object} obj the object to check for key dependencies
	 * @param {String} key the key on the object to check
	 * @return {Object} the observable values that this keyed value depends on
	 */
	getKeyDependencies: makeErrorIfMissing("can.getKeyDependencies", "can-reflect: can not determine dependencies"),

	/**
	 * @function {Object, String} can-reflect/observe.getWhatIChange getWhatIChange
	 * @hide
	 * @parent can-reflect/observe
	 * @description Return the observable objects that derive their value from the
	 * obj, passed in.
	 *
	 * @signature `getWhatIChange(obj, key)`
	 *
	 * `obj` *must* implement `@@@@can.getWhatIChange` to work with
	 * `canReflect.getWhatIChange`.
	 *
	 * @param {Object} obj the object to check for what it changes
	 * @param {String} [key] the key on the object to check
	 * @return {Object} the observable values that derive their value from `obj`
	 */
	getWhatIChange: makeErrorIfMissing(
		"can.getWhatIChange",
		"can-reflect: can not determine dependencies"
	),

	/**
	 * @function {Function} can-reflect/observe.getChangesDependencyRecord getChangesDependencyRecord
	 * @hide
	 * @parent can-reflect/observe
	 * @description Return the observable objects that are mutated by the handler
	 * passed in as argument.
	 *
	 * @signature `getChangesDependencyRecord(handler)`
	 *
	 * `handler` *must* implement `@@@@can.getChangesDependencyRecord` to work with
	 * `canReflect.getChangesDependencyRecord`.
	 *
	 * ```js
	 * var one = new SimpleObservable("one");
	 * var two = new SimpleObservable("two");
	 *
	 * var handler = function() {
	 *	two.set("2");
	 * };
	 *
	 * canReflect.onValue(one, handler);
	 * canReflect.getChangesDependencyRecord(handler); // -> { valueDependencies: new Set([two]) }
	 * ```
	 *
	 * @param {Function} handler the event handler to check for what it changes
	 * @return {Object} the observable values that are mutated by the handler
	 */
	getChangesDependencyRecord: function getChangesDependencyRecord(handler) {
		var fn = handler[canSymbol_1_6_5_canSymbol.for("can.getChangesDependencyRecord")];

		if (typeof fn === "function") {
			return fn();
		}
	},

	/**
	 * @function {Object, String} can-reflect/observe.keyHasDependencies keyHasDependencies
	 * @parent can-reflect/observe
	 * @description  Determine whether the value for a named property on an object is bound to other events
	 *
	 * @signature `keyHasDependencies(obj, key)`
	 *
	 * Returns `true` if the computed value of the property `key` on Map-like object `obj` derives from other values.
	 * Returns `false` if `key` is computed on `obj` but does not have dependencies on other objects. If `key` is not
	 * a computed value on `obj`, returns `undefined`.
	 *
	 * `obj` *must* implement [can-symbol/symbols/keyHasDependencies @@@@can.keyHasDependencies] to work with
	 * `canReflect.keyHasDependencies`.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = new (DefineMap.extend({
	 * 	 baz: {
	 * 	   get: function() {
	 * 	     return foo.bar;
	 * 	   }
	 * 	 },
	 * 	 quux: {
	 * 	 	 get: function() {
	 * 	 	   return "thud";
	 * 	 	 }
	 * 	 }
	 * }))();
	 *
	 * canReflect.keyHasDependencies(obj, "baz");  // -> true
	 * canReflect.keyHasDependencies(obj, "quux");  // -> false
	 * canReflect.keyHasDependencies(foo, "bar");  // -> undefined
	 * ```
	 *
	 * @param {Object} obj the object to check for key dependencies
	 * @param {String} key the key on the object to check
	 * @return {Boolean} `true` if there are other objects that may update the keyed value; `false` otherwise
	 *
	 */
	// TODO: use getKeyDeps once we know what that needs to look like
	keyHasDependencies: makeErrorIfMissing("can.keyHasDependencies","can-reflect: can not determine if this has key dependencies"),

	// VALUE
	/**
	 * @function {Object, function(*)} can-reflect/observe.onValue onValue
	 * @parent can-reflect/observe
	 * @description  Register an event handler on an observable ValueLike object, based on a change in its value
	 *
	 * @signature `onValue(handler, [queueName])`
	 *
	 * Register an event handler on the Value-like object `obj` to trigger when its value changes.
	 * `obj` *must* implement [can-symbol/symbols/onValue @@@@can.onValue] to be compatible with
	 * can-reflect.onKeyValue.  The function passed as `handler` will receive the new value of `obj`
	 * as the first argument, and the previous value of `obj` as the second argument.
	 *
	 * ```js
	 * var obj = canCompute("foo");
	 * canReflect.onValue(obj, function(newVal, oldVal) {
	 * 	console.log("compute is now", newVal, ", was", oldVal);
	 * });
	 *
	 * obj("bar");  // -> logs "compute is now bar , was foo"
	 * ```
	 *
	 * @param {*} obj  any object implementing @@can.onValue
	 * @param {function(*, *)} handler  a callback function that receives the new and old values
	 */
	onValue: makeErrorIfMissing("can.onValue","can-reflect: can not observe value change"),
	/**
	 * @function {Object, function(*)} can-reflect/observe.offValue offValue
	 * @parent can-reflect/observe
	 * @description  Unregister an value change handler from an observable ValueLike object
	 *
	 * @signature `offValue(handler, [queueName])`
	 *
	 * Unregister an event handler from the Value-like object `obj` that had previously been registered with
	 * [can-reflect/observe.onValue onValue]. The function passed as `handler` will no longer be called
	 * when the value of `obj` changes.
	 *
	 * ```js
	 * var obj = canCompute( "foo" );
	 * var handler = function(newVal, oldVal) {
	 * 	console.log("compute is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onKeyValue(obj, handler);
	 * canReflect.offKeyValue(obj, handler);
	 *
	 * obj("baz");  // -> nothing is logged
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 */
	offValue: makeErrorIfMissing("can.offValue","can-reflect: can not unobserve value change"),

	/**
	 * @function {Object} can-reflect/observe.getValueDependencies getValueDependencies
	 * @parent can-reflect/observe
	 * @description  Return all the events that bind to the value of an observable, Value-like object
	 *
	 * @signature `getValueDependencies(obj)`
	 *
	 * Return the observable objects that provide input values to generate the computed value of the
	 * Value-like object `obj`.  If `obj` does not have dependencies, returns `undefined`.
	 * Otherwise returns an object with up to two keys: `keyDependencies` is a [can-util/js/cid-map/cid-map CIDMap] that
	 * maps each Map-like object providing keyed values to an Array of the relevant keys; `valueDependencies` is a
	 * [can-util/js/cid-set/cid-set CIDSet] that contains all Value-like dependencies providing their own values.
	 *
	 * `obj` *must* implement [can-symbol/symbols/getValueDependencies @@@@can.getValueDependencies] to work with
	 * `canReflect.getValueDependencies`.
	 *
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" })
	 * var obj = canCompute(function() {
	 * 	 return foo.bar;
	 * });
	 *
	 * canReflect.getValueDependencies(obj);  // -> { valueDependencies: CIDSet } because `obj` is internally backed by
	 * a [can-observation]
	 * ```
	 *
	 * @param {Object} obj the object to check for value dependencies
	 * @return {Object} the observable objects that `obj`'s value depends on
	 *
	 */
	getValueDependencies: makeErrorIfMissing("can.getValueDependencies","can-reflect: can not determine dependencies"),

	/**
	 * @function {Object} can-reflect/observe.valueHasDependencies valueHasDependencies
	 * @parent can-reflect/observe
	 * @description  Determine whether the value of an observable object is bound to other events
	 *
	 * @signature `valueHasDependencies(obj)`
	 *
	 * Returns `true` if the computed value of the Value-like object `obj` derives from other values.
	 * Returns `false` if `obj` is computed but does not have dependencies on other objects. If `obj` is not
	 * a computed value, returns `undefined`.
	 *
	 * `obj` *must* implement [can-symbol/symbols/valueHasDependencies @@@@can.valueHasDependencies] to work with
	 * `canReflect.valueHasDependencies`.
	 *
	 * ```js
	 * var foo = canCompute( "bar" );
	 * var baz = canCompute(function() {
	 * 	 return foo();
	 * });
	 * var quux = "thud";
	 * var jeek = canCompute(function(plonk) {
	 * 	 if(argument.length) {
	 * 	 	  quux = plonk;
	 * 	 }
	 * 	 return quux;
	 * });
	 *
	 * canReflect.valueHasDependencies(baz);  // -> true
	 * canReflect.valueHasDependencies(jeek);  // -> false
	 * canReflect.valueHasDependencies(foo);  // -> undefined
	 * ```
	 *
	 * @param {Object} obj the object to check for dependencies
	 * @return {Boolean} `true` if there are other dependencies that may update the object's value; `false` otherwise
	 *
	 */
	valueHasDependencies: makeErrorIfMissing("can.valueHasDependencies","can-reflect: can not determine if value has dependencies"),

	// PATCHES
	/**
	 * @function {Object, function(*), String} can-reflect/observe.onPatches onPatches
	 * @parent can-reflect/observe
	 * @description  Register an handler on an observable that listens to any key changes
	 *
	 * @signature `onPatches(obj, handler, [queueName])`
	 *
	 * Register an event handler on the object `obj` that fires when anything changes on an object: a key value is added,
	 * an existing key has is value changed, or a key is deleted from the object.
	 *
	 * If object is an array-like and the changed property includes numeric indexes, patch sets will include array-specific
	 * patches in addition to object-style patches
	 *
	 * For more on the patch formats, see [can-util/js/diff-object/diff-object] and [can-util/js/diff-array/diff-array].
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function(patches) {
	 * 	console.log(patches);
	 * };
	 *
	 * canReflect.onPatches(obj, handler);
	 * obj.set("foo", "bar");  // logs [{ type: "add", property: "foo", value: "bar" }]
	 * obj.set("foo", "baz");  // logs [{ type: "set", property: "foo", value: "baz" }]
	 *
	 * var arr = new DefineList([]);
	 * canReflect.onPatches(arr, handler);
	 * arr.push("foo");  // logs [{type: "add", property:"0", value: "foo"},
	 *                            {index: 0, deleteCount: 0, insert: ["foo"]}]
   * arr.pop();  // logs [{type: "remove", property:"0"},
	 *                            {index: 0, deleteCount: 1, insert: []}]
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 * @param {String} [queueName] the name of a queue in [can-queues]; dispatches to `handler` will happen on this queue
	 */
	onPatches: makeErrorIfMissing("can.onPatches", "can-reflect: can not observe patches on object"),
	/**
	 * @function {Object, function(*), String} can-reflect/observe.offPatches offPatches
	 * @parent can-reflect/observe
	 * @description  Unregister an object patches handler from an observable object
	 *
	 * @signature `offPatches(obj, handler, [queueName])`
	 *
	 * Unregister an event handler from the object `obj` that had previously been registered with
	 * [can-reflect/observe.onPatches onPatches]. The function passed as `handler` will no longer be called
	 * when `obj` has key or index changes.
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function(patches) {
	 * 	console.log(patches);
	 * };
	 *
	 * canReflect.onPatches(obj, handler);
	 * canReflect.offPatches(obj, handler);
	 *
	 * obj.set("foo", "bar");  // nothing is logged
	 * ```
	 *
	 * @param {*} obj
	 * @param {function(*)} handler
	 * @param {String} [queueName] the name of the queue in [can-queues] the handler was registered under
	 */
	offPatches: makeErrorIfMissing("can.offPatches", "can-reflect: can not unobserve patches on object"),

	/**
	 * @function {Object, function(*)} can-reflect/observe.onInstancePatches onInstancePatches
	 * @parent can-reflect/observe
	 *
	 * @description Registers a handler that listens to patch events on any instance
	 *
	 * @signature `onInstancePatches(Type, handler(instance, patches))`
	 *
	 * Listens to patch changes on any instance of `Type`. This is used by [can-connect]
	 * to know when a potentially `unbound` instance's `id` changes. If the `id` changes,
	 * the instance can be moved into the store while it is being saved. E.g:
	 *
	 * ```js
	 * canReflect.onInstancePatches(Map, function onInstancePatches(instance, patches) {
	 *	patches.forEach(function(patch) {
	 *		if (
	 *			(patch.type === "add" || patch.type === "set") &&
	 *			patch.key === connection.idProp &&
	 *			canReflect.isBound(instance)
	 *		) {
	 *			connection.addInstanceReference(instance);
	 *		}
	 *	});
	 *});
	 * ```
	 *
	 * @param {*} Type
	 * @param {function(*)} handler
	 */
	onInstancePatches: makeErrorIfMissing(
		"can.onInstancePatches",
		"can-reflect: can not observe onInstancePatches on Type"
	),

	/**
	 * @function {Object, function(*)} can-reflect/observe.offInstancePatches offInstancePatches
	 * @parent can-reflect/observe
	 *
	 * @description Unregisters a handler registered through [can-reflect/observe.onInstancePatches]
	 *
	 * @signature `offInstancePatches(Type, handler(instance, patches))`
	 *
	 * ```js
	 * canReflect.offInstancePatches(Map, onInstancePatches);
	 * ```
	 *
	 * @param {*} Type
	 * @param {function(*)} handler
	 */
	offInstancePatches: makeErrorIfMissing(
		"can.offInstancePatches",
		"can-reflect: can not unobserve onInstancePatches on Type"
	),

	// HAS BINDINGS VS DOES NOT HAVE BINDINGS
	/**
	 * @function {Object, function(*), String} can-reflect/observe.onInstanceBoundChange onInstanceBoundChange
	 * @parent can-reflect/observe
	 * @description Listen to when observables of a type are bound and unbound.
	 *
	 * @signature `onInstanceBoundChange(Type, handler, [queueName])`
	 *
	 * Register an event handler on the object `Type` that fires when instances of the type become bound (the first handler is added)
	 * or unbound (the last remaining handler is removed). The function passed as `handler` will be called
	 * with the `instance` as the first argument and `true` as the second argument when `instance` gains its first binding,
	 * and called with `false` when `instance` loses its
	 * last binding.
	 *
	 * ```js
	 * Person = DefineMap.extend({ ... });
	 *
	 * var person = Person({});
	 * var handler = function(instance, newVal) {
	 * 	console.log(instance, "bound state is now", newVal);
	 * };
	 * var keyHandler = function() {};
	 *
	 * canReflect.onInstanceBoundChange(Person, handler);
	 * canReflect.onKeyValue(obj, "name", keyHandler);  // logs person Bound state is now true
	 * canReflect.offKeyValue(obj, "name", keyHandler);  // logs person Bound state is now false
	 * ```
	 *
	 * @param {function} Type A constructor function
	 * @param {function(*,Boolean)} handler(instance,isBound) A function called with the `instance` whose bound status changed and the state of the bound status.
	 * @param {String} [queueName] the name of a queue in [can-queues]; dispatches to `handler` will happen on this queue
	 */
	onInstanceBoundChange: makeErrorIfMissing("can.onInstanceBoundChange", "can-reflect: can not observe bound state change in instances."),
	/**
	 * @function {Object, function(*), String} can-reflect/observe.offInstanceBoundChange offInstanceBoundChange
	 * @parent can-reflect/observe
	 * @description Stop listening to when observables of a type are bound and unbound.
	 *
	 * @signature `offInstanceBoundChange(Type, handler, [queueName])`
	 *
	 * Unregister an event handler from the type `Type` that had previously been registered with
	 * [can-reflect/observe.onInstanceBoundChange onInstanceBoundChange]. The function passed as `handler` will no longer be called
	 * when instances of `Type` gains its first or loses its last binding.
	 *
	 * ```js
	 * Person = DefineMap.extend({ ... });
	 *
	 * var person = Person({});
	 * var handler = function(instance, newVal) {
	 * 	console.log(instance, "bound state is now", newVal);
	 * };
	 * var keyHandler = function() {};
	 *
	 * canReflect.onInstanceBoundChange(Person, handler);
	 * canReflect.offInstanceBoundChange(Person, handler);
	 * canReflect.onKeyValue(obj, "name", keyHandler);  // nothing is logged
	 * canReflect.offKeyValue(obj, "name", keyHandler); // nothing is logged
	 * ```
	 *
	 * @param {function} Type A constructor function
	 * @param {function(*,Boolean)} handler(instance,isBound) The `handler` passed to `canReflect.onInstanceBoundChange`.
	 * @param {String} [queueName] the name of the queue in [can-queues] the handler was registered under
	 */
	offInstanceBoundChange: makeErrorIfMissing("can.offInstanceBoundChange", "can-reflect: can not unobserve bound state change"),
	/**
	 * @function {Object} can-reflect/observe.isBound isBound
	 * @parent can-reflect/observe
	 * @description  Determine whether any listeners are bound to the observable object
	 *
	 * @signature `isBound(obj)`
	 *
	 * `isBound` queries an observable object to find out whether any listeners have been set on it using
	 * [can-reflect/observe.onKeyValue onKeyValue] or [can-reflect/observe.onValue onValue]
	 *
	 * ```js
	 * var obj = new DefineMap({});
	 * var handler = function() {};
	 * canReflect.isBound(obj); // -> false
	 * canReflect.onKeyValue(obj, "foo", handler);
	 * canReflect.isBound(obj); // -> true
	 * canReflect.offKeyValue(obj, "foo", handler);
	 * canReflect.isBound(obj); // -> false
	 * ```
	 *
	 * @param {*} obj
	 * @return {Boolean} `true` if obj has at least one key-value or value listener, `false` otherwise
	 */
	isBound: makeErrorIfMissing("can.isBound", "can-reflect: cannot determine if object is bound"),

	// EVENT
	/**
	 * @function {Object, String, function(*)} can-reflect/observe.onEvent onEvent
	 * @parent can-reflect/observe
	 * @description  Register a named event handler on an observable object
	 *
	 * @signature `onEvent(obj, eventName, callback)`
	 *
	 *
	 * Register an event handler on the object `obj` to trigger when the event `eventName` is dispatched.
	 * `obj` *must* implement [can-symbol/symbols/onKeyValue @@@@can.onEvent] or `.addEventListener()` to be compatible
	 * with can-reflect.onKeyValue.  The function passed as `callback` will receive the event descriptor as the first
	 * argument, and any data passed to the event dispatch as subsequent arguments.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * canReflect.onEvent(obj, "foo", function(ev, newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * });
	 *
	 * canEvent.dispatch.call(obj, "foo", ["baz", "quux"]);  // -> logs "foo is now baz , was quux"
	 * ```
	 *
	 * @param {Object} obj the object to bind a new event handler to
	 * @param {String} eventName the name of the event to bind the handler to
	 * @param {function(*)} callback  the handler function to bind to the event
	 */
	onEvent: function(obj, eventName, callback, queue){
		if(obj) {
			var onEvent = obj[canSymbol_1_6_5_canSymbol.for("can.onEvent")];
			if(onEvent !== undefined) {
				return onEvent.call(obj, eventName, callback, queue);
			} else if(obj.addEventListener) {
				obj.addEventListener(eventName, callback, queue);
			}
		}
	},
	/**
	 * @function {Object, String, function(*)} can-reflect/observe.offValue offEvent
	 * @parent can-reflect/observe
	 * @description  Unregister an event handler on a MapLike object, based on a key change
	 *
	 * @signature `offEvent(obj, eventName, callback)`
	 *
	 * Unregister an event handler from the object `obj` that had previously been registered with
	 * [can-reflect/observe.onEvent onEvent]. The function passed as `callback` will no longer be called
	 * when the event named `eventName` is dispatched on `obj`.
	 *
	 * ```js
	 * var obj = new DefineMap({ foo: "bar" });
	 * var handler = function(ev, newVal, oldVal) {
	 * 	console.log("foo is now", newVal, ", was", oldVal);
	 * };
	 *
	 * canReflect.onEvent(obj, "foo", handler);
	 * canReflect.offEvent(obj, "foo", handler);
	 *
	 * canEvent.dispatch.call(obj, "foo", ["baz", "quux"]);  // -> nothing is logged
	 * ```
	 *
	 * @param {Object} obj the object to unbind an event handler from
	 * @param {String} eventName the name of the event to unbind the handler from
	 * @param {function(*)} callback the handler function to unbind from the event
	 */
	offEvent: function(obj, eventName, callback, queue){
		if(obj) {
			var offEvent = obj[canSymbol_1_6_5_canSymbol.for("can.offEvent")];
			if(offEvent !== undefined) {
				return offEvent.call(obj, eventName, callback, queue);
			}  else if(obj.removeEventListener) {
				obj.removeEventListener(eventName, callback, queue);
			}
		}

	},
	/**
	 * @function {function} can-reflect/setPriority setPriority
	 * @parent can-reflect/observe
	 * @description  Provide a priority for when an observable that derives its
	 * value should be re-evaluated.
	 *
	 * @signature `setPriority(obj, priority)`
	 *
	 * Calls an underlying `@@can.setPriority` symbol on `obj` if it exists with `priorty`.
	 * Returns `true` if a priority was set, `false` if otherwise.
	 *
	 * Lower priorities (`0` being the lowest), will be an indication to run earlier than
	 * higher priorities.
	 *
	 * ```js
	 * var obj = canReflect.assignSymbols({},{
	 *   "can.setPriority": function(priority){
	 *     return this.priority = priority;
	 *   }
	 * });
	 *
	 * canReflect.setPriority(obj, 0) //-> true
	 * obj.priority //-> 0
	 *
	 * canReflect.setPriority({},20) //-> false
	 * ```
	 *
	 * @param {Object} obj An observable that will update its priority.
	 * @param {Number} priority The priority number.  Lower priorities (`0` being the lowest),
	 * indicate to run earlier than higher priorities.
	 * @return {Boolean} `true` if a priority was able to be set, `false` if otherwise.
	 *
	 * @body
	 *
	 * ## Use
	 *
	 * There's often a need to specify the order of re-evaluation for
	 * __observables__ that derive (or compute) their value from other observables.
	 *
	 * This is needed by templates to avoid unnecessary re-evaluation.  Say we had the following template:
	 *
	 * ```js
	 * {{#if value}}
	 *   {{value}}
	 * {{/if}}
	 * ```
	 *
	 * If `value` became falsey, we'd want the `{{#if}}` to be aware of it before
	 * the `{{value}}` magic tags updated. We can do that by setting priorities:
	 *
	 * ```js
	 * canReflect.setPriority(magicIfObservable, 0);
	 * canReflect.setPriority(magicValueObservable,1);
	 * ```
	 *
	 * Internally, those observables will use that `priority` to register their
	 * re-evaluation with the `derive` queue in [can-queues].
	 *
	 */
	setPriority: function(obj, priority) {
		if(obj) {
			var setPriority =  obj[canSymbol_1_6_5_canSymbol.for("can.setPriority")];
			if(setPriority !== undefined) {
				setPriority.call(obj, priority);
			 	return true;
			}
		}
		return false;
	},
	/**
	 * @function {function} can-reflect/getPriority getPriority
	 * @parent can-reflect/observe
	 * @description  Read the priority for an observable that derives its
	 * value.
	 *
	 * @signature `getPriority(obj)`
	 *
	 * Calls an underlying `@@can.getPriority` symbol on `obj` if it exists
	 * and returns its value. Read [can-reflect/setPriority] for more information.
	 *
	 *
	 *
	 * @param {Object} obj An observable.
	 * @return {Undefined|Number} Returns the priority number if
	 * available, undefined if this object does not support the `can.getPriority`
	 * symbol.
	 *
	 * @body
	 *
	 */
	getPriority: function(obj) {
		if(obj) {
			var getPriority =  obj[canSymbol_1_6_5_canSymbol.for("can.getPriority")];
			if(getPriority !== undefined) {
				return getPriority.call(obj);
			}
		}
		return undefined;
	}
};

// IE-remove-start
var getPrototypeOfWorksWithPrimitives = true;
try {
} catch(e) {
	getPrototypeOfWorksWithPrimitives = false;
}
// IE-remove-end

var ArrayMap;
if(typeof Map === "function") {
	ArrayMap = Map;
} else {
	// IE-remove-start
	var isEven = function isEven(num) {
		return num % 2 === 0;
	};

	// A simple map that stores items in an array.
	// like [key, value]
	// You can find the value by searching for the key and then +1.
	ArrayMap = function(){
		this.contents = [];
	};

	ArrayMap.prototype = {
		/**
		 * Get an index of a key. Because we store boths keys and values in
		 * a flat array, we ensure we are getting a key by checking that it is an
		 * even number index (all keys are even number indexed).
		 **/
		_getIndex: function(key) {
			var idx;
			do {
				idx = this.contents.indexOf(key, idx);
			} while(idx !== -1 && !isEven(idx));
			return idx;
		},
		has: function(key){
			return this._getIndex(key) !== -1;
		},
		get: function(key){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				return this.contents[idx + 1];
			}
		},
		set: function(key, value){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				// Key already exists, replace the value.
				this.contents[idx + 1] = value;
			} else {
				this.contents.push(key);
				this.contents.push(value);
			}
		},
		"delete": function(key){
			var idx = this._getIndex(key);
			if(idx !== -1) {
				// Key already exists, replace the value.
				this.contents.splice(idx, 2);
			}
		}
	};
	// IE-remove-end
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var shapeReflections;

var shiftFirstArgumentToThis = function(func){
	return function(){
		var args = [this];
		args.push.apply(args, arguments);
		return func.apply(null,args);
	};
};

var getKeyValueSymbol$1 = canSymbol_1_6_5_canSymbol.for("can.getKeyValue");
var shiftedGetKeyValue = shiftFirstArgumentToThis(getSet.getKeyValue);
var setKeyValueSymbol$1 = canSymbol_1_6_5_canSymbol.for("can.setKeyValue");
var shiftedSetKeyValue = shiftFirstArgumentToThis(getSet.setKeyValue);

var sizeSymbol = canSymbol_1_6_5_canSymbol.for("can.size");

var hasUpdateSymbol = helpers.makeGetFirstSymbolValue(["can.updateDeep","can.assignDeep","can.setKeyValue"]);
var shouldUpdateOrAssign = function(obj){
	return type.isPlainObject(obj) || Array.isArray(obj) || !!hasUpdateSymbol(obj);
};

// is the value itself its serialized value
function isSerializedHelper(obj){
	if (type.isPrimitive(obj)) {
		return true;
	}
	if(hasUpdateSymbol(obj)) {
		return false;
	}
	return type.isBuiltIn(obj) && !type.isPlainObject(obj) && !Array.isArray(obj) && !type.isObservableLike(obj);
}

// IE11 doesn't support primitives
var Object_Keys;
try{
	Object_Keys = Object.keys;
} catch(e) {
	Object_Keys = function(obj){
		if(type.isPrimitive(obj)) {
			return [];
		} else {
			return Object.keys(obj);
		}
	};
}

function createSerializeMap(Type) {
	var MapType = Type || ArrayMap;
	return {
		unwrap: new MapType(),
		serialize: new MapType() ,
		isSerializing: {
			unwrap: new MapType(),
			serialize: new MapType()
		},
		circularReferenceIsSerializing: {
			unwrap: new MapType(),
			serialize: new MapType()
		}
	};
}

function makeSerializer(methodName, symbolsToCheck){
	// A local variable that is shared with all operations that occur withing a single
	// outer call to serialize()
	var serializeMap = null;

	// Holds the value of running serialize(), preserving the same map for all
	// internal instances.
	function SerializeOperation(MapType) {
		this.first = !serializeMap;

		if(this.first) {
			serializeMap = createSerializeMap(MapType);
		}

		this.map = serializeMap;
		this.result = null;
	}

	SerializeOperation.prototype.end = function(){
		// If this is the first, outer call, clean up the serializeMap.
		if(this.first) {
			serializeMap = null;
		}
		return this.result;
	};

	return function serializer(value, MapType){
		if (isSerializedHelper(value)) {
			return value;
		}

		var operation = new SerializeOperation(MapType);

		if(type.isValueLike(value)) {
			operation.result = this[methodName](getSet.getValue(value));

		} else {
			// Date, RegEx and other Built-ins are handled above
			// only want to do something if it's intended to be serialized
			// or do nothing for a POJO

			var isListLike = type.isIteratorLike(value) || type.isMoreListLikeThanMapLike(value);
			operation.result = isListLike ? [] : {};

			// handle maping to what is serialized
			if( operation.map[methodName].has(value) ) {
				// if we are in the process of serializing the first time, setup circular reference detection.
				if(operation.map.isSerializing[methodName].has(value)) {
					operation.map.circularReferenceIsSerializing[methodName].set(value, true);
				}
				return operation.map[methodName].get(value);
			} else {
				operation.map[methodName].set(value, operation.result);
			}

			for(var i = 0, len = symbolsToCheck.length ; i< len;i++) {
				var serializer = value[symbolsToCheck[i]];
				if(serializer) {
					// mark that we are serializing
					operation.map.isSerializing[methodName].set(value, true);
					var oldResult = operation.result;
					operation.result = serializer.call(value, oldResult);
					operation.map.isSerializing[methodName].delete(value);

					// if the result differs, but this was circular, blow up.
					if(operation.result !== oldResult) {
						// jshint -W073
						if(operation.map.circularReferenceIsSerializing[methodName].has(value)) {
							// Circular references should use a custom serializer
							// that sets the serialized value on the object
							// passed to it as the first argument e.g.
							// function(proto){
							//   return proto.a = canReflect.serialize(this.a);
							// }
							operation.end();
							throw new Error("Cannot serialize cirular reference!");
						}
						operation.map[methodName].set(value, operation.result);
					}
					return operation.end();
				}
			}

			if (typeof obj ==='function') {
				operation.map[methodName].set(value, value);

				operation.result = value;
			} else if( isListLike ) {
				this.eachIndex(value,function(childValue, index){
					operation.result[index] = this[methodName](childValue);
				},this);
			} else {
				this.eachKey(value,function(childValue, prop){
					operation.result[prop] = this[methodName](childValue);
				},this);
			}
		}

		return operation.end();
	};
}

// returns a Map type of the keys mapped to true
var makeMap;
if(typeof Map !== "undefined") {
	makeMap = function(keys) {
		var map = new Map();
		shapeReflections.eachIndex(keys, function(key){
			map.set(key, true);
		});
		return map;
	};
} else {
	makeMap = function(keys) {
		var map = {};
		keys.forEach(function(key){
			map[key] = true;
		});

		return {
			get: function(key){
				return map[key];
			},
			set: function(key, value) {
				map[key] = value;
			},
			keys: function(){
				return keys;
			}
		};
	};
}

// creates an optimized hasOwnKey lookup.
// If the object has hasOwnKey, then we just use that.
// Otherwise, try to put all keys in a map.
var fastHasOwnKey = function(obj){
	var hasOwnKey = obj[canSymbol_1_6_5_canSymbol.for("can.hasOwnKey")];
	if(hasOwnKey) {
		return hasOwnKey.bind(obj);
	} else {
		var map = makeMap( shapeReflections.getOwnEnumerableKeys(obj) );
		return function(key) {
			return map.get(key);
		};
	}
};


// combines patches if it makes sense
function addPatch(patches, patch) {
	var lastPatch = patches[patches.length -1];
	if(lastPatch) {
		// same number of deletes and counts as the index is back
		if(lastPatch.deleteCount === lastPatch.insert.length && (patch.index - lastPatch.index === lastPatch.deleteCount) ) {
			lastPatch.insert.push.apply(lastPatch.insert, patch.insert);
			lastPatch.deleteCount += patch.deleteCount;
			return;
		}
	}
	patches.push(patch);
}

function updateDeepList(target, source, isAssign) {
	var sourceArray = this.toArray(source); // jshint ignore:line

	var patches = [],
		lastIndex = -1;
	this.eachIndex(target, function(curVal, index){ // jshint ignore:line
		lastIndex = index;
		// If target has more items than the source.
		if(index >= sourceArray.length) {
			if(!isAssign) {
				// add a patch that removes the last items
				addPatch(patches, {index: index, deleteCount: target.length - index + 1, insert: []});
			}
			return false;
		}
		var newVal = sourceArray[index];
		if( type.isPrimitive(curVal) || type.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
			addPatch(patches, {index: index, deleteCount: 1, insert: [newVal]});
		} else {
			if(isAssign === true) {
				this.assignDeep(curVal, newVal);
			} else {
				this.updateDeep(curVal, newVal);
			}

		}
	}, this); // jshint ignore:line
	// add items at the end
	if(sourceArray.length > lastIndex) {
		addPatch(patches, {index: lastIndex+1, deleteCount: 0, insert: sourceArray.slice(lastIndex+1)});
	}
	for(var i = 0, patchLen = patches.length; i < patchLen; i++) {
		var patch = patches[i];
		getSet.splice(target, patch.index, patch.deleteCount, patch.insert);
	}
	return target;
}

shapeReflections = {
	/**
	 * @function {Object, function(*), [Object]} can-reflect.each each
	 * @parent can-reflect/shape
	 * @description  Iterate a List-like or Map-like, calling `callback` on each keyed or indexed property
	 *
	 * @signature `each(obj, callback, context)`
	 *
	 * If `obj` is a List-like or an Iterator-like, `each` functions as [can-reflect.eachIndex eachIndex],
	 * iterating over numeric indexes from 0 to `obj.length - 1` and calling `callback` with each property and
	 * index, optionally with `context` as `this` (defaulting to `obj`).  If not, `each` functions as
	 * [can-reflect.eachKey eachKey],
	 * iterating over every key on `obj` and calling `callback` on each one.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 * var quux = new DefineList([ "thud", "jeek" ]);
	 *
	 * canReflect.each(foo, console.log, console); // -> logs 'baz bar {foo}'
	 * canReflect.each(quux, console.log, console); // -> logs 'thud 0 {quux}'; logs 'jeek 1 {quux}'
	 * ```
	 *
	 * @param  {Object}   obj     The object to iterate over
	 * @param  {Function(*, ValueLike)} callback a function that receives each item in the ListLike or MapLike
	 * @param  {[Object]}   context  an optional `this` context for calling the callback
	 * @return {Array} the result of calling [can-reflect.eachIndex `eachIndex`] if `obj` is a ListLike,
	 * or [can-reflect.eachKey `eachKey`] if a MapLike.
	 */
	each: function(obj, callback, context){

		// if something is more "list like" .. use eachIndex
		if(type.isIteratorLike(obj) || type.isMoreListLikeThanMapLike(obj) ) {
			return shapeReflections.eachIndex(obj,callback,context);
		} else {
			return shapeReflections.eachKey(obj,callback,context);
		}
	},

	/**
	 * @function {ListLike, function(*), [Object]} can-reflect.eachIndex eachIndex
	 * @parent can-reflect/shape
	 * @description  Iterate a ListLike calling `callback` on each numerically indexed element
	 *
	 * @signature `eachIndex(list, callback, context)`
	 *
	 * For each numeric index from 0 to `list.length - 1`, call `callback`, passing the current
	 * property value, the current index, and `list`, and optionally setting `this` as `context`
	 * if specified (otherwise use the current property value).
	 *
	 * ```js
	 * var foo = new DefineList([ "bar", "baz" ]);
	 *
	 * canReflect.eachIndex(foo, console.log, console); // -> logs 'bar 0 {foo}'; logs 'baz 1 {foo}'
	 * ```
	 *
	 * @param  {ListLike}   list     The list to iterate over
	 * @param  {Function(*, Number)} callback a function that receives each item
	 * @param  {[Object]}   context  an optional `this` context for calling the callback
	 * @return {ListLike}   the original list
	 */
	eachIndex: function(list, callback, context){
		// each index in something list-like. Uses iterator if it has it.
		if(Array.isArray(list)) {
			return shapeReflections.eachListLike(list, callback, context);
		} else {
			var iter, iterator = list[canSymbol_1_6_5_canSymbol.iterator];
			if(type.isIteratorLike(list)) {
				// we are looping through an iterator
				iter = list;
			} else if(iterator) {
				iter = iterator.call(list);
			}
			// fast-path arrays
			if(iter) {
				var res, index = 0;

				while(!(res = iter.next()).done) {
					if( callback.call(context || list, res.value, index++, list) === false ){
						break;
					}
				}
			} else {
				shapeReflections.eachListLike(list, callback, context);
			}
		}
		return list;
	},
	eachListLike: function(list, callback, context){
		var index = -1;
		var length = list.length;
		if( length === undefined ) {
			var size = list[sizeSymbol];
			if(size) {
				length = size.call(list);
			} else {
				throw new Error("can-reflect: unable to iterate.");
			}
		}

		while (++index < length) {
			var item = list[index];
			if (callback.call(context || item, item, index, list) === false) {
				break;
			}
		}

		return list;
	},
	/**
	 * @function can-reflect.toArray toArray
	 * @parent can-reflect/shape
	 * @description  convert the values of any MapLike or ListLike into an array
	 *
	 * @signature `toArray(obj)`
	 *
	 * Convert the values of any Map-like or List-like into a JavaScript Array.  If a Map-like,
	 * key data is discarded and only value data is preserved.
	 *
	 * ```js
	 * var foo = new DefineList(["bar", "baz"]);
	 * var quux = new DefineMap({ thud: "jeek" });
	 * ```
	 *
	 * canReflect.toArray(foo); // -> ["bar", "baz"]
	 * canReflect.toArray(quux): // -> ["jeek"]
	 *
	 * @param  {Object} obj Any object, whether MapLike or ListLike
	 * @return {Array}  an array of the values of `obj`
	 */
	toArray: function(obj){
		var arr = [];
		shapeReflections.each(obj, function(value){
			arr.push(value);
		});
		return arr;
	},
	/**
	 * @function can-reflect.eachKey eachKey
	 * @parent can-reflect/shape
	 * @description Iterate over a MapLike, calling `callback` on each enumerable property
	 *
	 * @signature `eachKey(obj, callback, context)`
	 *
	 * Iterate all own enumerable properties on Map-like `obj`
	 * (using [can-reflect/shape/getOwnEnumerableKeys canReflect.getOwnEnumerableKeys]), and call
	 * `callback` with the property value, the property key, and `obj`, and optionally setting
	 * `this` on the callback as `context` if provided, `obj` otherwise.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * canReflect.eachKey(foo, console.log, console); // logs 'baz bar {foo}'
	 * ```
	 *
	 * @param  {Object}   obj   The object to iterate over
	 * @param  {Function(*, String)} callback The callback to call on each enumerable property value
	 * @param  {[Object]}   context  an optional `this` context for calling `callback`
	 * @return {Array}    the enumerable keys of `obj` as an Array
	 */
	eachKey: function(obj, callback, context){
		// each key in something map like
		// eachOwnEnumerableKey
		if(obj) {
			var enumerableKeys = shapeReflections.getOwnEnumerableKeys(obj);

			// cache getKeyValue method if we can
			var getKeyValue = obj[getKeyValueSymbol$1] || shiftedGetKeyValue;

			return shapeReflections.eachIndex(enumerableKeys, function(key){
				var value = getKeyValue.call(obj, key);
				return callback.call(context || obj, value, key, obj);
			});
		}
		return obj;
	},
	/**
	 * @function can-reflect.hasOwnKey hasOwnKey
	 * @parent can-reflect/shape
	 * @description  Determine whether an object contains a key on itself, not only on its prototype chain
	 *
	 * @signature `hasOwnKey(obj, key)`
	 *
	 * Return `true` if an object's own properties include the property key `key`, `false` otherwise.
	 * An object may implement [can-symbol/symbols/hasOwnKey @@@@can.hasOwnKey] to override default behavior.
	 * By default, `canReflect.hasOwnKey` will first look for
	 * [can-symbol/symbols/getOwnKey @@@@can.getOwnKey] on `obj`. If present, it will call `@@@@can.getOwnKey` and
	 * test `key` against the returned Array of keys.  If absent, `Object.prototype.hasOwnKey()` is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" });
	 *
	 * canReflect.hasOwnKey(foo, "bar"); // -> true
	 * canReflect.hasOwnKey(foo, "each"); // -> false
	 * foo.each // -> function each() {...}
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @param  {String} key The key to look up on `obj`
	 * @return {Boolean} `true` if `obj`'s key set contains `key`, `false` otherwise
	 */
	"hasOwnKey": function(obj, key){
		// if a key or index
		// like has own property
		var hasOwnKey = obj[canSymbol_1_6_5_canSymbol.for("can.hasOwnKey")];
		if(hasOwnKey) {
			return hasOwnKey.call(obj, key);
		}
		var getOwnKeys = obj[canSymbol_1_6_5_canSymbol.for("can.getOwnKeys")];
		if( getOwnKeys ) {
			var found = false;
			shapeReflections.eachIndex(getOwnKeys.call(obj), function(objKey){
				if(objKey === key) {
					found = true;
					return false;
				}
			});
			return found;
		}
		return hasOwnProperty.call(obj, key);
	},
	/**
	 * @function can-reflect.getOwnEnumerableKeys getOwnEnumerableKeys
	 * @parent can-reflect/shape
	 * @description Return the list of keys which can be iterated over on an object
	 *
	 * @signature `getOwnEnumerableKeys(obj)`
	 *
	 * Return all keys on `obj` which have been defined as enumerable, either from explicitly setting
	 * `enumerable` on the property descriptor, or by using `=` to set the value of the property without
	 * a key descriptor, but excluding properties that only exist on `obj`'s prototype chain.  The
	 * default behavior can be overridden by implementing
	 * [can-symbol/symbols/getOwnEnumerableKeys @@@@can.getOwnEnumerableKeys] on `obj`.  By default,
	 * `canReflect.getOwnEnumerableKeys` will use [can-symbol/symbols/getOwnKeys @@@@can.getOwnKeys] to
	 * retrieve the set of keys and [can-symbol/symbols/getOwnKeyDescriptor @@@@can.getOwnKeyDescriptor]
	 * to filter for those which are enumerable.  If either symbol is absent from `obj`, `Object.keys`
	 * is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz", [canSymbol.for("quux")]: "thud" });
	 * Object.defineProperty(foo, "jeek", {
	 *   enumerable: true,
	 *   value: "plonk"
	 * });
	 *
	 * canReflect.getOwnEnumerableKeys(foo); // -> ["bar", "jeek"]
	 * ```
	 *
	 * @param  {Object} obj Any Map-like object
	 * @return {Array} the Array of all enumerable keys from the object, either using
	 * [can-symbol/symbols/getOwnEnumerableKeys `@@@@can.getOwnEnumerableKeys`] from `obj`, or filtering
	 * `obj`'s own keys for those which are enumerable.
	 */
	getOwnEnumerableKeys: function(obj){
		// own enumerable keys (aliased as keys)
		var getOwnEnumerableKeys = obj[canSymbol_1_6_5_canSymbol.for("can.getOwnEnumerableKeys")];
		if(getOwnEnumerableKeys) {
			return getOwnEnumerableKeys.call(obj);
		}
		if( obj[canSymbol_1_6_5_canSymbol.for("can.getOwnKeys")] && obj[canSymbol_1_6_5_canSymbol.for("can.getOwnKeyDescriptor")] ) {
			var keys = [];
			shapeReflections.eachIndex(shapeReflections.getOwnKeys(obj), function(key){
				var descriptor =  shapeReflections.getOwnKeyDescriptor(obj, key);
				if(descriptor.enumerable) {
					keys.push(key);
				}
			}, this);

			return keys;
		} /*else if(obj[canSymbol.iterator]){
			var iter = obj[canSymbol.iterator](obj);
			var index = 0;
			var keys;
			return {
				next: function(){
					var res = iter.next();
					if(index++)
				}
			}
			while(!().done) {

				if( callback.call(context || list, res.value, index++, list) === false ){
					break;
				}
			}
		}*/ else {
			return Object_Keys(obj);
		}
	},
	/**
	 * @function can-reflect.getOwnKeys getOwnKeys
	 * @parent can-reflect/shape
	 * @description Return the list of keys on an object, whether or not they can be iterated over
	 *
	 * @signature `getOwnKeys(obj)`
	 *
	 * Return the Array of all String (not Symbol) keys from `obj`, whether they are enumerable or not.  If
	 * [can-symbol/symbols/getOwnKeys @@@@can.getOwnKeys] exists on `obj`, it is called to return
	 * the keys; otherwise, `Object.getOwnPropertyNames()` is used.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz", [canSymbol.for("quux")]: "thud" });
	 * Object.defineProperty(foo, "jeek", {
	 *   enumerable: false,
	 *   value: "plonk"
	 * });
	 *
	 * canReflect.getOwnKeys(foo); // -> ["bar", "jeek"]
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @return {Array} the Array of all String keys from the object.
	 */
	getOwnKeys: function(obj){
		// own enumerable&non-enumerable keys (Object.getOwnPropertyNames)
		var getOwnKeys = obj[canSymbol_1_6_5_canSymbol.for("can.getOwnKeys")];
		if(getOwnKeys) {
			return getOwnKeys.call(obj);
		} else {
			return Object.getOwnPropertyNames(obj);
		}
	},
	/**
	 * @function can-reflect.getOwnKeyDescriptor getOwnKeyDescriptor
	 * @parent can-reflect/shape
	 * @description Return a property descriptor for a named property on an object.
	 *
	 * @signature `getOwnKeyDescriptor(obj, key)`
	 *
	 *	Return the key descriptor for the property key `key` on the Map-like object `obj`. A key descriptor
	 *	is specified in ECMAScript 5 and contains keys for the property's `configurable` and `enumerable` states,
	 *	as well as either `value` and `writable` for value properties, or `get` and `set` for getter/setter properties.
	 *
	 * The default behavior can be overridden by implementing [can-symbol/symbols/getOwnKeyDescriptor @@@@can.getOwnKeyDescriptor]
	 * on `obj`; otherwise the default is to call `Object.getOwnKeyDescriptor()`.
	 *
	 * ```js
	 * var foo = new DefineMap({ bar: "baz" });
	 *
	 * getOwnKeyDescriptor(foo, "bar"); // -> {configurable: true, writable: true, enumerable: true, value: "baz"}
	 * ```
	 *
	 * @param  {Object} obj Any object with named properties
	 * @param  {String} key The property name to look up on `obj`
	 * @return {Object}   A key descriptor object
	 */
	getOwnKeyDescriptor: function(obj, key){
		var getOwnKeyDescriptor = obj[canSymbol_1_6_5_canSymbol.for("can.getOwnKeyDescriptor")];
		if(getOwnKeyDescriptor) {
			return getOwnKeyDescriptor.call(obj, key);
		} else {
			return Object.getOwnPropertyDescriptor(obj, key);
		}
	},
	/**
	 * @function can-reflect.unwrap unwrap
	 * @parent can-reflect/shape
	 * @description Unwraps a map-like or array-like value into an object or array.
	 *
	 *
	 * @signature `unwrap(obj)`
	 *
	 * Recursively unwraps a map-like or list-like object.
	 *
	 * ```js
	 * import canReflect from "can-reflect";
	 *
	 * var map = new DefineMap({foo: "bar"});
	 * canReflect.unwrap(map) //-> {foo: "bar"}
	 * ```
	 *
	 * `unwrap` is similar to [can-reflect.serialize] except it does not try to provide `JSON.stringify()`-safe
	 * objects.  For example, an object with a `Date` instance property value will not be expected to
	 * serialize the date instance:
	 *
	 * ```js
	 * var date = new Date();
	 * var map = new DefineMap({date: date});
	 * canReflect.unwrap(map) //-> {date: date}
	 * ```
	 *
	 * @param {Object} obj A map-like or array-like object.
	 * @return {Object} Returns objects and arrays.
	 */
	unwrap: makeSerializer("unwrap",[canSymbol_1_6_5_canSymbol.for("can.unwrap")]),
	/**
	 * @function can-reflect.serialize serialize
	 * @parent can-reflect/shape
	 * @description Serializes an object to a value that can be passed to JSON.stringify.
	 *
	 *
	 * @signature `serialize(obj)`
	 *
	 * Recursively serializes a map-like or list-like object.
	 *
	 * ```js
	 * import canReflect from "can-reflect";
	 * canReflect.serialize({foo: "bar"}) //-> {foo: "bar"}
	 * ```
	 *
	 * It does this by recursively:
	 *
	 *  - Checking if `obj` is a primitive, if it is, returns the value.
	 *  - If `obj` is an object:
	 *    - calling the `@can.serialize` property on the value if it exists.
	 *    - If the `@can.serialize` value doesn't exist, walks through every key-value
	 *      on `obj` and copy to a new object.
	 *
	 * @param {Object} obj A map-like or array-like object.
	 * @return {Object} Returns a plain object or array.
	 */
	serialize: makeSerializer("serialize",[canSymbol_1_6_5_canSymbol.for("can.serialize"), canSymbol_1_6_5_canSymbol.for("can.unwrap")]),

	assignMap: function(target, source) {
		// read each key and set it on target
		var hasOwnKey = fastHasOwnKey(target);
		var getKeyValue = target[getKeyValueSymbol$1] || shiftedGetKeyValue;
		var setKeyValue = target[setKeyValueSymbol$1] || shiftedSetKeyValue;
		shapeReflections.eachKey(source,function(value, key){
			// if the target doesn't have this key or the keys are not the same
			if(!hasOwnKey(key) || getKeyValue.call(target, key) !==  value) {
				setKeyValue.call(target, key, value);
			}
		});
		return target;
	},
	assignList: function(target, source) {
		var inserting = shapeReflections.toArray(source);
		getSet.splice(target, 0, inserting, inserting );
		return target;
	},
	/**
	 * @function can-reflect.assign assign
	 * @parent can-reflect/shape
	 * @description Assign one objects values to another
	 *
	 * @signature `.assign(target, source)`
	 *
	 * Copies the values (and properties if map-like) from `source` onto `target`.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {};
	 * var source = {key : "value"};
	 * var restult = canReflect.assign(target, source);
	 * result === target //-> true
	 * target //-> {key : "value"}
	 * ```
	 *
	 * For Arrays, enumerated values are copied over, but the length of the array will not be
	 * trunkated.  Use [can-reflect.update] for trunkating.
	 *
	 * ```js
	 * var target = ["a","b","c"];
	 * var source = ["A","B"];
	 * canReflect.assign(target, source);
	 * target //-> ["A","B","c"]
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	assign: function(target, source) {
		if(type.isIteratorLike(source) || type.isMoreListLikeThanMapLike(source) ) {
			// copy to array and add these keys in place
			shapeReflections.assignList(target, source);
		} else {
			shapeReflections.assignMap(target, source);
		}
		return target;
	},
	assignDeepMap: function(target, source) {

		var hasOwnKey = fastHasOwnKey(target);
		var getKeyValue = target[getKeyValueSymbol$1] || shiftedGetKeyValue;
		var setKeyValue = target[setKeyValueSymbol$1] || shiftedSetKeyValue;

		shapeReflections.eachKey(source, function(newVal, key){
			if(!hasOwnKey(key)) {
				// set no matter what
				getSet.setKeyValue(target, key, newVal);
			} else {
				var curVal = getKeyValue.call(target, key);

				// if either was primitive, no recursive update possible
				if(newVal === curVal) {
					// do nothing
				} else if(type.isPrimitive(curVal) || type.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
					setKeyValue.call(target, key, newVal);
				} else {
					shapeReflections.assignDeep(curVal, newVal);
				}
			}
		}, this);
		return target;
	},
	assignDeepList: function(target, source) {
		return updateDeepList.call(this, target, source, true);
	},
	/**
	 * @function can-reflect.assignDeep assignDeep
	 * @parent can-reflect/shape
	 * @description Assign one objects values to another, and performs the same action for all child values.
	 *
	 * @signature `.assignDeep(target, source)`
	 *
	 * Copies the values (and properties if map-like) from `source` onto `target` and repeates for all child
	 * values.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}};
	 * var source = {name: {last: "Meyer"}};
	 * var restult = canReflect.assignDeep(target, source);
	 * target //->  {name: {first: "Justin", last: "Meyer"}}
	 * ```
	 *
	 * An object can control the behavior of `assignDeep` using the [can-symbol/symbols/assignDeep] symbol.
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	assignDeep: function(target, source){
		var assignDeep = target[canSymbol_1_6_5_canSymbol.for("can.assignDeep")];
		if(assignDeep) {
			assignDeep.call(target, source);
		} else if( type.isMoreListLikeThanMapLike(source) ) {
			// list-like
			shapeReflections.assignDeepList(target, source);
		} else {
			// map-like
			shapeReflections.assignDeepMap(target, source);
		}
		return target;
	},
	updateMap: function(target, source) {
		var sourceKeyMap = makeMap( shapeReflections.getOwnEnumerableKeys(source) );

		var sourceGetKeyValue = source[getKeyValueSymbol$1] || shiftedGetKeyValue;
		var targetSetKeyValue = target[setKeyValueSymbol$1] || shiftedSetKeyValue;

		shapeReflections.eachKey(target, function(curVal, key){
			if(!sourceKeyMap.get(key)) {
				getSet.deleteKeyValue(target, key);
				return;
			}
			sourceKeyMap.set(key, false);
			var newVal = sourceGetKeyValue.call(source, key);

			// if either was primitive, no recursive update possible
			if(newVal !== curVal) {
				targetSetKeyValue.call(target, key, newVal);
			}
		}, this);

		shapeReflections.eachIndex(sourceKeyMap.keys(), function(key){
			if(sourceKeyMap.get(key)) {
				targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key) );
			}
		});

		return target;
	},
	updateList: function(target, source) {
		var inserting = shapeReflections.toArray(source);

		getSet.splice(target, 0, target, inserting );
		return target;
	},
	/**
	 * @function can-reflect.update update
	 * @parent can-reflect/shape
	 * @description Updates the values of an object match the values of an other object.
	 *
	 * @signature `.update(target, source)`
	 *
	 * Updates the values (and properties if map-like) of `target` to match the values of `source`.
	 * Properties of `target` that are not on `source` will be removed. This does
	 * not recursively update.  For that, use [can-reflect.updateDeep].
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}, age: 34};
	 * var source = {name: {last: "Meyer"}};
	 * var result = canReflect.update(target, source);
	 * target //->  {name: {last: "Meyer"}}
	 * ```
	 *
	 * With Arrays all items of the source will be replaced with the new items.
	 *
	 * ```js
	 * var target = ["a","b","c"];
	 * var source = ["A","B"];
	 * canReflect.update(target, source);
	 * target //-> ["A","B"]
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	update: function(target, source) {
		if(type.isIteratorLike(source) || type.isMoreListLikeThanMapLike(source) ) {
			// copy to array and add these keys in place
			shapeReflections.updateList(target, source);
		} else {
			shapeReflections.updateMap(target, source);
		}
		return target;
	},
	updateDeepMap: function(target, source) {
		var sourceKeyMap = makeMap( shapeReflections.getOwnEnumerableKeys(source) );

		var sourceGetKeyValue = source[getKeyValueSymbol$1] || shiftedGetKeyValue;
		var targetSetKeyValue = target[setKeyValueSymbol$1] || shiftedSetKeyValue;

		shapeReflections.eachKey(target, function(curVal, key){

			if(!sourceKeyMap.get(key)) {
				getSet.deleteKeyValue(target, key);
				return;
			}
			sourceKeyMap.set(key, false);
			var newVal = sourceGetKeyValue.call(source, key);

			// if either was primitive, no recursive update possible
			if(type.isPrimitive(curVal) || type.isPrimitive(newVal) || shouldUpdateOrAssign(curVal) === false ) {
				targetSetKeyValue.call(target, key, newVal);
			} else {
				shapeReflections.updateDeep(curVal, newVal);
			}

		}, this);

		shapeReflections.eachIndex(sourceKeyMap.keys(), function(key){
			if(sourceKeyMap.get(key)) {
				targetSetKeyValue.call(target, key, sourceGetKeyValue.call(source, key) );
			}
		});
		return target;
	},
	updateDeepList: function(target, source) {
		return updateDeepList.call(this,target, source);
	},
	/**
	 * @function can-reflect.updateDeep updateDeep
	 * @parent can-reflect/shape
	 * @description Makes the values of an object match the values of an other object including all children values.
	 *
	 * @signature `.updateDeep(target, source)`
	 *
	 * Updates the values (and properties if map-like) of `target` to match the values of `source`.
	 * Removes properties from `target` that are not on `source`.
	 *
	 * For map-like objects, every enumerable property on `target` is copied:
	 *
	 * ```js
	 * var target = {name: {first: "Justin"}, age: 34};
	 * var source = {name: {last: "Meyer"}};
	 * var result = canReflect.updateDeep(target, source);
	 * target //->  {name: {last: "Meyer"}}
	 * ```
	 *
	 * An object can control the behavior of `updateDeep` using the [can-symbol/symbols/updateDeep] symbol.
	 *
	 * For list-like objects, a diff and patch strategy is used.  This attempts to limit the number of changes.
	 *
	 * @param  {Object} target The value that will be updated with `source`'s values.
	 * @param  {Object} source A source of values to copy to `target`.
	 * @return {Object} The target.
	 */
	updateDeep: function(target, source){
		var updateDeep = target[canSymbol_1_6_5_canSymbol.for("can.updateDeep")];
		if(updateDeep) {
			updateDeep.call(target, source);
		} else if( type.isMoreListLikeThanMapLike(source) ) {
			// list-like
			shapeReflections.updateDeepList(target, source);
		} else {
			// map-like
			shapeReflections.updateDeepMap(target, source);
		}
		return target;
	},
	// walks up the whole prototype chain
	/**
	 * @function can-reflect.hasKey hasKey
	 * @parent can-reflect/shape
	 * @description Determine whether an object contains a key on itself or its prototype chain
	 *
	 * @signature `hasKey(obj, key)`
	 *
	 * Return `true` if an object's properties include the property key `key` or an object on its prototype
	 * chain's properties include the key `key`, `false` otherwise.
	 * An object may implement [can-symbol/symbols/hasKey @@@@can.hasKey] to override default behavior.
	 * By default, `canReflect.hasKey` will use [can-reflect.hasOwnKey] and return true if the key is present.
	 * If `hasOwnKey` returns false, the [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in in Operator] will be used.
	 *
	 * ```js
	 * var foo = new DefineMap({ "bar": "baz" });
	 *
	 * canReflect.in(foo, "bar"); // -> true
	 * canReflect.in(foo, "each"); // -> true
	 * foo.each // -> function each() {...}
	 * ```
	 *
	 * @param  {Object} obj Any MapLike object
	 * @param  {String} key The key to look up on `obj`
	 * @return {Boolean} `true` if `obj`'s key set contains `key` or an object on its prototype chain's key set contains `key`, `false` otherwise
	 */
	hasKey: function(obj, key) {
		if( obj == null ) {
			return false;
		}
		if (type.isPrimitive(obj)) {
			if (hasOwnProperty.call(obj, key)) {
				return true;
			} else {
				var proto;
				if(getPrototypeOfWorksWithPrimitives) {
					proto = Object.getPrototypeOf(obj);
				} else {
					// IE-remove-start
					proto = obj.__proto__; // jshint ignore:line
					// IE-remove-end
				}
				if(proto !== undefined) {
					return key in proto;
				} else {
					// IE-remove-start
					return obj[key] !== undefined;
					// IE-remove-end
				}
			}
		}
		var hasKey = obj[canSymbol_1_6_5_canSymbol.for("can.hasKey")];
		if(hasKey) {
			return hasKey.call(obj, key);
		}

		var found = shapeReflections.hasOwnKey(obj, key);

		return found || key in obj;
	},
	getAllEnumerableKeys: function(){},
	getAllKeys: function(){},
	/**
	 * @function can-reflect.assignSymbols assignSymbols
	 * @parent can-reflect/shape
	 * @description Assign well known symbols and values to an object.
	 *
	 * @signature `.assignSymbols(target, source)`
	 *
	 * Converts each property name on the `source` object to a [can-symbol.for well known symbol]
	 * and uses that symbol to set the corresponding value on target.
	 *
	 * This is used to easily set symbols correctly even when symbol isn't natively supported.
	 *
	 * ```js
	 * canReflect.assignSymbols(Map.prototype, {
	 *   "can.getKeyValue": Map.prototype.get
	 * })
	 * ```
	 *
	 * If a `source` property name matches a symbol on `Symbol` (like `iterator` on `Symbol.iterator`),
	 * that symbol will be used:
	 *
	 * ```js
	 * canReflect.assignSymbols(ArrayLike.prototype, {
	 *   "iterator": function() { ... }
	 * })
	 * ArrayLike.prototype[Symbol.iterator] = function(){ ... }
	 * ```
	 *
	 * @param  {Object} target The value that will be updated with `source`'s symbols and values.
	 * @param  {Object<name,value>} source A source of symbol names and values to copy to `target`.
	 * @return {Object} The target.
	 */
	assignSymbols: function(target, source){
		shapeReflections.eachKey(source, function(value, key){
			var symbol = type.isSymbolLike(canSymbol_1_6_5_canSymbol[key]) ? canSymbol_1_6_5_canSymbol[key] : canSymbol_1_6_5_canSymbol.for(key);
			getSet.setKeyValue(target, symbol, value);
		});
		return target;
	},
	isSerialized: isSerializedHelper,
	/**
	 * @function can-reflect.size size
	 * @parent can-reflect/shape
	 * @description Return the number of items in the collection.
	 *
	 * @signature `.size(target)`
	 *
	 * Returns the number of items contained in `target`. Target can
	 * provide the size using the [can-symbol/symbols/size] symbol.
	 *
	 * If the `target` has a numeric `length` property that is greater than or equal to 0, that
	 * `length` will be returned.
	 *
	 * ```js
	 * canReflect.size([1,2,3]) //-> 3
	 * ```
	 *
	 * If the `target` is [can-reflect.isListLike], the values of the list will be counted.
	 *
	 * If the `target` is a plain JS object, the number of enumerable properties will be returned.
	 *
	 * ```js
	 * canReflect.size({foo:"bar"}) //-> 1
	 * ```
	 *
	 * If the `target` is anything else, `undefined` is returned.
	 *
	 * @param  {Object} target The container object.
	 * @return {Number} The number of values in the target.
	 */
	size: function(obj){
		if(obj == null) {
			return 0;
		}
		var size = obj[sizeSymbol];
		var count = 0;
		if(size) {
			return size.call(obj);
		}
		else if(helpers.hasLength(obj)){
			return obj.length;
		}
		else if(type.isListLike(obj)){

			shapeReflections.eachIndex(obj, function(){
				count++;
			});
			return count;
		}
		else if( obj ) {
			return shapeReflections.getOwnEnumerableKeys(obj).length;
		}
		else {
			return undefined;
		}
	},
	/**
	 * @function {Function, String|Symbol, Object} can-reflect.defineInstanceKey defineInstanceKey
	 * @parent can-reflect/shape
	 * @description Create a key for all instances of a constructor.
	 *
	 * @signature `defineInstanceKey(cls, key, properties)`
	 *
	 * Define the property `key` on the prototype of the constructor `cls` using the symbolic
	 * property [can-symbol/symbols/defineInstanceKey @@can.defineInstanceKey] if it exists; otherwise
	 * use `Object.defineProperty()` to define the property.  The property definition
	 *
	 * @param  {Function} cls  a Constructor function
	 * @param  {String} key     the String or Symbol key to set.
	 * @param  {Object} properties a JavaScript property descriptor
	 */
	defineInstanceKey: function(cls, key, properties) {
		var defineInstanceKey = cls[canSymbol_1_6_5_canSymbol.for("can.defineInstanceKey")];
		if(defineInstanceKey) {
			return defineInstanceKey.call(cls, key, properties);
		}
		var proto = cls.prototype;
		defineInstanceKey = proto[canSymbol_1_6_5_canSymbol.for("can.defineInstanceKey")];
		if(defineInstanceKey) {
			defineInstanceKey.call(proto, key, properties);
		} else {
			Object.defineProperty(
				proto,
				key,
				shapeReflections.assign({
					configurable: true,
					enumerable: !type.isSymbolLike(key),
					writable: true
				}, properties)
			);
		}
	}
};

shapeReflections.isSerializable = shapeReflections.isSerialized;
shapeReflections.keys = shapeReflections.getOwnEnumerableKeys;
var shape = shapeReflections;

var getSchemaSymbol = canSymbol_1_6_5_canSymbol.for("can.getSchema"),
    isMemberSymbol = canSymbol_1_6_5_canSymbol.for("can.isMember"),
    newSymbol = canSymbol_1_6_5_canSymbol.for("can.new");

function comparator(a, b) {
    return a.localeCompare(b);
}

function sort(obj) {
    if(type.isPrimitive(obj) || obj instanceof Date) {
        return obj;
    }
    var out;
    if (type.isListLike(obj)) {
        out = [];
        shape.eachKey(obj, function(item){
            out.push(sort(item));
        });
        return out;
    }
    if( type.isMapLike(obj) ) {

        out = {};

        shape.getOwnKeys(obj).sort(comparator).forEach(function (key) {
            out[key] = sort( getSet.getKeyValue(obj, key) );
        });

        return out;
    }


    return obj;
}

function isPrimitiveConverter(Type){
    return Type === Number || Type === String || Type === Boolean;
}

var schemaReflections =  {
    /**
	 * @function can-reflect.getSchema getSchema
	 * @parent can-reflect/shape
	 * @description Returns the schema for a type or value.
	 *
	 * @signature `getSchema(valueOrType)`
	 *
     * Calls the `@can.getSchema` property on the `valueOrType` argument. If it's not available and
     * `valueOrType` has a `constructor` property, calls the `constructor[@can.getSchema]`
     * and returns the result.
     *
     * ```js
     * import canReflect from "can-reflect";
     *
     * var Type = DefineMap.extend({
     *   name: "string",
     *   id: "number"
     * });
     *
     * canReflect.getSchema( Type ) //-> {
     * //   type: "map",
     * //   keys: {
     * //     name: MaybeString
     * //     id: MaybeNumber
     * //   }
     * // }
     * ```
	 *
	 *
	 * @param  {Object|Function} valueOrType A value, constructor function, or class to get the schema from.
	 * @return {Object} A schema. A schema for a [can-reflect.isMapLike] looks like:
     *
     *
     * ```js
     * {
     *   type: "map",
     *   identity: ["id"],
     *   keys: {
     *     id: Number,
     *     name: String,
     *     complete: Boolean,
     *     owner: User
     *   }
     * }
     * ```
     *
     * A schema for a list looks like:
     *
     * ```js
     * {
     *   type: "list",
     *   values: String
     *   keys: {
     *     count: Number
     *   }
     * }
     * ```
     *
	 */
    getSchema: function(type$$1){
        if (type$$1 === undefined) {
            return undefined;
        }
        var getSchema = type$$1[getSchemaSymbol];
        if(getSchema === undefined ) {
            type$$1 = type$$1.constructor;
            getSchema = type$$1 && type$$1[getSchemaSymbol];
        }
        return getSchema !== undefined ? getSchema.call(type$$1) : undefined;
    },
    /**
	 * @function can-reflect.getIdentity getIdentity
	 * @parent can-reflect/shape
	 * @description Get a unique primitive representing an object.
	 *
	 * @signature `getIdentity( object [,schema] )`
	 *
	 * This uses the object's schema, or the provided schema to return a unique string or number that
     * represents the object.
     *
     * ```js
     * import canReflect from "can-reflect";
     *
     * canReflect.getIdentity({id: 5}, {identity: ["id"]}) //-> 5
     * ```
     *
     * If the schema has multiple identity keys, the identity keys and values
     * are return stringified (and sorted):
     *
     * ```js
     * canReflect.getIdentity(
     *   {z: "Z", a: "A", foo: "bar"},
     *   {identity: ["a","b"]}) //-> '{"a":"A","b":"B"}'
     * ```
	 *
	 * @param  {Object|Function} object A map-like object.
     * @param {Object} [schema] A schema object with an `identity` array of the unique
     * keys of the object like:
     *   ```js
     *   {identity: ["id"]}
     *   ```
	 * @return {Number|String} A value that uniquely represents the object.
	 */
    getIdentity: function(value, schema){
        schema = schema || schemaReflections.getSchema(value);
        if(schema === undefined) {
            throw new Error("can-reflect.getIdentity - Unable to find a schema for the given value.");
        }

        var identity = schema.identity;
        if(!identity || identity.length === 0) {
            throw new Error("can-reflect.getIdentity - Provided schema lacks an identity property.");
        } else if(identity.length === 1) {
            return getSet.getKeyValue(value, identity[0]);
        } else {
            var id = {};
            identity.forEach(function(key){
                id[key] = getSet.getKeyValue(value, key);
            });
            return JSON.stringify(schemaReflections.cloneKeySort(id));
        }
    },
    /**
	 * @function can-reflect.cloneKeySort cloneKeySort
	 * @parent can-reflect/shape
	 * @description Copy a value while sorting its keys.
	 *
	 * @signature `cloneKeySort(value)`
	 *
     * `cloneKeySort` returns a copy of `value` with its [can-reflect.isMapLike]
     * key values sorted. If you just want a copy of a value,
     * use [can-reflect.serialize].
     *
     * ```js
     * import canRefect from "can-reflect";
     *
     * canReflect.cloneKeySort({z: "Z", a: "A"}) //-> {a:"A",z:"Z"}
     * ```
     *
     * Nested objects are also sorted.
	 *
     * This is useful if you need to store a representation of an object that can be used as a
     * key.
	 *
	 * @param  {Object} value An object or array.
	 * @return {Object} A copy of the object with its keys sorted.
	 */
    cloneKeySort: function(obj) {
        return sort(obj);
    },
    /**
	 * @function can-reflect.convert convert
	 * @parent can-reflect/shape
	 * @description Convert one value to another type.
	 *
	 * @signature `convert(value, Type)`
	 *
     * `convert` attempts to convert `value` to the type specified by `Type`.
     *
     * ```js
     * import canRefect from "can-reflect";
     *
     * canReflect.convert("1", Number) //-> 1
     * ```
     *
     * `convert` works by performing the following logic:
     *
     * 1. If the `Type` is a primitive like `Number`, `String`, `Boolean`, the
     *    `value` will be passed to the `Type` function and the result returned.
     *    ```js
     *    return Type(value);
     *    ```
     * 2. The value will be checked if it is already an instance of the type
     *    by performing the following:
     *    1. If the `Type` has a `can.isMember` symbol value, that value will be used
     *       to determine if the `value` is already an instance.
     *    2. If the `Type` is a [can-reflect.isConstructorLike] function, `instanceof Type`
     *       will be used to check if `value` is already an instance.
     * 3. If `value` is already an instance, `value` will be returned.
     * 4. If `Type` has a `can.new` symbol, `value` will be passed to it and the result
     *    returned.
     * 5. If `Type` is a [can-reflect.isConstructorLike] function, `new Type(value)` will be
     *    called the the result returned.
     * 6. If `Type` is a regular function, `Type(value)` will be called and the result returned.
     * 7. If a value hasn't been returned, an error is thrown.
	 *
	 * @param  {Object|Primitive} value A value to be converted.
     * @param  {Object|Function} Type A constructor function or an object that implements the
     * necessary symbols.
	 * @return {Object} The `value` converted to a member of `Type`.
	 */
    convert: function(value, Type){
        if(isPrimitiveConverter(Type)) {
            return Type(value);
        }
        // check if value is already a member
        var isMemberTest = Type[isMemberSymbol],
            isMember = false,
            type$$1 = typeof Type,
            createNew = Type[newSymbol];
        if(isMemberTest !== undefined) {
            isMember = isMemberTest.call(Type, value);
        } else if(type$$1 === "function") {
            if(type.isConstructorLike(Type)) {
                isMember = (value instanceof Type);
            }
        }
        if(isMember) {
            return value;
        }
        if(createNew !== undefined) {
            return createNew.call(Type, value);
        } else if(type$$1 === "function") {
            if(type.isConstructorLike(Type)) {
                return new Type(value);
            } else {
                // call it like a normal function
                return Type(value);
            }
        } else {
            throw new Error("can-reflect: Can not convert values into type. Type must provide `can.new` symbol.");
        }
    }
};
var schema = schemaReflections;

var getNameSymbol = canSymbol_1_6_5_canSymbol.for("can.getName");

/**
 * @function {Object, String} can-reflect.setName setName
 * @parent can-reflect/shape
 * @description Set a human-readable name of an object.
 *
 * @signature `setName(obj, value)`
 *
 * ```js
 * var f = function() {};
 *
 * canReflect.setName(f, "myFunction")
 * f.name //-> "myFunction"
 * ```
 *
 * @param {Object} obj   the object to set on
 * @param {String} value the value to set for the object
 */
function setName(obj, nameGetter) {
	if (typeof nameGetter !== "function") {
		var value = nameGetter;
		nameGetter = function() {
			return value;
		};
	}

	Object.defineProperty(obj, getNameSymbol, {
		value: nameGetter
	});
}

/**
 * @function {Object} can-reflect.getName getName
 * @parent can-reflect/shape
 * @description Get the name of an object.
 *
 * @signature `getValue(obj)`
 *
 * @body
 *
 * The [@@@can.getName](can-symbol/symbols/getName.html) symbol is used to
 * provide objects human readable names; the main goal of these names is to help
 * users get a glance of what the object does and what it is used for.
 *
 * There are no hard rules to define names but CanJS uses the following convention
 * for consistent names across its observable types:
 *
 * - The name starts with the observable constructor name
 * - The constructor name is decorated with the following characters based on its type:
 *		- `<>`: for [value-like](can-reflect.isValueLike.html) observables, e.g: `SimpleObservable<>`
 *		- `[]`: for [list-like](can-reflect.isListLike.html) observables, e.g: `DefineList[]`
 *		- `{}`: for [map-like](can-reflect.isMapLike.html) observables, e.g: `DefineMap{}`
 * - Any property that makes the instance unique (like ids) are printed inside
 *    the chars mentioned before.
 *
 * The example below shows how to implement [@@@can.getName](can-symbol/symbols/getName.html),
 * in a value-like observable (similar to [can-simple-observable]).
 *
 * ```js
 * var canReflect = require("can-reflect");
 *
 * function MySimpleObservable(value) {
 *		this.value = value;
 * }
 *
 * canReflect.assignSymbols(MySimpleObservable.prototype, {
 *		"can.getName": function() {
 *			//!steal-remove-start
 *			if (process.env.NODE_ENV !== 'production') {
 *				var value = JSON.stringify(this.value);
 *				return canReflect.getName(this.constructor) + "<" + value + ">";
 *			}
 *			//!steal-remove-end
 *		}
 * });
 * ```
 *
 * With that in place, `MySimpleObservable` can be used like this:
 *
 * ```js
 * var one = new MySimpleObservable(1);
 * canReflect.getName(one); // MySimpleObservable<1>
 * ```
 *
 * @param  {Object} obj The object to get from
 * @return {String} The human-readable name of the object
 */
var anonymousID = 0;
function getName(obj) {
	var type$$1 = typeof obj;
	if(obj === null || (type$$1 !== "object" && type$$1 !== "function")) {
		return ""+obj;
	}
	var nameGetter = obj[getNameSymbol];
	if (nameGetter) {
		return nameGetter.call(obj);
	}

	if (type$$1 === "function") {
		if (!("name" in obj)) {
			// IE doesn't support function.name natively
			obj.name = "functionIE" + anonymousID++;
		}
		return obj.name;
	}

	if (obj.constructor && obj !== obj.constructor) {
		var parent = getName(obj.constructor);
		if (parent) {
			if (type.isValueLike(obj)) {
				return parent + "<>";
			}

			if (type.isMoreListLikeThanMapLike(obj)) {
				return parent + "[]";
			}

			if (type.isMapLike(obj)) {
				return parent + "{}";
			}
		}
	}

	return undefined;
}

var getName_1 = {
	setName: setName,
	getName: getName
};

function keysPolyfill() {
  var keys = [];
  var currentIndex = 0;

  this.forEach(function(val, key) { // jshint ignore:line
    keys.push(key);
  });

  return {
    next: function() {
      return {
        value: keys[currentIndex],
        done: (currentIndex++ === keys.length)
      };
    }
  };
}

if (typeof Map !== "undefined") {
  shape.assignSymbols(Map.prototype, {
    "can.getOwnEnumerableKeys": Map.prototype.keys,
    "can.setKeyValue": Map.prototype.set,
    "can.getKeyValue": Map.prototype.get,
    "can.deleteKeyValue": Map.prototype["delete"],
    "can.hasOwnKey": Map.prototype.has
  });

  if (typeof Map.prototype.keys !== "function") {
    Map.prototype.keys = Map.prototype[canSymbol_1_6_5_canSymbol.for("can.getOwnEnumerableKeys")] = keysPolyfill;
  }
}

if (typeof WeakMap !== "undefined") {
  shape.assignSymbols(WeakMap.prototype, {
    "can.getOwnEnumerableKeys": function() {
      throw new Error("can-reflect: WeakMaps do not have enumerable keys.");
    },
    "can.setKeyValue": WeakMap.prototype.set,
    "can.getKeyValue": WeakMap.prototype.get,
    "can.deleteKeyValue": WeakMap.prototype["delete"],
    "can.hasOwnKey": WeakMap.prototype.has
  });
}

if (typeof Set !== "undefined") {
  shape.assignSymbols(Set.prototype, {
    "can.isMoreListLikeThanMapLike": true,
    "can.updateValues": function(index, removing, adding) {
      if (removing !== adding) {
        shape.each(
          removing,
          function(value) {
            this.delete(value);
          },
          this
        );
      }
      shape.each(
        adding,
        function(value) {
          this.add(value);
        },
        this
      );
    },
    "can.size": function() {
      return this.size;
    }
  });

  // IE11 doesn't support Set.prototype[@@iterator]
  if (typeof Set.prototype[canSymbol_1_6_5_canSymbol.iterator] !== "function") {
	  Set.prototype[canSymbol_1_6_5_canSymbol.iterator] = function() {
		  var arr = [];
		  var currentIndex = 0;

		  this.forEach(function(val) {
			  arr.push(val);
		  });

		  return {
			  next: function() {
				  return {
					  value: arr[currentIndex],
					  done: (currentIndex++ === arr.length)
				  };
			  }
		  };
	  };
  }
}
if (typeof WeakSet !== "undefined") {
  shape.assignSymbols(WeakSet.prototype, {
    "can.isListLike": true,
    "can.isMoreListLikeThanMapLike": true,
    "can.updateValues": function(index, removing, adding) {
      if (removing !== adding) {
        shape.each(
          removing,
          function(value) {
            this.delete(value);
          },
          this
        );
      }
      shape.each(
        adding,
        function(value) {
          this.add(value);
        },
        this
      );
    },
    "can.size": function() {
      throw new Error("can-reflect: WeakSets do not have enumerable keys.");
    }
  });
}

var reflect = {};
[
	call,
	getSet,
	observe,
	shape,
	type,
	getName_1,
	schema
].forEach(function(reflections){
	for(var prop in reflections) {
		reflect[prop] = reflections[prop];
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if(typeof reflections[prop] === "function") {
				var propDescriptor = Object.getOwnPropertyDescriptor(reflections[prop], 'name');
				if (!propDescriptor || propDescriptor.writable && propDescriptor.configurable) {
					Object.defineProperty(reflections[prop],"name",{
						value: "canReflect."+prop
					});
				}
			}
		}
		//!steal-remove-end
	}
});




var canReflect_1_18_0_canReflect = canNamespace_1_0_0_canNamespace.Reflect = reflect;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var canObservationRecorder_1_3_1_canObservationRecorder = createCommonjsModule(function (module) {



// Contains stack of observation records created by pushing with `.start`
// and popping with `.stop()`.
// The top of the stack is the "target" observation record - the record that calls
// to `ObservationRecorder.add` get added to.
var stack = [];

var addParentSymbol = canSymbol_1_6_5_canSymbol.for("can.addParent"),
	getValueSymbol = canSymbol_1_6_5_canSymbol.for("can.getValue");

var ObservationRecorder = {
	stack: stack,
	start: function(name) {
		var deps = {
			keyDependencies: new Map(),
			valueDependencies: new Set(),
			childDependencies: new Set(),

			// `traps` and `ignore` are here only for performance
			// reasons. They work with `ObservationRecorder.ignore` and `ObservationRecorder.trap`.
			traps: null,
			ignore: 0,
			name: name
		};

		stack.push(deps);

		return deps;
	},
	stop: function() {
		return stack.pop();
	},

	add: function(obj, event) {
		var top = stack[stack.length - 1];
		if (top && top.ignore === 0) {

			if (top.traps) {
				top.traps.push([obj, event]);
			} else {
				// Use `=== undefined` instead of `arguments.length` for performance.
				if (event === undefined) {
					top.valueDependencies.add(obj);
				} else {
					var eventSet = top.keyDependencies.get(obj);
					if (!eventSet) {
						eventSet = new Set();
						top.keyDependencies.set(obj, eventSet);
					}
					eventSet.add(event);
				}
			}
		}
	},

	addMany: function(observes) {
		var top = stack[stack.length - 1];
		if (top) {
			if (top.traps) {
				top.traps.push.apply(top.traps, observes);
			} else {
				for (var i = 0, len = observes.length; i < len; i++) {
					this.add(observes[i][0], observes[i][1]);
				}
			}
		}
	},
	created: function(obs) {
		var top = stack[stack.length - 1];
		if (top) {
			top.childDependencies.add(obs);
			if (obs[addParentSymbol]) {
				obs[addParentSymbol](top);
			}
		}
	},
	ignore: function(fn) {
		return function() {
			if (stack.length) {
				var top = stack[stack.length - 1];
				top.ignore++;
				var res = fn.apply(this, arguments);
				top.ignore--;
				return res;
			} else {
				return fn.apply(this, arguments);
			}
		};
	},
	peekValue: function(value) {
		if(!value || !value[getValueSymbol]) {
			return value;
		}
		if (stack.length) {
			var top = stack[stack.length - 1];
			top.ignore++;
			var res = value[getValueSymbol]();
			top.ignore--;
			return res;
		} else {
			return value[getValueSymbol]();
		}
	},
	isRecording: function() {
		var len = stack.length;
		var last = len && stack[len - 1];
		return last && (last.ignore === 0) && last;
	},
	// `can-observation` uses this to do diffs more easily.
	makeDependenciesRecord: function(name) {
		return {
			traps: null,
			keyDependencies: new Map(),
			valueDependencies: new Set(),
			//childDependencies: new Set(),
			ignore: 0,
			name: name
		};
	},
	// The following are legacy methods we should do away with.
	makeDependenciesRecorder: function() {
		return ObservationRecorder.makeDependenciesRecord();
	},
	// Traps should be replace by calling `.start()` and `.stop()`.
	// To do this, we'd need a method that accepts a dependency record.
	trap: function() {
		if (stack.length) {
			var top = stack[stack.length - 1];
			var oldTraps = top.traps;
			var traps = top.traps = [];
			return function() {
				top.traps = oldTraps;
				return traps;
			};
		} else {
			return function() {
				return [];
			};
		}
	},
	trapsCount: function() {
		if (stack.length) {
			var top = stack[stack.length - 1];
			return top.traps.length;
		} else {
			return 0;
		}
	}
};

if (canNamespace_1_0_0_canNamespace.ObservationRecorder) {
	throw new Error("You can't have two versions of can-observation-recorder, check your dependencies");
} else {
	module.exports = canNamespace_1_0_0_canNamespace.ObservationRecorder = ObservationRecorder;
}
});

// # Recorder Dependency Helpers
// This exposes two helpers:
// - `updateObservations` - binds and unbinds a diff of two observation records
//   (see can-observation-recorder for details on this data type).
// - `stopObserving` - unbinds an observation record.




// ## Helpers
// The following helpers all use `this` to pass additional arguments. This
// is for performance reasons as it avoids creating new functions.

function addNewKeyDependenciesIfNotInOld(event) {
    // Expects `this` to have:
    // - `.observable` - the observable we might be binding to.
    // - `.oldEventSet` - the bound keys on the old dependency record for `observable`.
    // - `.onDependencyChange` - the handler we will call back when the key is changed.
    // If there wasn't any keys, or when we tried to delete we couldn't because the key
    // wasn't in the set, start binding.
    if(this.oldEventSet === undefined || this.oldEventSet["delete"](event) === false) {
        canReflect_1_18_0_canReflect.onKeyValue(this.observable, event, this.onDependencyChange,"notify");
    }
}

// ### addObservablesNewKeyDependenciesIfNotInOld
// For each event in the `eventSet` of new observables,
// setup a binding (or delete the key).
function addObservablesNewKeyDependenciesIfNotInOld(eventSet, observable){
    eventSet.forEach(addNewKeyDependenciesIfNotInOld, {
        onDependencyChange: this.onDependencyChange,
        observable: observable,
        oldEventSet: this.oldDependencies.keyDependencies.get(observable)
    });
}

function removeKeyDependencies(event) {
    canReflect_1_18_0_canReflect.offKeyValue(this.observable, event, this.onDependencyChange,"notify");
}

function removeObservablesKeyDependencies(oldEventSet, observable){
    oldEventSet.forEach(removeKeyDependencies, {onDependencyChange: this.onDependencyChange, observable: observable});
}

function addValueDependencies(observable) {
    // If we were unable to delete the key in the old set, setup a binding.
    if(this.oldDependencies.valueDependencies.delete(observable) === false) {
        canReflect_1_18_0_canReflect.onValue(observable, this.onDependencyChange,"notify");
    }
}
function removeValueDependencies(observable) {
    canReflect_1_18_0_canReflect.offValue(observable, this.onDependencyChange,"notify");
}


var canObservation_4_2_0_recorderDependencyHelpers = {
    // ## updateObservations
    //
    // Binds `observationData.onDependencyChange` to dependencies in `observationData.newDependencies` that are not currently in
    // `observationData.oldDependencies`.  Anything in `observationData.oldDependencies`
    // left over is unbound.
    //
    // The algorthim works by:
    // 1. Loop through the `new` dependencies, checking if an equivalent is in the `old` bindings.
    //    - If there is an equivalent binding, delete that dependency from `old`.
    //    - If there is __not__ an equivalent binding, setup a binding from that dependency to `.onDependencyChange`.
    // 2. Loop through the remaining `old` dependencies, teardown bindings.
    //
    // For performance, this method mutates the values in `.oldDependencies`.
    updateObservations: function(observationData){
        observationData.newDependencies.keyDependencies.forEach(addObservablesNewKeyDependenciesIfNotInOld, observationData);
        observationData.oldDependencies.keyDependencies.forEach(removeObservablesKeyDependencies, observationData);
        observationData.newDependencies.valueDependencies.forEach(addValueDependencies, observationData);
        observationData.oldDependencies.valueDependencies.forEach(removeValueDependencies, observationData);
    },
    stopObserving: function(observationReciever, onDependencyChange){
        observationReciever.keyDependencies.forEach(removeObservablesKeyDependencies, {onDependencyChange: onDependencyChange});
        observationReciever.valueDependencies.forEach(removeValueDependencies, {onDependencyChange: onDependencyChange});
    }
};

var warnTimeout = 5000;
var logLevel = 0;

/**
 * @module {{}} can-log log
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @hide
 *
 * Utilities for logging to the console.
 */

/**
 * @function can-log.warn warn
 * @parent can-log
 * @description
 *
 * Adds a warning message to the console.
 *
 * ```
 * var canLog = require("can-log");
 *
 * canLog.warn("something evil");
 * ```
 *
 * @signature `canLog.warn(msg)`
 * @param {String} msg the message to be logged.
 */
var warn = function() {
	var ll = this.logLevel;
	if (ll < 2) {
		if (typeof console !== "undefined" && console.warn) {
			this._logger("warn", Array.prototype.slice.call(arguments));
		} else if (typeof console !== "undefined" && console.log) {
			this._logger("log", Array.prototype.slice.call(arguments));
		}
	}
};

/**
 * @function can-log.log log
 * @parent can-log
 * @description
 * Adds a message to the console.
 * @hide
 *
 * ```
 * var canLog = require("can-log");
 *
 * canLog.log("hi");
 * ```
 *
 * @signature `canLog.log(msg)`
 * @param {String} msg the message
 */
var log = function() {
	var ll = this.logLevel;
	if (ll < 1) {
		if (typeof console !== "undefined" && console.log) {
			this._logger("log", Array.prototype.slice.call(arguments));
		}
	}
};

/**
 * @function can-log.error error
 * @parent can-log
 * @description
 * Adds an error message to the console.
 * @hide
 *
 * ```
 * var canLog = require("can-log");
 *
 * canLog.error(new Error("Oh no!"));
 * ```
 *
 * @signature `canLog.error(err)`
 * @param {String|Error} err The error to be logged.
 */
var error = function() {
	var ll = this.logLevel;
	if (ll < 1) {
		if (typeof console !== "undefined" && console.error) {
			this._logger("error", Array.prototype.slice.call(arguments));
		}
	}
};

var _logger = function (type, arr) {
	try {
		console[type].apply(console, arr);
	} catch(e) {
		console[type](arr);
	}
};

var canLog_1_0_2_canLog = {
	warnTimeout: warnTimeout,
	logLevel: logLevel,
	warn: warn,
	log: log,
	error: error,
	_logger: _logger
};

/**
 * @module {{}} can-log/dev dev
 * @parent can-log
 * @hide
 * 
 * Utilities for logging development-mode messages. Use this module for
 * anything that should be shown to the user during development but isn't
 * needed in production. In production these functions become noops.
 */
var dev = {
	warnTimeout: 5000,
	logLevel: 0,
	/**
	 * @function can-log/dev.stringify stringify
	 * @parent can-log
	 * @description
	 * @hide
	 *
	 * JSON stringifies a value, but unlike JSON, will output properties with
	 * a value of `undefined` (e.g. `{ "prop": undefined }`, not `{}`).
	 *
	 * ```
	 * var dev = require('can-log/dev');
	 * var query = { where: undefined };
	 * 
	 * dev.warn('No records found: ' + dev.stringify(query));
	 * ```
	 *
	 * @signature `dev.stringify(value)`
	 * @param {Any} value A value to stringify.
	 * @return {String} A stringified representation of the passed in value.
	 */
	stringify: function(value) {
		var flagUndefined = function flagUndefined(key, value) {
			return value === undefined ?
				 "/* void(undefined) */" : value;
		};
		
		return JSON.stringify(value, flagUndefined, "  ").replace(
			/"\/\* void\(undefined\) \*\/"/g, "undefined");
	},
	/**
	 * @function can-log/dev.warn warn
	 * @parent can-log
	 * @description
	 * @hide
	 *
	 * Adds a warning message to the console.
	 *
	 * ```
	 * var dev = require('can-log/dev');
	 * 
	 * dev.warn("something evil");
	 * ```
	 *
	 * @signature `dev.warn(msg)`
	 * @param {String} msg The warning message.
	 */
	warn: function() {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canLog_1_0_2_canLog.warn.apply(this, arguments);
		}
		//!steal-remove-end
	},
	/**
	 * @function can-log/dev.log log
	 * @parent can-log
	 * @description
	 * @hide
	 *
	 * Adds a message to the console.
	 *
	 * ```
	 * var dev = require('can-log/dev');
	 * 
	 * dev.log("hi");
	 * ```
	 *
	 * @signature `dev.log(msg)`
	 * @param {String} msg The message.
	 */
	log: function() {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canLog_1_0_2_canLog.log.apply(this, arguments);
		}
		//!steal-remove-end
	},
	/**
	 * @function can-log/dev.error error
	 * @parent can-log
	 * @description
	 * @hide
	 *
	 * Adds an error message to the console.
	 *
	 * ```
	 * var dev = require("can-log/dev");
	 * 
	 * dev.error(new Error("Oh no!"));
	 * ```
	 *
	 * @signature `dev.error(err)`
	 * @param {String|Error} err The error to be logged.
	 */
	error: function() {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canLog_1_0_2_canLog.error.apply(this, arguments);
		}
		//!steal-remove-end
	},
	_logger: canLog_1_0_2_canLog._logger
};

var canQueues_1_3_1_queueState = {
	lastTask: null
};

/**
 * @module {function} can-assign can-assign
 * @parent can-js-utilities
 * @collection can-infrastructure
 * @signature `assign(target, source)`
 * @package ./package.json
 *
 * A simplified version of [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign), which only accepts a single source argument.
 *
 * ```js
 * var assign = require("can-assign");
 *
 * var obj = {};
 *
 * assign(obj, {
 *   foo: "bar"
 * });
 *
 * console.log(obj.foo); // -> "bar"
 * ```
 *
 * @param {Object} target The destination object. This object's properties will be mutated based on the object provided as `source`.
 * @param {Object} source The source object whose own properties will be applied to `target`.
 *
 * @return {Object} Returns the `target` argument.
 */

var canAssign_1_3_3_canAssign = canNamespace_1_0_0_canNamespace.assign = function (d, s) {
	for (var prop in s) {
		var desc = Object.getOwnPropertyDescriptor(d,prop);
		if(!desc || desc.writable !== false){
			d[prop] = s[prop];
		}
	}
	return d;
};

function noOperation () {}

var Queue = function ( name, callbacks ) {
	this.callbacks = canAssign_1_3_3_canAssign( {
		onFirstTask: noOperation,
		// The default behavior is to clear the lastTask state.
		// This is overwritten by `can-queues.js`.
		onComplete: function () {
			canQueues_1_3_1_queueState.lastTask = null;
		}
	}, callbacks || {});
	this.name = name;
	this.index = 0;
	this.tasks = [];
	this._log = false;
};

Queue.prototype.constructor = Queue;

Queue.noop = noOperation;

Queue.prototype.enqueue = function ( fn, context, args, meta ) {
	var len = this.tasks.push({
		fn: fn,
		context: context,
		args: args,
		meta: meta || {}
	});
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		this._logEnqueue( this.tasks[len - 1] );
	}
	//!steal-remove-end

	if ( len === 1 ) {
		this.callbacks.onFirstTask( this );
	}
};

Queue.prototype.flush = function () {
	while ( this.index < this.tasks.length ) {
		var task = this.tasks[this.index++];
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}

		//!steal-remove-end
		task.fn.apply( task.context, task.args );
	}
	this.index = 0;
	this.tasks = [];
	this.callbacks.onComplete( this );
};

Queue.prototype.log = function () {
	this._log = arguments.length ? arguments[0] : true;
};

//The following are removed in production.
//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	Queue.prototype._logEnqueue = function ( task ) {
		// For debugging, set the parentTask to the last
		// run task.
		task.meta.parentTask = canQueues_1_3_1_queueState.lastTask;
		// Also let the task know which stack it was run within.
		task.meta.stack = this;

		if ( this._log === true || this._log === "enqueue" ) {
			var log = task.meta.log ? task.meta.log.concat( task ) : [task.fn.name, task];
			dev.log.apply( dev, [this.name + " enqueuing:"].concat( log ));
		}
	};
	// `_logFlush` MUST be called by all queues prior to flushing in
	// development.
	Queue.prototype._logFlush = function ( task ) {
		if ( this._log === true || this._log === "flush" ) {
			var log = task.meta.log ? task.meta.log.concat( task ) : [task.fn.name, task];
			dev.log.apply( dev, [this.name + " running  :"].concat( log ));
		}
		// Update the state to mark this as the task that was run last.
		canQueues_1_3_1_queueState.lastTask = task;
	};
}
//!steal-remove-end

var canQueues_1_3_1_queue = Queue;

var PriorityQueue = function () {
	canQueues_1_3_1_queue.apply( this, arguments );
	// A map of a task's function to the task for that function.
	// This is so we can prevent duplicate functions from being enqueued
	// and so `flushQueuedTask` can find the task and run it.
	this.taskMap = new Map();
	// An "array-of-arrays"-ish data structure that stores
	// each task organized by its priority.  Each object in this list
	// looks like `{tasks: [...], index: 0}` where:
	// - `tasks` - the tasks for a particular priority.
	// - `index` - the index of the task waiting to be prioritized.
	this.taskContainersByPriority = [];

	// The index within `taskContainersByPriority` of the first `taskContainer`
	// which has tasks that have not been run.
	this.curPriorityIndex = Infinity;
	// The index within `taskContainersByPriority` of the last `taskContainer`
	// which has tasks that have not been run.
	this.curPriorityMax = 0;

	this.isFlushing = false;

	// Manage the number of tasks remaining to keep
	// this lookup fast.
	this.tasksRemaining = 0;
};
PriorityQueue.prototype = Object.create( canQueues_1_3_1_queue.prototype );
PriorityQueue.prototype.constructor = PriorityQueue;

PriorityQueue.prototype.enqueue = function ( fn, context, args, meta ) {
	// Only allow the enqueing of a given function once.
	if ( !this.taskMap.has( fn ) ) {

		this.tasksRemaining++;

		var isFirst = this.taskContainersByPriority.length === 0;

		var task = {
			fn: fn,
			context: context,
			args: args,
			meta: meta || {}
		};

		var taskContainer = this.getTaskContainerAndUpdateRange( task );
		taskContainer.tasks.push( task );
		this.taskMap.set( fn, task );

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logEnqueue( task );
		}
		//!steal-remove-end

		if ( isFirst ) {
			this.callbacks.onFirstTask( this );
		}
	}
};

// Given a task, updates the queue's cursors so that `flush`
// will be able to run the task.
PriorityQueue.prototype.getTaskContainerAndUpdateRange = function ( task ) {
	var priority = task.meta.priority || 0;

	if ( priority < this.curPriorityIndex ) {
		this.curPriorityIndex = priority;
	}

	if ( priority > this.curPriorityMax ) {
		this.curPriorityMax = priority;
	}

	var tcByPriority = this.taskContainersByPriority;
	var taskContainer = tcByPriority[priority];
	if ( !taskContainer ) {
		taskContainer = tcByPriority[priority] = {tasks: [], index: 0};
	}
	return taskContainer;
};

PriorityQueue.prototype.flush = function () {
	// Only allow one task to run at a time.
	if ( this.isFlushing ) {
		return;
	}
	this.isFlushing = true;
	while ( true ) {
		// If the first prioritized taskContainer with tasks remaining
		// is before the last prioritized taskContainer ...
		if ( this.curPriorityIndex <= this.curPriorityMax ) {
			var taskContainer = this.taskContainersByPriority[this.curPriorityIndex];

			// If that task container actually has tasks remaining ...
			if ( taskContainer && ( taskContainer.tasks.length > taskContainer.index ) ) {

				// Run the task.
				var task = taskContainer.tasks[taskContainer.index++];
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					this._logFlush( task );
				}
				//!steal-remove-end
				this.tasksRemaining--;
				this.taskMap["delete"]( task.fn );
				task.fn.apply( task.context, task.args );

			} else {
				// Otherwise, move to the next taskContainer.
				this.curPriorityIndex++;
			}
		} else {
			// Otherwise, reset the state for the next `.flush()`.
			this.taskMap = new Map();
			this.curPriorityIndex = Infinity;
			this.curPriorityMax = 0;
			this.taskContainersByPriority = [];
			this.isFlushing = false;
			this.callbacks.onComplete( this );
			return;
		}
	}
};

PriorityQueue.prototype.isEnqueued = function ( fn ) {
	return this.taskMap.has( fn );
};

PriorityQueue.prototype.flushQueuedTask = function ( fn ) {
	var task = this.dequeue(fn);
	if(task) {
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}
		//!steal-remove-end
		task.fn.apply( task.context, task.args );
	}
};
PriorityQueue.prototype.dequeue = function(fn){
	var task = this.taskMap.get( fn );
	if ( task ) {
		var priority = task.meta.priority || 0;
		var taskContainer = this.taskContainersByPriority[priority];
		var index = taskContainer.tasks.indexOf( task, taskContainer.index );

		if ( index >= 0 ) {
			taskContainer.tasks.splice( index, 1 );
			this.tasksRemaining--;
			this.taskMap["delete"]( task.fn );
			return task;
		} else {
			console.warn("Task", fn, "has already run");
		}
	}
};

PriorityQueue.prototype.tasksRemainingCount = function () {
	return this.tasksRemaining;
};

var canQueues_1_3_1_priorityQueue = PriorityQueue;

// This queue does not allow another task to run until this one is complete
var CompletionQueue = function () {
	canQueues_1_3_1_queue.apply( this, arguments );
	this.flushCount = 0;
};
CompletionQueue.prototype = Object.create( canQueues_1_3_1_queue.prototype );
CompletionQueue.prototype.constructor = CompletionQueue;

CompletionQueue.prototype.flush = function () {
	if ( this.flushCount === 0 ) {
		this.flushCount ++;
		while ( this.index < this.tasks.length ) {
			var task = this.tasks[this.index++];
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				this._logFlush( task );
			}
			//!steal-remove-end
			task.fn.apply( task.context, task.args );
		}
		this.index = 0;
		this.tasks = [];
		this.flushCount--;
		this.callbacks.onComplete( this );
	}
};

var canQueues_1_3_1_completionQueue = CompletionQueue;

var canQueues_1_3_1_sortedIndexBy = function(compare, array, value) {
	if (!array || !array.length) {
		return undefined;
	}
	// check the start and the end
	if (compare(value, array[0]) === -1) {
		return 0;
	} else if (compare(value, array[array.length - 1]) === 1) {
		return array.length;
	}
	var low = 0,
		high = array.length;

	// From lodash lodash 4.6.1 <https://lodash.com/>
	// Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	while (low < high) {
		var mid = (low + high) >>> 1,
			item = array[mid],
			computed = compare(value, item);
		if (computed === -1) {
			high = mid;
		} else {
			low = mid + 1;
		}
	}
	return high;
	// bisect by calling sortFunc
};

// Taken from jQuery
var hasDuplicate,
	sortInput,
	sortStable = true,
	indexOf = Array.prototype.indexOf;

function sortOrder( a, b ) {

	// Flag for duplicate removal
	if ( a === b ) {
		hasDuplicate = true;
		return 0;
	}

	// Sort on method existence if only one input has compareDocumentPosition
	var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
	if ( compare ) {
		return compare;
	}

	// Calculate position if both inputs belong to the same document
	compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
		a.compareDocumentPosition( b ) :

		// Otherwise we know they are disconnected
		1;

	// Disconnected nodes
	if ( compare & 1 ) {

		// Choose the first element that is related to our preferred document
		if ( a === document || a.ownerDocument === document &&
			document.documentElement.contains(a) ) {
			return -1;
		}
		if ( b === document || b.ownerDocument === document &&
			document.documentElement.contains(b) ) {
			return 1;
		}

		// Maintain original order
		return sortInput ?
			( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
			0;
	}

	return compare & 4 ? -1 : 1;
}

function uniqueSort( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	hasDuplicate = false;
	sortInput = !sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
}

var canQueues_1_3_1_elementSort = {
	uniqueSort: uniqueSort,
	sortOrder: sortOrder
};

var canElementSymbol = canSymbol_1_6_5_canSymbol.for("can.element");

// TODO: call sortable queue and take how it should be sorted ...
function sortTasks(taskA, taskB){
	// taskA - in the document?
	// taskA - given a number?
	//
	return canQueues_1_3_1_elementSort.sortOrder(taskA.meta.element, taskB.meta.element);
}

var DomOrderQueue = function () {
	canQueues_1_3_1_queue.apply( this, arguments );
	// A map of a task's function to the task for that function.
	// This is so we can prevent duplicate functions from being enqueued
	// and so `flushQueuedTask` can find the task and run it.
	this.taskMap = new Map();

	this.unsortable = [];
	this.isFlushing = false;
};
DomOrderQueue.prototype = Object.create( canQueues_1_3_1_queue.prototype );
DomOrderQueue.prototype.constructor = DomOrderQueue;

DomOrderQueue.prototype.enqueue = function ( fn, context, args, meta ) {
	var task;
	// Only allow the enqueing of a given function once.
	if ( !this.taskMap.has( fn ) ) {

		if(!meta) {
			meta = {};
		}
		if(!meta.element) {
			meta.element = fn[canElementSymbol];
		}

		task = {
			fn: fn,
			context: context,
			args: args,
			meta: meta
		};

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if( !meta.element ) {
				throw new Error("DomOrderQueue tasks must be created with a meta.element.");
			}
		}
		//!steal-remove-end

		this.taskMap.set( fn, task );

		var index = canQueues_1_3_1_sortedIndexBy(sortTasks, this.tasks, task);

		this.tasks.splice(index, 0, task);

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logEnqueue( task );
		}
		//!steal-remove-end

		if ( this.tasks.length === 1 ) {
			this.callbacks.onFirstTask( this );
		}
	} else {
		// update the task with the new data
		// TODO: ideally this would key off the mutation instead of the function.
		// We could make it key off the element and function,  not just function.
		task = this.taskMap.get( fn );
		task.context = context;
		task.args = args;

		if(!meta) {
			meta = {};
		}

		if(!meta.element) {
			meta.element = fn[canElementSymbol];
		}

		task.meta = meta;
	}
};


DomOrderQueue.prototype.flush = function () {
	// Only allow one task to run at a time.
	if ( this.isFlushing ) {
		return;
	}
	this.isFlushing = true;

	while ( this.tasks.length ) {
		var task = this.tasks.shift();
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}
		//!steal-remove-end
		this.taskMap["delete"]( task.fn );
		task.fn.apply( task.context, task.args );
	}
	this.isFlushing = false;
	this.callbacks.onComplete( this );
};

DomOrderQueue.prototype.isEnqueued = function ( fn ) {
	return this.taskMap.has( fn );
};

DomOrderQueue.prototype.flushQueuedTask = function ( fn ) {
	var task = this.dequeue(fn);
	if(task) {
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			this._logFlush( task );
		}
		//!steal-remove-end
		task.fn.apply( task.context, task.args );
	}
};
DomOrderQueue.prototype.dequeue = function(fn){
	var task = this.taskMap.get( fn );
	if ( task ) {

		var index = this.tasks.indexOf(task);

		if ( index >= 0 ) {
			this.tasks.splice( index, 1 );
			this.taskMap["delete"]( task.fn );
			return task;
		} else {
			console.warn("Task", fn, "has already run");
		}
	}
};

DomOrderQueue.prototype.tasksRemainingCount = function () {
	return this.tasks.length;
};

var canQueues_1_3_1_domOrderQueue = DomOrderQueue;

var canQueues_1_3_1_canQueues = createCommonjsModule(function (module) {








// How many `batch.start` - `batch.stop` calls have been made.
var batchStartCounter = 0;
// If a task was added since the last flush caused by `batch.stop`.
var addedTask = false;

// Legacy values for the old batchNum.
var batchNum = 0;
var batchData;

// Used by `.enqueueByQueue` to know the property names that might be passed.
var queueNames = ["notify", "derive", "domUI", "dom","mutate"];
// Create all the queues so that when one is complete,
// the next queue is flushed.
var NOTIFY_QUEUE,
	DERIVE_QUEUE,
	DOM_UI_QUEUE,
	DOM_QUEUE,
	MUTATE_QUEUE;

// This is for immediate notification. This is where we teardown (remove childNodes)
// immediately.
NOTIFY_QUEUE = new canQueues_1_3_1_queue( "NOTIFY", {
	onComplete: function () {
		DERIVE_QUEUE.flush();
	},
	onFirstTask: function () {
		// Flush right away if we aren't in a batch.
		if ( !batchStartCounter ) {
			NOTIFY_QUEUE.flush();
		} else {
			addedTask = true;
		}
	}
});

// For observations not connected to the DOM
DERIVE_QUEUE = new canQueues_1_3_1_priorityQueue( "DERIVE", {
	onComplete: function () {
		DOM_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// DOM_DERIVE comes next so that any prior derives have a chance
// to settle before the derives that actually affect the DOM
// are re-caculated.
// See the `Child bindings are called before the parent` can-stache test.
// All stache-related observables should update in DOM order.

// Observations that are given an element update their value here.
DOM_QUEUE = new canQueues_1_3_1_domOrderQueue( "DOM   " ,{
	onComplete: function () {
		DOM_UI_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// The old DOM_UI queue ... we should seek to remove this.
DOM_UI_QUEUE = new canQueues_1_3_1_completionQueue( "DOM_UI", {
	onComplete: function () {
		MUTATE_QUEUE.flush();
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

// Update
MUTATE_QUEUE = new canQueues_1_3_1_queue( "MUTATE", {
	onComplete: function () {
		canQueues_1_3_1_queueState.lastTask = null;
	},
	onFirstTask: function () {
		addedTask = true;
	}
});

var queues = {
	Queue: canQueues_1_3_1_queue,
	PriorityQueue: canQueues_1_3_1_priorityQueue,
	CompletionQueue: canQueues_1_3_1_completionQueue,
	DomOrderQueue: canQueues_1_3_1_domOrderQueue,
	notifyQueue: NOTIFY_QUEUE,
	deriveQueue: DERIVE_QUEUE,
	domQueue: DOM_QUEUE,
	domUIQueue: DOM_UI_QUEUE,
	mutateQueue: MUTATE_QUEUE,
	batch: {
		start: function () {
			batchStartCounter++;
			if ( batchStartCounter === 1 ) {
				batchNum++;
				batchData = {number: batchNum};
			}
		},
		stop: function () {
			batchStartCounter--;
			if ( batchStartCounter === 0 ) {
				if ( addedTask ) {
					addedTask = false;
					NOTIFY_QUEUE.flush();
				}
			}
		},
		// Legacy method to return if we are between start and stop calls.
		isCollecting: function () {
			return batchStartCounter > 0;
		},
		// Legacy method provide a number for each batch.
		number: function () {
			return batchNum;
		},
		// Legacy method to provide batch information.
		data: function () {
			return batchData;
		}
	},
	runAsTask: function(fn, reasonLog){
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			return function(){
				canQueues_1_3_1_queueState.lastTask = {
					fn: fn,
					context: this,
					args: arguments,
					meta: {
						reasonLog: typeof reasonLog === "function" ? reasonLog.apply(this, arguments): reasonLog,
						parentTask: canQueues_1_3_1_queueState.lastTask,
						stack: {name: "RUN_AS"}
					}
				};
				var ret = fn.apply(this, arguments);
				canQueues_1_3_1_queueState.lastTask = canQueues_1_3_1_queueState.lastTask && canQueues_1_3_1_queueState.lastTask.meta.parentTask;
				return ret;
			};
		}
		//!steal-remove-end
		return fn;
	},
	enqueueByQueue: function enqueueByQueue ( fnByQueue, context, args, makeMeta, reasonLog ) {
		if ( fnByQueue ) {
			queues.batch.start();
			// For each queue, check if there are tasks for it.
			queueNames.forEach( function ( queueName ) {
				var name = queueName + "Queue";
				var QUEUE = queues[name];
				var tasks = fnByQueue[queueName];
				if ( tasks !== undefined ) {
					// For each task function, setup the meta and enqueue it.
					tasks.forEach( function ( fn ) {
						var meta = makeMeta != null ? makeMeta( fn, context, args ) : {};
						meta.reasonLog = reasonLog;
						QUEUE.enqueue( fn, context, args, meta );
					});
				}
			});
			queues.batch.stop();
		}
	},
	lastTask: function(){
		return canQueues_1_3_1_queueState.lastTask;
	},
	// Currently an internal method that provides the task stack.
	// Returns an array with the first task as the first item.
	stack: function (task) {
		var current = task || canQueues_1_3_1_queueState.lastTask;
		var stack = [];
		while ( current ) {
			stack.unshift( current );
			// Queue.prototype._logEnqueue ensures
			// that the `parentTask` is always set.
			current = current.meta.parentTask;
		}
		return stack;
	},
	logStack: function (task) {
		var stack = this.stack(task);
		stack.forEach( function ( task, i ) {
			var meta = task.meta;
			if( i === 0 && meta && meta.reasonLog) {
				dev.log.apply( dev, meta.reasonLog);
			}
			var log = meta && meta.log ? meta.log : [task.fn.name, task];
			dev.log.apply( dev, [task.meta.stack.name + " ran task:"].concat( log ));
		});
	},
	// A method that is not used.  It should return the number of tasks
	// remaining, but doesn't seem to actually work.
	taskCount: function () {
		return NOTIFY_QUEUE.tasks.length + DERIVE_QUEUE.tasks.length + DOM_UI_QUEUE.tasks.length + MUTATE_QUEUE.tasks.length;
	},
	// A shortcut for flushign the notify queue.  `batch.start` and `batch.stop` should be
	// used instead.
	flush: function () {
		NOTIFY_QUEUE.flush();
	},
	log: function () {
		NOTIFY_QUEUE.log.apply( NOTIFY_QUEUE, arguments );
		DERIVE_QUEUE.log.apply( DERIVE_QUEUE, arguments );
		DOM_UI_QUEUE.log.apply( DOM_UI_QUEUE, arguments );
		DOM_QUEUE.log.apply( DOM_QUEUE, arguments );
		MUTATE_QUEUE.log.apply( MUTATE_QUEUE, arguments );
	}
};

if ( canNamespace_1_0_0_canNamespace.queues ) {
	throw new Error( "You can't have two versions of can-queues, check your dependencies" );
} else {
	module.exports = canNamespace_1_0_0_canNamespace.queues = queues;
}
});

canObservationRecorder_1_3_1_canObservationRecorder.resume = function resume(deps) {
	canObservationRecorder_1_3_1_canObservationRecorder.stack.push(deps);
};

let ORDER;
let weLeftSomethingOnTheStack = false;

class Observer {
	constructor(onUpdate) {
		this.newDependencies = canObservationRecorder_1_3_1_canObservationRecorder.makeDependenciesRecorder();
		this.oldDependencies = null;
		this.onUpdate = onUpdate;

		this.onDependencyChange = (newVal, oldVal) => {
			this.dependencyChange(newVal, oldVal);
		};
	}

	startRecording() {
		if (weLeftSomethingOnTheStack) {
			const deps = canObservationRecorder_1_3_1_canObservationRecorder.stop();
			weLeftSomethingOnTheStack = false;

			if (!deps.ylem) {
				throw new Error('If you see this error with another error, clearing that should solve this. If you see ' + 'this error alone, please open an issue at https://github.com/canjs/react-to-can-webcomponent/issues');
			}
		}

		this.oldDependencies = this.newDependencies;
		this.nextDependencies = canObservationRecorder_1_3_1_canObservationRecorder.start();
		this.nextDependencies.ylem = true;
		weLeftSomethingOnTheStack = true;

		if (this.order !== undefined) {
			ORDER = this.order;
		} else if (ORDER !== undefined) {
			this.order = ORDER;
			ORDER += 1;
		} else {
			// the root component
			ORDER = 0;
			this.order = ORDER;
		}
	}

	stopRecording() {
		if (weLeftSomethingOnTheStack) {
			const deps = canObservationRecorder_1_3_1_canObservationRecorder.stop();
			weLeftSomethingOnTheStack = false;

			if (!deps.ylem) {
				throw new Error('If you see this error with another error, clearing that should solve this. If you see ' + 'this error alone, please open an issue at https://github.com/canjs/react-to-can-webcomponent/issues');
			}
		}

		this.newDependencies = this.nextDependencies;
		canObservation_4_2_0_recorderDependencyHelpers.updateObservations(this);
	}

	dependencyChange() {
		canQueues_1_3_1_canQueues.deriveQueue.enqueue(this.onUpdate, this, [], {
			priority: this.order
		});
	}

	teardown() {
		canObservation_4_2_0_recorderDependencyHelpers.stopObserving(this.newDependencies, this.onDependencyChange);
		canQueues_1_3_1_canQueues.deriveQueue.dequeue(this.onUpdate);
	}

	// eslint-disable-next-line class-methods-use-this
	ignore(fn) {
		return canObservationRecorder_1_3_1_canObservationRecorder.ignore(fn)();
	}
}

if (process.env.NODE_ENV !== 'production') {
	canReflect_1_18_0_canReflect.assignSymbols(Observer.prototype, {
		'can.getName': function getName() {
			return `${canReflect_1_18_0_canReflect.getName(this.constructor)}<${canReflect_1_18_0_canReflect.getName(this.onUpdate)}>`;
		}
	});
}

// Unlike the ylem version, this hook is passed a 
//   React instance so it can be used seamlessly
//   by Preact et al.
function useObserver(React) {
	const { useEffect, useLayoutEffect, useState, useRef } = React;

	const [, update] = useState();

	const observer = useRef(new Observer(() => update({})));

	observer.current.startRecording();
	useLayoutEffect(() => {
		observer.current.stopRecording();
	});

	// eslint-disable-next-line arrow-body-style
	useEffect(() => {
		return () => {
			observer.current.teardown();
			observer.current = null;
		};
	}, []);
}

// TODO if ylem hooks branch is ever released, import use-observer from ylem instead.
var reactComponentSymbol = Symbol.for("r2wc.reactComponent");
var renderSymbol = Symbol.for("r2wc.reactRender");
var shouldRenderSymbol = Symbol.for("r2wc.shouldRender");
var rootSymbol = Symbol.for("r2wc.root");

var define = {
	// Creates a getter/setter that re-renders everytime a property is set.
	expando: function (receiver, key, value) {
		Object.defineProperty(receiver, key, {
			enumerable: true,
			get: function () {
				return value;
			},
			set: function (newValue) {
				value = newValue;
				this[renderSymbol]();
				return true;
			}
		});
		receiver[renderSymbol]();
	}
};

function reactToCanWebcomponent_1_0_2_reactToCanWebcomponent (ReactComponent, React, ReactDOM) {
	var renderAddedProperties = { isConnected: "isConnected" in HTMLElement.prototype };
	var rendering = false;
	// Create the web component "class"
	var WebComponent = function () {
		var self = Reflect.construct(HTMLElement, arguments, this.constructor);
		return self;
	};

	// Make the class extend HTMLElement
	var targetPrototype = Object.create(HTMLElement.prototype);
	targetPrototype.constructor = WebComponent;

	var ObservedComponent = function (props) {
		useObserver(React);
		return React.createElement(ReactComponent, props);
	};

	// But have that prototype be wrapped in a proxy.
	var proxyPrototype = new Proxy(targetPrototype, {
		has: function (target, key) {
			return key in ReactComponent.propTypes || key in targetPrototype;
		},

		// when any undefined property is set, create a getter/setter that re-renders
		set: function (target, key, value, receiver) {
			if (rendering) {
				renderAddedProperties[key] = true;
			}

			if (typeof key === "symbol" || renderAddedProperties[key] || key in target) {
				return Reflect.set(target, key, value, receiver);
			} else {
				define.expando(receiver, key, value);
			}
			return true;
		},
		// makes sure the property looks writable
		getOwnPropertyDescriptor: function (target, key) {
			var own = Reflect.getOwnPropertyDescriptor(target, key);
			if (own) {
				return own;
			}
			if (key in ReactComponent.propTypes) {
				return { configurable: true, enumerable: true, writable: true, value: undefined };
			}
		}
	});
	WebComponent.prototype = proxyPrototype;

	// Setup lifecycle methods
	targetPrototype.connectedCallback = function () {
		// Once connected, it will keep updating the innerHTML.
		// We could add a render method to allow this as well.
		this[shouldRenderSymbol] = true;
		this[renderSymbol]();
	};
	targetPrototype.disconnectedCallback = function () {
		this[shouldRenderSymbol] = false;
	};

	targetPrototype[renderSymbol] = function () {
		if (this[shouldRenderSymbol] === true) {
			var data = {};
			Object.keys(this).forEach(function (key) {
				if (renderAddedProperties[key] !== false) {
					data[key] = this[key];
				}
			}, this);
			rendering = true;
			var element = React.createElement(ObservedComponent, data);

			if ("createRoot" in ReactDOM) {
				this[reactComponentSymbol] = (this[rootSymbol] || (this[rootSymbol] = ReactDOM.createRoot(this))).render(element);
			} else if ("render" in ReactDOM) {
				this[reactComponentSymbol] = ReactDOM.render(element, this);
			}
			rendering = false;
		}
	};

	// Handle attributes changing
	if (ReactComponent.propTypes) {
		WebComponent.observedAttributes = Object.keys(ReactComponent.propTypes);
		targetPrototype.attributeChangedCallback = function (name, oldValue, newValue) {
			// TODO: handle type conversion
			this[name] = newValue;
		};
	}

	return WebComponent;
}

export default reactToCanWebcomponent_1_0_2_reactToCanWebcomponent;
