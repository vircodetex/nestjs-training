import { Injectable } from '@nestjs/common';
import { MessageFormatterService } from '../message-formatter/message-formatter.service';

@Injectable()
export class LoggerService {
    constructor(private readonly formatterService: MessageFormatterService) { }

    log(message: string): string {
        const formattedMsg = this.formatterService.format(message);
        console.log(formattedMsg);
        return formattedMsg;
    }
}
