export type ValidHTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface Client {
  baseUrl: string;
  token: string;
  userId: string;
  request: (method: ValidHTTPMethod, url: string, body?: any) => Promise<any>;
}

export interface CanvasApi {
    accessTokenApi: AccessTokenApi;
    assignments: AssignmentsApi;
    courses: CoursesApi;
    files: FilesApi;
    modules: ModulesApi;
    request: (method: ValidHTTPMethod, url: string, body?: any) => Promise<any>;
    submissions: SubmissionsApi;
}

export interface CanvasApiOptions {
    baseUrl: string;
    token: string;
    userId: string;
  }

export interface Course {
    id: number;
    name: string;
    account_id: number;
    uuid: string;
    start_at?: Date | null;
    grading_standard_id?: number | null;
    is_public: boolean;
    created_at: Date;
    course_code: string;
    default_view: string;
    root_account_id: number;
    enrollment_term_id: number;
    license: string;
    grade_passback_setting?: null;
    end_at?: Date | null;
    public_syllabus: boolean;
    public_syllabus_to_auth: boolean;
    storage_quota_mb: number;
    is_public_to_auth_users: boolean;
    homeroom_course: boolean;
    course_color?: string | null;
    friendly_name?: string | null;
    apply_assignment_group_weights: boolean;
    calendar: { ics: string };
    time_zone: string;
    blueprint: boolean;
    sis_course_id?: number | null;
    sis_import_id?: number | null;
    integration_id?: number | null;
    enrollments: any[];
    hide_final_grades: boolean;
    workflow_state: string;
    restrict_enrollments_to_course_dates: boolean;
}

export interface Assignment {
    id: number;
    description?: string | null;
    due_at?: Date | null;
    unlock_at?: Date | null;
    lock_at?: Date | null;
    points_possible: number;
    grading_type: string;
    assignment_group_id: number;
    grading_standard_id?: number | null;
    created_at: Date;
    updated_at: Date;
    peer_reviews: boolean;
    automatic_peer_reviews: boolean;
    position: number;
    grade_group_students_individually: boolean;
    anonymous_peer_reviews: boolean;
    group_category_id?: number | null;
    post_to_sis: boolean;
    moderated_grading: boolean;
    omit_from_final_grade: boolean;
    intra_group_peer_reviews: boolean;
    anonymous_instructor_annotations: boolean;
    anonymous_grading: boolean;
    graders_anonymous_to_graders: boolean;
    grader_count: number;
    grader_comments_visible_to_graders: boolean;
    final_grader_id?: number | null;
    grader_names_visible_to_final_grader: boolean;
    allowed_attempts: number;
    annotatable_attachment_id?: number | null;
    hide_in_gradebook: boolean;
    secure_params?: string | null;
    lti_context_id: string;
    course_id: number;
    name: string;
    submission_types: string[];
    has_submitted_submissions: boolean;
    due_date_required: boolean;
    max_name_length: number;
    in_closed_grading_period: boolean;
    graded_submissions_exist: boolean;
    is_quiz_assignment: boolean;
    can_duplicate: boolean;
    original_course_id?: number | null;
    original_assignment_id?: number | null;
    original_lti_resource_link_id?: string | null;
    original_assignment_name?: string | null;
    original_quiz_id?: number | null;
    workflow_state: string;
    important_dates: boolean;
    muted: boolean;
    html_url: string;
    has_overrides: boolean;
    needs_grading_count: number;
    sis_assignment_id?: null | string;
    integration_id?: null | string;
    integration_data: {};
    published: true;
    unpublishable: true;
    only_visible_to_overrides: boolean;
    visible_to_everyone: boolean;
    locked_for_user: boolean;
    submissions_download_url: string;
    post_manually: boolean;
    anonymize_students: boolean;
    require_lockdown_browser: boolean;
    restrict_quantitative_data: boolean;
};

export interface AccessTokenApi {
    create: () => Promise<any>;
    revoke: () => Promise<any>;
}

export interface AssignmentsApi {
    getAll: (courseId: string) => Promise<Assignment[]>;
    getForUser: (courseId: string, userId: string) => Promise<Assignment[]>;
    get: (assignmentId: number, courseId: string) => Promise<Assignment>;
    update: (assignmentId: number, courseId: string, data: AssignmentUpdatedAttributes) => Promise<Assignment>;
    groups: (courseId: string) => Promise<any>
}

export interface CoursesApi {
    getAll: () => Promise<Course[]>;
    get: (courseId: string) => Promise<Course>;
    create: (course: Course) => Promise<Course[]>;
    update: (course: Course) => Promise<Course>;
    delete: (courseId: string) => Promise<void>;
}

export interface FilesApi {
    getAll: (courseId: string) => Promise<File[]>;
    getForUser: (userId: string) => Promise<File[]>;
    get: (fileId: string) => Promise<File>;
    getFolder: (folderId: string) => Promise<File[]>;
    create: (file: File) => Promise<File>;
    courseFile: (courseId: string, fileId: string) => Promise<File>;
}

export interface ModulesApi {
    getAll: (courseId: string) => Promise<Module[]>;
    get: (moduleId: string, courseId: string) => Promise<Module>;
    update: (courseId: string, moduleId: string, data: ModuleUpdateAttributes) => Promise<Module>;
    items: (courseId: string, moduleId: string) => Promise<ModuleItem[]>;
}

export interface SubmissionsApi {
    getAssignmentSubmissions: (assignmentId: number, courseId: number) => Promise<Submission[]>;
    get: (assignmentId: number, courseId: number, userId: number) => Promise<Submission>;
}

