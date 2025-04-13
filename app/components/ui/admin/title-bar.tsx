import {cva, cx, type VariantProps} from 'class-variance-authority'

const bar = cva(
  'bar py-[3px] pl-[3px] pr-0.5 font-ms-sans-serif text-xs font-bold text-white',
  {
    variants: {
      intent: {
        admin: ['bg-title-bar'],
      },
      error: {
        false: null,
        true: 'bg-title-bar-error',
      },
    },
    compoundVariants: [
      {
        intent: 'admin',
        error: true,
      },
    ],
    defaultVariants: {
      intent: 'admin',
    },
  },
)

export interface TitleBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bar> {
  error?: boolean
}

export const TitleBar: React.FC<TitleBarProps> = ({
  className,
  intent,
  error,
  title,
}) => {
  return <div className={cx(bar({intent, error}), className)}>{title}</div>
}

