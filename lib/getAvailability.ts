import { supabase } from '@/lib/supabase'

export async function getAvailability(coachId: number) {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('coach_id', coachId)

  if (error) {
    console.error(error)
    return []
  }

  return data
}