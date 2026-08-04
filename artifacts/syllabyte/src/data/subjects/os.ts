import { Subject } from "../types";

export const os: Subject = {
  id: "os",
  name: "Operating Systems",
  code: "26PCC-CSE-205H",
  colorClass: "green",
  units: [
    {
      id: "os-u1",
      name: "Unit I: Introduction, Processes & Process Scheduling",
      topics: [
        {
          id: "os-u1-t1",
          name: "Introduction to Operating Systems",
        },
        {
          id: "os-u1-t2",
          name: "Concept of Operating Systems",
        },
        {
          id: "os-u1-t3",
          name: "Generations of Operating Systems",
        },
        {
          id: "os-u1-t4",
          name: "Types of Operating Systems",
        },
        {
          id: "os-u1-t5",
          name: "OS Functions & Objectives",
        },
        {
          id: "os-u1-t6",
          name: "Processes – Definition & Concepts",
        },
        {
          id: "os-u1-t7",
          name: "Process Relationship",
        },
        {
          id: "os-u1-t8",
          name: "Different States of a Process",
        },
        {
          id: "os-u1-t9",
          name: "Process State Transitions",
        },
        {
          id: "os-u1-t10",
          name: "Process Control Block (PCB)",
        },
        {
          id: "os-u1-t11",
          name: "Light Weight & Heavy Weight Processes",
        },
        {
          id: "os-u1-t12",
          name: "Process Scheduling – Foundation & Objectives",
        },
        {
          id: "os-u1-t13",
          name: "Long-Term & Short-Term Schedulers",
        },
        {
          id: "os-u1-t14",
          name: "Dispatcher & Context Switching",
        },
        {
          id: "os-u1-t15",
          name: "Scheduling Criteria",
        },
        {
          id: "os-u1-t16",
          name: "CPU Utilization & Throughput",
        },
        {
          id: "os-u1-t17",
          name: "Turnaround, Waiting & Response Time",
        },
        {
          id: "os-u1-t18",
          name: "Preemptive & Non-Preemptive Scheduling",
        },
        {
          id: "os-u1-t19",
          name: "FCFS (First Come First Serve) Scheduling",
        },
        {
          id: "os-u1-t20",
          name: "SJF (Shortest Job First) Scheduling",
        },
        {
          id: "os-u1-t21",
          name: "SRTF (Shortest Remaining Time First) Scheduling",
        },
        {
          id: "os-u1-t22",
          name: "Round Robin (RR) / Time Sharing Scheduling",
        },
        {
          id: "os-u1-t23",
          name: "Comparison of CPU Scheduling Algorithms",
        },
      ],
    },
    {
      id: "os-u2",
      name: "Unit II: Inter-Process Communication & Deadlocks",
      topics: [
        {
          id: "os-u2-t1",
          name: "Introduction to Inter-Process Communication (IPC)",
        },
        {
          id: "os-u2-t2",
          name: "Critical Section",
        },
        {
          id: "os-u2-t3",
          name: "Race Conditions",
        },
        {
          id: "os-u2-t4",
          name: "Mutual Exclusion",
        },
        {
          id: "os-u2-t5",
          name: "Semaphores",
        },
        {
          id: "os-u2-t6",
          name: "Binary & Counting Semaphores",
        },
        {
          id: "os-u2-t7",
          name: "Busy-Waiting (Spinning)",
        },
        {
          id: "os-u2-t8",
          name: "Wait & Signal Operations for Synchronization",
        },
        {
          id: "os-u2-t9",
          name: "Classical IPC Problems",
        },
        {
          id: "os-u2-t10",
          name: "Reader's & Writer's Problem",
        },
        {
          id: "os-u2-t11",
          name: "Producer-Consumer Problem",
        },
        {
          id: "os-u2-t12",
          name: "Dining Philosopher Problem",
        },
        {
          id: "os-u2-t13",
          name: "Deadlocks – Definition & Concepts",
        },
        {
          id: "os-u2-t14",
          name: "Necessary & Sufficient Conditions for Deadlock",
        },
        {
          id: "os-u2-t15",
          name: "Deadlock Prevention",
        },
        {
          id: "os-u2-t16",
          name: "Deadlock Avoidance",
        },
        {
          id: "os-u2-t17",
          name: "Banker's Algorithm",
        },
        {
          id: "os-u2-t18",
          name: "Deadlock Detection",
        },
        {
          id: "os-u2-t19",
          name: "Deadlock Recovery",
        },
      ],
    },
    {
      id: "os-u3",
      name: "Unit III: Memory Management & Virtual Memory",
      topics: [
        {
          id: "os-u3-t1",
          name: "Memory Management – Basic Concepts",
        },
        {
          id: "os-u3-t2",
          name: "Logical & Physical Address Map",
        },
        {
          id: "os-u3-t3",
          name: "Memory Allocation",
        },
        {
          id: "os-u3-t4",
          name: "Contiguous Memory Allocation",
        },
        {
          id: "os-u3-t5",
          name: "Fixed Partitioning",
        },
        {
          id: "os-u3-t6",
          name: "Variable Partitioning",
        },
        {
          id: "os-u3-t7",
          name: "Internal Fragmentation",
        },
        {
          id: "os-u3-t8",
          name: "External Fragmentation",
        },
        {
          id: "os-u3-t9",
          name: "Compaction",
        },
        {
          id: "os-u3-t10",
          name: "Paging – Principle of Operation",
        },
        {
          id: "os-u3-t11",
          name: "Page Allocation",
        },
        {
          id: "os-u3-t12",
          name: "Hardware Support for Paging",
        },
        {
          id: "os-u3-t13",
          name: "Protection & Sharing in Paging",
        },
        {
          id: "os-u3-t14",
          name: "Disadvantages of Paging",
        },
        {
          id: "os-u3-t15",
          name: "Virtual Memory – Basic Concepts",
        },
        {
          id: "os-u3-t16",
          name: "Virtual Memory Management",
        },
        {
          id: "os-u3-t17",
          name: "Demand Paging",
        },
        {
          id: "os-u3-t18",
          name: "Page Replacement Algorithms",
        },
        {
          id: "os-u3-t19",
          name: "FIFO Page Replacement Algorithm",
        },
        {
          id: "os-u3-t20",
          name: "Optimal Page Replacement Algorithm",
        },
        {
          id: "os-u3-t21",
          name: "LRU (Least Recently Used) Page Replacement",
        },
        {
          id: "os-u3-t22",
          name: "Comparison of Page Replacement Algorithms",
        },
      ],
    },
    {
      id: "os-u4",
      name: "Unit IV: File Management & Disk Management",
      topics: [
        {
          id: "os-u4-t1",
          name: "File Management – Introduction",
        },
        {
          id: "os-u4-t2",
          name: "Concept of File",
        },
        {
          id: "os-u4-t3",
          name: "File Access Methods",
        },
        {
          id: "os-u4-t4",
          name: "File Types",
        },
        {
          id: "os-u4-t5",
          name: "File Operations",
        },
        {
          id: "os-u4-t6",
          name: "Directory Structure",
        },
        {
          id: "os-u4-t7",
          name: "File System Structure",
        },
        {
          id: "os-u4-t8",
          name: "File Allocation Methods",
        },
        {
          id: "os-u4-t9",
          name: "Contiguous File Allocation",
        },
        {
          id: "os-u4-t10",
          name: "Linked File Allocation",
        },
        {
          id: "os-u4-t11",
          name: "Indexed File Allocation",
        },
        {
          id: "os-u4-t12",
          name: "File System Efficiency & Performance",
        },
        {
          id: "os-u4-t13",
          name: "Disk Management – Introduction",
        },
        {
          id: "os-u4-t14",
          name: "Disk Structure",
        },
        {
          id: "os-u4-t15",
          name: "Disk Scheduling",
        },
        {
          id: "os-u4-t16",
          name: "FCFS Disk Scheduling",
        },
        {
          id: "os-u4-t17",
          name: "SSTF Disk Scheduling",
        },
        {
          id: "os-u4-t18",
          name: "SCAN Disk Scheduling",
        },
        {
          id: "os-u4-t19",
          name: "C-SCAN Disk Scheduling",
        },
        {
          id: "os-u4-t20",
          name: "Disk Reliability",
        },
        {
          id: "os-u4-t21",
          name: "Disk Formatting",
        },
        {
          id: "os-u4-t22",
          name: "Case Study – UNIX Operating System",
        },
        {
          id: "os-u4-t23",
          name: "Case Study – Windows Operating System",
        },
      ],
    },
  ],
};