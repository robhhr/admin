import {memo, useRef} from 'react'
import {Button} from './button'
import {toggleTheme} from '~/utils/toggle-theme'

export const ToggleThemeComponent = () => {
  const contraintsRef = useRef(null)
  return (
    <div className="text-color flex dark:text-color-dark mr-2" ref={contraintsRef}>
      <Button className="!p-0.5" onClick={() => toggleTheme()}>
        <svg
          className="h-4 w-4 rotate-180"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="currentColor"
          data-darkreader-inline-color=""
        >
          <path
            d="M21 2L20 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M3 2L4 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M21 16L20 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M3 16L4 15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M9 18H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M10 21H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
          <path
            d="M11.9998 3C7.9997 3 5.95186 4.95029 5.99985 8C6.02324 9.48689 6.4997 10.5 7.49985 11.5C8.5 12.5 9 13 8.99985 15H14.9998C15 13.0001 15.5 12.5 16.4997 11.5001L16.4998 11.5C17.4997 10.5 17.9765 9.48689 17.9998 8C18.0478 4.95029 16 3 11.9998 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-darkreader-inline-stroke=""
          ></path>
        </svg>
      </Button>
    </div>
  )
}

ToggleThemeComponent.displayName = 'ToggleTheme'

export const ToggleTheme = memo(ToggleThemeComponent)
