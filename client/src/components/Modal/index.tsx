import React from "react";
import ReactDOM from "react-dom";
import Header from "../Header";
import { X } from "lucide-react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

const Modal = ({ children, isOpen, onClose, name }: Props) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="glass-panel-strong w-full max-w-2xl rounded-3xl border border-sand-100 p-4 shadow-2xl dark:border-stroke-dark">
        <Header
          name={name}
          buttonComponent={
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-primary text-white transition hover:bg-teal-600"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          }
          isSmallText
        />
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
