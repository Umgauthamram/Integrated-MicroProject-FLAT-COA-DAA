/**
 * daa_dijkstra.js - Design and Analysis of Algorithms (DAA) Module
 * Optimal Control Path Routing via Dijkstra's Shortest Path Algorithm
 * 
 * Implements a Min-Heap Priority Queue from scratch.
 * Computes minimal latency hardware routing across CPU Functional Units.
 * Complexity: O((V + E) * log V)
 */

export class MinHeap {
    constructor() {
        this.heap = [];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    push(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        const root = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return root;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].dist < this.heap[parentIndex].dist) {
                // Swap
                const temp = this.heap[index];
                this.heap[index] = this.heap[parentIndex];
                this.heap[parentIndex] = temp;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let smallest = index;

            if (leftChildIdx < length && this.heap[leftChildIdx].dist < this.heap[smallest].dist) {
                smallest = leftChildIdx;
            }
            if (rightChildIdx < length && this.heap[rightChildIdx].dist < this.heap[smallest].dist) {
                smallest = rightChildIdx;
            }

            if (smallest !== index) {
                const temp = this.heap[index];
                this.heap[index] = this.heap[smallest];
                this.heap[smallest] = temp;
                index = smallest;
            } else {
                break;
            }
        }
    }
}

export class DaaDijkstra {
    constructor() {
        // CPU Micro-Architectural Functional Units (Directed Weighted Graph)
        this.nodes = [
            { id: 'IF_UNIT', name: 'Instruction Fetch (IF)', desc: 'PC register & I-Cache buffer', x: 80, y: 150 },
            { id: 'DECODE_UNIT', name: 'Instruction Decoder (ID)', desc: 'Opcode decoder & Control ROM', x: 250, y: 150 },
            { id: 'REG_FILE', name: 'Register File (REG)', desc: 'Dual-port read & write registers', x: 420, y: 80 },
            { id: 'BRANCH_UNIT', name: 'Branch Unit (BR)', desc: 'Comparator & PC Target Adder', x: 420, y: 240 },
            { id: 'ALU', name: 'Arithmetic Logic Unit (ALU)', desc: 'Integer adder, subtractor & shifter', x: 580, y: 80 },
            { id: 'DATA_MEM', name: 'Data Memory (MEM)', desc: 'SRAM Data Cache read/write', x: 740, y: 150 },
            { id: 'WB_BUS', name: 'Write-Back Bus (WB)', desc: 'Multiplexed result feedback bus', x: 580, y: 240 }
        ];

        // Hardware edge interconnects with physical latency (in nanoseconds)
        this.edges = [
            { from: 'IF_UNIT', to: 'DECODE_UNIT', weight: 1.2, name: 'Fetch-Decode Bus' },
            { from: 'DECODE_UNIT', to: 'REG_FILE', weight: 0.8, name: 'Reg Address Lines' },
            { from: 'DECODE_UNIT', to: 'BRANCH_UNIT', weight: 1.0, name: 'Immediate/Offset Bus' },
            { from: 'REG_FILE', to: 'ALU', weight: 1.5, name: 'Operand Bus A/B' },
            { from: 'REG_FILE', to: 'DATA_MEM', weight: 2.2, name: 'Direct Store Data Path' },
            { from: 'BRANCH_UNIT', to: 'IF_UNIT', weight: 1.1, name: 'Branch Redirect Feedback' },
            { from: 'ALU', to: 'DATA_MEM', weight: 1.8, name: 'Effective Address Line' },
            { from: 'ALU', to: 'WB_BUS', weight: 0.9, name: 'ALU Output Bypass' },
            { from: 'DATA_MEM', to: 'WB_BUS', weight: 2.0, name: 'Memory Load Bus' },
            { from: 'WB_BUS', to: 'REG_FILE', weight: 0.7, name: 'Register Writeback Path' },
            { from: 'ALU', to: 'BRANCH_UNIT', weight: 0.6, name: 'Zero/Sign Condition Flags' }
        ];

        // Build adjacency list
        this.adjacencyList = {};
        for (const node of this.nodes) {
            this.adjacencyList[node.id] = [];
        }
        for (const edge of this.edges) {
            this.adjacencyList[edge.from].push({
                to: edge.to,
                weight: edge.weight,
                name: edge.name
            });
        }
    }

