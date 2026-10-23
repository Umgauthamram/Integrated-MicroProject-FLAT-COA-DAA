"""
daa_dijkstra.py - Design and Analysis of Algorithms (DAA) Python Module
Optimal Control Path Routing via Dijkstra's Shortest Path Algorithm

Implements a custom Min-Heap Priority Queue from scratch without third-party libraries.
Computes minimal latency hardware routing across CPU Functional Units.
Time Complexity: O((V + E) * log V)
"""

import sys
import json

class MinHeap:
    """Custom binary Min-Heap priority queue implementation."""
    def __init__(self):
        self.heap = []

    def size(self):
        return len(self.heap)

    def is_empty(self):
        return len(self.heap) == 0

    def push(self, node):
        self.heap.append(node)
        self._bubble_up(len(self.heap) - 1)

    def pop(self):
        if self.is_empty():
            return None
        root = self.heap[0]
        last = self.heap.pop()
        if not self.is_empty():
            self.heap[0] = last
            self._sink_down(0)
        return root

    def _bubble_up(self, index):
        while index > 0:
            parent_idx = (index - 1) // 2
            if self.heap[index]['dist'] < self.heap[parent_idx]['dist']:
                self.heap[index], self.heap[parent_idx] = self.heap[parent_idx], self.heap[index]
                index = parent_idx
            else:
                break

    def _sink_down(self, index):
        length = len(self.heap)
        while True:
            left_child_idx = 2 * index + 1
            right_child_idx = 2 * index + 2
            smallest = index

            if left_child_idx < length and self.heap[left_child_idx]['dist'] < self.heap[smallest]['dist']:
                smallest = left_child_idx
            if right_child_idx < length and self.heap[right_child_idx]['dist'] < self.heap[smallest]['dist']:
                smallest = right_child_idx

            if smallest != index:
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break


