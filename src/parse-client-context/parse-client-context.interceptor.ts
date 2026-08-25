import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UAParser } from 'ua-parser-js';

export interface ClientContext {
    ip:string;
    clientType:'web' | 'mobile' | 'pc' | 'unknown';
    clientDeviceModel:string
    clientOS:string
    clientApp: string
}

@Injectable()
export class ParseClientContextInterceptor implements NestInterceptor {
        intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const clientType = req.headers['client-type']

        if (clientType){
            let verifiedClientType: 'web' | 'mobile' | 'pc' | 'unknown'
            if(clientType == 'web' || clientType == 'mobile' || clientType== 'pc'){
                verifiedClientType = clientType
            }else{
              verifiedClientType = 'unknown'
            }

            const clientContext:ClientContext = {
                ip: req.ip ||'',

                clientType: verifiedClientType,
                clientDeviceModel:req.headers['client-device-model']||'',
                clientOS:req.headers['client-os']||'',
                clientApp: req.headers['client-app']||'',

            }

            req.body = {...req.body, ...clientContext}

        }else{
            const userAgent = UAParser(req.headers['user-agent'])
            
            const verifiedClientType = userAgent.device.type || 'web' 

            const clientContext:ClientContext = {
                ip: req.ip,
                
                clientType:'web',
                clientDeviceModel:userAgent.device.model || '',
                clientOS:`${userAgent.os.name||''}`+`${userAgent.os.version||''}`,
                clientApp:userAgent.browser.name||'',
            }

            req.body = {...req.body, ...clientContext}

        }

        return next.handle();
    }
}
