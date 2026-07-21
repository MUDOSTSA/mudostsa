import {
	createClient,
	type SupabaseClient,
	type AuthChangeEvent,
	type Session,
	type PostgrestSingleResponse
} from '@supabase/supabase-js';
import type {
	AttendanceSheet,
	BasicAttendanceSheet,
	FlatMember,
	InventoryItem,
	MemberInfo,
	Event,
	RoomTambayanSchedule,
	Tenure,
	MemberAuditLog,
	InventoryAuditLog,
	DetailedUserRole,
	BasicUserRole,
	MemberInfoWithLinkedProfile,
	AcademicTerm,
	ExpandedSPEFSubmission
} from './types';
import { generateRandomString } from './helper_functions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
});

// --- AUTH ---
export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
	return supabase.auth.signUp({
		email,
		password,
		options: metadata ? { data: metadata } : undefined
	});
};

export const signIn = async (email: string, password: string) => {
	return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
	return supabase.auth.signOut();
};

export const getSession = async () => {
	return supabase.auth.getSession();
};

export const onAuthStateChange = (
	callback: (event: AuthChangeEvent, session: Session | null) => void
) => {
	return supabase.auth.onAuthStateChange(callback);
};

// --- CRUD (Generic)
export const createRow = async (table: string, values: Record<string, any>) => {
	return supabase.from(table).insert(values).select();
};

export const readRows = async (table: string, query: Record<string, any> = {}) => {
	return supabase.from(table).select('*').match(query);
};
export const readTambayanSchedules: () => Promise<
	PostgrestSingleResponse<RoomTambayanSchedule[]>
> = async () => {
	return supabase.from(`tambayan`).select('*, attendance_sheet:attendance_sheets (*)');
};
export const readEvents: () => Promise<PostgrestSingleResponse<Event[]>> = async () => {
	return supabase.from('full_event_view').select('*').order('start', { ascending: true });
};

export const readEvent: (id: number | string) => Promise<PostgrestSingleResponse<Event>> = async (
	id
) => {
	return supabase
		.from('full_event_view')
		.select('*')
		.order('start', { ascending: true })
		.eq('id', id)
		.single();
};

export const readNavigationLinks = async () => {
	return supabase.from('navigation').select('*').order('position', { ascending: true });
};
export const readEventTitle: (
	slug: string
) => Promise<PostgrestSingleResponse<{ title: string }>> = async (slug) => {
	return supabase.from('events').select('title').eq('id', slug).single();
};

export const readInventory: () => Promise<PostgrestSingleResponse<InventoryItem[]>> = async () => {
	return supabase
		.from('inventory')
		.select(
			`*,
    last_modified_by (*),
    added_by (*)`
		)
		.order('updated_at', { ascending: false });
};
export const readAttendanceSheets: () => Promise<
	PostgrestSingleResponse<BasicAttendanceSheet[]>
> = async () => {
	const result = await supabase
		.from('attendance_basic_view')
		.select('*')
		.order('created_at', { ascending: false });
	console.log('readAttendanceSheets data:', result.data, 'error:', result.error);
	return result;
};

export const readAttendanceSheet: (
	id: number
) => Promise<PostgrestSingleResponse<AttendanceSheet>> = async (id) => {
	return supabase
		.from('attendance_sheets')
		.select(
			`*,
    member_records:attendance_record (*, member:members (*)),
    non_member_records:non_member_attendance_record (*),
    for_event:events (*)
    `
		)
		.eq('id', id)
		.single();
};

export const readMember: (id: string) => Promise<PostgrestSingleResponse<MemberInfo>> = async (
	id
) => {
	return supabase
		.from('members')
		.select('*, profile:profiles (*), active_within_tenure:tenures(*)')
		.eq('id', id)
		.single();
};