class DaaDijkstraPython:
    """CPU Functional Unit Graph & Dijkstra Shortest Path Solver in Python."""

    def __init__(self):
        # CPU Micro-Architectural Functional Units (Directed Weighted Graph)
        self.nodes = [
            {'id': 'IF_UNIT', 'name': 'Instruction Fetch (IF)', 'desc': 'PC register & I-Cache buffer', 'x': 80, 'y': 150},
            {'id': 'DECODE_UNIT', 'name': 'Instruction Decoder (ID)', 'desc': 'Opcode decoder & Control ROM', 'x': 250, 'y': 150},
            {'id': 'REG_FILE', 'name': 'Register File (REG)', 'desc': 'Dual-port read & write registers', 'x': 420, 'y': 80},
            {'id': 'BRANCH_UNIT', 'name': 'Branch Unit (BR)', 'desc': 'Comparator & PC Target Adder', 'x': 420, 'y': 240},
            {'id': 'ALU', 'name': 'Arithmetic Logic Unit (ALU)', 'desc': 'Integer adder, subtractor & shifter', 'x': 580, 'y': 80},
            {'id': 'DATA_MEM', 'name': 'Data Memory (MEM)', 'desc': 'SRAM Data Cache read/write', 'x': 740, 'y': 150},
            {'id': 'WB_BUS', 'name': 'Write-Back Bus (WB)', 'desc': 'Multiplexed result feedback bus', 'x': 580, 'y': 240}
        ]

        # Interconnect edges with physical propagation latency in nanoseconds (ns)
        self.edges = [
            {'from': 'IF_UNIT', 'to': 'DECODE_UNIT', 'weight': 1.2, 'name': 'Fetch-Decode Bus'},
            {'from': 'DECODE_UNIT', 'to': 'REG_FILE', 'weight': 0.8, 'name': 'Reg Address Lines'},
            {'from': 'DECODE_UNIT', 'to': 'BRANCH_UNIT', 'weight': 1.0, 'name': 'Immediate/Offset Bus'},
            {'from': 'REG_FILE', 'to': 'ALU', 'weight': 1.5, 'name': 'Operand Bus A/B'},
            {'from': 'REG_FILE', 'to': 'DATA_MEM', 'weight': 2.2, 'name': 'Direct Store Data Path'},
            {'from': 'BRANCH_UNIT', 'to': 'IF_UNIT', 'weight': 1.1, 'name': 'Branch Redirect Feedback'},
            {'from': 'ALU', 'to': 'DATA_MEM', 'weight': 1.8, 'name': 'Effective Address Line'},
            {'from': 'ALU', 'to': 'WB_BUS', 'weight': 0.9, 'name': 'ALU Output Bypass'},
            {'from': 'DATA_MEM', 'to': 'WB_BUS', 'weight': 2.0, 'name': 'Memory Load Bus'},
            {'from': 'WB_BUS', 'to': 'REG_FILE', 'weight': 0.7, 'name': 'Register Writeback Path'},
            {'from': 'ALU', 'to': 'BRANCH_UNIT', 'weight': 0.6, 'name': 'Zero/Sign Condition Flags'}
        ]

        # Build adjacency list
        self.adjacency_list = {node['id']: [] for node in self.nodes}
        for edge in self.edges:
            self.adjacency_list[edge['from']].append({
                'to': edge['to'],
                'weight': edge['weight'],
                'name': edge['name']
            })

    def find_shortest_path(self, source_id='IF_UNIT', target_id='WB_BUS'):
        """Computes shortest path from source to target using custom Min-Heap."""
        distances = {node['id']: float('inf') for node in self.nodes}
        previous = {node['id']: None for node in self.nodes}
        visited = set()
        relaxation_steps = []

        distances[source_id] = 0.0
        pq = MinHeap()
        pq.push({'id': source_id, 'dist': 0.0})

        step_counter = 1
        relaxation_steps.append({
            'step': step_counter,
            'action': 'INITIALIZE',
            'u': source_id,
            'details': f"Initialized dist[{source_id}] = 0.0 ns. All other nodes set to infinity (inf)."
        })
        step_counter += 1

        while not pq.is_empty():
            current = pq.pop()
            u = current['id']

            if u in visited:
                continue
            visited.add(u)

            relaxation_steps.append({
                'step': step_counter,
                'action': 'EXTRACT_MIN',
                'u': u,
                'dist': round(distances[u], 2),
                'details': f"Extracted vertex '{u}' with minimum accumulated latency {round(distances[u], 2)} ns."
            })
            step_counter += 1

            for edge in self.adjacency_list.get(u, []):
                v = edge['to']
                weight = edge['weight']

                if v not in visited:
                    new_dist = distances[u] + weight
                    if new_dist < distances[v]:
                        old_dist = distances[v]
                        distances[v] = round(new_dist, 2)
                        previous[v] = u
                        pq.push({'id': v, 'dist': distances[v]})

                        old_str = 'inf' if old_dist == float('inf') else f"{round(old_dist, 2)} ns"
                        relaxation_steps.append({
                            'step': step_counter,
                            'action': 'RELAX_EDGE',
                            'edge': f"{u} -> {v}",
                            'u': u,
                            'v': v,
                            'weight': weight,
                            'oldDist': old_str,
                            'newDist': f"{distances[v]} ns",
                            'details': f"Relaxed edge ({u} -> {v}): {round(distances[u], 2)} + {weight} = {distances[v]} ns (improved from {old_str})."
                        })
                        step_counter += 1

        # Reconstruct path
        path = []
        curr = target_id
        if distances[target_id] != float('inf'):
            while curr is not None:
                path.insert(0, curr)
                curr = previous[curr]

        return {
            'source': source_id,
            'target': target_id,
            'minCost': round(distances[target_id], 2),
            'path': path,
            'distances': {k: (round(v, 2) if v != float('inf') else 'inf') for k, v in distances.items()},
            'previous': previous,
            'relaxationSteps': relaxation_steps,
            'complexity': {
                'time': 'O((V + E) log V)',
                'space': 'O(V + E)',
                'verticesCount': len(self.nodes),
                'edgesCount': len(self.edges)
            },
            'engine': 'Python 3 Native Dijkstra Engine'
        }

    def get_instruction_route(self, opcode):
        target = 'WB_BUS'
        if opcode == 'STORE':
            target = 'DATA_MEM'
        elif opcode == 'JMP':
            target = 'BRANCH_UNIT'
        elif opcode in ('LOAD', 'ADD', 'SUB'):
            target = 'WB_BUS'

        res = self.find_shortest_path('IF_UNIT', target)
        return {
            'opcode': opcode,
            'targetUnit': target,
            'shortestPath': res['path'],
            'totalLatencyNs': res['minCost'],
            'steps': res['relaxationSteps'],
            'engine': res['engine']
        }


if __name__ == '__main__':
    solver = DaaDijkstraPython()
    source = 'IF_UNIT'
    target = 'WB_BUS'

    if len(sys.argv) > 1:
        target = sys.argv[1]

    result = solver.find_shortest_path(source, target)
    print(json.dumps(result, indent=2))
