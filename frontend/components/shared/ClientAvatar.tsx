interface Props {
  name: string;
}

const ClientAvatar = ({ name }: Props) => {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className="flex size-[30px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initial}
    </span>
  );
};

export default ClientAvatar;
