export type Link = {
  name: string;
  href: string;
  scope: number;
  icon: string;
  position: number;
  committee: string[] | null;
};

export type LinkGroup = {
  group: string;
  links: Link[];
};

export type Tenure = {
  id: number;
  tenure_end: string;
  name: string;
};

export type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  position: string;
  avatar?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  member_info?: MemberInfo | null;
};
export type ProfileRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  position: string;
  avatar?: string;
  email?: string;

  student_number?: string;
};

export type InventoryItem = {
  id: number;
  created_at: Date;
  name: string;
  description: string;
  quantity: number;
  location: string;
  added_by: Profile;
  last_modified_by: Profile;
  category: string;
  updated_at: Date;
};
export type RoomTambayanSchedule = {
  id: number;
  created_at: Date;
  room: string;
  campus: string;
  time_start: Date;
  time_end: Date;
  attendance_sheet?: AttendanceSheet | null;
};

export type RoomTambayanScheduleNormalized = {
  id: number;
  created_at: Date;
  room: string;
  campus: string;
  time_start: Date;
  time_end: Date;
  attendance_sheet_id: number | null;
  attendance_sheet_code: string | null;
  has_attendance_sheet: boolean;
};

export type InventoryItemWithSelectedQuantity = {
  id: number;
  created_at: Date;
  name: string;
  description: string;
  quantity: number;
  location: string;
  added_by: Profile;
  last_modified_by: Profile;
  category: string;
  updated_at: Date;
  selectedQuantity: number;
};
export type SelectableInventoryItem = {
  item: InventoryItem;
  selected: boolean;
};

export type MembershipInfo = {
  id: string;
  position: string;
  name: string;
  active: boolean;
};
export type BasicAttendanceSheet = {
  id: number;
  created_at: Date;
  name: string;
  event_title: string | null | undefined;
  count: number;
  locked: boolean;
  private: boolean;
};
export type TimelineItem = {
  name: string;
  description: string;
  facilitator: { id: string; name: string } | null;
  start: string;
  end: string;
};

export type Timeline = {
  pre: TimelineItem[];
  proper: TimelineItem[];
  post: TimelineItem[];
};

export type TimeRange = {
  start: Date | null;
  end: Date | null;
};

export type PhaseRanges = {
  pre: TimeRange;
  proper: TimeRange;
  post: TimeRange;
};
export type Event = {
  id: number;
  created_at: Date;
  title: string;
  description: string;
  start: Date;
  end: Date;
  poster_url: string | null;
  registration_url: string | null;
  facebook_announcement_url: string | null;
  private: boolean;
  facilitators: { student_number: string; name: string }[];
  venue: string | null;
  timeline: Timeline;
};

export type AttendanceSheet = {
  id: number;
  created_at: Date;
  name: string;
  for_event?: Event | null | undefined;
  member_records: MemberAttendanceRecord[];
  non_member_records: NonMemberAttendanceRecord[];
  locked: boolean;
  private: boolean;
  code: string | null;
};
export type MemberAttendanceRecord = {
  id: number;
  created_at: Date;
  member: MemberInfo;
};
export type NonMemberAttendanceRecord = {
  id: number;
  created_at: Date;
  name: string;
  program: string;
  year: number;
  student_number: string;
};
export type MemberInfo = {
  id: string;
  role: string;
  name: string;
  program: string;
  year: number;
  committee?: Committee;
  membership_expiry: string;
};
export type MemberInfoWithLinkedProfile = MemberInfo & {
  user_id: string;
};
export type FlatMember = {
  student_number: string;
  role: string;
  name: string;
  program: string;
  year: number;
  committee?: Committee;
  membership_expiry: string | null;
  active_within_tenure_id?: number;
  status: string;
  email?: string;
  display_name?: string;
};
export type BasicUserRole = {
  user_id: string;
  role: string;
  verified: boolean;
};
export type DetailedUserRole = {
  user_id: string;
  role: string;
  verified: boolean;
  display_name: string;
  avatar: string | null;
  last_name: string;
  first_name: string;
  position: string;
  email: string | null;
  student_number: number | null;
  full_name: string;
};

export type Committee =
  | "executive"
  | "logistics"
  | "financeAndBusiness"
  | "productions"
  | "memberships"
  | "ardc"
  | "creatives"
  | "documentations"
  | "publicRelations"
  | "partnershipsAndSponsorships"
  | "soccom";
export type UserRole =
  | "admin"
  | "executive"
  | "committee_member"
  | "officer"
  | "coordinator"
  | "member"
  | "unverified";

export type AttendanceRecordAdapter = {
  id: string;
  created_at: Date;
  name: string;
  program: string;
  year: number;
  committee: string;
  role: string;
  student_number: string;
  is_member: boolean;
};
export type InventoryTableRow = {
  //one-to-one mapping to inventory table
  id: number;
  name: string;
  added_by: string;
  category: string;
  location: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  description: string;
  last_modified_by: string;
};
export type MembersTableRow = {
  //one-to-one mapping to members table
  id: string;
  name: string;
  program: string;
  year: number;
  role: string;
  committee: string | null;
  active_within_tenure_id: number | null;
};
export type InventoryAuditLog = {
  id: number;
  created_at: Date;
  before: InventoryTableRow;
  after: InventoryTableRow;
  modified_by: Profile;
  undone_at?: string | null;
};
export type MemberAuditLog = {
  id: number;
  created_at: Date;
  before: MembersTableRow;
  after: MembersTableRow;
  modified_by: Profile;
  undone_at?: string | null;
};
export type UserSensitiveData = {
  landbank_account?: string | null;
  spas_id?: string | null;
  contact_number?: string | null;
  school_email?: string | null;
  signature?: string | null;
};

