import ModuleTree from "./ModuleTree";

type Schedule = {
    date: string;
    block: string;
}[]

interface ScheduleConfig {
    daysUntilDue: number;
}

export default class ModuleSchedule {
    constructor(private schedule: Schedule, private config: ScheduleConfig) {}


    calculateDueDate(moduleName: string) {
        const block = this.schedule.find(b => b.block === moduleName);
        if(!block) {
            throw new Error(`${moduleName} not found`);
        }
        const date = new Date(block.date);
        date.setDate(date.getDate() + this.config.daysUntilDue);
        date.setHours(23, 59, 0, 0);

        return date;
    }
}