import React, { useEffect, useState } from 'react'

interface PythonResponse {
  type?: 'stdout' | 'stderr' | 'exit';
  data?: string;
  code?: number;
  success : boolean;
  output? : string;
  error? : string
}

export default function PythonExec() {
  const [response, setResponse] = useState<string | null>(null)
  const [responseType, setResponseType] = useState<'stdout' | 'stderr' | null>(null)
  const [scriptName, setScriptName] = useState('GoodMorning.py')

  useEffect(() => {
    // Attach once
    window.api.python.onResponse((res : PythonResponse) => {
      if (res.type === 'stdout') {
        setResponse(res.data ?? '')
        setResponseType('stdout')
        console.log('%c[Python STDOUT]', 'color: green;', res.data)
      } else if (res.type === 'stderr') {
        setResponse(res.data ?? '')
        setResponseType('stderr')
        console.error('%c[Python STDERR]', 'color: red;', res.data)
      } else if (res.type === 'exit') {
        console.log(`Python script exited with code ${res.code}`)
      }
    })
  }, [])

  const handleProcess = () => {
    if (scriptName) {
      setResponse(null)
      setResponseType(null)
      window.api.python.run(scriptName)
    } else {
      console.log('Please enter a script name.')
    }
  }
  return (
    <div>
      <button onClick={handleProcess}>Python exec</button>
    </div>
  )
}
