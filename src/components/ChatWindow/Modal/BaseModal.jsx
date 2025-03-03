// BaseModal.jsx
import React from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import closeIcon from "../../../assets/close.svg";
import "./Modal.css";
import { useTranslation } from "react-i18next";

export function BaseModal({ isOpen, onClose, title, children, modalClassName = "" }) {
   const { t } = useTranslation();
   return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-10">
         <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
         <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
               <DialogPanel
                  className={`relative modal__wrapper transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl ${modalClassName}`}
               >
                  <img
                     src={closeIcon}
                     onClick={onClose}
                     className="absolute top-4 right-4 cursor-pointer w-6 h-6"
                     alt={t("modal.close")}
                  />
                  <div className={`modal p-6 ${modalClassName ? modalClassName + "-content" : ""}`}>
                     <h2 className="font-light text-2xl/6 mb-2">{title}</h2>
                     {children}
                  </div>
               </DialogPanel>
            </div>
         </div>
      </Dialog>
   );
}
