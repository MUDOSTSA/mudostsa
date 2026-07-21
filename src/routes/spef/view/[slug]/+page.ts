import type { PageLoad } from './$types';
import { getSubmissionByReceipt, readRows } from '$lib/app/lib/supabase';
import { error } from '@sveltejs/kit';
export const load: PageLoad = async ({ params }) => {
	const { data, error: resultError } = await getSubmissionByReceipt(params.slug);
	if (resultError) {
		throw error(404, 'Submission not found');
	} else if (data.length === 0) {
		throw error(404, 'Submission not found');
	}
	const submission = data ?? null;
	return {
		title: 'Viewing submission',
		submission: submission ? (submission[0] ?? submission) : null,
		receipt: params.slug,
		id: 'myscholarship'
	};
};
