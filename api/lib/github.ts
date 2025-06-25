export default class Github {
    private baseUrl = "https://api.github.com";
    private headers = {
        authorization: '',
        accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    }

    constructor({ apiKey }: GithubConstructorParams) {
        this.headers.authorization = `Bearer ${apiKey}`;
    }

    async getRepository(organizationName: string, repositoryName: string): Promise<GithubResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/repos/${organizationName}/${repositoryName}`, {
                method: 'get',
                headers: this.headers
            });

            const body = await response.json();

            return {
                success: true,
                repository: body,
            }
        } catch (err: unknown) {
            return {
                success: false,
                message: (err as Error).message,
                repository: {
                    name: repositoryName,
                    owner: organizationName,
                }
            }
        }

    }

    async addTeamToRepository(organziationName: string, teamName: string, ownerName: string, repositoryName: string): Promise<GithubResponse> {
        const response = await fetch(`${this.baseUrl}/orgs/${organziationName}/teams/${teamName}/repos/${ownerName}/${repositoryName}`, {
            method: 'put',
            headers: this.headers,
            body: JSON.stringify({
                permission: 'pull',
            })
        });

        const body = await response.json();

        if (response.status !== 204) {
            return {
                success: false,
                message: body.message,
                repository: {
                    name: repositoryName,
                    owner: ownerName
                }
            }
        }

        // 204 status has no content
        return {
            success: true,
            repository: {
                name: repositoryName,
                owner: ownerName
            }
        }
    }

}

interface GithubConstructorParams {
    apiKey: string;
}

interface GithubResponse {
    success: boolean;
    message?: string;
    repository: {
        name: string;
        owner: string;
    }
}