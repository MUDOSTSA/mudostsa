import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getFilePath, getSignedURL } from './supabase';
import type { Link, LinkGroup, UserSensitiveData } from './types';
import type { FinalSPEForm, InitialSPEForm } from './zod/spef_forms';

async function getPDF(url: string) {
	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	return PDFDocument.load(buffer);
}
export function getFileType(bytes: Uint8Array): string | null {
	if (bytes[0] === 0x25 && bytes[1] === 0x50) return 'pdf'; // %PDF
	if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
	if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'png';
	return null;
}
export function fileTypeToMime(fileType: string): string {
	switch (fileType) {
		case 'pdf':
			return 'application/pdf';
		case 'jpg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		default:
			return 'application/octet-stream';
	}
}

const spefTemplate = 'spef_latest';
const fieldMapping: {
	name: string;
	studentNumber: string;
	programYear: string;
	spasID: string;
	contactNumber: string;
	email: string;
	landbankAccount: string;
	gwa: string;
	term: string;
	remainingUnits: string;
	attendedEventYes: string;
	attendedEventNo: string;
	isMemberYes: string;
	isMemberNo: string;
	attendedEvent: string;
} = {
	name: 'Text-bafh2ze7Fm',
	studentNumber: 'Text-IHc0IF0Bug',
	programYear: 'Text-PPvTUfNbo8',
	spasID: 'Text-fjdZ-0s-lI',
	contactNumber: 'Text-P14qdtL6Cz',
	email: 'Text-Ut9Cbv9ikN',
	landbankAccount: 'Text-JnqiP06Tmk',
	gwa: 'Text-yxpTA6yn6M',
	term: 'Text-81bURyl7do',
	remainingUnits: 'Text-f_oaVMe4iB',
	attendedEventYes: 'CheckBox-DjF-hvvvm6',
	attendedEventNo: 'CheckBox-6r6FuIGWC6',
	isMemberYes: 'CheckBox-BePJIBcpfk',
	isMemberNo: 'CheckBox-ZqHzRXIbw_',
	attendedEvent: 'Text-GyWmktTUtQ'
};
const coordinates = {
	ecm: {
		page: 0,
		x: 45,
		y: 447
	},
	grades: {
		page: 1,
		x: 45,
		y: 164
	},
	signatureFieldBottomCenter: {
		page: 1,
		x: 202,
		y: 644
	},
	dateField: {
		page: 1,
		x: 423,
		y: 644
	},
	internalsSignatureFieldBottomCenter: {
		page: 1,
		x: 183,
		y: 750
	}
};

