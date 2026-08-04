import { Subject } from "./types";

import { dsa } from "./subjects/dsa";
import { os } from "./subjects/os";
import { pp } from "./subjects/pp";
import { de } from "./subjects/de";
import { se } from "./subjects/se";
import { math } from "./subjects/math";
import { dsalab } from "./subjects/dsalab";
import { pplab } from "./subjects/pplab";
import { oslab } from "./subjects/oslab";
import { delab } from "./subjects/delab";
export const syllabus: Subject[] = [
  dsa,
  os,
  pp,
  de,
  se,
  math,
  dsalab,
  pplab,
  oslab,
  delab,
];