export interface File {
    id: number;
    uuid: string;
    folder_id: number;
    display_name: string;
    filename: string;
    'content-type': string;
    url: string;
    size: number;
    created_at: Date;
    updated_at: Date;
    unlock_at: Date;
    locked: boolean;
    hidden: boolean;
    lock_at: Date;
    hidden_for_user: boolean;
    visibility_level: 'inherit' | 'course' | 'institution' | 'public';
    thumbnail_url?: string | null;
    modified_at: Date;
    mime_class: string;
    media_entry_id: string;
    locked_for_user: boolean;
    lock_info?: any;
    lock_explanation?: string | null;
    preview_url?: string | null;
}

export interface Folder {
    context_type: 'Course' | 'User' | 'Institution';
    context_id: number;
    files_count: number;
    position: number;
    updated_at: Date;
    folders_url: string;
    files_url: string;
    full_name: string;
    lock_at: Date | null;
    id: number;
    folders_count: number;
    name: string;
    parent_folder_id: number;
    created_at: Date;
    unlock_at?: Date | null;
    hidden: boolean;
    hidden_for_user: boolean;
    locked: boolean;
    locked_for_user: boolean;
    for_submissions: boolean;
}

export interface Module {
    id: number;
    workflow_state: 'active' | 'deleted';
    position: number;
    name: string;
    unlock_at?: Date; // Use a union type to represent the possibility of it being null or an actual date
    require_sequential_progress: boolean;
    requirement_type: 'all' | 'one';
    prerequisite_module_ids: number[];
    items_count: number;
    items_url: string;
    items?: ModuleItem[] | null; // Use a union type to represent the possibility of it being null or an actual array
    state?: 'locked' | 'unlocked' | 'started' | 'completed'; // Use a union type to represent the possible states
    completed_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
    publish_final_grade?: boolean | null; // Use a union type to represent the possibility of it being null or an actual boolean value
    published: boolean;
}

export interface ModuleItem {
    id: number;
    module_id: number;
    position: number;
    title: string;
    indent: number;
    type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'SubHeader' | 'ExternalUrl' | 'ExternalTool';
    content_id?: number; // Use a union type to represent the possibility of it being null or an actual number
    html_url: string;
    url?: string | null; // Use a union type to represent the possibility of it being null or an actual string
    page_url?: string | null; // Use a union type to represent the possibility of it being null or an actual string
    external_url?: string | null; // Use a union type to represent the possibility of it being null or an actual string
    new_tab: boolean;
    completion_requirement?: {
        type: 'min_score' | 'completed';
        min_score?: number; // Use a union type to represent the possibility of it being null or an actual number
        completed?: boolean; // Use a union type to represent the possibility of it being null or an actual boolean value
    } | null;
    content_details?: {
        points_possible: number;
        due_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
        unlock_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
        lock_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
    } | null;
    published: boolean;
}

export interface Submission {
    assignment_id: number;
    assignment?: any | null; // Use a union type to represent the possibility of it being null or an actual assignment object
    course?: any | null; // Use a union type to represent the possibility of it being null or an actual course object
    attempt: number;
    body: string;
    grade: string;
    grade_matches_current_submission: boolean;
    html_url: string;
    preview_url: string;
    score: number;
    submission_comments?: any[] | null; // Use a union type to represent the possibility of it being null or an actual array of comments
    submission_type: 'online_text_entry' | 'online_url' | 'online_upload' | 'online_quiz' | 'media_recording' | 'student_annotation';
    submitted_at: Date;
    url?: string | null; // Use a union type to represent the possibility of it being null or an actual string
    user_id: number;
    grader_id: number | null; // Use a union type to represent the possibility of it being null or an actual number
    graded_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
    user?: any | null; // Use a union type to represent the possibility of it being null or an actual user object
    late: boolean;
    assignment_visible: boolean;
    excused: boolean;
    missing: boolean;
    late_policy_status: 'late' | 'missing' | 'extended' | 'none' | null;
    points_deducted: number;
    seconds_late: number;
    workflow_state: 'submitted' | 'graded'; // Use a union type to represent the possible values of the workflow state
    extra_attempts: number;
    anonymous_id?: string | null; // Use a union type to represent the possibility of it being null or an actual string
    posted_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
    read_status?: 'read' | 'unread'; // Use a union type to represent the possible values of the read status
    redo_request: boolean;
    attachments: File[]; 
}

export interface SubmissionComment {
    id: number;
    author_id: number;
    author_name: string;
    author: any | null; // Use a union type to represent the possibility of it being null or an actual user object
    comment: string;
    created_at: Date;
    edited_at?: Date | null; // Use a union type to represent the possibility of it being null or an actual date
    media_comment?: any | null; // Use a union type to represent the possibility of it being null or an actual media comment object
}

export interface MediaComment {
    'content-type': string;
    display_name: string;
    media_id: string;
    media_type: 'audio' | 'video';
    url: string;
}

export interface AssignmentUpdatedAttributes  {
    name?: string;
    position?: number;
    submission_types?: string[];
    allowed_extensions?: string[];
    turnitin_enabled?: boolean;
    vericite_enabled?: boolean;
    turnitin_settings?: string;
    sis_assignment_id?: string;
    integration_data?: string;
    integration_id?: string;
    peer_reviews?: boolean;
    automatic_peer_reviews?: boolean;
    notify_of_update?: boolean;
    group_category_id?: number;
    grade_group_students_individually?: number;
    external_tool_tag_attributes?: string;
    poitns_possible?: number;
    grading_typee?: string;
    due_at?: Date;
    lock_at?: Date;
    unlock_at?: Date;
    description?: string;
    published?: boolean;
    omit_from_final_grade?: boolean;
    allowed_attempts?: number;
    force_updated_at?: boolean;
}

export interface ModuleUpdateAttributes {

}