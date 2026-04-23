import pb from '@/lib/pocketbase/client'

export const getActions = () => pb.collection('actions').getFullList({ sort: 'deadline' })

export const createAction = (data: {
  user: string
  title: string
  type: string
  status: string
  deadline: string
  original_date: string
}) => pb.collection('actions').create(data)

export const updateAction = (id: string, data: Partial<{ status: string; deadline: string }>) =>
  pb.collection('actions').update(id, data)

export const deleteAction = (id: string) => pb.collection('actions').delete(id)
