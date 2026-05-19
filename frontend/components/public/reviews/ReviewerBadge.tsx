interface Props {
  name: string;
}

const ReviewerBadge = ({ name }: Props) => {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-muted py-1.5 pl-2 pr-3.5">
      <span className="flex size-[30px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initial}
      </span>
      <span className="text-[13px] text-muted-foreground flex gap-1">
        Отзыв от имени
        <span className="font-semibold text-foreground">{name}</span>
      </span>
    </div>
  );
};

export default ReviewerBadge;
