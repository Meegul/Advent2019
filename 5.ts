import * as fs from 'fs';

enum ParameterMode {
  POSITION = 0,
  IMMEDIATE = 1,
}
enum OperatorType {
  ADD = 1,
  MULTIPLY = 2,
  INPUT = 3,
  OUTPUT = 4,
  HALT = 99,
}
interface Operator {
  op: OperatorType,
  parameterModes: ParameterMode[],
  numParameters: number,
}

const read = (value: number, mode: ParameterMode, state: number[]): number => {
  if (mode === ParameterMode.IMMEDIATE) {
    return value;
  } else if (mode === ParameterMode.POSITION) {
    return state[value];
  } else {
    console.error('uh oh', value);
  }
}

const add = (state: number[], parameterModes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = read(x, parameterModes[0], state);
  const y1 = read(y, parameterModes[1], state);
  state[z] = x1+y1;
  return state;
};
const multiply = (state: number[], parameterModes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = read(x, parameterModes[0], state);
  const y1 = read(y, parameterModes[1], state);
  state[z] = x1*y1;
  return state;
};

const ioIn = (state: number[], addr: number): number[] => {
  const val = 1; // INPUT VALUE
  state[addr] = val;
  //console.log(`INPUT: [${addr}]:${val}`);
  return state;
};
const ioOut = (state: number[], mode: ParameterMode, x: number): number[] => {
  const val = read(x, mode, state);
  console.log(`OUTPUT: ${val}`);
  return state;
}

const process = (state: number[], position: number): number[] => {
  const operator = decodeOperator(state[position]);
  //console.log(`PROCESSING: ${operator.op}@${position}`);
  if (operator.op === OperatorType.HALT) {
    return state;
  }
  const params = state.slice(position, position+operator.numParameters+1);
  const nextPosition = position + operator.numParameters + 1;
  if (operator.op === OperatorType.ADD) {
    return process(
      add(state, operator.parameterModes, state[position+1], state[position+2], state[position+3]),
      nextPosition
    );
  } else if (operator.op === OperatorType.MULTIPLY) {
    return process(
      multiply(state, operator.parameterModes, state[position+1], state[position+2], state[position+3]),
      nextPosition
    );
  } else if (operator.op === OperatorType.INPUT) {
    return process(ioIn(state, state[position+1]), nextPosition);
  } else if (operator.op == OperatorType.OUTPUT) {
    return process(ioOut(state, operator.parameterModes[0], state[position+1]), nextPosition);
  } else {
    console.error(`Unrecognized op: ${operator.op} @ ${position}`);
    return state;
  }
};

const decodeOperator = (code: number): Operator => {
  if (code === OperatorType.HALT) {
    return {
      op: OperatorType.HALT,
      numParameters: 0,
      parameterModes: [],
    };
  }

  const split = code.toString().split('').map(e => parseInt(e)).reverse();
  let on = 0;
  let op: OperatorType;
  let numParameters: number;
  let parameterModes: ParameterMode[];
  while (on < split.length) {
    const num = split[on];
    if (on === 0) {
      op = num as OperatorType;
      if (op === OperatorType.ADD || op === OperatorType.MULTIPLY) {
        numParameters = 3;
      } else if (op === OperatorType.INPUT || op === OperatorType.OUTPUT) {
        numParameters = 1;
      } else {
        numParameters = 0;
      }
      parameterModes = new Array(numParameters).fill(ParameterMode.POSITION);
    } else if (on > 1) {
      parameterModes[on-2] = num as ParameterMode;
    }
    on++;
  }
  return {
    op,
    numParameters,
    parameterModes,
  };
};

const parseIntCodes = (input: string) => {
  return input.split(",").map((el: string) => parseInt(el));
};

const input = fs.readFileSync('5.txt').toString();
const initialState = parseIntCodes(input);
process(initialState, 0);