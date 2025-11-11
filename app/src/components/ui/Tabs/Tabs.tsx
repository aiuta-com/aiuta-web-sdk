import React from 'react'
import { combineClassNames } from '@/utils'
import type { TabsProps } from './types'
import styles from './Tabs.module.scss'

export const Tabs = ({ tabs, activeTabId, onTabChange, className }: TabsProps) => {
  return (
    <div className={combineClassNames(styles.tabs, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={combineClassNames(
            'aiuta-button-m',
            styles.tab,
            activeTabId === tab.id ? styles.tab_active : '',
          )}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
