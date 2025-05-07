import { Client, Module, ModuleItem, ModuleUpdateAttributes } from "./types";
import { objectToFormData } from "./helpers";

export const modulesApi = (client: Client) => ({
    getAll: (courseId: string) => client.request('get', `courses/${courseId}/modules`),
    get: (courseId: string, moduleId: string) => client.request('get', `courses/${courseId}modules/${moduleId}`),
    update: (courseId: string, moduleId: string, data: ModuleUpdateAttributes) => {
        const formData = objectToFormData(data, 'module');
        return client.request('put', `courses/${courseId}/modules/${moduleId}`, formData);
    },
    items: (courseId: string, moduleId: string) => client.request('get', `courses/${courseId}/modules/${moduleId}/items`),
});
