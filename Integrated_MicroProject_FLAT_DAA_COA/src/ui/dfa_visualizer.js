/**
 * dfa_visualizer.js - Renders interactive DFA State Machine diagram and transition steps
 */

export class DfaVisualizer {
    constructor(canvasId, tableContainerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.tableContainer = document.getElementById(tableContainerId);

        // DFA State Node Layout Coordinates
        this.states = {
            'q0': { x: 70, y: 150, label: 'q0 (Start)', isStart: true, isAccept: false },
            'q1': { x: 200, y: 80, label: 'q1 (Opcode)', isStart: false, isAccept: false },
            'q2': { x: 340, y: 80, label: 'q2 (DstReg)', isStart: false, isAccept: false },
            'q3': { x: 480, y: 80, label: 'q3 (Comma)', isStart: false, isAccept: false },
            'q4': { x: 620, y: 150, label: 'q4 (Src/Imm)', isStart: false, isAccept: false },
            'q_accept': { x: 760, y: 150, label: 'q_acc', isStart: false, isAccept: true },
            'q_reject': { x: 420, y: 270, label: 'q_rej', isStart: false, isAccept: false, isDead: true }
        };

        this.activeState = null;
        this.activeTransition = null;
    }

    render(activeState = null, activeTransition = null) {
        if (!this.ctx) return;
        this.activeState = activeState;
        this.activeTransition = activeTransition;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw connections / edges
        this.drawTransitions(ctx);

        // Draw state circles
        for (const [key, state] of Object.entries(this.states)) {
            const isCurrent = key === this.activeState;
            this.drawStateNode(ctx, key, state, isCurrent);
        }
    }

    async stepAnimate(line, onStepCallback = null) {
        if (!line || !line.transitions || line.transitions.length === 0) return;
        this.render('q0');
        await new Promise(r => setTimeout(r, 250));

        for (let i = 0; i < line.transitions.length; i++) {
            const t = line.transitions[i];
            this.render(t.toState, t);
            if (onStepCallback) onStepCallback(t, i + 1, line.transitions.length);
            await new Promise(r => setTimeout(r, 400));
        }
    }

    drawStateNode(ctx, key, state, isCurrent) {
        const radius = 28;

        ctx.save();

        // Glow effect for active state
        if (isCurrent) {
            ctx.shadowColor = key === 'q_reject' ? '#ef4444' : (key === 'q_accept' ? '#10b981' : '#3b82f6');
            ctx.shadowBlur = 20;
        }

        // Fill background
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, 2 * Math.PI);
        if (key === 'q_reject') {
            ctx.fillStyle = isCurrent ? '#991b1b' : '#371e22';
            ctx.strokeStyle = '#ef4444';
        } else if (key === 'q_accept') {
            ctx.fillStyle = isCurrent ? '#065f46' : '#14382c';
            ctx.strokeStyle = '#10b981';
        } else {
            ctx.fillStyle = isCurrent ? '#1e40af' : '#1e293b';
            ctx.strokeStyle = isCurrent ? '#60a5fa' : '#475569';
        }
        ctx.lineWidth = isCurrent ? 3.5 : 2;
        ctx.fill();
        ctx.stroke();

