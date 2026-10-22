/**
 * app.js - Main Application Controller
 * Integrates FLAT DFA Lexer, COA Pipeline Simulator, and DAA Dijkstra Routing
 * with Interactive Visual Feedback, Cycle Stepper, and Real-Time Notifications.
 */

import { FlatLexer } from './modules/flat_lexer.js';
import { CoaPipeline } from './modules/coa_pipeline.js';
import { DaaDijkstra } from './modules/daa_dijkstra.js';

import { DfaVisualizer } from './ui/dfa_visualizer.js';
import { PipelineChart } from './ui/pipeline_chart.js';
import { GraphVisualizer } from './ui/graph_visualizer.js';

// Pre-configured Microcode Presets with explanations
const PRESET_INFO = {
    arithmetic: {
        title: "Preset 1: Arithmetic RAW Hazard Sequence",
        desc: "Demonstrates LOAD followed by dependent ADD & SUB instructions. With forwarding enabled, data is forwarded with minimal stalls.",
        code: `LOAD R1, 15;
ADD R2, R1;
SUB R3, R2;
STORE R3, 100;`
    },
    hazard: {
        title: "Preset 2: Consecutive Data Dependencies",
        desc: "Tests multiple back-to-back register dependencies (R1 -> R2 -> R4 -> R5) verifying EX/MEM and MEM/WB forwarding bypass logic.",
        code: `LOAD R1, 50;
ADD R2, R1;
SUB R4, R2;
ADD R5, R4;`
    },
    branch: {
        title: "Preset 3: Branch Control Hazard (JMP)",
        desc: "Contains an unconditional JMP instruction. Demonstrates pipeline branch delay slot and control hazard detection.",
        code: `LOAD R1, 10;
ADD R2, R1;
JMP 40;
SUB R3, R2;
STORE R2, 80;`
    },
    syntax_error: {
        title: "Preset 4: DFA Syntax Rejection Test Cases",
        desc: "⚠️ DEMONSTRATION MODE: Contains invalid opcode 'UNKNOWN_OP' and missing semicolon. Watch the DFA transition directly to the red 'q_reject' sink state!",
        code: `LOAD R1, 20;
ADD R2 R3;
UNKNOWN_OP R1, 10;
STORE R2;`
    }
};

export class App {
    constructor() {
        this.lexer = new FlatLexer();
        this.pipeline = new CoaPipeline();
        this.dijkstra = new DaaDijkstra();

        this.dfaVisualizer = null;
        this.pipelineChart = null;
        this.graphVisualizer = null;

        this.currentProgram = PRESET_INFO.arithmetic.code;
        this.forwardingEnabled = true;

        // Cycle Player State
        this.currentCycle = null;
        this.cyclePlayTimer = null;
        this.latestPipelineResult = null;
        this.latestLexerResult = null;
    }

    init() {
        this.dfaVisualizer = new DfaVisualizer('dfa-canvas', 'dfa-table-container');
        this.pipelineChart = new PipelineChart('pipeline-table-container', 'pipeline-metrics-container', 'hazard-log-container');
        this.graphVisualizer = new GraphVisualizer('graph-canvas', 'dijkstra-steps-container');

        this.editor = document.getElementById('microcode-editor');
        this.runBtn = document.getElementById('btn-run-all');
        this.stepDfaBtn = document.getElementById('btn-run-dfa');
        this.forwardingToggle = document.getElementById('toggle-forwarding');
        this.presetSelector = document.getElementById('preset-selector');
        this.dijkstraTargetSelect = document.getElementById('dijkstra-target-select');

        if (this.editor) this.editor.value = this.currentProgram;
        if (this.forwardingToggle) this.forwardingToggle.checked = this.forwardingEnabled;

        this.createToastContainer();
        this.bindEvents();
        this.updatePresetBanner('arithmetic');
        this.executeAll(false); // Initial load without toast popup
    }

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
            document.body.appendChild(container);
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bg = type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
                   type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
                   'bg-rose-950/90 border-rose-500/50 text-rose-200';

        toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-xl text-xs font-medium backdrop-blur transition-all duration-300 transform translate-y-3 opacity-0 ${bg}`;
        toast.innerHTML = `
            <span class="text-base">${type === 'success' ? '✓' : (type === 'warning' ? '⚠️' : '✕')}</span>
            <div>${message}</div>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-3', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    bindEvents() {
        if (this.runBtn) {
            this.runBtn.addEventListener('click', () => this.executeAll(true));
        }

        if (this.stepDfaBtn) {
            this.stepDfaBtn.addEventListener('click', () => this.stepDfaAnimated());
        }

        if (this.forwardingToggle) {
            this.forwardingToggle.addEventListener('change', (e) => {
                this.forwardingEnabled = e.target.checked;
                this.runPipelineOnly();
                this.showToast(`Data Forwarding set to: ${this.forwardingEnabled ? 'ENABLED' : 'DISABLED'}`, 'info');
            });
        }

