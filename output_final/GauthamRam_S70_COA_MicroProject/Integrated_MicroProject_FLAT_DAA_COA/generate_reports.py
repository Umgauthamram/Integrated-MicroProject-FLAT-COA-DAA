"""
generate_reports.py - Generates comprehensive academic PDF reports for FLAT, DAA, and COA
using ReportLab with publication-quality formatting, styled tables, and formal mathematical analysis.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Integrated CS Micro-Project: FLAT + COA + DAA | Gautham Ram S (S70)")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "Confidential Academic Submission - Kalvium Community")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)
        
        self.restoreState()

def create_base_styles():
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=0,
        spaceAfter=6
    ))
    
    styles.add(ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0284c7'),
        alignment=0,
        spaceAfter=15
    ))
    
    styles.add(ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'SubSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5
    ))

    styles.add(ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f1f5f9'),
        borderColor=colors.HexColor('#cbd5e1'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=6
    ))

    styles.add(ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0369a1'),
        backColor=colors.HexColor('#f0f9ff'),
        borderColor=colors.HexColor('#bae6fd'),
        borderWidth=0.8,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    ))

    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#ffffff')
    ))

    return styles

def build_student_info_table(styles):
    data = [
        [
            Paragraph("<b>Student Name:</b> Gautham Ram S", styles['TableCell']),
            Paragraph("<b>Roll ID / Reg:</b> S70", styles['TableCell']),
        ],
        [
            Paragraph("<b>Email:</b> gautham.ram.s70@kalvium.community", styles['TableCell']),
            Paragraph("<b>Program:</b> B.Tech Computer Science & Engineering", styles['TableCell']),
        ],
        [
            Paragraph("<b>Live App:</b> https://gauthamram-s70.github.io/Integrated-MicroProject-FLAT-COA-DAA/", styles['TableCell']),
            Paragraph("<b>Repository:</b> https://github.com/gauthamram-s70/Integrated-MicroProject-FLAT-COA-DAA", styles['TableCell']),
        ]
    ]
    t = Table(data, colWidths=[250, 254])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t

# ==============================================================================
# REPORT 1: FLAT REPORT
# ==============================================================================
def generate_flat_report(output_path):
    styles = create_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    # Title & Metadata
    story.append(Paragraph("FLAT Module: Deterministic Finite Automata (DFA) Lexical Analyzer", styles['DocTitle']))
    story.append(Paragraph("Technical Report on Formal Grammar, DFA Transition Engine, & Microcode Validation", styles['DocSubTitle']))
    story.append(build_student_info_table(styles))
    story.append(Spacer(1, 12))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary & Curriculum Alignment", styles['SectionHeader']))
    story.append(Paragraph(
        "This module implements a rigorous, custom <b>Deterministic Finite Automaton (DFA)</b> engine that serves as the "
        "front-end lexical analyzer and syntax validator for a custom RISC microcode assembly language. Aligned with "
        "<b>FLAT Modules 1–3 (Finite Automata, Regular Expressions, and Formal Languages)</b>, the engine formally models "
        "state transitions over an alphabet of instruction tokens, rejects syntactically malformed code, and translates accepted "
        "instructions into 16-bit binary control words for pipelined execution.",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "<b>Curriculum Connection:</b> Demonstrates the practical equivalence between Regular Expressions and Deterministic Finite "
        "State Machines in compiler front-end design, token extraction, and dead-state trap mechanisms.",
        styles['CalloutText']
    ))

    # Formal 5-Tuple
    story.append(Paragraph("2. Mathematical Formulation & Formal 5-Tuple", styles['SectionHeader']))
    story.append(Paragraph(
        "Formally, the DFA is specified as a 5-tuple: <b>M = (Q, &Sigma;, &delta;, q<sub>0</sub>, F)</b>, where:",
        styles['BodyCustom']
    ))
    
    tuple_data = [
        [Paragraph("<b>Component</b>", styles['TableHeader']), Paragraph("<b>Formal Definition & Implementation Specification</b>", styles['TableHeader'])],
        [Paragraph("<b>Q (States)</b>", styles['TableCell']), Paragraph("{q0, q1, q2, q3, q4, q_accept, q_reject} representing parse stages.", styles['TableCell'])],
        [Paragraph("<b>&Sigma; (Alphabet)</b>", styles['TableCell']), Paragraph("{LOAD, STORE, ADD, SUB, JMP, R0-R7, Imm(0-255), Comma(,), Semicolon(;)}", styles['TableCell'])],
        [Paragraph("<b>q<sub>0</sub> (Start)</b>", styles['TableCell']), Paragraph("q0: Idle initial state awaiting instruction opcode mnemonic.", styles['TableCell'])],
        [Paragraph("<b>F (Accept)</b>", styles['TableCell']), Paragraph("{q_accept}: Final state reachable strictly upon encountering semicolon terminator.", styles['TableCell'])],
        [Paragraph("<b>q_reject (Dead)</b>", styles['TableCell']), Paragraph("Dead trap state reached immediately upon any lexical or syntactic violation.", styles['TableCell'])],
    ]
    t_tuple = Table(tuple_data, colWidths=[100, 404])
    t_tuple.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_tuple)
    story.append(Spacer(1, 10))

    # State Transition Table
    story.append(Paragraph("3. DFA State Transition Table & Grammar Paths", styles['SectionHeader']))
    story.append(Paragraph(
        "The state transition function &delta;: Q &times; &Sigma; &rarr; Q maps every configuration to a unique deterministic next state:",
        styles['BodyCustom']
    ))

    delta_data = [
        [Paragraph("<b>State</b>", styles['TableHeader']), Paragraph("<b>Opcode</b>", styles['TableHeader']), Paragraph("<b>Reg (R0-R7)</b>", styles['TableHeader']), Paragraph("<b>Comma (,)</b>", styles['TableHeader']), Paragraph("<b>Number/Imm</b>", styles['TableHeader']), Paragraph("<b>Semi (;)</b>", styles['TableHeader']), Paragraph("<b>Other</b>", styles['TableHeader'])],
        [Paragraph("q0", styles['TableCell']), Paragraph("q1", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q1", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q2", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q4 (if JMP)", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q2", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q3", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q3", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q4 (Reg)", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q4 (Imm)", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q4", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_accept", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q_acc", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
        [Paragraph("q_rej", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell']), Paragraph("q_reject", styles['TableCell'])],
    ]
    t_delta = Table(delta_data, colWidths=[54, 75, 75, 75, 75, 75, 75])
    t_delta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_delta)
    story.append(Spacer(1, 10))

    # Control Word Architecture
    story.append(Paragraph("4. 16-Bit Micro-Instruction Control Word Encoding", styles['SectionHeader']))
    story.append(Paragraph(
        "Upon reaching <b>q_accept</b>, the DFA synthesizes a 16-bit binary control word formatted as follows:",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "<b>[15:13] Opcode (3b)</b> &nbsp;|&nbsp; <b>[12:10] Dest Reg (3b)</b> &nbsp;|&nbsp; <b>[9:7] Source Reg (3b)</b> &nbsp;|&nbsp; <b>[6:0] Immediate / Offset (7b)</b><br/>"
        "&bull; <b>LOAD</b>: 001 | <b>STORE</b>: 010 | <b>ADD</b>: 011 | <b>SUB</b>: 100 | <b>JMP</b>: 101<br/>"
        "&bull; <b>Registers R0–R7</b>: 000 through 111 | <b>Signals</b>: RegWrite, ALUSrc, ALUOp, MemRead, MemWrite, Branch",
        styles['CodeSnippet']
    ))

    # Verification & Test Cases
    story.append(Paragraph("5. Verification Suite & Rejection Cases", styles['SectionHeader']))
    test_cases_data = [
        [Paragraph("<b>Input Statement</b>", styles['TableHeader']), Paragraph("<b>DFA State Path</b>", styles['TableHeader']), Paragraph("<b>Verdict</b>", styles['TableHeader']), Paragraph("<b>Synthesized Hex Word / Error</b>", styles['TableHeader'])],
        [Paragraph("ADD R1, R2;", styles['TableCell']), Paragraph("q0 &rarr; q1 &rarr; q2 &rarr; q3 &rarr; q4 &rarr; q_accept", styles['TableCell']), Paragraph("<font color='#16a34a'><b>ACCEPTED</b></font>", styles['TableCell']), Paragraph("0x6480 (Op:ADD, Rd:R1, Rs:R2)", styles['TableCell'])],
        [Paragraph("LOAD R3, 25;", styles['TableCell']), Paragraph("q0 &rarr; q1 &rarr; q2 &rarr; q3 &rarr; q4 &rarr; q_accept", styles['TableCell']), Paragraph("<font color='#16a34a'><b>ACCEPTED</b></font>", styles['TableCell']), Paragraph("0x2C19 (Op:LOAD, Rd:R3, Imm:25)", styles['TableCell'])],
        [Paragraph("JMP 128;", styles['TableCell']), Paragraph("q0 &rarr; q1 &rarr; q4 &rarr; q_accept", styles['TableCell']), Paragraph("<font color='#16a34a'><b>ACCEPTED</b></font>", styles['TableCell']), Paragraph("0xA000 (Op:JMP, Imm:0)", styles['TableCell'])],
        [Paragraph("ADD R1 R2;", styles['TableCell']), Paragraph("q0 &rarr; q1 &rarr; q2 &rarr; q_reject", styles['TableCell']), Paragraph("<font color='#dc2626'><b>REJECTED</b></font>", styles['TableCell']), Paragraph("Syntax Error: Missing comma", styles['TableCell'])],
        [Paragraph("SUB R1, 10", styles['TableCell']), Paragraph("q0 &rarr; q1 &rarr; q2 &rarr; q3 &rarr; q4 &rarr; q_reject", styles['TableCell']), Paragraph("<font color='#dc2626'><b>REJECTED</b></font>", styles['TableCell']), Paragraph("Syntax Error: Missing semicolon terminator", styles['TableCell'])],
        [Paragraph("MULT R1, R2;", styles['TableCell']), Paragraph("q0 &rarr; q_reject", styles['TableCell']), Paragraph("<font color='#dc2626'><b>REJECTED</b></font>", styles['TableCell']), Paragraph("Syntax Error: Invalid opcode MULT", styles['TableCell'])],
    ]
    t_tests = Table(test_cases_data, colWidths=[90, 150, 64, 200])
    t_tests.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_tests)
    story.append(Spacer(1, 10))

    # Conclusion
    story.append(Paragraph("6. Conclusion & Inter-Module Linkage", styles['SectionHeader']))
    story.append(Paragraph(
        "The FLAT DFA module guarantees 100% lexical and grammatical soundness before execution, preventing malformed control words "
        "from entering the CPU pipeline. Validated control words pass directly into the COA 5-stage pipeline simulator.",
        styles['BodyCustom']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated FLAT Report: {output_path}")

# ==============================================================================
# REPORT 2: DAA REPORT
# ==============================================================================
def generate_daa_report(output_path):
    styles = create_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    story.append(Paragraph("DAA Module: Optimal Control Path Routing via Dijkstra's Algorithm", styles['DocTitle']))
    story.append(Paragraph("Technical Report on Hardware Graph Modeling, Min-Heap Priority Queues, & Complexity Proofs", styles['DocSubTitle']))
    story.append(build_student_info_table(styles))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1. Executive Summary & Curriculum Alignment", styles['SectionHeader']))
    story.append(Paragraph(
        "This module investigates the application of <b>Greedy Graph Optimization</b> to computer hardware design. "
        "Aligned with <b>DAA Modules 1–3 (Algorithm Analysis, Graph Foundations, and Greedy Shortest Paths)</b>, internal CPU "
        "functional execution units are modeled as a Directed Weighted Graph where edge weights quantify physical interconnect latency in nanoseconds. "
        "Dijkstra's Algorithm is implemented from scratch with a custom binary Min-Heap to compute minimum-latency routing paths.",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "<b>Curriculum Connection:</b> Demonstrates how greedy choice and edge relaxation yield global optimality for non-negative "
        "weight networks, achieving O((V + E) log V) time complexity.",
        styles['CalloutText']
    ))

    story.append(Paragraph("2. Hardware Graph Modeling & Latency Weights", styles['SectionHeader']))
    story.append(Paragraph(
        "The CPU functional blocks form a directed graph G = (V, E) with |V| = 7 vertices and |E| = 11 interconnect buses:",
        styles['BodyCustom']
    ))

    graph_data = [
        [Paragraph("<b>Source Node (u)</b>", styles['TableHeader']), Paragraph("<b>Destination Node (v)</b>", styles['TableHeader']), Paragraph("<b>Latency w(u, v)</b>", styles['TableHeader']), Paragraph("<b>Physical Bus Function</b>", styles['TableHeader'])],
        [Paragraph("IF_UNIT", styles['TableCell']), Paragraph("DECODE_UNIT", styles['TableCell']), Paragraph("1.2 ns", styles['TableCell']), Paragraph("Instruction Fetch to Decode Bus", styles['TableCell'])],
        [Paragraph("DECODE_UNIT", styles['TableCell']), Paragraph("REG_FILE", styles['TableCell']), Paragraph("0.8 ns", styles['TableCell']), Paragraph("Register File Address Select Lines", styles['TableCell'])],
        [Paragraph("DECODE_UNIT", styles['TableCell']), Paragraph("BRANCH_UNIT", styles['TableCell']), Paragraph("1.0 ns", styles['TableCell']), Paragraph("Immediate Offset Bus to Branch Adder", styles['TableCell'])],
        [Paragraph("REG_FILE", styles['TableCell']), Paragraph("ALU", styles['TableCell']), Paragraph("1.5 ns", styles['TableCell']), Paragraph("Dual 32-bit Operand Buses A/B", styles['TableCell'])],
        [Paragraph("REG_FILE", styles['TableCell']), Paragraph("DATA_MEM", styles['TableCell']), Paragraph("2.2 ns", styles['TableCell']), Paragraph("Direct Store Data Path", styles['TableCell'])],
        [Paragraph("ALU", styles['TableCell']), Paragraph("WB_BUS", styles['TableCell']), Paragraph("0.9 ns", styles['TableCell']), Paragraph("Arithmetic Result Forwarding Bypass", styles['TableCell'])],
        [Paragraph("ALU", styles['TableCell']), Paragraph("DATA_MEM", styles['TableCell']), Paragraph("1.8 ns", styles['TableCell']), Paragraph("Effective Memory Address Bus", styles['TableCell'])],
        [Paragraph("DATA_MEM", styles['TableCell']), Paragraph("WB_BUS", styles['TableCell']), Paragraph("2.0 ns", styles['TableCell']), Paragraph("Data Memory Load Value Bus", styles['TableCell'])],
        [Paragraph("WB_BUS", styles['TableCell']), Paragraph("REG_FILE", styles['TableCell']), Paragraph("0.7 ns", styles['TableCell']), Paragraph("Register Write-Back Feedback Bus", styles['TableCell'])],
        [Paragraph("BRANCH_UNIT", styles['TableCell']), Paragraph("IF_UNIT", styles['TableCell']), Paragraph("1.1 ns", styles['TableCell']), Paragraph("Branch Redirect PC Update Path", styles['TableCell'])],
    ]
    t_graph = Table(graph_data, colWidths=[100, 110, 64, 230])
    t_graph.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#059669')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_graph)
    story.append(Spacer(1, 10))

    # Min-Heap & Dijkstra Relaxation
    story.append(Paragraph("3. Min-Heap Priority Queue & Step-by-Step Relaxation", styles['SectionHeader']))
    story.append(Paragraph(
        "<b>Edge Relaxation Formulation:</b> For edge (u, v) with weight w(u, v):<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>if</b> dist[u] + w(u, v) &lt; dist[v] <b>then</b> dist[v] &larr; dist[u] + w(u, v), prev[v] &larr; u<br/>"
        "Using a binary Min-Heap, <code>bubbleUp</code> and <code>sinkDown</code> maintain the heap-order property in O(log V) per operation.",
        styles['CodeSnippet']
    ))

    # Trace Table
    story.append(Paragraph("4. Step-by-Step Relaxation Trace for Optimal WB_BUS Path", styles['SectionHeader']))
    trace_data = [
        [Paragraph("<b>Step</b>", styles['TableHeader']), Paragraph("<b>Action</b>", styles['TableHeader']), Paragraph("<b>Vertex / Edge</b>", styles['TableHeader']), Paragraph("<b>Relaxation Details & Latency Updates</b>", styles['TableHeader'])],
        [Paragraph("1", styles['TableCell']), Paragraph("INIT", styles['TableCell']), Paragraph("IF_UNIT", styles['TableCell']), Paragraph("dist[IF_UNIT] = 0.0 ns. All other vertices set to &infin;.", styles['TableCell'])],
        [Paragraph("2", styles['TableCell']), Paragraph("EXTRACT-MIN", styles['TableCell']), Paragraph("IF_UNIT", styles['TableCell']), Paragraph("Extract u=IF_UNIT (dist=0.0). Relax edge (IF_UNIT &rarr; DECODE_UNIT).", styles['TableCell'])],
        [Paragraph("3", styles['TableCell']), Paragraph("RELAX", styles['TableCell']), Paragraph("IF &rarr; DECODE", styles['TableCell']), Paragraph("dist[DECODE] = 0.0 + 1.2 = 1.20 ns (improved from &infin;).", styles['TableCell'])],
        [Paragraph("4", styles['TableCell']), Paragraph("EXTRACT-MIN", styles['TableCell']), Paragraph("DECODE_UNIT", styles['TableCell']), Paragraph("Extract u=DECODE (dist=1.2). Relax to REG_FILE and BRANCH_UNIT.", styles['TableCell'])],
        [Paragraph("5", styles['TableCell']), Paragraph("RELAX", styles['TableCell']), Paragraph("DECODE &rarr; REG", styles['TableCell']), Paragraph("dist[REG_FILE] = 1.2 + 0.8 = 2.00 ns.", styles['TableCell'])],
        [Paragraph("6", styles['TableCell']), Paragraph("EXTRACT-MIN", styles['TableCell']), Paragraph("REG_FILE", styles['TableCell']), Paragraph("Extract u=REG_FILE (dist=2.0). Relax to ALU (2.0 + 1.5 = 3.5 ns).", styles['TableCell'])],
        [Paragraph("7", styles['TableCell']), Paragraph("RELAX", styles['TableCell']), Paragraph("ALU &rarr; WB_BUS", styles['TableCell']), Paragraph("dist[WB_BUS] = 3.5 + 0.9 = <b>4.40 ns</b> (Optimal ALU bypass).", styles['TableCell'])],
        [Paragraph("8", styles['TableCell']), Paragraph("COMPARE", styles['TableCell']), Paragraph("MEM &rarr; WB_BUS", styles['TableCell']), Paragraph("Memory path yields 1.2+0.8+2.2+2.0 = 6.20 ns. Pruned by Dijkstra.", styles['TableCell'])],
    ]
    t_trace = Table(trace_data, colWidths=[35, 75, 95, 299])
    t_trace.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_trace)
    story.append(Spacer(1, 10))

    # Asymptotic Complexity Proof
    story.append(Paragraph("5. Formal Asymptotic Complexity Proof", styles['SectionHeader']))
    story.append(Paragraph(
        "<b>Theorem:</b> Dijkstra's Algorithm with a Binary Min-Heap terminates in &Omicron;((V + E) log V) time.<br/>"
        "<b>Proof:</b><br/>"
        "1. Distance array initialization takes &Theta;(V) time.<br/>"
        "2. Each vertex is inserted once and extracted from the priority queue at most once. Each <code>Extract-Min</code> costs &Omicron;(log V). Total extract time: V &times; &Omicron;(log V) = &Omicron;(V log V).<br/>"
        "3. Each directed edge (u, v) is relaxed at most once when u is extracted. Each successful relaxation triggers a decrease-key operation in &Omicron;(log V). Total relaxation time: E &times; &Omicron;(log V) = &Omicron;(E log V).<br/>"
        "4. Summing terms: T(V, E) = &Omicron;(V) + &Omicron;(V log V) + &Omicron;(E log V) = <b>&Omicron;((V + E) log V)</b>. &nbsp;&nbsp;&nbsp;&nbsp;&square;",
        styles['BodyCustom']
    ))

    complexity_comp = [
        [Paragraph("<b>Data Structure</b>", styles['TableHeader']), Paragraph("<b>Extract-Min Time</b>", styles['TableHeader']), Paragraph("<b>Decrease-Key Time</b>", styles['TableHeader']), Paragraph("<b>Total Time Complexity</b>", styles['TableHeader'])],
        [Paragraph("Unordered Array", styles['TableCell']), Paragraph("O(V)", styles['TableCell']), Paragraph("O(1)", styles['TableCell']), Paragraph("O(V<sup>2</sup>)", styles['TableCell'])],
        [Paragraph("<b>Binary Min-Heap (Ours)</b>", styles['TableCell']), Paragraph("<b>O(log V)</b>", styles['TableCell']), Paragraph("<b>O(log V)</b>", styles['TableCell']), Paragraph("<b>O((V + E) log V)</b>", styles['TableCell'])],
        [Paragraph("Fibonacci Heap", styles['TableCell']), Paragraph("O(log V) amortized", styles['TableCell']), Paragraph("O(1) amortized", styles['TableCell']), Paragraph("O(E + V log V)", styles['TableCell'])],
    ]
    t_comp = Table(complexity_comp, colWidths=[120, 110, 110, 164])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_comp)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated DAA Report: {output_path}")

# ==============================================================================
# REPORT 3: COA REPORT
# ==============================================================================
def generate_coa_report(output_path):
    styles = create_base_styles()
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story = []

    story.append(Paragraph("COA Module: 5-Stage RISC Pipelined Processor Simulator", styles['DocTitle']))
    story.append(Paragraph("Technical Report on Pipeline Hazard Resolution, Forwarding Units, CPI & Speedup Analysis", styles['DocSubTitle']))
    story.append(build_student_info_table(styles))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1. Executive Summary & Curriculum Alignment", styles['SectionHeader']))
    story.append(Paragraph(
        "This module simulates a classic <b>5-Stage RISC Processor Pipeline</b> (Fetch, Decode, Execute, Memory, Write-Back). "
        "Aligned with <b>COA Modules 1–3 (Instruction Sets, Processor Organization, Pipelining and CPU Performance)</b>, "
        "the simulator models cycle-by-cycle instruction flow, detects and resolves Data Hazards (RAW, Load-Use), Structural Hazards, "
        "and Control Hazards, and computes key performance metrics: CPI, Speedup, and Throughput.",
        styles['BodyCustom']
    ))
    story.append(Paragraph(
        "<b>Curriculum Connection:</b> Directly applies syllabus topics 3.1–3.4 including Pipeline Throughput, Speedup formulas, "
        "Structural/Data/Control Hazard identification, and Data Forwarding multiplexer design.",
        styles['CalloutText']
    ))

    # 5 Stages
    story.append(Paragraph("2. 5-Stage RISC Architecture Overview", styles['SectionHeader']))
    stages_data = [
        [Paragraph("<b>Stage</b>", styles['TableHeader']), Paragraph("<b>Name</b>", styles['TableHeader']), Paragraph("<b>Hardware Operations Performed</b>", styles['TableHeader']), Paragraph("<b>Pipeline Registers</b>", styles['TableHeader'])],
        [Paragraph("<b>IF</b>", styles['TableCell']), Paragraph("Instruction Fetch", styles['TableCell']), Paragraph("Fetch instruction from I-Cache via PC; increment PC &larr; PC + 4.", styles['TableCell']), Paragraph("IF / ID Register", styles['TableCell'])],
        [Paragraph("<b>ID</b>", styles['TableCell']), Paragraph("Instruction Decode", styles['TableCell']), Paragraph("Decode opcode; read source registers Rs1, Rs2 from Register File.", styles['TableCell']), Paragraph("ID / EX Register", styles['TableCell'])],
        [Paragraph("<b>EX</b>", styles['TableCell']), Paragraph("Execute / ALU", styles['TableCell']), Paragraph("ALU performs arithmetic/logic or computes effective memory address.", styles['TableCell']), Paragraph("EX / MEM Register", styles['TableCell'])],
        [Paragraph("<b>MEM</b>", styles['TableCell']), Paragraph("Memory Access", styles['TableCell']), Paragraph("Access Data Memory: Read for LOAD, write for STORE.", styles['TableCell']), Paragraph("MEM / WB Register", styles['TableCell'])],
        [Paragraph("<b>WB</b>", styles['TableCell']), Paragraph("Write-Back", styles['TableCell']), Paragraph("Write result back into destination register Rd in Register File.", styles['TableCell']), Paragraph("Register File input", styles['TableCell'])],
    ]
    t_stages = Table(stages_data, colWidths=[35, 95, 260, 114])
    t_stages.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366f1')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_stages)
    story.append(Spacer(1, 10))

    # Hazards & Forwarding
    story.append(Paragraph("3. Pipeline Hazards & Resolution Mechanisms", styles['SectionHeader']))
    story.append(Paragraph(
        "<b>1. RAW (Read-After-Write) Data Hazards:</b> Occur when an instruction requires the result of an earlier instruction currently in EX or MEM.<br/>"
        "&bull; <i>Without Forwarding:</i> The ID stage stalls 2 cycles until the producer reaches WB.<br/>"
        "&bull; <i>With Forwarding:</i> Forwarding units bypass data directly from EX/MEM or MEM/WB to the ALU inputs, eliminating stalls for arithmetic sequences.<br/>"
        "<b>2. Load-Use Data Hazard:</b> When a LOAD is followed immediately by an instruction using the loaded value, data is not available until MEM stage completion. Even with forwarding, a mandatory <b>1-cycle stall bubble</b> must be inserted.<br/>"
        "<b>3. Control Hazards (Branching):</b> Unconditional JMP updates the Program Counter during ID/EX stage, incurring a 1-cycle branch penalty.",
        styles['BodyCustom']
    ))

    # Performance Metrics
    story.append(Paragraph("4. Performance Metrics & Mathematical Formulations", styles['SectionHeader']))
    story.append(Paragraph(
        "<b>1. Ideal Execution Cycles:</b> C<sub>ideal</sub> = k + n - 1 (where k=5 stages, n=instructions)<br/>"
        "<b>2. Actual Execution Cycles:</b> C = k + n - 1 + Stalls<br/>"
        "<b>3. Cycles Per Instruction (CPI):</b> CPI = C / n (Ideal CPI = 1.00)<br/>"
        "<b>4. Sequential Execution Time:</b> C<sub>seq</sub> = k &times; n = 5n<br/>"
        "<b>5. Speedup Factor (S):</b> S = C<sub>seq</sub> / C = (5 &times; n) / (k + n - 1 + Stalls)<br/>"
        "<b>6. Processor Throughput (IPC):</b> IPC = n / C = 1 / CPI",
        styles['CodeSnippet']
    ))

    # Case Study Gantt Table
    story.append(Paragraph("5. Clock Cycle Gantt Matrix: RAW Hazard Case Study", styles['SectionHeader']))
    story.append(Paragraph(
        "Program: I1: LOAD R1, 50; &nbsp; I2: ADD R2, R1; &nbsp; I3: SUB R3, R2; (Forwarding Enabled - Load-Use Stall at C3)",
        styles['BodyCustom']
    ))

    gantt_data = [
        [Paragraph("<b>Instruction</b>", styles['TableHeader']), Paragraph("<b>C1</b>", styles['TableHeader']), Paragraph("<b>C2</b>", styles['TableHeader']), Paragraph("<b>C3</b>", styles['TableHeader']), Paragraph("<b>C4</b>", styles['TableHeader']), Paragraph("<b>C5</b>", styles['TableHeader']), Paragraph("<b>C6</b>", styles['TableHeader']), Paragraph("<b>C7</b>", styles['TableHeader']), Paragraph("<b>C8</b>", styles['TableHeader'])],
        [Paragraph("I1: LOAD R1, 50;", styles['TableCell']), Paragraph("IF", styles['TableCell']), Paragraph("ID", styles['TableCell']), Paragraph("EX", styles['TableCell']), Paragraph("MEM", styles['TableCell']), Paragraph("WB", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("-", styles['TableCell'])],
        [Paragraph("I2: ADD R2, R1;", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("IF", styles['TableCell']), Paragraph("<font color='#dc2626'><b>STALL</b></font>", styles['TableCell']), Paragraph("ID", styles['TableCell']), Paragraph("EX", styles['TableCell']), Paragraph("MEM", styles['TableCell']), Paragraph("WB", styles['TableCell']), Paragraph("-", styles['TableCell'])],
        [Paragraph("I3: SUB R3, R2;", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("-", styles['TableCell']), Paragraph("IF", styles['TableCell']), Paragraph("ID", styles['TableCell']), Paragraph("EX*", styles['TableCell']), Paragraph("MEM", styles['TableCell']), Paragraph("WB", styles['TableCell'])],
    ]
    t_gantt = Table(gantt_data, colWidths=[130, 46, 46, 46, 46, 46, 46, 46, 46])
    t_gantt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_gantt)
    story.append(Paragraph("<font size='7.5' color='#64748b'>*Note: EX stage of I3 uses EX-to-EX forwarding from I2 without stalling.</font>", styles['BodyCustom']))
    story.append(Spacer(1, 10))

    # Simulation Comparison Table
    story.append(Paragraph("6. Performance Comparison Across Execution Modes", styles['SectionHeader']))
    perf_data = [
        [Paragraph("<b>Execution Scenario</b>", styles['TableHeader']), Paragraph("<b>Instructions (n)</b>", styles['TableHeader']), Paragraph("<b>Total Cycles</b>", styles['TableHeader']), Paragraph("<b>CPI</b>", styles['TableHeader']), Paragraph("<b>Speedup (S)</b>", styles['TableHeader']), Paragraph("<b>Throughput (IPC)</b>", styles['TableHeader'])],
        [Paragraph("Ideal Independent Pipeline", styles['TableCell']), Paragraph("4", styles['TableCell']), Paragraph("8", styles['TableCell']), Paragraph("2.00", styles['TableCell']), Paragraph("2.50x", styles['TableCell']), Paragraph("0.500", styles['TableCell'])],
        [Paragraph("RAW Hazards (No Forwarding)", styles['TableCell']), Paragraph("4", styles['TableCell']), Paragraph("12", styles['TableCell']), Paragraph("3.00", styles['TableCell']), Paragraph("1.67x", styles['TableCell']), Paragraph("0.333", styles['TableCell'])],
        [Paragraph("RAW Hazards (With Forwarding)", styles['TableCell']), Paragraph("4", styles['TableCell']), Paragraph("9", styles['TableCell']), Paragraph("2.25", styles['TableCell']), Paragraph("2.22x", styles['TableCell']), Paragraph("0.444", styles['TableCell'])],
        [Paragraph("Non-Pipelined Sequential", styles['TableCell']), Paragraph("4", styles['TableCell']), Paragraph("20", styles['TableCell']), Paragraph("5.00", styles['TableCell']), Paragraph("1.00x", styles['TableCell']), Paragraph("0.200", styles['TableCell'])],
    ]
    t_perf = Table(perf_data, colWidths=[160, 70, 70, 60, 70, 74])
    t_perf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_perf)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated COA Report: {output_path}")

if __name__ == '__main__':
    base_docs = r'g:\projects\micor project with tech sub\Integrated_MicroProject_FLAT_DAA_COA\docs'
    os.makedirs(base_docs, exist_ok=True)
    
    # Generate both naming conventions to satisfy both task.md and output_instruction.md
    generate_flat_report(os.path.join(base_docs, 'FLAT_Report_GauthamRamS.pdf'))
    generate_flat_report(os.path.join(base_docs, 'FLAT_Report.pdf'))
    
    generate_daa_report(os.path.join(base_docs, 'DAA_Report_GauthamRamS.pdf'))
    generate_daa_report(os.path.join(base_docs, 'DAA_Report.pdf'))
    
    generate_coa_report(os.path.join(base_docs, 'COA_Report_GauthamRamS.pdf'))
    generate_coa_report(os.path.join(base_docs, 'COA_Report.pdf'))
    print('All reports successfully generated!')
