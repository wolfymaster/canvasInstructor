import { Client, ModuleUpdateAttributes, ModuleItemUpdateAttributes } from "./types";
import { objectToFormData } from "./helpers";

export const modulesApi = (client: Client) => ({
    getAll: (courseId: string) => client.request('get', `courses/${courseId}/modules`),
    get: (courseId: string, moduleId: string) => client.request('get', `courses/${courseId}modules/${moduleId}`),
    update: (courseId: string, moduleId: string, data: ModuleUpdateAttributes) => {
        const formData = objectToFormData(data, 'module');
        return client.request('put', `courses/${courseId}/modules/${moduleId}`, formData);
    },
    items: (courseId: string, moduleId: string) => client.request('get', `courses/${courseId}/modules/${moduleId}/items`),
    item: (courseId: string, moduleId: string, itemId: string) => client.request('get', `courses/${courseId}/modules/${moduleId}/items/${itemId}`),
    updateItem: (courseId: string, moduleId: string, itemId: string, data: ModuleItemUpdateAttributes) => {
        const formData = objectToFormData(data, 'module_item');
        return client.request('put', `courses/${courseId}/modules/${moduleId}/items/${itemId}`, formData);
    }
});
