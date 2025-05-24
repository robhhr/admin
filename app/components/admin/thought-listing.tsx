import {Thought} from './thought'
import type {ThoughtProps} from '~/models/thoughts.server'

interface Props {
  data: ThoughtProps[]
  title: string
}

export const ThoughtListing = ({title, data}: Props) => {
  return (
    <>
      <p className="mt-4 ml-1.5 font-bold">{title}</p>
      <div className="bg-content dark:bg-background-admin-dark mt-1.5 px-3 py-1.5">
        {data.map(project => {
          return <Thought data={project} key={project.id} />
        })}
      </div>
    </>
  )
}