        if (this.presetSelector) {
            this.presetSelector.addEventListener('change', (e) => {
                const val = e.target.value;
                if (PRESET_INFO[val]) {
                    this.currentProgram = PRESET_INFO[val].code;
                    if (this.editor) this.editor.value = this.currentProgram;
                    this.updatePresetBanner(val);
                    this.executeAll(true);
                }
            });
        }

        if (this.dijkstraTargetSelect) {
            this.dijkstraTargetSelect.addEventListener('change', () => {
                this.runDijkstraOnly();
            });
        }

        // Delegate Cycle Stepper buttons in pipeline chart
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-play-cycles')) {
                this.togglePlayCycles();
            } else if (e.target.closest('#btn-step-cycle')) {
                this.stepCycle();
            } else if (e.target.closest('#btn-reset-cycles')) {
                this.resetCyclePlayer();
            }
        });

        window.addEventListener('resize', () => {
            this.dfaVisualizer.render();
            const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
            const res = this.dijkstra.findShortestPath('IF_UNIT', target);
            this.graphVisualizer.render(this.dijkstra, res.path, target);
        });

        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetView = e.currentTarget.getAttribute('data-view');
                this.switchTab(targetView);
            });
        });
    }

    updatePresetBanner(presetKey) {
        let banner = document.getElementById('preset-info-banner');
        if (!banner && this.editor) {
            banner = document.createElement('div');
            banner.id = 'preset-info-banner';
            this.editor.parentElement.insertBefore(banner, this.editor);
        }

        const info = PRESET_INFO[presetKey];
        if (banner && info) {
            const isWarning = presetKey === 'syntax_error';
            banner.className = `mb-2 p-2.5 rounded-lg text-xs border ${
                isWarning 
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' 
                    : 'bg-sky-950/40 border-sky-800/60 text-sky-300'
            }`;
            banner.innerHTML = `<strong>${info.title}:</strong> ${info.desc}`;
        }
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

        setTimeout(async () => {
            if (viewId === 'dfa' || viewId === 'all') this.dfaVisualizer.render();
            if (viewId === 'dijkstra' || viewId === 'all') {
                const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
                const res = await this.dijkstra.findShortestPathAsync('IF_UNIT', target);
                this.graphVisualizer.render(this.dijkstra, res.path, target);
                this.graphVisualizer.renderRelaxationSteps(res);
            }
        }, 50);
    }

    async executeAll(notifyUser = true) {
        if (this.runBtn) {
            this.runBtn.innerHTML = `<span>⟳ Simulating...</span>`;
            this.runBtn.classList.add('opacity-80', 'cursor-wait');
        }

        const text = this.editor ? this.editor.value : this.currentProgram;
        
        // 1. Run FLAT DFA Lexer
        const lexerResult = this.lexer.parseProgram(text);
        this.latestLexerResult = lexerResult;
        this.dfaVisualizer.renderTransitionTable(lexerResult.lines);
        
        const lastLine = lexerResult.lines[lexerResult.lines.length - 1];
        this.dfaVisualizer.render(lastLine ? lastLine.finalState : 'q0');

        // Status Badge Update
        const statusBadge = document.getElementById('lexer-status-badge');
        if (statusBadge) {
            if (lexerResult.allValid && lexerResult.validInstructions.length > 0) {
                statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> DFA Syntax Verified (${lexerResult.validInstructions.length} Instructions Valid)</span>`;
            } else if (lexerResult.validInstructions.length === 0) {
                statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span> Syntax Error: Code Rejected at q_reject</span>`;
            } else {
                statusBadge.innerHTML = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Partial Valid (${lexerResult.validInstructions.length} accepted, errors detected)</span>`;
            }
        }

        // 2. Run COA 5-Stage Pipeline Simulator
        const validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        const pipelineResult = this.pipeline.simulate(validInstructions, this.forwardingEnabled);
        this.latestPipelineResult = pipelineResult;
        this.currentCycle = null;
        this.pipelineChart.render(pipelineResult);

        // 3. Run DAA Dijkstra Optimal Control Path Analyzer
        const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
        const pathResult = await this.dijkstra.findShortestPathAsync('IF_UNIT', target);
        this.graphVisualizer.render(this.dijkstra, pathResult.path, target);
        this.graphVisualizer.renderRelaxationSteps(pathResult);

        // Flash sections with subtle glow
        document.querySelectorAll('main > div > section').forEach(sec => {
            sec.classList.add('ring-1', 'ring-sky-500/40');
            setTimeout(() => sec.classList.remove('ring-1', 'ring-sky-500/40'), 800);
        });

        // Revert button & Show Toast
        if (this.runBtn) {
            this.runBtn.innerHTML = `<span>✓ Complete!</span>`;
            setTimeout(() => {
                this.runBtn.innerHTML = `<span>▶ Run Simulation</span>`;
                this.runBtn.classList.remove('opacity-80', 'cursor-wait');
            }, 900);
        }

        if (notifyUser) {
            if (lexerResult.allValid && validInstructions.length > 0) {
                this.showToast(`⚡ Simulation Run: ${validInstructions.length} Microcode Ops | ${pipelineResult.totalCycles} Clock Cycles | Routing Latency: ${pathResult.minCost} ns`, 'success');
            } else {
                this.showToast(`⚠️ Simulation Executed: DFA detected syntax rejection on ill-formed lines. Showing ${validInstructions.length} valid instructions.`, 'warning');
            }
        }
    }

    async stepDfaAnimated() {
        if (!this.latestLexerResult || !this.latestLexerResult.lines.length) {
            this.showToast('Enter microcode first to step through DFA.', 'warning');
            return;
        }

        const targetLine = this.latestLexerResult.lines[0];
        if (this.stepDfaBtn) {
            this.stepDfaBtn.innerText = 'Stepping...';
            this.stepDfaBtn.disabled = true;
        }

        await this.dfaVisualizer.stepAnimate(targetLine, (t, curr, total) => {
            this.showToast(`Token [${t.token}]: ${t.fromState} ➜ ${t.toState} (${curr}/${total})`, 'info');
        });

        if (this.stepDfaBtn) {
            this.stepDfaBtn.innerText = 'Step DFA';
            this.stepDfaBtn.disabled = false;
        }
    }

    stepCycle() {
        if (!this.latestPipelineResult || !this.latestPipelineResult.totalCycles) return;
        const total = this.latestPipelineResult.totalCycles;

        if (this.currentCycle === null || this.currentCycle >= total) {
            this.currentCycle = 1;
        } else {
            this.currentCycle++;
        }

        this.pipelineChart.renderGanttGrid(this.latestPipelineResult, this.currentCycle);
    }

    togglePlayCycles() {
        if (this.cyclePlayTimer) {
            clearInterval(this.cyclePlayTimer);
            this.cyclePlayTimer = null;
            const btn = document.getElementById('btn-play-cycles');
            if (btn) btn.innerHTML = `<span>▶ Play Timeline</span>`;
            return;
        }

        const btn = document.getElementById('btn-play-cycles');
        if (btn) btn.innerHTML = `<span>⏸ Pause</span>`;

        this.stepCycle();
        this.cyclePlayTimer = setInterval(() => {
            if (!this.latestPipelineResult) return;
            if (this.currentCycle >= this.latestPipelineResult.totalCycles) {
                clearInterval(this.cyclePlayTimer);
                this.cyclePlayTimer = null;
                if (btn) btn.innerHTML = `<span>▶ Play Timeline</span>`;
                return;
            }
            this.stepCycle();
        }, 500);
    }

    resetCyclePlayer() {
        if (this.cyclePlayTimer) {
            clearInterval(this.cyclePlayTimer);
            this.cyclePlayTimer = null;
        }
        this.currentCycle = null;
        if (this.latestPipelineResult) {
            this.pipelineChart.renderGanttGrid(this.latestPipelineResult, null);
        }
    }

    runLexerOnly() {
        const text = this.editor ? this.editor.value : this.currentProgram;
        const lexerResult = this.lexer.parseProgram(text);
        this.latestLexerResult = lexerResult;
        this.dfaVisualizer.renderTransitionTable(lexerResult.lines);
        const lastLine = lexerResult.lines[lexerResult.lines.length - 1];
        this.dfaVisualizer.render(lastLine ? lastLine.finalState : 'q0');
        this.showToast('DFA Lexical Analyzer updated.', 'info');
    }

    runPipelineOnly() {
        const text = this.editor ? this.editor.value : this.currentProgram;
        const lexerResult = this.lexer.parseProgram(text);
        const validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        const pipelineResult = this.pipeline.simulate(validInstructions, this.forwardingEnabled);
        this.latestPipelineResult = pipelineResult;
        this.pipelineChart.render(pipelineResult);
    }

    async runDijkstraOnly(validInstructions = null) {
        if (!validInstructions && this.editor) {
            const lexerResult = this.lexer.parseProgram(this.editor.value);
            validInstructions = lexerResult.validInstructions.map(l => l.instruction);
        }

        const target = this.dijkstraTargetSelect ? this.dijkstraTargetSelect.value : 'WB_BUS';
        const pathResult = await this.dijkstra.findShortestPathAsync('IF_UNIT', target);

        this.graphVisualizer.render(this.dijkstra, pathResult.path, target);
        this.graphVisualizer.renderRelaxationSteps(pathResult);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