type ScholarshipType = {
  name: string;
  description: string;
};

type PrivilegeName =
  | "Tuition Subsidy"
  | "Thesis Allowance"
  | "Monthly Allowance"
  | "Clothing Allowance"
  | "Graduation Allowance"
  | "Transporation"
  | "Group Health and Accident Insurance"
  | "Learning Material Allowance";

type Privilege = {
  name: PrivilegeName;
  notes?: string;
  midYearTerm: string | null;
  regularAcademicYear: string | null;
};

export type ScholarshipData = {
  scholarshipTypes: ScholarshipType[];
  privileges: Privilege[];
  terminationGrounds: string[];
  deficiencies: string[];
  readMoreLink: string;
  expectedMonthlyAssistance: string;
};

export type AcademicTerm = {
  id: number;
  term_number: number;
  academic_year: number;
  term_end: string;
};
export type ExpandedSPEFSubmission = {
  id: string;
  created_at: string;
  member: string | null;
  path: string;
  term: number;
  term_number: number;
  academic_year: number;
  term_end: string;
  display_name: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  full_name: string;
  signed_path: string | null;
  emailed: boolean;
};
export type ExpandedSPEFSubmissionGroup = {
  academic_year: number;
  submissions: ExpandedSPEFSubmission[];
};
export function groupByAcademicYear(
  submissions: ExpandedSPEFSubmission[],
): ExpandedSPEFSubmissionGroup[] {
  return Object.values(
    submissions.reduce<Record<number, ExpandedSPEFSubmissionGroup>>(
      (acc, submission) => {
        const { academic_year } = submission;

        if (!acc[academic_year]) {
          acc[academic_year] = {
            academic_year,
            submissions: [],
          };
        }

        acc[academic_year].submissions.push(submission);

        return acc;
      },
      {},
    ),
  );
}

export function prettifyRole(input: string): string {
  return input
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
export function committeeToString(committee: Committee | undefined): string {
  switch (committee) {
    case "executive":
      return "Executive";
    case "logistics":
      return "Logistics";
    case "financeAndBusiness":
      return "Finance and Business";
    case "productions":
      return "Productions";
    case "memberships":
      return "Memberships";
    case "ardc":
      return "ARDC";
    case "creatives":
      return "Creatives";
    case "documentations":
      return "Documentations";
    case "publicRelations":
      return "Public Relations";
    case "partnershipsAndSponsorships":
      return "Partnerships & Sponsorships";
    case "soccom":
      return "SOCCOM";
    default:
      return "None";
  }
}

export function getCommitteeColor(committee: Committee | undefined): string {
  switch (committee) {
    case "executive":
      return "from-purple-800/60 to-purple-800/10 border-purple-600";
    case "logistics":
      return "from-orange-800/60 to-orange-800/10 border-orange-600";
    case "financeAndBusiness":
      return "from-green-800/60 to-green-800/10 border-green-600";
    case "productions":
      return "from-pink-800/60 to-pink-800/10 border-pink-600";
    case "memberships":
      return "from-blue-800/60 to-blue-800/10 border-blue-600";
    case "ardc":
      return "from-yellow-800/60 to-yellow-800/10 border-yellow-600";
    case "creatives":
      return "from-rose-800/60 to-rose-800/10 border-rose-600";
    case "documentations":
      return "from-cyan-800/60 to-cyan-800/10 border-cyan-600";
    case "publicRelations":
      return "from-indigo-800/60 to-indigo-800/10 border-indigo-600";
    case "partnershipsAndSponsorships":
      return "from-teal-800/60 to-teal-800/10 border-teal-600";
    case "soccom":
      return "from-lime-800/60 to-lime-800/10 border-lime-600";
    default:
      return "from-slate-700/60 to-slate-700/10 border-slate-500 opacity-35";
  }
}

export function normalizeAttendanceRecord(
  record: MemberAttendanceRecord | NonMemberAttendanceRecord,
): AttendanceRecordAdapter {
  if ("member" in record) {
    // It's a MemberAttendanceRecord
    return {
      id: `m-${record.id}`,
      created_at: record.created_at,
      name: record.member.name,
      program: record.member.program,
      year: record.member.year,
      committee: committeeToString(record.member.committee),
      role: record.member.role,
      student_number: record.member.id,
      is_member: true,
    };
  } else {
    // It's a NonMemberAttendanceRecord
    return {
      id: `g-${record.id}`,
      created_at: record.created_at,
      name: record.name,
      program: record.program,
      year: record.year,
      committee: "",
      role: "",
      student_number: record.student_number,
      is_member: false,
    };
  }
}

export function normalizeRoomTambayanSchedule(
  schedule: RoomTambayanSchedule,
): RoomTambayanScheduleNormalized {
  return {
    id: schedule.id,
    created_at: schedule.created_at,
    room: schedule.room,
    campus: schedule.campus,
    time_start: schedule.time_start,
    time_end: schedule.time_end,
    attendance_sheet_id: schedule.attendance_sheet?.id || null,
    attendance_sheet_code: schedule.attendance_sheet?.code || null,
    has_attendance_sheet: !!schedule.attendance_sheet,
  };
}

export function formatDateTime(
  date: Date,
  dayOrTimeOnly: "day" | "time" | "both" = "both",
): string {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  switch (dayOrTimeOnly) {
    case "day":
      return datePart;
    case "time":
      return timePart;
    case "both":
    default:
      return `${datePart} [${weekday}] @ ${timePart}`;
  }
}
