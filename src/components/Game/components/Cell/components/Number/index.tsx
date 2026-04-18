type Props = {
  value: number;
};

const Number = ({ value }: Props) => {
  return <>{value || ''}</>;
};

export default Number;
