/**
 * coa_pipeline.js - Computer Organization & Architecture (COA) Module
 * 5-Stage RISC Pipelined Processor Simulator with Hazard Detection & Performance Metrics
 * 
 * Stages:
 * IF  - Instruction Fetch
 * ID  - Instruction Decode & Register Fetch
 * EX  - Execute & Address Calculation
 * MEM - Data Memory Access
 * WB  - Register Write Back
 */

export const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'];

export class CoaPipeline {
    constructor(options = {}) {
        this.forwardingEnabled = options.forwarding ?? true;
        this.structuralHazardSplitReg = options.splitRegisterFile ?? true; // Write first half, read second half
        this.branchDelaySlots = 1; // 1 cycle stall/flush on unconditional jump
    }

    /**
     * Simulates execution of validated micro-instructions cycle by cycle
     * @param {Array} instructions - Array of validated instruction objects from FLAT Lexer
     * @param {Boolean} forwarding - Override forwarding option
     */
    simulate(instructions, forwarding = this.forwardingEnabled) {
        if (!instructions || instructions.length === 0) {
            return {
                instructionCount: 0,
                totalCycles: 0,
                cpi: 0,
                speedup: 0,
                throughput: 0,
                grid: [],
                hazards: [],
                cycleLogs: []
            };
        }

        const n = instructions.length;
        // Each instruction tracks its current stage and stage progression per cycle
        // stageHistory[i][cycle] = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB' | 'STALL' | 'FLUSH' | ''
        const stageHistory = Array.from({ length: n }, () => []);
        const hazards = [];
        const cycleLogs = [];

        // Instruction status tracking
        // state: 'PENDING', 'IN_FLIGHT', 'COMPLETED', 'FLUSHED'
        const instStates = instructions.map((inst, idx) => ({
            index: idx,
            instruction: inst,
            currentStageIdx: -1, // -1: not started, 0: IF, 1: ID, 2: EX, 3: MEM, 4: WB, 5: Done
            isStalled: false,
            isFlushed: false,
            writeReg: (inst.opcode === 'LOAD' || inst.opcode === 'ADD' || inst.opcode === 'SUB') ? inst.destReg : null,
            readRegs: this.getReadRegisters(inst)
        }));

        let cycle = 0;
        let nextFetchIdx = 0;
        const maxCycles = 500; // safety ceiling

        while (instStates.some(inst => inst.currentStageIdx < 5 && !inst.isFlushed) && cycle < maxCycles) {
            cycle++;
            const cycleActions = [];

            // Stage allocation for current cycle
            // Process pipeline stages from right to left (WB down to IF) to prevent hazards from propagating backwards
            
            // 1. WB Stage
            for (let i = 0; i < n; i++) {
                const inst = instStates[i];
                if (inst.currentStageIdx === 4) {
                    stageHistory[i][cycle] = 'WB';
                    cycleActions.push(`[Cycle ${cycle}] I${i + 1} (${inst.instruction.rawText}) completes Write-Back (WB)`);
                    inst.currentStageIdx = 5; // Marked completed
                }
            }

            // 2. MEM Stage
            for (let i = 0; i < n; i++) {
                const inst = instStates[i];
                if (inst.currentStageIdx === 3) {
                    stageHistory[i][cycle] = 'MEM';
                    inst.currentStageIdx = 4; // Advance to WB next cycle
                }
            }

            // 3. EX Stage
            for (let i = 0; i < n; i++) {
                const inst = instStates[i];
                if (inst.currentStageIdx === 2) {
                    stageHistory[i][cycle] = 'EX';
                    inst.currentStageIdx = 3; // Advance to MEM next cycle
                }
            }

            // 4. ID Stage - CRITICAL HAZARD DETECTION POINT (RAW & Control)
            let idStallRequired = false;
            let stallReason = null;
            let currentInId = -1;

            for (let i = 0; i < n; i++) {
                if (instStates[i].currentStageIdx === 1) {
                    currentInId = i;
                    break;
                }
            }

            if (currentInId !== -1) {
                const currentInst = instStates[currentInId];
                const readRegs = currentInst.readRegs;

                // Check for RAW (Read-After-Write) hazards with older instructions currently in EX or MEM
                for (let prevIdx = 0; prevIdx < currentInId; prevIdx++) {
                    const prevInst = instStates[prevIdx];
                    if (!prevInst.isFlushed && prevInst.writeReg && readRegs.includes(prevInst.writeReg)) {
                        const targetReg = prevInst.writeReg;

                        // Check where the previous instruction currently is
                        const prevStage = prevInst.currentStageIdx; // 2=EX, 3=MEM, 4=WB

                        if (!forwarding) {
                            // WITHOUT FORWARDING: Data is only available AFTER WB stage
                            if (prevStage === 2 || prevStage === 3) {
                                idStallRequired = true;
                                stallReason = `RAW Hazard on ${targetReg} with I${prevIdx + 1} (${prevInst.instruction.opcode}). Stalling ID until WB stage completes.`;
                                hazards.push({
                                    cycle,
                                    type: 'RAW Data Hazard (No Forwarding)',
                                    consumer: `I${currentInId + 1} (${currentInst.instruction.rawText})`,
                                    producer: `I${prevIdx + 1} (${prevInst.instruction.rawText})`,
                                    register: targetReg,
                                    action: 'Stall 1 cycle'
                                });
                                break;
                            }
                        } else {
                            // WITH FORWARDING:
                            // Check for Load-Use Data Hazard:
                            // If previous instruction is LOAD and is currently in EX stage, data is not ready until MEM stage!
                            if (prevInst.instruction.opcode === 'LOAD' && prevStage === 3) {
                                idStallRequired = true;
                                stallReason = `Load-Use Data Hazard on ${targetReg} with I${prevIdx + 1} (LOAD). 1-cycle stall required even with Forwarding.`;
                                hazards.push({
                                    cycle,
                                    type: 'Load-Use RAW Data Hazard',
                                    consumer: `I${currentInId + 1} (${currentInst.instruction.rawText})`,
                                    producer: `I${prevIdx + 1} (${prevInst.instruction.rawText})`,
                                    register: targetReg,
                                    action: 'Stall 1 cycle + Forward from MEM'
                                });
                                break;
                            } else if (prevStage === 2 || prevStage === 3) {
                                // Data forwarding resolves this without stall!
                                hazards.push({
                                    cycle,
                                    type: 'RAW Hazard Resolved via Forwarding',
                                    consumer: `I${currentInId + 1} (${currentInst.instruction.rawText})`,
                                    producer: `I${prevIdx + 1} (${prevInst.instruction.rawText})`,
                                    register: targetReg,
                                    action: prevStage === 3 ? 'Forward MEM->EX' : 'Forward EX->EX'
                                });
                            }
                        }
                    }
                }

                if (idStallRequired) {
                    // Instruction in ID is stalled; stays in ID
                    stageHistory[currentInId][cycle] = 'STALL';
                } else {
                    stageHistory[currentInId][cycle] = 'ID';
                    
                    // Check for Control Hazard (JMP instruction decoded in ID)
                    if (currentInst.instruction.opcode === 'JMP') {
                        // The next sequential instruction fetched speculatively must be flushed or stalled
                        hazards.push({
                            cycle,
                            type: 'Control Hazard (Branch Penalty)',
                            consumer: `I${currentInId + 1} (JMP)`,
                            producer: `PC Update Target`,
                            register: 'PC',
                            action: '1 Branch Delay penalty'
                        });
                    }

                    currentInst.currentStageIdx = 2; // Advance to EX next cycle
                }
            }

            // 5. IF Stage (Instruction Fetch)
            // If ID is stalled, IF must also stall to avoid overwriting the IF/ID pipeline register
            if (idStallRequired) {
                // If there was an instruction in IF that was waiting to decode, keep it in IF or stall
                for (let i = 0; i < n; i++) {
                    if (instStates[i].currentStageIdx === 0) {
                        stageHistory[i][cycle] = 'STALL';
                        // Keep currentStageIdx = 0
                    }
                }
            } else {
                // Advance any instruction currently in IF to ID
                for (let i = 0; i < n; i++) {
                    if (instStates[i].currentStageIdx === 0) {
                        stageHistory[i][cycle] = 'IF';
                        instStates[i].currentStageIdx = 1;
                        break;
                    }
                }

                // If next instruction can be fetched
                if (nextFetchIdx < n && instStates[nextFetchIdx].currentStageIdx === -1) {
                    stageHistory[nextFetchIdx][cycle] = 'IF';
                    instStates[nextFetchIdx].currentStageIdx = 1;
                    nextFetchIdx++;
                }
            }

            // Fill empty slots for non-active instructions during this cycle
            for (let i = 0; i < n; i++) {
                if (!stageHistory[i][cycle]) {
                    stageHistory[i][cycle] = '-';
                }
            }

            cycleLogs.push({
                cycle,
                stallReason,
                actions: cycleActions
            });
        }

        const totalCycles = cycle;
        const nonPipelinedCycles = n * 5;
        const cpi = parseFloat((totalCycles / n).toFixed(2));
        const speedup = parseFloat((nonPipelinedCycles / totalCycles).toFixed(2));
        const throughput = parseFloat((n / totalCycles).toFixed(3));

        // Format grid for Gantt chart
        const grid = instructions.map((inst, idx) => ({
            index: idx + 1,
            text: inst.rawText,
            opcode: inst.opcode,
            cycles: stageHistory[idx].slice(1) // 1-indexed cycles
        }));

        return {
            instructionCount: n,
            totalCycles,
            nonPipelinedCycles,
            cpi,
            speedup,
            throughput,
            forwardingEnabled: forwarding,
            grid,
            hazards,
            cycleLogs
        };
    }

    getReadRegisters(inst) {
        const regs = [];
        if (inst.opcode === 'ADD' || inst.opcode === 'SUB') {
            if (inst.destReg) regs.push(inst.destReg); // In ADD Rd, Rs, Rd is both read and written
            if (inst.srcReg) regs.push(inst.srcReg);
        } else if (inst.opcode === 'STORE') {
            if (inst.destReg) regs.push(inst.destReg); // Store source register
        } else if (inst.opcode === 'LOAD') {
            if (inst.srcReg) regs.push(inst.srcReg); // Base register if any
        }
        return regs;
    }
}
