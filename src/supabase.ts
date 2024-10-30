import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 配置缺失')
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 添加連接測試
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase 連接錯誤:', error)
  } else {
    console.log('Supabase 連接成功')
  }
})