        // Double circle for accept state
        if (state.isAccept) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, radius - 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.8;
            ctx.stroke();
        }

        // Start arrow for q0
        if (state.isStart) {
            ctx.beginPath();
            ctx.moveTo(state.x - 45, state.y);
            ctx.lineTo(state.x - radius, state.y);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(state.x - radius, state.y);
            ctx.lineTo(state.x - radius - 6, state.y - 4);
            ctx.lineTo(state.x - radius - 6, state.y + 4);
            ctx.fillStyle = '#94a3b8';
            ctx.fill();
        }

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key, state.x, state.y - 4);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, system-ui, sans-serif';
        const subLabel = state.isAccept ? 'ACCEPT' : (state.isDead ? 'REJECT' : state.label.split(' ')[1] || '');
        ctx.fillText(subLabel.replace(/[()]/g, ''), state.x, state.y + 10);

        ctx.restore();
    }

    drawTransitions(ctx) {
        // Predefined transitions with labels
        const transitions = [
            { from: 'q0', to: 'q1', label: 'ADD/SUB/LOAD/STORE/JMP' },
            { from: 'q1', to: 'q2', label: 'R0-R7' },
            { from: 'q1', to: 'q4', label: 'JMP: Addr', curve: 0.3 },
            { from: 'q2', to: 'q3', label: "','" },
            { from: 'q3', to: 'q4', label: 'R0-R7 / Imm' },
            { from: 'q4', to: 'q_accept', label: "';'" },
            { from: 'q0', to: 'q_reject', label: 'Invalid Op', curve: 0.2 },
            { from: 'q1', to: 'q_reject', label: 'Invalid Opnd' },
            { from: 'q3', to: 'q_reject', label: 'Syntax Err' }
        ];

        for (const t of transitions) {
            const start = this.states[t.from];
            const end = this.states[t.to];
            const isActive = this.activeTransition &&
                this.activeTransition.fromState === t.from &&
                this.activeTransition.toState === t.to;

            ctx.save();
            ctx.beginPath();

            const isCurved = t.curve !== undefined;
            if (isCurved) {
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2 + (t.curve * 100);
                ctx.moveTo(start.x, start.y);
                ctx.quadraticCurveTo(midX, midY, end.x, end.y);
            } else {
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
            }

            ctx.strokeStyle = isActive ? '#38bdf8' : (t.to === 'q_reject' ? '#451a1a' : '#334155');
            ctx.lineWidth = isActive ? 2.8 : 1.2;
            if (t.to === 'q_reject') ctx.setLineDash([4, 4]);
            ctx.stroke();

            // Label
            const lx = isCurved ? (start.x + end.x) / 2 : (start.x + end.x) / 2;
            const ly = isCurved ? (start.y + end.y) / 2 + (t.curve * 50) : (start.y + end.y) / 2 - 8;

            ctx.font = '10px Inter, system-ui, sans-serif';
            ctx.fillStyle = isActive ? '#38bdf8' : '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText(t.label, lx, ly);

            ctx.restore();
        }
    }

    renderTransitionTable(parsedLines) {
        if (!this.tableContainer) return;

        if (!parsedLines || parsedLines.length === 0) {
            this.tableContainer.innerHTML = '<div class="text-slate-400 p-4 text-center">No microcode entered yet.</div>';
            return;
        }

        let html = `
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs font-mono">
                    <thead class="bg-slate-800 text-slate-300 border-b border-slate-700">
                        <tr>
                            <th class="p-2">Line</th>
                            <th class="p-2">Instruction</th>
                            <th class="p-2">Token Sequence</th>
                            <th class="p-2">State Path (delta)</th>
                            <th class="p-2">Verdict</th>
                            <th class="p-2">Control Word (16-bit)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
        `;

        for (const line of parsedLines) {
            const pathStr = line.transitions.map(t => `${t.fromState} --[${t.token}]--> ${t.toState}`).join('<br>');
            const badge = line.isAccepted
                ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACCEPTED</span>`
                : `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">REJECTED</span>`;

            const controlWordDisplay = line.controlWord
                ? `<span class="text-sky-400 font-bold">${line.controlWord.hex}</span> <span class="text-slate-400 text-[10px]">(${line.controlWord.binary})</span>`
                : `<span class="text-rose-400">${line.errorMessage || 'Invalid'}</span>`;

            html += `
                <tr class="hover:bg-slate-800/50 transition">
                    <td class="p-2 text-slate-400 font-bold">L${line.lineNumber}</td>
                    <td class="p-2 text-slate-100 font-medium">${line.raw}</td>
                    <td class="p-2 text-slate-300">${line.tokens.map(t => `<span class="bg-slate-700 px-1 py-0.5 rounded text-[10px] text-amber-300 mr-1">${t.raw}</span>`).join('')}</td>
                    <td class="p-2 text-slate-300 leading-tight">${pathStr}</td>
                    <td class="p-2">${badge}</td>
                    <td class="p-2">${controlWordDisplay}</td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.tableContainer.innerHTML = html;
    }
}
