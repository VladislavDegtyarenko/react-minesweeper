import classNames from 'classnames/bind';

export function createCx(styles: Record<string, string>) {
  return classNames.bind(styles);
}
