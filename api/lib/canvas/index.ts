import { accessTokenApi } from "./api/accessToken";
import { assignmentsApi } from "./api/assignments";
import { coursesApi } from "./api/courses";
import { filesApi } from "./api/files";
import { modulesApi } from "./api/modules";
import { submissionsApi } from "./api/submissions";
import { request } from './helpers';
import { CanvasApi, CanvasApiOptions, Client } from "./types";

export const createClient = ({ baseUrl, userId, token }: CanvasApiOptions): Client => {
  return {
    baseUrl,
    token,
    userId,
    request,
  };
};

export const createCanvasApi = (client: Client): CanvasApi => {
  return {
    accessTokenApi: accessTokenApi(client),
    assignments: assignmentsApi(client),
    courses: coursesApi(client),
    files: filesApi(client),
    modules: modulesApi(client),
    request: request.bind(client),
    submissions: submissionsApi(client),
  };
};