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

    async addTeamToRepository(organziationName: string, teamName: string, ownerName: string, repositoryName: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/orgs/${organziationName}/teams/${teamName}/repos/${ownerName}/${repositoryName}`, {
            method: 'put',
            headers: this.headers,
            body: JSON.stringify({
                permission: 'pull',
            })
        });

        const body = await response.json();

        if(response.status !== 204) {            
            throw new Error(`status: ${response.status}. ${JSON.stringify(body)}`);
        }

        // 204 status has no content
        return true;
    }

}

interface GithubConstructorParams {
    apiKey: string;
}