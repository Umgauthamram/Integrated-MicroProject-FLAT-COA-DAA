/**
 * flat_lexer.js - Formal Languages and Automata Theory (FLAT) Module
 * Deterministic Finite Automaton (DFA) Lexical Analyzer & Micro-Instruction Validator
 * 
 * Formal Definition:
 * M = (Q, Sigma, delta, q0, F)
 * Q = { q0, q1, q2, q3, q4, q_accept, q_reject }
 * Sigma = { LOAD, STORE, ADD, SUB, JMP, R0-R7, Numbers (0-255), Comma (,), Semicolon (;) }
 * q0 = Initial state
 * F = { q_accept }
 * Dead/Error state = q_reject
 */

// Token Types
export const TokenType = {
    OPCODE: 'OPCODE',
    REGISTER: 'REGISTER',
    NUMBER: 'NUMBER',
    COMMA: 'COMMA',
    SEMICOLON: 'SEMICOLON',
    UNKNOWN: 'UNKNOWN'
};

// Supported Opcodes and their binary representations
export const OPCODES = {
    'LOAD':  { code: '001', type: 'MEM_LOAD',  format: 'REG_ADDR' },
    'STORE': { code: '010', type: 'MEM_STORE', format: 'REG_ADDR' },
    'ADD':   { code: '011', type: 'ARITHMETIC', format: 'REG_REG' },
    'SUB':   { code: '100', type: 'ARITHMETIC', format: 'REG_REG' },
    'JMP':   { code: '101', type: 'BRANCH',     format: 'ADDR_ONLY' }
};

// Valid registers R0 - R7
export const REGISTERS = {
    'R0': '000', 'R1': '001', 'R2': '010', 'R3': '011',
    'R4': '100', 'R5': '101', 'R6': '110', 'R7': '111'
};

export class FlatLexer {
    constructor() {
        this.states = ['q0', 'q1', 'q2', 'q3', 'q4', 'q_accept', 'q_reject'];
        this.startState = 'q0';
        this.acceptState = 'q_accept';
        this.rejectState = 'q_reject';
    }

    /**
     * Lexically tokenize an input string into recognized microcode tokens
     */
    tokenize(rawLine) {
        const tokens = [];
        const cleaned = rawLine.trim();
        if (!cleaned || cleaned.startsWith('#') || cleaned.startsWith('//')) {
            return tokens; // ignore comments or blank lines
        }

        // Regex pattern to extract tokens: words/registers, numbers, commas, semicolons
        const regex = /([A-Za-z][A-Za-z0-9]*)|([0-9]+)|(,)|(;)|(\S)/g;
        let match;

        while ((match = regex.exec(cleaned)) !== null) {
            const [full, word, num, comma, semi, other] = match;
            const index = match.index;

            if (word) {
                const upper = word.toUpperCase();
                if (OPCODES[upper]) {
                    tokens.push({ type: TokenType.OPCODE, value: upper, raw: word, pos: index });
                } else if (REGISTERS[upper]) {
                    tokens.push({ type: TokenType.REGISTER, value: upper, raw: word, pos: index });
                } else {
                    tokens.push({ type: TokenType.UNKNOWN, value: word, raw: word, pos: index });
                }
            } else if (num !== undefined) {
                const val = parseInt(num, 10);
                tokens.push({ type: TokenType.NUMBER, value: val, raw: num, pos: index });
            } else if (comma) {
                tokens.push({ type: TokenType.COMMA, value: ',', raw: ',', pos: index });
            } else if (semi) {
                tokens.push({ type: TokenType.SEMICOLON, value: ';', raw: ';', pos: index });
            } else if (other) {
                tokens.push({ type: TokenType.UNKNOWN, value: other, raw: other, pos: index });
            }
        }

        return tokens;
    }

