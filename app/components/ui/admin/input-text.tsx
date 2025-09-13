import {cx} from 'class-variance-authority'

export interface InputTextProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const InputText: React.FC<InputTextProps> = ({className, ...props}) => {
  return (
    <input
      className={cx(
        'shadow-input dark:bg-background-dark dark:shadow-input-dark dark:text-primary w-fit max-w-36 bg-white p-1 text-xs',
        className,
      )}
      {...props}
    />
  )
}
