import { Link, useLocation } from 'react-router-dom';

interface Props<T> {
  page: number;
  totalPages: number;
  tabType?: string;
  activeTab?: T;
}

const Pagination = <T extends string>({
  page,
  totalPages,
  tabType,
  activeTab,
}: Props<T>) => {
  const { pathname } = useLocation();
  return (
    <div className="pagination">
      <Link
        className="pagination__page"
        style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }}
        onClick={page === 1 ? (e) => e.preventDefault() : undefined}
        to={
          tabType
            ? `${pathname}?${tabType}=${activeTab}&page=${
                page > 1 ? page - 1 : 1
              }`
            : `${pathname}?page=${page > 1 ? page - 1 : 1}`
        }
      >
        <p className="paragraph--center">Prev</p>
      </Link>
      <div className="page-total">
        <p className="paragraph--center">
          {page} of {totalPages}
        </p>
      </div>
      <Link
        style={{ cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
        onClick={page === totalPages ? (e) => e.preventDefault() : undefined}
        className="pagination__page"
        to={
          tabType
            ? `${pathname}?${tabType}=${activeTab}&page=${
                page < totalPages ? page + 1 : page
              }`
            : `${pathname}?page=${page < totalPages ? page + 1 : page}`
        }
      >
        <p className="paragraph--center">Next</p>
      </Link>
    </div>
  );
};

export default Pagination;
