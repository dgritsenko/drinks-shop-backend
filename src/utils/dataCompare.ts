import * as bcrypt from 'bcrypt';

export default async function dataCompare(plainData:string, hashedData:string): Promise<boolean> {
    return await bcrypt.compare(plainData, hashedData)
}