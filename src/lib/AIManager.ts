import { Controller } from '@sabaki/gtp';

export type LeelaConfiguration = {
    exec: string,
    weights: string,
    playouts: number,
};

export default class AIManager {

    static readonly instance;

    static maxInstances: number;
    static configs: Map<string, LeelaConfiguration>;
    static onlineUsers = 0;
    private static readonly controllers = new Set<Controller>();

    static createController(engine: string = 'leela') {
        if (AIManager.controllers.size >= AIManager.maxInstances) return null;
        if (!AIManager.configs.has(engine)) return null;

        let leelaConfigs = AIManager.configs.get('leela');
        let leelaArgs = ['--gtp', '--noponder', '--playouts', `${leelaConfigs ? leelaConfigs.playouts || 1000 : 1000}`,];

        let leelazeroConfigs = AIManager.configs.get('leelazero');
        let leelazeroArgs = ['--gtp', '--noponder', '--playouts', `${leelazeroConfigs ? leelazeroConfigs.playouts || 2000 : 2000}`, '-w', leelaConfigs.weights];
        
        let argsMap = new Map([['leela', leelaArgs], ['leelazero', leelazeroArgs]]);

        let ai = new Controller(AIManager.configs.get(engine).exec, argsMap.get(engine) || []);
        AIManager.controllers.add(ai);

        return ai;
    }

    static async releaseController(controller: Controller) {
        await controller.stop();
        AIManager.controllers.delete(controller);
    }

}