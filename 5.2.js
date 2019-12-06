"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var fs = require("fs");
var ParameterMode;
(function (ParameterMode) {
    ParameterMode[ParameterMode["POSITION"] = 0] = "POSITION";
    ParameterMode[ParameterMode["IMMEDIATE"] = 1] = "IMMEDIATE";
})(ParameterMode || (ParameterMode = {}));
var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["ADD"] = 1] = "ADD";
    OperatorType[OperatorType["MULTIPLY"] = 2] = "MULTIPLY";
    OperatorType[OperatorType["INPUT"] = 3] = "INPUT";
    OperatorType[OperatorType["OUTPUT"] = 4] = "OUTPUT";
    OperatorType[OperatorType["JIT"] = 5] = "JIT";
    OperatorType[OperatorType["JIF"] = 6] = "JIF";
    OperatorType[OperatorType["LT"] = 7] = "LT";
    OperatorType[OperatorType["EQ"] = 8] = "EQ";
    OperatorType[OperatorType["HALT"] = 99] = "HALT";
})(OperatorType || (OperatorType = {}));
var read = function (value, mode, state) {
    if (mode === ParameterMode.IMMEDIATE) {
        return value;
    }
    else if (mode === ParameterMode.POSITION) {
        return state[value];
    }
    else {
        console.error('uh oh', value);
    }
};
var add = function (state, parameterModes, x, y, z) {
    var x1 = read(x, parameterModes[0], state);
    var y1 = read(y, parameterModes[1], state);
    state[z] = x1 + y1;
    return state;
};
var multiply = function (state, parameterModes, x, y, z) {
    var x1 = read(x, parameterModes[0], state);
    var y1 = read(y, parameterModes[1], state);
    state[z] = x1 * y1;
    return state;
};
var ioIn = function (state, addr) {
    var val = 5; // INPUT VALUE
    state[addr] = val;
    //console.log(`INPUT: [${addr}]:${val}`);
    return state;
};
var ioOut = function (state, mode, x) {
    var val = read(x, mode, state);
    console.log("OUTPUT: " + val);
    return state;
};
var jumpIfTrue = function (state, modes, x, y, position) {
    var x1 = read(x, modes[0], state);
    if (x1 === 0) {
        return position;
    }
    var x2 = read(y, modes[1], state);
    return x2;
};
var jumpIfFalse = function (state, modes, x, y, position) {
    var x1 = read(x, modes[0], state);
    if (x1 !== 0) {
        return position;
    }
    var y1 = read(y, modes[1], state);
    return y1;
};
var lessThan = function (state, modes, x, y, z) {
    var x1 = read(x, modes[0], state);
    var y1 = read(y, modes[1], state);
    state[z] = x1 < y1 ? 1 : 0;
    return state;
};
var equal = function (state, modes, x, y, z) {
    var x1 = read(x, modes[0], state);
    var y1 = read(y, modes[1], state);
    state[z] = x1 === y1 ? 1 : 0;
    return state;
};
var process = function (state, position) {
    var _a = decodeOperator(state[position]), parameterModes = _a.parameterModes, operator = __rest(_a, ["parameterModes"]);
    //console.log(`PROCESSING: ${operator.op}@${position}`);
    if (operator.op === OperatorType.HALT) {
        return state;
    }
    var params = state.slice(position, position + operator.numParameters + 1);
    var nextPosition = position + operator.numParameters + 1;
    if (operator.op === OperatorType.ADD) {
        return process(add(state, parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    else if (operator.op === OperatorType.MULTIPLY) {
        return process(multiply(state, parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    else if (operator.op === OperatorType.INPUT) {
        return process(ioIn(state, state[position + 1]), nextPosition);
    }
    else if (operator.op === OperatorType.OUTPUT) {
        return process(ioOut(state, parameterModes[0], state[position + 1]), nextPosition);
    }
    else if (operator.op === OperatorType.JIT) {
        return process(state, jumpIfTrue(state, parameterModes, state[position + 1], state[position + 2], nextPosition));
    }
    else if (operator.op === OperatorType.JIF) {
        return process(state, jumpIfFalse(state, parameterModes, state[position + 1], state[position + 2], nextPosition));
    }
    else if (operator.op === OperatorType.LT) {
        return process(lessThan(state, parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    else if (operator.op === OperatorType.EQ) {
        return process(equal(state, parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    {
        console.error("Unrecognized op: " + operator.op + " @ " + position);
        return state;
    }
};
var decodeOperator = function (code) {
    if (code === OperatorType.HALT) {
        return {
            op: OperatorType.HALT,
            numParameters: 0,
            parameterModes: []
        };
    }
    var split = code.toString().split('').map(function (e) { return parseInt(e); }).reverse();
    var on = 0;
    var op;
    var numParameters;
    var parameterModes;
    while (on < split.length) {
        var num = split[on];
        if (on === 0) {
            op = num;
            if (op === OperatorType.ADD || op === OperatorType.MULTIPLY) {
                numParameters = 3;
            }
            else if (op === OperatorType.INPUT || op === OperatorType.OUTPUT) {
                numParameters = 1;
            }
            else if (op === OperatorType.JIF || op === OperatorType.JIT) {
                numParameters = 2;
            }
            else if (op === OperatorType.LT || op === OperatorType.EQ) {
                numParameters = 3;
            }
            else {
                numParameters = 0;
            }
            parameterModes = new Array(numParameters).fill(ParameterMode.POSITION);
        }
        else if (on > 1) {
            parameterModes[on - 2] = num;
        }
        on++;
    }
    return {
        op: op,
        numParameters: numParameters,
        parameterModes: parameterModes
    };
};
var parseIntCodes = function (input) {
    return input.split(",").map(function (el) { return parseInt(el); });
};
var input = fs.readFileSync('5.2.txt').toString();
var initialState = parseIntCodes(input);
process(initialState, 0);
