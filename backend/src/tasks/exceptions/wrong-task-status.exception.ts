export class WrongTaskStatusException extends Error {
    constructor() {
        super('Invalid task status transition');
        this.name = 'WrongTaskStatusException';
    }
}
