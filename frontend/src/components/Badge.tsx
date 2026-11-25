import { HTMLAttributes, forwardRef } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gray'
  size?: 'sm' | 'md'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'gray', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full font-medium'
    
    const variantClasses = {
      primary: 'bg-primary-100 text-primary-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }
    
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
    }

    return (
      <span
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'