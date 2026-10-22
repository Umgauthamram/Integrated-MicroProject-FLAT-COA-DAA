# Micro-Instruction Lexer, Pipelined Processor Simulator, and Optimal Control Path Analyzer

An integrated CS micro-project combining **Formal Languages & Automata Theory (FLAT)**, **Computer Organization & Architecture (COA)**, and **Design & Analysis of Algorithms (DAA)**.

## 🔗 Links
- **GitHub Repository:** [https://github.com/gauthamram-s70/Integrated-MicroProject-FLAT-COA-DAA](https://github.com/gauthamram-s70/Integrated-MicroProject-FLAT-COA-DAA)
- **Live Deployed Application:** [https://gauthamram-s70.github.io/Integrated-MicroProject-FLAT-COA-DAA/](https://gauthamram-s70.github.io/Integrated-MicroProject-FLAT-COA-DAA/)

## 🎓 Student Details
- **Name:** Gautham Ram S
- **Roll / Reg ID:** S70
- **Email:** gautham.ram.s70@kalvium.community
- **Course:** B.Tech Computer Science and Engineering
- **Institution:** Kalvium Community

## 🧩 Subject Concepts Implemented
1. **FLAT (Modules 1–3):** Deterministic Finite Automata (DFA) state machine $M = (Q, \Sigma, \delta, q_0, F)$ for lexical parsing, microcode syntax validation, and 16-bit binary control word generation.
2. **COA (Modules 1–3):** 5-Stage RISC Pipelined Execution Engine (IF, ID, EX, MEM, WB) with Data Hazard (RAW) detection, Load-Use stalls, configurable Data Forwarding, CPI, and Speedup evaluation.
3. **DAA (Modules 1–3):** Dijkstra's Shortest Path Algorithm on CPU functional unit directed graphs with custom Min-Heap priority queue to minimize hardware routing latency ($O((V+E)\log V)$).

## 🚀 How to Run Locally
1. Open `Integrated_MicroProject_FLAT_DAA_COA/index.html` directly in any web browser OR run:
   ```bash
   cd Integrated_MicroProject_FLAT_DAA_COA
   npm test
   npm start
   ```
2. Enter custom microcode (e.g., `LOAD R1, 10; ADD R2, R1; STORE R2, 0;`) or select from pre-configured presets.
3. View the interactive DFA state transitions, Pipeline Gantt Chart, and Dijkstra routing visualization!

## 📦 Submission ZIP Packages in `/output_final`
- `GauthamRam_S70_FLAT_MicroProject.zip`
- `GauthamRam_S70_DAA_MicroProject.zip`
- `GauthamRam_S70_COA_MicroProject.zip`