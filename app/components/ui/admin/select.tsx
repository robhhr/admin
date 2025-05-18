import {cx} from 'class-variance-authority'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: {value: string; label: string}[]
  defaultValue?: string
}

export const Select: React.FC<SelectProps> = ({
  className,
  defaultValue,
  options,
  ...props
}) => {
  return (
    <select
      className={cx(
        'shadow-input dark:bg-background-dark dark:shadow-input-dark w-fit max-w-36 bg-white p-1 text-xs',
        className,
      )}
      defaultValue={defaultValue}
      {...props}
    >
      {options.map(({value, label}) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}
