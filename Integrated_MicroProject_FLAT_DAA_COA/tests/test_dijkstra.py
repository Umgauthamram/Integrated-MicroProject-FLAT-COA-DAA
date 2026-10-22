"""
test_dijkstra.py - Unit test suite for Python DAA Dijkstra Engine & Min-Heap
"""

import sys
import os

# Add src/modules to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'modules')))
from daa_dijkstra import MinHeap, DaaDijkstraPython

passed = 0
total = 0

def assert_true(condition, message):
    global passed, total
    total += 1
    if condition:
        passed += 1
        print(f"  [PASS] {message}")
    else:
        print(f"  [FAIL] {message}")

print("========================================================")
print("Testing Python DAA Module: Dijkstra Routing & Min-Heap")
print("========================================================\n")

# Test Suite 1: Custom Min-Heap Priority Queue
print("Test Suite 1: Python Custom Min-Heap Priority Queue")
heap = MinHeap()
assert_true(heap.is_empty(), "Min-Heap starts empty")

heap.push({'id': 'C', 'dist': 5.5})
heap.push({'id': 'A', 'dist': 1.2})
heap.push({'id': 'B', 'dist': 3.4})
heap.push({'id': 'D', 'dist': 0.8})

assert_true(heap.size() == 4, "Heap contains 4 elements")
assert_true(heap.pop()['id'] == 'D', "First popped element is minimum (0.8)")
assert_true(heap.pop()['id'] == 'A', "Second popped element is 1.2")
assert_true(heap.pop()['id'] == 'B', "Third popped element is 3.4")
assert_true(heap.pop()['id'] == 'C', "Fourth popped element is 5.5")
assert_true(heap.is_empty(), "Heap is empty after popping all elements")

# Test Suite 2: Dijkstra Shortest Path Solver
print("\nTest Suite 2: Python Dijkstra Shortest Path Routing")
solver = DaaDijkstraPython()

# IF_UNIT to DECODE_UNIT
res_decode = solver.find_shortest_path('IF_UNIT', 'DECODE_UNIT')
assert_true(res_decode['minCost'] == 1.2, f"Path to DECODE_UNIT has latency 1.2 ns (got {res_decode['minCost']})")
assert_true('->'.join(res_decode['path']) == 'IF_UNIT->DECODE_UNIT', "Direct edge chosen")

# IF_UNIT to REG_FILE
res_reg = solver.find_shortest_path('IF_UNIT', 'REG_FILE')
assert_true(res_reg['minCost'] == 2.0, f"Path to REG_FILE is 1.2 + 0.8 = 2.0 ns (got {res_reg['minCost']})")
assert_true('->'.join(res_reg['path']) == 'IF_UNIT->DECODE_UNIT->REG_FILE', "Path is IF->ID->REG")

# IF_UNIT to ALU
res_alu = solver.find_shortest_path('IF_UNIT', 'ALU')
assert_true(res_alu['minCost'] == 3.5, f"Path to ALU is 2.0 + 1.5 = 3.5 ns (got {res_alu['minCost']})")
assert_true('->'.join(res_alu['path']) == 'IF_UNIT->DECODE_UNIT->REG_FILE->ALU', "Path is IF->ID->REG->ALU")

# IF_UNIT to WB_BUS (Optimal ALU Bypass: 4.4 ns vs Memory: 6.2 ns)
res_wb = solver.find_shortest_path('IF_UNIT', 'WB_BUS')
assert_true(res_wb['minCost'] == 4.4, f"Optimal path to WB_BUS is 4.4 ns (got {res_wb['minCost']})")
assert_true('ALU' in res_wb['path'], "Dijkstra chooses faster ALU path over memory path")

# IF_UNIT to BRANCH_UNIT
res_branch = solver.find_shortest_path('IF_UNIT', 'BRANCH_UNIT')
assert_true(res_branch['minCost'] == 2.2, f"Path to BRANCH_UNIT is 1.2 + 1.0 = 2.2 ns (got {res_branch['minCost']})")

# Test Suite 3: Step-by-Step Relaxation Verification
print("\nTest Suite 3: Step-by-Step Relaxation Trace")
assert_true(len(res_wb['relaxationSteps']) > 5, "Step-by-step relaxation history is logged")
assert_true(res_wb['relaxationSteps'][0]['action'] == 'INITIALIZE', "Initial state recorded")
assert_true(any(s['action'] == 'RELAX_EDGE' for s in res_wb['relaxationSteps']), "Edge relaxation logged")

print("\n========================================================")
print(f"Python Dijkstra Test Results: {passed} / {total} passed ({round((passed / total) * 100)}%)")
print("========================================================")

if passed != total:
    sys.exit(1)
