# Micro-Instruction Lexer, Pipelined Processor Simulator, and Optimal Control Path Analyzer

An integrated CS micro-project combining **Formal Languages & Automata Theory (FLAT)**, **Computer Organization & Architecture (COA)**, and **Design & Analysis of Algorithms (DAA)**.

## 🔗 Links
- **GitHub Repository:** [https://github.com/Umgauthamram/Integrated-MicroProject-FLAT-COA-DAA](https://github.com/Umgauthamram/Integrated-MicroProject-FLAT-COA-DAA)
- **Live Deployed Application (Vercel):** [https://integrated-microproject-flat-coa-daa.vercel.app](https://integrated-microproject-flat-coa-daa.vercel.app)
- **Live Deployed Application (GitHub Pages):** [https://umgauthamram.github.io/Integrated-MicroProject-FLAT-COA-DAA/](https://umgauthamram.github.io/Integrated-MicroProject-FLAT-COA-DAA/)

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
1. Start the Python server with the DAA REST API bridge:
   ```bash
   cd Integrated_MicroProject_FLAT_DAA_COA
   python server.py
   ```
   Open `http://localhost:8000` in any web browser.
2. Or run all tests across Python & JavaScript:
   ```bash
   npm test
   ```
   (Runs `test_dfa.js`, `test_pipeline.js`, `test_dijkstra.js`, and `test_dijkstra.py`)
3. Enter custom microcode (e.g., `LOAD R1, 10; ADD R2, R1; STORE R2, 0;`) or select from presets.
4. View the interactive DFA state transitions, Pipeline Gantt Chart, and Python Dijkstra routing visualization!

## 📦 Submission ZIP Packages in `/output_final`
- `GauthamRam_S70_FLAT_MicroProject.zip`
- `GauthamRam_S70_DAA_MicroProject.zip`
- `GauthamRam_S70_COA_MicroProject.zip`