/**
 * app.js - Main Application Controller
 * Integrates FLAT DFA Lexer, COA Pipeline Simulator, and DAA Dijkstra Routing
 */

import { FlatLexer } from './modules/flat_lexer.js';
import { CoaPipeline } from './modules/coa_pipeline.js';
import { DaaDijkstra } from './modules/daa_dijkstra.js';

import { DfaVisualizer } from './ui/dfa_visualizer.js';
import { PipelineChart } from './ui/pipeline_chart.js';
import { GraphVisualizer } from './ui/graph_visualizer.js';

// Pre-configured Microcode Presets
const PRESETS = {
    arithmetic: `LOAD R1, 15;
ADD R2, R1;
SUB R3, R2;
STORE R3, 100;`,

    hazard: `LOAD R1, 50;
ADD R2, R1;
SUB R4, R2;
ADD R5, R4;`,

    branch: `LOAD R1, 10;
ADD R2, R1;
JMP 40;
SUB R3, R2;
STORE R2, 80;`,

    syntax_error: `LOAD R1, 20;
ADD R2 R3;
UNKNOWN_OP R1, 10;
STORE R2;`
};

export class App {
    constructor() {
        this.lexer = new FlatLexer();
        this.pipeline = new CoaPipeline();
        this.dijkstra = new DaaDijkstra();

        this.dfaVisualizer = null;
        this.pipelineChart = null;
        this.graphVisualizer = null;

        this.currentProgram = PRESETS.arithmetic;
        this.forwardingEnabled = true;
    }

    init() {
        // Initialize UI Renderers
        this.dfaVisualizer = new DfaVisualizer('dfa-canvas', 'dfa-table-container');
        this.pipelineChart = new PipelineChart('pipeline-table-container', 'pipeline-metrics-container', 'hazard-log-container');
        this.graphVisualizer = new GraphVisualizer('graph-canvas', 'dijkstra-steps-container');

        // Bind DOM Elements
        this.editor = document.getElementById('microcode-editor');
        this.runBtn = document.getElementById('btn-run-all');
        this.stepDfaBtn = document.getElementById('btn-run-dfa');
        this.forwardingToggle = document.getElementById('toggle-forwarding');
        this.presetSelector = document.getElementById('preset-selector');
        this.dijkstraTargetSelect = document.getElementById('dijkstra-target-select');

        // Set initial values
        if (this.editor) this.editor.value = this.currentProgram;
        if (this.forwardingToggle) this.forwardingToggle.checked = this.forwardingEnabled;

        this.bindEvents();
        this.executeAll();
    }

    bindEvents() {
        if (this.runBtn) {
            this.runBtn.addEventListener('click', () => this.executeAll());
        }

        if (this.stepDfaBtn) {
            this.stepDfaBtn.addEventListener('click', () => this.runLexerOnly());
        }

        if (this.forwardingToggle) {
            this.forwardingToggle.addEventListener('change', (e) => {
                this.forwardingEnabled = e.target.checked;
                this.runPipelineOnly();
            });
        }

        if (this.presetSelector) {
            this.presetSelector.addEventListener('change', (e) => {
                const val = e.target.value;
                if (PRESETS[val]) {
                    this.currentProgram = PRESETS[val];
                    if (this.editor) this.editor.value = this.currentProgram;
                    this.executeAll();
                }
            });
        }

        if (this.dijkstraTargetSelect) {
            this.dijkstraTargetSelect.addEventListener('change', () => {
                this.runDijkstraOnly();
            });
        }

        // Window resize re-render canvases
        window.addEventListener('resize', () => {
            this.dfaVisualizer.render();
            const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
            const res = this.dijkstra.findShortestPath('IF_UNIT', target);
            this.graphVisualizer.render(this.dijkstra, res.path, target);
        });

        // Tab Switching
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetView = e.currentTarget.getAttribute('data-view');
                this.switchTab(targetView);
            });
        });
    }

    switchTab(viewId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-tab').forEach(el => {
            el.classList.remove('border-sky-500', 'text-sky-400', 'bg-slate-800/80');
            el.classList.add('border-transparent', 'text-slate-400');
        });

        const activeContent = document.getElementById(`view-${viewId}`);
        const activeTab = document.querySelector(`[data-view="${viewId}"]`);

        if (activeContent) activeContent.classList.remove('hidden');
        if (activeTab) {
            activeTab.classList.remove('border-transparent', 'text-slate-400');
            activeTab.classList.add('border-sky-500', 'text-sky-400', 'bg-slate-800/80');
        }

        // Trigger redraw if canvas became visible
        setTimeout(() => {
            if (viewId === 'dfa' || viewId === 'all') this.dfaVisualizer.render();
            if (viewId === 'dijkstra' || viewId === 'all') {
                const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
                const res = this.dijkstra.findShortestPath('IF_UNIT', target);
                this.graphVisualizer.render(this.dijkstra, res.path, target);
            }
        }, 50);
    }

    executeAll() {
        const text = this.editor ? this.editor.value : this.currentProgram;
        
        // 1. Run FLAT DFA Lexer
        const lexerResult = this.lexer.parseProgram(text);
        this.dfaVisualizer.renderTransitionTable(lexerResult.lines);
        
        const lastLine = lexerResult.lines[lexerResult.lines.length - 1];
        if (lastLine) {
            this.dfaVisualizer.render(lastLine.finalState);
        } else {
            this.dfaVisualizer.render('q0');
        }

        // Update Lexer Status Badge
        const statusBadge = document.getElementById('lexer-status-badge');
        if (statusBadge) {
            if (lexerResult.allValid) {
                statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> DFA Syntax Verified (${lexerResult.validInstructions.length} Instructions Valid)</span>`;
            } else {
                statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400"></span> DFA Syntax Error Detected</span>`;
            }
        }

        // 2. Run COA 5-Stage Pipeline Simulator
        const validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        const pipelineResult = this.pipeline.simulate(validInstructions, this.forwardingEnabled);
        this.pipelineChart.render(pipelineResult);

        // 3. Run DAA Dijkstra Optimal Control Path Analyzer
        this.runDijkstraOnly(validInstructions);
    }

    runLexerOnly() {
        const text = this.editor ? this.editor.value : this.currentProgram;
        const lexerResult = this.lexer.parseProgram(text);
        this.dfaVisualizer.renderTransitionTable(lexerResult.lines);
        const lastLine = lexerResult.lines[lexerResult.lines.length - 1];
        this.dfaVisualizer.render(lastLine ? lastLine.finalState : 'q0');
    }

    runPipelineOnly() {
        const text = this.editor ? this.editor.value : this.currentProgram;
        const lexerResult = this.lexer.parseProgram(text);
        const validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        const pipelineResult = this.pipeline.simulate(validInstructions, this.forwardingEnabled);
        this.pipelineChart.render(pipelineResult);
    }

    runDijkstraOnly(validInstructions = null) {
        if (!validInstructions && this.editor) {
            const lexerResult = this.lexer.parseProgram(this.editor.value);
            validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        }

        const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
        const pathResult = this.dijkstra.findShortestPath('IF_UNIT', target);

        this.graphVisualizer.render(this.dijkstra, pathResult.path, target);
        this.graphVisualizer.renderRelaxationSteps(pathResult);
    }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
