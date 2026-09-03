export const Relays : Record<string, string> = {
    GENERIC: `
      <block type="setrelay"></block>
      <block type="RelayOn"></block>
      <block type="RelayOff"></block>
    `,
    SUBO: `
      <block type="cayosetrelay"></block>
      <block type="cayoRelayOn"></block>
      <block type="cayoRelayOff"></block>
    `,
    STEMROBO : `
    <block type="stemrobosetrelay"></block>
    <block type="stemroboRelayOn"></block>
    <block type="stemroboRelayOff"></block>
    `
  };
  