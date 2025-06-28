import { supabase } from './supabase'

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
  
  if (error) console.error(error)
  return data
}

export async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
  
  if (error) console.error(error)
  return data
}
