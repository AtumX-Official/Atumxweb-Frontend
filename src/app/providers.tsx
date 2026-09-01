"use client";

import { Provider } from "react-redux";
import { store } from "../../store";
import BoardModeManager from "./components/BoardModeManager";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <BoardModeManager />
      {children}
    </Provider>
  );
}