import { ITrackedItemListRepo } from '../../domain/ports/set-list-repo';
import { MainOrchestrator } from '../main-orchestrator';

export class DemoUseCase {
    constructor(
        private orchestrator: MainOrchestrator,
        private setListRepo: ITrackedItemListRepo
    ) {}

    async simulate() {
        const li = await this.setListRepo.getRandom();

        if (li === null) {
            return;
        }

        if (isTrue()) {
            li.decrementProgress(Math.floor(Math.random() * 50));
        } else {
            li.incrementProgress(Math.floor(Math.random() * 50));
        }

        console.log(li.getDTO());
    }
}

function isTrue(treshold: number = 0.5) {
    return Math.random() > treshold;
}
