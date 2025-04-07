import { Client, File } from "../types";

export const filesApi = (client: Client) => ({
    getAll: (courseId: string) => client.request('get', `courses/${courseId}/files`),
    getForUser: (userId: string) => client.request('get', `users/${userId}/files`),
    get: (fileId: string) => client.request('get', `files/${fileId}`),
    getFolder: (folderId: string) => client.request('get', `folders/${folderId}/files`),
    create: (file: File) => client.request('post', 'files', file),
    courseFile: (courseId: string, fileId: string) => client.request('get', `courses/${courseId}/files/${fileId}`),
});
