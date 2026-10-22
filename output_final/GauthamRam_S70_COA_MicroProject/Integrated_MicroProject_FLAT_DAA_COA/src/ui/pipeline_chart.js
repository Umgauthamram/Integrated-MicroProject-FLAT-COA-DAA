/**
 * pipeline_chart.js - Renders Clock-Cycle Pipeline Gantt Chart and Performance Metrics
 */

export class PipelineChart {
    constructor(tableContainerId, metricsContainerId, hazardLogContainerId) {
        this.tableContainer = document.getElementById(tableContainerId);
        this.metricsContainer = document.getElementById(metricsContainerId);
        this.hazardLogContainer = document.getElementById(hazardLogContainerId);
    }

    render(simulationResult) {
        if (!simulationResult || simulationResult.instructionCount === 0) {
            if (this.tableContainer) {
                this.tableContainer.innerHTML = '<div class="text-slate-400 p-6 text-center">Execute pipeline simulation to view cycle chart.</div>';
            }
            return;
        }

        this.renderMetrics(simulationResult);
        this.renderGanttGrid(simulationResult);
        this.renderHazardLogs(simulationResult);
    }

    renderMetrics(res) {
        if (!this.metricsContainer) return;

        this.metricsContainer.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Instructions (I)</div>
                    <div class="text-2xl font-bold text-sky-400 font-mono mt-1">${res.instructionCount}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Parsed micro-ops</div>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Cycles (C)</div>
                    <div class="text-2xl font-bold text-amber-400 font-mono mt-1">${res.totalCycles}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${res.forwardingEnabled ? 'Forwarding ON' : 'Forwarding OFF'}</div>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">CPI (C / I)</div>
                    <div class="text-2xl font-bold text-emerald-400 font-mono mt-1">${res.cpi}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Ideal CPI = 1.00</div>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Non-Pipelined (5×I)</div>
                    <div class="text-2xl font-bold text-slate-300 font-mono mt-1">${res.nonPipelinedCycles}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Sequential baseline</div>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Speedup (S)</div>
                    <div class="text-2xl font-bold text-purple-400 font-mono mt-1">${res.speedup}x</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">vs. unpipelined</div>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 p-3 rounded-lg text-center shadow">
                    <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Throughput (IPC)</div>
                    <div class="text-2xl font-bold text-teal-400 font-mono mt-1">${res.throughput}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">inst / cycle</div>
                </div>
            </div>
        `;
    }

    renderGanttGrid(res) {
        if (!this.tableContainer) return;

        const totalCycles = res.totalCycles;

        let tableHeader = `
            <th class="p-2.5 sticky left-0 z-20 bg-slate-800 text-slate-300 text-left border-r border-slate-700 min-w-[180px]">
                Instruction
            </th>
        `;

        for (let c = 1; c <= totalCycles; c++) {
            tableHeader += `<th class="p-2 text-center text-slate-400 font-mono min-w-[38px] text-xs">C${c}</th>`;
        }

        let tableRows = '';

        for (const row of res.grid) {
            tableRows += `
                <tr class="hover:bg-slate-800/40 border-b border-slate-800 transition">
                    <td class="p-2 sticky left-0 z-10 bg-slate-900 border-r border-slate-800 font-mono text-xs">
                        <span class="text-sky-400 font-bold mr-1.5">I${row.index}:</span>
                        <span class="text-slate-200">${row.text}</span>
                    </td>
            `;

            for (let c = 0; c < totalCycles; c++) {
                const stage = row.cycles[c] || '-';
                const cellHtml = this.getStagePill(stage);
                tableRows += `<td class="p-1.5 text-center">${cellHtml}</td>`;
            }

            tableRows += `</tr>`;
        }

        this.tableContainer.innerHTML = `
            <div class="overflow-x-auto border border-slate-700/60 rounded-lg shadow-inner bg-slate-900/60">
                <table class="w-full text-xs border-collapse">
                    <thead class="bg-slate-800 text-slate-300 border-b border-slate-700">
                        <tr>${tableHeader}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
            <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400 px-1">
                <span class="font-semibold text-slate-300">Legend:</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-blue-500/30 border border-blue-400 inline-block"></span> IF: Fetch</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-400 inline-block"></span> ID: Decode</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-purple-500/30 border border-purple-400 inline-block"></span> EX: Execute</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-amber-500/30 border border-amber-400 inline-block"></span> MEM: Memory</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400 inline-block"></span> WB: WriteBack</span>
                <span class="inline-flex items-center gap-1"><span class="w-3 h-3 rounded bg-rose-500/30 border border-rose-400 inline-block"></span> STALL (Hazard)</span>
            </div>
        `;
    }

    getStagePill(stage) {
        switch (stage) {
            case 'IF':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">IF</span>`;
            case 'ID':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ID</span>`;
            case 'EX':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">EX</span>`;
            case 'MEM':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">MEM</span>`;
            case 'WB':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">WB</span>`;
            case 'STALL':
                return `<span class="inline-block w-8 py-0.5 rounded text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">STALL</span>`;
            default:
                return `<span class="text-slate-600 font-mono text-[10px]">-</span>`;
        }
    }

    renderHazardLogs(res) {
        if (!this.hazardLogContainer) return;

        if (!res.hazards || res.hazards.length === 0) {
            this.hazardLogContainer.innerHTML = `
                <div class="bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
                    <span class="text-base">✓</span> Zero Hazards Detected! Perfect pipelined throughput with CPI = ${res.cpi}.
                </div>
            `;
            return;
        }

        let logsHtml = `
            <div class="space-y-2">
                <div class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Hazard Diagnostics (${res.hazards.length} Events)</span>
                    <span class="text-[11px] text-amber-400 font-normal">Active Mode: ${res.forwardingEnabled ? 'Forwarding Enabled' : 'No Forwarding (Stall Insertion)'}</span>
                </div>
                <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
        `;

        for (const h of res.hazards) {
            const isStall = h.action.toLowerCase().includes('stall');
            const badgeColor = isStall ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-teal-500/20 text-teal-400 border-teal-500/30';

            logsHtml += `
                <div class="bg-slate-800/70 border border-slate-700/50 p-2 rounded flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div class="flex items-center gap-2">
                        <span class="text-slate-400 font-bold">C${h.cycle}</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] border ${badgeColor}">${h.type}</span>
                        <span class="text-slate-200">${h.consumer} <span class="text-slate-500">needs</span> <span class="text-amber-400 font-bold">${h.register}</span> from ${h.producer}</span>
                    </div>
                    <div class="text-[11px] text-sky-400 font-semibold md:text-right">
                        Action: ${h.action}
                    </div>
                </div>
            `;
        }

        logsHtml += `</div></div>`;
        this.hazardLogContainer.innerHTML = logsHtml;
    }
}
