import { render, screen } from '@testing-library/react';
import ReviewerBadge from '../ReviewerBadge';

describe('ReviewerBadge', () => {
  it('рендерит бейдж с именем', () => {
    render(<ReviewerBadge name="Людмила Андреева" />);
    expect(screen.getByText('Отзыв от имени')).toBeInTheDocument();
    expect(screen.getByText('Людмила Андреева')).toBeInTheDocument();
  });

  it('рендерит аватар с первой буквой имени', () => {
    render(<ReviewerBadge name="Павел" />);
    expect(screen.getByText('П')).toBeInTheDocument();
  });

  it('ничего не рендерит при name = null', () => {
    const { container } = render(<ReviewerBadge name={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('ничего не рендерит при пустой строке', () => {
    const { container } = render(<ReviewerBadge name="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
