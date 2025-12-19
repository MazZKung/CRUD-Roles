import { Hono } from "hono";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";

const productRoutes = new Hono();

const createProductsSchema = z.object({
    ID : z.number("กรุณาใส่รหัสสินค้า").int("ต้องเป็นจำนวนเต็ม").refine((val) => val >= 10000 && val <= 99999, "ID ต้องเป็นตัวเลข 5 หลัก"),
    ProdeuctName: z.string("กรุณากรอกชื่อสินค้า").min(5,"ชื่อสินค้าต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
    Price : z.string().regex(/^\d+(\.\d{2})?$/,"รูปแบบราคาสินค้าไม่ถูกต้อง").transform((val) => parseFloat(val)),
    Cost : z.string().regex(/^\d+(\.\d{2})?$/,"รูปแบบต้นทุนอยู่ในรูปแบบทศนิยม 2 ตำแหน่ง").transform((val) => parseFloat(val)),
    Note : z.string().optional()
})

productRoutes.get('/',(c) => {
    return c.json({ message: 'List of products' });
})
//pd get id
productRoutes.get('/:id',(c) => {
    const { id } = c.req.param();
    return c.json({ message: `Product detail for ID: ${id}` });
})

//pd post create
productRoutes.post('/',
    zValidator('json', createProductsSchema), async (c) => {
    const body = await c.req.json();
    return c.json({ message: 'Product created', data: body });
})

export default productRoutes;