import { Module, ModuleItem } from "../../lib/canvas/types";

interface ModuleNode {
    item: ModuleItem
    children: ModuleItem[]
}

export default class ModuleTree {
    private tree: ModuleNode[] = [];

    constructor(moduleItems: ModuleItem[]) {
        // order items by position
        moduleItems.sort((a, b) => a.position > b.position ? 1 : -1 );
    
        // iterate through and create a new ModuleTree at every indent = 0.
        const trees: ModuleNode[] = [];
        let currentTree: ModuleNode | null = null;
        for(let i = 0; i < moduleItems.length; ++i) {
            const currentItem = moduleItems[i];
    
            if(currentItem.indent === 0) {
                let tmpTree = {
                    item: currentItem,
                    children: []
                }
                trees.push(tmpTree);
                currentTree = tmpTree
                continue;
            }
            currentTree?.children.push(currentItem);
        }
    
        this.tree = trees;
    }

    get parents() {
        return this.tree.map(t => t.item);
    }

    get blocks() {
        return this.parents.filter(t => t.title.startsWith('Block'))
    }

    json() {
        return this.tree;
    }
}