import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import userRoutes from './user/index.js'
import rolesRoutes from './Roles/index.js'
import productRoutes from './products/index.js'

//import database
import db from './db/index.js'

const app = new Hono()

app.route('/api/user',userRoutes)
app.route('/api/Roles',rolesRoutes)



serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
