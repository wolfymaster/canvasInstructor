import { Client } from "./types";

export const enrollmentsApi = (client: Client) => ({
    get: (courseId: string) => client.request('get', `courses/${courseId}/enrollments`),
});
