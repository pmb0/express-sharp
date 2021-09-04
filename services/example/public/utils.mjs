export function setValue(element, newValue) {
  if (!element) return

  switch (element.tagName) {
    case 'SELECT':
      element.selectedIndex = [...element.querySelectorAll('option')]
        .map((element) => element.value)
        .indexOf(newValue)

      break

    default:
      element.value = newValue
      break
  }
}
