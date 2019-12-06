"use strict";
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
    var val = 1; // INPUT VALUE
    state[addr] = val;
    //console.log(`INPUT: [${addr}]:${val}`);
    return state;
};
var ioOut = function (state, mode, x) {
    var val = read(x, mode, state);
    console.log("OUTPUT: " + val);
    return state;
};
var process = function (state, position) {
    var operator = decodeOperator(state[position]);
    //console.log(`PROCESSING: ${operator.op}@${position}`);
    if (operator.op === OperatorType.HALT) {
        return state;
    }
    var params = state.slice(position, position + operator.numParameters + 1);
    var nextPosition = position + operator.numParameters + 1;
    if (operator.op === OperatorType.ADD) {
        return process(add(state, operator.parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    else if (operator.op === OperatorType.MULTIPLY) {
        return process(multiply(state, operator.parameterModes, state[position + 1], state[position + 2], state[position + 3]), nextPosition);
    }
    else if (operator.op === OperatorType.INPUT) {
        return process(ioIn(state, state[position + 1]), nextPosition);
    }
    else if (operator.op == OperatorType.OUTPUT) {
        return process(ioOut(state, operator.parameterModes[0], state[position + 1]), nextPosition);
    }
    else {
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
var input = fs.readFileSync('5.txt').toString();
var initialState = parseIntCodes(input);
process(initialState, 0);
