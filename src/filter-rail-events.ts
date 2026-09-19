export const openFiltersEvent = "atlas:open-filters";

export function openFilterRail() {
  window.dispatchEvent(new CustomEvent(openFiltersEvent));
}