    /**
     * DFA State Transition Function: delta(currentState, token) -> nextState
     * Grammar paths:
     * 1. ADD / SUB:  q0 --(OPCODE)--> q1 --(REG)--> q2 --(,)--> q3 --(REG)--> q4 --(;)--> q_accept
     * 2. LOAD:       q0 --(LOAD)----> q1 --(REG)--> q2 --(,)--> q3 --(NUM|REG)--> q4 --(;)--> q_accept
     * 3. STORE:      q0 --(STORE)---> q1 --(REG)--> q2 --(,)--> q3 --(NUM)--> q4 --(;)--> q_accept
     * 4. JMP:        q0 --(JMP)-----> q1 --(NUM)--> q4 --(;)--> q_accept
     */
    transition(currentState, token, instructionContext) {
        if (currentState === 'q_reject' || currentState === 'q_accept') {
            return 'q_reject';
        }

        const type = token.type;
        const val = token.value;

        switch (currentState) {
            case 'q0':
                if (type === TokenType.OPCODE) {
                    instructionContext.opcode = val;
                    return 'q1';
                }
                return 'q_reject';

            case 'q1':
                if (instructionContext.opcode === 'JMP') {
                    if (type === TokenType.NUMBER) {
                        instructionContext.target = val;
                        return 'q4';
                    }
                    return 'q_reject';
                } else {
                    // For ADD, SUB, LOAD, STORE: expects destination/source register
                    if (type === TokenType.REGISTER) {
                        instructionContext.destReg = val;
                        return 'q2';
                    }
                    return 'q_reject';
                }

            case 'q2':
                if (type === TokenType.COMMA) {
                    return 'q3';
                }
                return 'q_reject';

            case 'q3':
                if (instructionContext.opcode === 'ADD' || instructionContext.opcode === 'SUB') {
                    if (type === TokenType.REGISTER) {
                        instructionContext.srcReg = val;
                        return 'q4';
                    }
                    return 'q_reject';
                } else if (instructionContext.opcode === 'LOAD') {
                    if (type === TokenType.NUMBER) {
                        instructionContext.immediate = val;
                        return 'q4';
                    } else if (type === TokenType.REGISTER) {
                        instructionContext.srcReg = val;
                        return 'q4';
                    }
                    return 'q_reject';
                } else if (instructionContext.opcode === 'STORE') {
                    if (type === TokenType.NUMBER) {
                        instructionContext.immediate = val;
                        return 'q4';
                    }
                    return 'q_reject';
                }
                return 'q_reject';

            case 'q4':
                if (type === TokenType.SEMICOLON) {
                    return 'q_accept';
                }
                return 'q_reject';

            default:
                return 'q_reject';
        }
    }

    /**
     * Parse a single line using the DFA and generate verification + control word
     */
    parseLine(line, lineNumber = 1) {
        const tokens = this.tokenize(line);
        if (tokens.length === 0) {
            return null; // Empty line
        }

        let currentState = this.startState;
        const transitions = [];
        const instructionContext = {
            lineNumber,
            rawText: line.trim(),
            opcode: null,
            destReg: null,
            srcReg: null,
            immediate: null,
            target: null
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const prevState = currentState;
            currentState = this.transition(currentState, token, instructionContext);

            transitions.push({
                step: i + 1,
                fromState: prevState,
                token: token.raw,
                tokenType: token.type,
                toState: currentState
            });

            if (currentState === 'q_reject') {
                break;
            }
        }

        // If tokens finished but did not reach accept state (e.g. missing semicolon)
        const isAccepted = currentState === this.acceptState;

        let controlWord = null;
        let errorMessage = null;

        if (isAccepted) {
            controlWord = this.generateControlWord(instructionContext);
        } else {
            errorMessage = this.determineSyntaxError(currentState, tokens, instructionContext);
        }

        return {
            lineNumber,
            raw: line.trim(),
            tokens,
            transitions,
            finalState: currentState,
            isAccepted,
            instruction: isAccepted ? instructionContext : null,
            controlWord,
            errorMessage
        };
    }

