export const Servos : Record<string, string> = {
    GENERIC: `
      <block type="servo_init"></block>
      <block type="servo_individual"></block>
      <block type="360ServoR"></block>
      <block type="360ServoS"></block>
    `,
    SUBO: `
      <block type="cayoservo_init"></block>
      <block type="servo_individual">...</block>
      <block type="360ServoR"></block>
      <block type="360ServoS"></block>
    `,
    SNOWFLAKE: `
      <block type="sfservo_init"></block>
      <block type="servo_individual">...</block>
    `,
    DRONE : `
         
    `,
    STEMROBO : `
    <block type="stemroboservo_init"></block>
    <block type="servo_individual"></block>
    <block type="360ServoR"></block>
    <block type="360ServoS"></block>
  `,
  };
  