export const readMemberByStudentNumber: (
	studentNumber: string
) => Promise<PostgrestSingleResponse<MemberInfoWithLinkedProfile | null>> = async (
	studentNumber
) => {
	return supabase
		.from('members_and_linked_profile')
		.select('*')
		.eq('id', studentNumber)
		.maybeSingle();
};
export const getFlatMemberList: () => Promise<PostgrestSingleResponse<FlatMember[]>> = async () => {
	return supabase.from('members_flat_view').select('*').order('name', { ascending: true });
};

export const readTenures: () => Promise<PostgrestSingleResponse<Tenure[]>> = async () => {
	return supabase.from('tenures').select('*').order('tenure_end', { ascending: false });
};

export const updateRow = async (
	table: string,
	id: number | string,
	values: Record<string, any>
) => {
	return supabase.from(table).update(values).eq('id', id).select();
};

export const deleteRow = async (table: string, id: number | string) => {
	return supabase.from(table).delete().eq('id', id);
};

// --- STORAGE ---
export const uploadFile = async (bucket: string, path: string, file: File) => {
	return supabase.storage.from(bucket).upload(path, file);
};

export const uploadAvatar = async (userId: string, blob: Blob) => {
	const response = await supabase.storage.from('avatars').upload(`${userId}/avatar.png`, blob, {
		cacheControl: '3600',
		upsert: true,
		metadata: {
			uploaded_at: new Date().toISOString()
		}
	});
	if (response.error) {
		throw response.error;
	} else {
		const { data } = supabase.storage.from('avatars').getPublicUrl(response.data.path);
		return data.publicUrl;
	}
};

export const downloadFile = async (bucket: string, path: string) => {
	return supabase.storage.from(bucket).download(path);
};

export const listFiles = async (bucket: string, path: string = '') => {
	return supabase.storage.from(bucket).list(path);
};

export const deleteFile = async (bucket: string, path: string) => {
	return supabase.storage.from(bucket).remove([path]);
};
export const authorize: (requested_permission: string) => Promise<boolean> = async (
	requested_permission
) => {
	const result = await supabase.rpc('authorize', { requested_permission });
	return result.data;
};

// --- AUDIT ---
export const readMembersAudit: () => Promise<
	PostgrestSingleResponse<MemberAuditLog[]>
> = async () => {
	return supabase
		.from('members_audit')
		.select('*, modified_by:profiles(*)')
		.order('created_at', { ascending: false });
};

export const readInventoryAudit: () => Promise<
	PostgrestSingleResponse<InventoryAuditLog[]>
> = async () => {
	return supabase
		.from('inventory_audit')
		.select('*, modified_by:profiles(*)')
		.order('created_at', { ascending: false });
};

export const membersUndo = async (auditId: number) => {
	return supabase.rpc('members_undo', { audit_id: auditId });
};

export const inventoryUndo = async (auditId: number) => {
	return supabase.rpc('inventory_undo', { audit_id: auditId });
};

export const getUserRoles: () => Promise<
	PostgrestSingleResponse<DetailedUserRole[]>
> = async () => {
	const result = await supabase.rpc('get_all_user_roles');
	return result;
};

export const verifyUser: (
	user_id: string
) => Promise<PostgrestSingleResponse<BasicUserRole[]>> = async (user_id) => {
	const result = await supabase.rpc('verify', { user_uuid: user_id });
	return result;
};

export const revokeUserVerification: (
	user_id: string
) => Promise<PostgrestSingleResponse<BasicUserRole[]>> = async (user_id) => {
	const result = await supabase.rpc('revoke_verification', {
		user_uuid: user_id
	});
	return result;
};
export const updateUserRole: (
	user_id: string,
	role: string
) => Promise<PostgrestSingleResponse<null>> = async (user_id, role) => {
	const result = await supabase.rpc('update_user_role', {
		user_uuid: user_id,
		new_role: role
	});
	return result;
};

export const getAcademicTerms: () => Promise<
	PostgrestSingleResponse<AcademicTerm[]>
