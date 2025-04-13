import {AnimatePresence, motion} from 'framer-motion'
import {TitleBar} from './title-bar'
import {useEffect, useState} from 'react'

export const FeedbackDialog = ({
  actionData,
}: {
  actionData?: {error?: string; success?: string}
}) => {
  const [visible, setVisible] = useState(false)
  const message = actionData?.error || actionData?.success

  const transition = {
    duration: 0.5,
    ease: [0.19, 1, 0.22, 1],
    type: 'spring',
    bounce: 0.25,
  }

  useEffect(() => {
    if (message) {
      setVisible(true)

      setTimeout(() => {
        setVisible(false)
      }, 2000)
    }
  }, [actionData, message])

  console.log(message, 'message')

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{translateY: 100, opacity: 0}}
          animate={{translateY: 0, opacity: 1}}
          exit={{translateY: 100, opacity: 0}}
          transition={transition}
          // ensures unmount happens after exit animation
          onAnimationComplete={() => {
            if (!visible) {
              setVisible(false)
            }
          }}
          className="absolute bottom-10 right-10 z-50 flex flex-col items-center justify-center bg-silver p-[3px] shadow-window"
        >
          <TitleBar
            className="w-full"
            title={
              actionData?.error ? 'error' : actionData?.success ? 'success' : ''
            }
            error={Boolean(actionData?.error)}
          />

          {message && (
            <p className="m-1 text-xs">{message}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
