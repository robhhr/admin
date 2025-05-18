import {NavLink} from 'react-router'

const Link = ({children, to}: {children: React.ReactNode; to: string}) => {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        `bg-silver dark:bg-background-dark font-ms-sans-serif text-default/60 dark:text-color-dark/60 shadow-nav rounded-t-[3px] p-1.5 text-sm focus:ring-black focus:outline-1 focus:-outline-offset-4 focus:outline-dotted ${isActive && '!text-default dark:!text-color-dark font-bold focus:outline-none'}`
      }
    >
      {children}
    </NavLink>
  )
}

export const Nav = () => {
  return (
    <nav className="ml-[3px]">
      <ul className="relative flex md:-mb-0.5 md:flex-row">
        <li>
          <Link to="/admin/projects">projects</Link>
        </li>
        <li>
          <Link to="/admin/thoughts">thoughts</Link>
        </li>
      </ul>
    </nav>
  )
}
