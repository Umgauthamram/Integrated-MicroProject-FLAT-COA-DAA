/**
 * test_dijkstra.js - Unit tests for DAA Dijkstra Shortest Path Solver & MinHeap
 */

import { MinHeap, DaaDijkstra } from '../src/modules/daa_dijkstra.js';

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
console.log('Testing DAA Module: Dijkstra Routing & Min-Heap Engine');
console.log('========================================================\n');

// Test Suite 1: Min-Heap Implementation
console.log('Test Suite 1: Custom Min-Heap Priority Queue');
const heap = new MinHeap();
assert(heap.isEmpty() === true, 'Heap starts empty');

heap.push({ id: 'C', dist: 5.5 });
heap.push({ id: 'A', dist: 1.2 });
heap.push({ id: 'B', dist: 3.4 });
heap.push({ id: 'D', dist: 0.8 });

assert(heap.size() === 4, 'Heap contains 4 items');
assert(heap.pop().id === 'D', 'First pop is smallest dist (0.8)');
assert(heap.pop().id === 'A', 'Second pop is 1.2');
assert(heap.pop().id === 'B', 'Third pop is 3.4');
assert(heap.pop().id === 'C', 'Fourth pop is 5.5');
assert(heap.isEmpty() === true, 'Heap is now empty');

// Test Suite 2: Dijkstra Shortest Path Calculation
console.log('\nTest Suite 2: Dijkstra Shortest Path Routing');
const solver = new DaaDijkstra();

// Test shortest path from IF_UNIT to DECODE_UNIT
const resDecode = solver.findShortestPath('IF_UNIT', 'DECODE_UNIT');
assert(resDecode.minCost === 1.2, `Path to DECODE_UNIT has latency 1.2 ns (got ${resDecode.minCost})`);
assert(resDecode.path.join('->') === 'IF_UNIT->DECODE_UNIT', 'Direct edge chosen');

// Test shortest path from IF_UNIT to REG_FILE
const resReg = solver.findShortestPath('IF_UNIT', 'REG_FILE');
assert(resReg.minCost === 2.0, `Path to REG_FILE is 1.2 + 0.8 = 2.0 ns (got ${resReg.minCost})`);
assert(resReg.path.join('->') === 'IF_UNIT->DECODE_UNIT->REG_FILE', 'Path is IF->ID->REG');

// Test shortest path from IF_UNIT to ALU
const resAlu = solver.findShortestPath('IF_UNIT', 'ALU');
assert(resAlu.minCost === 3.5, `Path to ALU is 2.0 + 1.5 = 3.5 ns (got ${resAlu.minCost})`);
assert(resAlu.path.join('->') === 'IF_UNIT->DECODE_UNIT->REG_FILE->ALU', 'Path is IF->ID->REG->ALU');

// Test shortest path from IF_UNIT to WB_BUS
// Note: Two potential routes:
// 1. IF -> ID -> REG -> ALU -> WB_BUS = 1.2 + 0.8 + 1.5 + 0.9 = 4.4 ns (Optimal ALU bypass)
// 2. IF -> ID -> REG -> DATA_MEM -> WB_BUS = 1.2 + 0.8 + 2.2 + 2.0 = 6.2 ns
const resWb = solver.findShortestPath('IF_UNIT', 'WB_BUS');
assert(resWb.minCost === 4.4, `Optimal path to WB_BUS is 4.4 ns (got ${resWb.minCost})`);
assert(resWb.path.includes('ALU'), 'Dijkstra chooses faster ALU path over memory path');

// Test shortest path to BRANCH_UNIT
const resBranch = solver.findShortestPath('IF_UNIT', 'BRANCH_UNIT');
assert(resBranch.minCost === 2.2, `Path to BRANCH_UNIT is 1.2 + 1.0 = 2.2 ns (got ${resBranch.minCost})`);

// Test Suite 3: Complexity & Relaxation Step Tracking
console.log('\nTest Suite 3: Step-by-Step Relaxation Verification');
assert(resWb.relaxationSteps.length > 5, 'Step-by-step relaxation history is recorded');
assert(resWb.relaxationSteps[0].action === 'INITIALIZE', 'Initial state recorded');
assert(resWb.relaxationSteps.some(s => s.action === 'RELAX_EDGE'), 'Edge relaxation logged');

console.log('\n========================================================');
console.log(`Dijkstra Test Results: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================');

if (passed !== total) {
    process.exit(1);
}
