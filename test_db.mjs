import { createClient } from '@insforge/sdk'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_INSFORGE_URL
const supabaseKey = process.env.VITE_INSFORGE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('No URL or Key found')
  process.exit(1)
}

const supabase = createClient({ baseUrl: supabaseUrl, anonKey: supabaseKey })

async function test() {
  const { data, error } = await supabase.database.from('usuarios').select('*').limit(1)
  if (error) {
    console.error('Error querying usuarios:', error)
  } else {
    console.log('usuarios table exists. data:', data)
  }
}

test()
