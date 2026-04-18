type Props = {
  value: number | null;
};

const Number = ({ value }: Props) => {
  return <>{value || ''}</>;
};

export default Number;
