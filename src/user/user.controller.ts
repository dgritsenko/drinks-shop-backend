import { Body, Controller, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Delete('/delete')
    deleteUser(@Body() userData:{uuid:string}){
        const uuid = userData.uuid
        return this.userService.deleteUser(uuid)
    }
}