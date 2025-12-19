import { Hono } from "hono";
import { use } from "hono/jsx";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import db from "../db/index.js";
import { error } from "console";

const userRoutes = new Hono();

type User = {
    id: number
    username: string
    password: string
    firstname: string
    lastname: string
}

userRoutes.get('/', async (c) => {
    let sql = 'SELECT * FROM users'
    let stmt = db.prepare<[],User>(sql)
    let users : User[] = stmt.all()

    return c.json({ message: 'List of user', data: users})
})
userRoutes.get('/:id',(c) => {
    const { id } = c.req.param()
    let sql = 'SELECT * FROM users WHERE id = @id'
    let stmt = db.prepare<{id:string},User>(sql)
    let user = stmt.get({id:id})

    if (!user) {
        return c.json({ message: 'User not found' },404)
    }
    return c.json({ message: `User detail for ID: ${id}`, data : user})
})

const createUserSchema = z.object({
    name: z.string("กรุณากรอกชื่อ")
        .min(5,"ชื่อต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
    password: z.string("กรุณากรอกรหัสผ่าน"),
    firstname: z.string("กรุณากรอกชื่อจริง").optional(),
    lastname: z.string("กรุณากรอกนามสกุล").optional(),
});

userRoutes.post('/',
    zValidator('json', createUserSchema, (result,c) => {
        if (!result.success) {
            return c.json({
                message: 'Validation Failed',
                errors : result.error.issues},400)
        }
    })
    ,async (c) => {
        const body = await c.req.json<User>()
        let sql = `INSERT INTO users 
            (username, password, firstname, lastname)
            VALUES (@name, @password, @firstname, @lastname);
        `
        let stmt = db.prepare<Omit<User,"id">>(sql)
        let result = stmt.run(body)

        if (result.changes === 0) {
            return c.json({ message: 'Failed to create user'},500)
        }
        let lastRowid = result.lastInsertRowid as number
        
        let sql2 = 'SELECT * FROM users WHERE id = ?'
        let stmt2 = db.prepare<[number],User>(sql2)
        let newUser = stmt2.get(lastRowid)

        return c.json({ message: 'User created', data: newUser });
    })
        

export default userRoutes;