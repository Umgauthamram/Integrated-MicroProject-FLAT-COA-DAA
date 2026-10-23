/**
 * test_dfa.js - Unit tests for FLAT DFA Lexical Analyzer
 */

import { FlatLexer } from '../src/modules/flat_lexer.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
    total++;
    if (condition) {
        passed++;
        console.log(`  ✓ PASS: ${message}`);
    } else {
        console.error(`  ✗ FAIL: ${message}`);
    }
}

console.log('========================================================');
console.log('Testing FLAT Module: DFA Lexical Analyzer & Control Word');
console.log('========================================================\n');

const lexer = new FlatLexer();

// Test 1: Valid ADD instruction
console.log('Test Suite 1: Valid Arithmetic Instructions');
const resAdd = lexer.parseLine('ADD R1, R2;', 1);
assert(resAdd.isAccepted === true, 'ADD R1, R2; should be accepted by DFA');
assert(resAdd.finalState === 'q_accept', 'Final state must be q_accept');
assert(resAdd.instruction.opcode === 'ADD', 'Opcode decoded as ADD');
assert(resAdd.instruction.destReg === 'R1', 'Destination register is R1');
assert(resAdd.instruction.srcReg === 'R2', 'Source register is R2');
assert(resAdd.controlWord.fields.opcode.bits === '011', 'ADD opcode binary is 011');
assert(resAdd.controlWord.signals.RegWrite === 1, 'ADD asserts RegWrite signal');

// Test 2: Valid SUB instruction
const resSub = lexer.parseLine('SUB R3, R4;', 2);
assert(resSub.isAccepted === true, 'SUB R3, R4; should be accepted');
assert(resSub.instruction.destReg === 'R3', 'Dest reg is R3');
assert(resSub.controlWord.signals.ALUOp === 'SUB', 'ALUOp is SUB');

// Test 3: Valid LOAD instruction with immediate
console.log('\nTest Suite 2: Memory & Immediate Instructions');
const resLoad = lexer.parseLine('LOAD R1, 45;', 3);
assert(resLoad.isAccepted === true, 'LOAD R1, 45; should be accepted');
assert(resLoad.instruction.immediate === 45, 'Immediate value is 45');
assert(resLoad.controlWord.signals.MemRead === 1, 'LOAD asserts MemRead signal');
assert(resLoad.controlWord.signals.RegWrite === 1, 'LOAD asserts RegWrite signal');

// Test 4: Valid STORE instruction
const resStore = lexer.parseLine('STORE R2, 100;', 4);
assert(resStore.isAccepted === true, 'STORE R2, 100; should be accepted');
assert(resStore.controlWord.signals.MemWrite === 1, 'STORE asserts MemWrite signal');
assert(resStore.controlWord.signals.RegWrite === 0, 'STORE does not assert RegWrite');

// Test 5: Valid JMP instruction
console.log('\nTest Suite 3: Control Branch Instructions');
const resJmp = lexer.parseLine('JMP 128;', 5);
assert(resJmp.isAccepted === true, 'JMP 128; should be accepted');
assert(resJmp.instruction.target === 128, 'Jump target address is 128');
assert(resJmp.controlWord.signals.Branch === 1, 'JMP asserts Branch signal');

// Test 6: Rejection Tests
console.log('\nTest Suite 4: DFA Rejection & Syntax Error Detection');
const resInvalidOp = lexer.parseLine('MULTIPLY R1, R2;', 6);
assert(resInvalidOp.isAccepted === false, 'Invalid opcode MULTIPLY must be rejected');
assert(resInvalidOp.finalState === 'q_reject', 'Rejection state reached');

const resMissingSemi = lexer.parseLine('ADD R1, R2', 7);
assert(resMissingSemi.isAccepted === false, 'Instruction without semicolon must be rejected');

const resMissingComma = lexer.parseLine('ADD R1 R2;', 8);
assert(resMissingComma.isAccepted === false, 'Instruction without comma separator must be rejected');

const resMissingOperand = lexer.parseLine('ADD R1, ;', 9);
assert(resMissingOperand.isAccepted === false, 'Instruction missing second operand must be rejected');

console.log('\n========================================================');
console.log(`DFA Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================');

if (passed !== total) {
    process.exit(1);
}