    /**
     * Generates a 16-bit binary micro-instruction control word
     * Bit Allocation:
     * [15:13] - Opcode (3 bits)
     * [12:10] - Dest Register (3 bits)
     * [9:7]   - Source Register (3 bits)
     * [6:0]   - Immediate / Address value (7 bits)
     * Plus individual control flags: RegWrite, ALUSrc, MemRead, MemWrite, Branch
     */
    generateControlWord(ctx) {
        const opMeta = OPCODES[ctx.opcode] || { code: '000', type: 'UNKNOWN' };
        const opBits = opMeta.code;
        const destBits = ctx.destReg ? REGISTERS[ctx.destReg] : '000';
        const srcBits = ctx.srcReg ? REGISTERS[ctx.srcReg] : '000';
        
        let immVal = 0;
        if (ctx.immediate !== null && ctx.immediate !== undefined) {
            immVal = ctx.immediate & 0x7F; // 7-bit clamp
        } else if (ctx.target !== null && ctx.target !== undefined) {
            immVal = ctx.target & 0x7F;
        }
        const immBits = immVal.toString(2).padStart(7, '0');

        const binaryWord = `${opBits}_${destBits}_${srcBits}_${immBits}`;
        const hexWord = '0x' + parseInt(binaryWord.replace(/_/g, ''), 2).toString(16).toUpperCase().padStart(4, '0');

        // Micro-architectural control signals
        const signals = {
            RegWrite: (ctx.opcode === 'LOAD' || ctx.opcode === 'ADD' || ctx.opcode === 'SUB') ? 1 : 0,
            ALUSrc: (ctx.opcode === 'LOAD' || ctx.opcode === 'STORE') ? 1 : 0, // 0 for Reg, 1 for Imm
            ALUOp: (ctx.opcode === 'SUB') ? 'SUB' : (ctx.opcode === 'ADD' ? 'ADD' : 'PASS'),
            MemRead: (ctx.opcode === 'LOAD') ? 1 : 0,
            MemWrite: (ctx.opcode === 'STORE') ? 1 : 0,
            Branch: (ctx.opcode === 'JMP') ? 1 : 0
        };

        return {
            binary: binaryWord,
            hex: hexWord,
            signals,
            fields: {
                opcode: { bits: opBits, name: ctx.opcode },
                destReg: { bits: destBits, name: ctx.destReg || 'None' },
                srcReg: { bits: srcBits, name: ctx.srcReg || 'None' },
                immediate: { bits: immBits, value: immVal }
            }
        };
    }

    determineSyntaxError(state, tokens, ctx) {
        if (tokens.length === 0) return 'Empty statement.';
        if (!tokens[0] || tokens[0].type !== TokenType.OPCODE) {
            return `Syntax Error: Invalid instruction mnemonic '${tokens[0]?.raw || ''}'. Expected LOAD, STORE, ADD, SUB, or JMP.`;
        }
        if (state === 'q1' || (tokens.length === 1)) {
            return `Syntax Error: Incomplete instruction after '${tokens[0].value}'. Missing operands.`;
        }
        if (state === 'q2') {
            return `Syntax Error: Expected comma separator ',' after operand '${tokens[1]?.raw}'.`;
        }
        if (state === 'q3') {
            return `Syntax Error: Missing second operand after comma.`;
        }
        if (state === 'q4' || tokens[tokens.length - 1]?.type !== TokenType.SEMICOLON) {
            return `Syntax Error: Missing instruction terminator semicolon ';'.`;
        }
        return `Syntax Error: Invalid microcode sequence at token '${tokens[tokens.length - 1]?.raw}'.`;
    }

    /**
     * Parse complete program text line-by-line
     */
    parseProgram(programText) {
        const lines = programText.split('\n');
        const results = [];
        let allValid = true;

        for (let i = 0; i < lines.length; i++) {
            const parsed = this.parseLine(lines[i], i + 1);
            if (parsed) {
                results.push(parsed);
                if (!parsed.isAccepted) {
                    allValid = false;
                }
            }
        }

        return {
            totalLines: lines.length,
            validInstructions: results.filter(r => r.isAccepted),
            allValid,
            lines: results
        };
    }
}
