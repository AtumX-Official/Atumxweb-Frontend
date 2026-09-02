export const FEATURES = {
  pythonMode: process.env.NEXT_PUBLIC_ENABLE_PYTHON === 'true',
  cppMode: process.env.NEXT_PUBLIC_ENABLE_CPP === 'true',
} as const