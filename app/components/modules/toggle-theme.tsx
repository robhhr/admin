import {memo, useRef} from 'react'
import {motion} from 'motion/react'
import {toggleTheme} from '~/utils/toggle-theme'

export const ToggleThemeComponent = () => {
  const contraintsRef = useRef(null)
  return (
    <div
      className="text-color dark:text-color-dark absolute top-4 right-4 z-10 h-24 w-24 overflow-hidden"
      ref={contraintsRef}
    >
      <motion.button
        className="h-8 w-8"
        drag="y"
        dragConstraints={{top: 0, bottom: 50}}
        dragElastic={0.2}
        onClick={() => toggleTheme()}
      >
        <motion.svg
          className="rotate-180"
          width="30px"
          height="30px"
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
        </motion.svg>
      </motion.button>
    </div>
  )
}

ToggleThemeComponent.displayName = 'ToggleTheme'

export const ToggleTheme = memo(ToggleThemeComponent)
