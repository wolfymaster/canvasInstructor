import { CanvasApi, ModuleItem, ModuleTree } from "./types";

export async function getCourseByName(client: CanvasApi, name: string) {
    const courses = await client.courses.getAll();
    return courses.find((course) => course.name === name);
}

export async function getModuleByName(client: CanvasApi, courseId: string, name: string) {
    const modules = await client.modules.getAll(courseId);
    return modules.find((module) => module.name === name);
}

export async function getAssignmentByName(client: CanvasApi, courseId: string, name: string) {
    const assignments = await client.assignments.getAll(courseId);
    return assignments.find((assignment) => assignment.name === name);
}

export async function updateAssignmentDueDate(client: CanvasApi, courseId: string, assignmentId: string, dueDate: Date) {
    await client.assignments.update(+assignmentId, courseId, {
        due_at: dueDate,
    })
}
