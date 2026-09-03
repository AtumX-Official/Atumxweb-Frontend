export const trixkit : Record<string, string> = {
    GRIPPER: `
    <block type="move_gripper"></block>
    <block type="move_arm"></block>
  `,

  WALKER: `
    <block type="move_forward"></block>
    <block type="pushup"></block>
    <block type="greet"></block>
    <block type="stand"></block>
    <block type="dogsitup"></block>
    <block type="walker_leg_control"></block>
    <block type="servo"></block>
    <block type="calibrate"></block>
  `,
  CRAWLER: `
    <block type="crawlermove_forward"></block>
    <block type="move_left"></block>
    <block type="move_right"></block>
    <block type="dance"></block>
    <block type="fold"></block>
    <block type="wave"></block>
    <block type="situp"></block>
    <block type="leg_control"></block>
    <block type="crawlerservo"></block>
    <block type="crawlercalibrate"></block>
  `,

}