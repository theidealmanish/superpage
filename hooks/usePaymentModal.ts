import { useState } from 'react';

interface UsePaymentModalReturn {
	isModalOpen: boolean;
	openPaymentModal: (config?: {
		recipientAddress: string;
		defaultAmount?: string;
		recipientName: string;
	}) => void;
	closePaymentModal: () => void;
	modalProps: {
		recipientAddress: string;
		defaultAmount?: string;
		recipientName: string;
	};
}

export default function usePaymentModal(): UsePaymentModalReturn {
	const [isModalOpen, setModalOpen] = useState(false);
	const [modalProps, setModalProps] = useState<{
		recipientAddress: string;
		defaultAmount?: string;
		recipientName: string;
	}>({
		recipientAddress: '',
		defaultAmount: '1',
		recipientName: '',
	});

	const openPaymentModal = (config?: {
		recipientAddress: string;
		defaultAmount?: string;
		recipientName: string;
	}) => {
		if (config) {
			setModalProps(config);
		}
		setModalOpen(true);
	};

	const closePaymentModal = () => {
		setModalOpen(false);
		// Optional: Reset modal props when closed
		// setModalProps({});
	};

	return {
		isModalOpen,
		openPaymentModal,
		closePaymentModal,
		modalProps,
	};
}
