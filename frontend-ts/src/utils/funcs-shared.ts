export const funcShared = <T extends HTMLElement | null>(element: string): T => {
  const res = document.getElementById(element);
  if (res instanceof HTMLElement) {
    return res as T;
  }
  const createdElement = document.createElement(element);
  return createdElement as T;
};
