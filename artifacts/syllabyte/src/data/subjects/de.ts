import { Subject } from "../types";

export const de: Subject = {
  id: "de",
  name: "Digital Electronics",
  code: "26PCC-ECE-206H",
  colorClass: "orange",
  units: [
    {
      id: "de-u1",
      name: "Unit I: Introduction to Digital Techniques",
      topics: [
        { id: "de-u1-t1", name: "Digital systems, logic circuits, analysis, design and implementation" },
        { id: "de-u1-t2", name: "Number systems and codes: binary, octal, hexadecimal" },
        { id: "de-u1-t3", name: "Base conversions and binary/octal/hex arithmetic" },
        { id: "de-u1-t4", name: "Signed numbers, fixed-point and floating-point representation" },
        { id: "de-u1-t5", name: "Binary codes: BCD, Excess-3, Gray code" },
        { id: "de-u1-t6", name: "Error detection and correction: parity check, Hamming code" },
        { id: "de-u1-t7", name: "Canonical and standard forms, SOP/POS simplification, K-Map, Q-M method, don't care conditions" },
      ],
    },
    {
      id: "de-u2",
      name: "Unit II: Logic Families and Combinational Design",
      topics: [
        { id: "de-u2-t1", name: "Logic families: RTL, TTL, ECL, CMOS and characteristics" },
        { id: "de-u2-t2", name: "Propagation delay, power dissipation, fan-in, fan-out, noise margin" },
        { id: "de-u2-t3", name: "Encoders, decoders, multiplexers, demultiplexers as logic elements" },
        { id: "de-u2-t4", name: "Parity circuits and comparators" },
        { id: "de-u2-t5", name: "Arithmetic modules: adders, subtractors, BCD arithmetic circuits" },
      ],
    },
    {
      id: "de-u3",
      name: "Unit III: Sequential Circuits",
      topics: [
        { id: "de-u3-t1", name: "State machines and sequential controllers" },
        { id: "de-u3-t2", name: "Latches and flip-flops: SR, D, JK, T" },
        { id: "de-u3-t3", name: "Timing hazards and races" },
        { id: "de-u3-t4", name: "Analysis of state machines using D and JK flip-flops" },
        { id: "de-u3-t5", name: "Design of state machines: state table, state assignment, transition/excitation table" },
      ],
    },
    {
      id: "de-u4",
      name: "Unit IV: State Machine Design, Registers, Counters, and Memory",
      topics: [
        { id: "de-u4-t1", name: "State machine design using ASM charts" },
        { id: "de-u4-t2", name: "State machine design using state diagrams" },
        { id: "de-u4-t3", name: "Registers" },
        { id: "de-u4-t4", name: "Asynchronous and synchronous counters" },
        { id: "de-u4-t5", name: "Up/down counters, ring counters, Johnson counters" },
        { id: "de-u4-t6", name: "Memory organization, functional diagram, and memory operations" },
        { id: "de-u4-t7", name: "Semiconductor memories: read/write memories, ROM" },
        { id: "de-u4-t8", name: "Programmable logic devices: PLA, PAL, GAL, sequential PLDs" },
        { id: "de-u4-t9", name: "Introduction to FPGAs and ASICs" },
      ],
    },
  ],
};