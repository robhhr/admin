import Table from 'cli-table3'
import {createClient} from 'redis'

const table = new Table({head: ['Key', 'Value']})

;(async () => {
  const client = createClient({url: 'redis://localhost:6379'})
  await client.connect()

  const keys = await client.keys('*')
  for (const key of keys) {
    const value = await client.get(key)
    table.push([key, value])
  }

  console.log(table.toString())
  await client.quit()
})()
