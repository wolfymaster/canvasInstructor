import { AssignmentUpdatedAttributes, Client } from "../types";
import { objectToFormData } from "../helpers";

export const assignmentsApi = (client: Client) => ({
    getAll: (courseId: string) => client.request('get', `courses/${courseId}/assignments`),
    getForUser: (courseId: string, userId: string) => client.request('get', `users/${userId}/courses/${courseId}/assignments`),
    get: (assignmentId: number, courseId: string) => client.request('get', `courses/${courseId}/assignments/${assignmentId}`),
    update: (assignmentId: number, courseId: string, data: AssignmentUpdatedAttributes) => {
        console.log('data', data);
        const formData = objectToFormData(data, 'assignment');
        console.log('formdata', formData);
        return client.request('put', `courses/${courseId}/assignments/${assignmentId}`, formData);
    },
    groups: (courseId: string) => client.request('get', `/courses/${courseId}/assignment_groups`),
});
