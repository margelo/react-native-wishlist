
# Assets List

## User should be able

- view the list of all wallet's assets
- each asset should show what network it's on
- if there is no coin icon for this asset it should display first 4 letter of it's code
- the list should have the following structure
  - pined assets based
    - last pined should be on top
  - wallet assets sorted by balance in $
    - assets with no balance should display $0.00
  - hidden assets (visible only when in edit mode)

## Interactions

- Edit Interaction
  - click on edit should show
    - pin button
    - hide button
  - instead of "edit" we should "done" to apply changes
  - clicking on edit button adds checkbox next to each assets
  - click on the asset check/unchecks the box
  - pin/hide button should be disabled unless any asset is selected
- pinning assets
  - when item is pinned and unchecked it should display pin instead of checkbox
  - when pined item is selected it the button should show "unpin"
  - when selected both pined and upined button should show "pin"
- Item Interaction
  - click on item should navigate to asset's screen
  - click on item when edit is active should toggle checkbox
- Hiding assets
  - hidden assets should be shown at the end of the list
    - with hide icon instead of checkbox when unchecked
    - all the text content should have 0.7 opacity
  - when both hidden and visible selected button should show "hide"
  - show "unhide" button instead of "hide" when only hidden item is selected

## Item structure

- icon
  - types:
    - eth image
    - trust wallet url
    - fallback just text is no image url
  - fallback text should be visible until the real image is loaded
  - icon can have a network badge
    - if the network is not l1
    - types:
      - polygon
      - arbitrum
      - optimism
- coin name
- coin balance in $
- native balance + coin code
- today change in %
  - green if positive
  - gray if negative
