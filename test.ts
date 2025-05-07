import dotenv from 'dotenv';
import { createCanvasApi, createClient } from './api'
import { getAssignmentByName, getCourseByName, updateAssignmentDueDate } from './util';
import devTestConfig from './test.json';
import prodTestConfig from './test.prod.json';
import Github from './github';

dotenv.config();

const env = process.env.ENVIRONMENT;

let config = {
    baseUrl: `${process.env.DEV_CANVAS_API_URL}/api/v1`,
    token: process.env.DEV_CANVAS_TOKEN || '',
    ...devTestConfig
}

if(env === 'production') {
    config = {
        baseUrl: `${process.env.PROD_CANVAS_API_URL}/api/v1`,
        token: process.env.PROD_CANVAS_TOKEN || '',
        ...prodTestConfig
    }
}


const userId = '1';

const client = createClient({ baseUrl: config.baseUrl, token: config.token, userId });

const api = createCanvasApi(client);

const course = await getCourseByName(api, config.course.name);

if(!course) {
    throw new Error(`Course ${config.course.name} not found`);
}

const assignment = await getAssignmentByName(api, course.id, config.assignment.name);

if(!assignment) {
    throw new Error(`Assignment ${config.assignment.name} not found`);
}

// const dueDate = new Date("2025-04-10T22:59:00-04:00");
// await updateAssignmentDueDate(api, course.id, assignment.id, dueDate);

// publish module

// get module items

// publish module items


// github
const github = new Github({ apiKey: process.env.GITHUB_TOKEN });
const result = await github.addTeamToRepository('fullstackacademy', '2504-FTB-ET-WEB-PT', 'fullstackacademy', 'Unit1.Garden');
console.log(result);