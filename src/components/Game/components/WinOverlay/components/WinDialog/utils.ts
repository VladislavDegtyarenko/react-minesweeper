export const isClerkComponentNode = (
  target: EventTarget | null,
): target is HTMLElement =>
  target instanceof HTMLElement &&
  Boolean(target.closest('[data-clerk-component]'));
