import { MouseEventHandler } from 'react'

export type SecondaryButtonTypes = {
  text: string
  iconUrl?: string
  classNames?: string
  onClick: MouseEventHandler<HTMLButtonElement>
}
