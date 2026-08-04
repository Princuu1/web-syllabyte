export interface Topic {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  colorClass: string;
  units: Unit[];
}