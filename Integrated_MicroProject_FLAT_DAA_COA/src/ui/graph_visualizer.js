/**
 * graph_visualizer.js - Renders Interactive CPU Functional Unit Graph & Dijkstra Shortest Path
 */

export class GraphVisualizer {
    constructor(canvasId, stepsContainerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.stepsContainer = document.getElementById(stepsContainerId);
        this.activePath = [];
    }

    render(daaSolver, activePath = [], targetId = 'WB_BUS') {
        if (!this.ctx || !daaSolver) return;
        this.activePath = activePath || [];

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw Graph Edges
        this.drawEdges(ctx, daaSolver);

        // Draw Graph Nodes
        this.drawNodes(ctx, daaSolver, targetId);
    }

    drawNodes(ctx, daaSolver, targetId) {
        const radius = 26;

        for (const node of daaSolver.nodes) {
            const isInPath = this.activePath.includes(node.id);
            const isSource = node.id === 'IF_UNIT';
            const isTarget = node.id === targetId;

            ctx.save();

            // Glow for path nodes
            if (isInPath) {
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 18;
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

            if (isSource) {
                ctx.fillStyle = '#1e3a8a';
                ctx.strokeStyle = '#60a5fa';
            } else if (isTarget) {
                ctx.fillStyle = '#065f46';
                ctx.strokeStyle = '#34d399';
            } else if (isInPath) {
                ctx.fillStyle = '#064e3b';
                ctx.strokeStyle = '#10b981';
            } else {
                ctx.fillStyle = '#1e293b';
                ctx.strokeStyle = '#475569';
            }

            ctx.lineWidth = isInPath ? 3 : 1.8;
            ctx.fill();
            ctx.stroke();

            // Node Name / Label
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 11px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const shortLabel = node.id.replace('_UNIT', '');
            ctx.fillText(shortLabel, node.x, node.y - 4);

            // Sub-label
            ctx.fillStyle = isInPath ? '#6ee7b7' : '#94a3b8';
            ctx.font = '9px Inter, system-ui, sans-serif';
            ctx.fillText(isSource ? 'SOURCE' : (isTarget ? 'TARGET' : (node.id === 'ALU' ? 'CALC' : 'UNIT')), node.x, node.y + 9);

            ctx.restore();
        }
    }

    drawEdges(ctx, daaSolver) {
        for (const edge of daaSolver.edges) {
            const fromNode = daaSolver.nodes.find(n => n.id === edge.from);
            const toNode = daaSolver.nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) continue;

            // Check if this edge is on the active shortest path
            let isEdgeInPath = false;
            for (let i = 0; i < this.activePath.length - 1; i++) {
                if (this.activePath[i] === edge.from && this.activePath[i + 1] === edge.to) {
                    isEdgeInPath = true;
                    break;
                }
            }

            ctx.save();
            ctx.beginPath();

            const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
            const radius = 26;

            const startX = fromNode.x + Math.cos(angle) * radius;
            const startY = fromNode.y + Math.sin(angle) * radius;
            const endX = toNode.x - Math.cos(angle) * radius;
            const endY = toNode.y - Math.sin(angle) * radius;

            // Curve feedback or specific edges slightly to prevent overlap
            const isCurved = (edge.from === 'BRANCH_UNIT' && edge.to === 'IF_UNIT') || (edge.from === 'WB_BUS' && edge.to === 'REG_FILE');
            
            if (isCurved) {
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2 + 35;
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(midX, midY, endX, endY);
            } else {
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            }

            if (isEdgeInPath) {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1.2;
            }

            ctx.stroke();

            // Arrow head at target
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI / 6), endY - 8 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI / 6), endY - 8 * Math.sin(angle + Math.PI / 6));
            ctx.fillStyle = isEdgeInPath ? '#10b981' : '#64748b';
            ctx.fill();

            // Latency weight label
            const labelX = (startX + endX) / 2;
            const labelY = (startY + endY) / 2 - 8;

            ctx.font = '10px Inter, system-ui, sans-serif';
            ctx.fillStyle = isEdgeInPath ? '#34d399' : '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText(`${edge.weight.toFixed(1)}ns`, labelX, labelY);

            ctx.restore();
        }
    }

    renderRelaxationSteps(pathResult) {
        if (!this.stepsContainer) return;

        if (!pathResult || !pathResult.relaxationSteps) {
            this.stepsContainer.innerHTML = '<div class="text-slate-400 p-4 text-center">Run Dijkstra solver to view relaxation log.</div>';
            return;
        }

        const steps = pathResult.relaxationSteps;
        const backend = pathResult.backend || 'Python 3 Native Engine (REST API)';
        const isPython = backend.toLowerCase().includes('python');
        const badgeClass = isPython 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
            : 'bg-sky-500/20 text-sky-300 border-sky-500/40';

        let html = `
            <div class="mb-3 p-3 bg-slate-800/80 border border-slate-700/60 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs uppercase text-slate-400 font-bold tracking-wider">Optimal Control Path:</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}">
                            ${isPython ? '🐍 ' : '⚡ '} ${backend}
                        </span>
                    </div>
                    <div class="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                        ${pathResult.path.join('  ➜  ')}
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Hardware Latency:</span>
                    <div class="text-xl font-mono font-bold text-sky-400">
                        ${pathResult.minCost.toFixed(2)} ns
                    </div>
                </div>
            </div>
            
            <div class="overflow-x-auto max-h-56 overflow-y-auto border border-slate-800 rounded">
                <table class="w-full text-left text-xs font-mono">
                    <thead class="bg-slate-800 text-slate-300 sticky top-0 border-b border-slate-700">
                        <tr>
                            <th class="p-2">Step</th>
                            <th class="p-2">Action</th>
                            <th class="p-2">Edge / Node</th>
                            <th class="p-2">Computation / Relaxation Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
        `;

        for (const s of steps) {
            let actionBadge = '';
            if (s.action === 'INITIALIZE') {
                actionBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">INIT</span>';
            } else if (s.action === 'EXTRACT_MIN') {
                actionBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">EXTRACT-MIN</span>';
            } else if (s.action === 'RELAX_EDGE') {
                actionBadge = '<span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RELAX</span>';
            }

            html += `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="p-2 text-slate-400 font-bold">#${s.step}</td>
                    <td class="p-2">${actionBadge}</td>
                    <td class="p-2 text-slate-200">${s.edge || s.u || '-'}</td>
                    <td class="p-2 text-slate-300">${s.details}</td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.stepsContainer.innerHTML = html;
    }
}
