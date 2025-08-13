import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('Inside JWT AuthGaurd canActivate');
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw new UnauthorizedException('Invalid or missing token');
        }
        return user;
    }
}
