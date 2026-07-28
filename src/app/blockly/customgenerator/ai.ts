import customGenerator from '.'

customGenerator.forBlock['run_ai_model'] = function (block: { getFieldValue: (name: string) => string }) {
  const modelFile = block.getFieldValue('MODEL_FILE') ?? ''
  if (!modelFile || modelFile === 'Select Model...') {
    customGenerator.reportError({ message: 'Please select an AI model file for the "run ai model" block' })
  }
  return { run_ai_model: { model: modelFile } }
}
