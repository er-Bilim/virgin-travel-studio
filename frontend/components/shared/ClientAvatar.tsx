interface Props {
  name: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}

const ClientAvatar = ({ name, size = "sm" }: Props) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  const sizes: {[key: string]: string} = {
    "sm": "30px",
    "base": "35px",
    "lg": "40px",
    "xl": "45px"
  }

  return (
    <span className={`flex size-10 items-center justify-center rounded-full bg-primary text-[${sizes[size]}] font-semibold text-primary-foreground`}>
      {initial}
    </span>
  );
};

export default ClientAvatar;
