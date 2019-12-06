const fs = require('fs');

const add = (state, position) => {
  const addr1 = state[position+1];
  const addr2 = state[position+2];
  const addr3 = state[position+3];
  const newState = state;
  const val1 = state[addr1];
  const val2 = state[addr2];
  newState[addr3] = val1 + val2;
  //console.log(`${position}, add: ${addr1}:${val1} + ${addr2}:${val2} -> ${addr3}:${newState[addr3]}`);
  return newState;
};

const multiply = (state, position) => {
  const addr1 = state[position+1];
  const addr2 = state[position+2];
  const addr3 = state[position+3];
  const newState = state;
  const val1 = state[addr1];
  const val2 = state[addr2];
  newState[addr3] = val1 * val2;
  //console.log(`${position}, mul: ${addr1}:${val1} * ${addr2}:${val2} -> ${addr3}:${newState[addr3]}`);
  return newState;
};

const process = (state, position) => {
  const opCode = state[position];
  switch(opCode) {
    case 1:
      return process(add(state, position), position + 4);
    case 2:
      return process(multiply(state, position), position + 4);
    case 99:
    default:
      return state;
  }
};

const parseIntCodes = (input) => {
  return input.split(",").map(el => parseInt(el));
};

const input = fs.readFileSync('2.txt').toString();
const initialState = parseIntCodes(input);
for (let noun = 0; noun < 100; noun++) {
  for (let verb = 0; verb < 100; verb++) {
    const edittedState = JSON.parse(JSON.stringify(initialState));
    edittedState[1] = noun;
    edittedState[2] = verb;
    const finalState = process(edittedState, 0);
    if (finalState[0] === 19690720) {
      console.log(`Found 19690720, noun: ${noun}, verb: ${verb}`);
    }
  }
}
