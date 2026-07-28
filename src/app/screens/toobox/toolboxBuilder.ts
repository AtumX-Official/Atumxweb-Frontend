import { Basic } from './blocks/basics';
import { Loop } from './blocks/loops';
import { Logic } from './blocks/logics';
import { Pins } from './blocks/pins';
import { Sensors } from './blocks/sensors';
import { Maths } from './blocks/maths';
import { Variables } from './blocks/variable';
import { Displays } from './blocks/displays';
import { Motors } from './blocks/motors';
import { Servos } from './blocks/servos';
import { Relays } from './blocks/relays';
import { Kits } from './kits';
import { WHEELZ } from './categories/wheelz';
import { TRIX } from './categories/trix';
import {PLAYMO} from './categories/playmo'
import { Drone } from './categories/drone';

/**
 * Central toolbox resolver
 */
export const buildToolboxXml = (
  kitKey: string,
  label: string,
  category?: string,
  variableToolboxXml?: string
): string => {
  const kit = Kits[kitKey];
  if (!kit) return '<xml></xml>';

  // Helper: Removes <xml> tags to allow safe concatenation without registry errors
  const clean = (xmlString: string) => {
    return (xmlString || '')
      .replace(/<xml[^>]*>/g, '')
      .replace(/<\/xml>/g, '');
  };

  /* STEP 1: Resolve the "Requested Content"
     This handles Actuators, Variables, and Standard blocks for the specific kit.
  */
  let requestedContent = '';

  if (label === 'ACTUATORS') {
    // Dynamically fetch actuator blocks based on the Kit's definition
    const motorXml = kit.ACTUATORS?.motors ? (Motors[kit.ACTUATORS.motors] || '') : '';
    const servoXml = kit.ACTUATORS?.servos ? (Servos[kit.ACTUATORS.servos] || '') : '';
    const relayXml = kit.ACTUATORS?.relays ? (Relays[kit.ACTUATORS.relays] || '') : '';
    
    requestedContent = `${motorXml}${servoXml}${relayXml}`;
  } 
  else if (label === 'VARIABLE') {
    requestedContent = variableToolboxXml || '';
  } 
  else {
    const CATEGORY_MAP: Record<string, Record<string, string>> = {
      BASIC: Basic,
      LOOP: Loop,
      LOGIC: Logic,
      PINS: Pins,
      SENSOR: Sensors,
      MATH: Maths,
      VARIABLE: Variables,
      DISPLAY: Displays,
      REKKA: Drone
    };

    const categoryBlocks = CATEGORY_MAP[label];
    if (categoryBlocks) {
      const blockKey = kit[label as keyof typeof kit] || 'DEFAULT';
      requestedContent = categoryBlocks[blockKey] || categoryBlocks.DEFAULT || '';
    }
  }

  /* STEP 1.5: AI category — fully dynamic, built from loaded models */
  if (label === 'AI') {
    const models = (window as Window & {
      __aiLoadedModels?: Array<{ blockTypes: string[] }>
    }).__aiLoadedModels ?? []

    const blockXml = models
      .flatMap((m) => m.blockTypes.map((bt) => `<block type="${bt}"></block>`))
      .join('\n')

    return `
      <xml id="toolbox">
        <button text="+ Load AI Model" callbackKey="loadAIModel"></button>
        <block type="run_ai_model"></block>
        ${blockXml}
      </xml>
    `.trim()
  }

  /* STEP 2: Handle Category-Specific Wrapping
  */

  // 🔹 CASE A: TRIX (Full Override)
  // Usually, Trix has its own custom set of blocks for specific models
  if (category === 'gripper'|| category === 'walker' || category === 'crawler') {
    return TRIX[label] || '<xml></xml>';
  }
  // if (category === 'drone') {
  //   return Drone[label] || '<xml></xml>';
  // }

 if (category === 'gaadi') {
  return WHEELZ[label] || '<xml></xml>';
}

if (category === 'playmo') {
  return PLAYMO[label] || '<xml></xml>';
}
  return `
    <xml id="toolbox">
      ${clean(requestedContent)}
    </xml>
  `.trim();
};