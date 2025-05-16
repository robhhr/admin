import {Link, useFetcher} from 'react-router'
import type {Project as ProjectProps} from '~/models/projects.server'

interface Props {
  data: ProjectProps
}

export const Project = ({data}: Props) => {
  let fetcher = useFetcher()
  return (
    <div className="flex flex-col justify-between border-b px-1 py-2 last-of-type:border-0">
      <p>{data.title}</p>

      <div className="flex justify-end mt-2.5">
        <Link
          className="text-edit hover:text-edit/65 transition-colors duration-100"
          to={`/admin/project/${data.id}`}
        >
          edit
        </Link>
        <span className="mx-1">•</span>

        <fetcher.Form method="post">
          <input type="hidden" name="projectId" value={data.id} />
          <input type="hidden" name="intent" value="archive" />
          <button
            className="text-delete hover:text-delete/65 cursor-pointer transition-colors duration-100"
            type="submit"
          >
            archive
          </button>
        </fetcher.Form>
      </div>
    </div>
  )
}
