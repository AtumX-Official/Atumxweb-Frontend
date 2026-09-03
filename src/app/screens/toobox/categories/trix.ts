import {trixkit  } from '../blocks/trix';

export const TRIX : Record<string, string> = {
  GRIPPER: `
    <xml id="toolbox">
      ${trixkit.GRIPPER}
    </xml>
  `,
  WALKER: `
    <xml id="toolbox">
      ${trixkit.WALKER}
    </xml>
  `,
  CRAWLER: `
    <xml id="toolbox">
      ${trixkit.CRAWLER}
    </xml>
  `,
};
