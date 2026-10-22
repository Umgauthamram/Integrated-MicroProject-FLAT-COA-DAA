# Micro-Instruction Lexer, Pipelined Processor Simulator, and Optimal Control Path Analyzer

An integrated, production-ready computer science micro-project combining **Formal Languages & Automata Theory (FLAT)**, **Computer Organization & Architecture (COA)**, and **Design & Analysis of Algorithms (DAA)**.

---

## 🔗 Live Application & Repository Links
- **GitHub Repository:** [https://github.com/gauthamram-s70/Integrated-MicroProject-FLAT-COA-DAA](https://github.com/gauthamram-s70/Integrated-MicroProject-FLAT-COA-DAA)
- **Live Deployed Simulator:** [https://gauthamram-s70.github.io/Integrated-MicroProject-FLAT-COA-DAA/](https://gauthamram-s70.github.io/Integrated-MicroProject-FLAT-COA-DAA/)

---

## 🎓 Student Profile
- **Name:** Gautham Ram S
- **Registration / Roll ID:** S70
- **Email:** gautham.ram.s70@kalvium.community
- **Degree:** B.Tech Computer Science and Engineering
- **Institution:** Kalvium Community

---

## 🏛️ Integrated Architecture & Cross-Disciplinary Concept Mapping

```
+---------------------------------------------------------------------------------------+
|                                    INPUT CODE                                         |
|                 (e.g., LOAD R1, 10; ADD R2, R1; STORE R2, 50;)                        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|               FLAT MODULE: Deterministic Finite Automata (DFA) Engine                 |
|   - Formal 5-tuple: M = (Q, Sigma, delta, q0, F)                                      |
|   - States: Q = {q0, q1, q2, q3, q4, q_accept, q_reject}                              |
|   - Validates strict lexical syntax line-by-line                                      |
|   - Generates 16-bit binary micro-instruction control words                           |
+-------------------------------------------+-------------------------------------------+
                                            |
                         Validated Binary Control Words
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|               COA MODULE: 5-Stage RISC CPU Pipeline Simulator                         |
|   - Pipeline Stages: IF (Fetch) -> ID (Decode) -> EX (Execute) -> MEM -> WB           |
|   - Hazard Detection: RAW Data Hazards, Load-Use 1-cycle stalls, Branch delays       |
|   - Configurable Hardware Data Forwarding (EX-to-EX & MEM-to-EX paths)                |
|   - Metrics: Clock Cycles (C), CPI, Speedup (5*I / C), Throughput (IPC)               |
+-------------------------------------------+-------------------------------------------+
                                            |
                             Micro-Op Execution Graph
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|               DAA MODULE: Optimal Control Path Routing via Dijkstra                   |
|   - CPU Functional Unit Graph: IF, ID, REG_FILE, ALU, DATA_MEM, BRANCH, WB_BUS       |
|   - Physical latency edge weights in nanoseconds (ns)                                 |
|   - Custom Min-Heap Priority Queue implementation: O((V + E) log V)                   |
|   - Step-by-step edge relaxation & minimal latency optimal routing                    |
+---------------------------------------------------------------------------------------+
```

---

## 📚 Detailed Subject Implementations

### 1. FLAT (Formal Languages and Automata Theory - Modules 1–3)
- **Mathematical Specification:** $M = (Q, \Sigma, \delta, q_0, F)$
  - $Q = \{q_0, q_1, q_2, q_3, q_4, q_{accept}, q_{reject}\}$
  - $\Sigma = \{\text{LOAD}, \text{STORE}, \text{ADD}, \text{SUB}, \text{JMP}, R_0\text{–}R_7, \text{Numbers}[0\text{–}255], \text{Comma}(,), \text{Semicolon}(;)\}$
  - Start State: $q_0$
  - Final State: $F = \{q_{accept}\}$
  - Dead / Trap State: $q_{reject}$
- **State Transition Function $\delta(q, \sigma)$:**
  - $q_0 \xrightarrow{\text{OPCODE}} q_1$
  - $q_1 \xrightarrow{\text{Dest Reg } R_d} q_2$ (or $q_1 \xrightarrow{\text{Target Addr}} q_4$ for JMP)
  - $q_2 \xrightarrow{','} q_3$
  - $q_3 \xrightarrow{\text{Src Reg } R_s \text{ or Imm}} q_4$
  - $q_4 \xrightarrow{';'} q_{accept}$
  - Any unexpected token or malformed grammar transitions strictly to $q_{reject}$.
- **Control Word Output:** Emits a 16-bit binary micro-instruction word:
  - `[15:13]` Opcode (3 bits)
  - `[12:10]` Destination Register (3 bits)
  - `[9:7]` Source Register (3 bits)
  - `[6:0]` Immediate / Address offset (7 bits)
  - Micro-architectural control flags: `RegWrite`, `ALUSrc`, `ALUOp`, `MemRead`, `MemWrite`, `Branch`.

### 2. COA (Computer Organization and Architecture - Modules 1–3)
- **5-Stage RISC Pipeline:**
  1. **IF (Instruction Fetch):** Fetches micro-instruction from Instruction Memory / Cache.
  2. **ID (Instruction Decode):** Decodes opcode and reads source registers from dual-port Register File.
  3. **EX (Execute):** ALU computes arithmetic/logic results or calculates effective memory address.
  4. **MEM (Memory Access):** Reads from (LOAD) or writes to (STORE) Data Cache.
  5. **WB (Write-Back):** Writes computed results back to destination register.
- **Hazard Detection & Resolution:**
  - **RAW (Read-After-Write) Hazards:** Resolved via forwarding paths (EX $\to$ EX, MEM $\to$ EX) or 2 stall bubbles without forwarding.
  - **Load-Use Hazard:** Detected when an instruction immediately uses the result of a LOAD. Requires 1 stall cycle even with forwarding because loaded data only becomes valid at the MEM stage output.
  - **Control Hazards:** Branch penalty on JMP adds pipeline stall/flush cycles.
- **Performance Evaluation Equations:**
  - Non-pipelined execution time: $C_{\text{seq}} = 5 \times n$
  - Cycles Per Instruction: $\text{CPI} = \frac{\text{Total Clock Cycles } C}{n}$
  - Speedup Factor: $S = \frac{C_{\text{seq}}}{C} = \frac{5 \cdot n}{C}$
  - Throughput: $\text{IPC} = \frac{n}{C}$

### 3. DAA (Design and Analysis of Algorithms - Modules 1–3)
- **Directed Weighted Graph Modeling:**
  - Vertices $V = \{\text{IF\_UNIT, DECODE\_UNIT, REG\_FILE, ALU, DATA\_MEM, BRANCH\_UNIT, WB\_BUS}\}$
  - Edges $E$ with realistic physical interconnect delay:
    - $\text{IF\_UNIT} \to \text{DECODE\_UNIT}$: $1.2\text{ ns}$
    - $\text{DECODE\_UNIT} \to \text{REG\_FILE}$: $0.8\text{ ns}$
    - $\text{DECODE\_UNIT} \to \text{BRANCH\_UNIT}$: $1.0\text{ ns}$
    - $\text{REG\_FILE} \to \text{ALU}$: $1.5\text{ ns}$
    - $\text{REG\_FILE} \to \text{DATA\_MEM}$: $2.2\text{ ns}$
    - $\text{ALU} \to \text{WB\_BUS}$: $0.9\text{ ns}$
    - $\text{DATA\_MEM} \to \text{WB\_BUS}$: $2.0\text{ ns}$
    - $\text{WB\_BUS} \to \text{REG\_FILE}$: $0.7\text{ ns}$
- **Algorithm Implementation:**
  - Implemented Dijkstra's algorithm **from scratch** using a custom binary Min-Heap Priority Queue.
  - Computes single-source shortest paths and step-by-step edge relaxation.
- **Asymptotic Complexity Proof:**
  - Heap initialization: $O(V)$
  - Vertex extraction (Extract-Min): $V \times O(\log V) = O(V \log V)$
  - Edge relaxation & Decrease-Key: $E \times O(\log V) = O(E \log V)$
  - Total Time Complexity: $\mathcal{O}((V + E) \log V)$
  - Auxiliary Space Complexity: $\mathcal{O}(V + E)$

---

## 📁 Repository Directory Structure

```
Integrated_MicroProject_FLAT_DAA_COA/
├── README.md                          # Comprehensive documentation
├── index.html                         # Web UI entry point
├── package.json                       # Dependencies & execution scripts
├── src/
│   ├── app.js                         # Main app controller
│   ├── modules/
│   │   ├── flat_lexer.js              # DFA engine implementation
│   │   ├── coa_pipeline.js            # 5-stage pipeline simulator
│   │   └── daa_dijkstra.js            # Dijkstra shortest path graph solver
│   └── ui/
│       ├── dfa_visualizer.js          # Interactive state machine renderer
│       ├── pipeline_chart.js          # Clock cycle pipeline table/Gantt chart
│       └── graph_visualizer.js        # Graph node & shortest path renderer
├── tests/
│   ├── test_dfa.js                    # Unit tests for DFA validation
│   ├── test_pipeline.js               # Unit tests for Pipeline & Hazards
│   └── test_dijkstra.js               # Unit tests for Shortest Path calculation
└── docs/
    ├── FLAT_Report_GauthamRamS.pdf
    ├── DAA_Report_GauthamRamS.pdf
    └── COA_Report_GauthamRamS.pdf
```

---

## 🚀 How to Run Locally

### Option 1: Direct Browser Launch (No Build Required)
Simply double-click `index.html` or open it in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
```bash
npm install
npm start
```
Open your browser at `http://localhost:3000`.

### Running Unit Test Suites
```bash
npm test
```
Or run individually:
```bash
node tests/test_dfa.js
node tests/test_pipeline.js
node tests/test_dijkstra.js
```

---

## 🧪 Unit Test Coverage
All test suites achieve **100% pass rate** across all three disciplines:
- `test_dfa.js`: 25 assertions covering valid opcodes, operands, immediate parsing, 16-bit binary words, and grammatical rejection.
- `test_pipeline.js`: 15 assertions verifying cycle matrix, RAW data hazards, load-use stalls, data forwarding bypasses, and CPI / speedup math.
- `test_dijkstra.js`: 19 assertions validating Min-Heap operations, edge relaxation, graph shortest paths, and latency optimization.
