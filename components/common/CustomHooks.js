import { useRecoilState } from "recoil";

export const useConfirmButton = (ModalConfirmButtonState, value) => {
    const [state, setState] = useRecoilState(ModalConfirmButtonState);

    // the original logic placed inside the `selector` now moved to the callback
    return [
        state,
        useCallback(async () => { // performace optimisation
                try {
                    setState(value);
                } catch (error) {
                    setState(false);
                }
        }, [setState, value]),
    ];
};