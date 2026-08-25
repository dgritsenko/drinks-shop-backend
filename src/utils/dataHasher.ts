import * as bcrypt from 'bcrypt';

export default async function dataHasher(data:string, saltRounds:number):Promise<string>{
    return await bcrypt.hash(data, saltRounds)
}