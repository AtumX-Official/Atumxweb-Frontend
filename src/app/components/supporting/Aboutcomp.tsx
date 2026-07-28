import { useSelector } from "react-redux";

export default function Aboutinfo() {
  const themeMode = useSelector((state: any) => state.theme.mode);
  const textcolor = themeMode === "dark" ? "text-white" : "text-black";

  return (
    <div className="flex flex-col items-start justify-start p-2 space-y-4">
      
      {/* Heading */}
      <h1 className={`text-2xl font-bold ${textcolor}`}>
        About the App
      </h1>

      {/* Description */}
      <p className={`text-base font-italic max-w-xl ${textcolor}`}>
        This app is built by X-Force of AtumX exclusively for their products.
        The motive of the app is to provide a fun, simple, and easy coding
        experience for users, especially kids and teens.
      </p>

      {/* Buttons Row */}
      <div className="flex items-center gap-3">
        {/* <button className="bg-[#FFDE21] text-black font-semibold px-5 py-2 rounded-lg shadow hover:brightness-95 transition">
          Check for Updates
        </button> */}

        <button className="bg-green-500 text-white font-semibold px-5 py-2 rounded-lg shadow cursor-default">
          Version V 1.1
        </button>
      </div>

    </div>
  );
}