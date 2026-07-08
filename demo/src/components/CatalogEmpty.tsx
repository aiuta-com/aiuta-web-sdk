import React from 'react'
import { setOutfitsFilterEnabled, setTryOnFilterEnabled } from '../utils/settings'

/** Centered empty-state for the catalog / outfits tabs. When the gear-menu
 *  filter is what hides every existing item (the caller KNOWS the unfiltered
 *  list isn't empty), say so and offer one click out: both filters switch
 *  off in place (no reload); the setters stamp `?filter=0` into the address,
 *  so the URL stays shareable in the unfiltered state. */
export default function CatalogEmpty({
  filtersHideEverything,
  children,
}: {
  filtersHideEverything: boolean
  children: React.ReactNode
}) {
  const disableFilters = () => {
    // In place, not via navigation: the tab hash makes a same-URL assignment
    // a fragment jump (no reload), and a reload isn't needed anyway. Each
    // setter re-stamps ?filter with the combined state (ends at 0).
    setTryOnFilterEnabled(false)
    setOutfitsFilterEnabled(false)
  }

  return (
    <div className="catalog-empty">
      <h3 className="catalog-empty__title">{children}</h3>
      {filtersHideEverything ? (
        <>
          <p className="catalog-empty__note">The gear-menu filter is hiding everything</p>
          <button type="button" className="btn btn--white" onClick={disableFilters}>
            Disable filters
          </button>
        </>
      ) : null}
    </div>
  )
}
