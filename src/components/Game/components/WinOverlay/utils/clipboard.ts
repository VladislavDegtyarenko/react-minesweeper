const COPY_TEXTAREA_POSITION = '-9999px';

const isValidUrl = (value: string) => {
  return value.length > 0;
};

const fallbackCopyToClipboard = (value: string) => {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.left = COPY_TEXTAREA_POSITION;
  textarea.style.top = COPY_TEXTAREA_POSITION;
  textarea.setAttribute('readonly', 'true');

  document.body.appendChild(textarea);
  textarea.select();

  let didCopy = false;

  try {
    didCopy = document.execCommand('copy');
  } catch {
    didCopy = false;
  }

  document.body.removeChild(textarea);

  return didCopy;
};

export const copyLinkToClipboard = async (url: string) => {
  if (!isValidUrl(url)) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);

      return true;
    } catch {
      return fallbackCopyToClipboard(url);
    }
  }

  return fallbackCopyToClipboard(url);
};
