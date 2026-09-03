import { drone } from "../blocks/drone";


export const Drone: Record<string, string> = {
  DRONE: `
    <xml id="toolbox">
      ${drone.DRONE}
    </xml>
  `,
};
