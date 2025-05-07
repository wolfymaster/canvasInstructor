import { Client } from "../types";

export const accessTokenApi = (client: Client) => ({
    create: () => {
        const params = new URLSearchParams();
        params.set('token[purpose]', 'For something');
        return client.request('post', `users/${client.userId}/tokens?${params.toString()}`, {});
    },
    revoke: () => client.request('delete', `users/${client.userId}/tokens`),
});
