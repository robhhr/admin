import {Link} from 'react-router'
import {type VariantProps, cva, cx} from 'class-variance-authority'

const button = cva('button w-fit', {
  variants: {
    intent: {
      admin: [
        'bg-silver text-shadow-button text-xs min-h-[1.4375rem] px-3 shadow-button-admin cursor-pointer',
        'focus:outline-1 focus:outline-dotted focus:ring-black focus:-outline-offset-4',
        'active:shadow-button-admin-pressed',
      ],
    },
    disabled: {
      false: null,
      true: 'pointer-events-none',
    },
  },
  compoundVariants: [
    {
      intent: 'admin',
      disabled: true,
      className: 'text-shadow-button-disabled text-[grey]',
    },
  ],
  defaultVariants: {
    intent: 'admin',
  },
})

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof button> {
  to?: string
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  to,
  intent,
  disabled,
  ...props
}) => {
  const baseClasses = button({intent, disabled})
  const linkClasses = cx(baseClasses, 'py-1', className)
  const buttonClasses = cx(baseClasses, className)

  if (to) {
    return (
      <Link
        to={to}
        className={linkClasses}
        aria-disabled={disabled ? true : undefined}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={props.type || 'button'}
      className={buttonClasses}
      disabled={disabled || undefined}
      {...props}
    >
      {children}
    </button>
  )
}
