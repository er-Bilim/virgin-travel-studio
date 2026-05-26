interface Props {
  name: string | null;
}

const ClientAvatar = ({ name }: Props) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <span className="flex size-[30px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
      {initial}
    </span>
  );
};

export default ClientAvatar;
