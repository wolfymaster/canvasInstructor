import { accessTokenApi } from "./accessToken";
import { assignmentsApi } from "./assignments";
import { coursesApi } from "./courses";
import { filesApi } from "./files";
import { modulesApi } from "./modules";
import { submissionsApi } from "./submissions";
import { request } from './helpers';
import { CanvasApi, CanvasConfig, Client } from "./types";

export const createClient = (config: CanvasConfig): Client => {
  return {
    config,
    request,
  };
};

export const createCanvasApi = (client: Client): CanvasApi => {
  return {
    accessTokenApi: accessTokenApi(client),
    assignments: assignmentsApi(client),
    client: client,
    courses: coursesApi(client),
    files: filesApi(client),
    modules: modulesApi(client),
    request: request.bind(client),
    submissions: submissionsApi(client),
  };
};