export async function generateInitialSPEF(data: InitialSPEForm) {
	const filePath = await getFilePath(spefTemplate);
	if (!filePath.data?.file_path) {
		throw new Error('SPEF template file path not found');
	}
	const spefLink = await getSignedURL('documents', filePath.data.file_path);
	if (!spefLink.data?.signedUrl) {
		throw new Error('Failed to get signed URL for SPEF template');
	}

	const pdfDoc = await getPDF(spefLink.data.signedUrl);
	const form = pdfDoc.getForm();

	form.getTextField(fieldMapping.name).setText(data.name);
	form.getTextField(fieldMapping.studentNumber).setText(data.studentNumber);
	form.getTextField(fieldMapping.programYear).setText(data.programYear);
	form.getTextField(fieldMapping.contactNumber).setText(data.contactNumber);
	form.getTextField(fieldMapping.email).setText(data.emailAddress);
	form.getTextField(fieldMapping.term).setText(data.termAppliedFor);
	form.getTextField(fieldMapping.spasID).setText(data.spasId);

	if (data.recentlyAttendedEvent) {
		form.getTextField(fieldMapping.attendedEvent).setText(data.recentlyAttendedEvent);
		form.getCheckBox(fieldMapping.attendedEventYes).check();
	} else {
		form.getCheckBox(fieldMapping.attendedEventNo).check();
	}
	if (data.isMember) {
		form.getCheckBox(fieldMapping.isMemberYes).check();
	} else {
		form.getCheckBox(fieldMapping.isMemberNo).check();
	}

	const pages = pdfDoc.getPages();

	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontSize = 12;
	const sigPage = pages[coordinates.signatureFieldBottomCenter.page];
	const datePage = pages[coordinates.dateField.page];
	const { height: sigPageHeight } = sigPage.getSize();
	const { height: datePageHeight } = datePage.getSize();
	const sigTextWidth = font.widthOfTextAtSize(data.name, fontSize);
	const dateTextWidth = font.widthOfTextAtSize(new Date().toLocaleDateString(), fontSize);
	sigPage.drawText(data.name, {
		x: coordinates.signatureFieldBottomCenter.x - sigTextWidth / 2,
		y: sigPageHeight - coordinates.signatureFieldBottomCenter.y,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0)
	});
	datePage.drawText(new Date().toLocaleDateString(), {
		x: coordinates.dateField.x - dateTextWidth / 2,
		y: datePageHeight - coordinates.dateField.y,
		size: fontSize,
		font: font,
		color: rgb(0, 0, 0)
	});

	if (data.signature) {
		const signatureBinary = atob(data.signature.split(',')[1]);
		const signatureBytes = new Uint8Array(signatureBinary.length);

		for (let i = 0; i < signatureBinary.length; i++) {
			signatureBytes[i] = signatureBinary.charCodeAt(i);
		}
		const signatureImage = await pdfDoc.embedPng(signatureBytes);
		if (signatureImage) {
			const maxSignatureHeight = 50;
			const originalSignatureDims = signatureImage.size();
			const signatureScale = Math.min(maxSignatureHeight / originalSignatureDims.height, 1);
			const scaledSignatureWidth = originalSignatureDims.width * signatureScale;
			const scaledSignatureHeight = originalSignatureDims.height * signatureScale;

			sigPage.drawImage(signatureImage, {
				x: coordinates.signatureFieldBottomCenter.x - scaledSignatureWidth / 2,
				y: sigPageHeight - coordinates.signatureFieldBottomCenter.y - 12,
				width: scaledSignatureWidth,
				height: scaledSignatureHeight
			});
		}
	}

	const pdfBytes = await pdfDoc.save();
	const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
	new Uint8Array(pdfBuffer).set(pdfBytes);
	const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);
	return url;
}
async function loadPdf(source: string): Promise<Uint8Array> {
	const res = await fetch(source);

	if (!res.ok) {
		throw new Error(`Failed to load PDF: ${res.status}`);
	}

	return new Uint8Array(await res.arrayBuffer());
}
export async function extractDataFromPDF(pdfSource: File): Promise<Partial<InitialSPEForm>> {
	const pdfDoc = await PDFDocument.load(await pdfSource.arrayBuffer());

	let extractedData: Partial<InitialSPEForm> = {};

	try {
		const form = pdfDoc.getForm();
		extractedData.name = form.getTextField(fieldMapping.name).getText();
		extractedData.studentNumber = form.getTextField(fieldMapping.studentNumber).getText();
		extractedData.programYear = form.getTextField(fieldMapping.programYear).getText();
		extractedData.contactNumber = form.getTextField(fieldMapping.contactNumber).getText();
		extractedData.emailAddress = form.getTextField(fieldMapping.email).getText();
		extractedData.termAppliedFor = form.getTextField(fieldMapping.term).getText()?.trim() || '';
		extractedData.spasId = form.getTextField(fieldMapping.spasID).getText();
		extractedData.recentlyAttendedEvent =
			form.getTextField(fieldMapping.attendedEvent).getText()?.trim() || '';
		extractedData.isMember =
			form.getCheckBox(fieldMapping.isMemberYes).isChecked() ||
			form.getCheckBox(fieldMapping.isMemberNo).isChecked()
				? form.getCheckBox(fieldMapping.isMemberYes).isChecked()
				: undefined;
	} catch (error) {
		console.error('Error extracting data from PDF:', error);
		throw new Error(
			'Failed to extract data from PDF. The file may be corrupted or not in the expected format.'
		);
	}

	return extractedData;
}
async function getImageBytes(source: string) {
	if (source.startsWith('data:')) {
		const base64 = source.split(',')[1];
		const binary = atob(base64);

		const bytes = new Uint8Array(binary.length);

		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}

		return bytes;
	}

	const res = await fetch(source);

	if (!res.ok) {
		throw new Error('Failed to fetch image');
	}

	return new Uint8Array(await res.arrayBuffer());
}
export async function generateFinalSPEF(initialSpef: File, data: FinalSPEForm) {
	console.log('Generating final SPEF with data:', data);
	const pdfDoc = await PDFDocument.load(await initialSpef.arrayBuffer());
	const form = pdfDoc.getForm();

	form.getTextField(fieldMapping.name).setText(data.name);
	form.getTextField(fieldMapping.studentNumber).setText(data.studentNumber);
	form.getTextField(fieldMapping.programYear).setText(data.programYear);
	form.getTextField(fieldMapping.contactNumber).setText(data.contactNumber);
	form.getTextField(fieldMapping.email).setText(data.emailAddress);
	form.getTextField(fieldMapping.term).setText(data.termAppliedFor);
	form.getTextField(fieldMapping.spasID).setText(data.spasId);
	form.getTextField(fieldMapping.landbankAccount).setText(data.landbankAccount);
	form.getTextField(fieldMapping.gwa).setText(data.latestGWA.toString());
	form.getTextField(fieldMapping.remainingUnits).setText(data.remainingNumberOfUnits.toString());

	if (data.recentlyAttendedEvent) {
		form.getTextField(fieldMapping.attendedEvent).setText(data.recentlyAttendedEvent);
		form.getCheckBox(fieldMapping.attendedEventYes).check();
	} else {
		form.getCheckBox(fieldMapping.attendedEventNo).check();
	}
	if (data.isMember) {
		form.getCheckBox(fieldMapping.isMemberYes).check();
	} else {
		form.getCheckBox(fieldMapping.isMemberNo).check();
	}

	const pages = pdfDoc.getPages();

	//PHOTOS LOGIC
	const gradesFile = await getImageBytes(data.gradesPhoto);
	if (gradesFile) {
		try {
			let gradesImage;

			if (getFileType(gradesFile) === 'jpg') {
				gradesImage = await pdfDoc.embedJpg(gradesFile);
			} else if (getFileType(gradesFile) === 'png') {
				gradesImage = await pdfDoc.embedPng(gradesFile);
			} else if (getFileType(gradesFile) === 'pdf') {
				console.warn('PDF files for grades not supported yet, skipping image embed');
			}

			if (gradesImage) {
				const gradesPage = pages[coordinates.grades.page];
				const { height } = gradesPage.getSize();

				// Limit height to 160, maintain aspect ratio
				const maxGradesHeight = 226;
				const originalGradesDims = gradesImage.size();
				const gradesScale = Math.min(maxGradesHeight / originalGradesDims.height, 1);
				const scaledGradesWidth = originalGradesDims.width * gradesScale;
				const scaledGradesHeight = originalGradesDims.height * gradesScale;

				gradesPage.drawImage(gradesImage, {
					x: coordinates.grades.x,
					y: height - coordinates.grades.y - scaledGradesHeight, // Convert from top-left to bottom-left
					width: scaledGradesWidth,
					height: scaledGradesHeight
				});
			}
		} catch (e) {
			throw new Error(
				'Error embedding grades photo: ' + (e instanceof Error ? e.message : String(e))
			);
		}
	}

	// Embed eCM photo
	const ecmFile = await getImageBytes(data.ecmPhoto);
	if (ecmFile) {
		try {
			let ecmImage;

			if (getFileType(ecmFile) === 'jpg') {
				ecmImage = await pdfDoc.embedJpg(ecmFile);
			} else if (getFileType(ecmFile) === 'png') {
				ecmImage = await pdfDoc.embedPng(ecmFile);
			} else if (getFileType(ecmFile) === 'pdf') {
				console.warn('PDF files for eCM not supported yet, skipping image embed');
			}

			if (ecmImage) {
				const ecmPage = pages[coordinates.ecm.page];
				const { height } = ecmPage.getSize();

				// Limit height to 226, maintain aspect ratio
				const maxHeight = 250;
				const originalDims = ecmImage.size();
				const scale = Math.min(maxHeight / originalDims.height, 1);
				const scaledWidth = originalDims.width * scale;
				const scaledHeight = originalDims.height * scale;

				ecmPage.drawImage(ecmImage, {
					x: coordinates.ecm.x,
					y: height - coordinates.ecm.y - scaledHeight, // Convert from top-left to bottom-left
					width: scaledWidth,
					height: scaledHeight
				});
			}
		} catch (e) {
			throw new Error('Error embedding eCM photo: ' + (e instanceof Error ? e.message : String(e)));
		}
	}
	//

	const pdfBytes = await pdfDoc.save();
	const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength);
	new Uint8Array(pdfBuffer).set(pdfBytes);
	const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
	const url = URL.createObjectURL(blob);
	return url;
}
export function linksToGroup(links: Link[]): LinkGroup[] {
	const groups = new Map<string, Link[]>();

	for (const link of links) {
		if (!link.committee?.length) continue; // Skip null or empty arrays

		for (const committee of link.committee) {
			if (!groups.has(committee)) {
				groups.set(committee, []);
			}

			groups.get(committee)!.push(link);
		}
	}

	return Array.from(groups, ([group, links]) => ({
		group,
		links: links.sort((a, b) => a.position - b.position)
	}));
}
export function readTerm(term: string): {
	term_number: number;
	academic_year: number;
} {
	if (term.trim() === '') {
		return { term_number: 0, academic_year: 0 };
	}
	const termNumber = parseInt(term.split(',')[0].trim().split(' ')[1]);
	const academicYear = parseInt(term.split(',')[1].trim().split(' ')[1].trim().split('-')[0]);
	return { term_number: termNumber, academic_year: academicYear };
}
export function isAtLeastDaysAway(date: Date | string, days: number): boolean {
	const target = new Date(date);
	target.setHours(0, 0, 0, 0);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	return diffDays >= days;
}
