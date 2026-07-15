import { z } from 'zod';

export const initialSpefSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	studentNumber: z.string().min(1, 'Student number is required'),
	contactNumber: z.string().min(1, 'Contact number is required'),
	programYear: z.string().min(1, 'Program and Year is required'),
	emailAddress: z
		.email()
		.endsWith('@mymail.mapua.edu.ph', {
			message: 'Email must be a valid Mapúa email address'
		})
		.min(1, 'Email address is required'),
	termAppliedFor: z.string().min(1, 'Term applied for is required'),
	isMember: z.boolean().default(false),
	recentlyAttendedEvent: z.string().optional(),
	spasId: z.string().min(1, 'SPAS ID is required'),
	signature: z.string().optional().or(z.literal(''))
});

export type InitialSPEForm = z.infer<typeof initialSpefSchema>;

export const finalSpefSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	studentNumber: z.string().min(1, 'Student number is required'),
	contactNumber: z.string().min(1, 'Contact number is required'),
	programYear: z.string().min(1, 'Program and Year is required'),
	emailAddress: z
		.email()
		.endsWith('@mymail.mapua.edu.ph', {
			message: 'Email must be a valid Mapúa email address'
		})
		.min(1, 'Email address is required'),
	termAppliedFor: z.string().min(1, 'Term applied for is required'),
	isMember: z.boolean().default(false),
	recentlyAttendedEvent: z.string().optional(),
	spasId: z.string().min(1, 'SPAS ID is required'),
	remainingNumberOfUnits: z.number().min(0, 'Remaining number of units is required'),
	latestGWA: z.number().min(1, 'Latest GWA is required').max(5, 'Latest GWA must be 5 or below'),
	landbankAccount: z.string().min(1, 'Landbank account number is required'),
	gradesPhoto: z.string().min(1, 'Screenshot of grades is required'),
	ecmPhoto: z.string().min(1, 'Electronic Certificate of Matriculation [eCM] is required')
});

export type FinalSPEForm = z.infer<typeof finalSpefSchema>;
