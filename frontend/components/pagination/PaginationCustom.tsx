import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const getPaginationRange = (currentPage: number, totalPages: number) => {
  if (totalPages <= 1) return [1];

  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: Array<number | '...'> = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  let l: number | undefined;
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
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
        <PaginationItem className="border border-gray-200 rounded-lg me-2">
          <PaginationLink
            href="#"
            onClick={(e) => handlePageClick(e, page - 1)}
            className={cn(
              'transition-colors rounded-lg',
              page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>
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
                className={cn(
                  'cursor-pointer transition-colors rounded-lg',
                  page === p
                    ? 'bg-[#1E2B6D] text-white border-[#1E2B6D] hover:bg-[#162356] hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem className="border border-gray-200 rounded-lg ms-2">
          <PaginationLink
            href="#"
            onClick={(e) => handlePageClick(e, page + 1)}
            className={cn(
              'transition-colors rounded-lg',
              page >= totalPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}