import { CAYO } from './cayo';
import { SNOWFLAKE } from './snowflake';
import {SUBO} from './subo'
import {REKKA} from './rekka'


export interface KitConfig {
  BASIC?: string
  LOOP?: string
  LOGIC?: string
  PINS?: string
  VARIABLE?: string
  SENSOR?: string
  MATH?: string
  DISPLAY?: string
  REKKA?: string
  ACTUATORS?: {
    motors: string
    servos: string
    relays: string | null
  }
}


/**
 * Central registry of all kits
 * Keys MUST match selectedKit.toUpperCase()
 */
export const Kits : Record<string, KitConfig>  = {
  CAYO,
  SNOWFLAKE,
  SUBO,
  REKKA
} ;
