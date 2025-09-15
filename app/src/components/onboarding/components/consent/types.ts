import { Dispatch, SetStateAction } from 'react'

export type ConsentTypes = {
  isChecked: boolean
  setIsChecked: Dispatch<SetStateAction<boolean>>
}
