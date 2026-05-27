import ClientAvatar from "@/components/shared/ClientAvatar";

interface Props {
  name: string | null;
}

const ReviewerBadge = ({ name }: Props) => {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-muted py-1.5 pl-2 pr-3.5">
      <ClientAvatar name={name}/>
      <span className="text-[13px] text-muted-foreground flex gap-1">
        Отзыв от имени
        <span className="font-semibold text-foreground">{name}</span>
      </span>
    </div>
  );
};

export default ReviewerBadge;
