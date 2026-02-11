import { useState, useMemo } from 'react';

/**
 * Hook to handle pagination of arrays
 *
 * @example
 * const { currentPage, pageSize, paginatedItems, totalPages, goToPage, nextPage, prevPage } = usePagination(employees, 25);
 *
 * return (
 *   <>
 *     {paginatedItems.map(item => <div>{item}</div>)}
 *     <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
 *     <span>Page {currentPage} of {totalPages}</span>
 *     <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
 *   </>
 * )
 */
export function usePagination<T>(items: T[], pageSize: number = 25) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(
        () => Math.ceil(items.length / pageSize),
        [items.length, pageSize]
    );

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, pageSize]);

    const goToPage = (page: number) => {
        const pageNum = Math.max(1, Math.min(page, totalPages || 1));
        setCurrentPage(pageNum);
    };

    const nextPage = () => {
        goToPage(currentPage + 1);
    };

    const prevPage = () => {
        goToPage(currentPage - 1);
    };

    return {
        currentPage,
        pageSize,
        totalPages,
        paginatedItems,
        goToPage,
        nextPage,
        prevPage,
        totalItems: items.length,
    };
}
