import dotenv from 'dotenv';
import { createCanvasApi, createClient } from './api'
import { getAssignmentByName, getCourseByName, getModuleByName, groupModuleItemsAsBlocks, updateAssignmentDueDate } from './util';
import ModuleTree from './services/module/ModuleTree';
import schedule from './schedule.json';
import ModuleSchedule from './services/module/ModuleSchedule';

dotenv.config();

const env = process.env.ENVIRONMENT;

let config = {
    baseUrl: `${process.env.PROD_CANVAS_API_URL}/api/v1`,
    token: process.env.PROD_CANVAS_TOKEN || '',
    course: {
        "name": "2504-FTB-ET-WEB-PT"
    },
}

const userId = '1';
const client = createClient({ baseUrl: config.baseUrl, token: config.token, userId });

const api = createCanvasApi(client);

// get the course
const course = (await getCourseByName(api, config.course.name))!;

// get the module
const module = (await getModuleByName(api, course.id, 'Unit 1: Frontend Foundations'))!;


// assignment groups
// const groups = await api.assignments.groups(course.id);

// console.log(groups);


const moduleItems = await api.modules.items(course.id, module.id);

const tree = new ModuleTree(moduleItems)


const moduleSchedule = new ModuleSchedule(schedule, { daysUntilDue: 7 });

for(let i = 0; i < tree.blocks.length; ++i) {
    const current = tree.blocks[i];
    const dueDate = moduleSchedule.calculateDueDate(current.title);

    console.log(`${current.title} is due: ${dueDate}`);
}