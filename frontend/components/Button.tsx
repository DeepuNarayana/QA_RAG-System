import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function Button({ children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 ${rest.className ?? ''}`}
    >
      {children}
    </button>
  )
}