> = async () => {
	return await supabase.rpc('get_academic_terms');
};

export const getEventTitles: () => Promise<
	PostgrestSingleResponse<{ title: string }[]>
> = async () => {
	return await supabase.from('events').select('title').eq('private', false);
};

export const getFilePath = async (key: string) => {
	return await supabase.from('uploaded_documents').select('file_path').eq('key', key).single();
};

export const getSignedURL = async (bucket: string, path: string, expiresIn: number = 3600) => {
	return await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
};
export const uploadInitialSPEF = async (
	term: { term_number: number; academic_year: number },
	studentNumber: string,
	receipt: string,
	blob: Blob
) => {
	const response = await supabase.storage
		.from('spef')
		.upload(
			`anonymous/${term.term_number}-${term.academic_year}/${studentNumber}_${receipt}-initialspef.pdf`,
			blob,
			{
				cacheControl: '3600',
				upsert: true,
				metadata: {
					uploaded_at: new Date().toISOString(),
					from: 'website'
				}
			}
		);
	if (response.error) {
		throw response.error;
	} else {
		return response.data.path;
	}
};
export const uploadSignedInitialSPEF = async (submission: ExpandedSPEFSubmission, blob: Blob) => {
	let fileName = `${submission.full_name}_signed.pdf`;
	let path = `${submission.member}/${submission.term_number}-${submission.academic_year}/`;
	if (!submission.member) {
		path = `anonymous/${submission.term_number}-${submission.academic_year}/`;
		fileName = `${submission.student_number}_signed.pdf`;
	}
	const response = await supabase.storage.from('spef').upload(`${path}${fileName}`, blob, {
		cacheControl: '3600',
		upsert: true,
		metadata: {
			uploaded_at: new Date().toISOString(),
			from: 'app'
		}
	});
	if (response.error) {
		throw response.error;
	} else {
		return response.data.path;
	}
};
export async function getTerm(term: { term_number: number; academic_year: number }) {
	return await supabase
		.from('academic_terms')
		.select('*')
		.eq('term_number', term.term_number)
		.eq('academic_year', term.academic_year)
		.single<{
			id: number;
			term_number: number;
			academic_year: number;
			term_end: string;
		}>();
}
export async function submitInitialSPEF(
	file: File,
	term: { term_number: number; academic_year: number; id: number },
	anonSubmission: { fullName: string; email: string; studentNumber: string; programYear: string }
) {
	const now = new Date();
	const receipt = `submission-${generateRandomString(20)}-${now.valueOf()}`;
	const uploadResult = await uploadInitialSPEF(term, anonSubmission.studentNumber, receipt, file);

	if (uploadResult && term.id) {
		const { error } = await supabase.from('spef_submissions_anon').insert({
			term: term.id,
			path: uploadResult,
			full_name: anonSubmission.fullName,
			email: anonSubmission.email,
			student_number: anonSubmission.studentNumber,
			program_year: anonSubmission.programYear,
			receipt
		});
		if (!error) {
			return receipt;
		} else {
			throw new Error('Invalid submission. Existing submission might already be present');
		}
	} else {
		throw new Error('Failed to submit');
	}
}
export async function getUserSPEFSubmissions(
	userId: string
): Promise<PostgrestSingleResponse<ExpandedSPEFSubmission[]>> {
	return await supabase
		.from('spef_submissions_expanded')
		.select('*')
		.eq('member', userId)
		.order('academic_year', { ascending: false })
		.order('term_number', { ascending: false });
}
export async function getSPEFLink(path: string) {
	const { data, error } = await supabase.storage.from('spef').createSignedUrl(path, 60 * 10); //only valid for 10 minutes

	if (error) {
		throw error;
	}
	return data.signedUrl;
}

export async function getSubmissionByReceipt(receipt: string) {
	return await supabase.rpc('get_anon_submission', {
		p_receipt: receipt
	});
}
