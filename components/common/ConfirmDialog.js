import { Fragment, useEffect } from "react"
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { ModalConfirmState, ModalConfirmButtonState } from '../../atoms/modalAtom'
import { useConfirmButton } from "./CustomHooks";

function ConfirmDialog({ title, content, textOk, textCancel }) {
    const [openDialogConfirm, setOpenDialogConfirm] = useRecoilState(ModalConfirmState);
    const [confirmButton, setConfirmButton] = useRecoilState(ModalConfirmButtonState);

    const HandleClickConfirmButton = value => {
        setConfirmButton(value);
        setOpenDialogConfirm(false);
    }
    return (
        <Transition.Root show={openDialogConfirm} as={Fragment}>
            <Dialog
                as="div"
                className="fixed z-10 inset-0 overscroll-y-auto"
                onClose={setOpenDialogConfirm}
            >
                <div className="flex items-center justify-center min-h-[800px] sm:min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-200 bg-opacity-20 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents */}
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="h-40 inline-block align-bottom bg-white rounded-lg px-4 pt-5 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 ">
                            <div className={`confirm ${!openDialogConfirm ? 'hidden' : 'block'}`} >
                                <h1>{title}</h1>
                                <p>{content}</p>
                                <button type="button" onClick={() => HandleClickConfirmButton(false)}>{textCancel}</button>
                                <button type="button" onClick={() => HandleClickConfirmButton(true)}>{textOk}</button>
                            </div>
                        </div>

                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default ConfirmDialog
