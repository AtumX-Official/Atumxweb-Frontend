import { FiCheck } from "react-icons/fi";
import LightTheme from "./assets/Light.svg";
import DarkTheme from "./assets/Dark.svg";
import { useSelector, useDispatch } from 'react-redux'
import { setTheme } from '../../../../store/themeSlice'

type Theme = "light" | "dark";

export default function ThemeSelector() {
  const selectedTheme = useSelector((state: any) => state.theme.mode)
  const dispatch = useDispatch()
  const themeMode = useSelector((state: any) => state.theme.mode);
  const textcolor = themeMode === "dark" ? "text-white" : "text-black"
  const handleSelectTheme = (type: Theme) => {
    dispatch(setTheme(type)); 
  };
  const ThemeBox = ({
    type,
    bgColor,
    textColor,
    image,
  }: {
    type: Theme;
    bgColor: string;
    textColor: string;
    image: string;
  }) => {
    const isSelected = selectedTheme === type;

    return (
      <div
      onClick={() => handleSelectTheme(type)}
        className="relative cursor-pointer rounded-md p-4"
        style={{
          width: "260px",
          height: "150px",
          background: bgColor,
        }}
      >
        {/* Title */}
        <span
          className="absolute top-3 left-4 text-sm font-bold"
          style={{ color: textColor }}
        >
          {type.toUpperCase()}
        </span>

        {/* Checkbox */}
        <div
          className="absolute top-3 right-4 w-5 h-5 rounded flex items-center justify-center"
          style={{
            background: isSelected ? "#2EED08" : "#D6D6D6",
          }}
        >
          {isSelected && <FiCheck className="text-white w-3 h-3" />}
        </div>

        {/* Image on Right End Corner */}
        <img
  src={image}
  alt={type}
  className={`absolute right-0 ${
    type === "dark" ? "-bottom-10" : "-bottom-5"
  } w-[175px] h-[175px] object-contain block`}
/>
      </div>
    );
  };

  return (
    <div className="-mt-2">
      <h2 className={`text-lg font-semibold ${textcolor}`}>
        Application Theme
      </h2>
      <div className="flex gap-6">
      <ThemeBox
        type="light"
        bgColor="#F0F0F0"
        textColor="#000000"
        image={LightTheme}
      />

      <ThemeBox
        type="dark"
        bgColor="#272727"
        textColor="#FFFFFF"
        image={DarkTheme}
      />
    </div>
    </div>
  );
}