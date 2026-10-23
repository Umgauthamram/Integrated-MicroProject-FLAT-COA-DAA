/**
 * test_pipeline.js - Unit tests for COA 5-Stage Pipeline Simulator
 */

import { FlatLexer } from '../src/modules/flat_lexer.js';
import { CoaPipeline } from '../src/modules/coa_pipeline.js';

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
console.log('Testing COA Module: 5-Stage CPU Pipeline & Hazard Detection');
console.log('========================================================\n');

const lexer = new FlatLexer();
const pipeline = new CoaPipeline();

// Test 1: Ideal Pipeline without Hazards
console.log('Test Suite 1: Ideal Pipeline (Independent Instructions)');
const progIdeal = `LOAD R1, 10;
LOAD R2, 20;
LOAD R3, 30;`;
const parsedIdeal = lexer.parseProgram(progIdeal).validInstructions.map(l => l.instruction);
const resIdeal = pipeline.simulate(parsedIdeal, true);

assert(resIdeal.instructionCount === 3, '3 instructions executed');
// Ideal 3 instructions in 5-stage pipeline take k + n - 1 = 5 + 3 - 1 = 7 cycles
assert(resIdeal.totalCycles === 7, `Ideal execution takes exactly 7 cycles (got ${resIdeal.totalCycles})`);
assert(resIdeal.cpi === parseFloat((7 / 3).toFixed(2)), 'CPI matches 7 / 3');
assert(resIdeal.hazards.length === 0, 'No hazards detected in independent instructions');

// Test 2: RAW Data Hazard without Forwarding
console.log('\nTest Suite 2: RAW Hazard without Forwarding (Stalls Inserted)');
const progRaw = `LOAD R1, 50;
ADD R2, R1;`;
const parsedRaw = lexer.parseProgram(progRaw).validInstructions.map(l => l.instruction);
const resRawNoFwd = pipeline.simulate(parsedRaw, false);

assert(resRawNoFwd.hazards.length > 0, 'RAW hazard detected');
assert(resRawNoFwd.totalCycles > 6, 'Total cycles increased due to stall insertion');
assert(resRawNoFwd.grid[1].cycles.includes('STALL'), 'Instruction 2 contains STALL bubbles');

// Test 3: RAW Data Hazard with Forwarding
console.log('\nTest Suite 3: RAW Hazard with Forwarding (EX/MEM Forwarding)');
const progAluRaw = `ADD R1, R2;
SUB R3, R1;`;
const parsedAluRaw = lexer.parseProgram(progAluRaw).validInstructions.map(l => l.instruction);
const resAluFwd = pipeline.simulate(parsedAluRaw, true);

// With forwarding for ALU-ALU dependency, zero stalls required!
assert(!resAluFwd.grid[1].cycles.includes('STALL'), 'Zero stalls inserted for ALU-to-ALU with forwarding');
assert(resAluFwd.totalCycles === 6, 'Cycles = 5 + 2 - 1 = 6 cycles');

// Test 4: Load-Use Hazard with Forwarding (Requires 1 Stall)
console.log('\nTest Suite 4: Load-Use Hazard (Requires 1 Stall Even with Forwarding)');
const progLoadUse = `LOAD R1, 100;
ADD R2, R1;`;
const parsedLoadUse = lexer.parseProgram(progLoadUse).validInstructions.map(l => l.instruction);
const resLoadUse = pipeline.simulate(parsedLoadUse, true);

assert(resLoadUse.hazards.some(h => h.type.includes('Load-Use')), 'Load-Use hazard correctly diagnosed');
assert(resLoadUse.grid[1].cycles.includes('STALL'), '1 stall cycle inserted for Load-Use');
assert(resLoadUse.totalCycles === 7, 'Cycles = 6 + 1 stall = 7 cycles');

// Test 5: Metrics and Speedup
console.log('\nTest Suite 5: Pipeline Metrics Verification');
assert(resLoadUse.nonPipelinedCycles === 10, 'Sequential baseline is 2 * 5 = 10 cycles');
assert(resLoadUse.speedup === parseFloat((10 / 7).toFixed(2)), 'Speedup matches 10 / 7');
assert(resLoadUse.throughput === parseFloat((2 / 7).toFixed(3)), 'Throughput matches 2 / 7');

console.log('\n========================================================');
console.log(`Pipeline Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================');

if (passed !== total) {
    process.exit(1);
}
