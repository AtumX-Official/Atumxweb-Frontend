import { CAYO } from './cayo';
import { SNOWFLAKE } from './snowflake';
import {SUBO} from './subo'
import {REKKA} from './rekka'
import { STEMROBO } from './stemrobo';
/**
 * Central registry of all kits
 * Keys MUST match selectedKit.toUpperCase()
 */
export const Kits = {
  CAYO,
  SNOWFLAKE,
  SUBO,
  REKKA,
  STEMROBO
} as const;
