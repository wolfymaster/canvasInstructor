import { createClient, createCanvasApi } from '../lib/canvas';
import devTestConfig from './test.json';
import prodTestConfig from './test.prod.json';

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

export default createCanvasApi(createClient(config));
