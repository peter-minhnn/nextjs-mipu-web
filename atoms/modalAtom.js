import { atom } from 'recoil'

export const ModalState = atom({
    key: 'modal',
    default: false
});

export const LoginState = atom({
    key: 'login',
    default: false
});

export const LoadingState = atom({
    key: 'loadingState',
    default: false
});


export const ModalConfirmState = atom({
    key: 'modalConfirm',
    default: false
});

export const ModalConfirmButtonState = atom({
    key: 'modalButtonConfirm',
    default: false
});