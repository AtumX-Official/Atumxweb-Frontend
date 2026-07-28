import {ConfirmUnsavedChangesModal,SavePopup} from '../../components/supporting/Popups'
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../../../../store";
type ExitAction =
  | "stay"
  | "exit"
  | "save-and-exit"
  | "exit-without-save";
  type ConfirmModalOptions = {
    title: string;
    message: string;
    variant?: "exit" | "unsaved"
    };
 
  
  export const showConfirmModal = ({ title, message,variant }: ConfirmModalOptions) => {
    return new Promise<{ yes: boolean; no: boolean }>((resolve) => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
  
      const cleanup = () => {
        root.unmount();
        container.remove();
      };
  
      root.render(
        <Provider store={store}>
        <ConfirmUnsavedChangesModal
          open={true}
          title={title}
          message={message}
          onYes={() => {
            cleanup();
            resolve({ yes: true, no: false });
          }}
          onNo={() => {
            cleanup();
            resolve({ yes: false, no: true });
          }}
          variant={variant}
        />
        </Provider>
      );
    });
  };
  
  

  
  export const showSavePopup = () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
  
    const root = createRoot(container);
  
    const cleanup = () => {
      root.unmount();
      container.remove();
    };
  
    root.render(<SavePopup />);
  
    // auto-close after 2 seconds
    setTimeout(cleanup, 2000);
  };
  