    /**
     * Executes Dijkstra's Algorithm from scratch
     * @param {String} sourceId - ID of starting node
     * @param {String} targetId - ID of destination node (optional)
     * @returns {Object} shortest paths, step-by-step relaxation history, distance table
     */
    findShortestPath(sourceId = 'IF_UNIT', targetId = 'WB_BUS') {
        const distances = {};
        const previous = {};
        const visited = new Set();
        const relaxationSteps = [];

        // Step 1: Initialize Single Source
        for (const node of this.nodes) {
            distances[node.id] = Infinity;
            previous[node.id] = null;
        }
        distances[sourceId] = 0;

        const pq = new MinHeap();
        pq.push({ id: sourceId, dist: 0 });

        let stepCounter = 1;
        relaxationSteps.push({
            step: stepCounter++,
            action: 'INITIALIZE',
            u: sourceId,
            details: `Set dist[${sourceId}] = 0.0 ns. All other nodes initialized to ∞.`
        });

        // Step 2: Dijkstra Relaxation Loop
        while (!pq.isEmpty()) {
            const current = pq.pop();
            const u = current.id;

            if (visited.has(u)) continue;
            visited.add(u);

            relaxationSteps.push({
                step: stepCounter++,
                action: 'EXTRACT_MIN',
                u,
                dist: distances[u],
                details: `Extracted vertex '${u}' with minimum accumulated latency ${distances[u].toFixed(2)} ns.`
            });

            const neighbors = this.adjacencyList[u] || [];
            for (const edge of neighbors) {
                const v = edge.to;
                const weight = edge.weight;

                if (!visited.has(v)) {
                    const newDist = distances[u] + weight;
                    if (newDist < distances[v]) {
                        const oldDist = distances[v];
                        distances[v] = parseFloat(newDist.toFixed(2));
                        previous[v] = u;
                        pq.push({ id: v, dist: distances[v] });

                        relaxationSteps.push({
                            step: stepCounter++,
                            action: 'RELAX_EDGE',
                            edge: `${u} -> ${v}`,
                            u,
                            v,
                            weight,
                            oldDist: oldDist === Infinity ? '∞' : `${oldDist.toFixed(2)} ns`,
                            newDist: `${distances[v].toFixed(2)} ns`,
                            details: `Relaxed edge (${u} -> ${v}): ${distances[u].toFixed(2)} + ${weight.toFixed(2)} = ${distances[v].toFixed(2)} ns (improved from ${oldDist === Infinity ? '∞' : oldDist.toFixed(2)} ns).`
                        });
                    }
                }
            }
        }

        // Reconstruct shortest path to target
        const path = [];
        let curr = targetId;
        if (distances[targetId] !== Infinity) {
            while (curr) {
                path.unshift(curr);
                curr = previous[curr];
            }
        }

        return {
            source: sourceId,
            target: targetId,
            minCost: distances[targetId],
            path,
            distances,
            previous,
            relaxationSteps,
            complexity: {
                time: 'O((V + E) log V)',
                space: 'O(V + E)',
                verticesCount: this.nodes.length,
                edgesCount: this.edges.length
            },
            backend: 'JavaScript Engine (Client-Side Fallback)'
        };
    }

    /**
     * Connects with Python DAA Backend API with seamless offline fallback
     * @param {String} sourceId - ID of starting node
     * @param {String} targetId - ID of destination node
     * @returns {Promise<Object>} Shortest path result from Python or JS fallback
     */
    async findShortestPathAsync(sourceId = 'IF_UNIT', targetId = 'WB_BUS') {
        const endpoints = [
            `/api/dijkstra?source=${encodeURIComponent(sourceId)}&target=${encodeURIComponent(targetId)}`,
            `http://127.0.0.1:8000/api/dijkstra?source=${encodeURIComponent(sourceId)}&target=${encodeURIComponent(targetId)}`
        ];

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1200);
                const resp = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (resp.ok) {
                    const data = await resp.json();
                    data.backend = 'Python 3 Native Engine (REST API)';
                    return data;
                }
            } catch (err) {
                // Ignore and try next endpoint or fallback
            }
        }

        // Seamless fallback to pure client-side JS implementation
        return this.findShortestPath(sourceId, targetId);
    }

    /**
     * Compute full micro-instruction hardware routing path for an instruction type
     */
    getInstructionRoute(opcode) {
        let target = 'WB_BUS';
        if (opcode === 'STORE') {
            target = 'DATA_MEM';
        } else if (opcode === 'JMP') {
            target = 'BRANCH_UNIT';
        } else if (opcode === 'LOAD' || opcode === 'ADD' || opcode === 'SUB') {
            target = 'WB_BUS';
        }

        const result = this.findShortestPath('IF_UNIT', target);
        return {
            opcode,
            targetUnit: target,
            shortestPath: result.path,
            totalLatencyNs: result.minCost,
            steps: result.relaxationSteps,
            backend: result.backend
        };
    }

    async getInstructionRouteAsync(opcode) {
        let target = 'WB_BUS';
        if (opcode === 'STORE') {
            target = 'DATA_MEM';
        } else if (opcode === 'JMP') {
            target = 'BRANCH_UNIT';
        } else if (opcode === 'LOAD' || opcode === 'ADD' || opcode === 'SUB') {
            target = 'WB_BUS';
        }

        const result = await this.findShortestPathAsync('IF_UNIT', target);
        return {
            opcode,
            targetUnit: target,
            shortestPath: result.path,
            totalLatencyNs: result.minCost,
            steps: result.relaxationSteps,
            backend: result.backend
        };
    }
}
