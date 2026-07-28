
export default function OnoffSwitch() {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input className="peer sr-only" type="checkbox" />
      <div className="border-gray-500 shadow-lg peer-checked:shadow-green-600 shadow-red-600 border flex h-8 w-16 items-center outline-none rounded bg-red-600 pl-7 text-white transition-all duration-300 peer-checked:bg-green-600 peer-checked:pl-2 peer-focus:outline-none" />{' '}
      <h1 className="peer-checked:opacity-0 transition-all duration-500 opacity-100 absolute left-6">
        On
      </h1>
      <h1 className="absolute transition-all duration-500 peer-checked:opacity-100 opacity-0 left-1 stroke-gray-900 w-5 h-5">
        Off
      </h1>
      <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-sm bg-white shadow-lg transition-all duration-300 peer-checked:left-7" />
    </label>
  )
}
