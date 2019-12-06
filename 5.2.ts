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
  JIT = 5,
  JIF = 6,
  LT = 7,
  EQ = 8,
  HALT = 99,
}
interface Operator {
  op: OperatorType,
  parameterModes: ParameterMode[],
  numParameters: number,
}

const readValue = (value: number, mode: ParameterMode, state: number[]): number => {
  if (mode === ParameterMode.IMMEDIATE) {
    return value;
  } else if (mode === ParameterMode.POSITION) {
    return state[value];
  } else {
    console.error('uh oh', value);
  }
}

const add = (state: number[], parameterModes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = readValue(x, parameterModes[0], state);
  const y1 = readValue(y, parameterModes[1], state);
  state[z] = x1+y1;
  return state;
};
const multiply = (state: number[], parameterModes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = readValue(x, parameterModes[0], state);
  const y1 = readValue(y, parameterModes[1], state);
  state[z] = x1*y1;
  return state;
};
const ioIn = (state: number[], addr: number): number[] => {
  const val = 5; // INPUT VALUE
  state[addr] = val;
  return state;
};
const ioOut = (state: number[], mode: ParameterMode, x: number): number[] => {
  const val = readValue(x, mode, state);
  console.log(`OUTPUT: ${val}`);
  return state;
}
const jumpIfTrue = (state: number[], modes: ParameterMode[], x: number, y: number, position: number): number => {
  const x1 = readValue(x, modes[0], state);
  if (x1 === 0) {
    return position;
  }
  const x2 = readValue(y, modes[1], state);
  return x2;
};
const jumpIfFalse =(state: number[], modes: ParameterMode[], x: number, y: number, position: number): number => {
  const x1 = readValue(x, modes[0], state);
  if (x1 !== 0) {
    return position;
  }
  const y1 = readValue(y, modes[1], state);
  return y1;
};
const lessThan = (state: number[], modes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = readValue(x, modes[0], state);
  const y1 = readValue(y, modes[1], state);
  state[z] = x1 < y1 ? 1 : 0;
  return state;
}
const equal = (state: number[], modes: ParameterMode[], x: number, y: number, z: number): number[] => {
  const x1 = readValue(x, modes[0], state);
  const y1 = readValue(y, modes[1], state);
  state[z] = x1 === y1 ? 1 : 0;
  return state;
}

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
      } else if (op === OperatorType.JIF || op === OperatorType.JIT) {
        numParameters = 2;
      } else if (op === OperatorType.LT || op === OperatorType.EQ){
        numParameters = 3;
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

const process = (state: number[], position: number): number[] => {
  const { parameterModes , op, numParameters} = decodeOperator(state[position]) ;
  if (op === OperatorType.HALT) {
    return state;
  }
  const nextPosition = position + numParameters + 1;
  if (op === OperatorType.ADD) {
    return process(add(state, parameterModes, state[position+1], state[position+2], state[position+3]), nextPosition);
  } else if (op === OperatorType.MULTIPLY) {
    return process(multiply(state, parameterModes, state[position+1], state[position+2], state[position+3]), nextPosition);
  } else if (op === OperatorType.INPUT) {
    return process(ioIn(state, state[position+1]), nextPosition);
  } else if (op === OperatorType.OUTPUT) {
    return process(ioOut(state, parameterModes[0], state[position+1]), nextPosition);
  } else if (op === OperatorType.JIT) {
    return process(state, jumpIfTrue(state, parameterModes, state[position+1], state[position+2], nextPosition));
  } else if (op === OperatorType.JIF) {
    return process(state, jumpIfFalse(state, parameterModes, state[position+1], state[position+2], nextPosition));
  } else if (op === OperatorType.LT) {
    return process(lessThan(state, parameterModes, state[position+1], state[position+2], state[position+3]), nextPosition);
  } else if (op === OperatorType.EQ) {
    return process(equal(state, parameterModes, state[position+1], state[position+2], state[position+3]), nextPosition);
  } {
    console.error(`Unrecognized op: ${op} @ ${position}`);
    return state;
  }
};

const input = fs.readFileSync('5.2.txt').toString();
const initialState = input.split(",").map((el: string) => parseInt(el));
process(initialState, 0);