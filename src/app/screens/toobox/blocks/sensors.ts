export const Sensors : Record<string, string> = {
    SNOWFLAKE: 
       `
      <block type="sfconnect_us1"></block>
      <block type="US1"></block>
      <block type="sfconnect_ldr"></block>
      <block type="ldr"></block>
      <block type="sfsensor_pin"></block>
      <block type="ir"></block>
      <block type= "sfsetup_DHT"></block>
      <block type="DTHSensor"></block>
      <block type="sfcolor_sensor_init"></block>
      <block type="color_sensor"></block>
      `,
    SUBO : `
      <block type="cayoconnect_us1"></block>
    <block type="US1"></block>
    <block type="cayoconnect_ldr"></block>
    <block type="ldr"></block>
    <block type="cayosensor_pin"></block>
    <block type="ir"></block>
    <block type= "cayosetup_DHT"></block>
    <block type="DTHSensor"></block>
    <block type="cayocolor_sensor_init"></block>
    <block type="color_sensor"></block>
    <block type="colorsensor"></block>
      <block type="cayosetvibration"></block>
      <block type="cayoVibration"></block>
      <block type="cayosettouch"></block>
      <block type="cayoTouch"></block>
      <block type="cayosetgas"></block>
      <block type="cayoGas"></block>
     <block type="cayosetsoilmoisture"></block>
      <block type="cayoSoil"></block>
      <block type="cayosetsound"></block>
      <block type="cayoSound"></block>
    `,  
    CAYO: `
<block type="connect_us1"></block>
    <block type="US1"></block>
    <block type="connect_ldr"></block>
    <block type="ldr"></block>
    <block type="sensor_pin"></block>
    <block type="ir"></block>
    <block type="setup_DHT"></block>
    <block type="DTHSensor"></block>
    <block type="color_sensor_init"></block>
    <block type="color_sensor"></block>  
    <block type="setvibration"></block>
    <block type="Vibration"></block>
    <block type="settouch"></block>
    <block type="Touch"></block>
    <block type="setgas"></block>
    <block type="Gas"></block>
    <block type="setsoilmoisture"></block>
    <block type="Soil"></block>
    <block type="setsound"></block>
    <block type="Sound"></block>
      `,
      DRONE: `
         <block type="Droneconnect_us1"></block>
         <block type="US1"></block>
         <block type="droneservo_init"></block>
         <block type="droneservo_individual"></block>
         <block type="drone360ServoR"></block>
         <block type="drone360ServoS"></block>
      `,
      STEMROBO : `
      <block type="stemroboconnect_us1"></block>
  <block type="US1"></block>
  <block type="stemroboconnect_ldr"></block>
  <block type="ldr"></block>
  <block type="stemrobosensor_pin"></block>
  <block type="ir"></block>
  <block type= "stemrobosetup_DHT"></block>
  <block type="DTHSensor"></block>
  <block type="stemrobocolor_sensor_init"></block>
  <block type="color_sensor"></block>
  <block type="colorsensor"></block>
    <block type="stemrobosetvibration"></block>
    <block type="stemroboVibration"></block>
    <block type="stemrobosettouch"></block>
    <block type="stemroboTouch"></block>
    <block type="stemrobosetgas"></block>
    <block type="stemroboGas"></block>
   <block type="stemrobosetsoilmoisture"></block>
    <block type="stemroboSoil"></block>
    <block type="stemrobosetsound"></block>
    <block type="stemroboSound"></block>`
  };
  