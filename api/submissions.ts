import { Client, Submission } from "../types";

export const submissionsApi = (client: Client) => ({
    getAssignmentSubmissions: (assignmentId: number, courseId: number) => client.request('get', `/courses/${courseId}/assignments/${assignmentId}/submissions`),
    get: (assignmentId: number, courseId: number, userId: number) => client.request('get', `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`),
});
