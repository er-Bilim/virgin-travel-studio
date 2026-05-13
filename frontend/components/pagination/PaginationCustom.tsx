import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';


const getPaginationRange = (currentPage: number, totalPages: number) => {
  const delta = 2; // Сколько страниц показывать до и после текущей
  const range: number[] = [];
  const rangeWithDots: Array<number | '...'> = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i); // (1, 10, 2, 3), (1, 10, 3, 4, 5, 6, 7 ),
    }
  }

  let l: number | undefined;
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1); // (1, ..., )
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

interface Props {
  page: number;
  limit: number;
  totalPage: number;
  onChange: (page: number) => void;
}

export function PaginationCustom({ page, totalPage, onChange }: Props) {
  const paginationRange = getPaginationRange(page, totalPage);

  const handlePageClick = (e: React.MouseEvent, targetPage: number) => {
    e.preventDefault();
    if (targetPage >= 1 && targetPage <= totalPage) {
      onChange(targetPage);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePageClick(e, page - 1)}
            className={
              page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {paginationRange.map((p, index) => (
          <PaginationItem key={index}>
            {p === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => handlePageClick(e, p)}
                isActive={page === p}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => handlePageClick(e, page + 1)}
            className={
              page >= totalPage
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}