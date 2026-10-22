# TASK INSTRUCTION: Build an Integrated Micro-Project combining FLAT, DAA, and COA

You are tasked with building a complete, production-ready full-stack interactive web application and simulator titled:
"Micro-Instruction Lexer, Pipelined Processor Simulator, and Optimal Control Path Analyzer"

This project integrates core theoretical concepts from 3 computer science subjects:
1. Formal Languages and Automata Theory (FLAT - Modules 1–3)
2. Design and Analysis of Algorithms (DAA - Modules 1–3)
3. Computer Organization and Architecture (COA - Modules 1–3)

---

## 🎯 CORE CONCEPTS TO IMPLEMENT

### 1. FLAT Module Concept: Deterministic Finite Automata (DFA) Lexical Analyzer
- Implement a complete custom DFA Engine that acts as a Lexer/Validator for a custom microcode assembly language.
- Alphabet: `Σ = {LOAD, STORE, ADD, SUB, JMP, R0-R7, Numbers, Comma, Semicolon}`
- States: $Q = \{q_0, q_1, q_2, q_3, q_4, q_{accept}, q_{reject}\}$
- The DFA must parse raw text input line-by-line, validate strict syntax (e.g., `ADD R1, R2;`), output state transition sequences, and produce valid binary micro-instruction control words. Reject any invalid tokens or ill-formed lines.

### 2. COA Module Concept: 5-Stage CPU Pipeline Simulator with Hazard Detection
- Simulate a classic 5-Stage RISC Processor Pipeline: Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), Write-Back (WB).
- Parse validated micro-instructions and simulate clock cycle by clock cycle.
- Detect and visualize:
  - Data Hazards (RAW - Read-After-Write) with stall insertion and data forwarding flags.
  - Structural Hazards (Memory/Register resource contention).
  - Control Hazards (Branching stall penalties).
- Compute metrics: Total Execution Cycles, Instruction Count, Cycles Per Instruction (CPI), Speedup vs. Non-Pipelined, and Throughput.

### 3. DAA Module Concept: Optimal Control Path Routing via Dijkstra's Algorithm
- Model the internal CPU execution block/functional units (ALU, Register File, Data Memory, Branch Unit, Bus) as a Directed Weighted Graph.
- Edge weights represent hardware latency in clock cycles or nanoseconds.
- Implement Dijkstra's Algorithm from scratch to compute the shortest path (lowest latency routing) for executing given control word sequences across functional units.
- Output step-by-step relaxation states, time complexity proofs ($O((V + E) \log V)$), and the final minimum path cost.

---

## 🛠️ TECH STACK REQUIREMENTS

- **Language:** Python 3.10+ (Backend logic) / JavaScript (ES6+) or TypeScript (Frontend)
- **Frontend Framework:** React.js / Vite OR HTML5 + Tailwind CSS + Vanilla JS (Single Page Interactive Application)
- **Visualization:** Canvas API, Vis.js, or Lucide React / D3.js (For rendering DFA State Diagrams, Pipeline Gantt Charts, and Routing Graph Nodes)
- **Deployment target:** Vercel / Netlify / GitHub Pages

---

## 📁 REPOSITORY FILE & DIRECTORY STRUCTURE

Project Root: `Integrated_MicroProject_FLAT_DAA_COA/`

Integrated_MicroProject_FLAT_DAA_COA/
├── README.md                          # Comprehensive documentation
├── index.html                         # Web UI entry point
├── package.json / requirements.txt    # Dependencies
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