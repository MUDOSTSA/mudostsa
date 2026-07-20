import type { PageLoad } from './$types';
import { readRows } from '$lib/app/lib/supabase';
export const load: PageLoad = async ({ params }) => {
	const submissions = await readRows('spef_submissions_anon', { id: params.slug });
	const submission = submissions.data ? (submissions.data[0] ?? null) : null;
	const pageTitle = submission.full_name ?? 'Submission not found';
	return {
		title: `${pageTitle}`,
		submission,
		id: 'myscholarship'
	};
};
