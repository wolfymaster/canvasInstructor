import dotenv from 'dotenv';
import { createCanvasApi, createClient } from './api'
import { getAssignmentByName, getCourseByName } from './util';

dotenv.config();

const baseUrl = `${process.env.PROD_CANVAS_API_URL}/api/v1`
const token = process.env.PROD_CANVAS_TOKEN || '';
const userId = '1';

const client = createClient({ baseUrl, token, userId });

const api = createCanvasApi(client);

const courseName = '2408-FTB-MT-WEB-PT';

const course = await getCourseByName(api, courseName);

console.log(course);

if(!course) {
    throw new Error(`Course ${courseName} not found`);
}

const assignment = await getAssignmentByName(api, course.id, 'Block 2 Workshop: My First Website');

const submissions = await api.submissions.getAssignmentSubmissions(assignment.id, course.id);

console.log(submissions[0].attachments);