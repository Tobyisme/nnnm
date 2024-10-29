import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfbycjpnkuosphclozns.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mYnljanBua3Vvc3BoY2xvem5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMjI5MzUsImV4cCI6MjA0NTc5ODkzNX0.ebifam3I2RlpJp9rvO1wIVrNiThJ08sXvcqUNYKCBDs'

export const supabase = createClient(supabaseUrl, supabaseKey) 