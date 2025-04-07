
import { Client, Course } from "../types";

export const coursesApi = (client: Client) => ({
    getAll: () => client.request('get', 'courses'),
    get: (courseId: string) => client.request('get', `courses/${courseId}`),
    create: (course: Course) => client.request('post', 'courses', course),
    update: (course: Course) => client.request('patch', `courses/${course.id}`, course),
    delete: (courseId: string) => client.request('delete', `courses/${courseId}`),
});
 