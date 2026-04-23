import pb from '@/lib/pocketbase/client'

export const getDiaries = () => pb.collection('diaries').getFullList({ sort: '-date' })

export const createDiary = (data: { user: string; type: string; content: string; date: string }) =>
  pb.collection('diaries').create(data)
