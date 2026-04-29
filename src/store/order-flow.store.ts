import { create } from "zustand";
import { persist } from "zustand/middleware";

type FeedbackDraft = {
    rating: number;
    comment: string;
};

interface OrderFlowState {
    checkoutSessionId: string | null;
    selectedCartItemIds: string[];
    selectedAddressId: string | null;
    trackOrderInput: string;
    feedbackDrafts: Record<string, FeedbackDraft>;
    setCheckoutSessionId: (sessionId: string | null) => void;
    setSelectedCartItemIds: (itemIds: string[]) => void;
    setSelectedAddressId: (addressId: string | null) => void;
    setTrackOrderInput: (value: string) => void;
    setFeedbackDraft: (productId: string, payload: FeedbackDraft) => void;
    clearFeedbackDrafts: () => void;
    clearCheckoutFlow: () => void;
}

export const useOrderFlowStore = create<OrderFlowState>()(
    persist(
        (set) => ({
            checkoutSessionId: null,
            selectedCartItemIds: [],
            selectedAddressId: null,
            trackOrderInput: "",
            feedbackDrafts: {},
            setCheckoutSessionId: (sessionId) => set({ checkoutSessionId: sessionId }),
            setSelectedCartItemIds: (itemIds) => set({ selectedCartItemIds: itemIds }),
            setSelectedAddressId: (addressId) => set({ selectedAddressId: addressId }),
            setTrackOrderInput: (value) => set({ trackOrderInput: value }),
            setFeedbackDraft: (productId, payload) =>
                set((state) => ({
                    feedbackDrafts: {
                        ...state.feedbackDrafts,
                        [productId]: payload,
                    },
                })),
            clearFeedbackDrafts: () => set({ feedbackDrafts: {} }),
            clearCheckoutFlow: () =>
                set({
                    checkoutSessionId: null,
                    selectedCartItemIds: [],
                    selectedAddressId: null,
                }),
        }),
        {
            name: "order-flow-store",
            partialize: (state) => ({
                checkoutSessionId: state.checkoutSessionId,
                selectedCartItemIds: state.selectedCartItemIds,
                selectedAddressId: state.selectedAddressId,
                feedbackDrafts: state.feedbackDrafts,
                trackOrderInput: state.trackOrderInput,
            }),
        }
    )
);
