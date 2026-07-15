export type ProcessResult = {
	success: boolean;
	type: 'initial' | 'final';
	status: 'complete' | 'incomplete';
	data: {
		scholarsSignature: boolean;
		internalsVerification: boolean;
		name: string;
		contact: string;
		studentNumber: string;
		emailAddress: string;
		programAndYear: string;
		bankAccount: string;
		spasID: string;
		gwa: string;
		termAppliedFor: string;
		remainingUnits: string;
		ecm: boolean;
		grades: boolean;
	};
};
export function processSPEF(file: File) {}
