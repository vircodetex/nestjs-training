import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyService {
    getWorkDone() : string {
        return 'Work is done!';
    }
}
